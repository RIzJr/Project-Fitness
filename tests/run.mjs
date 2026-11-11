// Runs every browser test in this folder against a local copy of the app and prints a summary.
// Usage, from the repo root:  node tests/run.mjs            (all tests)
//                             node tests/run.mjs twatch tconnect   (just these)
// Each test prints lines like "errors []"; a test fails if it exits non-zero, times out, or prints page errors.
import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
fs.mkdirSync('tests/shots', { recursive: true });
const server = spawn('python3', ['-m', 'http.server', '8767'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 1200));
const only = process.argv.slice(2);
const files = fs.readdirSync('tests').filter(f => /^t.*\.mjs$/.test(f) && f !== 'run.mjs' && (!only.length || only.includes(f.replace('.mjs', '')))).sort();
const results = [];
for (const f of files) {
  const t0 = Date.now();
  const r = spawnSync('node', [path.join('tests', f)], { encoding: 'utf8', timeout: 240000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const errLines = out.split('\n').filter(l => /errors?\b.*\[(?!\])/i.test(l) || /pageerror|Uncaught|TypeError|ReferenceError/.test(l));
  const ok = r.status === 0 && !r.error && !errLines.length;
  results.push({ f, ok, secs: Math.round((Date.now() - t0) / 1000), why: r.error ? String(r.error.code || r.error) : r.status !== 0 ? 'exit ' + r.status + ': ' + out.trim().split('\n').slice(-3).join(' / ') : errLines.slice(0, 3).join(' / ') });
  fs.writeFileSync(path.join('tests/shots', f.replace('.mjs', '.log')), out);
  console.log((ok ? 'PASS ' : 'FAIL ') + f + ' (' + results.at(-1).secs + ' s)' + (ok ? '' : '  ' + results.at(-1).why.slice(0, 300)));
}
server.kill();
const bad = results.filter(r => !r.ok);
console.log(`\n${results.length - bad.length} passed, ${bad.length} failed. Logs and screenshots in tests/shots/`);
process.exit(bad.length ? 1 : 0);
