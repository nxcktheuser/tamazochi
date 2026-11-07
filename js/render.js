/* render.js — Canvas: загрузка картинок, отрисовка героя, фонов, эффектов. Обычный скрипт (не модуль): общие глобальные переменные, порядок подключения важен, см. index.html. */
/* ============ CANVAS ============ */
const VW=180,VH=320,WW=270,WH=484;
const cv=$('game'),ctx=cv.getContext('2d');
let SC=2,K=3;
/* Текст рисуется на отдельном холсте в родном разрешении экрана, поэтому буквы чёткие */
const tcv=$('txt'),tctx=tcv.getContext('2d');let DPR=1;
const TFONT='"Pixelify Sans",ui-monospace,Menlo,monospace';
try{document.fonts.load('700 12px "Pixelify Sans"')}catch(e){}
function resize(){SC=Math.min(innerWidth/VW,innerHeight/VH);const w=VW*SC,h=VH*SC;DPR=Math.min(3,window.devicePixelRatio||1);
 K=Math.max(2,Math.min(4,Math.round(SC*DPR)));/* потолок 4: на экранах 3x холст 7x давал ~3x лишних пикселей на кадр без видимого выигрыша */cv.width=VW*K;cv.height=VH*K;ctx.setTransform(K,0,0,K,0,0);
 $('wrap').style.width=w+'px';$('wrap').style.height=h+'px';cv.style.width=w+'px';cv.style.height=h+'px';
 tcv.width=Math.round(w*DPR);tcv.height=Math.round(h*DPR);tcv.style.width=w+'px';tcv.style.height=h+'px'}
addEventListener('resize',resize);resize();
const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)};
let TQ=[];
function T(s,x,y,c,sz,al){TQ.push({s,x,y,c:c||'#fff',sz:sz||6,al:al||'left'})}
function flushText(){const k=SC*DPR;tctx.clearRect(0,0,tcv.width,tcv.height);tctx.textBaseline='top';tctx.lineJoin='round';
 for(const q of TQ){tctx.font='700 '+Math.round(q.sz*1.2*k)+'px '+TFONT;tctx.textAlign=q.al;
  const px=Math.round(q.x*k),py=Math.round((q.y-1)*k);
  if(q.c!=='#222'){tctx.lineWidth=Math.max(2,Math.round(.8*k));tctx.strokeStyle='#000';tctx.strokeText(q.s,px,py)}
  tctx.fillStyle=q.c;tctx.fillText(q.s,px,py)}
 TQ=[]}

