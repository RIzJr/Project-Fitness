import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
await ctx.addInitScript(()=>{localStorage.setItem('pf-gate:'+'x','local')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
const P='.player ';const body=async()=>(await p.locator(P+'.wp-body').innerText()).replace(/\n/g,' | ').slice(0,200);
await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.waitForTimeout(200);
// add exercises via list
await p.click(P+'[data-act=wpList]');await p.fill('#exn0','Back squat');await p.fill('#kg0_0','100');await p.fill('#rp0_0','5');await p.click('[data-act=wpBack]');await p.waitForTimeout(200);
console.log('no ticks, button:',await p.locator(P+'.wp-big').innerText());
await p.click(P+'[data-act=wpOpen][data-i="0"]');await p.click(P+'[data-act=wuPick][data-v=Rower]');await p.click(P+'[data-act=wuMins][data-v="3"]');
await p.click(P+'[data-act=partDone][data-i="1"]');await p.click(P+'[data-act=partDone][data-i="2"]');
console.log('with picks, button:',await p.locator(P+'.wp-big').innerText());
await p.click(P+'[data-act=wuStart]');await p.waitForTimeout(1200);
console.log('cardio:',await body());await p.screenshot({path:'tests/shots/wu-cardio.png'});
await p.click(P+'[data-act=wuPause]');await p.waitForTimeout(1100);const a=await p.locator('#wuClock').innerText();await p.waitForTimeout(1100);console.log('paused holds:',a===await p.locator('#wuClock').innerText(),a);
await p.click(P+'[data-act=wuPause]');await p.click(P+'[data-act=wuNext]');await p.waitForTimeout(200);
console.log('mobility:',await body());await p.screenshot({path:'tests/shots/wu-mob.png'});
let n=0;while(await p.locator(P+'[data-act=wuDrill]:not([data-skip])').count()&&n<10){const t=await p.locator(P+'.wp-body .label').first().innerText();if(!/mobility/i.test(t))break;await p.click(P+'[data-act=wuDrill]:not([data-skip])');n++;await p.waitForTimeout(80)}
console.log('drills done',n,'| now:',await body());await p.screenshot({path:'tests/shots/wu-ramp.png'});
const kg=p.locator(P+'.wp-num[data-f=kg]');await kg.click();await p.keyboard.type('22.5');await p.keyboard.press('Enter');await p.waitForTimeout(100);
await p.click(P+'[data-act=wuSet]:not([data-skip])');await p.waitForTimeout(200);console.log('after set1:',await body());
await p.click(P+'[data-act=restSkip]');await p.waitForTimeout(150);
for(let i=0;i<5;i++){if(!(await p.locator(P+'[data-act=wuSet]:not([data-skip])').count()))break;await p.click(P+'[data-act=wuSet]:not([data-skip])');await p.waitForTimeout(100);if(await p.locator(P+'[data-act=restSkip]').count())await p.click(P+'[data-act=restSkip]');await p.waitForTimeout(100)}
console.log('after warm-up:',await body());
console.log('ramp panel shown on squat?',await p.locator(P+'[data-act=rampTick]').count());
await p.click(P+'[data-act=wpDone]');await p.click(P+'[data-act=wpGo]:has-text("wind down")');await p.click(P+'.wp-big');await p.click(P+'[data-act=saveWo]');await p.waitForTimeout(200);
const docs=await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.parse(localStorage.getItem(k));});
const wo=Object.values(docs).find(d=>d.type==='workout');console.log('saved warmup:',JSON.stringify(wo.warmup));
console.log('errors',errs);await b.close();
