/* ====== 클럽 · 리그 · 컵 (얼티메이트 모드) ====== */
const AI_CLUBS=[
 ['서울 썬더','KOR','press'],['부산 웨이브','KOR','counter'],['김해 가야 FC','KOR','poss'],['도쿄 라이징','JPN','poss'],['상파울루 삼바','BRA','poss'],['리우 오션','BRA','counter'],
 ['마드리드 로얄','ESP','poss'],['바르사 블루','ESP','poss'],['런던 라이온스','ENG','press'],['맨체스터 스톰','ENG','press'],['베를린 아이언','GER','press'],['뮌헨 이글스','GER','poss'],
 ['파리 에투알','FRA','counter'],['밀라노 네로','ITA','counter'],['암스테르담 오렌지','NED','poss'],['리스본 나비','POR','counter'],['부에노스 탱고','ARG','press'],['카사블랑카 아틀라스','MAR','counter'],
 ['카이로 파라오','EGY','counter'],['멕시코시티 아즈텍','MEX','press'],['LA 스타즈','USA','press'],['토론토 메이플','CAN','counter'],['오슬로 바이킹','NOR','press'],['자그레브 체커','CRO','poss'],
];
const TIER_NAME={1:'1부 리그',2:'2부 리그',3:'3부 리그'}; const TIER_AVG={1:86,2:81,3:76};
const DAILY_MATCHES=5;
function clubOf(){ if(!S.club){ S.club={name:S.name+' FC',tier:3,season:1,league:null,cup:null,history:[],trophies:{league:0,cup:0}}; } return S.club; }
function matchesLeft(){ if(S.matchDay!==todayStr()){ S.matchDay=todayStr(); S.matchCount=0; } return DAILY_MATCHES-(S.matchCount||0); }
function clubStrength(idx,tier){ return TIER_AVG[tier]+((hashStr(AI_CLUBS[idx][0])%7)-3); }
/* ---- 리그 ---- */
function newSeason(){
  const c=clubOf(); const used=new Set(); const seed=hashStr(S.name+c.season+c.tier);
  let k=seed; const rnd=()=>{ k=(k*1664525+1013904223)>>>0; return k/4294967296; }; const pool=AI_CLUBS.map((_,i)=>i); for(let i=pool.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; } const ids=pool.slice(0,7);
  const teams=['ME',...ids]; const table={}; teams.forEach(t=>table[t]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});
  // 더블 라운드로빈 (8팀, 14라운드) — 라운드로빈 스케줄
  const n=8, arr=teams.slice(); const rounds=[];
  for(let r=0;r<n-1;r++){ const ms=[]; for(let i=0;i<n/2;i++){ const a=arr[i], b=arr[n-1-i]; ms.push(r%2?[a,b]:[b,a]); } rounds.push(ms); arr.splice(1,0,arr.pop()); }
  const fixtures=[...rounds,...rounds.map(ms=>ms.map(([a,b])=>[b,a]))].map(ms=>ms.map(([a,b])=>({h:a,a:b,s:null})));
  c.league={tier:c.tier,season:c.season,teams,table,fixtures,md:0};
}
function leagueName(t){ return t==='ME'?clubOf().name:AI_CLUBS[t][0]; }
function aiResult(sa,sb){ const d=(sa-sb)/6; const ga=Math.max(0,Math.round(1.4+d+ (Math.random()*2.4-1.2))); const gb=Math.max(0,Math.round(1.4-d+(Math.random()*2.4-1.2))); return [ga,gb]; }
function applyResult(L,h,a,hs,as){ const T=L.table; const th=T[h],ta=T[a]; th.p++;ta.p++;th.gf+=hs;th.ga+=as;ta.gf+=as;ta.ga+=hs; if(hs>as){th.w++;ta.l++;th.pts+=3;} else if(hs<as){ta.w++;th.l++;ta.pts+=3;} else {th.d++;ta.d++;th.pts++;ta.pts++;} }
function standings(L){ return L.teams.slice().sort((x,y)=>{ const a=L.table[x],b=L.table[y]; return b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf; }); }
function buildClubTeam(idx,tier,bonus){
  const [name,nat,style]=AI_CLUBS[idx]; const avg=clubStrength(idx,tier)+(bonus||0);
  const form=Object.keys(FORMATIONS)[hashStr(name)%5]; const F=FORMATIONS[form];
  const all=Object.values(CARDS).filter(c=>(!c.kind||c.kind==='player')&&!c.edition); const used=new Set();
  const slots=F.map(s=>{ const target=avg+(Math.random()*6-3); let cands=all.filter(c=>c.pos===s[0]&&!used.has(c.name)&&Math.abs(c.rating-target)<=3);
    if(Math.random()<0.6){ const liked=cands.filter(c=>c.nat===nat); if(liked.length>=2) cands=liked; }
    if(!cands.length) cands=all.filter(c=>c.pos===s[0]&&!used.has(c.name)).sort((a,b)=>Math.abs(a.rating-target)-Math.abs(b.rating-target)).slice(0,8);
    const c=cands[Math.floor(Math.random()*cands.length)]; used.add(c.name); return c.id; });
  return {name,formation:form,style:Math.random()<0.7?style:Object.keys(STYLES)[Math.floor(Math.random()*3)],mental:['att','bal','def'][Math.floor(Math.random()*3)],slots};
}
function playLeague(){
  const c=clubOf(); if(!c.league) newSeason(); const L=c.league;
  const err=squadReady(); if(err) return toast(err+' (스쿼드 편집에서)');
  if(matchesLeft()<=0) return toast('오늘 경기 횟수를 다 썼어요. 내일 다시!');
  const w=squadWage(squadOf()); if(S.money<w) return toast(`급여 ${fmt(w)}이 부족해요. 카드를 팔거나 용돈을 받아 보세요.`);
  const md=L.fixtures[L.md]; const my=md.find(m=>m.h==='ME'||m.a==='ME'); const oppId=my.h==='ME'?my.a:my.h;
  S.money-=w; S.matchCount++; save();
  const away=buildClubTeam(oppId,L.tier);
  startMatch(away,{kind:'league',wages:w,label:`${TIER_NAME[L.tier]} ${L.md+1}라운드`,onEnd:r=>{
    my.s=[r.hs,r.as]; applyResult(L,'ME',oppId,r.hs,r.as);
    md.filter(m=>m!==my).forEach(m=>{ const [x,y]=aiResult(clubStrength(m.h,L.tier),clubStrength(m.a,L.tier)); m.s=[x,y]; applyResult(L,m.h,m.a,x,y); });
    let reward=r.win?Math.round(w*1.3)+3000+(L.tier===1?3000:L.tier===2?1500:0):r.draw?w:0; S.money+=reward;
    let html=`<div class="price">${reward-w>=0?'+':''}${fmt(reward-w)}</div><div class="muted small">급여 ${fmt(w)} · 상금 ${fmt(reward)}</div>`;
    L.md++; logIt(`${TIER_NAME[L.tier]} ${L.md}R ${leagueName(oppId)} ${r.hs}:${r.as} ${r.win?'승':r.draw?'무':'패'} (+${fmt(reward)}/-${fmt(w)})`);
    if(L.md>=L.fixtures.length) html+=endSeason();
    save(); return {html};
  }});
}
function endSeason(){
  const c=clubOf(); const L=c.league; const st=standings(L); const rank=st.indexOf('ME')+1;
  const prize=[60000,40000,25000,15000,10000,8000,6000,5000][rank-1]*(L.tier===1?2:L.tier===2?1.4:1);
  S.money+=prize; let msg=`<div class="season-end"><b>시즌 ${L.season} 종료 · ${TIER_NAME[L.tier]} ${rank}위</b><div>시즌 상금 +${fmt(prize)}</div>`;
  let bonus=null;
  if(rank===1){ c.trophies.league++; const pool=Object.values(CARDS).filter(x=>x.rar==='G'&&!x.edition); bonus=pool[Math.floor(Math.random()*pool.length)]; addCard(S,bonus.id); msg+=`<div>우승! 골드 카드 보상: <b>${bonus.name}</b></div>`; }
  if(rank<=2&&c.tier>1){ c.tier--; msg+=`<div>${TIER_NAME[c.tier]}로 승격!</div>`; }
  else if(rank>=7&&c.tier<3){ c.tier++; msg+=`<div>${TIER_NAME[c.tier]}로 강등…</div>`; }
  c.history.unshift({season:L.season,tier:L.tier,rank,pts:L.table.ME.pts}); c.season++; c.league=null; msg+='</div>';
  logIt(`시즌 ${L.season} 종료: ${TIER_NAME[L.tier]} ${rank}위 (+${fmt(prize)})`);
  return msg;
}
/* ---- 컵 ---- */
const CUP_ROUNDS=['16강','8강','4강','결승']; const CUP_PRIZE=[6000,12000,25000,60000];
function newCup(){ const c=clubOf(); const used=new Set(); const opps=[]; while(opps.length<4){ const i=Math.floor(Math.random()*AI_CLUBS.length); if(!used.has(i)){used.add(i);opps.push(i);} } c.cup={no:(c.cup?c.cup.no:0)+1,round:0,opps,out:false,done:false}; }
function playCup(){
  const c=clubOf(); if(!c.cup||c.cup.done||c.cup.out) newCup(); const C=c.cup;
  const err=squadReady(); if(err) return toast(err+' (스쿼드 편집에서)');
  if(matchesLeft()<=0) return toast('오늘 경기 횟수를 다 썼어요. 내일 다시!');
  const w=squadWage(squadOf()); if(S.money<w) return toast(`급여 ${fmt(w)}이 부족해요.`);
  S.money-=w; S.matchCount++; save();
  const tier=[3,2,2,1][C.round]; const away=buildClubTeam(C.opps[C.round],tier, C.round===3?2:0);
  startMatch(away,{kind:'cup',wages:w,label:`FA컵 ${C.no}회 ${CUP_ROUNDS[C.round]}`,onEnd:r=>{
    let html='';
    if(r.win||(r.draw&&Math.random()<0.5)){ const pk=r.draw; const reward=CUP_PRIZE[C.round]+Math.round(w*1.2); S.money+=reward;
      html=`<div class="price">+${fmt(reward-w)}</div><div class="muted small">${pk?'승부차기 승리! ':''}${CUP_ROUNDS[C.round]} 통과 상금 ${fmt(CUP_PRIZE[C.round])} + 급여 보전</div>`;
      logIt(`FA컵 ${CUP_ROUNDS[C.round]} ${r.away.name} ${r.hs}:${r.as} 통과 (+${fmt(reward)})`);
      C.round++; if(C.round>=4){ C.done=true; c.trophies.cup++; const pool=Object.values(CARDS).filter(x=>(x.rar==='G'||x.rar==='L')&&!x.edition); const b=pool[Math.floor(Math.random()*pool.length)]; addCard(S,b.id); html+=`<div class="season-end"><b>FA컵 우승!</b><div>보상 카드: <b>${b.name}</b> (${RARITY[b.rar].n})</div></div>`; logIt(`FA컵 우승! 보상 카드 ${b.name}`); }
    } else { C.out=true; html=`<div class="price" style="color:#b91c1c">-${fmt(w)}</div><div class="muted small">${r.draw?'승부차기 패배… ':''}${CUP_ROUNDS[C.round]}에서 탈락했어요. 다음 컵에 다시 도전!</div>`; logIt(`FA컵 ${CUP_ROUNDS[C.round]} ${r.away.name} ${r.hs}:${r.as} 탈락`); }
    save(); return {html};
  }});
}
/* ---- 친선 ---- */
function playFriendly(fid){ const err=squadReady(); if(err) return toast(err+' (스쿼드 편집에서)'); const f=FRIENDS.find(x=>x.id===fid); const away=buildOpponent(f,squadOf()); startMatch(away,{kind:'friendly',wages:0,label:`${f.name}과(와) 친선 경기`,onEnd:r=>{ logIt(`${f.name}과(와) 친선 ${r.hs}:${r.as}`); save(); return {html:'<div class="muted">친선 경기는 급여·상금이 없어요</div>'}; }}); }
/* ---- 홈 패널 ---- */
function renderClubPanels(){
  const c=clubOf(); const sq=squadOf(); const F=FORMATIONS[sq.formation]; const err=squadReady(); const w=squadWage(sq);
  const mini=F.map((s,i)=>{ const id=sq.slots[i]; const cd=id?CARDS[id]:null; return `<div class="mslot ${cd?'':'empty'}" style="left:${s[1]}%;top:${8+s[2]*0.84}%">${cd?`<img src="${IMG[cd.img||cd.id]||''}"><span>${cd.name.split(' ').pop()} <b>${cd.rating-posPenalty(cd,s[0])}</b></span>`:`<i>${s[0]}</i>`}</div>`; }).join('');
  document.getElementById('club-panel').innerHTML=`<div class="club-head"><div><h1 class="club-name title" onclick="renameClub()">${c.name}<span class="muted">이름 바꾸기</span></h1><div class="muted small">${TIER_NAME[c.tier]} · 시즌 ${c.season} · 우승 리그 ${c.trophies.league} · 컵 ${c.trophies.cup}</div></div><div class="ovr"><div class="k">팀 능력치</div><div class="v num">${err?'–':squadRating(sq)}</div></div></div>
    <div class="mini-pitch" onclick="openBattleLobby()"><div class="line"></div><div class="circle"></div><div class="box t"></div><div class="box b"></div>${mini}</div>
    <div class="club-foot"><div class="small ${w>WAGE_CAP?'warn':'muted'}">${sq.formation} · ${STYLES[sq.style].n} · ${MENTAL[sq.mental].n} · 급여 ${fmt(w)}/${fmt(WAGE_CAP)}</div><button class="btn" onclick="openBattleLobby()">스쿼드 편집</button></div>${err?`<div class="warn small">${err}</div>`:''}`;
  // league
  if(!c.league) newSeason(); const L=c.league; const st=standings(L); const next=L.md<L.fixtures.length?L.fixtures[L.md].find(m=>m.h==='ME'||m.a==='ME'):null; const oppId=next?(next.h==='ME'?next.a:next.h):null;
  document.getElementById('league-panel').innerHTML=`<table class="ltable"><tr><th>#</th><th>팀</th><th>경기</th><th>승</th><th>무</th><th>패</th><th>득실</th><th>승점</th></tr>${st.map((t,i)=>{ const r=L.table[t]; return `<tr class="${t==='ME'?'me':''} ${i<2&&c.tier>1?'up':''} ${i>=6&&c.tier<3?'down':''}"><td>${i+1}</td><td>${leagueName(t)}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf-r.ga>0?'+':''}${r.gf-r.ga}</td><td><b>${r.pts}</b></td></tr>`; }).join('')}</table>
    <div class="next"><div><div class="muted small">다음 경기 · ${L.md+1}/${L.fixtures.length}라운드</div><b>${oppId!==null?`vs ${leagueName(oppId)} (${TIER_AVG[L.tier]+((hashStr(AI_CLUBS[oppId][0])%7)-3)})`:'시즌 종료'}</b></div><button class="btn primary" onclick="playLeague()" ${err?'disabled':''}>경기하기</button></div>
    <div class="muted small">오늘 남은 경기 ${matchesLeft()}/${DAILY_MATCHES} · 급여 ${fmt(w)} 지출, 승리 시 ${fmt(Math.round(w*1.3)+3000+(L.tier===1?3000:L.tier===2?1500:0))}</div>`;
  // cup
  const C=c.cup; const active=C&&!C.done&&!C.out;
  document.getElementById('cup-panel').innerHTML=`<div class="bracket">${CUP_ROUNDS.map((r,i)=>`<div class="br ${active&&C.round===i?'now':''} ${C&&(C.round>i||(C.done))?'done':''} ${C&&C.out&&C.round===i?'lost':''}">${r}${C&&C.opps&&(C.round>i||C.done||(C.out&&C.round===i)||(active&&C.round===i))?`<small>${AI_CLUBS[C.opps[i]][0]}</small>`:'<small>?</small>'}</div>`).join('')}</div>
    <div class="next"><div>${active?`<div class="muted small">FA컵 ${C.no}회 · ${CUP_ROUNDS[C.round]}</div><b>vs ${AI_CLUBS[C.opps[C.round]][0]}</b>`:C&&C.done?`<b>FA컵 ${C.no}회 우승</b><div class="muted small">새 컵에 도전할 수 있어요</div>`:C&&C.out?`<b>FA컵 ${C.no}회 탈락</b><div class="muted small">새 컵에 다시 도전!</div>`:'<b>FA컵 도전</b><div class="muted small">16강부터 4경기 토너먼트</div>'}</div><button class="btn primary" onclick="playCup()" ${err?'disabled':''}>${active?'경기하기':'새 컵 시작'}</button></div>
    <div class="muted small">라운드 상금 ${CUP_PRIZE.map(fmt).join(' → ')} · 우승 시 골드/레전드 카드</div>
    <div class="chips" style="margin-top:8px">${FRIENDS.map(f=>`<button class="chip" onclick="playFriendly('${f.id}')">친선 · ${f.name}</button>`).join('')}</div>`;
}
function renameClub(){ const n=prompt('클럽 이름',clubOf().name); if(n&&n.trim()){ clubOf().name=n.trim().slice(0,14); save(); renderHome(); } }
