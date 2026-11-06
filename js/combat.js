/* combat.js — Интерактивный бой волнами. Обычный скрипт (не модуль): общие глобальные переменные, порядок подключения важен, см. index.html. */
/* ============ ИНТЕРАКТИВНЫЙ БОЙ ============ */
let FB=null;
const ZT={regular:{hp:1,spd:11,dmg:1,att:1.1},fast:{hp:.7,spd:26,dmg:.7,att:.8},soldier:{hp:1.35,spd:15,dmg:1.2,att:1.1},bulky:{hp:2.4,spd:7,dmg:1.7,att:1.8}};
const FHX=46,FGY=266,FHH=84;
function newFight(b){const zc=b.d+rnd(1,3),pool=zPool(b),types=Array.from({length:zc},()=>pool[rnd(0,pool.length-1)]),nw=2+(b.d>=5?1:0)+(b.d>=9?1:0),sizes=[];
 for(let i=0;i<nw;i++)sizes.push(Math.floor(zc/nw)+(i<zc%nw?1:0));
 return{b,t:0,hp:S.hp,zs:[],queue:[],types,sizes,wave:-1,nextWave:.6,spawnIdx:0,kills:0,total:zc,cd:{block:0,gren:0,heal:0,tap:0},blockT:0,hat:.5,lunge:0,hurt:0,shake:0,P:[],banner:'',bannerT:0,end:null,endT:0,sig:'',mood:moodInfo().lv}}
const heroRange=()=>WP().atk>=7?150:32;
const heroDmg=m=>Math.max(1,Math.round((atk()+rnd(0,3))*m*(FB&&FB.mood==='cheerful'?1.1:1)));
function fightStartWave(f){f.wave++;const n=f.sizes[f.wave];f.banner='ВОЛНА '+(f.wave+1)+'/'+f.sizes.length;f.bannerT=1.6;
 for(let i=0;i<n;i++)f.queue.push({at:f.t+.5+i*.9,type:f.types[f.spawnIdx++]})}
function fightHit(f,z,d,crit){z.hp-=d;z.flash=.12;if(crit&&z.type!=='bulky')z.x+=6;fx(z.x,FGY-FHH*.75,'-'+Math.round(d),crit?'#e3b341':'#fff');
 for(let i=0;i<4;i++)f.P.push({x:z.x,y:FGY-FHH*.5,vx:rnd(-30,30),vy:rnd(-60,-10),l:.4,c:'#8a2e2e'})}
function fightHurt(f,z){const T_=ZT[z.type];let d=Math.max(1,Math.round((f.b.d+rnd(0,2))*T_.dmg-def()+(f.mood==='grumpy'?1:0)));if(f.blockT>0)d=Math.max(1,Math.round(d*.3));
 f.hp=Math.max(0,f.hp-d);f.hurt=.25;f.shake=.18;fx(FHX,FGY-FHH,'-'+d,'#e5534b');haptic()}
function updFight(f,dt){f.t+=dt;
 f.shake=Math.max(0,f.shake-dt);f.hurt=Math.max(0,f.hurt-dt);f.lunge=Math.max(0,f.lunge-dt);f.bannerT=Math.max(0,f.bannerT-dt);f.blockT=Math.max(0,f.blockT-dt);
 for(const q of f.P){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=180*dt;q.l-=dt}f.P=f.P.filter(q=>q.l>0);
 if(f.end){f.endT+=dt;if(f.endT>1.3)finishFight();return}
 if(f.nextWave!==null&&f.t>=f.nextWave){f.nextWave=null;fightStartWave(f)}
 while(f.queue.length&&f.queue[0].at<=f.t){const q=f.queue.shift(),mx=Math.max(1,Math.round((4+f.b.d*2)*ZT[q.type].hp));f.zs.push({type:q.type,x:200,hp:mx,max:mx,att:ZT[q.type].att*.6,flash:0})}
 f.zs.sort((a,b)=>a.x-b.x);
 f.zs.forEach((z,i)=>{const T_=ZT[z.type],stop=FHX+22+i*16;z.flash=Math.max(0,z.flash-dt);
  if(z.x>stop)z.x=Math.max(stop,z.x-T_.spd*dt);else if(i<2){z.att-=dt;if(z.att<=0){z.att=T_.att;fightHurt(f,z)}}});
 f.hat-=dt;
 if(f.hat<=0&&f.zs.length){const z=f.zs[0];if(z.x-FHX<=heroRange()){f.hat=WP().atk>=7?1.1:.9;fightHit(f,z,heroDmg(1),false);f.lunge=.18}}
 for(const z of f.zs)if(z.hp<=0){f.kills++;for(let i=0;i<8;i++)f.P.push({x:z.x,y:FGY-FHH*.4,vx:rnd(-50,50),vy:rnd(-80,-20),l:.6,c:i%2?'#6b7a5a':'#8a2e2e'})}
 f.zs=f.zs.filter(z=>z.hp>0);
 if(f.hp<=0){f.end='lose';f.endT=0;f.banner='ПРИШЛОСЬ ОТСТУПИТЬ';f.bannerT=9;return}
 if(!f.queue.length&&!f.zs.length&&f.nextWave===null){if(f.wave<f.sizes.length-1)f.nextWave=f.t+1.4;else{f.end='win';f.endT=0;f.banner='ПОБЕДА';f.bannerT=9}}}
