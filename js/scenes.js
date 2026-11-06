/* scenes.js — Сцены: убежище, тамбур, склад, город, создание героя. Обычный скрипт (не модуль): общие глобальные переменные, порядок подключения важен, см. index.html. */
/* ============ SCENES ============ */
let scene='select',time=0;
const CH={x:60,y:136,floor:0,path:[],dir:1,walk:false};
const floorY=i=>66+i*76+70;
function goTo(room,x){const lx=22,p=[];
 if(CH.floor!==room||Math.abs(CH.y-floorY(room))>1){p.push({x:lx,y:CH.y});p.push({x:lx,y:floorY(room)})}
 p.push({x,y:floorY(room)});CH.path=p;CH.target=room}
function updChar(dt){CH.walk=false;if(!CH.path.length)return;
 const p=CH.path[0],dx=p.x-CH.x,dy=p.y-CH.y,d=Math.hypot(dx,dy),sp=55*dt;
 CH.walk=true;if(d<=sp){CH.x=p.x;CH.y=p.y;CH.path.shift();if(!CH.path.length){CH.floor=CH.target;CH.walk=false}}
 else{CH.x+=dx/d*sp;CH.y+=dy/d*sp;if(Math.abs(dx)>1)CH.dir=dx>0?1:-1}}

/* --- skyline cache --- */
const SKY=[];{const r=mul(3);let x=0;while(x<VW){const w=6+Math.floor(r()*9),h=10+Math.floor(r()*30);SKY.push({x,w,h,br:r()<.4});x+=w+Math.floor(r()*3)}}
const SPECK=[];{const r=mul(11);for(let i=0;i<160;i++)SPECK.push({x:r()*VW|0,y:66+(r()*254|0),c:r()<.5?'#2e241b':'#1d160f'})}
const SZ=[{x:20,d:1},{x:130,d:-1},{x:60,d:1}];

function drawWall(lvl){
 const h=[4,8,11,14,16,18][lvl],col=['#5a4a3a','#8a6a40','#7a828a','#8f949a','#8f949a','#9aa0a8'][lvl];
 for(const s of[[0,72],[108,180]]){
  if(lvl===0){for(let x=s[0]+2;x<s[1];x+=9){if(((x*7)%5)===0)continue;R(x,58,2,5,col)}R(s[0],59,s[1]-s[0],1,'#6a6a6a')}
  else{R(s[0],62-h,s[1]-s[0],h,col);R(s[0],62-h,s[1]-s[0],2,dk(col,1.25));
   if(lvl>=2)for(let x=s[0]+4;x<s[1];x+=9)R(x,62-h+2,1,h-2,dk(col,.75));
   if(lvl===1)for(let y=62-h+3;y<62;y+=3)R(s[0],y,s[1]-s[0],1,dk(col,.8));
   if(lvl>=3){R(s[0],62-h-3,s[1]-s[0],1,'#aaa');for(let x=s[0]+1;x<s[1];x+=4)R(x,62-h-4,1,2,'#aaa')}}}
 if(lvl>=4){R(146,62-h-16,14,16,'#6a5a48');R(144,62-h-19,18,4,'#4a3a2a');R(148,62-h-13,10,5,'#a8d8e8');
  if(lvl>=5){ctx.globalAlpha=.18;ctx.fillStyle='#fff8c0';ctx.beginPath();ctx.moveTo(150,62-h-10);ctx.lineTo(95,62);ctx.lineTo(125,62);ctx.fill();ctx.globalAlpha=1}}}

function drawSurface(){
 ['#232238','#2f2a45','#4a3550','#6e4350','#8a5450'].forEach((c,i)=>R(0,i*13,VW,13,c));
 R(138,10,10,10,'#e8e4c8');R(141,9,8,8,'#2f2a45');
 for(const b of SKY){R(b.x,62-b.h,b.w,b.h,'#1a1826');if(b.br)R(b.x+1,62-b.h,b.w-2,3,'#4a3550');for(let y=62-b.h+4;y<60;y+=5)if((b.x+y)%3===0)R(b.x+2,y,1,2,'#e3c46a')}
 R(0,62,VW,4,'#1b1814');
 for(const z of SZ)drawZ(z.x,61,time,z.d);
 drawWall(S.sh.wall);
 // gate
 R(72,36,36,27,'#2a2c32');R(74,38,32,25,'#3a3d44');R(76,41,14,22,'#5a5e66');R(92,41,14,22,'#5a5e66');R(89,41,2,22,'#1a1a1e');
 for(let i=0;i<32;i+=6){R(74+i,38,3,3,'#e3b341')}
 R(84,49,3,4,'#c9a040');R(93,49,3,4,'#c9a040');
 T('В ГОРОД',90,26,'#e3b341',6,'center');
 hs('gate',72,26,36,38);hs('wall',0,36,72,28);hs('wall',108,36,72,28)}

