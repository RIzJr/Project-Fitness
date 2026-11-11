import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
await ctx.route('**/*openfoodfacts.org/**',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({hits:[],products:[{product_name:"Big Mac Sauce",brands:"McDonald's",nutriments:{"energy-kcal_100g":500,proteins_100g:1,carbohydrates_100g:10,fat_100g:50}}]})}));
await ctx.route('**/api.nal.usda.gov/**',r=>r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({foods:[]})}));
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
console.log('tabs:',(await p.locator('[data-act=srcTab]').allInnerTexts()).join(' | '));
await p.click('[data-act=srcTab][data-v=menu]');await p.fill('#q',"nando's");await p.press('#q','Enter');await p.waitForTimeout(200);
console.log('nandos:',(await p.locator('.result .nm').allInnerTexts()).length,'items, first:',(await p.locator('.result').first().innerText()).replace(/\n/g,' | '));
await p.fill('#q','chicken wrap');await p.press('#q','Enter');await p.waitForTimeout(150);console.log('chicken wrap:',(await p.locator('.result .nm').allInnerTexts()).join(' ; '));
await p.click('[data-act=srcTab][data-v=all]');await p.fill('#q','big mac');await p.press('#q','Enter');await p.waitForTimeout(1500);
console.log('all "big mac":',(await p.locator('.result .nm').allInnerTexts()).join(' ; '),'| status:',await p.innerText('.status'));
await p.screenshot({path:'tests/shots/menu.png'});
await p.click('[data-act=addRes][data-i="0"]');await p.waitForTimeout(150);console.log('logged:',await p.locator('.food .nm').allInnerTexts());
console.log('errors',errs);await b.close();
