import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));d.profile={...(d.profile||{}),type:'profile',name:'Riz',coach:true};
  const t=new Date(),f=i=>{const x=new Date(t-i*864e5);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
  d.client_x={type:'client',name:'Sam Patel',date:f(0),clientUid:'u1',received:new Date().toISOString(),weeks:[],recovery:[6,5,4,3,2,1,0].map(i=>({week:f(i),score:i<3?38:72,sleep:6.1,rhr:64,hrv:null}))};localStorage.setItem(k,JSON.stringify(d))}});
await p.reload();await p.waitForTimeout(800);await p.click('[data-tab=you]');await p.click('[data-act=youView][data-v=clients]');await p.waitForTimeout(200);
console.log('LIST:',(await p.locator('.clientrow').first().innerText()).replace(/\n/g,' | '));
await p.click('[data-act=openClient][data-id=client_x]');await p.waitForTimeout(200);
console.log('PANEL:',(await p.locator('section.panel:has(h2:text-is("Recovery"))').innerText().catch(()=>'-')).replace(/\n/g,' | ').slice(-200));
await p.locator('section.panel:has(h2:text-is("Recovery"))').screenshot({path:'tests/shots/coach-recovery.png'}).catch(()=>{});
console.log('errors',errs);await b.close();
