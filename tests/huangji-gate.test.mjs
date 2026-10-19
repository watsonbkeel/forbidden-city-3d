import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from 'three';
import { CourtKit } from '../src/scene/palace/kit.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { walkStraight } from './lib/world.mjs';

let api;
try { api = await import('../src/scene/palace/special/HuangjiGate.js'); }
catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error; }
const source = 'https://www.dpm.org.cn/explore/building/236451.html';
const inherited = JSON.parse(fs.readFileSync(new URL('../data/zones/ningshou.json', import.meta.url))).items.find(item => item.name === '皇极门');
const item = { ...inherited, gateProfile: 'huangji', gateKind: 'three-wallgate', style: 'wall' };
const ctx = new Proxy({}, { get: () => () => ({ data: [] }), set: () => true });
globalThis.document ??= { createElement: () => ({ getContext: () => ctx, width: 0, height: 0 }) };
function capture({ walls = false, finish = false } = {}) {
  assert.equal(typeof api?.buildHuangjiGate, 'function', 'dedicated Huangji wall-gate builder is missing');
  const materials = new Map();
  const lib = { material(name, options = {}) { const key = name + JSON.stringify(options); if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ name, ...options })); return materials.get(key); }, tileSize: () => 1, aspect: () => 1 };
  const kit = new CourtKit(lib, 'huangji-test');
  const wallGapWidth = api.buildHuangjiGate(kit, item);
  const frame = kit.root.children[0], geometry = frame.userData.gateGeometry;
  if (walls) kit.wall(-354, item.z, -233.2, item.z, { h: 6.5, gaps: [{ at: item.x, w: wallGapWidth }] });
  kit.root.updateMatrixWorld(true);
  const cm = new CollisionManager(); cm.addColliders(kit.colliders, 'huangji'); cm.addWalkables(kit.walkables, 'huangji');
  return { kit, frame, geometry, wallGapWidth, cm, THREE, merged: finish ? kit.finish() : null };
}
function localRay(frame, x, y, z, direction, far) {
  return new THREE.Raycaster(new THREE.Vector3(x, y, z).applyMatrix4(frame.matrixWorld), new THREE.Vector3(...direction).transformDirection(frame.matrixWorld), 0, far);
}
function roofBounds(frame) {
  return frame.children.filter(child => child.userData.role === 'huangji-roof').map(roof => ({ roof, box: new THREE.Box3().setFromObject(roof) }));
}

test('Huangji keeps the anchored masonry span but replaces the generic five-bay identity', () => {
  const { frame, geometry: g, wallGapWidth, kit } = capture();
  assert.deepEqual([frame.position.x, frame.position.z, frame.rotation.y], [-293.2, 154.1, 0]);
  assert.equal(wallGapWidth, 23.7);
  assert.equal(g.profile, 'huangji'); assert.equal(g.gateKind, 'three-wallgate');
  assert.equal(g.portals.length, 3); assert.equal(g.roofs.length, 7);
  assert.deepEqual(g.wallReplacement, { at: item.x, width: wallGapWidth, min: item.x - wallGapWidth / 2, max: item.x + wallGapWidth / 2 });
  assert.equal(kit.rooms.length, 0); assert.equal(kit.plaques.length, 0, 'the reference does not authorize an invented nameboard');
  assert.equal(kit.mapItems.length, 1); assert.equal(kit.mapItems[0].name, '皇极门');
});

test('all three holes are real arched solids with clear full-depth ground apertures', () => {
  const { frame, geometry: g } = capture();
  for (const portal of g.portals) {
    for (const dx of [-portal.width / 2 + .4, 0, portal.width / 2 - .4]) for (const y of [.4, 1.7, 2.7]) for (const sign of [-1, 1]) {
      const hits = localRay(frame, portal.x + dx, y, -4 * sign, [0, 0, sign], 8).intersectObject(frame, true);
      assert.equal(hits.length, 0, `blocked ${portal.id} opening at ${dx}, ${y}`);
    }
    const vaultY = dx => localRay(frame, portal.x + dx, 2, 0, [0, 1, 0], 8).intersectObject(frame, true)[0]?.point.y;
    assert.ok(vaultY(0) > vaultY(portal.width * .43) + .45, `${portal.id} must have a real barrel arch, not a flat lintel or painted arch`);
    assert.ok(Math.abs(vaultY(0) - (portal.springY + portal.rise)) < .02);
  }
});

