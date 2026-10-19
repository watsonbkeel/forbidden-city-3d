import * as THREE from 'three';
import { QIANQING_SURFACE, qianqingSurfaceMaterial } from './palace/QianqingSurface.js';
import { COLORS } from '../config/constants.js';
import { taiheFloorMaterial, TAIHE_FLOOR } from './palace/special/TaiheFloorMaterial.js';
import { buildGateAscent, toWorld } from './palace/gateAscent.js';
import { buildWumenAscent } from './palace/special/WumenAscent.js';
import { wumenTowerGeometry, shenwuTowerGeometry } from './palace/special/GateTowerProfiles.js';
import { buildGateTowerShell } from './palace/special/GateTowerShell.js';
import { WUMEN_VERTICAL_PROFILE } from './palace/special/WumenVerticalProfile.js';
import { buildWumenSouthPlaque, buildShenwuInstitutionPlaque, SHENWU_GATE_NAME_OMISSION } from './palace/special/GatePlaques.js';
import { riverBridges, JINSHUI_BRIDGE_LENGTH } from './palace/river.js';
import { buildRoof } from './RoofBuilder.js';
import { buildHallBody, buildBalustrade, buildStuddedDoor } from './HallKit.js';
import { mergeByMaterial } from '../utils/MergeUtils.js';
import { applyBoxUV, applyBandUV, applyPlanarUV } from '../utils/GeometryUV.js';
import { installJiaotaiLandmarks } from './palace/special/JiaotaiLandmarks.js';
import {installJiaotaiCentral,buildJiaotaiBackdrop} from './palace/special/JiaotaiCentralInterior.js';
import { buildSquareHall, SQUARE_HALLS } from './palace/special/SquareHalls.js';
import {registerQianqingCentral,installQianqingCentral} from './palace/QianqingCentralSetting.js';
import { buildQianqingGate } from './palace/special/QianqingGate.js';
import { innerPalaceTerraceProfile, buildInnerTerraceRail, buildInnerTerraceStair } from './palace/special/InnerPalaceTerrace.js';
import { INNER_PALACE_LEVELS, buildInnerPalaceLip } from './palace/special/InnerPalaceLevels.js';
import { captureInnerGlazeCoarse, installInnerGlazeLOD } from './palace/special/InnerPalaceGlazeLOD.js';
import { buildKunningPalace } from './palace/special/KunningPalace.js';
import { threeHallTerraceProfile, closedTerraceStairGeometry } from './palace/ThreeHallTerrace.js';
import { taiheSouthTier, buildTaiheSouthTier } from './palace/TaiheFrontApproaches.js';
import { baoheColumnGrid } from './palace/BaoheColumnGrid.js';
import { BAOHE_DEPTH_GRID, baoheDepthGrid, baoheDepthColumnPresent } from './palace/BaoheDepthGrid.js';
import { buildBaoheThroneScreen, buildBaoheInteriorPlaque, buildBaoheThroneChair } from './palace/BaoheThroneScreen.js';
import { buildBaoheFrontDoors } from './palace/BaoheFrontDoors.js';
import { buildBaoheClosedFront } from './palace/BaoheFrontEnclosure.js';
import { buildQianqingFrontWindow, qianqingFrontBox } from './palace/QianqingFrontEnclosure.js';
import { qianqingPassageFrame, buildQianqingPassageMouth, buildQianqingPassageWalls } from './palace/QianqingEndPassages.js';
import { paintQianqingUpperEnclosure } from './palace/QianqingUpperEnclosure.js';
import { buildBaoheRearEnclosure } from './palace/BaoheRearEnclosure.js';
import { positionHallNameboard } from './palace/HallNameboardMount.js';
import { buildBaoheColumnCouplets } from './palace/BaoheColumnCouplets.js';
import { baoheInteriorFrame, baoheHighColumn, buildBaoheInteriorCeiling } from './palace/BaoheInteriorFrame.js';
import { buildBaoheHallPlinth } from './palace/BaoheHallPlinth.js';
import { baoheNorthTier, buildBaoheNorthTier, createBaoheNorthDetail, installBaoheNorthDetail } from './palace/BaoheNorthApproaches.js';
import { buildZhongheImperialApproach } from './palace/ZhongheImperialApproach.js';
import { TAIHE_CORE } from './palace/special/TaiheCoreProfile.js';
import { buildTaiheCoreFallback, buildTaiheCeiling, buildTaiheNavigation } from './palace/special/TaiheCore.js';
import { buildTaiheRearEnclosure } from './palace/special/TaiheRearEnclosure.js';
import { taiheColumnGrid } from './palace/special/TaiheColumnGrid.js';

/**
 * 真实形制参数（按故宫现状）：
 * bays 面阔间数；roof/layers 屋顶形式；throne 是否设宝座；inner 殿内匾额；open 前后敞开可进出的间数；
 * 门的 baseH/margin/apron 为台基修正（margin/apron 与 tools/p0c-relocate.mjs TERRACE 表的墙线起点对应）。
 * P0c-1 起场景为真实米制，原先为避让金水河/乾清宫台阶而压缩的门 depth 覆盖已去掉，进深取 DIMENSIONS。
 * baseH：太和门 3.44（P1-Z-axis A2）、乾清门 1.5（dimensions.md:88/108）。
 */
/**
 * plinth：殿座自身台明高度（米）。前三殿另有阶道；后三宫实景为近同层小石唇，
 * 不应为了制造上下楼体验而叠加无依据的高台明。未逐项测量的尺寸仍为暂定。
 */
const REAL = {
  太和殿: { bays: 11, roof: 'wudian', layers: 2, throne: true, inner: '建极绥猷', open: 3, plinth: 2.2 },
  // R3: shallow individual plinth fits four stair flights within the retained
  // shared terrace. 0.6m / 4.6m remain provisional photo-based proportions.
  中和殿: { bays: 5, roof: 'pavilion', layers: 1, throne: true, inner: '允执厥中', open: 3, plinth: 0.6, stairW: 4.6 },
  保和殿: { bays: 9, roof: 'xieshan', layers: 2, throne: true, inner: '皇建有极', open: 3, plinth: 2.0 },
  太和门: { bays: 9, roof: 'xieshan', layers: 2, open: 3, baseH: 3.44, margin: 1, apron: 1 }, // 台基 3.44（dimensions.md:88，P1-Z-axis A2）
  乾清门: { bays: 5, roof: 'xieshan', layers: 1, open: 3, baseH: 1.5, margin: 0, apron: 1 },
  乾清宫: { bays: 9, roof: 'wudian', layers: 2, throne: true, inner: '正大光明', open: 3, plinth: INNER_PALACE_LEVELS.hallLip },
  交泰殿: { bays: 3, roof: 'pavilion', layers: 1, throne: true, inner: '无为', open: 3, plinth: INNER_PALACE_LEVELS.hallLip },
  // Nine total bays include two end passages; enclosure is owned by its special builder.
  // open remains only as the inherited stair-width input, never a facade opening.
  坤宁宫: { bays: 9, roof: 'wudian', layers: 2, open: 3, plinth: INNER_PALACE_LEVELS.hallLip },
};
const PLINTH_PAD = 1.5; // 台明比殿身四周外扩

function dimsOf(h) {
  const s = REAL[h.name] ?? {};
  return { width: h.dimensions.width, depth: s.depth ?? h.dimensions.depth, height: h.dimensions.height };
}

/**
 * 中轴线建筑：宫殿 / 门 / 金水河。
 *
 * 坐标约定：每座建筑在局部 Group 中建模（原点 = 建筑中心，地面 y=0，正面朝 -Z 南），
 * 建完后 mergeByMaterial 合并并放到世界坐标。
 * 碰撞体与可行走面（walkables）直接登记世界坐标（局部坐标 + this.ox / this.oz）。
 * 可行走面：台基每层顶面（box）、台阶（ramp）、桥面（ramp）。碰撞体只登记人身高范围内的实体。
 */
export class PalaceBuilder {
  constructor(scene, library) {
    this.scene = scene;
    this.library = library;

    // 回归脚本依赖：materials.water（射线检测水面材质）与 textures（色彩空间检查，可为空）
    this.materials = {
      water: new THREE.MeshStandardMaterial({
        color: COLORS.WATER_BLUE,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.7,
      }),
    };
    this.textures = {};

    this.colliders = [];
    this.walkables = [];
    this.terraceProfiles = [];
    this.taiheSouthTiers = [];
    this.baoheNorthTiers = [];
    this.ownedMaterials = [];
    this.ownedObjects = new Set();
    this.ox = 0;
    this.oz = 0;
    this._own = new Map();
  }

  buildAll(layout) {
    for (const item of layout) {
      if (item.type === 'gate') this.buildGate(item);
      else if (item.type === 'river') this.buildRiver(item);
    }
    this.buildPalaces(layout.filter(item => item.type === 'palace'));
  }

  // ───────────────────────── 通用工具 ─────────────────────────

  begin(data) {
    this.ox = data.position.x;
    this.oz = data.position.z;
    const g = new THREE.Group();
    g.name = data.name ?? 'building';
    return g;
  }

  finish(g) {
    const architecture = [];
    g.traverse(o => { if (o.userData.structure?.id) architecture.push(structuredClone(o.userData.structure)); });
    const merged = mergeByMaterial(g, { castShadow: true, receiveShadow: true, name: g.name });
    merged.userData.architecture = architecture;
    merged.position.set(this.ox, 0, this.oz);
    this.addObject(merged);
    return merged;
  }

  addObject(obj) {
    this.scene.add(obj);
    this.ownedObjects.add(obj);
  }