function drawBed(x,feet,lvl){
 const blank=['#6b6b6b','#8a4a3a','#3a6a8a','#6a4a8a','#8a6a3a','#9a3a4a'][lvl];
 if(lvl>=3){R(x,feet-48,3,48,'#4a4a52');R(x+49,feet-48,3,48,'#4a4a52');R(x,feet-48,52,3,'#4a4a52');R(x+2,feet-54,48,6,blank);R(x+2,feet-56,10,4,'#d8d0c0')}
 if(lvl===0){R(x,feet-5,52,5,'#4a4038');R(x+2,feet-9,48,5,blank);R(x+2,feet-11,10,3,'#d8d0c0')}
 else{R(x,feet-14,3,14,'#4a4a52');R(x+49,feet-14,3,14,'#4a4a52');R(x,feet-14,52,2,'#4a4a52');R(x+3,feet-18,46,5,blank);R(x+3,feet-21,10,4,'#d8d0c0')}
 if(lvl>=5){R(x-2,feet-60,56,2,'#c9a040')}}

function drawRoomBG(i){
 const D=S.deco.sh,w=DITEM[D.wall],top=66+i*76;
 R(12,top-2,164,76,'#3a3f45');
 R(16,top,156,70,w.c);R(16,top+54,156,16,dk(w.c,.82));R(16,top,156,3,dk(w.c,.65));
 for(let x=40;x<172;x+=34)R(x,top+3,1,51,dk(w.c,.88));
 drawFloor(D.floor,16,top+70,156,4);
 // ladder
 R(18,top,1,74,'#8a7a5a');R(26,top,1,74,'#8a7a5a');for(let y=top+4;y<top+74;y+=6)R(18,y,9,1,'#a8946a')}

function drawLiving(){
 const D=S.deco.sh,top=66,feet=136;
 drawRoomBG(0);
 drawPoster(D.poster,80,top+14);hs('poster',78,top+12,22,28);
 drawLamp(D.lamp,92,top+3);hs('lamp',80,top+3,26,22);
 drawRug(D.rug,74,feet-3,38);hs('rug',74,feet-8,38,8);
 drawPlant(D.plant,104,feet);hs('plant',100,feet-24,16,24);
 // table
 R(34,feet-16,38,3,'#6a4a30');R(36,feet-13,3,13,'#4a3220');R(67,feet-13,3,13,'#4a3220');
 R(42,feet-20,6,4,'#c9a040');R(55,feet-19,8,3,'#ddd');R(56,feet-21,6,2,'#7a9a5a');
 hs('table',32,feet-28,42,28);
 drawBed(114,feet,S.sh.bunk);hs('bunk',112,feet-58,56,58)}

function drawFarm(){
 const top=142,feet=212;drawRoomBG(1);
 const n=Math.max(1,S.sh.garden),pf=pend('food');
 if(S.sh.garden>=2){R(30,top+8,n*14+2,2,'#c9a0e0');ctx.globalAlpha=.12;R(30,top+10,n*14+2,46,'#d8a0ff');ctx.globalAlpha=1}
 for(let i=0;i<n;i++){const x=30+i*14;
  R(x,feet-9,13,9,'#5a4030');R(x+1,feet-9,11,3,'#3a2a1c');
  if(S.sh.garden>0){const g=Math.min(1,.3+pf/(6+S.sh.garden*4));const hh=Math.round(4+g*14);R(x+5,feet-9-hh,3,hh,'#4f9a3a');R(x+2,feet-9-hh+3,4,3,'#6ec04a');R(x+8,feet-9-hh+5,4,3,'#6ec04a');if(g>.8)R(x+5,feet-9-hh-2,3,3,'#e5534b')}}
 hs('garden',28,top+8,n*14+4,feet-top-8);
 if(pend('food')>0)bubble(30+n*7,top+6,'+'+pend('food'));
 // tank
 const tl=S.sh.rain,th=18+tl*5,wl=Math.min(1,.2+pend('water')/(6+tl*4));
 R(122,feet-th-4,34,th+4,'#2a3038');R(124,feet-th-2,30,th,'#3a4452');R(124,feet-2-Math.round(th*wl),30,Math.round(th*wl),'#4a8ac0');
 for(let y=feet-th;y<feet-4;y+=5)R(122,y,34,1,'#1a1e24');
 R(138,feet-4,4,4,'#8a8f94');
 R(170,64,2,feet-th-64,'#5a6068');R(140,feet-th-4,32,2,'#5a6068');
 hs('rain',120,feet-th-6,38,th+8);
 if(pend('water')>0)bubble(139,feet-th-18,'+'+pend('water'))}

