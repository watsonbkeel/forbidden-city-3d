// 从 data/zones/*.json 自动生成 stepwalk 路线（T-2）。
//   区内路线：每座有名、enter:true（非敞厅）的殿 → 它的院门（院落 courtWalls 的门；不在院落里则取殿正面方向最近的门）
//     → 门外（夹道/街上）→ 门内 → 殿前台阶外 2 m → 殿内 1 m → 原路返回门外
//   跨区路线：中轴 → 东六宫 → 宁寿宫 → 回中轴；中轴 → 景运门 → 宁寿宫 → 回中轴
// 起止建筑全部取自 zone JSON；中间途经点用碰撞世界（tests/lib/world.mjs，与游戏同一套 CourtKit 碰撞）规划：
//   - 门外深度：门外实测净空 ≥ 7 m 取 6 m；否则取夹道中线，并沿夹道横移 8 m 作起点（从街上拐进门）
//   - 路段被殿挡住：从该殿侧面（台明外 3 m）绕行
//   - 后殿殿前被前殿占据（工字殿，如文华殿/主敬殿）：穿前殿（前门进 → 绕宝座 → 后门出）
// 每条路线：{ name, zone, gate, hall, via, pts:[[x,z],...], plan:[规划说明] , knownIssue? }
import { gateGeom, hallGeom, walkStraight, pointBlocked, collidersIn } from './world.mjs';

export const GATE_OUT = 6;       // 门外起点距门体外沿（净空够时）
export const LANE_SIDE = 8;      // 夹道内横移距离
export const HALL_FRONT = 2;     // 殿前停点距台阶外沿
export const DETOUR_GAP = 3;     // 绕殿时离台明外沿
const r1 = v => Math.round(v * 10) / 10;
const inRect = (x, z, R, m = 0) => x > R.x0 + m && x < R.x1 - m && z > R.z0 + m && z < R.z1 - m;
const legOk = (W, p, q) => { const w = walkStraight(W, p, q); return w.reached >= w.total - 0.5; };
/** 线段 p→q 是否穿过矩形 R（按 0.5 m 采样） */
const segHitsRect = (p, q, R) => {
  const n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 0.5));
  for (let i = 0; i <= n; i++) { const t = i / n; if (inRect(p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, R)) return true; }
  return false;
};

/** 殿台明（含台阶）世界 AABB */
function hallRect(h) {
  const g = hallGeom(h);
  const cs = [[-g.PW / 2, -(g.PD / 2 + g.run)], [g.PW / 2, g.PD / 2 + (g.backDoor || g.open ? g.run : 0)]].map(([x, z]) => g.toW(x, z));
  return { x0: Math.min(cs[0][0], cs[1][0]), x1: Math.max(cs[0][0], cs[1][0]), z0: Math.min(cs[0][1], cs[1][1]), z1: Math.max(cs[0][1], cs[1][1]) };
}

function enclosureOf(zone, h) {
  let best = null;
  for (const it of zone.items) {
    if (it.kind !== 'courtWalls' || !inRect(h.x, h.z, it)) continue;
    const area = (it.x1 - it.x0) * (it.z1 - it.z0);
    if (!best || area < best.area) best = { it, area };
  }
  return best?.it ?? null;
}

function courtGates(zone, court) {
  const byName = new Map(zone.items.filter(i => i.kind === 'gate' && i.name).map(i => [i.name, i]));
  return (court.gates ?? []).map(g => {
    if (g.gate && byName.has(g.gate)) return g.gate && byName.get(g.gate);
    const x = g.side === 'xmin' ? court.x0 : g.side === 'xmax' ? court.x1 : g.at;
    const z = g.side === 's' ? court.z0 : g.side === 'n' ? court.z1 : g.at;
    return { kind: 'gate', name: `${g.side}@${g.at}`, x, z, rot: g.side === 's' || g.side === 'n' ? 0 : 'east' };
  });
}

