import { createRequire } from 'module';const { chromium } = createRequire(import.meta.url)('playwright');
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});await p.route('**/fonts.googleapis.com/**',r=>r.abort());
await p.goto('http://localhost:8767/index.html#learn');await p.waitForTimeout(300);await p.click('[data-sub=bones]');await p.waitForTimeout(400);
const D='/tmp/claude-0/-home-claude/378cc395-20d5-56b4-9104-1fc428cea4c0/scratchpad/ptac/';
const d=p.locator('.diag').first();await d.screenshot({path:D+'s-dir.png'});
await p.locator('.diag').nth(1).screenshot({path:D+'s-planes.png'});
await b.close();
