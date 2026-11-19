// Recovery routines: a 5-second "get ready" pause before the first stretch and between every stretch and side ("Switch sides" for the other leg). Real time.
import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(1200);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
const st=async l=>{const prep=(await p.locator('.rtprep').count())?await p.locator('.rtprep').innerText():'';const name=await p.locator('.runner .rtname').innerText();const time=await p.locator('#rtTime').innerText();
  const btn=await p.locator('.runner [data-act=rtNext]').innerText();console.log(l.padEnd(28),'|',(prep||'(stretching)').padEnd(12),'|',name.padEnd(24),'|',time.padEnd(5),'|',btn)};
await p.click('[data-tab=recover]');await p.click('[data-act=rtStart][data-id=legs]');await p.waitForTimeout(200);
await st('start');
await p.waitForTimeout(2500);await st('after 2.5 s');
await p.waitForTimeout(3000);await st('after 5.5 s');
await p.click('.runner [data-act=rtNext]');await p.waitForTimeout(200);await st('Next during the left leg');
await p.click('.runner [data-act=rtPause]');await p.waitForTimeout(3000);await st('paused 3 s');
await p.click('.runner [data-act=rtPause]');await p.waitForTimeout(5400);await st('resumed 5.4 s');
await p.click('.runner [data-act=rtNext]');await p.waitForTimeout(200);await st('Next during the right leg');
await p.click('.runner [data-act=rtNext]');await p.waitForTimeout(200);await st('tap Start now');
await p.click('.runner [data-act=rtPrev]');await p.waitForTimeout(200);await st('Back');
console.log('errors',errs);await b.close();
