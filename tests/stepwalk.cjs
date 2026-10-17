// 确定性步行：用固定帧间隔逐帧调用真实 FirstPersonControls.update，复现低帧率/冲刺下的台阶问题。
// 用法：node tests/stepwalk.cjs [fps=60,20,10] [sprint=0,1] [axis|side|all|路线名子串]
//   内置路线覆盖中轴、偏中轴、侧门；报告每条路线的终点、最高脚点、是否"掉到台下"（站在台基投影内却脚点为 0）。
//   P0c-2 起为真实米制（原点太和殿中心，+Z 北，x 负=东）；途经点从 LAYOUT / data/anchors.json / 殿座几何推导。
const { openPage, runRoutes } = require('./lib/stepwalk-runner.cjs');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..');
const A = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/anchors.json'), 'utf8'));
const r1 = v => Math.round(v * 10) / 10;

// 已知问题路线（已在 P2-A1 修复）
// —— 殿座几何（与场景代码一致，改场景时同步）——
// 中轴殿进深（PalaceBuilder 用 anchors 的 d；宝座碰撞 = 殿心 z+[-0.3, +8]（d≈25 的三间进深殿），太和殿见下）
const HALL_D = { 太和殿: A['太和殿'].d, 中和殿: A['中和殿'].d, 保和殿: A['保和殿'].d, 乾清宫: A['乾清宫'].d, 交泰殿: A['交泰殿'].d, 坤宁宫: A['坤宁宫'].d };
const TAIHE_DETOUR_X = 6.2;   // 太和殿宝座半宽 4.58，内柱 ±8.59
const ZHONGHE_DETOUR_X = 5;   // R3：内围护半宽9.5；从中门进殿后绕宝座，不能斜穿槛窗
const BAOHE_DETOUR_X = 6.1;   // 保和殿宝座半宽 4.42，内柱 ±8.28
const QIANQING_DETOUR_X = 5.7; // 乾清宫宝座半宽 4.09（真实面阔 46 → 间宽 5.11），内柱内皮 ±7.26，取中线
const JIAOTAI_DETOUR_X = 6.5; // 交泰殿宝座半宽 2.38，殿身半宽 9.5
const IN_FRONT = 7;           // 殿内宝座前（距殿心南 7m；三间进深殿宝座前沿在殿心 −0.3）
const OFF_AXIS_GAP = 2.5;     // 偏中轴路线离殿身前后檐的余量
// 御花园（GardenBuilder：园墙 z 422.7~518.3，南横路 z0+7，亭一排 z≈472，浮碧/澄瑞池 z≈499、南北石桥宽 2.4）
const GARDEN_PATH_X = 17;      // 东西甬路 x=±17
const GARDEN_S_ROAD = 7;       // 南横路距南园墙
// 池中亭（浮碧/澄瑞）位于万春/千秋亭正北的池中，无法从中线直入，须沿园墙内侧甬路 x=±63.5
// 绕过前一排亭、再经南北石桥进亭：Z0=绕行横移线（万春/千秋以北、池以南），Z1=桥头外（池南沿 493.6 以南）
const POND_DETOUR_X = 63.5;
const POND_DETOUR_Z0 = 447;
const POND_DETOUR_Z1 = 490;
// CourtKit 殿（kit.js）：backDoor 殿宝座碰撞 rel z = d/2−3.4 ±(1.2,1.3)，半宽 min(间宽×1.4, 5)/2
const KIT_DETOUR_X = 3.5;
const GATE_CLEAR = 20;        // 门前/门后取点余量