function pickGate(zone, h, hg, target) {
  const court = enclosureOf(zone, h);
  if (court) {
    const cg = courtGates(zone, court);
    if (cg.length) {
      cg.sort((a, b) => Math.hypot(a.x - target[0], a.z - target[1]) - Math.hypot(b.x - target[0], b.z - target[1]));
      return { gate: cg[0], via: `院落 courtWalls[${court.x0},${court.x1}]×[${court.z0},${court.z1}]` };
    }
  }
  const gates = zone.items.filter(i => i.kind === 'gate' || i.kind === 'cityGate');
  const front = gates.filter(g => (g.x - h.x) * hg.facing[0] + (g.z - h.z) * hg.facing[1] > hg.PD / 2);
  const pool = front.length ? front : gates;
  pool.sort((a, b) => Math.hypot(a.x - target[0], a.z - target[1]) - Math.hypot(b.x - target[0], b.z - target[1]));
  return pool.length ? { gate: pool[0], via: front.length ? '殿正面方向最近的门' : '最近的门' } : null;
}

/** 门外进门段：返回 [起点, (夹道点), 门外点, 门内点]，ix/iz 为指向院内的单位向量 */
function gateLeg(W, gate, toward, plan) {
  const g = gateGeom(gate);
  const [dx, dz] = g.dir;
  const s = (toward[0] - g.x) * dx + (toward[1] - g.z) * dz >= 0 ? 1 : -1;
  const ix = dx * s, iz = dz * s;
  const centerX = g.profile?.portalCenters.reduce((a, b) => Math.abs(a) < Math.abs(b) ? a : b) ?? 0;
  const center = g.profile?.toWorld(centerX, 0) ?? [g.x, g.z];
  const P = (along, lat = 0) => [center[0] + ix * along - iz * lat, center[1] + iz * along + ix * lat];
  const innerDepth = s > 0 ? g.rear : g.front, outerDepth = s > 0 ? g.front : g.rear;
  const inner = P(innerDepth + 2);
  const passage = g.profile ? g.profile.ramps.flatMap(r => [r.zToe, r.zTop]).sort((a, b) => s * (a - b))
    .map(z => g.profile.toWorld(centerX, z)) : [];
  // 门外实测净空（从门心往外走）
  const probe = walkStraight(W, center, P(-(outerDepth + GATE_OUT + 1)), { feet0: g.platformY });
  const clear = probe.reached >= probe.total - 0.1 ? GATE_OUT + 1 : probe.reached + 0.5 - outerDepth;
  if (clear >= GATE_OUT + 1) return [P(-(outerDepth + GATE_OUT)), ...passage, inner];
  const laneD = outerDepth + Math.max(0.6, clear / 2);       // 夹道中线
  const front = P(-laneD);
  for (const lat of [LANE_SIDE, -LANE_SIDE, LANE_SIDE / 2, -LANE_SIDE / 2]) {
    const st = P(-laneD, lat);
    if (!pointBlocked(W, st[0], st[1]) && legOk(W, st, front)) {
      plan.push(`门外净空 ${clear.toFixed(1)} m → 沿夹道中线横移 ${Math.abs(lat)} m 进门`);
      return [st, front, ...passage, inner];
    }
  }
  plan.push(`门外净空 ${clear.toFixed(1)} m，夹道两侧均不可横移，起点取夹道中线`);
  return [front, ...passage, inner];
}

/** p→q 被殿挡住时从侧面绕：返回插入的途经点（不含 p、q）；绕不过返回 null */
function detour(W, halls, p, q, plan) {
  if (legOk(W, p, q)) return [];
  const w = walkStraight(W, p, q);
  const stop = w.end;
  const blockers = halls.filter(h => { const R = hallRect(h); return stop[0] > R.x0 - 2 && stop[0] < R.x1 + 2 && stop[1] > R.z0 - 2 && stop[1] < R.z1 + 2; });
  for (const h of blockers) {
    const R = hallRect(h);
    const alongZ = Math.abs(q[1] - p[1]) >= Math.abs(q[0] - p[0]);
    const opts = alongZ ? [R.x0 - DETOUR_GAP, R.x1 + DETOUR_GAP].sort((a, b) => Math.abs(a - p[0]) - Math.abs(b - p[0])).map(x => [[x, p[1]], [x, q[1]]])
      : [R.z0 - DETOUR_GAP, R.z1 + DETOUR_GAP].sort((a, b) => Math.abs(a - p[1]) - Math.abs(b - p[1])).map(z => [[p[0], z], [q[0], z]]);
    for (const [a, b] of opts) {
      if (legOk(W, p, a) && legOk(W, a, b) && legOk(W, b, q)) { plan.push(`绕「${h.name ?? '殿'}」侧面`); return [a, b]; }
    }
  }
  return null;
}

