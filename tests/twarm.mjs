import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];
const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.click('[data-tab=train]');await p.waitForTimeout(300);
await p.click('[data-act=newWo][data-v=gym]');await p.waitForTimeout(300);
// list mode to type exercises
await p.click('[data-act=wpList]');await p.waitForTimeout(200);
await p.fill('#exn0','Back squat');await p.fill('#kg0_0','100');await p.fill('#rp0_0','5');
await p.click('[data-act=addEx]');await p.fill('#exn1','Barbell bench press');await p.fill('#kg1_0','60');await p.fill('#rp1_0','8');
await p.click('[data-act=wpBack]').catch(()=>{});await p.waitForTimeout(300);
if(await p.locator('[data-act=wpGo]').count()===0)console.log('no player?');
console.log('warmup screen:',(await p.locator('.wp-card').allInnerTexts()).map(t=>t.replace(/\n/g,' | ')));
const more=p.locator('[data-act=wpOpen]');console.log('options buttons',await more.count());
await more.nth(0).click();await p.click('[data-act=wuPick][data-v=Rower]');await p.click('[data-act=wuMins][data-v="8"]');
await more.nth(1).click();console.log('mobility:',(await p.locator('.wp-opts').innerText()).replace(/\n/g,' | '));
const subs=p.locator('[data-act=wuSub]');const n=await subs.count();for(let i=0;i<n;i++)await subs.nth(i).click();
await more.nth(2).click();console.log('ramp:',(await p.locator('.wp-opts').innerText()).replace(/\n/g,' | '));
await p.screenshot({path:'tests/shots/warm-ramp.png',fullPage:true});
console.log('cards now:',(await p.locator('.wp-card').allInnerTexts()).map(t=>t.replace(/\n/g,' | ')));
// go straight to finish without ticking sets
await p.click('.player [data-act=wpEnd]');await p.click('.player .wp-big');await p.waitForTimeout(200);
console.log('finish:',(await p.locator('.wp-body').innerText()).replace(/\n/g,' | '),'| disabled?',await p.locator('.player [data-act=saveWo]').isDisabled());
await p.click('.player [data-act=saveWo]');await p.waitForTimeout(300);
console.log('toast:',await p.innerText('#toast'));
const docs=await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.parse(localStorage.getItem(k));});
const wo=Object.entries(docs).filter(([k])=>k.startsWith('wo_'));console.log('saved workouts',wo.length,JSON.stringify(wo[0]&&{ex:wo[0][1].exercises,wu:wo[0][1].warmup}));
// warm-up-only save
await p.click('[data-act=newWo][data-v=gym]').catch(async()=>{await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]')});await p.waitForTimeout(200);
await p.click('.player [data-act=partDone][data-i="0"]');await p.click('.player [data-act=wpEnd]');await p.click('.player .wp-big');await p.click('.player [data-act=saveWo]');await p.waitForTimeout(200);console.log('warm-up-only toast:',await p.innerText('#toast'));
console.log('errors',errs);await b.close();
