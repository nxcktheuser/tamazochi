/* raid.js — Вылазки: расчёт добычи и результата. Обычный скрипт (не модуль): общие глобальные переменные, порядок подключения важен, см. index.html. */
/* ============ RAID ============ */
function doRaid(b,o){o=o||{};
 S.en-=raidCost(b);S.raids++;S.cool[b.id]=Date.now()+RESPAWN_MS;
 const log=[`<b>${b.n}</b> · настроение: ${moodInfo().txt}`];
 const zc=o.out?o.out.zs.length:b.d+rnd(1,3),mood=moodInfo().lv,pool=zPool(b),zs=o.out?o.out.zs:Array.from({length:zc},()=>pool[rnd(0,pool.length-1)]),lm=(mood==='cheerful'?1.15:mood==='grumpy'?.85:1)*(hasT('lucky')?1.2:1)*(o.quick?.7:1)*(o.out&&o.out.retreat?.6:1);let hp=o.out?o.out.hp:S.hp,dead=o.out?o.out.dead:false,kills=o.out?o.out.kills:0;
 if(!o.out)for(let z=0;z<zc&&!dead;z++){let zh=4+b.d*2;
  while(zh>0&&hp>0){zh-=atk()+rnd(0,3);if(zh>0)hp-=Math.max(1,b.d+rnd(0,2)-def()+(mood==='grumpy'?1:0))}
  if(hp>0)kills++;else dead=true}
 S.kills+=kills;const dmg=S.hp-Math.max(hp,0);S.hp=Math.max(hp,0);LASTRAID={zc,zs,kills,dead};
 log.push(`Убито: ${kills}/${zc} · урон −${Math.round(dmg)} HP`);
 if(o.out&&o.out.retreat)log.push('Отступил: добыча урезана до 60%');if(o.quick)log.push('Быстрая вылазка: добыча −30%');
 if(dead){S.hp=1;log.push('<span class="l">💀 Тебя чуть не прикончили. Еле дополз домой, добыча потеряна.</span>')}
 else{
  const got=[];
  for(const k in b.loot){const n=Math.round(rnd(b.loot[k][0],b.loot[k][1])*lm)+(k==='scrap'?Math.floor(S.sh.work/2)+S.sk.mech:0);if(n>0){S.res[k]+=n;got.push(rI(k)+n)}}
  const caps=rnd(1,3)*b.d,pts=b.d*4+kills;S.caps+=caps;S.pts+=pts;got.push(ic('caps')+caps);got.push(ic('star')+pts);
  log.push('<span class="w">Лут: '+got.join(' ')+'</span>');
  if(Math.random()<.18+b.d*.02){
   const isW=Math.random()<.5,t=Math.min(b.gt,rnd(Math.max(1,b.gt-1),b.gt));
   const it=(isW?WEAPONS:ARMORS).find(x=>x.t===t);
   if(it){const have=isW?S.gear.weapons:S.gear.armors;
    if(!have.includes(it.id)){have.push(it.id);log.push(`<span class="y">✨ Нашёл: ${it.n}! (смотри на складе)</span>`)}else{S.res.scrap+=5;log.push('Дубликат снаряжения → +5 '+ic('scrap'))}}}
  const xp=b.d*5;S.xp+=xp;log.push('+'+xp+' XP');
  while(S.xp>=S.lvl*30){S.xp-=S.lvl*30;S.lvl++;S.sp++;S.hp=maxHp();log.push(`<span class="y">⬆️ Уровень ${S.lvl}! +1 очко навыка</span>`)}
 }
 save();return log}

