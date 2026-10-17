const { browserExecutablePath } = require('./lib/browser-path.cjs');
// P1-R R-0 profile：统计整帧 draw calls 的来源构成（不改产品代码，只读场景）。
// 用法：node tests/p1r-profile.cjs [机位名|all]（默认 all 6 点）
// 输出：/tmp/p1r-profile.json + 控制台摘要
//
// 构成拆分：
//   whole        = composer.render() 整帧（= perf.cjs 口径）
//   renderPass   = renderer.render(scene, camera)（含阴影贴图 pass）
//   main         = renderer.render 且 dirLight.castShadow=false（纯主 pass）
//   shadow       = renderPass − main
//   post         = whole − renderPass（SSAO 法线全场景 pass + 后期全屏 quad）
// 逐顶层 group：只保留该 group 可见时渲染，统计 main calls / tris / mesh 数 / 材质数，
//   以及 shadow calls（castShadow=true 与 false 之差）。
const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = path.resolve(__dirname, '..');

(async () => {
  const which = process.argv[2] || 'all';
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
  await page.goto(process.env.PALACE_URL || 'http://127.0.0.1:5173', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__forbiddenCityApp?.postProcessing?.composer && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 240000 });
  page.setDefaultTimeout(600000);

  const out = await page.evaluate(async ({ which }) => {
    const a = window.__forbiddenCityApp;
    cancelAnimationFrame(a.animationFrame);
    a.disposed = true;
    document.querySelector('#welcome-overlay').style.display = 'none';

    const { LAYOUT } = await import('/src/config/constants.js');
    const points = [
      { point: '午门前', pos: [0, LAYOUT.START_POSITION.z] },
      { point: '太和殿前', pos: [0, -74] },
      { point: '乾清门', pos: [0, LAYOUT.QIANQING_GATE_Z - 20] },
      { point: '东六宫中', pos: [-120.8, 382.6] },
      { point: '宁寿宫', pos: [-293.2, 164.1] },
      { point: '御花园', pos: [0, 433.7] },
    ].filter(p => which === 'all' || which === p.point);
    const [x, z] = [0, -74]; // 分组归属测量固定用最重的太和殿前机位

    const renderer = a.renderer;
    const camera = a.camera;
    const info = renderer.info;
    info.autoReset = false;

    const settle = (px, pz) => {
      // 模拟 perf 的流式加载：反复 update 直到构建队列清空
      a.controls.setPosition(px, 1.7, pz);
      a.controls.lookAt(px, pz + 10);
      camera.position.set(px, 1.7, pz);
      camera.lookAt(px, 1.7, pz + 10);
      camera.updateMatrixWorld(true);
      a.environment.update(camera, 0.016); // 阴影相机跟随玩家（停循环后不会自动跑）
      for (let i = 0; i < 200 && (a.zoneManager.buildQueue.length || i < 2); i++) a.zoneManager.update({ x: px, z: pz });
      a.lastShadowUpdate = 0;
      a.shadowSetup.updateShadowLOD(camera, a.shadowObjects, a.currentQuality === 'high' ? 150 : 80);
    };

    const measure = (render) => {
      info.reset();
      render();
      return { calls: info.render.calls, tris: info.render.triangles };
    };

    const results = [];
    for (const p of points) {
      settle(p.pos[0], p.pos[1]);
      const whole = measure(() => a.postProcessing.render());
      const drawScene = () => {
        a.postProcessing.batchedBuilder?.begin();
        try { renderer.render(a.scene, camera); }
        finally { a.postProcessing.batchedBuilder?.end(); }
      };
      const renderPass = measure(drawScene);
      const dirLight = a.environment.dirLight;
      dirLight.castShadow = false;
      const main = measure(drawScene);
      dirLight.castShadow = true;
      results.push({
        point: p.point,
        whole, renderPass, main,
        shadow: { calls: renderPass.calls - main.calls, tris: renderPass.tris - main.tris },
        post: { calls: whole.calls - renderPass.calls, tris: whole.tris - renderPass.tris },
        loaded: a.zoneManager.getLoadedIds(),
      });
    }

    // ── 逐顶层 group 归属（太和殿前机位）──
    settle(x, z);
    const dirLight = a.environment.dirLight;
    const tops = [];
    for (const child of a.scene.children) {
      const label = child.name || child.type + (child.isLight ? '(light)' : '');
      const meshes = [];
      child.traverse?.(o => { if (o.isMesh && o.visible) meshes.push(o); });
      if (!meshes.length && !child.isLight) continue;
      const mats = new Set(meshes.map(m => m.material.uuid));
      const saved = a.scene.children.map(c => c.visible);
      a.scene.children.forEach(c => { c.visible = false; });
      child.visible = true;
      dirLight.castShadow = false;
      const main = measure(() => renderer.render(a.scene, camera));
      dirLight.castShadow = true;
      const both = measure(() => renderer.render(a.scene, camera));
      a.scene.children.forEach((c, i) => { c.visible = saved[i]; });
      tops.push({
        label, kind: child.isLight ? 'light' : child.type,
        meshes: meshes.length, materials: mats.size,
        mainCalls: main.calls, mainTris: main.tris,
        shadowCalls: both.calls - main.calls,
      });
    }

    // ── 主 pass 按材质聚合（可见集合，太和殿前）──
    dirLight.castShadow = false;
    const matCount = new Map();
    a.scene.traverse(o => {
      if (!o.isMesh || !o.visible || o.visible === false) return;
      // 手动视锥测试之外的直接全部统计（近似：按 frustum 包围球）
      if (!o.geometry?.boundingSphere) o.geometry?.computeBoundingSphere?.();
      const key = o.material.name || o.material.uuid;
      matCount.set(key, (matCount.get(key) ?? 0) + 1);
    });
    dirLight.castShadow = true;

    return {
      points: results,
      groups: tops.sort((m, n) => n.mainCalls - m.mainCalls),
      materialMeshCounts: [...matCount.entries()].map(([name, n]) => ({ name, meshes: n })).sort((m, n) => n.meshes - m.meshes),
      buildTimes: Object.fromEntries(a.zoneManager.buildTimes),
    };
  }, { which });

  out.errors = errors;
  fs.writeFileSync('/tmp/p1r-profile.json', JSON.stringify(out, null, 2) + '\n');
  for (const p of out.points) {
    console.log(`\n[${p.point}] loaded=${p.loaded.join(',')}
  whole ${p.whole.calls}/${p.whole.tris}  renderPass ${p.renderPass.calls}/${p.renderPass.tris}
  main ${p.main.calls}/${p.main.tris}  shadow ${p.shadow.calls}/${p.shadow.tris}  post ${p.post.calls}/${p.post.tris}`);
  }
  console.log('\n── 顶层 group（太和殿前机位，mainCalls 降序）──');
  for (const g of out.groups) {
    console.log(`${String(g.mainCalls).padStart(4)} main ${String(g.shadowCalls).padStart(4)} shadow  mesh ${String(g.meshes).padStart(3)}  mat ${String(g.materials).padStart(2)}  ${g.kind}  ${g.label}`);
  }
  console.log('\n── 材质 → mesh 数（top 20，全场景）──');
  for (const m of out.materialMeshCounts.slice(0, 20)) console.log(`${String(m.meshes).padStart(4)}  ${m.name}`);
  console.log('\nbuildTimes', out.buildTimes);
  errors.forEach(e => console.log('  ' + e));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
