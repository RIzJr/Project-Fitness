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
// coach plans a session for today
await sync(B,A);await A.click('[data-tab=you]');await A.click('[data-act=youView][data-v=clients]').catch(()=>{});await A.waitForTimeout(1500);
await A.click('[data-act=openClient][data-id^=client_]');await A.waitForTimeout(200);
await A.click('[data-act=plNew]');
const today=await A.evaluate(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')});
await A.fill('#pl_date',today);await A.fill('#pl_name','Upper A');
await A.click('[data-act=plAdd]');await A.fill('#plx0','Barbell bench press');await A.locator('#plx0').press('Tab');await A.waitForTimeout(100);
await A.locator('[data-act=plRx][data-i="0"][data-k=sets]').fill('4');await A.locator('[data-act=plRx][data-i="0"][data-k=reps]').fill('6');await A.locator('[data-act=plRx][data-i="0"][data-k=kg]').fill('60');await A.selectOption('[data-act=plRx][data-i="0"][data-k=rir]','2');
await A.locator('[data-act=plEx][data-i="0"][data-k=note]').fill('Pause on the chest');
await A.click('[data-act=plAdd]');await A.fill('#plx1','Barbell row');await A.locator('#plx1').press('Tab');await A.waitForTimeout(100);
await A.fill('#pl_note','Strong week, keep 2 in the tank');
await A.screenshot({path:'tests/shots/plan-editor.png',fullPage:true});
await A.click('[data-act=plSave]');await A.waitForTimeout(800);
console.log('coach list:',(await A.locator('section.panel:has(h2:text("Planned sessions"))').innerText()).replace(/\n/g,' | '));
// client receives
await sync(A,B);await B.click('[data-tab=today]');await B.waitForTimeout(300);
console.log('B today card:',(await B.locator('.hero').innerText()).replace(/\n/g,' | '));
await B.screenshot({path:'tests/shots/plan-today.png'});
await B.click('[data-tab=train]');await B.waitForTimeout(200);console.log('train buttons:',(await B.locator('[data-act=newWo]').allInnerTexts()).join(','));
await B.click('[data-act=newWo][data-v=bodyweight]');await B.waitForTimeout(300);console.log('after newWo:',(await B.locator('.player .wp-title, .player').first().innerText().catch(()=>'no player')).replace(/\n/g,' | ').slice(0,200));
await B.screenshot({path:'tests/shots/bug.png'});
console.log('errors',errs);await b.close();
