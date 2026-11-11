import { createRequire } from 'module';const { chromium, devices } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({...devices['iPhone 13']});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.tap('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.tap('[data-act=obSkip]')}
const P='.player ';
await p.tap('[data-tab=train]');await p.tap('[data-act=newWo][data-v=gym]');await p.tap(P+'[data-act=wpGo]');await p.waitForTimeout(150);
// A: tap Done with nothing typed
await p.tap(P+'[data-act=wpDone]');await p.waitForTimeout(150);console.log('A empty:',await p.innerText('#toast'),'| search focused',await p.evaluate(()=>document.activeElement.id));
// B: type own exercise and go straight to Done set
await p.keyboard.type('Sandbag shoulder toss');await p.waitForTimeout(100);console.log('first result:',await p.locator(P+'#pickList .pick-row').first().innerText().then(t=>t.replace(/\n/g,' / ')));
await p.tap(P+'[data-act=wpDone]');await p.waitForTimeout(200);
const docs=await p.evaluate(()=>JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.startsWith('pf-draft'))||'null')));
console.log('B after Done: screen=',(await p.locator(P+'.wp-body').first().innerText()).split('\n').slice(0,2).join(' / '));
await p.waitForTimeout(1000);await p.evaluate(()=>document.querySelector('.player [data-act=restSkip]')?.click());await p.waitForTimeout(200);
console.log('exercise now:',await p.locator(P+'h1').first().innerText(),'| set chips:',(await p.locator(P+'.wp-chip').allInnerTexts()).join(', '));
// C: a timed bodyweight hold typed own
console.log('errors',errs);await b.close();
