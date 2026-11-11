// Bedtime reminder: advised times from simulated sleep data, the four goals, iPhone notifications booked, and the plan saved for the server.
import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];
const pad=n=>String(n).padStart(2,'0'),key=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const days={};for(let i=21;i>=0;i--){const dt=new Date(Date.now()-i*864e5),d=key(dt),we=dt.getDay()===0||dt.getDay()===6;days[d]={sleep:7.0,hrMin:50,hrv:62,strain:9,sl:{d:80,r:90,l:250,a:20,b:we?-10:-35,w:we?510:430,st:1}}}
const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1');localStorage.setItem('pf-hk:default','1')}catch(e){}window.__sched=[];
  const LN={checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),schedule:async o=>{window.__sched.push(...o.notifications)},cancel:async()=>{},getPending:async()=>({notifications:[]})};
  window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'ios',Plugins:{},nativePromise:(n,m,o)=>n==='LocalNotifications'&&LN[m]?LN[m](o):Promise.resolve(n==='Health'?{samples:[]}:{}),addListener:()=>'x',removeListener:()=>{}}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(900);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.evaluate(D=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));d.hkdays={type:'hkdays',days:D,full:'x',v:2};d.settings={...(d.settings||{type:'settings'}),health:{on:true,v:3}};d.profile={...(d.profile||{type:'profile'}),hrAge:24};localStorage.setItem(k,JSON.stringify(d))}},days);
await p.reload();await p.waitForTimeout(900);
const T=async s=>(await p.locator(s).first().innerText().catch(()=>'-')).replace(/\n+/g,' | ');
const docs=()=>p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.parse(localStorage.getItem(k))});
await p.click('[data-tab=recover]');await p.waitForTimeout(300);console.log('RECOVER line:',(await T('section.panel:has(h2:text("Sleep")) .spread:has([data-v=reminders])')));
await p.click('[data-tab=you]');await p.click('[data-act=openSettings]');await p.click('[data-act=setPage][data-v=reminders]');await p.waitForTimeout(200);
await p.check('[data-act=remOn][data-k=sleep]');await p.waitForTimeout(500);
console.log('KEEP:',(await T('.sleepnow')).slice(0,420));
await p.screenshot({path:'tests/shots/sleep-keep.png',fullPage:true});
let d=await docs();console.log('plan saved for server:',JSON.stringify(Object.entries(d.settings.reminders.sleep.plan).slice(0,3)));
const booked=()=>p.evaluate(()=>window.__sched.filter(n=>n.id>=1400&&n.id<1407).map(n=>n.id+' '+new Date(n.schedule.at).toString().slice(0,21)+' — '+n.body.slice(0,90)));
console.log('iPhone booked:',JSON.stringify((await booked()).slice(-7),null,0).slice(0,700));
await p.click('[data-act=slGoal][data-v=improve]');await p.waitForTimeout(300);console.log('IMPROVE:',(await T('.sleepnow')).slice(0,400));
await p.click('[data-act=slGoal][data-v=travel]');await p.waitForTimeout(200);
const in3=key(new Date(Date.now()+3*864e5));await p.fill('[data-act=slTrDate]',in3);await p.locator('[data-act=slTrDate]').dispatchEvent('change');await p.selectOption('[data-act=slTrDiff]','5');await p.waitForTimeout(300);
console.log('TRAVEL +5 leaving',in3,':',(await T('.sleepnow')).slice(0,330));
await p.locator('.stack details summary').last().click();console.log('  next nights:',(await T('details:has(summary:text("Next 7 nights"))')).slice(0,400));
await p.click('[data-act=slGoal][data-v=early]');await p.waitForTimeout(200);const tm=key(new Date(Date.now()+864e5));
await p.fill('[data-act=slEarlyDate]',tm);await p.locator('[data-act=slEarlyDate]').dispatchEvent('change');await p.fill('[data-act=slEarlyWake]','05:15');await p.locator('[data-act=slEarlyWake]').dispatchEvent('change');await p.waitForTimeout(300);
console.log('EARLY 05:15 tomorrow:',(await T('.sleepnow')).slice(0,300));
await p.click('[data-act=slGoal][data-v=keep]');await p.fill('[data-act=slWake]','06:30');await p.locator('[data-act=slWake]').dispatchEvent('change');await p.waitForTimeout(300);
console.log('SET WAKE 06:30:',(await T('.sleepnow')).slice(0,200));
console.log('errors',errs);await b.close();
