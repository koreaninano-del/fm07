/* ====== 카드 렌더링 (SVG) ====== */
function hashStr(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h;}
function flagSVG(nat,w,h){
  const f=NATIONS[nat].flag; const t=f[0]; let s='';
  const rect=(x,y,ww,hh,c)=>`<rect x="${x}" y="${y}" width="${ww}" height="${hh}" fill="${c}"/>`;
  if(t==='h'){const cs=f.slice(1);const hh=h/cs.length;cs.forEach((c,i)=>s+=rect(0,i*hh,w,hh+0.3,c));}
  else if(t==='h2'){s+=rect(0,0,w,h/2,f[1])+rect(0,h/2,w,h/4,f[2])+rect(0,h*0.75,w,h/4,f[3]);}
  else if(t==='v'){const cs=f.slice(1);const ww=w/cs.length;cs.forEach((c,i)=>s+=rect(i*ww,0,ww+0.3,h,c));}
  else if(t==='v2'){s+=rect(0,0,w*0.4,h,f[1])+rect(w*0.4,0,w*0.6,h,f[2]);}
  else if(t==='cross'){s+=rect(0,0,w,h,f[1]);const cw=h*0.18;const cx=w*0.36;s+=rect(cx-cw/2,0,cw,h,f[2])+rect(0,h/2-cw/2,w,cw,f[2]);if(f[3]){const iw=cw*0.45;s+=rect(cx-iw/2,0,iw,h,f[3])+rect(0,h/2-iw/2,w,iw,f[3]);}}
  else if(t==='circle'){s+=rect(0,0,w,h,f[1])+`<circle cx="${w/2}" cy="${h/2}" r="${h*0.3}" fill="${f[2]}"/>`;}
  else if(t==='bra'){s+=rect(0,0,w,h,'#009c3b')+`<polygon points="${w/2},${h*0.1} ${w*0.9},${h/2} ${w/2},${h*0.9} ${w*0.1},${h/2}" fill="#ffdf00"/><circle cx="${w/2}" cy="${h/2}" r="${h*0.22}" fill="#002776"/>`;}
  else if(t==='kor'){s+=rect(0,0,w,h,'#fff')+`<circle cx="${w/2}" cy="${h/2}" r="${h*0.26}" fill="#cd2e3a"/><path d="M${w/2-h*0.26},${h/2} a${h*0.26},${h*0.26} 0 0 0 ${h*0.52},0 a${h*0.13},${h*0.13} 0 0 0 -${h*0.26},0 a${h*0.13},${h*0.13} 0 0 1 -${h*0.26},0z" fill="#0047a0"/>`+rect(w*0.08,h*0.12,w*0.14,h*0.05,'#000')+rect(w*0.08,h*0.22,w*0.14,h*0.05,'#000')+rect(w*0.08,h*0.32,w*0.14,h*0.05,'#000')+rect(w*0.78,h*0.63,w*0.14,h*0.05,'#000')+rect(w*0.78,h*0.73,w*0.14,h*0.05,'#000')+rect(w*0.78,h*0.83,w*0.14,h*0.05,'#000');}
  else if(t==='chi'){s+=rect(0,0,w,h/2,'#fff')+rect(0,h/2,w,h/2,'#d52b1e')+rect(0,0,w/3,h/2,'#0039a6')+`<text x="${w/6}" y="${h*0.36}" font-size="${h*0.3}" text-anchor="middle" fill="#fff">★</text>`;}
  else if(t==='sui'){s+=rect(0,0,w,h,'#d52b1e')+rect(w/2-w*0.08,h*0.2,w*0.16,h*0.6,'#fff')+rect(w*0.2,h/2-h*0.12,w*0.6,h*0.24,'#fff');}
  else if(t==='mar'){s+=rect(0,0,w,h,'#c1272d')+`<text x="${w/2}" y="${h*0.72}" font-size="${h*0.6}" text-anchor="middle" fill="#006233">★</text>`;}
  else if(t==='usa'){for(let i=0;i<7;i++)s+=rect(0,i*h/7,w,h/7+0.3,i%2?'#fff':'#b22234');s+=rect(0,0,w*0.42,h*0.54,'#3c3b6e');}
  else if(t==='sco'){s+=rect(0,0,w,h,'#0065bd')+`<path d="M0,0 L${w},${h} M${w},0 L0,${h}" stroke="#fff" stroke-width="${h*0.18}"/>`;}
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" shape-rendering="crispEdges"><g>${s}</g><rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1"/></svg>`;
}
// 픽셀 선수 스프라이트 (16x22 그리드)
function playerSprite(card,px){
  const nat=NATIONS[card.nat]; const h=hashStr(card.name+card.set);
  const hairCols=['#2b1d12','#000','#5a3a1a','#c89a3a','#8a3b1a','#3b2a20','#1a1a1a','#d8c08a','#4b2f1a','#6b4a2a'];
  const hair=hairCols[h%hairCols.length]; const skin=nat.sk; const kit=nat.kit[0], kit2=nat.kit[1];
  const style=h%4; // 머리 스타일
  const short=card.pos==='GK'? '#2a2a2a' : kit2;
  const P=[]; const r=(x,y,w,hh,c)=>P.push(`<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="${c}"/>`);
  // 머리
  r(5,1,6,1,hair); r(4,2,8,1,hair); r(4,3,8,4,skin);
  if(style===0){r(4,2,8,2,hair);r(3,3,1,2,hair);r(12,3,1,2,hair);}
  else if(style===1){r(4,2,8,1,hair);r(4,3,1,3,hair);r(11,3,1,3,hair);}
  else if(style===2){r(3,1,10,2,hair);r(3,3,1,2,hair);r(12,3,1,2,hair);r(5,3,6,1,hair);}
  else {r(5,0,6,2,hair);r(4,2,8,1,hair);}
  r(6,5,1,1,'#1a1a1a'); r(9,5,1,1,'#1a1a1a'); // 눈
  r(7,7,2,1,skin); // 목
  // 몸통(유니폼)
  r(4,8,8,6,kit); r(2,8,2,3,kit); r(12,8,2,3,kit);
  r(4,8,1,6,kit2); r(11,8,1,6,kit2); r(7,8,2,1,kit2);
  r(2,11,2,2,skin); r(12,11,2,2,skin); // 손
  // 등번호
  const n=String(card.num); r(6,10,4,3,kit2);
  // 바지
  r(4,14,8,3,short); r(4,17,3,4,skin); r(9,17,3,4,skin);
  r(4,21,3,1,'#1a1a1a'); r(9,21,3,1,'#1a1a1a'); // 신발
  const s=P.join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 22" width="${px}" height="${px*22/16}" shape-rendering="crispEdges">${s}<text x="8" y="12.6" font-size="2.6" font-family="monospace" font-weight="bold" text-anchor="middle" fill="${kit}">${n}</text></svg>`;
}
var cardSVG=function(card, w){
  w=w||200; const h=w*1.4; const set=SETS.find(s=>s.id===card.set); const nat=NATIONS[card.nat];
  const rar=card.rar; const R=RARITY[rar]; const uid='c'+hashStr(card.id)+Math.floor(Math.random()*1e6);
  const frame = rar==='G'?'#d4a017': rar==='L'?`url(#rb${uid})`: rar==='H'?'#a78bfa': rar==='R'?'#3b82c4':'#cfd6d2';
  const defs=`<defs>
    <linearGradient id="bg${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${set.theme[0]}"/><stop offset="1" stop-color="${set.theme[1]}"/></linearGradient>
    <linearGradient id="rb${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5e5e"/><stop offset=".3" stop-color="#ffd84d"/><stop offset=".55" stop-color="#5dff9a"/><stop offset=".8" stop-color="#5db9ff"/><stop offset="1" stop-color="#d45dff"/></linearGradient>
    <linearGradient id="holo${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#c7f" stop-opacity=".35"/><stop offset=".55" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <pattern id="grass${uid}" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#2e9e4a"/><rect width="3" height="6" fill="#36b254"/></pattern>
  </defs>`;
  const k=w/200; // 스케일
  const sTop=30*k, sH=h*0.46, sBot=sTop+sH;
  const stadium=`<rect x="${8*k}" y="${sTop}" width="${w-16*k}" height="${sH}" fill="url(#bg${uid})"/>
    <g opacity=".35">${Array.from({length:7}).map((_,i)=>`<rect x="${8*k}" y="${sTop+4*k+i*9*k}" width="${w-16*k}" height="${3*k}" fill="#fff" opacity="${0.15+i*0.05}"/>`).join('')}</g>
    <rect x="${8*k}" y="${sBot-22*k}" width="${w-16*k}" height="${22*k}" fill="url(#grass${uid})"/>
    <rect x="${w/2-30*k}" y="${sBot-22*k}" width="${60*k}" height="${1.5*k}" fill="#fff" opacity=".7"/>`;
  const spW=w*0.42; const sprite=playerSprite(card,spW);
  const spriteY=sBot-spW*22/16+4*k;
  const holo = rar==='H'||rar==='G'||rar==='L' ? `<rect x="0" y="0" width="${w}" height="${h}" fill="url(#holo${uid})" class="holo-layer"/>` : '';
  const goldDots = rar==='G'||rar==='L' ? Array.from({length:14}).map((_,i)=>`<circle cx="${(hashStr(card.id+i)%(w-20*k))+10*k}" cy="${(hashStr(card.id+'y'+i)%(sH-10*k))+sTop+5*k}" r="${1.4*k}" fill="#fff" opacity=".8"/>`).join('') : '';
  const fy=h-46*k; const flag=flagSVG(card.nat,30*k,20*k).replace('<svg ','<svg x="'+(14*k)+'" y="'+fy+'" ');
  const stars=Math.max(1,Math.min(5,Math.round((card.rating-70)/5)));
  const nameSize=(card.name.length>8?11:card.name.length>6?13:15)*k;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="card-svg rar-${rar}">${defs}
    <rect x="0" y="0" width="${w}" height="${h}" rx="${8*k}" fill="${frame}"/>
    <rect x="${5*k}" y="${5*k}" width="${w-10*k}" height="${h-10*k}" rx="${5*k}" fill="#fbf7ea"/>
    <rect x="${8*k}" y="${8*k}" width="${w-16*k}" height="${20*k}" rx="${2*k}" fill="${set.theme[0]}"/>
    <text x="${12*k}" y="${22*k}" font-size="${9*k}" font-family="sans-serif" font-weight="bold" fill="#fff">${set.icon} ${set.short}</text>
    <text x="${w-12*k}" y="${22*k}" font-size="${8*k}" font-family="monospace" text-anchor="end" fill="#fff" opacity=".9">${String(card.no).padStart(3,'0')}/${card.total}</text>
    ${stadium}
    <g transform="translate(${w/2-spW/2},${spriteY})">${sprite}</g>
    ${goldDots}
    <text x="${w/2}" y="${sBot+17*k}" font-size="${nameSize}" font-family="sans-serif" font-weight="800" text-anchor="middle" fill="#1f2a24">${card.name}</text>
    ${flag}
    <text x="${48*k}" y="${fy+9*k}" font-size="${9*k}" font-family="sans-serif" font-weight="bold" fill="#333">${nat.n}</text>
    <text x="${48*k}" y="${fy+19*k}" font-size="${8*k}" font-family="sans-serif" fill="#666">${POS_KO[card.pos]} · No.${card.num}</text>
    <circle cx="${w-30*k}" cy="${fy+10*k}" r="${15*k}" fill="${set.theme[0]}"/><circle cx="${w-30*k}" cy="${fy+10*k}" r="${12*k}" fill="#fff"/>
    <text x="${w-30*k}" y="${fy+15*k}" font-size="${13*k}" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="${set.theme[0]}">${card.rating}</text>
    <text x="${w/2}" y="${h-11*k}" font-size="${8*k}" font-family="sans-serif" text-anchor="middle" fill="${R.color}" font-weight="bold">${'★'.repeat(stars)} ${R.n}</text>
    ${holo}
    ${rar==='L'?`<rect x="${2.5*k}" y="${2.5*k}" width="${w-5*k}" height="${h-5*k}" rx="${7*k}" fill="none" stroke="#fff" stroke-width="${k}" opacity=".8"/>`:''}
  </svg>`;
}

/* ====== 월드컵 2026 스티커 스타일 ====== */
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
function stickerSVG(card,w){
  const h=w*1.4, k=w/200; const nat=NATIONS[card.nat]||NATIONS.FIFA; const uid='s'+hashStr(card.id)+Math.floor(Math.random()*1e6);
  const R=RARITY[card.rar]; const kind=card.kind||'player';
  const teal='#1fb3ad', teal2='#0f7f8a';
  const frame = card.rar==='L'?`url(#rb${uid})`: card.rar==='G'?'#d4a017': card.rar==='H'?'#a78bfa': card.rar==='R'?'#3b82c4':'#e8eef0';
  const defs=`<defs>
   <linearGradient id="bg${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${teal}"/><stop offset="1" stop-color="${teal2}"/></linearGradient>
   <linearGradient id="rb${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5e5e"/><stop offset=".3" stop-color="#ffd84d"/><stop offset=".55" stop-color="#5dff9a"/><stop offset=".8" stop-color="#5db9ff"/><stop offset="1" stop-color="#d45dff"/></linearGradient>
   <linearGradient id="gold${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e27a"/><stop offset=".5" stop-color="#d4a017"/><stop offset="1" stop-color="#f6e27a"/></linearGradient>
   <linearGradient id="holo${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#c7f" stop-opacity=".35"/><stop offset=".55" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
   <pattern id="shim${uid}" width="${12*k}" height="${12*k}" patternUnits="userSpaceOnUse"><rect width="${12*k}" height="${12*k}" fill="#d9dde3"/><rect width="${6*k}" height="${6*k}" fill="#eef1f5"/><rect x="${6*k}" y="${6*k}" width="${6*k}" height="${6*k}" fill="#c3cad3"/></pattern>
   <clipPath id="cp${uid}"><rect x="${6*k}" y="${6*k}" width="${w-12*k}" height="${h-12*k}" rx="${6*k}"/></clipPath>
  </defs>`;
  const kit=nat.kit[0], kit2=nat.kit[1];
  const flag=flagSVG(card.nat==='FIFA'?'FRA':card.nat,28*k,19*k).replace('<svg ','<svg x="'+(w-40*k)+'" y="'+(h-62*k)+'" ');
  const mark=`<g transform="translate(${w-46*k},${12*k})"><rect width="${34*k}" height="${22*k}" rx="${4*k}" fill="#fff" opacity=".92"/><text x="${17*k}" y="${16*k}" font-size="${13*k}" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="${teal2}">26</text></g>`;
  const code=card.nat==='FIFA'?'FIFA':card.nat;
  const vert=`<text transform="translate(${w-12*k},${h*0.52}) rotate(90)" font-size="${30*k}" font-family="sans-serif" font-weight="900" fill="#fff" opacity=".35" text-anchor="middle">${code}</text>`;
  let body='';
  const holo = (card.rar==='H'||card.rar==='G'||card.rar==='L') ? `<rect x="0" y="0" width="${w}" height="${h}" fill="url(#holo${uid})" class="holo-layer"/>` : '';
  if(kind==='player'||kind==='legend'||kind==='special'){
    const gold = kind==='legend';
    const bg = gold?`url(#gold${uid})`: kind==='special'?'#2b2f3a':`url(#bg${uid})`;
    // 26 모양 블롭
    const blob = kind==='special'?'':`<circle cx="${w*0.28}" cy="${h*0.33}" r="${w*0.3}" fill="${kit}" opacity=".9"/><rect x="${w*0.45}" y="${h*0.12}" width="${w*0.42}" height="${h*0.4}" rx="${w*0.1}" fill="${kit2}" opacity=".85"/><circle cx="${w*0.7}" cy="${h*0.45}" r="${w*0.2}" fill="${kit}" opacity=".9"/>`;
    const spW=w*0.78; const sprite=playerSprite(card,spW);
    const sprY=h*0.11; // 상반신이 보이도록 하단은 밴드에 가려짐
    const band1=`<rect x="${12*k}" y="${h*0.62}" width="${w-24*k}" height="${26*k}" rx="${13*k}" fill="${gold?'#7a1f1f':kind==='special'?'#111':'#d8323c'}"/>`;
    const parts=card.name.split(' '); const last=parts.length>1?parts.pop():''; const first=parts.join(' ');
    const nameSize=(card.name.length>9?11:card.name.length>7?13:15)*k;
    const nameT=`<text x="${w/2}" y="${h*0.62+18*k}" font-size="${nameSize}" font-family="sans-serif" text-anchor="middle" fill="#fff"><tspan font-weight="500">${esc(first)}</tspan>${last?` <tspan font-weight="900">${esc(last)}</tspan>`:''}</text>`;
    const info = card.dob? `${card.dob} | ${card.h.replace(',','.')} m | ${card.w} kg` : `${POS_KO[card.pos]} · 능력치 ${card.rating}`;
    const band2=`<rect x="${20*k}" y="${h*0.62+30*k}" width="${w-40*k}" height="${18*k}" rx="${9*k}" fill="#fff" opacity=".9"/><text x="${w/2}" y="${h*0.62+43*k}" font-size="${8.5*k}" font-family="sans-serif" text-anchor="middle" fill="#222">${esc(info)}</text>`;
    const club = card.club || (kind==='legend'?'LEGEND':kind==='special'?'SPECIAL':NATIONS[card.nat].n);
    const band3=`<rect x="${12*k}" y="${h-36*k}" width="${w-24*k-44*k}" height="${18*k}" rx="${9*k}" fill="${gold?'#5a3a00':'#15323a'}"/><text x="${(w-44*k)/2}" y="${h-23*k}" font-size="${(club.length>22?6:7.5)*k}" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#fff">${esc(club)}</text>`;
    const badge=`<circle cx="${w-30*k}" cy="${h-27*k}" r="${13*k}" fill="#fff"/><text x="${w-30*k}" y="${h-22*k}" font-size="${12*k}" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="${teal2}">${card.rating}</text>`;
    body=`<rect x="${6*k}" y="${6*k}" width="${w-12*k}" height="${h-12*k}" rx="${6*k}" fill="${bg}"/>
      <g clip-path="url(#cp${uid})">${blob}${vert}<g transform="translate(${w/2-spW/2},${sprY})">${sprite}</g>
      <rect x="${6*k}" y="${h*0.6}" width="${w-12*k}" height="${h*0.4}" fill="${gold?'#b8860b':kind==='special'?'#1a1d26':teal2}" opacity=".55"/></g>
      ${mark}${band1}${nameT}${band2}${band3}${flag}${badge}
      ${gold?`<text x="${w/2}" y="${h*0.1}" font-size="${9*k}" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#7a1f1f">★ LEGEND ★</text>`:''}
      ${kind==='special'?`<text x="${w/2}" y="${h*0.1}" font-size="${9*k}" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#ffd84d">★ 스페셜 ★</text>`:''}`;
  } else if(kind==='emblem'){
    const fl=flagSVG(card.nat,70*k,47*k).replace('<svg ','<svg x="'+(w/2-35*k)+'" y="'+(h*0.36)+'" ');
    body=`<rect x="${6*k}" y="${6*k}" width="${w-12*k}" height="${h-12*k}" rx="${6*k}" fill="url(#shim${uid})"/>
      <text x="${w/2}" y="${30*k}" font-size="${9*k}" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#333">월드컵 2026 · 팀 엠블럼</text>
      <circle cx="${w/2}" cy="${h*0.47}" r="${w*0.32}" fill="#fff" stroke="${kit}" stroke-width="${6*k}"/><circle cx="${w/2}" cy="${h*0.47}" r="${w*0.26}" fill="none" stroke="${kit2}" stroke-width="${3*k}"/>
      ${fl}<text x="${w/2}" y="${h*0.47+42*k}" font-size="${(nat.n.length>6?10:13)*k}" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#222">${esc(nat.n)}</text>
      <rect x="${12*k}" y="${h-40*k}" width="${w-24*k}" height="${22*k}" rx="${11*k}" fill="${kit}"/><text x="${w/2}" y="${h-25*k}" font-size="${10*k}" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="${kit2}">${code} · ${card.rating}</text>${mark}`;
  } else if(kind==='team'||kind==='history'){
    const sepia=kind==='history'&&card.year<1990;
    const rows=[[0,4],[1,4],[2,3]]; let ppl='';
    rows.forEach(([r,n])=>{ for(let i=0;i<n;i++){ const fake={name:card.name+r+i,set:card.set,nat:card.nat,pos:'MF',num:i+r*4+1}; ppl+=`<g transform="translate(${w*0.12+i*(w*0.76/(n))+(n===3?w*0.1:0)},${h*0.18+r*h*0.14})">${playerSprite(fake,w*0.17)}</g>`; } });
    body=`<rect x="${6*k}" y="${6*k}" width="${w-12*k}" height="${h-12*k}" rx="${6*k}" fill="${kit2}"/>
      <rect x="${6*k}" y="${h*0.12}" width="${w-12*k}" height="${h*0.58}" fill="${sepia?'#c9b48a':'#3a9d4c'}"/>
      ${Array.from({length:6}).map((_,i)=>`<rect x="${6*k}" y="${h*0.12+i*h*0.097}" width="${w-12*k}" height="${h*0.05}" fill="${sepia?'#bca67d':'#45ad57'}"/>`).join('')}
      <g ${sepia?'opacity=".75"':''}>${ppl}</g>
      ${sepia?`<rect x="${6*k}" y="${h*0.12}" width="${w-12*k}" height="${h*0.58}" fill="#8b6b3a" opacity=".35"/>`:''}
      <text transform="translate(${w-14*k},${h*0.42}) rotate(90)" font-size="${22*k}" font-family="sans-serif" font-weight="900" fill="#fff" text-anchor="middle">${kind==='history'?card.year:'WE ARE'}</text>
      <rect x="${12*k}" y="${h-56*k}" width="${w-24*k}" height="${26*k}" rx="${13*k}" fill="${kind==='history'?'#8a6d1f':'#d8323c'}"/>
      <text x="${w/2}" y="${h-38*k}" font-size="${(card.name.length>9?11:13)*k}" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#fff">${esc(kind==='history'?card.name+' 우승':nat.n)}</text>
      <text x="${w/2}" y="${h-16*k}" font-size="${8*k}" font-family="sans-serif" text-anchor="middle" fill="#fff" opacity=".85">${kind==='history'?'월드컵 역대 우승팀':'월드컵 2026 · 팀 사진'}</text>${mark}
      ${flag.replace('y="'+(h-62*k)+'"','y="'+(14*k)+'"').replace('x="'+(w-40*k)+'"','x="'+(14*k)+'"')}`;
  } else {
    const emo = '';
    body=`<rect x="${6*k}" y="${6*k}" width="${w-12*k}" height="${h-12*k}" rx="${6*k}" fill="url(#shim${uid})"/>
      <circle cx="${w/2}" cy="${h*0.42}" r="${w*0.3}" fill="${kind==='trophy'?'#f6e27a':teal}" opacity=".9"/>
      <text x="${w/2}" y="${h*0.42+w*0.14}" font-size="${w*0.4}" text-anchor="middle">${emo}</text>
      <rect x="${12*k}" y="${h-56*k}" width="${w-24*k}" height="${26*k}" rx="${13*k}" fill="#15323a"/><text x="${w/2}" y="${h-38*k}" font-size="${12*k}" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="#fff">${esc(card.name)}</text>
      <text x="${w/2}" y="${h-16*k}" font-size="${8*k}" font-family="sans-serif" text-anchor="middle" fill="#333">월드컵 2026 공식 스티커</text>${mark}`;
  }
  const set=SETS.find(s=>s.id===card.set);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="card-svg rar-${card.rar}">${defs}
    <rect x="0" y="0" width="${w}" height="${h}" rx="${8*k}" fill="${frame}"/>${body}
    <text x="${12*k}" y="${h-6*k}" font-size="${6.5*k}" font-family="monospace" fill="#fff" opacity=".9">${String(card.no).padStart(3,'0')}/${card.total}</text>
    <text x="${w-12*k}" y="${h-6*k}" font-size="${6.5*k}" font-family="sans-serif" font-weight="bold" text-anchor="end" fill="${R.color}">${R.n}</text>
    ${holo}</svg>`;
}
const _classicSVG=cardSVG;
cardSVG=function(card,w){ return card.style==='sticker'? stickerSVG(card,w||200) : _classicSVG(card,w); };
const EDITION_INFO={
  R32:{n:'32강 실버 에디션',label:'32강',frame:'#9ca3af',frame2:'#2b2f36',metal:['#4b5563','#f3f4f6','#9ca3af','#e5e7eb','#4b5563'],ink:'#111'},
  R16:{n:'16강 블루 크롬 에디션',label:'16강',frame:'#4cb3f0',frame2:'#0b2a4a',metal:['#0b3a6b','#9fd8ff','#1d6fd1','#bfe6ff','#0b3a6b'],ink:'#06202e'},
  QF:{n:'8강 퍼플 홀로 에디션',label:'8강',frame:'#c084fc',frame2:'#2e1065',metal:['#4c1d95','#f3e8ff','#8b5cf6','#e9d5ff','#4c1d95'],ink:'#2e1065',holo:true},
  SF:{n:'4강 레드 파이어 에디션',label:'4강',frame:'#f87171',frame2:'#450a0a',metal:['#7f1d1d','#fecaca','#dc2626','#fca5a5','#7f1d1d'],ink:'#450a0a',fire:true},
  CHAMP:{n:'챔피언 골드 에디션',label:'챔피언',frame:'#e5a93b',frame2:'#3b2a08',metal:['#8a6512','#fff3c4','#d4a017','#ffe9a8','#8a6512'],ink:'#3b2a08',sparkle:true},
  XI:{n:'베스트 일레븐',label:'베스트 XI',frame:'#c6f24e',frame2:'#1b2607',metal:['#365314','#f7ffe0','#c6f24e','#ecfccb','#365314'],ink:'#1b2607',holo:true,sparkle:true},
  AWARD:{n:'개인상 수상',label:'개인상',frame:'#e5a93b',frame2:'#3b2a08',metal:['#8a6512','#fff3c4','#d4a017','#ffe9a8','#8a6512'],ink:'#3b2a08',sparkle:true},
};
const RAR_INK={C:'#b4b4b4',R:'#111111',H:'#06202e',G:'#2b1d05',L:'#1b2607'};
const RAR_BG={C:'#2a2a2a',R:'#e6e6e6',H:'#4cb3f0',G:'#e5a93b',L:'#c6f24e'};
function sparkleSVG(x,y,r,op){ return `<path d="M${x} ${y-r} Q${x} ${y} ${x+r} ${y} Q${x} ${y} ${x} ${y+r} Q${x} ${y} ${x-r} ${y} Q${x} ${y} ${x} ${y-r}Z" fill="#fff" opacity="${op}"/>`; }
function imageCardSVG(card,w){
  const h=Math.round(w*1.33); const k=w/200; const R=RARITY[card.rar]; const uid='i'+hashStr(card.id)+Math.floor(Math.random()*1e6);
  const ed=card.edition?EDITION_INFO[card.edition]:null;
  const bw=(ed?7:4)*k, foot=20*k, tabH=ed?16*k:0;
  const photoY=bw+tabH, photoH=h-bw-foot-photoY;
  if(!ed){
    const bg=RAR_BG[card.rar], ink=RAR_INK[card.rar];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="card-svg rar-${card.rar}"><defs><clipPath id="cp${uid}"><rect x="${bw}" y="${bw}" width="${w-2*bw}" height="${h-2*bw-foot}" rx="${4*k}"/></clipPath></defs>
   <rect x="0" y="0" width="${w}" height="${h}" rx="${8*k}" fill="#1a1a1a"/>
   <g clip-path="url(#cp${uid})"><image href="${IMG[card.img||card.id]}" x="${bw}" y="${bw}" width="${w-2*bw}" height="${h-2*bw-foot}" preserveAspectRatio="xMidYMid slice"/></g>
   <rect x="${bw}" y="${h-bw-foot}" width="${w-2*bw}" height="${foot}" rx="${4*k}" fill="${bg}"/>
   <text x="${10*k}" y="${h-bw-foot+13.5*k}" font-size="${8*k}" font-family="Inter, sans-serif" fill="${ink}" font-variant-numeric="tabular-nums">${String(card.no).padStart(3,'0')} / ${card.total}</text>
   <text x="${w-10*k}" y="${h-bw-foot+13.5*k}" font-size="${8*k}" font-family="Inter, sans-serif" font-weight="600" text-anchor="end" fill="${ink}">${R.n}</text></svg>`;
  }
  // ---- 스페셜 에디션: 원본 컬러 사진 + 메탈/홀로 프레임 ----
  const m=ed.metal; const stops=m.map((c,i)=>`<stop offset="${(i/(m.length-1)*100).toFixed(0)}%" stop-color="${c}"/>`).join('');
  const holo=ed.holo?`<linearGradient id="ho${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff5bd1"/><stop offset="20%" stop-color="#ffd166"/><stop offset="40%" stop-color="#7cffb0"/><stop offset="60%" stop-color="#6ec6ff"/><stop offset="80%" stop-color="#c58cff"/><stop offset="100%" stop-color="#ff5bd1"/></linearGradient>`:'';
  const sp=[]; if(ed.sparkle||ed.holo){ const hs=hashStr(card.id); for(let i=0;i<6;i++){ const x=bw+((hs*(i*7+3))%97)/97*(w-2*bw); const y=photoY+((hs*(i*11+5))%89)/89*photoH*0.55; const r=(2+((hs>>i)&3))*k; sp.push(sparkleSVG(x,y,r,0.85)); } }
  const fire=ed.fire?`<rect x="${bw}" y="${photoY+photoH*0.55}" width="${w-2*bw}" height="${photoH*0.45}" fill="url(#fi${uid})"/>`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" class="card-svg rar-${card.rar} ed"><defs>
   <linearGradient id="mt${uid}" x1="0" y1="0" x2="1" y2="1">${stops}</linearGradient>
   <linearGradient id="sh${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0"/><stop offset="42%" stop-color="#fff" stop-opacity="0"/><stop offset="50%" stop-color="#fff" stop-opacity=".35"/><stop offset="58%" stop-color="#fff" stop-opacity="0"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient>
   <linearGradient id="vg${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="70%" stop-color="${ed.frame2}" stop-opacity="0"/><stop offset="100%" stop-color="${ed.frame2}" stop-opacity=".55"/></linearGradient>
   ${ed.fire?`<linearGradient id="fi${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ff7a00" stop-opacity="0"/><stop offset="100%" stop-color="#ff3b00" stop-opacity=".55"/></linearGradient>`:''}
   ${holo}
   <clipPath id="cp${uid}"><rect x="${bw}" y="${photoY}" width="${w-2*bw}" height="${photoH}" rx="${3*k}"/></clipPath>
   <filter id="gl${uid}" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="0" stdDeviation="${3*k}" flood-color="${ed.frame}" flood-opacity=".55"/></filter>
  </defs>
   <rect x="${1.5*k}" y="${1.5*k}" width="${w-3*k}" height="${h-3*k}" rx="${8*k}" fill="url(#mt${uid})" filter="url(#gl${uid})"/>
   ${ed.holo?`<rect x="${1.5*k}" y="${1.5*k}" width="${w-3*k}" height="${h-3*k}" rx="${8*k}" fill="url(#ho${uid})" opacity=".45"/>`:''}
   <rect x="${bw-2*k}" y="${bw-2*k}" width="${w-2*bw+4*k}" height="${h-2*bw+4*k}" rx="${5*k}" fill="${ed.frame2}"/>
   <rect x="${bw}" y="${bw}" width="${w-2*bw}" height="${tabH}" fill="${ed.frame2}"/>
   <text x="${w/2}" y="${bw+11.5*k}" font-size="${7.5*k}" font-family="Inter, sans-serif" font-weight="600" text-anchor="middle" fill="${ed.frame}">${esc(card.award||ed.n)}</text>
   <g clip-path="url(#cp${uid})"><image href="${IMG[card.img||card.id]}" x="${bw}" y="${photoY}" width="${w-2*bw}" height="${photoH}" preserveAspectRatio="xMidYMid slice"/>
     ${fire}<rect x="${bw}" y="${photoY}" width="${w-2*bw}" height="${photoH}" fill="url(#vg${uid})"/>
     <rect x="${bw}" y="${photoY}" width="${w-2*bw}" height="${photoH}" fill="url(#sh${uid})"/>
     ${ed.holo?`<rect x="${bw}" y="${photoY}" width="${w-2*bw}" height="${photoH}" fill="url(#ho${uid})" opacity=".14"/>`:''}
     ${sp.join('')}</g>
   <rect x="${bw}" y="${h-bw-foot}" width="${w-2*bw}" height="${foot}" rx="${3*k}" fill="url(#mt${uid})"/>
   <text x="${10*k}" y="${h-bw-foot+13.5*k}" font-size="${8*k}" font-family="Inter, sans-serif" font-weight="600" fill="${ed.ink}" font-variant-numeric="tabular-nums">${String(card.no).padStart(3,'0')} / ${card.total}</text>
   <text x="${w-10*k}" y="${h-bw-foot+13.5*k}" font-size="${8*k}" font-family="Inter, sans-serif" font-weight="700" text-anchor="end" fill="${ed.ink}">${ed.label}</text></svg>`;
}
cardSVG=function(card,w){ w=w||200; if(typeof IMG!=='undefined'&&IMG[card.img||card.id]) return imageCardSVG(card,w); return card.style==='sticker'? stickerSVG(card,w) : _classicSVG(card,w); };