/**
 * 两个 L 角点都被占据时，试殿台明外侧的三段折线。
 * 每座附近殿只贡献四条候选侧线，不搜索网格；整条候选逐段用真实碰撞验证。
 * 这也能穿过两座错开的殿之间的走廊，而无需把任一被占据的 L 角点当作落脚点。
 */
function sideCorridor(W, halls, p, q, plan) {
  const envelope = { x0: Math.min(p[0], q[0]) - DETOUR_GAP, x1: Math.max(p[0], q[0]) + DETOUR_GAP,
    z0: Math.min(p[1], q[1]) - DETOUR_GAP, z1: Math.max(p[1], q[1]) + DETOUR_GAP };
  const candidates = [];
  const seen = new Set();
  for (const h of halls) {
    const R = hallRect(h);
    if (R.x1 < envelope.x0 || R.x0 > envelope.x1 || R.z1 < envelope.z0 || R.z0 > envelope.z1) continue;
    const mids = [
      ...[R.x0 - DETOUR_GAP, R.x1 + DETOUR_GAP].map(x => [[r1(x), p[1]], [r1(x), q[1]]]),
      ...[R.z0 - DETOUR_GAP, R.z1 + DETOUR_GAP].map(z => [[p[0], r1(z)], [q[0], r1(z)]]),
    ];
    for (const mid of mids) {
      const key = JSON.stringify(mid);
      if (seen.has(key)) continue;
      seen.add(key);
      const pts = [p, ...mid, q];
      const length = pts.slice(1).reduce((sum, point, i) => sum + Math.hypot(point[0] - pts[i][0], point[1] - pts[i][1]), 0);
      candidates.push({ mid, h, length: r1(length), first: Math.hypot(mid[0][0] - p[0], mid[0][1] - p[1]) });
    }
  }
  candidates.sort((a, b) => a.length - b.length || a.first - b.first);
  for (const { mid: [a, b], h } of candidates) {
    if (legOk(W, p, a) && legOk(W, a, b) && legOk(W, b, q)) {
      plan.push(`沿「${h.name ?? '殿'}」台明外侧三段绕行`);
      return [a, b];
    }
  }
  return null;
}

/** 后殿殿前被前殿（backDoor）占据：穿前殿。返回从前殿殿前到后殿殿内的途经点 */
function throughFrontHall(H2, target, targetInside, plan) {
  const g = hallGeom(H2);
  const tw = Math.min(g.bay * 1.4, 5);
  const lat = H2.throne ? tw / 2 + 1.2 : 0;           // 宝座半宽 + 玩家半径 + 余量
  const f = g.toW(g.doorX, -(g.PD / 2 + g.run + HALL_FRONT));
  const in0 = g.toW(g.doorX, -(g.d / 2 - 1)), in0s = g.toW(g.doorX + lat, -(g.d / 2 - 1));
  const in1s = g.toW(g.doorX + lat, g.d / 2 - 1), in1 = g.toW(g.doorX, g.d / 2 - 1);
  const tg = hallGeom(target);
  const tDoor = tg.toW(tg.doorX, -(tg.d / 2 + 0.5));
  plan.push(`殿前被「${H2.name}」占据（工字殿）→ 穿「${H2.name}」前门进、绕宝座 ${lat.toFixed(1)} m、后门出`);
  return { front: f, pts: [in0, ...(lat ? [in0s, in1s] : []), in1, [tDoor[0], in1[1]], tDoor, targetInside] };
}

/**
 * 去掉短段：中间点离上一保留点 < MIN_LEG 时，若"上一保留点 → 下一点"直线可走则删掉它。
 * 原因：fps=10 快走一帧约 1 m，带惯性的控制器在 ≤1 m 的折线段上会来回过冲、被"卡住"判据误判（生成算法问题，非场景缺陷）。
 */
export const MIN_LEG = 2.5;
function simplify(W, pts) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i], prev = out[out.length - 1];
    const last = i === pts.length - 1;
    if (Math.hypot(p[0] - prev[0], p[1] - prev[1]) < 0.3) continue;
    if (!last && Math.hypot(p[0] - prev[0], p[1] - prev[1]) < MIN_LEG && legOk(W, prev, pts[i + 1])) continue;
    out.push(p);
  }
  return out;
}

