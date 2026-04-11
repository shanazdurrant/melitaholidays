const ADMIN_PASSWORD = 'Jhene2019';
const SESSION_KEY = 'mh_admin_auth';
const BASE_URL = 'https://melitaholidays.com/scratchcard.html';

// ── PRESET MESSAGES ──
const PRESETS = [
  { label: 'Big reveal', text: "Your dream destination has been booked — get ready for the holiday of a lifetime!" },
  { label: 'Gift reveal', text: "Someone very special has booked you the most incredible holiday. We hope you love where you are going!" },
  { label: 'Romantic', text: "Get ready for the most romantic trip of your life. Your perfect getaway is booked and you deserve every moment!" },
  { label: 'Family', text: "The family adventure you have been waiting for is officially booked! Get packing, we are all going!" },
  { label: 'Celebration', text: "Time to celebrate — your holiday is booked and you deserve every single moment of it!" },
  { label: 'Write my own', text: '' },
];

let activePreset = -1;

function renderPresets(){
  const grid = document.getElementById('presetGrid');
  grid.innerHTML = PRESETS.map((p,i) => `<button class="preset-btn" id="preset-${i}" onclick="selectPreset(${i})">${p.label}</button>`).join('');
}

function selectPreset(i){
  activePreset = i;
  document.querySelectorAll('.preset-btn').forEach((b,j) => b.classList.toggle('active', j===i));
  const ta = document.getElementById('personalMsg');
  if(PRESETS[i].text){
    ta.value = PRESETS[i].text;
    ta.readOnly = true;
    ta.style.background = '#f0fafa';
  } else {
    ta.value = '';
    ta.readOnly = false;
    ta.style.background = '';
    ta.focus();
  }
  liveUpdate();
}

function onMsgInput(){
  // If user types, deselect preset
  activePreset = -1;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  liveUpdate();
}

function updateToggle(){
  const on = document.getElementById('confettiToggle').checked;
  document.getElementById('toggleTrack').style.background = on ? 'var(--teal)' : '#ddd';
  document.getElementById('toggleThumb').style.left = on ? '23px' : '3px';
}

// ── ENCODING ──
// Encodes all data into a single opaque token — no readable params in URL
function stripEmoji(str){
  return str.replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FEFF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FFFF}]|[\u00A9\u00AE\u203C\u2049\u20E3\u2122\u2139\u2194-\u2199\u21A9-\u21AA\u231A-\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA-\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614-\u2615\u2618\u261D\u2620\u2622-\u2623\u2626\u262A\u262E-\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F-\u2660\u2663\u2665-\u2666\u2668\u267B\u267E-\u267F\u2692-\u2697\u2699\u269B-\u269C\u26A0-\u26A1\u26AA-\u26AB\u26B0-\u26B1\u26BD-\u26BE\u26C4-\u26C5\u26CE-\u26CF\u26D1\u26D3-\u26D4\u26E9-\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733-\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763-\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934-\u2935\u2B05-\u2B07\u2B1B-\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]/gu,'').replace(/\s+/g,' ').trim();
}

