import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
const P='.player ';
for(const kind of ['bodyweight','calisthenics','gym']){
  await p.click('[data-tab=train]').catch(()=>{});await p.click(`[data-act=newWo][data-v=${kind}]`);await p.waitForTimeout(200);
  console.log(kind,'cards:',(await p.locator(P+'.wp-card').allInnerTexts()).map(t=>t.replace(/\n/g,' | ')));
  await p.click(P+'[data-act=wpOpen][data-i="0"]');console.log('  cardio opts:',(await p.locator(P+'[data-act=wuPick]').allInnerTexts()).join(', '));
  await p.click(P+'[data-act=wpOpen][data-i="1"]');console.log('  mobility:',(await p.locator(P+'.wp-sub').allInnerTexts()).map(t=>t.split(' ·')[0]).join(', '));
  await p.click(P+'[data-act=wuAddToggle]');console.log('  recommended:',(await p.locator(P+'[data-act=wuIdea]').allInnerTexts()).join(', '));
  await p.click(P+'[data-act=wuIdea] >> nth=0');await p.fill('#wuNew','Hip airplanes, 5 each side');await p.press('#wuNew','Enter');await p.waitForTimeout(150);
  console.log('  after adding:',(await p.locator(P+'.wp-card .wp-item').allInnerTexts()).map(t=>t.replace(/\n/g,' / ')).slice(3).join(' ; '));
  if(kind!=='gym'){await p.click(P+'[data-act=wpEnd]');await p.click(P+'[data-act=wpDiscard]');await p.click(P+'[data-act=wpDiscard]').catch(()=>{});await p.waitForTimeout(200)}
}
// gym flow: go to exercise, pick name, see ramp panel, finish set, choose add another exercise
await p.click(P+'[data-act=wuAddToggle]');
await p.click(P+'.wp-big');await p.waitForTimeout(150);
await p.fill('#wpName','Back squat');await p.press('#wpName','Tab');await p.waitForTimeout(150);
const kg=p.locator(P+'.wp-num[data-f=kg]');await kg.click();await p.keyboard.type('100');await p.keyboard.press('Enter');await p.waitForTimeout(150);
console.log('ramp panel:',(await p.locator(P+'section.panel').allInnerTexts()).map(t=>t.replace(/\n/g,' | ')).join(' || '));
await p.click(P+'[data-act=rampTick][data-k="0"]');
await p.screenshot({path:'tests/shots/ex-ramp.png'});
await p.click(P+'[data-act=wpDone]');await p.waitForTimeout(150);
console.log('after last set:',(await p.locator(P+'.wp-body').innerText()).replace(/\n/g,' | ').slice(0,260),'| big:',await p.locator(P+'.wp-big').allInnerTexts(), '| rest?',await p.locator(P+'.wp-ring').count());
await p.screenshot({path:'tests/shots/ex-done.png'});
await p.click(P+'.wp-big');await p.waitForTimeout(150);
console.log('new exercise screen:',(await p.locator(P+'.wp-body span.label').first().innerText()),'| name input',await p.locator('#wpName').count());
await p.fill('#wpName','Barbell bench press');await p.press('#wpName','Tab');await p.waitForTimeout(150);
await p.click(P+'[data-act=wpDone]');await p.waitForTimeout(150);
await p.click(P+'[data-act=wpGo]:has-text("wind down")');await p.waitForTimeout(150);
console.log('now at:',await p.locator(P+'.wp-body h1').innerText());
await p.click(P+'.wp-big');await p.click(P+'[data-act=saveWo]');await p.waitForTimeout(200);console.log('toast',await p.innerText('#toast'));
const docs=await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.parse(localStorage.getItem(k));});
const wo=Object.values(docs).find(d=>d.type==='workout');console.log('saved:',JSON.stringify({ex:wo.exercises,wu:wo.warmup.map(x=>x.name)}));
console.log('errors',errs);await b.close();
