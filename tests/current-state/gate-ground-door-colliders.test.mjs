import {assertUnscopedWumen} from '../lib/wumen-vertical-profile-controls.mjs';
import {restorePreWumenAscent} from '../lib/wumen-ascent-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PalaceBuilder } from '../../src/scene/PalaceBuilder.js';
import { PLAYER } from '../../src/config/constants.js';
import { captureGate, meshFingerprint } from '../lib/gate-tower-fixture.mjs';
import { buildWorld, walkStraight } from '../lib/world.mjs';

// Removing either gate's leaf registration must fail the edge and stepping
// checks. An unrotated, doubled-offset, enlarged, or raised proxy must fail the
// vertex-derived bounds check. No source-text matching stands in for geometry.
const world = await buildWorld();
const radius = 0.5;
const gates = [
  { name: '午门', centers: [-17.5, 0, 17.5], top: 12.3, beforeColliders: 362,
    fingerprint: 'ad978a37f3f5646e4bbb9b35e4745640b280403a49eeaeabed18bea0a834bb5c',
    raw: { objects: 407, meshes: 389, materials: 25, triangles: 31908 },
    merged: { objects: 26, meshes: 25, materials: 25, triangles: 31908 } },
  { name: '神武门', centers: [-13, 0, 13], top: 10.3, beforeColliders: 336,
    fingerprint: 'a9526e8d11fd59f5820b4bbe25db54775b81b010a8a560d0e525cd27b32a2b88',
    raw: { objects: 255, meshes: 252, materials: 15, triangles: 16910 },
    merged: { objects: 16, meshes: 15, materials: 15, triangles: 16910 } },
].map(spec => ({ ...spec, fixture: captureGate(spec.name) }));

function leaves(group) {
  return group.children.filter(mesh => mesh.isMesh && mesh.material.name === 'door_studded');
}

// Independently transform the actual rendered vertices, then apply the
// PalaceBuilder root's world placement (the unmerged fixture root is local).
function visibleBounds(mesh, data) {
  mesh.updateWorldMatrix(true, false);
  const box = new THREE.Box3();
  const vertices = mesh.geometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    box.expandByPoint(new THREE.Vector3().fromBufferAttribute(vertices, i).applyMatrix4(mesh.matrixWorld));
  }
  return box.translate(new THREE.Vector3(data.position.x, 0, data.position.z));
}

function bodyBounds(position) {
  return new THREE.Box3(
    new THREE.Vector3(position.x - radius, position.y - PLAYER.HEIGHT + 0.35, position.z - radius),
    new THREE.Vector3(position.x + radius, position.y - 0.05, position.z + radius),
  );
}

function matchingBounds(a, b) {
  return ['min', 'max'].every(edge => ['x', 'y', 'z'].every(axis => Math.abs(a[edge][axis] - b[edge][axis]) < 1e-10));
}

function walkLeafEdge(x, fromZ, toZ) {
  const current = new THREE.Vector3(x, PLAYER.HEIGHT, fromZ);
  assert.equal(world.cm.checkCollision(current, radius), false, 'approach starts outside the leaf');
  const total = toZ - fromZ;
  for (let i = 0; i < Math.ceil(total / 0.05) + 1; i++) {
    const target = new THREE.Vector3(x, PLAYER.HEIGHT, Math.min(current.z + 0.05, toZ));
    const next = world.cm.getValidPosition(current, target, radius, 0, 0.6);
    assert.equal(world.cm.checkCollision(next, radius), false, 'every accepted body position stays clear');
    assert.equal(world.cm.lastGroundY, 0, 'blocked movement must not rescue onto the city platform');
    if (next.distanceTo(current) < 1e-12) break;
    current.copy(next);
  }
  // Keep exact coordinates: walkStraight's two-decimal report can round a safe
  // endpoint onto a touching collision face and is unsuitable for this check.
  return { reached: current.z - fromZ, total, end: current.toArray() };
}

function renderCounts(root) {
  let objects = 0, meshes = 0, triangles = 0;
  const materials = new Set();
  root.traverse(object => {
    objects++;
    if (!object.isMesh) return;
    meshes++;
    materials.add(object.material);
    triangles += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3;
  });
  return { objects, meshes, materials: materials.size, triangles };
}