function encodeData(name, dest, msg, date){
  const obj = {n: name, d: dest, m: stripEmoji(msg), t: stripEmoji(date)};
  const json = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function buildUrl(){
  const name = document.getElementById('clientName').value.trim();
  const dest = getDest();
  const msg  = document.getElementById('personalMsg').value.trim();
  const date = document.getElementById('travelDate').value.trim();
  if(!dest) return null;
  const token = encodeData(name, dest, msg, date);
  const confetti = document.getElementById('confettiToggle').checked ? '' : '&c=0';
  return BASE_URL + '?s=' + token + confetti;
}

function getDest(){
  const v = document.getElementById('destSelect').value;
  if(v === 'custom') return document.getElementById('customDestInput').value.trim().toUpperCase();
  return v;
}

function handleDest(){
  document.getElementById('customDestInput').style.display =
    document.getElementById('destSelect').value === 'custom' ? 'block' : 'none';
  liveUpdate();
}

function liveUpdate(){
  const url = buildUrl();
  const box = document.getElementById('urlPreview');
  const note = document.getElementById('encodedNote');
  if(url){
    box.textContent = url;
    box.classList.add('active');
    note.classList.add('show');
  } else {
    box.textContent = 'Fill in a destination to generate a link...';
    box.classList.remove('active');
    note.classList.remove('show');
  }
}

// ── ACTIONS ──
function copyLink(){
  const url = buildUrl();
  if(!url){alert('Please select a destination first.');return;}
  navigator.clipboard.writeText(url).then(()=>{
    saveCard('Link Copied');
    const f = document.getElementById('copyFlash');
    f.classList.add('show');
    setTimeout(()=>f.classList.remove('show'), 2500);
  });
}

function previewCard(){
  const url = buildUrl();
  if(!url){alert('Please select a destination first.');return;}
  window.open(url, '_blank');
}

function sendWA(){
  const url = buildUrl();
  const name = document.getElementById('clientName').value.trim();
  if(!url){alert('Please select a destination first.');return;}
  const msg = `Hi${name?' '+name:''}! You have a very special holiday surprise from Melita Holidays. Click to reveal your destination: ${url}`;
  window.open('https://wa.me/?text='+encodeURIComponent(msg), '_blank');
  saveCard('WhatsApp');
  resetForm();
}

function saveAndCompose(){} // removed

function openMailApp(){} // removed

function resetForm(){
  document.getElementById('clientName').value = '';
  document.getElementById('destSelect').value = '';
  document.getElementById('customDestInput').value = '';
  document.getElementById('customDestInput').style.display = 'none';
  document.getElementById('travelDate').value = '';
  document.getElementById('personalMsg').value = '';
  document.getElementById('personalMsg').readOnly = false;
  document.getElementById('personalMsg').style.background = '';
  activePreset = -1;
  document.querySelectorAll('.preset-btn').forEach(b=>b.classList.remove('active'));
  liveUpdate();
}

// ── SAVE ──
function saveCard(method, recipient){
  const url  = buildUrl();
  const dest = getDest();
  const name = document.getElementById('clientName').value.trim();
  const date = document.getElementById('travelDate').value.trim();
  if(!url) return;
  const entry = {
    id: Date.now(),
    name: name||'Unknown',
    dest,
    date,
    url,
    method: method || 'Link Copied',
    recipient: recipient || '',
    created: new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),
    timestamp: new Date().toISOString()
  };
  const saved = getSaved();
  saved.unshift(entry);
  localStorage.setItem('mh_scratchcards', JSON.stringify(saved));
  renderSaved();
  renderArchive();
}

function getSaved(){try{return JSON.parse(localStorage.getItem('mh_scratchcards'))||[];}catch{return [];}}

