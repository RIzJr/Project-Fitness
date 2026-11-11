import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.click('[data-tab=train]');await p.click('[data-act=progOpenTrain]');await p.click('[data-act=libAdd][data-k=ul-build-tone]');await p.waitForTimeout(200);
await p.click('[data-act=assignNew]');await p.selectOption('[data-act=asF][data-k=clientUid]','me');await p.click('[data-act=asMode][data-v="1"]');
console.log('assign panel:',(await p.locator('section.panel:has(h2:text("Assign"))').innerText()).replace(/\n/g,' | ').slice(0,400));
await p.click('[data-act=assignGo]');await p.waitForTimeout(400);
const pan=p.locator('section.panel:has(h2:text("Your programme"))');console.log('panel:',(await pan.innerText()).replace(/\n/g,' | ').slice(0,260));
// pretend session 1 was done 14 days ago
await p.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('hpc-docs:'));const D=JSON.parse(localStorage.getItem(k));const L=Object.values(D).filter(d=>d.type==='mplan').sort((a,b)=>a.seq-b.seq);const d=new Date();d.setDate(d.getDate()-14);
  const day=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');D.wo_old={type:'workout',date:day,name:L[0].name,kind:'gym',planId:L[0].pid,exercises:[{name:L[1].exercises[0].name,sets:[{kg:20,reps:10}]}]};localStorage.setItem(k,JSON.stringify(D))});
await p.reload();await p.waitForTimeout(800);await p.click('[data-tab=train]');
console.log('after old session:',(await pan.innerText()).replace(/\n/g,' | ').slice(0,200));
console.log('ahead card:',await p.locator('.ahead').count(),'| missed:',await p.locator('text=Missed').count());
await pan.locator('[data-act=planStart]').first().click();await p.waitForTimeout(300);console.log('toast:',await p.innerText('#toast'));
console.log('errors',errs);await b.close();
