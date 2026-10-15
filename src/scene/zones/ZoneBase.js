import * as THREE from 'three';
import { CourtKit, FACE } from '../palace/kit.js';

/**
 * 分区构建器基类：从 zone JSON 构建一个区域的所有建筑。
 * 
 * 每个 zone 有唯一 id、边界、邻区列表，以及一组构件清单（items）。
 * ZoneBase 按 kind 分发到 CourtKit 对应方法，最终返回合并的 group、碰撞体、
 * 可行走面、房间、地图标注、命名区域、silhouette（远处替身低模）。
 */
export class ZoneBase {
  /**
   * @param {object} library - 材质与贴图库
   * @param {object} zoneJson - zone 数据（含 id, name, bounds, neighbors, items）
   */
  constructor(library, zoneJson) {
    this.library = library;
    this.zoneJson = zoneJson;
    this.kit = new CourtKit(library, zoneJson.id);
    this.group = null;
    /** gate name → 返回的开口宽度（用于 wall gaps 引用） */
    this.gateWidths = new Map();
    this.gateGeometries = new Map();
  }

  /**
   * 构建本区所有构件。
   * @returns {{ group, colliders, walkables, rooms, mapItems, regions, silhouette }}
   */
  build() {
    const items = this.zoneJson.items ?? [];
    
    // 第一遍：构建所有 gate，记录开口宽度
    for (const item of items) {
      if (item.kind === 'gate') {
        const w = this.buildGate(item);
        if (item.name) this.gateWidths.set(item.name, w);
      }
    }
    
    // 第二遍：构建其他构件（wall/courtWalls 可引用 gate 宽度）
    for (const item of items) {
      switch (item.kind) {
        case 'hall':
          this.buildHall(item);
          break;
        case 'gate':
          // 已在第一遍构建
          break;
        case 'wall':
          this.buildWall(item);
          break;
        case 'courtWalls':
          this.buildCourtWalls(item);
          break;
        case 'corridor':
          this.buildCorridor(item);
          break;
        case 'cityGate':
          this.buildCityGate(item);
          break;
        case 'region':
          this.buildRegion(item);
          break;
        case 'nineDragonWall':
          this.buildNineDragonWall(item);
          break;
        default:
          throw new Error(`[ZoneBase] 未知 kind: ${item.kind}`);
      }
    }
    
    // 合并几何
    this.group = this.kit.finish();
    
    // silhouette：本区屋顶的合并低模（Phase 1 优化时实现，当前返回 null）
    // 实在拿不到屋顶网格就先返回 null，不强求改 kit 内部
    const silhouette = null;
    
    return {
      group: this.group,
      colliders: [...this.kit.colliders],
      walkables: [...this.kit.walkables],
      rooms: [...this.kit.rooms],
      mapItems: [...this.kit.mapItems],
      regions: [...this.kit.regions],
      silhouette,
    };
  }

  update(dt) {
    // 当前无动画需求，预留接口
  }

  dispose() {
    if (this.group) {
      this.kit.dispose(this.group);
      this.group.removeFromParent();
      this.group = null;
    }
    this.gateWidths.clear();
    this.gateGeometries.clear();
  }

  // ───────────────────────── 各 kind 构建方法 ─────────────────────────

  buildHall(item) {
    const params = {
      x: item.x,
      z: item.z,
      rot: item.pavilionProfile || item.qinanProfile ? item.rot : this.parseRot(item.rot),
      w: item.w,
      d: item.d,
      pad: item.pad,
      ph: item.ph,
      colH: item.colH,
      roof: item.roof,
      layers: item.layers,
      eaveCount: item.eaveCount,
      storeys: item.storeys,
      lowerStoreyH: item.lowerStoreyH,
      upperStoreyH: item.upperStoreyH,
      structure: item.structure,
      pavilionProfile: item.pavilionProfile,
      qinanProfile: item.qinanProfile,
      interiorFloorWorldY: item.interiorFloorWorldY,
      bays: item.bays,
      roofH: item.roofH,
      roomBays: item.roomBays,
      interior: item.interior,
      brackets: item.brackets,
      enter: item.enter,
      throne: item.throne,
      backDoor: item.backDoor,
      open: item.open,
      name: item.name,
      plaque: item.plaque,
      map: item.map,
    };
    // 过滤 undefined 参数，让 kit 方法使用默认值
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    this.kit.hall(params);
  }

  buildGate(item) {
    const params = {
      x: item.x,
      z: item.z,
      // Dedicated profiles validate their cardinal transform; do not let the
      // permissive legacy parser turn malformed input into a south-facing gate.
      rot: item.gateProfile !== undefined ? item.rot : this.parseRot(item.rot),
      w: item.w,
      h: item.h,
      t: item.t,
      style: item.style,
      gateKind: item.gateKind,
      gateProfile: item.gateProfile,
      open: item.open,
      plaque: item.plaque,
      name: item.name,
      roof: item.roof,
      brackets: item.brackets,
      layers: item.layers,
      eaveCount: item.eaveCount,
    };
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    const width = this.kit.gate(params);
    if (item.gateProfile === 'zhaode') this.gateGeometries.set(item.name, this.kit.root.children.at(-1).userData.gateGeometry);
    return width; // 返回开口宽度
  }

  buildWall(item) {
    const [x1, z1] = item.from;
    const [x2, z2] = item.to;
    const gaps = this.resolveGaps(item.gaps);
    const params = { h: item.h, t: item.t, gaps };
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    this.kit.wall(x1, z1, x2, z2, params);
  }

