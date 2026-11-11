import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
const inps=await p.locator('input:visible').count();console.log('visible inputs on today:',inps);
let inp=p.locator('input[type=search]:visible, input[type=text]:visible, input:not([type]):visible').first();
if(!await inp.count()){await p.click('[data-act=quickSheet]');await p.waitForTimeout(200);inp=p.locator('.sheet input:visible').first();console.log('sheet inputs',await p.locator('.sheet input').count())}
if(await inp.count()){await inp.tap();await p.waitForTimeout(150);console.log('focused:',await p.evaluate(()=>[document.documentElement.classList.contains('kb'),getComputedStyle(document.querySelector('nav.tabs')).display,getComputedStyle(document.activeElement).fontSize]));
await p.evaluate(()=>document.activeElement.blur());await p.waitForTimeout(250);console.log('after blur kb:',await p.evaluate(()=>document.documentElement.classList.contains('kb')));}
console.log(errs);await b.close();
