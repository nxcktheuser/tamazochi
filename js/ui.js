/* ui.js — Интерфейс: окна (sheets), нижние кнопки, HUD. Обычный скрипт (не модуль): общие глобальные переменные, порядок подключения важен, см. index.html. */
/* ============ SHEETS ============ */
let cur=null;
function openS(fn,...a){cur={fn,a};$('sheet').innerHTML='<button class="x" onclick="closeSheet()">✕</button>'+fn(...a);$('sheet').style.maxHeight=scene==='create'?'58%':'';$('sheet').classList.add('open');$('shade').style.display='block'}
function closeSheet(){cur=null;$('sheet').classList.remove('open');$('shade').style.display='none'}
function refresh(){updHud();if(cur){const sc=$('sheet').scrollTop;$('sheet').innerHTML='<button class="x" onclick="closeSheet()">✕</button>'+cur.fn(...cur.a);$('sheet').scrollTop=sc}}
const bar=(l,v,m,c)=>`<div class="bar"><b><span>${l}</span><span>${Math.round(v)}/${m}</span></b><i><u style="width:${clamp(v/m*100,0,100)}%;background:${c}"></u></i></div>`;

function shNeeds(){const m=moodInfo(),nd=(n,l,v,mx,c)=>bar(ic(n)+' '+l,v,mx,c),hi=heroImg(),act=(f,i,l,n,dis)=>`<button ${dis?'disabled':''} onclick="${f}">${ic(i)}${l}${n!=null?`<em>${n}</em>`:''}</button>`;
 return `<div class="hc"><div class="pt" style="background-image:url(${hi?hi.src:''})"></div><div><b>${S.name}</b><span class="tag">ур.${S.lvl}</span><div class="sub"><img class="ic" src="assets/icons/icon_mood_${m.lv}.png" alt=""> ${m.txt}${S.traits.length?'<br>'+S.traits.map(t=>TR[t].n).join(' · '):''}</div></div></div>
 ${nd('health','Здоровье',S.hp,maxHp(),'#c2453d')}${nd('hunger','Сытость',S.sat,100,'#d8a93a')}${nd('thirst','Жажда',S.thr,100,'#4f9fc9')}${nd('energy','Энергия',S.en,100,'#8fae4a')}${nd('fun','Развлечение',S.fun,100,'#9a7bc2')}${nd('comfort','Комфорт',S.comf,100,'#c8782f')}${nd('star','Опыт',S.xp,S.lvl*30,'#d8b04a')}
 <div class="acts">${act("act('feed')",'food','Еда',S.res.food)}${act("act('drink')",'water','Вода',S.res.water)}${act("act('heal')",'medkit','Лечить',S.res.meds)}
 <button onclick="act('sleep');closeSheet()"><span style="font-size:24px;line-height:26px">${sleeping?'⏰':'😴'}</span>${sleeping?'Встать':'Спать'}</button>${act("doFun('read')",'fun','Читать')}${act("doFun('warm')",'comfort','Греться')}</div>
 <div class="row2"><button class="${S.sp?'p':''}" onclick="openS(shSkills)">Навыки${S.sp?' ('+S.sp+')':''}</button></div>
 <div class="foot"><span>Атака <b>${atk()}</b> · Защита <b>${def()}</b></span><span>Вылазок <b>${S.raids}</b> · Убито <b>${S.kills}</b></span></div>
 <button style="width:100%;margin-top:8px;opacity:.55;font-size:11px;padding:6px" onclick="newGame()">Начать заново</button>`}
function shSkills(){return `<h3>Навыки</h3><div class="sub">Свободных очков: <b>${S.sp}</b>. Очко даётся за каждый новый уровень.</div>`+SKILLS.map(k=>`<div class="it"><div>${k.n} <span class="tag">${S.sk[k.id]}/${SKMAX}</span><small>${k.d}</small></div><button ${S.sp<1||S.sk[k.id]>=SKMAX?'disabled':''} onclick="skUp('${k.id}')">+1</button></div>`).join('')+`<button style="width:100%;margin-top:8px" onclick="openS(shNeeds)">← Герой</button>`}
function craftList(){
 const l=[...WEAPONS.map(x=>['w',x]),...ARMORS.map(x=>['a',x])].filter(([k,x])=>x.t>0&&x.t<=S.sh.work+1&&!(k==='w'?S.gear.weapons:S.gear.armors).includes(x.id));
 return `<h3 style="margin-top:12px">🔨 Крафт</h3>`+(S.sh.work<1?'<div class="sub">Улучши мастерскую, чтобы крафтить.</div>':l.length?l.map(([k,x])=>`<div class="it"><div>${x.n}<small>${k==='w'?'Атака +'+x.atk:'Защита +'+x.def}</small></div><button ${canPay(craftCost(x))?'':'disabled'} onclick="craft('${k}','${x.id}')">${costStr(craftCost(x))}</button></div>`).join(''):'<div class="sub">Всё доступное скрафчено. Улучши мастерскую.</div>')}
