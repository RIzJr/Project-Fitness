// Fit check: every main screen at phone widths. Flags horizontal overflow (page wider than the screen),
// controls poking past the screen edge, and form controls that overlap each other.
import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const WIDTHS=(process.env.FIT_W||"320,375,390,430").split(",").map(Number);
const b=await chromium.launch();const errs=[];const issues=[];
const check=async(p,label)=>{await p.waitForTimeout(250);const r=await p.evaluate(()=>{const W=innerWidth,out=[];
  const vis=e=>{const s=getComputedStyle(e);if(s.display==="none"||s.visibility==="hidden"||+s.opacity===0)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
  const inScroller=e=>{for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){const s=getComputedStyle(a);if(/(auto|scroll)/.test(s.overflowX)&&a.scrollWidth>a.clientWidth+1)return true;if(s.overflowX==="hidden"||s.overflowX==="clip"){const ar=a.getBoundingClientRect();if(ar.right<=W+1&&ar.left>=-1)return true}}return false};
  const desc=e=>`${e.tagName.toLowerCase()}${e.id?"#"+e.id:""}${e.className&&typeof e.className==="string"?"."+e.className.trim().split(/\s+/).slice(0,2).join("."):""}${e.dataset&&e.dataset.act?"[act="+e.dataset.act+"]":""} "${(e.innerText||e.value||e.getAttribute("aria-label")||"").trim().slice(0,30)}"`;
  if(document.documentElement.scrollWidth>W+1)out.push("page is "+document.documentElement.scrollWidth+"px wide");
  const ctl=[...document.querySelectorAll("button,input,select,textarea,a,.chip,.qchip,label.field,h1,h2,.panel,.item")].filter(vis);
  for(const e of ctl){const r=e.getBoundingClientRect();if((r.right>W+1||r.left<-1)&&!inScroller(e))out.push("off screen: "+desc(e)+" ["+Math.round(r.left)+"→"+Math.round(r.right)+"]")}
  const top=document.querySelector("#viewerRoot > *")?document.getElementById("viewerRoot"):document.querySelector("#sheetRoot > *")?document.getElementById("sheetRoot"):document;
  const fc=[...top.querySelectorAll("input:not([type=checkbox]):not([type=radio]):not([type=range]):not([hidden]),select,textarea,button")].filter(vis).filter(e=>!e.classList.contains("pweye"));
  for(let i=0;i<fc.length;i++)for(let j=i+1;j<fc.length;j++){const a=fc[i],c=fc[j];if(a.contains(c)||c.contains(a))continue;
    const pin=e=>{for(let x=e;x&&x!==document.body;x=x.parentElement){const ps=getComputedStyle(x).position;if(ps==="fixed"||ps==="sticky")return x}return null};
    if(pin(a)!==pin(c))continue;
    const r1=a.getBoundingClientRect(),r2=c.getBoundingClientRect(),ox=Math.min(r1.right,r2.right)-Math.max(r1.left,r2.left),oy=Math.min(r1.bottom,r2.bottom)-Math.max(r1.top,r2.top);
    if(ox>3&&oy>3)out.push("overlap: "+desc(a)+" × "+desc(c))}
  return [...new Set(out)].slice(0,12)});
  for(const x of r)issues.push(label+": "+x);console.log((r.length?"ISSUE ":"ok    ")+label+(r.length?"\n        "+r.join("\n        "):""))};
for(const w of WIDTHS){const ctx=await b.newContext({viewport:{width:w,height:w<360?568:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
  await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(w+': '+e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(900);
  const T=`${w}px`;const click=async s=>{const ok=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return false;e.click();return true},s);if(ok)await p.waitForTimeout(220);return ok};
  await check(p,T+" sign in: email");
  await p.fill('#au_email','someone.with.a.long.email@example.com');await p.press('#au_email','Enter');await p.waitForTimeout(300);await check(p,T+" sign in: password");
  await click('[data-act=gateBack]');await click('[data-act=gateMode][data-v=up]');await check(p,T+" create account");
  await p.fill('#au_email','someone@example.com');await p.press('#au_email','Enter');await p.waitForTimeout(300);await check(p,T+" create account: password");
  await click('[data-act=gateBack]');await click('[data-act=gateLocal]');
  for(let i=0;i<6&&await p.locator('[data-act=obNext]').count();i++){if(i===0)await p.fill('#ob_name','Alexandra');await check(p,T+" setup step "+(i+1));
    if(i===1){await click('[data-act=obPick][data-k=goal]');await click('[data-act=obPick][data-k=activity]')}
    if(i===2){await p.fill('#ob_dob','1999-08-29');await p.selectOption('#ob_sex','m');await p.fill('#ob_height','180');await p.fill('#ob_weight','80');await check(p,T+" setup step 3 filled")}
    await click('[data-act=obNext]')}
  if(await p.locator('[data-act=obSkip]').count())await click('[data-act=obSkip]');
  await click('[data-tab=today]');await check(p,T+" Today");
  if(await click('[data-act=quickSheet]')){await check(p,T+" quick add");await click('[data-act=sheetClose]')}
  await click('[data-tab=train]');await check(p,T+" Train: workouts");
  await click('[data-act=trainView][data-v=cardio]');await check(p,T+" Train: cardio");
  await click('[data-act=cfStart]');await check(p,T+" cardio focus");await click('[data-act=cfEnd]');await check(p,T+" cardio summary");await click('[data-act=cfDiscard]');await click('[data-act=cfDiscard]');
  await click('[data-act=trainView][data-v=strength]');
  if(await click('[data-act=newWo]')){await check(p,T+" workout player");if(await click('[data-act=wpAddEx]'))await check(p,T+" add exercise");}
  await click('[data-tab=recover]');await check(p,T+" Recover");
  await click('[data-tab=you]');for(const v of ["checkin","goals","progress","body","clients"]){if(await click(`[data-act=youView][data-v=${v}]`))await check(p,T+" You: "+v)}
  await click('[data-act=openSettings]');await check(p,T+" Settings");
  for(const pg of ["profile","targets","reminders","rest","look","health","watch","cloud","pulse","data","users"]){if(await p.locator(`[data-act=setPage][data-v=${pg}]`).count()){await click(`[data-act=setPage][data-v=${pg}]`);await check(p,T+" Settings › "+pg);await click('[data-act=setPage][data-v=""]')}}
  await ctx.close()}
console.log("\n"+issues.length+" issues");console.log('errors',errs.length?errs:'none');await b.close();process.exitCode=issues.length||errs.length?1:0;
