/* ====== 랜덤박스 · 관리자 일괄 지급 ====== */
const BOX_PER_DAY=3, ADMIN_ID='hyun';
function isAdmin(){ return Account.id===ADMIN_ID; }
function boxLeft(){ if(S.boxDay!==todayStr()){ S.boxDay=todayStr(); S.boxCount=0; } return BOX_PER_DAY-(S.boxCount||0); }
function boxPool(min,max,ultra){ return Object.values(CARDS).filter(c=>(c.kind==='player'||!c.kind)&&(ultra?c.ultra:(!c.edition&&c.rating>=min&&c.rating<=max))); }
function rollBox(){
  const r=Math.random(); const rnd=(a,b)=>Math.round((a+Math.random()*(b-a))/1000)*1000;
  if(r<0.50) return {money:rnd(10000,30000),tier:'보통'};
  if(r<0.72) return {money:rnd(30000,60000),tier:'좋음'};
  if(r<0.82) return {money:rnd(60000,100000),tier:'대박'};
  let pool,tier;
  if(r<0.92){ pool=boxPool(80,84); tier='카드 80+'; }
  else if(r<0.97){ pool=boxPool(85,89); tier='카드 85+'; }
  else if(r<0.995){ pool=boxPool(90,99); tier='카드 90+'; }
  else { pool=boxPool(0,0,true); tier='울트라 카드'; }
  if(!pool.length) pool=boxPool(80,99);
  return {card:pool[Math.floor(Math.random()*pool.length)],tier};
}
function openRandomBox(){
  const left=boxLeft();
  openModal(`<div class="open-stage"><h2>랜덤박스</h2><p class="muted">하루 ${BOX_PER_DAY}번. 돈(1만~10만원) 또는 능력치 80 이상 카드가 나와요. 좋은 것일수록 확률이 낮아요.</p>
    <div class="box-wrap" id="box-wrap" onclick="shakeBox()"><div class="box"><div class="box-lid"></div><div class="box-body">?</div></div></div>
    <table class="tbl" style="max-width:360px"><tr><td>돈 1~3만원</td><td>50%</td></tr><tr><td>돈 3~6만원</td><td>22%</td></tr><tr><td>돈 6~10만원</td><td>10%</td></tr><tr><td>카드 80~84</td><td>10%</td></tr><tr><td>카드 85~89</td><td>5%</td></tr><tr><td>카드 90+</td><td>2.5%</td></tr><tr><td>울트라 카드</td><td>0.5%</td></tr></table>
    <div class="muted small">오늘 남은 횟수 ${left}/${BOX_PER_DAY}</div>
    <div class="row"><button class="btn primary big" ${left>0?'':'disabled'} onclick="shakeBox()">${left>0?'상자 열기':'오늘은 다 열었어요'}</button><button class="btn" onclick="closeModal()">닫기</button></div></div>`);
}
function shakeBox(){
  if(boxLeft()<=0) return; const el=document.getElementById('box-wrap'); if(!el||el.classList.contains('shaking')) return; el.classList.add('shaking');
  S.boxCount=(S.boxCount||0)+1; const res=rollBox();
  setTimeout(()=>{
    if(res.money){ S.money+=res.money; logIt(`랜덤박스: ${fmt(res.money)} 획득`); refreshHUD();
      openModal(`<div class="open-stage"><h2>랜덤박스 결과</h2><span class="badge new">${res.tier}</span><div class="box-money">${fmt(res.money)}</div><p class="muted">잔액 ${fmt(S.money)} · 오늘 남은 횟수 ${boxLeft()}/${BOX_PER_DAY}</p>
        <div class="row"><button class="btn primary" ${boxLeft()>0?'':'disabled'} onclick="openRandomBox()">한 번 더</button><button class="btn" onclick="closeModal()">닫기</button></div></div>`);
    } else { const c=res.card; const isNew=!S.cards[c.id]; addCard(S,c.id); S.recent=[c.id,...(S.recent||[])].slice(0,30); logIt(`랜덤박스: ${c.name} 카드 획득 (${fmt(c.price)})`); refreshHUD();
      openModal(`<div class="open-stage"><h2>랜덤박스 결과</h2><span class="badge new">${res.tier}${isNew?' · 새 카드':''}</span><div class="reveal-card flip rar-${c.rar}">${cardSVG(c,230)}</div><h2>${esc(c.name)}</h2><div class="muted">${NATIONS[c.nat].n} ${POS_KO[c.pos]} · 능력치 ${c.rating} · 시세 ${fmt(c.price)}</div><p class="muted small">오늘 남은 횟수 ${boxLeft()}/${BOX_PER_DAY}</p>
        <div class="row"><button class="btn primary" ${boxLeft()>0?'':'disabled'} onclick="openRandomBox()">한 번 더</button><button class="btn" onclick="cardDetail('${c.id}','closeModal')">카드 보기</button><button class="btn" onclick="closeModal()">닫기</button></div></div>`);
    }
    save();
  },900);
}
/* ---- 관리자: 가입자 전원에게 일괄 지급 (Firestore grants 컬렉션) ---- */
async function grantsCheck(){
  if(!famOn()) return; if(!S) return;
  if(!S.grantSeen){ S.grantSeen=Date.now(); save(); return; } // 가입 이후의 지급만 받음
  const qs=await famDB().collection('grants').where('t','>',S.grantSeen).orderBy('t').get();
  let total=0, last=S.grantSeen; qs.forEach(d=>{ const g=d.data(); if(g.amount>0){ S.money+=g.amount; total+=g.amount; logIt(`관리자 지급: ${fmt(g.amount)}${g.note?' · '+g.note:''}`); } last=Math.max(last,g.t); });
  if(total>0){ S.grantSeen=last; refreshHUD(); toast(`관리자가 ${fmt(total)}을 넣어 줬어요!`); save(); }
}
if(typeof famLoad==='function'){ const _famLoad=famLoad; famLoad=async function(){ await _famLoad(); try{ await grantsCheck(); }catch(e){ console.warn('grants',e); } }; }
function openAdmin(){
  if(!isAdmin()) return;
  const clubs=Object.values(Fam.clubs||{});
  openModal(`<h2>관리자</h2><p class="muted">가입된 모든 계정에 같은 금액을 넣어 줘요. 각자 다음 접속(또는 90초 안에) 자동으로 받아요.</p>
    <div class="muted small">가입 계정 ${clubs.length}명: ${clubs.map(c=>esc(c.owner||c.name)).join(', ')||'-'}</div>
    <h3>금액</h3><div class="chips">${[30000,50000,100000,200000,500000].map(v=>`<button class="chip" onclick="document.getElementById('ad-amt').value=${v}">${fmt(v)}</button>`).join('')}</div>
    <div class="row"><input id="ad-amt" type="number" step="1000" placeholder="금액 (원)" style="flex:1"><input id="ad-note" placeholder="메모 (예: 주말 보너스)" style="flex:1"></div>
    <div class="row right"><button class="btn" onclick="closeModal()">닫기</button><button class="btn primary" onclick="adminGrant()">전원에게 지급</button></div>`);
}
async function adminGrant(){
  const amt=parseInt(document.getElementById('ad-amt').value,10); const note=document.getElementById('ad-note').value.trim();
  if(!amt||amt<=0) return toast('금액을 입력해 주세요'); if(amt>5000000) return toast('한 번에 500만원까지만');
  if(!confirm(`가입자 전원에게 ${fmt(amt)}씩 지급할까요?`)) return;
  try{ await famDB().collection('grants').add({amount:amt,note,by:Account.id,t:Date.now()}); toast(`전원에게 ${fmt(amt)} 지급 예약!`); closeModal(); await grantsCheck(); }
  catch(e){ toast('지급 실패: '+e.message); }
}
