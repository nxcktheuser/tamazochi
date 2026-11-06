/* data.js — Данные игры: ресурсы, здания, оружие, черты, навыки. Только константы. Обычный скрипт (не модуль): общие глобальные переменные, порядок подключения важен, см. index.html. */
/* ============ DATA ============ */
const LOOKS=[
 {n:'Разведчик',perk:'📡 Вылазки на 10% дешевле по энергии',jacket:'#5b6b3a',scarf:'#3a3d44',hair:'#7a4a28',pack:'#4a5230',pants:'#4a4f5a',head:'goggles',hat:'#4a4338'},
 {n:'Медик',perk:'➕ Аптечки лечат на 20 HP больше',jacket:'#cdbfa5',scarf:'#8a7a6a',hair:'#3a2a25',pack:'#5a4636',pants:'#6a5a4a',head:'medic',hat:'#cdbfa5'},
 {n:'Механик',perk:'🔧 +1 лом с каждой вылазки',jacket:'#c08a2c',scarf:'#a8432f',hair:'#e3b341',pack:'#7a5a30',pants:'#4a5a78',head:'cap',hat:'#3a3d46'},
 {n:'Сталкер',perk:'☢️ +2 к защите',jacket:'#5c6b3a',scarf:'#5c6b3a',hair:'#2a2420',pack:'#2a2c30',pants:'#3a3228',head:'mask',hat:'#5c6b3a'},
 {n:'Садовник',perk:'🌱 Огород и сбор воды дают +25%',jacket:'#5f8a3f',scarf:'#c9a064',hair:'#b0522a',pack:'#8a6038',pants:'#6a5a3a',head:'beanie',hat:'#d8c19a'},
 {n:'Волчонок',perk:'🐺 +2 к атаке',jacket:'#5a4a44',scarf:'#e0d4bc',hair:'#2a2220',pack:'#4a3a30',pants:'#4a4a50',head:'wolf',hat:'#b8a890'},
];
const WEAPONS=[
 {id:'fists',n:'Кулаки',atk:1,t:0},{id:'bat',n:'Бита',atk:4,t:1},{id:'pistol',n:'Пистолет',atk:7,t:2},
 {id:'shotgun',n:'Дробовик',atk:11,t:3},{id:'rifle',n:'Автомат',atk:16,t:4}];
const ARMORS=[
 {id:'rags',n:'Лохмотья',def:0,t:0,col:'#7a6a5a'},{id:'jacket',n:'Кожанка',def:1,t:1,col:'#4a3426'},
 {id:'vest',n:'Бронежилет',def:3,t:2,col:'#4a5560'},{id:'plate',n:'Пластины',def:5,t:3,col:'#6a6f78'},
 {id:'swat',n:'Броня SWAT',def:8,t:4,col:'#2f3640'}];
