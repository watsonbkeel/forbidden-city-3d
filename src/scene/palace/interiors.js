import * as THREE from 'three';

/**
 * 可复用的室内陈设预设（简化几何，按材质合并后几乎不增加绘制调用）。
 *
 * 每个预设只依赖"房间矩形 + 门的位置"，任何殿座 / 庑房都能套用：
 *   room = { x0, x1, z0, z1, y, h, doorX }   —— 局部坐标，z0 为门所在的前檐，z1 为后檐
 * 约定：门口 1.6m 纵深、门两侧各 0.9m 内不放东西，保证进得去。
 *
 * 返回 { cover: [{x,z}], spawns: [{x,z}] }（局部坐标），供后续玩法（掩体、刷怪点、巡逻点）使用。
 *
 * 新增房型：在 PRESETS 里加一个函数即可，签名 (put, room, rng) => void。
 *   put(w, d, h, xc, zc, mat, { y, cover }) 放一个盒子家具：自动登记碰撞，h ≥ 0.9 的自动登记为掩体。
 */

export const INTERIOR_KINDS = ['hall', 'room', 'storage', 'empty', 'palace-front', 'gate-hall', 'study', 'bedroom'];

// A 档（P1-I）共享装饰材质：模块级单例，所有分区共用，不随分区卸载释放（只有 4 个材质）
let _decoMats = null;
function decoMaterials() {
  if (!_decoMats) {
    const mk = (name, props) => new THREE.MeshStandardMaterial({ name, ...props });
    _decoMats = {
      goldBrick: mk('kit_gold_brick', { color: 0x2b2d2e, roughness: 0.35, metalness: 0.05 }),   // 金砖（苏州御窑）
      silk: mk('kit_silk', { color: 0xc8a24a, roughness: 0.75, metalness: 0.0 }),                // 屏风/帐幔
      plaque: mk('kit_plaque', { color: 0x1d2a44, roughness: 0.5, metalness: 0.1 }),             // 殿内横匾（青底）
      bronze: mk('kit_bronze', { color: 0x4a3b28, roughness: 0.45, metalness: 0.7 }),            // 香亭/仙鹤/熏炉
      pearl: mk('kit_pearl', { color: 0xdddddd, roughness: 0.08, metalness: 1.0 }),              // 轩辕镜
      // 藻井斗层（开口圆台，需双面）
      caissonRed: mk('kit_caisson_red', { color: 0x7a1d12, roughness: 0.4, metalness: 0.1, side: THREE.DoubleSide }),
      caissonGold: mk('kit_caisson_gold', { color: 0xe2b048, roughness: 0.28, metalness: 0.8, side: THREE.DoubleSide }),
    };
  }
  return _decoMats;
}

/**
 * A 档公共件：三层宝座台（含三级踏跺）+ 宝座 + 屏风 + 殿内横匾 + 简化八角藻井。
 * 宝座台正中后檐；踏跺朝门；台前到门口的中线（|x−doorX| < 1.6）始终留空，保证 1.6 m 门道贯通。
 */
