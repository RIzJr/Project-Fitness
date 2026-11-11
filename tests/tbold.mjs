import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(1200);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Rizalito Mangilit');await p.click('[data-act=obSkip]')}
// some history: workouts and weigh-ins
await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));
 d.w0={type:'workout',date:'2026-10-12',name:'Upper',kind:'gym',exercises:[{name:'Barbell bench press',sets:[{kg:90,reps:8}]}]};
 d.w1={type:'workout',date:'2026-10-27',name:'Upper',kind:'gym',exercises:[{name:'Barbell bench press',sets:[{kg:95,reps:5},{kg:92.5,reps:6}]}]};
 d.b0={type:'body',date:'2026-10-10',weight:80};d.b1={type:'body',date:'2026-10-29',weight:79};localStorage.setItem(k,JSON.stringify(d))}});
await p.reload();await p.waitForTimeout(1200);
await p.click('[data-tab=train]');await p.click('[data-act=progOpenTrain]');await p.click('[data-act=libAdd][data-k=strength-size-10k]');await p.waitForTimeout(150);
await p.click('[data-act=assignNew]');await p.selectOption('[data-act=asF][data-k=clientUid]','me');await p.fill('[data-act=asF][data-k=start]','2026-10-26');await p.dispatchEvent('[data-act=asF][data-k=start]','change');await p.click('[data-act=assignGo]');await p.waitForTimeout(300);
await p.click('[data-tab=today]');await p.waitForTimeout(300);
console.log('hero:',(await p.locator('.hero').innerText()).replace(/\n/g,' | '));
console.log('body:',(await p.locator('.wkstats').innerText()).replace(/\n/g,' | '));
await p.screenshot({path:'tests/shots/bold-today.png'});
// goals
await p.click('[data-act=goGoals]');await p.waitForTimeout(300);console.log('you view:',(await p.locator('#app').innerText()).slice(0,300).replace(/\n/g,' | '));await p.click('[data-act=goalNew]');
await p.fill('[data-act=gdF][data-k=ex]','Barbell bench press');await p.fill('[data-act=gdF][data-k=kg]','100');await p.fill('[data-act=gdF][data-k=reps]','4');await p.fill('[data-act=gdF][data-k=by]','2026-12-14');await p.click('[data-act=goalSave]');await p.waitForTimeout(200);console.log('toast1',await p.innerText('#toast'),await p.locator('.goalform').count(),(await p.locator('#app').innerText()).slice(0,400).replace(/\n/g,' | '));
await p.click('[data-act=goalNew]');await p.selectOption('[data-act=gdF][data-k=kind]','weight');await p.waitForTimeout(100);await p.fill('[data-act=gdF][data-k=kg]','77');await p.click('[data-act=goalSave]');await p.waitForTimeout(200);
await p.click('[data-act=goalNew]');await p.selectOption('[data-act=gdF][data-k=kind]','sessions');await p.waitForTimeout(100);await p.fill('[data-act=gdF][data-k=target]','6');await p.click('[data-act=goalSave]');await p.waitForTimeout(200);
await p.click('[data-act=goalNew]');await p.selectOption('[data-act=gdF][data-k=kind]','custom');await p.waitForTimeout(100);await p.fill('[data-act=gdF][data-k=name]','Waist down to 80 cm');await p.fill('[data-act=gdF][data-k=start]','84');await p.fill('[data-act=gdF][data-k=target]','80');await p.fill('[data-act=gdF][data-k=unit]','cm');await p.click('[data-act=goalSave]');await p.waitForTimeout(200);
const cur=p.locator('[data-act=goalCur]');await cur.fill('82');await cur.press('Tab');await p.waitForTimeout(200);
console.log('goals:',(await p.locator('section.panel:has(h2:text("My goals"))').innerText()).replace(/\n/g,' | '));
await p.screenshot({path:'tests/shots/bold-goals.png'});
await p.click('[data-tab=today]');await p.waitForTimeout(200);console.log('goal bar:',(await p.locator('.goalbar').innerText()).replace(/\n/g,' | '));
await p.screenshot({path:'tests/shots/bold-today2.png',fullPage:true});
await p.evaluate(()=>{const b=document.createElement('button');b.dataset.act='lookTheme';b.dataset.v='light';document.body.appendChild(b);b.click();b.remove()});await p.waitForTimeout(200);await p.screenshot({path:'tests/shots/bold-today-light.png'});
await p.click('[data-tab=train]');await p.waitForTimeout(200);await p.screenshot({path:'tests/shots/bold-train-light.png'});
console.log('errors',errs);await b.close();
