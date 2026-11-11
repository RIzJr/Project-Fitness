import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const mock=fs.readFileSync('tests/mocksb.js','utf8');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/supabase-js@2.116.0/**',r=>r.fulfill({body:mock,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'}}));
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(700);
await p.click('[data-act=gateMode][data-v=up]');await p.fill('#au_email','riz@x.com');await p.click('.gate-next');await p.fill('#au_pw','password1');await p.check('#au_consent');await p.click('.gate-next');await p.waitForTimeout(1800);
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForTimeout(800);
console.log('SW controlling:',await p.evaluate(()=>!!navigator.serviceWorker.controller));
if(!(await p.evaluate(()=>!!navigator.serviceWorker.controller))){await p.reload();await p.waitForTimeout(1200);console.log('SW controlling after reload:',await p.evaluate(()=>!!navigator.serviceWorker.controller))}
await p.screenshot({path:'tests/shots/off0.png'});await ctx.setOffline(true);console.log('offline:',await p.evaluate(()=>navigator.onLine));
// 1 habit, 2 manual food, 3 workout
await p.click('[data-tab=recover]');await p.locator('[data-act=recLog]').first().click();await p.waitForTimeout(200);
await p.evaluate(()=>{const b=document.createElement('button');b.dataset.act='quickGo';b.dataset.v='weight';document.body.appendChild(b);b.click()});await p.waitForTimeout(300);
const wIn=p.locator('input[type=number]').first();
await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.click('.player [data-act=wpGo]');await p.click('.player .pick-row >> nth=0');await p.evaluate(()=>document.querySelector('.player [data-act=wpDone]').click());await p.waitForTimeout(200);
await p.click('.player [data-act=wpEnd]');await p.click('.player [data-act=wpGo]');await p.waitForTimeout(200);await p.click('.player [data-act=saveWo]');await p.waitForTimeout(400);
const localCount=async()=>p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));return {workouts:Object.values(d).filter(x=>x.type==='workout').length,recovery:Object.values(d).filter(x=>x.type==='recovery').length}}});
console.log('saved on phone while offline:',JSON.stringify(await localCount()));
const db0=JSON.parse(await p.evaluate(()=>localStorage.getItem('MOCKDB')));console.log('cloud docs while offline:',db0.docs.filter(d=>['workout','recovery'].includes((d.data||{}).type)).length);
await ctx.unroute('**/supabase-js@2.116.0/**');await ctx.route('**/supabase-js@2.116.0/**',r=>r.abort());await p.reload().catch(e=>console.log('reload error',e.message));await p.waitForTimeout(1500);
console.log('app opened offline:',await p.locator('#tabs').isVisible().catch(()=>false),'| still have:',JSON.stringify(await localCount()));
await p.click('[data-tab=train]');console.log('workout visible in history:',await p.locator('text=Gym session').count()>0);
console.log('gate shown offline?',await p.locator('.gate-next, [data-act=gateMode]').count());await ctx.unroute('**/supabase-js@2.116.0/**');await ctx.route('**/supabase-js@2.116.0/**',r=>r.fulfill({body:mock,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'}}));await ctx.setOffline(false);await p.waitForTimeout(4000);
const db1=JSON.parse(await p.evaluate(()=>localStorage.getItem('MOCKDB')));console.log('cloud after reconnect: workouts',db1.docs.filter(d=>(d.data||{}).type==='workout').length,'| recovery',db1.docs.filter(d=>(d.data||{}).type==='recovery').length);
console.log('errors',errs);await b.close();
