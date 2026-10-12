const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(process.env.PALACE_URL);
    await page.waitForFunction(() => window.__forbiddenCityApp?.teleport && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 120000 });
    const rows = await page.evaluate(async () => {
      const a = window.__forbiddenCityApp;
      cancelAnimationFrame(a.animationFrame);
      const { TELEPORT, PLAYER } = await import('/src/config/constants.js');
      const { Vector3 } = await import('three');
      const names = [...new Set([...TELEPORT.POINTS.map(p => p.target), ...a.minimap.labels.map(p => p.name)])];
      return names.map(name => {
        const point = a.teleport.go(name);
        const landing = a.teleport.landingFor(name);
        if (!point) return { name, ...landing, pass: false, reason: '落点碰撞' };
        const p = a.controls.getPosition();
        const feet = a.controls.getFeetY();
        const ground = a.collisionManager.getGroundHeight(p.x, p.z, Infinity);
        const facing = a.camera.getWorldDirection(new Vector3()).dot(new Vector3(landing.lookAtX - p.x, 0, landing.lookAtZ - p.z).normalize());
        const zone = a.zoneManager.findZone(p.x, p.z);
        const loaded = !zone || a.zoneManager.getLoadedIds().includes(zone);
        const dir = new Vector3(landing.lookAtX - p.x, 0, landing.lookAtZ - p.z).normalize();
        const end = a.collisionManager.getValidPosition(p, new Vector3(p.x + dir.x * 5, p.y, p.z + dir.z * 5), 0.5, feet, PLAYER.STEP_UP);
        const distance = Math.hypot(end.x - p.x, end.z - p.z);
        const overlap = a.collisionManager.checkCollision(p);
        return { name, x: +p.x.toFixed(2), z: +p.z.toFixed(2), feet: +feet.toFixed(2), zone, facing: +facing.toFixed(3), distance: +distance.toFixed(2), loaded, overlap, pass: loaded && !overlap && Math.abs(feet - ground) < 0.01 && facing > 0.999 && distance > 4.8 };
      });
    });
    console.table(rows);
    console.log(JSON.stringify(rows));
    if (rows.some(r => !r.pass)) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
