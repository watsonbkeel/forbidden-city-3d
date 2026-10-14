const { browserExecutablePath } = require('./lib/browser-path.cjs');
// P1-I 视觉验证：同一机位截 B 档（未加载）与 S 档（GLB 加载后）两张图，供目视核对 GLB 是否盖住 B 档宝座区 / 无穿模。
// 用法：PORT=5184 tools/run-with-vite.sh node tests/p1i-visual.cjs [hallId=taihe]
//   输出 ../outputs/dev/p1i-<hall>-{B,S}-{1,2,3}.png；打印地面高度、GLB 包围盒、draw calls 增量。
const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');
const hallId = process.argv[2] || 'taihe';

(async () => {
  const outDir = path.resolve(__dirname, '../../outputs/dev');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: browserExecutablePath(), headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto((process.env.PALACE_URL || 'http://127.0.0.1:5173') + '/?zones=all', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__forbiddenCityApp?.postProcessing?.composer && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 240000 });

  const setup = await page.evaluate(async ({ hallId }) => {
    const a = window.__forbiddenCityApp;
    cancelAnimationFrame(a.animationFrame); a.disposed = true;
    document.querySelector('#welcome-overlay').style.display = 'none';
    const { InteriorLoader } = await import('/src/scene/interior/InteriorLoader.js');
    const { INTERIORS } = await import('/src/scene/interior/registry.js');
    const cfg = INTERIORS[hallId];
    const floorY = a.collisionManager.getGroundHeight(cfg.frame.x, cfg.frame.z, 0, 999);
    window.__p1i = { L: new InteriorLoader(a.scene, a.collisionManager, { renderer: a.renderer, registry: INTERIORS }), cfg, floorY };
    return { floorY, frame: cfg.frame, throne: cfg.throne, views: cfg.views };
  }, { hallId });
  const { floorY, frame: f, throne: t } = setup;
  const eye = floorY + 1.7;
  // 机位：宝座殿 1 门内望宝座；2 宝座台前近景；3 仰视藻井。
  // 非宝座殿（如坤宁宫，JSON 无 throne）：用 JSON 的 views[]（殿局部坐标，y 相对地面），没有则取殿心的三个通用机位。
  let views;
  if (t) {
    const zc = f.z + (t.ztb0 + t.ztb1) / 2;
    views = [
      [[f.x, eye, f.z - f.d / 2 + 2], [f.x, floorY + 3, zc]],
      [[f.x + 4, eye, f.z + t.ztb0 - 7], [f.x, floorY + 2.5, zc]],
      [[f.x, eye, zc - 6], [f.x, floorY + 12, zc - 1.2]],
    ];
  } else if (setup.views?.length) {
    views = setup.views.map(v => [[f.x + v.eye[0], floorY + v.eye[1], f.z + v.eye[2]], [f.x + v.look[0], floorY + v.look[1], f.z + v.look[2]]]);
  } else {
    views = [
      [[f.x, eye, f.z - f.d / 2 + 2], [f.x, floorY + 2, f.z + f.d / 4]],
      [[f.x - f.w / 4, eye, f.z], [f.x - f.w / 2, floorY + 2, f.z]],
      [[f.x + f.w / 4, eye, f.z], [f.x + f.w / 2, floorY + 2, f.z]],
    ];
  }
  const shoot = async (tag) => {
    const out = [];
    for (let i = 0; i < views.length; i++) {
      const [[x, y, z], [lx, ly, lz]] = views[i];
      const st = await page.evaluate(({ x, y, z, lx, ly, lz }) => {
        const a = window.__forbiddenCityApp;
        a.camera.position.set(x, y, z); a.camera.lookAt(lx, ly, lz); a.camera.updateMatrixWorld();
        a.environment.update(a.camera, 0.016);
        a.renderer.info.autoReset = false; a.renderer.info.reset();
        a.postProcessing.render();
        const r = { calls: a.renderer.info.render.calls, tris: a.renderer.info.render.triangles };
        a.renderer.info.autoReset = true; return r;
      }, { x, y, z, lx, ly, lz });
      const file = path.join(outDir, `p1i-${hallId}-${tag}-${i + 1}.png`);
      await page.screenshot({ path: file });
      out.push({ file: path.basename(file), ...st });
    }
    return out;
  };
  const before = await shoot('B');
  const load = await page.evaluate(async ({ hallId }) => {
    const { L } = window.__p1i;
    const ok = await L.load(hallId);
    // 跳过淡入：直接推进到 >300ms
    const h = L.halls.get(hallId); if (h?.fade) h.fade.t0 = performance.now() - 1000;
    L.update({ x: window.__p1i.cfg.frame.x, z: window.__p1i.cfg.frame.z });
    const g = L.getGroup(hallId);
    const THREE = await import('three');
    const b = g ? new THREE.Box3().setFromObject(g) : null;
    return { ok, hud: L.hudLine(), bbox: b && { min: [b.min.x, b.min.y, b.min.z].map(v => +v.toFixed(2)), max: [b.max.x, b.max.y, b.max.z].map(v => +v.toFixed(2)) } };
  }, { hallId });
  const after = await shoot('S');
  console.log(JSON.stringify({ hallId, floorY, load, before, after, errors }, null, 1));
  await browser.close();
  process.exit(load.ok && !errors.length ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