test('seven distinct roof geometries occupy edge-secondary-interstitial-main order and step in height', () => {
  const { frame, geometry: g } = capture();
  const roofs = roofBounds(frame).sort((a, b) => a.box.getCenter(new THREE.Vector3()).x - b.box.getCenter(new THREE.Vector3()).x);
  assert.equal(roofs.length, 7);
  assert.deepEqual(roofs.map(({ roof }) => roof.userData.tower), ['edge', 'secondary', 'interstitial', 'main', 'interstitial', 'secondary', 'edge']);
  assert.deepEqual(roofs.map(({ roof }) => roof.userData.roofForm), ['outer-hip-inner-gable', 'wudian', 'xuanshan', 'wudian', 'xuanshan', 'wudian', 'outer-hip-inner-gable']);
  assert.ok(roofs[3].box.max.y > roofs[1].box.max.y + .4);
  assert.ok(roofs[1].box.max.y > roofs[2].box.max.y + .5);
  assert.ok(roofs[2].box.max.y > roofs[0].box.max.y);
  for (const { roof, box } of roofs) {
    const planned = g.roofs.find(r => r.id === roof.userData.roofId);
    assert.ok(Math.abs(box.getCenter(new THREE.Vector3()).x - (item.x + planned.x)) < .03);
    assert.ok(box.max.x - box.min.x < 7, 'no continuous hall roof');
    assert.ok(box.max.z - box.min.z < 5, 'wall-gate roof remains shallow');
    assert.ok(roof.children.some(mesh => mesh.isMesh && mesh.geometry.getAttribute('position').count > 24));
    const surface = roof.children.find(mesh => mesh.userData.role === 'huangji-roof-surface');
    const positions = surface.geometry.getAttribute('position');
    for (const [side, hipped] of [[-1, planned.hipLeft], [1, planned.hipRight]]) {
      const endY = [];
      for (let i = 0; i < positions.count; i++) if (Math.abs(positions.getX(i) - side * planned.width / 2) < 1e-5) endY.push(positions.getY(i));
      assert.ok(endY.length > 0);
      const actualHighest = Math.max(...endY);
      assert.ok(Math.abs(actualHighest - (planned.eaveY + (hipped ? 0 : planned.rise))) < 1e-5,
        `${planned.id} ${side}: geometry must have the specified hip or gable, not just metadata`);
    }
  }
});

test('all three wall-connected portals pass the actual controller both ways and adjacent piers block', () => {
  const W = capture({ walls: true }), g = W.geometry;
  for (const portal of g.portals) for (const dx of [-.45, 0, .45]) for (const sign of [-1, 1]) {
    const x = item.x + portal.x + dx;
    const route = walkStraight(W, [x, item.z - 4 * sign], [x, item.z + 4 * sign], { step: .05 });
    assert.ok(route.reached >= route.total - .1, `${portal.id}: ${JSON.stringify(route)}`);
    assert.equal(route.feet, 0, 'the passage has no invisible platform lift');
  }
  for (const x of [-13, -11, -3.5, 3.5, 11, 13]) {
    const route = walkStraight(W, [item.x + x, item.z - 4], [item.x + x, item.z + 4], { step: .05 });
    assert.ok(route.reached < 4, `solid pier/wall bypass at ${x}: ${JSON.stringify(route)}`);
  }
});

test('the full replacement cut is continuously filled except for exactly three matching apertures', () => {
  const W = capture({ walls: true }), g = W.geometry;
  const blocked = x => W.kit.colliders.some(b => b.containsPoint(new THREE.Vector3(item.x + x, 1.7, item.z)));
  for (let x = -14; x <= 14; x += .125) {
    const inside = g.portals.some(p => Math.abs(x - p.x) < p.width / 2 - .01);
    assert.equal(blocked(x), !inside, `visual/collision wall interval mismatch at ${x}`);
  }
  for (const sign of [-1, 1]) {
    const seam = item.x + sign * g.wallReplacement.width / 2;
    const touching = W.kit.colliders.filter(b => b.min.x <= seam + 1e-8 && b.max.x >= seam - 1e-8 && b.min.y < 1.7 && b.max.y > 1.7 && b.min.z <= item.z && b.max.z >= item.z);
    assert.ok(touching.length >= 2, `detached outer wall contact ${sign}`);
  }
});

test('fitted dimensions and simplifications remain explicit after material merging', () => {
  const { geometry: g, kit, merged } = capture({ finish: true });
  assert.equal(g.dimensionStatus, 'MODEL_FIT_NOT_SURVEYED');
  assert.equal(g.source, source);
  assert.match(g.detailStatus, /SIMPLIFIED/);
  assert.equal(kit.mapItems[0].dimensionStatus, 'MODEL_FIT_NOT_SURVEYED');
  const record = merged.userData.architecture.find(r => r.id === 'ningshou/huangji-gate');
  assert.equal(record?.dimensionStatus, 'MODEL_FIT_NOT_SURVEYED');
  assert.equal(record?.portalCount, 3); assert.equal(record?.roofCount, 7);
  assert.match(record?.visitorPolicy, /not museum visitor access/);
});

