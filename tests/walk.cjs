// 步行实测：沿路线逐步移动（使用真实碰撞 getValidPosition + 地面高度 getGroundHeight），
// 报告每条路线是否走通、最高脚点、卡住位置。
// 用法：node tests/walk.cjs
const { chromium } = require('playwright');

// 连续路线：每段从上一段终点继续（脚点高度延续），段名只用于报告。
// 殿内宝座区挡住中轴，需从宝座侧面绕行（与真实一致）。
// P0c-2 起为真实米制（原点太和殿中心，+Z 北，x 负=东）：
//   午门 −419.6、金水河 −310.8（东侧桥 x=−15）、太和门 −214.2；太和殿 z0 d37.2（未变）；
//   中和殿 65；保和殿 123.2 d25（前檐 110.7 / 后檐 135.7）；乾清门 215.3；乾清宫 316.8 d25（304.3 / 329.3）；
//   交泰殿 354.1 d19（344.6 / 363.6）；坤宁宫 386.1 d20（376.1 / 396.1）；御花园园墙 422.7~518.3；神武门 531
// 注：本脚本不推进分区流式加载，侧院/御花园分区内的墙体可能未加载；回归以 stepwalk.cjs 为准。
const ROUTES = {
  '午门→东侧金水桥→太和门': [[0, -470], [0, -330.8], [-15, -330.8], [-15, -290.8], [0, -290.8], [0, -194.2]],
  '上三台→太和殿前门': [[0, -194.2], [0, -5]],
  // 太和殿柱网：x 每 5.73m 一根，z 每 7.4m 一排（-18.5,-11.1,-3.7,3.7,11.1,18.5）
  '太和殿内绕行': [[-17, -5], [-17, 1], [17, 1], [17, -5], [11.5, -5], [11.5, 1]],
  '绕宝座→太和殿后门': [[11.5, 16], [0, 16], [0, 30]],
  '中和殿穿行': [[0, 55], [-6, 59], [-6, 71], [0, 75]],
  // 保和殿：9 间 bayW≈5.5，宝座半宽 4.42，内柱 ±8.28
  '保和殿穿行→北下台': [[0, 116.2], [6.1, 116.2], [6.1, 133.7], [0, 133.7], [0, 205.3]],
  // 乾清宫 9 间 bayW≈5.1，宝座半宽 4.09，内柱内皮 ±7.26
  '乾清门→乾清宫': [[0, 310.8], [5.7, 310.8], [5.7, 327.8], [0, 327.8], [0, 335]],
  // 交泰殿小（3 间），宝座占满后部：从前门进去看，再退出绕殿外到坤宁宫
  // 殿外绕行线 x=−12.2：交泰殿台明外沿 ±11（半宽 9.5 + 台明 1.5）与后三宫台边栏杆 x=−13.35 之间
  '交泰殿进出→绕行→坤宁宫→下台': [[0, 350.6], [0, 338], [-12.2, 338], [-12.2, 369], [0, 369], [0, 380], [4.7, 380], [4.7, 393], [0, 393], [0, 430]],
  '御花园绕钦安殿→神武门': [[17, 430], [17, 509.3], [0, 509.3], [0, 550]],
};

(async () => {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 640, height: 400 } });
  await page.goto(process.env.PALACE_URL || 'http://127.0.0.1:5173', { waitUntil: 'load' });
  await page.waitForFunction(() => window.__forbiddenCityApp?.collisionManager && document.querySelector('#loading-screen').style.display === 'none', null, { timeout: 180000 });
  const res = await page.evaluate(async routes => {
    const a = window.__forbiddenCityApp;
    const THREE = await import('/node_modules/three/build/three.module.js');
    const cm = a.collisionManager;
    const H = 1.7;
    const out = {};
    const first = Object.values(routes)[0][0];
    let feet = 0;
    let pos = new THREE.Vector3(first[0], H, first[1]);
    let dead = false;
    for (const [name, pts] of Object.entries(routes)) {
      if (dead) { out[name] = { ok: false, skipped: true, maxFeet: 0, end: [] }; continue; }
      let maxFeet = feet;
      let stuck = null;
      const trace = [];
      for (let i = 0; i < pts.length && !stuck; i++) {
        const target = new THREE.Vector3(pts[i][0], 0, pts[i][1]);
        let guard = 0;
        while (guard++ < 4000) {
          const d = new THREE.Vector3(target.x - pos.x, 0, target.z - pos.z);
          const dist = d.length();
          if (dist < 0.15) break;
          d.normalize().multiplyScalar(Math.min(0.12, dist));
          const want = pos.clone().add(d);
          const next = cm.getValidPosition(pos, want, 0.4);
          const g = cm.getGroundHeight(next.x, next.z, feet, 0.6);
          feet = g >= feet - 0.02 ? g : Math.max(g, feet - 0.12);
          next.y = feet + H;
          if (next.distanceTo(pos) < 0.01) {
            stuck = [+pos.x.toFixed(1), +pos.z.toFixed(1), +feet.toFixed(2)];
            const p = want.clone(); p.y = feet + H;
            const b = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(p.x, feet + 0.35 + (H - 0.4) / 2, p.z), new THREE.Vector3(0.8, H - 0.4, 0.8));
            stuck.push(cm.colliders.filter(c => c.box.intersectsBox(b)).slice(0, 3)
              .map(c => { const x = c.box; return [x.min.x, x.min.y, x.min.z, x.max.x, x.max.y, x.max.z].map(n => +n.toFixed(1)); }));
            break;
          }
          pos = next;
          maxFeet = Math.max(maxFeet, feet);
          if (guard % 40 === 0) trace.push([+pos.z.toFixed(0), +feet.toFixed(1)]);
        }
      }
      if (stuck) dead = true;
      out[name] = { ok: !stuck, stuck, maxFeet: +maxFeet.toFixed(2), end: [+pos.x.toFixed(1), +pos.z.toFixed(1), +feet.toFixed(2)], trace: trace.slice(0, 40) };
    }
    return out;
  }, ROUTES);
  for (const [k, v] of Object.entries(res)) {
    console.log(`${v.ok ? 'PASS' : 'FAIL'} ${k}  最高脚点=${v.maxFeet}  终点=${v.end}${v.stuck ? '  卡在=' + JSON.stringify(v.stuck) : ''}`);
    if (process.env.TRACE) console.log('   ', JSON.stringify(v.trace));
  }
  await browser.close();
})();