function renderSaved(){
  const list  = document.getElementById('savedList');
  const saved = getSaved().slice(0,5);
  if(!saved.length){
    list.innerHTML='<div class="empty-saved"><i class="fas fa-gift"></i>No scratchcards yet.</div>';
    return;
  }
  list.innerHTML = saved.map(s=>`
    <div class="saved-item">
      <div class="saved-info">
        <div class="saved-name">${s.name}</div>
        <div class="saved-dest">✈️ ${s.dest} &nbsp;<span style="font-size:10px;background:${methodColor(s.method)};color:#fff;padding:2px 7px;border-radius:10px;font-weight:700;">${s.method||'Copied'}</span></div>
        <div class="saved-date-label">Created ${s.created}${s.date?' · '+s.date:''}</div>
      </div>
      <div class="saved-actions">
        <button class="saved-btn copy" onclick="navigator.clipboard.writeText('${s.url}')" title="Copy link"><i class="fas fa-copy"></i></button>
        <button class="saved-btn" style="background:#25D366;color:#fff;" onclick="loadSaved(${s.id})" title="Resend via WhatsApp"><i class="fab fa-whatsapp"></i></button>
        <button class="saved-btn del" onclick="deleteSaved(${s.id})" title="Delete"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function methodColor(m){
  if(m==='WhatsApp') return '#25D366';
  if(m==='Email') return 'var(--gold)';
  return 'var(--teal)';
}

function renderArchive(){
  const list = document.getElementById('archiveList');
  if(!list) return;
  const saved = getSaved();
  const total = saved.length;
  const byMethod = saved.reduce((acc,s)=>{acc[s.method||'Copied']=(acc[s.method||'Copied']||0)+1;return acc;},{});

  document.getElementById('archiveTotal').textContent = total;
  document.getElementById('archiveWA').textContent = byMethod['WhatsApp']||0;
  document.getElementById('archiveEmail').textContent = byMethod['Email']||0;
  document.getElementById('archiveCopied').textContent = byMethod['Link Copied']||0;

  if(!saved.length){
    list.innerHTML='<div class="empty-saved"><i class="fas fa-archive"></i>No scratchcards in archive yet.</div>';
    return;
  }
  list.innerHTML = saved.map(s=>`
    <div class="saved-item">
      <div class="saved-info">
        <div class="saved-name">${s.name}${s.recipient?' <span style="font-size:11px;color:#aaa;">· '+s.recipient+'</span>':''}</div>
        <div class="saved-dest">✈️ ${s.dest} &nbsp;<span style="font-size:10px;background:${methodColor(s.method)};color:#fff;padding:2px 7px;border-radius:10px;font-weight:700;">${s.method||'Copied'}</span></div>
        <div class="saved-date-label">Sent ${s.created}${s.date?' · Travel: '+s.date:''}</div>
      </div>
      <div class="saved-actions">
        <button class="saved-btn copy" onclick="navigator.clipboard.writeText('${s.url}')" title="Copy link again"><i class="fas fa-copy"></i></button>
        <button class="saved-btn del" onclick="deleteSaved(${s.id})" title="Delete from archive"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function loadSaved(id){
  const s = getSaved().find(x=>x.id===id);
  if(!s) return;
  // Resend via WhatsApp
  window.open('https://wa.me/?text='+encodeURIComponent(`You have a very special holiday surprise from Melita Holidays. Click to reveal your destination: ${s.url}`), '_blank');
}

function deleteSaved(id){
  if(!confirm('Remove this card from archive?')) return;
  localStorage.setItem('mh_scratchcards', JSON.stringify(getSaved().filter(s=>s.id!==id)));
  renderSaved();
  renderArchive();
  document.getElementById('archiveBadge').textContent = getSaved().length;
}

// ── AUTH ──
function checkLogin(){
  if(document.getElementById('pwInput').value === ADMIN_PASSWORD){
    sessionStorage.setItem(SESSION_KEY,'1');
    showAdmin();
  } else {
    document.getElementById('loginError').classList.add('show');
    document.getElementById('pwInput').value='';
  }
}

function logout(){
  sessionStorage.removeItem(SESSION_KEY);
  resetForm();
  document.getElementById('adminScreen').style.display='none';
  document.getElementById('loginScreen').style.display='block';
  document.getElementById('pwInput').value='';
}

function togglePw(){
  const inp=document.getElementById('pwInput');
  const ico=document.getElementById('pwIcon');
  inp.type=inp.type==='password'?'text':'password';
  ico.className=inp.type==='password'?'fas fa-eye':'fas fa-eye-slash';
}

function switchTab(tab){
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  event.target.classList.add('active');
  if(tab==='archive') renderArchive();
}

function showAdmin(){
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('adminScreen').style.display='block';
  renderPresets();
  renderSaved();
  renderArchive();
  // Update archive badge
  document.getElementById('archiveBadge').textContent = getSaved().length;
}

window.addEventListener('DOMContentLoaded',()=>{
  if(sessionStorage.getItem(SESSION_KEY)==='1') showAdmin();
});

