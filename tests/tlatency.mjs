import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}
  window.__ev=[];const impl={Haptics:{impact:async o=>{__ev.push(['impact',Date.now(),o.style])},vibrate:async o=>{__ev.push(['vibrate',Date.now()])}},LocalNotifications:{checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),schedule:async()=>{},cancel:async()=>{},getPending:async()=>({notifications:[]})},StatusBar:{setStyle:async()=>{},setOverlaysWebView:async()=>{}}};
  window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'ios',Plugins:{},nativePromise:(n,m,o)=>{const P=impl[n];if(!P||!P[m])return Promise.reject(new Error('ni'));return Promise.resolve().then(()=>P[m](o))},addListener:()=>'x',removeListener:()=>{}};
  const os=OscillatorNode.prototype.start;OscillatorNode.prototype.start=function(when){const c=this.context;__ev.push(['osc',Date.now()+((when||c.currentTime)-c.currentTime)*1000]);return os.apply(this,arguments)};
});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(900);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));d.settings={...(d.settings||{type:'settings'}),rest:{secs:5,sound:true,tone:'bell',vibrate:true,notify:true}};localStorage.setItem(k,JSON.stringify(d))}});
await p.reload();await p.waitForTimeout(800);
const run=async(label,adj)=>{await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.waitForTimeout(200);await p.click('.player [data-act=wpGo]');await p.waitForTimeout(150);
  await p.fill('#wpPickQ','Leg press');await p.press('#wpPickQ','Enter');await p.waitForTimeout(150);
  const k=p.locator('.player .wp-num[data-f=kg]');await k.click();await p.keyboard.type('100');await p.keyboard.press('Enter');const r=p.locator('.player .wp-num[data-f=reps]');await r.click();await p.keyboard.type('10');await p.keyboard.press('Enter');
  await p.locator('.player .wp-chip.add').first().click().catch(()=>{});
  await p.evaluate(()=>{__ev.length=0});await p.click('.player [data-act=wpDone]');const t0=await p.evaluate(()=>Date.now());
  if(adj){await p.waitForTimeout(1200);await p.evaluate(()=>{const e=document.querySelector('.player [data-act=restAdj][data-d="15"]');e&&e.click()});await p.evaluate(()=>{const e=document.querySelector('.player [data-act=restAdj][data-d="-15"]');e&&e.click()})}
  await p.waitForTimeout(7000);const ev=await p.evaluate(()=>__ev);const restEnd=t0+5000;
  const osc=ev.filter(e=>e[0]==='osc').map(e=>e[1]),first=Math.min(...osc),imp=ev.find(e=>e[0]==='impact'&&e[2]==='HEAVY'),vib=ev.find(e=>e[0]==='vibrate');
  console.log(label,'| bell starts',Math.round(first-restEnd),'ms vs rest end | tap',imp?Math.round(imp[1]-restEnd):'none','ms | buzz',vib?Math.round(vib[1]-restEnd):'none','ms | bell strikes booked',osc.filter(x=>Math.abs(x-first)<5).length,'oscillators per strike-ish');
  await p.click('.player [data-act=wpEnd]');await p.waitForTimeout(150);await p.click('.player [data-act=wpDiscard]').catch(()=>{});await p.click('.player [data-act=wpDiscard]').catch(()=>{});await p.waitForTimeout(300)};
await run('PLAIN 5s');await run('ADJUSTED +15/-15');
console.log('errors',errs);await b.close();
