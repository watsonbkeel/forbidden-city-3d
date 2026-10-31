import * as THREE from 'three';
import { applyBoxUV, applyBandUV } from '../../utils/GeometryUV.js';
import { buildStuddedDoor } from '../HallKit.js';

/**
 * 可进入的城楼二层（午门 / 神武门）：替代实心的 buildHallBody。
 * - 四面红墙，门侧（宫内一侧，马道所在面）开一个明间门洞，门扇向两侧打开
 * - 室内：深灰金砖地面、彩画顶棚、两排内柱
 * - 外立面仍贴隔扇门窗贴图，与原外观一致
 *
 * 坐标：局部原点 = 楼身底面中心；门朝 doorSide（+1 = +Z 北面，-1 = -Z 南面）。
 * 返回 group.userData = { topY, colliders }，colliders 为局部坐标（y 0~3），调用方加上城台顶高度即可。
 */
export function buildEnterableTower(lib, { width, depth, height, bays = 9, doorSide = 1, doorW: doorWIn = 5, doorH = 5.2 }) {
  const doorW = Math.min(doorWIn, width / bays - 0.8);   // 门洞不超出明间两根檐柱之间
  doorH = Math.min(doorH, height * 0.8);
  const group = new THREE.Group();
  const colliders = [];
  const beamH = THREE.MathUtils.clamp(height * 0.12, 0.6, 2);
  const wallH = height - beamH;
  const inset = Math.min(0.8, depth * 0.08);
  const T = 0.9;                              // 墙厚
  const W = width - inset * 2, D = depth - inset * 2;
  const red = lib.material('wall_red'), redT = lib.tileSize('wall_red');
  const owned = [];

  const add = (geo, mat, x, y, z, shadow = true) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = shadow; m.receiveShadow = true;
    group.add(m);
    return m;
  };
  const wallBox = (w, h, d, x, y, z, collide = true) => {
    add(applyBoxUV(new THREE.BoxGeometry(w, h, d), redT), red, x, y, z);
    if (collide) {
      colliders.push(new THREE.Box3(
        new THREE.Vector3(x - w / 2, Math.max(0, y - h / 2), z - d / 2),
        new THREE.Vector3(x + w / 2, Math.min(3, y + h / 2), z + d / 2)));
    }
  };

  // 山墙（东西）
  for (const s of [-1, 1]) wallBox(T, wallH, D, s * (W / 2 - T / 2), wallH / 2, 0);
  // 门对面的墙（实墙）
  wallBox(W, wallH, T, 0, wallH / 2, -doorSide * (D / 2 - T / 2));
  // 门侧墙：中间留门洞
  const sideLen = (W - doorW) / 2;
  const zDoor = doorSide * (D / 2 - T / 2);
  for (const s of [-1, 1]) wallBox(sideLen, wallH, T, s * (doorW / 2 + sideLen / 2), wallH / 2, zDoor);
  wallBox(doorW, wallH - doorH, T, 0, doorH + (wallH - doorH) / 2, zDoor, false);   // 门楣

  // 外立面隔扇门窗（仅贴在外侧，门洞处留空）
  const latMat = lib.material('lattice_doors'), latT = lib.tileSize('lattice_doors');
  const latH = wallH * 0.9;
  const lat = (w, x, z, rotY) => {
    const m = add(applyBandUV(new THREE.BoxGeometry(w, latH, 0.12), latT), latMat, x, latH / 2, z, false);
    m.rotation.y = rotY;
  };
  lat(W, 0, -doorSide * (D / 2 + 0.06), 0);
  for (const s of [-1, 1]) lat(sideLen, s * (doorW / 2 + sideLen / 2), doorSide * (D / 2 + 0.06), 0);

  // 门扇：门洞内向两侧贴墙敞开
  const leafW = Math.min(doorW / 2 - 0.1, 2.3);
  for (const s of [-1, 1]) {
    const leaf = buildStuddedDoor(lib, { width: leafW, height: doorH - 0.2 });
    leaf.position.set(s * (doorW / 2 - 0.14), 0, zDoor - doorSide * (T / 2 + leafW / 2));
    leaf.rotation.y = Math.PI / 2;
    group.add(leaf);
  }
  // 门槛
  add(new THREE.BoxGeometry(doorW, 0.2, T + 0.2), lib.material('wood_column'), 0, 0.1, zDoor, false);

  // 室内地面（金砖色）与顶棚
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4c, roughness: 0.7, metalness: 0, name: 'tower_floor' });
  owned.push(floorMat);
  const fg = new THREE.PlaneGeometry(W - T * 2, D - T * 2);
  fg.rotateX(-Math.PI / 2);
  add(fg, floorMat, 0, 0.04, 0, false);
  const cg = new THREE.PlaneGeometry(W - T * 2, D - T * 2);
  cg.rotateX(Math.PI / 2);
  add(cg, lib.material('caihua_beam'), 0, wallH - 0.03, 0, false);

  // 内柱：两排（门轴线两侧避开门道），仅登记碰撞
  const r = 0.42;
  const colGeo = new THREE.CylinderGeometry(r, r * 1.05, wallH, 12);
  const colMat = lib.material('wood_column');
  const step = (W - T * 2) / bays;
  for (let i = 1; i < bays; i++) {
    const x = -(W - T * 2) / 2 + i * step;
    for (const z of [-D * 0.18, D * 0.18]) {
      if (Math.abs(x) < doorW / 2 + 0.6 && Math.sign(z) === doorSide) continue;   // 门道正对处不放柱
      add(colGeo, colMat, x, wallH / 2, z);
      colliders.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 1.5, z), new THREE.Vector3(r * 2, 3, r * 2)));
    }
  }

  // 檐柱 + 额枋彩画（与原楼身一致）
  const ocol = THREE.MathUtils.clamp(width / bays * 0.06, 0.25, 0.6);
  const oGeo = new THREE.CylinderGeometry(ocol, ocol * 1.05, wallH, 12);
  for (let i = 0; i <= bays; i++) {
    const x = -width / 2 + (i / bays) * width;
    for (const z of [-depth / 2, depth / 2]) {
      add(oGeo, colMat, x, wallH / 2, z);
      colliders.push(new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(x, 1.5, z), new THREE.Vector3(ocol * 2, 3, ocol * 2)));
    }
  }
  const beam = add(applyBandUV(new THREE.BoxGeometry(width + 0.4, beamH, depth + 0.4), lib.tileSize('caihua_beam')),
    lib.material('caihua_beam'), 0, wallH + beamH / 2, 0);
  beam.castShadow = true;

  group.userData = { topY: height, colliders, ownedMaterials: owned };
  return group;
}
