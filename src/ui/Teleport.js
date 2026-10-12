import * as THREE from 'three';
import { PALACE_LAYOUT } from '../scene/Layout.js';
import { ZONES } from '../../data/zones/index.js';
import { TELEPORT, PLAYER } from '../config/constants.js';

const rotations = { south: 0, north: Math.PI, east: Math.PI / 2, west: -Math.PI / 2 };

export class Teleport {
  constructor(controls, zoneManager, collisionManager) {
    this.controls = controls;
    this.zoneManager = zoneManager;
    this.collisionManager = collisionManager;
    this.targets = new Map();
    for (const item of PALACE_LAYOUT) {
      if (!['palace', 'gate', 'garden'].includes(item.type)) continue;
      this.targets.set(item.name, { name: item.name, x: item.position.x, z: item.position.z, d: item.dimensions.depth });
    }
    for (const zone of ZONES) {
      for (const item of zone.items) {
        if (['hall', 'gate', 'cityGate'].includes(item.kind) && item.name) this.targets.set(item.name, item);
      }
    }
    for (const item of zoneManager.getMapItems()) {
      if (item.name && item.kind !== 'corridor' && !this.targets.has(item.name)) this.targets.set(item.name, item);
    }
    this.overlay = document.createElement('div');
    this.overlay.id = 'teleport-overlay';
    this.overlay.setAttribute('role', 'status');
    this.overlay.style.cssText = 'display:none;position:fixed;left:50%;top:25%;transform:translateX(-50%);padding:16px 24px;background:#251c16e8;color:#ffd764;border-radius:8px;z-index:2000;pointer-events:none';
    document.body.appendChild(this.overlay);
  }

  /** 目标几何：中心、朝外法线 (ox, oz)、正面中点、门平面切向、半宽。 */
  geometryFor(name) {
    const target = this.targets.get(name);
    if (!target) throw new Error(`未知传送目标：${name}`);
    const rot = typeof target.rot === 'number' ? target.rot : rotations[target.rot ?? 'south'];
    const mapItem = this.zoneManager.getMapItems().find(item => item.name === name);
    const sideways = Math.abs(Math.sin(rot)) > 0.5;
    const depth = target.d ?? (mapItem ? (sideways ? mapItem.w : mapItem.d) : 0);
    const width = target.w ?? (mapItem ? (sideways ? mapItem.d : mapItem.w) : 0) ?? 0;
    const ox = -Math.sin(rot), oz = -Math.cos(rot);
    return { name, cx: target.x, cz: target.z, ox, oz, tx: -oz, tz: ox, half: depth / 2, width,
      frontX: target.x + ox * depth / 2, frontZ: target.z + oz * depth / 2 };
  }

  /** 门外 dist 米、沿门平面横移 lateral 米的候选点（朝向始终指向建筑中心）。 */
  candidate(g, dist, lateral) {
    return { name: g.name, x: g.cx + g.ox * (g.half + dist) + g.tx * lateral, z: g.cz + g.oz * (g.half + dist) + g.tz * lateral,
      lookAtX: g.cx, lookAtZ: g.cz, distance: dist, lateral };
  }

  /** 首选点（严格门外 DOOR_DISTANCE，不做搜索），供测试/调试对照。 */
  landingFor(name) {
    return this.candidate(this.geometryFor(name), TELEPORT.DOOR_DISTANCE, 0);
  }

  /**
   * 安全检查：脚下即地面、半径 0.5 m 内无碰撞体、朝正面中点能走 ≥ MIN_WALK m
   * 或走到离正面 ≤ NEAR_FRONT m（同侧、视线不被墙隔断）。
   */
  isSafe(p, g) {
    const cm = this.collisionManager;
    const ground = cm.getGroundHeight(p.x, p.z, Infinity);
    const eye = new THREE.Vector3(p.x, ground + PLAYER.HEIGHT, p.z);
    if (cm.checkCollision(eye, 0.5)) return false;
    const dx = g.frontX - p.x, dz = g.frontZ - p.z;
    const toFront = Math.hypot(dx, dz);
    if (toFront < 1e-3) return false;
    const walk = Math.min(TELEPORT.PROBE_WALK, toFront);
    const goal = new THREE.Vector3(p.x + dx / toFront * walk, eye.y, p.z + dz / toFront * walk);
    const end = cm.getValidPosition(eye, goal, 0.5, ground, PLAYER.STEP_UP);
    // 只计朝正面方向的有效位移（排除沿墙滑行）
    const progressed = (end.x - p.x) * dx / toFront + (end.z - p.z) * dz / toFront;
    const remain = Math.hypot(g.frontX - end.x, g.frontZ - end.z);
    p.y = ground;
    p.walk = +progressed.toFixed(2);
    if (!(progressed >= TELEPORT.MIN_WALK || remain <= TELEPORT.NEAR_FRONT)) return false;
    return this.lineOfSight(p, g);
  }

