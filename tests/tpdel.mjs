import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
const mock=fs.readFileSync('tests/mocksb.js','utf8');
const b=await chromium.launch();const errs=[];
async function device(seed){const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
  if(seed)await ctx.addInitScript(db=>{if(!localStorage.getItem('MOCKDB'))localStorage.setItem('MOCKDB',db)},seed);
  await ctx.route('**/supabase-js@2.116.0/**',r=>r.fulfill({body:mock,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'}}));
  await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(700);return p}
const signup=async(p,email,name)=>{await p.click('[data-act=gateMode][data-v=up]');await p.fill('#au_email',email);await p.click('.gate-next');await p.fill('#au_pw','password1');await p.check('#au_consent');await p.click('.gate-next');await p.waitForTimeout(1800);
  if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill(name);await p.click('[data-act=obSkip]')}await p.waitForTimeout(300)};
const settings=async p=>{await p.click('[data-tab=you]');await p.click('[data-act=openSettings], [data-tab=settings]').catch(()=>{})};
const sync=async(from,to)=>{const db=await from.evaluate(()=>localStorage.getItem('MOCKDB'));await to.evaluate(d=>localStorage.setItem('MOCKDB',d),db);await to.reload();await to.waitForTimeout(2500)};
const A=await device();await signup(A,'coach@x.com','Riz');await settings(A);
await A.click('[data-act=setPage][data-v=profile]');await A.check('[data-act=coachMode]');await A.click('.back');await A.click('[data-act=setPage][data-v=cloud]');await A.waitForTimeout(600);
await A.click('[data-act=newCode]');await A.waitForTimeout(500);const code=await A.textContent('.code');
const B=await device(await A.evaluate(()=>localStorage.getItem('MOCKDB')));await signup(B,'siham@x.com','Siham');await settings(B);
await B.click('[data-act=setPage][data-v=cloud]');await B.fill('#lk_code',code);await B.click('#linkForm button');await B.waitForTimeout(1500);
await sync(B,A);await A.click('[data-tab=you]');await A.click('[data-act=youView][data-v=clients]').catch(()=>{});await A.waitForTimeout(1500);
await A.click('[data-act=progOpen]');await A.waitForTimeout(100);
const [fc]=await Promise.all([A.waitForEvent('filechooser'),A.click('[data-act=progImport]')]);await fc.setFiles('/mnt/user-data/outputs/siham-upper-lower-programme.json');await A.waitForTimeout(400);
console.log('toast:',await A.innerText('#toast'));
console.log('editor days:',(await A.locator('[data-act=pgDay]').allInnerTexts()).join(', '),'| preview:',await A.locator('text=progresses').innerText().catch(()=>'-'));
await A.screenshot({path:'tests/shots/prog-editor.png',fullPage:true});
await A.click('[data-act=pgSave]');await A.waitForTimeout(200);
await A.click('[data-act=assignNew]');await A.waitForTimeout(150);await A.selectOption('[data-act=asF][data-k=clientUid]',{label:'Siham'});await A.waitForTimeout(150);
console.log('assign panel:',(await A.locator('section.panel:has(h2:text-matches("Assign"))').innerText()).replace(/\n/g,' | ').slice(0,400));
await A.screenshot({path:'tests/shots/prog-assign.png',fullPage:true});
await A.click('[data-act=assignGo]');await A.waitForTimeout(1200);console.log('toast:',await A.innerText('#toast'));
const db=JSON.parse(await A.evaluate(()=>localStorage.getItem('MOCKDB')));console.log('plans rows on server:',db.plans.length,'| wk1 upper A:',JSON.stringify(db.plans.map(r=>r.data).filter(d=>d.week===1)[0].exercises[0].rx),'| wk6:',JSON.stringify(db.plans.map(r=>r.data).filter(d=>d.week===6)[0].exercises[0].rx),'| dates',db.plans.map(r=>r.data.date).sort().slice(0,4).join(','));
await sync(A,B);await B.click('[data-tab=train]');await B.waitForTimeout(300);
const before=(await B.locator('section.panel:has(h2:text("Planned for you"))').count());console.log('Siham sees planned panel before:',before);
// coach: view her programme, check sync

console.log('assignee row:',(await A.locator('.assignees').first().innerText()).replace(/\n/g,' | '));
await A.click('.assignees [data-act=planView]');await A.waitForTimeout(200);
console.log('viewer head:',(await A.locator('section.panel').first().innerText()).replace(/\n/g,' | ').slice(0,250));
console.log('week panels:',await A.locator('section.panel .label').allInnerTexts().then(x=>x.length));
await A.click('[data-act=planCheck]');await A.waitForTimeout(800);console.log('check:',(await A.locator('section.panel').first().innerText()).split('\n').slice(-2).join(' | '));
// simulate drift: delete one row on server, add a stale one
await A.evaluate(()=>{const db=JSON.parse(localStorage.getItem('MOCKDB'));const r=db.plans.shift();db.plans.push({...r,id:'stale1'});localStorage.setItem('MOCKDB',JSON.stringify(db))});
await A.reload();await A.waitForTimeout(2000);await A.click('[data-tab=you]');await A.click('[data-act=youView][data-v=clients]').catch(()=>{});await A.waitForTimeout(300);if(await A.locator('[data-act=progOpen]').count())await A.click('[data-act=progOpen]');await A.waitForTimeout(200);await A.click('.assignees [data-act=planView]');await A.click('[data-act=planCheck]');await A.waitForTimeout(800);
console.log('drift:',(await A.locator('section.panel').first().innerText()).replace(/\n/g,' | ').slice(-200));
await A.screenshot({path:'tests/shots/viewer.png',fullPage:false});
await A.click('[data-act=planFix]');await A.waitForTimeout(1500);console.log('after fix:',(await A.locator('section.panel').first().innerText()).split('\n').slice(-2).join(' | '));
await A.click('[data-act=planViewClose]');await A.waitForTimeout(200);
// delete the programme
await A.click('[data-act=progDel]');console.log('confirm text:',await A.locator('[data-act=progDel]').innerText());await A.click('[data-act=progDel]');await A.waitForTimeout(1500);
console.log('toast:',await A.innerText('#toast'));
const db2=JSON.parse(await A.evaluate(()=>localStorage.getItem('MOCKDB')));console.log('plan rows left on server:',db2.plans.filter(r=>!r.data.type||r.data.type==='plan').length,'| local cplans:',await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){return Object.values(JSON.parse(localStorage.getItem(k))).filter(d=>d.type==='cplan').length}}));
await sync(A,B);await B.click('[data-tab=train]');await B.waitForTimeout(300);console.log('Siham planned panel after:',await B.locator('section.panel:has(h2:text("Planned for you"))').count());
console.log('errors',errs);await b.close();
