import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const mock=fs.readFileSync('tests/mocksb.js','utf8');
const b=await chromium.launch();const errs=[];
async function device(seed,path){const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
  if(seed)await ctx.addInitScript(db=>{if(!localStorage.getItem('MOCKDB'))localStorage.setItem('MOCKDB',db)},seed);
  await ctx.route('**/supabase-js@2.116.0/**',r=>r.fulfill({body:mock,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'}}));
  await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/'+(path||''));await p.waitForTimeout(700);return p}
const signup=async(p,email,name)=>{await p.click('[data-act=gateMode][data-v=up]');await p.fill('#au_email',email);await p.click('.gate-next');await p.fill('#au_pw','password1');await p.check('#au_consent');await p.click('.gate-next');await p.waitForTimeout(1800);
  if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill(name);await p.click('[data-act=obSkip]')}await p.waitForTimeout(300)};
const sync=async(from,to)=>{const db=await from.evaluate(()=>localStorage.getItem('MOCKDB'));await to.evaluate(d=>localStorage.setItem('MOCKDB',d),db);await to.reload();await to.waitForTimeout(2500)};
const docs=p=>p.evaluate(()=>{const o={};for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))Object.assign(o,JSON.parse(localStorage.getItem(k)));return o});
const txt=async(p,sel)=>(await p.locator(sel).first().innerText().catch(()=>'-')).replace(/\n/g,' | ');
const logSet=async(p,kg,reps)=>{const k=p.locator('.player .wp-num[data-f=kg]');await k.click();await k.fill('');await p.keyboard.type(String(kg));await p.keyboard.press('Enter');const r=p.locator('.player .wp-num[data-f=reps]');await r.click();await r.fill('');await p.keyboard.type(String(reps));await p.keyboard.press('Enter');await p.waitForTimeout(80);await p.click('.player [data-act=wpDone]');await p.waitForTimeout(120);await p.waitForTimeout(950);await p.evaluate(()=>{const e=document.querySelector('.player [data-act=restSkip]');e&&e.click()});await p.waitForTimeout(80)};
// coach + client linked
const A=await device();await signup(A,'coach@x.com','Riz');
if(!(await A.locator('[data-act=setPage][data-v=profile]').count())){await A.click('[data-tab=you]');await A.click('[data-act=openSettings], [data-tab=settings]').catch(()=>{})}
await A.click('[data-act=setPage][data-v=profile]');await A.check('[data-act=coachMode]');await A.click('.back');await A.click('[data-act=setPage][data-v=cloud]');await A.waitForTimeout(600);
await A.click('[data-act=newCode]');await A.waitForTimeout(500);const code=await A.textContent('.code');
const B=await device(await A.evaluate(()=>localStorage.getItem('MOCKDB')),'?coach='+code);
await B.fill('#au_email','sam@x.com');await B.click('.gate-next');await B.fill('#au_pw','password1');await B.check('#au_consent');await B.click('.gate-next');await B.waitForTimeout(2500);if(await B.locator('[data-act=obSkip]').count()){await B.locator('[data-act=ob][data-k=name]').fill('Sam Patel');await B.click('[data-act=obSkip]')}await B.waitForTimeout(500);
// Sam trains alone first: squat 80x5
await B.click('[data-tab=train]');await B.click('[data-act=newWo][data-v=gym]');await B.waitForTimeout(200);await B.click('.player [data-act=wpGo]');await B.waitForTimeout(150);
if(await B.locator('#wpPickQ').count()){await B.fill('#wpPickQ','Barbell back squat');await B.press('#wpPickQ','Enter');await B.waitForTimeout(150)}
await logSet(B,80,5);await B.click('.player [data-act=wpEnd]');await B.click('.player .wp-big');await B.waitForTimeout(100);await B.click('.player [data-act=saveWo]');await B.waitForTimeout(3500);
console.log('B own workouts:',Object.values(await docs(B)).filter(d=>d.type==='workout').map(w=>w.exercises.map(e=>e.name+' '+JSON.stringify(e.sets)).join(';')).join(' / '));await B.reload();await B.waitForTimeout(3000);
// coach plans Upper A today
await sync(B,A);await A.click('[data-tab=you]');await A.click('[data-act=youView][data-v=clients]').catch(()=>{});await A.waitForTimeout(1500);
await A.click('[data-act=openClient][data-id^=client_]');await A.waitForTimeout(200);
await A.click('[data-act=plNew]');const today=await A.evaluate(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')});
await A.fill('#pl_date',today);await A.fill('#pl_name','Upper A');
await A.click('[data-act=plAdd]');await A.fill('#plx0','Barbell bench press');await A.locator('#plx0').press('Tab');await A.waitForTimeout(100);
await A.locator('[data-act=plRx][data-i="0"][data-k=sets]').fill('3');await A.locator('[data-act=plRx][data-i="0"][data-k=reps]').fill('6');await A.locator('[data-act=plRx][data-i="0"][data-k=kg]').fill('60');
await A.click('[data-act=plAdd]');await A.fill('#plx1','Barbell back squat');await A.locator('#plx1').press('Tab');await A.waitForTimeout(100);
await A.locator('[data-act=plRx][data-i="1"][data-k=sets]').fill('2');await A.locator('[data-act=plRx][data-i="1"][data-k=reps]').fill('5');
await A.click('[data-act=plSave]');await A.waitForTimeout(800);
// Today shortcut
await A.click('[data-tab=today]');await A.waitForTimeout(200);console.log('TODAY ROW:',await txt(A,'[data-act=tcPick]'));
await A.click('[data-act=tcPick]');await A.waitForTimeout(200);console.log('PICKER:',await txt(A,'section.panel:has(h2:text("Who are you training"))'));
await A.click('[data-act=tcOpen][data-id^=client_]');await A.waitForTimeout(200);console.log('TRAIN PANEL:',await txt(A,'section.panel:has(h2:text-matches("^Train","i"))'));
await A.screenshot({path:'tests/shots/train-panel.png',fullPage:false});
await A.click('section.panel:has(h2:text-matches("^Train","i")) [data-act=tcGo][data-k=plan]');await A.waitForTimeout(250);
{const d=await docs(A);const c=Object.values(d).find(x=>x.type==='client');console.log('CLIENT LIFTS:',JSON.stringify(c.lifts||null).slice(0,200),'| planDone',JSON.stringify(c.planDone||[]).slice(0,100))}
console.log('PLAYER TITLE:',await txt(A,'.player .wp-title b'));
await A.click('.player [data-act=wpGo]');await A.waitForTimeout(150);
console.log('EX1:',await txt(A,'.player h1'),'| kg',await A.locator('.player .wp-num[data-f=kg]').inputValue());
await logSet(A,62.5,6);await A.screenshot({path:'tests/shots/dbg1.png'});console.log('SKIPS:',await A.locator('[data-act=restSkip]').count(),await A.evaluate(()=>[...document.querySelectorAll('[data-act=restSkip]')].map(e=>e.closest('[hidden]')?'hidden':(e.offsetParent?'vis':'nolayout')+':'+e.parentElement.className).join(';')));console.log('AFTER1:',(await A.locator('.player').innerText()).replace(/\n/g,' | ').slice(0,400));for(let i=0;i<2;i++)await logSet(A,62.5,6);
await A.waitForTimeout(150);console.log('EX2:',await txt(A,'.player h1'),'| kg (Sam last 80)',await A.locator('.player .wp-num[data-f=kg]').inputValue(),'| last line:',await txt(A,'.player .wp-last, .player .lastline'));
await A.screenshot({path:'tests/shots/train-player.png'});
await logSet(A,82.5,5);await logSet(A,82.5,5);
await A.click('.player [data-act=wpEnd]');await A.click('.player .wp-big').catch(()=>{});await A.waitForTimeout(150);
if(await A.locator('.player [data-act=wpGo]').count()&&!(await A.locator('[data-act=csNote]').count())){}
await A.fill('[data-act=csNote]','Bench moving well, add 2.5 kg next time');console.log('FINISH BTN:',await txt(A,'.player [data-act=saveWo]'));
await A.screenshot({path:'tests/shots/train-finish.png'});
await A.click('.player [data-act=saveWo]');await A.waitForTimeout(1500);console.log('TOAST:',await A.innerText('#toast'));
console.log('SESSIONS PANEL:',await txt(A,'section.panel:has(h2:text("Sessions with you"))'));
const dA=await docs(A);console.log('coach own workouts:',Object.values(dA).filter(d=>d.type==='workout').length,'| csessions',Object.values(dA).filter(d=>d.type==='csession').length);
// client receives
await sync(A,B);await B.waitForTimeout(800);console.log('B TOAST:',await B.innerText('#toast'));
await B.click('[data-tab=train]');await B.waitForTimeout(200);await B.click('[data-act=tgl][data-k=woHistOpen]');await B.waitForTimeout(150);console.log('B HISTORY TOP:',await txt(B,'.hist .item'));
await B.click('[data-tab=today]');console.log('B TODAY planned card:',(await txt(B,'section.panel:has(h2:text("Planned for you"))')).slice(0,120));
const dB=await docs(B);const cw=Object.values(dB).filter(d=>d.type==='workout'&&d.coachLogged);console.log('B coach-logged:',cw.length,'planId set',!!(cw[0]&&cw[0].planId),'prs',JSON.stringify(cw[0]&&cw[0].prs||[]));
// coach sees plan done
await sync(B,A);await A.click('[data-tab=you]');await A.click('[data-act=youView][data-v=clients]').catch(()=>{});await A.waitForTimeout(1800);await A.click('[data-act=openClient][data-id^=client_]');await A.waitForTimeout(200);
console.log('COACH PLAN STATUS:',(await txt(A,'section.panel:has(h2:text("Planned sessions")) .hist .item')).slice(0,90));
console.log('TRAIN PANEL AFTER:',await txt(A,'section.panel:has(h2:text-matches("^Train","i"))'));
// delete removes from client
await A.click('[data-act=csDel]');await A.click('[data-act=csDel]');await A.waitForTimeout(800);await sync(A,B);
console.log('B coach-logged after delete:',Object.values(await docs(B)).filter(d=>d.type==='workout'&&d.coachLogged).length);
// ---------- local client ----------
await A.click('[data-tab=you]');await A.click('[data-act=youView][data-v=clients]');await A.click('[data-act=openClient][data-id=""]').catch(()=>{});await A.waitForTimeout(200);
await A.click('[data-act=lcNew]');await A.fill('#lc_name','Jo Bloggs');await A.click('#lcForm [type=submit]');await A.waitForTimeout(300);
console.log('LOCAL DETAIL head:',await txt(A,'.who-row'),'| train:',await txt(A,'section.panel:has(h2:text("Train Jo"))'));
await A.click('[data-act=tcGo][data-k=blank][data-v=gym]');await A.waitForTimeout(200);await A.click('.player [data-act=wpGo]');await A.waitForTimeout(150);
await A.fill('#wpPickQ','Goblet squat');await A.press('#wpPickQ','Enter');await A.waitForTimeout(150);await logSet(A,20,10);
await A.click('.player [data-act=wpEnd]');await A.click('.player .wp-big').catch(()=>{});await A.waitForTimeout(150);console.log('LOCAL FINISH BTN:',await txt(A,'.player [data-act=saveWo]'));await A.click('.player [data-act=saveWo]');await A.waitForTimeout(500);
console.log('LOCAL TOAST:',await A.innerText('#toast'));console.log('LOCAL SESSIONS:',await txt(A,'section.panel:has(h2:text("Sessions with you"))'));console.log('LATEST:',await txt(A,'section.panel:has(h2:text("Latest weights"))'));
await A.click('[data-act=tcOpen][data-id^=client_l]');await A.waitForTimeout(150);await A.click('section.panel:has(h2:text("Train Jo")) [data-act=tcGo][data-k=repeat]');await A.waitForTimeout(200);
await A.click('.player [data-act=wpGo]');await A.waitForTimeout(150);console.log('REPEAT kg:',await A.locator('.player .wp-num[data-f=kg]').inputValue(),'reps',await A.locator('.player .wp-num[data-f=reps]').inputValue());
await A.click('.player [data-act=wpEnd]');await A.click('.player [data-act=wpDiscard]');await A.click('.player [data-act=wpDiscard]').catch(()=>{});await A.waitForTimeout(200);
await A.click('[data-tab=you]');await A.click('[data-act=youView][data-v=clients]');await A.waitForTimeout(200);await A.click('[data-act=openClient][data-id=""]').catch(()=>{});await A.waitForTimeout(200);
console.log('CLIENT LIST:',await txt(A,'.stack'));
await A.screenshot({path:'tests/shots/clients-list.png',fullPage:true});
// merge Jo into Sam
await A.click('[data-act=openClient][data-id^=client_l]');await A.waitForTimeout(200);console.log('MOVE PANEL:',await txt(A,'section.panel:has(h2:text("Moving to the app"))'));
await A.click('[data-act=csMerge]');await A.click('[data-act=csMerge]');await A.waitForTimeout(1500);console.log('MERGE TOAST:',await A.innerText('#toast'));
const dA2=await docs(A);console.log('after merge: local clients',Object.values(dA2).filter(d=>d.type==='client'&&d.local).length,'| sessions pending',Object.values(dA2).filter(d=>d.type==='csession'&&d.pending).length);
await sync(A,B);console.log('B coach-logged after merge:',Object.values(await docs(B)).filter(d=>d.type==='workout'&&d.coachLogged).map(w=>w.name+' '+w.date).join(', '));
console.log('errors',errs);await b.close();