function shBuilding(id){const b=SHELTER.find(x=>x.id===id),l=S.sh[id],c=shCost(b),maxed=l>=b.max;
 const pk={garden:'food',rain:'water',work:'scrap'}[id];
 let h=`<h3>${b.i} ${b.n} <span class="tag">ур.${l}/${b.max}</span></h3><div class="sub">${b.desc}${id==='wall'?'. Сейчас: +'+l+' 🛡':''}</div>`;
 if(pk)h+=`<button class="p" style="width:100%;margin-bottom:8px" ${pend(pk)<1?'disabled':''} onclick="collectOne('${pk}')">Собрать ${rN(pk)}: ${pend(pk)}</button>`;
 if(id==='bunk')h+=`<button style="width:100%;margin-bottom:8px" onclick="act('sleep');closeSheet()">${sleeping?'⏰ Встать':'😴 Лечь спать'}</button>`;
 h+=`<button style="width:100%" ${maxed||!canPay(c)?'disabled':''} onclick="upg('${id}')">${maxed?'Максимальный уровень':'⬆️ Улучшить: '+costStr(c)}</button>`;
 if(id==='work')h+=craftList();return h}
function shPOI(id){const b=POIS.find(x=>x.id===id),ec=raidCost(b),rf=refusal(b),cd=Math.max(0,(S.cool[b.id]||0)-Date.now());
 return `<h3>${b.n}</h3><div class="sub">${b.dist.n} · опасность ${'💀'.repeat(Math.min(5,Math.ceil(b.d/2.2)))} · ${ic('energy')} ${ec}</div>
 <div class="sub">Здесь бродят: ${[...new Set(zPool(b))].map(z=>`<img src="assets/zombies/zombie_${z}.png" style="height:36px;vertical-align:bottom;margin-right:6px" alt="">`).join('')}</div>
 <div class="sub">Можно найти: ${Object.keys(b.loot).map(k=>rN(k)).join(', ')}, ${ic('caps')} крышки, ${ic('star')} очки; иногда оружие или броню.</div>
 ${bar(ic('health')+' Здоровье',S.hp,maxHp(),'#e5534b')}${bar(ic('energy')+' Энергия',S.en,100,'#7ed957')}<div class="sub">Атака ${atk()} · Защита ${def()}</div>`+
 (cd>0?`<div class="sub">Здание обчищено. Снова будет добыча через ${Math.ceil(cd/60000)} мин.</div><button style="width:100%" disabled>Здесь пусто</button>`
 :rf?`<div class="sub"><img class="ic" style="width:22px;height:22px" src="assets/icons/icon_mood_angry.png" alt=""> <b>${rf.r}</b></div><button class="p" style="width:100%" onclick="fixRaid('${rf.fix}','${id}')">${rf.btn}</button>`
 :`<button class="p" style="width:100%" onclick="startRaid('${id}')">Выйти на вылазку</button><button style="width:100%;margin-top:6px" onclick="quickRaid('${id}')">Быстрая вылазка без боя (добыча −30%)</button>`)}
