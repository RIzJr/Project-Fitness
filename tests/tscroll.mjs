import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:700}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
const P='.player ';
await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.click(P+'[data-act=wpGo]');await p.waitForTimeout(150);
await p.click(P+'.pick-row >> nth=0');await p.waitForTimeout(150);
const st=()=>p.evaluate(()=>document.querySelector('.player').scrollTop);
const sh=await p.evaluate(()=>{const pl=document.querySelector('.player');return [pl.scrollHeight,pl.clientHeight]});console.log('scrollHeight/client',sh);
await p.evaluate(()=>document.querySelector('.player').scrollTop=150);console.log('before',await st());
await p.click(P+'[data-act=wpAdj][data-f=kg][data-d^="2"], '+P+'[data-act=wpAdj][data-f=kg]:not([data-d^="-"])');await p.waitForTimeout(100);console.log('after kg +',await st());
await p.click(P+'[data-act=wpAdj][data-f=reps]:not([data-d^="-"])');await p.waitForTimeout(100);console.log('after reps +',await st());
await p.locator(P+'[data-act=wpRir][data-n="2"]').scrollIntoViewIfNeeded();const pre=await st();await p.click(P+'[data-act=wpRir][data-n="2"]');console.log('pre RIR',pre);console.log('js click RIR',await p.evaluate(()=>{const pl=document.querySelector('.player');pl.scrollTop=150;document.querySelector('.player [data-act=wpRir][data-n="3"]').click();const a=document.querySelector('.player').scrollTop;return new Promise(r=>setTimeout(()=>r([a,document.querySelector('.player').scrollTop]),300))}));await p.waitForTimeout(100);console.log('after RIR',await st());
const kg=p.locator(P+'input.wp-num[data-f=kg]');await kg.click();await kg.fill('42.5');await p.keyboard.press('Tab');await p.waitForTimeout(100);console.log('after typing kg',await st(),'value',await p.locator(P+'input.wp-num[data-f=kg]').inputValue());
const foot=await p.evaluate(()=>{const f=document.querySelector('.player .wp-foot');const r=f.getBoundingClientRect();return [Math.round(r.top),Math.round(r.bottom),innerHeight,f.innerText.replace(/\n/g,' | ')]});console.log('foot',foot);
await p.screenshot({path:'tests/shots/wp-foot.png'});
// fake pinch zoom 2x scrolled
await p.evaluate(()=>{Object.defineProperty(window,'visualViewport',{configurable:true,value:{scale:2,offsetLeft:100,offsetTop:200,width:195,height:350,addEventListener(){}}})});
await p.click(P+'[data-act=wpAdj][data-f=reps]:not([data-d^="-"])');await p.waitForTimeout(100);
console.log('zoomed foot',await p.evaluate(()=>{const f=document.querySelector('.player .wp-foot');return [f.className,f.style.transform,f.style.width]}));
// next set: done -> rest -> back keeps position
await p.evaluate(()=>{Object.defineProperty(window,'visualViewport',{configurable:true,value:{scale:1,offsetLeft:0,offsetTop:0,width:390,height:700,addEventListener(){}}})});
await p.click(P+'.wp-chip.add');await p.evaluate(()=>document.querySelector('.player').scrollTop=120);await p.evaluate(()=>document.querySelector('.player [data-act=wpDone]').click());await p.waitForTimeout(150);console.log('rest screen top',await st(),await p.locator(P+'[data-act]').evaluateAll(a=>a.map(x=>x.dataset.act).join(',')));await p.waitForTimeout(1000);await p.evaluate(()=>document.querySelector('.player [data-act=restSkip]').click());await p.waitForTimeout(150);console.log('back on exercise',await st());
// train tab panels
await p.click(P+'[data-act=wpEnd]');await p.click(P+'[data-act=wpGo]');await p.waitForTimeout(200);await p.click(P+'[data-act=saveWo]').catch(()=>{});await p.waitForTimeout(300);
console.log('history panel:',await p.locator('section.panel:has-text("Exercise history")').innerText().catch(()=>'-'));
console.log('errors',errs);await b.close();
