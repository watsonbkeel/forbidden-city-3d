import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { ZoneManager } from '../src/scene/zones/ZoneManager.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { INITIAL_VIEW_POSITION } from '../src/config/initialView.js';
import { LAYOUT } from '../src/config/constants.js';
import { loadZoneJsons } from './lib/world.mjs';

const zoneJsons = loadZoneJsons().map(({ json }) => json);
const axis = zoneJsons.find(zone => zone.id === 'axis-courts');

// Isolate residency policy from expensive architecture generation. The actual
// manager, scene, collider registration and queue are exercised, not mocked.
class SmallZoneBuilder {
  constructor(_library, config) { this.config = config; }
  build() {
    const { x0, z0 } = this.config.bounds;
    this.group = new THREE.Group();
    return {
      group: this.group, regions: [], mapItems: [], rooms: [], walkables: [],
      colliders: [new THREE.Box3(new THREE.Vector3(x0, 0, z0), new THREE.Vector3(x0 + 1, 2, z0 + 1))],
    };
  }
  dispose() { this.group.removeFromParent(); }
}
function fixture(t, search = '') {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { search } };
  t.after(() => { if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow; });
  const manager = new ZoneManager();
  for (const json of zoneJsons) manager.register(json, SmallZoneBuilder);
  const warnings = [];
  t.mock.method(console, 'warn', message => warnings.push(message));
  t.mock.method(console, 'log', () => {});
  const cm = new CollisionManager();
  const scene = new THREE.Scene();
  t.after(() => { if (manager.scene) manager.dispose(); });
  return { manager, cm, scene, warnings };
}

// Reverting only axis-courts.z0 to -493.6 must fail both entry assertions.
test('accepted initial view belongs to axis-courts at the minimally extended computational edge', t => {
  const { manager } = fixture(t);
  assert.deepEqual(INITIAL_VIEW_POSITION, { x: 0, y: 1.7, z: -494 });
  assert.equal(manager.findZone(INITIAL_VIEW_POSITION.x, INITIAL_VIEW_POSITION.z), 'axis-courts');
  assert.deepEqual(axis.bounds, { x0: -130, x1: 157.5, z0: -494, z1: 204.6 });
  assert.equal(manager.findZone(0, INITIAL_VIEW_POSITION.z - 1e-6), null, 'no wider southward extension');
  assert.equal(manager.findZone(0, -493.6), 'axis-courts', 'inherited extent stays covered');
  assert.deepEqual(LAYOUT.BOUNDARY, { minX: -400, maxX: 400, minZ: -500, maxZ: 560 });
  assert.deepEqual(LAYOUT.START_POSITION, { x: 0, y: 1.7, z: -470 }, 'perf position stays unchanged');
});

test('normal startup resolves the accepted view without fallback and retains first-zone-plus-neighbor loading', t => {
  const { manager, cm, scene, warnings } = fixture(t);
  manager.init(scene, {}, cm, INITIAL_VIEW_POSITION);
  assert.equal(manager.getCurrentId(), 'axis-courts');
  assert.deepEqual(manager.getLoadedIds(), ['axis-courts']);
  assert.deepEqual(manager.buildQueue, axis.neighbors.map(zoneId => ({ zoneId, priority: 1 })));
  assert.deepEqual(cm.colliders.map(collider => collider.tag), ['axis-courts']);
  assert.equal(warnings.some(message => message.includes('玩家初始位置')), false);
  assert.equal(manager.prebuilt.size, zoneJsons.length - 1, 'dry metadata generation is unchanged');
});

test('an unmapped initial position truthfully falls back to the first zone without loading every zone', t => {
  const { manager, cm, scene, warnings } = fixture(t);
  const unmapped = { x: -399, z: -499 };
  assert.equal(manager.findZone(unmapped.x, unmapped.z), null);
  manager.init(scene, {}, cm, unmapped);
  assert.equal(manager.getCurrentId(), zoneJsons[0].id);
  assert.deepEqual(manager.getLoadedIds(), [zoneJsons[0].id]);
  assert.deepEqual(manager.buildQueue, zoneJsons[0].neighbors.map(zoneId => ({ zoneId, priority: 1 })));
  assert.deepEqual(cm.colliders.map(collider => collider.tag), [zoneJsons[0].id]);
  const fallback = warnings.filter(message => message.includes('玩家初始位置'));
  assert.equal(fallback.length, 1);
  assert.match(fallback[0], /当前区回退到首个注册区/);
  assert.doesNotMatch(fallback[0], /加载所有区/);
  assert.equal(manager.ensureLoadedAt(unmapped.x, unmapped.z), null);
  assert.deepEqual(manager.getLoadedIds(), [zoneJsons[0].id]);
});

test('explicit zones=all still loads every registered zone even when the initial position is unmapped', t => {
  const { manager, cm, scene, warnings } = fixture(t, '?zones=all');
  manager.init(scene, {}, cm, { x: -399, z: -499 });
  assert.equal(manager.getCurrentId(), zoneJsons[0].id);
  assert.deepEqual(manager.getLoadedIds(), zoneJsons.map(zone => zone.id));
  assert.deepEqual(cm.colliders.map(collider => collider.tag), zoneJsons.map(zone => zone.id));
  assert.deepEqual(manager.buildQueue, []);
  assert.match(warnings.find(message => message.includes('玩家初始位置')), /当前区回退到首个注册区/);
});
