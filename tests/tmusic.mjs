// Rest ends: the iPhone app pauses other apps' music (PFAudio.music "pause") just before the bell. Fake iPhone.
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
  const PFAudio={music:async o=>{calls.push(['music',o.mode+'@'+Date.now()])}};const impl={Health,PFWorkout,PFAudio,Haptics:{impact:async o=>{calls.push(['haptic',o.style])},vibrate:async()=>{}},LocalNotifications:{checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),schedule:async o=>{calls.push(['notify',o.notifications.length])},cancel:async()=>{},getPending:async()=>({notifications:[]})},StatusBar:{setStyle:async()=>{},setOverlaysWebView:async()=>{}},App:{}};
  window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'ios',Plugins:{},PluginHeaders:Object.keys(impl).map(name=>({name,methods:[]})),
    nativePromise:(n,m,o)=>{const P=impl[n];if(!P||!P[m])return Promise.reject(new Error(n+'.'+m+' is not implemented on ios'));return Promise.resolve().then(()=>P[m](o))},
    addListener:(n,ev,cb)=>{calls.push(['listen',n+':'+ev]);return 'cb1'},removeListener:()=>{}};
});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(900);
if(await p.locator('[data-act=gateLocal]').count()){await p.click('[data-act=gateLocal]');await p.waitForTimeout(300)}
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.waitForTimeout(300);const ok=[];const chk=(c,m)=>{ok.push(!!c);console.log((c?'ok   ':'FAIL ')+m)};
const music=()=>p.evaluate(()=>window.__hk.filter(c=>c[0]==='music').map(c=>c[1]));
await p.click('[data-tab=you]');await p.click('[data-act=openSettings]');await p.click('[data-act=setPage][data-v=rest]');await p.waitForTimeout(200);
chk(await p.locator('[data-act=restMusic][data-v=pause][aria-pressed=true]').count()===1,'"Pause it" is the default');
await p.screenshot({path:'tests/shots/music-setting.png'});
await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.waitForTimeout(200);await p.click('.player [data-act=wpGo]');await p.waitForTimeout(150);
if(await p.locator('#wpPickQ').count()){await p.fill('#wpPickQ','Barbell bench press');await p.press('#wpPickQ','Enter');await p.waitForTimeout(150)}
const k=p.locator('.player .wp-num[data-f=kg]');await k.click();await p.keyboard.type('60');await p.keyboard.press('Enter');const r=p.locator('.player .wp-num[data-f=reps]');await r.click();await p.keyboard.type('8');await p.keyboard.press('Enter');
{const a=p.locator('.player [data-act=wpAddSet]');if(await a.count()){await a.first().click();await p.waitForTimeout(120)}}
await p.click('.player [data-act=wpDone]');await p.waitForTimeout(200);
const left=async()=>{const t=await p.locator('#wpRest').innerText().catch(()=>'0:00');const [m,x]=t.split(':').map(Number);return m*60+x};
for(let i=0;i<20&&await left()>25;i++){await p.locator('[data-act=restAdj][data-d="-15"]').first().click();await p.waitForTimeout(60)}
const L=await left(),t0=Date.now();console.log('rest left',L,'s');
await p.waitForTimeout(L*1000+1500);const m=await music();console.log('music calls',JSON.stringify(m));console.log('all',JSON.stringify(await p.evaluate(()=>window.__hk.map(c=>c[0]).slice(-30))));console.log('rest text',await p.locator('.player').innerText().then(t=>t.slice(0,160).replace(/\n/g,' ')));
chk(m.some(x=>x.startsWith('pause@')),'music paused as rest ends');
const at=m.length?+m[0].split('@')[1]-t0:0;console.log('paused at +'+at+' ms (rest of 15 s)');chk(at>(L-2.6)*1000&&at<(L-0.5)*1000,'about 1.5 s before the bell');
chk(!errs.length,'no page errors '+JSON.stringify(errs));await b.close();process.exitCode=ok.every(Boolean)?0:1;
