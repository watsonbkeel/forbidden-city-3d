// P1-I A 档预设测试：用 CourtKit 在页面里按东六宫正殿尺寸（景仁宫 24×12）各建一座套用 4 个预设的殿，
// 检查 (1) 门道 1.6 m 贯通（门中线 ±0.8 m、从前檐到房间中心、脚面+0.35~头顶 无碰撞体）
//      (2) 用 CollisionManager.checkCollision 沿门道逐点探测（玩家半径 0.5）
//      (3) 每个预设至少放了家具并登记了掩体
// 用法：PORT=5184 tools/run-with-vite.sh node tests/p1i-presets.cjs
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 640, height: 400 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto((process.env.PALACE_URL || 'http://127.0.0.1:5173') + '/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__forbiddenCityApp?.controls && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 240000 });

  const res = await page.evaluate(async () => {
    const a = window.__forbiddenCityApp;
    const THREE = await import('three');
    const { CourtKit } = await import('/src/scene/palace/kit.js');
    const { INTERIOR_KINDS } = await import('/src/scene/palace/interiors.js');
    const cm = a.collisionManager;
    const out = [];
    // 空地：午门南广场东侧（世界 x=-60, z=-470 附近没有建筑）；每座殿错开 40 m
    const cases = [
      // 景仁宫正殿尺寸；backDoor 殿用于 gate-hall
      { kind: 'palace-front', w: 24, d: 12, colH: 6.72, ph: 0.6, pad: 0.8, backDoor: false },
      { kind: 'gate-hall', w: 24, d: 12, colH: 6.72, ph: 0.6, pad: 0.8, backDoor: true },
      { kind: 'study', w: 11.2, d: 7.04, colH: 5.44, ph: 0.45, pad: 0.5, backDoor: false },
      { kind: 'bedroom', w: 11.2, d: 7.04, colH: 5.44, ph: 0.45, pad: 0.5, backDoor: false },
      // 窄间（配殿 3 间分房）：预设必须在 3.7 m 宽房间里也不堵门
      { kind: 'study', w: 11.2, d: 7.04, colH: 5.44, ph: 0.45, pad: 0.5, backDoor: false, roomBays: 1 },
      { kind: 'bedroom', w: 11.2, d: 7.04, colH: 5.44, ph: 0.45, pad: 0.5, backDoor: false, roomBays: 1 },
    ];
    let k = 0;
    for (const c of cases) {
      const x = -60 - (k % 3) * 40, z = -470 + Math.floor(k / 3) * 30; k++;
      const kit = new CourtKit(a.library, `p1i-${c.kind}`);
      const n0 = kit.rooms.length;
      kit.hall({ x, z, rot: 0, w: c.w, d: c.d, colH: c.colH, ph: c.ph, pad: c.pad, roof: 'xieshan', enter: true, throne: false, interior: c.kind, backDoor: c.backDoor, roomBays: c.roomBays ?? 0, name: null, plaque: false, map: null });
      const g = kit.finish();
      a.scene.add(g);
      const tag = `p1i-${c.kind}-${k}`;
      cm.addColliders(kit.colliders, tag);
      cm.addWalkables(kit.walkables, tag);
      const rooms = kit.rooms.slice(n0);
      const roomRes = [];
      for (const room of rooms) {
        const door = room.doors[0];
        const floor = room.floorY;
        const zc = (room.min.z + room.max.z) / 2;
        // (1) 几何：门道走廊盒
        const corridor = new THREE.Box3(new THREE.Vector3(door.x - 0.8, floor + 0.36, room.min.z), new THREE.Vector3(door.x + 0.8, floor + 1.75, zc));
        const hits = kit.colliders.filter(b => b.intersectsBox(corridor)).map(b => [+b.min.x.toFixed(2), +b.min.z.toFixed(2), +b.max.x.toFixed(2), +b.max.z.toFixed(2), +(b.max.y - floor).toFixed(2)]);
        // (2) 逐点探测：从前檐外 1.5 m 走到房间中心
        const blocked = [];
        for (let zz = room.min.z - 1.5; zz <= zc; zz += 0.25) {
          const p = new THREE.Vector3(door.x, floor + 1.7, zz);
          if (cm.checkCollision(p, 0.5)) blocked.push(+zz.toFixed(2));
        }
        // 后门殿：也要从中心走到后檐
        if (c.backDoor) for (let zz = zc; zz <= room.max.z + 1.5; zz += 0.25) {
          const p = new THREE.Vector3(door.x, floor + 1.7, zz);
          if (cm.checkCollision(p, 0.5)) blocked.push(+zz.toFixed(2));
        }
        roomRes.push({ name: room.name, w: +(room.max.x - room.min.x).toFixed(1), doorX: door.x, corridorHits: hits, blockedZ: blocked, cover: room.cover.length, spawns: room.spawns.length });
      }
      let meshes = 0, tris = 0;
      g.traverse(o => { if (o.isMesh) { meshes++; const gg = o.geometry; tris += (gg.index ? gg.index.count : gg.attributes.position.count) / 3; } });
      out.push({ kind: c.kind, roomBays: c.roomBays ?? 0, colliders: kit.colliders.length, drawMeshes: meshes, tris: Math.round(tris), rooms: roomRes });
      cm.removeByTag(tag);
      a.scene.remove(g);
      kit.dispose(g);
    }
    return { kinds: INTERIOR_KINDS, cases: out };
  });

  console.log(JSON.stringify(res, null, 1));
  if (errors.length) console.log('pageerrors:', errors);
  await browser.close();
  const need = ['palace-front', 'gate-hall', 'study', 'bedroom'];
  const kindsOk = need.every(k => res.kinds.includes(k));
  const allClear = res.cases.every(c => c.rooms.every(r => r.corridorHits.length === 0 && r.blockedZ.length === 0));
  const furnished = res.cases.every(c => c.rooms.every(r => r.cover >= 1));
  const pass = kindsOk && allClear && furnished && errors.length === 0;
  console.log(`kinds=${kindsOk} doorwayClear=${allClear} furnished=${furnished} errors=${errors.length}`);
  console.log(pass ? 'P1I-PRESETS PASS' : 'P1I-PRESETS FAIL');
  process.exit(pass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
