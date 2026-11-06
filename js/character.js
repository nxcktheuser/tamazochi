/* character.js — Характер, настроение, отказы, новая игра. Обычный скрипт (не модуль): общие глобальные переменные, порядок подключения важен, см. index.html. */
/* ============ ХАРАКТЕР, НАСТРОЕНИЕ, ОТКАЗЫ ============ */
const RESPAWN_MS=90*60*1000;
const TRAITS=[
 {id:'stubborn',n:'Упрямый',v:2,d:'Отказывается раньше, зато +1 к атаке'},
 {id:'coward',n:'Трусливый',v:2,d:'Не идёт в опасные места без оружия и брони'},
 {id:'lazy',n:'Ленивый',v:2,d:'Вылазки на 20% дороже по энергии'},
 {id:'glutton',n:'Обжора',v:2,d:'Быстрее голодает и хочет пить'},
 {id:'frail',n:'Хилый',v:2,d:'Здоровья на 20 меньше'},
 {id:'smoker',n:'Курильщик',v:1,d:'Комфорт падает быстрее'},
 {id:'strong',n:'Сильный',v:-3,d:'+2 к атаке'},
 {id:'tough',n:'Выносливый',v:-2,d:'Вылазки на 15% дешевле по энергии'},
 {id:'lucky',n:'Везучий',v:-3,d:'Добычи на 20% больше'},
 {id:'hardy',n:'Неприхотливый',v:-2,d:'Медленнее голодает и хочет пить'},
 {id:'sleeper',n:'Лёгкий сон',v:-2,d:'Быстрее восстанавливается во сне'}];
const TR={};TRAITS.forEach(t=>TR[t.id]=t);
const SKILLS=[
 {id:'scout',n:'Разведчик',d:'−8% энергии на вылазки за уровень'},
 {id:'medic',n:'Медик',d:'+10 здоровья от аптечки за уровень'},
 {id:'mech',n:'Механик',d:'+1 лом с вылазки за уровень'},
 {id:'stalker',n:'Сталкер',d:'+1 защита за уровень'},
 {id:'garden',n:'Садовник',d:'+15% еды и воды с огорода и дождя за уровень'},
 {id:'wolf',n:'Волчонок',d:'+1 атака за уровень'}];
const SKMAX=3;
function skUp(id){if(S.sp<1||S.sk[id]>=SKMAX)return;S.sp--;S.sk[id]++;haptic();save();refresh()}
let LASTRAID=null,BT=null;
function moodInfo(){const hpP=S.hp/maxHp()*100,arr=[S.sat,S.thr,S.en,hpP,S.fun,S.comf],avg=arr.reduce((a,b)=>a+b,0)/6,mn=Math.min(S.sat,S.thr,S.en,hpP);
 let lv='neutral';if(mn<15||avg<32)lv='angry';else if(avg<52||mn<28)lv='grumpy';else if(avg>=72&&mn>=40)lv='cheerful';
 return{lv,avg,txt:{cheerful:'Бодр',neutral:'Нормально',grumpy:'Ворчит',angry:'Злой'}[lv]}}
function zPool(b){return b.d<=3?['regular','regular','fast']:b.d<=6?['regular','fast','soldier']:b.d<=9?['fast','soldier','bulky']:['soldier','bulky','bulky']}
function raidCost(b){return Math.max(1,Math.ceil(b.e*(hasT('lazy')?1.2:1)*(hasT('tough')?.85:1)*(1-.08*S.sk.scout)))}
function refusal(b){const st=hasT('stubborn')?10:0,ec=raidCost(b);
 if(S.hp<25+st)return{r:'Мне плохо, я не пойду',fix:'heal',btn:'Вылечить'};
 if(S.sat<22+st)return{r:'Я голоден, не пойду',fix:'feed',btn:'Покормить'};
 if(S.thr<22+st)return{r:'Хочу пить, не пойду',fix:'drink',btn:'Напоить'};
 if(S.en<ec)return{r:'Я вымотан, нужен отдых',fix:'sleep',btn:'Уложить спать'};
 if(hasT('coward')&&b.d>=4&&def()<1&&WP().atk<4)return{r:'Страшно идти без оружия и брони',fix:'gear',btn:'Открыть склад'};
 if(S.fun<12+st)return{r:'Мне тоскливо, не хочется',fix:'read',btn:'Дать почитать'};
 if(S.comf<10+st)return{r:'Мне неуютно, хочу согреться',fix:'warm',btn:'Погреться'};
 return null}
function fixRaid(f,id){
 if(f==='sleep'){act('sleep');closeSheet();setScene('shelter');return}
 if(f==='gear'){closeSheet();setScene('storage');return}
 if(f==='feed'||f==='drink'||f==='heal')act(f);else if(f==='read'||f==='warm')doFun(f);
 openS(shPOI,id)}
const CDMS={read:45000,radio:45000,warm:45000};
function doFun(k){const l=(S.cd[k]||0)+CDMS[k]-Date.now();if(l>0)return toast('Ещё рано, подожди '+Math.ceil(l/1000)+' с');
 if(k==='warm'){S.comf=clamp(S.comf+30,0,100);toast('Согрелся, комфорт +30')}
 else{const g=k==='read'?35:25;S.fun=clamp(S.fun+g,0,100);toast((k==='read'?'Почитал':'Послушал радио')+', настроение +'+g)}
 S.cd[k]=Date.now();haptic();save();refresh()}

/* ============ НОВАЯ ИГРА ============ */
function wipeSave(cb){try{localStorage.removeItem(SAVE_KEY)}catch(e){}
 if(TG&&TG.CloudStorage&&TG.isVersionAtLeast&&TG.isVersionAtLeast('6.9')){try{TG.CloudStorage.removeItem(SAVE_KEY,()=>cb&&cb());return}catch(e){}}
 cb&&cb()}
function ask(msg,yes){if(TG&&TG.showConfirm&&TG.isVersionAtLeast&&TG.isVersionAtLeast('6.2'))TG.showConfirm(msg,ok=>{if(ok)yes()});else if(confirm(msg))yes()}
function newGame(){ask('Начать заново? Текущий герой и весь прогресс будут удалены.',()=>wipeSave(()=>location.reload()))}
const RESET=(()=>{try{if(/[?&]reset\b/.test(location.search)&&!sessionStorage.getItem('wl_reset_done')){sessionStorage.setItem('wl_reset_done','1');return true}}catch(e){}return false})();

