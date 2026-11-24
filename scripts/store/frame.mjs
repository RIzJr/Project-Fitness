// Frames the raw screens into store images: App Store 6.9" (1320×2868), Google Play phone (1080×2160), Play feature graphic (1024×500), Play icon (512).
import { createRequire } from 'module';import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.join(HERE,'..','..'),RAW=path.join(ROOT,'store','raw')+'/';
const { chromium } = createRequire(path.join(ROOT,'package.json'))('playwright');
const FONTS=fs.readFileSync(path.join(HERE,'fonts.css'),'utf8'),R=RAW,O=path.join(ROOT,'store')+'/';
const img=f=>'data:image/png;base64,'+fs.readFileSync(f).toString('base64');
const SHOTS=[["today","YOUR DAY, PLANNED","Your next session, food and goals in one place"],
  ["workout","350+ EXERCISES, ANIMATED","Clear demos and last time's weights for every lift"],
  ["rest","A REST TIMER THAT RINGS","Boxing bell on time, and your music pauses for the next set"],
  ["cardio","CARDIO FOCUS MODE","Live heart rate, zone coaching, average saved"],
  ["recover","RECOVERY FROM YOUR WATCH","Sleep, HRV and strain turned into today's training call"],
  ["goals","GOALS THAT TRACK THEMSELVES","Lifts, bodyweight and sessions fill in as you log"]];
const page=(W,H,head,sub,shot)=>{const pad=Math.round(W*0.075),hs=Math.round(W*0.08),ss=Math.round(W*0.034),top=Math.round(H*0.055);
  const shotW=W-pad*2,shotH=Math.round(shotW*956/440),r=Math.round(W*0.06);
  return `<!doctype html><html><head><style>${FONTS}*{margin:0;box-sizing:border-box}html,body{width:${W}px;height:${H}px;overflow:hidden;background:#0D0E10}
  header{height:${Math.round(hs*2.05+ss*2.9)}px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start}body{background:radial-gradient(120% 60% at 50% 0%,#23280f 0%,#0D0E10 55%);font-family:Inter,sans-serif;color:#fff;display:flex;flex-direction:column;align-items:center;padding:${top}px ${pad}px 0}
  h1{font-family:Anton,sans-serif;font-weight:400;font-size:${hs}px;line-height:1.02;letter-spacing:.01em;text-align:center;color:#D4FF3A}
  p{font-size:${ss}px;line-height:1.3;text-align:center;color:#C9CCD1;margin-top:${Math.round(ss*0.7)}px;max-width:92%;font-weight:500}
  .ph{margin-top:${Math.round(H*0.012)}px;width:${shotW}px;height:${shotH}px;border-radius:${r}px;overflow:hidden;border:${Math.max(3,Math.round(W*0.006))}px solid #2A2D33;box-shadow:0 ${Math.round(W*.03)}px ${Math.round(W*.08)}px rgba(0,0,0,.6),0 0 0 ${Math.round(W*.012)}px #15171a}
  .ph img{width:100%;display:block}</style></head><body><header><h1>${head}</h1><p>${sub}</p></header><div class="ph"><img src="${img(R+shot+'.png')}"></div></body></html>`};
const b=await chromium.launch();
async function render(html,W,H,file){const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});await pg.setContent(html);await pg.waitForTimeout(300);await pg.screenshot({path:file});await pg.close();console.log(file)}
let i=1;for(const [s,h,sub] of SHOTS){await render(page(1320,2868,h,sub,s),1320,2868,`${O}app-store/${i}-${s}.png`);await render(page(1080,2160,h,sub,s),1080,2160,`${O}google-play/${i}-${s}.png`);i++}
// feature graphic: logo lockup + line, with two phone crops
const icon=img(path.join(ROOT,'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'));
await render(`<!doctype html><html><head><style>${FONTS}*{margin:0;box-sizing:border-box}body{width:1024px;height:500px;overflow:hidden;background:radial-gradient(90% 120% at 15% 50%,#23280f 0%,#0D0E10 60%);font-family:Inter,sans-serif;color:#fff;position:relative}
  .t{position:absolute;left:60px;top:100px;width:420px}.t img{width:96px;height:96px;border-radius:22px;display:block;margin-bottom:26px}
  h1{font-family:Anton,sans-serif;font-weight:400;font-size:58px;line-height:1;color:#fff}h1 span{color:#D4FF3A}p{margin-top:14px;font-size:22px;color:#C9CCD1;font-weight:500;line-height:1.3}
  .p{position:absolute;top:60px;width:235px;border-radius:24px;overflow:hidden;border:3px solid #2A2D33;box-shadow:0 20px 50px rgba(0,0,0,.6)}.p img{width:100%;display:block}
  </style></head><body><div class="t"><img src="${icon}"><h1>PROJECT <span>FITNESS</span></h1><p>Training, food, recovery and coaching in one app.</p></div>
  <div class="p" style="right:285px;top:80px"><img src="${img(R+'workout.png')}"></div><div class="p" style="right:25px;top:40px"><img src="${img(R+'recover.png')}"></div></body></html>`,1024,500,`${O}google-play/feature-graphic.png`);
await b.close();
