(function(){
'use strict';

var PW = atob('SmhlbmUyMDE5');
var SK = 'mh_admin_auth';
var SC_BASE = 'https:/'+'/melitaholidays.com/scratchcard.html';
var Q_BASE  = 'https:/'+'/melitaholidays.com/quote.html';

function $(id){ return document.getElementById(id); }
function val(id){ var el=$(id); return el ? el.value.trim() : ''; }
function fmtDate(v){
  if(!v) return '';
  var d=new Date(v);
  if(isNaN(d.getTime())) return v;
  return d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
}
function flash(id){ var f=$(id); f.classList.add('show'); setTimeout(function(){ f.classList.remove('show'); },2500); }

// AUTH
function checkLogin(){
  if($('pwInput').value===PW){ sessionStorage.setItem(SK,'1'); showAdmin(); }
  else { $('loginError').classList.add('show'); $('pwInput').value=''; }
}
function logout(){ sessionStorage.removeItem(SK); location.reload(); }
function togglePw(){
  var i=$('pwInput'),ic=$('pwIcon');
  i.type=i.type==='password'?'text':'password';
  ic.className=i.type==='password'?'fas fa-eye':'fas fa-eye-slash';
}
function showAdmin(){
  $('loginScreen').style.display='none';
  $('adminScreen').style.display='block';
  renderPresets(); renderSaved(); renderArchive(); renderQuoteArchive();
  $('archiveBadge').textContent=getSaved().length;
}

// TABS
function switchMain(tab){
  document.querySelectorAll('.main-tab').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('.main-section').forEach(function(s){s.classList.remove('active');});
  $('mainTab'+tab).classList.add('active');
  $('section'+tab).classList.add('active');
}
function switchInner(tab){
  document.querySelectorAll('.itab').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('.ipane').forEach(function(p){p.classList.remove('active');});
  $('itab'+tab).classList.add('active');
  $('ipane'+tab).classList.add('active');
  if(tab==='Archive') renderArchive();
}

// SCRATCHCARD
var PRESETS=[
  {label:'Big reveal',text:'Your dream destination has been booked - get ready for the holiday of a lifetime!'},
  {label:'Gift reveal',text:'Someone very special has booked you the most incredible holiday. We hope you love where you are going!'},
  {label:'Romantic',text:'Get ready for the most romantic trip of your life. Your perfect getaway is booked and you deserve every moment!'},
  {label:'Family',text:'The family adventure you have been waiting for is officially booked! Get packing, we are all going!'},
  {label:'Celebration',text:'Time to celebrate - your holiday is booked and you deserve every single moment of it!'},
  {label:'Write my own',text:''}
];
var activePreset=-1;
function stripEmoji(s){ return (s||'').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27FF}]/gu,'').replace(/\s+/g,' ').trim(); }
function getDest(){ var v=$('destSelect').value; return v==='custom'?$('customDestInput').value.trim().toUpperCase():v; }
function buildScUrl(){
  var dest=getDest(); if(!dest) return null;
  var p={n:stripEmoji(val('clientName')),d:dest,m:stripEmoji(val('personalMsg')),t:stripEmoji(val('travelDate'))};
  var b64=btoa(unescape(encodeURIComponent(JSON.stringify(p)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  return SC_BASE+'?s='+b64+($('confettiToggle').checked?'':'&c=0');
}
function scUpdate(){
  var url=buildScUrl(),box=$('scUrlBox'),note=$('encNote');
  if(url){box.textContent=url;box.classList.add('active');note.classList.add('show');}
  else{box.textContent='Fill in a destination to generate a link...';box.classList.remove('active');note.classList.remove('show');}
}
function renderPresets(){
  var g=$('presetGrid');g.innerHTML='';
  PRESETS.forEach(function(p,i){
    var b=document.createElement('button');b.className='preset-btn';b.textContent=p.label;
    b.addEventListener('click',function(){selectPreset(i);});g.appendChild(b);
  });
}
function selectPreset(i){
  activePreset=i;
  document.querySelectorAll('.preset-btn').forEach(function(b,j){b.classList.toggle('active',j===i);});
  var ta=$('personalMsg');
  if(PRESETS[i].text){ta.value=PRESETS[i].text;ta.readOnly=true;ta.style.background='#f0fafa';}
  else{ta.value='';ta.readOnly=false;ta.style.background='';ta.focus();}
  scUpdate();
}
function toggleConfetti(){
  var cb=$('confettiToggle');cb.checked=!cb.checked;
  $('toggleTrack').style.background=cb.checked?'var(--teal)':'#ddd';
  $('toggleThumb').style.left=cb.checked?'23px':'3px';
  scUpdate();
}
function scCopy(){
  var url=buildScUrl();if(!url){alert('Please select a destination first.');return;}
  navigator.clipboard.writeText(url).then(function(){saveCard('Link Copied');flash('scCopyFlash');});
}
function scPreview(){var url=buildScUrl();if(!url){alert('Please select a destination first.');return;}window.open(url,'_blank');}
function scWA(){
  var url=buildScUrl(),name=val('clientName');
  if(!url){alert('Please select a destination first.');return;}
  window.open('https://wa.me/?text='+encodeURIComponent('Hi'+(name?' '+name:'')+'! You have a very special holiday surprise from Melita Holidays. Click to reveal: '+url),'_blank');
  saveCard('WhatsApp');
  ['clientName','customDestInput','travelDate','personalMsg'].forEach(function(id){$(id).value='';});
  $('destSelect').value='';$('customDestInput').style.display='none';
  $('personalMsg').readOnly=false;$('personalMsg').style.background='';
  activePreset=-1;document.querySelectorAll('.preset-btn').forEach(function(b){b.classList.remove('active');});
  scUpdate();
}
function saveCard(method){
  var url=buildScUrl();if(!url)return;
  var s=getSaved();
  s.unshift({id:Date.now(),name:val('clientName')||'Unknown',dest:getDest(),date:val('travelDate'),url:url,method:method,created:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})});
  localStorage.setItem('mh_sc',JSON.stringify(s));
  renderSaved();renderArchive();$('archiveBadge').textContent=getSaved().length;
}
function getSaved(){try{return JSON.parse(localStorage.getItem('mh_sc'))||[];}catch(e){return[];}}
function mCol(m){return m==='WhatsApp'?'#25D366':'var(--teal)';}
function siHtml(s){return '<div class="saved-item"><div class="saved-info"><div class="s-name">'+s.name+'</div><div class="s-dest">'+s.dest+' <span style="font-size:10px;background:'+mCol(s.method)+';color:#fff;padding:2px 7px;border-radius:10px;font-weight:700;">'+s.method+'</span></div><div class="s-date">'+s.created+(s.date?' · '+s.date:'')+'</div></div><div class="saved-actions"><button class="sbtn sbtn-copy" onclick="navigator.clipboard.writeText(\''+s.url+'\')"><i class="fas fa-copy"></i></button><button class="sbtn sbtn-del" onclick="delCard('+s.id+')"><i class="fas fa-trash"></i></button></div></div>';}
function renderSaved(){var s=getSaved().slice(0,5);$('savedList').innerHTML=s.length?s.map(siHtml).join(''):'<div class="empty"><i class="fas fa-gift"></i>No scratchcards yet.</div>';}
function renderArchive(){
  var s=getSaved(),bm=s.reduce(function(a,x){a[x.method]=(a[x.method]||0)+1;return a;},{});
  $('archTotal').textContent=s.length;$('archWA').textContent=bm['WhatsApp']||0;$('archCopy').textContent=bm['Link Copied']||0;
  $('archiveList').innerHTML=s.length?s.map(siHtml).join(''):'<div class="empty"><i class="fas fa-archive"></i>No scratchcards yet.</div>';
}
window.delCard=function(id){if(!confirm('Remove?'))return;localStorage.setItem('mh_sc',JSON.stringify(getSaved().filter(function(s){return s.id!==id;})));renderSaved();renderArchive();$('archiveBadge').textContent=getSaved().length;};

// QUOTE BUILDER
var selectedInc=[];
var payments=[];
var quoteType='both';

function getQDest(){var v=$('qDestDrop').value;return v==='other'?val('qDestText'):(v||val('qDestText'));}
function getQAirport(){var v=$('qAirportDrop').value;return v==='other'?val('qAirportText'):(v||val('qAirportText'));}

function buildQuoteUrl(){
  var dest=getQDest(),hotel=val('qHotel');
  if(!dest&&!hotel) return null;
  var sched=payments.filter(function(p){return p.amt&&p.date;}).map(function(p){return {a:p.amt,d:fmtDate(p.date)};});
  var raw={
    qt:quoteType,n:val('qName'),dest:dest,hotel:hotel,
    stars:val('qStars'),board:val('qBoard'),room:val('qRoom'),
    hu:val('qHotelUrl'),hd:val('qHotelDesc'),fac:val('qFacilities'),
    fo:val('qFlightOut'),al:val('qAirline'),dt:val('qDepTime'),at:val('qArrTime'),
    fr:val('qFlightRet'),ft:val('qFlightType'),rdt:val('qRetDep'),rat:val('qRetArr'),
    dep:fmtDate(val('qDepDate')),ret:fmtDate(val('qRetDate')),
    dur:val('qDuration'),pax:val('qPax'),air:getQAirport(),
    pr:val('qPrice'),dp:val('qDeposit'),
    ddate:fmtDate(val('qDepositDate')),fdate:fmtDate(val('qFinalDate')),
    sched:sched.length?sched:undefined,
    inc:selectedInc.length?selectedInc:undefined,
    note:val('qNote'),id:Date.now()
  };
  var data={};
  Object.keys(raw).forEach(function(k){
    var v=raw[k];
    if(v===undefined||v===null||v==='') return;
    if(Array.isArray(v)&&v.length===0) return;
    data[k]=v;
  });
  var b64=btoa(unescape(encodeURIComponent(JSON.stringify(data)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  return Q_BASE+'?q='+b64;
}

function qUpdate(){
  var url=buildQuoteUrl(),box=$('qUrlBox');
  if(url){box.textContent=url;box.classList.add('active');}
  else{box.textContent='Fill in the details above to generate a quote link...';box.classList.remove('active');}
}
function qCopy(){var url=buildQuoteUrl();if(!url){alert('Fill in at least a destination or hotel.');return;}navigator.clipboard.writeText(url).then(function(){saveQuote();flash('qCopyFlash');});}
function qPreview(){var url=buildQuoteUrl();if(!url){alert('Fill in at least a destination or hotel.');return;}window.open(url,'_blank');}
function qWA(){
  var url=buildQuoteUrl(),name=val('qName');
  if(!url){alert('Fill in at least a destination or hotel.');return;}
  window.open('https://wa.me/?text='+encodeURIComponent('Hi'+(name?' '+name:'')+'! Here is your personalised holiday quote from Melita Holidays: '+url),'_blank');
  saveQuote();
}

function setQuoteType(qt){
  quoteType=qt;
  document.querySelectorAll('.qt-option').forEach(function(el){el.classList.toggle('active',el.getAttribute('data-qt')===qt);});
  $('qHotelSection').style.display=qt==='flight'?'none':'block';
  $('qFlightSection').style.display=qt==='hotel'?'none':'block';
  qUpdate();
}
function onDestDrop(){var v=$('qDestDrop').value;$('qDestText').style.display=v==='other'?'block':'none';if(v!=='other')$('qDestText').value='';qUpdate();}
function onAirportDrop(){var v=$('qAirportDrop').value;$('qAirportText').style.display=v==='other'?'block':'none';if(v!=='other')$('qAirportText').value='';qUpdate();}
function calcDuration(){
  var dep=val('qDepDate'),ret=val('qRetDate');
  if(dep&&ret){var n=Math.round((new Date(ret)-new Date(dep))/86400000);if(n>0)$('qDuration').value=n+' night'+(n>1?'s':'');}
  qUpdate();
}
function renderPayments(){
  var div=$('paymentRows');div.innerHTML='';
  payments.forEach(function(p,i){
    var row=document.createElement('div');row.className='pay-row';
    row.innerHTML='<input type="number" placeholder="Amount £" value="'+p.amt+'" oninput="updPay('+i+',\'amt\',this.value)">'
      +'<input type="date" value="'+p.date+'" oninput="updPay('+i+',\'date\',this.value)">'
      +'<button class="btn-del" onclick="delPay('+i+')"><i class="fas fa-trash"></i></button>';
    div.appendChild(row);
  });
  qUpdate();
}
window.updPay=function(i,f,v){payments[i][f]=v;qUpdate();};
window.delPay=function(i){payments.splice(i,1);renderPayments();};
function initInclusions(){
  document.querySelectorAll('.inc-item').forEach(function(el){
    el.addEventListener('click',function(){
      var v=el.getAttribute('data-inc'),idx=selectedInc.indexOf(v);
      if(idx>-1){selectedInc.splice(idx,1);el.classList.remove('active');}
      else{selectedInc.push(v);el.classList.add('active');}
      qUpdate();
    });
  });
}
function saveQuote(){
  var url=buildQuoteUrl();if(!url)return;
  var qs=getQuotes();
  qs.unshift({id:Date.now(),name:val('qName')||'Unknown',dest:getQDest(),hotel:val('qHotel'),price:val('qPrice'),url:url,status:'Pending',created:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})});
  localStorage.setItem('mh_quotes',JSON.stringify(qs));renderQuoteArchive();
}
function getQuotes(){try{return JSON.parse(localStorage.getItem('mh_quotes'))||[];}catch(e){return[];}}
function renderQuoteArchive(){
  var qs=getQuotes(),approved=qs.filter(function(q){return q.status==='Approved';}).length;
  $('qTotal').textContent=qs.length;$('qApproved').textContent=approved;
  $('quoteArchiveList').innerHTML=qs.length?qs.map(function(q){
    var badge=q.status==='Approved'?'<span class="qbadge qbadge-a">Approved</span>':'<span class="qbadge qbadge-p">Pending</span>';
    return '<div class="saved-item"><div class="saved-info"><div class="s-name">'+q.name+badge+'</div><div class="s-dest">'+(q.dest||q.hotel||'')+(q.price?' · £'+q.price:'')+'</div><div class="s-date">'+q.created+'</div></div><div class="saved-actions"><button class="sbtn sbtn-copy" onclick="navigator.clipboard.writeText(\''+q.url+'\')" title="Copy"><i class="fas fa-copy"></i></button><button class="sbtn sbtn-del" onclick="delQuote('+q.id+')" title="Delete"><i class="fas fa-trash"></i></button></div></div>';
  }).join(''):'<div class="empty"><i class="fas fa-file-invoice"></i>No quotes yet.</div>';
}
window.delQuote=function(id){if(!confirm('Remove?'))return;localStorage.setItem('mh_quotes',JSON.stringify(getQuotes().filter(function(q){return q.id!==id;})));renderQuoteArchive();};

// INIT
window.addEventListener('DOMContentLoaded',function(){
  $('loginBtn').addEventListener('click',checkLogin);
  $('pwInput').addEventListener('keydown',function(e){if(e.key==='Enter')checkLogin();});
  $('pwToggle').addEventListener('click',togglePw);
  $('logoutBtn').addEventListener('click',logout);
  $('mainTabScratch').addEventListener('click',function(){switchMain('Scratch');});
  $('mainTabQuote').addEventListener('click',function(){switchMain('Quote');});
  $('itabRecent').addEventListener('click',function(){switchInner('Recent');});
  $('itabArchive').addEventListener('click',function(){switchInner('Archive');});
  $('destSelect').addEventListener('change',function(){$('customDestInput').style.display=$('destSelect').value==='custom'?'block':'none';scUpdate();});
  $('clientName').addEventListener('input',scUpdate);
  $('travelDate').addEventListener('input',scUpdate);
  $('personalMsg').addEventListener('input',function(){activePreset=-1;document.querySelectorAll('.preset-btn').forEach(function(b){b.classList.remove('active');});scUpdate();});
  $('scCopyBtn').addEventListener('click',scCopy);
  $('scPreviewBtn').addEventListener('click',scPreview);
  $('scWaBtn').addEventListener('click',scWA);
  $('toggleTrack').addEventListener('click',toggleConfetti);
  $('toggleThumb').addEventListener('click',toggleConfetti);
  document.querySelectorAll('.qt-option').forEach(function(el){el.addEventListener('click',function(){setQuoteType(el.getAttribute('data-qt'));});});
  $('qDestDrop').addEventListener('change',onDestDrop);
  $('qDestText').addEventListener('input',qUpdate);
  $('qAirportDrop').addEventListener('change',onAirportDrop);
  $('qAirportText').addEventListener('input',qUpdate);
  $('qDepDate').addEventListener('change',calcDuration);
  $('qRetDate').addEventListener('change',calcDuration);
  ['qName','qHotel','qRoom','qHotelUrl','qHotelDesc','qFacilities','qFlightOut','qAirline','qDepTime','qArrTime','qFlightRet','qRetDep','qRetArr','qPax','qPrice','qDeposit','qNote'].forEach(function(id){$(id).addEventListener('input',qUpdate);});
  ['qStars','qBoard','qFlightType'].forEach(function(id){$(id).addEventListener('change',qUpdate);});
  $('qDepositDate').addEventListener('change',qUpdate);
  $('qFinalDate').addEventListener('change',qUpdate);
  $('addPayBtn').addEventListener('click',function(){payments.push({amt:'',date:''});renderPayments();});
  initInclusions();
  $('qCopyBtn').addEventListener('click',qCopy);
  $('qPreviewBtn').addEventListener('click',qPreview);
  $('qWaBtn').addEventListener('click',qWA);
  if(sessionStorage.getItem(SK)==='1') showAdmin();
});

})();
