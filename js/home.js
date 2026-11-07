/* ====== 메인 화면 (대시보드) ====== */
const game={keys:{}};
function initMap(){
  document.getElementById('brand').innerHTML=MARK+'<span>KICK OFF 27</span>';
  window.addEventListener('keydown',e=>{ if(e.key==='Escape'&&ui.modalOpen&&!(document.activeElement&&document.activeElement.tagName==='INPUT')) closeModal(); });
  renderHome();
}
function featuredPacks(){
  const seed=parseInt(todayStr().replace(/-/g,''),10);
  const groups=SETS.filter(s=>s.group&&s.id.startsWith('WC26'));
  const g1=groups[seed%groups.length], g2=groups[(seed*7+3)%groups.length];
  const olds=SETS.filter(s=>s.id.startsWith('WC14')||s.id.startsWith('WC18'));
  const o=olds[(seed*3)%olds.length];
  const eds=SETS.filter(s=>s.id.startsWith('ED')); const e=eds[seed%eds.length];
  return [g1,o];
}
function renderHome(){
  if(!S) return;
  const fp=featuredPacks();
  document.getElementById('home-packs').innerHTML=fp.map((s,i)=>`<div class="pack" onclick="shopSel=findPack('${s.id}');shopCat=shopSel.cat;renderShop()">${i===0?'<div class="tag">오늘의 추천</div>':''}<div class="pack-svg">${packSVG(s,72)}</div><div class="pn">${s.short}</div><div class="pr">${fmt(s.price)}</div></div>`).join('');
  const rec=(S.recent||[]).slice(0,6).map(id=>CARDS[id]).filter(Boolean);
  document.getElementById('home-recent').innerHTML=rec.length?rec.map(c=>`<div class="rc" onclick="cardDetail('${c.id}','closeModal')">${cardSVG(c,100)}<div class="nm">${c.name}</div></div>`).join(''):'<div class="empty">아직 뽑은 카드가 없어요</div>';
  const mine=myCards(); const total=mine.reduce((a,c)=>a+c.price*S.cards[c.id],0);
  const legends=mine.filter(c=>c.rar==='L').length, golds=mine.filter(c=>c.rar==='G').length;
  document.getElementById('home-summary').innerHTML=`<div><div class="k">보유 카드</div><div class="v">${cardCount(S)}장</div></div><div><div class="k">카드 종류</div><div class="v">${mine.length}종</div></div><div><div class="k">총 시세</div><div class="v">${Math.round(total/10000).toLocaleString()}만원</div></div><div><div class="k">레전드</div><div class="v">${legends}장</div></div><div><div class="k">골드</div><div class="v">${golds}장</div></div><div><div class="k">개봉한 팩</div><div class="v">${S.stats.packs}개</div></div>`;
  document.getElementById('tile-shop').textContent=`${PACKS.length}종 · 카테고리 5개`;
  document.getElementById('tile-book').textContent=`${mine.length}종 · 정렬·일괄 판매`;
  try{ renderClubPanels(); }catch(e){ console.error(e); }
  const can=S.lastAllowance!==todayStr();
  document.getElementById('tile-bank').innerHTML=can?'<span class="dot"></span>받을 수 있어요':'내일 다시';
  if(typeof boxLeft==='function'){ const bl=boxLeft(); document.getElementById('tile-box').innerHTML=bl>0?`<span class="dot"></span>오늘 ${bl}번 남음`:'오늘은 다 열었어요'; document.getElementById('tile-admin').style.display=isAdmin()&&famOn()?'':'none'; }
}