  buildCourtWalls(item) {
    const gates = (item.gates ?? []).map(g => ({
      side: g.side,
      at: g.at,
      w: g.gate ? this.gateWidths.get(g.gate) : g.w,
    }));
    const params = { h: item.h, t: item.t };
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    this.kit.courtWalls(item.x0, item.x1, item.z0, item.z1, gates, params);
  }

  buildCorridor(item) {
    let from = item.from, to = item.to, contact;
    if (item.gateJoin !== undefined) {
      const ref = item.gateJoin;
      const g = ref && this.gateGeometries.get(ref.gate);
      if (!g || g.profile !== 'zhaode' || g.rot !== 0 || !Object.hasOwn(g.joins, ref.side)) throw new Error('Invalid or unbuilt explicit gate join');
      contact = g.joins[ref.side];
      if (ref.end !== contact.end || item.facing !== 'z-' || !Array.isArray(from) || !Array.isArray(to) ||
          [...from, ...to].some(n => typeof n !== 'number' || !Number.isFinite(n)) || from.length !== 2 || to.length !== 2 ||
          Math.abs(from[1] - contact.world[1]) > 1e-8 || Math.abs(to[1] - contact.world[1]) > 1e-8 ||
          (ref.side === 'left' ? from[0] >= contact.world[0] || to[0] <= contact.world[0] || to[0] >= g.x : to[0] <= contact.world[0] || from[0] >= contact.world[0] || from[0] <= g.x)) {
        throw new Error('Invalid corridor gate join endpoint or centerline');
      }
      if (ref.end === 'from') from = [...contact.world]; else to = [...contact.world];
      if (Math.abs(to[0] - from[0]) < 4) throw new Error('Gate join leaves a nonpositive or too-short corridor');
    }
    const [x1, z1] = from;
    const [x2, z2] = to;
    const params = { facing: item.facing, depth: item.depth, colH: item.colH, name: item.name };
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    this.kit.corridor(x1, z1, x2, z2, item.facing, params);
    if (contact) this.kit.root.children.at(-1).userData.gateJoin = {
      ...item.gateJoin, boundary: [...contact.world], effectiveFrom: [...from], effectiveTo: [...to],
      provisional: true, status: contact.status,
    };
  }

  buildCityGate(item) {
    const params = {
      x: item.x,
      z: item.z,
      rot: this.parseRot(item.rot),
      name: item.name,
    };
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k]);
    this.kit.cityGate(params);
  }

  buildRegion(item) {
    this.kit.region(item.name, item.x0, item.x1, item.z0, item.z1);
  }

  buildNineDragonWall(item) {
    // 九龙壁是 SideCourts 私有函数，需直接内联或在 kit 注册为方法
    // 这里直接复制 SideCourts.nineDragonWall 的实现
    const k = this.kit;
    const x = item.x;
    const z = item.z;
    const len = item.length;
    const rot = this.parseRot(item.rot ?? Math.PI); // 默认朝北
    
    const f = k.frame(x, z, rot);
    const h = 4.2;
    k.box(f, 'sumeru_band', len + 0.6, 0.9, 1.6, 0, 0.45, 0, 'band');
    const glaze = new THREE.MeshStandardMaterial({ color: 0x1f5f7a, roughness: 0.3, metalness: 0.1, name: 'kit_glaze_blue' });
    const wave = new THREE.MeshStandardMaterial({ color: 0x2e8a6e, roughness: 0.3, metalness: 0.1, name: 'kit_glaze_green' });
    k.owned.push(glaze, wave);
    k.mesh(f, new THREE.BoxGeometry(len, h, 1.1), glaze, 0, 0.9 + h / 2, 0);
    // 壁心：故宫九龙壁实物照片（正面拼接图，壁心长宽比约 10.8:1）。贴图缺失时仍显示蓝绿琉璃底色。
    const ASPECT = 10.77;
    const fh = Math.min(h - 0.3, len / ASPECT);
    const tex = new THREE.TextureLoader().load(`${import.meta.env?.BASE_URL ?? '/'}textures/nine_dragon.webp`);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.05, name: 'kit_nine_dragon_face' });
    k.owned.push(face);
    const fg = new THREE.PlaneGeometry(len - 0.4, fh);
    fg.rotateY(Math.PI);   // 正面朝局部 -Z
    k.mesh(f, fg, face, 0, 0.9 + fh / 2 + 0.1, -0.56).castShadow = false;
    // 壁心上方的檐下琉璃带（蓝绿）
    k.mesh(f, new THREE.BoxGeometry(len - 0.2, h - fh - 0.1, 1.16), wave, 0, 0.9 + fh + 0.1 + (h - fh - 0.1) / 2, 0);
    k.roof(f, { type: 'gable', width: len + 0.4, depth: 1.6, baseY: 0.9 + h, brackets: false, height: 0.7 });
    k.col(f, -len / 2, 0, -0.8, len / 2, 3, 0.8);
    k.mapRect(f, 'hall', item.name ?? '九龙壁', len, 1.6);
  }

  // ───────────────────────── 辅助方法 ─────────────────────────

  /**
   * 解析旋转角：支持弧度数值或字符串 "south"|"north"|"east"|"west"
   */
  parseRot(rot) {
    if (rot === undefined || rot === null) return 0;
    if (typeof rot === 'number') return rot;
    const map = { south: FACE.south, north: FACE.north, east: FACE.east, west: FACE.west };
    if (rot in map) return map[rot];
    console.warn(`[ZoneBase] 无效的 rot 值: ${rot}，使用默认 0`);
    return 0;
  }

  /**
   * 解析 wall gaps：将 { at, gate } 转为 { at, w }
   */
  resolveGaps(gaps) {
    if (!gaps) return [];
    return gaps.map(g => ({
      at: g.at,
      w: g.gate ? this.gateWidths.get(g.gate) : g.w,
    }));
  }
}
