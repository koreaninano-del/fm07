/* ====== 게임 상태 / 저장 ====== */
const SAVE_KEY='soccer-card-shop-v1';
let DB={profiles:[],current:-1};
let S=null; // 현재 프로필
const ui={modalOpen:false};
const fmt=n=>n.toLocaleString('ko-KR')+'원';
const todayStr=()=>new Date().toISOString().slice(0,10);
function load(){ try{ const raw=localStorage.getItem(SAVE_KEY); if(raw) DB=JSON.parse(raw);}catch(e){}
  // 더 이상 없는 카드(이전 버전 픽셀 카드) 정리
  DB.profiles.forEach(p=>{ Object.keys(p.cards).forEach(id=>{ if(!CARDS[id]) delete p.cards[id]; }); Object.keys(p.friends||{}).forEach(f=>{ if(p.friends[f].some(id=>!CARDS[id])) delete p.friends[f]; }); }); }
function save(){ if(typeof accountSave==='function') accountSave(); }
function newProfile(name){
  const p={name, money:150000, cards:{}, log:[], lastAllowance:'', stats:{packs:0,battles:0,wins:0,trades:0}, friends:{}, created:todayStr()};
  // 시작 카드 6장
  const starter=pullPack(SETS[0],true); starter.forEach(c=>addCard(p,c.id));
  p.log.unshift({t:todayStr(),m:'카드숍에 처음 왔어요! 시작 카드 6장을 받았어요.'});
  return p;
}
function addCard(p,id,n){ p.cards[id]=(p.cards[id]||0)+(n||1); }
function removeCard(p,id,n){ p.cards[id]=(p.cards[id]||0)-(n||1); if(p.cards[id]<=0) delete p.cards[id]; }
function cardCount(p){ return Object.values(p.cards).reduce((a,b)=>a+b,0); }
function logIt(m){ S.log.unshift({t:todayStr(),m}); if(S.log.length>200) S.log.length=200; }
function refreshHUD(){
  if(typeof renderHome==='function') try{renderHome();}catch(e){}
  document.getElementById('hud-money').textContent=fmt(S.money);
  document.getElementById('hud-cards').textContent=cardCount(S).toLocaleString('ko-KR')+'장';
  document.getElementById('hud-name').textContent=S.name;
  save();
}
/* ====== 팩 뽑기 ====== */
function weightedRarity(minR){
  const order=['C','R','H','G','L']; let pool=order.filter(r=>order.indexOf(r)>=order.indexOf(minR||'C'));
  const tot=pool.reduce((a,r)=>a+RARITY[r].odds,0); let x=Math.random()*tot;
  for(const r of pool){ x-=RARITY[r].odds; if(x<=0) return r; } return pool[0];
}
function pullPack(set,starter){
  const out=[];
  for(let i=0;i<6;i++){
    let rar=weightedRarity(i===5?'R':'C'); if(starter&&i<5) rar='C';
    let pool=set.cards.filter(c=>c.rar===rar); if(!pool.length) pool=set.cards;
    if(i===5&&set.guar) pool=set.cards.filter(set.guar);
    out.push(pool[Math.floor(Math.random()*pool.length)]);
  }
  return out;
}
/* ====== 모달 ====== */
function openModal(html,cls){ const m=document.getElementById('modal'); m.className='modal-wrap '+(cls||''); m.innerHTML=`<div class="modal">${html}</div>`; m.style.display='flex'; ui.modalOpen=true; Object.keys(game.keys).forEach(k=>game.keys[k]=false); }
function closeModal(){ const m=document.getElementById('modal'); if(m.classList.contains('auth')&&!S) return; if(typeof live!=='undefined'&&live&&live.min<90){ clearInterval(live.timer); live.silent=true; while(live.min<90) tick(); live.silent=false; return finishMatch(); } m.style.display='none'; m.innerHTML=''; ui.modalOpen=false; if(S&&typeof renderHome==='function') try{renderHome();}catch(e){} }
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2200); }
function interact(h){ ({shop:openShop,book:openBinder,trade:openTradeLobby,battle:openBattleLobby,bank:openBank})[h.id](); }
/* ====== 팩 상점 ====== */
let shopSel=null, shopFilter='';
function packSVG(set,w){ const h=w*1.5; const c1=set.theme[0], c2=set.theme[1]; const uid='pk'+hashStr(set.id)+Math.floor(Math.random()*1e6);
  const sample=(set.cards||[]).filter(c=>IMG[c.img||c.id]&&(c.kind==='player'||!c.kind)); const pick=sample.length?sample[(hashStr(set.id)*7)%sample.length]:null;
  const pic=pick?`<clipPath id="${uid}"><rect x="${w*0.14}" y="${h*0.1}" width="${w*0.72}" height="${h*0.54}" rx="${w*0.03}"/></clipPath><image href="${IMG[pick.img||pick.id]}" x="${w*0.14}" y="${h*0.1}" width="${w*0.72}" height="${h*0.54}" preserveAspectRatio="xMidYMin slice" clip-path="url(#${uid})"/>`:`<rect x="${w*0.14}" y="${h*0.1}" width="${w*0.72}" height="${h*0.54}" rx="${w*0.03}" fill="${c2}"/>`;
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="pack-svg">
  <rect x="1" y="4" width="${w-2}" height="${h-8}" rx="${w*0.06}" fill="${c1}"/>${pic}
  <text x="${w/2}" y="${h*0.76}" font-size="${w*(set.short.length>7?0.1:0.12)}" text-anchor="middle" font-weight="600" font-family="Inter, sans-serif" fill="#fff">${set.short}</text>
  <text x="${w/2}" y="${h*0.88}" font-size="${w*0.085}" text-anchor="middle" font-family="Inter, sans-serif" fill="#fff" opacity=".8">스티커 6장</text></svg>`; }
function openShop(){ shopSel=shopSel||SETS[0]; renderShop(); }
function renderShop(){
  const list=SETS.filter(s=>!shopFilter||s.name.includes(shopFilter)).map(s=>`<div class="pack-item ${shopSel.id===s.id?'sel':''}" onclick="shopSel=SETS.find(x=>x.id==='${s.id}');renderShop()">${packSVG(s,70)}<div class="pi-name">${s.short}</div><div class="pi-sub">${s.year} · ${s.cards.length}종</div><div class="pi-price">${fmt(s.price)}</div></div>`).join('');
  const owned=shopSel.cards.filter(c=>S.cards[c.id]).length;
  openModal(`<div class="shop">
    <div class="shop-left"><div class="shop-title">팩을 골라 주세요 <span class="muted">${SETS.length}종</span></div>
      <input id="shop-search" placeholder="어떤 팩을 찾으세요?" value="${shopFilter}" oninput="shopFilter=this.value;renderShop();document.getElementById('shop-search').focus()">
      <div class="pack-list">${list}</div></div>
    <div class="shop-center">
      <div class="crumb">진열대로 → 팩 고르기 · 계산하기 · 직접 뜯기</div>
      <div class="set-tag">${shopSel.id} · 한국어판</div><h2>${shopSel.name}</h2>
      <div class="counter"><div class="bubble">이 팩으로 드릴까요?</div>
      <div class="pack-big">${packSVG(shopSel,150)}</div>
      <div class="receipt"><div><span>고른 팩</span><b>${shopSel.name}</b></div><div><span>수량</span><b>1팩 · 6장</b></div><div class="line"></div><div><span>구매 가격</span><b class="big">${fmt(shopSel.price)}</b></div><div><span>내 잔액</span><b>${fmt(S.money)}</b></div><div><span>구매 후</span><b>${fmt(S.money-shopSel.price)}</b></div></div></div>
    </div>
    <div class="shop-right">
      <div class="steps"><span class="on">01 구매</span><span>02 봉투 개봉</span><span>03 꺼내기</span><span>04 확인</span></div>
      <h3>계산대에서 팩을 받아요</h3><p class="muted">가격을 확인하고 구매하면, 봉투를 직접 뜯을 수 있어요.</p>
      <div class="muted small">팩당 6장 · 이 팩 ${shopSel.cards.length}종 중 ${owned}종 보유</div><div class="muted small">카드 6장 평균 시세 약 ${fmt(shopSel.ev)}${shopSel.guar?' · 마지막 1장은 베스트 XI 보장':''}</div>
      <div class="price-box">1팩 ${fmt(shopSel.price)} · 잔액 ${fmt(S.money)}</div>
      <button class="btn primary big" ${S.money<shopSel.price?'disabled':''} onclick="buyPack()">1팩 구매하기</button>
      ${S.money<shopSel.price?'<div class="warn">잔액이 부족해요. 대결에서 이기거나 카드를 팔아 보세요!</div>':''}
      <button class="btn link" onclick="showOdds()">개봉 확률</button>
      <button class="btn link" onclick="closeModal()">나가기</button>
    </div></div>`,'wide');
}
function showOdds(){ openModal(`<h2>개봉 확률</h2><p class="muted">카드 1장당 등급이 나올 확률이에요. 마지막 6번째 카드는 반드시 레어 이상!</p><table class="tbl">${Object.entries(RARITY).map(([k,r])=>`<tr><td><span class="rar-dot" style="background:${r.color}"></span>${r.n}</td><td>${r.odds}%</td></tr>`).join('')}</table><button class="btn" onclick="renderShop()">돌아가기</button>`); }
let opening=null;
function buyPack(){
  if(S.money<shopSel.price) return; S.money-=shopSel.price; S.stats.packs++;
  const cards=pullPack(shopSel); opening={set:shopSel,cards,idx:0,newIds:cards.filter(c=>!S.cards[c.id]).map(c=>c.id)};
  cards.forEach(c=>addCard(S,c.id)); S.recent=[...cards.map(c=>c.id).reverse(),...(S.recent||[])].slice(0,30); logIt(`${shopSel.short} 팩 1개 구매 (${fmt(shopSel.price)})`); refreshHUD();
  openModal(`<div class="open-stage"><div class="steps"><span>01 구매</span><span class="on">02 봉투 개봉</span><span>03 꺼내기</span><span>04 확인</span></div>
    <h2>${shopSel.name}</h2><p class="muted">봉투를 눌러서 뜯어 보세요!</p>
    <div class="pack-tear" id="pack-tear" onclick="tearPack()">${packSVG(shopSel,180)}</div>
    <button class="btn primary big" onclick="tearPack()">봉투 뜯기</button></div>`);
}
function tearPack(){
  const el=document.getElementById('pack-tear'); if(!el||el.classList.contains('torn')) return; el.classList.add('torn');
  setTimeout(()=>{ openModal(`<div class="open-stage"><div class="steps"><span>01 구매</span><span>02 봉투 개봉</span><span class="on">03 꺼내기</span><span>04 확인</span></div>
    <h2>카드를 꺼내요</h2><p class="muted">6장의 카드가 들어 있어요.</p>
    <div class="card-stack" onclick="showCard(0)">${opening.cards.map((c,i)=>`<div class="stack-card" style="transform:rotate(${(i-2.5)*3}deg) translateY(${-i*2}px)"><div class="card-back">${opening.set.short}</div></div>`).join('')}</div>
    <button class="btn primary big" onclick="showCard(0)">카드 꺼내기</button></div>`); },700);
}
function showCard(i){
  opening.idx=i; const c=opening.cards[i]; const isNew=opening.newIds.includes(c.id);
  openModal(`<div class="open-stage"><div class="steps"><span>01 구매</span><span>02 봉투 개봉</span><span>03 꺼내기</span><span class="on">04 확인</span></div>
    <div class="reveal-row"><div class="muted">${i+1} / 6</div></div>
    <div class="reveal-card flip rar-${c.rar}">${cardSVG(c,230)}</div>
    <div class="reveal-info">${isNew?'<span class="badge new">새로 만난 카드</span>':'<span class="badge">이미 있는 카드</span>'} <span class="badge" style="background:${RARITY[c.rar].color}">${RARITY[c.rar].n}</span><h2>${c.name}</h2><div class="muted">${String(c.no).padStart(3,'0')}/${c.total} · ${NATIONS[c.nat].n} ${POS_KO[c.pos]} · 능력치 ${c.rating}</div><div class="price">${fmt(c.price)}</div><div class="muted small">국내 시세 참고가</div></div>
    <div class="row">${i<5?`<button class="btn primary big" onclick="showCard(${i+1})">다음 카드</button><button class="btn" onclick="showAll()">한 번에 확인</button>`:`<button class="btn primary big" onclick="showAll()">결과 보기</button>`}</div></div>`);
}
function showAll(){
  const total=opening.cards.reduce((a,c)=>a+c.price,0);
  openModal(`<div class="open-stage"><h2>개봉 결과</h2><p class="muted">${opening.set.name} · 총 시세 ${fmt(total)} (팩 가격 ${fmt(opening.set.price)})</p>
    <div class="card-grid">${opening.cards.map(c=>`<div class="mini-card ${opening.newIds.includes(c.id)?'is-new':''}" onclick="cardDetail('${c.id}','showAll')">${cardSVG(c,120)}<div class="mc-name">${c.name}</div>${opening.newIds.includes(c.id)?'<div class="new-tag">NEW</div>':''}</div>`).join('')}</div>
    <div class="row"><button class="btn primary" onclick="buyPack()" ${S.money<opening.set.price?'disabled':''}>같은 팩 또 사기 (${fmt(opening.set.price)})</button><button class="btn" onclick="renderShop()">다른 팩 고르기</button><button class="btn" onclick="closeModal()">카드숍으로</button></div></div>`,'wide');
}
/* ====== 카드북 ====== */
let bk={page:0,filter:'',set:'',sort:'set'};
function myCards(){ return Object.keys(S.cards).map(id=>CARDS[id]).filter(Boolean); }
function openBinder(){ bk.page=0; renderBinder(); }
function renderBinder(){
  let cards=myCards();
  if(bk.set) cards=cards.filter(c=>c.set===bk.set);
  if(bk.filter) cards=cards.filter(c=>c.name.includes(bk.filter)||c.id.includes(bk.filter.toUpperCase())||NATIONS[c.nat].n.includes(bk.filter));
  const sorters={set:(a,b)=>a.id.localeCompare(b.id),rating:(a,b)=>b.rating-a.rating,price:(a,b)=>b.price-a.price,rar:(a,b)=>'CRHGL'.indexOf(b.rar)-'CRHGL'.indexOf(a.rar)||b.rating-a.rating};
  cards.sort(sorters[bk.sort]);
  const per=12, pages=Math.max(1,Math.ceil(cards.length/per)); bk.page=Math.min(bk.page,pages-1);
  const pg=cards.slice(bk.page*per,bk.page*per+per);
  const slot=c=>c?`<div class="slot" onclick="cardDetail('${c.id}','renderBinder')">${cardSVG(c,110)}<div class="cnt">×${S.cards[c.id]}</div><div class="sn">${c.name}</div></div>`:'<div class="slot empty"></div>';
  const left=Array.from({length:6},(_,i)=>slot(pg[i])).join(''), right=Array.from({length:6},(_,i)=>slot(pg[i+6])).join('');
  const totalVal=myCards().reduce((a,c)=>a+c.price*S.cards[c.id],0);
  openModal(`<div class="binder"><div class="binder-head"><div><h2>내 카드북</h2><div class="muted">${S.name}의 카드북 · ${cardCount(S)} / 1,000장 · ${myCards().length}종 · 총 시세 ${fmt(totalVal)}</div></div>
    <div class="binder-tools"><input id="bk-search" placeholder="카드 이름 · 번호 · 국가 검색" value="${bk.filter}" oninput="bk.filter=this.value;bk.page=0;renderBinder();document.getElementById('bk-search').focus()">
    <select onchange="bk.set=this.value;bk.page=0;renderBinder()"><option value="">모든 팩</option>${SETS.map(s=>`<option value="${s.id}" ${bk.set===s.id?'selected':''}>${s.short}</option>`).join('')}</select>
    <select onchange="bk.sort=this.value;renderBinder()"><option value="set" ${bk.sort==='set'?'selected':''}>번호순</option><option value="rar" ${bk.sort==='rar'?'selected':''}>등급순</option><option value="rating" ${bk.sort==='rating'?'selected':''}>능력치순</option><option value="price" ${bk.sort==='price'?'selected':''}>시세순</option></select></div></div>
    <div class="binder-book"><div class="page">${left}</div><div class="rings"><i></i><i></i><i></i></div><div class="page">${right}</div></div>
    <div class="binder-foot"><button class="btn" ${bk.page===0?'disabled':''} onclick="bk.page--;renderBinder()">이전 페이지</button><span class="muted">${bk.page+1} / ${pages} 펼침 · ${cards.length}종</span><button class="btn" ${bk.page>=pages-1?'disabled':''} onclick="bk.page++;renderBinder()">다음 페이지</button></div>
    <div class="row right"><button class="btn" onclick="openCollection()">도감 보기</button><button class="btn" onclick="closeModal()">닫기</button></div></div>`,'wide');
}
function openCollection(){
  const set=SETS.find(s=>s.id===(bk.set||SETS[0].id));
  openModal(`<div class="binder"><div class="binder-head"><div><h2>도감 · ${set.name}</h2><div class="muted">${set.cards.filter(c=>S.cards[c.id]).length} / ${set.cards.length}종 수집</div></div>
    <select onchange="bk.set=this.value;openCollection()">${SETS.map(s=>`<option value="${s.id}" ${set.id===s.id?'selected':''}>${s.short}</option>`).join('')}</select></div>
    <div class="dex">${set.cards.map(c=>`<div class="dex-item ${S.cards[c.id]?'':'missing'}" onclick="${S.cards[c.id]?`cardDetail('${c.id}','openCollection')`:''}"><span class="dex-no">${String(c.no).padStart(3,'0')}</span><span class="rar-dot" style="background:${RARITY[c.rar].color}"></span>${c.name}<span class="muted small">${NATIONS[c.nat].n}</span></div>`).join('')}</div>
    <div class="row right"><button class="btn" onclick="renderBinder()">카드북으로</button></div></div>`,'wide');
}
function cardDetail(id,back){
  const c=CARDS[id]; const sell=Math.round(c.price*0.6/100)*100; const set=SETS.find(s=>s.id===c.set);
  openModal(`<div class="detail"><div class="detail-card rar-${c.rar}">${cardSVG(c,240)}</div><div class="detail-info"><div class="muted">${set.name}</div><h2>${c.name}</h2>
    <div class="muted">${String(c.no).padStart(3,'0')}/${c.total} · <span style="color:${RARITY[c.rar].color};font-weight:bold">${RARITY[c.rar].n}</span></div>
    <div class="stat-row"><span>국가</span><b>${NATIONS[c.nat].n}</b></div><div class="stat-row"><span>포지션</span><b>${POS_KO[c.pos]}</b></div><div class="stat-row"><span>능력치</span><b>${c.rating}</b></div>${c.dob?`<div class="stat-row"><span>생년월일</span><b>${c.dob.split('-').reverse().join('.')}</b></div><div class="stat-row"><span>키 / 몸무게</span><b>${c.h.replace(',','.')} m / ${c.w} kg</b></div>`:''}${c.kind==='player'||!c.kind?attrHTML(c):''}${c.edition?`<div class="stat-row"><span>에디션</span><b>${EDITION_INFO[c.edition].n}</b></div>`:''}${c.award?`<div class="stat-row"><span>수상</span><b>${c.award}</b></div>`:''}${c.club?`<div class="stat-row"><span>소속 클럽</span><b style="font-size:12px">${c.club}</b></div>`:''}<div class="stat-row"><span>보유</span><b>${S.cards[c.id]||0}장</b></div><div class="stat-row"><span>시세</span><b>${fmt(c.price)}</b></div>
    <div class="row"><button class="btn" onclick="${back}()">돌아가기</button>${S.cards[c.id]?`<button class="btn primary" onclick="sellCard('${c.id}','${back}')">상인에게 판매 (${fmt(sell)})</button>`:''}</div></div></div>`);
}
function sellCard(id,back){ const c=CARDS[id]; if(!S.cards[id]) return; const sell=Math.round(c.price*0.6/100)*100; removeCard(S,id); S.money+=sell; logIt(`${c.name} 카드 판매 (+${fmt(sell)})`); refreshHUD(); toast(`${c.name} 카드를 ${fmt(sell)}에 팔았어요`); if(S.cards[id]) cardDetail(id,back); else window[back](); }
/* ====== 용돈 ====== */
function openBank(){
  const can=S.lastAllowance!==todayStr();
  openModal(`<h2>용돈 상자</h2><p class="muted">하루에 한 번 용돈을 받을 수 있어요.</p><div class="price-box">오늘의 용돈: 30,000원</div>
    <button class="btn primary big" ${can?'':'disabled'} onclick="S.money+=30000;S.lastAllowance=todayStr();logIt('용돈 30,000원 받음');refreshHUD();toast('용돈 30,000원을 받았어요!');closeModal()">${can?'용돈 받기':'오늘은 이미 받았어요'}</button>
    <button class="btn" onclick="closeModal()">닫기</button>`);
}
/* ====== 친구 컬렉션 ====== */
function friendCards(f){
  if(!S.friends[f.id]||!S.friends[f.id].length){ const arr=[]; for(let i=0;i<14;i++){ const set=SETS[Math.floor(Math.random()*SETS.length)]; const rar=weightedRarity(i<3?'R':'C'); let pool=set.cards.filter(c=>c.rar===rar); if(Math.random()<0.5) pool=pool.filter(c=>f.likes.includes(c.nat)).length?pool.filter(c=>f.likes.includes(c.nat)):pool; if(!pool.length) pool=set.cards; arr.push(pool[Math.floor(Math.random()*pool.length)].id);} S.friends[f.id]=arr; save(); }
  return S.friends[f.id];
}
function friendValue(f,c){ return c.price*(f.likes.includes(c.nat)?1.4:1); }
/* ====== 트레이드 ====== */
let tr={friend:null,mine:null,theirs:null};
function openTradeLobby(tab){ tab=tab||(typeof famOn==='function'&&famOn()?'fam':'npc');
  openModal(`<h2>트레이드</h2><div class="tabs" style="margin:10px 0"><button class="tab ${tab==='fam'?'on':''}" onclick="openTradeLobby('fam')">가족</button><button class="tab ${tab==='npc'?'on':''}" onclick="openTradeLobby('npc')">연습 친구</button></div>
  ${tab==='fam'?renderFamTradeTab():`<p class="muted">가상 친구와 바로 1:1 교환해요.</p><div class="friend-list">${FRIENDS.map(f=>`<div class="friend" onclick="openTrade('${f.id}')"><div class="f-avatar" style="background:${f.avatar[0]}">${f.name[0]}</div><div><b>${f.name}</b><div class="muted small">좋아하는 팀: ${f.likes.map(n=>NATIONS[n].n).join(', ')}</div><div class="small">"${f.greet}"</div></div></div>`).join('')}</div>`}
  <div class="row right"><button class="btn" onclick="closeModal()">닫기</button></div>`); }
function openTrade(fid){ tr={friend:FRIENDS.find(f=>f.id===fid),mine:null,theirs:null}; renderTrade(); }
function renderTrade(msg){
  const f=tr.friend; const theirs=friendCards(f).map(id=>CARDS[id]); const mine=myCards();
  const mv=tr.mine?CARDS[tr.mine].price:0, tv=tr.theirs?friendValue(f,CARDS[tr.theirs]):0;
  const ok=tr.mine&&tr.theirs&&friendValue(f,CARDS[tr.mine])>=tv*0.85;
  const pick=(c,who,sel,cnt)=>`<div class="mini-card ${sel?'sel':''}" onclick="tr.${who}='${c.id}';renderTrade()">${cardSVG(c,96)}<div class="mc-name">${c.name}</div><div class="mc-sub">${fmt(c.price)}${cnt?` · ×${cnt}`:''}${f.likes.includes(c.nat)&&who==='mine'?' · 선호':''}</div></div>`;
  openModal(`<div class="trade"><div class="trade-col"><h3>내 카드</h3><div class="card-grid small">${mine.map(c=>pick(c,'mine',tr.mine===c.id,S.cards[c.id])).join('')}</div></div>
    <div class="trade-mid"><div class="f-avatar big" style="background:${f.avatar[0]}">${f.name[0]}</div><b>${f.name}</b><div class="bubble small">${msg||(tr.mine&&tr.theirs?(ok?'좋아, 바꾸자!':'음… 내 카드가 더 좋은 것 같은데?'):'바꿀 카드를 하나씩 골라 봐.')}</div>
      <div class="trade-slots"><div class="tslot">${tr.mine?cardSVG(CARDS[tr.mine],90):'<div class="muted small">내 카드</div>'}</div><div class="arrow">⇄</div><div class="tslot">${tr.theirs?cardSVG(CARDS[tr.theirs],90):'<div class="muted small">친구 카드</div>'}</div></div>
      <div class="muted small">${f.name}이(가) 좋아하는 팀: ${f.likes.map(n=>NATIONS[n].n).join(', ')} (더 높게 쳐줘요)</div>
      <button class="btn primary" ${ok?'':'disabled'} onclick="doTrade()">교환 제안하기</button><button class="btn" onclick="openTradeLobby('npc')">다른 친구</button><button class="btn" onclick="closeModal()">닫기</button></div>
    <div class="trade-col"><h3>${f.name}의 카드</h3><div class="card-grid small">${theirs.map(c=>pick(c,'theirs',tr.theirs===c.id)).join('')}</div></div></div>`,'wide');
}
function doTrade(){
  const f=tr.friend; const m=CARDS[tr.mine], t=CARDS[tr.theirs];
  removeCard(S,m.id); addCard(S,t.id); const arr=S.friends[f.id]; arr.splice(arr.indexOf(t.id),1); arr.push(m.id);
  S.stats.trades++; logIt(`${f.name}과(와) 교환: ${m.name} → ${t.name}`); refreshHUD(); toast(`${t.name} 카드를 받았어요!`);
  tr.mine=null; tr.theirs=null; renderTrade(`고마워! ${m.name} 카드 갖고 싶었어.`);
}
/* (대결 → match.js 축구 시뮬레이션으로 대체) */
/* ====== 기록 / 메뉴 / 프로필 ====== */
function openClubHistory(){ const c=clubOf(); openModal(`<h2>${c.name} 시즌 기록</h2><div class="loglist">${c.history.map(h=>`<div>시즌 ${h.season} · ${TIER_NAME[h.tier]} ${h.rank}위 · 승점 ${h.pts}</div>`).join('')||'<div class="muted">아직 끝난 시즌이 없어요</div>'}</div><div class="muted small">통산 전적 ${S.stats.wins}승 ${S.stats.battles-S.stats.wins}무·패 · 리그 우승 ${c.trophies.league} · 컵 우승 ${c.trophies.cup}</div><div class="row right"><button class="btn" onclick="closeModal()">닫기</button></div>`); }
function openLog(){ openModal(`<h2>기록</h2><div class="muted">팩 ${S.stats.packs}개 개봉 · 대결 ${S.stats.wins}승 ${S.stats.battles-S.stats.wins}패 · 교환 ${S.stats.trades}회</div><div class="loglist">${S.log.map(l=>`<div><span class="muted small">${l.t}</span> ${l.m}</div>`).join('')||'<div class="muted">아직 기록이 없어요</div>'}</div><button class="btn" onclick="closeModal()">닫기</button>`); }
function openMenu(){ openModal(`<h2>메뉴</h2><div class="menu-list"><button class="btn" onclick="openAccount()">내 계정 (${Account.id})</button><button class="btn" onclick="showHelp()">게임 방법</button><button class="btn" onclick="openLog()">기록</button><button class="btn danger" onclick="if(confirm('정말 이 프로필을 처음부터 다시 시작할까요?')){DB.profiles[DB.current]=newProfile(S.name);S=DB.profiles[DB.current];refreshHUD();closeModal();toast('새로 시작했어요!')}">처음부터 다시</button><button class="btn" onclick="closeModal()">닫기</button></div>`); }
function showHelp(){ openModal(`<h2>게임 방법</h2><div class="help"><p><b>메인 화면</b>에서 추천 팩을 바로 사거나, 오른쪽 타일로 상점·카드북·트레이드·대결·용돈 상자에 들어가요. 창은 <b>Esc</b>로 닫아요.</p><p><b>카드 상인</b> 대회별 스티커팩을 사고 직접 뜯어요. 카드북에서 카드를 눌러 상인에게 팔 수도 있어요 (시세의 60%).</p><p><b>카드북</b> 모은 카드를 보고, 도감에서 빠진 번호를 확인해요.</p><p><b>교환 테이블</b> 친구 민준·서연·지호와 카드를 1:1로 바꿔요. 친구가 좋아하는 팀 카드는 더 높게 쳐줘요.</p><p><b>대결 테이블</b> 카드 5장으로 5라운드 대결! 능력치 + 포지션 보너스 + 주사위로 승부해요. 이기면 상금과 보너스 카드.</p><p><b>용돈 상자</b> 하루 한 번 용돈 30,000원.</p><p><b>팩 종류</b> 월드컵 2026(조별 12종 + 스페셜·히스토리 + 토너먼트 에디션 6종), 월드컵 2018(조별 8종), 월드컵 2014(조별 8종).</p><p class="muted small">진행 상황은 이 브라우저에 자동 저장돼요. 프로필을 여러 개 만들어 형제·친구와 번갈아 할 수 있어요.</p></div><button class="btn" onclick="closeModal()">닫기</button>`); }
function openProfiles(){ return openAccount(); }
function _openProfilesOld(){
  openModal(`<h2>누가 놀까요?</h2><div class="profile-list">${DB.profiles.map((p,i)=>`<div class="profile ${i===DB.current?'sel':''}" onclick="selectProfile(${i})"><div class="p-face"></div><div><b>${p.name}</b><div class="muted small">${fmt(p.money)} · ${cardCount(p)}장</div></div></div>`).join('')}</div>
    <div class="row"><input id="new-name" placeholder="새 프로필 이름" maxlength="8"><button class="btn primary" onclick="const n=document.getElementById('new-name').value.trim();if(n){DB.profiles.push(newProfile(n));selectProfile(DB.profiles.length-1)}">만들기</button></div>
    ${DB.profiles.length>1?`<button class="btn danger small" onclick="if(confirm('현재 프로필 '+S.name+'을(를) 삭제할까요?')){DB.profiles.splice(DB.current,1);DB.current=0;S=DB.profiles[0];refreshHUD();openProfiles()}">현재 프로필 삭제</button>`:''}`);
  setTimeout(()=>{const el=document.getElementById('new-name'); if(el&&!DB.profiles.length) el.focus();},50);
}
function selectProfile(i){ DB.current=i; S=DB.profiles[i]; refreshHUD(); closeModal(); toast(`${S.name}, 어서 와!`); }
async function bootstrap(){
  load(); // 이전 버전(프로필 방식) 로컬 저장 → 가입 시 가져오기용
  initMap(); setSyncState('pending');
  await initCloud();
  let p=null; try{ p=await accountResume(); }catch(e){ console.warn(e); }
  if(p) startWith(p); else openAuth(localStorage.getItem(LAST_KEY)?'login':'join');
}
window.addEventListener('DOMContentLoaded',bootstrap);
