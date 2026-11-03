/* ====== 축구 시뮬레이션 대결 ====== */
const ATTR_KO={pac:'스피드',sho:'슈팅',pas:'패스',dri:'드리블',def:'수비',phy:'피지컬'};
const TRAITS=[
 {n:'스피드스타',d:'빠른 발로 상대 수비를 제쳐요',up:'pac',dn:'phy'},
 {n:'골 사냥꾼',d:'슈팅 기회를 놓치지 않아요',up:'sho',dn:'def'},
 {n:'플레이메이커',d:'결정적인 패스를 넣어요',up:'pas',dn:'pac'},
 {n:'드리블러',d:'좁은 공간에서도 공을 지켜요',up:'dri',dn:'def'},
 {n:'철벽',d:'태클과 가로채기의 달인',up:'def',dn:'sho'},
 {n:'피지컬 괴물',d:'몸싸움에서 지지 않아요',up:'phy',dn:'dri'},
 {n:'헤더 강자',d:'세트피스에서 강해요',up:'phy',dn:'pas'},
 {n:'터프 가이',d:'거친 플레이, 카드를 받기 쉬워요',up:'def',dn:'pas',card:true},
 {n:'체력 부족',d:'후반에 힘이 떨어져요',up:'dri',dn:'phy',tired:true},
 {n:'캡틴',d:'팀 전체 사기를 올려요',up:'pas',dn:'pac',cap:true},
];
const POS_PROFILE={GK:{pac:-12,sho:-25,pas:-8,dri:-20,def:10,phy:4},DF:{pac:-3,sho:-14,pas:-4,dri:-8,def:8,phy:5},MF:{pac:-2,sho:-5,pas:7,dri:4,def:-3,phy:0},FW:{pac:5,sho:9,pas:-4,dri:5,def:-16,phy:0}};
function attrs(c){ if(c._a) return c._a; const h=hashStr(c.name+'|'+c.nat); const p=POS_PROFILE[c.pos]||POS_PROFILE.MF; const t=TRAITS[h%TRAITS.length]; const a={};
  ['pac','sho','pas','dri','def','phy'].forEach((k,i)=>{ const off=((h>>(i*3))%9)-4; a[k]=Math.max(30,Math.min(99,c.rating+p[k]+off+(t.up===k?5:0)-(t.dn===k?3:0))); });
  a.trait=t; c._a=a; return a; }
