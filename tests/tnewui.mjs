import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){};window.__vib=[];navigator.vibrate=(p)=>{window.__vib.push(p);return true}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz Mangilit');await p.click('[data-act=obSkip]')}
await p.click('[data-tab=train]');await p.click('[data-act=progOpenTrain]');await p.click('[data-act=libAdd][data-k=strength-size-10k]');await p.waitForTimeout(150);
await p.click('[data-act=assignNew]');await p.selectOption('[data-act=asF][data-k=clientUid]','me');await p.fill('[data-act=asF][data-k=start]','2026-10-26');await p.dispatchEvent('[data-act=asF][data-k=start]','change');await p.click('[data-act=assignGo]');await p.waitForTimeout(300);
await p.click('[data-tab=today]');await p.waitForTimeout(200);
console.log('header:',(await p.locator('.hero').innerText()).replace(/\n/g,' | '));
console.log('panel:',(await p.locator('.today-panel').innerText()).replace(/\n/g,' | '));
console.log('upnext:',(await p.locator('.upnext').innerText()).replace(/\n/g,' | '));
await p.locator('.hchip').first().click();await p.waitForTimeout(100);console.log('habit ticked:',await p.locator('.hchip[aria-pressed=true]').count());
await p.screenshot({path:'tests/shots/new-today.png'});await p.screenshot({path:'tests/shots/new-today-full.png',fullPage:true});
await p.click('.upnext');await p.waitForTimeout(400);console.log('upnext focuses search:',await p.evaluate(()=>document.activeElement&&document.activeElement.id));
// workout
await p.click('[data-tab=today]');await p.click('.startpill[data-act=planStart]');await p.waitForTimeout(200);
const P='.player ';if(await p.locator(P+'[data-act=wpGo]').count()&&await p.locator(P+'.wp-pair').count()===0)await p.click(P+'.wp-foot [data-act=wpGo] >> nth=-1');await p.waitForTimeout(200);
console.log('set screen:',(await p.locator(P+'.wp-pair').innerText()).replace(/\n/g,' | '),'|| done btn:',await p.locator(P+'[data-act=wpDone]').innerText());
await p.click(P+'.wp-adj [data-f=kg]:not([data-d^="-"])');await p.click(P+'.wp-adj [data-f=reps]:not([data-d^="-"])');console.log('after +:',await p.locator(P+'[data-act=wpDone]').innerText());
await p.screenshot({path:'tests/shots/new-set.png'});
await p.click(P+'[data-act=wpDone]');await p.waitForTimeout(300);
console.log('rest:',(await p.locator(P+'.wp-body').innerText()).replace(/\n/g,' | ').slice(0,260));
await p.click(P+'.wp-quad [data-f=kg]:not([data-d^="-"])');await p.waitForTimeout(100);console.log('next after +2.5:',await p.locator('#wpNextVal').innerText());
await p.screenshot({path:'tests/shots/new-rest.png'});
// shorten rest so it ends, check buzz
for(let i=0;i<12;i++)await p.click(P+'[data-act=restAdj][data-d="-15"]');await p.waitForTimeout(1200);
console.log('rest over shown:',await p.locator('#wpRest').innerText().catch(()=>'gone'),'| vibrations:',JSON.stringify(await p.evaluate(()=>window.__vib)));
await p.waitForTimeout(3000);console.log('back to set screen:',await p.locator(P+'.wp-pair').count());
// list view
await p.click(P+'[data-act=wpView][data-v=list]');await p.waitForTimeout(200);
console.log('list:',(await p.locator(P+'.wp-body').innerText()).replace(/\n/g,' | ').slice(0,300));
await p.screenshot({path:'tests/shots/new-list.png'});
const kg=p.locator(P+'.wl-open input[data-f=kg]').nth(1);await kg.fill('100');await kg.press('Tab');
await p.click(P+'.wl-open [data-act=wlDone][data-si="1"]');await p.waitForTimeout(200);console.log('rest bar in list:',(await p.locator(P+'.wl-rest').innerText().catch(()=>'-')).replace(/\n/g,' | '));
const sets=await p.evaluate(()=>JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.startsWith('pf-draft')))||'null'));
console.log('draft set 2:',JSON.stringify(sets&&sets.exercises[0].sets[1]));
await p.click(P+'[data-act=restSkip]').catch(()=>{});await p.waitForTimeout(1000);await p.evaluate(()=>document.querySelector('.player [data-act=restSkip]')?.click());
await p.click(P+'[data-act=wlOpen] >> nth=0');await p.waitForTimeout(100);console.log('opened another:',await p.locator(P+'.wl-open b').first().innerText());
await p.click(P+'[data-act=wpView][data-v=focus]');await p.waitForTimeout(200);console.log('focus again title:',await p.locator(P+'h1').first().innerText());
// finish & save
await p.click(P+'[data-act=wpView][data-v=list]');await p.click(P+'.wp-foot [data-act=wpGo]');await p.waitForTimeout(200);console.log('finish screen:',(await p.locator(P+'.wp-body').innerText()).replace(/\n/g,' | ').slice(0,200));await p.click(P+'[data-act=saveWo]');await p.waitForTimeout(300);
console.log('saved workouts:',await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.stringify(Object.values(JSON.parse(localStorage.getItem(k))).filter(d=>d.type==='workout').map(w=>w.exercises.map(e=>[e.name,e.sets.length,e.sets.map(x=>x.kg+'x'+x.reps)])))}));
console.log('errors',errs);await b.close();
