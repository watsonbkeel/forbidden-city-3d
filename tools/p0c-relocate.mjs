#!/usr/bin/env node
/**
 * P0c-1 · 锚点重定位脚本（可重跑、幂等）
 *
 * 输入：git 11e9bb9 版 7 个 zone JSON（P0b 定稿，压缩坐标）+ data/anchors.json（dimensions.md 真实坐标）
 * 输出：data/zones/*.json（真实米制，+Z 北，x 负 = 东，原点 = 太和殿中心）
 *
 * 方法（docs/agent-tasks/P0c-relocate.md §1）：
 *   - 院落组：刚体平移（主殿 → 锚点）+ 可选水平等比缩放 s（= 锚点面阔 / 现面阔）。
 *     s 作用于组内相对位置、w/d、courtWalls 边界；ph/pad 不缩放；colH × min(s, 1.6)。
 *   - 组内成员有自己锚点（门、后殿、配殿）时优先用锚点。
 *   - 连接件（长墙/廊/长街 region）不缩放，端点吸附到已重定位的墙线（LINES 表）。
 *   - 一切手工调整写在 OVERRIDES 表（附原因），代码通过 ov() 读取并在运行日志中列出。
 *   - 无锚点、靠组变换推得的位置在 item 上标 "source": "estimated"。
 *
 * 用法：node tools/p0c-relocate.mjs [--check]   （--check 只计算并打印，不写文件）
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE_REV = '11e9bb9';
const ZONE_IDS = ['axis-courts', 'east-six', 'west-six', 'ningshou', 'outer-east', 'outer-west', 'garden'];
const CHECK_ONLY = process.argv.includes('--check');

// ───────────────────────── 输入 ─────────────────────────

const OLD = Object.fromEntries(ZONE_IDS.map(id => [
  id,
  JSON.parse(execSync(`git show ${BASE_REV}:data/zones/${id}.json`, { cwd: ROOT, encoding: 'utf8' })),
]));
const RAW_ANCHORS = JSON.parse(readFileSync(join(ROOT, 'data/anchors.json'), 'utf8'));
const ALIASES = RAW_ANCHORS._meta?.aliases ?? {};
/** 按 JSON 名查锚点（含别名：凤彩门→凤采门 等） */
const ANCHORS = new Proxy(RAW_ANCHORS, {
  get: (t, k) => t[k] ?? t[ALIASES[k]],
});

function anchor(name) {
  const a = ANCHORS[name];
  if (!a) throw new Error(`anchors.json 缺少锚点：${name}`);
  return a;
}
/** 取旧 item 的深拷贝 */
function old(zone, idx, expectKind) {
  const it = OLD[zone].items[idx];
  if (!it) throw new Error(`${zone}.items[${idx}] 不存在`);
  if (expectKind && it.kind !== expectKind) throw new Error(`${zone}.items[${idx}] 期望 ${expectKind}，实际 ${it.kind}`);
  return structuredClone(it);
}

// ───────────────────────── 手工调整表 ─────────────────────────

const USED_OVERRIDES = new Set();
const OVERRIDES = {
  sixPalaceS: { value: 1.6, reason: '六宫正殿锚点面阔 27–29 m / 现 15 m ≈ 1.87，但院落按 1.87 放大后宽 56 m，超过真实行距 55 m（与东/西二长街冲突）；取 1.6（院宽 42 m + 二长街 ≈ 13 m），正殿面阔细化留给 P1-Z' },
  sixPalaceCourtW: { value: 42, reason: '六宫院墙东西宽：两宫中心距 55 m，扣除二长街与一长街外侧通道；dimensions.md:161 OSM 约 50 m，留给 P1-Z 细化' },
  sixPalaceCourtMaxD: { value: 50, reason: '六宫院落南北深：dimensions.md:161 OSM 约 50 m；且必须在下一排宫门前留 ≥4 m 东西向夹道' },
  wenhuaS: { value: 1.6, reason: '文华殿/武英殿锚点无面阔（OSM 37.5/38.5 含月台）；主敬殿 26/16 = 1.63 → 取 1.6' },
  wenhuaCourt: { value: { x0: -219, x1: -153, z0: -245.2, z1: -156 }, reason: '文华殿院：东西按本仁殿 −212.2/集义殿 −159.6（dimensions.md:408-409）外扩 ≈6 m；南墙吸附文华门 z；北墙在主敬殿台明后沿 −160.8 北 ≈5 m，与文渊阁院南墙 −150 之间留 6 m 东西夹道（P0c-2：原 −152 只剩 1 m 净宽，文渊阁门走不进）' },
  wenyuanCourt: { value: { x0: -219, x1: -153, z0: -150, z1: -115 }, reason: '文渊阁院：与文华殿院同宽，北界估计（文渊阁 z −132.8 ± 9 + 余量）' },
  wuyingCourt: { value: { x0: 185, x1: 256, z0: -249.8, z1: -152 }, reason: '武英殿院：东西按凝道殿 192.2/焕章殿 250.6（dimensions.md:454-455）外扩；南墙吸附武英门 z' },
  nansanCourt: { value: { x0: -335, x1: -234, z0: 20, z1: 85 }, reason: '南三所：三所东西并列 x −317/−285/−252（dimensions.md:430-434），南至宫门 z 20、北至后殿 68.9 + 余量' },
  nansanS: { value: 1.4, reason: '南三所前殿 15.4 / 现 11 = 1.4（dimensions.md:430）' },
  fengxianCourt: { value: { x0: -215, x1: -150, z0: 203.3, z1: 300 }, reason: '奉先殿院：前殿 52.6 m 宽需 ≥ 60 m 院宽；南墙吸附奉先门 z 203.3，北至后殿 283.4 + 10 + 余量，且在延禧门 303.2 前留夹道' },
  qiandongCourt: { value: { x0: -211, x1: -74, z0: 466, z1: 520 }, reason: '乾东五所：头所 −83.7 … 五所 −199.5、前殿行 z 480/后罩 512（dimensions.md:216-222）；东一长街北段让出 x > −74' },
  yangxinCourt: { value: { x0: 70, x1: 148, z0: 240, z1: 298 }, reason: '养心殿院：西一长街侧院墙吸附遵义门 x 69.4；东界含燕禧堂 130.5（dimensions.md:280）；南界估计；北界 298 = 体顺堂台明后沿 295.75 + 余量，与永寿门 303.6 / 太极门 304.5 之间留 ≈6 m 东西夹道（真实有咸和右门 (69.2, 299.8) 自西一长街通入此夹道，dimensions.md:270；P0c-2：原 302 只剩 0.6 m 净宽，永寿门不可达）' },
  jianfuCourt: { value: { x0: 178.6, x1: 245, z0: 409.4, z1: 520 }, reason: '建福宫+花园区 x≈180–240、z≈420–515（dimensions.md:236）；南墙吸附建福门 z；西六宫/外西路分区线 x 177.85 以西' },
  yinghuaCourtX: { value: [252, 302], reason: '英华殿院：组缩放后 80 m 宽会与建福宫花园重叠；按英华门 277.2 居中取 50 m' },
  shouanCourtZ1: { value: 450, reason: '寿安宫院北界：组缩放后伸到 471，与英华门 454.9 冲突；截到英华门南 5 m' },
  cininCourt: { value: { x0: 187, x1: 258 }, reason: '慈宁宫院东西廊庑 x≈190/255（dimensions.md:473）；组缩放 97 m 宽会越过西六宫分区线' },
  cininGate: { value: '慈宁门', reason: '真实慈宁宫院门为南向慈宁门（222.2, 155.7）；P0b 的院门「永康左门」实际位于慈宁宫广场东端（150, 155），单独保留并移入 axis-courts' },
  ciningGarden: { value: { x0: 232, x1: 286, z0: 18, z1: 140 }, reason: '慈宁宫花园 x≈259，东西 ≈50 m（dimensions.md:447）；东墙吸附揽胜门 x 232；北界在慈宁门广场南' },
  tirenD: { value: 12, reason: '体仁阁/弘义阁本体进深约 12 m（dimensions.md:92「本体 3 间约 12」）；锚点 d 63.6 含两侧庑廊不可用' },
  tirenShift: { value: 2, reason: '体仁阁/弘义阁中心向院内移 2 m，避免台明压到东西庑墙（锚点偏差 2 m < 5 m 容差）' },
  yangxinSide: { value: { x: 87.6, z: 290.9, w: 16.9, d: 8.7 }, reason: 'P0b 养心殿西侧小殿组变换后落在院墙上；改用养心殿东耳房体顺堂真实坐标（dimensions.md:279）' },
  garden: { value: { x: 68, s: 422.7, n: 518.3 }, reason: '御花园院墙：南墙 = 坤宁门线 422.7，北墙 = 顺贞门线 518.3，东西 ±68（官方东西 135 m，给东一长街北段留 4 m 夹道）' },
  ningshouWalls: { value: { e: -360, w: -233.3, s: 118, n: 520 }, reason: '宁寿宫区围墙：西墙吸附锡庆门/履顺门/蹈和门 x≈−233.3；东界 −360（dimensions.md:333 x∈[−360,−225]）；南墙在九龙壁 123 南 5 m；北墙吸附贞顺门 518.9' },
  sixRowEnd: { value: { east: 462, west: 456 }, reason: '第三排院落北界：东侧在乾东五所院 466 前、西侧在重华门 460 前留 4 m 夹道' },
  chuxiuGateZ: { value: 414.8, reason: '储秀门无锚点：按钟粹宫/钟粹门间距 19.5 m 自储秀宫 434.3 反推' },
  changchunGateZ: { value: 358, reason: '长春门无锚点：按东西六宫宫门平均间距 21.6 m 自长春宫 379.6 反推' },
  qiandongGate: { value: { x: -142, z: 466 }, reason: '乾东五所院门：P0b 为单一院门，置于院南墙中点（各所独立门留给 P1-Z）' },
  jiqingGates: { value: 410, reason: '基化门/端则门无锚点：放在坤宁宫院东/西墙北段（永祥门 383.7 北，坤宁门 422.7 南）' },
  qiongyuanZ: { value: 429.7, reason: '琼苑东/西门无锚点：保持 P0b 相对南墙 +7 m' },
  westAlley: { value: { x0: 178.6, x1: 186, z0: 205, z1: 405 }, reason: '西筒子 region：西六宫/外西路分区线外侧夹道，估计' },
  axisSplit: { value: 204.8, reason: '分区线：axis-courts（外朝 + 乾清门广场）北界 = 内左/内右门墙线 203.85 北侧；内廷各区南界' },
  innerSplitX: { value: 68.95, reason: '分区线：御花园东西墙外皮 68.5 与六宫院墙外皮 72.4 之间' },
  westSplitX: { value: 177.85, reason: '分区线：西六宫（咸福/太极院外皮 171.7 + 6）与外西路建福宫院墙 178.1 之间' },
  eastSplitX: { value: -222.25, reason: '分区线：东筒子（宁寿宫西墙 −233.3 与奉先殿院 −215 之间）' },
};
function ov(key) {
  if (!(key in OVERRIDES)) throw new Error(`OVERRIDES 无 ${key}`);
  USED_OVERRIDES.add(key);
  return OVERRIDES[key].value;
}

