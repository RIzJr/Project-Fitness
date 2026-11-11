import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const p=await b.newPage();await p.addInitScript(()=>{try{localStorage.setItem('pf-rdpopoff','1')}catch(e){}});await p.route('**/fonts.googleapis.com/**',r=>r.abort());await p.goto('http://localhost:8767/');await p.waitForTimeout(800);
const links=async()=>p.evaluate(()=>[...document.querySelectorAll('a')].map(a=>a.getAttribute('href')).filter(h=>/privacy/.test(h||'')).join(','));
await p.click('[data-act=gateMode][data-v=up]').catch(()=>{});await p.waitForTimeout(200);console.log('gate:',await links());
await p.click('[data-act=gateLocal]').catch(()=>{});await p.waitForTimeout(300);if(await p.locator('[data-act=obSkip]').count())await p.click('[data-act=obSkip]');
await p.click('[data-tab=you]');await p.click('[data-act=openSettings]');await p.click('[data-act=setPage][data-v=about]');await p.waitForTimeout(200);console.log('about:',await links());
await p.click('.back').catch(()=>{});await p.click('[data-act=setPage][data-v=cloud]');await p.waitForTimeout(300);console.log('cloud:',await links());await b.close();
