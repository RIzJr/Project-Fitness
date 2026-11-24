// Store screenshots: the real app on a simulated iPhone (6.9", 440×956 @3x) with a realistic demo person and watch data.
// Run from the repo root with the app served on :8767 (python3 -m http.server 8767): node scripts/store/shots.mjs, then node scripts/store/frame.mjs
import { createRequire } from 'module';import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.join(HERE,'..','..'),RAW=path.join(ROOT,'store','raw')+'/';
const { chromium } = createRequire(path.join(ROOT,'package.json'))('playwright');
const OUT=RAW;fs.mkdirSync(OUT,{recursive:true});
const FONTS=fs.readFileSync(path.join(HERE,'fonts.css'),'utf8');
const initSrc=fs.readFileSync(path.join(HERE,'init.js'),'utf8');
const b=await chromium.launch();const errs=[];
const ctx=await b.newContext({viewport:{width:440,height:956},deviceScaleFactor:3,isMobile:true,hasTouch:true,colorScheme:'dark'});
await new Function('ctx',`return (async()=>{${initSrc}})()`)(ctx);
await ctx.route('**/fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:FONTS}));
await ctx.route('**/cdn.jsdelivr.net/**',r=>r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8767/');await p.waitForTimeout(1000);
const c=async(s,w=350)=>{const ok=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return false;e.click();return true},s);await p.waitForTimeout(w);return ok};
await c('[data-act=gateLocal]');if(await p.locator('#ob_name').count())await c('[data-act=obSkip]');
// demo person: Alex, 4 weeks of an upper/lower plan getting stronger, food today, weekly weigh-ins, goals
await p.evaluate(()=>{const pad=n=>String(n).padStart(2,'0'),key=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
  const T=new Date();T.setHours(12,0,0,0);const day=n=>{const d=new Date(T);d.setDate(d.getDate()+n);return d};
  for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));
    d.profile={...(d.profile||{}),type:'profile',name:'Alex',hrAge:29,dob:'1997-03-14',sex:'m',height:180,weight:82,goal:'lean',activity:'moderate'};
    d.settings={...(d.settings||{type:'settings'}),health:{on:true,v:3,since:new Date(Date.now()-40*864e5).toISOString()},targets:{kcal:2400,protein:170,carbs:250,fat:75}};
    const up=[["Barbell bench press",60,8],["Barbell row",55,10],["Seated dumbbell shoulder press",18,10],["Lat pulldown",55,12]],lo=[["Back squat",80,6],["Romanian deadlift",70,10],["Leg press",120,12],["Seated leg curl",40,12]];
    let n=0;for(let i=27;i>=1;i--){const dd=day(-i),dow=dd.getDay();if(![1,3,5].includes(dow))continue;const L=(n++%2)?lo:up,wk=Math.floor((27-i)/7),st=new Date(dd);st.setHours(18,0,0,0);
      d['wo_demo'+i]={type:'workout',id:'wo_demo'+i,date:key(dd),name:L===up?'Upper A':'Lower A',kind:'gym',mins:58,started:st.getTime(),ended:st.getTime()+58*60000,
        exercises:L.map(([nm,kg,r])=>({name:nm,sets:[0,1,2].map(s=>({kg:kg+wk*2.5,reps:r-(s===2?1:0),done:true}))}))}}
    for(let w=0;w<8;w++){const dd=day(-w*7);d['body_'+key(dd)]={type:'body',date:key(dd),weight:+(82+w*0.35).toFixed(1)}}
    const t=key(T);d['day_'+t]={type:'day',date:t,habits:{'Protein at every meal':true,'2 litres of water':true,'8,000+ steps':true},
      foods:[{name:'Overnight oats with whey and berries',kcal:480,protein:38,carbs:62,fat:9},{name:'Chicken breast, rice & broccoli',kcal:620,protein:52,carbs:74,fat:11},{name:'Greek yoghurt 0% + honey',kcal:190,protein:20,carbs:24,fat:0}]};
    d.goal_g1={type:'goal',id:'g1',kind:'lift',ex:'Barbell bench press',kg:80,reps:5,made:key(day(-28))};
    d.goal_g2={type:'goal',id:'g2',kind:'weight',kg:79,made:key(day(-49))};
    d.goal_g3={type:'goal',id:'g3',kind:'sessions',target:3,made:key(day(-28))};
    localStorage.setItem(k,JSON.stringify(d))}});
await p.reload();await p.waitForTimeout(3500);
await p.addStyleTag({content:'.banner,.toast,#toast{display:none!important}'});
const shot=async(n,full)=>{await p.waitForTimeout(700);await p.screenshot({path:OUT+n+'.png'});console.log('shot',n)};
await c('[data-tab=today]');await p.evaluate(()=>scrollTo(0,0));await shot('today');
await c('[data-tab=recover]',900);await p.evaluate(()=>scrollTo(0,0));await shot('recover');
await c('[data-tab=you]');await c('[data-act=youView][data-v=goals]');await shot('goals');
await c('[data-act=youView][data-v=progress]');await shot('progress');
// workout player: repeat the last Upper A (bench press first), demo open, last session's weights
await c('[data-tab=train]');
await p.evaluate(()=>{let id=null,best='';for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));for(const [i,w] of Object.entries(d))if(w&&w.type==='workout'&&w.name==='Upper A'&&w.date>best){best=w.date;id=i}}
  const x=document.createElement('button');x.dataset.act='repeatWo';x.dataset.id=id;x.hidden=true;document.body.appendChild(x);x.click();x.remove()});await p.waitForTimeout(600);
await c('.player [data-act=wpGo]',500);await c('.player [data-act=demoToggle]',800);await p.evaluate(()=>scrollTo(0,0));await shot('workout');
await c('.player [data-act=demoToggle]',300);await c('.player [data-act=wpDone]',900);await shot('rest');
await c('.player [data-act=wpEnd]');await c('.player [data-act=wpDiscard]');await c('.player [data-act=wpDiscard]',500);
// cardio focus: incline walk, zone 2 target, heart rate from the watch
await c('[data-tab=train]');await c('[data-act=trainView][data-v=cardio]');await c('.panel [data-act=cAct][data-v="Incline walk"]');await c('[data-act=cGoal][data-v="3"]');await c('[data-act=cMins][data-v="30"]');
await c('[data-act=cfStart]',1000);await p.waitForTimeout(47000);await shot('cardio');
console.log('errors',errs.length?errs:'none');await b.close();