// ───────────────────────── 连接件墙线（吸附目标） ─────────────────────────

const avg = (...v) => v.reduce((a, b) => a + b, 0) / v.length;
const LINES = {
  OUTER_E: avg(anchor('协和门').x, anchor('左翼门').x, anchor('景运门').x),   // 外朝东庑墙 ≈ −106.5
  OUTER_W: avg(anchor('熙和门').x, anchor('右翼门').x, anchor('隆宗门').x),   // 外朝西庑墙 ≈ +110.7
  SOUTH_INNER: anchor('宫城南墙外皮').z + 8.6 + 0.4,                         // 南城墙内皮 −416.4，再留 0.4
  TAIHEMEN: anchor('太和门').z,                                              // −214.2
  ZHONGZUO: avg(anchor('中左门').z, anchor('中右门').z),                     // −12.2
  HOUZUO: avg(anchor('后左门').z, anchor('后右门').z),                       // 123
  NEIZUO: avg(anchor('内左门').z, anchor('内右门').z),                       // 203.85
  QQM: anchor('乾清门').z,                                                   // 215.3
  INNER: avg(...['日精门', '龙光门', '景和门', '永祥门', '月华门', '凤采门', '隆福门', '增瑞门'].map(n => Math.abs(anchor(n).x))), // ≈ 54.25
  KNM: anchor('坤宁门').z,                                                   // 422.7
};
// 中轴大殿台基外缘（PalaceBuilder.buildComplex 按 Layout 真实尺寸推得）：墙从这里接出
const TERRACE = {
  taihemenHalf: 48 / 2 + 1 + 0.5,     // 太和门 48 m，margin 1
  sanTaiAtZhongzuo: 65.5,             // 三台底层东西 130（傅熹年模数，PalaceBuilder 三台 bottom.halfW 65）+ 0.5
  sanTaiAtHouzuo: 40.5,               // 保和殿段底层半宽 ≈ 49.7/2 + 4 + 2×5.47 = 39.8
  qqmHalf: 37.3 / 2 + 0.65,           // 乾清门 37.3 m，margin 0
};

// ───────────────────────── 工具 ─────────────────────────

const r2 = v => Math.round(v * 100) / 100;
const EST = { source: 'estimated' };
/** 组变换上下文：old 主殿中心 M → 锚点 A，缩放 s */
function xf(M, A, s) {
  return {
    s,
    p: (x, z) => [A[0] + s * (x - M[0]), A[1] + s * (z - M[1])],
    x: x => A[0] + s * (x - M[0]),
    z: z => A[1] + s * (z - M[1]),
  };
}
const colH = (h, s) => (h === undefined ? undefined : h * Math.min(s, 1.6));
/** hall：沿用旧 item 的形制参数，替换位置/尺寸 */
function hall(src, { x, z, w, d, s, est = false, extra = {} }) {
  const it = { ...src, x, z, w, d };
  if (src.colH !== undefined) it.colH = colH(src.colH, s);
  Object.assign(it, extra);
  if (est) Object.assign(it, EST);
  return it;
}
function gate(src, { x, z, w, est = false, extra = {} }) {
  const it = { ...src, x, z };
  if (w !== undefined) it.w = w;
  Object.assign(it, extra);
  if (est) Object.assign(it, EST);
  return it;
}
/** hall 式门的 w：锚点面阔 = w + 8.8（kit.gateHall：W = w + 1.6 + 2×3.6） */
const hallGateW = name => (anchor(name).w ? r2(anchor(name).w - 8.8) : undefined);
const gateOpening = g => (g.style === 'hall' ? (g.w ?? 3.6) + 8.8 : (g.w ?? 3.6) + 2.8);
const region = (name, x0, x1, z0, z1, est = true) => ({ kind: 'region', name, x0, x1, z0, z1, ...(est ? EST : {}) });
const wall = (from, to, extra = {}) => ({ kind: 'wall', from, to, h: 7, ...extra });

/**
 * 沿墙线铺廊：在 [a0, a1] 内扣除障碍区间，剩余每段 ≥ 4 m 生成 corridor。
 * alongZ = true：廊沿 Z 方向（固定 x = c）。
 */
