// Android app (Capacitor, fake Health Connect): Android wording, Health Connect types, watch guide, back button, keep-awake.
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
  const PFAndroid={keepAwake:async o=>{calls.push(['keepAwake',o.on])}};const PFWorkoutUnused={requestAuthorization:async()=>{calls.push(['wauth']);return {granted:true,workouts:true}},saveWorkout:async o=>{calls.push(['saveWorkout',o]);return {id:'HK-UUID-1'}}};
  const impl={Health,PFAndroid,Haptics:{impact:async o=>{calls.push(['haptic',o.style])},vibrate:async()=>{}},LocalNotifications:{createChannel:async o=>{calls.push(['channel',o.id+':'+(o.sound||'')])},checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),schedule:async o=>{calls.push(['notify',o.notifications.map(n=>n.channelId).join(',')])},cancel:async()=>{},getPending:async()=>({notifications:[]})},StatusBar:{setStyle:async()=>{},setOverlaysWebView:async()=>{}},App:{minimizeApp:async()=>{calls.push(['minimize'])}}};
  window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'android',Plugins:{},PluginHeaders:Object.keys(impl).map(name=>({name,methods:[]})),
    nativePromise:(n,m,o)=>{const P=impl[n];if(!P||!P[m])return Promise.reject(new Error(n+'.'+m+' is not implemented on android'));return Promise.resolve().then(()=>P[m](o))},
    addListener:(n,ev,cb)=>{calls.push(['listen',n+':'+ev]);(window.__L=window.__L||{})[n+':'+ev]=cb;return 'cb1'},removeListener:()=>{}};
});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(900);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.waitForTimeout(300);
const ok=[];const chk=(c,m)=>{ok.push(!!c);console.log((c?'ok   ':'FAIL ')+m)};
const calls=()=>p.evaluate(()=>window.__hk.map(c=>c[0]+(c[1]&&c[1].read?':'+c[1].read.join(','):c[1]!=null&&typeof c[1]!=='object'?':'+c[1]:'')));
const back=()=>p.evaluate(()=>window.__L['App:backButton']({canGoBack:false}));
const iosWords=async()=>p.evaluate(()=>{const t=document.body.innerText;return (t.match(/Apple Health|iPhone|App Store|TestFlight|the Health app/g)||[])});
await p.click('[data-tab=you]');await p.click('[data-act=openSettings]');await p.waitForTimeout(200);
chk((await iosWords()).length===0,'settings list has no iPhone wording '+JSON.stringify(await iosWords()));
await p.click('[data-act=setPage][data-v=health]');await p.waitForTimeout(150);
const pg=await p.locator('body').innerText();
chk(/Connect Health Connect|Health Connect/.test(pg)&&!/Apple Health/.test(pg),'health page talks about Health Connect');
chk(!/Save your workouts/.test(pg),'no "save your workouts" promise on Android');
await p.click('[data-act=hkConnect]');await p.waitForTimeout(1200);
const c1=await calls();console.log('CALLS',JSON.stringify(c1.filter(x=>/auth|listen|channel/.test(x))));
const auth=c1.find(x=>x.startsWith('auth:'));chk(auth&&!/appleSleepingWristTemperature/.test(auth)&&/heartRateVariability/.test(auth),'Health Connect asked for the right types');
chk(!c1.includes('wauth'),'no Apple workout permission asked');
chk(await p.locator('[data-act=hcSettings]').count()===1,'Health Connect settings button');
chk((await iosWords()).length===0,'connected page has no iPhone wording '+JSON.stringify(await iosWords()));
await p.screenshot({path:'tests/shots/android-health.png'});
await p.click('[data-act=setPage][data-v=watch]').catch(()=>{});await p.waitForTimeout(150);
chk(await p.locator('[data-act=watchDev][data-v=samsung]').count()===1&&await p.locator('[data-act=watchDev][data-v=apple]').count()===0,'watch guide lists Android watches');
await p.click('[data-act=watchDev][data-v=garmin]');await p.waitForTimeout(100);chk(/Android 14/.test(await p.locator('body').innerText()),'Garmin steps are the Health Connect ones');
await p.screenshot({path:'tests/shots/android-watch.png'});
// back button closes the open sheet, then goes to Today, then minimises
await back();await p.waitForTimeout(150);chk(await p.locator('[data-act=setPage][data-v=health]').count()===1,'back from a settings page goes to the settings list');
await back();await p.waitForTimeout(150);chk(await p.locator('[data-act=openSettings]').count()===1,'back from settings goes to You');
await back();await p.waitForTimeout(150);chk(await p.locator('[data-tab=today][aria-current=page], [data-tab=today].on, [data-tab=today][aria-selected=true]').count()>=1||(await p.evaluate(()=>document.querySelector('[data-tab=today]').getAttribute('aria-current')))!==null,'back from You goes to Today');
await back();await p.waitForTimeout(150);chk((await calls()).includes('minimize'),'back on Today leaves the app running (minimise)');
// cardio focus keeps the screen on through the native helper
await p.click('[data-tab=train]');await p.click('[data-act=trainView][data-v=cardio]');await p.waitForTimeout(150);await p.click('[data-act=cfStart]');await p.waitForTimeout(300);
chk((await calls()).includes('keepAwake:true'),'screen kept on in focus mode');
await back();await p.waitForTimeout(200);chk(await p.locator('.cfocus').count()===0&&await p.locator('#cfmini:not([hidden])').count()===1,'back minimises focus mode, session keeps going');
chk((await iosWords()).length===0,'cardio has no iPhone wording '+JSON.stringify(await iosWords()));
chk(!errs.length,'no page errors '+JSON.stringify(errs));
await b.close();process.exitCode=ok.every(Boolean)?0:1;