function drawWork(){
 const top=218,feet=288,D=S.deco.sh,l=S.sh.work;drawRoomBG(2);
 R(30,feet-18,52,4,'#6a4a30');R(32,feet-14,4,14,'#4a3220');R(76,feet-14,4,14,'#4a3220');
 R(36,feet-22,6,4,'#8a8f94');R(37,feet-26,2,5,'#6a4a30');
 if(l>=1){R(60,feet-24,6,6,'#5a6068');R(62,feet-26,2,3,'#777')}
 if(l>=2){R(46,feet-40,4,22,'#5a6068');R(42,feet-42,12,4,'#8a8f94')}
 if(l>=3){R(30,top+10,52,3,'#4a3220');for(let i=0;i<4;i++)R(33+i*12,top+4,6,6,'#9a7a3a')}
 if(l>=4){R(68,feet-36,2,18,'#555');R(64,feet-38,10,3,'#e3b341');ctx.globalAlpha=.12;R(56,feet-36,26,18,'#ffe9a0');ctx.globalAlpha=1}
 if(l>=5){R(20,top+22,10,40,'#3a4048');R(21,top+26,8,6,'#58a6ff')}
 hs('work',28,feet-44,58,44);
 if(pend('scrap')>0)bubble(55,top+4,'+'+pend('scrap'));
 // storage door
 R(126,feet-42,36,42,'#2a2c32');R(128,feet-40,32,40,'#5a5e66');R(130,feet-38,28,36,'#4a4e56');R(150,feet-22,4,4,'#c9a040');
 R(130,feet-52,28,8,'#6a4a2a');T('СКЛАД',144,feet-51,'#e8dcc0',5,'center');hs('storage',126,feet-52,36,52)}

function drawShelter(){
 HS=[];drawRoomBg();
 glow(36,130,46,'#ff9a3c',.14+.05*Math.sin(time*7)+.03*Math.sin(time*17));
 hs('shelf',0,70,42,54);hs('desk',0,122,60,80);hs('radio',8,136,24,22);hs('window',70,63,45,30);hs('radiator',73,128,40,30);
 hs('locker',130,85,28,56);hs('locker',160,104,20,120);hs('bunk',115,135,48,78);
 if(S.sleeping){ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(0,0,VW,VH);
  T('Z',140,120-Math.sin(time*2)*2,'#fff',9);T('z',132,130-Math.sin(time*2+1)*2,'#fff',7);return}
 drawHero(HERO.x,HERO.y,heroH(HERO.y),HERO.dir,{walk:HERO.walk});drawBubble(HERO.x,HERO.y-heroH(HERO.y)-2);
 const hh=heroH(HERO.y);hs('char',HERO.x-14,HERO.y-hh,28,hh)}
function drawHall(){
 HS=[];drawRoomBg('hall');
 glow(102,56,50,'#ff9a3c',.13+.04*Math.sin(time*6)+.03*Math.sin(time*15));glow(22,160,34,'#ff9a3c',.10);
 hs('vault',69,117,71,107);hs('doorstore',7,112,32,133);hs('lockerh',160,139,20,114);hs('coat',46,150,16,60);
 drawHero(HERO.x,HERO.y,heroH(HERO.y),HERO.dir,{walk:HERO.walk});drawBubble(HERO.x,HERO.y-heroH(HERO.y)-2);
 const hh=heroH(HERO.y);hs('char',HERO.x-14,HERO.y-hh,28,hh)}