function shReport(log){return `<h3>📋 Отчёт</h3><div class="log">${log.join('<br>')}</div><button class="p" style="width:100%;margin-top:10px" onclick="closeSheet()">Продолжить</button>`}
function quickRaid(id){const b=POIS.find(x=>x.id===id);if(refusal(b)||(S.cool[b.id]||0)>Date.now())return openS(shPOI,id);const log=doRaid(b,{quick:true});closeSheet();openS(shReport,log);updHud()}
function startRaid(id){const b=POIS.find(x=>x.id===id);if(refusal(b)||(S.cool[b.id]||0)>Date.now())return openS(shPOI,id);closeSheet();const L=Math.hypot(b.x-HOME.x,b.y-HOME.y);RA={b,t:0,dur:Math.max(1.4,L/60),px:HOME.x,py:HOME.y,done:false};$('hint').textContent=''}
function shStock(){return `<h3>📦 Склад</h3><div class="sub">Излишки можно продать за 💰</div>`+Object.keys(RES).map(k=>`<div class="it"><div>${rN(k)}: <b>${S.res[k]}</b><small>${SELL[k]} 💰 за штуку</small></div><button ${S.res[k]<1?'disabled':''} onclick="sell('${k}')">Продать ${Math.min(5,S.res[k])}</button></div>`).join('')}
function shWard(){return `<h3>👕 Шкаф с бронёй</h3><div class="sub">Защита: ${def()}</div>`+ARMORS.map(a=>{const h=S.gear.armors.includes(a.id);return `<div class="it"><div><span class="sw" style="background:${a.col}"></span>${h?a.n:'???'}<small>${h?'Защита +'+a.def:'Найди в вылазках или скрафти'}</small></div>${h?`<button class="${S.gear.a===a.id?'p':''}" onclick="equip('a','${a.id}')">${S.gear.a===a.id?'Надето':'Надеть'}</button>`:''}</div>`}).join('')}
function shRack(){return `<h3>🔫 Оружие</h3><div class="sub">Атака: ${atk()}</div>`+WEAPONS.map(a=>{const h=S.gear.weapons.includes(a.id);return `<div class="it"><div>${h?a.n:'???'}<small>${h?'Атака +'+a.atk:'Найди в вылазках или скрафти'}</small></div>${h?`<button class="${S.gear.w===a.id?'p':''}" onclick="equip('w','${a.id}')">${S.gear.w===a.id?'В руках':'Взять'}</button>`:''}</div>`}).join('')}
function shDeco(cat){cat=cat||'wall';const cs=scene==='storage'?'st':'sh';
 return `<h3>🎨 Декор · ${scene==='storage'?'склад':'убежище'}</h3><div class="sub">💰 ${S.caps} · ⭐ ${S.pts}. Крышки и очки приходят с вылазок.</div>
 <div class="tabs">${Object.keys(DECO).map(k=>`<button class="${k===cat?'on':''}" onclick="openS(shDeco,'${k}')">${DECO[k].n}</button>`).join('')}</div>`+
 DECO[cat].items.map(i=>{const own=S.owned.includes(i.id),on=S.deco[cs][cat]===i.id,c=dcost(i);
  return `<div class="it"><div>${i.c?`<span class="sw" style="background:${i.c}"></span>`:''}${i.n}</div>${own?`<button class="${on?'p':''}" ${on?'disabled':''} onclick="setDeco('${i.id}')">${on?'✓ Выбрано':'Выбрать'}</button>`:`<button ${canPay(c)?'':'disabled'} onclick="buyDeco('${i.id}')">${costStr(c)}</button>`}</div>`}).join('')}
const CR={name:'',sex:'male',style:'base',tone:'tan',traits:[]};
const crLook=()=>CR.style==='base'?CR.tone:CR.style;
const crBal=()=>CR.traits.reduce((a,t)=>a+TR[t].v,0);
function crTrait(id){if(!crCan(id))return;const i=CR.traits.indexOf(id);if(i>=0)CR.traits.splice(i,1);else CR.traits.push(id);haptic();refresh()}
function crCan(id){const on=CR.traits.includes(id),t=TR[id];if(on)return crBal()-t.v>=0;
 const pos=CR.traits.filter(x=>TR[x].v<0).length,neg=CR.traits.filter(x=>TR[x].v>0).length;
 return t.v<0?(pos<3&&crBal()+t.v>=0):neg<3}
function shCreate(){const styles=['base',...LOOKIDS[CR.sex].filter(x=>!['light','tan','brown','dark'].includes(x))];
 return `<h3>Создай героя</h3><div class="sub">Имя:</div><input id="nm" maxlength="16" placeholder="Выживший" value="${(CR.name||'').replace(/"/g,'')}" oninput="CR.name=this.value">
 <div class="sub">Пол</div><div class="g2"><button class="${CR.sex==='male'?'p':''}" onclick="CR.sex='male';CR.style='base';refresh()">Мужчина</button><button class="${CR.sex==='female'?'p':''}" onclick="CR.sex='female';CR.style='base';refresh()">Женщина</button></div>
 <div class="sub">Внешность</div><div class="g3">${styles.map(id=>`<button class="lk ${CR.style===id?'p':''}" onclick="CR.style='${id}';refresh()"><img src="assets/heroes/hero_${CR.sex}_${id==='base'?CR.tone:id}.png" alt=""><span>${id==='base'?'Классика':LOOKNAME[id]}</span></button>`).join('')}</div>
 ${CR.style==='base'?`<div class="sub">Цвет кожи</div><div class="g2">${TONES.map(t=>`<button class="${CR.tone===t[0]?'p':''}" onclick="CR.tone='${t[0]}';refresh()"><span class="sw" style="background:${t[2]}"></span>${t[1]}</button>`).join('')}</div>`:''}
 <div class="sub">Черты характера. Очков: <b>${crBal()}</b>. Сильные стороны покупаются за счёт слабостей (до 3 и 3).</div>
 ${TRAITS.map(t=>`<div class="it"><div>${t.n}<small>${t.d}</small></div><button class="${CR.traits.includes(t.id)?'p':''}" ${crCan(t.id)?'':'disabled'} onclick="crTrait('${t.id}')">${CR.traits.includes(t.id)?'✓':(t.v>0?'+'+t.v:'−'+(-t.v))}</button></div>`).join('')}
 <button class="p" style="width:100%;margin-top:8px" onclick="startGame()">Начать игру</button>`}
