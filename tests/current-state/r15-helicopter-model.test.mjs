import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import * as THREE from 'three';

const url = new URL('../../src/scene/flight/HelicopterModel.js', import.meta.url);
const helicopter = existsSync(url) ? await import(url) : null;
const realTest = (name, fn) => test(name, { skip: !helicopter }, fn);
const EPSILON = 1e-5;

test('R15 exposes a self-contained procedural helicopter factory', () => {
  assert.equal(typeof helicopter?.createHelicopterModel, 'function');
});

function meshesIn(group) {
  const meshes = [];
  group.traverse(child => { if (child.isMesh) meshes.push(child); });
  return meshes;
}

function withModel(fn) {
  const model = helicopter.createHelicopterModel();
  try { fn(model); } finally { model.dispose(); }
}

realTest('model exposes explicit local coordinates, ground-aligned bounds, and safe exit offsets', () => withModel(model => {
  assert.ok(model.group.isGroup);
  assert.equal(model.group.name, 'virtual-tour-helicopter');
  assert.ok(model.mainRotor.isGroup && model.tailRotor.isGroup);
  assert.equal(model.mainRotor.parent, model.group);
  assert.equal(model.tailRotor.parent, model.group);
  assert.deepEqual(model.cockpitAnchor.toArray(), [0, 2, 1.2]);
  assert.deepEqual(model.exitOffsets.map(offset => offset.toArray()), [[-2.1, 0, 0.4], [2.1, 0, 0.4]]);
  assert.deepEqual(model.bounds.min, [-5, 0, -5.6]);
  assert.deepEqual(model.bounds.max, [5, 3.6, 5]);
  assert.deepEqual(model.bounds.bodyY, [0, 3.6]);
  assert.equal(model.bounds.rotorRadius, 5);
  assert.equal(model.bounds.horizontalRadius, 5.6);
  assert.equal(model.bounds.groundClearance, 0);
  assert.equal(model.group.userData.forwardAxis, '+Z');
  assert.equal(model.group.userData.rightAxis, '-X');
  assert.match(model.group.userData.description, /fictional/i);
  assert.ok(Object.isFrozen(model.bounds) && Object.isFrozen(model.bounds.min));
}));

realTest('procedural geometry remains finite, closed, normally lit, and within the mobile budget', () => withModel(model => {
  let triangles = 0;
  const meshes = meshesIn(model.group);
  const stationary = model.group.children.filter(child => child.isMesh);
  assert.ok(stationary.length > 0 && stationary.length <= 6);
  assert.ok(meshes.length <= 10);
  assert.ok(new Set(meshes.map(mesh => mesh.material)).size <= 6);
  assert.equal(model.group.children.filter(child => child.isLight).length, 0);
  for (const mesh of meshes) {
    const geometry = mesh.geometry;
    const positions = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    assert.equal(geometry.groups.length, 0, `${mesh.name}: one draw per batch`);
    assert.equal(geometry.index, null, `${mesh.name}: uniformly non-indexed batches`);
    assert.equal(positions.count, normals.count);
    assert.equal(positions.count % 3, 0);
    assert.ok(mesh.material.isMeshStandardMaterial);
    assert.equal(mesh.material.side, THREE.FrontSide);
    assert.equal(mesh.material.map, null);
    assert.equal(mesh.material.normalMap, null);
    triangles += positions.count / 3;
    const edges = new Map();
    const pointKey = i => [positions.getX(i), positions.getY(i), positions.getZ(i)].map(v => Math.round(v * 1e5)).join(',');
    for (let i = 0; i < positions.count; i++) {
      const p = new THREE.Vector3().fromBufferAttribute(positions, i);
      const n = new THREE.Vector3().fromBufferAttribute(normals, i);
      assert.ok(p.toArray().every(Number.isFinite), `${mesh.name}: finite positions`);
      assert.ok(n.toArray().every(Number.isFinite), `${mesh.name}: finite normals`);
      assert.ok(Math.abs(n.length() - 1) < EPSILON, `${mesh.name}: unit normals`);
    }
    for (let i = 0; i < positions.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(positions, i);
      const b = new THREE.Vector3().fromBufferAttribute(positions, i + 1);
      const c = new THREE.Vector3().fromBufferAttribute(positions, i + 2);
      assert.ok(b.sub(a).cross(c.sub(a)).lengthSq() > 1e-12, `${mesh.name}: no collapsed faces`);
      const keys = [pointKey(i), pointKey(i + 1), pointKey(i + 2)];
      for (let edge = 0; edge < 3; edge++) {
        const start = keys[edge], end = keys[(edge + 1) % 3];
        const key = [start, end].sort().join('|');
        const pair = edges.get(key) || { count: 0, winding: 0 };
        pair.count++;
        pair.winding += start < end ? 1 : -1;
        edges.set(key, pair);
      }
    }
    for (const pair of edges.values()) {
      assert.equal(pair.count, 2, `${mesh.name}: closed source solids`);
      assert.equal(pair.winding, 0, `${mesh.name}: consistent outward winding`);
    }
    assert.ok(geometry.boundingBox && geometry.boundingSphere);
  }
  assert.ok(triangles <= 2200, `${triangles} triangles exceed the 2200-triangle budget`);
  assert.ok(triangles >= 250, 'recognizable modeled body rather than a placeholder');
}));

