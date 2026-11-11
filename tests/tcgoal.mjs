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
const settings=async p=>{await p.click('[data-tab=you]');await p.click('[data-act=openSettings], [data-tab=settings]').catch(()=>{})};
const sync=async(from,to)=>{const db=await from.evaluate(()=>localStorage.getItem('MOCKDB'));await to.evaluate(d=>localStorage.setItem('MOCKDB',d),db);await to.reload();await to.waitForTimeout(2500)};
const A=await device();await signup(A,'coach@x.com','Riz');await settings(A);
await A.click('[data-act=setPage][data-v=profile]');await A.check('[data-act=coachMode]');await A.click('.back');await A.click('[data-act=setPage][data-v=cloud]');await A.waitForTimeout(600);
await A.click('[data-act=newCode]');await A.waitForTimeout(500);const code=await A.textContent('.code');
const B=await device(await A.evaluate(()=>localStorage.getItem('MOCKDB')));await signup(B,'siham@x.com','Siham');await settings(B);
await B.click('[data-act=setPage][data-v=cloud]');await B.fill('#lk_code',code);await B.click('#linkForm button');await B.waitForTimeout(1500);
await sync(B,A);await A.click('[data-tab=you]');await A.click('[data-act=youView][data-v=clients]').catch(()=>{});await A.waitForTimeout(1500);
// coach opens Siham and sets a goal
await A.click('.clientrow');await A.waitForTimeout(300);
await A.click('[data-act=cgNew]');await A.fill('[data-act=gdF][data-k=ex]','Hip thrust');await A.fill('[data-act=gdF][data-k=kg]','80');await A.fill('[data-act=gdF][data-k=reps]','10');await A.fill('[data-act=gdF][data-k=by]','2026-12-14');await A.click('[data-act=cgSave]');await A.waitForTimeout(1200);
console.log('coach toast:',await A.innerText('#toast'));
const db=JSON.parse(await A.evaluate(()=>localStorage.getItem('MOCKDB')));console.log('server goals row:',JSON.stringify(db.plans.filter(r=>r.id==='goals').map(r=>r.data.goals.map(g=>g.ex+' '+g.kg+'x'+g.reps))));
// client: log a hip thrust session so progress exists, then sync
await sync(A,B);
await B.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));d.wA={type:'workout',date:'2026-10-20',name:'Lower',kind:'gym',exercises:[{name:'Hip thrust',sets:[{kg:50,reps:10}]}]};d.wB={type:'workout',date:'2026-10-29',name:'Lower',kind:'gym',exercises:[{name:'Hip thrust',sets:[{kg:60,reps:10}]}]};localStorage.setItem(k,JSON.stringify(d))}});
await B.reload();await B.waitForTimeout(2500);
await B.click('[data-tab=today]');await B.waitForTimeout(300);console.log('client goal bar:',(await B.locator('.goalbar').innerText().catch(()=>'-')).replace(/\n/g,' | '));
await B.click('[data-tab=you]');await B.click('[data-act=youView][data-v=goals]');await B.waitForTimeout(200);console.log('client goals:',(await B.locator('section.panel:has(h2:text("My goals"))').innerText()).replace(/\n/g,' | '));
await B.screenshot({path:'tests/shots/client-goals.png'});
// client sends report (sync pushes reports)
await B.evaluate(()=>{const b=document.createElement('button');b.dataset.act='sendReport';document.body.appendChild(b);b.click();b.remove()}).catch(()=>{});await B.waitForTimeout(2500);
const db2=JSON.parse(await B.evaluate(()=>localStorage.getItem('MOCKDB')));const rep=db2.reports[0];console.log('report goals:',JSON.stringify(rep&&(rep.data||rep.report||{}).goals));
await sync(B,A);await A.click('[data-tab=you]');await A.click('[data-act=youView][data-v=clients]').catch(()=>{});await A.waitForTimeout(2500);
console.log('roster:',(await A.locator('#app').innerText()).replace(/\n/g,' | ').slice(0,500));
await A.screenshot({path:'tests/shots/coach-roster.png'});
await A.click('.clientrow');await A.waitForTimeout(300);console.log('coach goals panel:',(await A.locator('section.panel:has(h2:text("Goals"))').innerText()).replace(/\n/g,' | '));
console.log('errors',errs);await b.close();