test('geometry remains finite, conservatively budgeted and batches without adding texture loads', () => {
  const { frame, merged, geometry: g } = capture({ finish: true });
  let triangles = 0, meshes = 0;
  frame.traverse(object => {
    if (!object.isMesh) return;
    meshes++;
    const geometry = object.geometry;
    triangles += (geometry.index?.count ?? geometry.getAttribute('position').count) / 3;
    for (const key of ['position', 'normal', 'uv']) {
      const attribute = geometry.getAttribute(key); assert.ok(attribute, `${object.name}: missing ${key}`);
      assert.ok([...attribute.array].every(Number.isFinite), `${object.name}: nonfinite ${key}`);
    }
  });
  let mergedMeshes = 0; merged.traverse(object => { if (object.isMesh) mergedMeshes++; });
  assert.ok(triangles < 8000, `triangle budget ${triangles}`);
  assert.ok(meshes < 160, `prebatch mesh budget ${meshes}`);
  assert.ok(mergedMeshes <= 8, `material draw-call budget ${mergedMeshes}`);
  assert.deepEqual(frame.userData.structure.budget, { triangles, meshes, newTextureLoads: 0 });
  assert.equal(g.portals.length, 3);
});

test('dedicated profile rejects accidental hall, wrong orientation, relocation and dimension overrides', () => {
  assert.equal(typeof api?.huangjiGateGeometry, 'function', 'dedicated geometry contract is missing');
  for (const change of [{ gateProfile: 'other' }, { gateKind: 'five-bay' }, { style: 'hall' }, { name: '未知门' }, { rot: 'north' }, { x: NaN }, { x: -294 }, { z: 155 }, { w: 24 }, { open: false }]) {
    assert.throws(() => api.huangjiGateGeometry({ ...item, ...change }), /Huangji|huangji|anchor|profile|open/i, JSON.stringify(change));
  }
});


test('seven headers expose broad glazed ceramic partitions rather than a narrow green stripe', () => {
  const { frame, geometry: g } = capture();
  for (const roof of g.roofs) for (const sign of [-1, 1]) {
    for (const [offset, material] of [[.24, 'huangji_glaze_green_fit'], [.66, 'huangji_glaze_bluegreen_fit'], [.94, 'huangji_glaze_green_fit']]) {
      const hit = localRay(frame, roof.x, roof.wallTop - offset, -4 * sign, [0, 0, sign], 8).intersectObject(frame, true)[0];
      assert.equal(hit?.object.material.name, material, `${roof.id}: missing visible ceramic partition ${offset}`);
      assert.ok(hit.object.material.roughness < .45);
    }
  }
  for (const post of frame.children.filter(object => object.userData.role === 'huangji-hanging-post')) {
    const roof = g.roofs.find(candidate => Math.abs(Math.abs(post.position.x - candidate.x) - (candidate.wallWidth / 2 - .16)) < 1e-6);
    assert.ok(roof);
    assert.ok(new THREE.Box3().setFromObject(post).min.y < roof.wallTop - 1.12, 'hanging terminal must remain visible below the broadened ceramic header');
  }
  const backing = localRay(frame, 2.3, 2, -4, [0, 0, 1], 8).intersectObject(frame, true)[0];
  assert.equal(backing?.object.material.name, 'huangji_red_backing_fit', 'retain the source-visible red backing with an explicit dedicated material');
  frame.traverse(object => { if (object.isMesh) assert.notEqual(object.material.name, 'wall_red', 'the gate must not reuse generic rough-plaster material'); });
});

test('white-marble Sumeru bases have real projecting caps and a recessed waist without brick/slab imagery', () => {
  const { frame } = capture();
  const front = y => localRay(frame, 3.7, y, -4, [0, 0, 1], 8).intersectObject(frame, true)[0];
  const foot = front(.08), waist = front(.43), crown = front(.71);
  for (const hit of [foot, waist, crown]) {
    assert.equal(hit?.object.material.name, 'huangji_white_marble_fit');
    assert.equal(hit.object.material.map, null);
    assert.equal(hit.object.material.normalMap, null);
    const rgb = hit.object.material.color;
    assert.ok(Math.min(rgb.r, rgb.g, rgb.b) > .65, 'marble base must remain pale in its actual material');
    assert.ok(hit.object.material.roughness >= .6);
  }
  assert.ok(waist.point.z - foot.point.z > .12, 'lower moulding must visibly project beyond the waist');
  assert.ok(waist.point.z - crown.point.z > .1, 'upper moulding must visibly project beyond the waist');
  const bases = frame.children.filter(object => object.userData.role === 'huangji-marble-base');
  assert.equal(bases.length, 10);
  for (const base of bases) assert.ok(new Set([...base.geometry.getAttribute('position').array].filter((_, i) => i % 3 === 1).map(v => v.toFixed(4))).size >= 8, 'Sumeru section needs actual moulded height changes');
});

test('surface and marble correction retains every previous physical collision box exactly', () => {
  const { kit } = capture();
  const hash = crypto.createHash('sha256').update(JSON.stringify(kit.colliders.map(box => [box.min.toArray(), box.max.toArray()]))).digest('hex');
  assert.equal(hash, 'ce9908949d8d19cd225fafbf8218bd5e6cc34a9d16e59376b877be64ba5ea3ee');
  assert.equal(kit.walkables.length, 0);
});
