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
let HT={tab:'club',sub:'fam'}; try{ const v=JSON.parse(localStorage.getItem('ko27_hometab')||'null'); if(v) HT=Object.assign(HT,v); }catch(e){}
function setHomeTab(t,sub){ if(t) HT.tab=t; if(sub) HT.sub=sub; try{ localStorage.setItem('ko27_hometab',JSON.stringify(HT)); }catch(e){} if(typeof ui!=='undefined'&&ui.modalOpen) closeModal(); applyHomeTab(); window.scrollTo(0,0); }
function applyHomeTab(){ const m=document.getElementById('home-main'); if(!m) return; m.dataset.tab=HT.tab; const pl=document.getElementById('pane-league'); if(pl) pl.dataset.sub=HT.sub;
  document.querySelectorAll('.htab').forEach(b=>b.classList.toggle('on',b.dataset.t===HT.tab)); document.querySelectorAll('.stab').forEach(b=>b.classList.toggle('on',b.dataset.s===HT.sub)); }
function renderClubQuick(){
  const el=document.getElementById('club-quick'); if(!el) return; const err=squadReady(); const rows=[]; let famLeft=0;
  try{ if(famOn()&&Fam.loaded&&!famBanned()){ const tbl=famTable(); const me=tbl.findIndex(r=>r.t.uid===Account.uid); tbl.forEach(r=>{ if(r.t.uid!==Account.uid&&(!r.t.human||r.t.ready)) famLeft+=famGamesLeft(r.t.uid); });
    rows.push(`<div class="qrow"><div class="ell"><div class="muted small">패밀리 리그 · ${seasonLabel(Fam.season)}</div><b>${me>=0?(me+1)+'위':'참가 전'}</b> <span class="muted small">· 남은 경기 ${famLeft}</span></div><button class="btn ${famLeft&&!err?'primary':''}" onclick="setHomeTab('league','fam')">리그 보기</button></div>`); } }catch(e){ console.warn(e); }
  try{ const c=clubOf(); const L=c.league; const st=L?standings(L):[]; const r=st.indexOf('ME'); const left=matchesLeft();
    rows.push(`<div class="qrow"><div class="ell"><div class="muted small">연습 리그 · ${TIER_NAME[c.tier]}</div><b>${r>=0?(r+1)+'위':'-'}</b> <span class="muted small">· 오늘 ${left}/${DAILY_MATCHES}경기</span></div><button class="btn ${left&&!err?'primary':''}" onclick="${left&&!err?'playLeague()':"setHomeTab('league','ai')"}">${left&&!err?'경기하기':'보기'}</button></div>`);
    const C=c.cup; const active=C&&!C.done&&!C.out; const cl=cupLeft();
    rows.push(`<div class="qrow"><div class="ell"><div class="muted small">FA컵</div><b>${active?CUP_ROUNDS[C.round]:C&&C.done?'우승!':C&&C.out?'탈락':'도전 가능'}</b> <span class="muted small">· 오늘 ${cl}/${DAILY_CUP}경기</span></div><button class="btn ${cl&&!err?'primary':''}" onclick="setHomeTab('league','cup')">컵 보기</button></div>`);
    const dl=document.getElementById('hdot-league'); if(dl) dl.classList.toggle('on',!err&&(famLeft>0||left>0||cl>0));
  }catch(e){ console.warn(e); }
  el.innerHTML=(err?`<div class="warn small" style="margin-bottom:8px">${err} — 스쿼드를 먼저 완성해 주세요</div>`:'')+`<div class="qlist">${rows.join('')}</div>`;
}
function renderHome(){
  if(!S) return;
  applyHomeTab();
  const fp=featuredPacks();
  document.getElementById('home-packs').innerHTML=fp.map((s,i)=>`<div class="pack" onclick="shopSel=findPack('${s.id}');shopCat=shopSel.cat;renderShop()">${i===0?'<div class="tag">오늘의 추천</div>':''}<div class="pack-svg">${packSVG(s,72)}</div><div class="pn">${s.short}</div><div class="pr">${fmt(s.price)}</div></div>`).join('');
  const rec=(S.recent||[]).slice(0,6).map(id=>CARDS[id]).filter(Boolean);
  document.getElementById('home-recent').innerHTML=rec.length?rec.map(c=>`<div class="rc" onclick="cardDetail('${c.id}','closeModal')">${cardSVG(c,100)}<div class="nm">${c.name}</div></div>`).join(''):'<div class="empty">아직 뽑은 카드가 없어요</div>';
  const mine=myCards(); const total=mine.reduce((a,c)=>a+ownedValue(c.id),0);
  const legends=mine.filter(c=>c.rar==='L').length, golds=mine.filter(c=>c.rar==='G').length;
  document.getElementById('home-summary').innerHTML=`<div><div class="k">보유 카드</div><div class="v">${cardCount(S)}장</div></div><div><div class="k">카드 종류</div><div class="v">${mine.length}종</div></div><div><div class="k">총 시세</div><div class="v">${Math.round(total/10000).toLocaleString()}만원</div></div><div><div class="k">레전드</div><div class="v">${legends}장</div></div><div><div class="k">골드</div><div class="v">${golds}장</div></div><div><div class="k">개봉한 팩</div><div class="v">${S.stats.packs}개</div></div>`;
  document.getElementById('tile-shop').textContent=`${PACKS.length}종 · 카테고리 5개`;
  document.getElementById('tile-book').textContent=`${mine.length}종 · 정렬·일괄 판매`;
  try{ renderClubPanels(); }catch(e){ console.error(e); }
  try{ renderClubQuick(); }catch(e){ console.error(e); }
  const en=mine.filter(c=>c.enh); const te=document.getElementById('tile-enh'); if(te) te.textContent=en.length?`강화 카드 ${en.length}장 · 최고 +${Math.max(...en.map(c=>c.enh))}`:'능력치·시세 올리기';
  const can=S.lastAllowance!==todayStr();
  document.getElementById('tile-bank').innerHTML=can?'<span class="dot"></span>받을 수 있어요':'내일 다시'; let cdot=can;
  if(typeof boxLeft==='function'){ const bl=boxLeft(); document.getElementById('tile-box').innerHTML=bl>0?`<span class="dot"></span>오늘 ${bl}번 남음`:'오늘은 다 열었어요'; if(bl>0) cdot=true; document.getElementById('tile-admin').style.display=isAdmin()&&famOn()?'':'none'; }
  const cd=document.getElementById('hdot-cards'); if(cd) cd.classList.toggle('on',cdot);
}
