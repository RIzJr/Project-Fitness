import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const mock=fs.readFileSync('tests/mocksb.js','utf8');
const b=await chromium.launch();const errs=[];
async function device(seed){const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
  if(seed)await ctx.addInitScript(db=>{if(!localStorage.getItem('MOCKDB'))localStorage.setItem('MOCKDB',db)},seed);
  await ctx.route('**/supabase-js@2.116.0/**',r=>r.fulfill({body:mock,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'}}));
  await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(700);return p}
const what=async p=>(await p.locator('.gate').count())?'GATE: '+(await p.locator('.gate').innerText()).split('\n').slice(0,3).join(' / '):(await p.locator('.onboard').count())?'SETUP':'APP tab '+(await p.locator('h1').first().innerText());
// 1) brand new phone
const A=await device();console.log('A first open:',await what(A));
await A.screenshot({path:'tests/shots/gate-in.png'});
await A.click('[data-act=gateMode][data-v=up]');await A.fill('#au_email','riz@x.com');await A.click('.gate-next');await A.waitForTimeout(150);await A.screenshot({path:'tests/shots/gate-step2.png'});await A.fill('#au_pw','password1');
await A.click('.gate-next');await A.waitForTimeout(400);console.log('A without consent toast:',await A.innerText('#toast'));
await A.check('#au_consent');await A.screenshot({path:'tests/shots/gate-up.png'});await A.click('.gate-next');await A.waitForTimeout(2000);
console.log('A after create:',await what(A));
await A.locator('[data-act=ob][data-k=name]').fill('Riz');await A.click('[data-act=obSkip]');await A.waitForTimeout(300);
await A.click('[data-act=newFood]');await A.fill('#ef_name','Porridge');await A.fill('#ef_carbs','50');await A.click('form[data-form=food] button[type=submit]');await A.waitForTimeout(2500);
await A.reload();await A.waitForTimeout(200);console.log('A reopen (signed in) immediately:',await what(A));
// 2) second phone signs in to existing account
const B=await device(await A.evaluate(()=>localStorage.getItem('MOCKDB')));console.log('B first open:',await what(B));
await B.fill('#au_email','riz@x');await B.click('.gate-next');console.log('B bad email toast:',await B.innerText('#toast'));await B.fill('#au_email','riz@x.com');await B.press('#au_email','Enter');await B.waitForTimeout(150);await B.fill('#au_pw','wrongpass1');await B.press('#au_pw','Enter');await B.waitForTimeout(500);
console.log('B wrong pw:',(await B.locator('.gate .hint').innerText()).split('\n')[0]);
await B.fill('#au_pw','password1');await B.click('.gate-next');await B.waitForTimeout(2500);
console.log('B after sign in:',await what(B),'| foods:',await B.locator('.food .nm').allInnerTexts());
// 3) phone that continues without account
const C=await device();await C.click('[data-act=gateLocal]');await C.waitForTimeout(200);console.log('C local:',await what(C));
await C.reload();await C.waitForTimeout(500);console.log('C reopen:',await what(C));
console.log('errors',errs);await b.close();
