// Project Fitness: animated move and exercise demos. Loaded in the background after the app starts (keeps start-up fast).
(function(){
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* ---------- move demos: small animated figures drawn in code (no downloads, work offline) ---------- */
// Each demo: key frames of joint positions on a 100×100 stage, floor at y=92, figure facing right.
// h head, s shoulder (s2 far shoulder, front views), p hip (p2), c spine bend, e/w elbow/wrist, k/f knee/foot, n fingertip. 1 = near side, 2 = far side.
const P_STAND={h:[50,15],s:[50,25],p:[50,51],e1:[51,38],w1:[52,50],e2:[49,38],w2:[48,50],k1:[51,71],f1:[51,91],k2:[49,71],f2:[49,91]};
const P_FRONT={h:[50,14],s:[42,25],s2:[58,25],p:[45,52],p2:[55,52],e1:[40,38],w1:[39,50],e2:[60,38],w2:[61,50],k1:[44,72],f1:[43,91],k2:[56,72],f2:[57,91]};
const P_QUAD={h:[74,58],s:[66,64],p:[36,69],e1:[66,76],w1:[66,89],e2:[67,76],w2:[67,89],k1:[36,89],f1:[18,90],k2:[37,89],f2:[19,90]};
const P_CHILD={h:[64,87],s:[56,83],p:[30,79],e1:[69,87],w1:[82,90],e2:[69,88],w2:[82,91],k1:[50,90],f1:[26,91],k2:[50,90],f2:[26,91]};
const pose=(base,o)=>({...base,...o});
const DEMOS={
  "cat-cow":{f:[pose(P_QUAD,{c:[51,77],h:[75,55]}),pose(P_QUAD,{c:[51,50],h:[71,75]})],tip:"Cow: drop the belly, look up. Cat: round the back, chin to chest."},
  "thread the needle":{f:[pose(P_QUAD,{e1:[63,51],w1:[61,39],h:[72,60]}),pose(P_QUAD,{s:[60,79],c:[48,72],e1:[51,85],w1:[41,88],e2:[70,81],w2:[68,89],h:[66,86]})],tip:"Reach up, then slide the arm under and rest the shoulder down."},
  "world's greatest stretch":{f:[{h:[78,54],s:[70,58],p:[50,72],e1:[68,71],w1:[67,85],e2:[72,71],w2:[75,84],k1:[70,73],f1:[74,91],k2:[33,84],f2:[16,90]},
    {h:[70,46],s:[66,55],p:[50,72],e1:[64,42],w1:[62,29],e2:[70,68],w2:[74,82],k1:[70,73],f1:[74,91],k2:[33,84],f2:[16,90]}],tip:"Lunge, elbow to instep, then rotate and reach to the ceiling."},
  "hip circles":{f:[pose(P_STAND,{p:[46,51],k1:[48,71],k2:[47,71],e1:[58,36],w1:[51,49],e2:[42,37],w2:[47,49]}),pose(P_STAND,{p:[50,49],e1:[58,36],w1:[52,48],e2:[42,37],w2:[48,48]}),pose(P_STAND,{p:[55,51],k1:[53,71],k2:[52,71],e1:[58,36],w1:[56,49],e2:[42,37],w2:[52,49]}),pose(P_STAND,{p:[50,53],e1:[58,36],w1:[52,51],e2:[42,37],w2:[48,51]})],loop:1,tip:"Hands on hips, draw big slow circles with your hips."},
  "deep squat":{f:[{h:[60,46],s:[56,55],p:[44,80],e1:[60,66],w1:[66,58],e2:[61,67],w2:[66,59],k1:[64,72],f1:[56,91],k2:[63,73],f2:[55,91]},{h:[57,45],s:[54,55],p:[43,83],e1:[59,66],w1:[65,57],e2:[60,67],w2:[65,58],k1:[64,73],f1:[56,91],k2:[63,74],f2:[55,91]}],tip:"Heels down, chest up, elbows gently pushing the knees out."},
  "arm circles":{f:[pose(P_STAND,{e1:[52,13],w1:[53,2]}),pose(P_STAND,{e1:[63,26],w1:[75,27]}),pose(P_STAND,{e1:[51,38],w1:[52,50]}),pose(P_STAND,{e1:[38,28],w1:[27,30]})],loop:1,tip:"Small circles first, getting bigger. Then reverse."},
  "child's pose":{f:[pose(P_CHILD,{}),pose(P_CHILD,{p:[31,77],s:[57,81],h:[66,86],w1:[86,90],w2:[86,91],e1:[71,86],e2:[71,87]})],tip:"Sit back on your heels, reach the arms long and breathe into your back."},
  "quad stretch":{f:[pose(P_STAND,{e2:[57,34],w2:[64,40]}),pose(P_STAND,{k1:[51,72],f1:[42,58],e1:[44,44],w1:[42,57],e2:[58,33],w2:[66,38]})],tip:"Heel to bum, knees together, stand tall. Hold something for balance."},
  "hamstring stretch":{prop:"step",f:[{h:[46,16],s:[46,26],p:[46,52],e1:[50,39],w1:[56,50],e2:[48,39],w2:[54,50],k1:[58,64],f1:[70,76],k2:[46,72],f2:[46,91]},{h:[72,34],s:[64,38],p:[44,52],e1:[66,51],w1:[66,62],e2:[64,51],w2:[64,63],k1:[57,64],f1:[70,76],k2:[45,72],f2:[45,91]}],tip:"Heel on a low step, leg straight, hinge forward with a flat back."},
  "hip flexor stretch":{f:[{h:[44,36],s:[43,46],p:[42,72],e1:[50,58],w1:[58,66],e2:[49,58],w2:[57,66],k1:[62,72],f1:[63,91],k2:[34,91],f2:[18,91]},{h:[50,37],s:[49,47],p:[48,73],e1:[52,35],w1:[54,23],e2:[55,58],w2:[62,66],k1:[64,73],f1:[64,91],k2:[34,91],f2:[18,91]}],tip:"Half kneel, squeeze the back glute and shift your hips forward."},
  "pigeon":{f:[{h:[54,48],s:[52,58],p:[48,84],e1:[56,74],w1:[60,90],e2:[55,74],w2:[58,90],k1:[66,88],f1:[52,90],k2:[30,90],f2:[12,91]},{h:[78,84],s:[70,80],p:[47,84],e1:[80,86],w1:[90,90],e2:[80,87],w2:[90,91],k1:[66,88],f1:[52,90],k2:[30,90],f2:[12,91]}],tip:"Front shin across, back leg long, then fold forward over the front leg."},
  "calf stretch":{prop:"wall",f:[{h:[63,22],s:[58,30],p:[44,54],e1:[70,30],w1:[81,28],e2:[70,31],w2:[81,30],k1:[60,72],f1:[64,91],k2:[35,72],f2:[26,91]},{h:[67,25],s:[62,33],p:[48,56],e1:[72,32],w1:[81,30],e2:[72,33],w2:[81,32],k1:[65,73],f1:[64,91],k2:[37,74],f2:[26,91]}],tip:"Hands on the wall, back leg straight, back heel pressed down."},
  "chest stretch":{prop:"door",f:[{h:[50,15],s:[50,25],p:[50,51],e1:[60,25],w1:[60,13],e2:[49,38],w2:[48,50],k1:[51,71],f1:[51,91],k2:[49,71],f2:[49,91]},{h:[65,16],s:[63,26],p:[58,51],e1:[60,25],w1:[60,13],e2:[62,39],w2:[62,50],k1:[64,71],f1:[68,91],k2:[52,71],f2:[46,91]}],tip:"Forearm on the door frame at shoulder height, step through gently."},
  "cross-body shoulder":{f:[pose(P_FRONT,{}),pose(P_FRONT,{e2:[46,29],w2:[33,30],e1:[38,36],w1:[46,30]})],tip:"Pull the arm across your chest above the elbow. Keep the shoulder down."},
  "lat stretch":{prop:"post",f:[{h:[58,19],s:[56,28],p:[48,52],e1:[68,30],w1:[79,32],e2:[68,31],w2:[79,33],k1:[49,72],f1:[50,91],k2:[48,72],f2:[49,91]},{h:[66,57],s:[60,52],p:[36,60],e1:[70,48],w1:[79,44],e2:[70,49],w2:[79,45],k1:[45,75],f1:[52,91],k2:[44,75],f2:[51,91]}],tip:"Hold a post, arms long, sit the hips back and let the chest drop."},
  "neck side":{f:[pose(P_FRONT,{}),pose(P_FRONT,{h:[44,17],e1:[34,22],w1:[42,10]})],tip:"Ear towards the shoulder, the other shoulder relaxed down."},
  "wrist":{f:[pose(P_STAND,{e1:[63,28],w1:[75,30],n1:[79,22],e2:[62,32],w2:[78,23]}),pose(P_STAND,{e1:[63,28],w1:[75,30],n1:[79,38],e2:[62,34],w2:[78,38]})],tip:"Arm straight, gently pull the fingers back, then down."},
  "chin tucks":{f:[pose(P_STAND,{h:[53,15]}),pose(P_STAND,{h:[48,15]})],tip:"Glide the head straight back to make a double chin. No nodding."},
  "shoulder rolls":{f:[pose(P_STAND,{}),pose(P_STAND,{s:[51,22],e1:[52,35],w1:[53,47],e2:[50,35],w2:[49,47]}),pose(P_STAND,{s:[47,22],e1:[48,35],w1:[49,47],e2:[46,35],w2:[45,47]}),pose(P_STAND,{s:[47,27],e1:[48,40],w1:[49,52],e2:[46,40],w2:[45,52]})],loop:1,tip:"Big slow circles: up, back and down."},
  "seated twist":{prop:"chair",f:[{h:[50,26],s:[42,37],s2:[58,37],p:[45,62],p2:[55,62],e1:[40,50],w1:[42,62],e2:[60,50],w2:[58,62],k1:[42,64],f1:[42,91],k2:[58,64],f2:[58,91]},{h:[55,27],s:[46,37],s2:[57,38],p:[45,62],p2:[55,62],e1:[48,48],w1:[56,58],e2:[64,47],w2:[66,58],k1:[42,64],f1:[42,91],k2:[58,64],f2:[58,91]}],tip:"Sit tall, then rotate from the middle of your back. Breathe out as you turn."},
  "standing hip flexor":{f:[{h:[48,16],s:[48,26],p:[48,52],e1:[42,38],w1:[45,50],e2:[54,38],w2:[52,50],k1:[60,72],f1:[64,91],k2:[42,72],f2:[32,91]},{h:[52,17],s:[51,27],p:[52,53],e1:[52,14],w1:[53,3],e2:[57,39],w2:[56,51],k1:[63,72],f1:[64,91],k2:[42,73],f2:[32,91]}],tip:"Split stance, squeeze the back glute, tuck the hips under, reach up."},
  "forward fold":{f:[pose(P_STAND,{}),{h:[55,82],s:[53,73],p:[45,50],e1:[56,83],w1:[57,90],e2:[54,83],w2:[55,90],k1:[50,70],f1:[48,91],k2:[49,70],f2:[47,91]}],tip:"Soft knees, let the head and arms hang heavy."},
  "legs up the wall":{prop:"wall",f:[{h:[39,88],s:[48,88],p:[74,88],e1:[44,92],w1:[36,92],e2:[44,91],w2:[36,91],k1:[77,68],f1:[78,48],k2:[76,68],f2:[77,48]},{h:[39,88],s:[48,87],p:[74,88],e1:[44,92],w1:[36,92],e2:[44,91],w2:[36,91],k1:[77,68],f1:[78,48],k2:[76,68],f2:[77,48]}],tip:"Bum close to the wall, legs resting up it, arms relaxed."},
  "leg swings":{prop:"wall",f:[pose(P_STAND,{w2:[60,30],e2:[56,30],k1:[62,66],f1:[72,80]}),pose(P_STAND,{w2:[60,30],e2:[56,30],k1:[40,68],f1:[32,84]})],tip:"Hold something steady, swing the leg forward and back, relaxed."},
  "inchworm":{f:[{h:[55,82],s:[53,73],p:[45,50],e1:[56,83],w1:[58,90],e2:[55,83],w2:[57,90],k1:[47,70],f1:[46,91],k2:[46,70],f2:[45,91]},{h:[80,70],s:[72,76],p:[46,82],e1:[73,84],w1:[74,91],e2:[74,84],w2:[75,91],k1:[33,87],f1:[20,90],k2:[33,87],f2:[20,90]}],tip:"Fold down, walk the hands out to a plank, then walk the feet in."},
  "glute bridge":{f:[{h:[22,87],s:[32,87],p:[54,86],e1:[40,91],w1:[50,91],e2:[40,90],w2:[50,90],k1:[66,72],f1:[68,91],k2:[65,72],f2:[67,91]},{h:[22,87],s:[32,85],p:[54,72],e1:[40,91],w1:[50,91],e2:[40,90],w2:[50,90],k1:[69,68],f1:[68,91],k2:[68,68],f2:[67,91]}],tip:"Feet flat, push through the heels and squeeze the glutes at the top."},
  "bodyweight squat":{f:[pose(P_STAND,{e1:[58,34],w1:[64,30],e2:[57,34],w2:[63,30]}),{h:[59,36],s:[55,45],p:[38,68],e1:[64,46],w1:[74,44],e2:[63,46],w2:[73,44],k1:[58,70],f1:[50,91],k2:[57,70],f2:[49,91]}],tip:"Sit back and down, chest up, knees track over the toes."},
  "band pull-apart":{f:[pose(P_FRONT,{e1:[38,30],w1:[44,30],e2:[62,30],w2:[56,30]}),pose(P_FRONT,{e1:[32,27],w1:[22,27],e2:[68,27],w2:[78,27]})],tip:"Arms straight at shoulder height, pull the band apart to your chest."},
  "scapular push-up":{f:[{h:[82,64],s:[74,68],p:[46,72],e1:[74,80],w1:[74,91],e2:[75,80],w2:[75,91],k1:[30,80],f1:[14,89],k2:[30,80],f2:[14,89]},{h:[82,61],s:[74,65],p:[46,71],e1:[74,78],w1:[74,91],e2:[75,78],w2:[75,91],k1:[30,80],f1:[14,89],k2:[30,80],f2:[14,89]}],tip:"Arms straight, squeeze the shoulder blades together, then push them apart."},
  "scapular pull-up":{prop:"bar",f:[{h:[50,26],s:[50,34],p:[50,60],e1:[51,22],w1:[52,10],e2:[49,22],w2:[48,10],k1:[51,77],f1:[51,92],k2:[49,77],f2:[49,92]},{h:[50,23],s:[50,30],p:[50,56],e1:[51,20],w1:[52,10],e2:[49,20],w2:[48,10],k1:[51,73],f1:[51,88],k2:[49,73],f2:[49,88]}],tip:"Hang with straight arms, pull the shoulders down away from the ears."},
  "breath:box":{breath:[["Breathe in",4],["Hold",4],["Breathe out",4],["Hold",4]]},
  "breath:long":{breath:[["Breathe in",4],["Breathe out",8]]},
  "breath:slow":{breath:[["Breathe in",4],["Breathe out",6]]}
};
// which demo fits a move name (works for routine moves, cool-down items and warm-up drills)
const DEMO_MATCH=[["cat-cow","cat-cow"],["cat cow","cat-cow"],["thread the needle","thread the needle"],["open book","thread the needle"],["thoracic rotation","thread the needle"],["world's greatest","world's greatest stretch"],["hip circle","hip circles"],["hip opener","hip circles"],["deep squat","deep squat"],["goblet squat hold","deep squat"],["arm circle","arm circles"],["child","child's pose"],["quad","quad stretch"],["hamstring","hamstring stretch"],["standing hip flexor","standing hip flexor"],["hip flexor","hip flexor stretch"],["pigeon","pigeon"],["calf","calf stretch"],["chest","chest stretch"],["doorway","chest stretch"],["cross-body","cross-body shoulder"],["lat stretch","lat stretch"],["neck","neck side"],["wrist","wrist"],["chin tuck","chin tucks"],["shoulder roll","shoulder rolls"],["twist","seated twist"],["forward fold","forward fold"],["legs up","legs up the wall"],["leg swing","leg swings"],["inchworm","inchworm"],["glute bridge","glute bridge"],["bodyweight squat","bodyweight squat"],["pull-apart","band pull-apart"],["scapular push","scapular push-up"],["scapular pull","scapular pull-up"],["dead hang","scapular pull-up"],["walking lunge","world's greatest stretch"],["box breath","breath:box"],["long exhale","breath:long"],["breath","breath:slow"]];
function demoKey(name){const n=String(name||"").toLowerCase();const m=DEMO_MATCH.find(([w])=>n.includes(w));return m?m[1]:null}
const DEMO_PROPS={step:`<rect x="64" y="77" width="20" height="15" rx="2" class="dp"/>`,wall:`<line x1="83" y1="8" x2="83" y2="92" class="dl"/>`,door:`<path d="M60 4V92M60 4H84V92" class="dl" fill="none"/>`,post:`<line x1="81" y1="10" x2="81" y2="92" class="dl" style="stroke-width:3"/>`,
  chair:`<path d="M36 64H64M38 64V92M62 64V92M64 64V34" class="dl" fill="none"/>`,bar:`<line x1="30" y1="10" x2="70" y2="10" class="dl" style="stroke-width:3"/>`};
const anyDemoKey=name=>{if(typeof name==="string"&&DEMOS[name])return name;const st=/stretch|pose|cat.?cow|breath|mobility/i.test(String(name||""));return st?(demoKey(name)||(typeof exDemoKey==="function"&&exDemoKey(name))):((typeof exDemoKey==="function"&&exDemoKey(name))||demoKey(name))};
/* ---------- new-style demos (2026-11): a small 3D figure with real equipment, drawn in code (posed from free-exercise-db reference photos, public domain) ----------
   Joints are solved with two-bone IK so limbs keep their length; each exercise keeps one fixed layering so nothing flickers.
   Patterns redone so far live in ND_MAP; every other exercise keeps its stick figure until it's redrawn. */
const ND=(function(){
const add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul=(a,s)=>[a[0]*s,a[1]*s,a[2]*s];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],len=a=>Math.sqrt(dot(a,a)),norm=a=>{const l=len(a)||1;return mul(a,1/l)};
const lerp=(a,b,t)=>a+(b-a)*t,rad=d=>d*Math.PI/180,ease=t=>.5-.5*Math.cos(Math.PI*t);
const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)},bump=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return Math.sin(Math.PI*t)};
const L={thigh:44,shin:43,upper:31,fore:27,trunk:50,grip:6};
function ik(A,T,L1,L2,pole){const d=sub(T,A);let D=len(d);const u=norm(d);D=Math.min(D,L1+L2-.05);D=Math.max(D,Math.abs(L1-L2)+.05);
  let p=sub(pole,mul(u,dot(pole,u)));p=norm(p);const a=(L1*L1-L2*L2+D*D)/(2*D),h=Math.sqrt(Math.max(0,L1*L1-a*a));
  return [add(add(A,mul(u,a)),mul(p,h)),add(A,mul(u,D))]}
