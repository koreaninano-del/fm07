/* ====== 데이터 ====== */
const NATIONS = {
  ARG:{n:'아르헨티나',flag:['h','#74ACDF','#fff','#74ACDF'],kit:['#9ccaf0','#fff'],sk:'#f1c27d'},
  BRA:{n:'브라질',flag:['bra'],kit:['#f7d117','#1e5bb5'],sk:'#c68642'},
  POR:{n:'포르투갈',flag:['v2','#006600','#ff0000'],kit:['#c8102e','#006a4e'],sk:'#e0ac69'},
  COL:{n:'콜롬비아',flag:['h2','#fcd116','#003893','#ce1126'],kit:['#fcd116','#003893'],sk:'#c68642'},
  GER:{n:'독일',flag:['h','#000','#dd0000','#ffce00'],kit:['#fff','#000'],sk:'#f1c27d'},
  NED:{n:'네덜란드',flag:['h','#ae1c28','#fff','#21468b'],kit:['#f36c21','#fff'],sk:'#f1c27d'},
  ESP:{n:'스페인',flag:['h2','#aa151b','#f1bf00','#aa151b'],kit:['#c60b1e','#ffc400'],sk:'#e0ac69'},
  ITA:{n:'이탈리아',flag:['v','#009246','#fff','#ce2b37'],kit:['#0b4ea2','#fff'],sk:'#e0ac69'},
  ENG:{n:'잉글랜드',flag:['cross','#fff','#ce1124'],kit:['#fff','#1d3f8f'],sk:'#f1c27d'},
  FRA:{n:'프랑스',flag:['v','#0055a4','#fff','#ef4135'],kit:['#1e3a8a','#fff'],sk:'#c68642'},
  MEX:{n:'멕시코',flag:['v','#006847','#fff','#ce1126'],kit:['#006847','#fff'],sk:'#c68642'},
  KOR:{n:'대한민국',flag:['kor'],kit:['#d6001c','#fff'],sk:'#f1c27d'},
  URU:{n:'우루과이',flag:['h','#fff','#0038a8','#fff','#0038a8'],kit:['#7bb1e0','#fff'],sk:'#e0ac69'},
  CHI:{n:'칠레',flag:['chi'],kit:['#d52b1e','#fff'],sk:'#e0ac69'},
  WAL:{n:'웨일스',flag:['h','#fff','#00ab39'],kit:['#d30731','#fff'],sk:'#f1c27d'},
  CRO:{n:'크로아티아',flag:['h','#ff0000','#fff','#171796'],kit:['#fff','#ff0000'],sk:'#f1c27d'},
  POL:{n:'폴란드',flag:['h','#fff','#dc143c'],kit:['#fff','#dc143c'],sk:'#f1c27d'},
  SWE:{n:'스웨덴',flag:['cross','#006aa7','#fecc00'],kit:['#fecc00','#006aa7'],sk:'#f1c27d'},
  BEL:{n:'벨기에',flag:['v','#000','#fae042','#ed2939'],kit:['#ed2939','#000'],sk:'#e0ac69'},
  ISL:{n:'아이슬란드',flag:['cross','#02529c','#dc1e35'],kit:['#02529c','#fff'],sk:'#f1c27d'},
  RUS:{n:'러시아',flag:['h','#fff','#0039a6','#d52b1e'],kit:['#d52b1e','#fff'],sk:'#f1c27d'},
  JPN:{n:'일본',flag:['circle','#fff','#bc002d'],kit:['#1b2a7a','#fff'],sk:'#f1c27d'},
  EGY:{n:'이집트',flag:['h','#ce1126','#fff','#000'],kit:['#ce1126','#fff'],sk:'#c68642'},
  CZE:{n:'체코',flag:['h','#fff','#d7141a'],kit:['#d7141a','#fff'],sk:'#f1c27d'},
  DEN:{n:'덴마크',flag:['cross','#c60c30','#fff'],kit:['#c60c30','#fff'],sk:'#f1c27d'},
  SUI:{n:'스위스',flag:['sui'],kit:['#d52b1e','#fff'],sk:'#f1c27d'},
  MAR:{n:'모로코',flag:['mar'],kit:['#c1272d','#006233'],sk:'#c68642'},
  USA:{n:'미국',flag:['usa'],kit:['#fff','#1a3a7a'],sk:'#e0ac69'},
  CAN:{n:'캐나다',flag:['v','#ff0000','#fff','#ff0000'],kit:['#ff0000','#fff'],sk:'#e0ac69'},
  KSA:{n:'사우디아라비아',flag:['h','#006c35'],kit:['#fff','#006c35'],sk:'#c68642'},
  TUR:{n:'튀르키예',flag:['circle','#e30a17','#fff'],kit:['#e30a17','#fff'],sk:'#e0ac69'},
  GEO:{n:'조지아',flag:['cross','#fff','#ff0000'],kit:['#fff','#ff0000'],sk:'#f1c27d'},
  ROU:{n:'루마니아',flag:['v','#002b7f','#fcd116','#ce1126'],kit:['#fcd116','#002b7f'],sk:'#f1c27d'},
  SVK:{n:'슬로바키아',flag:['h','#fff','#0b4ea2','#ee1c25'],kit:['#0b4ea2','#fff'],sk:'#f1c27d'},
  SCO:{n:'스코틀랜드',flag:['sco'],kit:['#0b1f5c','#fff'],sk:'#f1c27d'},
  ECU:{n:'에콰도르',flag:['h2','#ffdd00','#034ea2','#ed1c24'],kit:['#ffdd00','#034ea2'],sk:'#c68642'},
  PAR:{n:'파라과이',flag:['h','#d52b1e','#fff','#0038a8'],kit:['#d52b1e','#fff'],sk:'#c68642'},
  NOR:{n:'노르웨이',flag:['cross','#ba0c2f','#fff','#00205b'],kit:['#ba0c2f','#fff'],sk:'#f1c27d'},
  NGA:{n:'나이지리아',flag:['v','#008751','#fff','#008751'],kit:['#008751','#fff'],sk:'#8d5524'},
  SEN:{n:'세네갈',flag:['v','#00853f','#fdef42','#e31b23'],kit:['#fff','#00853f'],sk:'#8d5524'},
  AUS:{n:'호주',flag:['h','#00008b'],kit:['#ffcd00','#00843d'],sk:'#f1c27d'},
  AUT:{n:'오스트리아',flag:['h','#ed2939','#fff','#ed2939'],kit:['#ed2939','#fff'],sk:'#f1c27d'},
  RSA:{n:'남아프리카공화국',flag:['h','#007a4d','#ffb612','#000'],kit:['#f5c518','#007a4d'],sk:'#8d5524'},
  CZE:{n:'체코',flag:['h','#fff','#d7141a'],kit:['#d7141a','#fff'],sk:'#f1c27d'},
  BIH:{n:'보스니아 헤르체고비나',flag:['h','#002395','#fecb00','#002395'],kit:['#0b3d91','#fff'],sk:'#f1c27d'},
  QAT:{n:'카타르',flag:['v2','#fff','#8a1538'],kit:['#8a1538','#fff'],sk:'#c68642'},
  HAI:{n:'아이티',flag:['h','#00209f','#d21034'],kit:['#0b4fd6','#fff'],sk:'#8d5524'},
  CUW:{n:'퀴라소',flag:['h','#002b7f','#f9e814','#002b7f'],kit:['#0b4fd6','#fff'],sk:'#8d5524'},
  CIV:{n:'코트디부아르',flag:['v','#f77f00','#fff','#009e60'],kit:['#f77f00','#fff'],sk:'#8d5524'},
  NZL:{n:'뉴질랜드',flag:['h','#00247d'],kit:['#fff','#000'],sk:'#f1c27d'},
  CPV:{n:'카보베르데',flag:['h','#003893','#fff','#cf2027','#fff','#003893'],kit:['#0b3d91','#fff'],sk:'#8d5524'},
  IRQ:{n:'이라크',flag:['h','#ce1126','#fff','#000'],kit:['#2e8b3a','#fff'],sk:'#c68642'},
  ALG:{n:'알제리',flag:['v','#006233','#fff'],kit:['#fff','#006233'],sk:'#c68642'},
  JOR:{n:'요르단',flag:['h','#000','#fff','#007a3d'],kit:['#fff','#ce1126'],sk:'#c68642'},
  COD:{n:'DR 콩고',flag:['h','#007fff','#f7d618','#ce1021','#f7d618','#007fff'],kit:['#0b4fd6','#f7d618'],sk:'#8d5524'},
  UZB:{n:'우즈베키스탄',flag:['h','#0099b5','#fff','#1eb53a'],kit:['#fff','#0099b5'],sk:'#e0ac69'},
  HUN:{n:'헝가리',flag:['h','#ce2939','#fff','#477050'],kit:['#ce2939','#fff'],sk:'#f1c27d'},
  NIR:{n:'북아일랜드',flag:['cross','#fff','#c8102e'],kit:['#0a7d3e','#fff'],sk:'#f1c27d'},
  IRL:{n:'아일랜드',flag:['v','#169b62','#fff','#ff883e'],kit:['#169b62','#fff'],sk:'#f1c27d'},
  GHA:{n:'가나',flag:['h','#ce1126','#fcd116','#006b3f'],kit:['#fff','#ce1126'],sk:'#8d5524'},
  PAN:{n:'파나마',flag:['h','#fff','#005293','#da121a','#fff'],kit:['#da121a','#fff'],sk:'#c68642'},
  TUN:{n:'튀니지',flag:['circle','#e70013','#fff'],kit:['#fff','#e70013'],sk:'#c68642'},
  IRN:{n:'이란',flag:['h','#239f40','#fff','#da0000'],kit:['#fff','#239f40'],sk:'#e0ac69'},
  CMR:{n:'카메룬',flag:['v','#007a5e','#ce1126','#fcd116'],kit:['#007a5e','#fcd116'],sk:'#8d5524'},
  GRE:{n:'그리스',flag:['h','#0d5eaf','#fff','#0d5eaf','#fff','#0d5eaf'],kit:['#fff','#0d5eaf'],sk:'#e0ac69'},
  CRC:{n:'코스타리카',flag:['h','#002b7f','#fff','#ce1126','#fff','#002b7f'],kit:['#ce1126','#002b7f'],sk:'#c68642'},
  HON:{n:'온두라스',flag:['h','#0073cf','#fff','#0073cf'],kit:['#fff','#0073cf'],sk:'#c68642'},
  PER:{n:'페루',flag:['v','#d91023','#fff','#d91023'],kit:['#fff','#d91023'],sk:'#c68642'},
  SRB:{n:'세르비아',flag:['h','#c6363c','#0c4076','#fff'],kit:['#c6363c','#fff'],sk:'#f1c27d'},
  ISL:{n:'아이슬란드',flag:['cross','#02529c','#dc1e35'],kit:['#02529c','#fff'],sk:'#f1c27d'},
  FIFA:{n:'FIFA',flag:['h','#1b3a8a','#fff','#1b3a8a'],kit:['#1b3a8a','#fff'],sk:'#f1c27d'},
};
const POS_KO = {GK:'골키퍼',DF:'수비수',MF:'미드필더',FW:'공격수',CB:'센터백',LB:'레프트백',RB:'라이트백',LWB:'왼쪽 윙백',RWB:'오른쪽 윙백',CDM:'수비형 미드필더',CM:'중앙 미드필더',CAM:'공격형 미드필더',LM:'왼쪽 미드필더',RM:'오른쪽 미드필더',LW:'왼쪽 윙어',RW:'오른쪽 윙어',CF:'세컨드 스트라이커',ST:'스트라이커'};
const POS_GROUP={GK:'GK',CB:'DF',LB:'DF',RB:'DF',LWB:'DF',RWB:'DF',CDM:'MF',CM:'MF',CAM:'MF',LM:'MF',RM:'MF',LW:'FW',RW:'FW',CF:'FW',ST:'FW'};
const POS_DEFAULT={GK:'GK',DF:'CB',MF:'CM',FW:'ST'};
function posStr(c){ return (c.pp||[c.pos]).join(' · '); }
function isPlayerCard(c){ return !!c&&(!c.kind||c.kind==='player'||c.kind==='legend'||c.kind==='special'); }
const POSD_BYNAME={};
const RARITY = {
  C:{n:'일반',  base:500,  odds:66, color:'#b4b4b4'},
  R:{n:'레어',  base:1200, odds:22, color:'#e6e6e6'},
  H:{n:'홀로',  base:3000, odds:8,  color:'#4cb3f0'},
  G:{n:'골드',  base:8000, odds:3,  color:'#e5a93b'},
  L:{n:'레전드',base:25000,odds:1,  color:'#c6f24e'},
  I:{n:'아이콘',base:60000,odds:0,  color:'#d4af37'},
};
// [이름, 국가, 포지션, 능력치, 등급]
const SETS = [...WC_SETS, ...EDITION_SETS, ...OLD_WC_SETS, ...OLD_EDITION_SETS, ...(typeof ICON_SETS!=='undefined'?ICON_SETS:[])];
SETS.forEach(s=>{ s.name=s.name.replace('스티커팩','카드팩'); s.short=s.short.replace('WC26 스티커 ','2026 ').replace('WC26 ','2026 ').replace('WC14 ','2014 ').replace('WC18 ','2018 '); });
const CARDS = {};
SETS.forEach(set=>{
  set.cards = set.players.map((p,i)=>{
    const o = Array.isArray(p) ? {name:p[0],nat:p[1],pos:p[2],rating:p[3],rar:p[4]} : p;
    const {name,nat,pos,rating,rar} = o;
    const id = set.id+'-'+String(i+1).padStart(3,'0');
    const price = Math.max(500, Math.round(RARITY[rar].base * (1+Math.max(0,rating-70)/40) * (o.mult||1) /100)*100);
    const c = Object.assign({}, o, {id,set:set.id,no:i+1,total:set.players.length,name,nat,pos,rating,rar,price,
      style:set.style||'classic', num: ((rating*7+i*13)%23)+1});
    if(o.pp&&!c.pp) c.pp=o.pp.slice();
    if(isPlayerCard(c)&&!o.pp){ const pk=(typeof POSD!=='undefined'&&(POSD[o.img||id]||POSD_BYNAME[nat+'|'+name]))||''; c.pp=pk?pk.split(','):[POS_DEFAULT[c.pos]||'CM']; c.pos=POS_GROUP[c.pp[0]]||c.pos; if(pk&&!POSD_BYNAME[nat+'|'+name]) POSD_BYNAME[nat+'|'+name]=pk; }
    if(c.kind==='emblem') c.name=NATIONS[nat].n+' 엠블럼';
    if(c.kind==='team') c.name=NATIONS[nat].n+' 대표팀';
    c.img = o.img || id;
    CARDS[id]=c; return c;
  });
});
const FRIENDS = [
  {id:'minjun', name:'민준', avatar:['#bcd3f5','#2b2b2b'], likes:['KOR','ENG'], greet:'내 카드북 봐 봐! 손흥민 카드 모으는 중이야.'},
  {id:'seoyeon', name:'서연', avatar:['#f5c6da','#5a3a1a'], likes:['ARG','ESP'], greet:'메시랑 야말 카드 있으면 바꿔 줄래?'},
  {id:'jiho', name:'지호', avatar:['#c9eacc','#1a1a1a'], likes:['BRA','FRA'], greet:'음바페 카드는 절대 안 바꿔 줄 거야… 아마도.'},
];
/* 팩 기대값 기반 가격 (기대 카드 가치의 약 115%, 500원 단위) */
SETS.forEach(set=>{
  const order=['C','R','H','G','L'];
  const ev=(minR)=>{ const pool=order.filter(r=>order.indexOf(r)>=order.indexOf(minR)); const tot=pool.reduce((a,r)=>a+RARITY[r].odds,0);
    let v=0; pool.forEach(r=>{ let cs=set.cards.filter(c=>c.rar===r); if(!cs.length) cs=set.cards; v+= (RARITY[r].odds/tot) * cs.reduce((a,c)=>a+c.price,0)/cs.length; }); return v; };
  let total=ev('C')*5+ev('R');
  if(set.guar){ const g=set.cards.filter(c=>set.guar(c)); total=ev('C')*5+g.reduce((a,c)=>a+c.price,0)/g.length; }
  set.ev=Math.round(total); set.price=set.fixedPrice||Math.ceil(total*1.15/500)*500;
  if(set.style==='icon'){ set.ev=Math.round(set.cards.reduce((a,c)=>a+c.price,0)/set.cards.length+5*6000); }
});
