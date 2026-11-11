import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844},colorScheme:'light'});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.evaluate(()=>{const b=document.createElement('button');b.dataset.act='lookTheme';b.dataset.v='light';document.body.appendChild(b);b.click()});await p.waitForTimeout(300);console.log('theme attr',await p.evaluate(()=>document.documentElement.dataset.theme));
await p.click('[data-tab=train]');await p.click('[data-act=progOpenTrain]');await p.click('[data-act=libAdd][data-k=strength-size-10k]');await p.waitForTimeout(150);
await p.click('[data-act=assignNew]');await p.selectOption('[data-act=asF][data-k=clientUid]','me');await p.fill('[data-act=asF][data-k=start]','2026-10-26');await p.dispatchEvent('[data-act=asF][data-k=start]','change');await p.click('[data-act=assignGo]');await p.waitForTimeout(300);
for(const t of ['today','train','recover','you']){await p.click(`[data-tab=${t}]`);await p.waitForTimeout(200);await p.screenshot({path:`tests/shots/light-${t}.png`,fullPage:true})}
await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.click('.player [data-act=wpGo]');await p.click('.player .pick-row >> nth=0');await p.waitForTimeout(200);await p.screenshot({path:'tests/shots/light-player.png'});
console.log('errors',errs);await b.close();
