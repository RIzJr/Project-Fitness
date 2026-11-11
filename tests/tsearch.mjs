import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(900);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.waitForTimeout(300);await p.click('.player [data-act=wpGo]');await p.waitForTimeout(400);
for(const q of ['db press','rdl','glutes','pullups','incline fly','ohp','kb swing','calves','rear delt','abs','lat pulldown','smith','bench','hamstring curl','lunges','tri','cable row','hip thrust']){
  await p.fill('#wpPickQ',q);await p.waitForTimeout(120);
  const r=await p.evaluate(()=>[...document.querySelectorAll('#pickList .pick-row:not(.add) b')].map(e=>e.textContent));
  console.log(q.padEnd(15),r.length,'|',r.slice(0,6).join(' · '))}
await p.fill('#wpPickQ','single leg rdl');await p.waitForTimeout(120);await p.locator('#pickList .pick-row:not(.add)').first().click();await p.waitForTimeout(200);
console.log('PICKED:',(await p.locator('.player h1').innerText()),'| swapFrom label:',await p.locator('.player .wp-change .muted').count());
console.log('errors',errs);await b.close();
