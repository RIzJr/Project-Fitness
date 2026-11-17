// Pulse, the AI motivator: consent, chatting (server simulated), safety answers, remembered notes, "tell my coach", the coach's view, settings.
import { createRequire } from 'module';import fs from 'fs';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const errs=[];const mock=fs.readFileSync('tests/mocksb.js','utf8');const sent=[];
async function device(seed){const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});
  if(seed)await ctx.addInitScript(db=>{if(!localStorage.getItem('MOCKDB'))localStorage.setItem('MOCKDB',db)},seed);
  await ctx.route('**/supabase-js@2.116.0/**',r=>r.fulfill({body:mock,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'}}));
  await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());
  // the "companion" server function, simulated: checks the token, echoes what it got, and answers like the real one
  await ctx.route('**/functions/v1/companion',async r=>{const req=r.request();if(req.method()==='GET')return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({ok:true,ready:!!globalThis.READY})});const body=JSON.parse(req.postData()||'{}'),auth=req.headers()['authorization']||'';sent.push({auth,body});
    const last=body.messages.at(-1).content;let out;
    if(!/^Bearer tok-/.test(auth))out={error:'Sign in to chat with Pulse.'};
    else if(/want to die/i.test(last))out={reply:"I'm really glad you told me. Please talk to someone now: Samaritans, 116 123.",safety:'crisis',remember:[],flag:null,left:37};
    else if(/knee/i.test(last))out={reply:"Let's protect that knee: swap squats for a hip hinge today and see a physio if it's still sore next week.",remember:[],flag:'Sam has knee pain when squatting.',left:38};
    else out={reply:"Totally get it. Could a 20-minute version of today's session work after work?",remember:['Works long hours on weekdays'],flag:null,left:39};
    await r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(out)})});
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8767/');return p}
const go=async p=>{await p.waitForTimeout(700);if(await p.locator('[data-act=gateLocal]').count())await p.click('[data-act=gateLocal]')};
const ob=async(p,n)=>{await p.locator('[data-act=ob][data-k=name]').fill(n);await p.click('[data-act=obSkip]')};
const settings=async p=>{await p.click('[data-tab=you]');await p.click('[data-act=openSettings]')};
const T=async(p,s)=>(await p.locator(s).first().innerText().catch(()=>'-')).replace(/\n+/g,' | ');
// coach
const A=await device();await go(A);await ob(A,'Riz');
await settings(A);await A.click('[data-act=setPage][data-v=cloud]');await A.fill('#au_email','riz@x.com');await A.fill('#au_pw','password1');await A.check('#au_consent');await A.click('[data-act=signUp]');await A.waitForTimeout(2500);
await A.click('.back');await A.click('[data-act=setPage][data-v=profile]');await A.check('[data-act=coachMode]');await settings(A);await A.click('[data-act=setPage][data-v=cloud]');await A.waitForTimeout(800);
await A.click('[data-act=newCode]');await A.waitForTimeout(500);const code=await A.textContent('.code');
// client: Pulse hidden while the server isn't set up, then shown
globalThis.READY=false;const C=await device(await A.evaluate(()=>localStorage.getItem('MOCKDB')));await go(C);await ob(C,'Sam');await C.waitForTimeout(2500);
console.log('server not ready → Today row shown?',await C.locator('[data-act=pulseOpen]').count());
globalThis.READY=true;await C.reload();await C.waitForTimeout(2600);
await C.click('[data-tab=today]');console.log('TODAY ROW:',await T(C,'[data-act=pulseOpen]'));
await C.click('[data-act=pulseOpen]');console.log('SIGNED OUT:',(await T(C,'.pulsewrap')).slice(0,140));await C.click('[data-act=pulseClose]');
await settings(C);await C.click('[data-act=setPage][data-v=cloud]');await C.fill('#au_email','sam@x.com');await C.fill('#au_pw','password2');await C.check('#au_consent');await C.click('[data-act=signUp]');await C.waitForTimeout(2500);
await C.fill('#lk_code',code);await C.click('#linkForm button');await C.waitForTimeout(1500);
await C.click('[data-tab=today]');await C.click('[data-act=pulseOpen]');await C.waitForTimeout(200);
console.log('CONSENT:',(await T(C,'.pulsewrap')).slice(0,520));await C.screenshot({path:'tests/shots/pulse-consent.png'});
await C.click('[data-act=pulseAgree]');console.log('without 18+ tick, toast:',await C.innerText('#toast'));
await C.check('#pulseAge');await C.click('[data-act=pulseAgree]');await C.waitForTimeout(200);
console.log('OPENING:',(await T(C,'#pulseList')),'| chips:',await C.locator('[data-act=pulseChip]').count());
await C.click('[data-act=pulseChip] >> nth=0');await C.waitForTimeout(800);
console.log('AFTER CHIP:',await T(C,'#pulseList'));
const s0=sent.at(-1);console.log('sent: token ok',/^Bearer tok-/.test(s0.auth),'| messages',s0.body.messages.length,'| name',s0.body.name,'| coach',s0.body.coach,'| context lines',s0.body.context.split('\n').length,'→',s0.body.context.slice(0,160));
await C.fill('#pulseIn','my knee hurts when I squat');await C.click('form[data-form=pulse] button');await C.waitForTimeout(800);
console.log('KNEE + FLAG ASK:',(await T(C,'#pulseList')).split(' | ').slice(-6).join(' | '));
await C.click('[data-act=pulseFlagSend]');await C.waitForTimeout(1200);console.log('after send:',(await T(C,'#pulseList')).split(' | ').slice(-1)[0]);
await C.fill('#pulseIn','honestly I want to die');await C.press('#pulseIn','Enter');await C.waitForTimeout(800);
console.log('CRISIS buttons:',await C.locator('.pmsg.safety a').allInnerTexts());await C.screenshot({path:'tests/shots/pulse-chat.png'});
// training summary off → context empty
await C.click('[data-act=setPage][data-v=pulse]');await C.waitForTimeout(200);console.log('SETTINGS:',(await T(C,'#app')).slice(0,420));
await C.uncheck('[data-act=pulseCtxSet]');await C.click('[data-tab=today]');await C.click('[data-act=pulseOpen]');await C.fill('#pulseIn','tired today');await C.press('#pulseIn','Enter');await C.waitForTimeout(800);
console.log('context sent when summary is off:',JSON.stringify(sent.at(-1).body.context));
const doc=await C.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('hpc-docs:')){const d=JSON.parse(localStorage.getItem(k));return d.pulsechat}});
console.log('saved: msgs',doc.msgs.length,'| mem',JSON.stringify(doc.mem),'| flags',doc.flags.length);
// coach sees the note (and nothing else from the chats)
const dbC=await C.evaluate(()=>JSON.parse(localStorage.getItem('MOCKDB')));const rep=dbC.reports.at(-1).data;console.log('report pulseFlags:',JSON.stringify(rep.pulseFlags),'| chat text in report?',JSON.stringify(rep).includes('want to die')||JSON.stringify(rep).includes('tired today'));
await A.evaluate(d=>localStorage.setItem('MOCKDB',d),JSON.stringify(dbC));await A.reload();await A.waitForTimeout(2500);
await A.click('[data-tab=you]');await A.click('[data-act=youView][data-v=clients]').catch(()=>{});await A.waitForTimeout(400);await A.locator('[data-act=openClient]').first().click();await A.waitForTimeout(400);
console.log('COACH SEES:',await T(A,'section.panel:has(h2:text("Notes from Pulse"))'));
// delete everything
await C.click('[data-act=pulseClose]');await settings(C);await C.click('[data-act=setPage][data-v=pulse]');await C.click('[data-act=pulseWipe]');await C.click('[data-act=pulseWipe]');await C.waitForTimeout(300);
console.log('after delete:',(await T(C,'#app')).slice(0,200));
console.log('errors',errs);await b.close();
