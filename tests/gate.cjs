// 一键合并门禁：npm run test:gate
//   build → test:zones → test:anchors → smoke → regression（失败自动重试 1 次）→ stepwalk 60,10 0,1 all
//   （+ stepwalk-auto 自动路线）→ perf（对比 tests/perf-p2.json）
// 自己起停 vite（端口读 PORT，默认 5181；--strictPort，只杀自己起的进程），不依赖 tools/run-with-vite.sh。
// 任一步失败立即停止（--keep-going 继续跑完），最后打印汇总表；有失败退出码 1。
//
// 环境变量：
//   PORT=5181                 vite 端口（各 Agent 用自己的端口，见 P1-COMMON §2）
//   BUILD_DIR=/tmp/fc-build-gate-<PORT>   build 输出目录
//   PERF_BASELINE=tests/perf-p2.json      perf 对比基线（P2 发布起；旧基线 perf-p0c.json 留档）
//   PERF_FPS_STRICT=1         fpsP5 下降 >15% 判失败（默认只警告，见 docs/TESTING.md「fps 规则」）
//   GATE_SKIP=perf,regression 跳过若干步（调试用；被跳过的步在汇总表标"跳过"，退出码仍可为 0）
//   GATE_VISUAL=1             追加截图回归 tests/visual.cjs（只警告，不影响退出码）
// 日志：/tmp/fc-gate-<PORT>/<步骤>.log
const { spawn, spawnSync } = require('node:child_process');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const NODE = process.execPath;
const PORT = Number(process.env.PORT || 5181);
const URL = `http://127.0.0.1:${PORT}`;
const BUILD_DIR = process.env.BUILD_DIR || `/tmp/fc-build-gate-${PORT}`;
const LOG_DIR = `/tmp/fc-gate-${PORT}`;
const BASELINE = path.resolve(ROOT, process.env.PERF_BASELINE || 'tests/perf-p2.json');
const PERF_OUT = path.join(LOG_DIR, 'perf.json');
const KEEP_GOING = process.argv.includes('--keep-going');
const SKIP = new Set((process.env.GATE_SKIP || '').split(',').filter(Boolean));
const PERF_RULES = { calls: 0.10, tris: 0.10, fpsP5: 0.15 };
const FPS_STRICT = process.env.PERF_FPS_STRICT === '1';

fs.mkdirSync(LOG_DIR, { recursive: true });
const ENV = { ...process.env, PALACE_URL: URL };

function run(name, args, timeoutS) {
  const t = Date.now();
  const r = spawnSync(NODE, args, { cwd: ROOT, env: ENV, encoding: 'utf8', maxBuffer: 64 << 20, timeout: timeoutS * 1000 });
  const out = (r.stdout || '') + (r.stderr || '') + (r.error ? `\n[gate] ${r.error.message}` : '');
  fs.writeFileSync(path.join(LOG_DIR, `${name}.log`), out);
  return { code: r.status ?? (r.signal ? 128 : 1), out, secs: Math.round((Date.now() - t) / 1000) };
}
const tail = (s, n = 15) => s.trimEnd().split('\n').slice(-n).map(l => '    ' + l).join('\n');