function corridorsAlong({ c, a0, a1, alongZ, facing, obstacles, extra = {} }) {
  const cuts = obstacles.map(([p, q]) => [Math.min(p, q), Math.max(p, q)]).sort((m, n) => m[0] - n[0]);
  const segs = [];
  let s = a0;
  for (const [p, q] of cuts) {
    if (q <= s) continue;
    if (p > s) segs.push([s, Math.min(p, a1)]);
    s = Math.max(s, q);
    if (s >= a1) break;
  }
  if (s < a1) segs.push([s, a1]);
  return segs.filter(([p, q]) => q - p >= 4).map(([p, q]) => ({
    kind: 'corridor',
    from: alongZ ? [c, p] : [p, c],
    to: alongZ ? [c, q] : [q, c],
    facing,
    ...extra,
  }));
}
const gateObstacle = (g, along) => {
  const half = g.style === 'hall' ? gateOpening(g) / 2 + 0.6 : gateOpening(g) / 2 + 2.8;
  return [along - half, along + half];
};

/** 六宫式院落（gate + courtWalls + 正殿 + 后殿 + 东西配殿 + region） */
function sixCourt(zone, base, { gateName, hallName, gateZ, rear, pei, z1Limit, est }) {
  const s = ov('sixPalaceS');
  const W = ov('sixPalaceCourtW');
  const [g0, cw0, h0, rear0, peiE0, peiW0, rg0] = [0, 1, 2, 3, 4, 5, 6].map(k => old(zone, base + k));
  const A = anchor(hallName);
  const t = xf([h0.x, h0.z], [A.x, A.z], s);
  const gA = ANCHORS[gateName];
  const gz = gA ? gA.z : gateZ;
  const gx = gA ? gA.x : A.x;
  const x0 = A.x - W / 2, x1 = A.x + W / 2;
  const z0 = gz;
  const z1 = Math.min(z0 + ov('sixPalaceCourtMaxD'), z1Limit);
  const items = [];
  items.push(gate(g0, { x: gx, z: gz, est: !gA }));
  items.push({ ...cw0, x0, x1, z0, z1, gates: [{ side: 's', at: gx, gate: g0.name }] });
  const mh = hall(h0, { x: A.x, z: A.z, w: h0.w * s, d: h0.d * s, s });
  items.push(mh);
  // 后殿：锚点优先，夹在院内
  const rd = rear0.d * s;
  const rz = Math.min(rear ? rear[1] : t.z(rear0.z), z1 - rd / 2 - 1);
  items.push(hall(rear0, { x: rear ? rear[0] : t.x(rear0.x), z: rz, w: rear0.w * s, d: rd, s, est: !rear }));
  // 配殿：x 用锚点（东 = 更负），z 用组变换（锚点 z 为推算且会与正殿相撞）；夹在院内
  const pd = peiE0.d * s;
  const clampX = x => Math.min(Math.max(x, x0 + pd / 2 + 1), x1 - pd / 2 - 1);
  for (const [src, px] of [[peiE0, pei?.[0]], [peiW0, pei?.[1]]]) {
    items.push(hall(src, { x: clampX(px ?? t.x(src.x)), z: t.z(src.z), w: src.w * s, d: pd, s, est: true }));
  }
  items.push({ ...rg0, x0, x1, z0, z1, ...EST });
  if (est) items.forEach(it => it.kind === 'courtWalls' && Object.assign(it, EST));
  return items;
}

// ───────────────────────── 各区 ─────────────────────────

const NEW = {};
const MOVED = []; // 跨区移动记录

// ===== axis-courts：外朝（午门内 → 乾清门广场），连接件全部吸附到真实墙线 =====
{
  const Z = 'axis-courts';
  const items = [];
  const E = LINES.OUTER_E, Wx = LINES.OUTER_W;
  // 东西庑墙上的门：x 吸附墙线，z 用锚点
  const sideGates = [
    [0, '协和门', E], [1, '熙和门', Wx], [2, '左翼门', E], [3, '右翼门', Wx], [4, '景运门', E], [5, '隆宗门', Wx],
  ].map(([i, name, x]) => gate(old(Z, i, 'gate'), { x, z: anchor(name).z }));
  items.push(...sideGates);
  const gz = n => sideGates.find(g => g.name === n).z;
  items.push(wall([E, LINES.SOUTH_INNER], [E, LINES.NEIZUO], { gaps: ['协和门', '左翼门', '景运门'].map(n => ({ at: gz(n), gate: n })) }));
  items.push(wall([Wx, LINES.SOUTH_INNER], [Wx, LINES.NEIZUO], { gaps: ['熙和门', '右翼门', '隆宗门'].map(n => ({ at: gz(n), gate: n })) }));

  // 横墙：太和门线 / 中左门线 / 后左门线 / 内左门线
  const cross = [
    { gi: 8, name: '昭德门', z: LINES.TAIHEMEN, from: -TERRACE.taihemenHalf, to: E },
    { gi: 10, name: '贞度门', z: LINES.TAIHEMEN, from: TERRACE.taihemenHalf, to: Wx },
    { gi: 12, name: '中左门', z: LINES.ZHONGZUO, from: -TERRACE.sanTaiAtZhongzuo, to: E },
    { gi: 14, name: '中右门', z: LINES.ZHONGZUO, from: TERRACE.sanTaiAtZhongzuo, to: Wx },
    { gi: 16, name: '后左门', z: LINES.HOUZUO, from: -TERRACE.sanTaiAtHouzuo, to: E },
    { gi: 18, name: '后右门', z: LINES.HOUZUO, from: TERRACE.sanTaiAtHouzuo, to: Wx },
    { gi: 20, name: '内左门', z: LINES.NEIZUO, from: -LINES.INNER, to: E },
    { gi: 22, name: '内右门', z: LINES.NEIZUO, from: LINES.INNER, to: Wx },
  ];
  const crossGates = {};
  for (const c of cross) {
    const g = gate(old(Z, c.gi, 'gate'), { x: anchor(c.name).x, z: c.z });
    crossGates[c.name] = g;
    items.push(g);
    items.push(wall([c.from, c.z], [c.to, c.z], { gaps: [{ at: g.x, gate: c.name }] }));
  }

  // 体仁阁 / 弘义阁：自身锚点，s = 锚点面阔 / 现面阔
  const shift = ov('tirenShift');
  for (const [i, name, dir] of [[40, '体仁阁', 1], [41, '弘义阁', -1]]) {
    const src = old(Z, i, 'hall');
    const A = anchor(name);
    const s = A.w / src.w;
    items.push(hall(src, { x: A.x + dir * shift, z: A.z, w: A.w, d: ov('tirenD'), s }));
  }
  const tiren = items.filter(it => it.name === '体仁阁' || it.name === '弘义阁');

  // 东西庑（廊）：外朝东西墙内侧 3.1 m，扣除门、横墙、体仁/弘义阁
  for (const [x, facing, side] of [[E + 3.1, 'x+', 'E'], [Wx - 3.1, 'x-', 'W']]) {
    const gs = sideGates.filter(g => Math.abs(g.x - (side === 'E' ? E : Wx)) < 0.1);
    const obstacles = [
      ...gs.map(g => gateObstacle(g, g.z)),
      [LINES.TAIHEMEN - 8, LINES.TAIHEMEN + 0.5],
      [LINES.ZHONGZUO - 0.5, LINES.ZHONGZUO + 0.5],
      ...tiren.filter(h => Math.sign(h.x) === Math.sign(x)).map(h => [h.z - h.w / 2 - 1, h.z + h.w / 2 + 1]),
    ];
    items.push(...corridorsAlong({ c: x, a0: LINES.SOUTH_INNER + 0.5, a1: LINES.HOUZUO - 0.5, alongZ: true, facing, obstacles }));
  }
  // 太和门线南侧廊（朝南）
  for (const [sign, gname] of [[-1, '昭德门'], [1, '贞度门']]) {
    const g = crossGates[gname];
    const wallX = sign < 0 ? E : Wx;
    items.push(...corridorsAlong({
      c: LINES.TAIHEMEN - 3.1, a0: Math.min(sign * (TERRACE.taihemenHalf + 1), wallX + -sign * 0.5),
      a1: Math.max(sign * (TERRACE.taihemenHalf + 1), wallX + -sign * 0.5),
      alongZ: false, facing: 'z-', obstacles: [gateObstacle(g, g.x)],
    }));
  }
  // 午门外朝房：保持 P0b 相对午门的位置（午门 −65 … −15）
  const wumenZ = anchor('午门').z;
  for (const i of [58, 59]) {
    const src = old(Z, i, 'corridor');
    const oz = -150;
    items.push({ ...src, from: [src.from[0], wumenZ + (src.from[1] - oz)], to: [src.to[0], wumenZ + (src.to[1] - oz)], ...EST });
  }
  // 永康左门（自 outer-west 移入）：慈宁宫广场东端
  {
    const src = old('outer-west', 14, 'gate');
    const A = anchor('永康左门');
    const g = { ...src, x: A.x, z: A.z };
    delete g.style; // dimensions.md:469：琉璃门 ~5 m，非门殿
    items.push(g);
    items.push(wall([A.x, A.z - 15], [A.x, A.z + 15], { gaps: [{ at: A.z, gate: g.name }], ...EST }));
    MOVED.push(`永康左门 outer-west → axis-courts（${OVERRIDES.cininGate.reason}）`);
    ov('cininGate');
  }
  // 区域
  items.push(region('太和门广场', E, Wx, LINES.SOUTH_INNER, LINES.TAIHEMEN, false));
  items.push(region('乾清门广场', E, Wx, LINES.HOUZUO, LINES.NEIZUO, false));
  items.push(region('景运门外', -124, E, 160, 188));
  items.push(region('隆宗门外', Wx, anchor('永康左门').x, 140, 188));
  NEW[Z] = { name: '外朝（午门—乾清门广场）', items };
}