function drawShelterOld(){
 HS=[];drawSurface();
 R(0,66,VW,VH-66,'#241c15');for(const s of SPECK)R(s.x,s.y,2,1,s.c);
 drawLiving();drawFarm();drawWork();
 // character
 const L=LOOK0;
 if(S.sleeping){
  const bx=114,feet=136,blank=['#6b6b6b','#8a4a3a','#3a6a8a','#6a4a8a','#8a6a3a','#9a3a4a'][S.sh.bunk];
  ctx.save();ctx.translate(bx+3,feet-(S.sh.bunk?21:11));ctx.rotate(-Math.PI/2);drawChar(0,0,L,{t:time,noShadow:true,a:S.gear.a});ctx.restore();
  R(bx+14,feet-(S.sh.bunk?21:11)-2,34,S.sh.bunk?5:4,blank);
  T('z',bx+8,feet-34-Math.sin(time*2)*2,'#fff',7);T('Z',bx+16,feet-42-Math.sin(time*2+1)*2,'#fff',8)
 }else{drawChar(CH.x-14,CH.y-34,L,{t:time,walk:CH.walk,dir:CH.dir,w:S.gear.w,a:S.gear.a});hs('char',CH.x-12,CH.y-34,24,34)}}

/* --- storage --- */
function drawStorage(){
 HS=[];drawRoomBg('storage');
 glow(91,47,50,'#ff9a3c',.12+.04*Math.sin(time*6)+.03*Math.sin(time*15));
 hs('ward',0,69,70,145);hs('stock',132,80,48,92);hs('rack',109,171,71,57);
 drawHero(HERO.x,HERO.y,heroH(HERO.y),HERO.dir,{walk:HERO.walk});drawBubble(HERO.x,HERO.y-heroH(HERO.y)-2);
 const hh=heroH(HERO.y);hs('char',HERO.x-14,HERO.y-hh,28,hh)}
function drawStorageOld(){
 HS=[];const D=S.deco.st,w=DITEM[D.wall],L=LOOK0;
 R(0,0,VW,VH,w.c);R(0,0,VW,40,dk(w.c,.7));R(0,40,VW,3,dk(w.c,.55));R(0,150,VW,46,dk(w.c,.85));
 for(let x=20;x<VW;x+=30)R(x,43,1,153,dk(w.c,.9));
 R(0,36,VW,4,'#5a6068');R(0,32,VW,2,'#4a5058');
 drawFloor(D.floor,0,196,VW,VH-196);R(0,196,VW,3,dk(DITEM[D.floor].c,.6));
 drawLamp(D.lamp,90,0);hs('lamp',72,0,36,28);
 drawPoster(D.poster,66,72);hs('poster',64,70,22,28);
 // wardrobe
 R(6,56,54,142,'#3a2616');R(8,58,50,138,'#6a4a30');R(32,58,2,138,'#3a2616');
 R(8,58,50,4,'#8a6a40');R(29,120,2,8,'#c9a040');R(36,120,2,8,'#c9a040');
 const ao=S.gear.armors;for(let i=0;i<ARMORS.length;i++){const a=ARMORS[i],have=ao.includes(a.id),y=68+i*24;
  R(12,y,42,1,'#2a1e16');if(have){R(20,y+3,26,16,a.col);R(20,y+3,26,2,dk(a.col,1.4));R(16,y+3,5,8,dk(a.col,.85));R(45,y+3,5,8,dk(a.col,.85));if(S.gear.a===a.id)T('✓',50,y+4,'#7ed957',6)}else{ctx.globalAlpha=.25;R(20,y+3,26,16,'#000');ctx.globalAlpha=1}}
 hs('ward',6,56,54,142);
 // weapon rack
 R(92,60,80,34,'#3a2616');R(94,62,76,30,'#5a4028');
 const wo=S.gear.weapons.filter(x=>x!=='fists');
 for(let i=0;i<4;i++){const wp=WEAPONS[i+1],x=97+i*18,have=wo.includes(wp.id);
  if(have){const c=S.gear.w===wp.id?'#7ed957':'#9aa0a8';
   if(wp.id==='bat')R(x+6,64,3,26,'#8a5a30');
   if(wp.id==='pistol'){R(x+2,72,12,4,'#3a3a3a');R(x+2,75,4,8,'#3a3a3a')}
   if(wp.id==='shotgun'){R(x+7,64,2,26,'#3a3a3a');R(x+5,78,6,8,'#7a4a20')}
   if(wp.id==='rifle'){R(x+6,64,2,26,'#2a2a2a');R(x+4,76,6,10,'#5a4a2a');R(x+4,70,2,4,'#2a2a2a')}
   if(S.gear.w===wp.id)R(x,62,16,1,c)}else{ctx.globalAlpha=.2;R(x+4,68,8,18,'#000');ctx.globalAlpha=1}}
 hs('rack',92,60,80,34);
 // shelves with supplies
 R(92,100,80,3,'#6a4a30');R(92,132,80,3,'#6a4a30');R(92,164,80,3,'#6a4a30');
 const nf=Math.min(8,S.res.food),nw=Math.min(8,S.res.water),nm=Math.min(6,S.res.meds);
 for(let i=0;i<nf;i++)R(95+i*9,92,7,8,'#c0763a'),R(95+i*9,92,7,2,'#8a5a2a');
 for(let i=0;i<nw;i++){R(95+i*9,125-4,5,11,'#4a8ac0');R(96+i*9,121,3,3,'#8ab8e0')}
 for(let i=0;i<nm;i++)R(95+i*11,155,9,9,'#e8e8e8'),R(98+i*11,157,3,5,'#b03a2e'),R(96+i*11,159,7,1,'#b03a2e');
 hs('stock',92,88,80,80);
 // crates
 const nc=Math.min(5,1+Math.floor(S.res.scrap/12)+Math.floor(S.res.parts/6));
 const cr=[[100,196-16],[124,196-16],[148,196-16],[112,196-32],[136,196-32]];
 for(let i=0;i<nc;i++){const c=cr[i];R(c[0],c[1],22,16,'#5a4028');R(c[0]+1,c[1]+1,20,14,'#8a6a40');R(c[0],c[1]+7,22,2,'#5a4028');R(c[0]+9,c[1],4,16,'#5a4028')}
 hs('stock',96,196-34,80,34);
 drawRug(D.rug,40,262,100);hs('rug',40,256,100,10);
 drawPlant(D.plant,70,196);hs('plant',66,172,16,26);
 // character in center
 drawHero(88,262,70,1);hs('char',74,192,28,70)}