realTest('documented bounds contain every static vertex and analytic full rotor sweep', () => withModel(model => {
  model.group.updateMatrixWorld(true);
  const { min, max, horizontalRadius } = model.bounds;
  const assertWithin = (point, label) => {
    for (let axis = 0; axis < 3; axis++) assert.ok(point[axis] >= min[axis] - EPSILON && point[axis] <= max[axis] + EPSILON, `${label}: axis ${axis}, ${point[axis]}`);
    assert.ok(Math.hypot(point[0], point[2]) <= horizontalRadius + EPSILON, `${label}: horizontal radius`);
  };
  let minimumY = Infinity;
  for (const mesh of meshesIn(model.group)) {
    const positions = mesh.geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3().fromBufferAttribute(positions, i);
      if (mesh.parent === model.mainRotor) {
        vertex.applyMatrix4(mesh.matrix);
        const radius = Math.hypot(vertex.x, vertex.z);
        assert.ok(radius <= model.bounds.rotorRadius + EPSILON);
        for (const [x, z] of [[radius, 0], [-radius, 0], [0, radius], [0, -radius]]) assertWithin([x, model.mainRotor.position.y + vertex.y, z], 'main rotor sweep');
      } else if (mesh.parent === model.tailRotor) {
        vertex.applyMatrix4(mesh.matrix);
        const radius = Math.hypot(vertex.y, vertex.z);
        assert.ok(radius <= model.bounds.tailRotorRadius + EPSILON);
        for (const [y, z] of [[radius, 0], [-radius, 0], [0, radius], [0, -radius]]) assertWithin([model.tailRotor.position.x + vertex.x, model.tailRotor.position.y + y, model.tailRotor.position.z + z], 'tail rotor sweep');
      } else {
        vertex.applyMatrix4(mesh.matrixWorld);
        minimumY = Math.min(minimumY, vertex.y);
        assertWithin(vertex.toArray(), mesh.name);
      }
    }
  }
  assert.ok(Math.abs(minimumY) < EPSILON, 'skids rest exactly on model base y=0');
}));

realTest('cockpit has forward visibility and a visible lower dashboard', () => withModel(model => {
  model.group.updateMatrixWorld(true);
  const ray = new THREE.Raycaster();
  ray.near = 0.02;
  ray.far = 8;
  for (const forward of [[0, 0, 1], [0.18, 0.04, 1], [-0.18, 0.04, 1]]) {
    ray.set(model.cockpitAnchor, new THREE.Vector3(...forward).normalize());
    assert.equal(ray.intersectObject(model.group, true).length, 0, `clear pilot ray ${forward}`);
  }
  ray.set(model.cockpitAnchor, new THREE.Vector3(0, -0.6, 0.4).normalize());
  const lowerHits = ray.intersectObject(model.group, true);
  assert.ok(lowerHits.some(hit => hit.object.name === 'helicopter-metal'), 'dashboard gives pilot view a visible aircraft reference');
}));

realTest('rotors animate only around their own axes, clamp RPM, and reject invalid deltas', () => {
  const a = helicopter.createHelicopterModel();
  const b = helicopter.createHelicopterModel();
  try {
    for (const dt of [0, -1, NaN, Infinity, -Infinity]) a.update(dt, 1);
    for (const rpm of [0, -1, NaN, Infinity, -Infinity]) a.update(0.1, rpm);
    assert.equal(a.mainRotor.rotation.y, 0);
    assert.equal(a.tailRotor.rotation.x, 0);
    a.update(0.05, 1);
    b.update(0.05, 10);
    assert.notEqual(a.mainRotor.rotation.y, 0);
    assert.notEqual(a.tailRotor.rotation.x, 0);
    assert.equal(a.mainRotor.rotation.y, b.mainRotor.rotation.y);
    assert.equal(a.tailRotor.rotation.x, b.tailRotor.rotation.x);
    assert.equal(a.mainRotor.rotation.x, 0);
    assert.equal(a.mainRotor.rotation.z, 0);
    assert.equal(a.tailRotor.rotation.y, 0);
    assert.equal(a.tailRotor.rotation.z, 0);
    const half = helicopter.createHelicopterModel();
    try {
      half.update(0.05, 0.5);
      assert.ok(Math.abs(half.mainRotor.rotation.y * 2 - a.mainRotor.rotation.y) < EPSILON);
    } finally { half.dispose(); }
    for (let i = 0; i < 200; i++) a.update(Number.MAX_VALUE, 1);
    assert.ok(a.mainRotor.rotation.y >= 0 && a.mainRotor.rotation.y < Math.PI * 2);
    assert.ok(a.tailRotor.rotation.x >= 0 && a.tailRotor.rotation.x < Math.PI * 2);
  } finally { a.dispose(); b.dispose(); }
});

realTest('disposal is idempotent and releases only this instance’s owned resources', () => {
  const a = helicopter.createHelicopterModel();
  const b = helicopter.createHelicopterModel();
  const parent = new THREE.Group();
  parent.add(a.group);
  const owned = new Set(meshesIn(a.group).flatMap(mesh => [mesh.geometry, mesh.material]));
  const others = new Set(meshesIn(b.group).flatMap(mesh => [mesh.geometry, mesh.material]));
  const counts = new Map([...owned, ...others].map(resource => [resource, 0]));
  for (const resource of counts.keys()) resource.addEventListener('dispose', () => counts.set(resource, counts.get(resource) + 1));
  const unrelated = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
  let unrelatedDisposals = 0;
  unrelated.geometry.addEventListener('dispose', () => unrelatedDisposals++);
  unrelated.material.addEventListener('dispose', () => unrelatedDisposals++);
  a.group.add(unrelated);
  a.dispose();
  a.dispose();
  const angle = a.mainRotor.rotation.y;
  a.update(0.1, 1);
  assert.equal(a.mainRotor.rotation.y, angle, 'disposed model stops updating');
  assert.equal(a.group.parent, null);
  for (const resource of owned) assert.equal(counts.get(resource), 1);
  for (const resource of others) assert.equal(counts.get(resource), 0);
  assert.equal(unrelatedDisposals, 0);
  b.dispose();
  unrelated.geometry.dispose();
  unrelated.material.dispose();
});
