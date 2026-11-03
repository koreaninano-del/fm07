/* ====== 토너먼트 결과 기반 스페셜 에디션 ====== */
const R32="RSA CAN GER PAR NED MAR BRA JPN FRA SWE CIV NOR MEX ECU ENG COD USA BIH BEL SEN POR CRO ESP AUT SUI ALG ARG CPV COL GHA AUS EGY".split(' ');
const R16="CAN PAR MAR BRA FRA NOR MEX ENG USA BEL POR ESP SUI ARG COL EGY".split(' ');
const QF="FRA MAR ESP BEL NOR ENG ARG SUI".split(' ');
const SF="FRA ESP ENG ARG".split(' ');
const BEST_XI=[['ESP','우나이 시몬'],['ESP','마르크 쿠쿠레야'],['ARG','크리스티안 로메로'],['ESP','페드로 포로'],['ESP','로드리'],['ENG','주드 벨링엄'],['FRA','마이클 올리세'],['FRA','킬리안 음바페'],['NOR','엘링 홀란'],['ARG','리오넬 메시']];
const AWARDS=[['ESP','로드리','골든볼 · 대회 MVP',4],['ARG','리오넬 메시','실버볼 · 실버부트 8골',4],['FRA','킬리안 음바페','브론즈볼 · 골든부트 10골',4.5],['ESP','우나이 시몬','골든글러브 · 최우수 GK',3.5],['ENG','주드 벨링엄','브론즈부트 7골',3],['NOR','엘링 홀란','득점 공동 3위 7골',3],['ENG','해리 케인','득점 5위 6골',2.5],['FRA','우스만 뎀벨레','득점 5위 6골',2.5]];
const RANK=['C','R','H','G','L'];
function bump(r,n){ return RANK[Math.min(4,RANK.indexOf(r)+n)]; }
function findBase(nat,name){ for(const s of WC_SETS){ if(!s.group) continue; const i=s.players.findIndex(p=>p.nat===nat&&p.name===name&&p.kind==='player'); if(i>=0) return {set:s,idx:i,p:s.players[i]}; } return null; }
function variantsOf(teams,ed,bumpN,mult,kinds){
  const out=[];
  WC_SETS.filter(s=>s.group).forEach(s=>s.players.forEach((p,i)=>{
    if(!teams.includes(p.nat)) return; if(!kinds.includes(p.kind)) return;
    out.push(Object.assign({},p,{rar:bump(p.rar,bumpN),mult,edition:ed,img:s.id+'-'+String(i+1).padStart(3,'0'),kind:p.kind}));
  }));
  return out;
}
const EDITION_SETS=[];
EDITION_SETS.push({id:'ED32',name:'32강 진출팀 실버 에디션',short:'32강 실버',year:2026,theme:['#8d99a6','#3b4652'],icon:'🥈',style:'sticker',
  players:variantsOf(R32,'R32',0,1.8,['player','emblem'])});
EDITION_SETS.push({id:'ED16',name:'16강 진출팀 블루 크롬 에디션',short:'16강 블루',year:2026,theme:['#2563eb','#0b1e4d'],icon:'💎',style:'sticker',
  players:variantsOf(R16,'R16',0,2.5,['player','emblem'])});
EDITION_SETS.push({id:'ED8',name:'8강 진출팀 퍼플 홀로 에디션',short:'8강 퍼플',year:2026,theme:['#7c3aed','#2e1065'],icon:'🔮',style:'sticker',
  players:variantsOf(QF,'QF',1,1.6,['player','emblem'])});
EDITION_SETS.push({id:'ED4',name:'4강 레드 파이어 에디션',short:'4강 레드',year:2026,theme:['#dc2626','#450a0a'],icon:'🔥',style:'sticker',
  players:variantsOf(SF,'SF',1,2,['player','emblem'])});
EDITION_SETS.push({id:'EDCH',name:'챔피언 골드 에디션 (우승 스페인 · 준우승 아르헨티나)',short:'챔피언 골드',year:2026,theme:['#d4a017','#5a3e00'],icon:'🏆',style:'sticker',
  players:variantsOf(['ESP','ARG'],'CHAMP',1,2.5,['player','emblem','team'])});
