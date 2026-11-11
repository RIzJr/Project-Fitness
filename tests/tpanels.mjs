import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
// a saved workout so history exists
await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));d.w1={type:'workout',date:'2026-10-20',name:'Push',kind:'gym',exercises:[{name:'Bench press',sets:[{kg:80,reps:8,done:true}]}]};localStorage.setItem(k,JSON.stringify(d))}});await p.reload();await p.waitForTimeout(800);
await p.click('[data-tab=train]');await p.click('[data-act=progOpenTrain]');await p.click('[data-act=libAdd][data-k=strength-size-10k]');await p.waitForTimeout(200);
await p.click('[data-act=assignNew]');await p.selectOption('[data-act=asF][data-k=clientUid]','me');await p.click('[data-act=assignGo]');await p.waitForTimeout(300);
const pan=p.locator('section.panel:has(h2:text("Your programme"))');console.log('compact:',(await pan.innerText()).replace(/\n/g,' | '));
await p.screenshot({path:'tests/shots/panel-compact.png'});
await pan.locator('[data-act=tgl][data-k=plansOpen]').click();console.log('items open:',await pan.locator('.hist .item').count());
await pan.locator('[data-act=tgl][data-k=planMore]').click();console.log('more:',(await pan.innerText()).length);
const h=p.locator('section.panel:has-text("Exercise history")');console.log('history closed:',(await h.innerText()).replace(/\n/g,' | '));await h.locator('[data-k=exHistOpen]').click();console.log('history open:',(await p.locator('section.panel:has-text("Exercise history")').innerText()).replace(/\n/g,' | ').slice(0,120));
await p.screenshot({path:'tests/shots/panel-open.png',fullPage:true});
console.log('errors',errs);await b.close();
