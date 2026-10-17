const { browserExecutablePath } = require('./lib/browser-path.cjs');
// 性能基线：在 6 个固定点各等场景稳定后采 60 帧，输出 tests/perf-baseline.json。
// 用法：node tests/perf.cjs [输出文件=tests/perf-baseline.json]
// 环境变量：PALACE_URL（默认 http://127.0.0.1:5173）、QUERY_STRING（追加到 URL，如 ?zones=all）、SCALE（写入 json 顶层，默认 pre-1to1）、FRAMES（默认 60）
// 启动方式与 tests/shot.cjs 相同（系统 Chrome + swiftshader，1280×720 @DPR1，桌面高画质）。
// 与 shot.cjs 不同的是不停主循环：让真实 animate()（含阴影 LOD、环境更新）逐帧跑，由 PerfHUD 在整帧后读数。
// 注意：headless swiftshader 是 CPU 软渲染，fps 不代表真机，只看 calls / tris / geometries / textures。
const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');
const { execSync } = require('node:child_process');

const { pathToFileURL } = require('node:url');

// yaw：水平朝向（度），0 = 朝北(+Z)，90 = 朝西(+X)，-90 = 朝东(-X)，180 = 朝南(-Z)
// P0c-2 起为真实米制：点位从 LAYOUT / data/anchors.json / data/zones 推导，语义与 P0a/P0b 六点一致
const ROOT = path.resolve(__dirname, '..');
const A = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/anchors.json'), 'utf8'));
const SANTAI_SOUTH_Z = -54;            // 三台南沿（PalaceBuilder 三台底层 z −54 ~ 178）
const DONGER_STREET_X = (-127.2 + -114.4) / 2; // 东二长街中线（zones/east-six region 东二长街）
const EAST_SIX_Z = (303.2 + 462) / 2;  // 东六宫两列院落（景仁门南沿 ~ 钟粹宫北沿）南北中点
async function loadPoints() {
  const { LAYOUT: L } = await import(pathToFileURL(path.join(ROOT, 'src/config/constants.js')).href);
  const hj = A['皇极门'];
  return [
    { point: '午门前', pos: [0, L.START_POSITION.z], yaw: 0 },                    // 出生点，面向午门
    { point: '太和殿前', pos: [0, SANTAI_SOUTH_Z - 20], yaw: 0 },                  // 太和门与三台之间广场，面向太和殿
    { point: '乾清门', pos: [0, +(L.QIANQING_GATE_Z - 20).toFixed(1)], yaw: 0 },  // 乾清门广场，面向乾清门
    { point: '东六宫中', pos: [+DONGER_STREET_X.toFixed(1), +EAST_SIX_Z.toFixed(1)], yaw: 0 }, // 东二长街，两列六宫之间
    { point: '宁寿宫', pos: [hj.x, +(hj.z + 10).toFixed(1)], yaw: 0 },            // 皇极门内，面向宁寿门/皇极殿
    { point: '御花园', pos: [0, +(L.IMPERIAL_GARDEN_Z - 95.6 / 2 + 11).toFixed(1)], yaw: 0 }, // 坤宁门北入园，面向钦安殿
  ];
}

const percentile = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.floor((p / 100) * (s.length - 1))))];
};

(async () => {
  const POINTS = await loadPoints();
  const outFile = path.resolve(process.argv[2] || path.join(__dirname, 'perf-baseline.json'));
  const FRAMES = Number(process.env.FRAMES || 60);
  const browser = await chromium.launch({
    executablePath: browserExecutablePath(),
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`http ${r.status()} ${r.url()}`); });
  const t0 = Date.now();
  const baseUrl = process.env.PALACE_URL || 'http://127.0.0.1:5173';
  const url = process.env.QUERY_STRING ? `${baseUrl}${process.env.QUERY_STRING}` : baseUrl;
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__forbiddenCityApp?.postProcessing?.composer && window.__perf?.() && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 240000 });
  const loadMs = Date.now() - t0;
  page.setDefaultTimeout(600000);

  const results = [];
  for (const p of POINTS) {
    const r = await page.evaluate(async ({ p, FRAMES }) => {
      const a = window.__forbiddenCityApp;
      document.querySelector('#welcome-overlay').style.display = 'none';
      const [x, z] = p.pos;
      const yaw = (p.yaw * Math.PI) / 180;
      a.controls.setPosition(x, 1.7, z); // 视点高度 = 该处地面 + PLAYER.HEIGHT
      a.controls.lookAt(x + Math.sin(yaw) * 10, z + Math.cos(yaw) * 10);
      a.lastShadowUpdate = 0; // 立刻按新机位刷新阴影 LOD
      // 主循环先注册 rAF，本回调后注册，同一帧内总在 animate() 之后执行，读到的是该帧整帧数据
      const nextFrame = () => new Promise(res => requestAnimationFrame(() => res(window.__perf())));
      // 稳定判据：至少 20 帧，且最近 10 帧 calls/geometries/textures 不变（最多等 300 帧）
      let prev = null, same = 0, settle = 0;
      for (; settle < 300; settle++) {
        const s = await nextFrame();
        const key = `${s.calls}|${s.geometries}|${s.textures}`;
        same = key === prev ? same + 1 : 0;
        prev = key;
        if (settle >= 20 && same >= 10) break;
      }
      const frames = [];
      for (let i = 0; i < FRAMES; i++) frames.push(await nextFrame());
      const cam = a.camera.position;
      return { settleFrames: settle + 1, frames, pos: [+cam.x.toFixed(2), +cam.y.toFixed(2), +cam.z.toFixed(2)] };
    }, { p, FRAMES });
    const f = r.frames;
    const ms = f.map(s => s.frameMs).filter(v => v > 0);
    const fpsList = ms.map(v => 1000 / v);
    const callsSet = [...new Set(f.map(s => s.calls))];
    const last = f[f.length - 1];
    const row = {
      point: p.point,
      pos: r.pos,
      yaw: p.yaw,
      calls: last.calls,
      tris: last.tris,
      geometries: last.geometries,
      textures: last.textures,
      fpsAvg: +(1000 / (ms.reduce((s, v) => s + v, 0) / ms.length)).toFixed(2),
      fpsP5: +percentile(fpsList, 5).toFixed(2),
      callsRange: [Math.min(...callsSet), Math.max(...callsSet)],
      trisRange: [Math.min(...f.map(s => s.tris)), Math.max(...f.map(s => s.tris))],
      settleFrames: r.settleFrames,
      frames: f.length,
    };
    results.push(row);
    console.log(JSON.stringify(row));
  }

  let commit = 'unknown';
  try { commit = execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim(); } catch {}
  const out = {
    scale: process.env.SCALE || 'pre-1to1',
    commit,
    date: new Date().toISOString(),
    env: 'headless Chrome + swiftshader, 1280x720 @DPR1, quality=high; fps 不可信，主指标为 calls/tris',
    yawConvention: '度；0=北(+Z) 90=西(+X) -90=东(-X)',
    loadMs,
    errors,
    points: results,
  };
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  errors.forEach(e => console.log('  ' + e));
  console.log(`写入 ${outFile}（${results.length} 点，资源/控制台错误 ${errors.length} 条）`);
  await browser.close();
  // 只有未捕获 JS 异常算失败；资源 404 等只记录
  process.exit(errors.some(e => e.startsWith('pageerror')) ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