// ===== garden：内廷中路（乾清宫院东西墙、东西一长街）+ 御花园 =====
{
  const Z = 'garden';
  const items = [];
  const G = ov('garden');
  const I = LINES.INNER;
  // 乾清宫院东西墙门（自 axis-courts 移入；补景和/隆福/永祥/增瑞四门锚点）
  const ax = 'axis-courts';
  const mk = (i, name, sign, style) => {
    const src = old(ax, i, 'gate');
    const A = ANCHORS[name];
    const g = gate(src, { x: sign * I, z: A ? A.z : ov('jiqingGates'), est: !A });
    if (style === 'hall') { g.style = 'hall'; const w = hallGateW(name); if (w) g.w = w; }
    return g;
  };
  const eastGates = [mk(42, '日精门', -1, 'hall'), mk(43, '龙光门', -1)];
  const westGates = [mk(46, '月华门', 1, 'hall'), mk(47, '凤彩门', 1)];
  // 新增：景和门/隆福门（交泰殿两侧，dimensions.md:123-124）、永祥门/增瑞门（坤宁宫两侧，dimensions.md:129-130）
  const add = (name, sign, style, rot) => {
    const A = anchor(name);
    const g = { kind: 'gate', name, x: sign * I, z: A.z, rot };
    if (style === 'hall') { g.style = 'hall'; const w = hallGateW(name); if (w) g.w = w; }
    return g;
  };
  eastGates.push(add('景和门', -1, 'hall', 'east'), add('永祥门', -1, null, 'east'), mk(44, '基化门', -1));
  westGates.push(add('隆福门', 1, 'hall', 'west'), add('增瑞门', 1, null, 'west'), mk(48, '端则门', 1));
  items.push(...eastGates, ...westGates);
  items.push(wall([-I, LINES.NEIZUO], [-I, LINES.KNM], { gaps: eastGates.map(g => ({ at: g.z, gate: g.name })) }));
  items.push(wall([I, LINES.NEIZUO], [I, LINES.KNM], { gaps: westGates.map(g => ({ at: g.z, gate: g.name })) }));
  // 乾清门两侧墙（乾清门 → 东西墙）
  items.push(wall([-TERRACE.qqmHalf, LINES.QQM], [-I, LINES.QQM]));
  items.push(wall([TERRACE.qqmHalf, LINES.QQM], [I, LINES.QQM]));
  // 乾清宫院东西庑（廊）
  const corrSrc = old(ax, 50, 'corridor');
  for (const [sign, gs, facing] of [[-1, eastGates, 'x+'], [1, westGates, 'x-']]) {
    items.push(...corridorsAlong({
      c: sign * (I - 3.1), a0: LINES.QQM + 0.5, a1: LINES.KNM - 0.5, alongZ: true, facing,
      obstacles: gs.map(g => gateObstacle(g, g.z)), extra: { depth: corrSrc.depth, colH: corrSrc.colH },
    }));
  }
  MOVED.push('乾清宫院东西墙/门/廊（axis-courts items 42–57）→ garden：真实位置在乾清门广场以北，与外朝 AABB 不能共存');

  // 御花园：院墙吸附坤宁门线 / 顺贞门线
  const gd = OLD[Z].items;
  const gE = gate(old(Z, 0, 'gate'), { x: -G.x, z: ov('qiongyuanZ'), est: true });
  const gW = gate(old(Z, 1, 'gate'), { x: G.x, z: ov('qiongyuanZ'), est: true });
  const gN = gate(old(Z, 2, 'gate'), { x: anchor('顺贞门').x, z: G.n });
  const knm = { kind: 'gate', name: '坤宁门', x: anchor('坤宁门').x, z: LINES.KNM, style: 'hall', w: hallGateW('坤宁门') };
  const ckL = { kind: 'gate', name: '长康左门', x: anchor('长康左门').x, z: LINES.KNM };
  const ckR = { kind: 'gate', name: '长康右门', x: anchor('长康右门').x, z: LINES.KNM };
  items.push(gE, gW, gN, knm, ckL, ckR);
  items.push(wall([-G.x, G.s], [G.x, G.s], { gaps: [knm, ckL, ckR].map(g => ({ at: g.x, gate: g.name })) }));
  items.push(wall([-G.x, G.n], [G.x, G.n], { gaps: [{ at: gN.x, gate: gN.name }] }));
  items.push(wall([-G.x, G.s], [-G.x, G.n], { gaps: [{ at: gE.z, gate: gE.name }] }));
  items.push(wall([G.x, G.s], [G.x, G.n], { gaps: [{ at: gW.z, gate: gW.name }] }));
  // 钦安殿（组：殿 + region），s = 24.1 / 15
  const qa = old(Z, 8, 'hall');
  const A = anchor('钦安殿');
  const s = A.w / qa.w;
  items.push(hall(qa, { x: A.x, z: A.z, w: A.w, d: A.d, s }));
  const rg = old(Z, 9, 'region');
  const t = xf([qa.x, qa.z], [A.x, A.z], s);
  items.push(region(rg.name, t.x(rg.x0), t.x(rg.x1), t.z(rg.z0), t.z(rg.z1)));
  // 东西一长街（自 axis-courts 移入，吸附到乾清宫院墙与六宫院墙外皮）
  const sixX = ov('sixPalaceCourtW') / 2;
  items.push(region('东一长街', anchor('景仁宫').x + sixX, -I, LINES.NEIZUO, G.n));
  items.push(region('西一长街', I, anchor('永寿宫').x - sixX, LINES.NEIZUO, G.n));
  void gd;
  NEW[Z] = { name: '内廷中路与御花园', items };
}

