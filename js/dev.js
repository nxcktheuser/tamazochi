/* dev.js — Панель разработчика (?dev=1). Обычный скрипт (не модуль): общие глобальные переменные, порядок подключения важен, см. index.html. */
/* ============ ПАНЕЛЬ РАЗРАБОТЧИКА (только при ?dev=1) ============ */
const DEV=(()=>{try{if(location.protocol==='file:')return true;if(/[?&]dev\b/.test(location.search))localStorage.setItem('wl_dev','1');return localStorage.getItem('wl_dev')==='1'}catch(e){return false}})();
function devDo(a){
 if(a==='needs'){S.hp=maxHp();S.sat=S.thr=S.en=S.fun=S.comf=100;S.sleeping=false}
 if(a==='lvl6')S.lvl=Math.max(S.lvl,6);
 if(a==='lvlup'){S.lvl++;S.sp++}
 if(a==='res'){for(const k in S.res)S.res[k]+=20;S.caps+=200;S.pts+=100}
 if(a==='sp')S.sp+=3;
 if(a==='cool'){S.cool={};S.cd={}}
 if(a==='gear'){S.gear.weapons=WEAPONS.map(x=>x.id);S.gear.armors=ARMORS.map(x=>x.id)}
 if(a==='reset'){newGame();return}
 save();refresh();toast('Готово')}
function shDev(){const b=(a,l)=>`<button onclick="devDo('${a}')">${l}</button>`;
 return `<h3>🛠 Разработчик</h3><div class="sub">Видно только с ?dev=1. Уровень ${S.lvl}, свободных очков навыков ${S.sp}.</div>
 <div class="g2">${b('needs','Все потребности и энергия 100')}${b('lvl6','Открыть все районы (ур. 6)')}${b('lvlup','Уровень +1 и очко навыка')}${b('sp','+3 очка навыков')}${b('res','+20 ресурсов, +200 крышек')}${b('cool','Сбросить таймеры зданий')}${b('gear','Всё оружие и броня')}${b('reset','Стереть сохранение')}</div>`}

