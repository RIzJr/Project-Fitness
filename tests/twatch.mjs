import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const b=await chromium.launch();const errs=[];
const ctx=await b.newContext({viewport:{width:390,height:844},acceptDownloads:true});
// fake iPhone: Capacitor bridge + a Health plugin backed by 30 days of simulated watch data
await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  const pad=n=>String(n).padStart(2,'0'),iso=t=>new Date(t).toISOString();
  const now=Date.now(),mid=new Date();mid.setHours(0,0,0,0);const M=mid.getTime(),DAY=864e5;
  const S={sleep:[],heartRate:[],heartRateVariability:[],respiratoryRate:[],oxygenSaturation:[],appleSleepingWristTemperature:[],vo2Max:[]},AGG={restingHeartRate:{},heartRate:{},steps:{}};
  for(let i=30;i>=0;i--){const d0=M-i*DAY,bad=i<=2;                // last 3 days: worse recovery, higher resting HR, warmer, faster breathing
    // night ending this morning: bed ~23:00, wake ~07:00 (jitter)
    const bed=d0-60*60000+Math.round((rnd()-0.5)*50)*60000,wake=d0+7*3600000+Math.round((rnd()-0.5)*50)*60000-(bad?75*60000:0);
    let t=bed+10*60000;const cyc=[["light",40],["deep",bad?10:25],["light",15],["rem",20]];
    while(t<wake-10*60000){for(const [st,m] of cyc){const e=Math.min(wake,t+m*60000);if(e>t)S.sleep.push({sleepState:st,startDate:iso(t),endDate:iso(e),sourceId:'com.apple.health.watch',value:0});t=e;if(t>=wake)break}
      if(t<wake-20*60000){S.sleep.push({sleepState:'awake',startDate:iso(t),endDate:iso(t+4*60000),sourceId:'com.apple.health.watch',value:0});t+=4*60000}}
    S.sleep.push({sleepState:'inBed',startDate:iso(bed-15*60000),endDate:iso(wake+10*60000),sourceId:'com.apple.iphone',value:0});
    S.sleep.push({sleepState:'asleep',startDate:iso(bed),endDate:iso(wake),sourceId:'com.apple.iphone',value:0}); // iPhone logs the same night: must not double count
    const rhr=(bad?62:55)+Math.round(rnd()*3);AGG.restingHeartRate[i]=rhr;AGG.heartRate[i]=rhr-6;AGG.steps[i]=6000+Math.round(rnd()*6000);
    for(let k=0;k<3;k++)S.heartRateVariability.push({value:(bad?42:68)+rnd()*10,startDate:iso(d0+(2+k*7)*3600000),endDate:iso(d0+(2+k*7)*3600000)});
    for(let k=0;k<6;k++)S.respiratoryRate.push({value:(bad?16.6:14.2)+rnd()*0.6,startDate:iso(d0+(k)*3600000),endDate:iso(d0+k*3600000)});
    for(let k=0;k<4;k++)S.oxygenSaturation.push({value:0.96+rnd()*0.02,startDate:iso(d0+(1+k)*3600000),endDate:iso(d0+(1+k)*3600000)});
    S.appleSleepingWristTemperature.push({value:(bad?35.1:34.4)+rnd()*0.1,startDate:iso(bed),endDate:iso(wake)});
    if(i%7===0)S.vo2Max.push({value:44+(30-i)*0.05,startDate:iso(d0+12*3600000),endDate:iso(d0+12*3600000)});
    // all-day heart rate every 5 min, plus a 60 min hard session at 18:00 every other day (5 s samples)
    for(let m=0;m<1440;m+=5){const ts=d0+m*60000;if(ts>now)break;const awake=m>7*60&&m<23*60;S.heartRate.push({value:awake?70+Math.round(rnd()*25):rhr+Math.round(rnd()*4),startDate:iso(ts),endDate:iso(ts)})}
    if(i%2===0&&d0+19*3600000<now)for(let s=0;s<3600;s+=5){const ts=d0+18*3600000+s*1000;S.heartRate.push({value:120+Math.round(50*Math.sin(s/600)**2)+Math.round(rnd()*8),startDate:iso(ts),endDate:iso(ts)})}
  }
  const dayKey=t=>{const d=new Date(t);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
  window.__hkCalls=[];
  const Health={isAvailable:async()=>({available:true}),requestAuthorization:async o=>{__hkCalls.push(['auth',o.read.length]);return {}},saveSample:async()=>({}),
    queryAggregated:async o=>{__hkCalls.push(['agg',o.dataType,o.aggregation]);if(['heartRateVariability','respiratoryRate','oxygenSaturation'].includes(o.dataType))throw new Error('not supported');
      const A=AGG[o.dataType];if(!A)return {samples:[]};const out=[];for(let i=30;i>=0;i--){const t=M-i*DAY;if(t<Date.parse(o.startDate)-DAY)continue;out.push({startDate:iso(t),endDate:iso(t+DAY),value:A[i]})}return {samples:out}},
    readSamples:async o=>{const L=S[o.dataType]||[],a=Date.parse(o.startDate),z=Date.parse(o.endDate);let r=L.filter(x=>Date.parse(x.startDate)>=a&&Date.parse(x.startDate)<=z);r.sort((x,y)=>o.ascending?Date.parse(x.startDate)-Date.parse(y.startDate):Date.parse(y.startDate)-Date.parse(x.startDate));
      __hkCalls.push(['read',o.dataType,r.length,o.limit]);return {samples:r.slice(0,o.limit||100)}}};
  const impl={Health,PFWorkout:{requestAuthorization:async()=>({granted:true}),saveWorkout:async()=>({id:'x'})},Haptics:{impact:async()=>{},vibrate:async()=>{}},LocalNotifications:{checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),schedule:async()=>{},cancel:async()=>{},getPending:async()=>({notifications:[]})},StatusBar:{setStyle:async()=>{},setOverlaysWebView:async()=>{}}};
  window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'ios',Plugins:{},nativePromise:(n,m,o)=>{const P=impl[n];if(!P||!P[m])return Promise.reject(new Error('ni '+n+'.'+m));return Promise.resolve().then(()=>P[m](o))},addListener:()=>'x',removeListener:()=>{}};
});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(900);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Alex Client');await p.click('[data-act=obSkip]')}
// Health on (old v2 so it re-asks), age 24, two logged sessions today/yesterday, one without heart rate data (a morning one)
const t=await p.evaluate(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')});
await p.evaluate(t=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));
  d.settings={...(d.settings||{type:'settings'}),health:{on:true,v:2,since:new Date(Date.now()-40*864e5).toISOString()}};d.profile={...(d.profile||{type:'profile'}),name:'Alex Client',hrAge:24};
  const y=new Date(Date.now()-864e5),yk=y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');
  const st=new Date(yk+'T18:00:00').getTime();d.wo_y={type:'workout',id:'wo_y',date:yk,name:'Upper A',kind:'gym',mins:60,started:st,ended:st+3600000,exercises:[{name:'Barbell bench press',sets:[{kg:60,reps:8,done:true}]}]};
  const s2=new Date(t+'T06:30:00').getTime();if(s2<Date.now())d.wo_t={type:'workout',id:'wo_t',date:t,name:'Morning legs',kind:'gym',mins:40,started:s2,ended:s2+2400000,exercises:[{name:'Back squat',sets:[{kg:80,reps:5,done:true}]}]};
  localStorage.setItem(k,JSON.stringify(d))}},t);
