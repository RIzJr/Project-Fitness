// The daily coaching call (push / as planned / easy / rest) for six simulated situations, plus the coach's view of a client.
import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];
const pad=n=>String(n).padStart(2,'0'),key=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
let seed=3;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
function days(over){const out={};for(let i=30;i>=0;i--){const d=key(new Date(Date.now()-i*864e5));const x={hrv:Math.round(64+(rnd()-0.5)*14),rhr:Math.round(54+rnd()*3),hrMin:50,resp:+(14+rnd()*0.4).toFixed(1),spo2:96+Math.round(rnd()*2),temp:+(34.4+rnd()*0.1).toFixed(2),sleep:+(7.6+rnd()*0.6).toFixed(1),strain:+(8+rnd()*4).toFixed(1),sl:{d:90,r:100,l:250,a:12,b:-60+Math.round(rnd()*20),w:420+Math.round(rnd()*20),st:1}};out[d]=over?over(i,x)||x:x}return out}
const S={
  'well recovered':days(),
  'HRV suppressed':days((i,x)=>{if(i<=6)x.hrv=Math.round(46+rnd()*5)}),
  'signs of illness':days((i,x)=>{if(i<=1){x.resp=16.4;x.temp=35.1;x.rhr=62}}),
  'short night':days((i,x)=>{if(i===0){x.sleep=5.4}}),
  'Garmin, no HRV':days((i,x)=>{delete x.hrv;delete x.resp;delete x.spo2;delete x.temp;delete x.rhr;x.hrMin=48+Math.round(rnd()*3)}),
  'load jumped':days((i,x)=>{if(i>=1&&i<=7)x.strain=17}),
};
const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1');localStorage.setItem('pf-hk:default','1')}catch(e){}
  window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'ios',Plugins:{},nativePromise:(n,m,o)=>Promise.resolve(n==='Health'?{samples:[]}:{}),addListener:()=>'x',removeListener:()=>{}}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(900);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
for(const [name,D] of Object.entries(S)){
  await p.evaluate(D=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));d.hkdays={type:'hkdays',days:D,full:'x',v:2};d.settings={...(d.settings||{type:'settings'}),health:{on:true,v:3}};d.profile={...(d.profile||{type:'profile'}),hrAge:24};localStorage.setItem(k,JSON.stringify(d))}},D);
  await p.reload();await p.waitForTimeout(700);await p.click('[data-tab=recover]');await p.waitForTimeout(300);
  const call=await p.locator('.coachcall').first().innerText().catch(()=>'NO CALL');
  console.log(`== ${name}: ${call.split('\n')[0]}\n   ${call.split('\n').slice(1,4).join(' | ').slice(0,330)}`);
  if(name==='HRV suppressed'){await p.locator('.coachcall details summary').first().click();await p.screenshot({path:'tests/shots/coachcall-hrvlow.png',fullPage:true});console.log('   why:',(await p.locator('.coachcall details').first().innerText()).replace(/\n+/g,' | ').slice(0,300))}
  if(name==='well recovered'){await p.click('[data-tab=today]');await p.waitForTimeout(200);console.log('   Today row:',(await p.locator('.duerow[data-tab=recover]').innerText().catch(()=>'-')).replace(/\n/g,' | '))}
}
// coach: a client sharing the HRV-suppressed data
const c2=await b.newContext({viewport:{width:390,height:844}});await c2.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await c2.route('**/fonts.googleapis.com/**',r=>r.abort());await c2.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const q=await c2.newPage();q.on('pageerror',e=>errs.push('coach: '+e.message));await q.goto('http://localhost:8767/');await q.waitForTimeout(900);
if(await q.locator('[data-act=gateLocal]').count())await q.click('[data-act=gateLocal]');
if(await q.locator('[data-act=obSkip]').count()){await q.locator('[data-act=ob][data-k=name]').fill('Riz');await q.click('[data-act=obSkip]')}
const W=S['HRV suppressed'];for(const d of Object.keys(W))W[d].rec=60;
await q.evaluate(W=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));d.profile={...(d.profile||{type:'profile'}),name:'Riz',coach:true};d.client_x={type:'client',name:'Alex Client',date:'2026-11-01',weeks:[],watch:{days:W,sessions:[],maxHR:191},cloud:true,shareId:'x'};localStorage.setItem(k,JSON.stringify(d))}},W);
await q.reload();await q.waitForTimeout(800);await q.click('[data-tab=you]');await q.click('[data-act=youView][data-v=clients]').catch(()=>{});await q.waitForTimeout(200);
await q.click('[data-act=openClient][data-id=client_x]');await q.waitForTimeout(300);
console.log('== COACH client page:',(await q.locator('section.panel:has(h2:text("Watch data")) .coachcall').innerText()).split('\n').slice(0,3).join(' | ').slice(0,300));
await q.click('[data-act=hcOpen]');await q.waitForTimeout(300);await q.click('[data-act=hcWeek][data-v="1"]').catch(()=>{});await q.waitForTimeout(200);
console.log('== COACH daily calls:',(await q.locator('section.panel:has(h2:text("Daily calls"))').innerText()).replace(/\n+/g,' | ').slice(0,260));
console.log('== COACH talking points:',(await q.locator('section.panel:has(h2:text("Talking points"))').innerText()).replace(/\n+/g,' | ').slice(0,700));
await q.screenshot({path:'tests/shots/coachcall-coach.png',fullPage:true});
console.log('errors',errs);await b.close();
