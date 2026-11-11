import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const p=await b.newPage({viewport:{width:1280,height:900}});
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/404|Failed to load/.test(m.text()))errs.push(m.text())});
await p.route('**/fonts.googleapis.com/**',r=>r.abort());
await p.goto('http://localhost:8767/index.html#learn');await p.waitForTimeout(500);
const D='/tmp/claude-0/-home-claude/378cc395-20d5-56b4-9104-1fc428cea4c0/scratchpad/ptac/';
await p.click('[data-sub=muscles]');await p.click('#mul [data-id=gluteMax]');await p.waitForTimeout(300);await p.screenshot({path:D+'s-muscle.png'});
await p.click('[data-sub=bones]');await p.waitForTimeout(400);await p.screenshot({path:D+'s-skel.png',fullPage:false});
await p.click('[data-bt=bones]');await p.click('[data-b=femur]');await p.waitForTimeout(300);await p.screenshot({path:D+'s-bones.png'});
await p.click('[data-bt=joints]');await p.click('[data-j=knee]');await p.waitForTimeout(300);await p.screenshot({path:D+'s-joints.png',fullPage:true});
await p.click('.med >> nth=0');await p.waitForTimeout(200);console.log('lightbox:',await p.isVisible('#lb'));await p.keyboard.press('Escape');
// quizzes
await p.click('nav.tabs [data-view=quiz]');
for(const t of ['mixed','upper','lower','mimg','bones','joints','pos','bjimg','concepts','weak']){
  await p.click(`[data-t=${t}]`);await p.click('[data-n="10"]');await p.click('#qstart');await p.waitForTimeout(100);
  let n=0;while(await p.locator('.opt').count()){const k=await p.locator('.opt').count();await p.locator('.opt').nth(Math.floor(Math.random()*k)).click();n++;if(n===2&&t==='mixed')await p.screenshot({path:D+'s-quiz.png',fullPage:true});await p.click('#qnext');await p.waitForTimeout(30);if(n>60)break}
  console.log(t,'answered',n,(await p.locator('.score-big').innerText().catch(()=>'?')));
  if(t==='mixed')await p.screenshot({path:D+'s-results.png',fullPage:true});
  await p.click('#qsetup');}
// image question screenshot
await p.click('[data-t=bjimg]');await p.click('#qstart');await p.waitForTimeout(150);await p.locator('.opt').first().click();await p.waitForTimeout(200);await p.screenshot({path:D+'s-quizimg.png',fullPage:true});await p.click('#qquit');
// flashcards
await p.click('nav.tabs [data-view=flash]');
for(const d of ['bones','joints','upper','terms']){await p.click(`[data-deck=${d}]`);for(const m of ['name','rev']){await p.click(`[data-mode=${m}]`);await p.click('#card');await p.waitForTimeout(500);await p.click('#fcGood');}}
await p.click('[data-deck=bones]');await p.click('[data-mode=rev]');await p.waitForTimeout(200);await p.screenshot({path:D+'s-flash.png'});
await p.click('nav.tabs [data-view=progress]');await p.waitForTimeout(200);await p.screenshot({path:D+'s-progress.png',fullPage:true});
await p.click('nav.tabs [data-view=interview]');console.log('interview Qs:',await p.locator('.iq').count());
await p.click('nav.tabs [data-view=match]');await p.waitForTimeout(100);
// mobile
await p.setViewportSize({width:390,height:844});await p.click('nav.tabs [data-view=learn]');await p.click('[data-sub=bones]');await p.click('[data-bt=joints]');await p.waitForTimeout(300);
console.log('mobile overflow:',await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1));
await p.screenshot({path:D+'s-mobile.png'});
console.log('errors',errs.slice(0,8));await b.close();