export function zoneRoutes(W, zone) {
  const out = [];
  const halls = zone.items.filter(i => i.kind === 'hall');
  for (const h of halls) {
    if (!h.name || h.open || h.enter !== true) continue;
    const plan = [];
    const hg = hallGeom(h);
    let hallFront = hg.toW(hg.doorX, -(hg.PD / 2 + hg.run + HALL_FRONT));
    const inside = hg.toW(hg.doorX, -(hg.d / 2 - 1));
    let tail = [hallFront, inside];
    // 工字殿：殿前点落在另一座殿的台明里
    const H2 = halls.find(o => o !== h && inRect(hallFront[0], hallFront[1], hallRect(o), -0.5));
    if (H2) {
      if (H2.enter === true && H2.backDoor) { const t = throughFrontHall(H2, h, inside, plan); hallFront = t.front; tail = [t.front, ...t.pts]; }
      else plan.push(`殿前被「${H2.name ?? '殿'}」占据且其无后门`);
    }
    const pick = pickGate(zone, h, hg, hallFront);
    if (!pick) continue;
    const leg = gateLeg(W, pick.gate, hallFront, plan);
    const inner = leg[leg.length - 1];
    // 门内 → 殿前：先沿门通行方向对齐，再横移（L 形），各段被殿挡住时侧绕
    const g = gateGeom(pick.gate);
    const gateAlongZ = Math.abs(g.dir[1]) >= Math.abs(g.dir[0]);
    const planMid = (to) => {
      const corner = gateAlongZ ? [inner[0], to[1]] : [to[0], inner[1]];
      const alt = gateAlongZ ? [to[0], inner[1]] : [inner[0], to[1]];
      for (const c of [alt, corner]) {
        const candidatePlan = [];
        const d1 = detour(W, halls, inner, c, candidatePlan), d2 = d1 && detour(W, halls, c, to, candidatePlan);
        if (d1 && d2) { plan.push(...candidatePlan); return { mid: [...d1, c, ...d2], alt }; }
      }
      return { mid: sideCorridor(W, halls, inner, to, plan), alt };
    };
    let { mid, alt } = planMid(hallFront);
    // 工字殿两殿台明不相接（中间留空地，如武英殿/敬思殿）：门内→殿前被带后门的前殿挡住且无法侧绕时，同样穿前殿
    if (!mid && !H2) {
      const B = halls.find(o => o !== h && o.enter === true && o.backDoor && segHitsRect(inner, hallFront, hallRect(o)));
      if (B) {
        const t = throughFrontHall(B, h, inside, plan);
        const r = planMid(t.front);
        if (r.mid) { mid = r.mid; tail = [t.front, ...t.pts]; }
      }
    }
    if (!mid) { plan.push('门内→殿前直线/侧绕均受阻（交由浏览器步行判定）'); mid = [alt]; }
    const go = simplify(W, [...leg, ...mid, ...tail]);
    const pts = [...go, ...[...go].reverse().slice(1)].map(([x, z]) => [r1(x), r1(z)]);
    out.push({ name: `[${zone.id}] ${pick.gate.name}→${h.name}→返回`, zone: zone.id, gate: pick.gate.name, hall: h.name, via: pick.via, plan, pts });
  }
  return out;
}

/**
 * 跨区路线（验证 ZoneManager 流式加载/卸载时碰撞不丢）：途经点取自 zone JSON 的门/殿/region。
 *  A. 中轴 → 东六宫 → 宁寿宫 → 回中轴（原路返回）：
 *     乾清门广场 → 内左门 → 东一长街(garden) → 景仁门 → 景仁宫前(east-six) → 出景仁门 → 东二长街
 *     → 奉先门以南通道 → 锡庆门 → 皇极门 → 皇极殿前(ningshou) → 原路回乾清门广场
 *     去程深入宁寿宫后 axis-courts/garden 距离 > 60 m 被卸载，回程重新加载 —— 正是要验证的场景。
 *  B. 中轴 → 景运门 → 锡庆门 → 宁寿宫皇极殿 → 回中轴（不经东六宫的短线）
 */
