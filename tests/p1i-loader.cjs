const { browserExecutablePath } = require('./lib/browser-path.cjs');
// P1-I 内景加载器链路测试：加载 / 碰撞登记 / 淡入 / 距离触发 / 卸载释放显存 / 失败回退 B 档。
// 用法：PORT=5184 tools/run-with-vite.sh node tests/p1i-loader.cjs [hallId=taihe] [model=/models/interiors/_minimal.glb]
//   在页面里动态 import InteriorLoader（main.js 未接线也能测），把殿的 model 覆盖成指定 GLB。
const { chromium } = require('playwright');
const hallId = process.argv[2] || 'taihe';
const model = process.argv[3] || null;

(async () => {
  const browser = await chromium.launch({ executablePath: browserExecutablePath(), headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 640, height: 400 } });
  const warns = [];
  page.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') warns.push(m.text()); });
  await page.goto((process.env.PALACE_URL || 'http://127.0.0.1:5173') + '/?zones=all', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__forbiddenCityApp?.controls && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 240000 });

  const res = await page.evaluate(async ({ hallId, model }) => {
    const a = window.__forbiddenCityApp;
    const { InteriorLoader } = await import('/src/scene/interior/InteriorLoader.js');
    const { INTERIORS } = await import('/src/scene/interior/registry.js');
    const base = INTERIORS[hallId];
    if (!base) return { error: `未注册的殿 ${hallId}` };
    const cfg = JSON.parse(JSON.stringify(base));
    if (model) cfg.model = model;
    const out = { hallId, model: cfg.model, steps: [] };
    const mem = () => ({ geo: a.renderer.info.memory.geometries, tex: a.renderer.info.memory.textures });
    const render = () => { a.renderer.render(a.scene, a.camera); };
    const colCount = tag => a.collisionManager.colliders.filter(c => c.tag === tag).length;

    // 1) 显式 load
    const L = new InteriorLoader(a.scene, a.collisionManager, { renderer: a.renderer, registry: { [hallId]: cfg } });
    const m0 = mem();
    const t0 = performance.now();
    const ok = await L.load(hallId);
    const ms = Math.round(performance.now() - t0);
    render();
    const m1 = mem();
    const grp = L.getGroup(hallId);
    let bbox = null, tris = 0, hidden = 0, visible = 0;
    if (grp) {
      const b = new (await import('three')).Box3().setFromObject(grp);
      bbox = { min: [b.min.x, b.min.y, b.min.z].map(v => +v.toFixed(2)), max: [b.max.x, b.max.y, b.max.z].map(v => +v.toFixed(2)) };
      grp.traverse(o => { if (o.isMesh) { if (o.visible) visible++; else hidden++; const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
    }
    out.steps.push({ step: 'load', ok, ms, state: L.getState(hallId), memBefore: m0, memAfter: m1, bbox, tris: Math.round(tris), visibleMeshes: visible, hiddenProxies: hidden, colliders: colCount(`interior:${hallId}`), history: L.history[hallId], hud: L.hudLine() });

    // 2) 淡入：加载后立刻材质 opacity 应 <1，350ms 后恢复
    if (ok) {
      const mats = new Set(); grp.traverse(o => { if (o.isMesh && o.visible) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => mats.add(m)); });
      const f2 = [...mats][0];
      const opStart = f2?.opacity;
      const f = cfg.frame;
      L.update({ x: f.x, z: f.z }); // 殿内：不卸载，只推进淡入
      const opMid = f2?.opacity;
      await new Promise(r => setTimeout(r, 350));
      L.update({ x: f.x, z: f.z });
      out.steps.push({ step: 'fade', opacityStart: opStart, opacityMid: opMid, opacityAfter350: f2?.opacity, transparentRestored: f2?.transparent === false });
    }

    // 3) 距离触发：在殿内 → loaded；走到 20m（<40） 仍 loaded；45m → idle，显存回落
    const f = cfg.frame;
    L.unload(hallId);
    const mIdle = mem();
    L.update({ x: f.x, z: f.z });
    const stLoading = L.getState(hallId);
    await (L.halls.get(hallId).promise ?? Promise.resolve());
    render();
    const mLoaded = mem();
    L.update({ x: f.x, z: f.z - f.d / 2 - 20 });
    const stAt20 = L.getState(hallId);
    L.update({ x: f.x, z: f.z - f.d / 2 - 45 });
    render();
    const mAfter = mem();
    out.steps.push({ step: 'distance', atCenter: stLoading, at20m: stAt20, at45m: L.getState(hallId), collidersAfter: colCount(`interior:${hallId}`), memIdle: mIdle, memLoaded: mLoaded, memAfterUnload: mAfter, vramDropped: mAfter.geo <= mIdle.geo && mAfter.tex <= mIdle.tex });

    // 4) 失败回退：不存在的 GLB → failed，B 档不动（PalaceBuilder 碰撞数不变）
    const colsBefore = a.collisionManager.colliders.length;
    const L2 = new InteriorLoader(a.scene, a.collisionManager, { renderer: a.renderer, registry: { [hallId]: { ...cfg, model: '/models/interiors/__missing__.glb' } } });
    const ok2 = await L2.load(hallId);
    out.steps.push({ step: 'fallback', ok: ok2, state: L2.getState(hallId), collidersUnchanged: a.collisionManager.colliders.length === colsBefore, groupNull: L2.getGroup(hallId) === null });
    L.dispose(); L2.dispose();
    return out;
  }, { hallId, model });

  console.log(JSON.stringify(res, null, 1));
  console.log('warnings:', warns.filter(w => w.includes('InteriorLoader')));
  await browser.close();
  const s = Object.fromEntries((res.steps ?? []).map(x => [x.step, x]));
  const pass = res.steps && s.load?.ok && s.load.colliders > 0 && s.fade?.opacityAfter350 === 1 && s.distance?.at45m === 'idle' && s.distance.collidersAfter === 0 && s.distance.vramDropped && s.fallback?.ok === false && s.fallback.collidersUnchanged;
  console.log(pass ? 'P1I-LOADER PASS' : 'P1I-LOADER FAIL');
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
