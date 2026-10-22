import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CHARACTER_REGISTRY } from '../data/characters/index.js';
import { CharacterManager } from '../src/scene/characters/CharacterManager.js';
import { CharacterRenderer } from '../src/scene/characters/CharacterRenderer.js';
import { selectCharacterBudget, selectCharacterLOD } from '../src/scene/characters/CharacterLOD.js';

// Removing the final-submission near cap or its incumbent-distance hysteresis
// must fail these tests. Registry data and geometric LOD states stay independent.
const actor = (id, extra = {}) => ({ id, templateId: 'guard-duty', zoneRef: 'axis', required: true,
  placement: { mode: 'surface' }, behavior: { basePose: 'standing', seed: 1 },
  schedule: 'guard-duty', priority: 'core', ...extra });
const candidate = (id, distance, extra = {}) => actor(id, { lod: 0, distance, ...extra });
const nearIds = selected => selected.filter(a => a.lod === 0).map(a => a.id).sort();
const selectedIds = selected => selected.map(a => a.id).sort();
const choose = (candidates, previous = new Set(), quality = 'high', registered = candidates) =>
  selectCharacterBudget(candidates, quality, registered, previous);
const freeze = object => { if (object && typeof object === 'object' && !Object.isFrozen(object)) {
  Object.values(object).forEach(freeze); Object.freeze(object);
} return object; };
function cameraAt(distance = 0) {
  const camera = new THREE.PerspectiveCamera(60, 1, .1, 1000);
  camera.position.set(0, .9, distance); camera.lookAt(0, .9, -100); camera.updateMatrixWorld(); return camera;
}
function harness(actors = ['a', 'b', 'c'].map(id => actor(id)), { realRenderer = false } = {}) {
  const bindings = new Map(actors.map((a, i) => [a.id, { status: 'ready', position: [0, 0, -(i ? 8 : 5)], rotationYRad: 0 }]));
  const revisions = new Map(actors.map(a => [a.id, 0]));
  const renderer = realRenderer ? new CharacterRenderer({ scene: new THREE.Scene() }) : {
    render: list => ({ renderCopies: list.length }), clear() {}, dispose() {},
  };
  let selected = [];
  const render = renderer.render.bind(renderer), clear = renderer.clear.bind(renderer);
  renderer.render = (list, options) => { selected = list; return render(list, options); };
  renderer.clear = () => { selected = []; clear(); };
  const manager = new CharacterManager({ registry: { actors }, contentApproved: true, renderer,
    adapter: { getRevision: a => revisions.get(a.id), resolve: a => bindings.get(a.id) } });
  const camera = cameraAt();
  return { manager, renderer, camera, bindings, revisions, get selected() { return selected; },
    distance(id, distance) { bindings.get(id).position[2] = -distance; },
    step(dt = .1, options = {}) { manager.update(dt, { camera, ...options }); },
    warm() { for (let i = 0; i < 4; i++) this.step(); }, dispose() { manager.dispose(); } };
}
const registryBefore = JSON.stringify(CHARACTER_REGISTRY);
const synthetic96 = [...CHARACTER_REGISTRY.actors, ...Array.from({ length: 58 }, (_, i) => actor(`synthetic-near-${i}`, { priority: 'optional', required: false }))];

test('pure selection retains all 38 required roles but submits only two complex LOD0 actors including the emperor', () => {
  const candidates = freeze(CHARACTER_REGISTRY.actors.map(a => ({ ...structuredClone(a), distance: 8, lod: 0 })));
  const selected = choose(candidates);
  assert.equal(selected.length, 38);
  assert.equal(nearIds(selected).length, 2);
  assert.ok(nearIds(selected).includes('taihe-emperor-01'));
  assert.equal(selected.filter(a => a.lod === 1).length, 36);
  assert.deepEqual(selectedIds(selected), selectedIds(candidates));
  assert.ok(candidates.every(a => a.lod === 0));
  assert.equal(JSON.stringify(CHARACTER_REGISTRY), registryBefore);
});

