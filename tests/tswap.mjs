import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(900);
if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
const t=await p.evaluate(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')});
await p.evaluate(t=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));
  d.mplan_x1={type:'mplan',pid:'mx1',date:t,name:'Upper A',kind:'gym',coachName:'',exercises:[{name:'Barbell bench press',rx:{sets:3,reps:'8',kg:60},sets:[{kg:60,reps:8},{kg:60,reps:8},{kg:60,reps:8}]},{name:'Barbell row',sets:[{kg:50,reps:10},{kg:50,reps:10}]},{name:'Plank',sets:[{secs:45},{secs:45}]}]};
  localStorage.setItem(k,JSON.stringify(d))}},t);
await p.reload();await p.waitForTimeout(900);
const txt=async s=>(await p.locator(s).first().innerText().catch(()=>'-')).replace(/\n/g,' | ');
await p.click('[data-act=planStart]');await p.waitForTimeout(300);await p.click('.player [data-act=wpGo]').catch(()=>{});await p.waitForTimeout(200);
console.log('EX:',await txt('.player h1'));
await p.click('.player [data-act=wpRename]');await p.waitForTimeout(200);
console.log('SWAPS:',(await txt('.picker')).slice(0,700));await p.screenshot({path:'tests/shots/swap-list.png'});
await p.click('[data-act=wpVar][data-v="Dumbbell bench press"]');await p.waitForTimeout(200);console.log('TOAST:',await p.innerText('#toast'));
console.log('AFTER SWAP:',await txt('.player h1'),'| label:',await txt('.player .wp-change'),'| kg',await p.locator('.player .wp-num[data-f=kg]').inputValue(),'reps',await p.locator('.player .wp-num[data-f=reps]').inputValue());
await p.screenshot({path:'tests/shots/swap-after.png'});
// do a set, then swap back shows planned option
const clearRest=async()=>{for(let i=0;i<4&&await p.locator('.player [data-act=restSkip]').count();i++){await p.waitForTimeout(1100);await p.evaluate(()=>{document.querySelectorAll('.player [data-act=restSkip]').forEach(e=>e.click())});await p.waitForTimeout(200)}};
const done=async()=>{if(!(await p.locator('.player [data-act=wpDone]').count())){console.log('NO DONE BTN; acts:',JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('.player [data-act]')].map(e=>e.dataset.act+(e.dataset.v?':'+e.dataset.v:'')))),(await txt('.player')).slice(0,200));return}await p.click('.player [data-act=wpDone]');await p.waitForTimeout(1050);await p.evaluate(()=>{const e=document.querySelector('.player [data-act=restSkip]');e&&e.click()});await p.waitForTimeout(150)};
await done();console.log('AFTER1:',JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('.player [data-act]')].map(e=>e.dataset.act))));await done();await done();
await clearRest();console.log('DONE SCREEN:',(await txt('.player')).slice(0,160));await p.click('.player .wp-big');await p.waitForTimeout(250);
await clearRest();console.log('NOW:',await txt('.player h1'));await p.locator('.player [data-act=wpGo]').last().click();await p.waitForTimeout(250);
console.log('NOW2:',await txt('.player h1'));await p.click('.player [data-act=wpRename]');await p.waitForTimeout(150);console.log('PLANK SWAPS:',(await txt('.picker')).slice(0,300));
await p.click('[data-act=wpVar][data-v="Dead bug"]');await p.waitForTimeout(150);console.log('DEAD BUG reps:',await p.locator('.player .wp-num[data-f=reps]').inputValue().catch(()=>'-'),'secs field:',await p.locator('.player .wp-num[data-f=secs]').count());
await p.click('.player [data-act=wpEnd]');await p.click('.player .wp-big').catch(()=>{});await p.waitForTimeout(150);await p.click('.player [data-act=saveWo]');await p.waitForTimeout(800);
const d=await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.parse(localStorage.getItem(k))});
const w=Object.values(d).find(x=>x.type==='workout');console.log('SAVED:',JSON.stringify(w.exercises.map(e=>[e.name,e.swapFrom||'',e.sets.map(s=>s.kg+'x'+(s.reps||s.secs)).join(','),!!e.planSets])),'planId',w.planId,'| swaps memory',JSON.stringify(d.settings.swaps));
// next time: "Your usual" first (blank session with bench)
await p.click('[data-tab=train]');await p.click('[data-act=newWo][data-v=gym]');await p.waitForTimeout(200);await p.click('.player [data-act=wpGo]');await p.waitForTimeout(150);
await p.fill('#wpPickQ','Barbell bench press');await p.press('#wpPickQ','Enter');await p.waitForTimeout(150);await p.click('.player [data-act=wpRename]');await p.waitForTimeout(150);
console.log('NEXT TIME FIRST:',(await txt('.picker .swaprow')).slice(0,160));await p.screenshot({path:'tests/shots/swap-list2.png'});
// settings: rest sound + reminder
await p.click('.player [data-act=wpRenameNo]');await p.click('.player [data-act=wpEnd]');await p.waitForTimeout(150);await p.click('.player [data-act=wpDiscard]').catch(()=>{});await p.click('.player [data-act=wpDiscard]').catch(()=>{});await p.waitForTimeout(200);
await p.evaluate(()=>{});await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
await p.click('[data-tab=you]');await p.click('[data-act=openSettings]');await p.click('[data-act=setPage][data-v=rest]');await p.waitForTimeout(150);console.log('REST PAGE:',await txt('section.panel:has(h2:text("When rest ends"))'));
await p.click('[data-act=restTest]');await p.waitForTimeout(300);
await p.click('.back');await p.click('[data-act=setPage][data-v=reminders]');await p.waitForTimeout(150);await p.check('[data-act=remOn][data-k=gym]');await p.waitForTimeout(200);
await p.click('[data-act=gymTime][data-v="15:00"]');await p.waitForTimeout(150);console.log('REMINDER:',await txt('section.panel:has(h2:text("Remind me"))'));
await p.locator('section.panel:has(h2:text("Remind me"))').screenshot({path:'tests/shots/gym-reminder.png'});
const st=await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:'))return JSON.parse(localStorage.getItem(k)).settings.reminders});console.log('SAVED REM:',JSON.stringify(st));
console.log('errors',errs);await b.close();
