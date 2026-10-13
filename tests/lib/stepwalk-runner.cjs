// stepwalk 浏览器执行器（stepwalk.cjs / stepwalk-auto.cjs 共用）。
// 用固定帧间隔逐帧调用真实 FirstPersonControls.update，复现低帧率/冲刺下的台阶问题；由本脚本代为推进 ZoneManager。
// 判定：每个途经点 0.8 m 内到达（连续 2 秒移动 < 0.3 m 视为卡住）且未"掉到台下"。
// 额外记录（自动路线用）：途经的分区序列、加载/卸载事件、"所在区未加载时的行走距离"（流式加载期间碰撞缺失）。
//
// S 档内景（InteriorLoader）：门禁按"全部 S 档内景已加载"的最坏情况测碰撞。
// 背景：本执行器会停掉主循环，之后不会再调 interiors.update，且 runRoutes 是同步 evaluate，GLB 异步加载永远完不成，
// 不预加载的话 S 档碰撞体/可行走面全不存在，门禁对内景是"盲"的。所以 openPage() 就绪后先预加载全部 S 档：
//   1) 先把 interiors.update 换成空函数（否则主循环残留的 update 会因距离 > 40 m 把正在加载的殿卸掉）
//   2) 逐个 await interiors.load(id)
//   3) 校验每座 state === 'loaded' 且 collisionManager 里有 tag = interior:<id> 的碰撞体，否则抛错（防止再次"变盲"）
// 接线丢失（window.__forbiddenCityApp.interiors 不存在）同样抛错。STEPWALK_NO_INTERIORS=1 可关闭预加载（仅调试用）。
const { chromium } = require('playwright');

async function preloadInteriors(page) {
  const res = await page.evaluate(async () => {
    const a = window.__forbiddenCityApp;
    const il = a?.interiors;
    if (!il) throw new Error('window.__forbiddenCityApp.interiors 不存在（InteriorLoader 接线丢失），门禁无法覆盖内景');
    il.update = () => {}; // 冻结距离触发，由本函数全权管理加载
    const ids = il.ids();
    if (!ids.length) throw new Error('InteriorLoader 未注册任何内景');
    for (const id of ids) await il.load(id);
    const cm = a.collisionManager;
    return ids.map(id => ({
      id,
      state: il.getState(id),
      col: cm.colliders.filter(c => c.tag === `interior:${id}`).length,
      walk: cm.walkables.filter(w => w.tag === `interior:${id}`).length,
    }));
  });
  const bad = res.filter(r => r.state !== 'loaded' || r.col < 1);
  console.log('[stepwalk] 预加载 S 档内景：' + res.map(r => `${r.id}=${r.state}(COL ${r.col}/WALK ${r.walk})`).join(' '));
  if (bad.length) throw new Error('S 档内景预加载失败：' + bad.map(r => `${r.id}(state=${r.state}, COL=${r.col})`).join(', '));
  return res;
}

async function openPage() {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 320, height: 200 } });
  await page.goto(process.env.PALACE_URL || 'http://127.0.0.1:5173', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__forbiddenCityApp?.controls && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 240000 });
  if (process.env.STEPWALK_NO_INTERIORS !== '1') {
    try { await preloadInteriors(page); } catch (e) { await browser.close(); throw e; }
  } else console.log('[stepwalk] STEPWALK_NO_INTERIORS=1：跳过 S 档内景预加载（仅调试）');
  return { browser, page };
}