for (const count of [38, 96]) test(`real Manager/Renderer submits ${count === 38 ? 38 : 64} visible actors and exactly two real LOD0 instances from ${count} logical actors`, () => {
  const actors = count === 38 ? CHARACTER_REGISTRY.actors : synthetic96;
  const h = harness(actors, { realRenderer: true });
  try {
    for (const a of actors) h.distance(a.id, 8);
    h.step();
    const expectedVisible = Math.min(64, count), s = h.manager.snapshot();
    assert.equal(s.registered, count); assert.equal(s.loaded, count);
    assert.equal(s.visible, expectedVisible); assert.equal(s.near, 2);
    assert.equal(s.renderCopies, expectedVisible); assert.equal(nearIds(h.selected).length, 2);
    assert.ok(nearIds(h.selected).includes('taihe-emperor-01'));
    assert.ok(CHARACTER_REGISTRY.actors.every(a => h.selected.some(s => s.id === a.id)));
    const actualInstances = [0, 1, 2].map(lod => [...h.renderer.batches.values()]
      .filter(b => b.mesh.geometry.userData.lod === lod).reduce((n, b) => n + b.mesh.count, 0));
    assert.deepEqual(actualInstances, [2, expectedVisible - 2, 0]);
    assert.ok([...h.manager.states.values()].every(s => s.lod === 0), 'budget demotion must not rewrite geometric LOD history');
    h.step(.1, { quality: 'low' });
    assert.equal(h.manager.snapshot().visible, 32); assert.equal(h.manager.snapshot().near, 0);
    assert.equal([...h.renderer.batches.values()].filter(b => b.mesh.geometry.userData.lod === 0).length, 0);
  } finally { h.dispose(); }
});

test('pure low selection retains fixed 19 court roles, 32 visible slots, and no complex LOD0', () => {
  const candidates = synthetic96.map(a => ({ ...a, distance: 8, lod: 0 }));
  const selected = choose(candidates, new Set(['taihe-emperor-01']), 'low', CHARACTER_REGISTRY.actors);
  assert.equal(selected.length, 32); assert.deepEqual(nearIds(selected), []);
  const court = selected.filter(a => a.id.startsWith('taihe-'));
  assert.equal(court.length, 19); assert.ok(court.some(a => a.id === 'taihe-emperor-01'));
  for (const side of ['left', 'right']) assert.equal(court.filter(a => a.formation?.side === side).length, 6);
  assert.equal(JSON.stringify(CHARACTER_REGISTRY), registryBefore);
});

test('first near allocation has stable distance/id ties independent of source iteration order', () => {
  const candidates = [candidate('c', 8), candidate('a', 8), candidate('b', 8), candidate('d', 9)];
  assert.deepEqual(nearIds(choose(candidates)), ['a', 'b']);
  assert.deepEqual(nearIds(choose([...candidates].reverse())), ['a', 'b']);
  assert.deepEqual(nearIds(choose([candidate('z', 6), ...candidates])), ['a', 'z']);
});

test('incumbents resist sub-metre distance jitter, exact one-metre ties, and release after a greater-than-one-metre advantage', () => {
  const previous = new Set(['a', 'b']);
  const jitter = [candidate('a', 5), candidate('b', 8.05), candidate('c', 7.95)];
  assert.deepEqual(nearIds(choose(jitter, previous)), ['a', 'b']);
  assert.deepEqual(nearIds(choose([candidate('a', 5), candidate('z', 8), candidate('b', 7)], new Set(['a', 'z']))), ['a', 'z']);
  assert.deepEqual(nearIds(choose([candidate('a', 5), candidate('b', 8), candidate('c', 6.999)], previous)), ['a', 'c']);
  assert.deepEqual([...previous], ['a', 'b'], 'pure selector must not mutate caller history');
  assert.ok(jitter.every(a => a.lod === 0), 'pure selector must not mutate submitted candidates');
});

test('higher priority preempts a closer incumbent without the distance hysteresis delaying it', () => {
  const candidates = [candidate('a', 2), candidate('b', 3), candidate('emperor', 11, { priority: 'essential' })];
  assert.deepEqual(nearIds(choose(candidates, new Set(['a', 'b']))), ['a', 'emperor']);
});

test('Manager retains near membership over repeated tiny movement and does not restart bindings or readiness on a real switch', () => {
  const h = harness();
  try {
    h.distance('c', 8.1); h.warm();
    const bindings = [...h.manager.states.values()].map(s => s.binding);
    for (let i = 0; i < 30; i++) {
      h.distance('b', i % 2 ? 8.05 : 7.95); h.distance('c', i % 2 ? 7.95 : 8.05); h.step(.016);
      assert.deepEqual(nearIds(h.selected), ['a', 'b']);
      assert.equal(h.manager.snapshot().near, 2);
      assert.ok(h.selected.every(a => a.visibility === 1));
    }
    h.distance('b', 8); h.distance('c', 6.9); h.step(.016);
    assert.deepEqual(nearIds(h.selected), ['a', 'c']);
    assert.ok(h.selected.every(a => a.visibility === 1));
    [...h.manager.states.values()].forEach((s, i) => { assert.equal(s.binding, bindings[i]); assert.equal(s.readiness, 1); });
  } finally { h.dispose(); }
});

