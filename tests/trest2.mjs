import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}
 window.Capacitor={isNativePlatform:()=>true,Plugins:{LocalNotifications:{checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),schedule:async x=>{(window.__s=window.__s||[]).push(x.notifications.map(n=>n.id+':'+Math.round((new Date(n.schedule.at)-Date.now())/1000)))},cancel:async()=>{},addListener:()=>{}},Haptics:{vibrate:()=>{(window.__v=(window.__v||0)+1)},impact:x=>{(window.__imp=window.__imp||[]).push(x.style)}},StatusBar:{setStyle(){},setOverlaysWebView(){}}}};
 let hidden=false;Object.defineProperty(document,'hidden',{get:()=>hidden});Object.defineProperty(document,'visibilityState',{get:()=>hidden?'hidden':'visible'});window.__hide=v=>{hidden=v;document.dispatchEvent(new Event('visibilitychange'))}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.clock.install();await p.goto('http://localhost:8767/');await p.clock.runFor(1000);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.click('[data-tab=train]');await p.click('[data-act=progOpenTrain]');await p.click('[data-act=libAdd][data-k=ul-build-tone]');await p.clock.runFor(200);
await p.click('[data-act=assignNew]');await p.selectOption('[data-act=asF][data-k=clientUid]','me');await p.click('[data-act=asMode][data-v="1"]');await p.click('[data-act=assignGo]');await p.clock.runFor(300);
await p.locator('[data-act=planStart]').first().click();await p.clock.runFor(300);
if(await p.locator('[data-act=wpFull]').count())await p.click('[data-act=wpFull]');
// skip warm-up to first exercise
const nextBtn=async()=>{const b=p.locator('.wp-foot [data-act=wpGo]').last();await b.click();await p.clock.runFor(200)};
await nextBtn();
const name=async()=>(await p.locator('.wp-ex').first().innerText().catch(()=>'?'));
console.log('exercise:',await name());
const done=p.locator('.wp-foot [data-act=wpDone], .wp-foot [data-act=wpSetDone], [data-act=wpDone]').first();
await done.click();await p.clock.runFor(300);console.log('rest shown:',await p.locator('#wpRest').innerText().catch(()=>'none'),'| haptic taps:',JSON.stringify(await p.evaluate(()=>window.__imp)));
await p.evaluate(()=>window.__hide(true));await p.clock.runFor(300);console.log('bg notifications:',JSON.stringify(await p.evaluate(()=>window.__s&&window.__s.slice(-1))));
await p.evaluate(()=>window.__hide(false));await p.clock.runFor(95000);console.log('after rest: vibrate calls',await p.evaluate(()=>window.__v),'| rest screen gone:',!(await p.locator('#wpRest').count()));
console.log(errs);await b.close();