// ===== east-six：东六宫 + 乾东五所 + 奉先殿 =====
{
  const Z = 'east-six';
  const items = [];
  const rowEnd = ov('sixRowEnd').east;
  const qd = ov('qiandongCourt');
  const rows = [
    { base: 0, gate: '景仁门', hall: '景仁宫', rear: [-93, 356], pei: [-110, -77], next: anchor('承乾门').z },
    { base: 7, gate: '承乾门', hall: '承乾宫', rear: [-93, 404], pei: [-111, -76], next: anchor('钟粹门').z },
    { base: 14, gate: '钟粹门', hall: '钟粹宫', rear: [-93, 456], pei: [-111, -76], next: qd.z0 },
    { base: 21, gate: '延禧门', hall: '延禧宫', rear: null, pei: null, next: anchor('永和门').z },
    { base: 28, gate: '永和门', hall: '永和宫', rear: [-148.7, 402.6], pei: [-166, -132], next: anchor('景阳门').z },
    { base: 35, gate: '景阳门', hall: '景阳宫', rear: [-148.5, 453.5], pei: [-166, -132], next: qd.z0 },
  ];
  for (const r of rows) {
    items.push(...sixCourt(Z, r.base, {
      gateName: r.gate, hallName: r.hall, rear: r.rear, pei: r.pei,
      z1Limit: Math.min(r.next - 4, rowEnd),
    }));
  }
  // 乾东五所：五座所按 dimensions.md:216-220 真实 x
  {
    const g0 = old(Z, 42, 'gate'), cw0 = old(Z, 43, 'courtWalls');
    const G = ov('qiandongGate');
    items.push(gate(g0, { x: G.x, z: G.z, est: true }));
    items.push({ ...cw0, x0: qd.x0, x1: qd.x1, z0: qd.z0, z1: qd.z1, gates: [{ side: 's', at: G.x, gate: g0.name }] });
    const xs = [-83.7, -112.2, -142.2, -170.8, -199.5];
    const s = 18.9 / 7;
    for (let k = 0; k < 5; k++) {
      const src = old(Z, 44 + k, 'hall');
      items.push(hall(src, { x: xs[k], z: anchor('乾东头所').z, w: anchor('乾东头所').w, d: anchor('乾东头所').d, s }));
    }
    items.push(region('乾东五所', qd.x0, qd.x1, qd.z0, qd.z1, false));
  }
  // 东二长街
  {
    const W2 = ov('sixPalaceCourtW') / 2;
    items.push(region('东二长街', anchor('延禧宫').x + W2, anchor('景仁宫').x - W2, anchor('景仁门').z, rowEnd));
  }
  // 奉先殿（自 outer-east 移入）
  {
    const Zo = 'outer-east';
    const g0 = old(Zo, 18, 'gate'), cw0 = old(Zo, 19, 'courtWalls'), h0 = old(Zo, 20, 'hall'), rr0 = old(Zo, 21, 'hall'), rg0 = old(Zo, 22, 'region');
    const C = ov('fengxianCourt');
    const A = anchor('奉先殿'), R = anchor('奉先殿后殿'), Gt = anchor('奉先门');
    const s = A.w / h0.w;
    items.push(gate(g0, { x: Gt.x, z: Gt.z, w: hallGateW('奉先门') }));
    items.push({ ...cw0, ...C, gates: [{ side: 's', at: Gt.x, gate: g0.name }] });
    items.push(hall(h0, { x: A.x, z: A.z, w: A.w, d: A.d, s }));
    items.push(hall(rr0, { x: R.x, z: R.z, w: R.w, d: R.d, s }));
    items.push(region(rg0.name, C.x0, C.x1, C.z0, C.z1, false));
    MOVED.push('奉先殿组 outer-east → east-six：真实位置 (−182, 203–300) 在景运门外以北、东六宫以南，外东路 AABB 若含它会与宁寿宫区重叠');
  }
  NEW[Z] = { name: '东六宫', items };
}

// ===== west-six：养心殿 + 西六宫 + 重华宫 =====
{
  const Z = 'west-six';
  const items = [];
  // 养心殿院
  {
    const g0 = old(Z, 0, 'gate'), cw0 = old(Z, 1, 'courtWalls'), h0 = old(Z, 2, 'hall'), side0 = old(Z, 3, 'hall'), rg0 = old(Z, 4, 'region');
    const C = ov('yangxinCourt');
    const A = anchor('养心殿'), Gt = anchor('遵义门');
    const s = A.w / h0.w;
    items.push(gate(g0, { x: C.x0, z: Gt.z }));
    items.push({ ...cw0, ...C, gates: [{ side: 'xmin', at: Gt.z, gate: g0.name }] });
    items.push(hall(h0, { x: A.x, z: A.z, w: A.w, d: A.d, s }));
    const sd = ov('yangxinSide');
    const side = hall(side0, { x: sd.x, z: sd.z, w: sd.w, d: sd.d, s });
    delete side.rot;
    items.push(side);
    items.push(region(rg0.name, C.x0, C.x1, C.z0, C.z1));
  }
  const rowEnd = ov('sixRowEnd').west;
  const rows = [
    { base: 5, gate: '永寿门', hall: '永寿宫', rear: [95, 349.2], pei: [78, 112], next: anchor('翊坤门').z },
    { base: 12, gate: '翊坤门', hall: '翊坤宫', rear: null, pei: [77, 111], next: ov('chuxiuGateZ') },
    { base: 19, gate: '储秀门', hall: '储秀宫', rear: [94.5, 450.5], pei: [77, 112], next: anchor('重华门').z, gateZ: ov('chuxiuGateZ') },
    { base: 26, gate: '太极门', hall: '太极殿', rear: [150.1, 349.1], pei: [133, 167], next: ov('changchunGateZ') },
    { base: 33, gate: '长春门', hall: '长春宫', rear: [149.8, 399.4], pei: [131.7, 169], next: anchor('咸福门').z, gateZ: ov('changchunGateZ') },
    { base: 40, gate: '咸福门', hall: '咸福宫', rear: [149.3, 449.8], pei: [133, 167], next: anchor('重华门').z },
  ];
  for (const r of rows) {
    items.push(...sixCourt(Z, r.base, {
      gateName: r.gate, hallName: r.hall, rear: r.rear, pei: r.pei, gateZ: r.gateZ,
      z1Limit: Math.min(r.next - 4, rowEnd),
    }));
  }
  {
    const W2 = ov('sixPalaceCourtW') / 2;
    items.push(region('西二长街', anchor('永寿宫').x + W2, anchor('太极殿').x - W2, anchor('永寿门').z, rowEnd));
  }
  // 重华宫（自 outer-west 移入）：组变换 + 门吸附
  {
    const Zo = 'outer-west';
    const g0 = old(Zo, 21, 'gate'), cw0 = old(Zo, 22, 'courtWalls'), h0 = old(Zo, 23, 'hall'), rg0 = old(Zo, 24, 'region');
    const A = anchor('重华宫'), Gt = anchor('重华门');
    const s = A.w / h0.w;
    const t = xf([h0.x, h0.z], [A.x, A.z], s);
    const x0 = t.x(cw0.x0), x1 = t.x(cw0.x1);
    const z0 = Gt.z;
    const z1 = Math.max(z0 + (cw0.z1 - cw0.z0) * s, A.z + A.d / 2 + 3);
    items.push(gate(g0, { x: Gt.x, z: Gt.z }));
    items.push({ ...cw0, x0, x1, z0, z1, gates: [{ side: 's', at: Gt.x, gate: g0.name }], ...EST });
    items.push(hall(h0, { x: A.x, z: A.z, w: A.w, d: A.d, s }));
    items.push(region(rg0.name, x0, x1, z0, z1));
    MOVED.push('重华宫组 outer-west → west-six：真实位置 (87–150, 460–520) 在西六宫正北');
  }
  NEW[Z] = { name: '西六宫与养心殿', items };
}