/* --- select --- */
function drawCreate(){
 HS=[];drawRoomBg();ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,VW,VH);
 T('СОЗДАЙ ГЕРОЯ',90,10,'#e3b341',9,'center');
 const im=IMG['h_'+CR.sex+'_'+crLook()];if(im)drawHero(90,112,80,1,{img:im});
 T(CR.name||S.name||'Выживший',90,118,'#fff',8,'center')}
function drawSelectOld(){
 HS=[];['#1d2230','#2a2a45','#4a3550','#6e4350'].forEach((c,i)=>R(0,i*34,VW,34,c));
 for(const b of SKY){R(b.x,150-b.h*2,b.w,b.h*2,'#16141f');for(let y=150-b.h*2+4;y<146;y+=6)if((b.x+y)%3===0)R(b.x+2,y,1,2,'#e3c46a')}
 R(0,150,VW,VH-150,'#241c15');
 T('ВЫБЕРИ ПЕРСОНАЖА',90,12,'#e3b341',9,'center');T('тапни, чтобы узнать способность',90,26,'#ccc',6,'center');
 for(let i=0;i<6;i++){const cx=34+(i%3)*56,cy=(i<3?100:190);
  R(cx-22,cy+22,44,5,'#2f2820');drawChar(cx-14,cy-12,LOOKS[i],{t:time+i*.3});T(LOOKS[i].n,cx,cy+30,'#fff',6,'center');hs('look'+i,cx-24,cy-14,48,52)}}

