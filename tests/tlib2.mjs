import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.click('[data-tab=train]');await p.click('[data-act=progOpenTrain]');await p.click('[data-act=libAdd][data-k=strength-size-10k]');await p.waitForTimeout(200);
await p.click('[data-act=assignNew]');await p.selectOption('[data-act=asF][data-k=clientUid]','me');await p.click('[data-act=assignGo]');await p.waitForTimeout(300);
const docs=await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.parse(localStorage.getItem(k))});
const pl=Object.values(docs).filter(d=>d.type==='mplan');const g=(w,n)=>pl.find(d=>d.week===w&&d.name.startsWith(n));
for(const w of [1,3,5,7,8]){const b1=g(w,'Upper Strength').exercises[0].rx,iv=g(w,'Intervals').exercises[1],lr=g(w,'Long run').exercises[0];console.log('wk'+w,'bench',b1.kg+'x'+b1.reps,'RIR',b1.rir,'tempo',b1.tempo,'rest',b1.rest,'| intervals',iv.sets.length,'| long run',lr.rx.secs/60,'min')}
// start week-1 session and look at the exercise screen
const first=pl.filter(d=>d.week===1).sort((a,b)=>a.date<b.date?-1:1)[0];
await p.evaluate(id=>{const b=document.createElement('button');b.dataset.act='planStart';b.dataset.id=id;document.body.appendChild(b);b.click()},first.pid);await p.waitForTimeout(200);
await p.click('.player [data-act=wpGo]');await p.waitForTimeout(200);console.log('screen:',(await p.locator('.player .coachrx').innerText()).replace(/\n/g,' | ').slice(0,300));
await p.click('.player .coachrx summary');await p.screenshot({path:'tests/shots/why.png'});
await p.click('.player [data-act=wpDone]');await p.waitForTimeout(300);console.log('rest ring:',await p.locator('.player .wp-ring span').first().innerText().catch(()=>'-'));
console.log('errors',errs);await b.close();
