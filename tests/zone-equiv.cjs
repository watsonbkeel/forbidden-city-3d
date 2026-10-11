// 分区重构零变化证明（与视角无关）：
// 在同一页面里分别构建旧 SideCourts（单 CourtKit）和 7 个 zone（ZoneBase），逐项对比：
//   三角面总数、按材质名分组的三角面、碰撞体包围盒、可行走面、regions、mapItems、rooms。
// 用法：PALACE_URL=http://127.0.0.1:5180 node tests/zone-equiv.cjs
// 说明：tests/perf.cjs 统计的是“当前视角下实际绘制”的三角面，分区后视锥剔除粒度变细会自然变少，
//       不能用来判断数据是否抄错；本脚本统计的是构建产物本身。
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
  page.on('pageerror', e => console.log('pageerror:', e.message));
  await page.goto(process.env.PALACE_URL || 'http://127.0.0.1:5173', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__forbiddenCityApp?.controls && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 240000 });

  const r = await page.evaluate(async () => {
    const a = window.__forbiddenCityApp;
    cancelAnimationFrame(a.animationFrame);
    a.disposed = true;
    const { SideCourts } = await import('/src/scene/SideCourts.js');
    const { ZoneBase } = await import('/src/scene/zones/ZoneBase.js');
    const { ZONES } = await import('/data/zones/index.js');
    const THREE = await import('three');

    const tri = g => (g.index ? g.index.count : g.attributes.position.count) / 3;
    const geoStats = groups => {
      const byMat = {};
      let total = 0, meshes = 0;
      for (const grp of groups) grp.traverse(o => {
        if (!o.isMesh) return;
        meshes++;
        const n = tri(o.geometry) * (o.isInstancedMesh ? o.count : 1);
        total += n;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        const key = mats.map(m => m.name || m.type).join('+');
        byMat[key] = (byMat[key] || 0) + n;
      });
      return { total, meshes, byMat };
    };
    const r1 = v => Math.round(v * 100) / 100;
    const boxKey = b => [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z].map(r1).join(',');
    // rooms.id 是每个 CourtKit 内的自增序号，拆成 7 个 kit 后必然重新编号，不参与比较
    const sig = list => list.map(x => (x.isBox3 ? boxKey(x) : JSON.stringify(x, (k, v) => (k === 'id' ? undefined : typeof v === 'number' ? r1(v) : v?.isBox3 ? boxKey(v) : v)))).sort();
    const diffList = (A, B) => {
      const ca = new Map(), cb = new Map();
      A.forEach(s => ca.set(s, (ca.get(s) || 0) + 1));
      B.forEach(s => cb.set(s, (cb.get(s) || 0) + 1));
      const onlyA = [], onlyB = [];
      for (const [s, n] of ca) { const m = cb.get(s) || 0; if (n > m) onlyA.push(`${n - m}× ${s.slice(0, 140)}`); }
      for (const [s, n] of cb) { const m = ca.get(s) || 0; if (n > m) onlyB.push(`${n - m}× ${s.slice(0, 140)}`); }
      return { a: A.length, b: B.length, onlyOld: onlyA.slice(0, 12), onlyNew: onlyB.slice(0, 12), onlyOldCount: onlyA.length, onlyNewCount: onlyB.length };
    };

    // 旧：单 CourtKit
    const scratch = new THREE.Scene();
    const old = new SideCourts(scratch, a.library).build();
    const oldK = old.kit;
    const oldData = { group: old.group, colliders: [...oldK.colliders], walkables: [...oldK.walkables], regions: [...oldK.regions], mapItems: [...oldK.mapItems], rooms: [...oldK.rooms] };

    // 新：7 个 ZoneBase
    const builders = ZONES.map(z => new ZoneBase(a.library, z));
    const parts = builders.map(b => b.build());
    const pick = k => parts.flatMap(p => p[k]);
    const newData = { groups: parts.map(p => p.group), colliders: pick('colliders'), walkables: pick('walkables'), regions: pick('regions'), mapItems: pick('mapItems'), rooms: pick('rooms') };

    const gOld = geoStats([oldData.group]);
    const gNew = geoStats(newData.groups);
    const matKeys = [...new Set([...Object.keys(gOld.byMat), ...Object.keys(gNew.byMat)])].sort();
    const matDiff = matKeys.filter(k => (gOld.byMat[k] || 0) !== (gNew.byMat[k] || 0)).map(k => ({ mat: k, old: gOld.byMat[k] || 0, new: gNew.byMat[k] || 0 }));

    const out = {
      tris: { old: gOld.total, new: gNew.total, meshesOld: gOld.meshes, meshesNew: gNew.meshes, matDiff },
      colliders: diffList(sig(oldData.colliders), sig(newData.colliders)),
      walkables: diffList(sig(oldData.walkables), sig(newData.walkables)),
      regions: diffList(sig(oldData.regions), sig(newData.regions)),
      mapItems: diffList(sig(oldData.mapItems), sig(newData.mapItems)),
      rooms: diffList(sig(oldData.rooms), sig(newData.rooms)),
    };
    old.dispose();
    builders.forEach(b => b.dispose());
    return out;
  });

  let fail = 0;
  const line = (name, ok, detail) => { if (!ok) fail++; console.log(`${ok ? '✅' : '❌'} ${name}  ${detail}`); };
  line('三角面总数', r.tris.old === r.tris.new && r.tris.matDiff.length === 0, `旧 ${r.tris.old} / 新 ${r.tris.new}（网格数 ${r.tris.meshesOld} → ${r.tris.meshesNew}）`);
  r.tris.matDiff.forEach(d => console.log(`     材质 ${d.mat}: ${d.old} → ${d.new} (${d.new - d.old})`));
  for (const k of ['colliders', 'walkables', 'regions', 'mapItems', 'rooms']) {
    const d = r[k];
    line(k, d.onlyOldCount === 0 && d.onlyNewCount === 0, `旧 ${d.a} / 新 ${d.b}；仅旧有 ${d.onlyOldCount} 种，仅新有 ${d.onlyNewCount} 种`);
    d.onlyOld.forEach(s => console.log('     仅旧:', s));
    d.onlyNew.forEach(s => console.log('     仅新:', s));
  }
  console.log(fail ? `\n零变化证明失败：${fail} 项不一致` : '\n零变化证明通过：几何与碰撞数据完全一致');
  await browser.close();
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