/* --- city --- */
let cityCv=null;const cam={x:60,y:0};let RA=null,shake=0,flash=0;
const ZS=[];{const r=mul(21);for(let i=0;i<26;i++)ZS.push({x:r()*WW,y:20+r()*420,dx:r()<.5?-1:1,ph:r()*9})}
function buildCity(){
 const c=document.createElement('canvas');c.width=WW;c.height=WH;const g=c.getContext('2d');
 const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const rn=mul(7);
 r(0,0,WW,155,'#2c3328');r(0,155,WW,177,'#2b2e35');r(0,332,WW,128,'#33302a');
 const SC_='#1f2226';
 const hS=(y,w)=>{r(0,y,WW,w,SC_);for(let x=2;x<WW;x+=10)r(x,y+(w>>1),5,1,'#5a5640')};
 const vS=(x,w,y0,y1)=>{r(x,y0,w,y1-y0,SC_);for(let y=y0+2;y<y1;y+=10)r(x+(w>>1),y,1,5,'#5a5640')};
 // suburbs
 [34,92,148].forEach(y=>hS(y,5));[28,100,200,270].forEach(x=>vS(x,5,0,155));
 const sc=[[0,28],[33,100],[105,200],[205,270],[275,300]],sr=[[0,34],[39,92],[97,148]];
 const hc=['#8a6a4a','#7a8a6a','#a89070','#6a7a8a','#9a6a5a'],rc=['#5a3a2a','#3a4a5a','#6a3a3a','#4a4a3a'];
 for(const row of sr)for(const col of sc)for(let y=row[0]+3;y<row[1]-9;y+=12)for(let x=col[0]+3;x<col[1]-10;x+=13){
  if(rn()<.18){r(x+2,y+2,5,5,'#1f3a22');r(x+3,y+3,3,3,'#2d5230');continue}
  r(x-1,y-1,12,11,'#34402f');const hcl=hc[Math.floor(rn()*5)];r(x+1,y+3,9,6,hcl);r(x,y+1,11,3,rc[Math.floor(rn()*4)]);r(x+4,y+6,2,3,'#2a1e16');r(x+7,y+5,2,2,'#e3c46a')}
 // downtown
 [186,226,266,306].forEach(y=>hS(y,6));[34,80,126,172,218,264].forEach(x=>vS(x,6,155,332));
 const dc=[[0,34],[40,80],[86,126],[132,172],[178,218],[224,264],[270,300]],dr=[[155,186],[192,226],[232,266],[272,306],[312,332]];
 const T_=[];
 for(const row of dr)for(const col of dc){
  if(col[0]===40&&row[0]===155){r(40,155,40,31,'#2f5a33');for(let i=0;i<14;i++)r(42+rn()*34|0,158+rn()*24|0,4,4,'#1f3f24');continue}
  if(col[0]===224&&row[0]===272){continue}
  const cx=(col[0]+col[1])/2,cy=(row[0]+row[1])/2,cen=1-Math.min(1,Math.hypot(cx-150,cy-245)/130);
  const k=rn()<.5?2:1;
  for(let j=0;j<k;j++){const cw=(col[1]-col[0])/k;const w=Math.max(10,Math.min(cw-4,12+rn()*14|0));const d=7+rn()*5|0;const ht=8+rn()*(18+cen*34)|0;
   T_.push({x:col[0]+j*cw+(cw-w)/2|0,by:row[1]-3-(rn()*4|0),w,d,ht,c:['#4a5566','#566274','#3f4a5a','#5d5a66','#4a5a60'][Math.floor(rn()*5)]})}}
 T_.sort((a,b)=>a.by-b.by);
 for(const b of T_){r(b.x,b.by-b.ht-b.d,b.w,b.d,dk(b.c,1.35));r(b.x,b.by-b.ht,b.w,b.ht,b.c);r(b.x+b.w,b.by-b.ht-b.d+2,3,b.ht+b.d-2,dk(b.c,.6));
  for(let wy=b.by-b.ht+2;wy<b.by-3;wy+=4)for(let wx=b.x+2;wx<b.x+b.w-2;wx+=3)r(wx,wy,1,2,rn()<.22?'#e3c46a':'#222a36')}
 // stadium
 {const x0=226,y0=274,hw=18,hh=14;for(let j=-hh;j<=hh;j++){const w=Math.round(Math.sqrt(1-(j/hh)*(j/hh))*hw);r(x0+20-w,y0+hh+j,w*2,1,'#6a6e76')}
  for(let j=-8;j<=8;j++){const w=Math.round(Math.sqrt(1-(j/8)*(j/8))*11);r(x0+20-w,y0+hh+j,w*2,1,'#2f5a33')}}
 // industrial
 [350,410].forEach(y=>hS(y,5));[60,150,240].forEach(x=>vS(x,5,332,460));
 const ic=[[0,60],[65,150],[155,240],[245,300]],ir=[[332,350],[355,410],[415,460]];
 for(const row of ir)for(const col of ic){
  r(col[0]+2,row[0]+2,col[1]-col[0]-4,row[1]-row[0]-4,'#3a372f');
  const t=rn();
  if(t<.4){for(let y=row[0]+5;y<row[1]-8;y+=6)for(let x=col[0]+5;x<col[1]-10;x+=9)r(x,y,8,4,['#a8432f','#2a6ab0','#c9a040','#3a8a5a'][Math.floor(rn()*4)])}
  else if(t<.75){const w=col[1]-col[0]-10,h=Math.min(row[1]-row[0]-10,20);r(col[0]+5,row[0]+6,w,h,'#5a5d62');for(let x=col[0]+7;x<col[0]+5+w-4;x+=6)r(x,row[0]+6,3,3,'#7a7e84')}
  else{for(let i=0;i<3;i++){const x=col[0]+8+i*14;if(x>col[1]-14)break;r(x+1,row[0]+8,8,12,'#8a8f94');r(x,row[0]+9,10,10,'#8a8f94')}}}
 r(0,438,WW,1,'#6a6a6a');r(0,442,WW,1,'#6a6a6a');for(let x=0;x<WW;x+=4)r(x,437,1,7,'#4a3a2a');
 // highways
 r(148,0,12,WH,'#14161a');r(148,0,1,WH,'#c9c9c9');r(159,0,1,WH,'#c9c9c9');for(let y=0;y<WH;y+=8)r(153,y,1,4,'#c9a63a');
 r(0,328,WW,12,'#14161a');r(0,328,WW,1,'#c9c9c9');r(0,339,WW,1,'#c9c9c9');for(let x=0;x<WW;x+=8)if(x<146||x>162)r(x,333,4,1,'#c9a63a');
 // POI buildings
 for(const b of POIS){const x=b.x-12,y=b.y-6;
  r(x-1,y-12,26,34,'#0006');
  switch(b.k){
   case'garage':r(x,y,24,16,'#555a60');r(x,y-4,24,4,'#6a7078');r(x+8,y+6,8,10,'#2a2c30');break;
   case'shop':r(x,y,24,16,'#8a6a4a');r(x,y-3,24,3,'#a07a5a');for(let i=0;i<22;i+=4)r(x+1+i,y+3,2,3,'#b03a2e'),r(x+3+i,y+3,2,3,'#e8e0d0');r(x+9,y+9,6,7,'#2a1e16');break;
   case'pharm':r(x,y,24,16,'#d8d8d0');r(x,y-3,24,3,'#aaa');r(x+10,y+4,4,9,'#3aa05a');r(x+8,y+6,8,4,'#3aa05a');break;
   case'mart':r(x-2,y-4,28,20,'#c0c4c8');r(x-2,y-8,28,5,'#2a6ab0');r(x+8,y+7,8,9,'#2a2c30');r(x,y+1,6,4,'#6a8ab0');r(x+18,y+1,6,4,'#6a8ab0');break;
   case'police':r(x,y-4,24,20,'#3a4a6a');r(x,y-8,24,4,'#2a3858');r(x+10,y-11,4,3,'#e5534b');r(x+8,y+7,8,9,'#1a1a1e');for(let i=0;i<24;i+=5)r(x+i,y+2,3,3,'#8ab0e0');break;
   case'hosp':r(x,y-10,24,26,'#e8e8e8');r(x,y-14,24,4,'#c8c8c8');r(x+10,y-9,4,10,'#b03a2e');r(x+8,y-6,8,4,'#b03a2e');r(x+8,y+8,8,8,'#6a8ab0');break;
   case'ware':r(x-3,y,30,16,'#6a6e74');r(x-3,y-3,30,3,'#8a8e94');for(let i=0;i<3;i++)r(x+i*9,y+7,7,9,'#3a3d44');break;
   case'fact':r(x,y,24,16,'#6a5a4a');r(x+3,y-14,4,14,'#4a4038');r(x+14,y-10,4,10,'#4a4038');r(x+1,y-18,8,4,'#888');r(x+12,y-14,8,3,'#777');for(let i=0;i<20;i+=5)r(x+2+i,y+5,3,3,'#e3a03a');break;
   case'base':r(x-3,y-3,30,24,'#2a3a1c');r(x-2,y-2,28,22,'#3a4a2c');r(x+3,y+2,16,11,'#5a6a40');r(x+19,y-8,5,12,'#4a5a38');r(x+4,y+16,18,1,'#888');break}}
 cityCv=c}

