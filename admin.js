
(function(){
var PW=atob('SmhlbmUyMDE5');
var SK='mh_admin_auth';
var SC_BASE='https:/'+'/melitaholidays.com/scratchcard.html';
var Q_BASE='https:/'+'/melitaholidays.com/quote.html';
var PRESETS=[
  {label:'Big reveal',text:'Your dream destination has been booked - get ready for the holiday of a lifetime!'},
  {label:'Gift reveal',text:'Someone very special has booked you the most incredible holiday. We hope you love where you are going!'},
  {label:'Romantic',text:'Get ready for the most romantic trip of your life. Your perfect getaway is booked and you deserve every moment!'},
  {label:'Family',text:'The family adventure you have been waiting for is officially booked! Get packing, we are all going!'},
  {label:'Celebration',text:'Time to celebrate - your holiday is booked and you deserve every single moment of it!'},
  {label:'Write my own',text:''}
];
var activePreset=-1;
var selectedInclusions=[];
function $(id){return document.getElementById(id);}

// AUTH
function checkLogin(){if($('pwInput').value===PW){sessionStorage.setItem(SK,'1');showAdmin();}else{$('loginError').classList.add('show');$('pwInput').value='';}}
function logout(){sessionStorage.removeItem(SK);$('adminScreen').style.display='none';$('loginScreen').style.display='block';$('pwInput').value='';}
function togglePw(){var i=$('pwInput'),c=$('pwIcon');i.type=i.type==='password'?'text':'password';c.className=i.type==='password'?'fas fa-eye':'fas fa-eye-slash';}
function showAdmin(){$('loginScreen').style.display='none';$('adminScreen').style.display='block';renderPresets();renderSaved();renderArchive();renderQuoteArchive();$('archiveBadge').textContent=getSaved().length;}

// MAIN TABS
function switchMainTab(tab){document.querySelectorAll('.main-tab').forEach(function(b){b.classList.remove('active');});document.querySelectorAll('.main-section').forEach(function(s){s.classList.remove('active');});$('mainTab'+tab).classList.add('active');$('section'+tab).classList.add('active');}

// INNER TABS
function switchInnerTab(tab){document.querySelectorAll('.inner-tab-pane').forEach(function(p){p.classList.remove('active');});$('tabRecentBtn').classList.toggle('active',tab==='recent');$('tabArchiveBtn').classList.toggle('active',tab==='archive');$('tab-'+tab).classList.add('active');if(tab==='archive')renderArchive();}

// SCRATCHCARD
function stripEmoji(s){return(s||'').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27FF}\u{FE00}-\u{FEFF}]/gu,'').replace(/\s+/g,' ').trim();}
function handleDest(){var v=$('destSelect').value;$('customDestInput').style.display=v==='custom'?'block':'none';liveUpdate();}
function getDest(){var v=$('destSelect').value;return v==='custom'?$('customDestInput').value.trim().toUpperCase():v;}
function buildUrl(){
  var name=stripEmoji($('clientName').value.trim()),dest=getDest(),msg=stripEmoji($('personalMsg').value.trim()),date=stripEmoji($('travelDate').value.trim()),confetti=$('confettiToggle').checked;
  if(!dest)return null;
  var b64=btoa(unescape(encodeURIComponent(JSON.stringify({n:name,d:dest,m:msg,t:date})))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  return SC_BASE+'?s='+b64+(confetti?'':'&c=0');
}
function liveUpdate(){var url=buildUrl(),box=$('urlPreview'),note=$('encodedNote');if(url){box.textContent=url;box.classList.add('active');note.classList.add('show');}else{box.textContent='Fill in a destination to generate a link...';box.classList.remove('active');note.classList.remove('show');}}
function renderPresets(){var grid=$('presetGrid');grid.innerHTML='';PRESETS.forEach(function(p,i){var btn=document.createElement('button');btn.className='preset-btn';btn.textContent=p.label;btn.addEventListener('click',function(){selectPreset(i);});grid.appendChild(btn);});}
function selectPreset(i){activePreset=i;document.querySelectorAll('.preset-btn').forEach(function(b,j){b.classList.toggle('active',j===i);});var ta=$('personalMsg');if(PRESETS[i].text){ta.value=PRESETS[i].text;ta.readOnly=true;ta.style.background='#f0fafa';}else{ta.value='';ta.readOnly=false;ta.style.background='';ta.focus();}liveUpdate();}
function toggleConfetti(){var cb=$('confettiToggle');cb.checked=!cb.checked;$('toggleTrack').style.background=cb.checked?'var(--teal)':'#ddd';$('toggleThumb').style.left=cb.checked?'23px':'3px';liveUpdate();}
function copyLink(){var url=buildUrl();if(!url){alert('Please select a destination first.');return;}navigator.clipboard.writeText(url).then(function(){saveCard('Link Copied');showFlash('copyFlash');});}
function previewCard(){var url=buildUrl();if(!url){alert('Please select a destination first.');return;}window.open(url,'_blank');}
function sendWA(){var url=buildUrl(),name=$('clientName').value.trim();if(!url){alert('Please select a destination first.');return;}window.open('https://wa.me/?text='+encodeURIComponent('Hi'+(name?' '+name:'')+'! You have a very special holiday surprise from Melita Holidays. Click to reveal your destination: '+url),'_blank');saveCard('WhatsApp');resetScratchForm();}
function resetScratchForm(){['clientName','customDestInput','travelDate','personalMsg'].forEach(function(id){$(id).value='';});$('destSelect').value='';$('customDestInput').style.display='none';$('personalMsg').readOnly=false;$('personalMsg').style.background='';activePreset=-1;document.querySelectorAll('.preset-btn').forEach(function(b){b.classList.remove('active');});liveUpdate();}

// SCRATCHCARD ARCHIVE
function saveCard(method){var url=buildUrl(),dest=getDest(),name=$('clientName').value.trim(),date=$('travelDate').value.trim();if(!url)return;var saved=getSaved();saved.unshift({id:Date.now(),name:name||'Unknown',dest:dest,date:date,url:url,method:method||'Link Copied',created:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})});localStorage.setItem('mh_scratchcards',JSON.stringify(saved));renderSaved();renderArchive();$('archiveBadge').textContent=getSaved().length;}
function getSaved(){try{return JSON.parse(localStorage.getItem('mh_scratchcards'))||[];}catch(e){return[];}}
function methodColor(m){return m==='WhatsApp'?'#25D366':'var(--teal)';}
function renderSaved(){var list=$('savedList'),saved=getSaved().slice(0,5);if(!saved.length){list.innerHTML='<div class="empty-saved"><i class="fas fa-gift"></i>No scratchcards yet.</div>';return;}list.innerHTML=saved.map(function(s){return '<div class="saved-item"><div class="saved-info"><div class="saved-name">'+s.name+'</div><div class="saved-dest">'+s.dest+' <span style="font-size:10px;background:'+methodColor(s.method)+';color:#fff;padding:2px 7px;border-radius:10px;font-weight:700;">'+s.method+'</span></div><div class="saved-date-label">'+s.created+(s.date?' · '+s.date:'')+'</div></div><div class="saved-actions"><button class="saved-btn copy" onclick="navigator.clipboard.writeText(\''+s.url+'\')" title="Copy"><i class="fas fa-copy"></i></button><button class="saved-btn del" onclick="deleteSaved('+s.id+')" title="Delete"><i class="fas fa-trash"></i></button></div></div>';}).join('');}
function renderArchive(){var list=$('archiveList'),saved=getSaved();var byM=saved.reduce(function(a,s){a[s.method]=(a[s.method]||0)+1;return a;},{});$('archiveTotal').textContent=saved.length;$('archiveWA').textContent=byM['WhatsApp']||0;$('archiveCopied').textContent=byM['Link Copied']||0;if(!saved.length){list.innerHTML='<div class="empty-saved"><i class="fas fa-archive"></i>No scratchcards yet.</div>';return;}list.innerHTML=saved.map(function(s){return '<div class="saved-item"><div class="saved-info"><div class="saved-name">'+s.name+'</div><div class="saved-dest">'+s.dest+' <span style="font-size:10px;background:'+methodColor(s.method)+';color:#fff;padding:2px 7px;border-radius:10px;font-weight:700;">'+s.method+'</span></div><div class="saved-date-label">Sent '+s.created+(s.date?' · '+s.date:'')+'</div></div><div class="saved-actions"><button class="saved-btn copy" onclick="navigator.clipboard.writeText(\''+s.url+'\')" title="Copy"><i class="fas fa-copy"></i></button><button class="saved-btn del" onclick="deleteSaved('+s.id+')" title="Delete"><i class="fas fa-trash"></i></button></div></div>';}).join('');}
window.deleteSaved=function(id){if(!confirm('Remove from archive?'))return;localStorage.setItem('mh_scratchcards',JSON.stringify(getSaved().filter(function(s){return s.id!==id;})));renderSaved();renderArchive();$('archiveBadge').textContent=getSaved().length;};

