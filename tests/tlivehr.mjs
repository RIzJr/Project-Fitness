import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:375,height:812}});
await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}
  const calls=window.__c=[];const L={};let iv=null,bpm=96;
  const BluetoothLe={initialize:async()=>{calls.push('init')},requestDevice:async o=>{calls.push('request:'+JSON.stringify(o.services));return {deviceId:'DEV-'+(calls.filter(c=>c.startsWith('request')).length),name:'Venu 3'}},
    getDevices:async o=>{calls.push('getDevices:'+o.deviceIds[0]);return {devices:[]}},connect:async o=>{calls.push('connect:'+o.deviceId)},disconnect:async o=>{calls.push('disconnect');clearInterval(iv)},stopNotifications:async()=>{},
    startNotifications:async o=>{calls.push('notify:'+o.deviceId);clearInterval(iv);iv=setInterval(()=>{bpm=Math.min(175,bpm+3);const h='00'+bpm.toString(16).padStart(2,'0');const k='notification|'+o.deviceId+'|180d|2a37';(L[k]||[]).forEach(cb=>cb({value:h}))},250)}};
  const noop=new Proxy({},{get:(t,k)=>k==='then'?undefined:async()=>({display:'granted'})});
  const impl={BluetoothLe,Haptics:{impact:async()=>{},vibrate:async()=>{}},LocalNotifications:{checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),schedule:async()=>{},cancel:async()=>{},getPending:async()=>({notifications:[]})},StatusBar:{setStyle:async()=>{},setOverlaysWebView:async()=>{}}};
  window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'ios',Plugins:{},nativePromise:(n,m,o)=>{const P=impl[n];if(!P||!P[m])return Promise.reject(new Error(n+'.'+m+' not implemented'));return Promise.resolve().then(()=>P[m](o))},
    addListener:(n,ev,cb)=>{(L[ev]=L[ev]||[]).push(cb);return ev},removeListener:(n,id,ev,cb)=>{L[ev]=(L[ev]||[]).filter(x=>x!==cb)}};
});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(900);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
const docs=()=>p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.parse(localStorage.getItem(k))});
const txt=async s=>(await p.locator(s).first().innerText().catch(()=>'-')).replace(/\n/g,' | ');
const run=async(label)=>{await p.click('.player [data-act=wpGo]');await p.waitForTimeout(150);
  if(await p.locator('#wpPickQ').count()){await p.fill('#wpPickQ','Kettlebell swing');await p.press('#wpPickQ','Enter');await p.waitForTimeout(150)}
  await p.click('.player [data-act=hrOpen]');await p.waitForTimeout(150);console.log(label,'SHEET:',await txt('.hrsheet'));
  if(await p.locator('#hrAgeIn').count()){await p.fill('#hrAgeIn',label==='ME'?'24':'45');await p.click('[data-act=hrAgeSave]');await p.waitForTimeout(150);console.log(label,'ZONES:',await txt('.hrzbar'))}
  await p.click('[data-act=hrGo]');await p.waitForTimeout(1500);console.log(label,'CONNECTED:',await txt('.hrsheet'));await p.screenshot({path:`tests/shots/hr-${label}.png`});
  await p.click('[data-act=hrClose]');await p.waitForTimeout(4000);console.log(label,'HEADER CHIP:',await txt('.wp-hr'));
  await p.locator('.player .wp-chip.add').first().click().catch(()=>{});await p.waitForTimeout(150);const k=p.locator('.player .wp-num[data-f=kg]');await k.click();await k.fill('');await p.keyboard.type('20');await p.keyboard.press('Enter');const r=p.locator('.player .wp-num[data-f=reps]');await r.click();await r.fill('');await p.keyboard.type('15');await p.keyboard.press('Enter');
  await p.click('.player [data-act=wpDone]');await p.waitForTimeout(1200);console.log(label,'REST LINE:',await txt('.player span:has(#hrDown)'));await p.screenshot({path:`tests/shots/hr-rest-${label}.png`});
  await p.waitForTimeout(12000);await p.evaluate(()=>{const e=document.querySelector('.player [data-act=restSkip]');e&&e.click()});await p.waitForTimeout(200);
  await p.click('.player [data-act=wpEnd]');await p.click('.player .wp-big').catch(()=>{});await p.waitForTimeout(150);await p.click('.player [data-act=saveWo]');await p.waitForTimeout(800)};
await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.waitForTimeout(200);await run('ME');
let d=await docs();const w=Object.values(d).find(x=>x.type==='workout');console.log('ME SAVED hr:',JSON.stringify(w.hr),'log points',w.hrLog&&w.hrLog.length);
console.log('ME SUMMARY HR PANEL:',await txt('section.panel:has(h2:text-is("Heart rate"))'));await p.screenshot({path:'tests/shots/hr-summary.png',fullPage:true});
// client session: coach mode + local client
await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));d.profile={...d.profile,coach:true};d.client_ljo={type:'client',local:true,name:'Jo Bloggs',date:'2026-11-05',weeks:[],goals:[],measures:[]};localStorage.setItem(k,JSON.stringify(d))}});
await p.reload();await p.waitForTimeout(900);await p.click('[data-tab=you]');await p.click('[data-act=youView][data-v=clients]');await p.click('[data-act=openClient][data-id=client_ljo]');await p.click('[data-act=tcOpen][data-id=client_ljo]');await p.click('[data-act=tcGo][data-k=blank][data-v=gym]');await p.waitForTimeout(200);
await run('CLIENT');
d=await docs();const cs=Object.values(d).find(x=>x.type==='csession');console.log('CLIENT SAVED hr:',JSON.stringify(cs.hr),'| client age',d.client_ljo.age,'| saved devices',await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('pf-hrdev')).join(',')));
console.log('SESSIONS PANEL:',await txt('section.panel:has(h2:text("Sessions with you")) .item'));
console.log('CALLS:',JSON.stringify(await p.evaluate(()=>window.__c)));console.log('errors',errs);await b.close();
