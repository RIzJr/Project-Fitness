import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
// seed 10 days of history in localStorage
await p.evaluate(()=>{const k=Object.keys(localStorage).find(x=>x.startsWith('hpc-docs:'));const d=JSON.parse(localStorage.getItem(k));const t=new Date();
  for(let i=1;i<=10;i++){const dt=new Date(t-i*864e5),key=dt.toISOString().slice(0,10);d['ready_'+key]={type:'readiness',date:key,sleepH:7.5,sleepQ:4,energy:4,soreness:2,stress:2,mood:4,pain:false,_t:Date.now()}}
  localStorage.setItem(k,JSON.stringify(d))});
await p.reload();await p.waitForTimeout(600);if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
await p.click('[data-tab=recover]');await p.waitForTimeout(200);
await p.fill('#rd_sleepH','5.5');await p.locator('#rd_sleepH').press('Tab');
for(const [k,n] of [['sleepQ',2],['energy',2],['soreness',4],['stress',3],['mood',3]])await p.click(`[data-act=rdS][data-k=${k}][data-n="${n}"]`);
await p.click('[data-act=rdPain][data-v=no]');await p.click('[data-act=rdSave]');await p.waitForTimeout(200);
console.log((await p.locator('section.panel').first().innerText()).replace(/\n/g,' | ').slice(0,900));
await p.click('.rhow summary');await p.screenshot({path:'tests/shots/ready.png',fullPage:true});
await p.click('[data-tab=train]');await p.waitForTimeout(100);console.log('train note:',(await p.locator('text=Readiness').first().innerText().catch(()=>'')).slice(0,300));
console.log('errors',errs);await b.close();