test('out-of-frustum and distance-ineligible incumbents release slots without sticky IDs or resetting readiness', () => {
  const h = harness();
  try {
    h.distance('c', 8.2); h.warm();
    h.bindings.get('b').position[0] = 100; h.step(.016);
    assert.deepEqual(nearIds(h.selected), ['a', 'c']);
    h.bindings.get('b').position[0] = 0; h.distance('b', 8); h.step(.016);
    assert.deepEqual(nearIds(h.selected), ['a', 'c'], 'a returning actor must compete as a challenger');
    h.distance('c', 15); h.step(.016);
    assert.deepEqual(nearIds(h.selected), ['a', 'b']);
    assert.equal(h.manager.states.get('c').lod, 1);
    assert.ok(h.selected.every(a => a.visibility === 1));
    h.distance('c', 8.1); h.step(.016);
    assert.deepEqual(nearIds(h.selected), ['a', 'b']);
  } finally { h.dispose(); }
});

test('support revisions and pending bindings cannot preserve stale near eligibility', () => {
  const h = harness();
  try {
    h.distance('c', 8.1); h.warm(); h.distance('c', 7.9);
    h.revisions.set('b', 1); h.step(.016);
    assert.deepEqual(nearIds(h.selected), ['a', 'c'], 'ready-to-ready revision must drop the old near incumbency');
    const c = h.bindings.get('c'); h.bindings.set('c', { status: 'pending' }); h.step(.016);
    assert.deepEqual(nearIds(h.selected), ['a', 'b']);
    h.bindings.set('c', c); h.step(.016);
    assert.deepEqual(nearIds(h.selected), ['a', 'b']);
    assert.ok(h.manager.states.get('c').readiness < 1, 'real support loss still restarts readiness normally');
  } finally { h.dispose(); }
});

test('disable and approval gates clear incumbency instead of carrying old near choices into a fresh lifecycle', () => {
  for (const gate of ['disabled', 'approval']) {
    const h = harness();
    try {
      h.distance('c', 8.1); h.warm(); h.distance('c', 7.9);
      if (gate === 'disabled') h.manager.setEnabled(false); else h.manager.contentApproved = false;
      h.step(); assert.equal(h.selected.length, 0); assert.equal(h.manager.snapshot().near, 0);
      if (gate === 'disabled') h.manager.setEnabled(true); else h.manager.contentApproved = true;
      h.step(); assert.deepEqual(nearIds(h.selected), ['a', 'c']);
    } finally { h.dispose(); }
  }
});

test('hidden/resumed frames preserve stable incumbency and pause readiness, while changed view is re-evaluated', () => {
  const h = harness();
  try {
    h.distance('c', 8.1); h.step(.05);
    const readiness = h.manager.states.get('b').readiness, before = h.manager.simulationSeconds;
    h.distance('c', 7.9); h.step(30, { hidden: true }); h.step(30);
    assert.deepEqual(nearIds(h.selected), ['a', 'b']);
    assert.equal(h.manager.states.get('b').readiness, readiness);
    assert.equal(h.manager.simulationSeconds, before);
    h.step(30, { hidden: true }); h.bindings.get('b').position[0] = 100; h.step(30);
    assert.deepEqual(nearIds(h.selected), ['a', 'c']);
  } finally { h.dispose(); }
});

test('quota demotion and quality changes preserve original 12m/40m LOD hysteresis and readiness', () => {
  const h = harness();
  try {
    h.distance('c', 11.5); h.warm();
    assert.equal(h.selected.find(a => a.id === 'c').lod, 1);
    assert.equal(h.manager.states.get('c').lod, 0);
    h.distance('c', 12.1); h.step(.016);
    assert.equal(h.manager.states.get('c').lod, 0, 'budget LOD1 must not force a geometric transition at 12m');
    h.distance('c', 14.2); h.step(.016); assert.equal(h.manager.states.get('c').lod, 1);
    for (const [distance, expected] of [[40.1, 1], [47.3, 2], [35, 2], [32.7, 1], [9.8, 0]]) {
      h.distance('c', distance); h.step(.016); assert.equal(h.manager.states.get('c').lod, expected);
    }
    h.step(.016, { quality: 'low' }); assert.deepEqual(nearIds(h.selected), []);
    h.distance('c', 7.9); h.step(.016, { quality: 'high' });
    assert.deepEqual(nearIds(h.selected), ['a', 'c'], 'low tier must release all prior near incumbents');
    assert.ok(h.selected.every(a => a.visibility === 1));
    assert.equal(selectCharacterLOD({ distance: 12.1, projectedHeight: 80, previousLOD: 0 }), 0);
  } finally { h.dispose(); }
});
