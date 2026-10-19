const $=s=>document.querySelector(s);
const KEY='legions_v1',CATS=['Junior','Senior'];
let db=JSON.parse(localStorage.getItem(KEY)||'{"players":[],"rec":{}}');
let cat='Junior',view='att',editId=null,photoData='';
const cloudOn=()=>window.Cloud&&Cloud.on;
const save=()=>{if(!cloudOn())localStorage.setItem(KEY,JSON.stringify(db))};
const sync=()=>{if(cloudOn())Cloud.saveSession($('#date').value,cat,db.rec[rk()]||{})};
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
$('#date').value=today();
const rk=(d=$('#date').value,c=cat)=>d+'|'+c;
const fmt=d=>new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const logo='icons/logo.png';
const plist=c=>db.players.filter(p=>p.cat===c).sort((a,b)=>a.name.localeCompare(b.name));
const avatar=p=>p.photo?`<img class="ini" src="${p.photo}">`:`<div class="ini">${p.no?esc(p.no):esc(p.name[0]||'?').toUpperCase()}</div>`;

function tabsHtml(){return CATS.map(c=>{const ps=plist(c),r=db.rec[rk($('#date').value,c)]||{};
  const P=ps.filter(p=>r[p.id]==='P').length,A=ps.filter(p=>r[p.id]==='A').length;
  return`<button data-cat="${c}" class="${c===cat?'on':''}">${c==='Junior'?'⚽':'🛡️'} ${c.toUpperCase()}<small>${P}P · ${A}A · ${ps.length-P-A}?</small></button>`}).join('')}

function renderAtt(){
  const ps=plist(cat),r=db.rec[rk()]||{},q=$('#q').value.toLowerCase();
  const P=ps.filter(p=>r[p.id]==='P').length,A=ps.filter(p=>r[p.id]==='A').length,U=ps.length-P-A;
  $('#sum').innerHTML=`<div class="p"><b>${P}</b>PRESENT</div><div class="a"><b>${A}</b>ABSENT</div><div class="u"><b>${U}</b>UNMARKED</div><div><b>${ps.length}</b>TOTAL</div>`;
  $('#tabs').innerHTML=tabsHtml();
  $('#ccard').innerHTML=`<div class="ct"><img src="${logo}"><div><h2>${cat.toUpperCase()}</h2><p>${ps.length} players</p></div><div class="big">${P}<small>/${ps.length}</small><p style="font-size:12px;font-weight:400">Present today</p></div></div><div class="bar"><i style="width:${ps.length?P/ps.length*100:0}%"></i></div>`;
  const row=p=>{const v=r[p.id]||'';return`<div class="pl ${v}"><div class="l">${avatar(p)}<b>${esc(p.name)}${p.no?' · #'+esc(p.no):''}</b></div>
   <button class="pf" data-prof="${p.id}"><em>👤</em></button>
   <button class="y ${v==='P'?'on':''}" data-m="${p.id}" data-v="P"><em>✓</em>YES</button>
   <button class="n ${v==='A'?'on':''}" data-m="${p.id}" data-v="A"><em>✕</em>NO</button></div>`};
  const f=ps.filter(p=>p.name.toLowerCase().includes(q));
  const sec=(t,k)=>{const a=f.filter(p=>(r[p.id]||'')===k);return a.length?`<div class="sec">— ${t} · ${a.length}</div>`+a.map(row).join(''):''};
  $('#list').innerHTML=(sec('UNMARKED','')+sec('PRESENT','P')+sec('ABSENT','A'))||'<div class="empty">No players. "＋ Player" click pannunga.</div>';
}
function renderHis(){
  const ks=Object.keys(db.rec).filter(k=>Object.keys(db.rec[k]).length).sort().reverse();
  $('#hist').innerHTML=ks.map(k=>{const[d,c]=k.split('|'),v=Object.values(db.rec[k]),P=v.filter(x=>x==='P').length;
    return`<div class="hs" data-k="${k}"><div><b>${fmt(d)}</b><small>${c}</small></div><span class="tag">${P} Present</span><span class="tag">${v.length-P} Absent</span></div>`}).join('')||'<div class="empty">No sessions saved yet</div>';
}
function stats(p,f='0000-01-01',t='9999-12-31'){let P=0,A=0,h=[];
  Object.keys(db.rec).filter(k=>k.endsWith('|'+p.cat)).sort().forEach(k=>{const d=k.split('|')[0];if(d<f||d>t)return;const v=db.rec[k][p.id];if(v){v==='P'?P++:A++;h.push([d,v])}});
  return{P,A,h,pct:P+A?Math.round(P/(P+A)*100):0}}
