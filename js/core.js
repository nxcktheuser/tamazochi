/* core.js — Конфиг, Telegram, утилиты. Грузится первым. Обычный скрипт (не модуль): общие глобальные переменные, порядок подключения важен, см. index.html. */
/* ============ CONFIG / TELEGRAM ============ */
const SAVE_KEY='wasteland_home_v2';
const TG=window.Telegram&&Telegram.WebApp;
if(TG){TG.ready();TG.expand();try{TG.disableVerticalSwipes()}catch(e){}try{TG.setHeaderColor('#0b0d10');TG.setBackgroundColor('#0b0d10')}catch(e){}}
const TG_USER=TG&&TG.initDataUnsafe&&TG.initDataUnsafe.user;

/* ============ UTIL ============ */
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
function mul(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function dk(h,f){const n=parseInt(h.slice(1),16);return '#'+[(n>>16)&255,(n>>8)&255,n&255].map(v=>clamp(Math.round(v*f),0,255).toString(16).padStart(2,'0')).join('')}
function toast(t){const e=$('toast');e.textContent=t;e.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>e.classList.remove('show'),1700)}
function haptic(){try{TG.HapticFeedback.impactOccurred('light')}catch(e){}}

