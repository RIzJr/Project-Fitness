import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
// seed a realistic year of data
await p.goto('http://localhost:8767/');await p.waitForTimeout(600);if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.evaluate(()=>{const k=Object.keys(localStorage).find(x=>x.startsWith('hpc-docs:'));const d=JSON.parse(localStorage.getItem(k));const ex=["Back squat","Barbell bench press","Barbell row","Overhead press","Romanian deadlift","Lat pulldown"];
  for(let i=1;i<=365;i++){const dt=new Date(Date.now()-i*864e5).toISOString().slice(0,10);d['day_'+dt]={type:'day',date:dt,foods:[...Array(5)].map((_,j)=>({name:'Food '+j,kcal:400,protein:30,carbs:40,fat:12,meal:['breakfast','lunch','dinner','snacks'][j%4]})),habits:{},_t:1};
    d['ready_'+dt]={type:'readiness',date:dt,sleepH:7,sleepQ:4,energy:4,soreness:2,stress:2,mood:4,pain:false,_t:1};
    if(i%2===0)d['wo_'+i]={type:'workout',date:dt,name:'S',kind:'gym',exercises:ex.map(n=>({name:n,sets:[{kg:60,reps:8},{kg:60,reps:8},{kg:60,reps:7}]})),_t:1}}
  localStorage.setItem(k,JSON.stringify(d))});
const runs=[];for(let i=0;i<3;i++){const t0=Date.now();await p.reload({waitUntil:'load'});await p.waitForSelector('#app h1');runs.push(Date.now()-t0)}
console.log('reload to first screen (4x slower CPU), ms:',runs.join(', '));
const tap=async(sel)=>{const t=await p.evaluate(async s=>{const t0=performance.now();document.querySelector(s).click();await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));return performance.now()-t0},sel);return Math.round(t)};
console.log('tap Train ms:',await tap('[data-tab=train]'),'| tap Today ms:',await tap('[data-tab=today]'),'| tap Recover ms:',await tap('[data-tab=recover]'),'| tap You ms:',await tap('[data-tab=you]'));
await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.waitForTimeout(200);
console.log('open exercise picker ms:',await tap('.player [data-act=wpGo]'));
await b.close();
