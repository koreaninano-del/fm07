/* ====== 패밀리 리그 · 가족 트레이드 (Firestore 공유) ====== */
const FAM_AI=[{uid:'ai_seoul',name:'서울 썬더',idx:0,str:78},{uid:'ai_busan',name:'부산 웨이브',idx:1,str:76},{uid:'ai_gimhae',name:'김해 가야 FC',idx:2,str:80}].map(a=>({...a,str:Math.round(a.str+AI_WAGE_BONUS)}));
const Fam={clubs:{},results:[],trades:[],season:null,unsubTrades:null,timer:null,loaded:false,banned:{}};
function famBanned(uid){ return !!(Fam.banned&&Fam.banned[uid||Account.uid]); }
function famOn(){ return Account.mode==='cloud'&&Account.uid; }
function famDB(){ return Account.fb.db; }
/* 주간 시즌: 월요일 시작 ~ 일요일 종료 */
function weekStart(d){ d=new Date(d||Date.now()); d.setHours(0,0,0,0); d.setDate(d.getDate()-((d.getDay()+6)%7)); return d; }
function dateStr(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function seasonKey(d){ return 'W'+dateStr(weekStart(d)); }
function prevSeasonKey(){ const d=weekStart(); d.setDate(d.getDate()-7); return seasonKey(d); }
function seasonLabel(k){ const st=new Date(k.slice(1)+'T00:00:00'); const en=new Date(st); en.setDate(st.getDate()+6); return `${st.getMonth()+1}/${st.getDate()}~${en.getMonth()+1}/${en.getDate()} 주간 시즌`; }
function seasonDayIdx(){ const d=new Date(); d.setHours(0,0,0,0); return Math.round((d-weekStart())/86400000); } // 월=0 … 일=6
function daysLeftInWeek(){ return 7-seasonDayIdx(); }
function daysLeftInMonth(){ return daysLeftInWeek(); }
/* 시즌 동안 상대마다 하루 1경기. 늦게 들어온 팀(또는 쉰 날)은 따라잡기 가능 → 상대별 허용 경기 수 = 시즌 경과일 */
function famPairKey(a,b){ return a<b?a+'_'+b:b+'_'+a; }
function famPairGames(a,b){ return Fam.results.filter(r=>(r.home===a&&r.away===b)||(r.home===b&&r.away===a)).length; }
function famPairAllowed(){ return seasonDayIdx()+1; }
function famGamesLeft(uid){ return Math.max(0,famPairAllowed()-famPairGames(Account.uid,uid)); }
function famResultId(sk,a,b,n){ return sk+'_'+famPairKey(a,b)+'_'+n; }
async function famAddResult(data){ // 결정적 문서 id로 중복 방지 (create 전용 규칙)
  const db=famDB(); for(let n=famPairGames(data.home,data.away)+1;n<famPairGames(data.home,data.away)+4;n++){
    try{ await db.collection('results').doc(famResultId(data.season,data.home,data.away,n)).set(data); return true; }catch(e){ if(e.code!=='permission-denied'&&e.code!=='already-exists') throw e; } }
  return false; }
/* AI vs AI: 상대별 허용 수만큼 자동으로 경기 결과 생성 (누가 먼저 접속하든 같은 id → 한 번만 기록) */
async function famSimAI(){
  const sk=seasonKey(); const need=famPairAllowed(); let added=0;
  for(let i=0;i<FAM_AI.length;i++) for(let j=i+1;j<FAM_AI.length;j++){ const A=FAM_AI[i],B=FAM_AI[j];
    for(let n=famPairGames(A.uid,B.uid)+1;n<=need;n++){ const home=n%2?A:B, away=n%2?B:A; const [hs,as]=aiResult(home.str,away.str);
      const d=new Date(weekStart()); d.setDate(d.getDate()+n-1);
      try{ await famDB().collection('results').doc(famResultId(sk,A.uid,B.uid,n)).set({season:sk,day:dateStr(d),home:home.uid,homeName:home.name,away:away.uid,awayName:away.name,hs,as,t:Date.now(),ai:true}); added++; }catch(e){ if(e.code!=='permission-denied'&&e.code!=='already-exists') console.warn('ai sim',e); } } }
  return added; }
/* ---- 내 클럽 공개 프로필 ---- */
let famPubTimer=null;
function famPublish(){
  if(!famOn()||!S) return; clearTimeout(famPubTimer);
  famPubTimer=setTimeout(async()=>{ try{
    const c=clubOf(); const sq=squadOf(); const ready=!squadReady();
    await famDB().collection('clubs').doc(Account.uid).set({uid:Account.uid,id:Account.id,name:c.name,owner:S.name,rating:ready?squadRating(sq):0,ready,squad:{formation:sq.formation,style:sq.style,mental:sq.mental,slots:sq.slots,enh:Object.fromEntries(sq.slots.filter(id=>id&&enhLv(id)).map(id=>[id,enhLv(id)]))},cards:Object.keys(S.cards).filter(id=>CARDS[id]&&!enhLocked(id)),value:Object.keys(S.cards).reduce((t,id)=>t+ownedValue(id),0),money:S.money,cardN:cardCount(S),updated:Date.now()});
    if(!Fam.clubs[Account.uid]){ await famLoad(); if(typeof renderHome==='function') renderHome(); }
  }catch(e){ console.warn('club publish',e); } },2000);
}
/* ---- 불러오기 ---- */
async function famLoad(){
  if(!famOn()) return;
  const db=famDB(); const sk=seasonKey();
  try{ await accountReconcile(); }catch(e){ console.warn('reconcile',e); }
  const [cs,rs,ad]=await Promise.all([db.collection('clubs').get(),db.collection('results').where('season','==',sk).get(),db.collection('admin').doc('league').get().catch(()=>null)]);
  Fam.banned=(ad&&ad.exists&&ad.data().banned)||{};
  Fam.clubs={}; cs.forEach(d=>{ if(!Fam.banned[d.id]||d.id===Account.uid) Fam.clubs[d.id]=d.data(); });
  famWelcome();
  Fam.results=rs.docs.map(d=>Object.assign({_id:d.id},d.data()));
  Fam.season=sk; Fam.loaded=true;
  try{ if(await famSimAI()>0){ const rs2=await db.collection('results').where('season','==',sk).get(); Fam.results=rs2.docs.map(d=>Object.assign({_id:d.id},d.data())); } }catch(e){ console.warn(e); }
  if(!Fam.unsubTrades){
    Fam.unsubTrades=db.collection('trades').where('to','==',Account.uid).onSnapshot(s=>{ const was=Fam.trades.filter(t=>t.status==='open'&&t.to===Account.uid).length; Fam.trades=Fam.trades.filter(t=>t.to!==Account.uid).concat(s.docs.map(d=>Object.assign({_id:d.id},d.data()))); const now=Fam.trades.filter(t=>t.status==='open'&&t.to===Account.uid).length; if(now>was) toast('새 트레이드 제안이 왔어요'); renderHome(); });
    db.collection('trades').where('from','==',Account.uid).onSnapshot(s=>{ Fam.trades=Fam.trades.filter(t=>t.from!==Account.uid).concat(s.docs.map(d=>Object.assign({_id:d.id},d.data()))); famSettleAccepted(); renderHome(); });
  }
  await famSeasonAward();
  renderHome();
}
function famRefreshSoon(){ if(famOn()) famLoad().catch(e=>console.warn(e)); }
/* ---- 순위표 ---- */
function famTeams(){ const list=Object.values(Fam.clubs).filter(c=>!Fam.banned[c.uid]).map(c=>({uid:c.uid,name:c.name,owner:c.owner,rating:c.rating,ready:c.ready,human:true})); FAM_AI.forEach(a=>list.push({uid:a.uid,name:a.name,rating:a.str,ready:true,human:false})); return list; }
function famTable(){
  const T={}; famTeams().forEach(t=>T[t.uid]={t,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});
  Fam.results.forEach(r=>{ const h=T[r.home],a=T[r.away]; if(!h||!a) return; h.p++;a.p++;h.gf+=r.hs;h.ga+=r.as;a.gf+=r.as;a.ga+=r.hs; if(r.hs>r.as){h.w++;a.l++;h.pts+=3;} else if(r.hs<r.as){a.w++;h.l++;a.pts+=3;} else {h.d++;a.d++;h.pts++;a.pts++;} });
  return Object.values(T).sort((x,y)=>y.pts-x.pts||(y.gf-y.ga)-(x.gf-x.ga)||y.gf-x.gf);
}
function famPlayedToday(uid){ return famGamesLeft(uid)<=0; }
/* ---- 경기 ---- */
function famOpponentTeam(uid){
  const ai=FAM_AI.find(a=>a.uid===uid);
  if(ai){ const t=buildClubTeam(ai.idx,2); t.name=ai.name; return t; }
  const c=Fam.clubs[uid]; if(!c||!c.ready||!c.squad||c.squad.slots.some(id=>!id||!CARDS[id])) return null;
  return {name:c.name,formation:c.squad.formation,style:c.squad.style,mental:c.squad.mental,slots:c.squad.slots.slice(),enh:c.squad.enh||{}};
}
/* 시즌 중간에 들어온 계정 지원: 다른 가족 클럽이 이미 있으면 처음 한 번 200,000원 + 기록 */
function famWelcome(){
  if(!S||S.famWelcome) return; const others=Object.values(Fam.clubs).filter(c=>c.uid!==Account.uid).length;
  S.famWelcome=true; if(others>=1&&(S.created||'')>='2026-11-06'){ S.money+=200000; logIt('신입 클럽 지원금 +200,000원 (패밀리 리그에 늦게 합류)'); toast('신입 클럽 지원금 200,000원을 받았어요!'); refreshHUD(); }
  save();
}
function playFamily(uid){
  if(!econOK()) return; if(famBanned()) return toast('관리자가 패밀리 리그 참가를 막아 두었어요');
  const err=squadReady(); if(err) return toast(err+' (스쿼드 편집에서)');
  if(famGamesLeft(uid)<=0) return toast('이 상대와는 이번 시즌 할 수 있는 경기를 다 했어요 (하루 1경기)');
  const away=famOpponentTeam(uid); if(!away) return toast('상대가 아직 스쿼드 11명을 다 채우지 않았어요');
  const w=squadWage(squadOf()); if(S.money<w) return toast(`급여 ${fmt(w)}이 부족해요.`);
  S.money-=w; save();
  startMatch(away,{kind:'family',wages:w,label:`패밀리 리그 · vs ${away.name}`,onEnd:r=>{
    const reward=r.win?Math.round(w*1.3)+3000:r.draw?w:0; S.money+=reward;
    famAddResult({season:seasonKey(),day:todayStr(),home:Account.uid,homeName:clubOf().name,away:uid,awayName:away.name,hs:r.hs,as:r.as,t:Date.now()}).then(()=>famLoad()).catch(e=>console.warn(e));
    logIt(`패밀리 리그 ${away.name} ${r.hs}:${r.as} ${r.win?'승':r.draw?'무':'패'} (+${fmt(reward)}/-${fmt(w)})`); save();
    return {html:`<div class="price">${reward-w>=0?'+':''}${fmt(reward-w)}</div><div class="muted small">급여 ${fmt(w)} · 상금 ${fmt(reward)} · 순위표에 반영돼요</div>`};
  }});
}
/* ---- 패밀리 리그 순위 보상 (1위 100% : 2위 60% : 3위 40% 가치) ---- */
const FAM_REWARD=[
  {n:'패밀리 챔피언 팩',money:100000,parts:[['iconPrime',1,'아이콘(92+)'],['ultra',1,'울트라'],['legend',2,'레전드'],['gold',2,'골드']]},
  {n:'패밀리 준우승 팩',money:60000,parts:[['icon',1,'아이콘'],['legend',4,'레전드'],['gold',3,'골드']]},
  {n:'패밀리 3위 팩',money:40000,parts:[['icon',1,'아이콘'],['legend',2,'레전드'],['gold',1,'골드']]}];
function famRewardText(R){ return R.parts.map(([k,n,t])=>t+(n>1?n:'')).join('·')+' + '+Math.round(R.money/10000)+'만원'; }
function famRewardCards(rank){ const R=FAM_REWARD[rank-1]; if(!R) return []; if(!PACKS.length) buildCatalog();
  const pool={iconPrime:POOL.icon.filter(c=>c.rating>=92),icon:POOL.icon,ultra:POOL.ultra,legend:POOL.legend,gold:POOL.gold}; const out=[];
  R.parts.forEach(([k,n])=>{ for(let i=0;i<n;i++){ const p=pool[k]; if(p&&p.length) out.push(rpick(p)); } }); return out; }
function famRewardModal(season,rank,R,cards){ openModal(`<div class="open-stage"><h2>${seasonLabel(season)} 패밀리 리그 ${rank}위!</h2><p class="muted">${R.n} · 상금 ${fmt(R.money)} · 카드 시세 ${fmt(cards.reduce((a,c)=>a+c.price,0))}</p>
    <div class="cards-grid">${cards.map(c=>`<div class="rc" onclick="cardDetail('${c.id}','closeModal')">${cardSVG(c,120)}<div class="nm">${c.name}</div></div>`).join('')}</div>
    <div class="row right"><button class="btn primary" onclick="closeModal();renderHome()">받기</button></div></div>`,'wide'); }
/* ---- 시즌 정산 (월요일 이후 첫 접속: 지난주 순위로 상금) ---- */
async function famSeasonAward(){
  const prev=prevSeasonKey();
  if(S.famAwarded===prev) return; if(!S.famAwarded||!String(S.famAwarded).startsWith('W')){ S.famAwarded=prev; save(); return; }
  const rs=await famDB().collection('results').where('season','==',prev).get(); const saved=Fam.results; Fam.results=rs.docs.map(d=>d.data());
  const tbl=famTable(); Fam.results=saved; const rank=tbl.findIndex(x=>x.t.uid===Account.uid)+1; S.famAwarded=prev;
  if(rank>0&&tbl.length>1){ const R=FAM_REWARD[rank-1]; const prize=R?R.money:10000; S.money+=prize; let msg=`${seasonLabel(prev)} 패밀리 리그 ${rank}위 · 상금 +${fmt(prize)}`;
    if(rank===1) clubOf().trophies.league++;
    const cards=famRewardCards(rank); cards.forEach(c=>addCard(S,c.id)); if(cards.length){ S.recent=[...cards.map(c=>c.id).reverse(),...(S.recent||[])].slice(0,30); msg+=` · ${R.n}: ${cards.map(c=>c.name).join(', ')}`; }
    clubOf().history.unshift({season:seasonLabel(prev),tier:0,rank,pts:tbl[rank-1].pts}); logIt(msg);
    if(cards.length) setTimeout(()=>famRewardModal(prev,rank,R,cards),600); else toast(msg); }
  save();
}
/* ---- 패밀리 리그 패널 ---- */
function renderFamilyPanel(){
  const el=document.getElementById('league-panel'); if(!el) return;
  if(!famOn()){ el.innerHTML='<div class="empty">클라우드 모드에서만 열려요</div>'; return; }
  if(!Fam.loaded){ el.innerHTML='<div class="empty">불러오는 중…</div>'; return; }
  if(famBanned()){ el.innerHTML='<div class="empty">관리자가 참가를 막아 두었어요</div>'; return; }
  const tbl=famTable(); const err=squadReady(); const w=squadWage(squadOf());
  const opps=tbl.filter(x=>x.t.uid!==Account.uid);
  el.innerHTML=`<div class="muted small" style="margin-bottom:8px">${seasonLabel(Fam.season)} · ${daysLeftInWeek()}일 남음</div>
    <div class="tblwrap"><table class="ltable fixed"><colgroup><col class="c-rank"><col><col class="c-n"><col class="c-n"><col class="c-n"><col class="c-n"><col class="c-gd"><col class="c-pts"></colgroup><tr><th>#</th><th>클럽</th><th>경기</th><th>승</th><th>무</th><th>패</th><th>득실</th><th>승점</th></tr>${tbl.map((r,i)=>`<tr class="${r.t.uid===Account.uid?'me':''}"><td>${i+1}</td><td><div class="ell">${esc(r.t.name)}</div><div class="ell sub">${r.t.human?esc(r.t.owner||''):'AI'}</div></td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf-r.ga>0?'+':''}${r.gf-r.ga}</td><td><b>${r.pts}</b></td></tr>`).join('')}</table></div>
    <div class="opps">${opps.map(o=>{ const left=famGamesLeft(o.t.uid); const played=famPairGames(Account.uid,o.t.uid); return `<div class="opp"><div class="opp-info"><div class="ell"><b>${esc(o.t.name)}</b></div><div class="ell muted small">능력치 ${o.t.rating||'–'}${o.t.human&&!o.t.ready?' · 스쿼드 미완성':''} · ${played}/${famPairAllowed()}</div></div><button class="btn ${left?'primary':''}" onclick="playFamily('${o.t.uid}')" ${err||!left||(o.t.human&&!o.t.ready)?'disabled':''}>${left?(left>1?`경기 (${left})`:'경기'):'완료'}</button></div>`; }).join('')}</div>
    <div class="muted small" style="margin-top:10px">급여 ${fmt(w)} · 승리 ${fmt(Math.round(w*1.3)+3000)}</div>
    <div class="fam-rewards">${FAM_REWARD.map((R,i)=>`<div><b>${i+1}위</b><span>${famRewardText(R)}</span></div>`).join('')}</div>`;
}
/* ---- 가족 트레이드 ---- */
let ft={to:null,offer:null,want:null};
function famOthers(){ return Object.values(Fam.clubs).filter(c=>c.uid!==Account.uid&&!Fam.banned[c.uid]); }
function renderFamTradeTab(){
  if(!famOn()) return `<div class="empty">가족 트레이드는 클라우드 모드에서만 열려요.</div>`;
  const inbox=Fam.trades.filter(t=>t.to===Account.uid&&t.status==='open'); const out=Fam.trades.filter(t=>t.from===Account.uid&&t.status==='open');
  const card=id=>CARDS[id]?`<div style="width:80px;display:inline-block;text-align:center">${cardSVG(CARDS[id],72)}<div class="small" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${CARDS[id].name}</div><div class="small muted">${CARDS[id].rating} · ${isPlayerCard(CARDS[id])?posStr(CARDS[id]):''}</div></div>`:'';
  return `<h3>받은 제안 ${inbox.length?`(${inbox.length})`:''}</h3>${inbox.length?inbox.map(t=>`<div class="next" style="margin:6px 0"><div><b>${t.fromName}</b>의 제안<div class="row" style="margin-top:6px">${card(t.offer)}<span class="arrow">⇄</span>${card(t.want)}</div><div class="muted small">${t.fromName}이(가) ${CARDS[t.offer]?.name} 을(를) 주고 내 ${CARDS[t.want]?.name} 을(를) 받고 싶어 해요</div></div><div class="row" style="margin:0;flex-direction:column"><button class="btn primary" onclick="famAccept('${t._id}')">수락</button><button class="btn" onclick="famReject('${t._id}')">거절</button></div></div>`).join(''):'<div class="muted small">받은 제안이 없어요</div>'}
    <h3>보낸 제안</h3>${out.length?out.map(t=>`<div class="next" style="margin:6px 0"><div><b>${t.toName}</b>에게 · ${CARDS[t.offer]?.name} ⇄ ${CARDS[t.want]?.name}<div class="muted small">상대가 접속해서 수락하면 교환돼요</div></div><button class="btn" onclick="famCancel('${t._id}')">취소</button></div>`).join(''):'<div class="muted small">보낸 제안이 없어요</div>'}
    <h3>새 제안</h3><div class="friend-list">${famOthers().map(c=>`<div class="friend" onclick="openFamTrade('${c.uid}')"><div class="f-avatar" style="background:#bcd3f5">${(c.owner||c.name)[0]}</div><div><b>${c.name}</b><div class="muted small">${c.owner||''} · 카드 ${(c.cards||[]).length}종</div></div></div>`).join('')||'<div class="muted small">아직 다른 가족 계정이 없어요. 같은 사이트에서 아이디를 만들면 여기 나타나요.</div>'}</div>`;
}
function openFamTrade(uid){ ft={to:uid,offer:null,want:null}; renderFamTrade(); }
function renderFamTrade(){
  const c=Fam.clubs[ft.to]; const theirs=(c.cards||[]).map(id=>CARDS[id]).filter(Boolean).sort((a,b)=>b.price-a.price); const mine=myCards().filter(c=>!enhLocked(c.id)).map(c=>CARDS[c.id]).sort((a,b)=>b.price-a.price);
  const pick=(cd,who,sel)=>`<div class="mini-card ${sel?'sel':''}" onclick="ft.${who}='${cd.id}';renderFamTrade()">${cardSVG(cd,96)}<div class="mc-name">${cd.name}</div><div class="mc-sub"><b>${cd.rating}</b> ${isPlayerCard(cd)?posStr(cd):''}</div><div class="mc-sub">${fmt(cd.price)}</div></div>`;
  const ok=ft.offer&&ft.want;
  openModal(`<div class="trade"><div class="trade-col"><h3>내 카드 (줄 카드)</h3><div class="card-grid small">${mine.map(x=>pick(x,'offer',ft.offer===x.id)).join('')}</div></div>
    <div class="trade-mid"><div class="f-avatar big" style="background:#bcd3f5">${(c.owner||c.name)[0]}</div><b>${c.name}</b><div class="muted small">${c.owner||''}</div>
      <div class="trade-slots"><div class="tslot">${ft.offer?cardSVG(CARDS[ft.offer],90):'<div class="muted small">내 카드</div>'}</div><div class="arrow">⇄</div><div class="tslot">${ft.want?cardSVG(CARDS[ft.want],90):'<div class="muted small">받을 카드</div>'}</div></div>
      <div class="muted small">제안을 보내면 상대가 접속해서 수락할 때 교환돼요</div>
      <button class="btn primary" ${ok?'':'disabled'} onclick="famPropose()">제안 보내기</button><button class="btn" onclick="openTradeLobby('fam')">뒤로</button></div>
    <div class="trade-col"><h3>${c.name}의 카드 (받을 카드)</h3><div class="card-grid small">${theirs.map(x=>pick(x,'want',ft.want===x.id)).join('')||'<div class="muted small">상대 카드 정보가 아직 없어요</div>'}</div></div></div>`,'wide');
}
async function famPropose(){
  if(!econOK()) return; const c=Fam.clubs[ft.to];
  try{ await famDB().collection('trades').add({from:Account.uid,fromName:clubOf().name+' ('+S.name+')',to:ft.to,toName:c.name,offer:ft.offer,want:ft.want,status:'open',settled:false,t:Date.now()}); toast('제안을 보냈어요'); openTradeLobby('fam'); }
  catch(e){ toast('제안 실패: '+e.message); }
}
async function famAccept(id){
  if(!econOK()) return; const t=Fam.trades.find(x=>x._id===id); if(!t) return;
  if(!S.cards[t.want]) return toast('내게 그 카드가 이제 없어요'); if(enhLocked(t.want)) return toast('강화한 카드는 교환할 수 없어요');
  try{ await famDB().collection('trades').doc(id).update({status:'accepted',acceptedAt:Date.now()});
    removeCard(S,t.want); addCard(S,t.offer); S.stats.trades++; logIt(`${t.fromName}과(와) 교환: ${CARDS[t.want].name} → ${CARDS[t.offer].name}`); refreshHUD(); toast(`${CARDS[t.offer].name} 카드를 받았어요`); openTradeLobby('fam'); }
  catch(e){ toast('수락 실패: '+e.message); }
}
async function famReject(id){ try{ await famDB().collection('trades').doc(id).update({status:'rejected'}); openTradeLobby('fam'); }catch(e){ toast(e.message); } }
async function famCancel(id){ try{ await famDB().collection('trades').doc(id).update({status:'cancelled'}); openTradeLobby('fam'); }catch(e){ toast(e.message); } }
async function famSettleAccepted(){ // 내가 보낸 제안이 수락됨 → 내 쪽 카드 교환 반영
  for(const t of Fam.trades.filter(x=>x.from===Account.uid&&x.status==='accepted'&&!x.settled)){
    try{ await famDB().collection('trades').doc(t._id).update({settled:true}); if(S.cards[t.offer]) removeCard(S,t.offer); addCard(S,t.want); S.stats.trades++; logIt(`${t.toName}이(가) 제안 수락: ${CARDS[t.offer]?.name} → ${CARDS[t.want]?.name}`); toast(`${t.toName}이(가) 트레이드를 수락했어요! ${CARDS[t.want]?.name} 획득`); refreshHUD(); }catch(e){ console.warn(e); }
  }
}