/** routes: [[name, pts]]；返回每条 × fps × sprint 的结果 */
async function runRoutes(page, routes, fpsList, sprints) {
  return page.evaluate(({ ROUTES, fpsList, sprints }) => {
    const a = window.__forbiddenCityApp;
    cancelAnimationFrame(a.animationFrame);
    a.disposed = true; // 停掉主循环，由本脚本逐帧驱动
    const c = a.controls;
    const zm = a.zoneManager;
    Object.defineProperty(c.controls, 'isLocked', { get: () => true, configurable: true });
    // 台基投影（box 型可行走面中顶面 >= 1m 的），用于判断"在台基里面却站在 0 高度"
    // rescue:false 的是城台顶面（下方有门洞贯通），穿门洞时脚点在 0 属正常，不算"掉到台下"
    // 分区流式加载会增删 walkables：已加载分区集合变化时重算台基列表
    let terraces = [], terraceKey = null;
    const refreshTerraces = () => {
      const key = zm ? zm.getLoadedIds().join(',') : 'static';
      if (key === terraceKey) return;
      terraceKey = key;
      terraces = a.collisionManager.walkables.filter(w => w.type === 'box' && w.rescue !== false && w.box.max.y >= 1).map(w => w.box);
    };
    const under = (x, z, feet) => { refreshTerraces(); return terraces.some(b => x > b.min.x + 1 && x < b.max.x - 1 && z > b.min.z + 1 && z < b.max.z - 1 && feet < b.max.y - 1.2); };
    // 主循环已停，由本脚本代为推进分区加载（与 animate() 中的调用一致）
    const tickZones = () => zm?.update({ x: a.camera.position.x, z: a.camera.position.z });
    // 碰撞体 tag 集合（碰撞体数量变化时重算）
    let tagSet = new Set(), tagCount = -1;
    const colliderTags = () => {
      const cs = a.collisionManager.colliders;
      if (cs.length !== tagCount) { tagCount = cs.length; tagSet = new Set(cs.map(c => c.tag)); }
      return tagSet;
    };
    // 分区事件记录（包一层 loadZone/unloadZone，不改行为）
    const events = [];
    if (zm && !zm.__p1tWrapped) {
      const L = zm.loadZone.bind(zm), U = zm.unloadZone.bind(zm);
      zm.loadZone = id => { const had = zm.loaded.has(id); L(id); if (!had && zm.loaded.has(id)) events.push('+' + id); };
      zm.unloadZone = id => { const had = zm.loaded.has(id); U(id); if (had) events.push('-' + id); };
      zm.__p1tWrapped = true;
    }
    const out = [];
    for (const fps of fpsList) for (const sprint of sprints) for (const [name, pts] of ROUTES) {
      const [x0, z0] = pts[0];
      // 传送到起点后先把该处分区建好（真实游玩中靠 40m 预载，传送是瞬移所以要补齐）
      a.camera.position.set(x0, a.camera.position.y, z0);
      zm?.ensureLoadedAt(x0, z0);
      tickZones();
      events.length = 0;
      c.setPosition(x0, 300, z0); // 起点取该处最高可行走面（起点在台基上时站在台面上）
      c.velocity.set(0, 0, 0);
      c.moveForward = true;
      c.canSprint = sprint;
      const dt = 1 / fps;
      let maxFeet = 0, bad = null, arrived = true, stuckAt = null, unloadedWalk = 0;
      const zonesSeen = [];
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
          const bx = a.camera.position.x, bz = a.camera.position.z;
          c.update();
          const p = a.camera.position;
          if (zm) {
            const zid = zm.findZone(p.x, p.z);
            if (zid && zonesSeen[zonesSeen.length - 1] !== zid) zonesSeen.push(zid);
            // 直接查碰撞体：所在区没有任何带该区 tag 的碰撞体 = 碰撞缺失
            if (zid && !colliderTags().has(zid)) unloadedWalk += Math.hypot(p.x - bx, p.z - bz);
          }
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
      out.push({ fps, sprint, name, arrived, stuckAt, end: [+p.x.toFixed(1), +p.z.toFixed(1), +c.feetY.toFixed(2)], maxFeet: +maxFeet.toFixed(2), fellUnder: bad, profile,
        zonesSeen, zoneEvents: [...events], unloadedWalk: +unloadedWalk.toFixed(2) });
    }
    return out;
  }, { ROUTES: routes, fpsList, sprints });
}

module.exports = { openPage, runRoutes };