// —— vite 起停 ——
let vite = null;
function ping() {
  return new Promise(res => {
    const req = http.get(URL + '/', r => { r.resume(); res(r.statusCode === 200); });
    req.on('error', () => res(false));
    req.setTimeout(2000, () => { req.destroy(); res(false); });
  });
}
async function startVite() {
  if (await ping()) throw new Error(`端口 ${PORT} 已被占用（可能是别的 Agent 的 vite），换 PORT 再跑`);
  const log = fs.openSync(path.join(LOG_DIR, 'vite.log'), 'w');
  vite = spawn(NODE, ['./node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], { cwd: ROOT, stdio: ['ignore', log, log] });
  for (let i = 0; i < 80; i++) {
    if (await ping()) return;
    if (vite.exitCode !== null) break;
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`vite 未能在 ${PORT} 就绪（见 ${LOG_DIR}/vite.log）`);
}
function stopVite() { if (vite && vite.exitCode === null) vite.kill('SIGTERM'); vite = null; }
process.on('exit', stopVite);
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => { stopVite(); process.exit(130); });

// —— perf 对比 ——
function comparePerf(base, cur) {
  const rows = [], fails = [], warns = [];
  for (const b of base.points) {
    const c = cur.points.find(p => p.point === b.point);
    if (!c) { fails.push(`${b.point}: 本次未采到`); continue; }
    const d = k => (c[k] - b[k]) / b[k];
    const dc = d('calls'), dt = d('tris'), df = d('fpsP5');
    const bad = [];
    if (dc > PERF_RULES.calls) bad.push(`calls +${(dc * 100).toFixed(1)}%`);
    if (dt > PERF_RULES.tris) bad.push(`tris +${(dt * 100).toFixed(1)}%`);
    if (bad.length) fails.push(`${b.point}: ${bad.join('、')}`);
    if (-df > PERF_RULES.fpsP5) (FPS_STRICT ? fails : warns).push(`${b.point}: fpsP5 ${b.fpsP5}→${c.fpsP5}（${(df * 100).toFixed(1)}%）`);
    rows.push(`    ${b.point.padEnd(6, '　')} calls ${String(b.calls).padStart(4)}→${String(c.calls).padStart(4)} (${(dc * 100).toFixed(1).padStart(6)}%)  tris ${String(b.tris).padStart(8)}→${String(c.tris).padStart(8)} (${(dt * 100).toFixed(1).padStart(6)}%)  fpsP5 ${b.fpsP5}→${c.fpsP5} (${(df * 100).toFixed(1)}%)`);
  }
  if (cur.errors?.some(e => e.startsWith('pageerror'))) fails.push('perf 期间有 pageerror');
  return { rows, fails, warns };
}

// —— 步骤 ——
const pick = (out, re) => (out.match(re) || [])[1];
const STEPS = [
  { name: 'build', browser: false, exec: () => {
    const r = run('build', ['./node_modules/vite/bin/vite.js', 'build', '--outDir', BUILD_DIR, '--emptyOutDir'], 300);
    return { ...r, ok: r.code === 0, detail: `${BUILD_DIR}${pick(r.out, /built in ([\d.]+ ?m?s)/) ? '，built ' + pick(r.out, /built in ([\d.]+ ?m?s)/) : ''}` };
  } },
  { name: 'zones', browser: false, exec: () => {
    const r = run('zones', ['tests/zone-lint.cjs'], 300);
    return { ...r, ok: r.code === 0, detail: `${pick(r.out, /错误: (\d+)/) ?? '?'} 错 ${pick(r.out, /警告: (\d+)/) ?? '?'} 警告` };
  } },
  { name: 'anchors', browser: false, exec: () => {
    const r = run('anchors', ['tests/anchor-check.cjs'], 120);
    return { ...r, ok: r.code === 0, detail: `比较 ${pick(r.out, /比较 (\d+) 条/) ?? '?'} 条，超差 ${pick(r.out, /超差 (\d+) 条/) ?? '?'}` };
  } },
  { name: 'smoke', browser: true, exec: () => {
    const r = run('smoke', ['tests/smoke.cjs'], 300);
    let j = null; try { j = JSON.parse(r.out.slice(r.out.indexOf('{'), r.out.lastIndexOf('}') + 1)); } catch {}
    return { ...r, ok: r.code === 0 && !!j && j.pageerrors.length === 0, detail: j ? `colliders ${j.info.colliders}，pageerror ${j.pageerrors.length}，console ${j.consoleErrors.length}` : '无输出' };
  } },
  { name: 'regression', browser: true, exec: () => {
    let r, tries = 0;
    for (; tries < 2; tries++) {
      r = run(tries ? 'regression-retry' : 'regression', ['tests/regression.cjs'], 900);
      if (r.code === 0) break;
    }
    const passed = pick(r.out, /"passed": (\d+)/);
    // regression.cjs reports the checks actually completed; do not retain an
    // obsolete fixed denominator when new runtime checks are added.
    return { ...r, ok: r.code === 0, detail: `${passed ?? '?'} 项通过${tries ? '（首次失败，重试后' + (r.code === 0 ? '通过）' : '仍失败）') : ''}` };
  } },
  { name: 'stepwalk', browser: true, exec: () => {
    const r = run('stepwalk', ['tests/stepwalk.cjs', '60,10', '0,1', 'all'], 1800);
    const total = pick(r.out, /共 (\d+) 条/), fail = pick(r.out, /失败 (\d+) 条/);
    return { ...r, ok: r.code === 0 && fail === '0', detail: `${total ? total - fail : '?'}/${total ?? '?'}` };
  } },
  { name: 'stepwalk-auto', browser: true, optional: !fs.existsSync(path.join(__dirname, 'stepwalk-auto.cjs')), exec: () => {
    const r = run('stepwalk-auto', ['tests/stepwalk-auto.cjs', '60,10', '0,1', 'all'], 1800);
    const total = pick(r.out, /共 (\d+) 条/), fail = pick(r.out, /失败 (\d+) 条/), known = pick(r.out, /knownIssue 跳过 (\d+) 条/);
    return { ...r, ok: r.code === 0 && fail === '0', detail: `${total ? total - fail : '?'}/${total ?? '?'}${known && known !== '0' ? `（knownIssue 跳过 ${known} 条）` : ''}` };
  } },
  { name: 'perf', browser: true, exec: () => {
    const r = run('perf', ['tests/perf.cjs', PERF_OUT], 1200);
    if (r.code !== 0 || !fs.existsSync(PERF_OUT)) return { ...r, ok: false, detail: 'perf.cjs 失败' };
    const cmp = comparePerf(JSON.parse(fs.readFileSync(BASELINE, 'utf8')), JSON.parse(fs.readFileSync(PERF_OUT, 'utf8')));
    const extra = `\n  perf 对比 ${path.relative(ROOT, BASELINE)}（calls/tris 劣化 >10% 失败；fpsP5 下降 >15% ${FPS_STRICT ? '失败' : '警告'}）：\n${cmp.rows.join('\n')}`
      + (cmp.fails.length ? `\n  ✗ ${cmp.fails.join('\n  ✗ ')}` : '') + (cmp.warns.length ? `\n  ⚠ ${cmp.warns.join('\n  ⚠ ')}` : '');
    return { ...r, ok: cmp.fails.length === 0, detail: `${cmp.fails.length ? cmp.fails.length + ' 点劣化' : 'calls/tris 无劣化'}${cmp.warns.length ? `，fps 警告 ${cmp.warns.length}` : ''}`, extra };
  } },
  // 截图回归：GATE_VISUAL=1 才跑，且只警告不判失败（画面改动是各任务的正常产出，需人工看差异图后再更新基线）
  { name: 'visual', browser: true, warnOnly: true, optional: process.env.GATE_VISUAL !== '1', exec: () => {
    const r = run('visual', ['tests/visual.cjs'], 900);
    const n = pick(r.out, /或无基线 (\d+) 个/);
    return { ...r, ok: r.code === 0, detail: n === undefined ? 'visual.cjs 失败' : `超阈值 ${n} 机位（差异图 tests/visual/<分支>/）` };
  } },
];

(async () => {
  const t0 = Date.now();
  let commit = '?';
  try { commit = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).stdout.trim(); } catch {}
  console.log(`test:gate @ ${commit}  PORT=${PORT}  日志 ${LOG_DIR}/\n`);
  const results = [];
  let failed = false;
  for (const s of STEPS) {
    if (s.optional) continue;
    if (SKIP.has(s.name) || (failed && !KEEP_GOING)) { results.push({ name: s.name, status: '跳过', detail: SKIP.has(s.name) ? 'GATE_SKIP' : '前序失败', secs: 0 }); continue; }
    process.stdout.write(`▶ ${s.name} … `);
    let r;
    try {
      if (s.browser && !vite) await startVite();
      r = s.exec();
    } catch (e) { r = { ok: false, detail: e.message, out: String(e.stack), secs: 0 }; }
    const mark = r.ok ? '✅' : s.warnOnly ? '⚠' : '❌';
    console.log(`${mark} ${r.detail}（${r.secs}s）`);
    if (r.extra) console.log(r.extra);
    if (!r.ok) { if (!s.warnOnly) failed = true; console.log(`  日志尾部（${LOG_DIR}/${s.name}.log）：\n${tail(r.out || '')}`); }
    results.push({ name: s.name, status: mark, detail: r.detail, secs: r.secs });
  }
  stopVite();
  console.log(`\n| 步骤 | 结果 | 说明 | 耗时 |\n|---|---|---|---|`);
  for (const r of results) console.log(`| ${r.name} | ${r.status} | ${r.detail} | ${r.secs}s |`);
  console.log(`\n${failed ? '❌ 门禁失败' : '✅ 门禁全绿'}（${commit}，共 ${Math.round((Date.now() - t0) / 1000)}s）`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); stopVite(); process.exit(1); });
