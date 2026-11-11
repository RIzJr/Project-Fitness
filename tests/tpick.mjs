import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
const P='.player ';
// bodyweight session: picker should show bodyweight library
await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=bodyweight]');await p.click(P+'[data-act=wpGo]');await p.waitForTimeout(150);
console.log('BW tabs:',(await p.locator(P+'[data-act=pickTab]').allInnerTexts()).join(', '));
console.log('BW list:',(await p.locator(P+'.pick-row b').allInnerTexts()).join(', '));
await p.screenshot({path:'tests/shots/pick-bw.png'});
await p.fill('#wpPickQ','pull');await p.waitForTimeout(100);console.log('search "pull":',(await p.locator(P+'#pickList').innerText()).replace(/\n/g,' | '));
await p.fill('#wpPickQ','');await p.click(P+'[data-act=pickTab][data-v=Core]');await p.click(P+'.pick-row >> nth=0');await p.waitForTimeout(100);
console.log('picked:',await p.locator(P+'h1').innerText());
await p.click(P+'[data-act=wpDone]');await p.click(P+'[data-act=wpGo]:has-text("wind down")').catch(()=>{});await p.waitForTimeout(100);
console.log('cooldown items:',(await p.locator(P+'.wp-card').allInnerTexts()).map(t=>t.replace(/\n/g,' / ')).join(' ; '));
const howto=p.locator(P+'.wp-more:has-text("How to")');console.log('how-to buttons',await howto.count());if(await howto.count()){await howto.first().click();console.log('demo svg in cooldown',await p.locator(P+'svg.demo').count())}
await p.click(P+'.wp-big');await p.click(P+'[data-act=saveWo]');await p.waitForTimeout(150);
// new bodyweight session: Recent tab should list the core exercise
await p.click('[data-act=newWo][data-v=bodyweight]');await p.click(P+'[data-act=wpGo]');await p.waitForTimeout(100);
console.log('recent tab first?',await p.locator(P+'[data-act=pickTab][aria-pressed=true]').innerText(),'|',(await p.locator(P+'.pick-row b').allInnerTexts()).join(', '));
await p.click(P+'[data-act=wpEnd]');await p.click(P+'[data-act=wpDiscard]');await p.click(P+'[data-act=wpDiscard]');
// recover: routine moves + runner demo
await p.click('[data-tab=recover]');await p.click('[data-act=rtPeek][data-id=legs]');await p.waitForTimeout(100);
console.log('legs routine demos:',await p.locator('.demo-mini svg.demo').count(),'of',await p.locator('.demo-mini').count());
await p.screenshot({path:'tests/shots/rt-peek.png',fullPage:true});
await p.click('[data-act=rtStart][data-id=legs]');await p.waitForTimeout(1500);
console.log('runner:',(await p.locator('.runner .rtbody').innerText()).replace(/\n/g,' | '),'| svg',await p.locator('.runner svg.demo').count());
await p.screenshot({path:'tests/shots/rt-run.png'});
console.log('errors',errs);await b.close();