function shHome(){return `<h3>🏠 Убежище</h3><div class="sub">Улучшения и сбор ресурсов</div>`+SHELTER.map(b=>`<div class="it"><div>${b.i} ${b.n} <span class="tag">ур.${S.sh[b.id]}/${b.max}</span><small>${b.desc}</small></div><button onclick="openS(shBuilding,'${b.id}')">Открыть</button></div>`).join('')}
function startGame(){const v=(CR.name||'').trim();S.look=0;S.app={sex:CR.sex,look:crLook()};S.traits=CR.traits.slice();S.name=v||'Выживший';S.fun=80;S.comf=70;S.hp=maxHp();closeSheet();HERO.x=90;HERO.y=262;HERO.tx=90;HERO.ty=262;save();setScene('shelter');haptic()}

/* ============ SCENE CONTROL / HUD ============ */
const NB=(l,i,o,c='')=>`<button class="nb${c}" onclick="${o}"><span>${i}</span>${l}</button>`;
function setScene(s){scene=s;closeSheet();
 const bar=$('bar');
 if(s==='shelter')bar.innerHTML=NB('Тамбур','🚪',"setScene('hall')")+NB('Убежище','🏠','openS(shHome)')+NB('Герой','🧍','openS(shNeeds)',' hot');
 else if(s==='hall')bar.innerHTML=NB('Комната','⬅️',"setScene('shelter')")+NB('Герой','🧍','openS(shNeeds)',' hot');
 else if(s==='storage')bar.innerHTML=NB('Тамбур','⬅️',"setScene('hall')")+NB('Герой','🧍','openS(shNeeds)',' hot');
 else if(s==='city')bar.innerHTML=NB('Домой','🏠',"setScene('hall')")+NB('Герой','🧍','openS(shNeeds)',' hot');
 else bar.innerHTML='';
 if(s==='create')openS(shCreate);
 if(DEV&&['shelter','hall','storage','city'].includes(s))bar.insertAdjacentHTML('beforeend','<button class="nb dev" onclick="openS(shDev)"><span>🛠</span></button>');
 if(s==='shelter'||s==='hall'||s==='storage'){HERO.x=HERO.tx=s==='hall'?104:90;HERO.y=HERO.ty=262}
 $('hint').textContent=s==='city'?'Тащи карту · тапни здание, чтобы идти в вылазку':'';
 if(s==='city'){cam.x=(WW-VW)/2;cam.y=0}
 updHud()}
function updHud(){const h=$('hud');if(scene==='create'){h.innerHTML='';return}
 const m=moodInfo(),u=(v,c)=>`<i><u style="width:${clamp(v,0,100)}%;background:${c}"></u></i>`;
 h.innerHTML=`<div class="hr"><span><img class="ic" style="width:16px;height:16px" src="assets/icons/icon_mood_${m.lv}.png" alt=""> ${S.name} · ур.${S.lvl}</span><span>${ic('caps')}${S.caps} &nbsp;${ic('star')}${S.pts}</span></div>
 <div class="hb">${u(S.hp/maxHp()*100,'#e5534b')}${u(S.sat,'#e3b341')}${u(S.thr,'#58a6ff')}${u(S.en,'#7ed957')}${u(S.fun,'#b88cff')}${u(S.comf,'#e08a3c')}</div>
 <div class="hres">${ic('food')}${S.res.food} ${ic('water')}${S.res.water} ${ic('scrap')}${S.res.scrap} ${ic('medkit')}${S.res.meds} ${ic('parts')}${S.res.parts}</div>`}