// IMAGE UPLOAD

// DROPDOWN HANDLERS
window.handleDestSelect=function(){
  var v=$('qDestSelect').value;
  var txt=$('qDestination');
  if(v==='other'){txt.style.display='block';txt.value='';txt.focus();}
  else{txt.style.display='none';txt.value=v;}
  liveUpdateQuote();
};
window.handleAirportSelect=function(){
  var v=$('qAirportSelect').value;
  var txt=$('qAirport');
  if(v==='other'){txt.style.display='block';txt.value='';txt.focus();}
  else{txt.style.display='none';txt.value=v;}
  liveUpdateQuote();
};

// PAYMENT SCHEDULE
var paymentRows=[];
function renderPaymentRows(){
  var div=$('paymentSchedule');
  div.innerHTML=paymentRows.map(function(r,i){
    return '<div style="display:grid;grid-template-columns:1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:center;">'
      +'<input type="number" placeholder="Amount £" value="'+r.amt+'" oninput="updatePayment('+i+',\'amt\',this.value)" style="padding:9px;border:2px solid var(--border);border-radius:8px;font-family:Poppins,sans-serif;font-size:13px;">'
      +'<input type="date" value="'+r.date+'" oninput="updatePayment('+i+',\'date\',this.value)" style="padding:9px;border:2px solid var(--border);border-radius:8px;font-family:Poppins,sans-serif;font-size:13px;">'
      +'<button onclick="removePayment('+i+')" style="padding:9px 12px;border:none;border-radius:8px;background:#fee2e2;color:#dc2626;cursor:pointer;font-size:12px;"><i class="fas fa-trash"></i></button>'
      +'</div>';
  }).join('');
  liveUpdateQuote();
}
window.updatePayment=function(i,field,val){paymentRows[i][field]=val;liveUpdateQuote();};
window.removePayment=function(i){paymentRows.splice(i,1);renderPaymentRows();};