  /**
   * 视线检查：落点到建筑正面的直线上（止于正面前 LOS_STOP m）不得有碰撞体，
   * 保证落点与门在同一侧、不隔墙（例如窄长街外退时落进对面院子）。
   */
  lineOfSight(p, g) {
    const cm = this.collisionManager;
    const dx = g.frontX - p.x, dz = g.frontZ - p.z;
    const len = Math.hypot(dx, dz) - TELEPORT.LOS_STOP;
    const v = new THREE.Vector3();
    for (let s = 0.25; s < len; s += 0.25) {
      const x = p.x + dx / (len + TELEPORT.LOS_STOP) * s, z = p.z + dz / (len + TELEPORT.LOS_STOP) * s;
      v.set(x, cm.getGroundHeight(x, z, Infinity) + PLAYER.HEIGHT, z);
      if (cm.checkCollision(v, 0.1)) return false;
    }
    return true;
  }

  /**
   * 落点搜索（总控批准 10-12）：8 m → 朝建筑每 0.25 m 前移至 6 m → 10 m、12 m；
   * 每个距离再沿门平面横移，|横移| ≤ min(门宽/2, 6 m)。返回首个安全点，全部失败返回 null。
   */
  resolveLanding(name) {
    const g = this.geometryFor(name);
    const D = TELEPORT.DOOR_DISTANCE;
    const dists = [];
    for (let d = D; d >= D - TELEPORT.MAX_ADVANCE - 1e-6; d -= TELEPORT.ADVANCE_STEP) dists.push(+d.toFixed(2));
    dists.push(...TELEPORT.FAR_DISTANCES);
    // 窄长街（如东西六宫宫门前街宽仅 ~7 m）：门外 6 m 以上已越过对街院墙，最后再在街内由近到远尝试
    for (let d = D - TELEPORT.MAX_ADVANCE - TELEPORT.ADVANCE_STEP; d >= TELEPORT.MIN_DISTANCE - 1e-6; d -= TELEPORT.ADVANCE_STEP) dists.push(+d.toFixed(2));
    const maxLat = Math.min(g.width > 0 ? g.width / 2 : TELEPORT.MAX_LATERAL, TELEPORT.MAX_LATERAL);
    const lats = [0];
    for (let l = TELEPORT.LATERAL_STEP; l <= maxLat + 1e-6; l += TELEPORT.LATERAL_STEP) lats.push(l, -l);
    for (const lat of lats) {
      for (const d of dists) {
        const p = this.candidate(g, d, lat);
        if (this.isSafe(p, g)) return { ...p, fallback: d !== D || lat !== 0 };
      }
    }
    return null;
  }

  go(name) {
    const g = this.geometryFor(name);
    this.overlay.textContent = `前往 ${name}…`;
    this.overlay.style.display = 'block';
    clearTimeout(this.overlayTimer);
    this.overlayTimer = setTimeout(() => { this.overlay.style.display = 'none'; }, TELEPORT.OVERLAY_MS);
    // 建筑所在区与门外落点所在区都同步加载（门外可能不属于任何区）
    this.zoneManager.ensureLoadedAt(g.cx, g.cz);
    const guess = this.landingFor(name);
    this.zoneManager.ensureLoadedAt(guess.x, guess.z);
    const point = this.resolveLanding(name);
    if (!point) {
      this.overlay.textContent = `${name}门前受阻，暂不能传送`;
      return null;
    }
    this.controls.teleportTo(point.x, point.z, point.lookAtX, point.lookAtZ);
    this.zoneManager.update(this.controls.getPosition());
    this.lastPoint = { ...point, y: this.controls.getFeetY(), zone: this.zoneManager.getCurrentId() };
    return this.lastPoint;
  }

  dispose() {
    clearTimeout(this.overlayTimer);
    this.overlay.remove();
  }
}