// ===== ningshou：宁寿宫区 =====
{
  const Z = 'ningshou';
  const items = [];
  const W = ov('ningshouWalls');
  const gX = gate(old(Z, 0, 'gate'), { x: W.w, z: anchor('锡庆门').z });
  const gH = gate(old(Z, 1, 'gate'), { x: anchor('皇极门').x, z: anchor('皇极门').z, w: hallGateW('皇极门') });
  const gY = gate(old(Z, 2, 'gate'), { x: anchor('养性门').x, z: anchor('养性门').z });
  items.push(gX, gH, gY);
  items.push(wall([W.e, W.s], [W.w, W.s], EST));
  items.push(wall([W.w, W.s], [W.w, W.n], { gaps: [{ at: gX.z, gate: gX.name }] }));
  items.push(wall([W.e, W.n], [W.w, W.n], EST));
  items.push(wall([W.e, gH.z], [W.w, gH.z], { gaps: [{ at: gH.x, gate: gH.name }] }));
  items.push(wall([W.e, gY.z], [W.w, gY.z], { gaps: [{ at: gY.x, gate: gY.name }] }));
  const nd = old(Z, 8, 'nineDragonWall');
  const ndA = anchor('九龙壁');
  items.push({ ...nd, x: ndA.x, z: ndA.z, length: ndA.w });
  for (let i = 9; i <= 15; i++) {
    const src = old(Z, i, 'hall');
    const A = anchor(src.name);
    const s = A.w / src.w;
    items.push(hall(src, { x: A.x, z: A.z, w: A.w, d: A.d ?? src.d * s, s, est: A.d === undefined }));
  }
  items.push(region('九龙壁', W.e, W.w, W.s, gH.z, false));
  items.push(region('宁寿宫', W.e, W.w, gH.z, gY.z, false));
  items.push(region('养性殿·乐寿堂', W.e, W.w, gY.z, W.n, false));
  items.push(region('东筒子', W.w, ov('eastSplitX') - 0.25, 130, W.n));
  NEW[Z] = { name: '宁寿宫区', items };
}

// ===== outer-east：文华殿 / 文渊阁 / 南三所 / 箭亭 / 东华门 =====
{
  const Z = 'outer-east';
  const items = [];
  // 文华殿院
  {
    const s = ov('wenhuaS');
    const C = ov('wenhuaCourt');
    const [g0, cw0, h0, h1, rg0] = [0, 1, 2, 3, 4].map(k => old(Z, k));
    const Gt = anchor('文华门'), A = anchor('文华殿'), B = anchor('主敬殿');
    items.push(gate(g0, { x: Gt.x, z: Gt.z, w: hallGateW('文华门') }));
    items.push({ ...cw0, ...C, gates: [{ side: 's', at: Gt.x, gate: g0.name }] });
    items.push(hall(h0, { x: A.x, z: A.z, w: h0.w * s, d: h0.d * s, s }));
    items.push(hall(h1, { x: B.x, z: B.z, w: h1.w * s, d: h1.d * s, s }));
    items.push(region(rg0.name, C.x0, C.x1, C.z0, C.z1));
  }
  // 文渊阁院
  {
    const C = ov('wenyuanCourt');
    const [g0, cw0, h0, rg0] = [5, 6, 7, 8].map(k => old(Z, k));
    const A = anchor('文渊阁');
    const s = A.w / h0.w;
    items.push(gate(g0, { x: A.x, z: C.z0, est: true }));
    items.push({ ...cw0, ...C, gates: [{ side: 's', at: A.x, gate: g0.name }], ...EST });
    items.push(hall(h0, { x: A.x, z: A.z, w: A.w, d: A.d, s }));
    items.push(region(rg0.name, C.x0, C.x1, C.z0, C.z1));
  }
  // 南三所：六座殿按 dimensions.md:430-434 真实坐标（P0b 前排 z22 → 前殿，后排 z39 → 后殿）
  {
    const C = ov('nansanCourt');
    const s = ov('nansanS');
    const g0 = old(Z, 9, 'gate'), cw0 = old(Z, 10, 'courtWalls'), rg0 = old(Z, 17, 'region');
    const Gt = anchor('南三所');
    items.push(gate(g0, { x: Gt.x, z: Gt.z }));
    items.push({ ...cw0, ...C, gates: [{ side: 's', at: Gt.x, gate: g0.name }] });
    const front = { '-94': -251.8, '-110': -285.4, '-126': -317.4 };
    const back = { '-94': -252, '-110': -285.1, '-126': -317 };
    for (let k = 11; k <= 16; k++) {
      const src = old(Z, k, 'hall');
      const isFront = src.z === 22;
      const x = (isFront ? front : back)[String(src.x)];
      items.push(hall(src, isFront
        ? { x, z: 39, w: 15.4, d: 10.6, s }
        : { x, z: 68.9, w: 19, d: 10.3, s }));
    }
    items.push(region(rg0.name, C.x0, C.x1, C.z0, C.z1, false));
  }
  // 箭亭
  {
    const src = old(Z, 23, 'hall');
    const A = anchor('箭亭');
    items.push(hall(src, { x: A.x, z: A.z, w: A.w, d: A.d, s: A.w / src.w }));
  }
  // 东华门：坐城墙
  {
    const src = old(Z, 24, 'cityGate');
    const A = anchor('东华门');
    items.push({ ...src, x: A.x, z: A.z });
    items.push(region('东华门', -376, -345, A.z - 15, A.z + 15));
  }
  NEW[Z] = { name: '东路外朝', items };
}

