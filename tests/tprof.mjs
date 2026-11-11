import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();const cdp=await ctx.newCDPSession(p);
await p.goto('http://localhost:8767/');await p.waitForTimeout(600);if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.evaluate(()=>{const k=Object.keys(localStorage).find(x=>x.startsWith('hpc-docs:'));const d=JSON.parse(localStorage.getItem(k));const ex=["Back squat","Barbell bench press","Barbell row","Overhead press","Romanian deadlift","Lat pulldown"];
  for(let i=1;i<=365;i++){const dt=new Date(Date.now()-i*864e5).toISOString().slice(0,10);d['day_'+dt]={type:'day',date:dt,foods:[...Array(5)].map((_,j)=>({name:'Food '+j,kcal:400,protein:30,carbs:40,fat:12,meal:'lunch'})),habits:{},_t:1};
    d['ready_'+dt]={type:'readiness',date:dt,sleepH:7,sleepQ:4,energy:4,soreness:2,stress:2,mood:4,pain:false,_t:1};
    if(i%2===0)d['wo_'+i]={type:'workout',date:dt,name:'S',kind:'gym',exercises:ex.map(n=>({name:n,sets:[{kg:60,reps:8},{kg:60,reps:8},{kg:60,reps:7}]})),_t:1}}
  localStorage.setItem(k,JSON.stringify(d))});
await p.reload();await p.waitForSelector('#app h1');
await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:100});await cdp.send('Profiler.start');
for(let i=0;i<5;i++){await p.click('[data-tab=train]');await p.click('[data-tab=today]')}
const {profile}=await cdp.send('Profiler.stop');
const self={};const byId=new Map(profile.nodes.map(n=>[n.id,n]));const dt=profile.timeDeltas;const counts={};profile.samples.forEach((id,i)=>{counts[id]=(counts[id]||0)+(dt[i]||0)});
for(const [id,t] of Object.entries(counts)){const n=byId.get(+id);const k=n.callFrame.functionName+':'+n.callFrame.lineNumber;self[k]=(self[k]||0)+t}
console.log(Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,14).map(([k,t])=>k+' '+Math.round(t/1000)+'ms').join('\n'));
await b.close();