function throneSet(put, deco, r, { platW, platD, back = 0.9 }) {
  const cx = (r.x0 + r.x1) / 2;
  const zc = r.z1 - platD / 2 - back;
  // 三层地平床（0.2 + 0.4 + 顶层 0.22 ≈ 0.6 m）：底层矮于 0.36 可跨，第二层起登记一个整体碰撞
  put(platW, platD, 0.2, cx, zc, 'lacquer', { cover: false });
  put(platW * 0.92, platD * 0.92, 0.4, cx, zc, 'lacquer', { y: 0.2, cover: true });
  deco(new THREE.BoxGeometry(platW * 0.84, 0.22, platD * 0.84), 'lacquer', cx, 0.4 + 0.11, zc);
  deco(new THREE.BoxGeometry(platW * 0.84 + 0.06, 0.05, platD * 0.84 + 0.06), 'gold', cx, 0.62, zc);
  // 三级踏跺（朝门，每级 0.2 高 0.35 深），低于 0.36 的不登记碰撞
  const sw = platW * 0.45;
  for (let k = 0; k < 3; k++) {
    put(sw, 0.35, 0.2 * (k + 1), cx, zc - platD / 2 - 0.35 * (3 - k) + 0.175, 'lacquer', { cover: false });
  }
  // 宝座（座 + 靠背 + 扶手）与屏风
  const ty = 0.6;
  deco(new THREE.BoxGeometry(1.3, 0.55, 1.0), 'gold', cx, ty + 0.275, zc + 0.1);
  deco(new THREE.BoxGeometry(1.4, 1.3, 0.18), 'gold', cx, ty + 0.65 + 0.55, zc + 0.1 + 0.5);
  for (const s of [-1, 1]) deco(new THREE.BoxGeometry(0.14, 0.5, 0.95), 'gold', cx + s * 0.68, ty + 0.55 + 0.25, zc + 0.1);
  const scrW = Math.min(platW * 0.85, 5);
  put(scrW, 0.22, 2.8, cx, zc + platD / 2 - 0.2, 'silk', { y: 0.6, cover: false });
  deco(new THREE.BoxGeometry(scrW + 0.2, 0.3, 0.3), 'gold', cx, 0.6 + 2.8 + 0.15, zc + platD / 2 - 0.2);
  // 殿内横匾（额枋下）
  deco(new THREE.BoxGeometry(Math.min(3.6, platW * 0.6), 0.9, 0.14), 'plaque', cx, r.h - 0.75, r.z1 - 0.12);
  // 简化八角藻井：两层八角斗 + 圆井 + 轩辕镜，位于宝座台前上方
  const cr = Math.min((r.x1 - r.x0) * 0.1, 2.0);
  const cz = zc - platD / 2 - 0.6;
  const outer = new THREE.CylinderGeometry(cr * 0.82, cr, 0.5, 8, 1, true);
  deco(outer, 'caissonRed', cx, r.h - 0.25, cz);
  const inner = new THREE.CylinderGeometry(cr * 0.55, cr * 0.8, 0.45, 8, 1, true);
  deco(inner, 'caissonGold', cx, r.h - 0.22, cz);
  deco(new THREE.CylinderGeometry(cr * 0.55, cr * 0.55, 0.06, 24), 'gold', cx, r.h - 0.03, cz);
  deco(new THREE.SphereGeometry(Math.min(0.28, cr * 0.15), 16, 10), 'pearl', cx, r.h - 0.5, cz);
  return { cx, zc, platW, platD };
}

/** 金砖地面：盖在 kit 的石板地面之上 */
function goldFloor(deco, r) {
  const g = new THREE.PlaneGeometry(r.x1 - r.x0 - 0.1, r.z1 - r.z0 - 0.1);
  g.rotateX(-Math.PI / 2);
  deco(g, 'goldBrick', (r.x0 + r.x1) / 2, 0.035, (r.z0 + r.z1) / 2);
}

/** 殿前陈设一对（香亭 + 仙鹤 简化体），放在宝座台前两侧，不进门道 */
function ornamentPair(put, deco, r, zc, dx) {
  const cx = (r.x0 + r.x1) / 2;
  for (const s of [-1, 1]) {
    const x = cx + s * dx;
    put(0.7, 0.7, 1.0, x, zc, 'bronze', { cover: true });                           // 香亭座
    deco(new THREE.CylinderGeometry(0.25, 0.32, 1.1, 10), 'bronze', x, 1.55, zc);   // 香亭身
    deco(new THREE.ConeGeometry(0.42, 0.5, 8), 'gold', x, 2.35, zc);                // 亭顶
    put(0.5, 0.5, 0.5, x + s * 1.2, zc, 'bronze', { cover: false });                // 仙鹤座
    deco(new THREE.CylinderGeometry(0.08, 0.2, 1.6, 8), 'bronze', x + s * 1.2, 1.3, zc);
  }
}

