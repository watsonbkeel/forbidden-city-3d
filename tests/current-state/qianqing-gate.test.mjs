import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import * as THREE from 'three';
import { PalaceBuilder } from '../../src/scene/PalaceBuilder.js';
import { CollisionManager } from '../../src/utils/Collision.js';
import { PALACE_LAYOUT } from '../../src/scene/Layout.js';
import { PLAYER } from '../../src/config/constants.js';
import { solidMaterialNameAt } from '../../src/render/SolidMaterialBatch.js';

const moduleURL = new URL('../../src/scene/palace/special/QianqingGate.js', import.meta.url);
const special = existsSync(moduleURL) ? await import(moduleURL) : null;
const gate = PALACE_LAYOUT.find(item => item.name === '乾清门');
const palace = PALACE_LAYOUT.find(item => item.name === '乾清宫');
const bay = gate.dimensions.width / 5;
const origin = gate.position;
const run = 1.5 * 1.6;
const front = origin.z - gate.dimensions.depth / 2 - 1;
const rear = origin.z + gate.dimensions.depth / 2 + 1;
const palaceEdge = palace.position.z - palace.dimensions.depth / 2 - 6;
const intercept = palaceEdge - palace.dimensions.baseHeight * 1.6 + 1.5 * 1.6;
const mats = new Map();
// Only image loading is replaced. All meshes, merging, rays, collision, and movement are production code.
const library = {
  material(name) {
    if (!mats.has(name)) mats.set(name, new THREE.MeshStandardMaterial({ name }));
    return mats.get(name);
  },
  tileSize: () => 1,
  aspect: () => 1,
};
let built;
function fixture() {
  if (built) return built;
  const scene = new THREE.Scene();
  const builder = new PalaceBuilder(scene, library);
  const object = special.buildQianqingGate(builder, gate);
  scene.updateMatrixWorld(true);
  const cm = new CollisionManager();
  cm.addColliders(builder.colliders);
  cm.addWalkables(builder.walkables);
  built = { scene, builder, object, cm, info: object.userData.qianqingGate };
  return built;
}
function walk(cm, from, to, feet = 0) {
  let p = new THREE.Vector3(from[0], feet + PLAYER.HEIGHT, from[1]);
  const n = Math.ceil(Math.hypot(to[0] - from[0], to[1] - from[1]) / 0.1);
  for (let i = 1; i <= n; i++) {
    const target = new THREE.Vector3(from[0] + (to[0] - from[0]) * i / n, p.y, from[1] + (to[1] - from[1]) * i / n);
    const before = p.y;
    p = cm.getValidPosition(p, target, 0.5, p.y - PLAYER.HEIGHT);
    assert.ok(Math.abs(p.y - before) <= 0.61, `no height pop at ${p.x},${p.z}`);
  }
  assert.ok(Math.hypot(p.x - to[0], p.z - to[1]) < 0.11, `blocked at ${p.x.toFixed(2)},${p.z.toFixed(2)}, goal ${to}`);
  return p.y - PLAYER.HEIGHT;
}
function rays(object, from, direction, material) {
  const ray = new THREE.Raycaster(new THREE.Vector3(...from), new THREE.Vector3(...direction));
  // Batching must not let a screen/frame hit stand in for an actual grid bar:
  // resolve the precise hit triangle back to its original material identity.
  return ray.intersectObject(object, true).filter(hit => !material || solidMaterialNameAt(hit.object, hit.faceIndex) === material);
}

// Fails if the special implementation is absent; the remainder exercise its real geometry.
test('Qianqing Gate has a dedicated builder export', () => {
  assert.equal(typeof special?.buildQianqingGate, 'function');
});
const realTest = (name, fn) => test(name, { skip: !special }, fn);

realTest('the merged object preserves its world anchor and supported 1.5 m base', () => {
  const { object, info, cm } = fixture();
  assert.equal(object.position.z, 215.3);
  assert.equal(object.position.x, origin.x);
  assert.equal(info.base.height, 1.5);
  assert.equal(cm.getGroundHeight(0, origin.z, 1.5), 1.5);
  const hits = rays(object, [0, 4, origin.z], [0, -1, 0], 'stone_slab');
  assert.ok(hits.some(hit => Math.abs(hit.point.y - 1.5) < 0.05));
});

realTest('six by four physical column lines define five by three bays', () => {
  const { builder } = fixture();
  const columns = builder.colliders.filter(b => Math.abs(b.min.y - 1.5) < 1e-8 && Math.abs(b.max.y - 4.5) < 1e-8 && b.max.x - b.min.x < 1.3 && b.max.z - b.min.z < 1.3);
  assert.equal(columns.length, 24);
  assert.equal(new Set(columns.map(b => ((b.min.x + b.max.x) / 2).toFixed(4))).size, 6);
  assert.equal(new Set(columns.map(b => ((b.min.z + b.max.z) / 2).toFixed(4))).size, 4);
});

realTest('three separated south ramps align with three open gate passages', () => {
  const { builder, cm } = fixture();
  const ramps = builder.walkables.filter(w => w.type === 'ramp' && Math.abs(w.minZ - (front - run)) < 1e-6);
  assert.equal(ramps.length, 3);
  const ordered = ramps.sort((a, b) => a.minX - b.minX);
  assert.ok(ordered[0].maxX < ordered[1].minX && ordered[1].maxX < ordered[2].minX);
  for (const x of [-bay, 0, bay]) {
    assert.ok(Math.abs(walk(cm, [x, front - run - 1], [x, rear + 2]) - 1.5) < 1e-7);
  }
  // There must be a real railing/wall separator between each stair, not one wide opening.
  for (const x of [-bay / 2, bay / 2]) {
    assert.equal(cm.checkCollision(new THREE.Vector3(x, 1.5 + PLAYER.HEIGHT, front)), true);
  }
});


