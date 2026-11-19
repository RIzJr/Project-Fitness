// Cardio: start a session in focus mode, live heart rate from a (fake) Bluetooth strap, pause/minimise/reopen, end, summary, save with avg/max and zones.
import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(1200);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
const ok=[];const chk=(c,m)=>{ok.push(c);console.log((c?'ok   ':'FAIL ')+m)};
await p.click('[data-tab=train]');await p.click('[data-act=trainView][data-v=cardio]').catch(()=>p.click('text=Cardio'));await p.waitForTimeout(300);
chk(await p.locator('[data-act=cfStart]').count()===1,'start panel shown');
await p.click('.panel [data-act=cAct][data-v="Incline walk"]');await p.click('[data-act=cGoal][data-v="2"]');
if(await p.locator('#hrAgeIn').count()){await p.fill('#hrAgeIn','30');await p.click('[data-act=hrAgeSave]');await p.waitForTimeout(200)}
chk((await p.locator('.panel:has([data-act=cfStart])').innerText()).includes('bpm'),'zone 2 range shown after age');
await p.click('[data-act=cMins][data-v="20"]');await p.screenshot({path:'tests/shots/tcardio-start.png'});
await p.click('[data-act=cfStart]');await p.waitForTimeout(400);
chk(await p.locator('.cfocus').count()===1,'focus mode open');chk(await p.locator('.cfocus svg.nfig').count()===1,'incline walk demo shown');
await p.waitForTimeout(2200);const t1=await p.locator('#cfTime').innerText();chk(/^0:0[2-3]$/.test(t1),'timer counts ('+t1+')');
await p.screenshot({path:'tests/shots/tcardio-focus.png'});
await p.click('[data-act=cfPause]');await p.waitForTimeout(1500);const tp1=await p.locator('#cfTime').innerText();await p.waitForTimeout(1200);const tp2=await p.locator('#cfTime').innerText();chk(tp1===tp2,'pause holds the timer');
await p.click('[data-act=cfPause]');await p.click('[data-act=cfMin]');await p.waitForTimeout(300);
chk(await p.locator('.cfocus').count()===0&&await p.locator('#cfmini:not([hidden])').count()===1,'minimised: mini bar shown');
await p.click('[data-tab=today]');await p.waitForTimeout(200);chk(await p.locator('#cfmini:not([hidden])').count()===1,'mini bar on Today');
await p.reload();await p.waitForTimeout(1500);chk(await p.locator('#cfmini:not([hidden])').count()===1,'session survives a reload');
await p.click('#cfmini');await p.waitForTimeout(300);chk(await p.locator('.cfocus').count()===1,'reopened focus mode');
await p.click('[data-act=cfEnd]');await p.waitForTimeout(300);chk(await p.locator('[data-act=cfSave]').count()===1,'summary shown');
const y0=await p.locator('.cfsum').evaluate(e=>{e.scrollTop=200;return e.scrollTop});await p.click('[data-act=cfRpe][data-n="6"]');const y1=await p.locator('.cfsum').evaluate(e=>e.scrollTop);chk(y0===y1,'effort tap keeps the scroll');
await p.fill('#cf_km','1.2');await p.fill('#cf_hr','128');await p.screenshot({path:'tests/shots/tcardio-sum.png'});
await p.click('[data-act=cfSave]');await p.waitForTimeout(400);
const hist=await p.locator('.hist .item').first().innerText();console.log('history:',hist.replace(/\n/g,' | '));chk(/Incline walk/.test(hist)&&/avg 128/.test(hist)&&/1\.2 km/.test(hist),'saved to history with avg heart rate');
chk(await p.locator('#cfmini:not([hidden])').count()===0,'mini bar gone after save');
chk(!errs.length,'no page errors '+JSON.stringify(errs));
await b.close();process.exitCode=ok.every(Boolean)?0:1;
