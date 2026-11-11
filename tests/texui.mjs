import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
const P='.player ';
await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.click(P+'[data-act=wpGo]');await p.waitForTimeout(150);
console.log('picker thumbs:',await p.locator(P+'.pick-row svg.demo').count(),'/',await p.locator(P+'.pick-row').count());
await p.screenshot({path:'tests/shots/pick-thumbs.png'});
await p.click(P+'[data-act=pickTab][data-v=Quads]');await p.click(P+'.pick-row:has-text("Back squat")');await p.waitForTimeout(150);
console.log('demo card:',(await p.locator(P+'.exdemo').innerText().catch(()=>'none')).replace(/\n/g,' | '));
await p.screenshot({path:'tests/shots/ex-demo.png'});
await p.click(P+'[data-act=demoToggle]');console.log('after hide, howto button:',await p.locator(P+'.howto').count());
await p.click(P+'.howto');console.log('reopened:',await p.locator(P+'.exdemo').count());
// every library exercise has a demo
const miss=await p.evaluate(()=>{const opts=[...document.querySelectorAll('#exlib option')].map(o=>o.value);return opts.length});
console.log('errors',errs);await b.close();