const PRESETS = {
  /** 大殿（无宝座）：后檐正中长案 + 两把椅子，两侧立柜，两侧条凳 */
  hall(put, r) {
    const W = r.x1 - r.x0, D = r.z1 - r.z0, cx = (r.x0 + r.x1) / 2;
    const tw = Math.min(2.4, W * 0.3);
    put(tw, 0.8, 0.85, cx, r.z1 - 1.0, 'wood');                     // 长案
    put(tw * 0.9, 0.06, 0.06, cx, r.z1 - 0.62, 'gold', { y: 0.86, cover: false });
    for (const s of [-1, 1]) put(0.6, 0.6, 1.1, cx + s * tw * 0.3, r.z1 - 1.9, 'lacquer', { cover: false }); // 椅
    if (W > 7) {
      for (const s of [-1, 1]) {
        put(1.2, 0.55, 2.1, s < 0 ? r.x0 + 0.8 : r.x1 - 0.8, r.z1 - 0.4, 'wood');    // 立柜
        if (D > 5) put(0.5, Math.min(2.4, D * 0.35), 0.48, s < 0 ? r.x0 + 0.4 : r.x1 - 0.4, (r.z0 + r.z1) / 2, 'lacquer'); // 条凳
      }
    }
  },
  /** 居室：后檐一侧炕床，另一侧方桌 + 两凳，角落立柜 */
  room(put, r) {
    const W = r.x1 - r.x0, D = r.z1 - r.z0;
    const right = r.doorX <= (r.x0 + r.x1) / 2; // 炕放在离门远的一侧
    const kw = Math.min(2.6, W * 0.42), kd = Math.min(1.7, D * 0.42);
    const kx = right ? r.x1 - kw / 2 - 0.05 : r.x0 + kw / 2 + 0.05;
    put(kw, kd, 0.62, kx, r.z1 - kd / 2 - 0.05, 'wood');               // 炕
    put(kw * 0.9, kd * 0.85, 0.08, kx, r.z1 - kd / 2 - 0.05, 'cloth', { y: 0.62, cover: false });
    const ox = right ? r.x0 + Math.min(1.1, W * 0.2) : r.x1 - Math.min(1.1, W * 0.2);
    if (W > 4.5) {
      put(0.9, 0.9, 0.8, ox, r.z1 - 1.3, 'wood', { cover: false });   // 方桌
      for (const s of [-1, 1]) put(0.4, 0.4, 0.45, ox + s * 0.75, r.z1 - 1.3, 'lacquer', { cover: false });
    }
    put(1.0, 0.5, 1.9, ox, r.z1 - 0.3, 'wood');                        // 立柜
  },
  /** 库房：沿后墙、侧墙堆放木箱，中间留通道（适合做掩体） */
  storage(put, r, rng) {
    const W = r.x1 - r.x0;
    const n = Math.max(2, Math.floor(W / 1.3));
    for (let i = 0; i < n; i++) {
      const xc = r.x0 + 0.6 + i * ((W - 1.2) / Math.max(1, n - 1));
      if (Math.abs(xc - r.doorX) < 0.9 && r.z1 - r.z0 < 3.2) continue;
      const tall = rng() > 0.45;
      put(1.0, 1.0, 1.0, xc, r.z1 - 0.55, 'crate', { cover: !tall });
      if (tall) put(0.9, 0.9, 0.9, xc + (rng() - 0.5) * 0.1, r.z1 - 0.55, 'crate', { y: 1.0 });
    }
    // 侧墙两只单箱
    for (const s of [-1, 1]) {
      const xc = s < 0 ? r.x0 + 0.55 : r.x1 - 0.55;
      if (Math.abs(xc - r.doorX) > 1.4) put(0.9, 0.9, 0.9, xc, (r.z0 + r.z1) / 2 - 0.2, 'crate');
    }
  },
  empty() {},

  // ───────────── A 档（P1-I）：参数化宝座殿 / 门殿 / 书房 / 寝宫 ─────────────
  // 第 4 个参数 deco(geo, matKey, x, y, z, side)：只放装饰几何（不登记碰撞），y 相对房间地面。

  /** 东西六宫正殿：三层宝座台 + 屏风 + 横匾 + 八角藻井 + 金砖地 + 台前香亭/仙鹤一对；门道中线留空 */
  'palace-front'(put, r, _rng, deco) {
    const W = r.x1 - r.x0, D = r.z1 - r.z0;
    goldFloor(deco, r);
    // 宝座台半宽 ≤ 3.2（< stepwalk KIT_DETOUR_X 3.5），与 kit 自带宝座的绕行常量兼容
    // 进深：台 + 踏跺的碰撞前沿保持在房间中心以北 ≥ 1 m（stepwalk 的六宫路线终点为殿心 −2 m）
    const platW = Math.min(W * 0.3, 6.4), platD = Math.min(D * 0.3, 3.6);
    const t = throneSet(put, deco, r, { platW, platD, back: r.backDoor ? 1.8 : 0.4 });
    // 香亭/仙鹤：宝座台前沿再往前 1.3 m，两侧离中线 ≥ platW/2 + 1.2，确保门道（|x−doorX|<1.6）无物
    const dx = Math.max(platW / 2 + 1.2, 2.8);
    if (W > 2 * dx + 2) ornamentPair(put, deco, r, t.zc - platD / 2 - 1.3, dx);
    // 两山各一组：条案 + 立柜（W≥12 才放）
    if (W >= 12) {
      for (const s of [-1, 1]) {
        const x = s < 0 ? r.x0 + 0.9 : r.x1 - 0.9;
        put(0.6, Math.min(3.0, D * 0.3), 0.85, x, (r.z0 + r.z1) / 2 + 0.5, 'wood');
        put(1.3, 0.55, 2.0, x, r.z1 - 0.45, 'wood');
      }
    }
  },

  /** 门殿（穿堂）：中间贯通，两侧各一排坐凳 + 一对屏门墙；适合 backDoor 殿 */
  'gate-hall'(put, r, _rng, deco) {
    const W = r.x1 - r.x0, D = r.z1 - r.z0, cx = (r.x0 + r.x1) / 2;
    goldFloor(deco, r);
    for (const s of [-1, 1]) {
      const x = cx + s * Math.max(2.2, W * 0.28);
      // 侧屏门：竖向木屏，留出中间 ≥ 3.6 m 的穿行道
      put(0.18, Math.min(2.2, D * 0.35), 2.6, x, (r.z0 + r.z1) / 2, 'silk', { cover: true });
      deco(new THREE.BoxGeometry(0.3, 0.25, Math.min(2.2, D * 0.35) + 0.2), 'gold', x, 2.72, (r.z0 + r.z1) / 2);
      if (W > 9) put(0.5, Math.min(2.6, D * 0.4), 0.48, s < 0 ? r.x0 + 0.45 : r.x1 - 0.45, (r.z0 + r.z1) / 2, 'lacquer');
    }
    deco(new THREE.BoxGeometry(Math.min(3.0, W * 0.4), 0.8, 0.12), 'plaque', cx, r.h - 0.7, r.z1 - 0.1);
  },

  /** 书房：后檐书案 + 圈椅，一侧整面书架（多宝格），另一侧矮榻 + 炕几，角落香几 */
  study(put, r, _rng, deco) {
    const W = r.x1 - r.x0, D = r.z1 - r.z0, cx = (r.x0 + r.x1) / 2;
    const left = r.doorX > cx; // 书架放在离门远的一侧
    const shelfX = left ? r.x0 + 0.3 : r.x1 - 0.3;
    const shelfD = Math.min(D * 0.7, 4.5);
    put(0.5, shelfD, 2.3, shelfX, r.z1 - shelfD / 2 - 0.2, 'wood');                 // 多宝格
    for (let k = 0; k < 4; k++) deco(new THREE.BoxGeometry(0.46, 0.04, shelfD - 0.1), 'lacquer', shelfX, 0.5 + k * 0.5, r.z1 - shelfD / 2 - 0.2);
    const deskW = Math.min(2.0, W * 0.3);
    put(deskW, 0.8, 0.82, cx, r.z1 - 0.9, 'wood');                                   // 书案
    deco(new THREE.BoxGeometry(deskW * 0.5, 0.12, 0.4), 'silk', cx, 0.88, r.z1 - 0.9); // 案上书卷
    put(0.6, 0.6, 1.05, cx, r.z1 - 1.8, 'lacquer', { cover: false });                // 圈椅
    const couchX = left ? r.x1 - 1.2 : r.x0 + 1.2;
    if (W > 5) {
      put(2.0, 1.0, 0.5, couchX, r.z1 - 0.75, 'wood');                               // 矮榻
      deco(new THREE.BoxGeometry(1.85, 0.08, 0.9), 'cloth', couchX, 0.54, r.z1 - 0.75);
      put(0.9, 0.4, 0.3, couchX, r.z1 - 0.75, 'lacquer', { y: 0.5, cover: false });  // 炕几
    }
    const stoolX = left ? r.x1 - 0.5 : r.x0 + 0.5;
    if (Math.abs(stoolX - r.doorX) >= 2.0) {
      put(0.45, 0.45, 0.95, stoolX, r.z0 + 2.0, 'wood');                             // 香几
      deco(new THREE.CylinderGeometry(0.16, 0.14, 0.22, 10), 'bronze', stoolX, 1.06, r.z0 + 2.0);
    }
  },

  /** 寝宫：后檐大床（架子床，有顶盖）+ 床前脚踏，一侧妆台 + 绣墩，另一侧立柜 + 衣架，帐幔 */
  bedroom(put, r, _rng, deco) {
    const W = r.x1 - r.x0, D = r.z1 - r.z0, cx = (r.x0 + r.x1) / 2;
    const left = r.doorX > cx;
    const bw = Math.min(2.4, W * 0.4), bd = Math.min(2.1, D * 0.45);
    const bx = left ? r.x0 + bw / 2 + 0.15 : r.x1 - bw / 2 - 0.15;
    const bz = r.z1 - bd / 2 - 0.15;
    put(bw, bd, 0.55, bx, bz, 'wood', { cover: true });                              // 床身
    deco(new THREE.BoxGeometry(bw - 0.1, 0.12, bd - 0.1), 'cloth', bx, 0.61, bz);    // 褥
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      deco(new THREE.BoxGeometry(0.1, 1.8, 0.1), 'lacquer', bx + sx * (bw / 2 - 0.06), 0.55 + 0.9, bz + sz * (bd / 2 - 0.06)); // 床柱
    }
    deco(new THREE.BoxGeometry(bw + 0.1, 0.12, bd + 0.1), 'lacquer', bx, 2.4, bz);   // 床顶
    deco(new THREE.BoxGeometry(bw - 0.2, 1.7, 0.03), 'silk', bx, 0.55 + 0.95, bz - bd / 2 + 0.02); // 前帐
    put(0.9, 0.35, 0.18, bx, bz - bd / 2 - 0.2, 'wood', { cover: false });           // 脚踏
    const ox = left ? r.x1 - 0.9 : r.x0 + 0.9;
    const sideClear = Math.abs(ox - r.doorX) >= 2.2; // 侧墙件离门中线 ≥ 2.2（0.8 门道 + 0.5 玩家半径 + 件半宽）
    if (W > 5) {
      put(1.1, 0.5, 0.8, ox, r.z1 - 0.4, 'wood');                                    // 妆台
      deco(new THREE.BoxGeometry(0.5, 0.6, 0.05), 'pearl', ox, 1.15, r.z1 - 0.22);   // 镜
      put(0.4, 0.4, 0.45, ox, r.z1 - 1.1, 'cloth', { cover: false });                // 绣墩
      if (sideClear) {
        put(1.0, 0.5, 1.9, ox, (r.z0 + r.z1) / 2 + 0.3, 'wood');                     // 立柜
        put(0.9, 0.25, 1.7, ox, r.z0 + 1.9, 'lacquer');                              // 衣架
      }
    }
    if (W > 8 && sideClear) put(0.5, 0.5, 0.95, left ? r.x1 - 0.5 : r.x0 + 0.5, r.z0 + 1.9, 'wood'); // 角几
  },
};

