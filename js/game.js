/* ====== 게임 상태 / 저장 ====== */
const SAVE_KEY='soccer-card-shop-v1';
let DB={profiles:[],current:-1};
let S=null; // 현재 프로필
const ui={modalOpen:false};
const fmt=n=>n.toLocaleString('ko-KR')+'원';
const todayStr=()=>{ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
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
const rpick=a=>a[Math.floor(Math.random()*a.length)];
function pullPack(set,starter){
  const out=[];
  if(set.draw) return set.draw();
  if(set.style==='icon'){ const n=set.iconN||1; for(let i=0;i<6-n;i++) out.push(rpick(POOL.fill)); for(let i=0;i<n;i++) out.push(rpick(set.cards)); return out; }
  for(let i=0;i<6;i++){
    let rar=weightedRarity(i===5?'R':'C'); if(starter&&i<5) rar='C';
    let pool=set.cards.filter(c=>c.rar===rar); if(!pool.length) pool=set.cards;
    if(i===5&&set.guar) pool=set.cards.filter(set.guar);
    out.push(pool[Math.floor(Math.random()*pool.length)]);
  }
  return out;
}
/* ====== 팩 카탈로그 (카테고리 · 가상 팩) ====== */
const POOL={}; let PACKS=[];
function buildCatalog(){
  const all=Object.values(CARDS);
  const base=all.filter(c=>isPlayerCard(c)&&!c.edition&&!c.icon&&!c.ultra);
  POOL.icon=all.filter(c=>c.icon); POOL.fill=base.filter(c=>c.rar==='G'||c.rar==='H');
  POOL.ultra=all.filter(c=>c.ultra); POOL.legend=base.filter(c=>c.rar==='L'); POOL.gold=base.filter(c=>c.rar==='G');
  POOL.hg=base.filter(c=>c.rar==='H'||c.rar==='G'); POOL.kor=base.filter(c=>c.nat==='KOR'); POOL.star=base.filter(c=>c.rating>=85);
  const byRar=(pool,minR)=>{ const r=weightedRarity(minR); let p=pool.filter(c=>c.rar===r); if(!p.length) p=pool.filter(c=>'CRHGL'.indexOf(c.rar)>='CRHGL'.indexOf(minR||'C')); return rpick(p.length?p:pool); };
  const ICON=SETS.find(s=>s.id==='ICON');
  const ip=(id,name,short,pool,n,theme)=>({id,name,short,style:'icon',iconN:n||1,cards:pool,theme:theme||ICON.theme,virtual:true,cat:'icon',sub:'아이콘 팩'});
  const vp=(id,name,short,pool,draw,theme,sub)=>({id,name,short,cards:pool,draw,theme,virtual:true,cat:'special',sub:sub||'스페셜 팩'});
  const V=[
    ip('VICFW','아이콘 공격수 팩 (공격수 아이콘 1장)','아이콘 공격수',POOL.icon.filter(c=>c.pos==='FW'),1,['#c9a227','#3a1d0b']),
    ip('VICMF','아이콘 미드필더 팩 (미드필더 아이콘 1장)','아이콘 미드필더',POOL.icon.filter(c=>c.pos==='MF'),1,['#c9a227','#0b2a3a']),
    ip('VICDF','아이콘 수비·골키퍼 팩 (수비수/GK 아이콘 1장)','아이콘 수비·GK',POOL.icon.filter(c=>c.pos==='DF'||c.pos==='GK'),1,['#c9a227','#13321c']),
    ip('VICPR','프라임 아이콘 팩 (능력치 92+ 아이콘 1장)','프라임 아이콘',POOL.icon.filter(c=>c.rating>=92),1,['#f3d36b','#1a1a1a']),
    ip('VIC2','아이콘 더블 팩 (아이콘 2장)','아이콘 더블',POOL.icon,2,['#d4af37','#5a0e0e']),
    vp('VULT','울트라 레어 팩 (울트라 카드 1장 보장)','울트라 레어',POOL.ultra,()=>[...Array(5)].map(()=>rpick(POOL.hg)).concat([rpick(POOL.ultra)]),['#c6f24e','#10220a']),
    vp('VLEG','레전드 팩 (레전드 카드 1장 보장)','레전드',POOL.legend,()=>[...Array(5)].map(()=>rpick(POOL.hg)).concat([rpick(POOL.legend)]),['#a3e635','#1f2a0b']),
    vp('VGOLD','골드 팩 (6장 모두 골드)','골드 6장',POOL.gold,()=>[...Array(6)].map(()=>rpick(POOL.gold)),['#e5a93b','#3a2606']),
    vp('VSTAR','올스타 팩 (능력치 85+ 선수만)','올스타 85+',POOL.star,()=>[...Array(6)].map((_,i)=>byRar(POOL.star,i===5?'H':'C')),['#4cb3f0','#0b1e3a']),
    vp('VKOR','대한민국 팩 (2014·2018·2026 한국 선수)','대한민국',POOL.kor,()=>[...Array(6)].map((_,i)=>byRar(POOL.kor,i===5?'R':'C')),['#d6001c','#0b2a6b'],'국가 팩'),
  ].filter(p=>p.cards.length);
  const evOf=p=>{ let t=0; const N=300; for(let i=0;i<N;i++) t+=pullPack(p).reduce((a,c)=>a+c.price,0); return t/N; };
  const ratio=ICON.price/evOf(ICON);
  V.forEach(p=>{ p.ev=Math.round(evOf(p)); p.price=Math.ceil((p.cat==='icon'?p.ev*ratio:p.ev*1.15)/5000)*5000; p.year=0; });
  const catOf=s=>s.id==='ICON'?'icon':s.year===2026?'wc26':s.year===2018?'wc18':s.year===2014?'wc14':'special';
  const subOf=s=>s.id==='ICON'?'아이콘 팩':s.group?'조별 팩':/XI/.test(s.id)?'베스트 XI':s.id==='WC26SPC'||s.id==='WC26HIS'?'스페셜 · 히스토리':'토너먼트 에디션';
  SETS.forEach(s=>{ s.cat=catOf(s); s.sub=subOf(s); });
  PACKS=[...SETS,...V];
}
const PACK_CATS=[{k:'wc26',n:'월드컵 2026'},{k:'wc18',n:'월드컵 2018'},{k:'wc14',n:'월드컵 2014'},{k:'icon',n:'아이콘'},{k:'special',n:'스페셜'}];
const findPack=id=>PACKS.find(p=>p.id===id);
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
  <text x="${w/2}" y="${h*0.88}" font-size="${w*0.085}" text-anchor="middle" font-family="Inter, sans-serif" fill="#fff" opacity=".8">카드 6장</text></svg>`; }
function openShop(){ if(!PACKS.length) buildCatalog(); shopSel=shopSel||PACKS[0]; shopCat=shopSel.cat||'wc26'; renderShop(); }
let shopCat='wc26';
function renderShop(){
  if(!PACKS.length) buildCatalog(); if(!shopSel||!shopSel.cat) shopSel=findPack((shopSel||{}).id)||PACKS[0];
  const q=shopFilter.trim(); const list=q?PACKS.filter(s=>s.name.includes(q)||s.short.includes(q)):PACKS.filter(s=>s.cat===shopCat);
  const subs=[...new Set(list.map(s=>s.sub))];
  const item=s=>`<div class="pack-item ${shopSel.id===s.id?'sel':''}" onclick="shopSel=findPack('${s.id}');renderShop()">${packSVG(s,64)}<div class="pi-name">${s.short}</div><div class="pi-price">${fmt(s.price)}</div></div>`;
  const owned=shopSel.cards.filter(c=>S.cards[c.id]).length; const can=S.money>=shopSel.price;
  openModal(`<div class="shop2">
    <div class="shop-cats">${PACK_CATS.map(c=>`<button class="cat ${!q&&shopCat===c.k?'on':''}" onclick="shopCat='${c.k}';shopFilter='';renderShop()"><em class="full">${c.n}</em><em class="short">${c.n.replace('월드컵 ','')}</em><span>${PACKS.filter(p=>p.cat===c.k).length}</span></button>`).join('')}
      <input id="shop-search" placeholder="팩 검색" value="${esc(shopFilter)}" oninput="shopFilter=this.value;renderShop();const e=document.getElementById('shop-search');e.focus();e.setSelectionRange(e.value.length,e.value.length)"></div>
    <div class="shop-list">${subs.map(sb=>`<h3>${sb}</h3><div class="pack-grid">${list.filter(s=>s.sub===sb).map(item).join('')}</div>`).join('')||'<div class="empty">검색 결과가 없어요</div>'}</div>
    <div class="shop-buy"><div class="pack-big">${packSVG(shopSel,130)}</div><h2>${shopSel.name}</h2>
      <div class="kv"><span>카드 종류</span><b>${shopSel.cards.length}종 · ${owned}종 보유</b></div>
      <div class="kv"><span>평균 시세</span><b>${fmt(shopSel.ev)}</b></div>
      <div class="kv"><span>가격</span><b class="big">${fmt(shopSel.price)}</b></div>
      <div class="kv"><span>구매 후 잔액</span><b class="${can?'':'neg'}">${fmt(S.money-shopSel.price)}</b></div>
      <button class="btn primary big" ${can?'':'disabled'} onclick="buyPack()">구매하기</button>
      <div class="row" style="justify-content:center;margin-top:6px"><button class="btn link" onclick="showOdds()">확률</button><button class="btn link" onclick="closeModal()">닫기</button></div>
    </div></div>`,'wide');
}
function showOdds(){ const p=shopSel; const custom=p.virtual||p.style==='icon';
  openModal(`<h2>개봉 확률</h2>${custom?`<p>${p.name}</p><p class="muted">6장 중 보장 카드 외 나머지는 홀로·골드 등급 위주로 나와요.</p>`:`<p class="muted">카드 1장당 등급 확률 · 6번째 카드는 레어 이상</p><table class="tbl">${Object.entries(RARITY).filter(([k])=>k!=='I').map(([k,r])=>`<tr><td><span class="rar-dot" style="background:${r.color}"></span>${r.n}</td><td>${r.odds}%</td></tr>`).join('')}</table>`}<button class="btn" onclick="renderShop()">돌아가기</button>`); }
let opening=null;
function buyPack(){
  if(!econOK()) return; if(S.money<shopSel.price) return; S.money-=shopSel.price; S.stats.packs++;
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
let bk={page:0,filter:'',set:'',sort:'rating',dir:-1,sel:null};
function myCards(){ return Object.keys(S.cards).map(id=>CARDS[id]).filter(Boolean); }
function openBinder(){ bk.page=0; bk.sel=null; renderBinder(); }
function setOptions(cur){ if(!PACKS.length) buildCatalog(); return PACK_CATS.map(c=>`<optgroup label="${c.n}">${SETS.filter(s=>s.cat===c.k).map(s=>`<option value="${s.id}" ${cur===s.id?'selected':''}>${s.short}</option>`).join('')}</optgroup>`).join(''); }
function binderList(){
  let cards=myCards();
  if(bk.set) cards=cards.filter(c=>c.set===bk.set);
  if(bk.filter) cards=cards.filter(c=>c.name.includes(bk.filter)||c.id.includes(bk.filter.toUpperCase())||NATIONS[c.nat].n.includes(bk.filter));
  const key={set:c=>c.id,rating:c=>c.rating,price:c=>c.price,rar:c=>'CRHGLI'.indexOf(c.rar)*1000+c.rating,count:c=>S.cards[c.id]}[bk.sort];
  cards.sort((a,b)=>{ const x=key(a),y=key(b); return (typeof x==='string'?x.localeCompare(y):x-y)*bk.dir||a.id.localeCompare(b.id); });
  return cards;
}
function squadIds(){ try{ return new Set(squadOf().slots.filter(Boolean)); }catch(e){ return new Set(); } }
const sellPrice=c=>Math.round(c.price*0.6/100)*100;
function selTotal(){ let n=0,v=0; Object.entries(bk.sel||{}).forEach(([id,q])=>{ n+=q; v+=sellPrice(CARDS[id])*q; }); return {n,v}; }
function selMax(id){ return S.cards[id]-(squadIds().has(id)?1:0); }
function binderTap(id){ if(!bk.sel) return cardDetail(id,'renderBinder'); const m=selMax(id); if(m<=0) return toast('스쿼드에 있는 카드라 마지막 1장은 팔 수 없어요'); if(bk.sel[id]) delete bk.sel[id]; else bk.sel[id]=m; renderBinder(); }
function binderSelect(mode){ bk.sel=bk.sel||{}; const list=binderList(); if(mode==='none') bk.sel={}; else list.forEach(c=>{ const m=mode==='dup'?Math.min(selMax(c.id),S.cards[c.id]-1):selMax(c.id); if(m>0) bk.sel[c.id]=m; else delete bk.sel[c.id]; }); renderBinder(); }
function sellSelected(){ if(!econOK()) return; const t=selTotal(); if(!t.n) return toast('선택한 카드가 없어요'); if(!confirm(`${t.n}장을 ${fmt(t.v)}에 팔까요?`)) return;
  Object.entries(bk.sel).forEach(([id,q])=>{ q=Math.min(q,selMax(id)); if(q>0){ removeCard(S,id,q); S.money+=sellPrice(CARDS[id])*q; } });
  logIt(`카드 ${t.n}장 일괄 판매 (+${fmt(t.v)})`); bk.sel={}; refreshHUD(); toast(`${t.n}장을 ${fmt(t.v)}에 팔았어요`); renderBinder(); }
function renderBinder(){
  const cards=binderList(); const per=bk.sel?24:12, pages=Math.max(1,Math.ceil(cards.length/per)); bk.page=Math.min(bk.page,pages-1);
  const pg=cards.slice(bk.page*per,bk.page*per+per); const sel=bk.sel||{};
  const slot=c=>c?`<div class="slot ${sel[c.id]?'picked':''}" onclick="binderTap('${c.id}')">${cardSVG(c,110)}<div class="cnt">×${S.cards[c.id]}</div>${sel[c.id]?`<div class="pick">${sel[c.id]}장</div>`:''}<div class="sn">${c.name}</div><div class="sv">${c.rating} · ${fmt(c.price)}</div></div>`:'<div class="slot empty"></div>';
  const body=bk.sel?`<div class="page sel-grid">${pg.map(slot).join('')}</div>`:`<div class="binder-book"><div class="page">${Array.from({length:6},(_,i)=>slot(pg[i])).join('')}</div><div class="page">${Array.from({length:6},(_,i)=>slot(pg[i+6])).join('')}</div></div>`;
  const totalVal=myCards().reduce((a,c)=>a+c.price*S.cards[c.id],0); const t=selTotal();
  openModal(`<div class="binder"><div class="binder-head"><div><h2>카드북</h2><div class="muted">${cardCount(S)}장 · ${myCards().length}종 · 총 시세 ${fmt(totalVal)}</div></div>
    <div class="binder-tools"><input id="bk-search" placeholder="이름 · 국가 검색" value="${esc(bk.filter)}" oninput="bk.filter=this.value;bk.page=0;renderBinder();const e=document.getElementById('bk-search');e.focus();e.setSelectionRange(e.value.length,e.value.length)">
    <select onchange="bk.set=this.value;bk.page=0;renderBinder()"><option value="">모든 팩</option>${setOptions(bk.set)}</select>
    <select onchange="bk.sort=this.value;renderBinder()">${[['rating','능력치'],['price','시세'],['rar','등급'],['count','보유 수'],['set','번호']].map(([v,n])=>`<option value="${v}" ${bk.sort===v?'selected':''}>${n}</option>`).join('')}</select>
    <button class="btn" onclick="bk.dir*=-1;renderBinder()">${bk.dir<0?'내림차순 ↓':'오름차순 ↑'}</button>
    <button class="btn ${bk.sel?'primary':''}" onclick="bk.sel=bk.sel?null:{};renderBinder()">${bk.sel?'선택 종료':'일괄 선택'}</button></div></div>
    ${bk.sel?`<div class="selbar"><button class="chip" onclick="binderSelect('all')">전체 선택</button><button class="chip" onclick="binderSelect('dup')">중복만 선택</button><button class="chip" onclick="binderSelect('none')">선택 해제</button><span class="muted">${t.n}장 · ${fmt(t.v)}</span><button class="btn primary" ${t.n?'':'disabled'} onclick="sellSelected()">선택 판매</button></div>`:''}
    ${body}
    <div class="binder-foot"><button class="btn" ${bk.page===0?'disabled':''} onclick="bk.page--;renderBinder()">이전</button><span class="muted">${bk.page+1} / ${pages} · ${cards.length}종</span><button class="btn" ${bk.page>=pages-1?'disabled':''} onclick="bk.page++;renderBinder()">다음</button></div>
    <div class="row right"><button class="btn" onclick="openCollection()">도감</button><button class="btn" onclick="closeModal()">닫기</button></div></div>`,'wide');
}
function openCollection(){
  const set=SETS.find(s=>s.id===(bk.set||SETS[0].id));
  openModal(`<div class="binder"><div class="binder-head"><div><h2>도감 · ${set.name}</h2><div class="muted">${set.cards.filter(c=>S.cards[c.id]).length} / ${set.cards.length}종 수집</div></div>
    <select onchange="bk.set=this.value;openCollection()">${setOptions(set.id)}</select></div>
    <div class="dex">${set.cards.map(c=>`<div class="dex-item ${S.cards[c.id]?'':'missing'}" onclick="${S.cards[c.id]?`cardDetail('${c.id}','openCollection')`:''}"><span class="dex-no">${String(c.no).padStart(3,'0')}</span><span class="rar-dot" style="background:${RARITY[c.rar].color}"></span>${c.name}<span class="muted small">${NATIONS[c.nat].n}</span></div>`).join('')}</div>
    <div class="row right"><button class="btn" onclick="renderBinder()">카드북으로</button></div></div>`,'wide');
}
function cardDetail(id,back){
  const c=CARDS[id]; const sell=Math.round(c.price*0.6/100)*100; const set=SETS.find(s=>s.id===c.set);
  openModal(`<div class="detail"><div class="detail-card rar-${c.rar}">${cardSVG(c,240)}</div><div class="detail-info"><div class="muted">${set.name}</div><h2>${c.name}</h2>
    <div class="muted">${String(c.no).padStart(3,'0')}/${c.total} · <span style="color:${RARITY[c.rar].color};font-weight:bold">${RARITY[c.rar].n}</span></div>
    <div class="stat-row"><span>국가</span><b>${NATIONS[c.nat].n}</b></div><div class="stat-row"><span>포지션</span><b>${c.pp?`${c.pp[0]} <span class="muted small">${POS_KO[c.pp[0]]}</span>${c.pp.length>1?` · 서브 ${c.pp.slice(1).join(', ')}`:''}`:POS_KO[c.pos]}</b></div><div class="stat-row"><span>능력치</span><b>${c.rating}</b></div>${c.dob?`<div class="stat-row"><span>생년월일</span><b>${c.dob.split('-').reverse().join('.')}</b></div><div class="stat-row"><span>키 / 몸무게</span><b>${c.h.replace(',','.')} m / ${c.w} kg</b></div>`:''}${c.kind==='player'||!c.kind?attrHTML(c):''}${c.edition?`<div class="stat-row"><span>에디션</span><b>${EDITION_INFO[c.edition].n}</b></div>`:''}${c.award?`<div class="stat-row"><span>수상</span><b>${c.award}</b></div>`:''}${c.club?`<div class="stat-row"><span>소속 클럽</span><b style="font-size:12px">${c.club}</b></div>`:''}<div class="stat-row"><span>보유</span><b>${S.cards[c.id]||0}장</b></div><div class="stat-row"><span>시세</span><b>${fmt(c.price)}</b></div>
    <div class="row"><button class="btn" onclick="${back}()">돌아가기</button>${S.cards[c.id]?`<button class="btn primary" onclick="sellCard('${c.id}','${back}')">상인에게 판매 (${fmt(sell)})</button>`:''}</div></div></div>`);
}
function sellCard(id,back){ if(!econOK()) return; const c=CARDS[id]; if(!S.cards[id]) return; if(S.cards[id]<=1&&squadIds().has(id)) return toast('스쿼드에 있는 카드예요. 스쿼드에서 빼고 팔아 주세요'); const sell=Math.round(c.price*0.6/100)*100; removeCard(S,id); S.money+=sell; logIt(`${c.name} 카드 판매 (+${fmt(sell)})`); refreshHUD(); toast(`${c.name} 카드를 ${fmt(sell)}에 팔았어요`); if(S.cards[id]) cardDetail(id,back); else window[back](); }
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
  const pick=(c,who,sel,cnt)=>`<div class="mini-card ${sel?'sel':''}" onclick="tr.${who}='${c.id}';renderTrade()">${cardSVG(c,96)}<div class="mc-name">${c.name}</div><div class="mc-sub"><b>${c.rating}</b> ${isPlayerCard(c)?posStr(c):''}</div><div class="mc-sub">${fmt(c.price)}${cnt?` · ×${cnt}`:''}${f.likes.includes(c.nat)&&who==='mine'?' · 선호':''}</div></div>`;
  openModal(`<div class="trade"><div class="trade-col"><h3>내 카드</h3><div class="card-grid small">${mine.map(c=>pick(c,'mine',tr.mine===c.id,S.cards[c.id])).join('')}</div></div>
    <div class="trade-mid"><div class="f-avatar big" style="background:${f.avatar[0]}">${f.name[0]}</div><b>${f.name}</b><div class="bubble small">${msg||(tr.mine&&tr.theirs?(ok?'좋아, 바꾸자!':'음… 내 카드가 더 좋은 것 같은데?'):'바꿀 카드를 하나씩 골라 봐.')}</div>
      <div class="trade-slots"><div class="tslot">${tr.mine?cardSVG(CARDS[tr.mine],90):'<div class="muted small">내 카드</div>'}</div><div class="arrow">⇄</div><div class="tslot">${tr.theirs?cardSVG(CARDS[tr.theirs],90):'<div class="muted small">친구 카드</div>'}</div></div>
      <div class="muted small">${f.name}이(가) 좋아하는 팀: ${f.likes.map(n=>NATIONS[n].n).join(', ')} (더 높게 쳐줘요)</div>
      <button class="btn primary" ${ok?'':'disabled'} onclick="doTrade()">교환 제안하기</button><button class="btn" onclick="openTradeLobby('npc')">다른 친구</button><button class="btn" onclick="closeModal()">닫기</button></div>
    <div class="trade-col"><h3>${f.name}의 카드</h3><div class="card-grid small">${theirs.map(c=>pick(c,'theirs',tr.theirs===c.id)).join('')}</div></div></div>`,'wide');
}
function doTrade(){
  if(!econOK()) return; const f=tr.friend; const m=CARDS[tr.mine], t=CARDS[tr.theirs];
  removeCard(S,m.id); addCard(S,t.id); const arr=S.friends[f.id]; arr.splice(arr.indexOf(t.id),1); arr.push(m.id);
  S.stats.trades++; logIt(`${f.name}과(와) 교환: ${m.name} → ${t.name}`); refreshHUD(); toast(`${t.name} 카드를 받았어요!`);
  tr.mine=null; tr.theirs=null; renderTrade(`고마워! ${m.name} 카드 갖고 싶었어.`);
}
/* (대결 → match.js 축구 시뮬레이션으로 대체) */
/* ====== 기록 / 메뉴 / 프로필 ====== */
function openClubHistory(){ const c=clubOf(); openModal(`<h2>${c.name} 시즌 기록</h2><div class="loglist">${c.history.map(h=>`<div>시즌 ${h.season} · ${TIER_NAME[h.tier]} ${h.rank}위 · 승점 ${h.pts}</div>`).join('')||'<div class="muted">아직 끝난 시즌이 없어요</div>'}</div><div class="muted small">통산 전적 ${S.stats.wins}승 ${S.stats.battles-S.stats.wins}무·패 · 리그 우승 ${c.trophies.league} · 컵 우승 ${c.trophies.cup}</div><div class="row right"><button class="btn" onclick="closeModal()">닫기</button></div>`); }
function openLog(){ openModal(`<h2>기록</h2><div class="muted">팩 ${S.stats.packs}개 개봉 · 대결 ${S.stats.wins}승 ${S.stats.battles-S.stats.wins}패 · 교환 ${S.stats.trades}회</div><div class="loglist">${S.log.map(l=>`<div><span class="muted small">${l.t}</span> ${l.m}</div>`).join('')||'<div class="muted">아직 기록이 없어요</div>'}</div><button class="btn" onclick="closeModal()">닫기</button>`); }
function openMenu(){ openModal(`<h2>메뉴</h2><div class="menu-list"><button class="btn" onclick="openAccount()">내 계정 (${Account.id})</button><button class="btn" onclick="showHelp()">게임 방법</button><button class="btn" onclick="openLog()">기록</button><button class="btn" onclick="openRandomBox()">랜덤박스</button>${isAdmin()&&famOn()?'<button class="btn" onclick="openAdmin()">관리자</button>':''}<button class="btn danger" onclick="if(confirm('정말 이 프로필을 처음부터 다시 시작할까요?')){DB.profiles[DB.current]=newProfile(S.name);S=DB.profiles[DB.current];refreshHUD();closeModal();toast('새로 시작했어요!')}">처음부터 다시</button><button class="btn" onclick="closeModal()">닫기</button></div>`); }
function showHelp(){ openModal(`<h2>KICK OFF 27 게임 방법</h2><div class="help">
<p><b>카드팩</b> 월드컵 2026 · 2018 · 2014 · 아이콘 · 스페셜 카테고리에서 팩을 사서 뜯어요.</p>
<p><b>카드북</b> 정렬(능력치·시세·등급, 오름/내림)하고, <b>일괄 선택</b>으로 여러 장을 한 번에 팔 수 있어요(시세의 60%).</p>
<p><b>스쿼드</b> 11명을 급여 한도 안에서 골라요. 포지션이 맞을수록 능력치가 그대로 나와요.</p>
<p><b>패밀리 리그</b> 가족 계정끼리 매주(월~일) 상대마다 하루 1경기. 일요일 순위로 상금.</p>
<p><b>연습 리그 · FA컵</b> AI 팀과 경기해서 돈을 벌어요.</p>
<p><b>트레이드 · 랜덤박스 · 용돈</b> 카드 교환, 하루 3번 랜덤박스, 하루 1번 용돈.</p>
</div><button class="btn" onclick="closeModal()">닫기</button>`); }
function openProfiles(){ return openAccount(); }
function _openProfilesOld(){
  openModal(`<h2>누가 놀까요?</h2><div class="profile-list">${DB.profiles.map((p,i)=>`<div class="profile ${i===DB.current?'sel':''}" onclick="selectProfile(${i})"><div class="p-face"></div><div><b>${p.name}</b><div class="muted small">${fmt(p.money)} · ${cardCount(p)}장</div></div></div>`).join('')}</div>
    <div class="row"><input id="new-name" placeholder="새 프로필 이름" maxlength="8"><button class="btn primary" onclick="const n=document.getElementById('new-name').value.trim();if(n){DB.profiles.push(newProfile(n));selectProfile(DB.profiles.length-1)}">만들기</button></div>
    ${DB.profiles.length>1?`<button class="btn danger small" onclick="if(confirm('현재 프로필 '+S.name+'을(를) 삭제할까요?')){DB.profiles.splice(DB.current,1);DB.current=0;S=DB.profiles[0];refreshHUD();openProfiles()}">현재 프로필 삭제</button>`:''}`);
  setTimeout(()=>{const el=document.getElementById('new-name'); if(el&&!DB.profiles.length) el.focus();},50);
}
function selectProfile(i){ DB.current=i; S=DB.profiles[i]; refreshHUD(); closeModal(); toast(`${S.name}, 어서 와!`); }
async function bootstrap(){
  buildCatalog(); load(); // 이전 버전(프로필 방식) 로컬 저장 → 가입 시 가져오기용
  initMap(); setSyncState('pending');
  await initCloud();
  let p=null; try{ p=await accountResume(); }catch(e){ console.warn(e); }
  if(p) startWith(p); else openAuth(localStorage.getItem(LAST_KEY)?'login':'join');
}
window.addEventListener('DOMContentLoaded',bootstrap);
