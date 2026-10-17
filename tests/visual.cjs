const { browserExecutablePath } = require('./lib/browser-path.cjs');
// 截图回归（T-4）：12 个固定机位截图到 tests/visual/<分支>/，与 tests/visual/main/ 逐像素对比，输出差异图。
// 用法：node tests/visual.cjs [--update] [机位名子串]
//   --update        把本次截图写成基线 tests/visual/main/（只应在 main 上、或总控确认画面变化合理后执行）
//   VISUAL_DIR=名   输出子目录（默认 = 当前 git 分支名，"/" 换成 "-"）
//   VISUAL_THRESHOLD=0.02   差异像素占比阈值（默认 2%）
// 判定：像素任一通道差 > PIXEL_TOL 记为差异像素；差异占比 > 阈值 = 失败。差异图 <机位>.diff.png（灰度底 + 红色差异）。
// 确定性：页面注入固定种子的 Math.random（程序化回退贴图 / 噪声），停主循环后手动渲染；同一版本两次截图差异应 ≈ 0。
// 机位坐标从 LAYOUT / data/anchors.json / data/zones 推导（见 CAMS），表见 docs/TESTING.md。
const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');
const { execSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
let PNG;
try { ({ PNG } = require('playwright-core/lib/utilsBundle')); } catch { ({ PNG } = require(path.join(path.dirname(require.resolve('playwright-core/package.json')), 'lib/utilsBundle.js'))); }

const ROOT = path.resolve(__dirname, '..');
const A = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/anchors.json'), 'utf8'));
const VIEW = { width: 960, height: 540 };
const PIXEL_TOL = 24;                 // 0–255，单通道容差（swiftshader 抗锯齿/阴影边缘抖动）
const THRESHOLD = Number(process.env.VISUAL_THRESHOLD || 0.02);
const EYE = 1.7;

async function loadCams() {
  const { LAYOUT: L } = await import(pathToFileURL(path.join(ROOT, 'src/config/constants.js')).href);
  const zone = id => JSON.parse(fs.readFileSync(path.join(ROOT, 'data/zones', id + '.json'), 'utf8'));
  const item = (id, name) => zone(id).items.find(i => i.name === name && i.kind === 'hall');
  const jrg = item('east-six', '景仁宫'), yxd = item('west-six', '养心殿'), hj = A['皇极门'];
  const s2 = zone('east-six').items.find(i => i.name === '东二长街');
  const gz0 = L.IMPERIAL_GARDEN_Z - 95.6 / 2;
  // [名称, 眼位 [x, z]（y = 该处地面 + 1.7，ground: 'top' 取最高可行走面）, 看向 [x, y, z]]
  return [
    ['01-午门外广场', [0, L.START_POSITION.z], [0, 12, L.WUMEN_Z]],
    ['02-金水桥南望太和门', [0, L.JINSHUI_RIVER_Z - 20], [0, 8, L.TAIHE_GATE_Z]],
    ['03-太和门广场东望', [-40, L.JINSHUI_RIVER_Z + 30], [-106.5, 6, L.JINSHUI_RIVER_Z + 10]],
    ['04-太和殿前', [0, -54 - 20], [0, 15, L.TAIHE_Z]],
    ['05-太和殿内', [0, L.TAIHE_Z - 6, 'top'], [0, 11, L.TAIHE_Z + 8]],
    ['06-乾清门广场', [0, L.QIANQING_GATE_Z - 20], [0, 6, L.QIANQING_GATE_Z]],
    ['07-东二长街', [(s2.x0 + s2.x1) / 2, (s2.z0 + s2.z1) / 2], [(s2.x0 + s2.x1) / 2, 4, s2.z1]],
    ['08-景仁宫院', [jrg.x, jrg.z - 20], [jrg.x, 5, jrg.z]],
    ['09-养心殿前', [yxd.x, yxd.z - 17.5], [yxd.x, 5, yxd.z]],
    ['10-宁寿宫皇极门内', [hj.x, hj.z + 10], [hj.x, 8, hj.z + 130]],
    ['11-御花园', [0, gz0 + 11], [0, 6, A['钦安殿'].z]],
    ['12-鸟瞰中轴', [0, L.START_POSITION.z - 60, 160], [0, 0, L.TAIHE_GATE_Z]],
  ].map(([name, eye, look]) => ({ name, x: eye[0], z: eye[1], y: typeof eye[2] === 'number' ? eye[2] : null, top: eye[2] === 'top', look }));
}

function decode(file) { return PNG.sync.read(fs.readFileSync(file)); }
function diff(aFile, bFile, outFile) {
  const a = decode(aFile), b = decode(bFile);
  if (a.width !== b.width || a.height !== b.height) return { ratio: 1, note: `尺寸不同 ${a.width}x${a.height} vs ${b.width}x${b.height}` };
  const out = new PNG({ width: a.width, height: a.height });
  let n = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const d = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]));
    const g = (a.data[i] * 0.3 + a.data[i + 1] * 0.59 + a.data[i + 2] * 0.11) * 0.35 + 40;
    if (d > PIXEL_TOL) { n++; out.data[i] = 255; out.data[i + 1] = 0; out.data[i + 2] = 0; }
    else { out.data[i] = out.data[i + 1] = out.data[i + 2] = g; }
    out.data[i + 3] = 255;
  }
  fs.writeFileSync(outFile, PNG.sync.write(out));
  return { ratio: n / (a.width * a.height) };
}

