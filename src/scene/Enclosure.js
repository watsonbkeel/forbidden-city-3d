import * as THREE from 'three';
import { buildRoof, buildWallCap, buildCornerTower } from './RoofBuilder.js';
import { buildHallBody } from './HallKit.js';
import { applyBoxUV } from '../utils/GeometryUV.js';
import { mergeByMaterial } from '../utils/MergeUtils.js';
import { LAYOUT } from '../config/constants.js';
import { getBuildingData } from './Layout.js';

// 东华门 / 西华门门洞中心 z（data/anchors.json；城台由 zone outer-east / outer-west 的 cityGate 建造）
const EAST_GATE_Z = -257;
const WEST_GATE_Z = -260.6;
const CITY_GATE_W = 30; // CourtKit.cityGate 默认城台宽

/**
 * 宫城围合：外城墙与角楼、院落隔墙、两侧庑房、午门前朝房。
 *
 * - 构造：new Enclosure(scene, library)
 * - build()：创建全部几何并加入场景
 * - getColliders()：返回 THREE.Box3[]（世界坐标，覆盖每段实体墙/建筑的落地范围）
 * - update(dt)：预留（当前无动画）
 * - dispose()：移除自有对象并释放自有几何与 ownedMaterials；不得 dispose library 提供的材质/贴图
 */
export class Enclosure {
  constructor(scene, library) {
    this.scene = scene;
    this.library = library;
    this.group = new THREE.Group();
    this.group.name = 'enclosure';
    this.colliders = [];
    this.ownedMaterials = [];
  }

  build() {
    const tempGroup = new THREE.Group();
    tempGroup.name = 'enclosure_temp';
    
    // 1. 外城墙与角楼
    this.buildOuterWalls(tempGroup);
    this.buildCornerTowers(tempGroup);
    
    // 2. 午门外朝房（宫城内的院墙、庑房、各门由 SideCourts 统一建造）
    this.buildCorridorHalls(tempGroup);
    
    // 先把 tempGroup 加到场景以计算世界坐标（mergeByMaterial 需要）
    this.scene.add(tempGroup);
    
    // 合并减少 draw call
    const merged = mergeByMaterial(tempGroup, { castShadow: true, receiveShadow: true, name: 'enclosure' });
    
    // 移除临时组，用合并后的替换
    tempGroup.removeFromParent();
    this.group = merged;
    this.scene.add(this.group);
    
    return this;
  }

  /** 城墙规格：取 Layout 外围城墙条目 */
  wallSpec() {
    const d = getBuildingData('外围城墙').dimensions;
    return { wallH: d.wallHeight, wallT: d.wallThickness };
  }

  /** 城墙中线：外廓（LAYOUT.PALACE_RECT，城墙外皮）向内收半个墙厚 */
  wallLines() {
    const { wallT } = this.wallSpec();
    const { halfX, minZ, maxZ } = LAYOUT.PALACE_RECT;
    return { x: halfX - wallT / 2, zS: minZ + wallT / 2, zN: maxZ - wallT / 2 };
  }

  /**
   * 建外城墙：矩形围合，南墙在午门处断开，北墙在神武门处断开，东西墙在东华门 / 西华门处断开
   */
  buildOuterWalls(parent) {
    const { wallH, wallT } = this.wallSpec();
    const brickH = 1.5; // 下碱高度
    const { x: X, zS, zN } = this.wallLines();

    const redMat = this.library.material('wall_red');
    const brickMat = this.library.material('wall_brick');

    // 南墙：午门城台两侧接出（开口 = 午门城台宽）
    const wm = getBuildingData('午门');
    const wHalf = (wm.dimensions.platformWidth ?? wm.dimensions.width) / 2;
    this.addWallSegment(parent, { x1: wm.position.x + wHalf, x2: X, z: zS, h: wallH, t: wallT, brickH }, redMat, brickMat);
    this.addWallSegment(parent, { x1: -X, x2: wm.position.x - wHalf, z: zS, h: wallH, t: wallT, brickH }, redMat, brickMat);

    // 北墙：神武门城台两侧接出（开口 = 神武门面阔）
    const sw = getBuildingData('神武门');
    const sHalf = sw.dimensions.width / 2;
    this.addWallSegment(parent, { x1: sw.position.x + sHalf, x2: X, z: zN, h: wallH, t: wallT, brickH }, redMat, brickMat);
    this.addWallSegment(parent, { x1: -X, x2: sw.position.x - sHalf, z: zN, h: wallH, t: wallT, brickH }, redMat, brickMat);

    // 东西墙：东华门 / 西华门城台（zone outer-east / outer-west 的 cityGate，W = 30）处断开
    for (const [x, gz] of [[-X, EAST_GATE_Z], [X, WEST_GATE_Z]]) {
      this.addWallSegmentZ(parent, { z1: zS, z2: gz - CITY_GATE_W / 2, x, h: wallH, t: wallT, brickH }, redMat, brickMat);
      this.addWallSegmentZ(parent, { z1: gz + CITY_GATE_W / 2, z2: zN, x, h: wallH, t: wallT, brickH }, redMat, brickMat);
    }
  }

