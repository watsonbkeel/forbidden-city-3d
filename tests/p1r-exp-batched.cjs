const { browserExecutablePath } = require('./lib/browser-path.cjs');
// P1-R R-1 实验：把场景顶层 group 的静态 mesh 按材质聚合为 BatchedMesh，
// 在太和殿前机位对比 main / renderPass calls & tris（不改产品代码，页面内即时构建）。
// three 通过 vite 直接 import /node_modules/three/build/three.module.js（第二个实例，
// 但 renderer 全部用 .isXxx 鸭子类型判断，跨实例可用）。
// 用法：node tests/p1r-exp-batched.cjs [点=太和殿前] [scope=zones|all]
//   scope=zones 只批已加载 zone 组；scope=all 含常驻组（三台/后三宫/御花园/城墙…）
const { chromium } = require('playwright');

(async () => {
  const point = process.argv[2] || '太和殿前';
  const scope = process.argv[3] || 'all';
  const POS = { '太和殿前': [0, -74], '午门前': [0, -470], '乾清门': [0, 195.3], '东六宫中': [-120.8, 382.6], '宁寿宫': [-293.2, 164.1], '御花园': [0, 433.7] };
  const [x, z] = POS[point] ?? POS['太和殿前'];

  const browser = await chromium.launch({
    executablePath: browserExecutablePath(),
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', e => console.log('pageerror: ' + e.message));
  await page.goto(process.env.PALACE_URL || 'http://127.0.0.1:5173', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__forbiddenCityApp?.postProcessing?.composer && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 240000 });
  page.setDefaultTimeout(600000);

  const out = await page.evaluate(async ({ x, z, scope }) => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const a = window.__forbiddenCityApp;
    cancelAnimationFrame(a.animationFrame);
    a.disposed = true;
    document.querySelector('#welcome-overlay').style.display = 'none';
    const camera = a.camera, renderer = a.renderer, scene = a.scene, info = renderer.info;
    info.autoReset = false;

    a.controls.setPosition(x, 1.7, z);
    a.controls.lookAt(x, z + 10);
    camera.position.set(x, 1.7, z);
    camera.lookAt(x, 1.7, z + 10);
    camera.updateMatrixWorld(true);
    for (let i = 0; i < 200 && (a.zoneManager.buildQueue.length || i < 2); i++) a.zoneManager.update({ x, z: z });
    a.environment.update(camera, 0.016);
    a.lastShadowUpdate = 0;
    a.shadowSetup.updateShadowLOD(camera, a.shadowObjects, 150);
    scene.updateMatrixWorld(true);

    const measure = (render) => { info.reset(); render(); return { calls: info.render.calls, tris: info.render.triangles }; };

    // 基线
    const dirLight = a.environment.dirLight;
    const baseMain = measure(() => { dirLight.castShadow = false; renderer.render(scene, camera); dirLight.castShadow = true; });
    const baseFull = measure(() => renderer.render(scene, camera));

    // 收集目标组：zone 组（ZoneManager 持有）+ 常驻组（scene 其余顶层 Group）
    const zoneGroups = new Set();
    for (const [, entry] of a.zoneManager.loaded) zoneGroups.add(entry.data.group);
    const targets = [];
    for (const child of scene.children) {
      if (!child.isGroup) continue;
      if (scope === 'zones' ? zoneGroups.has(child) : true) targets.push(child);
    }

    // 按材质分桶（只收静态、单材质、普通 Mesh）
    const buckets = new Map();
    const skipped = { instanced: 0, multi: 0, attrMismatch: 0, noMerge: 0 };
    let collected = 0;
    for (const g of targets) {
      g.traverse(o => {
        if (!o.isMesh || o.isInstancedMesh || o.isBatchedMesh) { if (o.isInstancedMesh) skipped.instanced++; return; }
        if (o.userData.noMerge) { skipped.noMerge++; return; }
        if (Array.isArray(o.material)) { skipped.multi++; return; }
        if (!o.visible) return;
        const key = o.material.uuid;
        if (!buckets.has(key)) buckets.set(key, { material: o.material, meshes: [] });
        buckets.get(key).meshes.push(o);
        collected++;
      });
    }

    // 构建 BatchedMesh（每材质一个；属性归一化为 position/normal/uv、非索引）
    const t0 = performance.now();
    const added = [];
    const hidden = [];
    const normalize = (geo) => {
      let g = geo.index ? geo.toNonIndexed() : geo;
      const names = Object.keys(g.attributes);
      if (!g.attributes.normal || !g.attributes.uv || names.length > 3 || names.length < 3) {
        g = g.clone();
        if (!g.attributes.normal) g.computeVertexNormals();
        if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
        for (const n of Object.keys(g.attributes)) if (n !== 'position' && n !== 'normal' && n !== 'uv') g.deleteAttribute(n);
      }
      return g;
    };
    for (const { material, meshes } of buckets.values()) {
      if (meshes.length < 2) continue; // 单 mesh 的桶不值得
      let bm;
      try {
        bm = new THREE.BatchedMesh(meshes.length);
        for (const m of meshes) {
          const gid = bm.addGeometry(normalize(m.geometry));
          bm.setMatrixAt(gid, m.matrixWorld);
        }
      } catch (e) { skipped.attrMismatch += meshes.length; continue; }
      bm.material = material;
      bm.castShadow = meshes.some(m => m.castShadow);
      bm.receiveShadow = true;
      bm.frustumCulled = false; // 整体不做对象级剔除，靠 per-geometry culling
      bm.name = 'batch_' + (material.name || 'mat');
      bm.userData.experimentalBatch = true;
      scene.add(bm);
      added.push(bm);
      for (const m of meshes) { m.userData._batched = true; hidden.push(m); }
    }
    const buildMs = performance.now() - t0;

    // 隐藏被批的源 mesh（把整组 visible 置 false 会连未批 mesh 一起藏，改逐 mesh）
    for (const m of hidden) m.visible = false;

    const newMain = measure(() => { dirLight.castShadow = false; renderer.render(scene, camera); dirLight.castShadow = true; });
    const newFull = measure(() => renderer.render(scene, camera));
    const newWhole = measure(() => a.postProcessing.render());

    // 恢复
    for (const m of hidden) m.visible = true;
    for (const bm of added) { scene.remove(bm); bm.dispose(); }

    const bucketStats = [...buckets.values()].map(b => ({ name: b.material.name || b.material.uuid.slice(0, 8), meshes: b.meshes.length })).sort((m, n) => n.meshes - m.meshes);
    return {
      point: `${x},${z}`, scope, targets: targets.length,
      collected, buckets: buckets.size, batchedMeshes: added.length, buildMs: +buildMs.toFixed(1),
      baseMain, baseFull, newMain, newFull, newWhole, skipped, bucketStats,
    };
  }, { x, z, scope });

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
