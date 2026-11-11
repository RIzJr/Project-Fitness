import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}
  const calls=window.__hk=[];const d0=new Date();const mid=new Date(d0.getFullYear(),d0.getMonth(),d0.getDate());const y=new Date(mid-864e5);
  const noop=new Proxy({},{get:(t,k)=>k==='then'?undefined:async()=>({display:'granted',value:{}})});
  const Health={isAvailable:async()=>({available:true,platform:'ios'}),requestAuthorization:async o=>{calls.push(['auth',o]);return {readAuthorized:o.read,writeAuthorized:o.write,readDenied:[],writeDenied:[]}},
    queryAggregated:async o=>{calls.push(['agg',o.dataType]);if(o.dataType==='steps')return {samples:[{value:9123,startDate:mid.toISOString(),endDate:d0.toISOString()}]};
      const days=[...Array(15)].map((_,i)=>new Date(mid.getFullYear(),mid.getMonth(),mid.getDate()-14+i));const val={restingHeartRate:i=>i===14?57:60+(i%3),heartRate:i=>i===14?49:52,heartRateVariability:i=>i===14?52:42+(i%4)}[o.dataType];
      return {samples:val?days.map((d,i)=>({value:val(i),startDate:d.toISOString(),endDate:new Date(+d+864e5).toISOString()})):[]}},
    readSamples:async o=>{calls.push(['read',o.dataType]);if(o.dataType==='heartRate'){const a=+new Date(o.startDate),b=+new Date(o.endDate);return {samples:[...Array(12)].map((_,i)=>({value:100+i*5,startDate:new Date(a+(b-a)*i/12).toISOString()}))}}
      if(o.dataType==='sleep'&&o.limit>1000){const out=[];for(let i=1;i<=14;i++){const m=new Date(mid.getFullYear(),mid.getMonth(),mid.getDate()-14+i);out.push({sleepState:'deep',startDate:new Date(+m-3600e3).toISOString(),endDate:new Date(+m+3*3600e3).toISOString()},{sleepState:'rem',startDate:new Date(+m+3*3600e3).toISOString(),endDate:new Date(+m+(i===14?5.5:6.5)*3600e3).toISOString()})}return {samples:out}}
      if(o.dataType==='sleep')return {samples:[{sleepState:'inBed',startDate:new Date(mid-3*3600e3).toISOString(),endDate:new Date(+mid+5*3600e3).toISOString()},{sleepState:'deep',startDate:new Date(mid-2*3600e3).toISOString(),endDate:new Date(+mid+1.5*3600e3).toISOString()},{sleepState:'rem',startDate:new Date(+mid+1.5*3600e3).toISOString(),endDate:new Date(+mid+5.5*3600e3).toISOString()},{sleepState:'awake',startDate:new Date(+mid+5.5*3600e3).toISOString(),endDate:new Date(+mid+5.7*3600e3).toISOString()}]};
      if(o.dataType==='weight')return {samples:[{value:80.44,sourceId:'com.withings.wiScaleNG',startDate:new Date(+y+8*3600e3).toISOString()},{value:81,sourceId:'com.rizjr.projectfitness',startDate:new Date(+mid-10*864e5).toISOString()}]};return {samples:[]}},
    saveSample:async o=>{calls.push(['saveSample',o])}};
  const PFWorkout={requestAuthorization:async()=>{calls.push(['wauth']);return {granted:true,workouts:true}},saveWorkout:async o=>{calls.push(['saveWorkout',o]);return {id:'HK-UUID-1'}}};
  const impl={Health,PFWorkout,Haptics:{impact:async o=>{calls.push(['haptic',o.style])},vibrate:async()=>{}},LocalNotifications:{checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),schedule:async o=>{calls.push(['notify',o.notifications.length])},cancel:async()=>{},getPending:async()=>({notifications:[]})},StatusBar:{setStyle:async()=>{},setOverlaysWebView:async()=>{}},App:{}};
  window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'ios',Plugins:{},PluginHeaders:Object.keys(impl).map(name=>({name,methods:[]})),
    nativePromise:(n,m,o)=>{const P=impl[n];if(!P||!P[m])return Promise.reject(new Error(n+'.'+m+' is not implemented on ios'));return Promise.resolve().then(()=>P[m](o))},
    addListener:(n,ev,cb)=>{calls.push(['listen',n+':'+ev]);return 'cb1'},removeListener:()=>{}};
});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(900);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.waitForTimeout(300);
const docs=()=>p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.parse(localStorage.getItem(k))});
await p.click('[data-tab=you]');await p.click('[data-act=openSettings]');await p.waitForTimeout(150);
console.log('SETTINGS has Apple Health:',await p.locator('[data-act=setPage][data-v=health]').count());
await p.click('[data-act=setPage][data-v=health]');console.log('PAGE:',(await p.locator('section.panel').first().innerText()).replace(/\n/g,' | ').slice(0,200));
await p.click('[data-act=hkConnect]');await p.waitForTimeout(1200);
console.log('CALLS:',JSON.stringify(await p.evaluate(()=>window.__hk.map(c=>c[0]+(c[1]&&c[1].read?':'+c[1].read.join(','):typeof c[1]==='string'?':'+c[1]:'')))));
console.log('PAGE ON:',(await p.locator('section.panel').first().innerText()).replace(/\n/g,' | ').slice(-260));
await p.screenshot({path:'tests/shots/health-settings.png'});
const d=await docs();const t=Object.keys(d).filter(k=>k.startsWith('day_')).map(k=>[k,d[k].habits]);console.log('DAY HABITS:',JSON.stringify(t));
console.log('BODY:',JSON.stringify(Object.entries(d).filter(([k])=>k.startsWith('body_')).map(([k,v])=>[k,v.weight,v.hkFrom])));
console.log('HKDAYS today:',JSON.stringify(Object.entries((await docs()).hkdays.days).slice(-1)));
await p.click('[data-tab=recover]');await p.waitForTimeout(200);console.log('RECOVERY:',(await p.locator('section.panel:has(h2:text("Recovery"))').innerText().catch(()=>'-')).replace(/\n/g,' | '));await p.screenshot({path:'tests/shots/recovery.png'});
await p.click('[data-tab=today]');await p.waitForTimeout(200);console.log('TODAY ROW:',(await p.locator('.duerow:has-text("Recovery")').innerText().catch(()=>'-')).replace(/\n/g,' | '));
// readiness prefill
await p.click('[data-tab=recover]');await p.waitForTimeout(200);console.log('SLEEP INPUT:',await p.inputValue('#rd_sleepH'),'| label:',await p.locator('label.field:has(#rd_sleepH) .label').innerText());
// workout to Health
await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.waitForTimeout(200);await p.click('.player [data-act=wpGo]');await p.waitForTimeout(150);
if(await p.locator('#wpPickQ').count()){await p.fill('#wpPickQ','Barbell bench press');await p.press('#wpPickQ','Enter');await p.waitForTimeout(150)}
const k=p.locator('.player .wp-num[data-f=kg]');await k.click();await p.keyboard.type('60');await p.keyboard.press('Enter');const r=p.locator('.player .wp-num[data-f=reps]');await r.click();await p.keyboard.type('8');await p.keyboard.press('Enter');
await p.click('.player [data-act=wpDone]');await p.waitForTimeout(150);await p.click('.player [data-act=wpEnd]');await p.click('.player .wp-big').catch(()=>{});await p.waitForTimeout(100);await p.click('.player [data-act=saveWo]');await p.waitForTimeout(800);
const sw=await p.evaluate(()=>window.__hk.filter(c=>c[0]==='saveWorkout').map(c=>c[1]));console.log('SAVE WORKOUT:',JSON.stringify(sw));
await p.evaluate(()=>{});const wid=Object.keys(await docs()).find(k=>k.startsWith('wo_'));await p.click('[data-tab=you]');await p.click('[data-act=openSettings]');await p.click('[data-act=setPage][data-v=health]');await p.click('[data-act=hkPull]');await p.waitForTimeout(1200);console.log('WORKOUT HR:',JSON.stringify((await docs())[wid].hr));await p.click('[data-tab=train]');await p.waitForTimeout(150);await p.click('[data-act=woSum]');await p.waitForTimeout(200);console.log('SUMMARY TILES:',(await p.locator('.tiles').first().innerText()).replace(/\n/g,' | '));await p.click('[data-act=sumClose]');
const d2=await docs();console.log('WORKOUT hk id:',Object.values(d2).filter(x=>x.type==='workout').map(w=>w.hk));
// weigh-in to Health
await p.click('[data-tab=you]');await p.click('[data-act=youView][data-v=body]');await p.waitForTimeout(200);
const wIn=p.locator('#b_weight, input[id*=weight]').first();if(await wIn.count()){await wIn.fill('79.6');await p.locator('form:has(input[id*=weight]) [type=submit], [data-act=bodySave]').first().click().catch(()=>{});await p.waitForTimeout(500)}
console.log('SAVE SAMPLE:',JSON.stringify(await p.evaluate(()=>window.__hk.filter(c=>c[0]==='saveSample').map(c=>[c[1].dataType,c[1].value]))));
await p.click('[data-tab=you]');await p.click('[data-act=openSettings]');await p.click('[data-act=setPage][data-v=watch]');await p.waitForTimeout(150);
for(const dv of ['garmin','whoop','polar']){await p.click(`[data-act=watchDev][data-v=${dv}]`);await p.waitForTimeout(80);console.log('GUIDE',dv,':',(await p.locator('section.panel').nth(1).innerText()).replace(/\n/g,' | ').slice(0,260))}
await p.click('[data-act=watchDev][data-v=garmin]');await p.screenshot({path:'tests/shots/watch-guide.png',fullPage:true});
console.log('HAPTICS:',await p.evaluate(()=>window.__hk.filter(c=>c[0]==='haptic').length),'| LISTEN:',JSON.stringify(await p.evaluate(()=>window.__hk.filter(c=>c[0]==='listen').map(c=>c[1]))));console.log('errors',errs);await b.close();