function renderRep(){
  $('#rtabs').innerHTML=CATS.map(c=>`<button data-cat="${c}" class="${c===cat?'on':''}">${c.toUpperCase()}</button>`).join('');
  $('#rf').value=rf.from.startsWith('0000')?'':rf.from;$('#rt').value=rf.to.startsWith('9999')?'':rf.to;
  const ks=sessionsIn(cat),a=plist(cat).map(p=>({p,s:stats(p,rf.from,rf.to)})).sort((x,y)=>y.s.pct-x.s.pct||y.s.P-x.s.P);
  const avg=a.length?Math.round(a.reduce((t,x)=>t+x.s.pct,0)/a.length):0;
  $('#rsum').innerHTML=`<div><b>${ks.length}</b>SESSIONS</div><div class="p"><b>${avg}%</b>AVG ATTENDANCE</div><div class="u"><b>${a[0]&&a[0].s.P+a[0].s.A?esc(a[0].p.name.split(' ')[0]):'-'}</b>TOP PLAYER</div>`;
  $('#rep').innerHTML=a.map(({p,s},i)=>`<div class="rr" data-prof="${p.id}"><span class="medal">${['🥇','🥈','🥉'][i]||i+1}</span>${avatar(p)}<div class="l2"><b>${esc(p.name)}</b><small>${s.P} present · ${s.A} absent</small><div class="bar"><i style="width:${s.pct}%"></i></div></div><div class="pc">${s.pct}%</div></div>`).join('')||'<div class="empty">No players</div>';
}
function render(){view==='att'?renderAtt():view==='his'?renderHis():renderRep()}
function setView(v){view=v;['att','his','rep'].forEach(x=>$('#v-'+x).hidden=x!==v);
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
  $('.live').hidden=v!=='att';render()}

$('#nav').onclick=e=>{const b=e.target.closest('button');if(b)setView(b.dataset.v)};
const tabClick=e=>{const b=e.target.closest('button');if(b){cat=b.dataset.cat;render()}};
$('#tabs').onclick=tabClick;$('#rtabs').onclick=tabClick;
$('#date').onchange=render;$('#q').oninput=renderAtt;
$('#hist').onclick=e=>{const h=e.target.closest('[data-k]');if(!h)return;const[d,c]=h.dataset.k.split('|');$('#date').value=d;cat=c;setView('att')};
const profClick=e=>{const p=e.target.closest('[data-prof]');if(p)profile(p.dataset.prof)};
$('#list').onclick=e=>{
  const m=e.target.closest('[data-m]');
  if(m){const k=rk();db.rec[k]=db.rec[k]||{};const id=m.dataset.m,v=m.dataset.v;
    if(db.rec[k][id]===v)delete db.rec[k][id];else db.rec[k][id]=v;
    if(!Object.keys(db.rec[k]).length)delete db.rec[k];save();sync();renderAtt();return}
  profClick(e)};
$('#rep').onclick=profClick;
const setAll=v=>{const k=rk();db.rec[k]=db.rec[k]||{};plist(cat).forEach(p=>{if(v)db.rec[k][p.id]=v;else delete db.rec[k][p.id]});
  if(!Object.keys(db.rec[k]).length)delete db.rec[k];save();sync();renderAtt()};
$('#allP').onclick=()=>setAll('P');$('#allA').onclick=()=>setAll('A');
$('#rst').onclick=()=>{if(confirm('Reset this session?'))setAll(null)};

// add/edit
function openAdd(p){editId=p?p.id:null;photoData=p?p.photo||'':'';
  $('#addT').textContent=p?'Edit Player':'Add Player';
  $('#pn').value=p?p.name:'';$('#pno').value=p?p.no:'';$('#ppos').value=p?p.pos:'';$('#pcat').value=p?p.cat:cat;
  $('#pv').src=photoData||logo;$('#mAdd').classList.add('show')}
$('#add').onclick=()=>openAdd();
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$('#mAdd').classList.remove('show'));
$('#photo').onchange=e=>{const f=e.target.files[0];if(!f)return;const img=new Image();
  img.onload=()=>{const c=document.createElement('canvas');c.width=c.height=200;const s=Math.min(img.width,img.height);
    c.getContext('2d').drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,200,200);
    photoData=c.toDataURL('image/jpeg',.8);$('#pv').src=photoData};img.src=URL.createObjectURL(f)};
$('#fAdd').onsubmit=e=>{e.preventDefault();
  const o={name:$('#pn').value.trim(),no:$('#pno').value,pos:$('#ppos').value.trim(),cat:$('#pcat').value,photo:photoData};
  let pl;if(editId){pl=db.players.find(p=>p.id===editId);Object.assign(pl,o)}else{pl={id:'p'+Date.now(),...o};db.players.push(pl)}
  if(cloudOn())Cloud.savePlayer(pl);
  save();$('#mAdd').classList.remove('show');cat=o.cat;render()};