// FORMAT DATE for display
function fmtDate(val){
  if(!val) return '';
  var d=new Date(val);
  if(isNaN(d.getTime())) return val;
  return d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
}

// QUOTE TYPE
function getQuoteType(){
  var radios=document.querySelectorAll('input[name="quoteType"]');
  for(var i=0;i<radios.length;i++){if(radios[i].checked)return radios[i].value;}
  return 'both';
}
function initQuoteType(){
  document.querySelectorAll('input[name="quoteType"]').forEach(function(radio){
    radio.addEventListener('change',function(){
      // Update label styling
      document.querySelectorAll('input[name="quoteType"]').forEach(function(r){
        var lbl=r.parentElement;
        if(r.checked){lbl.style.borderColor='var(--teal)';lbl.style.background='#f0fafa';lbl.style.color='var(--teal)';}
        else{lbl.style.borderColor='var(--border)';lbl.style.background='#fafafa';lbl.style.color='#888';}
      });
      // Show/hide sections
      var type=radio.value;
      var hotelFields=document.getElementById('hotelFieldsSection');
      var flightFields=document.getElementById('flightFieldsSection');
      if(hotelFields) hotelFields.style.display=(type==='flight')?'none':'block';
      if(flightFields) flightFields.style.display=(type==='hotel')?'none':'block';
      liveUpdateQuote();
    });
  });
}

