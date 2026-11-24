await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}
  let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  const pad=n=>String(n).padStart(2,'0'),iso=t=>new Date(t).toISOString();
  const now=Date.now(),mid=new Date();mid.setHours(0,0,0,0);const M=mid.getTime(),DAY=864e5;
  const S={sleep:[],heartRate:[],heartRateVariability:[],respiratoryRate:[],oxygenSaturation:[],appleSleepingWristTemperature:[],vo2Max:[]},AGG={restingHeartRate:{},heartRate:{},steps:{}};
  for(let i=30;i>=0;i--){const d0=M-i*DAY,bad=false;                // last 3 days: worse recovery, higher resting HR, warmer, faster breathing
    // night ending this morning: bed ~23:00, wake ~07:00 (jitter)
    const bed=d0-60*60000+Math.round((rnd()-0.5)*50)*60000,wake=d0+7*3600000+Math.round((rnd()-0.5)*50)*60000-(bad?75*60000:0);
    let t=bed+10*60000;const cyc=[["light",40],["deep",bad?10:25],["light",15],["rem",20]];
    while(t<wake-10*60000){for(const [st,m] of cyc){const e=Math.min(wake,t+m*60000);if(e>t)S.sleep.push({sleepState:st,startDate:iso(t),endDate:iso(e),sourceId:'com.apple.health.watch',value:0});t=e;if(t>=wake)break}
      if(t<wake-20*60000){S.sleep.push({sleepState:'awake',startDate:iso(t),endDate:iso(t+4*60000),sourceId:'com.apple.health.watch',value:0});t+=4*60000}}
    S.sleep.push({sleepState:'inBed',startDate:iso(bed-15*60000),endDate:iso(wake+10*60000),sourceId:'com.apple.iphone',value:0});
    S.sleep.push({sleepState:'asleep',startDate:iso(bed),endDate:iso(wake),sourceId:'com.apple.iphone',value:0}); // iPhone logs the same night: must not double count
    const rhr=(bad?62:55)+Math.round(rnd()*3);AGG.restingHeartRate[i]=rhr;AGG.heartRate[i]=rhr-6;AGG.steps[i]=6000+Math.round(rnd()*6000);
    for(let k=0;k<3;k++)S.heartRateVariability.push({value:(bad?42:68)+rnd()*10,startDate:iso(d0+(2+k*7)*3600000),endDate:iso(d0+(2+k*7)*3600000)});
    for(let k=0;k<6;k++)S.respiratoryRate.push({value:(bad?16.6:14.2)+rnd()*0.6,startDate:iso(d0+(k)*3600000),endDate:iso(d0+k*3600000)});
    for(let k=0;k<4;k++)S.oxygenSaturation.push({value:0.96+rnd()*0.02,startDate:iso(d0+(1+k)*3600000),endDate:iso(d0+(1+k)*3600000)});
    S.appleSleepingWristTemperature.push({value:(bad?35.1:34.4)+rnd()*0.1,startDate:iso(bed),endDate:iso(wake)});
    if(i%7===0)S.vo2Max.push({value:44+(30-i)*0.05,startDate:iso(d0+12*3600000),endDate:iso(d0+12*3600000)});
    // all-day heart rate every 5 min, plus a 60 min hard session at 18:00 every other day (5 s samples)
    for(let m=0;m<1440;m+=5){const ts=d0+m*60000;if(ts>now)break;const awake=m>7*60&&m<23*60;S.heartRate.push({value:awake?70+Math.round(rnd()*25):rhr+Math.round(rnd()*4),startDate:iso(ts),endDate:iso(ts)})}
    if(i%2===0&&d0+19*3600000<now)for(let s=0;s<3600;s+=5){const ts=d0+18*3600000+s*1000;S.heartRate.push({value:120+Math.round(50*Math.sin(s/600)**2)+Math.round(rnd()*8),startDate:iso(ts),endDate:iso(ts)})}
  }
  const dayKey=t=>{const d=new Date(t);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
  window.__hkCalls=[];
  const Health={isAvailable:async()=>({available:true}),requestAuthorization:async o=>{__hkCalls.push(['auth',o.read.length]);return {}},saveSample:async()=>({}),
    queryAggregated:async o=>{__hkCalls.push(['agg',o.dataType,o.aggregation]);if(['heartRateVariability','respiratoryRate','oxygenSaturation'].includes(o.dataType))throw new Error('not supported');
      const A=AGG[o.dataType];if(!A)return {samples:[]};const out=[];for(let i=30;i>=0;i--){const t=M-i*DAY;if(t<Date.parse(o.startDate)-DAY)continue;out.push({startDate:iso(t),endDate:iso(t+DAY),value:A[i]})}return {samples:out}},
    readSamples:async o=>{if(o.dataType==='heartRate'&&o.limit===1&&!o.ascending){const v=138+Math.round(12*Math.abs(Math.sin(Date.now()/9000)));return {samples:[{value:v,startDate:iso(Date.now()-3000),endDate:iso(Date.now()-3000)}]}}const L=S[o.dataType]||[],a=Date.parse(o.startDate),z=Date.parse(o.endDate);let r=L.filter(x=>Date.parse(x.startDate)>=a&&Date.parse(x.startDate)<=z);r.sort((x,y)=>o.ascending?Date.parse(x.startDate)-Date.parse(y.startDate):Date.parse(y.startDate)-Date.parse(x.startDate));
      __hkCalls.push(['read',o.dataType,r.length,o.limit]);return {samples:r.slice(0,o.limit||100)}}};
  const impl={Health,PFWorkout:{requestAuthorization:async()=>({granted:true}),saveWorkout:async()=>({id:'x'})},Haptics:{impact:async()=>{},vibrate:async()=>{}},LocalNotifications:{checkPermissions:async()=>({display:'granted'}),requestPermissions:async()=>({display:'granted'}),schedule:async()=>{},cancel:async()=>{},getPending:async()=>({notifications:[]})},StatusBar:{setStyle:async()=>{},setOverlaysWebView:async()=>{}}};
  window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'ios',Plugins:{},nativePromise:(n,m,o)=>{const P=impl[n];if(!P||!P[m])return Promise.reject(new Error('ni '+n+'.'+m));return Promise.resolve().then(()=>P[m](o))},addListener:()=>'x',removeListener:()=>{}};
});