// camera: yaw/pitch orthographic; dy = how much height counts as "nearer" when layering (1 for lying moves seen from above)
function cam(o){const th=rad(o.yaw),be=rad(o.pitch),ct=Math.cos(th),st=Math.sin(th),cb=Math.cos(be),sb=Math.sin(be),dy=o.dy||0;
  const P=p=>{const X=p[0]*ct+p[2]*st,Dp=-p[0]*st+p[2]*ct,Y=p[1]*cb-Dp*sb;return{x:o.cx+o.s*X,y:o.cy-o.s*Y,d:Dp+p[1]*sb*dy}};
  P.view=[-st*cb,sb,ct*cb];P.s=o.s;return P}
const f1=n=>Math.round(n*10)/10;
// drawing primitives → {d,svg}
function capsule(P,a,b,ra,rb,cls,extra){const A=P(a),B=P(b),s=P.s;ra*=s;rb*=s;const dx=B.x-A.x,dy=B.y-A.y,l=Math.hypot(dx,dy);
  if(l<.5)return{d:(A.d+B.d)/2,svg:`<circle class="${cls}" cx="${f1(A.x)}" cy="${f1(A.y)}" r="${f1(Math.max(ra,rb))}"${extra||""}/>`};
  const ux=dx/l,uy=dy/l,nx=-uy,ny=ux;
  const p=`M${f1(A.x+nx*ra)} ${f1(A.y+ny*ra)}L${f1(B.x+nx*rb)} ${f1(B.y+ny*rb)}A${f1(rb)} ${f1(rb)} 0 0 0 ${f1(B.x-nx*rb)} ${f1(B.y-ny*rb)}L${f1(A.x-nx*ra)} ${f1(A.y-ny*ra)}A${f1(ra)} ${f1(ra)} 0 0 0 ${f1(A.x+nx*ra)} ${f1(A.y+ny*ra)}Z`;
  return{d:(A.d+B.d)/2,svg:`<path class="${cls}" d="${p}"${extra||""}/>`}}
function ball(P,c,r,cls,extra){const C=P(c);return{d:C.d,svg:`<circle class="${cls}" cx="${f1(C.x)}" cy="${f1(C.y)}" r="${f1(r*P.s)}"${extra||""}/>`}}
function ring(c,axis,r,n){axis=norm(axis);const t=norm(Math.abs(axis[1])<.9?[axis[2],0,-axis[0]]:[1,0,0]),u=[axis[1]*t[2]-axis[2]*t[1],axis[2]*t[0]-axis[0]*t[2],axis[0]*t[1]-axis[1]*t[0]];
  const out=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;out.push(add(c,add(mul(t,Math.cos(a)*r),mul(u,Math.sin(a)*r))))}return out}
function hull(pts){pts=pts.slice().sort((a,b)=>a.x-b.x||a.y-b.y);const cr=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);const lo=[],up=[];
  for(const p of pts){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}
  for(const p of pts.reverse()){while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}return lo.slice(0,-1).concat(up.slice(0,-1))}
const poly=(pts,cls)=>`<path class="${cls}" d="M${pts.map(p=>f1(p.x)+" "+f1(p.y)).join("L")}Z"/>`;
// a disc with thickness (weight plate, dumbbell head, pulley)
function disc(P,c,axis,r,th,cls){const a=norm(axis),i=ring(add(c,mul(a,-th/2)),a,r,28).map(P),o=ring(add(c,mul(a,th/2)),a,r,28).map(P);
  const near=dot(a,P.view)>0?o:i,far=near===o?i:o,C=P(c);const hub=ring(add(c,mul(a,(near===o?1:-1)*th/2)),a,r*.22,14).map(P);
  return{d:C.d,svg:poly(hull(i.concat(o)),cls+" side")+poly(far,cls+" side")+poly(near,cls)+poly(hub,cls+" hub")}}
function box(P,x0,x1,y0,y1,z0,z1,cls){const v=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];
  const F=[[[0,3,2,1],[0,0,-1]],[[4,5,6,7],[0,0,1]],[[0,4,7,3],[-1,0,0]],[[1,2,6,5],[1,0,0]],[[3,7,6,2],[0,1,0],"top"],[[0,1,5,4],[0,-1,0]]];
  const out=[];for(const [ix,n,t] of F){if(dot(n,P.view)<=0)continue;const pts=ix.map(k=>P(v[k]));out.push({d:pts.reduce((s,p)=>s+p.d,0)/4,svg:poly(pts,cls+(t?" "+t:" sd"))})}return out}
function obox(P,c,ax,ay,az,hx,hy,hz,cls){const A=[norm(ax),norm(ay),norm(az)],h=[hx,hy,hz],pt=(sx,sy,sz)=>P(add(add(add(c,mul(A[0],sx*h[0])),mul(A[1],sy*h[1])),mul(A[2],sz*h[2])));
  const F=[[0,1],[0,-1],[1,1],[1,-1],[2,1],[2,-1]],out=[];
  for(const [i,sg] of F){const nrm=mul(A[i],sg);if(dot(nrm,P.view)<=0)continue;const j=(i+1)%3,k=(i+2)%3,q=[];
    for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const s=[0,0,0];s[i]=sg;s[j]=a;s[k]=b;q.push(pt(s[0],s[1],s[2]))}
    out.push({d:q.reduce((s,p)=>s+p.d,0)/4,svg:poly(q,cls+(i===1&&sg>0?" top":" sd"))})}return out}
// equipment
function barbell(P,c,o,r){r=r||22.5;for(let i=0;i<16;i++)o.push(capsule(P,add(c,[0,0,-64+i*8]),add(c,[0,0,-56+i*8]),1.3,1.3,"metal"));
  for(const z of [1,-1]){o.push(disc(P,add(c,[0,0,47*z]),[0,0,1],r,5.5,"plate"));o.push(disc(P,add(c,[0,0,42.6*z]),[0,0,1],3.2,2.4,"metal"))}return o}
function dumbbell(P,w,ax,o){ax=norm(ax);o.push(capsule(P,add(w,mul(ax,-7.5)),add(w,mul(ax,7.5)),1.6,1.6,"metal"));for(const s of [1,-1])o.push(disc(P,add(w,mul(ax,10.5*s)),ax,6.8,5.5,"plate"));return o}
// the person
function body(P,J,hl){const out=[],side=z=>z>0?"n":"f",H=hl||{};
  const op=(v,nrm)=>{let f=1;if(nrm){const d=dot(norm(nrm),P.view);f=Math.max(0,Math.min(1,(d+.25)/.5))}return ` style="opacity:${(.9*v*f).toFixed(3)}"`};
  const limb=(a,b,ra,rb,s,k)=>{out.push(capsule(P,a,b,ra,rb,"bd "+s));if(k in H){const c=capsule(P,a,b,ra*.84,rb*.84,"mu",op(H[k]));c.d+=.02;out.push(c)}};
  for(const z of [1,-1]){const s=side(z),k=z>0?"L":"R",S=J["sh"+k],E=J["el"+k],W=J["wr"+k],Hp=J["hp"+k],K=J["kn"+k],A=J["an"+k];
    limb(S,E,5.3,4.3,s,"upper"+k);limb(E,W,4.2,3.2,s,"fore"+k);out.push(ball(P,W,3.6,"bd "+s));
    limb(Hp,K,8.4,6,s,"thigh"+k);limb(K,A,5.8,4,s,"shin"+k);
    const fw=J["ft"+k];limb(add(A,[-4*fw[0],-4,-4*fw[2]]),add(A,add(mul(fw,17),[0,-5.5,0])),3.6,2.6,s,"foot"+k);
    if(("delt"+k) in H){const b=ball(P,S,6.6,"mu",op(H["delt"+k]));b.d+=.03;out.push(b);}
    out.push(ball(P,S,6.2,"bd "+s)); // deltoid cap
  }
  const pc=J.pelvis,mid=J.mid,ch=J.chest,n0=out.length;
  out.push(capsule(P,J.hpL,J.hpR,11,11,"bd t"));out.push(capsule(P,pc,mid,12.2,12.8,"bd t"));out.push(capsule(P,mid,ch,13.4,14.2,"bd t"));
  const td=P(mid).d;
  // torso overlays: only shown on the side that faces the viewer
  const tov=(key,prim)=>{if(key in H){prim.d=td+.02;out.push(prim)}};
  for(const z of [1,-1]){const k=z>0?"L":"R",S=J["sh"+k];
    if(("pec"+k) in H)tov("pec"+k,capsule(P,add(add(S,mul(J.fwd,8)),[0,0,-4*z]),add(add(lerp3(ch,mid,.25),mul(J.fwd,11)),[0,0,5*z]),6.5,5,"mu",op(H["pec"+k],add(J.fwd,[0,0,.35*z]))));
    if(("lat"+k) in H)tov("lat"+k,capsule(P,add(add(S,mul(J.back,6)),mul(J.up,-6)),add(add(lerp3(ch,mid,.9),mul(J.back,7)),[0,0,10*z]),7,4.5,"mu",op(H["lat"+k],add(J.back,[0,0,.8*z]))))}
  if("upback" in H)tov("upback",ball(P,add(lerp3(ch,mid,.25),mul(J.back,10)),9,"mu",op(H.upback,J.back)));
  if("lowback" in H)tov("lowback",capsule(P,add(pc,mul(J.back,9)),add(mid,mul(J.back,10)),5.5,5.5,"mu",op(H.lowback,J.back)));
  if("glute" in H)tov("glute",ball(P,add(pc,mul(J.back,7)),9.5,"mu",op(H.glute,add(J.back,[0,0,.9]))));
  if("hipflexL" in H){const g=capsule(P,add(J.hpL,mul(J.fwd,5)),add(lerp3(J.hpL,J.knL,.38),mul(J.fwd,3)),5.6,4.6,"mu",op(H.hipflexL));g.d=P(J.hpL).d+.6;out.push(g)}
  // torso pieces share one depth so the trunk never splits around a limb
  for(let i=n0;i<n0+3;i++)out[i].d=td;
  out.push(capsule(P,ch,J.neck,5,4.6,"bd t"));const hd=ball(P,J.head,10.2,"bd t hd");hd.d=Math.max(P(J.head).d,td)+.01;out.push(hd);
  return out}
const lerp3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
// trunk from pelvis centre + lean (deg from upright, + = forward, -90 = lying on the back with head toward -x) and head pitch
function trunk(J,pc,lean,headLean){const a=rad(lean),u=[Math.sin(a),Math.cos(a),0],b=[-Math.cos(a),Math.sin(a),0];
  J.pelvis=pc;J.mid=add(pc,mul(u,25));J.chest=add(pc,mul(u,L.trunk));J.up=u;J.back=b;J.fwd=[Math.cos(a),-Math.sin(a),0];
  J.shL=add(J.chest,add(mul(u,-2),[0,0,18]));J.shR=add(J.chest,add(mul(u,-2),[0,0,-18]));J.hpL=add(pc,[0,0,9.5]);J.hpR=add(pc,[0,0,-9.5]);
  const h=rad(headLean),hu=[Math.sin(h),Math.cos(h),0];J.neck=add(J.chest,mul(u,6));J.head=add(J.neck,mul(hu,12));J.look=[Math.cos(h),-Math.sin(h),0]}
const toe=(deg,z)=>{const a=rad(deg)*Math.sign(z);return[Math.cos(a),0,Math.sin(a)]};
function legs(J,A0,deg,pole){for(const z of [1,-1]){const k=z>0?"L":"R",A=[A0[0],A0[1],A0[2]*z];J["an"+k]=A;J["ft"+k]=toe(deg,z);J["kn"+k]=ik(J["hp"+k],A,L.thigh,L.shin,[pole[0],pole[1],pole[2]*z])[0]}}
// reach for a grip point G (bar or handle in the hand): the wrist stops a hand-length short; returns where the hand really holds
function grip(J,k,G,pole){const S=J["sh"+k],Wt=sub(G,mul(norm(sub(G,S)),L.grip));const [E,W]=ik(S,Wt,L.upper,L.fore,pole);J["el"+k]=E;J["wr"+k]=W;return add(W,mul(norm(sub(W,E)),L.grip))}
function handsOnHips(J){for(const z of [1,-1]){const k=z>0?"L":"R";const W=add(add(J.pelvis,mul(J.up,9)),add(mul(J.fwd,3),[0,0,20.5*z]));const [E,W2]=ik(J["sh"+k],W,L.upper,L.fore,add(J.back,[0,0,.9*z]));J["el"+k]=E;J["wr"+k]=W2}}
const mid2=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2,0];
const flr=(P,x0=-62,x1=62)=>box(P,x0,x1,-1,0,-46,46,"flr");
// hinge (deadlift / RDL): bar height b, shoulder x sx, bar x bx, trunk angle al, grip half-width gz → hips placed so the arms hang straight
function hinge(J,b,sx,bx,al,gz){const dz=Math.abs(18-gz),reach=L.upper+L.fore+L.grip-.6,dx=bx-sx;
  const Sy=b+Math.sqrt(Math.max(1,reach*reach-dx*dx-dz*dz)),a=rad(al);const pc=[sx-L.trunk*Math.sin(a)+2*Math.sin(a),Sy+2*Math.cos(a)-L.trunk*Math.cos(a),0];
  trunk(J,pc,al,al*.55);legs(J,[0,9,14],8,[1,0,.3]);const g=[];for(const z of [1,-1])g.push(grip(J,z>0?"L":"R",[bx,b,gz*z],[-.3,0,z]));return g}
