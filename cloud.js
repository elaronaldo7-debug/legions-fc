import {firebaseConfig as cfg} from './firebase-config.js';
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {getAuth,setPersistence,browserLocalPersistence,onAuthStateChanged,signInWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {initializeFirestore,persistentLocalCache,collection,doc,setDoc,deleteDoc,onSnapshot} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
const $=s=>document.querySelector(s);
if(!cfg.apiKey.startsWith('PASTE')){
  const app=initializeApp(cfg),auth=getAuth(app),fs=initializeFirestore(app,{localCache:persistentLocalCache()});
  let un=[];
  const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),7000)};
  setPersistence(auth,browserLocalPersistence).catch(()=>{});
  window.Cloud={on:true,
    savePlayer:p=>setDoc(doc(fs,'players',p.id),p),
    delPlayer:id=>deleteDoc(doc(fs,'players',id)),
    saveSession:(date,cat,marks)=>{const id=date+'_'+cat;return Object.keys(marks).length?setDoc(doc(fs,'sessions',id),{date,cat,marks}):deleteDoc(doc(fs,'sessions',id))},
    logout:()=>signOut(auth),
    uploadAll:async d=>{for(const p of d.players)await setDoc(doc(fs,'players',p.id),p);
      for(const k in d.rec){const[date,cat]=k.split('|');if(Object.keys(d.rec[k]).length)await setDoc(doc(fs,'sessions',date+'_'+cat),{date,cat,marks:d.rec[k]})}
      alert('Uploaded ✔')}};
  onAuthStateChanged(auth,u=>{
    un.forEach(f=>f());un=[];
    if(!u){$('#mLogin').classList.add('show');App.setUser('');return}
    $('#mLogin').classList.remove('show');App.setUser(u.email);
    un.push(onSnapshot(collection(fs,'players'),s=>App.setData(s.docs.map(d=>d.data()),null),e=>toast('Firestore error: '+e.code)));
    un.push(onSnapshot(collection(fs,'sessions'),s=>{const r={};s.docs.forEach(d=>{const x=d.data();r[x.date+'|'+x.cat]=x.marks});App.setData(null,r)},e=>toast('Firestore error: '+e.code)));
  });
  $('#fLogin').onsubmit=async e=>{e.preventDefault();$('#lerr').textContent='';
    try{await signInWithEmailAndPassword(auth,$('#lem').value.trim(),$('#lpw').value)}catch(err){$('#lerr').textContent='Login failed: '+err.code}};
  $('#cloudbox').hidden=false;
}