await p.reload();await p.waitForTimeout(2500);
const docs=async()=>p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.parse(localStorage.getItem(k))});
let d=await docs();const H=d.hkdays;
console.log('AUTH asks',JSON.stringify((await p.evaluate(()=>__hkCalls)).filter(c=>c[0]==='auth')),'| settings v',d.settings.health.v);
console.log('AGG calls',JSON.stringify((await p.evaluate(()=>__hkCalls)).filter(c=>c[0]==='agg').map(c=>c[1]+':'+c[2])));
console.log('hkdays days',H&&Object.keys(H.days).length,'full',H&&H.full,'v',H&&H.v);
const ks=Object.keys(H.days).sort();for(const k of ks.slice(-4))console.log(' ',k,JSON.stringify(H.days[k]));
const strainDays=ks.filter(k=>H.days[k].strain!=null);console.log('days with strain',strainDays.length,'(backfills over pulls) values',strainDays.map(k=>H.days[k].strain).join(','));
console.log('wo_y hr',JSON.stringify(d.wo_y.hr),'| wo_t',d.wo_t?JSON.stringify({hr:d.wo_t.hr,try:d.wo_t.hrTry}):'none');
await p.click('[data-tab=recover]');await p.waitForTimeout(400);
console.log('RECOVER:',(await p.locator('.stack').first().innerText()).replace(/\n+/g,' | ').slice(0,1400));
await p.screenshot({path:'tests/shots/watch-recover.png',fullPage:true});
await p.click('[data-tab=today]');await p.waitForTimeout(300);console.log('TODAY ROW:',(await p.locator('.duerow[data-tab=recover]').innerText().catch(()=>'none')).replace(/\n/g,' | '));
// consent switch in Settings > Apple Health
await p.click('[data-tab=you]');await p.click('[data-act=openSettings]');await p.click('[data-act=setPage][data-v=health]');await p.waitForTimeout(200);
console.log('HEALTH PAGE share label:',(await p.locator('label:has([data-act=shareWatch])').innerText()).replace(/\n/g,' | ').slice(0,200));
await p.screenshot({path:'tests/shots/watch-settings.png',fullPage:true});
// report without consent, then with
const report=async()=>{await p.goto('http://localhost:8767/');await p.waitForTimeout(800);await p.click('[data-tab=you]');await p.waitForTimeout(200);
  const btn=p.locator('[data-act=shareReport]');if(!(await btn.count())){await p.click('[data-act=ciView][data-v=me]').catch(()=>{});await p.waitForTimeout(200)}
  const [dl]=await Promise.all([p.waitForEvent('download'),p.click('[data-act=shareReport]')]);const f='tests/shots/'+dl.suggestedFilename();await dl.saveAs(f);return f};