// ---------- exercises ----------
const EX={
squat:{cam:{yaw:-48,pitch:9,s:1.0,cx:102,cy:190},
  tl:[[.7,0,"Brace"],[1.9,1,"Sit down and back, 2 s"],[.35,1,"Bottom: knees out"],[1.15,0,"Drive up through mid-foot"]],
  hlFor:t=>({thighL:t,thighR:t,glute:t}),
  pose(t){const J={};const e=t;
    const pc=[lerp(-3,-21,e),lerp(95,43,e),0];trunk(J,pc,lerp(5,42,Math.pow(e,.9)),lerp(4,20,e));
    legs(J,[0,9,15],16,[1,0,.42]);
    const bar=add(add(J.chest,mul(J.back,7.5)),mul(J.up,1));J.bar=bar;
    for(const z of [1,-1]){const k=z>0?"L":"R";const [E,W2]=ik(J["sh"+k],add(bar,[0,0,31*z]),L.upper,L.fore,add(J.back,mul(J.up,-1.1)));J["el"+k]=E;J["wr"+k]=W2}
    return J},
  gear(P,J){return barbell(P,J.bar,[])},
  floor(P){return box(P,-62,62,-2,0,-50,50,"plat")}},
press:{cam:{yaw:-70,pitch:8,s:1.04,cx:104,cy:190},
  tl:[[.6,0,"Elbows under wrists"],[1.25,1,"Press up and slightly in"],[.3,1,"Soft elbows at the top"],[1.9,0,"Lower with control, 2 s"]],
  hlFor:t=>({deltL:.25+.75*t,deltR:.25+.75*t,upperL:t*.8,upperR:t*.8}),
  pose(t){const J={};const e=t;trunk(J,[-3,52,0],-5,-2);legs(J,[42,9,19],10,[1,1.2,.15]);
    for(const z of [1,-1]){const k=z>0?"L":"R";
      const W=[lerp(3,2,e),lerp(102,155,e)+Math.sin(e*Math.PI)*2,lerp(35,14,Math.pow(e,1.1))*z];
      const [E,W2]=ik(J["sh"+k],W,L.upper,L.fore,[.25,-.55,1.1*z]);J["el"+k]=E;J["wr"+k]=W2}
    return J},
  gear(P,J){const o=[];for(const k of ["L","R"])dumbbell(P,J["wr"+k],[0,0,1],o);return o},
  floor(P){return [...flr(P,-60,60),...box(P,-26,26,0,3,-15,15,"bench"),...box(P,-3,3,3,40,-4,4,"bench"),...box(P,-20,24,40,46,-13,13,"pad"),
    ...box(P,-30,-24,30,46,-3,3,"bench"),...box(P,-34,-26,46,120,-12.5,12.5,"pad")]}},
hip:{cam:{yaw:-24,pitch:11,s:1.18,cx:108,cy:182},
  tl:[[.8,0,"Tall kneel, squeeze the back glute"],[2.1,1,"Shift hips forward, 2 s"],[2.6,1,"Hold: feel the front of the back hip"],[1.7,0,"Ease back"]],
  hlFor:t=>({hipflexL:t}),
  pose(t){const J={};const e=t;const ph=rad(lerp(5,27,e)),K=[-12,6.5,11];
    const hipL=add(K,[L.thigh*Math.sin(ph),L.thigh*Math.cos(ph),-1.5]);const pc=add(hipL,[0,0,-9.5]);trunk(J,pc,lerp(1,-4,e),lerp(2,-2,e));
    J.knL=K;J.anL=[-54,8.5,11];J.ftL=[-1,0,0];
    const A=[40,9,-13];J.anR=A;J.ftR=toe(6,-1);J.knR=ik(J.hpR,A,L.thigh,L.shin,[1,.9,0])[0];
    handsOnHips(J);return J},
  gear(){return[]},
  floor(P){return [...flr(P,-80,70),...box(P,-74,60,0,1.6,-24,24,"mat")]}},
bench:{cam:{yaw:-62,pitch:22,s:.9,cx:100,cy:166,dy:1},
  tl:[[.6,0,"Shoulder blades back, feet down"],[1.8,1,"Lower to the lower chest, 2 s"],[.3,1,"Touch, stay tight"],[1.1,0,"Press back over the shoulders"]],
  hlFor:t=>({pecL:.3+.7*t,pecR:.3+.7*t,deltL:.5*t,deltR:.5*t,upperL:.6*t,upperR:.6*t}),
  pose(t){const J={};trunk(J,[22,55,0],-84,-100);legs(J,[60,9,26],12,[.3,1,.4]);
    const c=J.chest,top=[c[0]+1,c[1]+60],bot=[c[0]+16,c[1]+15.5],e=Math.pow(t,.85);
    const g=[];for(const z of [1,-1])g.push(grip(J,z>0?"L":"R",[lerp(top[0],bot[0],e),lerp(top[1],bot[1],t),30*z],[.7,-1,1.3*z]));J.bar=mid2(g[0],g[1]);return J},
  gear(P,J){return barbell(P,J.bar,[])},
  floor(P){return [...flr(P,-80,80),...box(P,-50,-44,0,38,-9,9,"bench"),...box(P,36,42,0,38,-9,9,"bench"),...box(P,-58,48,38,44,-13,13,"pad")]}},
deadlift:{cam:{yaw:-50,pitch:9,s:.98,cx:100,cy:190},
  tl:[[.7,0,"Bar over mid-foot, chest up"],[1.4,1,"Push the floor away"],[.5,1,"Stand tall, squeeze the glutes"],[1.6,0,"Hips back, lower with control"]],
  hlFor:t=>({glute:.5+.5*t,thighL:.25+.6*(1-t),thighR:.25+.6*(1-t),lowback:.5}),
  pose(t){const J={};const al=60*(1-ss(.3,1,t)),g=hinge(J,lerp(22.5,80.6,t),lerp(10,2,ss(.45,1,t)),lerp(8,12,ss(.4,1,t)),al,24);J.bar=mid2(g[0],g[1]);return J},
  gear(P,J){return barbell(P,J.bar,[])},
  floor(P){return box(P,-62,62,-2,0,-50,50,"plat")}},
rdl:{cam:{yaw:-42,pitch:9,s:.98,cx:100,cy:190},
  tl:[[.6,0,"Soft knees, bar against the thighs"],[1.9,1,"Push the hips back, 2 s"],[.35,1,"Feel the hamstrings stretch"],[1.2,0,"Hips forward to stand"]],
  hlFor:t=>({thighL:.2+.7*t,thighR:.2+.7*t,glute:.4+.5*t,lowback:.35}),
  pose(t,v){const J={};const db=v==="db",g=hinge(J,lerp(db?82:80.6,36,t),lerp(2,13,t),lerp(12,11,t),lerp(2,68,t),db?13:24);J.g=g;J.bar=mid2(g[0],g[1]);return J},
  gear(P,J,v){const o=[];if(v==="db"){for(const g of J.g)dumbbell(P,g,[0,0,1],o);return o}return barbell(P,J.bar,o)},
  floor(P){return box(P,-62,62,-2,0,-50,50,"plat")}},
ohp:{cam:{yaw:-55,pitch:8,s:.88,cx:100,cy:190},
  tl:[[.7,0,"Bar on the front of the shoulders"],[1.2,1,"Press up, head back out of the way"],[.4,1,"Lock out over mid-foot"],[1.6,0,"Lower to the collarbones"]],
  hlFor:t=>({deltL:.4+.6*t,deltR:.4+.6*t,upperL:.8*t,upperR:.8*t}),
  pose(t){const J={};trunk(J,[-1,95,0],lerp(0,-4,ss(0,.6,t)),-14*bump(.12,.62,t));legs(J,[0,9,14],8,[1,0,.3]);
    const c=J.chest,G=[c[0]+lerp(15,2,ss(.4,1,t)),c[1]+lerp(0,60,t),0];const p=lerp3([1,-1,.6],[.4,-.6,1],t);
    const g=[];for(const z of [1,-1])g.push(grip(J,z>0?"L":"R",[G[0],G[1],25*z],[p[0],p[1],p[2]*z]));J.bar=mid2(g[0],g[1]);return J},
  gear(P,J){return barbell(P,J.bar,[])},
  floor(P){return box(P,-62,62,-2,0,-50,50,"plat")}},
row:{cam:{yaw:-36,pitch:10,s:.96,cx:100,cy:188},
  tl:[[.6,0,"Hinge to about 45°, back flat"],[1.0,1,"Pull to the belly button"],[.4,1,"Squeeze the shoulder blades"],[1.6,0,"Lower with control"]],
  hlFor:t=>({latL:.2+.8*t,latR:.2+.8*t,upback:.2+.8*t,upperL:.5*t,upperR:.5*t}),
  pose(t){const J={};trunk(J,[-24,84,0],58,38);legs(J,[0,9,15],8,[1,0,.3]);
    const S=J.shL,top=add(add(J.pelvis,mul(J.up,28)),mul(J.fwd,16.5)),bot=[S[0]+2,S[1]-62];
    const g=[];for(const z of [1,-1])g.push(grip(J,z>0?"L":"R",[lerp(bot[0],top[0],t),lerp(bot[1],top[1],t),26*z],[-1,.6,.4*z]));J.bar=mid2(g[0],g[1]);return J},
  gear(P,J){return barbell(P,J.bar,[])},
  floor(P){return box(P,-62,62,-2,0,-50,50,"plat")}},
pulldown:{cam:{yaw:-40,pitch:6,s:.92,cx:96,cy:192},
  tl:[[.6,0,"Thighs under the pad, chest up"],[1.1,1,"Pull the bar to the upper chest"],[.4,1,"Elbows down and back"],[1.8,0,"Let the arms rise slowly"]],
  hlFor:t=>({latL:.25+.75*t,latR:.25+.75*t,upback:.6*t,upperL:.4*t,upperR:.4*t}),
  pose(t){const J={};const lean=lerp(-10,-18,t);trunk(J,[-3,51,0],lean,lean*.6);legs(J,[34,9,16],8,[1,1,.15]);
    const S=J.shL,top=[J.chest[0]+6,S[1]+57],bot=[J.chest[0]+19,S[1]+5];
    const g=[];for(const z of [1,-1])g.push(grip(J,z>0?"L":"R",[lerp(top[0],bot[0],t),lerp(top[1],bot[1],t),40*z],[-.3,-1,1*z]));J.bar=mid2(g[0],g[1]);return J},
  gear(P,J){const o=[],b=J.bar;for(let i=0;i<10;i++)o.push(capsule(P,add(b,[0,0,-40+i*8]),add(b,[0,0,-32+i*8]),1.4,1.4,"metal"));
    for(const z of [1,-1])o.push(capsule(P,add(b,[0,0,40*z]),add(b,[0,-6,50*z]),1.4,1.4,"metal"));
    const cb=capsule(P,b,[4,164,0],.6,.6,"metal");cb.d=P(b).d-.5;o.push(cb);
    const k=J.knL,pad=box(P,k[0]-7,k[0]+5,k[1]+6.5,k[1]+13,-19,19,"pad");for(const f of pad)f.d=P(k).d+30;o.push(...pad);return o},
  floor(P){return [...flr(P,-60,70),...box(P,-18,18,0,3,-14,14,"bench"),...box(P,-3,3,3,40,-4,4,"bench"),...box(P,-18,20,40,46,-14,14,"pad"),
    ...box(P,46,54,0,172,-6,6,"bench"),...box(P,0,54,166,172,-4,4,"bench")]}},
lunge:{cam:{yaw:-30,pitch:10,s:.98,cx:104,cy:188},
  tl:[[.6,0,"Long stance, tall chest"],[1.6,1,"Drop the back knee, 2 s"],[.3,1,"Front knee over the foot"],[1.2,0,"Drive up through the front heel"]],
  hlFor:t=>({thighR:.25+.75*t,glute:.3+.6*t,thighL:.3*t}),
  pose(t,v){const J={};trunk(J,[lerp(-2,-4,t),lerp(88,52,t),0],lerp(3,8,t),0);
    const A=[36,9,-12];J.anR=A;J.ftR=toe(6,-1);J.knR=ik(J.hpR,A,L.thigh,L.shin,[1,.4,0])[0];
    const B=[-40,17,12];J.anL=B;J.ftL=norm([1,-.5,0]);J.knL=ik(J.hpL,B,L.thigh,L.shin,[1,-1.5,0])[0];
    if(v==="db"){J.g=[];for(const z of [1,-1]){const k=z>0?"L":"R",S=J["sh"+k];J.g.push(grip(J,k,[S[0]+2,S[1]-63,(18+4)*z],[-1,0,.3*z]))}}
    else if(v==="bb"){const bar=add(add(J.chest,mul(J.back,7.5)),mul(J.up,1));J.bar=bar;for(const z of [1,-1]){const k=z>0?"L":"R";const [E,W]=ik(J["sh"+k],add(bar,[0,0,31*z]),L.upper,L.fore,add(J.back,mul(J.up,-1.1)));J["el"+k]=E;J["wr"+k]=W}}
    else handsOnHips(J);return J},
  gear(P,J,v){const o=[];if(v==="db"){for(const g of J.g)dumbbell(P,g,[1,0,0],o)}else if(v==="bb")barbell(P,J.bar,o);return o},
  floor(P){return flr(P,-70,70)}},
thrust:{cam:{yaw:-60,pitch:16,s:.96,cx:104,cy:184,dy:1},
  tl:[[.6,0,"Upper back on the bench, chin tucked"],[1.0,1,"Drive the hips up"],[.8,1,"Squeeze the glutes at the top"],[1.5,0,"Lower with control"]],
  hlFor:t=>({glute:.3+.7*t,thighL:.35*t,thighR:.35*t}),
  pose(t){const J={};const C=[-40,49,0],ph=rad(lerp(36,-2,t)),pc=add(C,[L.trunk*Math.cos(ph),-L.trunk*Math.sin(ph),0]),a=lerp(36,-2,t)-90;
    trunk(J,pc,a,a*.55);legs(J,[36,9,16],8,[.4,1,.25]);
    J.bar=add(pc,mul(J.fwd,15));for(const z of [1,-1])grip(J,z>0?"L":"R",add(J.bar,[0,0,30*z]),[-1,.5,.5*z]);return J},
  gear(P,J){return barbell(P,J.bar,[])},
  floor(P){return [...flr(P,-90,70),...box(P,-84,-38,0,42,-26,26,"pad")]}},
benchDb:{cam:{yaw:-62,pitch:22,s:.9,cx:100,cy:166,dy:1},
  tl:[[.6,0,"Dumbbells over the shoulders"],[1.8,1,"Lower to chest level, 2 s"],[.3,1,"Elbows about 45° from the body"],[1.1,0,"Press up and slightly in"]],
  hlFor:t=>({pecL:.3+.7*t,pecR:.3+.7*t,deltL:.5*t,deltR:.5*t,upperL:.6*t,upperR:.6*t}),
  pose(t){const J={};trunk(J,[22,55,0],-84,-100);legs(J,[60,9,26],12,[.3,1,.4]);const c=J.chest;J.g=[];
    for(const z of [1,-1]){const k=z>0?"L":"R",S=J["sh"+k];J.g.push(grip(J,k,lerp3([S[0]+1,S[1]+58,17*z],[c[0]+9,c[1]+9,36*z],t),[.4,-1,1.2*z]))}return J},
  gear(P,J){const o=[];for(const g of J.g)dumbbell(P,g,[0,0,1],o);return o},
  floor(P){return [...flr(P,-80,80),...box(P,-50,-44,0,38,-9,9,"bench"),...box(P,36,42,0,38,-9,9,"bench"),...box(P,-58,48,38,44,-13,13,"pad")]}},
incline:{cam:{yaw:-58,pitch:14,s:.92,cx:104,cy:184},
  tl:[[.6,0,"Back on the pad, feet down"],[1.8,1,"Lower to the upper chest, 2 s"],[.3,1,"Stay tight"],[1.1,0,"Press straight up"]],
  hlFor:t=>({pecL:.3+.7*t,pecR:.3+.7*t,deltL:.2+.5*t,deltR:.2+.5*t,upperL:.6*t,upperR:.6*t}),
  pose(t,v){const J={},bb=v==="bb";trunk(J,[0,50,0],-52,-35);legs(J,[42,9,24],10,[.3,1,.3]);const cp=add(lerp3(J.chest,J.mid,.15),mul(J.fwd,bb?17:7));J.g=[];
    for(const z of [1,-1]){const k=z>0?"L":"R",S=J["sh"+k];J.g.push(grip(J,k,lerp3([S[0]+2,S[1]+58,(bb?30:17)*z],[cp[0],cp[1],(bb?30:36)*z],t),[.4,-1,1.2*z]))}J.bar=mid2(J.g[0],J.g[1]);return J},
  gear(P,J,v){const o=[];if(v==="bb")return barbell(P,J.bar,o);for(const g of J.g)dumbbell(P,g,[0,0,1],o);return o},
  floor(P,J){return [...flr(P,-70,70),...box(P,-14,18,38,44,-14,14,"pad"),...box(P,-3,3,0,38,-4,4,"bench"),...box(P,-36,24,0,3,-14,14,"bench"),
    ...obox(P,add(add(J.pelvis,mul(J.up,30)),mul(J.back,17)),J.up,J.fwd,[0,0,1],31,3,13,"pad"),...box(P,-34,-28,0,40,-3,3,"bench")]}},
pullup:{cam:{yaw:-35,pitch:6,s:.82,cx:100,cy:202},noShadow:1,
  tl:[[.6,0,"Hang, shoulders set down"],[1.1,1,"Pull the elbows down to the ribs"],[.4,1,"Chin over the bar"],[1.6,0,"Lower all the way, 2 s"]],
  hlFor:t=>({latL:.3+.7*t,latR:.3+.7*t,upback:.6*t,upperL:.5*t,upperR:.5*t}),
  pose(t){const J={};const lean=lerp(-4,-12,t),a=rad(lean),u=[Math.sin(a),Math.cos(a),0],S=[lerp(-3,-9,t),lerp(154,199,t),0];
    trunk(J,sub(S,mul(u,48)),lean,lean*.5);const pc=J.pelvis;
    J.anL=add(pc,[-22,-68,-2]);J.anR=add(pc,[-24,-66,3]);J.ftL=J.ftR=norm([.4,-1,0]);for(const k of ["L","R"])J["kn"+k]=ik(J["hp"+k],J["an"+k],L.thigh,L.shin,[1,0,0])[0];
    for(const z of [1,-1])grip(J,z>0?"L":"R",[0,215,32*z],[.3,-1,1*z]);return J},
  gear(P){const o=[];for(let i=0;i<19;i++)o.push(capsule(P,[0,215,-76+i*8],[0,215,-68+i*8],1.6,1.6,"metal"));return o},
  floor(P){return [...box(P,-3,3,0,219,72,78,"bench"),...box(P,-3,3,0,219,-78,-72,"bench")]}},
cableRow:{cam:{yaw:-35,pitch:10,s:1.02,cx:92,cy:180},
  tl:[[.6,0,"Sit tall, arms long"],[1.0,1,"Pull to the belly, chest up"],[.4,1,"Squeeze the shoulder blades"],[1.6,0,"Reach forward slowly"]],
  hlFor:t=>({latL:.25+.75*t,latR:.25+.75*t,upback:.2+.8*t,upperL:.4*t,upperR:.4*t}),
  pose(t){const J={};const lean=lerp(14,-6,t);trunk(J,[-12,48,0],lean,lean*.5);
    for(const z of [1,-1]){const k=z>0?"L":"R",A=[44,24,14*z];J["an"+k]=A;J["ft"+k]=norm([.45,.9,0]);J["kn"+k]=ik(J["hp"+k],A,L.thigh,L.shin,[0,1,.2*z])[0]}
    const S=J.shL,top=add(add(J.pelvis,mul(J.up,22)),mul(J.fwd,18));J.g=[];
    for(const z of [1,-1])J.g.push(grip(J,z>0?"L":"R",[lerp(S[0]+60,top[0],t),lerp(S[1]-10,top[1],t),6*z],[-1,-.3,.5*z]));J.h=mid2(J.g[0],J.g[1]);return J},
  gear(P,J){const o=[],h=J.h;o.push(capsule(P,add(h,[0,0,-7]),add(h,[0,0,7]),1.8,1.8,"metal"));const c=capsule(P,add(h,[2,0,0]),[66,18,0],.6,.6,"metal");c.d=P(h).d-.5;o.push(c);return o},
  floor(P){return [...flr(P,-70,90),...box(P,-46,64,0,4,-6,6,"bench"),...box(P,-46,14,34,40,-13,13,"pad"),...box(P,-30,-24,4,34,-4,4,"bench"),...box(P,4,10,4,34,-4,4,"bench"),
    ...box(P,50,53,4,42,-20,20,"bench"),...box(P,64,80,0,30,-10,10,"bench")]}},
lateral:{cam:{yaw:-68,pitch:8,s:.9,cx:100,cy:190},
  tl:[[.5,0,"Soft elbows, slight lean"],[1.1,1,"Raise out to the sides"],[.4,1,"Stop at shoulder height"],[1.7,0,"Lower slowly, 2 s"]],
  hlFor:t=>({deltL:.3+.7*t,deltR:.3+.7*t}),
  pose(t){const J={};trunk(J,[-1,95,0],5,5);legs(J,[0,9,14],8,[1,0,.3]);const th=rad(lerp(4,82,t));J.g=[];
    for(const z of [1,-1]){const k=z>0?"L":"R",S=J["sh"+k];J.g.push(grip(J,k,[S[0]+5,S[1]-60*Math.cos(th),z*(24+60*Math.sin(th))],[-.3,1,0]))}return J},
  gear(P,J){const o=[];for(const g of J.g)dumbbell(P,g,[1,0,0],o);return o},
  floor(P){return flr(P)}},
curl:{cam:{yaw:-40,pitch:8,s:.95,cx:100,cy:190},
  tl:[[.5,0,"Elbows by your sides"],[1.1,1,"Curl up"],[.4,1,"Squeeze"],[1.8,0,"Lower slowly, 2 s"]],
  hlFor:t=>({upperL:.3+.7*t,upperR:.3+.7*t,foreL:.25*t,foreR:.25*t}),
  pose(t,v){const J={};trunk(J,[-1,95,0],2,2);legs(J,[0,9,14],8,[1,0,.3]);const ph=rad(lerp(12,135,t)),d=[Math.sin(ph),-Math.cos(ph),0];J.g=[];
    for(const z of [1,-1]){const k=z>0?"L":"R",E=add(J["sh"+k],[3,-31,(v==="bb"?1:3)*z]),W=add(E,mul(d,27));J["el"+k]=E;J["wr"+k]=W;J.g.push(add(W,mul(d,6)))}
    J.bar=mid2(J.g[0],J.g[1]);J.d=d;return J},
  gear(P,J,v){const o=[];if(v==="bb")return barbell(P,J.bar,o,17);for(const g of J.g)dumbbell(P,g,v==="hammer"?[J.d[1]*-1,J.d[0],0]:[0,0,1],o);return o},
  floor(P){return flr(P)}},
pushdown:{cam:{yaw:-128,pitch:6,s:.86,cx:100,cy:192},
  tl:[[.5,0,"Elbows pinned to your sides"],[1.0,1,"Push down to straight arms"],[.4,1,"Squeeze the triceps"],[1.6,0,"Let the forearms rise, 2 s"]],
  hlFor:t=>({upperL:.3+.7*t,upperR:.3+.7*t}),
  pose(t,v){const J={};trunk(J,[-4,94,0],12,8);legs(J,[2,9,15],8,[1,0,.3]);const ph=rad(lerp(118,6,t)),d=[Math.sin(ph),-Math.cos(ph),0];J.g=[];
    for(const z of [1,-1]){const k=z>0?"L":"R",E=add(J["sh"+k],[4,-30,-2*z]),W=add(E,mul(d,27));J["el"+k]=E;J["wr"+k]=W;J.g.push(add(add(W,mul(d,5)),[0,0,v==="rope"?4*t*z:0]))}
    J.h=mid2(J.g[0],J.g[1]);return J},
  gear(P,J,v){const o=[],h=J.h,top=add(h,[0,v==="rope"?9:0,0]);
    if(v==="rope"){for(const g of J.g){o.push(capsule(P,top,g,1.6,1.6,"metal"));o.push(ball(P,g,2.6,"metal"))}}else o.push(capsule(P,add(h,[0,0,-22]),add(h,[0,0,22]),1.5,1.5,"metal"));
    const c=capsule(P,top,[16,186,0],.6,.6,"metal");c.d=P(h).d-.5;o.push(c);return o},
  floor(P){return [...flr(P,-60,70),...box(P,26,36,0,192,-7,7,"bench"),...box(P,10,36,186,192,-3,3,"bench")]}},
legPress:{cam:{yaw:-34,pitch:12,s:1.0,cx:62,cy:178},
  tl:[[.5,0,"Back flat on the pad"],[1.8,1,"Lower until the knees are near the chest, 2 s"],[.3,1,"Hips stay down"],[1.1,0,"Push through the whole foot"]],
  hlFor:t=>({thighL:.3+.7*t,thighR:.3+.7*t,glute:.2+.6*t}),
  pose(t){const J={};trunk(J,[0,44,0],-52,-40);const d=norm([1,.9,0]),n=[-d[1],d[0],0],A=add(add(J.pelvis,mul(d,lerp(84,50,t))),mul(n,-2));J.A=A;J.d=d;J.n=n;
    for(const z of [1,-1]){const k=z>0?"L":"R",An=add(A,[0,0,16*z]);J["an"+k]=An;J["ft"+k]=n;J["kn"+k]=ik(J["hp"+k],An,L.thigh,L.shin,[-.1,1,.3*z])[0]}
    for(const z of [1,-1])grip(J,z>0?"L":"R",add(J.pelvis,[6,4,25*z]),[-1,0,.5*z]);return J},
  gear(P,J){return obox(P,add(add(J.A,mul(J.d,4)),mul(J.n,6)),J.d,J.n,[0,0,1],2,22,24,"bench")},
  floor(P,J){const pc=J.pelvis,d=norm([1,.9,0]),n=[-d[1],d[0],0];return [...flr(P,-50,120),...box(P,-40,100,0,8,-20,20,"bench"),...box(P,-12,12,8,30,-10,10,"bench"),...box(P,88,96,8,110,-6,6,"bench"),...box(P,-16,16,30,37,-15,15,"pad"),
    ...obox(P,add(add(pc,mul(J.up,28)),mul(J.back,17)),J.up,J.fwd,[0,0,1],27,3,14,"pad"),...obox(P,add(add(pc,mul(d,82)),mul(n,-12)),d,n,[0,0,1],34,3,26,"bench")]}},
legExt:{cam:{yaw:-35,pitch:10,s:1.0,cx:92,cy:182},
  tl:[[.5,0,"Back against the pad, hold the handles"],[1.1,1,"Straighten the knees"],[.5,1,"Squeeze the quads"],[1.7,0,"Lower slowly, 2 s"]],
  hlFor:t=>({thighL:.3+.7*t,thighR:.3+.7*t}),
  pose(t){const J={};trunk(J,[-2,54,0],-8,-4);const ph=rad(lerp(8,82,t)),sd=[Math.sin(ph),-Math.cos(ph),0],fr=[Math.cos(ph),Math.sin(ph),0];
    for(const z of [1,-1]){const k=z>0?"L":"R",K=add(J["hp"+k],[43,-1,3*z]);J["kn"+k]=K;J["an"+k]=add(K,mul(sd,43));J["ft"+k]=fr}J.K=add(J.pelvis,[43,-1,0]);J.sd=sd;J.fr=fr;
    for(const z of [1,-1])grip(J,z>0?"L":"R",add(J.pelvis,[4,0,26*z]),[-1,0,.6*z]);return J},
  gear(P,J){const o=[],r=add(add(J.K,mul(J.sd,35)),mul(J.fr,7));o.push(capsule(P,add(r,[0,0,-15]),add(r,[0,0,15]),4.5,4.5,"pad"));
    for(const z of [1,-1])o.push(capsule(P,add(J.K,[0,0,22*z]),add(r,[0,0,17*z]),1.8,1.8,"metal"));return o},
  floor(P,J){const pc=J.pelvis;return [...flr(P,-60,80),...box(P,-24,40,42,48,-15,15,"pad"),...box(P,-20,30,0,42,-8,8,"bench"),...obox(P,add(add(pc,mul(J.up,28)),mul(J.back,16)),J.up,J.fwd,[0,0,1],25,3,14,"pad")]}},
legCurl:{cam:{yaw:-35,pitch:10,s:.95,cx:88,cy:182},
  tl:[[.5,0,"Pad on top of the thighs"],[1.1,1,"Curl the heels under"],[.4,1,"Squeeze the hamstrings"],[1.7,0,"Straighten slowly, 2 s"]],
  hlFor:t=>({thighL:.3+.7*t,thighR:.3+.7*t}),
  pose(t){const J={};trunk(J,[-2,54,0],-14,-8);const ph=rad(lerp(80,-8,t)),sd=[Math.sin(ph),-Math.cos(ph),0],fr=[Math.cos(ph),Math.sin(ph),0];
    for(const z of [1,-1]){const k=z>0?"L":"R",K=add(J["hp"+k],[43,-1,3*z]);J["kn"+k]=K;J["an"+k]=add(K,mul(sd,43));J["ft"+k]=fr}J.K=add(J.pelvis,[43,-1,0]);J.sd=sd;J.fr=fr;
    for(const z of [1,-1])grip(J,z>0?"L":"R",add(J.pelvis,[4,0,26*z]),[-1,0,.6*z]);return J},
  gear(P,J){const o=[],r=sub(add(J.K,mul(J.sd,37)),mul(J.fr,7));o.push(capsule(P,add(r,[0,0,-15]),add(r,[0,0,15]),4.5,4.5,"pad"));
    for(const z of [1,-1])o.push(capsule(P,add(J.K,[0,0,22*z]),add(r,[0,0,17*z]),1.8,1.8,"metal"));
    const K=J.K,pad=box(P,K[0]-16,K[0]-2,K[1]+8,K[1]+14,-18,18,"pad");for(const f of pad)f.d=P(K).d+30;o.push(...pad);return o},
  floor(P,J){const pc=J.pelvis;return [...flr(P,-60,90),...box(P,-24,40,42,48,-15,15,"pad"),...box(P,-20,30,0,42,-8,8,"bench"),...obox(P,add(add(pc,mul(J.up,28)),mul(J.back,16)),J.up,J.fwd,[0,0,1],25,3,14,"pad")]}}

};
const ORDER={};
function frame(name,t,v){const X=EX[name],P=cam(X.cam),build=t=>{const J=X.pose(t,v);return{J,items:[...body(P,J,X.hlFor(t,v)),...X.gear(P,J,v)]}};
  const ok=name+"|"+(v||"");if(!ORDER[ok]){const mid=build(.5).items;ORDER[ok]=mid.map((o,i)=>[o.d,i]).sort((a,b)=>a[0]-b[0]).map(x=>x[1])}
  const B=build(t),J=B.J,bg=X.floor(P,J,v),items=ORDER[ok].map(i=>B.items[i]);
  const pc=J.pelvis,sh=P([pc[0]+4,0,0]);
  return bg.sort((a,b)=>a.d-b.d).map(o=>o.svg).join("")+(X.noShadow?"":`<ellipse class="shadow" cx="${f1(sh.x)}" cy="${f1(sh.y)}" rx="${f1(48*P.s)}" ry="${f1(9*P.s)}"/>`)+items.map(o=>o.svg).join("")}
