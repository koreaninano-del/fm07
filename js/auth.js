/* ====== 계정 / 저장 (로컬 또는 Firebase 클라우드) ====== */
const Account={ mode:'local', uid:null, id:null, fb:null, dirty:false, timer:null };
const ACC_KEY='wc-sticker-accounts-v1', LAST_KEY='wc-sticker-last-id';
const EMAIL_DOMAIN='wc-sticker.app';
async function sha256(s){ const b=new TextEncoder().encode(s); const h=await crypto.subtle.digest('SHA-256',b); return Array.from(new Uint8Array(h)).map(x=>x.toString(16).padStart(2,'0')).join(''); }
function localAccounts(){ try{ return JSON.parse(localStorage.getItem(ACC_KEY)||'{}'); }catch(e){ return {}; } }
function saveLocalAccounts(a){ localStorage.setItem(ACC_KEY,JSON.stringify(a)); }
function validId(id){ return /^[a-z0-9_]{3,16}$/.test(id); }
/* ---- Firebase ---- */
function loadScript(src){ return new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
async function initCloud(){
  const cfg=window.FIREBASE_CONFIG;
  if(!cfg||!cfg.apiKey||cfg.apiKey.startsWith('여기')) return false;
  try{
    const v='10.14.1';
    await loadScript(`https://www.gstatic.com/firebasejs/${v}/firebase-app-compat.js`);
    await loadScript(`https://www.gstatic.com/firebasejs/${v}/firebase-auth-compat.js`);
    await loadScript(`https://www.gstatic.com/firebasejs/${v}/firebase-firestore-compat.js`);
    firebase.initializeApp(cfg); Account.fb={auth:firebase.auth(),db:firebase.firestore()}; Account.mode='cloud';
    await Account.fb.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    return true;
  }catch(e){ console.warn('Firebase 초기화 실패, 로컬 모드로 실행',e); return false; }
}
/* ---- 공통 API ---- */
async function accountRegister(id,pw,name){
  id=id.toLowerCase().trim();
  if(!validId(id)) throw new Error('아이디는 영문 소문자·숫자·_ 3~16자로 만들어 주세요');
  if(pw.length<6) throw new Error('비밀번호는 6자 이상이어야 해요');
  const profile=newProfile(name||id);
  if(Account.mode==='cloud'){
    const cred=await Account.fb.auth.createUserWithEmailAndPassword(`${id}@${EMAIL_DOMAIN}`,pw).catch(e=>{ throw new Error(e.code==='auth/email-already-in-use'?'이미 있는 아이디예요':'가입 실패: '+e.message); });
    Account.uid=cred.user.uid; Account.id=id;
    await Account.fb.db.collection('saves').doc(Account.uid).set({id,name:profile.name,data:JSON.stringify(profile),updated:Date.now()});
  } else {
    const acc=localAccounts(); if(acc[id]) throw new Error('이미 있는 아이디예요');
    const salt=Math.random().toString(36).slice(2); acc[id]={salt,hash:await sha256(salt+pw),data:profile,updated:Date.now()}; saveLocalAccounts(acc);
    Account.uid=id; Account.id=id;
  }
  localStorage.setItem(LAST_KEY,id);
  return profile;
}
async function accountLogin(id,pw){
  id=id.toLowerCase().trim();
  if(Account.mode==='cloud'){
    const cred=await Account.fb.auth.signInWithEmailAndPassword(`${id}@${EMAIL_DOMAIN}`,pw).catch(e=>{ throw new Error('아이디 또는 비밀번호가 맞지 않아요'); });
    Account.uid=cred.user.uid; Account.id=id;
    const snap=await Account.fb.db.collection('saves').doc(Account.uid).get();
    localStorage.setItem(LAST_KEY,id);
    if(!snap.exists){ const p=newProfile(id); await accountSaveNow(p); return p; }
    return JSON.parse(snap.data().data);
  } else {
    const acc=localAccounts(); const a=acc[id];
    if(!a||a.hash!==await sha256(a.salt+pw)) throw new Error('아이디 또는 비밀번호가 맞지 않아요');
    Account.uid=id; Account.id=id; localStorage.setItem(LAST_KEY,id);
    return a.data;
  }
}
async function accountResume(){ // 세션 유지 (클라우드: Firebase 세션, 로컬: 마지막 아이디는 비밀번호 필요)
  if(Account.mode!=='cloud') return null;
  const user=await new Promise(res=>{ const un=Account.fb.auth.onAuthStateChanged(u=>{ un(); res(u); }); });
  if(!user) return null;
  Account.uid=user.uid; Account.id=(user.email||'').split('@')[0];
  const snap=await Account.fb.db.collection('saves').doc(user.uid).get();
  return snap.exists? JSON.parse(snap.data().data) : null;
}
async function accountSaveNow(profile){
  profile=profile||S; if(!Account.uid||!profile) return;
  if(Account.mode==='cloud'){
    profile.rev=(profile.rev||0)+1;
    const write=Account.fb.db.collection('saves').doc(Account.uid).set({id:Account.id,name:profile.name,data:JSON.stringify(profile),rev:profile.rev,updated:Date.now()});
    try{ await Promise.race([write,new Promise((_,rej)=>setTimeout(()=>rej(new Error('save timeout')),10000))]); Account.saveErr=false; }
    catch(e){ Account.saveErr=true; throw e; }
  } else { const acc=localAccounts(); if(acc[Account.id]){ acc[Account.id].data=profile; acc[Account.id].updated=Date.now(); saveLocalAccounts(acc); } }
  Account.dirty=false; setSyncState('ok'); if(typeof famPublish==='function') famPublish();
}
function accountSave(){ // 디바운스 저장
  if(!Account.uid) return; Account.dirty=true; setSyncState('pending');
  clearTimeout(Account.timer); Account.timer=setTimeout(()=>accountSaveNow().catch(e=>{console.warn(e);setSyncState('err');}),1500);
}
window.addEventListener('beforeunload',()=>{ if(Account.dirty){ try{ if(Account.mode==='local') accountSaveNow(); }catch(e){} } });
document.addEventListener('visibilitychange',()=>{ if(document.hidden&&Account.dirty) accountSaveNow().catch(()=>{}); });
async function accountLogout(){ if(Account.dirty) await accountSaveNow().catch(()=>{}); if(Account.mode==='cloud') await Account.fb.auth.signOut(); Account.uid=null; Account.id=null; localStorage.removeItem(LAST_KEY); S=null; location.reload(); }
async function accountChangePassword(oldPw,newPw){
  if(newPw.length<6) throw new Error('새 비밀번호는 6자 이상이어야 해요');
  if(Account.mode==='cloud'){
    const u=Account.fb.auth.currentUser; const cred=firebase.auth.EmailAuthProvider.credential(u.email,oldPw);
    await u.reauthenticateWithCredential(cred).catch(()=>{ throw new Error('현재 비밀번호가 맞지 않아요'); }); await u.updatePassword(newPw);
  } else { const acc=localAccounts(); const a=acc[Account.id]; if(a.hash!==await sha256(a.salt+oldPw)) throw new Error('현재 비밀번호가 맞지 않아요'); a.salt=Math.random().toString(36).slice(2); a.hash=await sha256(a.salt+newPw); saveLocalAccounts(acc); }
}
/* 돈·카드가 바뀌는 행동은 인터넷이 연결되고 저장이 되는 상태에서만 (오프라인 복사 버그 방지) */
function econOK(){ if(Account.mode!=='cloud') return true; if(!navigator.onLine){ toast('인터넷에 연결된 상태에서만 할 수 있어요'); return false; } if(Account.saveErr){ toast('저장이 안 되고 있어요. 인터넷을 확인한 뒤 다시 해 주세요'); return false; } return true; }
/* 다른 기기(또는 다른 탭)에서 더 최신으로 저장했으면 그 데이터로 바꿈 */
async function accountReconcile(){
  if(Account.mode!=='cloud'||!Account.uid||!S) return false;
  const snap=await Account.fb.db.collection('saves').doc(Account.uid).get(); if(!snap.exists) return false;
  const d=snap.data(); if((d.rev||0)<=(S.rev||0)) return false;
  const p=JSON.parse(d.data); Object.keys(p.cards||{}).forEach(id=>{ if(!CARDS[id]) delete p.cards[id]; });
  DB.profiles=[p]; DB.current=0; S=p; Account.dirty=false; refreshHUD(); if(typeof renderHome==='function') try{ renderHome(); }catch(e){}
  toast('다른 기기에서 저장된 최신 데이터를 불러왔어요'); return true;
}
window.addEventListener('online',()=>{ if(Account.dirty) accountSaveNow().catch(()=>{}); });
function setSyncState(st){ const el=document.getElementById('sync'); if(!el) return; el.className='sync '+st; el.textContent= st==='ok'?(Account.mode==='cloud'?'클라우드 저장됨':'이 기기에 저장됨'): st==='pending'?'저장 중':'저장 실패 (인터넷 확인)'; }
/* ---- 로그인 화면 ---- */
function authError(msg){ const e=document.getElementById('auth-err'); if(e){ e.textContent=msg; e.style.display='block'; } }
function openAuth(tab){
  tab=tab||'login'; const last=localStorage.getItem(LAST_KEY)||'';
  const legacy=(DB.profiles||[]).filter(p=>p&&p.stats&&(p.stats.packs>0||cardCount(p)>6));
  openModal(`<div class="auth"><div class="auth-logo">${MARK}</div><h1 style="text-align:center;font-size:24px;line-height:32px;letter-spacing:.5px">KICK OFF 27</h1><p class="muted" style="text-align:center;margin-top:0">${Account.mode==='cloud'?'아이디로 로그인하면 어느 기기에서든 이어서 할 수 있어요':'이 기기에 저장되는 로컬 모드예요'}</p>
    <div class="tabs"><button class="tab ${tab==='login'?'on':''}" onclick="openAuth('login')">로그인</button><button class="tab ${tab==='join'?'on':''}" onclick="openAuth('join')">새 아이디 만들기</button></div>
    ${tab==='login'?`<label>아이디<input id="a-id" value="${last}" placeholder="영문 소문자·숫자" autocomplete="username"></label><label>비밀번호<input id="a-pw" type="password" placeholder="6자 이상" autocomplete="current-password"></label>
      <div id="auth-err" class="warn" style="display:none"></div><button class="btn primary big" onclick="doLogin()">로그인</button>`
    :`<label>아이디<input id="a-id" placeholder="영문 소문자·숫자·_ 3~16자" autocomplete="username"></label><label>이름 (카드북에 표시)<input id="a-name" placeholder="예: 지우" maxlength="8"></label><label>비밀번호<input id="a-pw" type="password" placeholder="6자 이상" autocomplete="new-password"></label><label>비밀번호 확인<input id="a-pw2" type="password" autocomplete="new-password"></label>
      ${legacy.length?`<label>이전에 이 기기에서 하던 데이터 가져오기<select id="a-legacy"><option value="">새로 시작</option>${legacy.map((p,i)=>`<option value="${DB.profiles.indexOf(p)}">${p.name} · ${fmt(p.money)} · ${cardCount(p)}장</option>`).join('')}</select></label>`:''}
      <div id="auth-err" class="warn" style="display:none"></div><button class="btn primary big" onclick="doJoin()">만들고 시작하기</button>`}
    <p class="muted small" style="text-align:center">비밀번호를 잊으면 부모님께 말해 주세요</p></div>`,'auth');
  setTimeout(()=>{ const el=document.getElementById(tab==='login'&&last?'a-pw':'a-id'); if(el) el.focus(); },60);
  document.querySelectorAll('.auth input').forEach(i=>i.addEventListener('keydown',e=>{ if(e.key==='Enter'){ tab==='login'?doLogin():doJoin(); } }));
}
async function doLogin(){
  const id=document.getElementById('a-id').value, pw=document.getElementById('a-pw').value;
  try{ const p=await accountLogin(id,pw); startWith(p); }catch(e){ authError(e.message); }
}
async function doJoin(){
  const id=document.getElementById('a-id').value, name=document.getElementById('a-name').value.trim(), pw=document.getElementById('a-pw').value, pw2=document.getElementById('a-pw2').value;
  if(pw!==pw2) return authError('비밀번호 확인이 달라요');
  try{
    const p=await accountRegister(id,pw,name);
    const lg=document.getElementById('a-legacy'); if(lg&&lg.value!==''){ const old=DB.profiles[parseInt(lg.value)]; Object.assign(p,JSON.parse(JSON.stringify(old)),{name:name||old.name}); await accountSaveNow(p); }
    startWith(p,true);
  }catch(e){ authError(e.message); }
}
function startWith(profile,isNew){
  Object.keys(profile.cards||{}).forEach(id=>{ if(!CARDS[id]) delete profile.cards[id]; });
  Object.keys(profile.friends||{}).forEach(f=>{ if(profile.friends[f].some(id=>!CARDS[id])) delete profile.friends[f]; });
  DB.profiles=[profile]; DB.current=0; S=profile; refreshHUD(); closeModal(); setSyncState('ok');
  toast(`${S.name}, 어서 와!`); if(isNew) setTimeout(showHelp,400); if(typeof famLoad==='function'&&famOn()){ famLoad().catch(e=>console.warn(e)); famPublish(); if(Fam.timer) clearInterval(Fam.timer); Fam.timer=setInterval(()=>famLoad().catch(()=>{}),90000); }
}
function openAccount(){
  openModal(`<h2>내 계정</h2><div class="stat-row"><span>아이디</span><b>${Account.id}</b></div><div class="stat-row"><span>이름</span><b>${S.name}</b></div><div class="stat-row"><span>저장 방식</span><b>${Account.mode==='cloud'?'클라우드 (어느 기기에서나 이어하기)':'이 기기에만 저장'}</b></div>
    <h3>이름 바꾸기</h3><div class="row"><input id="ac-name" value="${S.name}" maxlength="8"><button class="btn" onclick="const n=document.getElementById('ac-name').value.trim();if(n){S.name=n;refreshHUD();toast('이름을 바꿨어요');openAccount()}">저장</button></div>
    <h3>비밀번호 바꾸기</h3><div class="row"><input id="ac-old" type="password" placeholder="현재 비밀번호"><input id="ac-new" type="password" placeholder="새 비밀번호 (6자 이상)"><button class="btn" onclick="accountChangePassword(document.getElementById('ac-old').value,document.getElementById('ac-new').value).then(()=>toast('비밀번호를 바꿨어요')).catch(e=>toast(e.message))">변경</button></div>
    <div class="row right" style="margin-top:20px"><button class="btn" onclick="closeModal()">닫기</button><button class="btn danger" onclick="accountLogout()">로그아웃</button></div>`);
}