// ===== outer-west：武英殿 / 南薰殿 / 慈宁宫花园 / 慈宁宫 / 西华门 / 建福宫 / 英华殿 / 寿康宫 / 寿安宫 =====
{
  const Z = 'outer-west';
  const items = [];
  // 武英殿院
  {
    const s = ov('wenhuaS');
    const C = ov('wuyingCourt');
    const [g0, cw0, h0, h1, rg0] = [0, 1, 2, 3, 4].map(k => old(Z, k));
    const Gt = anchor('武英门'), A = anchor('武英殿'), B = anchor('敬思殿');
    items.push(gate(g0, { x: Gt.x, z: Gt.z, w: hallGateW('武英门') }));
    items.push({ ...cw0, ...C, gates: [{ side: 's', at: Gt.x, gate: g0.name }] });
    items.push(hall(h0, { x: A.x, z: A.z, w: h0.w * s, d: h0.d * s, s }));
    items.push(hall(h1, { x: B.x, z: B.z, w: h1.w * s, d: h1.d * s, s }));
    items.push(region(rg0.name, C.x0, C.x1, C.z0, C.z1));
  }
  // 南薰殿院：纯组变换
  {
    const [g0, cw0, h0, rg0] = [5, 6, 7, 8].map(k => old(Z, k));
    const A = anchor('南薰殿');
    const s = A.w / h0.w;
    const t = xf([h0.x, h0.z], [A.x, A.z], s);
    const [gx, gz] = t.p(g0.x, g0.z);
    items.push(gate(g0, { x: gx, z: gz, est: true }));
    items.push({ ...cw0, x0: t.x(cw0.x0), x1: t.x(cw0.x1), z0: t.z(cw0.z0), z1: t.z(cw0.z1), gates: [{ side: 's', at: gx, gate: g0.name }], ...EST });
    items.push(hall(h0, { x: A.x, z: A.z, w: A.w, d: A.d, s }));
    items.push(region(rg0.name, t.x(rg0.x0), t.x(rg0.x1), t.z(rg0.z0), t.z(rg0.z1)));
  }
  // 慈宁宫花园
  {
    const C = ov('ciningGarden');
    const [g0, cw0, p0, h0, rg0] = [9, 10, 11, 12, 13].map(k => old(Z, k));
    const Gt = anchor('揽胜门'), P = anchor('临溪亭'), A = anchor('咸若馆');
    items.push(gate(g0, { x: Gt.x, z: Gt.z }));
    items.push({ ...cw0, ...C, gates: [{ side: 'xmin', at: Gt.z, gate: g0.name }], ...EST });
    items.push(hall(p0, { x: P.x, z: P.z, w: P.w, d: P.d, s: P.w / p0.w }));
    items.push(hall(h0, { x: A.x, z: A.z, w: A.w, d: A.d, s: A.w / h0.w }));
    items.push(region(rg0.name, C.x0, C.x1, C.z0, C.z1));
  }
  // 慈宁宫院：院门改为南向慈宁门
  {
    const cw0 = old(Z, 15, 'courtWalls'), h0 = old(Z, 16, 'hall'), rg0 = old(Z, 17, 'region');
    const A = anchor('慈宁宫'), Gt = anchor('慈宁门');
    const s = A.w / h0.w;
    const t = xf([h0.x, h0.z], [A.x, A.z], s);
    const CX = ov('cininCourt');
    const gname = ov('cininGate');
    const z0 = Gt.z, z1 = t.z(cw0.z1);
    items.push({ kind: 'gate', name: gname, x: Gt.x, z: Gt.z, style: 'hall', w: hallGateW(gname) });
    items.push({ ...cw0, x0: CX.x0, x1: CX.x1, z0, z1, gates: [{ side: 's', at: Gt.x, gate: gname }], ...EST });
    items.push(hall(h0, { x: A.x, z: A.z, w: A.w, d: A.d, s }));
    items.push(region(rg0.name, CX.x0, CX.x1, z0, z1));
  }
  // 西华门
  {
    const src = old(Z, 18, 'cityGate');
    const A = anchor('西华门');
    items.push({ ...src, x: A.x, z: A.z });
    items.push(region('西华门', 345, 376, A.z - 15, A.z + 15));
    items.push(region('武英殿外', ov('westAlley').x0, ov('wuyingCourt').x1, -300, anchor('武英门').z - 1));
  }
  // 建福宫花园
  {
    const C = ov('jianfuCourt');
    const [g0, cw0, h0] = [25, 26, 27].map(k => old(Z, k));
    const Gt = anchor('建福门'), A = anchor('延春阁');
    items.push(gate(g0, { x: Gt.x, z: Gt.z }));
    items.push({ ...cw0, ...C, gates: [{ side: 's', at: Gt.x, gate: g0.name }] });
    items.push(hall(h0, { x: A.x, z: A.z, w: A.w, d: A.d, s: A.w / h0.w }));
    items.push(region('建福宫花园', C.x0, C.x1, C.z0, C.z1, false));
  }
  // 英华殿院
  {
    const [g0, cw0, h0, rg0] = [29, 30, 31, 32].map(k => old(Z, k));
    const A = anchor('英华殿'), Gt = anchor('英华门');
    const s = A.w / h0.w;
    const [x0, x1] = ov('yinghuaCourtX');
    const z0 = Gt.z, z1 = Math.max(z0 + (cw0.z1 - cw0.z0) * s, A.z + A.d / 2 + 3);
    items.push(gate(g0, { x: Gt.x, z: Gt.z }));
    items.push({ ...cw0, x0, x1, z0, z1, gates: [{ side: 's', at: Gt.x, gate: g0.name }], ...EST });
    items.push(hall(h0, { x: A.x, z: A.z, w: A.w, d: A.d, s }));
    items.push(region(rg0.name, x0, x1, z0, z1));
  }
  // 寿康宫院
  {
    const [g0, cw0, h0, rr0, rg0] = [33, 34, 35, 36, 37].map(k => old(Z, k));
    const A = anchor('寿康宫'), Gt = anchor('寿康门');
    const s = A.w / h0.w;
    const t = xf([h0.x, h0.z], [A.x, A.z], s);
    const x0 = t.x(cw0.x0), x1 = t.x(cw0.x1);
    const z0 = Gt.z, z1 = Math.max(z0 + (cw0.z1 - cw0.z0) * s, 260.1 + 12.1 / 2 + 2);
    items.push(gate(g0, { x: Gt.x, z: Gt.z }));
    items.push({ ...cw0, x0, x1, z0, z1, gates: [{ side: 's', at: Gt.x, gate: g0.name }], ...EST });
    items.push(hall(h0, { x: A.x, z: A.z, w: A.w, d: A.d, s }));
    items.push(hall(rr0, { x: 288.8, z: 260.1, w: 24.7, d: 12.1, s })); // dimensions.md:324
    items.push(region(rg0.name, x0, x1, z0, z1));
  }
  // 寿安宫院
  {
    const [g0, cw0, h0, rr0, rg0] = [38, 39, 40, 41, 42].map(k => old(Z, k));
    const A = anchor('寿安宫'), Gt = anchor('寿安门');
    const s = A.w / h0.w;
    const t = xf([h0.x, h0.z], [A.x, A.z], s);
    const x0 = t.x(cw0.x0), x1 = t.x(cw0.x1);
    const z0 = Gt.z, z1 = Math.min(t.z(cw0.z1), ov('shouanCourtZ1'));
    items.push(gate(g0, { x: Gt.x, z: Gt.z }));
    items.push({ ...cw0, x0, x1, z0, z1, gates: [{ side: 's', at: Gt.x, gate: g0.name }], ...EST });
    items.push(hall(h0, { x: A.x, z: A.z, w: A.w, d: A.d, s }));
    const rd = rr0.d * s;
    items.push(hall(rr0, { x: A.x, z: Math.min(t.z(rr0.z), z1 - rd / 2 - 1), w: rr0.w * s, d: rd, s, est: true }));
    items.push(region(rg0.name, x0, x1, z0, z1));
  }
  {
    const Wa = ov('westAlley');
    items.push(region('西筒子', Wa.x0, Wa.x1, Wa.z0, Wa.z1));
  }
  NEW[Z] = { name: '外西路', items };
}

// ───────────────────────── bounds / neighbors ─────────────────────────