/* ---- картинки: комната и спрайты героев ---- */
const IMG={};
const IMGQ={};/* идемпотентно: повторный вызов не качает файл заново */
function loadImg(k,src){if(IMG[k]||IMGQ[k])return;IMGQ[k]=1;const i=new Image();i.onload=()=>{IMG[k]=i};i.src=src}
loadImg('room','assets/rooms/room_personal.webp');loadImg('hall','assets/rooms/room_hall.webp');loadImg('storage','assets/rooms/room_storage.webp');
const LOOKIDS={female:['light','tan','brown','dark','short','loose','braid','pigtails'],male:['light','tan','brown','dark','shaved','sidepart','afro','mohawk','beard']};
const LOOKNAME={short:'Короткая',loose:'Распущенные',braid:'Коса',pigtails:'Хвостики',shaved:'Бритый',sidepart:'Пробор',afro:'Афро',mohawk:'Ёж',beard:'Хвост и борода'};
/* Карта города (1.2 МБ) и спрайты героев грузятся по требованию, а не все сразу при старте */
const ensureMap=()=>loadImg('map','assets/maps/city.webp');
function heroImgFor(sx,id){const k='h_'+sx+'_'+id;if(!IMG[k])loadImg(k,'assets/heroes/hero_'+sx+'_'+id+'.png');return IMG[k]}
const ZTYPES=['regular','fast','soldier','bulky'];
for(const z of ZTYPES)loadImg('z_'+z,'assets/zombies/zombie_'+z+'.png');
for(const n of['hunger','thirst','energy','health','fun','comfort','mood_cheerful','mood_neutral','mood_grumpy','mood_angry'])loadImg('i_'+n,'assets/icons/icon_'+n+'.png');
const TONES=[['light','Светлый','#f3d2b0'],['tan','Загорелый','#d9a066'],['brown','Коричневый','#a8683a'],['dark','Тёмный','#6b4228']];
const LOOK0={n:'Выживший',perk:'',jacket:'#6a5a4a',scarf:'#3a3d44',hair:'#4a3020',pack:'#4a4a40',pants:'#4a4f5a',head:'none',hat:'#4a4338'};
const FLOOR={x0:18,x1:156,y0:214,y1:306},FLOORH={x0:60,x1:158,y0:236,y1:306};
const FLOORS={x0:20,x1:160,y0:224,y1:306};
const curFloor=()=>scene==='hall'?FLOORH:scene==='storage'?FLOORS:FLOOR;
const HERO={x:90,y:262,tx:90,ty:262,dir:1,walk:false};
const heroH=y=>54+clamp((y-FLOOR.y0)/(FLOOR.y1-FLOOR.y0),0,1)*22;
function heroImg(){const a=S.app||{sex:'male',tone:'tan'};return heroImgFor(a.sex,a.look||a.tone||'tan')}
function updHero(dt){const dx=HERO.tx-HERO.x,dy=HERO.ty-HERO.y,d=Math.hypot(dx,dy);HERO.walk=d>1;
 if(!HERO.walk)return;const sp=62*dt;if(d<=sp){HERO.x=HERO.tx;HERO.y=HERO.ty}else{HERO.x+=dx/d*sp;HERO.y+=dy/d*sp}
 if(Math.abs(dx)>1)HERO.dir=dx>0?1:-1}
function drawHero(x,y,h,dir,o){o=o||{};const im=o.img||heroImg();if(!im)return;const w=h*im.width/im.height;
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.globalAlpha=.4;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x,y-.5,w*.4,h*.04,0,0,7);ctx.fill();ctx.globalAlpha=1;
 ctx.translate(x,y+(o.walk?Math.abs(Math.sin(time*12))*-1.3:0));if(dir<0)ctx.scale(-1,1);ctx.scale(1,1+Math.sin(time*2)*.008);
 ctx.drawImage(im,-w/2,-h,w,h);ctx.restore()}
function drawSprite(im,x,y,h,dir,o){o=o||{};if(!im)return;const w=h*im.width/im.height;ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.globalAlpha=o.alpha==null?1:o.alpha;ctx.translate(x,y);if(dir<0)ctx.scale(-1,1);ctx.drawImage(im,-w/2,-h,w,h);ctx.restore()}
const zH=(z,hh)=>IMG['z_'+z]?IMG['z_'+z].height/508*hh:hh;
function needName(){const hpP=S.hp/maxHp()*100,c=[['health',hpP],['hunger',S.sat],['thirst',S.thr],['energy',S.en],['fun',S.fun],['comfort',S.comf]].sort((a,b)=>a[1]-b[1])[0];return c[1]<30?c[0]:null}
function drawBubble(x,y){if(S.sleeping)return;const n=needName(),im=n&&IMG['i_'+n];if(!im)return;const bob=Math.sin(time*4)*1;
 ctx.save();ctx.fillStyle='rgba(255,255,255,.93)';ctx.beginPath();ctx.ellipse(x,y-9+bob,8.5,8,0,0,7);ctx.fill();ctx.fillRect(x-1.5,y-3+bob,3,4);
 ctx.imageSmoothingEnabled=true;ctx.drawImage(im,x-6,y-15+bob,12,12);ctx.restore()}
function glow(x,y,r,col,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore()}
function drawRoomBg(k){const im=IMG[k||'room'];if(im){ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,0,0,VW,VH);ctx.restore()}
 else{R(0,0,VW,VH,'#1b1814');T('Загрузка…',90,150,'#aaa',7,'center')}}