// 베스트 일레븐 팩: 4강 팀 레드 에디션 + 개인상 카드 + 베스트 XI 레인보우 (마지막 1장 보장)
const xi=BEST_XI.map(([nat,name])=>{ const b=findBase(nat,name); return Object.assign({},b.p,{rar:'L',mult:8,ultra:true,edition:'XI',img:b.set.id+'-'+String(b.idx+1).padStart(3,'0'),kind:'player',name:b.p.name+' · 베스트 XI'}); });
const aw=AWARDS.map(([nat,name,label,m])=>{ const b=findBase(nat,name); return Object.assign({},b.p,{rar:'L',mult:m*2.2,ultra:true,edition:'AWARD',award:label,img:b.set.id+'-'+String(b.idx+1).padStart(3,'0'),kind:'player',name:b.p.name+' · '+label.split(' ')[0]}); });
EDITION_SETS.push({id:'EDXI',name:'베스트 일레븐 팩 (베스트 XI 1장 보장)',short:'베스트 XI',year:2026,theme:['#ff2d95','#1e1b4b'],icon:'⭐',style:'sticker',
  players:[...variantsOf(SF,'SF',1,2,['player']),...aw,...xi], guar:c=>c.edition==='XI'});

/* ====== 2014 · 2018 실제 대회 결과 기반 스페셜 에디션 ====== */
function findBaseIn(sets,nat,name){ for(const s of sets){ if(!s.group) continue; const i=s.players.findIndex(p=>p.nat===nat&&p.name===name&&p.kind==='player'); if(i>=0) return {set:s,idx:i,p:s.players[i]}; } return null; }
function variantsIn(sets,teams,ed,bumpN,mult,kinds){
  const out=[];
  sets.filter(s=>s.group).forEach(s=>s.players.forEach((p,i)=>{
    if(!teams.includes(p.nat)) return; if(!kinds.includes(p.kind)) return;
    out.push(Object.assign({},p,{rar:bump(p.rar,bumpN),mult,edition:ed,img:s.id+'-'+String(i+1).padStart(3,'0'),kind:p.kind}));
  }));
  return out;
}
function buildOldEditions(year,tag,sets,R16x,QFx,SFx,finalists,champLabel,xiList,awardList){
  const xi=xiList.map(([nat,name])=>findBaseIn(sets,nat,name)).filter(Boolean).map(b=>Object.assign({},b.p,{rar:'L',mult:8,ultra:true,edition:'XI',img:b.set.id+'-'+String(b.idx+1).padStart(3,'0'),kind:'player',name:b.p.name+' · 베스트 XI'}));
  const aw=awardList.map(([nat,name,label,m])=>{ const b=findBaseIn(sets,nat,name); return b&&Object.assign({},b.p,{rar:'L',mult:m*2.2,ultra:true,edition:'AWARD',award:label,img:b.set.id+'-'+String(b.idx+1).padStart(3,'0'),kind:'player',name:b.p.name+' · '+label.split(' ')[0]}); }).filter(Boolean);
  return [
    {id:tag+'R16',name:`${year} 16강 진출팀 블루 크롬 에디션`,short:`${year} 16강 블루`,year,theme:['#2563eb','#0b1e4d'],icon:'💎',style:'sticker',players:variantsIn(sets,R16x,'R16',0,2.5,['player','emblem'])},
    {id:tag+'QF',name:`${year} 8강 진출팀 퍼플 홀로 에디션`,short:`${year} 8강 퍼플`,year,theme:['#7c3aed','#2e1065'],icon:'🔮',style:'sticker',players:variantsIn(sets,QFx,'QF',1,1.6,['player','emblem'])},
    {id:tag+'SF',name:`${year} 4강 레드 파이어 에디션`,short:`${year} 4강 레드`,year,theme:['#dc2626','#450a0a'],icon:'🔥',style:'sticker',players:variantsIn(sets,SFx,'SF',1,2,['player','emblem'])},
    {id:tag+'CH',name:`${year} 챔피언 골드 에디션 (${champLabel})`,short:`${year} 챔피언 골드`,year,theme:['#d4a017','#5a3e00'],icon:'🏆',style:'sticker',players:variantsIn(sets,finalists,'CHAMP',1,2.5,['player','emblem','team'])},
    {id:tag+'XI',name:`${year} 베스트 일레븐 팩 (베스트 XI 1장 보장)`,short:`${year} 베스트 XI`,year,theme:['#ff2d95','#1e1b4b'],icon:'⭐',style:'sticker',players:[...variantsIn(sets,SFx,'SF',1,2,['player']),...aw,...xi],guar:c=>c.edition==='XI'}
  ];
}
const WC14_SETS=OLD_WC_SETS.filter(s=>s.year===2014), WC18_SETS=OLD_WC_SETS.filter(s=>s.year===2018);
// 2014 브라질: 우승 독일, 준우승 아르헨티나, 3위 네덜란드
const OLD_EDITION_SETS=[
  ...buildOldEditions(2014,'E14',WC14_SETS,
    "BRA CHI COL URU FRA NGA GER ALG NED MEX CRC GRE ARG SUI BEL USA".split(' '),
    "BRA COL FRA GER NED CRC ARG BEL".split(' '),
    "BRA GER NED ARG".split(' '),
    ['GER','ARG'],'우승 독일 · 준우승 아르헨티나',
    [['GER','마누엘 노이어'],['GER','필리프 람'],['GER','마츠 후멜스'],['BRA','치아구 실바'],['BRA','마르셀루'],['GER','토니 크로스'],['ARG','앙헬 디 마리아'],['COL','하메스 로드리게스'],['GER','토마스 뮐러'],['NED','아르연 로번'],['ARG','리오넬 메시']],
    [['ARG','리오넬 메시','골든볼 · 대회 MVP',4],['NED','아르연 로번','실버볼',3.5],['COL','하메스 로드리게스','브론즈볼 · 골든부트 6골',4],['GER','토마스 뮐러','실버부트 5골',3],['BRA','네이마르 주니오르','브론즈부트 4골',3],['GER','마누엘 노이어','골든글러브 · 최우수 GK',3.5],['FRA','폴 포그바','영플레이어상',2.5],['GER','미로슬라프 클로제','월드컵 통산 최다 16골',3]]),
  // 2018 러시아: 우승 프랑스, 준우승 크로아티아, 3위 벨기에
  ...buildOldEditions(2018,'E18',WC18_SETS,
    "URU POR FRA ARG BRA MEX BEL JPN ESP RUS CRO DEN SWE SUI COL ENG".split(' '),
    "URU FRA BRA BEL RUS CRO SWE ENG".split(' '),
    "FRA BEL CRO ENG".split(' '),
    ['FRA','CRO'],'우승 프랑스 · 준우승 크로아티아',
    [['BEL','티보 쿠르투아'],['FRA','라파엘 바란'],['URU','디에고 고딘'],['ESP','세르히오 라모스'],['FRA','은골로 캉테'],['CRO','루카 모드리치'],['BEL','케빈 더브라위너'],['BEL','에덴 아자르'],['FRA','앙투안 그리즈만'],['ENG','해리 케인'],['FRA','킬리안 음바페']],
    [['CRO','루카 모드리치','골든볼 · 대회 MVP',4],['BEL','에덴 아자르','실버볼',3.5],['FRA','앙투안 그리즈만','브론즈볼 · 실버부트 4골',3.5],['ENG','해리 케인','골든부트 6골',4],['BEL','로멜루 루카쿠','브론즈부트 4골',3],['BEL','티보 쿠르투아','골든글러브 · 최우수 GK',3.5],['FRA','킬리안 음바페','영플레이어상',3.5],['CRO','이반 페리시치','결승전 득점',2.5]])
];

/* ====== 울트라 레어: 챔피언 에디션 상위 15명 (누끼 컷아웃 카드) ====== */
function markUltra(set,n){ set.players.filter(p=>p.kind==='player').sort((a,b)=>b.rating-a.rating).slice(0,n).forEach(p=>{ p.ultra=true; p.rar='L'; p.mult=6; }); }
[...EDITION_SETS,...OLD_EDITION_SETS].filter(s=>/CH$/.test(s.id)).forEach(s=>markUltra(s,15));