(async () => {
  const update = process.argv.includes('--update');
  const filter = process.argv.slice(2).find(a => !a.startsWith('--'));
  let branch = process.env.VISUAL_DIR;
  if (!branch) { try { branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT }).toString().trim(); } catch { branch = 'local'; } }
  branch = branch.replace(/[\/\\]/g, '-');
  const baseDir = path.join(__dirname, 'visual/main');
  const outDir = update ? baseDir : path.join(__dirname, 'visual', branch);
  fs.mkdirSync(outDir, { recursive: true });
  const cams = (await loadCams()).filter(c => !filter || c.name.includes(filter));

  const browser = await chromium.launch({ executablePath: browserExecutablePath(), headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 1 });
  await context.addInitScript(() => {
    // 固定种子 PRNG（mulberry32），让程序化贴图/噪声每次一致
    let s = 0x2f6b1d3a;
    Math.random = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(process.env.PALACE_URL || 'http://127.0.0.1:5173', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__forbiddenCityApp?.postProcessing?.composer && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 240000 });
  await page.evaluate(() => {
    const a = window.__forbiddenCityApp;
    cancelAnimationFrame(a.animationFrame);
    a.disposed = true; // 停主循环，逐机位手动渲染
    for (const sel of ['#welcome-overlay']) { const el = document.querySelector(sel); if (el) el.style.display = 'none'; }
    // 截图只要 3D 画面：隐藏 HUD / 小地图 / 提示等覆盖层（canvas 以外的固定定位元素）
    const style = document.createElement('style');
    style.textContent = 'body > *:not(#scene-container) { visibility: hidden !important; } #scene-container * { visibility: visible; } #scene-container > :not(canvas) { visibility: hidden !important; }';
    document.head.appendChild(style);
  });
  const rows = [];
  for (const cam of cams) {
    const info = await page.evaluate(({ cam, EYE }) => {
      const a = window.__forbiddenCityApp;
      const zm = a.zoneManager;
      zm?.ensureLoadedAt(cam.x, cam.z);
      // 机位所在区 + 邻区同步建好；再按真实 update 规则（40 m 预载 / 60 m 卸载）收敛，保证每次加载集合一致
      for (let i = 0; i < 20; i++) zm?.update({ x: cam.x, z: cam.z });
      while (zm?.buildQueue?.length) zm.processBuildQueue();
      const feet = cam.y !== null ? cam.y - EYE : a.collisionManager.getGroundHeight(cam.x, cam.z, cam.top ? 300 : 0, cam.top ? 1000 : 0.6);
      a.camera.position.set(cam.x, feet + EYE, cam.z);
      a.camera.lookAt(cam.look[0], cam.look[1], cam.look[2]);
      a.camera.updateMatrixWorld();
      a.environment.update(a.camera, 0.016);
      a.shadowSetup?.updateShadowLOD?.(a.camera, a.shadowObjects, 150);
      a.postProcessing.render();
      a.postProcessing.render();
      return { feet: +feet.toFixed(2), loaded: zm?.getLoadedIds().sort().join(',') ?? '', calls: a.renderer.info.render.calls };
    }, { cam, EYE });
    const file = path.join(outDir, cam.name + '.png');
    await page.screenshot({ path: file });
    const row = { cam: cam.name, ...info };
    if (!update) {
      const base = path.join(baseDir, cam.name + '.png');
      if (!fs.existsSync(base)) row.status = '无基线';
      else {
        const d = diff(base, file, path.join(outDir, cam.name + '.diff.png'));
        row.ratio = +(d.ratio * 100).toFixed(2);
        row.status = d.ratio > THRESHOLD ? 'FAIL' : 'PASS';
        if (d.note) row.note = d.note;
      }
    } else row.status = '基线已写入';
    rows.push(row);
    console.log(`${row.status.padEnd(5)} ${cam.name}${row.ratio !== undefined ? ` 差异 ${row.ratio}%` : ''}  脚点 ${info.feet}  已加载区 ${info.loaded}${row.note ? '  ' + row.note : ''}`);
  }
  await browser.close();
  const fail = rows.filter(r => r.status === 'FAIL' || r.status === '无基线').length;
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify({ branch, update, threshold: THRESHOLD, pixelTol: PIXEL_TOL, view: VIEW, errors, rows }, null, 2) + '\n');
  console.log(`${update ? '基线' : '对比'} ${rows.length} 机位 → ${path.relative(ROOT, outDir)}/，${update ? '' : `超阈值(${THRESHOLD * 100}%)或无基线 ${fail} 个，`}pageerror ${errors.length}`);
  process.exit(errors.length || (!update && fail) ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