const ic=n=>'<img class="ic" src="assets/icons/icon_'+n+'.png" alt="">';
const RES={food:'Еда',water:'Вода',scrap:'Лом',meds:'Аптечки',parts:'Детали'};
const RESIC={food:'food',water:'water',scrap:'scrap',meds:'medkit',parts:'parts'};
const RESE={food:'🍖',water:'💧',scrap:'🔩',meds:'💊',parts:'⚙️'};
const rI=k=>ic(RESIC[k]),rN=k=>rI(k)+' '+RES[k];
const SELL={food:2,water:2,scrap:1,meds:6,parts:4};
const SHELTER=[
 {id:'garden',n:'Огород',i:'🥕',desc:'Выращивает еду (до 8 часов копится)',base:{scrap:10},max:5},
 {id:'rain',n:'Сбор дождя',i:'🌧',desc:'Накапливает воду',base:{scrap:10},max:5},
 {id:'work',n:'Мастерская',i:'🛠',desc:'Производит лом, открывает крафт',base:{scrap:15},max:5},
 {id:'bunk',n:'Кровать',i:'🛏',desc:'Чем лучше кровать — тем быстрее восстанавливается энергия',base:{scrap:12},max:5},
 {id:'wall',n:'Стена',i:'🧱',desc:'Каждый уровень даёт +1 к защите в вылазках',base:{scrap:20,parts:2},max:5},
];
const DISTRICTS=[
 {id:'sub',n:'Окраина',lvl:1,y0:0,y1:143,b:[
  {id:'garage',n:'Гараж',k:'garage',x:201,y:46,d:1,e:10,loot:{scrap:[2,5],parts:[0,1]},gt:1},
  {id:'shop',n:'Магазинчик',k:'shop',x:90,y:121,d:2,e:12,loot:{food:[2,5],water:[1,4]},gt:1},
  {id:'pharm',n:'Аптека',k:'pharm',x:179,y:121,d:3,e:14,loot:{meds:[1,3],water:[0,2]},gt:2}]},
 {id:'cen',n:'Центр',lvl:3,y0:143,y1:334,b:[
  {id:'mart',n:'Супермаркет',k:'mart',x:70,y:232,d:4,e:16,loot:{food:[5,10],water:[4,8]},gt:2},
  {id:'police',n:'Участок',k:'police',x:73,y:314,d:5,e:18,loot:{scrap:[3,6],parts:[1,3]},gt:3},
  {id:'hosp',n:'Больница',k:'hosp',x:201,y:238,d:6,e:20,loot:{meds:[3,6],parts:[1,2]},gt:3}]},
 {id:'ind',n:'Промзона',lvl:5,y0:334,y1:484,b:[
  {id:'ware',n:'Склад',k:'ware',x:56,y:411,d:7,e:22,loot:{scrap:[8,14],parts:[2,4]},gt:3},
  {id:'fact',n:'Завод',k:'fact',x:218,y:416,d:9,e:25,loot:{scrap:[10,18],parts:[3,6]},gt:4},
  {id:'base',n:'Воен. база',k:'base',x:218,y:469,d:11,e:30,loot:{meds:[3,6],parts:[4,8],scrap:[8,12]},gt:4}]},
];
const POIS=[];DISTRICTS.forEach(d=>d.b.forEach(b=>{b.dist=d;POIS.push(b)}));
const HOME={x:135,y:26};

const DECO={
 wall:{n:'Стены',items:[{id:'w0',n:'Бетон',c:'#3c4249',caps:0,pts:0},{id:'w1',n:'Кирпич',c:'#6b3f36',caps:25,pts:10},{id:'w2',n:'Хвоя',c:'#2f4a3c',caps:25,pts:10},{id:'w3',n:'Ночь',c:'#2d3e57',caps:40,pts:20},{id:'w4',n:'Охра',c:'#7a6a3a',caps:40,pts:20}]},
 floor:{n:'Пол',items:[{id:'f0',n:'Бетон',c:'#2a2f35',caps:0,pts:0},{id:'f1',n:'Паркет',c:'#7a5530',caps:30,pts:10},{id:'f2',n:'Плитка',c:'#9aa0a6',caps:40,pts:20},{id:'f3',n:'Металл',c:'#4f565e',caps:35,pts:15}]},
 poster:{n:'Постеры',items:[{id:'p0',n:'Без постера',caps:0,pts:0},{id:'p1',n:'Карта',caps:15,pts:5},{id:'p2',n:'Закат',caps:20,pts:10},{id:'p3',n:'Череп',caps:25,pts:10},{id:'p4',n:'Флаг',caps:30,pts:15}]},
 rug:{n:'Ковры',items:[{id:'r0',n:'Без ковра',caps:0,pts:0},{id:'r1',n:'Красный',c:'#8a2e2e',caps:20,pts:5},{id:'r2',n:'Зелёный',c:'#3a6a3a',caps:20,pts:5},{id:'r3',n:'Полосатый',c:'#c9a040',caps:35,pts:15}]},
 lamp:{n:'Свет',items:[{id:'l0',n:'Лампочка',c:'#ffe9a0',caps:0,pts:0},{id:'l1',n:'Неон',c:'#4ee0e0',caps:40,pts:20},{id:'l2',n:'Фонарь',c:'#ffb347',caps:30,pts:10}]},
 plant:{n:'Растения',items:[{id:'n0',n:'Без растения',caps:0,pts:0},{id:'n1',n:'Кактус',caps:15,pts:5},{id:'n2',n:'Папоротник',caps:20,pts:10}]},
};
const DITEM={};for(const k in DECO)DECO[k].items.forEach(i=>{i.cat=k;DITEM[i.id]=i});
const DEF_DECO=()=>({wall:'w0',floor:'f0',poster:'p0',rug:'r0',lamp:'l0',plant:'n0'});