export function crossRoutes(W, zones) {
  const Z = Object.fromEntries(zones.map(z => [z.id, z]));
  const item = (zid, name, kind) => Z[zid]?.items.find(i => i.name === name && (!kind || i.kind === kind));
  const nz = item('axis-courts', '内左门'), jy = item('axis-courts', '景运门');
  const jr = item('east-six', '景仁门'), jrg = item('east-six', '景仁宫', 'hall'), fx = item('east-six', '奉先门');
  const street1 = item('garden', '东一长街', 'region'), street2 = item('east-six', '东二长街', 'region');
  const xq = item('ningshou', '锡庆门'), hj = item('ningshou', '皇极门'), hjd = item('ningshou', '皇极殿', 'hall');
  if (![nz, jy, jr, jrg, fx, street1, street2, xq, hj, hjd].every(Boolean)) return [];
  const front = h => { const g = hallGeom(h); return g.toW(g.doorX, -(g.PD / 2 + g.run + HALL_FRONT)); };
  const xqG = gateGeom(xq), jyG = gateGeom(jy), fxG = gateGeom(fx);
  const s1x = (street1.x0 + street1.x1) / 2, s2x = (street2.x0 + street2.x1) / 2;
  const southOfCourts = fx.z - fxG.half - 6;
  const tongziX = xq.x + xqG.half + 6;
  const ningshouIn = [[tongziX, xq.z], [xq.x - xqG.half - 3, xq.z], [hj.x, xq.z], [hj.x, hj.z + 8], front(hjd)];
  const jf = front(jrg);
  const A = [
    [nz.x, nz.z - 20], [nz.x, nz.z + 6], [s1x, nz.z + 6], [s1x, jr.z - 6],
    [jr.x, jr.z - 6], [jr.x, jr.z + 4], [jf[0], jr.z + 4], jf,
    [jf[0], jr.z + 4], [jr.x, jr.z + 4], [jr.x, jr.z - 4],
    [s2x, jr.z - 4], [s2x, southOfCourts], [tongziX, southOfCourts], ...ningshouIn,
  ];
  const B = [[-80, jy.z], [jy.x - jyG.half - 6, jy.z], [jy.x - jyG.half - 6, xq.z], ...ningshouIn];
  const roundTrip = p => { const s = simplify(W, p); return [...s, ...[...s].reverse().slice(1)].map(([x, z]) => [r1(x), r1(z)]); };
  return [
    { name: '[跨区] 中轴→东六宫景仁宫→宁寿宫皇极殿→回中轴', zone: 'axis-courts→garden→east-six→ningshou→…→axis-courts', plan: [], pts: roundTrip(A) },
    { name: '[跨区] 中轴→景运门→锡庆门→皇极殿→回中轴', zone: 'axis-courts→ningshou→axis-courts', plan: [], pts: roundTrip(B) },
  ];
}

/** 独立覆盖 profile 每条物理门道、两侧坡道；保留坡脚/坡顶点，不做短段简化。 */
export function profileGateRoutes(zones) {
  return zones.flatMap(zone => zone.items.filter(item => item.kind === 'gate' && item.gateProfile).flatMap(item => {
    const { profile: g } = gateGeom(item);
    const front = g.ramps.find(r => r.side === 'front'), rear = g.ramps.find(r => r.side === 'rear');
    return g.portalCenters.map((x, index) => {
      const go = [front.zToe - 2, front.zToe, front.zTop, rear.zTop, rear.zToe, rear.zToe + 2].map(z => g.toWorld(x, z));
      return { name: `[${zone.id}] ${item.name}门道${index + 1}→双侧坡道→返回`, zone: zone.id, gate: item.name,
        gateProfile: item.gateProfile, portalCenter: x, plan: ['按实际门道中心与双侧坡脚/坡顶通行'],
        pts: [...go, ...go.slice(0, -1).reverse()] };
    });
  }));
}

export function buildAutoRoutes(W, zones, { knownIssues = {} } = {}) {
  const routes = [...zones.flatMap(z => zoneRoutes(W, z)), ...crossRoutes(W, zones), ...profileGateRoutes(zones)];
  for (const r of routes) if (knownIssues[r.name]) r.knownIssue = knownIssues[r.name];
  return routes;
}
void collidersIn;