function drawCity(dt){
 HS=[];
 if(RA){RA.t+=dt;const p=Math.min(1,RA.t/RA.dur),px=HOME.x+(RA.b.x-HOME.x)*p,py=HOME.y+(RA.b.y+6-HOME.y)*p;RA.px=px;RA.py=py;
  cam.x+=((px-VW/2)-cam.x)*.1;cam.y+=((py-VH/2)-cam.y)*.1;
  if(p>=1&&!RA.done){RA.done=true;shake=.35;flash=.35;const b=RA.b;FB=newFight(b);setTimeout(()=>setScene('fight'),350)}}
 cam.x=clamp(cam.x,0,WW-VW);cam.y=clamp(cam.y,0,WH-VH);
 const cx=Math.round(cam.x),cy=Math.round(cam.y);
 ctx.save();if(shake>0){ctx.translate(rnd(-1,1),rnd(-1,1));shake-=dt}
 if(IMG.map){ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(IMG.map,-cx,-cy,WW,WH);ctx.restore()}
 else{R(0,0,VW,VH,'#1b1814');T('Загрузка карты…',90,150,'#aaa',7,'center')}
 // home
 {const hx=HOME.x-cx,hy=HOME.y-cy;R(hx-9,hy-6,18,12,'#2a2c32');R(hx-7,hy-4,14,10,'#5a5e66');R(hx-1,hy-4,2,10,'#1a1a1e');T('ДОМ',hx,hy-15,'#7ed957',6,'center')}
 // pins + labels
 for(const b of POIS){const sx=b.x-cx,sy=b.y-cy,locked=S.lvl<b.dist.lvl;if(sx<-20||sx>VW+20||sy<-30||sy>VH+20)continue;
  if(!locked){const cl=(S.cool[b.id]||0)>Date.now(),col=cl?'#6b6b6b':b.d<=3?'#7ed957':b.d<=6?'#e3b341':'#e5534b',bob=Math.round(Math.sin(time*4+b.x)*2);
   R(sx-4,sy-27+bob,9,7,'#000');R(sx-3,sy-26+bob,7,5,col);R(sx-1,sy-21+bob,3,3,'#000');R(sx,sy-21+bob,1,2,col)}
  T(b.n,sx,sy+14,locked?'#888':'#fff',6,'center')}
 // fog
 for(const d of DISTRICTS)if(S.lvl<d.lvl){const y0=d.y0-cy,y1=d.y1-cy;ctx.fillStyle='rgba(8,10,14,.72)';ctx.fillRect(0,Math.max(0,y0),VW,Math.min(VH,y1)-Math.max(0,y0));
  const my=(Math.max(0,y0)+Math.min(VH,y1))/2;if(y1>0&&y0<VH){T('🔒 '+d.n,90,my-6,'#fff',8,'center');T('нужен ур.'+d.lvl,90,my+4,'#aaa',6,'center')}}
 if(RA){const x=RA.px-cx,y=RA.py-cy;for(let i=1;i<6;i++){const q=RA.t/RA.dur-i*.03;if(q>0){R(HOME.x+(RA.b.x-HOME.x)*q-cx,HOME.y+(RA.b.y+6-HOME.y)*q-cy,2,2,'#e3b341')}}drawMini(Math.round(x),Math.round(y)+Math.round(Math.abs(Math.sin(time*10))*-2),LOOK0,time)}
 ctx.restore();
 if(flash>0){ctx.globalAlpha=Math.min(.5,flash);R(0,0,VW,VH,'#e5534b');ctx.globalAlpha=1;flash-=dt}}

