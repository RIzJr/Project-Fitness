import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const mock=fs.readFileSync('tests/mocksb.js','utf8');
const b=await chromium.launch();const errs=[];
async function device(seed){const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
  if(seed)await ctx.addInitScript(db=>{if(!localStorage.getItem('MOCKDB'))localStorage.setItem('MOCKDB',db)},seed);
  await ctx.route('**/supabase-js@2.116.0/**',r=>r.fulfill({body:mock,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'}}));
  await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(700);return p}
const signup=async(p,email,name)=>{await p.click('[data-act=gateMode][data-v=up]');await p.fill('#au_email',email);await p.click('.gate-next');await p.fill('#au_pw','password1');await p.check('#au_consent');await p.click('.gate-next');await p.waitForTimeout(1800);
  if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill(name);await p.click('[data-act=obSkip]')}await p.waitForTimeout(300)};
const sync=async(from,to)=>{const db=await from.evaluate(()=>localStorage.getItem('MOCKDB'));await to.evaluate(d=>localStorage.setItem('MOCKDB',d),db);await to.reload();await to.waitForTimeout(2500)};
// coach
const A=await device();await signup(A,'coach@x.com','Riz');
await A.click('[data-tab=settings]').catch(()=>{});
// open settings via You tab gear if needed
if(!(await A.locator('[data-act=setPage][data-v=profile]').count())){await A.click('[data-tab=you]');await A.click('[data-act=openSettings], [data-tab=settings]').catch(()=>{})}
await A.click('[data-act=setPage][data-v=profile]');await A.check('[data-act=coachMode]');await A.click('.back');await A.click('[data-act=setPage][data-v=cloud]');await A.waitForTimeout(600);
await A.click('[data-act=newCode]');await A.waitForTimeout(500);const code=await A.textContent('.code');console.log('coach code',code);
// client
const B=await device(await A.evaluate(()=>localStorage.getItem('MOCKDB')));await signup(B,'sam@x.com','Sam');
if(!(await B.locator('[data-act=setPage][data-v=cloud]').count())){await B.click('[data-tab=you]');await B.click('[data-act=openSettings], [data-tab=settings]').catch(()=>{})}
await B.click('[data-act=setPage][data-v=cloud]');await B.fill('#lk_code',code);await B.click('#linkForm button');await B.waitForTimeout(1500);
console.log('B linked:',await B.locator('[data-act=unlinkCoach]').count());
await sync(B,A);await A.click('[data-tab=you]');await A.click('[data-act=youView][data-v=clients]').catch(()=>{});await A.waitForTimeout(1500);
await A.click('[data-act=openClient][data-id^=client_]');await A.waitForTimeout(200);
await A.click('[data-act=csEdit]');await A.locator('[data-act=csF][data-k=kcal]').fill('2100');await A.locator('[data-act=csF][data-k=protein]').fill('130');await A.locator('[data-act=csF][data-k=carbs]').fill('230');await A.locator('[data-act=csF][data-k=fat]').fill('70');
await A.locator('[data-act=csHab]').fill('Protein at every meal\n10,000 steps\n3 litres of water');await A.click('[data-act=csSend]');await A.waitForTimeout(800);console.log('coach toast:',await A.innerText('#toast'));
await A.click('[data-act=fbNew]');await A.locator('[data-act=fbF][data-k=text]').fill('Great week, sessions were consistent. Keep the squat depth.');await A.locator('[data-act=fbF][data-k=focus]').fill('Protein at every meal');await A.click('[data-act=fbSend]');await A.waitForTimeout(800);console.log('coach toast:',await A.innerText('#toast'));
await A.screenshot({path:'tests/shots/coach-set.png',fullPage:true});
await sync(A,B);await B.waitForTimeout(500);await B.click('[data-tab=today]');await B.waitForTimeout(300);
console.log('client toast:',await B.innerText('#toast'));
console.log('banner:',(await B.locator('.coachnote').innerText().catch(()=>'none')).replace(/\n/g,' | '));
console.log('targets now:',await B.locator('.nutri').innerText().then(t=>t.replace(/\n/g,' ').slice(0,80)).catch(()=>'-'),'| habits:',(await B.locator('.htile').allInnerTexts()).join(', '));
await B.click('.coachnote');await B.waitForTimeout(300);console.log('checkin feedback:',(await B.locator('.coachfb').first().innerText().catch(()=>'none')).replace(/\n/g,' | '));
await B.click('[data-tab=today]');console.log('banner after read:',await B.locator('.coachnote').count());
console.log('errors',errs);await b.close();
