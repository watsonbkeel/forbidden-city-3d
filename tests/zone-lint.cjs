/**
 * zone-lint.cjs - 校验 data/zones/*.json 符合 schema
 * 
 * 检查项：
 * 1. 必需字段：id, name, bounds, neighbors, items
 * 2. bounds 格式：{ minX, maxX, minZ, maxZ }
 * 3. items 中的 kind 必须是已知类型
 * 4. 所有 item 的坐标落在 bounds 内
 * 5. wall gaps 引用的 gate 存在
 * 6. id 不重复
 * —— P1-T 增强（T-3）——
 * 7. 区间关系：bounds 正面积重叠 = 错误；相邻区（neighbors 互指或 30 m 内相对）之间的缝隙 = 警告；
 *    neighbors 引用不存在的区 = 错误；neighbors 单向 = 警告
 * 8. 门洞两侧通行（P0c-2「院门外 4 m 被对面墙封死」）：用真实 ZoneBase/CourtKit + 中轴静态场景在 node 里
 *    建出全部碰撞体，对每座 gate/cityGate 两侧：
 *    - 门洞中心被其他碰撞体占据 = 错误
 *    - 出门方向净空 < GATE_CLEAR_ERR(1.5 m，玩家直径 1 + 余量) = 错误；< 4 m = 警告（列出挡路构件）
 *    - 出门后 12 m 内是封闭死角（BFS 走不出 12 m 半径，不许退回门内）= 错误
 * 9. enter:true 的 hall：门（明间，含 backDoor 后门）台阶外 2 m × 门洞宽 内有其他构件的碰撞体 = 错误；
 *    从门前 2 m 走进殿内 1 m 失败 = 错误
 *
 * 用法：node tests/zone-lint.cjs [--no-geo]   （--no-geo 只跑 1–7，不建碰撞世界）
 *       ZONES_DIR=<目录> 可指向另一份 zone JSON（破坏实验用）
 */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ZONES_DIR = process.env.ZONES_DIR ? path.resolve(process.env.ZONES_DIR) : path.join(__dirname, '../data/zones');
const NEIGHBOR_GAP_MAX = 30;   // 两区相对且距离 ≤ 此值视为"相邻"，用于缝隙警告
const GATE_SCAN = 4;           // 门外扫描深度（m）
const GATE_CLEAR_ERR = 1.5;    // 门外净空低于此值 = 封死
const GATE_POCKET_R = 12;      // 门外 BFS 半径
const HALL_FRONT = 2;          // 殿门前净空（m）
const KNOWN_KINDS = new Set([
  'gate', 'wall', 'courtWalls', 'hall', 'corridor', 
  'cityGate', 'region', 'nineDragonWall'
]);

const REQUIRED_FIELDS = {
  zone: ['id', 'name', 'bounds', 'neighbors', 'items'],
  bounds: [], // 支持两种格式：minX/maxX/minZ/maxZ 或 x0/x1/z0/z1
};

let errors = 0;
let warnings = 0;

