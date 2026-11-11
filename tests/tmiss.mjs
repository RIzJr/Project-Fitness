import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
const docs=()=>p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.parse(localStorage.getItem(k))});
const setDocs=f=>p.evaluate(f=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));new Function('d',f)(d);localStorage.setItem(k,JSON.stringify(d))}},f.toString().replace(/^d=>\{|\}$/g,''));
async function assign(key,start){await p.click('[data-tab=train]');await p.click('[data-act=progOpenTrain]');await p.click(`[data-act=libAdd][data-k=${key}]`).catch(()=>{});await p.waitForTimeout(150);
  const id=Object.entries(await docs()).find(([,d])=>d.type==='cprog'&&d.libKey===key)[0];await p.click(`[data-act=assignNew][data-id=${id}]`);await p.selectOption('[data-act=asF][data-k=clientUid]','me');await p.fill('[data-act=asF][data-k=start]',start);await p.dispatchEvent('[data-act=asF][data-k=start]','change');await p.click('[data-act=assignGo]');await p.waitForTimeout(300)}
await assign('strength-size-10k','2026-10-19');
let D=await docs();const pl=Object.entries(D).filter(([,d])=>d.type==='mplan').map(([id,d])=>({id,...d})).sort((a,b)=>a.date<b.date?-1:1);
console.log('wk1-2 schedule:',pl.slice(0,12).map(x=>x.date.slice(5)+' '+x.name.split(' ·')[0]).join(' | '));
// done: everything before 28 Oct
const doneIds=pl.filter(x=>x.date<'2026-10-28').map(x=>[x.pid,x.date]);
await p.evaluate(ids=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));ids.forEach(([pid,date],i)=>d['w_t'+i]={type:'workout',date,name:'x',kind:'gym',planId:pid,exercises:[]});localStorage.setItem(k,JSON.stringify(d))}},doneIds);
await p.reload();await p.waitForTimeout(900);await p.click('[data-tab=today]');
const txt=async sel=>(await p.locator(sel).innerText().catch(()=>'-')).replace(/\n/g,' | ');
console.log('TODAY next:',await txt('.hero'));console.log('MISSED:',await txt('section.missed'));console.log('STREAK:',await txt('header.top .sub'));
await p.screenshot({path:'tests/shots/today-missed.png',fullPage:true});
await p.click('section.missed [data-act=planSkip]');await p.waitForTimeout(200);console.log('after skip missed count:',await p.locator('section.missed').count(),'| streak:',await txt('header.top .sub'));
// two misses: undo skip by clearing planMeta, and remove one done workout (Tue 27)
await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));delete d.planMeta;const w=Object.entries(d).find(([,x])=>x.type==='workout'&&x.date==='2026-10-27');delete d[w[0]];localStorage.setItem(k,JSON.stringify(d))}});
await p.reload();await p.waitForTimeout(900);await p.click('[data-tab=today]');console.log('2 MISSED:',await txt('section.missed'));
await p.click('section.missed [data-act=planShift]');await p.waitForTimeout(400);
D=await docs();const pl2=Object.values(D).filter(d=>d.type==='mplan').sort((a,b)=>a.date<b.date?-1:1);console.log('after push back:',pl2.filter(x=>x.date>='2026-10-26').slice(0,6).map(x=>x.date.slice(5)+' '+x.name).join(' | '),'| missed card:',await p.locator('section.missed').count());
console.log('Train panel:',await txt('section.panel:has(h2:text("Your programme"))').then(t=>t.slice(0,160)));
console.log('errors',errs);await b.close();