function timeline(name,clock){const tl=EX[name].tl,tot=tl.reduce((s,x)=>s+x[0],0);let c=clock%tot,prev=tl[tl.length-1][1];
  for(const [dur,to,cue] of tl){if(c<dur){return{t:lerp(prev,to,ease(c/dur)),cue}}c-=dur;prev=to}return{t:prev,cue:tl[0][2]}}
return{frame,timeline,EX};
})();
// which demos use the new drawing (fits = names the drawing really shows, e.g. dumbbells not a Smith machine)
const ND_MAP={"ex:squat":{k:"squat",fits:n=>!/pendulum|v-squat|belt|machine|box|hack/i.test(n)},
  "ex:ohpSeated":{k:"press",fits:n=>/dumbbell/i.test(n)&&!/standing|single|one-arm/i.test(n)},
  "hip flexor stretch":{k:"hip",fits:()=>true},
  "ex:bench":{k:"bench",fits:n=>!/smith|pin|dumbbell|machine|incline|decline/i.test(n)},
  "ex:deadlift":{k:"deadlift",fits:n=>!/kettlebell|trap|hex|sumo|deficit|dumbbell|single/i.test(n)},
  "ex:rdl":{k:"rdl",fits:n=>!/b-stance|kettlebell|single|one-leg|cable|pull-through/i.test(n),v:n=>/dumbbell/i.test(n)?"db":""},
  "ex:ohp":{k:"ohp",fits:n=>/overhead press|military press|barbell (shoulder )?press/i.test(n)&&!/dumbbell|kettlebell|seated|push press|single/i.test(n)},
  "ex:row":{k:"row",fits:n=>/barbell row|pendlay|yates|bent[- ]over row/i.test(n)&&!/dumbbell|single|one-arm|seal|meadows|t-bar|landmine|chest/i.test(n)},
  "ex:pulldown":{k:"pulldown",fits:n=>/pulldown|pull-down/i.test(n)&&!/single|one-arm|neutral|close|straight|v-bar/i.test(n)},
  "ex:lunge":{k:"lunge",fits:n=>!/curtsy|lateral|side|cossack/i.test(n),v:n=>/dumbbell/i.test(n)?"db":/barbell/i.test(n)?"bb":""},
  "ex:hipThrust":{k:"thrust",fits:n=>!/single|one-leg|b-stance|machine|smith|band/i.test(n)},
  "ex:benchDb":{k:"benchDb",fits:n=>!/single|one-arm|floor|decline/i.test(n)},
  "ex:inclineDb":{k:"incline",fits:n=>!/single|one-arm/i.test(n)},
  "ex:incline":{k:"incline",fits:n=>!/smith|machine/i.test(n),v:()=>"bb"},
  "ex:pullup":{k:"pullup",fits:n=>!/archer|typewriter|scapular|assisted|machine|band|rope|climb/i.test(n)},
  "ex:cableRow":{k:"cableRow",fits:n=>!/single|one-arm|machine/i.test(n)},
  "ex:lateral":{k:"lateral",fits:n=>(/dumbbell/i.test(n)||/^lateral raises?$/i.test(n.trim()))&&!/seated|lean|behind|single|one-arm/i.test(n)},
  "ex:curl":{k:"curl",fits:n=>!/zottman|cross-body|waiter|seated|incline|concentration|spider|preacher|single|one-arm/i.test(n),v:n=>/hammer/i.test(n)?"hammer":""},
  "ex:curlBar":{k:"curl",fits:n=>!/drag/i.test(n),v:()=>"bb"},
  "ex:pushdown":{k:"pushdown",fits:n=>!/single|one-arm|kickback/i.test(n),v:n=>/rope/i.test(n)?"rope":""},
  "ex:legPress":{k:"legPress",fits:n=>!/single|one-leg|calf/i.test(n)},
  "ex:legExt":{k:"legExt",fits:n=>!/single|one-leg/i.test(n)},
  "ex:legCurlSeated":{k:"legCurl",fits:n=>/seated/i.test(n)&&!/single|one-leg/i.test(n)}};
const ND_STILL={squat:.8,press:.75,hip:1,bench:.5,deadlift:.15,rdl:.85,ohp:.6,row:.85,pulldown:.85,lunge:.9,thrust:1,benchDb:.5,incline:.5,pullup:.9,cableRow:.9,lateral:.85,curl:.8,pushdown:.7,legPress:.6,legExt:.85,legCurl:.8};
let ndRun=false,ndLast=0;const ndT0=performance.now(),ndReduce=window.matchMedia?window.matchMedia("(prefers-reduced-motion: reduce)"):{matches:false};
function ndTick(now){const els=document.querySelectorAll("svg[data-nd]");if(!els.length){ndRun=false;return}
  if(now-ndLast>=32){ndLast=now;const c=(now-ndT0)/1000,vh=window.innerHeight||800;let drawn=0;
    for(const el of els){if(drawn>=6)break;const r=el.getBoundingClientRect();if(!r.width||r.bottom<0||r.top>vh)continue;drawn++;const k=el.dataset.nd;el.innerHTML=ND.frame(k,ND.timeline(k,c).t,el.dataset.ndv||"")}}
  requestAnimationFrame(ndTick)}
function ndStart(){if(!ndRun&&!ndReduce.matches&&typeof requestAnimationFrame==="function"){ndRun=true;requestAnimationFrame(ndTick)}}
function ndSVG(k,name,size,still,v){const anim=!still&&!ndReduce.matches;const t=anim?ND.timeline(k,(performance.now()-ndT0)/1000).t:ND_STILL[k];if(anim)ndStart();v=v||"";
  return `<svg class="demo nfig" viewBox="0 0 200 200" width="${size||200}" height="${size||200}" aria-label="${anim?"Animated demo":"Demo"}: ${esc(String(name))}" role="img"${anim?` data-nd="${k}"${v?` data-ndv="${v}"`:""}`:""}>${ND.frame(k,t,v)}</svg>`}
