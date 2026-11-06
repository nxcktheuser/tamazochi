/* state.js — Состояние, сохранение и загрузка, офлайн-прогресс, экономика. Обычный скрипт (не модуль): общие глобальные переменные, порядок подключения важен, см. index.html. */
/* ============ STATE ============ */
function fresh(){const n=Date.now();return{
 v:2,t:n,look:null,app:null,name:TG_USER?TG_USER.first_name:'Выживший',
 sat:80,thr:80,en:100,hp:100,lvl:1,xp:0,caps:30,pts:0,
 res:{food:6,water:6,scrap:10,meds:2,parts:0},
 sh:{garden:0,rain:0,work:0,bunk:0,wall:0},
 col:{food:n,water:n,scrap:n},
 gear:{weapons:['fists'],armors:['rags'],w:'fists',a:'rags'},
 deco:{sh:DEF_DECO(),st:DEF_DECO()},
 owned:['w0','f0','p0','r0','l0','n0'],
 raids:0,kills:0,
 traits:[],sk:{scout:0,medic:0,mech:0,stalker:0,garden:0,wolf:0},sp:0,fun:80,comf:70,cd:{},cool:{},sleeping:false}}
let S=fresh(),sleeping=false,loading=true;
const hasT=id=>S.traits.includes(id);
const maxHp=()=>100+(S.lvl-1)*10-(hasT('frail')?20:0);
const WP=()=>WEAPONS.find(x=>x.id===S.gear.w);
const AR=()=>ARMORS.find(x=>x.id===S.gear.a);
const atk=()=>WP().atk+S.lvl+(hasT('strong')?2:0)+(hasT('stubborn')?1:0)+S.sk.wolf;
const def=()=>AR().def+S.sh.wall+S.sk.stalker;

function save(){if(loading)return;S.t=Date.now();if(FB)S.fight=FB;const s=JSON.stringify(S);try{localStorage.setItem(SAVE_KEY,s)}catch(e){}
 if(TG&&TG.CloudStorage&&TG.isVersionAtLeast&&TG.isVersionAtLeast('6.9')){try{TG.CloudStorage.setItem(SAVE_KEY,s)}catch(e){}}}
function load(cb){let local=null;try{local=JSON.parse(localStorage.getItem(SAVE_KEY))}catch(e){}
 const fin=cloud=>{let b=local;if(cloud&&(!b||cloud.t>b.t))b=cloud;if(b){S=Object.assign(fresh(),b);if(b.fight&&b.fight.end==null)FB=b.fight;else FB=null;S.deco=Object.assign({sh:DEF_DECO(),st:DEF_DECO()},b.deco||{});if(S.look!=null&&!S.app)S.app={sex:'male',tone:'tan'};if(S.app&&!S.app.look)S.app.look=S.app.tone||'tan';S.sk=Object.assign(fresh().sk,b.sk||{});S.traits=b.traits||[];S.cd=b.cd||{};S.cool=b.cool||{}}cb()};
 if(TG&&TG.CloudStorage&&TG.isVersionAtLeast&&TG.isVersionAtLeast('6.9')){try{TG.CloudStorage.getItem(SAVE_KEY,(e,v)=>{let c=null;try{c=JSON.parse(v)}catch(x){}fin(c);loading=false});return}catch(e){}}
 loading=false;fin(null)}

function tick(m){if(m<=0||loading)return;
 const hung=(hasT('glutton')?1.4:1)*(hasT('hardy')?.7:1);
 if(S.sleeping){S.en=clamp(S.en+m*(2+S.sh.bunk*.8)*(hasT('sleeper')?1.4:1),0,100);S.sat=clamp(S.sat-m*.08*hung,0,100);S.thr=clamp(S.thr-m*.1*hung,0,100);S.comf=clamp(S.comf+m*.4,0,100);if(S.en>=100){S.sleeping=false;toast('Выспался')}}
 else{S.sat=clamp(S.sat-m*.15*hung,0,100);S.thr=clamp(S.thr-m*.2*hung,0,100);S.en=clamp(S.en+m*.05,0,100);S.fun=clamp(S.fun-m*.12,0,100);S.comf=clamp(S.comf-m*.1*(hasT('smoker')?1.5:1),0,100)}
 if(S.sat<=0||S.thr<=0)S.hp=clamp(S.hp-m*.08,0,maxHp());else if(S.sat>40&&S.thr>40)S.hp=clamp(S.hp+m*.1,0,maxHp())}
