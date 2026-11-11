import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}window.__auth=[];
  const Health={isAvailable:async()=>({available:true}),requestAuthorization:async o=>{window.__auth.push(o.read.length);if(o.read.length>6)throw new Error('Unknown type');return {}},queryAggregated:async()=>({samples:[]}),readSamples:async()=>({samples:[]})};
  const impl={Health,PFWorkout:{requestAuthorization:()=>new Promise(()=>{})},Haptics:{impact:async()=>{},vibrate:async()=>{}},LocalNotifications:{checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),schedule:async()=>{},cancel:async()=>{},getPending:async()=>({notifications:[]})},StatusBar:{setStyle:async()=>{},setOverlaysWebView:async()=>{}}};
  window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'ios',Plugins:{},nativePromise:(n,m,o)=>{const P=impl[n];if(!P||!P[m])return Promise.reject(new Error('ni'));return Promise.resolve().then(()=>P[m](o))},addListener:()=>'x',removeListener:()=>{}};});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(900);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
const T=async s=>(await p.locator(s).first().innerText().catch(()=>'-')).replace(/\n+/g,' | ');
await p.click('[data-tab=you]');await p.click('[data-act=openSettings]');await p.click('[data-act=setPage][data-v=health]');await p.click('[data-act=hkConnect]');
await p.waitForTimeout(1500);console.log('auth attempts (types asked):',JSON.stringify(await p.evaluate(()=>__auth)),'| connected panel shown:',await p.locator('.hkok').count(),'| button left:',await p.locator('[data-act=hkConnect]').count());
// another device's settings (newer, health off) arrives through sync
await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));d.settings={...d.settings,health:{on:false},_t:Date.now()+5000};localStorage.setItem(k,JSON.stringify(d))}});
await p.reload();await p.waitForTimeout(1200);await p.click('[data-tab=recover]');await p.waitForTimeout(300);
console.log('RECOVER after synced settings say off:',(await T('section.panel')).slice(0,200));
// turning it off still works
await p.click('[data-tab=you]');await p.click('[data-act=openSettings]');await p.click('[data-act=setPage][data-v=health]');await p.click('[data-act=hkOff]');await p.waitForTimeout(200);
console.log('after Turn off, connect button back:',await p.locator('[data-act=hkConnect]').count());
console.log('errors',errs);await b.close();