/* ---- characters ---- */
function drawChar(x,y,L,o){
 o=o||{};const t=o.t||0,walk=!!o.walk,ph=Math.floor(t*(walk?8:2))%2,by=ph;
 ctx.save();
 if(o.dir===-1){ctx.translate(Math.round(x)+28,Math.round(y));ctx.scale(-1,1)}else ctx.translate(Math.round(x),Math.round(y));
 const r=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(a,b,w,h)};
 const OUT='#1b1410',SK='#f0c9a0',h=L.head;
 if(!o.noShadow){ctx.globalAlpha=.35;r(5,32,18,2,'#000');ctx.globalAlpha=1}
 // backpack
 r(0,13+by,9,16,OUT);r(1,14+by,7,14,L.pack);r(1,22+by,5,6,dk(L.pack,.72));r(2,16+by,5,2,dk(L.pack,1.25));
 if(h==='goggles'){r(3,5+by,1,9,'#666');r(2,3+by,3,2,'#bbb')}
 if(h==='cap'){r(2,5+by,2,9,'#aaa');r(1,3+by,4,3,'#aaa')}
 if(h==='beanie'){r(0,25+by,7,5,'#8a6038');r(0,19+by,3,6,'#4f9a3a');r(3,17+by,4,5,'#6ec04a')}
 // legs
 const lf=walk&&ph?1:0,rf=walk&&!ph?1:0;
 r(9,26,4,5,L.pants);r(15,26,4,5,L.pants);
 r(8,30-lf,6,3,'#3a2616');r(14,30-rf,6,3,'#3a2616');
 // body
 r(7,15+by,14,12,OUT);r(8,16+by,12,10,L.jacket);r(16,16+by,4,10,dk(L.jacket,.8));
 r(8,24+by,12,1,'#3a2a1a');r(13,24+by,2,1,'#c9a040');
 r(5,17+by,3,8,OUT);r(6,18+by,2,6,L.jacket);r(20,17+by,3,8,OUT);r(20,18+by,2,6,dk(L.jacket,.8));
 r(6,24+by,2,2,SK);r(20,24+by,2,2,SK);
 const ar=o.a?ARMORS.find(z=>z.id===o.a):null;
 if(ar&&ar.t===1)r(11,17+by,2,8,ar.col);
 if(ar&&ar.t>=2){r(9,17+by,10,8,ar.col);r(9,17+by,10,1,dk(ar.col,1.4))}
 if(ar&&ar.t>=3){r(6,16+by,3,3,dk(ar.col,1.3));r(19,16+by,3,3,dk(ar.col,1.3))}
 if(h==='stalker'||h==='mask'){r(20,19+by,4,4,'#e3b341');r(21,20+by,2,2,'#1b1410')}
 if(h==='medic'){r(10,20+by,2,5,'#8a7a64')}
 if(h==='cap')r(19,17+by,3,3,'#8a6a2a');
 // head
 r(6,3+by,16,14,OUT);r(7,4+by,14,12,SK);
 if(h!=='mask'){r(10,10+by,2,3,OUT);r(16,10+by,2,3,OUT);r(8,13+by,2,1,'#e89a8a');r(18,13+by,2,1,'#e89a8a')}
 if(h==='goggles'){
  r(5,1+by,18,5,L.hair);r(4,3+by,3,7,L.hair);r(21,3+by,3,7,L.hair);r(7,5+by,14,2,L.hair);r(8,0+by,2,2,L.hair);r(14,-1+by,2,3,L.hair);r(19,0+by,2,2,L.hair);
  r(7,0+by,14,4,'#4a4338');r(9,1+by,4,2,'#9db0b8');r(15,1+by,4,2,'#9db0b8');
  r(7,14+by,14,3,L.scarf);r(8,15+by,12,3,L.scarf);
 }else{r(13,14+by,2,1,'#8a4a3a')}
 if(h==='medic'){
  r(4,1+by,20,8,'#cdbfa5');r(4,7+by,4,10,'#cdbfa5');r(20,7+by,4,10,'#cdbfa5');r(5,2+by,18,1,'#e0d4bc');
  r(12,2+by,4,1,'#b03a2e');r(13,1+by,2,3,'#b03a2e');
  r(7,6+by,2,8,L.hair);r(19,6+by,2,8,L.hair);
  r(9,9+by,5,4,'#4a4a4a');r(10,10+by,3,2,'#f4ecd8');r(15,9+by,5,4,'#4a4a4a');r(16,10+by,3,2,'#f4ecd8');r(11,10+by,1,2,OUT);r(17,10+by,1,2,OUT);
  r(8,15+by,12,3,L.scarf);
 }
 if(h==='cap'){
  r(6,4+by,16,3,L.hair);r(5,6+by,3,5,L.hair);r(20,6+by,3,5,L.hair);
  r(5,1+by,17,4,'#3a3d46');r(5,0+by,14,2,'#4a4e58');r(14,4+by,10,2,'#2a2c33');
  r(3,8+by,3,5,'#c9972a');r(22,8+by,3,5,'#c9972a');r(9,15+by,10,2,L.scarf);
 }
 if(h==='mask'){
  r(3,0+by,22,18,'#4a5830');r(4,1+by,20,16,L.jacket);r(7,5+by,14,11,'#2a2420');
  r(8,8+by,5,5,'#6a5a48');r(9,9+by,3,3,'#a8a898');r(15,8+by,5,5,'#6a5a48');r(16,9+by,3,3,'#a8a898');
  r(11,13+by,6,4,'#6a5a48');r(12,14+by,4,2,'#3a3028');r(5,16+by,18,3,L.jacket);
 }
 if(h==='beanie'){
  r(5,6+by,18,8,L.hair);r(4,9+by,3,7,L.hair);r(21,9+by,3,7,L.hair);r(10,10+by,2,3,OUT);r(16,10+by,2,3,OUT);
  r(5,1+by,18,7,'#d8c19a');for(let i=8;i<22;i+=3)r(i,1+by,1,6,'#c0a87c');r(5,6+by,18,2,'#c9b088');
  r(10,-2+by,2,3,'#4f9a3a');r(12,-3+by,3,2,'#6ec04a');r(8,-3+by,3,2,'#6ec04a');
  r(8,15+by,12,3,L.scarf);
 }
 if(h==='wolf'){
  r(4,2+by,20,10,'#b8a890');r(4,8+by,4,9,'#b8a890');r(20,8+by,4,9,'#b8a890');
  r(4,-2+by,5,5,'#8a7a68');r(19,-2+by,5,5,'#8a7a68');r(5,0+by,2,3,'#c98a6a');r(21,0+by,2,3,'#c98a6a');
  r(8,5+by,12,3,L.hair);r(10,10+by,2,3,OUT);r(16,10+by,2,3,OUT);
  r(6,15+by,16,4,'#e0d4bc');r(1,28+by,2,5,'#d8a030');
 }
 // weapon
 const w=o.w;
 if(w==='bat')r(21,12+by,2,15,'#8a5a30');
 if(w==='pistol'){r(21,23+by,6,3,'#3a3a3a');r(21,25+by,2,3,'#3a3a3a')}
 if(w==='shotgun'){r(19,22+by,11,2,'#3a3a3a');r(19,24+by,5,3,'#7a4a20')}
 if(w==='rifle'){r(18,21+by,12,2,'#2a2a2a');r(18,23+by,6,3,'#5a4a2a');r(26,23+by,1,3,'#2a2a2a')}
 ctx.restore()}
