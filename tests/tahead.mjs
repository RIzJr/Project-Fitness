import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('hpc-docs:'));const D=JSON.parse(localStorage.getItem(k));
  const d0=new Date();const key=n=>{const d=new Date(d0);d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  const S=[["Upper Strength · Wk 1",3,-4],["Lower Strength · Wk 1",4,-3],["Intervals run · Wk 1",5,null],["Upper Volume · Wk 1",6,-1],["Lower Volume · Wk 1",7,0],["Long run · Wk 1",8,null],["Upper Strength · Wk 2",10,null],["Lower Strength · Wk 2",11,null],["Intervals run · Wk 2",12,null]];
  S.forEach(([n,dp,dw],i)=>{D['mp'+i]={type:'mplan',pid:'pp'+i,progId:'prog1',progName:'Test block',name:n,date:key(dp),kind:'gym',exercises:[{name:'Squat',sets:[{reps:5}]}]};
    if(dw!=null)D['w'+i]={type:'workout',date:key(dw),name:n,kind:'gym',planId:'pp'+i,exercises:[]}});
  localStorage.setItem(k,JSON.stringify(D))});
await p.reload();await p.waitForTimeout(900);
console.log('Today ahead row:',await p.locator('.duerow:has-text("ahead")').count());
await p.click('[data-tab=train]');await p.waitForTimeout(200);
const pan=p.locator('section.panel:has(h2:text("Your programme"))');console.log('BEFORE:',(await pan.innerText()).replace(/\n/g,' | ').slice(0,420));
await pan.locator('[data-act=aheadMove]').click();await p.waitForTimeout(500);console.log('toast:',await p.innerText('#toast'));
console.log('AFTER:',(await pan.innerText()).replace(/\n/g,' | ').slice(0,200));
console.log('card gone:',await p.locator('.ahead').count()===0);
await pan.locator('[data-act=tgl][data-k=plansOpen]').click();
console.log('list:',(await pan.locator('.hist').innerText()).replace(/\n/g,' | ').slice(0,300));
// Do next on the 3rd upcoming
const dn=pan.locator('[data-act=planNext]');console.log('do-next buttons:',await dn.count());await dn.nth(1).click();await p.waitForTimeout(400);console.log('toast2:',await p.innerText('#toast'));
console.log('AFTER2:',(await pan.innerText()).replace(/\n/g,' | ').slice(0,160));
await p.reload();await p.waitForTimeout(800);await p.click('[data-tab=train]');console.log('after reload ahead card:',await p.locator('.ahead').count());
await p.screenshot({path:'tests/shots/ahead.png'});
console.log('errors',errs);await b.close();