function wage(c){ return Math.max(300,Math.round(300*Math.pow(1.13,c.rating-70)/100)*100); }
function attrHTML(c){ const a=attrs(c); return `<div class="attrs">${Object.keys(ATTR_KO).map(k=>`<div class="attr"><span>${ATTR_KO[k]}</span><div class="bar"><i style="width:${a[k]}%;background:${a[k]>=85?'#15803d':a[k]>=70?'#65a30d':a[k]>=55?'#d97706':'#dc2626'}"></i></div><b>${a[k]}</b></div>`).join('')}</div><div class="stat-row"><span>특성</span><b>${a.trait.n} <span class="muted small">· ${a.trait.d}</span></b></div><div class="stat-row"><span>경기당 급여</span><b>${fmt(wage(c))}</b></div>`; }
const FORMATIONS={
 '4-3-3':[['GK',50,92],['DF',15,72],['DF',38,76],['DF',62,76],['DF',85,72],['MF',30,52],['MF',50,56],['MF',70,52],['FW',20,24],['FW',50,18],['FW',80,24]],
 '4-4-2':[['GK',50,92],['DF',15,72],['DF',38,76],['DF',62,76],['DF',85,72],['MF',15,46],['MF',38,50],['MF',62,50],['MF',85,46],['FW',38,20],['FW',62,20]],
 '4-2-3-1':[['GK',50,92],['DF',15,72],['DF',38,76],['DF',62,76],['DF',85,72],['MF',38,58],['MF',62,58],['MF',20,36],['MF',50,38],['MF',80,36],['FW',50,16]],
 '3-5-2':[['GK',50,92],['DF',25,74],['DF',50,78],['DF',75,74],['MF',10,50],['MF',32,54],['MF',50,58],['MF',68,54],['MF',90,50],['FW',38,20],['FW',62,20]],
 '5-3-2':[['GK',50,92],['DF',8,66],['DF',30,76],['DF',50,80],['DF',70,76],['DF',92,66],['MF',30,50],['MF',50,54],['MF',70,50],['FW',38,20],['FW',62,20]],
};
const STYLES={press:{n:'강한 압박',d:'높은 위치에서 공을 뺏어요. 점유 상대에 강하고, 역습에 약해요',beats:'poss'},poss:{n:'점유 축구',d:'공을 오래 가지고 천천히 공격해요. 역습 상대에 강하고, 압박에 약해요',beats:'counter'},counter:{n:'역습',d:'내려앉았다가 빠르게 찔러요. 압박 상대에 강하고, 점유에 약해요',beats:'press'}};
const MENTAL={att:{n:'공격적',a:1.18,d:0.84},bal:{n:'균형',a:1,d:1},def:{n:'수비적',a:0.84,d:1.18}};
const WAGE_CAP=25000, PRIZE_MATCHES=5;
const OPP_TACTIC={minjun:'press',seoyeon:'poss',jiho:'counter'};
function squadOf(){ if(!S.squad) S.squad={formation:'4-3-3',style:'press',mental:'bal',slots:Array(11).fill(null)}; if(!S.squad.slots||S.squad.slots.length!==11) S.squad.slots=Array(11).fill(null); S.squad.slots=S.squad.slots.map(id=>id&&CARDS[id]&&S.cards[id]?id:null); return S.squad; }
function squadWage(sq){ return sq.slots.reduce((a,id)=>a+(id?wage(CARDS[id]):0),0); }
function posPenalty(c,slotPos){ if(c.pos===slotPos) return 0; if(slotPos==='GK'||c.pos==='GK') return 25; if((c.pos==='DF'&&slotPos==='MF')||(c.pos==='MF'&&slotPos==='DF')||(c.pos==='MF'&&slotPos==='FW')||(c.pos==='FW'&&slotPos==='MF')) return 7; return 14; }
function effAttrs(c,slotPos){ const a=attrs(c); const pen=posPenalty(c,slotPos); const o={}; Object.keys(ATTR_KO).forEach(k=>o[k]=Math.max(20,a[k]-pen)); o.trait=a.trait; o.pen=pen; return o; }
/* ---- 스쿼드 화면 ---- */
let mt={opp:null};
function openBattleLobby(){ renderSquad(); }
function squadReady(){ const sq=squadOf(); if(sq.slots.some(x=>!x)) return '11명을 모두 채워 주세요'; if(squadWage(sq)>WAGE_CAP) return '급여 예산을 넘었어요'; return ''; }
function squadRating(sq){ sq=sq||squadOf(); const F=FORMATIONS[sq.formation]; const v=sq.slots.map((id,i)=>id?CARDS[id].rating-posPenalty(CARDS[id],F[i][0]):0); return Math.round(v.reduce((a,b)=>a+b,0)/11); }
function renderSquad(msg){
  const sq=squadOf(); const F=FORMATIONS[sq.formation]; const w=squadWage(sq); const filled=sq.slots.filter(Boolean).length;
  const nats={}; sq.slots.forEach(id=>{ if(id){ nats[CARDS[id].nat]=(nats[CARDS[id].nat]||0)+1; } });
  const chem=Object.values(nats).reduce((a,n)=>a+(n>=2?n-1:0),0);
  const pitch=F.map((s,i)=>{ const id=sq.slots[i]; const c=id?CARDS[id]:null; const pen=c?posPenalty(c,s[0]):0;
    return `<div class="pslot ${c?'':'empty'} ${pen?'oop':''}" style="left:${s[1]}%;top:${6+s[2]*0.86}%" onclick="pickSlot(${i})" title="${s[0]}">${c?`<div class="pimg">${cardSVG(c,54)}</div><div class="pname">${c.name.split(' ').pop()}</div><div class="pr">${c.rating-pen}${pen?' (포지션 불일치)':''}</div>`:`<div class="pplus">+</div><div class="pname">${POS_KO[s[0]]}</div>`}</div>`; }).join('');
  const matchesToday=(S.matchDay===todayStr()?S.matchCount:0)||0;
  openModal(`<div class="squad"><div class="sq-left"><div class="sq-head"><h2>축구 대결 · 선발 명단</h2><div class="muted small">포지션 자리를 눌러 선수를 넣어요. 포지션이 다르면 능력치가 떨어져요(능력치 옆에 표시).</div></div>
    <div class="pitch"><div class="pline"></div><div class="pcircle"></div><div class="pbox top"></div><div class="pbox bot"></div>${pitch}</div></div>
    <div class="sq-right">
      <h3>포메이션</h3><div class="chips">${Object.keys(FORMATIONS).map(f=>`<button class="chip ${sq.formation===f?'on':''}" onclick="S.squad.formation='${f}';S.squad.slots=Array(11).fill(null);save();renderSquad()">${f}</button>`).join('')}</div>
      <h3>전술 스타일</h3><div class="chips">${Object.entries(STYLES).map(([k,v])=>`<button class="chip ${sq.style===k?'on':''}" onclick="S.squad.style='${k}';save();renderSquad()">${v.n}</button>`).join('')}</div><div class="muted small">${STYLES[sq.style].d}</div>
      <h3>마음가짐</h3><div class="chips">${Object.entries(MENTAL).map(([k,v])=>`<button class="chip ${sq.mental===k?'on':''}" onclick="S.squad.mental='${k}';save();renderSquad()">${v.n}</button>`).join('')}</div>
      <h3>급여 예산</h3><div class="wagebar"><i style="width:${Math.min(100,w/WAGE_CAP*100)}%;background:${w>WAGE_CAP?'#dc2626':'#15803d'}"></i></div><div class="small ${w>WAGE_CAP?'warn':'muted'}">${fmt(w)} / ${fmt(WAGE_CAP)} ${w>WAGE_CAP?'· 예산 초과! 선수를 바꿔 주세요':''}</div>
      <div class="muted small">같은 나라 선수 호흡 +${chem} · 선발 ${filled}/11</div>
      ${msg?`<div class="warn">${msg}</div>`:''}
      <div class="row"><button class="btn" onclick="autoSquad()">자동 선발</button><button class="btn primary" onclick="closeModal()">저장하고 닫기</button></div>
    </div></div>`,'wide');
}
function pickSlot(i){
  const sq=squadOf(); const pos=FORMATIONS[sq.formation][i][0];
  let mine=myCards().filter(c=>(c.kind||'player')==='player'||!c.kind).filter(c=>!sq.slots.includes(c.id)||sq.slots[i]===c.id);
  mine.sort((a,b)=>(posPenalty(a,pos)-posPenalty(b,pos))||(b.rating-a.rating));
  const w=squadWage(sq)-(sq.slots[i]?wage(CARDS[sq.slots[i]]):0);
  openModal(`<div class="binder-head"><div><h2>${POS_KO[pos]} 자리에 넣을 선수</h2><div class="muted small">남은 예산 ${fmt(WAGE_CAP-w)}</div></div><div><button class="btn" onclick="S.squad.slots[${i}]=null;save();renderSquad()">비우기</button><button class="btn" onclick="renderSquad()">뒤로</button></div></div>
    <div class="card-grid small" style="max-height:520px">${mine.map(c=>{ const pen=posPenalty(c,pos); const over=w+wage(c)>WAGE_CAP; const a=attrs(c); return `<div class="mini-card ${over?'dim':''}" onclick="${over?`toast('급여 예산을 넘어요')`:`S.squad.slots[${i}]='${c.id}';save();renderSquad()`}">${cardSVG(c,96)}<div class="mc-name">${c.name}</div><div class="mc-sub">${POS_KO[c.pos]} ${c.rating}${pen?` → ${c.rating-pen} `:''}</div><div class="mc-sub">${a.trait.n} · ${fmt(wage(c))}</div></div>`; }).join('')||'<div class="muted">선수 카드가 없어요</div>'}</div>`,'wide');
}
function autoSquad(){
  const sq=squadOf(); const F=FORMATIONS[sq.formation]; sq.slots=Array(11).fill(null); let w=0; const used=new Set();
  const pool=myCards().filter(c=>!c.kind||c.kind==='player');
  // 포지션별로 급여 효율 좋은 선수부터, 예산 안에서 최고 능력치
  F.forEach((s,i)=>{ const cands=pool.filter(c=>!used.has(c.id)).sort((a,b)=>(posPenalty(a,s[0])-posPenalty(b,s[0]))||(b.rating-a.rating));
    const remainingSlots=F.length-i-1; for(const c of cands){ if(w+wage(c)+remainingSlots*300<=WAGE_CAP){ sq.slots[i]=c.id; used.add(c.id); w+=wage(c); break; } } });
  save(); renderSquad();
}
/* ---- 상대 팀 생성 ---- */
function buildOpponent(f,sq){
  const my=sq.slots.map(id=>CARDS[id]); const avg=my.reduce((a,c)=>a+c.rating,0)/11;
  const form=Object.keys(FORMATIONS)[hashStr(f.id+todayStr())%5]; const F=FORMATIONS[form];
  const all=Object.values(CARDS).filter(c=>(!c.kind||c.kind==='player')&&!c.edition);
  const used=new Set(); const slots=F.map(s=>{ const target=avg+1.5+(Math.random()*6-3); let cands=all.filter(c=>c.pos===s[0]&&!used.has(c.name)&&Math.abs(c.rating-target)<=3);
    if(Math.random()<0.5){ const liked=cands.filter(c=>f.likes.includes(c.nat)); if(liked.length) cands=liked; }
    if(!cands.length) cands=all.filter(c=>c.pos===s[0]&&!used.has(c.name)).sort((a,b)=>Math.abs(a.rating-target)-Math.abs(b.rating-target)).slice(0,8);
    const c=cands[Math.floor(Math.random()*cands.length)]; used.add(c.name); return c.id; });
  const style=Math.random()<0.65?OPP_TACTIC[f.id]:Object.keys(STYLES)[Math.floor(Math.random()*3)];
  const mental=['att','bal','def'][Math.floor(Math.random()*3)];
  return {name:f.name,formation:form,style,mental,slots};
}
/* ---- 팀 전력 계산 ---- */
function teamPower(team){
  const F=FORMATIONS[team.formation]; const ps=F.map((s,i)=>({c:CARDS[team.slots[i]],pos:s[0],a:effAttrs(CARDS[team.slots[i]],s[0])}));
  const nats={}; ps.forEach(p=>nats[p.c.nat]=(nats[p.c.nat]||0)+1); const chem=Math.min(6,Object.values(nats).reduce((a,n)=>a+(n>=2?n-1:0),0));
  const cap=ps.some(p=>p.a.trait.cap)?2:0;
  const gk=ps.find(p=>p.pos==='GK'); const df=ps.filter(p=>p.pos==='DF'), mf=ps.filter(p=>p.pos==='MF'), fw=ps.filter(p=>p.pos==='FW');
  const avg=(arr,fn)=>arr.length?arr.reduce((a,p)=>a+fn(p.a),0)/arr.length:50;
  const attack=avg(fw,a=>a.sho*0.45+a.pac*0.25+a.dri*0.3)*0.6+avg(mf,a=>a.pas*0.5+a.dri*0.3+a.sho*0.2)*0.4+chem+cap;
  const midfield=avg(mf,a=>a.pas*0.45+a.phy*0.3+a.def*0.25)*0.7+avg(df,a=>a.pas)*0.15+avg(fw,a=>a.pas)*0.15+chem+cap;
  const defense=avg(df,a=>a.def*0.5+a.phy*0.25+a.pac*0.25)*0.7+avg(mf,a=>a.def)*0.3+chem+cap;
  const keeper=gk.a.def*0.7+gk.a.phy*0.15+gk.a.pas*0.15;
  const pace=avg(fw,a=>a.pac)*0.6+avg(mf,a=>a.pac)*0.4, dfpace=avg(df,a=>a.pac);
  return {ps,attack,midfield,defense,keeper,pace,dfpace,chem,cap,gk,df,mf,fw};
}
/* ---- 경기 시뮬레이션 ---- */
let live=null;
function startMatch(away,ctx){ // away: {name,formation,style,mental,slots}; ctx: {kind:'league'|'cup'|'friendly', wages, onEnd(result)}
  const sq=squadOf(); const w=ctx.wages||0;
  const home={name:clubOf().name,formation:sq.formation,style:sq.style,mental:sq.mental,slots:sq.slots.slice()};
  live={home,away,hp:teamPower(home),ap:teamPower(away),min:0,score:[0,0],events:[],ctx,wages:w,timer:null,speed:140};
  const sw=STYLES[home.style].beats===away.style?1:STYLES[away.style].beats===home.style?-1:0; live.styleEdge=sw;
  live.events.push({m:0,t:'info',s:`${ctx.label||'경기'} 시작! ${home.name}(${home.formation}, ${STYLES[home.style].n}) vs ${away.name}(${away.formation}, ${STYLES[away.style].n})`});
  if(sw===1) live.events.push({m:0,t:'info',s:`전술 상성: ${STYLES[home.style].n}이(가) ${STYLES[away.style].n}에 유리해요!`});
  if(sw===-1) live.events.push({m:0,t:'info',s:`전술 상성: 상대의 ${STYLES[away.style].n}이(가) 우리 ${STYLES[home.style].n}에 유리해요…`});
  S.stats.battles++; refreshHUD(); renderMatch(); live.timer=setInterval(tick,live.speed);
}
function chance(att,def,attacking,defending,min){
  // 공격 전력 vs 상대 수비+중원
  const A=att.attack*MENTAL[attacking.mental].a*(1+ (attacking===live.home?live.styleEdge:-live.styleEdge)*0.08);
  const D=def.defense*MENTAL[defending.mental].d;
  const mid=(att.midfield-def.midfield)/40;
  const paceEdge=(att.pace-def.dfpace)/60; // 빠른 공격진 vs 느린 수비
  const tired=min>70?(att.ps.filter(p=>p.a.trait.tired).length*0.03):0;
  let p=0.062*Math.pow(A/D,2.2)*(1+mid)*(1+paceEdge)*(1-tired);
  if(attacking.style==='counter') p*= (min%3===0?1.5:0.75);
  if(attacking.style==='press') p*= min<60?1.1:0.95;
  return Math.max(0.005,Math.min(0.25,p));
}
function tick(){
  if(!live) return; live.min++;
  const sides=[[live.home,live.away,live.hp,live.ap,0],[live.away,live.home,live.ap,live.hp,1]];
  for(const [att,def,ap,dp,idx] of sides){
    if(Math.random()<chance(ap,dp,att,def,live.min)){
      // 슈팅: 공격수/미드 중 한 명, 상대 GK와 대결
      const shooters=[...ap.fw,...ap.fw,...ap.mf]; const sh=shooters[Math.floor(Math.random()*shooters.length)];
      const assist=[...ap.mf,...ap.fw].filter(p=>p!==sh); const as=assist[Math.floor(Math.random()*assist.length)];
      const q=sh.a.sho*0.6+sh.a.dri*0.2+(as?as.a.pas*0.2:14);
      const stop=dp.keeper*0.75+dp.defense*0.25;
      const goalP=0.26*Math.pow(q/stop,3);
      const r=Math.random();
      if(r<goalP){ live.score[idx]++; live.events.push({m:live.min,t:'goal',side:idx,s:`골! ${sh.c.name}${as?` (도움: ${as.c.name})`:''}`}); }
      else if(r<goalP+0.25){ live.events.push({m:live.min,t:'save',side:idx,s:`${sh.c.name}의 슛을 ${dp.gk.c.name} 골키퍼가 막아냈어요`}); }
      else if(r<goalP+0.4){ live.events.push({m:live.min,t:'miss',side:idx,s:`${sh.c.name}의 슛이 골대를 벗어났어요`}); }
      else if(r<goalP+0.48){ const d=dp.df[Math.floor(Math.random()*dp.df.length)]; live.events.push({m:live.min,t:'block',side:idx,s:`${d.c.name}이(가) ${sh.c.name}의 슛을 몸으로 막았어요`}); }
    }
  }
  if(live.min===45) live.events.push({m:45,t:'info',s:`전반 종료 ${live.score[0]} : ${live.score[1]}`});
  if(live.min%7===0&&Math.random()<0.25){ const t=Math.random()<0.5?live.hp:live.ap; const tough=t.ps.filter(p=>p.a.trait.card); if(tough.length&&Math.random()<0.5){ const p=tough[Math.floor(Math.random()*tough.length)]; live.events.push({m:live.min,t:'card',s:`경고: ${p.c.name} 경고`}); } }
  if(!live.silent) renderMatch();
  if(live.min>=90){ clearInterval(live.timer); if(!live.silent) finishMatch(); }
}
function renderMatch(){
  const h=live.home,a=live.away; const ev=live.events.slice().reverse().slice(0,14);
  const lineup=(team,P)=>`<div class="lineup"><div class="muted small">${team.formation} · ${STYLES[team.style].n} · ${MENTAL[team.mental].n}</div>${P.ps.map(p=>`<div class="lu ${p.a.pen?'oop':''}"><img src="${IMG[p.c.img||p.c.id]||''}" width="26" height="34" style="object-fit:cover;border-radius:3px"><span>${p.c.name}</span><b>${p.c.rating-p.a.pen}</b></div>`).join('')}</div>`;
  openModal(`<div class="match"><div class="scoreboard"><div class="tm">${h.name}</div><div class="sc">${live.score[0]} : ${live.score[1]}</div><div class="tm">${a.name}</div></div>
    <div class="clock"><div class="bar"><i style="width:${live.min/90*100}%"></i></div><div class="min">${live.min}'</div></div>
    <div class="match-body">${lineup(h,live.hp)}<div class="events">${ev.map(e=>`<div class="ev ${e.t} ${e.side===1?'away':''}"><span class="em">${e.m}'</span>${e.s}</div>`).join('')}</div>${lineup(a,live.ap)}</div>
    <div class="row right">${live.min<90?`<button class="btn" onclick="live.speed=live.speed===140?30:140;clearInterval(live.timer);live.timer=setInterval(tick,live.speed)">${live.speed===140?'빠르게':'보통 속도'}</button><button class="btn" onclick="clearInterval(live.timer);live.silent=true;while(live.min<90)tick();live.silent=false;finishMatch()">결과 바로 보기</button>`:''}</div></div>`,'wide');
}
function finishMatch(){
  const L=live; live=null; const [hs,as]=L.score; const win=hs>as, draw=hs===as;
  if(win) S.stats.wins++;
  const scorers=L.events.filter(e=>e.t==='goal').map(e=>`${e.m}' ${e.s.replace('골! ','')}${e.side===1?' (상대)':''}`);
  const r=L.ctx.onEnd({hs,as,win,draw,away:L.away,scorers})||{};
  refreshHUD();
  openModal(`<div class="result"><div class="muted small">${L.ctx.label||''}</div><h1>${win?'승리':draw?'무승부':'패배'}</h1><div class="score">${hs} : ${as}</div><div class="muted small">${L.home.name} vs ${L.away.name}</div><div class="muted small">${scorers.join(' · ')||'골 없음'}</div>
    ${r.html||''}
    <div class="row"><button class="btn primary" onclick="closeModal();renderHome()">확인</button></div></div>`);
}