function demoSVG(name,size,still){const key=anyDemoKey(name);const nd=key&&ND_MAP[key];if(nd&&nd.fits(String(name||"")))return ndSVG(nd.k,name,size,still,nd.v&&nd.v(String(name||"")));const D=key&&DEMOS[key];if(!D)return"";
  const label=`aria-label="Animated demo: ${esc(String(name))}" role="img"`;
  if(D.breath){const tot=D.breath.reduce((a,x)=>a+x[1],0);let t=0;const kt=[0],rv=[];const r0=24,r1=42;let r=r0;rv.push(r0);
    D.breath.forEach(([l,d])=>{t+=d;kt.push(+(t/tot).toFixed(4));r=/in/i.test(l)?r1:/out/i.test(l)?r0:r;rv.push(r)});
    let acc=0;const texts=D.breath.map(([l,d])=>{const a=acc/tot,b=(acc+d)/tot;acc+=d;const vals=[0,a,a+0.001,b-0.001,b,1].map(x=>+x.toFixed(4));
      return `<text x="50" y="54" text-anchor="middle" class="dt" opacity="0">${esc(l)}<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="${vals.join(";")}" dur="${tot}s" repeatCount="indefinite"/></text>`}).join("");
    return `<svg class="demo" viewBox="0 0 100 100" width="${size||200}" height="${size||200}" ${label}><circle cx="50" cy="50" r="${r0}" class="db"><animate attributeName="r" values="${rv.join(";")}" keyTimes="${kt.join(";")}" dur="${tot}s" repeatCount="indefinite" calcMode="spline" keySplines="${D.breath.map(()=>".45 0 .55 1").join(";")}"/></circle>${texts}</svg>`}
  const F=D.f,loop=!!D.loop,dur=loop?F.length*0.9:4.2;
  // timeline: ease between frames; two-frame moves hold at each end
  const seq=loop?[...F,F[0]]:[F[0],F[1],F[1],F[0],F[0]],kt=loop?seq.map((_,i)=>+(i/(seq.length-1)).toFixed(4)):[0,0.38,0.58,0.95,1];
  const spl=`calcMode="spline" keySplines="${seq.slice(1).map(()=>".45 0 .55 1").join(";")}"`;
  const pt=(f,k,fb)=>f[k]||(fb&&f[fb])||F[0][k]||[50,50];
  const anim=(attr,vals)=>{const v=vals.map(x=>+x.toFixed?+x.toFixed(1):x);return still||v.every(x=>x===v[0])?"":`<animate attributeName="${attr}" values="${v.join(";")}" keyTimes="${kt.join(";")}" dur="${dur}s" repeatCount="indefinite" ${spl}/>`};
  const HL=new Set(D.hl||[]),part={"p-k":"thigh","k-f":"shin","s-e":"upper","e-w":"fore","f-t":"shin"},hlc=(a,b)=>HL.has(part[a.replace(/\d/g,"")+"-"+b.replace(/\d/g,"")])?" hl":"";
  const seg=(a,b,cls,fa)=>{cls+=hlc(a,b);const A=seq.map(f=>pt(f,a,fa)),B=seq.map(f=>pt(f,b));return `<line class="${cls}" x1="${A[0][0]}" y1="${A[0][1]}" x2="${B[0][0]}" y2="${B[0][1]}">${anim("x1",A.map(x=>x[0]))}${anim("y1",A.map(x=>x[1]))}${anim("x2",B.map(x=>x[0]))}${anim("y2",B.map(x=>x[1]))}</line>`};
  const front=!!F[0].s2,mid=(f,a,b)=>{const A=pt(f,a),B=f[b]||F[0][b]||A;return [(A[0]+B[0])/2,(A[1]+B[1])/2]};
  const spine=seq.map(f=>{const S=front?mid(f,"s","s2"):pt(f,"s"),Pp=front?mid(f,"p","p2"):pt(f,"p"),C=f.c||[(S[0]+Pp[0])/2,(S[1]+Pp[1])/2];return `M${S[0].toFixed(1)} ${S[1].toFixed(1)}Q${C[0].toFixed(1)} ${C[1].toFixed(1)} ${Pp[0].toFixed(1)} ${Pp[1].toFixed(1)}`});
  const neck=seq.map(f=>front?mid(f,"s","s2"):pt(f,"s")),H=seq.map(f=>pt(f,"h"));
  const far=front?"":" far";
  let out=`${D.nofloor?"":`<line x1="${D.vb?-20:4}" y1="92" x2="${D.vb?120:96}" y2="92" class="dl"/>`}${D.prop?(typeof D.prop==="function"?D.prop(F[0]):DEMO_PROPS[D.prop]||""):""}`;
  const W1=seq.map(f=>pt(f,"w1")),W2=seq.map(f=>pt(f,"w2","w1")),mv=(arr,dx,dy)=>arr.map(x=>[x[0]+(dx||0),x[1]+(dy||0)]);
  const cable=(a,P)=>`<line class="dcable" x1="${a[0]}" y1="${a[1]}" x2="${P[0][0]}" y2="${P[0][1]}">${anim("x2",P.map(x=>x[0]))}${anim("y2",P.map(x=>x[1]))}</line>`;
  const ball=(P,r,cls)=>`<circle class="${cls}" cx="${P[0][0]}" cy="${P[0][1]}" r="${r}">${anim("cx",P.map(x=>x[0]))}${anim("cy",P.map(x=>x[1]))}</circle>`;
  if(D.anchor)out+=cable(D.anchor,D.anchorTo?seq.map(f=>pt(f,D.anchorTo)):W1);if(D.anchor2)out+=cable(D.anchor2,W2);if(D.landmine)out+=cable(D.landmine,W1).replace("dcable","dbar");
  out+=seg("p2","k2","dlimb"+far,"p")+seg("k2","f2","dlimb"+far)+seg("s2","e2","dlimb"+far,"s")+seg("e2","w2","dlimb"+far);
  if(front)out+=seg("s","s2","dlimb")+seg("p","p2","dlimb");
  out+=`<path class="dspine" d="${spine[0]}">${spine.every(x=>x===spine[0])?"":`${still?"":`<animate attributeName="d" values="${spine.join(";")}" keyTimes="${kt.join(";")}" dur="${dur}s" repeatCount="indefinite" ${spl}/>`}`}</path>`;
  out+=`<line class="dlimb" x1="${neck[0][0]}" y1="${neck[0][1]}" x2="${H[0][0]}" y2="${H[0][1]}">${anim("x1",neck.map(x=>x[0]))}${anim("y1",neck.map(x=>x[1]))}${anim("x2",H.map(x=>x[0]))}${anim("y2",H.map(x=>x[1]))}</line>`;
  out+=seg("p","k1","dlimb")+seg("k1","f1","dlimb")+seg("s","e1","dlimb")+seg("e1","w1","dlimb");
  if(F.some(f=>f.n1))out+=seg("w1","n1","dlimb thin");
  if(F.some(f=>f.t1))out+=seg("f1","t1","dlimb");if(F.some(f=>f.t2))out+=seg("f2","t2","dlimb"+far);
  if(HL.has("torso")){const sp=out.match(/<path class="dspine"[\s\S]*?<\/path>/);if(sp)out=out.replace(sp[0],sp[0].replace('class="dspine"','class="dspine hl"'))}
  if(HL.has("glute"))out+=ball(seq.map(f=>pt(f,"p")),3.4,"dglute");
  const H2=D.hold;if(H2==="bb"){if(front)out+=`<line class="dbar" x1="${W1[0][0]-9}" y1="${W1[0][1]}" x2="${W2[0][0]+9}" y2="${W2[0][1]}">${anim("x1",W1.map(x=>x[0]-9))}${anim("y1",W1.map(x=>x[1]))}${anim("x2",W2.map(x=>x[0]+9))}${anim("y2",W2.map(x=>x[1]))}</line>`;else out+=ball(W1,7.2,"dplate")+ball(W1,2,"dhub")}
  if(H2==="db"||H2==="db1"){out+=ball(W1,3.6,"dobj");if(H2==="db")out+=ball(W2,3.6,"dobj"+far)}
  if(H2==="kb")out+=ball(mv(W1,0,4.5),4.6,"dobj");if(H2==="mb")out+=ball(mv(front?W1.map((x,i)=>[(x[0]+W2[i][0])/2,(x[1]+W2[i][1])/2]):W1,front?0:3,front?0:-1),6,"dobj");
  if(H2==="bag")out+=ball(mv(W1,2,-2),7.5,"dobj");if(H2==="wheel")out+=ball(mv(W1,0,1),4.2,"dplate");
  out+=`<circle class="dhead" cx="${H[0][0]}" cy="${H[0][1]}" r="6.5">${anim("cx",H.map(x=>x[0]))}${anim("cy",H.map(x=>x[1]))}</circle>`;
  return `<svg class="demo" viewBox="${D.vb||"0 0 100 100"}" width="${size||200}" height="${size||200}" ${label}>${out}</svg>`}
const demoTip=name=>{const k=anyDemoKey(name);return k&&DEMOS[k].tip||""};
const demoMuscles=name=>{const k=anyDemoKey(name);return k&&DEMOS[k].m||""};


/* ---------- exercise demos: every exercise gets an animated figure, worked muscles lit up ---------- */
// Poses are built from joint angles so every figure has the same proportions.
// Angles in degrees: limbs 0 = straight down, +90 = forward (the way the figure faces), 180 = up, -90 = backwards.
// Torso: 0 = upright, +90 = leaning forward flat, -90 = lying back (head behind).
const DL={t:26,th:20,sh:20,ua:13,fa:12.5,nk:10};
function fk(o){const R=a=>a*Math.PI/180,go=(A,a,L)=>[A[0]+L*Math.sin(R(a)),A[1]+L*Math.cos(R(a))];
  const t=o.t||0,P=[50,51],S=[P[0]+DL.t*Math.sin(R(t)),P[1]-DL.t*Math.cos(R(t))],ha=o.h??t,H=[S[0]+DL.nk*Math.sin(R(ha)),S[1]-DL.nk*Math.cos(R(ha))];
  const ar=o.ar?t:0,ua1=(o.ua1??0)+ar,fa1=(o.fa1??(o.ua1??0))+ar,ua2=(o.ua2??o.ua1??0)+ar,fa2=(o.fa2??o.fa1??(o.ua2??o.ua1??0))+ar;
  const th1=o.th1??0,sh1=o.sh1??th1,th2=o.th2??th1,sh2=o.sh2??(o.th2!=null?o.th2:sh1);
  const E1=go(S,ua1,DL.ua),W1=go(E1,fa1,DL.fa),E2=go(S,ua2,DL.ua),W2=go(E2,fa2,DL.fa),K1=go(P,th1,DL.th),F1=go(K1,sh1,DL.sh),K2=go(P,th2,DL.th),F2=go(K2,sh2,DL.sh);
  const f={h:H,s:S,p:P,e1:E1,w1:W1,e2:E2,w2:W2,k1:K1,f1:F1,k2:K2,f2:F2};
  // place it: pin one point (an) to a spot (at), or stand the lowest contact points on the floor
  let dx=0,dy=0;
  if(o.at){const a=f[o.an||"f1"];dx=o.at[0]-a[0];dy=o.at[1]-a[1]}
  else{const g=o.g||["f1","f2"];dy=g[0]==="none"?(o.y??0):(o.gy||91)-Math.max(...g.map(k=>f[k][1]));dx=(o.x??50)-P[0]}
  Object.keys(f).forEach(k=>f[k]=[+(f[k][0]+dx).toFixed(1),+(f[k][1]+dy).toFixed(1)]);
  if(o.c)f.c=[+(f.s[0]+(f.p[0]-f.s[0])/2+o.c[0]).toFixed(1),+(f.s[1]+(f.p[1]-f.s[1])/2+o.c[1]).toFixed(1)];
  return f}
const fkm=(base,over)=>fk({...base,...over});
const shiftP=(f,dx,dy)=>{const o={};Object.keys(f).forEach(k=>o[k]=[f[k][0]+dx,f[k][1]+dy]);return o};
// front-view poses (arms out to the sides etc.)
const FR=(o)=>({...P_FRONT,...o});
// props drawn from a frame's joints
const benchUnder=(f,ext)=>{const s=f.s,p=f.p,ang=Math.atan2(p[1]-s[1],p[0]-s[0]),nx=-Math.sin(ang)*5,ny=Math.cos(ang)*5,e=ext||[8,4],ux=Math.cos(ang),uy=Math.sin(ang);
  const a=[s[0]-ux*e[0]+nx,s[1]-uy*e[0]+ny],b=[p[0]+ux*e[1]+nx,p[1]+uy*e[1]+ny];return `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" class="dbench"/><line x1="${(a[0]+3).toFixed(1)}" y1="${(a[1]+2).toFixed(1)}" x2="${(a[0]+3).toFixed(1)}" y2="92" class="dl"/><line x1="${(b[0]-3).toFixed(1)}" y1="${(b[1]+2).toFixed(1)}" x2="${(b[0]-3).toFixed(1)}" y2="92" class="dl"/>`};
const seatAt=(x,y,back)=>`<line x1="${x-9}" y1="${y}" x2="${x+11}" y2="${y}" class="dbench"/><line x1="${x-6}" y1="${y}" x2="${x-6}" y2="92" class="dl"/><line x1="${x+8}" y1="${y}" x2="${x+8}" y2="92" class="dl"/>${back?`<line x1="${x-9}" y1="${y}" x2="${x-12}" y2="${y-26}" class="dbench"/>`:""}`;
const boxAt=(x1,x2,top)=>`<rect x="${x1}" y="${top}" width="${x2-x1}" height="${92-top}" rx="2" class="dp"/>`;
const barAt=(x,y,w)=>`<line x1="${x-(w||16)}" y1="${y}" x2="${x+(w||16)}" y2="${y}" class="dl" style="stroke-width:3;opacity:.55"/>`;
const wallAt=x=>`<line x1="${x}" y1="6" x2="${x}" y2="92" class="dl"/>`;

// standing reference poses
const ST={t:0},
  RACK_BACK={ar:1,ua1:-35,fa1:157},          // bar resting on the upper back
  RACK_FRONT={ar:1,ua1:85,fa1:-100},          // bar across the front of the shoulders
  PRESS_START={ua1:60,fa1:172},               // bar or dumbbells at chin height
  LIE={t:-90,h:-90,th1:75,sh1:-15,g:["f1"]},  // on a flat bench, feet on the floor
  PLANK={t:80,th1:-80,sh1:-80,g:["w1","f1"]}, // straight-arm plank
  HANG={ua1:180,fa1:180,th1:14,sh1:-40,an:"w1",at:[52,9]};
const sq=(o)=>fkm({t:38,th1:84,sh1:-26},o);
const WALK=[{th1:24,sh1:6,th2:-22,sh2:-38,ua1:-20,ua2:20},{th1:-22,sh1:-38,th2:24,sh2:6,ua1:20,ua2:-20}];