function error(msg) {
  console.error(`❌ ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`⚠️  ${msg}`);
  warnings++;
}

function info(msg) {
  console.log(`ℹ️  ${msg}`);
}

function checkBounds(bounds, zoneId) {
  // 支持两种格式：minX/maxX/minZ/maxZ 或 x0/x1/z0/z1
  const hasMinMax = 'minX' in bounds && 'maxX' in bounds && 'minZ' in bounds && 'maxZ' in bounds;
  const hasX0X1 = 'x0' in bounds && 'x1' in bounds && 'z0' in bounds && 'z1' in bounds;
  
  if (!hasMinMax && !hasX0X1) {
    error(`${zoneId}: bounds 缺少必需字段（需要 minX/maxX/minZ/maxZ 或 x0/x1/z0/z1）`);
    return;
  }
  
  let minX, maxX, minZ, maxZ;
  if (hasMinMax) {
    minX = bounds.minX;
    maxX = bounds.maxX;
    minZ = bounds.minZ;
    maxZ = bounds.maxZ;
  } else {
    minX = bounds.x0;
    maxX = bounds.x1;
    minZ = bounds.z0;
    maxZ = bounds.z1;
  }
  
  if (typeof minX !== 'number' || typeof maxX !== 'number' || 
      typeof minZ !== 'number' || typeof maxZ !== 'number') {
    error(`${zoneId}: bounds 字段非数值`);
    return;
  }
  
  if (minX >= maxX) {
    error(`${zoneId}: bounds minX >= maxX (或 x0 >= x1)`);
  }
  if (minZ >= maxZ) {
    error(`${zoneId}: bounds minZ >= maxZ (或 z0 >= z1)`);
  }
}

function getItemPos(item) {
  // 提取 item 的位置（可能是 x/z、pos、at 等）
  if (item.x !== undefined && item.z !== undefined) {
    return { x: item.x, z: item.z };
  }
  if (item.pos && Array.isArray(item.pos)) {
    return { x: item.pos[0], z: item.pos[2] ?? item.pos[1] };
  }
  if (item.at !== undefined) {
    // wall 的 at 是 z 坐标，x 由 line 决定
    return null; // wall 单独处理
  }
  return null;
}

function checkItemInBounds(item, idx, bounds, zoneId) {
  const pos = getItemPos(item);
  if (!pos) return; // wall 等特殊 kind 跳过
  
  const { x, z } = pos;
  
  // 支持两种 bounds 格式
  const minX = bounds.minX ?? bounds.x0;
  const maxX = bounds.maxX ?? bounds.x1;
  const minZ = bounds.minZ ?? bounds.z0;
  const maxZ = bounds.maxZ ?? bounds.z1;
  
  const margin = 5; // 允许 5m 余量
  
  if (x < minX - margin || x > maxX + margin || z < minZ - margin || z > maxZ + margin) {
    warn(`${zoneId}: items[${idx}] (${item.kind}) 位置 [${x},${z}] 超出 bounds (余量 ${margin}m)`);
  }
}

function checkWallGaps(item, idx, gateNames, zoneId) {
  if (item.kind !== 'wall' || !item.gaps) return;
  
  for (let i = 0; i < item.gaps.length; i++) {
    const gap = item.gaps[i];
    if (gap.gate && !gateNames.has(gap.gate)) {
      error(`${zoneId}: items[${idx}].gaps[${i}] 引用未知 gate "${gap.gate}"`);
    }
    if (gap.gate && gap.w !== undefined) {
      warn(`${zoneId}: items[${idx}].gaps[${i}] 同时有 gate 和 w，w 会被忽略`);
    }
  }
}

function lintZone(filePath) {
  const zoneId = path.basename(filePath, '.json');
  let zone;
  
  try {
    zone = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    error(`${zoneId}: JSON 解析失败 - ${e.message}`);
    return null;
  }
  
  // 检查必需字段
  for (const field of REQUIRED_FIELDS.zone) {
    if (zone[field] === undefined) {
      error(`${zoneId}: 缺少字段 ${field}`);
    }
  }
  
  // 检查 bounds
  if (zone.bounds) {
    checkBounds(zone.bounds, zoneId);
  }
  
  // 检查 items
  if (!Array.isArray(zone.items)) {
    error(`${zoneId}: items 不是数组`);
    return zone.id;
  }
  
  const gateNames = new Set();
  
  // 第一遍：收集所有 gate 名称
  zone.items.forEach((item, idx) => {
    if (item.kind === 'gate' && item.name) {
      gateNames.add(item.name);
    }
  });
  
  // 第二遍：检查每个 item
  zone.items.forEach((item, idx) => {
    if (!item.kind) {
      error(`${zoneId}: items[${idx}] 缺少 kind`);
      return;
    }
    
    if (!KNOWN_KINDS.has(item.kind)) {
      error(`${zoneId}: items[${idx}] 未知 kind "${item.kind}"`);
    }
    
    checkItemInBounds(item, idx, zone.bounds, zoneId);
    checkWallGaps(item, idx, gateNames, zoneId);
  });
  
  return zone.id;
}

// ───────────────────────── 7. 区间关系 ─────────────────────────
const normB = b => ({ x0: b.minX ?? b.x0, x1: b.maxX ?? b.x1, z0: b.minZ ?? b.z0, z1: b.maxZ ?? b.z1 });
const r1 = v => Math.round(v * 100) / 100;

function lintZoneRelations(zones) {
  const byId = new Map(zones.map(z => [z.id, z]));
  for (const z of zones) {
    for (const n of z.neighbors ?? []) {
      if (!byId.has(n)) { error(`${z.id}: neighbors 引用不存在的区 "${n}"`); continue; }
      if (!(byId.get(n).neighbors ?? []).includes(z.id)) warn(`${z.id}: neighbors 含 ${n}，但 ${n}.neighbors 不含 ${z.id}（单向）`);
    }
  }
  for (let i = 0; i < zones.length; i++) for (let j = i + 1; j < zones.length; j++) {
    const A = zones[i], B = zones[j];
    if (!A.bounds || !B.bounds) continue;
    const a = normB(A.bounds), b = normB(B.bounds);
    const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0); // >0 = x 投影重叠长度，<0 = x 向间距
    const oz = Math.min(a.z1, b.z1) - Math.max(a.z0, b.z0);
    if (ox > 1e-6 && oz > 1e-6) {
      error(`bounds 重叠：${A.id} × ${B.id}，重叠区 x[${r1(Math.max(a.x0, b.x0))}, ${r1(Math.min(a.x1, b.x1))}] z[${r1(Math.max(a.z0, b.z0))}, ${r1(Math.min(a.z1, b.z1))}]（${r1(ox)} × ${r1(oz)} m）`);
      continue;
    }
    const declared = (A.neighbors ?? []).includes(B.id) || (B.neighbors ?? []).includes(A.id);
    // 相对：一个轴向投影有公共段，另一轴向有间距
    let gap = null, axis = null, shared = 0;
    if (ox > 0 && oz < 0) { gap = -oz; axis = 'z'; shared = ox; }
    else if (oz > 0 && ox < 0) { gap = -ox; axis = 'x'; shared = oz; }
    if (gap !== null && gap > 1e-6 && (declared || gap <= NEIGHBOR_GAP_MAX)) {
      warn(`bounds 缝隙：${A.id} ↔ ${B.id} 沿 ${axis} 相距 ${r1(gap)} m（公共边段 ${r1(shared)} m${declared ? '，互为 neighbors' : ''}）——缝隙内的街巷不属于任何区，进入时不会触发分区加载`);
    }
  }
}

// ───────────────────────── 8/9. 几何检查（碰撞世界） ─────────────────────────
async function lintGeometry(zoneFiles) {
  const L = await import(pathToFileURL(path.join(__dirname, 'lib/world.mjs')).href);
  const t0 = Date.now();
  const W = await L.buildWorld({ zones: zoneFiles });
  console.log(`\n几何检查：碰撞体 ${W.cm.colliders.length}、可行走面 ${W.cm.walkables.length}（${zoneFiles.length} 区 + 中轴静态场景，${Date.now() - t0} ms）`);
  const blockersIn = (x0, z0, x1, z1, self) => [...new Set(L.collidersIn(W, x0, z0, x1, z1).filter(c => W.ownerOf(c).item !== self).map(c => L.describeOwner(W.ownerOf(c))))];
  const name = g => `${g.zone}: ${g.item.kind}「${g.item.name ?? '?'}」(${g.item.x}, ${g.item.z})`;
  const sideName = (dir, s) => {
    const [dx, dz] = [dir[0] * s, dir[1] * s];
    return Math.abs(dz) >= Math.abs(dx) ? (dz > 0 ? '北侧' : '南侧') : (dx < 0 ? '东侧' : '西侧');
  };

  // 8. 门洞两侧
  let gateChecked = 0;
  for (const g of W.gates) {
    if (L.pointBlocked(W, g.x, g.z, g.platformY)) {
      error(`${name(g)} 门洞中心被碰撞体占据：${blockersIn(g.x - 0.5, g.z - 0.5, g.x + 0.5, g.z + 0.5, g.item).join('；')}`);
      continue;
    }
    gateChecked++;
    for (const s of [-1, 1]) {
      const [dx, dz] = [g.dir[0] * s, g.dir[1] * s];
      const px = -dz, pz = dx; // 横向
      const end = [g.x + dx * (g.half + GATE_SCAN), g.z + dz * (g.half + GATE_SCAN)];
      const w = L.walkStraight(W, [g.x, g.z], end, { feet0: g.platformY });
      const clear = w.reached >= w.total - 0.1 ? GATE_SCAN : Math.max(0, w.reached + 0.5 - g.half);
      const where = `${name(g)} ${sideName(g.dir, s)}`;
      if (clear < GATE_SCAN) {
        const a = g.half, b = Math.min(g.half + GATE_SCAN, w.reached + 0.9);
        const P = (al, la) => [g.x + dx * al + px * la, g.z + dz * al + pz * la];
        const [c0, c1] = [P(a, -0.5), P(b, 0.5)];
        const who = blockersIn(c0[0], c0[1], c1[0], c1[1], g.item);
        (clear < GATE_CLEAR_ERR ? error : warn)(`${where} 出门净空 ${clear.toFixed(1)} m（< ${clear < GATE_CLEAR_ERR ? GATE_CLEAR_ERR + ' m，被封死' : GATE_SCAN + ' m'}），挡路：${who.join('；') || '（台基/地形）'}`);
        if (clear < GATE_CLEAR_ERR) continue;
      }
      // 出门 0.7 m 处起 BFS，不许退回门内（沿出门方向的投影 < 门体半进深的格子禁止）
      const st = [g.x + dx * (g.half + 0.7), g.z + dz * (g.half + 0.7)];
      const forbid = (x, z) => (x - g.x) * dx + (z - g.z) * dz < g.half;
      const r = L.reachFrom(W, st, [g.x, g.z], GATE_POCKET_R + g.half, forbid);
      if (r.blockedStart) error(`${where} 出门 0.7 m 处即被挡（站不下玩家）`);
      else if (r.maxDist < GATE_POCKET_R + g.half) error(`${where} 门外是封闭死角：${GATE_POCKET_R} m 内走不出去（最远 ${r.maxDist} m，可达 ${r.cells} 格）`);
    }
  }

  // 9. enter:true 殿门前
  let hallChecked = 0;
  for (const h of W.halls) {
    if (h.item.enter !== true || h.item.open) continue;
    hallChecked++;
    const g = h.g;
    if (g.profile) {
      // The center of this approach is a solid carved strip. Probe both real
      // side flights, through the terrace turn and the single lower doorway.
      for (const approach of Object.values(g.profile.approaches)) {
        let feet = approach.worldPoints[0].y;
        const points = approach.worldPoints;
        for (let i = 1; i < points.length; i++) {
          const from = points[i - 1], to = points[i];
          const result = L.walkStraight(W, [from.x, from.z], [to.x, to.z], { feet0: feet });
          if (result.reached < result.total - 0.3) {
            error(`${h.zone}: hall「${h.item.name}」${approach.side} ${from.kind}→${to.kind} 受阻：${JSON.stringify(result)}`);
            break;
          }
          feet = result.feet;
        }
      }
      continue;
    }
    const doorHalf = (g.bay - 2 * g.r) / 2;
    const faces = [[-1, '前门']];
    if (g.backDoor) faces.push([1, '后门']);
    for (const [side, label] of faces) {
      const z0 = side * (g.PD / 2 + g.run);            // 台阶外沿（局部 z）
      const z1 = side * (g.PD / 2 + g.run + HALL_FRONT);
      const c0 = g.toW(g.doorX - doorHalf, z0), c1 = g.toW(g.doorX + doorHalf, z1);
      const who = blockersIn(c0[0], c0[1], c1[0], c1[1], h.item);
      const where = `${h.zone}: hall「${h.item.name ?? '?'}」(${h.item.x}, ${h.item.z}) ${label}`;
      // 门洞中线 + 两侧车道（±(门洞半宽 − 玩家半径 − 0.05)）从门前 2 m 实走进殿内 1 m
      // 判定：中线走不进 = 错误；中线可走但 2 m 内有其他构件（如工字殿前后殿台明相接）= 警告
      const lane = Math.max(0, doorHalf - 0.55);
      const walk = lx => {
        const from = g.toW(g.doorX + lx, side * (g.PD / 2 + g.run + HALL_FRONT));
        const into = g.toW(g.doorX + lx, side * (g.d / 2 - 1));
        const w = L.walkStraight(W, from, into);
        return w.reached >= w.total - 0.3 ? null : `车道 ${lx >= 0 ? '+' : ''}${lx.toFixed(1)}：${w.reached < 0 ? '起点即在碰撞体内' : `走了 ${w.reached}/${w.total} m 停在 ${JSON.stringify(w.end)}`}`;
      };
      const mid = walk(0);
      const sides = [walk(-lane), walk(lane)].filter(Boolean);
      const box = `门前 ${HALL_FRONT} m（门洞宽 ${(2 * doorHalf).toFixed(1)} m）`;
      if (mid) error(`${where} 从门前 ${HALL_FRONT} m 沿中线走不进殿内（${mid}）${who.length ? `；${box}内有：${who.join('；')}` : ''}`);
      else if (who.length) warn(`${where} ${box}内有其他构件：${who.join('；')}；中线可走进殿${sides.length ? `，侧车道受阻（${sides.join('；')}）` : '，两侧车道亦通'}`);
    }
  }
  console.log(`几何检查完成：门 ${gateChecked}/${W.gates.length}（×2 侧）、enter 殿 ${hallChecked}`);
}

// 主流程
(async () => {
const files = fs.readdirSync(ZONES_DIR).filter(f => f.endsWith('.json')).sort();

if (files.length === 0) {
  error('data/zones/ 目录下没有 JSON 文件');
  process.exit(1);
}

console.log(`检查 ${files.length} 个 zone 文件...\n`);

const ids = new Set();
const duplicates = [];

files.forEach(file => {
  const filePath = path.join(ZONES_DIR, file);
  const id = lintZone(filePath);
  
  if (id) {
    if (ids.has(id)) {
      duplicates.push(id);
    }
    ids.add(id);
  }
});

if (duplicates.length > 0) {
  error(`重复的 zone id: ${duplicates.join(', ')}`);
}

const parsed = [];
for (const f of files) { try { parsed.push({ file: f, json: JSON.parse(fs.readFileSync(path.join(ZONES_DIR, f), 'utf-8')) }); } catch {} }
lintZoneRelations(parsed.map(p => p.json));
if (!process.argv.includes('--no-geo') && errors === 0) await lintGeometry(parsed);
else if (errors) console.log('\n（schema 有错误，跳过几何检查）');

console.log(`\n检查完成：${files.length} 个文件`);
console.log(`❌ 错误: ${errors}`);
console.log(`⚠️  警告: ${warnings}`);

process.exit(errors > 0 ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