for (const gate of gates) {
  const { fixture } = gate;
  const groundLeaves = leaves(fixture.group);

  test(`${gate.name}: six rotated ground leaves register their actual body-height world bounds exactly once`, () => {
    assert.equal(groundLeaves.length, 6);
    // Only the historical total needs the strictly validated ascent view;
    // the actual six leaf proxies and all movement checks use current physics.
    assert.equal(restorePreWumenAscent(fixture).builder.colliders.length, gate.beforeColliders + 6);
    for (const mesh of groundLeaves) {
      assert.equal(mesh.geometry.parameters.depth, 0.25);
      assert.equal(mesh.rotation.y, Math.PI / 2);
      const expected = visibleBounds(mesh, fixture.data);
      expected.min.y = Math.max(0, expected.min.y);
      expected.max.y = Math.min(3, expected.max.y);
      assert.equal(fixture.builder.colliders.filter(box => matchingBounds(box, expected)).length, 1,
        `missing or duplicate transformed leaf proxy at ${mesh.position.toArray()}`);
    }
  });

  for (const mesh of groundLeaves) {
    const box = visibleBounds(mesh, fixture.data);
    const center = gate.centers.reduce((a, b) => Math.abs(b - mesh.position.x) < Math.abs(a - mesh.position.x) ? b : a);
    const sign = Math.sign(mesh.position.x - center);
    const inner = sign > 0 ? box.min.x : box.max.x;
    const x = inner - sign * 0.425;
    const z = (box.min.z + box.max.z) / 2;
    const label = `${gate.name} portal ${center}, leaf ${sign}`;

    for (const feet of [0, 1.2]) test(`${label}: visible inner edge blocks the fixed-radius body at feet=${feet}`, () => {
      const position = new THREE.Vector3(x, feet + PLAYER.HEIGHT, z);
      assert.equal(bodyBounds(position).intersectsBox(box), true, 'probe must overlap the visible leaf');
      assert.equal(world.cm.checkCollision(position, radius), true, 'visible leaf edge must be solid');
      const clear = new THREE.Vector3(inner - sign * 0.55, feet + PLAYER.HEIGHT, z);
      assert.equal(bodyBounds(clear).intersectsBox(box), false);
      assert.equal(world.cm.checkCollision(clear, radius), false, 'do not widen the leaf into the opening');
    });

    test(`${label}: real ground stepping cannot traverse the visible leaf's inner edge`, () => {
      const result = walkLeafEdge(x, box.min.z - 1, box.max.z + 1);
      assert.ok(result.reached < result.total - 1, JSON.stringify(result));
      assert.ok(result.end[2] < box.min.z - radius, JSON.stringify(result));
    });
  }

  for (const center of gate.centers) test(`${gate.name}: portal ${center} centerline stays clear and ground-supported in both directions`, () => {
    const data = fixture.data;
    const south = data.position.z + (gate.name === '午门' ? data.dimensions.platformSouth : -data.dimensions.depth / 2);
    const north = data.position.z + (gate.name === '午门' ? data.dimensions.platformNorth : data.dimensions.depth / 2);
    const x = center + data.position.x;
    for (const [from, to] of [[south - 1, north + 1], [north + 1, south - 1]]) {
      const result = walkStraight(world, [x, from], [x, to], { step: 0.05, feet0: 0 });
      assert.ok(Math.hypot(result.end[0] - x, result.end[1] - to) < 0.06, JSON.stringify(result));
      assert.equal(result.feet, 0);
    }
    for (let z = south; z <= north; z += 0.25) {
      assert.equal(world.cm.checkCollision(new THREE.Vector3(x, PLAYER.HEIGHT, z), radius), false);
      assert.equal(world.cm.getGroundHeight(x, z, 0, 0.6), 0);
      assert.equal(world.cm.getGroundHeight(x, z, gate.top, 0.6), gate.top,
        'the same XZ footprint must still support the existing upper platform');
    }
  });

  test(`${gate.name}: side masonry still rejects a body at ground height`, () => {
    const x = gate.name === '午门' ? 10 : 7;
    assert.equal(world.cm.checkCollision(new THREE.Vector3(x, PLAYER.HEIGHT, fixture.data.position.z), radius), true);
  });

  test(`${gate.name}: nonzero world X and Z offsets are each applied once to all six leaf proxies`, () => {
    const data = { ...fixture.data, position: { x: 73.25, z: 80.875 } };
    const builder = new PalaceBuilder(new THREE.Scene(), fixture.lib);
    let group;
    builder.finish = built => { group = built; return built; };
    builder.buildGate(data);
    assert.equal(leaves(group).length, 6);
    for (const mesh of leaves(group)) {
      const expected = visibleBounds(mesh, data);
      expected.min.y = 0;
      expected.max.y = 3;
      assert.equal(builder.colliders.filter(box => matchingBounds(box, expected)).length, 1);
    }
  });

  test(`${gate.name}: collider registration retains every mesh, material, triangle and production render batch`, () => {
    const retained = restorePreWumenAscent(captureGate(gate.name));
    if(gate.name==='午门')assertUnscopedWumen(retained);else assert.equal(meshFingerprint(retained.group), gate.fingerprint);
    assert.deepEqual(renderCounts(retained.group), {...gate.raw,triangles:gate.raw.triangles+(gate.name==='午门'?424:0)});
    const merged = PalaceBuilder.prototype.finish.call(retained.builder, retained.group);
    assert.deepEqual(renderCounts(merged), {...gate.merged,triangles:gate.merged.triangles+(gate.name==='午门'?424:0)});
  });
}