// movement patterns: frames (2 = there and back, more = loop), props, what's held, highlighted body parts, muscles, a coaching cue
const EXP={
  squat:{f:[fkm(RACK_BACK,{at:[48,91]}),sq({...RACK_BACK,at:[48,91]})],hold:"bb",hl:["thigh","glute"],m:"Quads · Glutes · Adductors",tip:"Brace, sit down between your hips, knees out over the toes, drive up through the whole foot."},
  frontSquat:{f:[fkm(RACK_FRONT,{at:[48,91]}),fkm(RACK_FRONT,{t:18,th1:90,sh1:-36,at:[48,91]})],hold:"bb",hl:["thigh","glute"],m:"Quads · Glutes · Upper back",tip:"Elbows high, chest tall, sit straight down."},
  gobletSquat:{f:[fk({ar:1,ua1:25,fa1:165,at:[48,91]}),fk({t:24,th1:90,sh1:-34,ar:1,ua1:25,fa1:165,at:[48,91]})],hold:"kb",hl:["thigh","glute"],m:"Quads · Glutes · Core",tip:"Hold the weight at your chest, elbows inside the knees at the bottom."},
  bwSquat:{f:[fk({at:[48,91]}),sq({ua1:90,fa1:90,at:[48,91]})],hl:["thigh","glute"],m:"Quads · Glutes",tip:"Sit back and down, arms forward for balance, knees track over the toes."},
  jumpSquat:{vb:"-6 -10 112 104",f:[fk({at:[48,91]}),sq({ua1:-30,at:[48,91]}),fk({ua1:170,sh1:-12,th1:4,at:[48,82]})],loop:1,hl:["thigh","glute","shin"],m:"Quads · Glutes · Calves",tip:"Dip, then explode up. Land softly back into the squat."},
  legPress:{f:[fk({t:-55,h:-45,th1:160,sh1:72,ua1:-30,fa1:30,g:["p"],gy:76,x:40}),fk({t:-55,h:-45,th1:128,sh1:128,ua1:-30,fa1:30,g:["p"],gy:76,x:40})],prop:f=>benchUnder(f,[6,2]),hl:["thigh","glute"],m:"Quads · Glutes",tip:"Lower until your knees are near your chest without the lower back lifting, press through the heels."},
  splitSquat:{f:[fk({th1:20,sh1:0,th2:-22,sh2:-22,an:"f1",at:[62,91]}),fk({th1:84,sh1:-4,th2:-12,sh2:-86,an:"f1",at:[62,91]})],hl:["thigh","glute"],m:"Quads · Glutes",tip:"Drop the back knee straight down, front shin stays fairly upright."},
  lunge:{f:[fk({at:[50,91]}),fk({th1:84,sh1:-4,th2:-12,sh2:-86,an:"f1",at:[64,91]})],hl:["thigh","glute"],m:"Quads · Glutes",tip:"Long step, back knee lightly to the floor, push back up through the front heel."},
  bulgarian:{f:[fk({th1:14,sh1:2,th2:-34,sh2:-100,an:"f1",at:[64,91]}),fk({th1:84,sh1:-4,th2:-4,sh2:-96,an:"f1",at:[64,91]})],prop:f=>boxAt(f.f2[0]-12,f.f2[0]+5,+(f.f2[1]+2.5).toFixed(1)),hl:["thigh","glute"],m:"Quads · Glutes",tip:"Back foot on the bench, most of your weight on the front leg, sink straight down."},
  pistol:{f:[fk({th2:30,sh2:30,ua1:60,an:"f1",at:[46,91]}),fk({t:36,th1:88,sh1:-32,th2:86,sh2:86,ua1:92,fa1:92,an:"f1",at:[46,91]})],hl:["thigh","glute"],m:"Quads · Glutes · Balance",tip:"Free leg out in front, sit down on one leg with control, heel stays down."},
  shrimp:{f:[fk({th2:-10,sh2:-80,ua1:60,an:"f1",at:[50,91]}),fk({t:34,th1:86,sh1:-28,th2:-30,sh2:-110,ua1:92,fa1:92,an:"f1",at:[50,91]})],hl:["thigh","glute"],m:"Quads · Glutes",tip:"Hold the back foot, lower until the back knee touches down."},
  stepUp:{vb:"-10 -12 120 106",f:[fk({th1:78,sh1:-4,an:"f2",at:[44,91]}),fk({th2:12,sh2:-24,an:"f1",at:[64,73]})],prop:()=>boxAt(54,78,74),hl:["thigh","glute"],m:"Quads · Glutes",tip:"Whole foot on the box, drive through that heel, don't push off the back foot."},
  boxJump:{vb:"-10 -12 120 106",f:[fk({at:[30,91]}),sq({ua1:-40,at:[30,91]}),fkm({t:30,th1:80,sh1:-30,ua1:80,fa1:80},{an:"f1",at:[62,73]}),fk({an:"f1",at:[62,73]})],loop:1,prop:()=>boxAt(52,80,74),hl:["thigh","glute","shin"],m:"Quads · Glutes · Calves",tip:"Swing the arms, jump, land softly with bent knees. Step down, don't jump down."},
  wallSit:{f:[fk({t:0,th1:90,sh1:0,ua1:0,an:"f1",at:[64,91]}),fk({t:0,th1:90,sh1:0,ua1:5,an:"f1",at:[64,91.3]})],prop:f=>wallAt(f.s[0]-4),hl:["thigh"],m:"Quads",tip:"Back flat on the wall, thighs parallel to the floor, hold."},
  legExt:{f:[fk({t:-8,th1:90,sh1:2,ua1:10,g:["p"],gy:62,x:40}),fk({t:-8,th1:90,sh1:86,ua1:10,g:["p"],gy:62,x:40})],prop:()=>seatAt(40,65,1),hl:["thigh"],m:"Quads",tip:"Straighten the legs fully, squeeze, lower slowly."},
  legCurlLying:{f:[fk({t:-88,h:-95,th1:92,sh1:92,ua1:6,fa1:-10,g:["s","p"],gy:68,x:56}),fk({t:-88,h:-95,th1:92,sh1:205,ua1:6,fa1:-10,g:["s","p"],gy:68,x:56})],prop:f=>benchUnder(f,[4,14]),hl:["thigh"],m:"Hamstrings",tip:"Hips pressed into the pad, curl the heels towards your bum, lower slowly."},
  legCurlSeated:{f:[fk({t:-6,th1:90,sh1:84,ua1:10,g:["p"],gy:62,x:40}),fk({t:-6,th1:90,sh1:-10,ua1:10,g:["p"],gy:62,x:40})],prop:()=>seatAt(40,65,1),hl:["thigh"],m:"Hamstrings",tip:"Pull the heels down and under, pause, return slowly."},
  nordic:{f:[fk({th1:0,sh1:-90,ua1:20,an:"k1",at:[40,91]}),fk({t:52,th1:-52,sh1:-90,ua1:130,fa1:118,an:"k1",at:[40,91]})],hl:["thigh"],m:"Hamstrings",tip:"Ankles anchored, lower your body as slowly as you can, catch yourself with your hands."},
  hipThrust:{f:[fk({t:-57,h:-30,th1:128,sh1:25,ua1:83,fa1:61,an:"s",at:[24,71]}),fk({t:-90,h:-60,th1:90,sh1:0,ua1:100,fa1:106,an:"s",at:[24,71]})],prop:f=>boxAt(f.s[0]-16,f.s[0]+2,+(f.s[1]+2).toFixed(1)),hold:"bb",hl:["glute","thigh"],m:"Glutes · Hamstrings",tip:"Upper back on the bench, chin tucked, drive the hips up until your body is flat, squeeze."},
  bridge:{f:[fk({t:-90,h:-90,th1:140,sh1:12,ua1:-90,fa1:-90,g:["s","p"],gy:88,x:52}),fk({t:-62,h:-75,th1:98,sh1:6,ua1:-90,fa1:-90,an:"f1",at:[66,91]})],hl:["glute","thigh"],m:"Glutes · Hamstrings",tip:"Feet flat, push through the heels, squeeze the glutes at the top."},
  bridge1:{f:[fk({t:-90,h:-90,th1:140,sh1:12,th2:150,sh2:150,ua1:-90,fa1:-90,g:["s","p"],gy:88,x:52}),fk({t:-62,h:-75,th1:98,sh1:6,th2:118,sh2:118,ua1:-90,fa1:-90,an:"f1",at:[66,91]})],hl:["glute","thigh"],m:"Glutes · Hamstrings",tip:"One foot down, the other leg up, lift the hips level without twisting."},
  kickback:{f:[fk({t:22,ua1:60,fa1:60,th1:0,sh1:0,an:"f2",at:[50,91]}),fk({t:22,ua1:60,fa1:60,th1:-40,sh1:-28,an:"f2",at:[50,91]})],anchor:[92,86],anchorTo:"f1",hl:["glute"],m:"Glutes",tip:"Slight lean, kick the leg back from the hip, don't arch the lower back."},
  goodMorning:{f:[fkm(RACK_BACK,{at:[48,91]}),fkm(RACK_BACK,{t:74,th1:10,sh1:-4,at:[48,91]})],hold:"bb",hl:["thigh","glute","torso"],m:"Hamstrings · Glutes · Lower back",tip:"Soft knees, push the hips back with a flat back, stand up by squeezing the glutes."},
  rdl:{f:[fk({at:[48,91]}),fk({t:72,th1:12,sh1:-4,at:[48,91]})],hold:"bb",hl:["thigh","glute"],m:"Hamstrings · Glutes",tip:"Bar close to the legs, hips back, flat back, stop when the hamstrings are tight."},
  stiffLeg:{f:[fk({at:[48,91]}),fk({t:80,th1:4,sh1:0,at:[48,91]})],hold:"bb",hl:["thigh","glute"],m:"Hamstrings · Glutes · Lower back",tip:"Legs nearly straight, hinge at the hips with a flat back."},
  deadlift:{f:[fk({t:58,th1:72,sh1:-20,at:[48,91]}),fk({at:[48,91]})],hold:"bb",hl:["thigh","glute","torso"],m:"Glutes · Hamstrings · Back",tip:"Bar over mid-foot, flat back, push the floor away, stand tall."},
  rackPull:{f:[fk({t:40,th1:26,sh1:-10,at:[48,91]}),fk({at:[48,91]})],hold:"bb",prop:()=>`<line x1="54" y1="73" x2="70" y2="73" class="dl" style="stroke-width:3"/>`,hl:["torso","glute"],m:"Upper back · Glutes · Grip",tip:"Start from the pins near the knee, flat back, drive the hips through."},
  backExt:{f:[fk({t:132,h:150,th1:-58,sh1:-60,ar:1,ua1:30,fa1:150,g:["none"],x:46}),fk({t:84,h:90,th1:-58,sh1:-60,ar:1,ua1:30,fa1:150,g:["none"],x:46})],prop:()=>`<rect x="40" y="53" width="14" height="5" rx="2" class="dp"/><line x1="47" y1="58" x2="40" y2="92" class="dl"/><line x1="24" y1="78" x2="34" y2="74" class="dbench"/>`,hl:["torso","glute"],m:"Lower back · Glutes",tip:"Hinge over the pad, lift until your body is in a straight line, don't over-arch."},
  kbSwing:{f:[fk({t:66,th1:22,sh1:-8,ua1:-12,fa1:-12,at:[48,91]}),fk({ua1:96,fa1:96,at:[48,91]})],hold:"kb",hl:["glute","thigh"],m:"Glutes · Hamstrings · Core",tip:"Hike the bell back, snap the hips forward. Arms just guide it to chest height."},
  kbClean:{vb:"-6 -10 112 104",f:[fk({t:66,th1:22,sh1:-8,ua1:-12,fa1:-12,at:[48,91]}),fk({ar:1,ua1:22,fa1:162,at:[48,91]})],hold:"kb",hl:["glute","thigh","upper"],m:"Glutes · Hamstrings · Shoulders",tip:"Swing it back, drive the hips, let the bell land softly on the back of your forearm."},
  kbSnatch:{vb:"-6 -10 112 104",f:[fk({t:66,th1:22,sh1:-8,ua1:-12,fa1:-12,at:[48,91]}),fk({ua1:178,fa1:178,at:[48,91]})],hold:"kb",hl:["glute","upper"],m:"Glutes · Shoulders · Back",tip:"One fluid pull from between the legs to locked out overhead."},
  calfRaise:{f:[{...shiftP(P_STAND,0,0),t1:[57,91],t2:[55,91]},{...shiftP(P_STAND,0,-6),t1:[57,91],t2:[55,91]}],hl:["shin"],m:"Calves",tip:"Rise as high as you can onto the toes, pause, lower all the way down."},
  calfSeated:{f:[{...fk({t:0,th1:90,sh1:0,ua1:30,fa1:120,g:["f1"],x:40}),t1:[67,91]},{...shiftP(fk({t:0,th1:90,sh1:0,ua1:30,fa1:120,g:["f1"],x:40}),0,-5),t1:[67,91]}],prop:()=>seatAt(38,57,0),hl:["shin"],m:"Calves",tip:"Pad on the knees, rise onto the toes, slow on the way down."},

  bench:{f:[fkm(LIE,{ua1:178,fa1:178}),fkm(LIE,{ua1:-14,fa1:172})],prop:f=>benchUnder(f),hold:"bb",hl:["torso","upper"],m:"Chest · Triceps · Front shoulders",tip:"Shoulder blades squeezed, feet planted, lower to the chest, press up and slightly back."},
  benchDb:{f:[fkm(LIE,{ua1:178,fa1:178}),fkm(LIE,{ua1:-14,fa1:172})],prop:f=>benchUnder(f),hold:"db",hl:["torso","upper"],m:"Chest · Triceps · Front shoulders",tip:"Lower the dumbbells to the sides of the chest, press up and together."},
  incline:{f:[fk({t:-56,h:-50,th1:88,sh1:-10,ua1:166,fa1:170,g:["f1"]}),fk({t:-56,h:-50,th1:88,sh1:-10,ua1:-30,fa1:160,g:["f1"]})],prop:f=>benchUnder(f,[6,3]),hold:"bb",hl:["torso","upper"],m:"Upper chest · Front shoulders · Triceps",tip:"Bench at about 30°, lower to the upper chest, press up over the shoulders."},
  inclineDb:{f:[fk({t:-56,h:-50,th1:88,sh1:-10,ua1:166,fa1:170,g:["f1"]}),fk({t:-56,h:-50,th1:88,sh1:-10,ua1:-30,fa1:160,g:["f1"]})],prop:f=>benchUnder(f,[6,3]),hold:"db",hl:["torso","upper"],m:"Upper chest · Front shoulders · Triceps",tip:"Bench at about 30°, dumbbells down to the upper chest, press up."},
  decline:{f:[fk({t:-108,h:-112,th1:108,sh1:34,ua1:178,fa1:178,g:["k1"],gy:66,x:58}),fk({t:-108,h:-112,th1:108,sh1:34,ua1:-4,fa1:176,g:["k1"],gy:66,x:58})],prop:f=>benchUnder(f,[6,12]),hold:"bb",hl:["torso","upper"],m:"Lower chest · Triceps",tip:"Feet hooked in, lower to the lower chest, press up."},
  skull:{f:[fkm(LIE,{ua1:172,fa1:172}),fkm(LIE,{ua1:160,fa1:-76})],prop:f=>benchUnder(f),hold:"bb",hl:["upper"],m:"Triceps",tip:"Upper arms still, bend only at the elbows to bring the bar to your forehead."},
  chestMachine:{f:[fk({t:-6,th1:90,sh1:0,ua1:-50,fa1:86,g:["p"],gy:62,x:40}),fk({t:-6,th1:90,sh1:0,ua1:86,fa1:86,g:["p"],gy:62,x:40})],prop:()=>seatAt(40,65,1),hl:["torso","upper"],m:"Chest · Triceps",tip:"Handles at mid-chest, press out to almost straight, control the way back."},
  fly:{f:[FR({e1:[29,30],w1:[17,35],e2:[71,30],w2:[83,35]}),FR({e1:[37,31],w1:[48,32],e2:[63,31],w2:[52,32]})],hold:"db",hl:["torso"],m:"Chest",tip:"Slight bend in the elbows, open wide until you feel the stretch, hug back together."},
  cableFly:{f:[FR({e1:[29,26],w1:[17,23],e2:[71,26],w2:[83,23]}),FR({e1:[37,33],w1:[48,38],e2:[63,33],w2:[52,38]})],anchor:[6,8],anchor2:[94,8],hl:["torso"],m:"Chest",tip:"Step forward, slight lean, bring the hands together in a wide hug."},
  cableFlyLow:{f:[FR({e1:[30,40],w1:[19,48],e2:[70,40],w2:[81,48]}),FR({e1:[37,30],w1:[48,24],e2:[63,30],w2:[52,24]})],anchor:[6,90],anchor2:[94,90],hl:["torso"],m:"Upper chest",tip:"Hands sweep from low by the hips up to chin height."},
  revFly:{f:[FR({e1:[37,31],w1:[48,32],e2:[63,31],w2:[52,32]}),FR({e1:[29,28],w1:[17,28],e2:[71,28],w2:[83,28]})],hold:"db",hl:["upper"],m:"Rear shoulders · Upper back",tip:"Lead with the elbows out to the sides, squeeze the shoulder blades."},
  pushup:{f:[fkm(PLANK,{x:44}),fkm(PLANK,{ua1:-62,fa1:24,th1:-84,sh1:-84,x:44})],hl:["torso","upper"],m:"Chest · Triceps · Core",tip:"Straight line from head to heels, lower the chest between the hands, push the floor away."},
  pushupIncline:{f:[fk({t:62,th1:-100,sh1:-100,an:"w1",at:[72,72]}),fk({t:66,th1:-104,sh1:-104,ua1:-66,fa1:16,an:"w1",at:[72,72]})],prop:()=>boxAt(62,84,73),hl:["torso","upper"],m:"Chest · Triceps",tip:"Hands on a bench, body straight, chest to the edge."},
  pushupDecline:{f:[fk({t:96,th1:-72,sh1:-72,an:"w1",at:[72,91]}),fk({t:98,th1:-70,sh1:-70,ua1:-60,fa1:26,an:"w1",at:[72,91]})],prop:f=>boxAt(f.f1[0]-12,f.f1[0]+4,+(f.f1[1]+2).toFixed(1)),hl:["torso","upper"],m:"Upper chest · Shoulders · Triceps",tip:"Feet up on a bench, keep the hips from sagging."},
  pike:{f:[fk({t:128,h:150,th1:-42,sh1:-42,an:"w1",at:[66,91]}),fk({t:128,h:150,th1:-42,sh1:-42,ua1:-54,fa1:36,an:"w1",at:[66,91]})],hl:["upper"],m:"Shoulders · Triceps",tip:"Hips high, lower the top of your head towards the floor between your hands."},
  hspu:{vb:"-10 -12 120 106",f:[fk({t:180,h:180,th1:180,sh1:180,an:"w1",at:[58,91]}),fk({t:180,h:180,th1:180,sh1:180,ua1:-52,fa1:34,an:"w1",at:[58,91]})],prop:f=>wallAt(f.p[0]-5),hl:["upper"],m:"Shoulders · Triceps",tip:"Kick up to the wall, lower your head to the floor with control, press back up."},
  handstand:{vb:"-10 -12 120 106",f:[fk({t:180,h:180,th1:180,sh1:180,an:"w1",at:[58,91]}),fk({t:178,h:180,th1:182,sh1:182,an:"w1",at:[58,91]})],prop:f=>wallAt(f.p[0]-5),hl:["upper","torso"],m:"Shoulders · Core",tip:"Push tall through the shoulders, squeeze glutes and legs together."},
  planche:{f:[fkm(PLANK,{ua1:-22,fa1:-22,x:44}),fkm(PLANK,{ua1:-28,fa1:-28,x:42})],hl:["upper","torso"],m:"Shoulders · Core",tip:"Lean the shoulders forward past the hands, arms straight, body tight."},
  dip:{f:[fk({t:6,ua1:0,fa1:0,th1:12,sh1:-70,an:"w1",at:[52,50]}),fk({t:22,ua1:-96,fa1:38,th1:20,sh1:-70,an:"w1",at:[52,50]})],prop:()=>barAt(52,51,18),hl:["torso","upper"],m:"Chest · Triceps · Shoulders",tip:"Lower until the shoulders are just below the elbows, press back up to straight arms."},
  dipTri:{f:[fk({t:0,ua1:0,fa1:0,th1:8,sh1:-60,an:"w1",at:[52,50]}),fk({t:6,ua1:-98,fa1:32,th1:10,sh1:-60,an:"w1",at:[52,50]})],prop:()=>barAt(52,51,18),hl:["upper"],m:"Triceps · Chest",tip:"Stay upright, elbows tucked back, lower then lock out."},
  benchDip:{f:[fk({t:0,ua1:-10,fa1:-10,th1:80,sh1:4,an:"w1",at:[36,66]}),fk({t:0,ua1:-104,fa1:12,th1:60,sh1:-16,an:"w1",at:[36,66]})],prop:()=>boxAt(18,38,67),hl:["upper"],m:"Triceps",tip:"Hands on the bench behind you, bend the elbows straight back, keep the hips close."},

  pullup:{vb:"-12 -18 124 124",f:[fkm(HANG,{}),fkm(HANG,{ua1:30,fa1:174,th1:14,sh1:-30})],prop:()=>barAt(52,9,22),hl:["torso","upper","fore"],m:"Lats · Biceps · Upper back",tip:"From a dead hang, pull your chest towards the bar, lower all the way down."},
  muscleUp:{vb:"-12 -18 124 124",f:[fkm(HANG,{}),fkm(HANG,{ua1:30,fa1:174,th1:14,sh1:-30}),fk({t:22,ua1:0,fa1:0,th1:16,sh1:-14,an:"w1",at:[52,9]})],loop:1,prop:()=>barAt(52,9,22),hl:["torso","upper"],m:"Lats · Chest · Triceps",tip:"Explosive pull to the hips, roll the wrists over, press to straight arms."},
  deadHang:{vb:"-12 -18 124 124",f:[fkm(HANG,{}),fkm(HANG,{at:[52,9],ua1:178,fa1:180})],prop:()=>barAt(52,9,22),hl:["fore","upper"],m:"Grip · Shoulders",tip:"Hang relaxed with straight arms, shoulders slightly engaged."},
  frontLever:{f:[fk({t:-90,h:-90,th1:90,sh1:90,ua1:-170,fa1:-170,an:"w1",at:[36,10]}),fk({t:-92,h:-92,th1:92,sh1:92,ua1:-170,fa1:-170,an:"w1",at:[36,10]})],prop:()=>barAt(36,10,18),hl:["torso","upper"],m:"Lats · Core",tip:"Arms straight, pull the bar down to your hips, body flat and rigid."},
  pulldown:{f:[fk({t:-6,th1:90,sh1:0,ua1:172,fa1:178,g:["p"],gy:62,x:44}),fk({t:-12,th1:90,sh1:0,ua1:18,fa1:162,g:["p"],gy:62,x:44})],prop:()=>seatAt(44,65,0),anchor:[54,2],hl:["torso","upper"],m:"Lats · Biceps",tip:"Lean back slightly, pull the bar to your upper chest, elbows down and back."},
  straightPull:{f:[fk({t:22,ua1:150,fa1:150,at:[46,91]}),fk({t:22,ua1:12,fa1:12,at:[46,91]})],anchor:[84,4],hl:["torso"],m:"Lats",tip:"Arms straight, sweep the bar down to your thighs."},
  row:{f:[fk({t:62,th1:16,sh1:-8,ua1:0,fa1:0,at:[46,91]}),fk({t:62,th1:16,sh1:-8,ua1:-64,fa1:14,at:[46,91]})],hold:"bb",hl:["torso","upper"],m:"Upper back · Lats · Biceps",tip:"Flat back, pull the bar to your lower ribs, squeeze the shoulder blades."},
  rowDb:{f:[fk({t:70,th1:16,sh1:-8,ua1:0,fa1:0,ua2:60,fa2:0,at:[42,91]}),fk({t:70,th1:16,sh1:-8,ua1:-70,fa1:14,ua2:60,fa2:0,at:[42,91]})],hold:"db1",prop:()=>boxAt(64,90,74),hl:["torso","upper"],m:"Lats · Upper back · Biceps",tip:"Support hand on the bench, pull the dumbbell to your hip."},
  cableRow:{f:[fk({t:22,th1:84,sh1:72,ua1:84,fa1:84,g:["p"],gy:78,x:34}),fk({t:-12,th1:84,sh1:72,ua1:-42,fa1:84,g:["p"],gy:78,x:34})],prop:()=>`<line x1="24" y1="81" x2="46" y2="81" class="dbench"/>`,anchor:[94,74],hl:["torso","upper"],m:"Upper back · Lats · Biceps",tip:"Sit tall, pull the handle to your belly, shoulders back and down."},
  ausRow:{f:[fk({t:74,th1:-106,sh1:-106,ua1:172,fa1:172,an:"w1",at:[70,48]}),fk({t:74,th1:-106,sh1:-106,ua1:-150,fa1:150,an:"w1",at:[70,48]})],prop:()=>barAt(70,48,16)+`<line x1="56" y1="48" x2="56" y2="92" class="dl"/><line x1="84" y1="48" x2="84" y2="92" class="dl"/>`,hl:["torso","upper"],m:"Upper back · Lats · Biceps",tip:"Body straight under the bar, pull your chest up to it."},
  facePull:{f:[fk({ua1:90,fa1:90,at:[46,91]}),fk({ua1:-92,fa1:150,at:[46,91]})],anchor:[94,22],hl:["upper"],m:"Rear shoulders · Upper back",tip:"Rope at face height, pull towards your eyes with elbows high, thumbs back."},

  ohp:{vb:"-6 -10 112 104",f:[fkm(PRESS_START,{at:[48,91]}),fk({ua1:178,fa1:178,at:[48,91]})],hold:"bb",hl:["upper"],m:"Shoulders · Triceps · Upper chest",tip:"Squeeze glutes, press straight up, move your head through once the bar passes it."},
  ohpSeated:{f:[fk({...PRESS_START,t:0,th1:90,sh1:0,g:["f1"],x:44}),fk({ua1:178,fa1:178,t:0,th1:90,sh1:0,g:["f1"],x:44})],prop:f=>seatAt(44,+(f.p[1]+3).toFixed(1),1),hold:"db",hl:["upper"],m:"Shoulders · Triceps",tip:"Back on the pad, press up until the arms are straight, lower to chin height."},
  landminePress:{vb:"-6 -10 112 104",f:[fk({t:8,th1:14,sh1:0,th2:-14,sh2:-14,ua1:40,fa1:170,an:"f2",at:[40,91]}),fk({t:14,th1:14,sh1:0,th2:-14,sh2:-14,ua1:138,fa1:138,an:"f2",at:[40,91]})],landmine:[8,91],hl:["upper"],m:"Shoulders · Upper chest · Core",tip:"Staggered stance, press up and forward, finish with a long arm."},
  lateral:{f:[FR({}),FR({e1:[30,27],w1:[18,27],e2:[70,27],w2:[82,27]})],hold:"db",hl:["upper"],m:"Side shoulders",tip:"Slight lean forward, lift out to the sides to shoulder height, lead with the elbows."},
  frontRaise:{f:[fk({at:[48,91]}),fk({ua1:90,fa1:90,at:[48,91]})],hold:"db",hl:["upper"],m:"Front shoulders",tip:"Arms nearly straight, raise to shoulder height, lower slowly."},
  uprightRow:{f:[FR({e1:[42,39],w1:[47,50],e2:[58,39],w2:[53,50]}),FR({e1:[30,23],w1:[45,29],e2:[70,23],w2:[55,29]})],hold:"bb",hl:["upper"],m:"Side shoulders · Traps",tip:"Pull the bar up close to your body, elbows lead and stay above the hands."},
  shrug:{f:[FR({}),FR({s:[42,21],s2:[58,21],e1:[40,34],w1:[39,46],e2:[60,34],w2:[61,46],h:[50,11]})],hold:"db",hl:["torso"],m:"Traps",tip:"Shoulders straight up towards the ears, pause, lower. No rolling."},

  curl:{f:[fk({at:[48,91]}),fk({ua1:4,fa1:150,at:[48,91]})],hold:"db",hl:["upper"],m:"Biceps · Forearms",tip:"Elbows pinned to your sides, curl up, lower all the way down slowly."},
  curlBar:{f:[fk({at:[48,91]}),fk({ua1:4,fa1:150,at:[48,91]})],hold:"bb",hl:["upper"],m:"Biceps · Forearms",tip:"Elbows still, no swinging, full range."},
  curlCable:{f:[fk({at:[48,91]}),fk({ua1:4,fa1:150,at:[48,91]})],anchor:[60,90],hl:["upper"],m:"Biceps",tip:"Step back from the cable, elbows still, squeeze at the top."},
  curlIncline:{f:[fk({t:-38,h:-30,th1:88,sh1:-8,ua1:-14,fa1:-14,g:["f1"]}),fk({t:-38,h:-30,th1:88,sh1:-8,ua1:-14,fa1:136,g:["f1"]})],prop:f=>benchUnder(f,[6,3]),hold:"db",hl:["upper"],m:"Biceps (long head)",tip:"Lie back on an incline, arms hang straight down, curl without moving the elbows."},
  preacher:{f:[fk({t:6,th1:90,sh1:0,ua1:44,fa1:46,g:["p"],gy:64,x:40}),fk({t:6,th1:90,sh1:0,ua1:44,fa1:168,g:["p"],gy:64,x:40})],prop:f=>seatAt(40,67,0)+`<line x1="${f.s[0]+1}" y1="${f.s[1]+6}" x2="${f.e1[0]+3}" y2="${f.e1[1]+4}" class="dbench"/>`,hold:"bb",hl:["upper"],m:"Biceps",tip:"Arms on the pad, curl up, lower until the arms are nearly straight."},
  concCurl:{f:[fk({t:38,th1:90,sh1:-4,ua1:12,fa1:12,g:["f1"],x:42}),fk({t:38,th1:90,sh1:-4,ua1:12,fa1:150,g:["f1"],x:42})],prop:f=>seatAt(40,+(f.p[1]+3).toFixed(1),0),hold:"db1",hl:["upper"],m:"Biceps",tip:"Elbow against the inner thigh, curl up slowly, squeeze."},
  pushdown:{f:[fk({t:10,ua1:4,fa1:140,at:[46,91]}),fk({t:10,ua1:4,fa1:4,at:[46,91]})],anchor:[60,2],hl:["upper"],m:"Triceps",tip:"Elbows pinned to your sides, push down to straight arms, control the way up."},
  ohExt:{vb:"-6 -10 112 104",f:[fk({ua1:172,fa1:-14,at:[48,91]}),fk({ua1:172,fa1:176,at:[48,91]})],hold:"db1",hl:["upper"],m:"Triceps (long head)",tip:"Elbows pointing up, lower the weight behind your head, straighten fully."},

  plank:{f:[fk({t:80,th1:-80,sh1:-80,ua1:0,fa1:90,an:"e1",at:[70,91]}),fk({t:80,th1:-80,sh1:-80,ua1:0,fa1:90,an:"e1",at:[70,90.5]})],hl:["torso"],m:"Core · Shoulders",tip:"Elbows under shoulders, squeeze glutes and abs, straight line from head to heels."},
  sidePlank:{f:[{h:[77,55],s:[69,62],p:[45,74],e1:[69,90],w1:[79,90],e2:[57,58],w2:[49,68],k1:[30,82],f1:[14,90],k2:[30,81],f2:[14,89]},{h:[77,53],s:[69,60],p:[45,70],e1:[69,90],w1:[79,90],e2:[57,56],w2:[49,66],k1:[30,80],f1:[14,90],k2:[30,79],f2:[14,89]}],hl:["torso"],m:"Obliques · Core",tip:"Elbow under the shoulder, lift the hips so your body is a straight line."},
  hangRaise:{vb:"-12 -18 124 124",f:[fkm(HANG,{th1:4,sh1:4}),fkm(HANG,{th1:92,sh1:92})],prop:()=>barAt(52,9,22),hl:["torso","thigh"],m:"Lower abs · Hip flexors",tip:"Hang still, lift the legs to hip height without swinging, lower slowly."},
  t2b:{vb:"-12 -18 124 124",f:[fkm(HANG,{th1:4,sh1:4}),fkm(HANG,{t:-22,th1:150,sh1:168})],prop:()=>barAt(52,9,22),hl:["torso"],m:"Abs · Lats",tip:"Pull the bar down and lift your toes to touch it."},
  cableCrunch:{f:[fk({t:12,th1:0,sh1:-90,ar:1,ua1:172,fa1:-20,g:["k1","f1"],x:44}),fk({t:82,th1:0,sh1:-90,ar:1,ua1:172,fa1:-20,g:["k1","f1"],x:44})],anchor:[58,2],hl:["torso"],m:"Abs",tip:"Kneel, rope by your head, curl your ribs down towards your hips."},
  abWheel:{f:[fk({t:40,th1:0,sh1:-90,ua1:0,fa1:0,an:"k1",at:[38,91]}),fk({t:84,th1:-64,sh1:-90,ua1:108,fa1:108,an:"k1",at:[38,91]})],hold:"wheel",hl:["torso"],m:"Abs · Lats",tip:"Roll out as far as you can without the lower back sagging, pull back with the abs."},
  deadBug:{f:[fk({t:-90,h:-90,ua1:180,fa1:180,th1:180,sh1:90,g:["s","p"],gy:88}),fk({t:-90,h:-90,ua1:-96,fa1:-96,ua2:180,fa2:180,th1:180,sh1:90,th2:96,sh2:96,g:["s","p"],gy:88})],hl:["torso"],m:"Deep core",tip:"Lower back pressed down, slowly reach the opposite arm and leg away."},
  pallof:{f:[fk({ua1:24,fa1:150,at:[48,91]}),fk({ua1:90,fa1:90,at:[48,91]})],anchor:[50,40],hl:["torso"],m:"Obliques · Core",tip:"Stand side-on to the cable, press the handle straight out and resist the twist."},
  twist:{f:[FR({h:[48,28],s:[40,38],s2:[56,38],p:[45,64],p2:[55,64],e1:[36,48],w1:[34,56],e2:[48,50],w2:[36,56],k1:[42,60],f1:[40,74],k2:[58,60],f2:[60,74]}),FR({h:[52,28],s:[44,38],s2:[60,38],p:[45,64],p2:[55,64],e1:[52,50],w1:[64,56],e2:[64,48],w2:[66,56],k1:[42,60],f1:[40,74],k2:[58,60],f2:[60,74]})],hold:"mb",hl:["torso"],m:"Obliques",tip:"Lean back, feet up if you can, rotate the weight side to side."},
  declineSitup:{f:[fk({t:-112,h:-116,th1:116,sh1:40,ar:1,ua1:150,fa1:-40,g:["k1"],gy:62,x:58}),fk({t:-14,h:-10,th1:116,sh1:40,ar:1,ua1:150,fa1:-40,g:["k1"],gy:62,x:58})],prop:()=>`<line x1="16" y1="80" x2="72" y2="62" class="dbench"/><line x1="24" y1="80" x2="24" y2="92" class="dl"/><line x1="66" y1="66" x2="66" y2="92" class="dl"/>`,hl:["torso"],m:"Abs",tip:"Feet hooked, curl up one vertebra at a time, lower with control."},
  hollow:{f:[fk({t:-74,h:-70,ua1:-80,fa1:-80,th1:100,sh1:100,g:["p"],gy:88}),fk({t:-76,h:-72,ua1:-82,fa1:-82,th1:102,sh1:102,g:["p"],gy:88})],hl:["torso"],m:"Abs · Deep core",tip:"Lower back glued down, arms and legs long and low, hold."},
  birdDog:{f:[P_QUAD,pose(P_QUAD,{e1:[78,62],w1:[90,60],k2:[18,70],f2:[2,70]})],hl:["torso","glute"],m:"Core · Glutes · Lower back",tip:"Reach the opposite arm and leg long, hips level, pause, swap."},
  superman:{f:[fk({t:90,h:92,ua1:90,fa1:90,th1:-90,sh1:-90,g:["s","p"],gy:88,x:40}),fk({t:80,h:76,ua1:104,fa1:104,th1:-98,sh1:-100,g:["p"],gy:88,x:40})],hl:["torso","glute"],m:"Lower back · Glutes",tip:"Lying face down, lift chest, arms and legs together, hold briefly."},
  lsit:{f:[fk({t:-6,th1:90,sh1:90,ua1:-6,fa1:-6,an:"w1",at:[48,80]}),fk({t:-6,th1:94,sh1:94,ua1:-6,fa1:-6,an:"w1",at:[48,79.5]})],prop:()=>`<path d="M40 92V81H56V92" class="dbench" fill="none"/>`,hl:["torso","thigh"],m:"Abs · Hip flexors · Triceps",tip:"Hands by your hips, push down, lift the legs straight out in front."},
  dragonFlag:{f:[fk({t:-162,h:-160,th1:18,sh1:18,ua1:-130,fa1:-60,an:"s",at:[28,78]}),fk({t:-112,h:-115,th1:68,sh1:68,ua1:-130,fa1:-60,an:"s",at:[28,78]})],prop:()=>`<line x1="10" y1="83" x2="64" y2="83" class="dbench"/><line x1="16" y1="83" x2="16" y2="92" class="dl"/><line x1="58" y1="83" x2="58" y2="92" class="dl"/>`,hl:["torso"],m:"Abs · Core",tip:"Grip behind your head, body straight from shoulders to toes, lower as one piece."},
  woodchop:{f:[FR({h:[52,14],e1:[56,18],w1:[66,10],e2:[66,22],w2:[70,10]}),FR({h:[47,16],s:[40,27],s2:[56,27],e1:[34,40],w1:[28,52],e2:[42,42],w2:[30,52],k1:[42,73],k2:[57,72]})],hold:"mb",hl:["torso"],m:"Obliques · Core",tip:"Rotate from the hips and trunk, chop diagonally from high to low."},
  rollout:null,

  carry:{f:WALK.map(w=>fk({...w,ua1:2,fa1:2,ua2:-2,fa2:-2})),loop:1,hold:"db",hl:["fore","torso"],m:"Grip · Traps · Core",tip:"Stand tall, shoulders back, walk with short controlled steps."},
  suitcase:{f:WALK.map(w=>fk({...w,ua1:2,fa1:2})),loop:1,hold:"db1",hl:["torso","fore"],m:"Obliques · Grip",tip:"Weight in one hand, don't lean towards it, walk tall."},
  sandbag:{f:WALK.map(w=>fk({...w,ar:1,ua1:30,fa1:110,ua2:30,fa2:110})),loop:1,hold:"bag",hl:["torso","upper"],m:"Core · Upper back · Legs",tip:"Hug the bag high on your chest, walk tall."},
  walk:{f:WALK.map(w=>fk(w)),loop:1,prop:()=>`<line x1="10" y1="94" x2="90" y2="86" class="dbench"/>`,hl:["thigh","shin","glute"],m:"Legs · Cardio",tip:"Brisk pace on an incline, don't hold on to the rails."},
  sledPush:{f:WALK.map(w=>fk({...w,t:52,ua1:66,fa1:84,ua2:66,fa2:84})),loop:1,prop:()=>`<rect x="78" y="60" width="12" height="32" rx="2" class="dp"/>`,hl:["thigh","glute"],m:"Quads · Glutes · Cardio",tip:"Arms long, low body angle, drive hard with short fast steps."},
  sledPull:{f:WALK.map(w=>fk({...w,t:-14,ua1:72,fa1:80,ua2:72,fa2:80})),loop:1,anchor:[96,80],hl:["thigh","upper"],m:"Quads · Back · Cardio",tip:"Lean back, walk backwards pulling the rope or straps."},
  rower:{f:[fk({t:28,h:20,th1:148,sh1:28,ua1:88,fa1:88,g:["p"],gy:80,x:46}),fk({t:-24,h:-16,th1:94,sh1:94,ua1:-42,fa1:84,g:["p"],gy:80,x:30})],prop:()=>`<line x1="14" y1="84" x2="88" y2="84" class="dbench"/>`,anchor:[94,74],hl:["thigh","torso","upper"],m:"Legs · Back · Cardio",tip:"Legs, then lean back, then arms. Reverse on the way forward."},
  bike:{f:[fk({t:18,th1:66,sh1:-12,th2:110,sh2:24,ua1:70,fa1:70,ua2:40,fa2:40,g:["p"],gy:56,x:40}),fk({t:18,th1:110,sh1:24,th2:66,sh2:-12,ua1:40,fa1:40,ua2:70,fa2:70,g:["p"],gy:56,x:40})],loop:1,prop:()=>`<line x1="34" y1="59" x2="46" y2="59" class="dbench"/><line x1="40" y1="59" x2="56" y2="92" class="dl"/><circle cx="60" cy="74" r="9" class="dp"/>`,hl:["thigh"],m:"Legs · Cardio",tip:"Push and pull with arms and legs together. Sprint or steady."},
  ropes:{f:[fk({t:30,th1:46,sh1:-22,ua1:78,fa1:100,ua2:36,fa2:50,at:[40,91]}),fk({t:30,th1:46,sh1:-22,ua1:36,fa1:50,ua2:78,fa2:100,at:[40,91]})],loop:1,anchor:[96,88],anchor2:[96,88],hl:["upper","torso"],m:"Shoulders · Arms · Cardio",tip:"Athletic half squat, whip the ropes in fast alternating waves."},
  burpee:{vb:"-6 -10 112 104",f:[fk({at:[50,91]}),fk({t:62,th1:122,sh1:-34,ua1:0,fa1:0,at:[50,91]}),fkm(PLANK,{x:36}),fk({ua1:172,fa1:172,th1:4,sh1:-10,at:[50,83]})],loop:1,hl:["thigh","torso","upper"],m:"Full body · Cardio",tip:"Squat down, jump the feet back, (push-up), jump them in, jump up."},
  jacks:{vb:"-6 -10 112 104",f:[FR({}),FR({e1:[33,14],w1:[29,2],e2:[67,14],w2:[71,2],k1:[38,72],f1:[30,91],k2:[62,72],f2:[70,91]})],loop:0,hl:["thigh","upper"],m:"Full body · Cardio",tip:"Jump feet wide as the arms go up, jump back in."},
  highKnees:{f:[fk({th1:92,sh1:0,ua1:-30,fa1:70,ua2:40,fa2:120,g:["f2"]}),fk({th2:92,sh2:0,ua2:-30,fa2:70,ua1:40,fa1:120,g:["f1"]})],loop:1,hl:["thigh"],m:"Hip flexors · Cardio",tip:"Drive the knees to hip height, quick feet, pump the arms."},
  climbers:{f:[fkm(PLANK,{th1:40,sh1:-40,x:44}),fkm(PLANK,{th2:40,sh2:-40,x:44})],loop:1,hl:["torso","thigh"],m:"Core · Cardio",tip:"Hands under shoulders, drive the knees to the chest one after the other."},
  bear:{f:[{...P_QUAD,p:[36,66],k1:[44,84],f1:[24,90],k2:[32,85],f2:[16,90],e1:[72,76],w1:[74,89],e2:[64,76],w2:[62,89]},{...P_QUAD,p:[38,66],k1:[34,85],f1:[18,90],k2:[44,84],f2:[26,90],e1:[64,76],w1:[62,89],e2:[72,76],w2:[74,89]}],loop:1,hl:["torso","upper","thigh"],m:"Core · Shoulders · Legs",tip:"Knees hovering an inch off the floor, crawl with opposite hand and foot."},
  slam:{vb:"-6 -10 112 104",f:[fk({ua1:172,fa1:172,at:[48,91]}),fk({t:70,th1:30,sh1:-14,ua1:14,fa1:14,at:[48,91]})],hold:"mb",hl:["torso","upper"],m:"Core · Lats · Cardio",tip:"Reach tall, slam the ball down hard in front of you, squat to pick it up."},
  wallBall:{vb:"-6 -10 112 104",f:[sq({ar:1,ua1:20,fa1:165,at:[44,91]}),fk({ua1:160,fa1:166,at:[44,91]})],hold:"mb",prop:()=>wallAt(84),hl:["thigh","glute","upper"],m:"Legs · Shoulders · Cardio",tip:"Squat with the ball at your chest, drive up and throw it to the target."},
  thruster:{vb:"-6 -10 112 104",f:[fkm(RACK_FRONT,{t:18,th1:90,sh1:-36,at:[48,91]}),fkm(RACK_FRONT,{at:[48,91]}),fk({ua1:178,fa1:178,at:[48,91]})],loop:1,hold:"bb",hl:["thigh","glute","upper"],m:"Legs · Shoulders",tip:"Front squat, then use the drive up to press the bar overhead in one move."},
  getUp:{vb:"-6 -10 112 104",f:[fk({t:-90,h:-90,th1:150,sh1:20,th2:92,sh2:92,ua1:180,fa1:180,ua2:-140,fa2:-140,g:["s","p"],gy:88}),fk({t:-40,h:-40,th1:150,sh1:20,th2:92,sh2:92,ua1:180,fa1:180,ua2:-170,fa2:-170,g:["p"],gy:88}),fk({th1:84,sh1:-4,th2:-12,sh2:-86,ua1:180,fa1:180,an:"f1",at:[64,91]}),fk({ua1:180,fa1:180,at:[52,91]})],loop:1,hold:"kb",hl:["torso","upper"],m:"Full body · Shoulders · Core",tip:"Eyes on the bell, arm locked out the whole way. Slow and controlled."},
  latLunge:{f:[FR({e1:[42,40],w1:[48,48],e2:[58,40],w2:[52,48]}),FR({h:[42,30],s:[34,40],s2:[50,40],p:[38,64],p2:[48,64],e1:[38,52],w1:[44,56],e2:[50,52],w2:[46,56],k1:[28,75],f1:[26,91],k2:[62,77],f2:[76,91]})],hl:["thigh","glute"],m:"Quads · Glutes · Adductors",tip:"Step wide, sit back into one hip, other leg straight, push back to the middle."},
  abductor:{f:[FR({h:[50,28],s:[42,38],s2:[58,38],p:[45,64],p2:[55,64],e1:[38,50],w1:[38,62],e2:[62,50],w2:[62,62],k1:[39,68],f1:[41,90],k2:[61,68],f2:[59,90]}),FR({h:[50,28],s:[42,38],s2:[58,38],p:[45,64],p2:[55,64],e1:[38,50],w1:[38,62],e2:[62,50],w2:[62,62],k1:[29,68],f1:[35,90],k2:[71,68],f2:[65,90]})],prop:()=>`<line x1="34" y1="67" x2="66" y2="67" class="dbench"/>`,hl:["glute","thigh"],m:"Glutes (side) · Hip abductors",tip:"Sit tall, push the knees out against the pads, return slowly."}
};
delete EXP.rollout;
// which pattern (and what's held) for each exercise in the library
const EX_PAT={"Paused bench press":"bench","Larsen press":"bench","Spoto press":"bench","Reverse-grip bench press":"bench","Pin press":"bench","Decline dumbbell press":"benchDb","Single-arm dumbbell bench press":"benchDb","Incline dumbbell fly":"fly","Cable crossover":"cableFly","Incline cable fly":"cableFly","Single-arm cable fly":"cableFly","Plate-loaded chest press":"chestMachine","Seated machine fly":"fly","Deficit push-up":"pushup","Weighted push-up":"pushup","Weighted dips":"dip","Svend press":"chestMachine","Seal row":"row","Yates row":"row","Meadows row":"row","Kroc row":"rowDb","Renegade row":"rowDb","Inverted row":"ausRow","Wide-grip lat pulldown":"pulldown","Single-arm lat pulldown":"pulldown","Weighted pull-up":"pullup","Weighted chin-up":"pullup","Neutral-grip pull-up":"pullup","Cable pullover":"straightPull","Dumbbell pullover":"straightPull","Machine pullover":"straightPull","High row machine":"cableRow","Low row machine":"cableRow","Wide-grip seated cable row":"cableRow","Snatch-grip deadlift":"deadlift","Deficit deadlift":"deadlift","Block pull":"rackPull","Hyperextension":"backExt","Reverse hyperextension":"backExt","Push press":"ohp","Z press":"ohpSeated","Standing dumbbell shoulder press":"ohpSeated","Single-arm dumbbell shoulder press":"ohpSeated","Smith machine shoulder press":"ohpSeated","Lean-away cable lateral raise":"lateral","Lu raise":"lateral","Incline Y-raise":"frontRaise","Cable front raise":"frontRaise","Plate front raise":"frontRaise","Bent-over dumbbell reverse fly":"revFly","Band pull-apart":"facePull","Cable upright row":"uprightRow","Behind-the-back cable lateral raise":"lateral","Spider curl":"preacher","Drag curl":"curlBar","Reverse curl":"curlBar","Zottman curl":"curl","Cross-body hammer curl":"curl","Rope hammer curl":"curlCable","Cable preacher curl":"preacher","Machine preacher curl":"preacher","Waiter curl":"curl","21s":"curlBar","Seated dumbbell curl":"curl","JM press":"skull","Tate press":"skull","French press":"ohExt","EZ-bar overhead extension":"ohExt","Single-arm cable pushdown":"pushdown","Reverse-grip pushdown":"pushdown","V-bar pushdown":"pushdown","Dumbbell kickback":"pushdown","Cable triceps kickback":"pushdown","Machine dip":"dipTri","Weighted dips (triceps)":"dipTri","Close-grip push-up":"pushup","Pause squat":"squat","Box squat":"squat","Safety bar squat":"squat","Zercher squat":"frontSquat","Heel-elevated goblet squat":"gobletSquat","Dumbbell sumo squat":"gobletSquat","Pendulum squat":"squat","V-squat machine":"squat","Single-leg leg press":"legPress","Narrow-stance leg press":"legPress","Front-foot-elevated split squat":"splitSquat","Smith machine split squat":"splitSquat","Dumbbell lunge":"lunge","Barbell lunge":"lunge","Curtsy lunge":"lunge","Single-leg leg extension":"legExt","Spanish squat":"bwSquat","Dumbbell step-up":"stepUp","B-stance Romanian deadlift":"rdl","Kettlebell Romanian deadlift":"rdl","Snatch-grip Romanian deadlift":"rdl","Kettlebell deadlift":"deadlift","Single-leg lying leg curl":"legCurlLying","Single-leg seated leg curl":"legCurlSeated","Standing leg curl":"legCurlSeated","Sliding leg curl":"legCurlLying","Glute-ham raise":"nordic","Barbell glute bridge":"bridge","Single-leg hip thrust":"hipThrust","B-stance hip thrust":"hipThrust","Frog pump":"bridge","45-degree hip extension":"backExt","Glute kickback machine":"kickback","Hip adduction machine":"abductor","Copenhagen plank":"sidePlank","Donkey calf raise":"calfRaise","Dumbbell calf raise":"calfRaise","Tibialis raise":"calfRaise","Weighted plank":"plank","RKC plank":"plank","Hanging knee raise":"hangRaise","Captain's chair leg raise":"hangRaise","Weighted crunch":"cableCrunch","Machine crunch":"cableCrunch","Bicycle crunch":"cableCrunch","Cable woodchop":"woodchop","Landmine rotation":"twist","Dumbbell side bend":"twist","Stir the pot":"plank","Body saw":"plank","Hollow rock":"hollow","V-up":"hollow","Flutter kicks":"hollow","Bear plank":"plank","Plank shoulder taps":"plank","Spin bike":"bike","Cross trainer":"walk","Treadmill run":"walk","Treadmill sprints":"walk","Jump rope":"jacks","Rowing machine sprints":"rower","Sled drag":"sledPull","Kettlebell complex":"kbSwing","Knee push-up":"pushup","Wall push-up":"pushupIncline","Glute bridge march":"bridge","Cossack squat":"latLunge","Box squat (bodyweight)":"bwSquat","Hip hinge (good morning)":"goodMorning","Inchworm":"plank","Skater jumps":"jumpSquat","Kettlebell press":"ohp","Kettlebell front squat":"frontSquat","Kettlebell row":"rowDb","Kettlebell windmill":"getUp","Single-arm kettlebell swing":"kbSwing","Sandbag clean":"kbClean","Dumbbell snatch":"kbSnatch","Devil press":"burpee","Man maker":"burpee","Landmine squat":"gobletSquat","Overhead carry":"carry","Rope climb":"pullup","Archer pull-up":"pullup","Typewriter pull-up":"pullup","Negative pull-up":"pullup","Scapular pull-up":"pullup","Ring row":"ausRow","Ring dips":"dip","Ring push-up":"pushup","Explosive push-up":"pushup","Wall handstand push-up":"hspu","Tuck front lever":"frontLever","Tuck planche":"planche","Skin the cat":"deadHang","Windshield wipers":"t2b","Hollow body rock":"hollow","Assisted pistol squat":"pistol","Smith machine bench press":"bench","Dumbbell floor press":"benchDb","Incline machine press":"chestMachine","Smith machine incline press":"incline","Neutral-grip lat pulldown":"pulldown","Assisted pull-up machine":"pullup","Single-arm cable row":"cableRow","Machine lateral raise":"lateral","Cable rear delt fly":"revFly","Bayesian cable curl":"curlCable","Trap bar deadlift":"deadlift","Sumo deadlift":"deadlift","Dumbbell Romanian deadlift":"rdl","Single-leg Romanian deadlift":"rdl","Hip thrust machine":"hipThrust","Smith machine hip thrust":"hipThrust","Cable pull-through":"rdl","Belt squat":"squat","Sissy squat":"bwSquat","Smith machine calf raise":"calfRaise","Single-leg calf raise":"calfRaise","Reverse crunch":"hangRaise","Stair climber":"stepUp","Cable hip abduction":"abductor","Stability ball leg curl":"legCurlLying","Dumbbell skull crusher":"skull","Seated dumbbell lateral raise":"lateral",
  "Barbell bench press":"bench","Incline barbell bench press":"incline","Decline bench press":"decline","Dumbbell bench press":"benchDb","Incline dumbbell press":"inclineDb","Dumbbell fly":"fly","Cable fly":"cableFly","Low-to-high cable fly":"cableFlyLow","Pec deck":"fly","Machine chest press":"chestMachine","Push-up":"pushup","Dips (chest)":"dip",
  "Deadlift":"deadlift","Barbell row":"row","Pendlay row":"row","Dumbbell row":"rowDb","Chest-supported row":"row","T-bar row":"row","Seated cable row":"cableRow","Lat pulldown":"pulldown","Close-grip lat pulldown":"pulldown","Pull-up":"pullup","Chin-up":"pullup","Straight-arm pulldown":"straightPull","Machine row":"cableRow","Rack pull":"rackPull","Back extension":"backExt",
  "Overhead press":"ohp","Seated dumbbell shoulder press":"ohpSeated","Arnold press":"ohpSeated","Machine shoulder press":"ohpSeated","Dumbbell lateral raise":"lateral","Cable lateral raise":"lateral","Front raise":"frontRaise","Rear delt fly":"revFly","Reverse pec deck":"revFly","Face pull":"facePull","Upright row":"uprightRow","Barbell shrug":"shrug","Dumbbell shrug":"shrug",
  "Barbell curl":"curlBar","EZ-bar curl":"curlBar","Dumbbell curl":"curl","Hammer curl":"curl","Incline dumbbell curl":"curlIncline","Preacher curl":"preacher","Cable curl":"curlCable","Concentration curl":"concCurl",
  "Close-grip bench press":"bench","Triceps pushdown":"pushdown","Rope pushdown":"pushdown","Overhead cable extension":"ohExt","Skull crusher":"skull","Overhead dumbbell extension":"ohExt","Dips (triceps)":"dipTri","Bench dip":"benchDip",
  "Back squat":"squat","Front squat":"frontSquat","Goblet squat":"gobletSquat","Hack squat":"squat","Leg press":"legPress","Bulgarian split squat":"bulgarian","Walking lunge":"lunge","Reverse lunge":"splitSquat","Step-up":"stepUp","Leg extension":"legExt","Smith machine squat":"squat",
  "Romanian deadlift":"rdl","Stiff-leg deadlift":"stiffLeg","Lying leg curl":"legCurlLying","Seated leg curl":"legCurlSeated","Nordic curl":"nordic","Good morning":"goodMorning","Hip thrust":"hipThrust","Glute bridge":"bridge","Cable kickback":"kickback","Hip abduction machine":"abductor","Kettlebell swing":"kbSwing",
  "Standing calf raise":"calfRaise","Seated calf raise":"calfSeated","Leg press calf raise":"calfRaise",
  "Plank":"plank","Side plank":"sidePlank","Hanging leg raise":"hangRaise","Cable crunch":"cableCrunch","Ab wheel rollout":"abWheel","Dead bug":"deadBug","Pallof press":"pallof","Russian twist":"twist","Decline sit-up":"declineSitup",
  "Farmer's carry":"carry","Sled push":"sledPush","Rowing machine":"rower","Assault bike":"bike","Treadmill incline walk":"walk","Battle ropes":"ropes","Burpees":"burpee",
  "Incline push-up":"pushupIncline","Decline push-up":"pushupDecline","Diamond push-up":"pushup","Pike push-up":"pike","Bodyweight squat":"bwSquat","Jump squat":"jumpSquat","Split squat":"splitSquat","Wall sit":"wallSit","Single-leg glute bridge":"bridge1","Calf raise":"calfRaise","Hollow hold":"hollow","Bird dog":"birdDog","Superman":"superman","Mountain climbers":"climbers","Jumping jacks":"jacks","High knees":"highKnees",
  "Kettlebell clean":"kbClean","Kettlebell snatch":"kbSnatch","Turkish get-up":"getUp","Thruster":"thruster","Wall ball":"wallBall","Box jump":"boxJump","Lateral lunge":"latLunge","Landmine press":"landminePress","Landmine row":"row","Single-arm dumbbell row":"rowDb","Medicine ball slam":"slam","Woodchop":"woodchop","Suitcase carry":"suitcase","Sandbag carry":"sandbag","Bear crawl":"bear","Sled pull":"sledPull",
  "Australian row":"ausRow","Muscle-up":"muscleUp","Dead hang":"deadHang","Front lever hold":"frontLever","Dips":"dip","Archer push-up":"pushup","Pseudo planche push-up":"planche","Handstand push-up":"hspu","Handstand hold":"handstand","Planche lean":"planche","L-sit":"lsit","Hollow body hold":"hollow","Toes-to-bar":"t2b","Dragon flag":"dragonFlag","Pistol squat":"pistol","Shrimp squat":"shrimp"};