function offline(){tick(Math.min((Date.now()-S.t)/60000,480))}
setInterval(()=>{tick(5/60);save();updHud()},5000);

/* ============ ECONOMY ============ */
const canPay=c=>Object.keys(c).every(k=>(k==='caps'||k==='pts'?S[k]:S.res[k])>=c[k]);
const pay=c=>{for(const k in c){if(k==='caps'||k==='pts')S[k]-=c[k];else S.res[k]-=c[k]}};
const costStr=c=>Object.keys(c).filter(k=>c[k]).map(k=>(k==='caps'?ic('caps'):k==='pts'?ic('star'):rI(k))+c[k]).join(' ');
function shCost(b){const l=S.sh[b.id],o={};for(const k in b.base)o[k]=Math.ceil(b.base[k]*Math.pow(1.7,l));return o}
function pend(k){const l={food:S.sh.garden,water:S.sh.rain,scrap:S.sh.work}[k];const m={food:3,water:3,scrap:2}[k];
 const h=Math.min((Date.now()-S.col[k])/3600000,8);return Math.floor(h*l*m*(k==='scrap'?1:1+.15*S.sk.garden))}
function collectOne(k){const n=pend(k);if(n<1)return toast('Пока пусто');S.res[k]+=n;S.col[k]=Date.now();fx(CH.x,CH.y-40,'+'+n+' '+RESE[k],'#7ed957');haptic();save();refresh()}
function upg(id){const b=SHELTER.find(x=>x.id===id),c=shCost(b);if(!canPay(c)||S.sh[id]>=b.max)return;
 for(const k of['food','water','scrap']){const n=pend(k);if(n>0){S.res[k]+=n}S.col[k]=Date.now()}
 pay(c);S.sh[id]++;haptic();toast(b.n+' → ур.'+S.sh[id]);save();refresh()}
function act(a){haptic();
 if(S.hp<=0&&a!=='heal'&&a!=='feed'&&a!=='drink')return toast('Сначала аптечка 💊');
 if(a==='feed'){if(S.res.food<1)return toast('Нет еды');S.res.food--;S.sat=clamp(S.sat+25,0,100)}
 if(a==='drink'){if(S.res.water<1)return toast('Нет воды');S.res.water--;S.thr=clamp(S.thr+30,0,100)}
 if(a==='heal'){if(S.res.meds<1)return toast('Нет аптечек');S.res.meds--;S.hp=clamp(S.hp+40+10*S.sk.medic,1,maxHp())}
 if(a==='sleep'){S.sleeping=!S.sleeping;if(S.sleeping){CH.floor=0;CH.y=floorY(0);CH.path=[];if(scene!=='shelter')setScene('shelter')}else{CH.x=100}}
 save();refresh()}
function equip(k,id){if(k==='w')S.gear.w=id;else S.gear.a=id;haptic();save();refresh()}
function craftCost(x){return{scrap:x.t*12,parts:x.t*3}}
function craft(k,id){const x=(k==='w'?WEAPONS:ARMORS).find(z=>z.id===id),c=craftCost(x);if(!canPay(c))return toast('Не хватает ресурсов');
 pay(c);(k==='w'?S.gear.weapons:S.gear.armors).push(id);toast('Скрафтил: '+x.n);save();refresh()}
function sell(k){const n=Math.min(5,S.res[k]);if(n<1)return;S.res[k]-=n;S.caps+=n*SELL[k];fx(90,200,'+'+n*SELL[k]+'💰','#e3b341');haptic();save();refresh()}
function dcost(i){return{caps:i.caps,pts:i.pts}}
function setDeco(id){S.deco[scene==='storage'?'st':'sh'][DITEM[id].cat]=id;haptic();save();refresh()}
function buyDeco(id){const i=DITEM[id],c=dcost(i);if(!canPay(c))return toast('Не хватает 💰/⭐');pay(c);S.owned.push(id);setDeco(id)}

