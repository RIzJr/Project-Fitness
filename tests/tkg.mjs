import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.waitForTimeout(200);
await p.click('.player [data-act=wpGo]');await p.waitForTimeout(200);
const kg=p.locator('.player .wp-num[data-f=kg]');await kg.click();await p.keyboard.type('62.5');await p.keyboard.press('Enter');await p.waitForTimeout(200);
const rp=p.locator('.player .wp-num[data-f=reps]');await rp.click();await p.keyboard.type('8');await p.keyboard.press('Enter');await p.waitForTimeout(200);
console.log('kg',await p.locator('.player .wp-num[data-f=kg]').inputValue(),'reps',await p.locator('.player .wp-num[data-f=reps]').inputValue());
await p.click('.player [data-act=wpAdj][data-f=kg][data-d="2.5"]');console.log('after +',await p.locator('.player .wp-num[data-f=kg]').inputValue());
await p.screenshot({path:'tests/shots/kg-type.png'});console.log('errors',errs);await b.close();