// exercises people add themselves: guess the pattern from the name
const EX_GUESS=[["bench press","bench"],["chest press","chestMachine"],["incline","inclineDb"],["fly","fly"],["push-up","pushup"],["push up","pushup"],["pushup","pushup"],["dip","dip"],["pull-up","pullup"],["pullup","pullup"],["chin","pullup"],["pulldown","pulldown"],["row","row"],["deadlift","deadlift"],["rdl","rdl"],["squat","squat"],["lunge","lunge"],["leg press","legPress"],["step","stepUp"],["hip thrust","hipThrust"],["bridge","bridge"],["curl","curl"],["extension","ohExt"],["pushdown","pushdown"],["press","ohp"],["raise","lateral"],["shrug","shrug"],["plank","plank"],["crunch","cableCrunch"],["sit-up","declineSitup"],["carry","carry"],["swing","kbSwing"],["jump","boxJump"],["calf","calfRaise"]];
function exPattern(name){const n=String(name||"").trim();if(EX_PAT[n])return EX_PAT[n];const k=Object.keys(EX_PAT).find(x=>x.toLowerCase()===n.toLowerCase());if(k)return EX_PAT[k];const l=n.toLowerCase(),g=EX_GUESS.find(([w])=>l.includes(w));return g?g[1]:null}
Object.entries(EXP).forEach(([k,v])=>{if(v)DEMOS["ex:"+k]=v});
const exDemoKey=name=>{const p=exPattern(name);return p?"ex:"+p:null};


window.PFDEMO={demoSVG,demoKey,anyDemoKey,exDemoKey,demoTip,demoMuscles};
})();
