import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}
  window.__hrAge=5*3600000;const M=new Date();M.setHours(0,0,0,0);const iso=t=>new Date(t).toISOString(),wait=ms=>new Promise(r=>setTimeout(r,ms));
  const Health={isAvailable:async()=>({available:true}),requestAuthorization:async()=>{await wait(400);return {}},
    queryAggregated:async o=>{await wait(150);if(o.dataType==='steps')return {samples:[0,1,2].map(i=>({startDate:iso(M-i*864e5),value:7000+i}))};if(o.dataType==='heartRate')return {samples:[0,1,2].map(i=>({startDate:iso(M-i*864e5),value:52}))};return {samples:[]}},
    readSamples:async o=>{await wait(150);if(o.dataType==='heartRate'&&o.limit===1){const t=Date.now()-window.__hrAge;return {samples:t>=Date.parse(o.startDate)?[{value:window.__hrBpm||131,startDate:iso(t),endDate:iso(t),sourceName:'Connect'}]:[]}}if(o.dataType==='sleep'){const L=[];for(let i=0;i<3;i++){const e=M-i*864e5+7*3600000;L.push({sleepState:'asleep',startDate:iso(e-7.5*3600000),endDate:iso(e),sourceId:'garmin'})}return {samples:L}}return {samples:[]}}};
  const impl={Health,PFWorkout:{requestAuthorization:async()=>({granted:true})},Haptics:{impact:async()=>{},vibrate:async()=>{}},LocalNotifications:{checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),schedule:async()=>{},cancel:async()=>{},getPending:async()=>({notifications:[]})},StatusBar:{setStyle:async()=>{},setOverlaysWebView:async()=>{}}};
  window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'ios',Plugins:{},nativePromise:(n,m,o)=>{const P=impl[n];if(!P||!P[m])return Promise.reject(new Error('ni'));return Promise.resolve().then(()=>P[m](o))},addListener:()=>'x',removeListener:()=>{}};});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(900);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
const T=async s=>(await p.locator(s).first().innerText().catch(()=>'-')).replace(/\n+/g,' | ');
await p.click('[data-tab=you]');await p.click('[data-act=openSettings]');await p.waitForTimeout(150);
console.log('LIST BEFORE:',(await T('[data-act=setPage][data-v=health]')));
await p.click('[data-act=setPage][data-v=health]');await p.waitForTimeout(150);
await p.click('[data-act=hkConnect]');await p.waitForTimeout(100);console.log('DURING CONNECT button:',await T('[data-act=hkConnect]'));
await p.waitForTimeout(500);console.log('SYNCING:',(await T('.hkok')),'| connect button left?',await p.locator('[data-act=hkConnect]').count());
await p.screenshot({path:'tests/shots/hk-syncing.png'});
await p.waitForTimeout(4000);console.log('AFTER SYNC:',(await T('section.panel:has(.hkok)')).slice(0,700));
await p.screenshot({path:'tests/shots/hk-connected.png',fullPage:true});
await p.click('[data-act=setBack]').catch(()=>{});await p.goto('http://localhost:8767/');await p.waitForTimeout(1500);
await p.click('[data-tab=you]');await p.click('[data-act=openSettings]');await p.waitForTimeout(150);
console.log('LIST AFTER:',await T('[data-act=setPage][data-v=health]'),'||',await T('[data-act=setPage][data-v=watch]'));
await p.click('[data-act=setPage][data-v=watch]');await p.waitForTimeout(200);console.log('GUIDE STEP:',(await T('.hkok')),'| connect btn',await p.locator('[data-act=hkConnect]').count());
await p.click('[data-tab=recover]');await p.waitForTimeout(300);console.log('RECOVER HEAD:',(await T('section.panel')).slice(0,250));
console.log('RECOVER TAG:',await T('.hkftag'));
await p.click('[data-act=openSettings]').catch(()=>{});await p.click('[data-tab=you]');await p.click('[data-act=openSettings]');await p.click('[data-act=setPage][data-v=health]');await p.waitForTimeout(300);
console.log('STALE:',await T('.hkfresh'));
await p.evaluate(()=>{window.__hrAge=2*60000});await p.click('[data-act=hkCheck]');await p.waitForTimeout(1500);console.log('AFTER CHECK:',await T('.hkfresh'),'| toast',await p.innerText('#toast'));
await p.screenshot({path:'tests/shots/hk-live.png'});
// workout: heart rate from the watch via Apple Health
await p.evaluate(()=>{window.__hrAge=20000;window.__hrBpm=142});
await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.waitForTimeout(300);await p.click('.player [data-act=wpGo]');await p.waitForTimeout(6500);
console.log('WORKOUT CHIP:',await T('.player .wp-hr'),'| dot colour',await p.evaluate(()=>document.querySelector('.player .wp-hr .hrdot').style.color));
await p.click('.player [data-act=hrOpen]');await p.waitForTimeout(300);console.log('HR SHEET:',(await T('.hrsheet')).slice(0,500));
await p.screenshot({path:'tests/shots/hk-workout.png'});
await p.click('[data-act=hrClose]');await p.evaluate(()=>{window.__hrAge=10*60000});await p.waitForTimeout(16500);console.log('STALE CHIP:',await T('.player .wp-hr'));
console.log('errors',errs);await b.close();