/**
 * 在 frame f 的局部坐标里布置一个房间。
 * @param kit  CourtKit（提供 mesh / col 与共享材质）
 */
export function furnishRoom(kit, f, kind, room, seed = 1) {
  const preset = PRESETS[kind] ?? PRESETS.empty;
  const cover = [];
  let s = seed >>> 0 || 1;
  const rng = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const mats = { ...decoMaterials(), ...kit.interiorMaterials() };
  const put = (w, d, h, xc, zc, mat, { y = 0, cover: isCover } = {}) => {
    // 保证不越出房间、不堵门口
    w = Math.min(w, room.x1 - room.x0 - 0.1);
    d = Math.min(d, room.z1 - room.z0 - 0.1);
    xc = THREE.MathUtils.clamp(xc, room.x0 + w / 2, room.x1 - w / 2);
    zc = THREE.MathUtils.clamp(zc, room.z0 + d / 2, room.z1 - d / 2);
    const nearDoorX = Math.abs(xc - room.doorX) < w / 2 + 0.9;
    if (nearDoorX && zc - d / 2 < room.z0 + 1.6) return;
    if (nearDoorX && room.backDoor && zc + d / 2 > room.z1 - 1.6) return;
    kit.mesh(f, new THREE.BoxGeometry(w, h, d), mats[mat] ?? mats.wood, xc, room.y + y + h / 2, zc);
    if (y + h > 0.36) kit.col(f, xc - w / 2, room.y + y, zc - d / 2, xc + w / 2, room.y + Math.min(y + h, 3), zc + d / 2);
    if (isCover ?? (y + h >= 0.9)) cover.push({ x: xc, z: zc - d / 2 - 0.6 });
  };
  // 纯装饰件：不登记碰撞、不裁剪；y 相对房间地面
  const deco = (geo, mat, xc, y, zc) => {
    const mesh = kit.mesh(f, geo, mats[mat] ?? mats.wood, xc, room.y + y, zc);
    mesh.castShadow = false;
    return mesh;
  };
  preset(put, room, rng, deco);
  const spawns = [
    { x: (room.x0 + room.x1) / 2, z: (room.z0 + room.z1) / 2 },
    { x: room.doorX, z: room.z0 + 1.0 },
  ];
  return { cover, spawns };
}
