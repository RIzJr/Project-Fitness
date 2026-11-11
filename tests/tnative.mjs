import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}
  window.__s=[];window.__c=[];window.__h=[];window.__st=[];let hidden=false;Object.defineProperty(document,'hidden',{get:()=>hidden});Object.defineProperty(document,'visibilityState',{get:()=>hidden?'hidden':'visible'});window.__hide=v=>{hidden=v;document.dispatchEvent(new Event('visibilitychange'))};
  window.Capacitor={isNativePlatform:()=>true,Plugins:{LocalNotifications:{checkPermissions:async()=>({display:'prompt'}),requestPermissions:async()=>({display:'granted'}),schedule:async x=>{window.__s.push(x.notifications)},cancel:async x=>{window.__c.push(x.notifications.map(n=>n.id))},addListener:()=>{}},
    Haptics:{vibrate:x=>window.__h.push(x)},StatusBar:{setStyle:x=>window.__st.push(x.style),setOverlaysWebView:()=>{}}}}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
console.log('native class:',await p.evaluate(()=>document.documentElement.classList.contains('native')),'| SW registered:',await p.evaluate(async()=>!!(navigator.serviceWorker&&await navigator.serviceWorker.getRegistration())),'| statusbar:',await p.evaluate(()=>window.__st.join(',')));
// reminders page
await p.click('[data-tab=you]');await p.click('[data-act=openSettings], [data-tab=settings]').catch(()=>{});
await p.click('[data-act=setPage][data-v=reminders]').catch(e=>console.log('no reminders page btn'));await p.waitForTimeout(200);
console.log('notif panel:',(await p.locator('section.panel:has(h2:text("Phone notifications"))').innerText().catch(()=>'-')).replace(/\n/g,' | '));
await p.click('[data-act=pushOn]');await p.waitForTimeout(300);console.log('toast:',await p.innerText('#toast'));
await p.check('[data-act=remOn][data-k=food]');await p.check('[data-act=remOn][data-k=ready]');await p.waitForTimeout(500);
const last=await p.evaluate(()=>window.__s[window.__s.length-1]||[]);console.log('scheduled:',last.length,last.slice(0,3).map(n=>n.id+' '+n.title+' '+n.schedule.at).join(' || '));
console.log('panel now:',(await p.locator('section.panel:has(h2:text("Phone notifications"))').innerText()).replace(/\n/g,' | ').slice(0,120));
// rest in background
await p.evaluate(()=>{window.__s=[]});
await p.click('[data-tab=train]');await p.waitForTimeout(200);
await p.click('[data-tab=you]');await p.click('[data-act=openSettings], [data-tab=settings]').catch(()=>{});await p.click('[data-act=setPage][data-v=rest]');await p.waitForTimeout(200);
console.log('rest panel:',(await p.locator('section.panel:has(h2:text("When rest ends"))').innerText()).replace(/\n/g,' | '));
await p.click('[data-act=restTest]');await p.waitForTimeout(200);await p.evaluate(()=>window.__hide(true));await p.waitForTimeout(300);
console.log('bg schedule:',JSON.stringify(await p.evaluate(()=>window.__s.map(a=>a.map(n=>n.id+':'+n.title)))));
await p.evaluate(()=>{window.__c=[];window.__hide(false)});await p.waitForTimeout(300);console.log('cancel on return:',JSON.stringify(await p.evaluate(()=>window.__c)));
await p.waitForTimeout(3500);console.log('haptics:',JSON.stringify(await p.evaluate(()=>window.__h)));
console.log('errors',errs);await b.close();
