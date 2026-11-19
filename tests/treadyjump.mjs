// Today's readiness check-in: tapping a score or Yes/No must not jump the page or the check-in sheet back to the top.
import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:600}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(1200);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.waitForTimeout(400);
const scrollOf=()=>p.evaluate(()=>{const els=[document.scrollingElement,...document.querySelectorAll('#sheetRoot *')];let best=0;for(const e of els)if(e&&e.scrollTop>best)best=e.scrollTop;return best});
const where='pop-up';for(let i=0;i<30&&!(await p.locator('#sheetRoot [data-act=rdS]').count());i++){if(await p.locator('[data-act=rdPopOpen]').count())await p.locator('[data-act=rdPopOpen]').first().click();await p.waitForTimeout(200)}if(!(await p.locator('#sheetRoot [data-act=rdS]').count()))throw new Error('check-in pop-up did not open');
await p.waitForTimeout(300);
const btn=p.locator('[data-act=rdS][data-n="4"]').last();await btn.scrollIntoViewIfNeeded();await p.waitForTimeout(200);
const before=await scrollOf();await btn.click();await p.waitForTimeout(250);const after=await scrollOf();
const pressed=await btn.getAttribute('aria-pressed');
await p.locator('[data-act=rdPain][data-v=no]').first().click();await p.waitForTimeout(200);const after2=await scrollOf();
console.log('form in',where,'| scroll before',before,'after score',after,'after pain',after2,'| pressed',pressed);
const ok=before>0&&Math.abs(after-before)<2&&Math.abs(after2-before)<2&&pressed==='true';
console.log(ok?'PASS':'FAIL');process.exitCode=ok?0:1;console.log('errors',errs.length?errs:'none');await b.close();