async function buildRoutes() {
  const { LAYOUT: L } = await import(pathToFileURL(path.join(ROOT, 'src/config/constants.js')).href);
  const { sideGateGeometry } = await import(pathToFileURL(path.join(ROOT, 'src/scene/palace/special/SideGateProfiles.js')).href);
  const axisZone = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/zones/axis-courts.json'), 'utf8'));
  const { KUNNING_PROFILE, kunningNavigationPoint } = await import(pathToFileURL(path.join(ROOT, 'src/scene/palace/special/KunningProfile.js')).href);
  const { PALACE_LAYOUT } = await import(pathToFileURL(path.join(ROOT, 'src/scene/Layout.js')).href);
  const kunning = PALACE_LAYOUT.find(item => item.name === '坤宁宫');
  const kunningRoute = key => KUNNING_PROFILE.navigation.routes[key].map(id => {
    const [x, , z] = kunningNavigationPoint(id, kunning);
    return [x, z];
  });
  const kunningEntry = kunningRoute('entry'), kunningExit = kunningRoute('eastBypass');
  const exactKunningPoints = new Set([...kunningEntry, ...kunningExit]);
  const exactGatePoints = new Set();
  const gateTransit = name => {
    const g = sideGateGeometry(axisZone.items.find(item => item.kind === 'gate' && item.name === name));
    const front = g.ramps.find(r => r.side === 'front'), rear = g.ramps.find(r => r.side === 'rear');
    // 旧的门心外 20 m 点仍在高台慢道上；走完实际坡脚后再转向原目的地。
    const points = [rear.zToe + 2, rear.zToe, rear.zTop, front.zTop, front.zToe, front.zToe - 2].map(z => g.toWorld(0, z));
    points.forEach(p => exactGatePoints.add(p));
    return points;
  };
  const front = n => (n === '太和殿' ? L.TAIHE_Z : n === '中和殿' ? L.ZHONGHE_Z : n === '保和殿' ? L.BAOHE_Z : n === '乾清宫' ? L.QIANQING_Z : n === '交泰殿' ? L.JIAOTAI_Z : L.KUNNING_Z) - HALL_D[n] / 2;
  const back = n => front(n) + HALL_D[n];
  const gz0 = L.IMPERIAL_GARDEN_Z - 95.6 / 2;   // 御花园南园墙 422.7（GardenBuilder 默认进深 95.6）
  const gz1 = L.IMPERIAL_GARDEN_Z + 95.6 / 2;   // 北园墙 518.3
  const wanchun = A['万春亭'];
  const qianqiu = A['千秋亭'];
  const fubi = A['浮碧亭'];
  const chengrui = A['澄瑞亭'];
  const { QINAN_PROFILE } = await import(pathToFileURL(path.join(ROOT, 'src/scene/palace/special/QinanProfile.js')).href);
  const qinanView = QINAN_PROFILE.navigation.position; // Explicit ground-only exterior viewpoint, not an entrance
  const zh = L.ZHONGHE_Z, bh = L.BAOHE_Z, qq = L.QIANQING_Z, jt = L.JIAOTAI_Z;
  // 池中亭石桥参数：pd=10(池深), 石桥外侧入口 zOut = pavilionZ ± (pd/2 + 2.2) = ±7.2
  const POND_BRIDGE_OFFSET = 7.2;

  const AXIS_ROUTES = [
    ['午门→太和门', [[0, L.START_POSITION.z], [0, L.TAIHE_GATE_Z + GATE_CLEAR]]],
    ['太和门→太和殿内', [[0, L.TAIHE_GATE_Z + GATE_CLEAR], [0, 5]]],
    // 过殿门时走中间一间（x≈0），进殿后从宝座侧面绕过；各殿取点相对殿心
    ['太和殿→中和殿→保和殿', [[0, 3], [0, 0], [TAIHE_DETOUR_X, 0], [TAIHE_DETOUR_X, 16], [0, 16.5],
      [0, zh - 7], [ZHONGHE_DETOUR_X, zh - 7], [ZHONGHE_DETOUR_X, zh + 7.2], [0, zh + 7.2], [0, zh + 11],
      [0, bh - IN_FRONT], [BAOHE_DETOUR_X, bh - IN_FRONT], [BAOHE_DETOUR_X, back('保和殿') - 2], [0, back('保和殿') - 2]]],
    ['保和殿→北下台→乾清门', [[0, back('保和殿') - 2], [0, L.QIANQING_GATE_Z - 10]]],
    ['乾清门→乾清宫', [[0, L.QIANQING_GATE_Z - 10], [0, qq - 6]]],
    ['乾清宫→交泰殿→坤宁宫', [[0, qq - 6], [QIANQING_DETOUR_X, qq - 6], [QIANQING_DETOUR_X, back('乾清宫') - 1.5], [0, back('乾清宫') - 1.5],
      [0, jt - 4.7], [JIAOTAI_DETOUR_X, jt - 4.7], [JIAOTAI_DETOUR_X, jt + 7.2], [0, jt + 7.2], ...kunningEntry]],
    // 真正偏东南门退出，经东端穿廊到北廊；北中墙没有门。其后保留原御花园路线。
    ['坤宁宫→御花园→神武门', [...kunningExit, [0, gz0 + GARDEN_S_ROAD], [GARDEN_PATH_X, gz0 + GARDEN_S_ROAD + 3],
      [GARDEN_PATH_X, gz1 - 9], [0, gz1 - 9], [0, L.BOUNDARY.maxZ - 10]]],
    ['乾清宫偏中轴(x=2.3)', [[2.3, L.QIANQING_GATE_Z + 6], [2.3, r1(front('乾清宫') - 1.2)]]],
    // R3: x=2.5 落在新中阶栏墙上；偏轴进院后在阶前转入中间阶口，不穿栏。
    ['太和殿后→中和殿前(x=2.5转中阶)', [[OFF_AXIS_GAP, r1(back('太和殿') + OFF_AXIS_GAP)], [OFF_AXIS_GAP, zh - 17], [0, zh - 17], [0, front('中和殿') - OFF_AXIS_GAP]]],
  ];

  const xh = A['协和门'], xi = A['熙和门'], wh = A['文华门'], whd = A['文华殿'], wy = A['武英门'], wyd = A['武英殿'];
  const dh = A['东华门'], xhm = A['西华门'], zy = A['左翼门'], nz = A['内左门'], ny = A['内右门'];
  const jrm = A['景仁门'], jrg = A['景仁宫'], zyi = A['遵义门'], yxd = A['养心殿'], yh = A['月华门'], rj = A['日精门'];
  const jy = A['景运门'], jt2 = A['箭亭'];
  const KIT_D = 16;                 // 文华殿/武英殿 进深（zones：d 16，backDoor）
  const kitIn = KIT_D / 2 - 3.4;    // 宝座中心 rel z
  const STREET_E = -63.3;           // 东一长街中线（x −72.4 ~ −54.25）
  const JIHUA_Z = 410;              // 基化门（东一长街内墙门，zones/garden 墙洞 at 410；anchors 未收录）
  const xhTransit = gateTransit('协和门'), xiTransit = gateTransit('熙和门');
  const SIDE_ROUTES = [
    ['协和门→文华门→文华殿内', [[-30, xh.z], ...xhTransit, [wh.x, wh.z - 8], [whd.x, whd.z - kitIn + 2],
      [whd.x - KIT_DETOUR_X, whd.z - kitIn + 2], [whd.x - KIT_DETOUR_X, r1(whd.z + KIT_D / 2 - 1.2)]]],
    ['协和门→东华门→出宫', [[-30, xh.z], ...xhTransit, [dh.x + 25, dh.z], [L.BOUNDARY.minX + 10, dh.z]]],
    ['熙和门→武英门→武英殿内', [[30, xi.z], ...xiTransit, [wy.x, wy.z - 8], [wy.x, wy.z + 8], [wyd.x, wyd.z - kitIn + 2]]],
    // 南薰殿院（z ≤ −286.6）与武英殿院（z ≥ −249.8）之间斜穿
    ['熙和门→西华门→出宫', [[30, xi.z], ...xiTransit, [xhm.x - 25, xhm.z], [L.BOUNDARY.maxX - 10, xhm.z]]],
    // 起点在三台（半宽 65）以东的广场地面
    ['左翼门→文渊阁一带', [[-75, zy.z], [zy.x - GATE_CLEAR - 3, zy.z]]],
    ['内左门→东一长街→景仁宫内', [[nz.x, nz.z - GATE_CLEAR], [nz.x, jrm.z - 7], [jrm.x, jrm.z - 7], [jrm.x, jrm.z + 7], [jrg.x, jrg.z - 2]]],
    ['内右门→养心殿内', [[ny.x, ny.z - GATE_CLEAR], [ny.x, zyi.z], [zyi.x + 15, zyi.z], [yxd.x, yxd.z - 17.5], [yxd.x, yxd.z - 2]]],
    ['西一长街→月华门→乾清宫院', [[ny.x, ny.z - GATE_CLEAR], [ny.x, yh.z], [yh.x - 13.3, yh.z]]],
    ['乾清宫院→日精门→东一长街→基化门', [[rj.x + 12.9, rj.z], [STREET_E, rj.z], [STREET_E, JIHUA_Z], [rj.x + 12.9, JIHUA_Z]]],
    // Negative legacy expectation: 御花园→钦安殿内→穿殿北出 is physically blocked.
    // Its exact historical points remain in v5-fixed-routes.json and v7-qinan-route-baseline.json.
    // Ground-only exterior return via the south cross-path and x=18 side chain.
    // The earlier (0,477) detour crossed known omitted axial stonework and is withdrawn.
    ['御花园→钦安殿地面外观→返回', [[0, gz0 + 11], [0, gz0 + GARDEN_S_ROAD], [qinanView.x, gz0 + GARDEN_S_ROAD],
      [qinanView.x, qinanView.z], [qinanView.x, gz0 + GARDEN_S_ROAD], [0, gz0 + GARDEN_S_ROAD], [0, gz0 + 11]]],
    // 万春/千秋亭：沿亭中线自南横路北上，走南面台阶进亭；千秋亭西南侧有古柏，先偏东 2 m 绕过
    ['御花园→万春亭', [[0, gz0 + 11], [0, gz0 + GARDEN_S_ROAD], [wanchun.x, gz0 + GARDEN_S_ROAD], [wanchun.x, wanchun.z]]],
    ['御花园→千秋亭(西)', [[0, gz0 + 11], [0, gz0 + GARDEN_S_ROAD], [qianqiu.x + 2, gz0 + GARDEN_S_ROAD], [qianqiu.x + 2, qianqiu.z - 9.5], [qianqiu.x, qianqiu.z - 9.5], [qianqiu.x, qianqiu.z]]],
    // 浮碧/澄瑞亭（池中亭）：先北上至 Z0，沿园墙内侧绕行至 Z1，再经南北石桥进亭
    ['御花园→浮碧亭(桥)', [[0, gz0 + 11], [0, gz0 + GARDEN_S_ROAD], [fubi.x, gz0 + GARDEN_S_ROAD], [fubi.x, POND_DETOUR_Z0],
      [-POND_DETOUR_X, POND_DETOUR_Z0], [-POND_DETOUR_X, POND_DETOUR_Z1], [fubi.x, POND_DETOUR_Z1], [fubi.x, fubi.z]]],
    ['御花园→澄瑞亭(桥)', [[0, gz0 + 11], [0, gz0 + GARDEN_S_ROAD], [chengrui.x, gz0 + GARDEN_S_ROAD], [chengrui.x, POND_DETOUR_Z0],
      [POND_DETOUR_X, POND_DETOUR_Z0], [POND_DETOUR_X, POND_DETOUR_Z1], [chengrui.x, POND_DETOUR_Z1], [chengrui.x, chengrui.z]]],
    // 乾清门广场 → 景运门 → 门外南行 → 箭亭南 → 进箭亭（敞厅）
    ['景运门→箭亭→东路', [[-80, jy.z], [jy.x - 18.5, jy.z], [jy.x - 18.5, r1(jt2.z - 18)], [jt2.x, r1(jt2.z - 18)], [jt2.x, jt2.z]]],
  ];

  // P0c 追加：真实尺度新增通道（tests/_handoff-p0c 中已验证的路线）
  const EXTRA_ROUTES = [
    ['午门外→午门门洞→金水桥北', [[0, L.START_POSITION.z], [0, L.JINSHUI_RIVER_Z - 20]]],
    ['东侧金水桥(x=-15)', [[-15, L.JINSHUI_RIVER_Z - 20], [-15, L.JINSHUI_RIVER_Z + 20]]],
    ['顺贞门→神武门→出宫', [[0, gz1 - 6], [0, L.BOUNDARY.maxZ - 10]]],
    ['东华门出宫', [[dh.x + 25, dh.z], [L.BOUNDARY.minX + 10, dh.z]]],
    ['西华门出宫', [[xhm.x - 25, xhm.z], [L.BOUNDARY.maxX - 10, xhm.z]]],
    ['中左门过(台外)', [[-72, -30], [A['中左门'].x, -30], [A['中左门'].x, 5]]],
    ['后左门过(台外)', [[-72, 110], [A['后左门'].x, 110], [A['后左门'].x, 140]]],
    // P0c-2 step3 修复守护：养心殿院北墙与永寿门/太极门之间的东西夹道、文华殿院与文渊阁院之间的夹道
    ['西一长街→夹道→永寿门', [[ny.x - 2.4, A['永寿门'].z - 2.8], [A['永寿门'].x, A['永寿门'].z - 2.8], [A['永寿门'].x, A['永寿门'].z + 8]]],
    ['文华殿院北夹道→文渊阁院', [[whd.x + 36.4, -153], [A['文渊阁'].x, -153], [A['文渊阁'].x, -145]]],
  ];
  const round = rs => rs.map(([n, pts]) => [n, pts.map(p => (exactGatePoints.has(p) || exactKunningPoints.has(p)) ? p : [r1(p[0]), r1(p[1])])]);
  return { AXIS_ROUTES: round(AXIS_ROUTES), SIDE_ROUTES: round([...SIDE_ROUTES, ...EXTRA_ROUTES]) };
}

(async () => {
  const { AXIS_ROUTES, SIDE_ROUTES } = await buildRoutes();
  const fpsList = (process.argv[2] || '60,20,10').split(',').map(Number);
  const sprints = (process.argv[3] || '0,1').split(',').map(v => v === '1');
  const which = process.argv[4] || 'axis';
  const ALL = [...AXIS_ROUTES, ...SIDE_ROUTES];
  const ROUTES_RUN = which === 'side' ? SIDE_ROUTES : which === 'all' ? ALL : which === 'axis' ? AXIS_ROUTES : ALL.filter(([n]) => n.includes(which));
  if (process.env.DUMP) { for (const [n, p] of ROUTES_RUN) console.log(n, JSON.stringify(p)); process.exit(0); }
  // 执行器与 stepwalk-auto.cjs 共用（tests/lib/stepwalk-runner.cjs，逻辑与 P0c-2 版本相同，只多记录分区事件）
  const { browser, page } = await openPage();
  const result = await runRoutes(page, ROUTES_RUN, fpsList, sprints);
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
