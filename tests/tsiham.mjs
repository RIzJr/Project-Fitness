import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.click('[data-tab=train]');await p.click('[data-act=progOpenTrain]');
for(const f of ['json','csv']){const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('[data-act=progImport]')]);await fc.setFiles('/mnt/user-data/outputs/siham-upper-lower-programme.'+f);await p.waitForTimeout(300);console.log(f,'import:',await p.innerText('#toast'));
 console.log(' tempo/rest/why fields:',await p.locator('[data-act=pgRx][data-k=tempo]').evaluateAll(a=>a.slice(0,3).map(x=>x.value).join(',')),await p.locator('[data-act=pgRx][data-k=rest]').evaluateAll(a=>a.slice(0,3).map(x=>x.value).join(',')));
 await p.click('[data-act=pgSave]');await p.waitForTimeout(200);}
await p.click('[data-act=libAdd][data-k=ul-build-tone]');await p.waitForTimeout(200);
await p.click('[data-act=assignNew]');await p.selectOption('[data-act=asF][data-k=clientUid]','me');await p.click('[data-act=assignGo]');await p.waitForTimeout(300);
const docs=await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.parse(localStorage.getItem(k))});
const pl=Object.values(docs).filter(d=>d.type==='mplan');const g=(w,n)=>pl.find(d=>d.week===w&&d.name.startsWith(n));
for(const w of [1,3,5,6]){const a=g(w,'Upper A').exercises[0],pu=g(w,'Upper B').exercises[1],pk=g(w,'Lower B').exercises.at(-1);console.log('wk'+w,a.name,a.rx.sets+'x'+a.rx.reps,'RIR',a.rx.rir,'|',pu.name,pu.rx.sets+'x'+pu.rx.reps,'|',pk.name,pk.rx.secs+'s', pk.mode||'')}
const names=[...new Set(pl.flatMap(d=>d.exercises.map(e=>e.name)))];console.log('free weight check:',names.filter(n=>/barbell|dumbbell|squat\b|deadlift|lunge|split/i.test(n)));
console.log('demo coverage:',await p.evaluate(n=>n.filter(x=>!(window.PFDEMO&&window.PFDEMO.exPattern?window.PFDEMO.exPattern(x):true)),names));
console.log('errors',errs);await b.close();