// QUOTE BUILDER
function buildQuoteUrl(){
  var raw={
    qt:getQuoteType(),
    n:$('qClientName').value.trim(),
    dest:$('qDestination').value.trim()||$('qDestSelect').value,
    hotel:$('qHotel').value.trim(),
    stars:$('qStars').value,
    board:$('qBoard').value,
    room:$('qRoom').value.trim(),
    hu:$('qHotelUrl').value.trim(),
    hd:$('qHotelDesc').value.trim(),
    fac:$('qFacilities').value.trim(),
    fo:$('qFlightOut').value.trim(),
    al:$('qAirline').value.trim(),
    dt:$('qDepTime').value,
    at:$('qArrTime').value,
    fr:$('qFlightRet').value.trim(),
    ft:$('qFlightType').value,
    rdt:$('qRetDepTime').value,
    rat:$('qRetArrTime').value,
    dep:fmtDate($('qDeparture').value),
    ret:fmtDate($('qReturn').value),
    pax:$('qPassengers').value.trim(),
    dur:$('qDuration').value.trim(),
    air:$('qAirport').value.trim()||$('qAirportSelect').value,
    pr:$('qPrice').value.trim(),
    dp:$('qDeposit').value.trim(),
    ddate:fmtDate($('qDepositDate').value),
    fdate:fmtDate($('qFinalDate').value),
    sched:paymentRows.filter(function(r){return r.amt&&r.date;}).map(function(r){return {a:r.amt,d:fmtDate(r.date)};});
    inc:selectedInclusions.length?selectedInclusions:undefined,
    note:$('qNote').value.trim(),
    id:Date.now()
  };
  var data={};
  Object.keys(raw).forEach(function(k){
    var v=raw[k];
    if(v===undefined||v===null||v==='') return;
    if(Array.isArray(v)&&v.length===0) return;
    data[k]=v;
  });
  if(!data.dest&&!data.hotel)return null;
  var b64=btoa(unescape(encodeURIComponent(JSON.stringify(data)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  return Q_BASE+'?q='+b64;
}
function liveUpdateQuote(){var url=buildQuoteUrl(),box=$('qUrlPreview');if(url){box.textContent=url;box.classList.add('active');}else{box.textContent='Fill in the details above to generate a quote link...';box.classList.remove('active');}}
function qCopyLink(){var url=buildQuoteUrl();if(!url){alert('Please fill in at least a destination or hotel.');return;}navigator.clipboard.writeText(url).then(function(){saveQuote();showFlash('qCopyFlash');});}
function qPreview(){var url=buildQuoteUrl();if(!url){alert('Please fill in at least a destination or hotel.');return;}window.open(url,'_blank');}
function qSendWA(){var url=buildQuoteUrl(),name=$('qClientName').value.trim();if(!url){alert('Please fill in at least a destination or hotel.');return;}window.open('https://wa.me/?text='+encodeURIComponent('Hi'+(name?' '+name:'')+'! Here is your personalised holiday quote from Melita Holidays. Take a look and let me know what you think: '+url),'_blank');saveQuote();showFlash('qCopyFlash');}
function saveQuote(){var url=buildQuoteUrl();if(!url)return;var quotes=getQuotes();quotes.unshift({id:Date.now(),name:$('qClientName').value.trim()||'Unknown',dest:$('qDestination').value.trim(),hotel:$('qHotel').value.trim(),price:$('qPrice').value.trim(),url:url,status:'Pending',created:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})});localStorage.setItem('mh_quotes',JSON.stringify(quotes));renderQuoteArchive();}
function getQuotes(){try{return JSON.parse(localStorage.getItem('mh_quotes'))||[];}catch(e){return[];}}
function renderQuoteArchive(){var list=$('quoteArchiveList'),quotes=getQuotes();var approved=quotes.filter(function(q){return q.status==='Approved';}).length;$('qTotal').textContent=quotes.length;$('qApproved').textContent=approved;if(!quotes.length){list.innerHTML='<div class="empty-saved"><i class="fas fa-file-invoice"></i>No quotes yet.</div>';return;}list.innerHTML=quotes.map(function(q){var badge=q.status==='Approved'?'<span class="quote-badge badge-approved">Approved</span>':'<span class="quote-badge badge-pending">Pending</span>';return '<div class="quote-saved-item"><div class="saved-info"><div class="saved-name">'+q.name+badge+'</div><div class="saved-dest">'+(q.dest||q.hotel)+(q.price?' · £'+q.price:'')+'</div><div class="saved-date-label">Sent '+q.created+'</div></div><div class="saved-actions"><button class="saved-btn copy" onclick="navigator.clipboard.writeText(\''+q.url+'\')" title="Copy quote link"><i class="fas fa-copy"></i></button><button class="saved-btn del" onclick="deleteQuote('+q.id+')" title="Delete"><i class="fas fa-trash"></i></button></div></div>';}).join('');}
window.deleteQuote=function(id){if(!confirm('Remove this quote?'))return;localStorage.setItem('mh_quotes',JSON.stringify(getQuotes().filter(function(q){return q.id!==id;})));renderQuoteArchive();};

function showFlash(id){var f=$(id);f.classList.add('show');setTimeout(function(){f.classList.remove('show');},2500);}

// INCLUSIONS
function initInclusions(){document.querySelectorAll('.inclusion-item').forEach(function(el){el.addEventListener('click',function(){var val=el.getAttribute('data-val');var idx=selectedInclusions.indexOf(val);if(idx>-1){selectedInclusions.splice(idx,1);el.classList.remove('active');}else{selectedInclusions.push(val);el.classList.add('active');}liveUpdateQuote();});});}

// EVENTS
window.addEventListener('DOMContentLoaded',function(){
  $('loginBtn').addEventListener('click',checkLogin);
  $('pwInput').addEventListener('keydown',function(e){if(e.key==='Enter')checkLogin();});
  $('pwToggleBtn').addEventListener('click',togglePw);
  $('logoutBtn').addEventListener('click',logout);
  $('destSelect').addEventListener('change',handleDest);
  $('clientName').addEventListener('input',liveUpdate);
  $('travelDate').addEventListener('input',liveUpdate);
  $('personalMsg').addEventListener('input',function(){activePreset=-1;document.querySelectorAll('.preset-btn').forEach(function(b){b.classList.remove('active');});liveUpdate();});
  $('copyBtn').addEventListener('click',copyLink);
  $('previewBtn').addEventListener('click',previewCard);
  $('waBtn').addEventListener('click',sendWA);
  $('toggleTrack').addEventListener('click',toggleConfetti);
  $('toggleThumb').addEventListener('click',toggleConfetti);
  $('tabRecentBtn').addEventListener('click',function(){switchInnerTab('recent');});
  $('tabArchiveBtn').addEventListener('click',function(){switchInnerTab('archive');});
  $('mainTabScratch').addEventListener('click',function(){switchMainTab('Scratch');});
  $('mainTabQuote').addEventListener('click',function(){switchMainTab('Quote');});
  ['qClientName','qDestination','qHotel','qRoom','qHotelUrl','qHotelDesc','qFacilities','qFlightOut','qAirline','qDepTime','qArrTime','qFlightRet','qRetDepTime','qRetArrTime','qDeparture','qReturn','qPassengers','qDuration','qAirport','qPrice','qDeposit','qNote'].forEach(function(id){$(id).addEventListener('input',liveUpdateQuote);});
  $('qBoard').addEventListener('change',liveUpdateQuote);
  $('qStars').addEventListener('change',liveUpdateQuote);
  $('qFlightType').addEventListener('change',liveUpdateQuote);
  $('qDestSelect').addEventListener('change',handleDestSelect);
  $('qAirportSelect').addEventListener('change',handleAirportSelect);
  $('addPaymentBtn').addEventListener('click',function(){
    paymentRows.push({amt:'',date:''});
    renderPaymentRows();
  });
  $('qDepositDate').addEventListener('change',liveUpdateQuote);
  $('qFinalDate').addEventListener('change',liveUpdateQuote);
  $('qDeparture').addEventListener('change',function(){
    // Auto-fill duration if return date set
    var dep=$('qDeparture').value,ret=$('qReturn').value;
    if(dep&&ret){var nights=Math.round((new Date(ret)-new Date(dep))/(86400000));if(nights>0)$('qDuration').value=nights+' night'+(nights>1?'s':'');}
    liveUpdateQuote();
  });
  $('qReturn').addEventListener('change',function(){
    var dep=$('qDeparture').value,ret=$('qReturn').value;
    if(dep&&ret){var nights=Math.round((new Date(ret)-new Date(dep))/(86400000));if(nights>0)$('qDuration').value=nights+' night'+(nights>1?'s':'');}
    liveUpdateQuote();
  });
  $('qCopyBtn').addEventListener('click',qCopyLink);
  $('qPreviewBtn').addEventListener('click',qPreview);
  $('qWaBtn').addEventListener('click',qSendWA);
  initInclusions();
  initQuoteType();
  if(sessionStorage.getItem(SK)==='1')showAdmin();
});
})();