function fightTap(x,y){const f=FB;if(!f||f.end||f.cd.tap>f.t||!f.zs.length)return;
 const z=f.zs.find(q=>Math.abs(q.x-x)<16&&y>FGY-zH(q.type,FHH)-6&&y<FGY+6)||f.zs[0];
 if(z.x-FHX>heroRange()){fx(FHX+22,FGY-FHH,'далеко','#aaa');return}
 f.cd.tap=f.t+.45;f.lunge=.2;fightHit(f,z,heroDmg(1.7),true);haptic()}
function fightSkill(k){const f=FB;if(!f||f.end||f.cd[k]>f.t)return;
 if(k==='block'){f.blockT=1.5;f.cd.block=f.t+6;fx(FHX,FGY-FHH-4,'БЛОК','#58a6ff')}
 else if(k==='gren'){if(S.res.scrap<3)return;S.res.scrap-=3;f.cd.gren=f.t+10;const d=10+S.lvl*2+atk();for(const z of f.zs)if(z.x<165)fightHit(f,z,d,true);f.shake=.3;
  for(let i=0;i<24;i++)f.P.push({x:rnd(70,160),y:FGY-rnd(10,60),vx:rnd(-60,60),vy:rnd(-90,-10),l:.5,c:i%2?'#e3b341':'#e5534b'})}
 else if(k==='heal'){if(S.res.meds<1||f.hp>=maxHp())return;S.res.meds--;f.hp=Math.min(maxHp(),f.hp+35+10*S.sk.medic);f.cd.heal=f.t+4;fx(FHX,FGY-FHH,'+HP','#7ed957')}
 f.sig='';haptic()}
function fightRetreat(){const f=FB;if(!f||f.end)return;f.end='retreat';f.endT=0;f.banner='ОТСТУПЛЕНИЕ';f.bannerT=9;f.sig=''}
function updFightBar(){const f=FB;if(!f)return;const c=k=>Math.max(0,Math.ceil(f.cd[k]-f.t)),sig=[c('block'),c('gren'),c('heal'),S.res.scrap,S.res.meds,f.end?1:0].join('|');if(sig===f.sig)return;f.sig=sig;const d=f.end;
 $('bar').innerHTML=`<button ${d||c('block')?'disabled':''} onclick="fightSkill('block')">Блок${c('block')?' '+c('block'):''}</button><button ${d||c('gren')||S.res.scrap<3?'disabled':''} onclick="fightSkill('gren')">Граната ${ic('scrap')}3${c('gren')?' · '+c('gren'):''}</button><button ${d||c('heal')||S.res.meds<1?'disabled':''} onclick="fightSkill('heal')">${ic('medkit')} ${S.res.meds}${c('heal')?' · '+c('heal'):''}</button><button ${d?'disabled':''} onclick="fightRetreat()">Бежать</button>`}
function finishFight(){const f=FB;FB=null;const log=doRaid(f.b,{out:{zs:f.types,kills:f.kills,dead:f.end==='lose',hp:f.hp,retreat:f.end==='retreat'}});RA=null;setScene('city');openS(shReport,log)}
function drawFight(dt){HS=[];const f=FB;if(!f)return;updFight(f,dt);if(!FB)return;updFightBar();const b=f.b;
 ctx.save();if(f.shake>0)ctx.translate(rnd(-1,1)*1.6,rnd(-1,1)*1.6);
 if(IMG.map){const sx=clamp(b.x-90,0,WW-VW),sy=clamp(b.y-230,0,WH-VH);ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(IMG.map,-sx,-sy,WW,WH);ctx.restore()}else R(0,0,VW,VH,'#1b1814');
 ctx.fillStyle='rgba(12,9,6,.66)';ctx.fillRect(-4,-4,VW+8,VH+8);
 for(const z of f.zs.slice().sort((a,c)=>c.x-a.x)){const hh=zH(z.type,FHH),bob=Math.abs(Math.sin(f.t*8+z.x*.1))*(z.x>FHX+30?1.2:.3);
  drawSprite(IMG['z_'+z.type],z.x,FGY-bob,hh,-1,{alpha:z.flash>0?.55:1});
  R(z.x-8,FGY-hh-6,16,3,'#000');R(z.x-7,FGY-hh-5,Math.max(0,14*z.hp/z.max),1,'#e5534b')}
 const lx=f.lunge>0?10*Math.sin(f.lunge/.2*Math.PI):0;
 drawSprite(heroImg(),FHX+lx,FGY,FHH,1,{alpha:f.hurt>0&&Math.floor(f.t*20)%2?.5:1});
 if(f.blockT>0){ctx.save();ctx.strokeStyle='rgba(88,166,255,.85)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(FHX+6,FGY-FHH*.5,22,FHH*.55,0,0,7);ctx.stroke();ctx.restore()}
 for(const q of f.P)R(q.x,q.y,2,2,q.c);
 ctx.restore();
 if(f.hurt>0){ctx.fillStyle='rgba(229,83,75,'+(.22*f.hurt/.25)+')';ctx.fillRect(0,0,VW,VH)}
 R(10,52,80,6,'#000');R(11,53,78*clamp(f.hp/maxHp(),0,1),4,'#e5534b');
 T('Убито '+f.kills+'/'+f.total,172,50,'#fff',7,'right');
 if(f.bannerT>0)T(f.banner,90,110,f.end==='lose'?'#e5534b':'#e3b341',11,'center')}

