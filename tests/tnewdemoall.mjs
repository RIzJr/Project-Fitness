// Every exercise in the library and every warm-up/stretch shows the new-style drawing; screenshot a page of them in light and dark.
import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];
for(const scheme of ['light','dark']){const ctx=await b.newContext({viewport:{width:390,height:844},colorScheme:scheme});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
  await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await p.goto('http://localhost:8767/');await p.waitForFunction(()=>window.PFDEMO,null,{timeout:15000});
  const r=await p.evaluate(()=>{const D=window.PFDEMO,src=[...document.scripts].length;const names=[...new Set([...(window.EX_LIB_NAMES||[])])];return names.length});
  const res=await p.evaluate(async()=>{const D=window.PFDEMO;const txt=await (await fetch('demos.js')).text();const P=eval("("+txt.match(/const EX_PAT=(\{[^;]*\});/)[1]+")");const names=Object.keys(P);
    const old=names.filter(n=>!/nfig/.test(D.demoSVG(n,60,1)));const box=document.createElement('div');box.id='all';box.style.cssText='position:fixed;inset:0;z-index:99999;background:var(--bg);display:flex;flex-wrap:wrap;gap:2px;padding:4px;overflow:auto';
    box.innerHTML=names.slice(0,70).map(n=>`<div style="background:var(--sunk);border-radius:6px">${D.demoSVG(n,52,1)}</div>`).join('');document.body.appendChild(box);return {n:names.length,old}});
  console.log(scheme,'| exercises',res.n,'| still on the old figure:',res.old.length?res.old.join(', '):'none');await p.waitForTimeout(300);await p.screenshot({path:`tests/shots/newdemoall-${scheme}.png`});await ctx.close()}
console.log('errors',errs);await b.close();
