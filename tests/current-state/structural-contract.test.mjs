import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { ZoneBase } from '../../src/scene/zones/ZoneBase.js';
import { CourtKit } from '../../src/scene/palace/kit.js';
import { buildRoof } from '../../src/scene/RoofBuilder.js';

const ctx = new Proxy({}, { get: () => () => ({ data: [] }), set: () => true });
globalThis.document ??= { createElement: () => ({ getContext: () => ctx, width: 0, height: 0 }) };
function library() {
  const mats = new Map();
  return { material: n => mats.get(n) ?? (mats.set(n, new THREE.MeshStandardMaterial({ name: n })), mats.get(n)), tileSize: () => 1, aspect: () => 1 };
}

test('ZoneBase preserves explicit hall bay count instead of silently inferring from width', () => {
  const z = new ZoneBase(library(), { id: 'test', items: [] });
  z.buildHall({ kind: 'hall', x: 0, z: 0, w: 30, d: 10, bays: 3, ph: 0.45, enter: true, plaque: false });
  const doorwaySide = new THREE.Vector3(3.5, 1.5, -5);
  assert.equal(z.kit.colliders.some(b => b.containsPoint(doorwaySide)), false,
    'a three-bay central opening spans +/-5m; width-based nine-bay inference wrongly closes x=3.5');
});

test('explicit five-bay gate does not depend on crossing a 20m width threshold', () => {
  const kit = new CourtKit(library());
  const width = kit.gate({ x: 0, z: 0, w: 18, gateKind: 'five-bay', name: '' });
  assert.equal(width, 18);
  for (const x of [-3.6, 0, 3.6]) {
    assert.equal(kit.colliders.some(b => b.containsPoint(new THREE.Vector3(x, 1.5, 0))), false, `portal at x=${x}`);
  }
  assert.equal(kit.colliders.some(b => b.containsPoint(new THREE.Vector3(7.2, 1.5, 0))), true, 'end bay is not a fourth portal');
});

test('a wide wall gate is not silently converted into a five-bay hall', () => {
  const kit = new CourtKit(library());
  assert.equal(kit.gate({ x: 0, z: 0, w: 22, gateKind: 'wall', name: '' }), 24.8);
});

test('unknown gate, roof, item, and unsupported multi-storey types fail explicitly', () => {
  const kit = new CourtKit(library());
  assert.throws(() => kit.gate({ x: 0, z: 0, gateKind: 'guessed' }), /gateKind/);
  assert.throws(() => buildRoof(library(), { type: 'guessed', width: 20, depth: 10, baseY: 5 }), /roof/i);
  assert.throws(() => new ZoneBase(library(), { id: 'bad', items: [{ kind: 'mystery' }] }).build(), /kind/);
  assert.throws(() => kit.hall({ x: 0, z: 0, w: 20, d: 10, storeys: 2 }), /storeys/);
});

test('eave count is independent of structural storey count', () => {
  const kit = new CourtKit(library());
  const { f } = kit.hall({ x: 0, z: 0, w: 20, d: 10, storeys: 1, eaveCount: 2, plaque: false, enter: false });
  assert.equal(f.userData.structure.storeys, 1);
  assert.equal(f.userData.structure.eaveCount, 2);
});

test('passing a hall interior preset does not duplicate furniture around an explicit throne', () => {
  const kit = new CourtKit(library());
  kit.hall({ x: 0, z: 0, w: 38.5, d: 16, ph: 0.9, throne: true, enter: true,
    backDoor: true, interior: 'A:palace-front', plaque: false });
  assert.equal(kit.rooms[0].kind, 'throne');
  assert.equal(kit.colliders.some(b => b.containsPoint(new THREE.Vector3(3.7, 1.9, 0))), false,
    'existing route around throne must not gain a second furnishing template');
});

test('object-level architecture evidence survives material batching', () => {
  const kit = new CourtKit(library());
  kit.hall({ x: -98.4, z: -109.3, w: 44.1, d: 12, rot: -Math.PI / 2,
    structure: 'tiren-pavilion', storeys: 2, enter: true, plaque: false });
  const merged = kit.finish();
  assert.equal(merged.userData.architecture?.[0]?.id, 'axis-courts/tirenge');
  assert.equal(merged.userData.architecture[0].storeys.length, 2);
});
