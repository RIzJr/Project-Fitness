import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.click('[data-tab=train]');await p.click('[data-act=progOpenTrain]');
console.log('ready-made:',(await p.locator('[data-act=libAdd]').evaluateAll(n=>n.map(x=>x.dataset.k))).join(', '));
await p.click('[data-act=libAdd][data-k=strength-size-10k]');await p.waitForTimeout(200);
await p.click('[data-act=assignNew]');await p.selectOption('[data-act=asF][data-k=clientUid]','me');await p.click('[data-act=assignGo]');await p.waitForTimeout(300);
console.log(await p.innerText('#toast'));console.log('errors',errs);await b.close();