function drawMini(x,y,L,t){const f=Math.floor(t*7)%2;
 ctx.globalAlpha=.4;R(x-4,y-1,9,2,'#000');ctx.globalAlpha=1;
 R(x-6,y-9,3,5,L.pack);R(x-3,y-6,6,5,L.jacket);R(x-3,y-11,6,5,'#f0c9a0');R(x-3,y-12,6,3,L.hat);R(x-3,y-1,2,1+f,L.pants);R(x+1,y-1,2,2-f,L.pants)}
function drawZ(x,y,t,dir){const f=Math.floor(t*3+x)%2;R(x+1,y-8,3,3,'#7a9a5a');R(x,y-5,5,4,'#5a4a4a');R(x+(dir>0?4:-1),y-5,2,1+f,'#7a9a5a');R(x,y-1,2,1,'#3a3030');R(x+3,y-1+f,2,1,'#3a3030')}

/* ---- deco drawing ---- */
function drawPoster(id,x,y){if(id==='p0')return;R(x-1,y-1,20,26,'#2a1e16');
 if(id==='p1'){R(x,y,18,24,'#c9b88a');for(let i=3;i<24;i+=5)R(x,y+i,18,1,'#a89868');for(let i=3;i<18;i+=5)R(x+i,y,1,24,'#a89868');R(x+6,y+8,3,3,'#b03a2e');R(x+11,y+14,3,3,'#b03a2e')}
 if(id==='p2'){['#3a2a5a','#8a3a5a','#e0703a','#f0b040'].forEach((c,i)=>R(x,y+i*6,18,6,c));R(x+6,y+14,7,5,'#f0d060')}
 if(id==='p3'){R(x,y,18,24,'#1a1a1e');R(x+4,y+5,10,8,'#e8e4d8');R(x+6,y+13,6,3,'#e8e4d8');R(x+6,y+8,2,2,'#1a1a1e');R(x+10,y+8,2,2,'#1a1a1e')}
 if(id==='p4'){R(x,y,18,24,'#e8e4d8');R(x,y,18,5,'#b03a2e');R(x,y+5,18,5,'#e8e4d8');R(x,y+10,18,5,'#b03a2e');R(x,y+15,18,9,'#2a4a8a')}}
