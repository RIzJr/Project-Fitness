import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844},acceptDownloads:true});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
// assign Riz programme starting today so there's a planned session
await p.click('[data-tab=train]');await p.click('[data-act=progOpenTrain]');await p.click('[data-act=libAdd][data-k=strength-size-10k]');await p.waitForTimeout(150);
await p.click('[data-act=assignNew]');await p.selectOption('[data-act=asF][data-k=clientUid]','me');await p.fill('[data-act=asF][data-k=start]','2026-10-26');await p.dispatchEvent('[data-act=asF][data-k=start]','change');
const sel=p.locator('[data-act=asDay], select[data-act=asF][data-k^=day]');
await p.click('[data-act=assignGo]');await p.waitForTimeout(300);
const hasToday=await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return Object.values(JSON.parse(localStorage.getItem(k))).filter(d=>d.type==='mplan'&&d.date==='2026-10-30').map(d=>d.name)});console.log('planned today:',hasToday);
await p.reload();await p.waitForTimeout(3500);
console.log('popup shown:',await p.locator('.sheet.rdpop').count());await p.locator('.sheet.rdpop').screenshot({path:'tests/shots/rdpop.png'});
await p.fill('#rd_sleepH','4.5');for(const [k,n] of [['sleepQ',1],['energy',1],['soreness',5],['stress',5],['mood',2]])await p.click(`.sheet.rdpop [data-act=rdS][data-k=${k}][data-n="${n}"]`);
await p.click('.sheet.rdpop [data-act=rdPain][data-v=no]');await p.click('.sheet.rdpop [data-act=rdSave]');await p.waitForTimeout(300);
console.log('result:',(await p.locator('.sheet.rdpop').innerText()).replace(/\n/g,' | ').slice(0,160));await p.click('.sheet.rdpop [data-act=rdPopClose] >> nth=-1');
await p.reload();await p.waitForTimeout(3500);console.log('popup again after reload:',await p.locator('.sheet.rdpop').count());
await p.click('[data-tab=today]');console.log('today card:',(await p.locator('.hero').innerText()).replace(/\n/g,' | ').slice(0,200));
await p.click('.startpill[data-act=planStart]');await p.waitForTimeout(200);console.log('light screen:',(await p.locator('.player .wp-body').innerText()).replace(/\n/g,' | ').slice(0,200));
const before=await p.locator('.player').count();await p.click('.player [data-act=wpLight]');await p.waitForTimeout(200);
await p.click('.player [data-act=wpGo] >> nth=-1').catch(()=>{});await p.waitForTimeout(200);
console.log('exercise screen:',(await p.locator('.player .coachrx').first().innerText().catch(()=>'-')).replace(/\n/g,' | ').slice(0,200),'| set chips',await p.locator('.player .wp-chip:not(.add)').count());
await p.click('.player [data-act=wpEnd]');await p.click('.player [data-act=wpDiscard]');await p.click('.player [data-act=wpDiscard]').catch(()=>{});await p.waitForTimeout(200);
// progress card
await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));d.w1={type:'workout',date:'2026-10-27',name:'Upper',kind:'gym',exercises:[{name:'Bench press',sets:[{kg:90,reps:8,done:true},{kg:90,reps:7,done:true}]}],prs:[{name:'Bench press',txt:'90 kg × 8'}]};d.b1={type:'body',date:'2026-10-20',weight:80.4};d.b2={type:'body',date:'2026-10-29',weight:79.8};localStorage.setItem(k,JSON.stringify(d))}});
await p.reload();await p.waitForTimeout(3000);await p.click('[data-tab=you]');await p.click('[data-act=youView][data-v=progress]');await p.waitForTimeout(400);
console.log('card img:',await p.locator('#weekCardImg').evaluate(i=>i.src.slice(0,30)+'… '+i.src.length));
const src=await p.locator('#weekCardImg').evaluate(i=>i.src);fs.writeFileSync('tests/shots/weekcard.png',Buffer.from(src.split(',')[1],'base64'));
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:5000}).catch(()=>null),p.click('[data-act=cardSave]')]);console.log('download:',dl?dl.suggestedFilename():'none');
// theme toggle
await p.click('[data-tab=today]');await p.click('[data-act=themeToggle]');console.log('theme now:',await p.evaluate(()=>document.documentElement.dataset.theme));await p.click('[data-act=themeToggle]');console.log('theme back:',await p.evaluate(()=>document.documentElement.dataset.theme));
console.log('errors',errs);await b.close();
