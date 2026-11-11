import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];
for(const [w,h] of [[375,667],[390,844],[430,932]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},isMobile:true,hasTouch:true,deviceScaleFactor:3});
 await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}
   window.Capacitor={isNativePlatform:()=>true,Plugins:{LocalNotifications:{checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),schedule:async()=>{},cancel:async()=>{},addListener:()=>{}},Haptics:{vibrate:()=>{},impact:x=>{(window.__imp=window.__imp||[]).push(x.style)}},StatusBar:{setStyle(){},setOverlaysWebView(){}}}}});
 await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
 if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]');
 if(await p.locator('[data-act=obSkip]').count()){await p.locator('[data-act=ob][data-k=name]').fill('Riz');await p.click('[data-act=obSkip]')}
 const vp=await p.getAttribute('meta[name=viewport]','content');
 const over={};
 for(const t of ['today','train','recover','you']){const btn=p.locator(`nav.tabs [data-tab=${t}]`);if(!await btn.count()){over[t]='no tab';continue}await btn.click();await p.waitForTimeout(250);
   const o=await p.evaluate(()=>{const W=document.documentElement.clientWidth;const bad=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>W+1||r.left<-1)&&getComputedStyle(e).position!=='fixed'&&!e.closest('.hscroll,.chips,[style*="overflow-x"],.tscroll,.pick')}).slice(0,3).map(e=>e.tagName+'.'+e.className+':'+Math.round(e.getBoundingClientRect().right));return {sw:document.documentElement.scrollWidth,W,bad}});
   await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await p.waitForTimeout(150);
   const nav=await p.evaluate(()=>{const r=document.querySelector('nav.tabs').getBoundingClientRect();return Math.round(window.innerHeight-r.bottom)});
   over[t]={...o,navGap:nav}}
 // keyboard hides nav
 await p.click('nav.tabs [data-tab=you]');await p.waitForTimeout(200);const inp=p.locator('main input[type=search], main input[type=text], main input:not([type]), main input[type=number]').first();let kb='-';if(await inp.count()){await inp.focus();await p.waitForTimeout(100);kb=await p.evaluate(()=>[document.documentElement.classList.contains('kb'),getComputedStyle(document.querySelector('nav.tabs')).display,getComputedStyle(document.activeElement).fontSize]);await inp.blur();await p.waitForTimeout(250);kb.push(await p.evaluate(()=>document.documentElement.classList.contains('kb')))}
 // sheet height (quick log)
 await p.click('nav.tabs [data-tab=today]');const ql=p.locator('[data-act=quickSheet]').first();let sh='-';if(await ql.count()){await ql.click();await p.waitForTimeout(200);sh=await p.evaluate(()=>{const s=document.querySelector('.sheet');return s?[Math.round(s.getBoundingClientRect().height),window.innerHeight,getComputedStyle(document.body).overflow]:'none'})}
 console.log(w+'x'+h,'viewport:',vp.includes('maximum-scale=1'),'kb:',JSON.stringify(kb),'sheet:',JSON.stringify(sh));
 for(const [t,o] of Object.entries(over))console.log('  ',t,JSON.stringify(o));
 await ctx.close()}
console.log('errors',errs);await b.close();
