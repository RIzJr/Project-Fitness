// Finishing a workout with sets left: the finish screen offers "Finish them now" (back to that exercise) and "I did them, tick all".
import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(900);
if(await p.locator('[data-act=gateLocal]').count()){await p.click('[data-act=gateLocal]');await p.waitForTimeout(300)}
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
const ok=[];const chk=(c,m)=>{ok.push(!!c);console.log((c?'ok   ':'FAIL ')+m)};
const docs=()=>p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.parse(localStorage.getItem(k))});
const sheetWo=async()=>{const d=await docs();return Object.entries(d).filter(([k])=>k.startsWith('wo_')).map(([,v])=>v)};
async function startOne(){await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.waitForTimeout(200);await p.click('.player [data-act=wpGo]');await p.waitForTimeout(150);
  if(await p.locator('#wpPickQ').count()){await p.fill('#wpPickQ','Barbell bench press');await p.press('#wpPickQ','Enter');await p.waitForTimeout(150)}
  const k=p.locator('.player .wp-num[data-f=kg]');await k.click();await p.keyboard.type('60');await p.keyboard.press('Enter');const r=p.locator('.player .wp-num[data-f=reps]');await r.click();await p.keyboard.type('8');await p.keyboard.press('Enter');
  await p.click('.player [data-act=wpDone]');await p.waitForTimeout(150);
  for(let i=0;i<2;i++){const a=p.locator('.player [data-act=wpAddSet]');if(await a.count()){await a.first().click();await p.waitForTimeout(120)}}
  const total=await p.evaluate(()=>document.querySelectorAll('.player').length);return total}
await startOne();
// jump to the finish screen with sets left
await p.click('.player [data-act=wpEnd]');await p.waitForTimeout(150);await p.locator('.player .wp-big').first().click().catch(()=>{});await p.waitForTimeout(200);
if(!(await p.locator('[data-act=saveWo]').count())){const n=await p.evaluate(()=>{const b=[...document.querySelectorAll('.player button')].map(x=>x.dataset.act+':'+x.innerText);return b});console.log(n)}
const txt=await p.locator('.wpunf').innerText().catch(()=>'');console.log('prompt:',txt.replace(/\n/g,' | '));
chk(/not done yet/.test(txt)&&/Bench press/i.test(txt),'finish screen lists the unfinished sets');
await p.screenshot({path:'tests/shots/unfinished.png'});
await p.click('.wpunf [data-act=wpGo]');await p.waitForTimeout(200);chk(await p.locator('.player [data-act=wpDone]').count()===1,'"Finish them now" goes back to the exercise');
await p.click('.player [data-act=wpEnd]');await p.waitForTimeout(150);await p.locator('.player .wp-big').first().click().catch(()=>{});await p.waitForTimeout(200);
await p.click('[data-act=wpMarkAll]');await p.waitForTimeout(200);chk(await p.locator('.wpunf').count()===0,'"I did them" ticks everything and the prompt goes');
await p.click('.player [data-act=saveWo]');await p.waitForTimeout(500);
const w=(await sheetWo())[0];const n=w?w.exercises.reduce((a,e)=>a+e.sets.length,0):0;console.log('saved sets',n,JSON.stringify(w&&w.exercises[0].sets));
chk(n>=2&&w.exercises[0].sets.every(s=>+s.reps>0),'all sets saved with reps');
chk(!errs.length,'no page errors '+JSON.stringify(errs));await b.close();process.exitCode=ok.every(Boolean)?0:1;