function finishBattle(){const log=BT.log;BT=null;RA=null;setScene('city');openS(shReport,log)}
function drawBattle(dt){HS=[];if(!BT)return;BT.t+=dt;const b=BT.b,zc=BT.zs.length,p=Math.min(1,BT.t/BT.dur),prog=p*zc,ph=prog-Math.floor(prog),fin=BT.t>BT.dur;
 if(IMG.map){const sx=clamp(b.x-90,0,WW-VW),sy=clamp(b.y-230,0,WH-VH);ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(IMG.map,-sx,-sy,WW,WH);ctx.restore()}else R(0,0,VW,VH,'#1b1814');
 ctx.fillStyle='rgba(12,9,6,.66)';ctx.fillRect(0,0,VW,VH);
 const done=Math.min(BT.kills,Math.floor(prog+(fin?1:0))),left=[];for(let i=done;i<zc&&left.length<3;i++)left.push(i);
 const hit=!fin&&ph>.4&&ph<.55,hurt=!fin&&ph>.62&&ph<.78;
 for(let j=left.length-1;j>=0;j--){const z=BT.zs[left[j]],sh=(j===0&&hit)?rnd(-1,1)*1.6:0;drawSprite(IMG['z_'+z],122+j*28+sh,262-j*5,zH(z,86*(1-j*.09)),-1)}
 const lunge=!fin&&ph>.3&&ph<.6?9*Math.sin((ph-.3)/.3*Math.PI):0,dead=BT.dead&&fin;
 drawSprite(heroImg(),50+lunge,266,86,1,{alpha:dead?.4:1});
 if(hurt){ctx.fillStyle='rgba(229,83,75,.16)';ctx.fillRect(0,0,VW,VH)}
 T('Убито '+done+'/'+zc,90,62,'#fff',8,'center');if(dead)T('Пришлось отступить',90,76,'#e5534b',7,'center');
 if(BT.t>BT.dur+.7)finishBattle()}

