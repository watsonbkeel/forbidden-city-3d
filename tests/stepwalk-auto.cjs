// 自动生成路线的确定性步行（T-2）。路线由 tests/lib/auto-routes.mjs 从 data/zones/*.json 生成：
//   每区每座有名的 enter:true 殿：区门外 6 m → 门内 → 殿前台阶外 2 m → 殿内 1 m → 原路返回门外
//   跨区：中轴 → 东六宫 → 宁寿宫 → 回中轴；中轴 → 景运门 → 宁寿宫 → 回中轴（验证流式加载/卸载时碰撞不丢）
// 用法：node tests/stepwalk-auto.cjs [fps=60,10] [sprint=0,1] [all|路线名子串]
//   --check   不开浏览器：在 node 碰撞世界（全部区同时在场）里逐段直线预检，区分"生成算法问题"与"场景缺陷"
//   --list    只打印路线
//   DUMP=1    打印展开后的坐标
// 判定（浏览器）：同 stepwalk.cjs（到达每个途经点、不掉到台下）；跨区路线另要求"所在区未加载时的行走距离" ≤ 1 m。
// knownIssue：KNOWN_ISSUES 中列出的路线照跑但不计失败（场景缺陷已写入 REQUESTS.md「## P1-T」），汇总里单列。
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// 已知问题路线（P2-A1 已全部修复）
const UNLOADED_WALK_MAX = 1; // m

(async () => {
  const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const flags = new Set(process.argv.slice(2).filter(a => a.startsWith('--')));
  const { buildAutoRoutes } = await import(pathToFileURL(path.join(__dirname, 'lib/auto-routes.mjs')).href);
  const L = await import(pathToFileURL(path.join(__dirname, 'lib/world.mjs')).href);
  const zoneFiles = L.loadZoneJsons(process.env.ZONES_DIR ? path.resolve(process.env.ZONES_DIR) : undefined);
  // 路线规划用碰撞世界（门外净空、绕殿），与浏览器里是同一套 CourtKit 碰撞
  const log = console.log; console.log = () => {};
  const W = await L.buildWorld({ zones: zoneFiles });
  console.log = log;
  const all = buildAutoRoutes(W, zoneFiles.map(z => z.json), { knownIssues: {} });
  const which = args[2] || 'all';
  const routes = which === 'all' ? all : all.filter(r => r.name.includes(which));
  if (flags.has('--list') || process.env.DUMP) {
    for (const r of routes) console.log(`${r.name}  ${r.via ?? r.zone}${r.plan?.length ? '；' + r.plan.join('；') : ''}${process.env.DUMP ? '\n   ' + JSON.stringify(r.pts) : ''}`);
    console.log(`共 ${routes.length} 条`);
    process.exit(0);
  }

  if (flags.has('--check')) {
    // node 预检：全部区同时加载，逐段用真实 getValidPosition 直线走（不含台阶贴地以外的控制器细节）
    let fail = 0;
    for (const r of routes) {
      let feet, bad = null;
      for (let k = 1; k < r.pts.length && !bad; k++) {
        const w = L.walkStraight(W, r.pts[k - 1], r.pts[k], { feet0: feet });
        feet = w.feet;
        if (w.reached < w.total - 0.8) bad = { seg: k, from: r.pts[k - 1], to: r.pts[k], ...w, blockers: [...new Set(L.collidersIn(W, w.end[0] - 0.8, w.end[1] - 0.8, w.end[0] + 0.8, w.end[1] + 0.8).map(c => L.describeOwner(W.ownerOf(c))))] };
      }
      if (bad) fail++;
      console.log(`${bad ? (r.knownIssue ? 'KNOWN' : 'FAIL') : 'PASS'} ${r.name}${bad ? `  段${bad.seg} ${JSON.stringify(bad.from)}→${JSON.stringify(bad.to)} 停在 ${JSON.stringify(bad.end)}（${bad.reached}/${bad.total}）挡：${bad.blockers.join('；') || '?'}` : ''}`);
    }
    console.log(`预检 ${routes.length} 条，受阻 ${fail} 条`);
    process.exit(fail ? 1 : 0);
  }

  const { openPage, runRoutes } = require('./lib/stepwalk-runner.cjs');
  const fpsList = (args[0] || '60,10').split(',').map(Number);
  const sprints = (args[1] || '0,1').split(',').map(v => v === '1');
  const { browser, page } = await openPage();
  const result = await runRoutes(page, routes.map(r => [r.name, r.pts]), fpsList, sprints);
  await browser.close();
  let fail = 0, known = 0;
  const cross = new Set(routes.filter(r => r.name.startsWith('[跨区]')).map(r => r.name));
  for (const r of result) {
    const leak = cross.has(r.name) && r.unloadedWalk > UNLOADED_WALK_MAX;
    const ok = r.arrived && !r.fellUnder && !leak;
    const ki = KNOWN_ISSUES[r.name];
    if (!ok && ki) known++; else if (!ok) fail++;
    const tag = ok ? 'PASS' : ki ? 'KNOWN' : 'FAIL';
    console.log(`${tag} fps=${r.fps} ${r.sprint ? '快走' : '慢走'} ${r.name} 终点=${JSON.stringify(r.end)} 最高脚点=${r.maxFeet}`
      + (r.fellUnder ? ' 掉到台下@' + JSON.stringify(r.fellUnder) : '') + (r.arrived ? '' : ' 未到达途经点' + JSON.stringify(r.stuckAt))
      + (cross.has(r.name) ? ` 途经区=${r.zonesSeen.join('→')} 事件=${r.zoneEvents.join(' ') || '无'} 未加载区内行走=${r.unloadedWalk}m${leak ? '（> ' + UNLOADED_WALK_MAX + ' m，碰撞缺失）' : ''}` : '')
      + (ki && !ok ? `  [knownIssue: ${ki}]` : ''));
    if (process.env.PROFILE) console.log('   高度剖面', r.profile.join(' '));
  }
  console.log(`共 ${result.length} 条，失败 ${fail} 条，knownIssue 跳过 ${known} 条`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
