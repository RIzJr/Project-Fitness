// Show/hide password: eye button on the sign-in gate and in Settings › Cloud account; toggles in place, keeps what was typed and the focus.
import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(1200);
const ok=[];const chk=(c,m)=>{ok.push(!!c);console.log((c?'ok   ':'FAIL ')+m)};
chk(await p.locator('#au_email').count()===1,'sign-in gate shown');
await p.fill('#au_email','riz@example.com');await p.press('#au_email','Enter');await p.waitForTimeout(400);
chk(await p.locator('#au_pw').count()===1,'password step');
await p.fill('#au_pw','Secret123!');await p.focus('#au_pw');
chk(await p.locator('#au_pw').getAttribute('type')==='password','hidden by default');
await p.click('.pweye');await p.waitForTimeout(100);
chk(await p.locator('#au_pw').getAttribute('type')==='text'&&await p.inputValue('#au_pw')==='Secret123!','eye shows the password, text kept');
chk(await p.evaluate(()=>document.activeElement&&document.activeElement.id)==='au_pw','focus stays in the password box');
chk(await p.locator('.pweye').getAttribute('aria-label')==='Hide password','button now says Hide password');
await p.screenshot({path:'tests/shots/pweye-gate.png'});
await p.click('.pweye');await p.waitForTimeout(100);chk(await p.locator('#au_pw').getAttribute('type')==='password','tap again hides it');
await p.click('[data-act=gateBack]');await p.waitForTimeout(200);await p.click('[data-act=gateLocal]');await p.waitForTimeout(400);
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.click('[data-tab=you]');await p.click('[data-act=openSettings]');await p.click('[data-act=setPage][data-v=cloud]');await p.waitForTimeout(300);
const n=await p.locator('.pwwrap .pweye').count();console.log('settings eyes',n);
if(n){await p.fill('#au_pw','abcdefgh');await p.click('.pweye');chk(await p.locator('#au_pw').getAttribute('type')==='text','eye works in Settings › Cloud account');await p.screenshot({path:'tests/shots/pweye-settings.png'})}
else chk(false,'eye in Settings › Cloud account');
chk(!errs.length,'no page errors '+JSON.stringify(errs));
await b.close();process.exitCode=ok.every(Boolean)?0:1;
