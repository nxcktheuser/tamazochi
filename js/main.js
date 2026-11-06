/* main.js — Ввод (тапы), игровой цикл, запуск. Обычный скрипт (не модуль): общие глобальные переменные, порядок подключения важен, см. index.html. */
/* ============ INPUT ============ */
let ptr=null;
cv.addEventListener('pointerdown',e=>{try{cv.setPointerCapture(e.pointerId)}catch(x){}ptr={x0:e.clientX,y0:e.clientY,cx:cam.x,cy:cam.y,moved:false}});
cv.addEventListener('pointermove',e=>{if(!ptr)return;const dx=e.clientX-ptr.x0,dy=e.clientY-ptr.y0;if(Math.abs(dx)+Math.abs(dy)>6)ptr.moved=true;
 if(scene==='city'&&ptr.moved&&!RA){cam.x=clamp(ptr.cx-dx/SC,0,WW-VW);cam.y=clamp(ptr.cy-dy/SC,0,WH-VH)}});
cv.addEventListener('pointerup',e=>{if(!ptr)return;const p=ptr;ptr=null;if(p.moved)return;const r=cv.getBoundingClientRect();tap((e.clientX-r.left)/SC,(e.clientY-r.top)/SC)});
function tap(x,y){if(scene==='create'&&!cur){openS(shCreate);return}if(cur)return;if(scene==='fight'){fightTap(x,y);return}haptic();
 if(scene==='city'){if(RA)return;const wx=x+Math.round(cam.x),wy=y+Math.round(cam.y);
  for(const b of POIS)if(Math.abs(wx-b.x)<=14&&wy>=b.y-30&&wy<=b.y+16){if(S.lvl<b.dist.lvl)return toast('Район закрыт: нужен уровень '+b.dist.lvl);return openS(shPOI,b.id)}return}
 let hit=null;for(let i=HS.length-1;i>=0;i--){const h=HS[i];if(x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h){hit=h.id;break}}
 if((scene==='shelter'||scene==='hall'||scene==='storage')&&!S.sleeping&&!hit&&y>=curFloor().y0-6&&y<=curFloor().y1+4){const F=curFloor();HERO.tx=clamp(x,F.x0,F.x1);HERO.ty=clamp(y,F.y0,F.y1);return}
 if(!hit)return;
 if(scene==='hall'){
  if(hit==='char')return openS(shNeeds);
  if(hit==='vault'){HERO.tx=HERO.x=104;HERO.ty=HERO.y=262;return setScene('city')}
  if(hit==='doorstore'){HERO.tx=HERO.x=40;HERO.ty=HERO.y=262;return setScene('storage')}
  if(hit==='lockerh')return toast('Пустые шкафы, пока ничего нет');
  if(hit==='coat')return toast('Старое пальто. Пригодится для одежды позже');return}
 if(scene==='shelter'){
  const walkTo=(tx,ty)=>{if(!sleeping){HERO.tx=tx;HERO.ty=ty}};
  if(hit==='char')return openS(shNeeds);
  if(hit==='bunk'){walkTo(112,226);return openS(shBuilding,'bunk')}
  if(hit==='desk'){walkTo(66,224);return openS(shBuilding,'work')}
  if(hit==='window')return openS(shBuilding,'wall');
  if(hit==='locker'){walkTo(150,240);return openS(shWard)}
  if(hit==='shelf')return doFun('read');if(hit==='radio')return doFun('radio');if(hit==='radiator')return doFun('warm')}
 else if(scene==='storage'){
  if(hit==='ward')return openS(shWard);if(hit==='rack')return openS(shRack);if(hit==='stock')return openS(shStock);
  if(hit==='char')return openS(shNeeds);if(['poster','rug','lamp','plant'].includes(hit))return openS(shDeco,hit)}}

/* ============ LOOP ============ */
let last=performance.now();
function frame(ts){const dt=Math.min(.05,(ts-last)/1000);last=ts;time+=dt;
 for(const z of SZ){z.x+=z.d*dt*4;if(z.x<4||z.x>170)z.d*=-1}
 updChar(dt);updHero(dt);ctx.setTransform(K,0,0,K,0,0);ctx.imageSmoothingEnabled=false;
 if(scene==='create')drawCreate();else if(scene==='shelter')drawShelter();else if(scene==='hall')drawHall();else if(scene==='storage')drawStorage();else if(scene==='city')drawCity(dt);else if(scene==='battle')drawBattle(dt);else if(scene==='fight')drawFight(dt);
 drawFX(dt);flushText();requestAnimationFrame(frame)}

const boot=()=>load(()=>{offline();CH.y=floorY(0);CH.x=60;if(S.app==null)setScene('create');else setScene('shelter');updHud();requestAnimationFrame(frame)});
if(RESET)wipeSave(boot);else boot();
document.addEventListener('visibilitychange',()=>{if(!document.hidden){offline();S.t=Date.now();updHud()}});
