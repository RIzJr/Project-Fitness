import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const mock=fs.readFileSync('tests/mocksb.js','utf8');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/supabase-js@2.116.0/**',r=>r.fulfill({body:mock,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'}}));
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());
await ctx.route('**/functions/v1/reminders',r=>r.fulfill({status:404,body:'not found',headers:{'access-control-allow-origin':'*'}}));
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(700);
await p.click('[data-act=gateMode][data-v=up]');await p.fill('#au_email','r@x.com');await p.click('.gate-next');await p.fill('#au_pw','password1');await p.check('#au_consent');await p.click('.gate-next');await p.waitForTimeout(1800);
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.click('[data-tab=you]');await p.click('[data-act=openSettings], [data-tab=settings]').catch(()=>{});
await p.click('[data-act=setPage][data-v=reminders]');await p.waitForTimeout(150);
console.log('page:',(await p.locator('.stack').innerText()).replace(/\n/g,' | ').slice(0,500));
await p.check('[data-act=remOn][data-k=food]');await p.fill('[data-act=remTime][data-k=food]','12:30');await p.locator('[data-act=remTime][data-k=food]').dispatchEvent('change');await p.selectOption('[data-act=remMins]','30');await p.waitForTimeout(200);
await p.screenshot({path:'tests/shots/reminders.png',fullPage:true});
// start workout, do a set → active doc synced
await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.click('.player [data-act=wpGo]');await p.fill('#wpPickQ','Back squat');await p.press('#wpPickQ','Enter');await p.waitForTimeout(200);
await p.click('.player [data-act=wpDone]');await p.waitForTimeout(2500);
let db=JSON.parse(await p.evaluate(()=>localStorage.getItem('MOCKDB')));console.log('active on server:',!!db.docs.find(d=>d.id==='active'&&!d.data._del),'| settings reminders:',JSON.stringify(db.docs.find(d=>d.id==='settings')?.data?.reminders?.food),JSON.stringify(db.docs.find(d=>d.id==='settings')?.data?.reminders?.idle));
// pretend the phone was left for 2 hours
await p.evaluate(()=>{const k=Object.keys(localStorage).find(x=>x.startsWith('pf-draft:'));const d=JSON.parse(localStorage.getItem(k));d.started=Date.now()-150*60000;d.lastAct=Date.now()-120*60000;localStorage.setItem(k,JSON.stringify(d))});
await p.reload();await p.waitForTimeout(1500);
console.log('idle prompt:',(await p.locator('.player .wp-body').innerText().catch(()=>'none')).replace(/\n/g,' | '));
await p.screenshot({path:'tests/shots/idle.png'});
await p.click('.player [data-act=idleSave]');await p.waitForTimeout(2500);
console.log('toast:',await p.innerText('#toast'));
db=JSON.parse(await p.evaluate(()=>localStorage.getItem('MOCKDB')));const wo=db.docs.find(d=>d.id.startsWith('wo_'));console.log('saved mins:',wo&&wo.data.mins,'| active cleared:',!db.docs.find(d=>d.id==='active'&&!d.data._del));
console.log('errors',errs);await b.close();
