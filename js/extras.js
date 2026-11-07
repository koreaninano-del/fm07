/* ====== 랜덤박스 · 관리자 일괄 지급 ====== */
const BOX_PER_DAY=3, ADMIN_ID='hyun';
function isAdmin(){ return Account.id===ADMIN_ID; }
function boxLeft(){ if(S.boxDay!==todayStr()){ S.boxDay=todayStr(); S.boxCount=0; } return BOX_PER_DAY-(S.boxCount||0); }
function boxPool(min,max,ultra){ return Object.values(CARDS).filter(c=>isPlayerCard(c)&&!c.icon&&(ultra?c.ultra:(!c.edition&&c.rating>=min&&c.rating<=max))); }
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
  if(!econOK()) return; if(boxLeft()<=0) return; const el=document.getElementById('box-wrap'); if(!el||el.classList.contains('shaking')) return; el.classList.add('shaking');
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
/* ---- 관리자: 지급(전원/개인, 음수면 회수) · 패밀리 리그 강퇴 (Firestore grants / admin/league) ---- */
async function grantsCheck(){
  if(!famOn()) return; if(!S) return;
  if(!S.grantSeen){ S.grantSeen=S.created?new Date(S.created+'T00:00:00').getTime()-1:0; } // 계정 생성일 이후 지급만 받음
  const qs=await famDB().collection('grants').where('t','>',S.grantSeen).orderBy('t').get();
  let total=0, last=S.grantSeen; qs.forEach(d=>{ const g=d.data(); last=Math.max(last,g.t); if(g.to&&g.to!==Account.uid) return; if(g.amount){ const before=S.money; S.money=Math.max(0,S.money+g.amount); total+=S.money-before; logIt(`관리자 ${g.amount>0?'지급':'회수'}: ${g.amount>0?'+':''}${fmt(g.amount)}${g.note?' · '+g.note:''}`); } });
  if(last>S.grantSeen){ S.grantSeen=last; refreshHUD(); if(total>0) toast(`관리자가 ${fmt(total)}을 넣어 줬어요!`); else if(total<0) toast(`관리자가 ${fmt(-total)}을 회수했어요`); save(); }
}
if(typeof famLoad==='function'){ const _famLoad=famLoad; famLoad=async function(){ await _famLoad(); try{ await grantsCheck(); }catch(e){ console.warn('grants',e); } }; }
function adminWorth(c){ const v=c.value!=null?c.value:(c.cards||[]).reduce((t,id)=>t+(CARDS[id]?CARDS[id].price:0),0); return {v,m:c.money,est:c.value==null}; }
let adminTab='worth';
function openAdmin(tab){
  if(!isAdmin()) return; adminTab=tab||adminTab;
  const clubs=Object.values(Fam.clubs||{}); const all=[...clubs,...Object.keys(Fam.banned||{}).filter(u=>!Fam.clubs[u]).map(u=>({uid:u,owner:'(강퇴됨)',name:u.slice(0,6)}))];
  const rows=clubs.map(c=>({c,...adminWorth(c)})).sort((a,b)=>(b.v+(b.m||0))-(a.v+(a.m||0)));
  const tabs=`<div class="tabs" style="margin:10px 0 4px">${[['worth','총 시세'],['grant','지급·회수'],['ban','강퇴']].map(([k,n])=>`<button class="tab ${adminTab===k?'on':''}" onclick="openAdmin('${k}')">${n}</button>`).join('')}</div>`;
  const worth=`<div class="tblwrap"><table class="ltable fixed admin"><colgroup><col><col class="c-money"><col class="c-money"><col class="c-money"><col class="c-act"></colgroup><tr><th>계정</th><th>카드 시세</th><th>보유금</th><th>합계</th><th class="act"></th></tr>
    ${rows.map(r=>`<tr class="${r.c.uid===Account.uid?'me':''}"><td><div class="ell">${esc(r.c.id||r.c.owner||'')}</div><div class="ell sub">${esc(r.c.name)} · ${r.c.cardN!=null?r.c.cardN+'장':(r.c.cards||[]).length+'종'}${Fam.banned[r.c.uid]?' · 강퇴':''}</div></td><td>${fmtM(r.v)}${r.est?'*':''}</td><td>${r.m!=null?fmtM(r.m):'–'}</td><td><b>${r.m!=null?fmtM(r.v+r.m):'–'}</b></td><td class="act"><button class="chip" onclick="openAdmin('grant');setTimeout(()=>{document.getElementById('ad-to').value='${r.c.uid}'},0)">지급</button></td></tr>`).join('')}</table></div>
    <div class="muted small" style="margin-top:6px">각 계정이 마지막으로 접속했을 때 기준 · * 표시는 아직 새 버전에 접속하지 않아 1장씩으로 추정</div>`;
  const grant=`<div class="row"><select id="ad-to" style="flex:1"><option value="">전원 (${clubs.length}명)</option>${clubs.map(c=>`<option value="${c.uid}">${esc(c.id||c.owner||c.name)} · ${esc(c.name)}</option>`).join('')}</select></div>
    <div class="chips" style="margin-top:10px">${[30000,50000,100000,200000,500000].map(v=>`<button class="chip" onclick="document.getElementById('ad-amt').value=${v}">${fmt(v)}</button>`).join('')}<button class="chip" onclick="document.getElementById('ad-amt').value=-(document.getElementById('ad-amt').value||0)">± 회수로</button></div>
    <div class="row"><input id="ad-amt" type="number" step="1000" placeholder="금액 (음수 = 회수)" style="flex:1"><input id="ad-note" placeholder="메모" style="flex:1"></div>
    <div class="row right"><button class="btn primary" onclick="adminGrant()">실행</button></div>`;
  const ban=`<div class="opps">${all.filter(c=>c.uid!==Account.uid).map(c=>`<div class="opp"><div class="opp-info"><div class="ell"><b>${esc(c.name)}</b></div><div class="ell muted small">${esc(c.id||c.owner||'')}${Fam.banned[c.uid]?' · 강퇴됨':''}</div></div><button class="btn ${Fam.banned[c.uid]?'':'danger'}" onclick="adminBan('${c.uid}',${Fam.banned[c.uid]?'false':'true'})">${Fam.banned[c.uid]?'복귀':'강퇴'}</button></div>`).join('')||'<div class="muted small">다른 계정이 없어요</div>'}</div>`;
  openModal(`<h2>관리자</h2>${tabs}${adminTab==='worth'?worth:adminTab==='grant'?grant:ban}
    <div class="row right" style="margin-top:12px"><button class="btn" onclick="closeModal()">닫기</button></div>`);
}
const fmtM=n=>n>=10000?(Math.round(n/1000)/10).toLocaleString('ko-KR')+'만':fmt(n);
async function adminGrant(){
  const amt=parseInt(document.getElementById('ad-amt').value,10); const note=document.getElementById('ad-note').value.trim(); const to=document.getElementById('ad-to').value;
  if(!amt) return toast('금액을 입력해 주세요'); if(Math.abs(amt)>5000000) return toast('한 번에 500만원까지만');
  const who=to?(Fam.clubs[to]&&(Fam.clubs[to].id||Fam.clubs[to].name)):'가입자 전원';
  if(!confirm(`${who}에게 ${amt>0?fmt(amt)+' 지급':fmt(-amt)+' 회수'}할까요?`)) return;
  try{ const doc={amount:amt,note,by:Account.id,t:Date.now()}; if(to) doc.to=to; await famDB().collection('grants').add(doc); toast(`${who}: ${amt>0?'지급':'회수'} 예약!`); closeModal(); await grantsCheck(); }
  catch(e){ toast('실패: '+e.message); }
}
async function adminBan(uid,on){
  const c=Fam.clubs[uid]; if(!confirm(`${c?(c.id||c.name):uid} 계정을 패밀리 리그에서 ${on?'강퇴':'복귀'}시킬까요?`)) return;
  try{ const b=Object.assign({},Fam.banned||{}); if(on) b[uid]=true; else delete b[uid]; await famDB().collection('admin').doc('league').set({banned:b,updated:Date.now(),by:Account.id}); Fam.banned=b; toast(on?'강퇴했어요':'복귀시켰어요'); await famLoad(); openAdmin(); }
  catch(e){ toast('실패: '+e.message); }
}