function itemBox(it) {
  const pad = 0.5;
  switch (it.kind) {
    case 'wall': {
      const xs = [it.from[0], it.to[0]], zs = [it.from[1], it.to[1]];
      return [Math.min(...xs) - pad, Math.max(...xs) + pad, Math.min(...zs) - pad, Math.max(...zs) + pad];
    }
    case 'courtWalls':
    case 'region':
      return [Math.min(it.x0, it.x1) - (it.kind === 'region' ? 0 : pad), Math.max(it.x0, it.x1) + (it.kind === 'region' ? 0 : pad),
        Math.min(it.z0, it.z1) - (it.kind === 'region' ? 0 : pad), Math.max(it.z0, it.z1) + (it.kind === 'region' ? 0 : pad)];
    case 'corridor': {
      const d = (it.depth ?? 4.2) / 2;
      const xs = [it.from[0], it.to[0]], zs = [it.from[1], it.to[1]];
      return [Math.min(...xs) - d, Math.max(...xs) + d, Math.min(...zs) - d, Math.max(...zs) + d];
    }
    case 'hall': {
      const sideways = it.rot === 'east' || it.rot === 'west';
      const hw = (sideways ? it.d : it.w) / 2 + (it.pad ?? 1), hd = (sideways ? it.w : it.d) / 2 + (it.pad ?? 1);
      return [it.x - hw, it.x + hw, it.z - hd, it.z + hd];
    }
    case 'gate': {
      const W = gateOpening(it) / 2, D = it.style === 'hall' ? 4 : 1.5;
      const sideways = it.rot === 'east' || it.rot === 'west';
      return sideways ? [it.x - D, it.x + D, it.z - W, it.z + W] : [it.x - W, it.x + W, it.z - D, it.z + D];
    }
    case 'cityGate': {
      const sideways = it.rot === 'east' || it.rot === 'west';
      return sideways ? [it.x - 7, it.x + 7, it.z - 15, it.z + 15] : [it.x - 15, it.x + 15, it.z - 7, it.z + 7];
    }
    case 'nineDragonWall':
      return [it.x - it.length / 2, it.x + it.length / 2, it.z - 1, it.z + 1];
    default:
      throw new Error(`未知 kind ${it.kind}`);
  }
}
const MARGIN = 6;
// 分区线裁剪：[zone, 边, 值]。只裁外扩余量，不得切到内容（脚本自检）。
const SPLIT = (() => {
  const zA = ov('axisSplit'), xi = ov('innerSplitX'), xw = ov('westSplitX'), xe = ov('eastSplitX');
  const g = 0.2; // 两侧各让 0.2 m，保证 ZoneManager.checkOverlaps（含边界接触）不报警
  return [
    ['axis-courts', 'z1', zA - g], ['garden', 'z0', zA + g], ['east-six', 'z0', zA + g], ['west-six', 'z0', zA + g],
    ['garden', 'x0', -xi + g], ['garden', 'x1', xi - g], ['east-six', 'x1', -xi - g], ['west-six', 'x0', xi + g],
    ['west-six', 'x1', xw - g], ['outer-west', 'x0', xw + g],
    ['ningshou', 'x1', xe - g], ['east-six', 'x0', xe + g],
  ];
})();
const BOUNDS_OVERRIDE = {
  // 出生点：LAYOUT.START_POSITION 在午门南 50 m（与 P0b 相对位置一致），axis-courts 的朝房已覆盖，无需额外扩展
};

const content = {};
const bounds = {};
for (const id of ZONE_IDS) {
  const boxes = NEW[id].items.map(itemBox);
  const c = {
    x0: Math.min(...boxes.map(b => b[0])), x1: Math.max(...boxes.map(b => b[1])),
    z0: Math.min(...boxes.map(b => b[2])), z1: Math.max(...boxes.map(b => b[3])),
  };
  content[id] = c;
  bounds[id] = { x0: c.x0 - MARGIN, x1: c.x1 + MARGIN, z0: c.z0 - MARGIN, z1: c.z1 + MARGIN, ...(BOUNDS_OVERRIDE[id] ?? {}) };
}
const problems = [];
for (const [id, side, v] of SPLIT) {
  const b = bounds[id];
  const isMin = side.endsWith('0');
  const clipped = isMin ? Math.max(b[side], v) : Math.min(b[side], v);
  // 内容检查：点状 item（gate/hall/cityGate/nineDragonWall）中心必须在裁剪后 bounds ±5 m 内（zone-lint 口径）
  b[side] = clipped;
}
for (const id of ZONE_IDS) {
  const b = bounds[id];
  for (const k of ['x0', 'x1', 'z0', 'z1']) b[k] = r2(b[k]);
  NEW[id].items.forEach((it, i) => {
    if (it.x === undefined) return;
    if (it.x < b.x0 - 5 || it.x > b.x1 + 5 || it.z < b.z0 - 5 || it.z > b.z1 + 5) {
      problems.push(`${id}.items[${i}] ${it.kind} ${it.name ?? ''} (${r2(it.x)}, ${r2(it.z)}) 超出 bounds ±5`);
    }
  });
}
// 严格不重叠（含接触）
const overlaps = [];
for (let i = 0; i < ZONE_IDS.length; i++) {
  for (let j = i + 1; j < ZONE_IDS.length; j++) {
    const a = bounds[ZONE_IDS[i]], b = bounds[ZONE_IDS[j]];
    if (!(a.x1 < b.x0 || b.x1 < a.x0 || a.z1 < b.z0 || b.z1 < a.z0)) overlaps.push(`${ZONE_IDS[i]} × ${ZONE_IDS[j]}`);
  }
}
// neighbors：bounds 间距 ≤ 25 m
const gap = (a, b) => Math.hypot(Math.max(0, a.x0 - b.x1, b.x0 - a.x1), Math.max(0, a.z0 - b.z1, b.z0 - a.z1));
const neighbors = {};
for (const id of ZONE_IDS) {
  neighbors[id] = ZONE_IDS.filter(o => o !== id && gap(bounds[id], bounds[o]) <= 25);
}

// ───────────────────────── 输出 ─────────────────────────

function fmt(v) {
  if (Array.isArray(v)) return `[${v.map(fmt).join(', ')}]`;
  if (v && typeof v === 'object') return `{${Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => `${JSON.stringify(k)}: ${fmt(x)}`).join(', ')}}`;
  if (typeof v === 'number') return String(r2(v));
  return JSON.stringify(v);
}
/** source 放到最后，便于阅读 */
function ordered(it) {
  const { source, ...rest } = it;
  return source ? { ...rest, source } : rest;
}
function serialize(id) {
  const z = NEW[id];
  const lines = [
    '{',
    `  "id": ${JSON.stringify(id)},`,
    `  "name": ${JSON.stringify(z.name)},`,
    `  "bounds": ${fmt(bounds[id])},`,
    `  "neighbors": ${fmt(neighbors[id])},`,
    '  "items": [',
    z.items.map(it => `    ${fmt(ordered(it))}`).join(',\n'),
    '  ]',
    '}',
    '',
  ];
  return lines.join('\n');
}

console.log('P0c-1 重定位：输入', BASE_REV, '· 锚点', Object.keys(ANCHORS).length - 1, '条');
console.log('\n墙线吸附 LINES：', Object.fromEntries(Object.entries(LINES).map(([k, v]) => [k, r2(v)])));
console.log('\nzone          items  content(x0,x1,z0,z1)                 bounds(x0,x1,z0,z1)                 neighbors');
for (const id of ZONE_IDS) {
  const c = content[id], b = bounds[id];
  const est = NEW[id].items.filter(it => it.source === 'estimated').length;
  console.log(`${id.padEnd(13)} ${String(NEW[id].items.length).padStart(5)}  ${[c.x0, c.x1, c.z0, c.z1].map(v => r2(v).toFixed(1).padStart(7)).join(' ')}   ${[b.x0, b.x1, b.z0, b.z1].map(v => v.toFixed(1).padStart(7)).join(' ')}   ${neighbors[id].join(',')}  (estimated ${est})`);
}
console.log('\n跨区移动：');
MOVED.forEach(m => console.log('  -', m));
console.log('\n使用的 overrides：');
for (const k of USED_OVERRIDES) console.log(`  - ${k}: ${OVERRIDES[k].reason}`);
const unused = Object.keys(OVERRIDES).filter(k => !USED_OVERRIDES.has(k));
if (unused.length) console.log('\n未使用的 overrides：', unused.join(', '));
console.log(`\nbounds 重叠（含接触）：${overlaps.length ? overlaps.join('; ') : '0'}`);
if (problems.length) console.log('越界：\n  ' + problems.join('\n  '));

if (overlaps.length || problems.length || unused.length) {
  console.error('\n✗ 自检未通过，未写文件');
  process.exit(1);
}
if (!CHECK_ONLY) {
  for (const id of ZONE_IDS) writeFileSync(join(ROOT, `data/zones/${id}.json`), serialize(id));
  console.log('\n✓ 已写入 data/zones/*.json');
}
