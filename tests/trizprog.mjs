import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.click('[data-tab=train]');await p.click('[data-act=progOpenTrain]');
const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('[data-act=progImport]')]);await fc.setFiles('/mnt/user-data/outputs/riz-strength-size-10k-programme.json');await p.waitForTimeout(300);
console.log(await p.innerText('#toast'));await p.click('[data-act=pgSave]');await p.click('[data-act=assignNew]');await p.selectOption('[data-act=asF][data-k=clientUid]','me');await p.waitForTimeout(100);
console.log('days:',(await p.locator('[data-act=asDay][aria-pressed=true]').evaluateAll(n=>n.map(x=>x.dataset.i+':'+x.dataset.v))).join(' '));
await p.click('[data-act=assignGo]');await p.waitForTimeout(300);console.log(await p.innerText('#toast'));
const docs=await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.parse(localStorage.getItem(k))});
const pl=Object.values(docs).filter(d=>d.type==='mplan');const show=w=>pl.filter(d=>d.week===w);
for(const w of [1,4,7,8]){const up=show(w).find(d=>d.name.startsWith('Upper Strength')),lo=show(w).find(d=>d.name.startsWith('Lower Strength')),iv=show(w).find(d=>d.name.startsWith('Intervals'));
  console.log('wk'+w,'bench',JSON.stringify(up.exercises[0].rx),'| squat',lo.exercises[0].rx.kg+'x'+lo.exercises[0].rx.reps,'| intervals',iv.exercises[1].sets.length+'x'+iv.exercises[1].sets[0].secs+'s mode '+iv.exercises[1].mode)}
console.log('errors',errs);await b.close();