let f=await report();let j=JSON.parse(fs.readFileSync(f,'utf8'));console.log('REPORT no consent: watch',j.watch,'recovery',j.recovery);
await p.click('[data-act=openSettings]');await p.click('[data-act=setPage][data-v=health]');await p.waitForTimeout(150);await p.check('[data-act=shareWatch]');await p.waitForTimeout(300);
console.log('profile.shareWatch',(await docs()).profile.shareWatch);
f=await report();j=JSON.parse(fs.readFileSync(f,'utf8'));console.log('REPORT consent: watch days',Object.keys(j.watch.days).length,'sessions',j.watch.sessions.length,'maxHR',j.watch.maxHR,'recovery pts',j.recovery&&j.recovery.length,'bytes',JSON.stringify(j.watch).length);
console.log(' last day',JSON.stringify(j.watch.days[Object.keys(j.watch.days).sort().pop()]),'| session0',JSON.stringify(j.watch.sessions[0]));
fs.copyFileSync(f,'tests/shots/watch-report.json');
console.log('errors client',errs);
// coach: import the report and open the weekly health check
const c2=await b.newContext({viewport:{width:390,height:844}});await c2.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await c2.route('**/fonts.googleapis.com/**',r=>r.abort());await c2.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const q=await c2.newPage();const e2=[];q.on('pageerror',e=>e2.push(e.message));await q.goto('http://localhost:8767/');await q.waitForTimeout(900);
if(await q.locator('[data-act=gateLocal]').count())await q.click('[data-act=gateLocal]');
if(await q.locator('[data-act=obSkip]').count()){await q.locator('[data-act=ob][data-k=name]').fill('Riz');await q.click('[data-act=obSkip]')}
await q.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));d.profile={...(d.profile||{type:'profile'}),name:'Riz',coach:true,role:'coach'};localStorage.setItem(k,JSON.stringify(d))}});
await q.reload();await q.waitForTimeout(800);
await q.setInputFiles('#reportIn',f);await q.waitForTimeout(600);
const cid=await q.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));return Object.keys(d).find(x=>d[x].type==='client')}});
console.log('client id',cid);
console.log('toast',await q.innerText('#toast').catch(()=>''));await q.click('[data-tab=you]').catch(()=>{});await q.waitForTimeout(200);console.log('acts',JSON.stringify(await q.evaluate(()=>[...new Set([...document.querySelectorAll('[data-act]')].map(e=>e.dataset.act+(e.dataset.v?':'+e.dataset.v:'')))].slice(0,40))));await q.click('[data-act=youView][data-v=clients]').catch(e=>console.log('noseg'));await q.waitForTimeout(300);
console.log('CLIENT LIST:',(await q.locator('.stack').first().innerText().catch(()=>'-')).replace(/\n+/g,' | ').slice(0,300));
await q.click(`[data-act=openClient][data-id="${cid}"]`);await q.waitForTimeout(300);
console.log('WATCH PANEL:',(await q.locator('section.panel:has(h2:text("Watch data"))').innerText()).replace(/\n+/g,' | '));
await q.click('[data-act=hcOpen]');await q.waitForTimeout(400);
console.log('HEALTH CHECK:',(await q.locator('.stack').first().innerText()).replace(/\n+/g,' | ').slice(0,2600));
await q.screenshot({path:'tests/shots/watch-coach.png',fullPage:true});
await q.fill('textarea[data-act=hcNote]','Agreed: bed by 11, extra rest day Thursday.');await q.locator('textarea[data-act=hcNote]').blur();await q.waitForTimeout(200);
await q.evaluate(()=>{window.__shared=null;navigator.share=undefined;navigator.clipboard.writeText=async x=>{window.__shared=x}});
await q.click('[data-act=hcShare]');await q.waitForTimeout(200);console.log('SHARE TEXT:\n'+await q.evaluate(()=>window.__shared));
await q.click('[data-act=hcWeek][data-v="-1"]');await q.waitForTimeout(200);console.log('PREV WEEK points:',(await q.locator('section.panel:has(h2:text("Talking points"))').innerText()).replace(/\n+/g,' | ').slice(0,600));
console.log('notes kept on prev week?',await q.locator('textarea[data-act=hcNote]').inputValue());
console.log('errors coach',e2);
await b.close();