// profile
function profile(id){const p=db.players.find(x=>x.id===id),s=stats(p);
  $('#prof').innerHTML=`<div class="ph"><img src="${p.photo||logo}"><h2>${esc(p.name)}</h2><span>${p.no?'#'+esc(p.no)+' · ':''}${esc(p.pos||'')} · ${p.cat}</span></div>
  <div class="pct">${s.pct}%</div><div class="stats" style="grid-template-columns:repeat(3,1fr)"><div><b>${s.P+s.A}</b>SESSIONS</div><div class="p"><b>${s.P}</b>PRESENT</div><div class="a"><b>${s.A}</b>ABSENT</div></div>
  <div class="hist">${s.h.slice().reverse().map(([d,v])=>`<i class="${v}">${fmt(d)} · ${v==='P'?'✔':'✘'}</i>`).join('')||'<span class="empty">No records yet</span>'}</div>
  <div class="row2"><button class="ghost" id="pe">Edit</button><button class="ghost" id="pd">Delete</button><button class="gold" id="pc">Close</button></div>`;
  $('#mProf').classList.add('show');
  $('#pc').onclick=()=>$('#mProf').classList.remove('show');
  $('#pe').onclick=()=>{$('#mProf').classList.remove('show');openAdd(p)};
  $('#pd').onclick=()=>{if(confirm('Delete '+p.name+'?')){db.players=db.players.filter(x=>x.id!==id);save();if(cloudOn())Cloud.delPlayer(id);$('#mProf').classList.remove('show');render()}}}
$('#mProf').onclick=e=>{if(e.target.id==='mProf')e.target.classList.remove('show')};

// WhatsApp
const wa=t=>window.open('https://wa.me/?text='+encodeURIComponent(t),'_blank');
$('#exp').onclick=()=>{
  const ps=plist(cat),r=db.rec[rk()]||{};
  const pr=ps.filter(p=>r[p.id]==='P'),ab=ps.filter(p=>r[p.id]==='A'),un=ps.filter(p=>!r[p.id]);
  const L=a=>a.map((p,i)=>`${i+1}. ${p.name}${p.no?' (#'+p.no+')':''}`).join('\n')||'-';
  let t=`🏆 *LEGIONS FC – ${cat} Attendance*\n📅 ${fmt($('#date').value)}\n\n✅ *Present (${pr.length})*\n${L(pr)}\n\n❌ *Absent (${ab.length})*\n${L(ab)}`;
  if(un.length)t+=`\n\n⚪ *Not marked (${un.length})*\n${L(un)}`;
  wa(t+`\n\n📊 ${pr.length}/${ps.length} present`)};


// ---- Reports ----
const ms=()=>today().slice(0,8)+'01';
let rf={from:ms(),to:today()};
function sessionsIn(c){return Object.keys(db.rec).filter(k=>{const[d,cc]=k.split('|');return cc===c&&d>=rf.from&&d<=rf.to&&Object.keys(db.rec[k]).length}).sort()}
document.querySelector('.chips').onclick=e=>{const b=e.target.closest('[data-r]');if(!b)return;const r=b.dataset.r;
  if(r==='month')rf={from:ms(),to:today()};
  else if(r==='30'){const d=new Date();d.setDate(d.getDate()-30);rf={from:new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10),to:today()}}
  else rf={from:'0000-01-01',to:'9999-12-31'};renderRep()};
$('#rf').onchange=()=>{rf.from=$('#rf').value||'0000-01-01';renderRep()};
$('#rt').onchange=()=>{rf.to=$('#rt').value||'9999-12-31';renderRep()};
$('#repWa').onclick=()=>wa(`🏆 *LEGIONS FC – ${cat} Report*\n📅 ${rf.from.startsWith('0000')?'Start':fmt(rf.from)} → ${rf.to.startsWith('9999')?'Today':fmt(rf.to)}\n\n`+plist(cat).map(p=>({p,s:stats(p,rf.from,rf.to)})).sort((a,b)=>b.s.pct-a.s.pct).map(({p,s},i)=>`${i+1}. ${p.name} – ${s.pct}% (${s.P}P/${s.A}A)`).join('\n'));
$('#csv').onclick=()=>{const ks=sessionsIn(cat),ps=plist(cat);
  const rows=[['Name','Jersey','Position',...ks.map(k=>k.split('|')[0]),'Present','Absent','%']];
  ps.forEach(p=>{const s=stats(p,rf.from,rf.to);rows.push([p.name,p.no||'',p.pos||'',...ks.map(k=>db.rec[k][p.id]||'-'),s.P,s.A,s.pct+'%'])});
  const csv='\ufeff'+rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='Legions_'+cat+'_report.csv';a.click()};
$('#prt').onclick=()=>window.print();

// ---- Cloud hooks ----
window.App={setData(p,r){if(p)db.players=p;if(r)db.rec=r;render()},setUser(e){$('#cuser').textContent=e?'☁ '+e:''}};
$('#logout').onclick=()=>window.Cloud&&Cloud.logout();
$('#upl').onclick=()=>{if(confirm('Indha device la irukkura pazhaya data-va cloud ku upload pannanuma?'))Cloud.uploadAll(JSON.parse(localStorage.getItem(KEY)||'{"players":[],"rec":{}}'))};

// ---- Install (desktop / mobile) ----
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('#inst').hidden=false});
$('#inst').onclick=async()=>{if(!dp)return;dp.prompt();await dp.userChoice;dp=null;$('#inst').hidden=true};
addEventListener('appinstalled',()=>$('#inst').hidden=true);

render();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});