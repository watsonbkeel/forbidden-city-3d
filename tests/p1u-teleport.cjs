const { browserExecutablePath } = require('./lib/browser-path.cjs');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: browserExecutablePath(), headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(process.env.PALACE_URL);
    await page.waitForFunction(() => window.__forbiddenCityApp?.teleport && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 120000 });
    const rows = await page.evaluate(async () => {
      const a = window.__forbiddenCityApp;
      cancelAnimationFrame(a.animationFrame);
      const { TELEPORT, PLAYER } = await import('/src/config/constants.js');
      const { Vector3 } = await import('/node_modules/three/build/three.module.js');
      const names = [...new Set([...TELEPORT.POINTS.map(p => p.target), ...a.minimap.labels.map(p => p.name)])];
      return names.map(name => {
        const point = a.teleport.go(name);
        const g = a.teleport.geometryFor(name);
        const landing = point ?? a.teleport.landingFor(name);
        if (!point) {
          const cm = a.collisionManager;
          const y = cm.getGroundHeight(landing.x, landing.z, Infinity);
          const overlaps = cm.colliders.filter(c => c.box.min.x < landing.x + 0.5 && c.box.max.x > landing.x - 0.5 && c.box.min.z < landing.z + 0.5 && c.box.max.z > landing.z - 0.5 && c.box.min.y < y + PLAYER.HEIGHT && c.box.max.y > y + 0.35).map(c => ({ name: c.object?.name ?? c.tag, min: c.box.min.toArray(), max: c.box.max.toArray() }));
          return { name, ...landing, y, overlaps, pass: false, reason: '落点碰撞' };
        }
        const p = a.controls.getPosition();
        const feet = a.controls.getFeetY();
        const ground = a.collisionManager.getGroundHeight(p.x, p.z, Infinity);
        // BEGIN QINAN EXTERIOR VIEW
        if (g.navigation?.mode === 'exterior-view') {
          const n = g.navigation, cm = a.collisionManager;
          const facing = a.camera.getWorldDirection(new Vector3()).dot(new Vector3(landing.lookAtX - p.x, landing.lookAtY - p.y, landing.lookAtZ - p.z).normalize());
          const loaded = a.zoneManager.getLoadedIds().includes(g.requiredZone);
          const residentHash = a.zoneManager.loaded.get(g.requiredZone)?.data.mapItems.find(m => m.qinanProfile === 'qinan')?.profileHash;
          const residentSupports = g.requiredSupports.every(s => cm.walkables.some(w => w.tag === g.requiredZone && w.type === 'box' && w.rescue === false &&
            ['x', 'y', 'z'].every((axis, i) => Math.abs(w.box.min[axis] - s.min[i]) < 1e-7 && Math.abs(w.box.max[axis] - s.max[i]) < 1e-7)));
          const overlap = cm.checkCollision(p, 0.5);
          const exactPoint = p.x === n.position.x && p.z === n.position.z && feet === n.position.feetY && feet === 0;
          return { name, mode: n.mode, viewpointId: point.viewpointId, x: p.x, z: p.z, feet, ground, facing, loaded, residentHash, residentSupports, overlap,
            profileHash: point.profileHash, validatedAgainstProfileHash: point.validatedAgainstProfileHash, fallback: point.fallback, entryRouteAccepted: false,
            pass: loaded && residentSupports && residentHash === n.profileHash && exactPoint && ground === 0 && !overlap && facing > 0.999 &&
              point.viewpointVerified === true && point.validatedAgainstProfileHash === n.profileHash && point.fallback === false };
        }
        // END QINAN EXTERIOR VIEW
        const facing = a.camera.getWorldDirection(new Vector3()).dot(new Vector3(landing.lookAtX - p.x, 0, landing.lookAtZ - p.z).normalize());
        const zone = a.zoneManager.findZone(landing.lookAtX, landing.lookAtZ) ?? a.zoneManager.findZone(p.x, p.z);
        const loaded = !zone || a.zoneManager.getLoadedIds().includes(zone);
        // 前行验收（总控 10-12 批准）：朝正面中点走，有效前进 ≥ MIN_WALK，或走到离正面 ≤ NEAR_FRONT
        const fx = g.frontX - p.x, fz = g.frontZ - p.z, toFront = Math.hypot(fx, fz);
        const walk = Math.min(TELEPORT.PROBE_WALK, toFront);
        const end = a.collisionManager.getValidPosition(p, new Vector3(p.x + fx / toFront * walk, p.y, p.z + fz / toFront * walk), 0.5, feet, PLAYER.STEP_UP);
        const progressed = ((end.x - p.x) * fx + (end.z - p.z) * fz) / toFront;
        const remain = Math.hypot(g.frontX - end.x, g.frontZ - end.z);
        const overlap = a.collisionManager.checkCollision(p);
        const walkOk = progressed >= TELEPORT.MIN_WALK || remain <= TELEPORT.NEAR_FRONT;
        return { name, x: +p.x.toFixed(2), z: +p.z.toFixed(2), feet: +feet.toFixed(2), zone, dist: point.distance, lateral: point.lateral, fallback: point.fallback, facing: +facing.toFixed(3), walked: +progressed.toFixed(2), remain: +remain.toFixed(2), loaded, overlap, pass: loaded && !overlap && Math.abs(feet - ground) < 0.01 && facing > 0.999 && walkOk };
      });
    });
    console.table(rows);
    console.log(JSON.stringify(rows));
    if (rows.some(r => !r.pass)) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