  /**
   * 添加一段沿 X 方向的墙（x1 到 x2，固定 z）
   */
  addWallSegment(parent, { x1, x2, z, h, t, brickH }, redMat, brickMat) {
    const len = Math.abs(x2 - x1);
    const cx = (x1 + x2) / 2;
    
    // 下碱（灰砖）
    const base = new THREE.Mesh(
      applyBoxUV(new THREE.BoxGeometry(len, brickH, t), this.library.tileSize('wall_brick')),
      brickMat
    );
    base.position.set(cx, brickH / 2, z);
    base.castShadow = base.receiveShadow = true;
    parent.add(base);
    
    // 墙身（红墙）
    const wallBody = new THREE.Mesh(
      applyBoxUV(new THREE.BoxGeometry(len, h - brickH, t), this.library.tileSize('wall_red')),
      redMat
    );
    wallBody.position.set(cx, brickH + (h - brickH) / 2, z);
    wallBody.castShadow = wallBody.receiveShadow = true;
    parent.add(wallBody);
    
    // 墙帽（黄琉璃）
    const cap = buildWallCap(this.library, { length: len, thickness: t });
    cap.position.set(cx, h, z);
    parent.add(cap);
    
    // 垛口（外侧，简化为凸起的矩形块，间隔布置）
    const crenelH = 1.2;
    const crenelW = 1.5;
    const spacing = 3.5;
    const count = Math.floor(len / spacing);
    for (let i = 0; i < count; i++) {
      const crenel = new THREE.Mesh(
        new THREE.BoxGeometry(crenelW, crenelH, t * 0.4),
        redMat
      );
      crenel.position.set(x1 + (i + 0.5) * (len / count), h + crenelH / 2, z - t / 2 - t * 0.2);
      crenel.castShadow = true;
      parent.add(crenel);
    }
    
    // 碰撞体（只登记 y<3 的部分）
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(Math.min(x1, x2), 0, z - t / 2),
      new THREE.Vector3(Math.max(x1, x2), Math.min(h, 3), z + t / 2)
    ));
  }

  /**
   * 添加一段沿 Z 方向的墙（z1 到 z2，固定 x）
   */
  addWallSegmentZ(parent, { z1, z2, x, h, t, brickH }, redMat, brickMat) {
    const len = Math.abs(z2 - z1);
    const cz = (z1 + z2) / 2;
    
    // 下碱
    const base = new THREE.Mesh(
      applyBoxUV(new THREE.BoxGeometry(t, brickH, len), this.library.tileSize('wall_brick')),
      brickMat
    );
    base.position.set(x, brickH / 2, cz);
    base.castShadow = base.receiveShadow = true;
    parent.add(base);
    
    // 墙身
    const wallBody = new THREE.Mesh(
      applyBoxUV(new THREE.BoxGeometry(t, h - brickH, len), this.library.tileSize('wall_red')),
      redMat
    );
    wallBody.position.set(x, brickH + (h - brickH) / 2, cz);
    wallBody.castShadow = wallBody.receiveShadow = true;
    parent.add(wallBody);
    
    // 墙帽
    const cap = buildWallCap(this.library, { length: len, thickness: t });
    cap.position.set(x, h, cz);
    cap.rotation.y = Math.PI / 2;
    parent.add(cap);
    
    // 垛口
    const crenelH = 1.2;
    const crenelW = 1.5;
    const spacing = 3.5;
    const count = Math.floor(len / spacing);
    for (let i = 0; i < count; i++) {
      const crenel = new THREE.Mesh(
        new THREE.BoxGeometry(t * 0.4, crenelH, crenelW),
        redMat
      );
      const side = x > 0 ? 1 : -1;
      crenel.position.set(x + side * (t / 2 + t * 0.2), h + crenelH / 2, z1 + (i + 0.5) * (len / count));
      crenel.castShadow = true;
      parent.add(crenel);
    }
    
    // 碰撞体
    this.colliders.push(new THREE.Box3(
      new THREE.Vector3(x - t / 2, 0, Math.min(z1, z2)),
      new THREE.Vector3(x + t / 2, Math.min(h, 3), Math.max(z1, z2))
    ));
  }

  /**
   * 四个角楼（P1-Z-axis A4）。
   *
   * 位置：anchors.json 的四角楼坐标是 OSM 坐标系（比官方外廓整体偏北 20–30 m，dimensions.md:41–42），
   * 北侧两座直接用会落到城墙外，故不取绝对坐标，而取"相对城墙"的内收量：
   *   OSM 各角楼中心相对同源 OSM 城墙中线向宫内内收 —— 东南 (10.4, 12.1)、西南 (11.0, 9.8)、
   *   东北 x 11.6、西北 x 11.6（dimensions.md:48–51/143–146；北墙 OSM 中线未给出，z 向取对称）→ 均值 ≈ 11.1 m。
   *   这正好等于 角楼外廓半宽 14.5 − 半墙厚 4.3：角楼外皮与城墙外皮齐平，楼身向宫内伸出（与实物一致）。
   *   本场景角楼中心 = 城墙中线交点向内各收 CORNER_INSET。
   * 尺寸：通高 27.5 含城墙 10 → 墙顶以上 17.5；平面含抱厦约 29 × 29（dimensions.md:142）。
   * 墙角加转角墩台（实心，顶面与墙顶平，外皮与城墙外皮齐平），角楼坐其上。
   */
  buildCornerTowers(parent) {
    const { wallH, wallT } = this.wallSpec();
    const { x, zS, zN } = this.wallLines();
    const CORNER_INSET = 11.1;
    const TOWER_SPAN = 29;
    const TOWER_H = 27.5 - wallH;
    const half = CORNER_INSET + wallT / 2; // 墩台半宽：外皮与城墙外皮齐平
    const redMat = this.library.material('wall_red');
    const brickMat = this.library.material('wall_brick');
    for (const [sx, z, sz] of [[1, zS, 1], [-1, zS, 1], [1, zN, -1], [-1, zN, -1]]) {
      const cx = sx * (x - CORNER_INSET);
      const cz = z + sz * CORNER_INSET;
      const base = new THREE.Mesh(applyBoxUV(new THREE.BoxGeometry(half * 2, 1.5, half * 2), this.library.tileSize('wall_brick')), brickMat);
      base.position.set(cx, 0.75, cz);
      parent.add(base);
      const body = new THREE.Mesh(applyBoxUV(new THREE.BoxGeometry(half * 2 - 0.1, wallH - 1.5, half * 2 - 0.1), this.library.tileSize('wall_red')), redMat);
      body.position.set(cx, 1.5 + (wallH - 1.5) / 2, cz);
      parent.add(body);
      this.colliders.push(new THREE.Box3(
        new THREE.Vector3(cx - half, 0, cz - half), new THREE.Vector3(cx + half, 3, cz + half)));

      const tower = buildCornerTower(this.library, { size: 20 });
      const b = new THREE.Box3().setFromObject(tower);
      tower.scale.set(TOWER_SPAN / (b.max.x - b.min.x), TOWER_H / b.max.y, TOWER_SPAN / (b.max.z - b.min.z));
      tower.position.set(cx, wallH, cz);
      this.ownedMaterials.push(...(tower.userData.ownedMaterials ?? []));
      parent.add(tower);
    }
  }

  /**
   * 庑房（廊庑）
   */
  buildCorridorHalls(parent) {
    // 午门外朝房已改由 SideCourts 用 CourtKit.corridor 建造（可进入、带室内）。保留此方法供扩展。
  }

  /**
   * 添加一段庑房（长条形）
   */
  addCorridorSection(parent, { x, z1, z2, w, d, h }) {
    const len = Math.abs(z2 - z1);
    const cz = (z1 + z2) / 2;
    
    // 柱廊朝向内侧（x=0 方向），背面是墙
    const body = buildHallBody(this.library, {
      width: w,
      depth: len,
      height: h,
      bays: Math.max(3, Math.round(len / 6) | 1),
      facade: 'wall',
    });
    body.rotation.y = Math.PI / 2; // 旋转使进深沿 Z
    body.position.set(x, 0, cz);
    parent.add(body);
    
    // 屋顶（硬山）
    const roof = buildRoof(this.library, {
      type: 'gable',
      width: w,
      depth: len,
      baseY: h,
      brackets: false,
      detail: 'low',
    });
    roof.rotation.y = Math.PI / 2;
    roof.position.set(x, 0, cz);
    parent.add(roof);
    
    // 碰撞体（取body的局部碰撞体转世界坐标）
    if (body.userData.colliders) {
      body.updateMatrixWorld(true);
      for (const localBox of body.userData.colliders) {
        const worldBox = localBox.clone().applyMatrix4(body.matrixWorld);
        this.colliders.push(worldBox);
      }
    }
  }

  /**
   * 两层楼阁（体仁阁/弘义阁）
   */
  addPavilionHall(parent, { x, z, w, d, h }) {
    const body = buildHallBody(this.library, {
      width: w,
      depth: d,
      height: h * 0.6,
      bays: 5,
      facade: 'lattice',
    });
    body.position.set(x, 0, z);
    parent.add(body);
    
    const roof = buildRoof(this.library, {
      type: 'xieshan',
      width: w,
      depth: d,
      baseY: h * 0.6,
      layers: 2,
      brackets: true,
      detail: 'low',
    });
    roof.position.set(x, 0, z);
    parent.add(roof);
    
    if (body.userData.colliders) {
      body.updateMatrixWorld(true);
      for (const localBox of body.userData.colliders) {
        this.colliders.push(localBox.clone().applyMatrix4(body.matrixWorld));
      }
    }
  }

  /**
   * 小门楼（协和门/熙和门）
   */
  addGateHall(parent, { x, z, w, d, h }) {
    const body = buildHallBody(this.library, {
      width: w,
      depth: d,
      height: h * 0.6,
      bays: 3,
      facade: 'open',
    });
    body.position.set(x, 0, z);
    parent.add(body);
    
    const roof = buildRoof(this.library, {
      type: 'xieshan',
      width: w,
      depth: d,
      baseY: h * 0.6,
      layers: 1,
      brackets: false,
      detail: 'low',
    });
    roof.position.set(x, 0, z);
    parent.add(roof);
    
    if (body.userData.colliders) {
      body.updateMatrixWorld(true);
      for (const localBox of body.userData.colliders) {
        this.colliders.push(localBox.clone().applyMatrix4(body.matrixWorld));
      }
    }
  }

  getColliders() {
    return [...this.colliders];
  }

  update() {}

  dispose() {
    const geometries = new Set();
    this.group.traverse(child => {
      if (child.geometry) geometries.add(child.geometry);
      // 收集 RoofBuilder 返回的 ownedMaterials
      if (child.userData?.ownedMaterials) {
        this.ownedMaterials.push(...child.userData.ownedMaterials);
      }
    });
    geometries.forEach(g => g.dispose());
    this.ownedMaterials.forEach(m => {
      if (!this.library.owns(m)) m.dispose();
    });
    this.group.removeFromParent();
    this.group.clear();
    this.colliders.length = 0;
    this.ownedMaterials.length = 0;
  }
}
