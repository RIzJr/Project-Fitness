import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
await ctx.route('**/*openfoodfacts.org/**',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"hits":[],"products":[]}'}));
await ctx.route('**/api.nal.usda.gov/**',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"foods":[]}'}));
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.click('[data-act=srcTab][data-v=world]');
for(const q of ['jollof','nigerian','adobo','biriyani','pho','korean','persian']){await p.fill('#q',q);await p.press('#q','Enter');await p.waitForTimeout(120);
  const n=await p.locator('.result').count();console.log(q,'→',n,'|',(await p.locator('.result').first().innerText().catch(()=>'')).replace(/\n/g,' | '))}
await p.click('[data-act=srcTab][data-v=all]');await p.fill('#q','chicken biryani');await p.press('#q','Enter');await p.waitForTimeout(1200);
console.log('all:',(await p.locator('.result .nm').allInnerTexts()).slice(0,4).join(' ; '),'| status',await p.innerText('.status'));
await p.screenshot({path:'tests/shots/world.png'});
console.log('errors',errs);await b.close();
