// Anatomy check of the exercise demos (demos.js ND): every library exercise and warm-up, 11 frames each.
// Flags over-bent elbows/knees, knees bending backwards, elbows pointing the wrong way, limbs off length, joints below the floor.
// Usage from the repo root: node scripts/anat-check.cjs   (peak-flexion holds like the front rack or the top of a row read 25–38° and are fine)
global.window={matchMedia:()=>({matches:false})};global.performance={now:()=>1000};global.requestAnimationFrame=()=>{};global.document={querySelectorAll:()=>[]};
const fs=require("fs"),vm=require("vm");
const app=fs.readFileSync(require("path").join(__dirname,"..","demos.js"),"utf8").replace("window.PFDEMO=","window.__D=DEMOS;window.__MAP=ND_MAP;window.__ND=ND;window.PFDEMO=");vm.runInThisContext(app);
const EX=window.__ND.EX,D=window.PFDEMO,M=window.__MAP;
const P=eval("("+app.match(/const EX_PAT=(\{[^;]*\});/)[1]+")");
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],len=a=>Math.sqrt(dot(a,a)),norm=a=>{const l=len(a)||1;return a.map(x=>x/l)};
const ang=(a,o,b)=>Math.acos(Math.max(-1,Math.min(1,dot(norm(sub(a,o)),norm(sub(b,o))))))*180/Math.PI;
const off=(a,m,b)=>{const d=norm(sub(b,a)),v=sub(m,a),p=dot(v,d);return sub(v,d.map(x=>x*p))};
const names=[...Object.keys(P),...Object.keys(window.__D).filter(k=>!k.startsWith("ex:")&&!k.startsWith("breath"))];const seen=new Set(),out={};
for(const n of names){const key=D.anyDemoKey(n),m=M[key];if(!m||!m.fits(n))continue;const k=typeof m.k==="function"?m.k(n):m.k,v=m.v?m.v(n):"",id=k+(v?":"+v:"");if(seen.has(id))continue;seen.add(id);
  const iss=new Set();for(let i=0;i<=10;i++){const t=i/10,J=EX[k].pose(t,v);
    for(const s of ["L","R"]){const S=J["sh"+s],E=J["el"+s],W=J["wr"+s],H=J["hp"+s],K=J["kn"+s],A=J["an"+s],z=s==="L"?1:-1;
      const ea=ang(S,E,W),ka=ang(H,K,A);if(ea<38)iss.add(`elbow ${s} over-bent ${ea.toFixed(0)}° t${t}`);if(ka<25)iss.add(`knee ${s} over-bent ${ka.toFixed(0)}° t${t}`);
      const ko=off(H,K,A);if(len(ko)>4&&dot(norm(ko),J.fwd)<-.35)iss.add(`knee ${s} bends backwards t${t}`);
      const eo=off(S,E,W),ua=norm(sub(E,S));if(len(eo)>4){const en=norm(eo);if(dot(ua,J.up.map(x=>-x))>.8&&dot(en,J.fwd)>.5)iss.add(`elbow ${s} points forward on a hanging arm (hyperextension) t${t}`);if(en[2]*z<-.6)iss.add(`elbow ${s} folds in towards the midline t${t}`)}
      for(const [nm,a,b,L] of [["upper arm",S,E,31],["forearm",E,W,27],["thigh",H,K,44],["shin",K,A,43]]){const d=len(sub(a,b));if(Math.abs(d-L)/L>.15)iss.add(`${nm} ${s} length ${d.toFixed(0)} (should be ${L}) t${t}`)}
      for(const [nm,p] of [["ankle",A],["knee",K],["hip",H],["shoulder",S],["elbow",E]])if(p[1]<1.5)iss.add(`${nm} ${s} below the floor t${t}`)}
    if(J.head[1]<6)iss.add(`head below the floor t${t}`)}
  if(iss.size){const g={};for(const x of iss){const kk=x.replace(/ t[0-9.]+$/,"");(g[kk]=g[kk]||[]).push(x.match(/t([0-9.]+)$/)[1])}out[id]=Object.entries(g).map(([a,b])=>a+" @t="+b.join(","))}}
const ks=Object.keys(out);console.log("movements checked",seen.size,"with issues",ks.length);for(const k of ks)console.log(k.padEnd(20),out[k].join(" | "));
