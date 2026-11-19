// Cardio focus mode on the iPhone app with a (fake) Bluetooth strap: live bpm, average, zone coaching, saved avg/max/zones.
import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:375,height:812}});
await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}
  const calls=window.__c=[];const L={};let iv=null,bpm=96;
  // nearby devices: the plugin's own scan filter (services) is honoured like on a real iPhone
  const NEAR=[{device:{deviceId:'DEV-1'},localName:'Venu 4',rssi:-58,uuids:['0000180d-0000-1000-8000-00805f9b34fb']},{device:{deviceId:'STRAP'},localName:'Polar H10 1234',rssi:-80,uuids:['0000180d-0000-1000-8000-00805f9b34fb']},
    {device:{deviceId:'PODS',name:"Riz's AirPods"},rssi:-50,uuids:[]},{device:{deviceId:'X1'},rssi:-70,uuids:[]},{device:{deviceId:'X2'},rssi:-90,uuids:[]}];
  let scanT=[];
  const BluetoothLe={initialize:async()=>{calls.push('init')},requestDevice:async()=>{calls.push('PICKER OPENED');return {deviceId:'BAD'}},
    requestLEScan:async o=>{calls.push('scan:'+JSON.stringify(o.services||'all'));const want=o.services&&o.services.length;NEAR.filter(r=>!want||r.uuids.some(u=>/180d/.test(u))).forEach((r,i)=>scanT.push(setTimeout(()=>(L.onScanResult||[]).forEach(cb=>cb(r)),150+i*120)))},
    stopLEScan:async()=>{calls.push('stopScan');scanT.forEach(clearTimeout);scanT=[]},
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
const ok=[];const chk=(c,m)=>{ok.push(c);console.log((c?'ok   ':'FAIL ')+m)};
const docs=()=>p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.parse(localStorage.getItem(k))});
await p.click('[data-tab=train]');await p.click('[data-act=trainView][data-v=cardio]');await p.waitForTimeout(200);
await p.click('.panel [data-act=cAct][data-v="Run"]');await p.click('[data-act=cPlace][data-v="Treadmill"]');await p.click('[data-act=cGoal][data-v="3"]');
if(await p.locator('#hrAgeIn').count()){await p.fill('#hrAgeIn','24');await p.click('[data-act=hrAgeSave]');await p.waitForTimeout(150)}
await p.click('[data-act=cfStart]');await p.waitForTimeout(300);
await p.click('.cfocus [data-act=hrOpen]');await p.waitForTimeout(150);await p.click('[data-act=hrGo]');await p.waitForTimeout(900);
await p.click('[data-act=hrPick][data-id=STRAP]');await p.waitForTimeout(400);
chk(await p.locator('.cfsheet').count()===1,'monitor sheet inside focus mode');await p.click('[data-act=hrClose]');
await p.waitForTimeout(7000);const live=await p.locator('.cfocus .hrlive').innerText(),avg=await p.locator('#cfAvg').innerText(),coach=await p.locator('#cfCoach').innerText();
console.log('live',live,'avg',avg,'coach:',coach,'src:',await p.locator('#cfSrc').innerText());
chk(+live>96&&+avg>96,'live and average heart rate update');chk(coach.length>0,'zone coaching line');
await p.screenshot({path:'tests/shots/tcardio-native.png'});
await p.click('[data-act=cfEnd]');await p.waitForTimeout(300);chk(await p.locator('#cf_hr').count()===0,'no manual HR box when recorded');
await p.screenshot({path:'tests/shots/tcardio-native-sum.png'});
await p.click('[data-act=cfSave]');await p.waitForTimeout(400);
const d=await docs(),c=Object.values(d).find(x=>x.type==='cardio');console.log('saved',JSON.stringify({...c,hrLog:(c.hrLog||[]).length}));
chk(c&&c.hr>0&&c.hrMax>=c.hr&&c.hrZ&&c.hrSrc==='ble'&&c.place==='Treadmill'&&c.started&&c.ended,'saved avg, max, zones, source');
chk(!errs.length,'no page errors '+JSON.stringify(errs));
await b.close();process.exitCode=ok.every(Boolean)?0:1;
