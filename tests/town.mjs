import { createRequire } from 'module';const { chromium, devices } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({...devices['iPhone 13']});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.tap('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.tap('[data-act=obSkip]')}
const P='.player ';
for(const kind of ['gym','bodyweight','functional']){
await p.tap('[data-tab=train]');await p.tap(`[data-act=newWo][data-v=${kind}]`);await p.tap(P+'[data-act=wpGo]');await p.waitForTimeout(150);
const btn=()=>p.locator(P+'[data-act=wpDone], '+P+'[data-act=wpHold]').first();
console.log(kind,'| before picking: Done disabled?',await btn().isDisabled().catch(()=>'none'),'| footer:',await p.locator(P+'.wp-foot').innerText().then(t=>t.replace(/\n/g,' / ')).catch(()=>'-'));
await p.tap('#wpPickQ');await p.keyboard.type('Sandbag shoulder toss');await p.waitForTimeout(150);
console.log('  typed, not chosen: Done disabled?',await btn().isDisabled().catch(()=>'none'));
await p.tap(P+'.pick-row.add');await p.waitForTimeout(200);
console.log('  after tapping +Use: title=',await p.locator(P+'h1').first().innerText().catch(()=>'-'),'| Done disabled?',await btn().isDisabled().catch(()=>'none'),'| inputs',await p.locator(P+'input.wp-num').count());
await p.tap(P+'[data-act=wpEnd]');await p.tap(P+'[data-act=wpDiscard]');await p.tap(P+'[data-act=wpDiscard]').catch(()=>{});await p.waitForTimeout(200);}
console.log('errors',errs);await b.close();