realTest('each stair has raised stone side rails in the actual merged geometry', () => {
  const { object } = fixture();
  const stairW = bay * 0.76;
  for (const x of [-bay, 0, bay]) for (const s of [-1, 1]) {
    const hits = rays(object, [x + s * (stairW / 2 - 0.22), 6, front - run / 2], [0, -1, 0], 'marble');
    assert.ok(hits.length && hits[0].point.y > 1.7, 'sloping balustrade above the low curb');
  }
});

realTest('gate leaves occur at the rear eave only and end bays have sill walls and grid windows', () => {
  const { object, info } = fixture();
  const rearLine = origin.z + gate.dimensions.depth / 2;
  assert.equal(info.doors.length, 3);
  for (const door of info.doors) assert.equal(door.z, rearLine);
  const leaves = object.children.find(mesh => mesh.material?.name === 'door_studded');
  assert.ok(leaves, 'rear studded door geometry');
  leaves.geometry.computeBoundingBox();
  assert.ok(leaves.geometry.boundingBox.min.z >= gate.dimensions.depth / 2 - 0.3, 'no front door leaves');
  for (const x of [-2 * bay, 2 * bay]) {
    assert.ok(rays(object, [x, 2, front - 1], [0, 0, 1], 'wall_brick').length > 0, 'brick sill');
    assert.ok(rays(object, [x, 4, front - 1], [0, 0, 1], 'qianqing_window_grid').length > 0, 'physical grid, not a repeated floor-to-ceiling door');
  }
});

realTest('the main roof is single-eave xieshan with one continuous front roof surface', () => {
  const { object, info } = fixture();
  assert.equal(info.roof.type, 'xieshan');
  assert.equal(info.roof.layers, 1);
  const ys = rays(object, [0, 30, origin.z - gate.dimensions.depth / 2], [0, -1, 0], 'roof_tile')
    .map(hit => hit.point.y).sort((a, b) => a - b);
  assert.ok(ys.length > 0);
  assert.ok(ys[ys.length - 1] - ys[0] < 0.6, 'not a stack of two roof layers');
});

realTest('angled screen walls have solid thickness and leave east/west lateral access', () => {
  const { cm, info, object } = fixture();
  assert.equal(info.screens.length, 2);
  for (const screen of info.screens) {
    assert.notEqual(screen.start.x, screen.end.x);
    assert.notEqual(screen.start.z, screen.end.z);
    assert.ok(screen.thickness > 0.5);
    const capX = (screen.fold.x + screen.end.x) / 2;
    const capZ = (screen.fold.z + screen.end.z) / 2;
    const capHits = rays(object, [capX, 12, capZ], [0, -1, 0]);
    assert.ok(Math.abs(capHits[0].point.y - 8) < 0.03, 'screen top interpreted as 8 m, including cap');
    const x = (screen.start.x + screen.end.x) / 2;
    const z = (screen.start.z + screen.end.z) / 2;
    assert.equal(cm.checkCollision(new THREE.Vector3(x, PLAYER.HEIGHT, z)), true);
    const side = Math.sign(x);
    walk(cm, [side * (gate.dimensions.width / 2 + 12), front - 7], [side * (gate.dimensions.width / 2 + 12), rear + 3]);
  }
});

realTest('raised connector is horizontal, solid, and meets the retained palace front ramp without jumping', () => {
  const { builder, object, cm, info } = fixture();
  assert.equal(info.connector.height, 1.5);
  assert.ok(Math.abs(info.connector.endZ - intercept) < 1e-8);
  assert.ok(info.connector.provisional);
  for (const z of [rear + 5, (rear + intercept) / 2, intercept - 0.1]) {
    assert.equal(cm.getGroundHeight(0, z, 1.5), 1.5);
    assert.ok(rays(object, [0, 5, z], [0, -1, 0], 'stone_slab').some(hit => Math.abs(hit.point.y - 1.5) < 0.05));
  }
  // Build the real existing palace terrace helper, preserving its original ramp.
  const oldC = builder.colliders.length, oldW = builder.walkables.length;
  builder.ox = 0; builder.oz = 0;
  builder.buildTerraceUnion(new THREE.Group(), [{ hw: palace.dimensions.width / 2 + 5, z0: palaceEdge, z1: palace.position.z + palace.dimensions.depth / 2 + 5 }], {
    layers: 1, lh: palace.dimensions.baseHeight, run: palace.dimensions.baseHeight * 1.6,
    setback: palace.dimensions.baseHeight * 1.6 + 1.2, stairW: Math.min(12, palace.dimensions.width / 9 * 2.2),
  });
  cm.addColliders(builder.colliders.slice(oldC));
  cm.addWalkables(builder.walkables.slice(oldW));
  for (const x of [-bay, 0, bay]) {
    walk(cm, [x, rear + 2], [0, rear + 2], 1.5);
    assert.ok(Math.abs(walk(cm, [0, rear + 2], [0, palaceEdge + 1], 1.5) - 5) < 1e-7);
  }
});
