const { browserExecutablePath } = require('../lib/browser-path.cjs');
// 确定性步行：用固定帧间隔逐帧调用真实 FirstPersonControls.update，复现低帧率/冲刺下的台阶问题。
// 用法：node tests/stepwalk.cjs [fps=60,20,10] [sprint=0,1]
//   内置路线覆盖中轴、偏中轴、侧门；报告每条路线的终点、最高脚点、是否"掉到台下"（站在台基投影内却脚点为 0）。
const { chromium } = require('playwright');

// 每条路线是一串途经点 [x, z]；殿内宝座挡在中轴，按真实参观路线从宝座侧面绕过
const AXIS_ROUTES = [
  ["午门外→午门门洞→金水桥北", [[0, -470], [0, -330]]],
  ["金水桥→太和门→广场", [[0, -330], [0, -180]]],
  ["太和门广场→三台南阶→太和殿内", [[0, -180], [0, 5]]],
  ["东侧金水桥(x=-15)", [[-15, -330], [-15, -290]]],
  ["保和殿后→北下台→乾清门", [[0, 140], [0, 200]]],
  ["乾清门→乾清宫前", [[0, 200], [0, 300]]],
  ["坤宁门→御花园→钦安殿前", [[0, 405], [0, 480]]],
  ["顺贞门→神武门→出宫", [[0, 512], [0, 550]]],
];
const SIDE_ROUTES = [
  ["协和门→东出", [[-30, -300.3], [-125, -300.3]]],
  ["东华门出宫", [[-340, -257], [-390, -257]]],
  ["西华门出宫", [[335, -260.6], [390, -260.6]]],
  ["中左门过", [[-60, -30], [-77, -30], [-77, 5]]],
];
(async () => {
  const fpsList = (process.argv[2] || '60,20,10').split(',').map(Number);
  const sprints = (process.argv[3] || '0,1').split(',').map(v => v === '1');
  const which = process.argv[4] || 'axis';
  const ROUTES_RUN = which === 'side' ? SIDE_ROUTES : which === 'all' ? [...AXIS_ROUTES, ...SIDE_ROUTES] : AXIS_ROUTES;
  const browser = await chromium.launch({ executablePath: browserExecutablePath(), headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
  await page.goto(process.env.PALACE_URL || 'http://127.0.0.1:5173', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__forbiddenCityApp?.controls && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 240000 });
  const result = await page.evaluate(({ ROUTES, fpsList, sprints }) => {
    const a = window.__forbiddenCityApp;
    cancelAnimationFrame(a.animationFrame);
    a.disposed = true; // 停掉主循环，由本脚本逐帧驱动
    const c = a.controls;
    const cm = a.collisionManager;
    Object.defineProperty(c.controls, 'isLocked', { get: () => true, configurable: true });
    // 台基投影（box 型可行走面中顶面 >= 1m 的），用于判断"在台基里面却站在 0 高度"
    // rescue:false 的是城台顶面（下方有门洞贯通），穿门洞时脚点在 0 属正常，不算"掉到台下"
    // 分区流式加载会增删 walkables：已加载分区集合变化时重算台基列表
    let terraces = [], terraceKey = null;
    const refreshTerraces = () => {
      const key = a.zoneManager ? a.zoneManager.getLoadedIds().join(',') : 'static';
      if (key === terraceKey) return;
      terraceKey = key;
      terraces = cm.walkables.filter(w => w.type === 'box' && w.rescue !== false && w.box.max.y >= 1).map(w => w.box);
    };
    const under = (x, z, feet) => { refreshTerraces(); return terraces.some(b => x > b.min.x + 1 && x < b.max.x - 1 && z > b.min.z + 1 && z < b.max.z - 1 && feet < b.max.y - 1.2); };
    // 主循环已停，由本脚本代为推进分区加载（与 animate() 中的调用一致）
    const tickZones = () => a.zoneManager?.update({ x: a.camera.position.x, z: a.camera.position.z });
    const out = [];
    for (const fps of fpsList) for (const sprint of sprints) for (const [name, pts] of ROUTES) {
      const [x0, z0] = pts[0];
      // 传送到起点后先把该处分区建好（真实游玩中靠 40m 预载，传送是瞬移所以要补齐）
      a.camera.position.set(x0, a.camera.position.y, z0);
      a.zoneManager?.ensureLoadedAt(x0, z0);
      tickZones();
      c.setPosition(x0, 300, z0); // 起点取该处最高可行走面（起点在台基上时站在台面上）
      c.velocity.set(0, 0, 0);
      c.moveForward = true;
      c.canSprint = sprint;
      const dt = 1 / fps;
      let maxFeet = 0, minFeet = Infinity, bad = null, arrived = true, stuckAt = null;
      const profile = [];
      for (let k = 1; k < pts.length && arrived; k++) {
        const [x1, z1] = pts[k];
        const p0 = a.camera.position;
        const limit = Math.ceil(Math.hypot(x1 - p0.x, z1 - p0.z) / 2 * fps) + fps * 4;
        let stuck = 0, last = [p0.x, p0.z], reached = false;
        for (let f = 0; f < limit; f++) {
          c.prevTime = performance.now() - dt * 1000;
          a.camera.lookAt(x1, a.camera.position.y, z1);
          tickZones();
          c.update();
          const p = a.camera.position;
          maxFeet = Math.max(maxFeet, c.feetY);
          if (f % Math.max(1, Math.round(fps / 2)) === 0) profile.push(+c.feetY.toFixed(1));
          if (!bad && under(p.x, p.z, c.feetY) && c.verticalVelocity === 0) bad = [+p.x.toFixed(1), +p.z.toFixed(1), +c.feetY.toFixed(2)];
          if (Math.hypot(p.x - x1, p.z - z1) < 0.8) { reached = true; break; }
          if (f % fps === 0 && f > 0) {
            if (Math.hypot(p.x - last[0], p.z - last[1]) < 0.3) stuck++; else stuck = 0;
            last = [p.x, p.z];
            if (stuck >= 2) break;
          }
        }
        if (!reached) { arrived = false; stuckAt = pts[k]; }
      }
      c.moveForward = false;
      const p = a.camera.position;
      out.push({ fps, sprint, name, arrived, stuckAt, end: [+p.x.toFixed(1), +p.z.toFixed(1), +c.feetY.toFixed(2)], maxFeet: +maxFeet.toFixed(2), fellUnder: bad, profile });
    }
    return out;
  }, { ROUTES: ROUTES_RUN, fpsList, sprints });
  let fail = 0;
  for (const r of result) {
    const ok = r.arrived && !r.fellUnder;
    if (!ok) fail++;
    console.log(`${ok ? 'PASS' : 'FAIL'} fps=${r.fps} ${r.sprint ? '快走' : '慢走'} ${r.name} 终点=${JSON.stringify(r.end)} 最高脚点=${r.maxFeet}${r.fellUnder ? ' 掉到台下@' + JSON.stringify(r.fellUnder) : ''}${r.arrived ? '' : ' 未到达途经点' + JSON.stringify(r.stuckAt)}`);
    if (process.env.PROFILE) console.log('   高度剖面', r.profile.join(' '));
  }
  console.log(`共 ${result.length} 条，失败 ${fail} 条`);
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
