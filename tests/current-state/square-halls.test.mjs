import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PalaceBuilder } from '../../src/scene/PalaceBuilder.js';
import { PALACE_LAYOUT } from '../../src/scene/Layout.js';

const ctx = new Proxy({}, { get: () => () => ({ data: [] }), set: () => true });
globalThis.document ??= { createElement: () => ({ getContext: () => ctx, width: 0, height: 0 }) };

function fixture(name) {
  const mats = new Map();
  const lib = { material: n => mats.get(n) ?? (mats.set(n, new THREE.MeshStandardMaterial({ name: n })), mats.get(n)), tileSize: () => 1, aspect: () => 1 };
  const builder = new PalaceBuilder(new THREE.Scene(), lib);
  const group = new THREE.Group();
  const data = structuredClone(PALACE_LAYOUT.find(h => h.name === name));
  data.position = { x: 0, y: 0, z: 0 };
  builder.buildHall(group, data, 5);
  group.updateMatrixWorld(true);
  return { builder, group, data, blocked: (x, z) => builder.colliders.some(b => b.containsPoint(new THREE.Vector3(x, 6, z))) };
}

test('Zhonghe has a real four-sided veranda outside an inset 3×3 enclosure', () => {
  const { group, blocked } = fixture('中和殿');
  assert.equal(blocked(11, 0), false, 'east/west veranda must not be filled by the old outer red wall');
  assert.equal(blocked(-11, 6), false, 'west veranda must be a walkable ring');
  assert.equal(blocked(6, 11), false, 'north veranda must remain open');
  const shell = group.getObjectByName('中和殿·现状结构');
  assert.ok(shell, 'specialized architectural shell exists');
  assert.equal(shell.userData.structure.bayWidths.length, 3);
  assert.equal(shell.userData.structure.veranda.outerBays, 5);
  assert.ok(shell.userData.structure.veranda.depth >= 2);
});

test('Zhonghe has four central portals and closed adjacent bays', () => {
  const { blocked } = fixture('中和殿');
  for (const [x, z] of [[0, -9.5], [0, 9.5], [-9.5, 0], [9.5, 0]]) {
    assert.equal(blocked(x, z), false, `central portal ${x},${z} must be physically open`);
  }
  for (const [x, z] of [[6.1, -9.5], [6.1, 9.5], [-9.5, 6.1], [9.5, 6.1]]) {
    assert.equal(blocked(x, z), true, `adjacent enclosure ${x},${z} must block walking`);
  }
});

test('open folded door leaves block visitors at their inward tips without closing the central portal', () => {
  for (const name of ['中和殿', '交泰殿']) {
    const { builder } = fixture(name);
    const leafTip = new THREE.Vector3(-2.78, 6.7, -8.3);
    assert.equal(builder.colliders.some(b => b.containsPoint(leafTip)), true, `${name}: real folded leaf must be solid`);
    assert.equal(builder.colliders.some(b => b.containsPoint(new THREE.Vector3(0, 6.7, -8.3))), false);
  }
});

test('Zhonghe front has twelve real leaves while its other faces and Jiaotai have four', () => {
  for (const name of ['中和殿', '交泰殿']) {
    const { group } = fixture(name);
    const counts = { south: 0, north: 0, east: 0, west: 0 };
    group.traverse(o => { if (o.userData.role === 'door-leaf') counts[o.userData.side]++; });
    assert.deepEqual(counts, { south: name === '中和殿' ? 12 : 4, north: 4, east: 4, west: 4 });
  }
});

test('Jiaotai has a central south door with solid sill-window side bays', () => {
  const { blocked } = fixture('交泰殿');
  assert.equal(blocked(0, -9.5), false);
  assert.equal(blocked(-6.3, -9.5), true, 'south side window is not a portal');
  assert.equal(blocked(6.3, -9.5), true, 'south side window is not a portal');
});

test('Jiaotai side and rear facades each have one central portal and two walls', () => {
  const { blocked, group } = fixture('交泰殿');
  for (const [x, z] of [[0, 9.5], [-9.5, 0], [9.5, 0]]) assert.equal(blocked(x, z), false);
  for (const [x, z] of [[6.3, 9.5], [-9.5, 6.3], [9.5, 6.3]]) assert.equal(blocked(x, z), true);
  const shell = group.getObjectByName('交泰殿·现状结构');
  assert.equal(shell.userData.structure.veranda, null, 'Jiaotai must not inherit Zhonghe veranda');
  assert.deepEqual(shell.userData.structure.facades.south, ['window', 'door', 'window']);
  assert.deepEqual(shell.userData.structure.facades.east, ['wall', 'door', 'wall']);
});

test('square-hall roofs have explicit moderate heights instead of default steep cones', () => {
  for (const name of ['中和殿', '交泰殿']) {
    const { group } = fixture(name);
    const shell = group.getObjectByName(`${name}·现状结构`);
    assert.ok(shell);
    const roof = shell.getObjectByName(`${name}·单檐攒尖顶`);
    assert.ok(roof);
    assert.ok(new THREE.Box3().setFromObject(roof).max.y < (name === '中和殿' ? 27 : 23));
    assert.equal(shell.userData.structure.eaveCount, 1);
    assert.equal(shell.userData.structure.storeys, 1);
  }
});

test('Zhonghe plinth has physical east and west stairs and matching side openings', () => {
  const { builder } = fixture('中和殿');
  builder.colliders.length = 0;
  builder.walkables.length = 0;
  builder.buildPlinth(new THREE.Group(), { z0: 65, w: 28, d: 28, y: 8, ph: 1.6, stairW: 6, stairSides: ['south', 'north', 'east', 'west'] });
  assert.equal(builder.walkables.filter(w => w.type === 'ramp' && w.axis === 'x').length, 2);
  for (const x of [-14, 14]) {
    assert.equal(builder.colliders.some(b => b.containsPoint(new THREE.Vector3(x, 8.8, 65))), false,
      `side stair opening at x=${x} must not retain the old plinth wall`);
  }
});

test('integrated Zhonghe plinth retains all eight flights in the 3/3/1/1 arrangement', () => {
  const { builder } = fixture('中和殿');
  builder.walkables.length = 0;
  const halls = PALACE_LAYOUT.filter(h => ['太和殿', '中和殿', '保和殿'].includes(h.name));
  builder.buildComplex(halls, { name: '三台', apron: 14, margin: 4, bottom: { halfW: 65, z0: -54, z1: 178 } });
  const flights = builder.walkables.filter(w => w.type === 'ramp' && Math.max(w.y0, w.y1) === 8.6);
  assert.equal(flights.length, 8);
  assert.equal(flights.filter(w => w.axis === 'x' && w.maxX < 0).length, 1);
  assert.equal(flights.filter(w => w.axis === 'x' && w.minX > 0).length, 1);
  assert.equal(flights.filter(w => w.axis === 'z' && w.maxZ < 65).length, 3);
  assert.equal(flights.filter(w => w.axis === 'z' && w.minZ > 65).length, 3);
});