  ownMat(key, params) {
    if (!this._own.has(key)) {
      const m = new THREE.MeshStandardMaterial(params);
      this._own.set(key, m);
      this.ownedMaterials.push(m);
    }
    return this._own.get(key);
  }

  /** 普通盒子；uv = { box: tile } | { band: width } | null */
  box(parent, mat, w, h, d, x, y, z, uv = null) {
    let geo = new THREE.BoxGeometry(w, h, d);
    if (uv?.box) geo = applyBoxUV(geo, uv.box);
    else if (uv?.band) geo = applyBandUV(geo, uv.band);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  /** 贴图库材质盒子；mode = 'box' | 'band' | 'raw' */
  libBox(parent, name, w, h, d, x, y, z, mode = 'box', params) {
    const t = this.library.tileSize(name);
    const uv = mode === 'band' ? { band: t } : mode === 'box' ? { box: t } : null;
    return this.box(parent, this.library.material(name, params), w, h, d, x, y, z, uv);
  }

  /** 局部坐标 → 世界坐标碰撞盒 */
  col(x0, y0, z0, x1, y1, z1) {
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(Math.min(x0, x1) + this.ox, Math.min(y0, y1), Math.min(z0, z1) + this.oz),
      new THREE.Vector3(Math.max(x0, x1) + this.ox, Math.max(y0, y1), Math.max(z0, z1) + this.oz),
    ));
  }

  walkBox(x0, z0, x1, z1, y) {
    this.walkables.push({
      type: 'box',
      box: new THREE.Box3(
        new THREE.Vector3(Math.min(x0, x1) + this.ox, y, Math.min(z0, z1) + this.oz),
        new THREE.Vector3(Math.max(x0, x1) + this.ox, y, Math.max(z0, z1) + this.oz),
      ),
    });
  }

  /** 沿 Z 的坡道：zFrom 处高 yFrom，zTo 处高 yTo */
  walkRampZ(x0, x1, zFrom, zTo, yFrom, yTo) {
    this.walkables.push({
      type: 'ramp',
      minX: Math.min(x0, x1) + this.ox,
      maxX: Math.max(x0, x1) + this.ox,
      minZ: Math.min(zFrom, zTo) + this.oz,
      maxZ: Math.max(zFrom, zTo) + this.oz,
      axis: 'z',
      a0: zFrom + this.oz,
      a1: zTo + this.oz,
      y0: yFrom,
      y1: yTo,
    });
  }

  column(g, geo, mat, x, z, y, h, r) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y + h / 2, z);
    m.castShadow = true;
    g.add(m);
    this.col(x - r, y, z - r, x + r, y + 3, z + r);
  }

  /** 汉白玉栏杆一段（沿 X 或 Z），带碰撞 */
  rail(g, x0, z0, x1, z1, y, h = 1.1) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    if (len < 0.6) return;
    const r = buildBalustrade(this.library, { length: len, height: h });
    r.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
    r.rotation.y = Math.abs(z1 - z0) > Math.abs(x1 - x0) ? Math.PI / 2 : 0;
    g.add(r);
    this.col(Math.min(x0, x1) - 0.15, y + 0.2, Math.min(z0, z1) - 0.15,
      Math.max(x0, x1) + 0.15, y + h + 0.3, Math.max(z0, z1) + 0.15);
  }

  /** 台面四周栏杆，前后两边在中央留 ±half 的楼梯口 */
  edgeRails(g, w, d, y, half) {
    const ix = w / 2 - 0.2;
    const iz = d / 2 - 0.2;
    for (const s of [-1, 1]) {
      this.rail(g, -ix, s * iz, -half, s * iz, y);
      this.rail(g, half, s * iz, ix, s * iz, y);
      this.rail(g, s * ix, -iz, s * ix, iz, y);
    }
  }

  // ───────────────────────── 台基与台阶 ─────────────────────────

  /**
   * 多层须弥座台基：每层顶面可走；每层南北都有台阶（含垂带、御路），栏杆在台阶处开口。
   * 每层比上层四周外扩 setback（= 台阶水平长度 + 1m 平台）。
   * @returns {number} 顶层台面高度
   */
  buildTerrace(g, { topW, topD, layers, lh, run, setback, stairW }) {
    const half = stairW / 2;
    for (let i = 0; i < layers; i++) {
      const w = topW + 2 * (layers - 1 - i) * setback;
      const d = topD + 2 * (layers - 1 - i) * setback;
      const y0 = i * lh;
      const y1 = y0 + lh;
      const ch = Math.min(lh, 3);
      const t = 0.5;

      this.libBox(g, 'sumeru_band', w, lh, d, 0, y0 + lh / 2, 0, 'band');
      this.libBox(g, 'stone_slab', w + 0.2, 0.1, d + 0.2, 0, y1 - 0.03, 0, 'box');
      this.walkBox(-w / 2, -d / 2, w / 2, d / 2, y1);

      // 侧面挡墙（只在本层高度范围内，站在台面上的人不受影响）
      this.col(-w / 2, y0, -d / 2, -w / 2 + t, y0 + ch, d / 2);
      this.col(w / 2 - t, y0, -d / 2, w / 2, y0 + ch, d / 2);
      for (const s of [-1, 1]) {
        const ze = s * d / 2;
        this.col(-w / 2, y0, ze, -half, y0 + ch, ze - s * t);
        this.col(half, y0, ze, w / 2, y0 + ch, ze - s * t);
        this.buildStair(g, { zEdge: ze, dir: s, y0, y1, run, width: stairW });
      }
      this.edgeRails(g, w, d, y1, half);
    }
    return layers * lh;
  }

  /**
   * 台阶：从台边 zEdge（高 y1）向外 dir 方向下行 run 米到 y0。
   * 视觉 = 逐级踏步 + 两侧垂带 + 中央御路石；行走 = ramp；两侧垂带碰撞防止从侧面钻进台阶。
   */
  buildStair(g, { zEdge, dir, y0, y1, run, width }) {
    const rise = y1 - y0;
    const n = Math.max(3, Math.round(rise / 0.16));
    const sr = run / n;
    const cw = 0.45;
    const marble = this.library.material('marble');
    const tile = this.library.tileSize('marble');

    for (let k = 0; k < n; k++) {
      const top = y1 - (k + 1) * rise / (n + 1);
      this.box(g, marble, width, top - y0, sr, 0, (top + y0) / 2, zEdge + dir * (k + 0.5) * sr, { box: tile });
    }

    const L = Math.hypot(run, rise);
    const ang = dir * Math.atan2(rise, run);
    const zc = zEdge + dir * run / 2;
    for (const sx of [-1, 1]) {
      const m = this.box(g, marble, cw, 0.4, L, sx * (width / 2 - cw / 2), (y0 + y1) / 2 + 0.1, zc, { box: tile });
      m.rotation.x = ang;
      // 垂带碰撞：分 4 段，每段高度随坡度递减
      for (let j = 0; j < 4; j++) {
        const za = zEdge + dir * j * run / 4;
        const zb = zEdge + dir * (j + 1) * run / 4;
        const hi = y1 - j * rise / 4 + 0.9;
        this.col(sx * (width / 2 - cw), y0, za, sx * width / 2, Math.min(hi, y0 + Math.max(rise + 0.9, 1)), zb);
      }
    }

    if (width >= 9) {
      const yw = width * 0.22;
      const m = this.box(g, this.library.material('yulu'), yw, 0.3, L, 0, (y0 + y1) / 2 + 0.05, zc);
      m.rotation.x = ang;
    }

    this.walkRampZ(-width / 2 + cw, width / 2 - cw, zEdge, zEdge + dir * run, y1, y0);
  }

  // ───────────────────────── 宫殿群（共享台基） ─────────────────────────

  /**
   * 多块矩形沿 Z 拼接的台基（土字形三台 / 工字形后三宫）。
   * rects: [{ hw, z0, z1 }]（顶层，局部坐标），每下一层 hw 与首尾 z 向外扩 setback。
   * 只在首块南边、末块北边设台阶；矩形交界处宽出的部分设挡墙与栏杆。
   */
  buildTerraceUnion(g, rects, { layers, lh, run, setback, stairW, sideStairProfile = null, taiheSouth = false, innerPalace = false, baoheNorth = null }) {
    const half = stairW / 2;
    const t = 0.5;
    const last = rects.length - 1;
    if (sideStairProfile) {
      // Existing terraceProfiles is the three-tier route adapter contract.
      // Rear-palace stairs retain their own scene metadata and dedicated tests.
      if (!innerPalace) this.terraceProfiles.push(sideStairProfile);
      g.userData.structure = sideStairProfile;
    }
    for (let i = 0; i < layers; i++) {
      const e = (layers - 1 - i) * setback;
      const y0 = i * lh;
      const y1 = y0 + lh;
      const ch = Math.min(lh, 3);
      const R = rects.map((r, k) => ({
        hw: r.hw + e,
        z0: k === 0 ? r.z0 - e : r.z0,
        z1: k === last ? r.z1 + e : r.z1,
      }));
      R.forEach((r, k) => {
        const d = r.z1 - r.z0;
        const zc = (r.z0 + r.z1) / 2;
        this.libBox(g, innerPalace && k > 0 ? 'wall_brick' : 'sumeru_band', r.hw * 2, lh, d, 0, y0 + lh / 2, zc, innerPalace && k > 0 ? 'box' : 'band');
        const deck = this.libBox(g, 'stone_slab', r.hw * 2 + 0.2, 0.1, d + (k === 0 || k === last ? 0.2 : 0), 0, y1 - 0.03, zc, 'box');
        // One coherent front court sample. Same existing box/UV/height and walk
        // surface; private material, no floating overlay or shared-map mutation.
        if (innerPalace && k === 0) deck.material = qianqingSurfaceMaterial(this, 'court');
        this.walkBox(-r.hw, r.z0, r.hw, r.z1, y1);
        for (const s of [-1, 1]) {
          const flight = sideStairProfile?.flights.find(f => f.tier === i + 1 && f.rectIndex === k && f.dir === s);
          const wallIntervals = flight ? [[r.z0, flight.openingZ[0]], [flight.openingZ[1], r.z1]] : [[r.z0, r.z1]];
          const railMin = r.z0 + (k === 0 ? 0.2 : 0), railMax = r.z1 - (k === last ? 0.2 : 0);
          const railIntervals = flight ? [[railMin, flight.openingZ[0]], [flight.openingZ[1], railMax]] : [[railMin, railMax]];
          for (const [z0, z1] of wallIntervals) this.col(s * r.hw, y0, z0, s * (r.hw - t), y0 + ch, z1);
          for (const [z0, z1] of railIntervals) {
            if (innerPalace && k > 0) buildInnerTerraceRail(this, g, s * (r.hw - 0.2), z0, s * (r.hw - 0.2), z1, y1);
            else this.rail(g, s * (r.hw - 0.2), z0, s * (r.hw - 0.2), z1, y1);
          }
          if (flight) {
            if (innerPalace) buildInnerTerraceStair(this, g, flight);
            else this.buildTerraceSideStair(g, flight);
          }
        }
        if (k < last) {
          const n = R[k + 1];
          if (Math.abs(r.hw - n.hw) > 0.6) {
            const wide = r.hw > n.hw ? r.hw : n.hw;
            const narrow = Math.min(r.hw, n.hw);
            const dz = r.hw > n.hw ? -1 : 1; // 墙体朝宽块内侧
            for (const s of [-1, 1]) {
              this.col(s * narrow, y0, r.z1, s * wide, y0 + ch, r.z1 + dz * t);
              if (innerPalace) buildInnerTerraceRail(this, g, s * (narrow - 0.2), r.z1 + dz * 0.2, s * (wide - 0.2), r.z1 + dz * 0.2, y1);
              else this.rail(g, s * (narrow - 0.2), r.z1 + dz * 0.2, s * (wide - 0.2), r.z1 + dz * 0.2, y1);
            }
          }
        }
      });
      // 南北两端：分段挡墙 + 台阶 + 栏杆开口
      for (const [r, s, ze] of [[R[0], -1, R[0].z0], [R[last], 1, R[last].z1]]) {
        if (taiheSouth && s === -1) {
          buildTaiheSouthTier(this, g, taiheSouthTier({ zEdge: ze, y0, y1, run, halfWidth: r.hw, tier: i + 1 }));
          continue;
        }
        if (baoheNorth && s === 1) {
          buildBaoheNorthTier(this, g, baoheNorthTier({ zEdge: ze, y0, y1, run, halfWidth: r.hw, tier: i + 1 }), baoheNorth);
          continue;
        }
        this.col(-r.hw, y0, ze, -half, y0 + ch, ze - s * t);
        this.col(half, y0, ze, r.hw, y0 + ch, ze - s * t);
        this.buildStair(g, { zEdge: ze, dir: s, y0, y1, run, width: stairW });
        const zr = ze - s * 0.2;
        if (innerPalace && s === 1) {
          buildInnerTerraceRail(this, g, -(r.hw - 0.2), zr, -half, zr, y1);
          buildInnerTerraceRail(this, g, half, zr, r.hw - 0.2, zr, y1);
        } else {
          this.rail(g, -(r.hw - 0.2), zr, -half, zr, y1);
          this.rail(g, half, zr, r.hw - 0.2, zr, y1);
        }
      }
    }
    return layers * lh;
  }

  /** 中轴宫殿群：三台（太和/中和/保和）、后三宫（乾清/交泰/坤宁），其他宫殿各自成台 */
  buildPalaces(list) {
    const groups = [
      // 三台底层外廓按傅熹年模数 130 × 232（dimensions.md B1，conf 中）：中心约 (0, +62)，南缘 z≈−54、北缘 z≈+178。
      // bottom 为底层外缘；顶层 = 底层每边内收 (layers−1) × setback。东西 130 只施加在太和殿段（土字形最宽处）。
      { names: ['太和殿', '中和殿', '保和殿'], name: '三台', apron: 14, margin: 4, bottom: { halfW: 65, z0: -54, z1: 178 } },
      { names: ['乾清宫', '交泰殿', '坤宁宫'], name: '后三宫', apron: 6, margin: 4 },
    ];
    const used = new Set();
    for (const grp of groups) {
      const halls = list.filter(p => grp.names.includes(p.name)).sort((a, b) => a.position.z - b.position.z);
      if (!halls.length) continue;
      halls.forEach(h => used.add(h));
      this.buildComplex(halls, grp);
    }
    list.filter(p => !used.has(p)).forEach(p => this.buildComplex([p], { name: p.name, apron: 6, margin: 4 }));
  }

  buildComplex(halls, { name, apron, margin, maxH, bottom }) {
    this.ox = 0;
    this.oz = 0;
    const g = new THREE.Group();
    g.name = name;
    const first = halls[0].dimensions;
    const spec0 = REAL[halls[0].name] ?? {};
    const layers = first.baseLayers ?? 1;
    const height = Math.min(spec0.baseH ?? first.baseHeight ?? 3, maxH ?? Infinity);
    const lh = height / layers;
    const run = lh * 1.6;
    const setback = run + 1.2;
    const mg = spec0.margin ?? margin;
    const ap = spec0.apron ?? apron;

    const rects = halls.map((h, k) => {
      const { width: w, depth: d } = dimsOf(h);
      const z = h.position.z;
      const r = { hw: w / 2 + mg + (k === 0 && halls.length > 1 ? 1 : 0), z0: z - d / 2 - mg, z1: z + d / 2 + mg + 1 };
      if (k === 0) r.z0 = z - d / 2 - ap;
      return r;
    });
    if (bottom) {
      const inset = (layers - 1) * setback;
      rects[0].hw = Math.max(rects[0].hw, bottom.halfW - inset);
      rects[0].z0 = Math.min(rects[0].z0, bottom.z0 + inset);
      rects[rects.length - 1].z1 = Math.max(rects[rects.length - 1].z1, bottom.z1 - inset);
    }
    for (let k = 1; k < rects.length; k++) rects[k].z0 = rects[k - 1].z1;

    const bayW = first.width / (spec0.bays ?? 9);
    const stairW = Math.min(12, bayW * 2.2);
    const waistIndex = halls.findIndex(h => h.name === '中和殿');
    const sideStairProfile = name === '三台' && waistIndex >= 0
      ? threeHallTerraceProfile(rects, { layers, lh, run, setback, waistIndex, hall: halls[waistIndex] })
      : name === '后三宫' ? innerPalaceTerraceProfile(rects, halls) : null;
    const baoheNorth = name === '三台' ? createBaoheNorthDetail() : null;
    const top = this.buildTerraceUnion(g, rects, { layers, lh, run, setback, stairW, sideStairProfile, taiheSouth: name === '三台', innerPalace: name === '后三宫', baoheNorth });

    if (halls.length > 1) {
      // Individual supports are source-specific: high stairs belong to the
      // front halls; the rear-palace deck carries only a low photographed lip.
      halls.forEach(h => {
        const spec = REAL[h.name] ?? {};
        const { width: w, depth: d } = dimsOf(h);
        const hb = w / (spec.bays ?? 9);
        const sw = spec.stairW ?? Math.min(stairW, (spec.open ?? 3) * hb);
        // 台阶不能伸出所在台面：按该殿前后可用余量限制台明高度
        const r = rects[halls.indexOf(h)];
        const room = Math.min(h.position.z - d / 2 - PLINTH_PAD - r.z0, r.z1 - (h.position.z + d / 2 + PLINTH_PAD)) - 0.4;
        const ph = Math.min(spec.plinth ?? 1.3, room / 1.6);
        const plinth = { z0: h.position.z, w: w + 2 * PLINTH_PAD, d: d + 2 * PLINTH_PAD, y: top, ph, stairW: sw,
          taiheSouth: h.name === '太和殿',
          zhongheImperial: h.name === '中和殿',
          stairCenters: h.name === '中和殿' ? [-(w - 6) / 3, 0, (w - 6) / 3] : [0],
          stairSides: h.name === '中和殿' ? ['south', 'north', 'east', 'west'] : ['south', 'north'] };
        const y = name === '后三宫' ? buildInnerPalaceLip(this, g, { ...plinth, surfaceMaterial: h.name === '乾清宫' ? qianqingSurfaceMaterial(this, 'court') : null })
          : h.name === '保和殿' ? buildBaoheHallPlinth(this, g, plinth) : this.buildPlinth(g, plinth);
        // Retain body heights when lowering source-specific supports. The old
        // floor datums are modelling values, not measured body dimensions.
        this.buildHall(g, h, y, { heightReferenceY: h.name === '乾清宫' ? 7 : h.name === '保和殿' ? top + ph : y });
      });
    } else {
      halls.forEach(h => this.buildHall(g, h, top));
    }
    if (name === '三台') this.terraceOrnaments(g, rects[0], top);

    const coarse = name === '后三宫' ? captureInnerGlazeCoarse(g) : null;
    const finished = this.finish(g);
    if (coarse) installInnerGlazeLOD(finished, coarse);
    if (baoheNorth) installBaoheNorthDetail(finished, baoheNorth);
    if (name === '后三宫') { installJiaotaiLandmarks(this, finished); installJiaotaiCentral(this, finished); installQianqingCentral(this, finished); }
  }

  /**
   * 单殿台明：高 ph 的须弥座，前后台阶可分组，并可加东西出阶；四面挡墙只挡台下的人。
   * @returns {number} 台明顶面高度
   */
  buildPlinth(g, { z0, w, d, y, ph, stairW, stairSides = ['south', 'north'], stairCenters = [0], taiheSouth = false, zhongheImperial = false }) {
    const half = stairW / 2;
    const run = ph * 1.6;
    const t = 0.5;
    const y1 = y + ph;
    this.libBox(g, 'sumeru_band', w, ph, d, 0, y + ph / 2, z0, 'band');
    this.libBox(g, 'stone_slab', w + 0.2, 0.1, d + 0.2, 0, y1 - 0.03, z0, 'box');
    this.walkBox(-w / 2, z0 - d / 2, w / 2, z0 + d / 2, y1);
    for (const s of [-1, 1]) {
      const side = s < 0 ? 'east' : 'west';
      const xe = s * w / 2;
      if (stairSides.includes(side)) {
        this.col(xe, y, z0 - d / 2, xe - s * t, y1, z0 - half);
        this.col(xe, y, z0 + half, xe - s * t, y1, z0 + d / 2);
        this.buildStairX(g, { xEdge: xe, z0, dir: s, y0: y, y1, run, width: stairW });
      } else this.col(xe, y, z0 - d / 2, xe - s * t, y1, z0 + d / 2);
    }
    for (const s of [-1, 1]) {
      const ze = z0 + s * d / 2;
      if (taiheSouth && s === -1) {
        buildTaiheSouthTier(this, g, taiheSouthTier({ zEdge: ze, y0: y, y1, run, halfWidth: w / 2, plinth: true }));
        continue;
      }
      let cursor = -w / 2;
      for (const x of stairCenters) {
        this.col(cursor, y, ze, x - half, y1, ze - s * t);
        const flight = new THREE.Group();
        flight.position.x = x;
        g.add(flight);
        const oldX = this.ox;
        this.ox += x;
        try {
          if (zhongheImperial && x === 0) buildZhongheImperialApproach(this, flight, { zEdge: ze, dir: s, y0: y, y1, run, width: stairW });
          else this.buildStair(flight, { zEdge: ze, dir: s, y0: y, y1, run, width: stairW });
        }
        finally { this.ox = oldX; }
        cursor = x + half;
      }
      this.col(cursor, y, ze, w / 2, y1, ze - s * t);
    }
    return y1;
  }

  /** Three-hall waist only: a single closed staircase, inherited solid cheeks,
   * and the matching physical ramp. Existing plinth stairs stay untouched. */
  buildTerraceSideStair(parent, flight) {
    const { xEdge, xToe, centerZ: z0, dir, y0, y1, run, width, cheekWidth: cw } = flight;
    const g = new THREE.Group();
    g.name = flight.id;
    parent.add(g);
    const marble = this.library.material('marble');
    const steps = new THREE.Mesh(closedTerraceStairGeometry(flight, this.library.tileSize('marble')), marble);
    steps.name = `${flight.id}:closed-treads`;
    steps.castShadow = true;
    steps.receiveShadow = true;
    g.add(steps);
    const rise = y1 - y0, length = Math.hypot(run, rise);
    for (const sz of [-1, 1]) {
      const cheek = this.box(g, marble, length, 0.4, cw, (xEdge + xToe) / 2,
        (y0 + y1) / 2 + 0.1, z0 + sz * (width / 2 - cw / 2), { box: 2 });
      cheek.name = `${flight.id}:cheek:${sz}`;
      cheek.rotation.z = -dir * Math.atan2(rise, run);
      for (let j = 0; j < 4; j++) {
        this.col(xEdge + dir * j * run / 4, y0, z0 + sz * (width / 2 - cw),
          xEdge + dir * (j + 1) * run / 4, y1 - j * rise / 4 + 0.9, z0 + sz * width / 2);
      }
    }
    const r = flight.ramp;
    this.walkables.push({ ...r, minX: r.minX + this.ox, maxX: r.maxX + this.ox,
      minZ: r.minZ + this.oz, maxZ: r.maxZ + this.oz, a0: r.a0 + this.ox, a1: r.a1 + this.ox,
      structureId: flight.id });
  }

  /** East/west flight, with the same physical ramp and cheek-wall contract. */
  buildStairX(g, { xEdge, z0, dir, y0, y1, run, width }) {
    const rise = y1 - y0, n = Math.max(3, Math.round(rise / 0.16)), sr = run / n;
    const marble = this.library.material('marble'), cw = 0.45;
    for (let k = 0; k < n; k++) {
      const top = y1 - (k + 1) * rise / (n + 1);
      this.box(g, marble, sr, top - y0, width, xEdge + dir * (k + 0.5) * sr,
        (top + y0) / 2, z0, { box: this.library.tileSize('marble') });
    }
    const L = Math.hypot(run, rise);
    for (const sz of [-1, 1]) {
      const m = this.box(g, marble, L, 0.4, cw, xEdge + dir * run / 2,
        (y0 + y1) / 2 + 0.1, z0 + sz * (width / 2 - cw / 2), { box: 2 });
      m.rotation.z = -dir * Math.atan2(rise, run);
      for (let j = 0; j < 4; j++) {
        this.col(xEdge + dir * j * run / 4, y0, z0 + sz * (width / 2 - cw),
          xEdge + dir * (j + 1) * run / 4, y1 - j * rise / 4 + 0.9, z0 + sz * width / 2);
      }
    }
    this.walkables.push({ type: 'ramp', axis: 'x',
      minX: Math.min(xEdge, xEdge + dir * run) + this.ox,
      maxX: Math.max(xEdge, xEdge + dir * run) + this.ox,
      minZ: z0 - width / 2 + cw + this.oz, maxZ: z0 + width / 2 - cw + this.oz,
      a0: xEdge + this.ox, a1: xEdge + dir * run + this.ox, y0: y1, y1: y0 });
  }

  /** 太和殿月台陈设：铜鼎、日晷（东）、嘉量（西）、铜龟铜鹤 */
  terraceOrnaments(g, r, y) {
    const bronze = this.ownMat('bronze', { color: 0x4a3b28, metalness: 0.7, roughness: 0.45 });
    const marble = this.library.material('marble');
    const zf = r.z0 + 3;
    for (const s of [-1, 1]) {
      for (let k = 0; k < 3; k++) this.tripod(g, bronze, s * (r.hw - 3), y, zf + k * 3.8);
      this.box(g, marble, 1.6, 1.2, 1.6, s * 9, y + 0.6, zf + 1, { box: 2 });
      // 铜龟 / 铜鹤
      const turtle = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 10), bronze);
      turtle.scale.set(1, 0.6, 1.3);
      turtle.position.set(s * 9, y + 1.6, zf + 1);
      g.add(turtle);
      this.box(g, marble, 1.6, 1.2, 1.6, s * 13, y + 0.6, zf + 1, { box: 2 });
      const crane = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 2.2, 8), bronze);
      crane.position.set(s * 13, y + 2.3, zf + 1);
      g.add(crane);
      this.col(s * 9 - 0.8, y, zf + 0.2, s * 9 + 0.8, y + 3, zf + 1.8);
      this.col(s * 13 - 0.8, y, zf + 0.2, s * 13 + 0.8, y + 3, zf + 1.8);
    }
    // 日晷：东侧（本场景东 = -X 方向不确定时以中轴对称处理）
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.15, 32), marble);
    dial.rotation.x = Math.PI / 4;
    dial.position.set(-17, y + 1.9, zf + 1);
    g.add(dial);
    this.box(g, marble, 1.4, 1.4, 1.4, -17, y + 0.7, zf + 1, { box: 2 });
    this.box(g, bronze, 1.2, 1.0, 1.2, 17, y + 1.9, zf + 1);
    this.box(g, marble, 1.4, 1.4, 1.4, 17, y + 0.7, zf + 1, { box: 2 });
    for (const x of [-17, 17]) this.col(x - 0.8, y, zf + 0.2, x + 0.8, y + 3, zf + 1.8);
  }

  tripod(g, mat, x, y, z) {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.8, 16), mat);
    body.position.set(x, y + 1.0, z);
    g.add(body);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    lid.position.set(x, y + 1.4, z);
    g.add(lid);
    for (let k = 0; k < 3; k++) {
      const a = k * Math.PI * 2 / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.65, 6), mat);
      leg.position.set(x + Math.cos(a) * 0.35, y + 0.32, z + Math.sin(a) * 0.35);
      g.add(leg);
    }
    this.col(x - 0.6, y, z - 0.6, x + 0.6, y + 2, z + 0.6);
  }

  // ───────────────────────── 殿身（可进入） ─────────────────────────

  /**
   * 殿身：檐柱 + 金柱网格（太和殿 11×5 间 = 72 柱）、前后隔扇门（中间几间敞开可进出）、
   * 两山红墙、额枋彩画、井口天花、金砖地面、宝座台/屏风/藻井/殿内匾额、殿外竖匾、屋顶。
   */
  buildHall(g, data, y, { heightReferenceY = y } = {}) {
    if (data.name === '坤宁宫') return buildKunningPalace(this, g, data, y);
    if (SQUARE_HALLS[data.name]) return buildSquareHall(this, g, data, y);
    const spec = REAL[data.name] ?? {};
    const { width: w, depth: d, height } = dimsOf(data);
    const x0 = data.position.x;
    const z0 = data.position.z;
    const bays = spec.bays ?? Math.max(3, Math.round(w / 6) | 1);
    const inheritedDepthBays = Math.max(3, Math.round(d / 7.4) | 1);
    const baoheDepth = data.name === '保和殿' ? baoheDepthGrid(d) : null;
    const nd = baoheDepth?.depthBays ?? inheritedDepthBays;
    const bayW = w / bays;
    // Structural depth registration must not silently move the inherited throne.
    const dBay = d / inheritedDepthBays;
    const H = THREE.MathUtils.clamp((height - heightReferenceY) * 0.38, 5, 11);
    const baoheFrame = baoheDepth ? baoheInteriorFrame({ w, d, y, H }) : null;
    const beamH = THREE.MathUtils.clamp(H * 0.12, 0.6, 1.4);
    const r = THREE.MathUtils.clamp(bayW * 0.08, 0.3, 0.6);
    const openHalf = (spec.open ?? 3) * bayW / 2;
    const throne = !!spec.throne;
    const taiheCore = data.name === '太和殿';
    const baoheColumns = data.name === '保和殿';
    const taiheGrid = taiheCore ? taiheColumnGrid(w, d) : null;
    const facadeGrid = taiheGrid ?? (data.name === '保和殿' ? baoheColumnGrid(w) : null);
    const openLeft = facadeGrid?.openLeft ?? -openHalf;
    const openRight = facadeGrid?.openRight ?? openHalf;

    const colMat = this.library.material('wood_column');
    const gold = this.ownMat('gold', { color: 0xc9a13b, metalness: 0.85, roughness: 0.3 });
    const columnGeometry = h => {
      const geo = new THREE.CylinderGeometry(r, r * 1.05, h, 14);
      if (baoheColumns) {
      // The lower cap is buried under the retained opaque floor at y + 0.03.
      // Keep all 14-sided mantle triangles and the upper cap, including shadows.
        const bottom = geo.groups.find(group => group.materialIndex === 2);
        geo.setIndex(Array.from(geo.index.array.slice(0, bottom.start)));
        geo.groups = geo.groups.filter(group => group !== bottom);
      }
      return geo;
    };
    const colGeo = columnGeometry(H);
    const highColGeo = baoheFrame ? columnGeometry(baoheFrame.columnHeight) : null;

    // 宝座区（后部中间）
    const ztb1 = z0 + d / 2 - Math.min(0.6 * dBay, 4.5);
    const ztb0 = ztb1 - Math.min(1.6 * dBay, 7);
    const thW = Math.min(1.6 * bayW, w * 0.25);

    // 柱网
    for (let i = 0; i <= bays; i++) {
      const x = facadeGrid ? x0 + facadeGrid.x[i] : x0 - w / 2 + i * bayW;
      // Frontage retains R17 inner stations; Baohe depth uses six unequal drawing axes.
      const classificationX = data.name === '保和殿' ? x0 - w / 2 + i * bayW : x;
      for (let k = 0; k <= nd; k++) {
        const z = baoheDepth ? z0 + baoheDepth.z[k] : taiheGrid ? z0 + taiheGrid.z[k] : z0 - d / 2 + k * dBay;
        const edge = i === 0 || i === bays || k === 0 || k === nd;
        if (taiheGrid && !edge && taiheGrid.centralColumnIndices.includes(i)) continue;
        if (baoheColumns && !baoheDepthColumnPresent(i, k, bays, nd)) continue;
        if (!baoheColumns && !edge && throne && Math.abs(classificationX - x0) < bayW * 0.6 && z > ztb0 - 1 && z < ztb1 + 1) continue;
        const isGold = data.name !== '乾清宫' && !baoheColumns && !taiheCore && throne && !edge && Math.abs(classificationX - x0) < bayW * 1.6 && z > ztb0 - dBay;
        const highColumn = baoheFrame && baoheHighColumn(i, k);
        this.column(g, highColumn ? highColGeo : colGeo, isGold ? gold : colMat, x, z, y,
          highColumn ? baoheFrame.columnHeight : H, r);
        if (baoheColumns) g.children.at(-1).userData.baoheColumn = { i, k, profile: BAOHE_DEPTH_GRID.id };
      }
    }

    if (taiheCore) {
      for (const x of TAIHE_CORE.columns.x) {
        this.column(g, colGeo, colMat, x0 + x, z0 + TAIHE_CORE.columns.redCompanionZ, y, H, r);
        g.children.at(-1).userData.taihePermanent = 'red-companion-column';
      }
      buildTaiheNavigation(this, { x0, z0, y });
      buildTaiheCoreFallback(this, g, { x0, z0, y });
    }

    // 金砖地面
    const floorGeo = new THREE.PlaneGeometry(w, d);
    floorGeo.rotateX(-Math.PI / 2);
    applyPlanarUV(floorGeo, 'y', taiheCore ? TAIHE_FLOOR.tileMetres : data.name === '乾清宫' ? QIANQING_SURFACE.interior.tileMetres : 1.4);
    if (data.name === '乾清宫') {
      // Optional layer has 71 x 38 inherited .64m tiles centred in the hall.
      // Match its half-tile X origin rather than jumping the grid on load.
      const uv = floorGeo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) + .125);
    }
    const floor = new THREE.Mesh(floorGeo, taiheCore ? taiheFloorMaterial(this) : data.name === '乾清宫' ? qianqingSurfaceMaterial(this, 'interior') : this.library.material('stone_slab', { color: 0x55524e, roughness: 0.35 }));
    floor.position.set(x0, y + 0.03, z0);
    floor.receiveShadow = true;
    g.add(floor);

    // 前后檐：隔扇门（中间敞开）+ 上部走马板 + 额枋彩画
    const doorH = (H - beamH) * 0.8;
    const qianqingPassages = data.name === '乾清宫'
      ? qianqingPassageFrame({ x0, z0, y, w, d, H, bayW, r, doorH, beamH }) : null;
    for (const s of [-1, 1]) {
      const zf = z0 + (baoheDepth ? (s < 0 ? baoheDepth.frontDoorZ : baoheDepth.rearDoorZ) : s * d / 2);
      for (let i = 0; i < bays; i++) {
        const xc = facadeGrid ? x0 + (facadeGrid.x[i] + facadeGrid.x[i + 1]) / 2 : x0 - w / 2 + (i + 0.5) * bayW;
        const facadeBayW = facadeGrid ? facadeGrid.x[i + 1] - facadeGrid.x[i] : bayW;
        if (qianqingPassages && (i === 0 || i === bays - 1)) {
          buildQianqingPassageMouth(this, g, qianqingPassages, i === 0 ? -1 : 1, zf);
          continue;
        }
        if (facadeGrid ? facadeGrid.openBayIndices.includes(i) : Math.abs(xc - x0) < openHalf - 0.01) {
          if (baoheColumns && s === -1) {
            buildBaoheFrontDoors(this,g,{xc,zf,y,height:doorH,bayWidth:facadeBayW,columnRadius:r});
            continue;
          }
          // 敞开的门：两扇隔扇折向两侧
          for (const side of [-1, 1]) {
            const leaf = data.name === '乾清宫' && s === -1
              ? qianqingFrontBox(this,g,{kind:'leaf',bay:i,w:facadeBayW*.25,h:doorH,d:.12,
                x:xc+side*(facadeBayW/2-r-.1),y:y+doorH/2,z:zf-s*(facadeBayW*.13+.2)})
              : this.libBox(g, 'lattice_doors', facadeBayW * 0.25, doorH, 0.12,
                xc + side * (facadeBayW / 2 - r - 0.1), y + doorH / 2, zf - s * (facadeBayW * 0.13 + 0.2), 'band');
            leaf.rotation.y = Math.PI / 2;
          }
          continue;
        }
        if (baoheColumns && s === -1) buildBaoheClosedFront(this,g,{bay:i,xc,zf,y,height:doorH,width:facadeBayW-2*r});
        else if (data.name === '乾清宫' && s === -1 && [1,2,6,7].includes(i)) buildQianqingFrontWindow(this,g,{bay:i,xc,zf,y,height:doorH,width:facadeBayW-2*r});
        else if (!((taiheCore || baoheColumns) && s === 1)) this.libBox(g, 'lattice_doors', facadeBayW - 2 * r, doorH, 0.15, xc, y + doorH / 2, zf, 'band');
      }
      if (taiheCore && s === 1) buildTaiheRearEnclosure(this, g, { x0, zf, y, w, openHalf, openLeft, openRight, height: H - beamH });
      if (baoheColumns && s === 1) buildBaoheRearEnclosure(this, g, { x0, zf, y, w, openLeft, openRight, height: H - beamH });
      const solidRear = (taiheCore || baoheColumns) && s === 1;
      this.libBox(g, 'wall_red', solidRear ? openRight - openLeft : w, H - beamH - doorH, 0.3, x0 + (solidRear ? (openLeft + openRight) / 2 : 0), y + doorH + (H - beamH - doorH) / 2, zf, 'box');
      this.libBox(g, 'caihua_beam', w + 0.6, beamH, 0.6, x0, y + H - beamH / 2, zf, 'band');
      const solidEnd = qianqingPassages?.inner ?? w / 2;
      this.col(x0 - solidEnd, y, zf - 0.25, x0 + openLeft, y + 3, zf + 0.25);
      this.col(x0 + openRight, y, zf - 0.25, x0 + solidEnd, y + 3, zf + 0.25);
    }
    // 门槛（矮，可跨过）
    for (const s of [-1, 1]) this.libBox(g, 'wood_column', openRight - openLeft, 0.25, 0.3, x0 + (openLeft + openRight) / 2, y + 0.125, z0 + (baoheDepth ? (s < 0 ? baoheDepth.frontDoorZ : baoheDepth.rearDoorZ) : s * d / 2), 'box');
    // The recessed door/header does not replace the separate south eave beam.
    if (baoheDepth) this.libBox(g, 'caihua_beam', w + 0.6, beamH, 0.6, x0, y + H - beamH / 2, z0 + baoheDepth.southEaveZ, 'band');

    // 两山：红墙 + 下碱; Baohe closes at its outer axes, not the plinth edges.
    const wallDepth = baoheDepth?.sideWallDepth ?? d;
    const wallZ = z0 + (baoheDepth?.sideWallCentre ?? 0);
    for (const s of [-1, 1]) {
      const xs = x0 + s * w / 2;
      this.libBox(g, 'wall_red', 0.9, H - beamH, wallDepth, xs, y + (H - beamH) / 2, wallZ, 'box');
      this.libBox(g, 'wall_brick', 1.0, 1.2, wallDepth + 0.1, xs, y + 0.6, wallZ, 'box');
      this.libBox(g, 'caihua_beam', 0.6, beamH, wallDepth + 0.6, xs, y + H - beamH / 2, wallZ, 'band');
      this.col(xs - 0.5, y, wallZ - wallDepth / 2, xs + 0.5, y + 3, wallZ + wallDepth / 2);
    }
    if (qianqingPassages) buildQianqingPassageWalls(this, g, qianqingPassages);

    // Taihe alone has an upward caisson opening and an independently owned core.
    if (taiheCore) buildTaiheCeiling(this, g, { x0, z0, y, w, d });
    else {
      if (baoheFrame) buildBaoheInteriorCeiling(this, g, { x0, z0, y, w, d, H });
      else {
        const ceilGeo = new THREE.PlaneGeometry(w, d);
        ceilGeo.rotateX(Math.PI / 2);
        applyPlanarUV(ceilGeo, 'y', 1.6);
        const ceiling = new THREE.Mesh(ceilGeo, this.ceilingMaterial());
        ceiling.position.set(x0, y + H - 0.05, z0);
        g.add(ceiling);
      }
      if (throne) this.throneArea(g, { x0, y, H, ztb0, ztb1, thW, bayW, text: spec.inner, caisson: !baoheDepth, baohe: !!baoheDepth, qianqing: data.name === '乾清宫' });
      if (baoheColumns) buildBaoheColumnCouplets(this,g,{x0,z0,y,columnRadius:r});
    }

    // 殿外竖匾
    let exteriorPlaque = null;
    if (spec.plaque !== false) {
      const ph = THREE.MathUtils.clamp(H * 0.32, 1.8, 3.4);
      const plaque = this.plaqueMesh(data.name, ph * 0.62, ph, true);
      plaque.position.set(x0, y + doorH + (H - beamH - doorH) / 2 + 0.2, z0 - d / 2 - 0.4);
      plaque.rotation.y = Math.PI;
      g.add(plaque);
      exteriorPlaque = plaque;
    }

    // 屋顶
    const roof = buildRoof(this.library, {
      type: spec.roof ?? data.features?.roofType ?? 'wudian',
      width: w + 0.6,
      depth: d + 0.6,
      baseY: y + H,
      layers: spec.layers ?? data.features?.roofLayers ?? 1,
      brackets: true,
      sides: 4,
      ...(baoheFrame ? { baoheInteriorOpening: baoheFrame } : {}),
    });
    roof.position.set(x0, 0, z0);
    g.add(roof);
    this.ownedMaterials.push(...(roof.userData.ownedMaterials ?? []));
    paintQianqingUpperEnclosure(roof,this.library,data.name);
    if (exteriorPlaque) positionHallNameboard(exteriorPlaque,roof,data.name);
  }

  throneArea(g, { x0, y, H, ztb0, ztb1, thW, bayW, text, caisson = true, baohe = false, jiaotai = false, qianqing = false }) {
    const lacquer = this.ownMat('lacquer', { color: 0x7a1d12, roughness: 0.4, metalness: 0.1 });
    const gold = this.ownMat('gold', { color: 0xc9a13b, metalness: 0.85, roughness: 0.3 });
    const bronze = this.ownMat('bronze', { color: 0x4a3b28, metalness: 0.7, roughness: 0.45 });
    const depth = ztb1 - ztb0;
    const zc = (ztb0 + ztb1) / 2;
    if (qianqing) registerQianqingCentral(this,g,{x0,y,H,ztb0,ztb1,thW,bayW});
    else {
    // 地平床：两级，金边
    this.box(g, lacquer, thW, 0.6, depth, x0, y + 0.3, zc);
    this.box(g, gold, thW + 0.1, 0.08, depth + 0.1, x0, y + 0.62, zc);
    this.box(g, lacquer, thW * 0.75, 0.6, depth * 0.75, x0, y + 0.95, zc + depth * 0.1);
    for (let k = 0; k < 3; k++) {
      this.box(g, lacquer, thW * 0.3, 0.2 * (k + 1), 0.4, x0, y + 0.1 * (k + 1), ztb0 - 1.2 + k * 0.4);
    }
    this.col(x0 - thW / 2, y, ztb0 - 1.3, x0 + thW / 2, y + 3, ztb1);
    // 宝座 + 屏风
    const ty = y + 1.25;
    const tz = zc + depth * 0.1;
    if (baohe) buildBaoheThroneChair(this,g,{x0,ty,tz});
    else {
      this.box(g, gold, 1.8, 0.7, 1.3, x0, ty + 0.35, tz);
      this.box(g, gold, 1.9, 1.5, 0.25, x0, ty + 1.2, tz + 0.6);
      for (const s of [-1, 1]) this.box(g, gold, 0.2, 0.6, 1.2, x0 + s * 0.9, ty + 0.9, tz);
    }
    if (jiaotai) buildJiaotaiBackdrop(this,g,{x0,ty,tz,depth,thW});
    else if (baohe) buildBaoheThroneScreen(this,g,{x0,ty,tz,depth,thW});
    else {
      this.box(g, gold, Math.min(thW * 0.7, 6), 3.2, 0.3, x0, ty + 1.6, tz + depth * 0.32);
      for (let k = 0; k < 3; k++) {
        this.box(g, gold, 1.2, 0.5, 0.32, x0 + (k - 1) * 1.6, ty + 3.4, tz + depth * 0.32);
      }
    }
    }
    // 香炉、甪端
    for (const s of [-1, 1]) {
      this.tripod(g, bronze, x0 + s * (thW * 0.35), y, ztb0 - 2.2);
    }
    // Preserve shared gold response independently of optional ceiling geometry.
    gold.side = THREE.DoubleSide;
    // Palace Museum, Huangjidian Kaolue (2011), p106: both Baohe and
    // Qianqing are fully panelled, without a caisson. Do not retain the
    // old generic suspended caisson/mirror in either loading state.
    if (caisson && !qianqing) {
      // 藻井 + 轩辕镜
      const cz = zc - depth * 0.15;
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(bayW * 0.9, bayW * 1.05, 0.6, 8, 1, true), gold);
      ring.position.set(x0, y + H - 0.35, cz);
      g.add(ring);
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(bayW * 0.55, bayW * 0.55, 0.1, 32), gold);
      disc.position.set(x0, y + H - 0.12, cz);
      g.add(disc);
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 14),
        this.ownMat('silver', { color: 0xdddddd, metalness: 1, roughness: 0.08 }));
      pearl.position.set(x0, y + H - 1.6, cz);
      g.add(pearl);
    }
    // 殿内横匾
    if (text && !qianqing) {
      const p = baohe ? buildBaoheInteriorPlaque(this) : this.plaqueMesh(text, 4.2, 1.3, false);
      p.position.set(x0, y + H - 1.1, ztb0 - 0.5);
      p.rotation.y = Math.PI;
      g.add(p);
    }
  }

  // ───────────────────────── Canvas 纹理（匾额 / 天花） ─────────────────────────

  plaqueMesh(text, w, h, vertical) {
    const key = `plaque:${text}`;
    if (!this._own.has(key)) {
      const cw = vertical ? 256 : 512;
      const chh = Math.round(cw * h / w);
      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = chh;
      const c = canvas.getContext('2d');
      c.fillStyle = '#c8a23c';
      c.fillRect(0, 0, cw, chh);
      c.fillStyle = '#7a5a12';
      c.fillRect(10, 10, cw - 20, chh - 20);
      c.fillStyle = '#c8a23c';
      c.fillRect(16, 16, cw - 32, chh - 32);
      c.fillStyle = '#1e3a6b';
      c.fillRect(28, 28, cw - 56, chh - 56);
      c.fillStyle = '#e8c55a';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      const chars = [...text];
      const font = '"STKaiti","KaiTi","Kaiti SC","Songti SC","SimSun",serif';
      if (vertical) {
        const step = (chh - 80) / chars.length;
        c.font = `bold ${Math.floor(Math.min(step * 0.85, cw * 0.6))}px ${font}`;
        chars.forEach((ch, i) => c.fillText(ch, cw / 2, 40 + step * (i + 0.5)));
      } else {
        const step = (cw - 80) / chars.length;
        c.font = `bold ${Math.floor(Math.min(step * 0.85, chh * 0.6))}px ${font}`;
        chars.forEach((ch, i) => c.fillText(ch, 40 + step * (i + 0.5), chh / 2));
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      this.ownMat(key, { map: tex, roughness: 0.5, metalness: 0.2 });
    }
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.15), this._own.get(key));
    m.userData.noMerge = true;
    return m;
  }

  ceilingMaterial() {
    const key = 'ceiling';
    if (!this._own.has(key)) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 256;
      const c = canvas.getContext('2d');
      c.fillStyle = '#c9a24a';
      c.fillRect(0, 0, 256, 256);
      c.fillStyle = '#2d5a4c';
      c.fillRect(12, 12, 232, 232);
      c.strokeStyle = '#c9a24a';
      c.lineWidth = 6;
      c.strokeRect(34, 34, 188, 188);
      c.fillStyle = '#2a4b7c';
      c.beginPath();
      c.arc(128, 128, 70, 0, Math.PI * 2);
      c.fill();
      c.lineWidth = 5;
      c.stroke();
      c.fillStyle = '#e0bb55';
      c.beginPath();
      c.arc(128, 128, 26, 0, Math.PI * 2);
      c.fill();
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        c.beginPath();
        c.arc(128 + Math.cos(a) * 48, 128 + Math.sin(a) * 48, 9, 0, Math.PI * 2);
        c.fill();
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      this.ownMat(key, { map: tex, roughness: 0.8, side: THREE.DoubleSide });
    }
    return this._own.get(key);
  }

  // ───────────────────────── 门 ─────────────────────────

  buildGate(data) {
    if (data.name === '乾清门') return buildQianqingGate(this, data);
    if (data.name === '午门') {
      this.buildWumen(data);
      return;
    }
    if (data.name === '神武门') {
      this.cityGate(data);
      return;
    }
    // 宫门（太和门、乾清门）：台基 + 门殿（中柱一线设门，前后檐敞开）
    this.buildComplex([data], { name: data.name, apron: 3, margin: 3 });
  }

  /**
   * 午门（P1-Z-axis A1）：凹形墩台（平面"凹"字，开口朝南）+ 正楼 + 两翼雁翅楼 + 四角重檐攒尖方亭。
   * 局部坐标原点 = 正楼中心（LAYOUT.WUMEN_Z），+Z 北。尺寸见 DIMENSIONS.WUMEN（dimensions.md:79–82）。
   * - 主墩台 x ∈ ±W/2，z ∈ [platformSouth, platformNorth]，开三门洞（中门 9 m，左右掖门 5 m @ ±17.5）
   * - 两翼墩台 x ∈ ±[wingInnerX, W/2]，z ∈ [wingSouth, platformSouth]，实心
   * - 回归约束：x=0 中门洞贯通；(15, 0) 为中门与掖门间实墙；(40, −14) 在凹口内为空地
   */
  buildWumen(data) {
    const g = this.begin(data);
    const dm = data.dimensions;
    const W = dm.platformWidth;
    const PH = dm.platformHeight;
    const zS = dm.platformSouth;
    const zN = dm.platformNorth;
    const wS = dm.wingSouth;
    const wIn = dm.wingInnerX;
    const D = zN - zS;
    const zc = (zS + zN) / 2;
    const band = 1.2;

    // 主墩台：门洞之间的实墙段
    const openings = [{ x: -17.5, w: 5 }, { x: 0, w: 9 }, { x: 17.5, w: 5 }];
    let prev = -W / 2;
    const segs = [];
    for (const o of openings) {
      segs.push([prev, o.x - o.w / 2]);
      prev = o.x + o.w / 2;
    }
    segs.push([prev, W / 2]);
    for (const [a, b] of segs) {
      this.libBox(g, 'wall_red', b - a, PH - band, D, (a + b) / 2, band + (PH - band) / 2, zc, 'box');
      this.libBox(g, 'sumeru_band', b - a + 0.2, band, D + 0.2, (a + b) / 2, band / 2, zc, 'band');
      this.col(a, 0, zS, b, 3, zN);
    }
    for (const o of openings) {
      const tunnelH = o.w >= 8 ? 8 : 6.5;
      this.libBox(g, 'wall_red', o.w, PH - tunnelH, D, o.x, tunnelH + (PH - tunnelH) / 2, zc, 'box');
      this.libBox(g, 'wall_brick', o.w, 0.3, D - 0.2, o.x, tunnelH - 0.15, zc, 'box');
      for (const s of [-1, 1]) {
        const leaf = buildStuddedDoor(this.library, { width: o.w * 0.48, height: tunnelH - 0.5 });
        leaf.position.set(o.x + s * (o.w / 2 - 0.15), 0, zS + 2 + o.w * 0.24);
        leaf.rotation.y = Math.PI / 2;
        g.add(leaf);
        // Match upper-door proxies: transformed leaf bounds, limited to body height.
        leaf.updateMatrixWorld(true);
        const b = new THREE.Box3().setFromObject(leaf);
        this.col(b.min.x, Math.max(0, b.min.y), b.min.z, b.max.x, Math.min(3, b.max.y), b.max.z);
      }
    }
    // 两翼墩台（实心，顶面不开放）
    const wL = zS - wS;
    for (const s of [-1, 1]) {
      const wx = s * (wIn + W / 2) / 2;
      const ww = W / 2 - wIn;
      this.libBox(g, 'wall_red', ww, PH - band, wL, wx, band + (PH - band) / 2, wS + wL / 2, 'box');
      this.libBox(g, 'sumeru_band', ww + 0.2, band, wL + 0.2, wx, band / 2, wS + wL / 2, 'band');
      this.libBox(g, 'stone_slab', ww + 0.4, 0.3, wL + 0.2, wx, PH + 0.15, wS + wL / 2 - 0.1, 'box');
      this.col(s * wIn, 0, wS, s * W / 2, 3, zS);
    }
    this.libBox(g, 'stone_slab', W + 0.4, 0.3, D + 0.4, 0, PH + 0.15, zc, 'box');

    // 午门专属三跑折返马道：官方平面支持拓扑；高度和配准为明确的模型拟合。
    // 直接使用门局部原点，不沿用旧直坡子组的 zc 偏移。
    const top = PH + 0.3;
    const sub = new THREE.Group();
    g.add(sub);
    buildWumenAscent(this, sub);

    // 正楼：面阔 60.05 × 进深 25，重檐庑殿，9 间（dimensions.md:79）
    // 正楼前后廊与中门：2.9m 内墙轴线退距为来源图纸配准的暂定值，非实测净宽。
    const body = buildGateTowerShell(this.library, wumenTowerGeometry());
    this.ownedMaterials.push(...body.userData.ownedMaterials);
    body.position.y = top;
    g.add(body);
    for (const b of body.userData.colliders ?? []) {
      this.col(b.min.x, b.min.y + top, b.min.z, b.max.x, b.max.y + top, b.max.z);
    }
    const roof = buildRoof(this.library, {
      type: 'wudian', width: dm.width + 0.6, depth: dm.depth + 0.6,
      baseY: top + body.userData.topY, layers: 2, brackets: true, height: 9,
      wumenVerticalProfile: WUMEN_VERTICAL_PROFILE,
    });
    g.add(roof);
    this.ownedMaterials.push(...(roof.userData.ownedMaterials ?? []));
    this.wumenTopY = roof.userData.topY - PH; // 沿用模型相对高度；公布总高与城台顶起算标高的对应关系未核定
    g.add(buildWumenSouthPlaque(this, roof));

    // 雁翅楼：沿 Z 的长廊（单檐庑殿，13 间），南北两端重檐四角攒尖方亭（dimensions.md:80–82）
    const hw = dm.wingHallWidth;
    const P = dm.cornerPavilion;
    const hx = wIn + 0.6 + hw / 2;                // 雁翅楼中线（真实约 ±45，此处 ±47.7，见报告）
    const pS = wS + 0.5 + P / 2;                  // 南方亭中心
    const pN = -0.5 - P / 2;                      // 北方亭中心（坐主墩台上，正楼两侧）
    const h0 = pS + P / 2, h1 = pN - P / 2;       // 廊身南北端
    for (const s of [-1, 1]) {
      const wing = new THREE.Group();
      wing.position.set(s * hx, top, (h0 + h1) / 2);
      wing.rotation.y = Math.PI / 2;
      const wb = buildHallBody(this.library, { width: h1 - h0, depth: hw, height: 6.5, bays: 13, facade: 'lattice' });
      wing.add(wb);
      const wr = buildRoof(this.library, { type: 'wudian', width: h1 - h0 + 0.4, depth: hw + 0.4, baseY: wb.userData.topY, layers: 1, brackets: true, detail: 'low' });
      wing.add(wr);
      this.ownedMaterials.push(...(wr.userData.ownedMaterials ?? []));
      g.add(wing);
      for (const pz of [pS, pN]) {
        const pb = buildHallBody(this.library, { width: P, depth: P, height: 7.5, bays: 3, facade: 'lattice' });
        pb.position.set(s * hx, top, pz);
        g.add(pb);
        const pr = buildRoof(this.library, { type: 'pavilion', width: P + 0.4, depth: P + 0.4, baseY: top + pb.userData.topY, layers: 2, brackets: true, detail: 'low' });
        pr.position.set(s * hx, 0, pz);
        g.add(pr);
        this.ownedMaterials.push(...(pr.userData.ownedMaterials ?? []));
      }
      // 北方亭坐在可登临的主墩台顶上：登记亭身碰撞
      this.col(s * hx - P / 2, top, pN - P / 2, s * hx + P / 2, top + 3, pN + P / 2);
    }
    this.finish(g);
  }

  /** 城台式门楼（神武门）：红墙城台 + 三个门洞 + 重檐城楼 */
  cityGate(data) {
    const g = this.begin(data);
    const { width: W, depth: D } = data.dimensions;
    const PH = 10;
    const tunnelH = 6.5;
    const openings = [{ x: -13, w: 5 }, { x: 0, w: 6.5 }, { x: 13, w: 5 }];
    let prev = -W / 2;
    const segs = [];
    for (const o of openings) {
      segs.push([prev, o.x - o.w / 2]);
      prev = o.x + o.w / 2;
    }
    segs.push([prev, W / 2]);
    for (const [a, b] of segs) {
      this.libBox(g, 'wall_red', b - a, PH, D, (a + b) / 2, PH / 2, 0, 'box');
      this.libBox(g, 'sumeru_band', b - a + 0.2, 1, D + 0.2, (a + b) / 2, 0.5, 0, 'band');
      this.col(a, 0, -D / 2, b, 3, D / 2);
    }
    for (const o of openings) {
      this.libBox(g, 'wall_red', o.w, PH - tunnelH, D, o.x, tunnelH + (PH - tunnelH) / 2, 0, 'box');
      this.libBox(g, 'wall_brick', o.w, 0.3, D - 0.2, o.x, tunnelH - 0.15, 0, 'box');
      for (const s of [-1, 1]) {
        const leaf = buildStuddedDoor(this.library, { width: o.w * 0.48, height: tunnelH - 0.5 });
        leaf.position.set(o.x + s * (o.w / 2 - 0.15), 0, -D / 2 + 2 + o.w * 0.24);
        leaf.rotation.y = Math.PI / 2;
        g.add(leaf);
        // Match upper-door proxies: transformed leaf bounds, limited to body height.
        leaf.updateMatrixWorld(true);
        const b = new THREE.Box3().setFromObject(leaf);
        this.col(b.min.x, Math.max(0, b.min.y), b.min.z, b.max.x, Math.min(3, b.max.y), b.max.z);
      }
    }
    this.libBox(g, 'stone_slab', W + 0.4, 0.3, D + 0.4, 0, PH + 0.15, 0, 'box');
    // 登城马道：城台南面（宫内一侧）东西两端各一条；城台顶四周红色宇墙（带碰撞），马道处开口
    const top = PH + 0.3;
    const asc = toWorld(buildGateAscent(this.library, g, {
      W, D, topY: top, band: [-D / 2, -D / 2 + 5], edge: 'wall',
    }), new THREE.Matrix4().makeTranslation(this.ox, 0, this.oz));
    this.colliders.push(...asc.colliders);
    this.walkables.push(...asc.walkables);
    // 显式测量轴网与四面廊：竖向台明/阶梯暂缓，沿用 10.3m 平台标高。
    const towerProfile = shenwuTowerGeometry();
    const body = buildGateTowerShell(this.library, towerProfile);
    this.ownedMaterials.push(...body.userData.ownedMaterials);
    body.position.y = top;
    g.add(body);
    // 城楼屋身碰撞（在城台顶面上），绕城楼一圈可走
    for (const b of body.userData.colliders ?? []) {
      this.col(b.min.x, b.min.y + top, b.min.z, b.max.x, b.max.y + top, b.max.z);
    }
    const roof = buildRoof(this.library, {
      type: 'wudian', width: towerProfile.width + 0.6, depth: towerProfile.depth + 0.6,
      baseY: PH + 0.3 + body.userData.topY, layers: 2, brackets: true,
    });
    g.add(roof);
    this.ownedMaterials.push(...(roof.userData.ownedMaterials ?? []));
    g.add(buildShenwuInstitutionPlaque(this, { platformDepth: D, platformHeight: PH, tunnelHeight: tunnelH }));
    g.userData.gatePlaqueOmissions = [structuredClone(SHENWU_GATE_NAME_OMISSION)];
    this.finish(g);
  }

  // ───────────────────────── 内金水河与五座金水桥 ─────────────────────────

  buildRiver(data) {
    const g = this.begin(data);
    const { width: W, depth: D } = data.dimensions;
    const waterY = -1.1;
    // 桥位 / 桥宽唯一数据源：palace/river.js（x 0、±13、±30，宽 6.1；dimensions.md:85）
    const bridgeList = riverBridges(data);
    const bridges = bridgeList.map(b => b.x - this.ox);
    const BW = bridgeList[0].halfW; // 桥面半宽（桥栏中线），五桥同宽
    const L = Math.max(JINSHUI_BRIDGE_LENGTH, D + 2); // 桥长 21（量算 20.6–23.0），两岸各伸出驳岸 3m
    const crest = 0.9;        // 拱顶抬高

    // 河道：驳岸石墙 + 河床
    for (const s of [-1, 1]) {
      this.libBox(g, 'wall_brick', W, 2.4, 0.6, 0, -1.2, s * (D / 2 - 0.3), 'box');
      this.libBox(g, 'marble', W + 1.6, 0.12, 0.9, 0, 0.04, s * (D / 2 + 0.45), 'box');
      this.libBox(g, 'wall_brick', 0.6, 2.4, D, s * (W / 2 - 0.3), -1.2, 0, 'box');
    }
    this.libBox(g, 'stone_slab', W, 0.2, D, 0, -2.3, 0, 'box');

    // 岸边栏杆：在桥位留口
    for (const s of [-1, 1]) {
      const z = s * (D / 2 + 0.45);
      let a = -W / 2;
      for (const bx of bridges) {
        this.rail(g, a, z, bx - BW - 0.3, z, 0.1);
        a = bx + BW + 0.3;
      }
      this.rail(g, a, z, W / 2, z, 0.1);
    }
    for (const s of [-1, 1]) this.rail(g, s * (W / 2 + 0.5), -D / 2 - 0.45, s * (W / 2 + 0.5), D / 2 + 0.45, 0.1);

    // 金水桥：两段坡面（与行走 ramp 一致）+ 桥身 + 桥栏
    const hl = L / 2;
    const slope = Math.atan2(crest, hl);
    const sl = Math.hypot(hl, crest);
    const marble = this.library.material('marble');
    for (const bx of bridges) {
      for (const s of [-1, 1]) {
        const deck = this.box(g, marble, BW * 2, 0.4, sl, bx, crest / 2 - 0.2, s * hl / 2, { box: 2 });
        deck.rotation.x = s * slope;
        for (const sx of [-1, 1]) {
          const holder = new THREE.Group();
          holder.position.set(bx + sx * (BW - 0.1), crest / 2, s * hl / 2);
          holder.rotation.x = s * slope;
          const r = buildBalustrade(this.library, { length: sl, height: 0.95 });
          r.rotation.y = Math.PI / 2;
          holder.add(r);
          g.add(holder);
        }
        this.walkRampZ(bx - BW + 0.3, bx + BW - 0.3, s * hl, 0, 0, crest);
      }
      // 桥身（水中拱券墩，含暗色券洞）
      this.box(g, marble, BW * 2 - 0.2, 1.6, D - 1.4, bx, -0.6, 0, { box: 2 });
      const arch = new THREE.Mesh(new THREE.CircleGeometry(1.3, 20, 0, Math.PI),
        this.ownMat('archShadow', { color: 0x161412, roughness: 1, side: THREE.DoubleSide }));
      arch.position.set(bx, waterY + 0.05, 0);
      arch.rotation.y = Math.PI / 2;
      for (const sx of [-1, 1]) {
        const a = arch.clone();
        a.position.x = bx + sx * (BW - 0.05);
        g.add(a);
      }
      // 桥栏碰撞只登记到两岸岸边栏杆（局部 z ±(D/2+0.6)，与岸栏接上不留缝）；桥长 21 > D 时伸上岸的引桥段
      // 不挡（同 GardenBuilder 池中亭石桥）。否则 ±30 桥的引桥栏杆伸到 z −300.3，会截断协和门/熙和门东西通道。
      const railHz = Math.min(hl, D / 2 + 0.6);
      for (const sx of [-1, 1]) this.col(bx + sx * BW - 0.15, -0.5, -railHz, bx + sx * BW + 0.15, crest + 1.4, railHz);
    }
    this.finish(g);

    // 水面：单独网格，保持 materials.water（回归测试按材质识别水面）
    const water = new THREE.Mesh(new THREE.PlaneGeometry(W - 1.2, D - 1.2), this.materials.water);
    water.rotation.x = -Math.PI / 2;
    water.position.set(this.ox, waterY, this.oz);
    water.userData.isWater = true;
    water.receiveShadow = true;
    this.addObject(water);
  }

  getWalkables() {
    return [...this.walkables];
  }

  getColliders() {
    return [...this.colliders];
  }

  dispose() {
    const geos = new Set();
    const mats = new Set([this.materials.water, ...this.ownedMaterials].filter(Boolean));
    this.ownedObjects.forEach(obj => {
      obj.traverse(c => {
        if (c.geometry) geos.add(c.geometry);
        const list = c.material ? (Array.isArray(c.material) ? c.material : [c.material]) : [];
        list.forEach(m => { if (!this.library?.owns?.(m)) mats.add(m); });
      });
      obj.removeFromParent();
    });
    geos.forEach(g => g.dispose());
    mats.forEach(m => m.dispose());
    this.ownedObjects.clear();
    this.colliders.length = 0;
    this.walkables.length = 0;
    this.terraceProfiles.length = 0;
    this.taiheSouthTiers.length = 0;
    this.ownedMaterials.length = 0;
    this._own.clear();
    this.materials = {};
    this.textures = {};
  }
}