function drawRug(id,x,y,w){if(id==='r0')return;const c=DITEM[id].c;R(x,y,w,3,c);R(x,y,w,1,dk(c,1.3));if(id==='r3')for(let i=0;i<w;i+=6)R(x+i,y,3,3,'#3a2a1a')}
function drawLamp(id,x,y){const c=DITEM[id].c;R(x,y,1,12,'#222');
 if(id==='l0'){R(x-2,y+12,5,5,'#8a8a8a');R(x-1,y+14,3,3,c)}
 if(id==='l1'){R(x-8,y+12,17,2,'#222');R(x-7,y+12,15,1,c)}
 if(id==='l2'){R(x-3,y+10,7,8,'#5a4a3a');R(x-2,y+12,5,5,c)}
 ctx.globalAlpha=.1;R(x-18,y+14,37,34,c);R(x-10,y+14,21,22,c);ctx.globalAlpha=1}
function drawPlant(id,x,feet){if(id==='n0')return;R(x,feet-6,8,6,'#8a5a3a');
 if(id==='n1'){R(x+2,feet-18,4,12,'#4a8a4a');R(x-1,feet-14,3,3,'#4a8a4a');R(x+6,feet-12,3,3,'#4a8a4a');R(x+3,feet-20,2,2,'#e56a8a')}
 if(id==='n2'){[[-3,-14],[0,-18],[4,-18],[7,-14],[2,-12]].forEach(p=>R(x+p[0],feet+p[1],4,8,'#4f9a3a'));R(x+2,feet-12,3,6,'#6ec04a')}}
function drawFloor(fid,x,y,w,h){const c=DITEM[fid].c;R(x,y,w,h,c);
 if(fid==='f1')for(let i=0;i<h;i+=4)R(x,y+i,w,1,dk(c,.75));
 if(fid==='f2')for(let j=0;j<h;j+=6)for(let i=0;i<w;i+=6)if(((i/6|0)+(j/6|0))%2)R(x+i,y+j,6,6,dk(c,.82));
 if(fid==='f3')for(let i=0;i<w;i+=12)R(x+i,y,1,h,dk(c,.7))}
function bubble(x,y,txt){R(x-8,y,16,9,'#fff');R(x-2,y+9,4,2,'#fff');T(txt,x,y+1,'#222',6,'center')}

/* ---- hotspots / fx ---- */
let HS=[];const hs=(id,x,y,w,h)=>HS.push({id,x,y,w,h});
let FX=[];function fx(x,y,txt,c){FX.push({x,y,txt,c,t:0})}
function drawFX(dt){for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.t+=dt;if(f.t>1.2){FX.splice(i,1);continue}T(f.txt,f.x,f.y-f.t*18,f.c,7,'center')}}

