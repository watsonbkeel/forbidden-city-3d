import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CHARACTER_REGISTRY } from '../data/characters/index.js';
import { CharacterWorldAdapter } from '../src/scene/characters/CharacterWorldAdapter.js';
import { PatrolController } from '../src/scene/characters/PatrolController.js';
import { R55_STAFF_IDS, closestHorizontalSegments, evaluateR55StaffClearance } from './lib/r55-staff-clearance.mjs';
const p = (x, z, y = 0) => [x, y, z];
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
const staff = 'changchun-maid-02', old = CHARACTER_REGISTRY.actors[0].id;
// Tiny synthetic unit world: one four-vertex floor, no palace or renderer.
// All bindings are actual CharacterWorldAdapter results, never mocked outputs.
function fixture(overrides = {}, { zoneRef = 'static', interiors = null } = {}) {
  const registry = {
    actors: CHARACTER_REGISTRY.actors.map((a, i) => ({ id: a.id, required: true,
      templateId: 'maid-daily', zoneRef,
      placement: { mode: 'surface', anchorRef: 'unit-origin', surfaceRef: 'unit-floor',
        offsetMeters: [i * 10, 0, 20], forwardLocal: [0, 0, 1] }, behavior: { basePose: 'standing' } })),
    anchors: [{ id: 'unit-origin', resolver: 'world', zoneRef, positionMeters: [10000, 0, 10000] }],
    surfaces: [{ id: 'unit-floor', anchorRef: 'unit-origin', zoneRef, kind: 'ground',
      localBoundsMeters: [-100, 1000, -100, 100], expectedHeightMeters: 0, heightToleranceMeters: .03 }], paths: [], seats: []
  };
  for (const [id, points] of Object.entries(overrides)) {
    const actor = registry.actors.find(a => a.id === id);
    if (points.length === 1) actor.placement.offsetMeters = points[0];
    else {
      const path = { id: `${id}-unit-route`, zoneRef, anchorRef: 'unit-origin', surfaceRef: 'unit-floor',
        pointsLocalMeters: points, radiusMeters: .32, safetyMarginMeters: .1, validationSpacingMeters: .25,
        turningRadiusMeters: .5, formationSize: 1 };
      registry.paths.push(path); actor.placement = { mode: 'path', pathRef: path.id, surfaceRef: path.surfaceRef };
    }
  }
  const scene = new THREE.Scene(), floor = new THREE.Mesh(new THREE.PlaneGeometry(1200, 300), new THREE.MeshBasicMaterial());
  floor.rotation.x = -Math.PI / 2; floor.position.set(10450, 0, 10000);
  const group = new THREE.Group(); group.add(floor); scene.add(group);
  const zoneManager = { loaded: new Map([[zoneRef, { data: { group } }]]) };
  const adapter = new CharacterWorldAdapter({ scene, registry, zoneManager, interiors, collisionManager: { colliders: [], walkables: [] } });
  const resolvedBindings = registry.actors.map(actor => {
    const binding = adapter.resolve(actor); assert.equal(binding.status, 'ready', `${actor.id}: ${binding.reason}`);
    return { actor, binding, revision: adapter.getRevision(actor) };
  });
  return { registry, adapter, resolvedBindings };
}
const row = (f, id) => f.resolvedBindings.find(s => s.actor.id === id);
const reject = (f, message) => {
  const result = evaluateR55StaffClearance(f); assert.equal(result.pass, false); assert.equal(result.status, 'invalid-bindings');
  assert.match(result.errors.join('\n'), message); assert.equal(result.minimumPair, null); assert.equal(result.pairsChecked, 0);
};
test('analytic distance covers crossing, endpoint, parallel, collinear and stationary geometry', () => {
  for (const [a, b, c, d, distance] of [
    [p(-2, 0), p(2, 0), p(0, -2), p(0, 2), 0],
    [p(0, 0), p(1, 0), p(1.6, .8), p(2, .8), 1],
    [p(0, 0), p(4, 0), p(1, 1.2), p(3, 1.2), 1.2],
    [p(0, 0), p(4, 0), p(1, 0), p(3, 0), 0],
    [p(0, 0), p(0, 0), p(3, 4), p(3, 4), 5],
    [p(2, .8, 100), p(2, .8, 100), p(0, 0), p(4, 0), .8],
    [p(0, 0), p(4, 1e-12), p(0, 1e-12), p(4, 0), 0],
  ]) {
    const r = closestHorizontalSegments(a, b, c, d); near(r.distanceMeters, distance);
    near(closestHorizontalSegments(d, c, b, a).distanceMeters, distance);
    near(Math.hypot(r.pointA[0] - r.pointB[0], r.pointA[1] - r.pointB[1]), distance);
    assert.ok(r.t >= 0 && r.t <= 1 && r.u >= 0 && r.u <= 1);
  }
  assert.throws(() => closestHorizontalSegments(p(0, 0), p(1, 0), [NaN, 0, 0], p(1, 1)), /finite/);
});
test('all 708 new-involved pairs are checked, old85-only proximity is not regraded, report is small and pure', () => {
  const otherOld = CHARACTER_REGISTRY.actors[1].id;
  const f = fixture({ [old]: [p(0, 0)], [otherOld]: [p(0, 0)], [staff]: [p(0, 1.25)] });
  const before = JSON.stringify({ stats: f.adapter.stats, bindings: f.resolvedBindings });
  const r = evaluateR55StaffClearance(f);
  assert.equal(r.pass, true); assert.equal(r.pairsChecked, 708); assert.equal(r.actorsChecked, 93);
  assert.equal(r.minimumSeparationMeters, 1.2); near(r.minimumPair.distanceMeters, 1.25);
  assert.equal(Object.keys(r.minimumByStaff).length, 8); assert.deepEqual(r.staffActorIds, R55_STAFF_IDS);
  assert.ok(JSON.stringify(r).length < 16000); assert.equal(JSON.stringify({ stats: f.adapter.stats, bindings: f.resolvedBindings }), before);
});
test('all segments, not just start points or endpoints, are checked against stationary roles', () => {
  const f = fixture({ [staff]: [p(-4, -4), p(-4, 0), p(4, 0)], [old]: [p(0, .9)] });
  const r = evaluateR55StaffClearance(f); assert.equal(r.pass, false); assert.equal(r.status, 'insufficient-clearance');
  near(r.minimumPair.distanceMeters, .9); assert.equal(r.minimumPair.segmentIndices[r.minimumPair.actorIds.indexOf(staff)], 1);
  const patrol = new PatrolController({ path: row(f, staff).binding.path, formationSize: 1, speedMetersPerSecond: 1, pauseSeconds: 0 });
  const actual = patrol.atDistance(8).position, stationary = row(f, old).binding.position;
  near(Math.hypot(actual[0] - stationary[0], actual[2] - stationary[2]), .9);
});
test('crossing fails despite real PatrolController samples staying separated at every shared phase', () => {
  const f = fixture({ [staff]: [p(-5, 0), p(5, 0)], [old]: [p(0, -5), p(0, 5)] });
  const a = new PatrolController({ path: row(f, staff).binding.path, formationSize: 1, speedMetersPerSecond: 1, pauseSeconds: 0 });
  const b = new PatrolController({ path: row(f, old).binding.path, formationSize: 1, speedMetersPerSecond: 1, pauseSeconds: 0 });
  let sameTimeMinimum = Infinity;
  for (let t = 0; t <= a.cycleSeconds; t += .01) {
    const x = a.sample(t).position, y = b.sample(t + 5).position;
    sameTimeMinimum = Math.min(sameTimeMinimum, Math.hypot(x[0] - y[0], x[2] - y[2]));
  }
  assert.ok(sameTimeMinimum > 3.5); const r = evaluateR55StaffClearance(f); assert.equal(r.pass, false); near(r.minimumPair.distanceMeters, 0);
});
test('near endpoints and new-new pairs fail', () => {
  const f = fixture({ [staff]: [p(-3, 0), p(0, 0)], [R55_STAFF_IDS[1]]: [p(.8, .8)] });
  const r = evaluateR55StaffClearance(f); assert.equal(r.pass, false); near(r.minimumPair.distanceMeters, Math.sqrt(1.28));
  assert.deepEqual(new Set(r.minimumPair.actorIds), new Set(R55_STAFF_IDS.slice(0, 2)));
});
test('fixed 1.2 m threshold cannot be lowered by an option or rounding', () => {
  const f = fixture({ [staff]: [p(0, 0)], [old]: [p(0, 1.19)] });
  assert.equal(evaluateR55StaffClearance({ ...f, minimumSeparationMeters: 0 }).pass, false);
  near(evaluateR55StaffClearance(f).minimumPair.distanceMeters, 1.19);
});
test('missing and unready new or retained actors, duplicate IDs and unknown extras fail closed', () => {
  for (const id of [staff, old]) {
    const f = fixture(); f.resolvedBindings = f.resolvedBindings.filter(s => s.actor.id !== id); reject(f, /missing|93/i);
    const g = fixture(); row(g, id).binding = { status: 'pending', reason: 'zone not loaded' }; reject(g, /ready/);
  }
  const duplicate = fixture(); duplicate.resolvedBindings[0] = duplicate.resolvedBindings[1]; reject(duplicate, /duplicate/i);
  const extra = fixture(); extra.resolvedBindings.push({ actor: { id: 'unknown' }, binding: { status: 'ready' } }); reject(extra, /unknown|93/i);
});
test('wrong actor, swapped stationary binding, wrong path identity and stale source cache fail closed', () => {
  const actor = fixture(); row(actor, staff).actor = { ...row(actor, staff).actor }; reject(actor, /actor identity/i);
  const swapped = fixture(); row(swapped, staff).binding = row(swapped, old).binding; reject(swapped, /binding identity/i);
  const path = fixture({ [staff]: [p(-2, 0), p(2, 0)] }); row(path, staff).binding.path.id = 'some-other-path'; reject(path, /path identity/i);
  const alias = fixture({ [staff]: [p(-2, 0), p(2, 0)] }); row(alias, staff).binding.path.pointsMeters = [p(0, 0), p(1, 0)]; reject(alias, /path points/i);
  const stale = fixture(); stale.adapter.invalidate(); reject(stale, /binding identity/i);
  const revision = fixture(); row(revision, staff).revision = 'foreign-revision'; reject(revision, /revision/i);
  const disposed = fixture(); disposed.adapter.dispose(); reject(disposed, /disposed/i);
  const source = fixture(); source.registry = { ...source.registry }; reject(source, /registry identity/i);
});
test('actual resolved multi-segment parallel routes use every segment and include the exact threshold', () => {
  const f = fixture({ [staff]: [p(-4, 0), p(0, 0), p(4, 0)], [old]: [p(-3, 2), p(0, 2), p(3, 2)] });
  const r = evaluateR55StaffClearance(f); assert.equal(r.pass, true); near(r.minimumPair.distanceMeters, 2);
  assert.ok(r.segmentPairsChecked > r.pairsChecked);
  const distance = closestHorizontalSegments(p(0, 0), p(3, 0), p(0, 1.2), p(3, 1.2)).distanceMeters;
  assert.equal(distance >= 1.2, true);
});
test('malformed paths, support mismatches, actor demotion and registry replacement fail closed', () => {
  const corruptions = [
    [f => row(f, staff).binding.path.status = 'pending', /path identity/i],
    [f => row(f, staff).binding.path.anchorRef = 'wrong-anchor', /path specification/i],
    [f => row(f, staff).binding.path.validationGeneration = '99:foreign-world', /generation/i],
    [f => row(f, staff).binding.support.surfaceRef = 'wrong-floor', /support identity/i],
    [f => row(f, staff).binding.path.points[1][0] = NaN, /path points/i],
    [f => row(f, staff).binding.position = [NaN, 0, 0], /transform/i],
    [f => row(f, old).actor.required = false, /demoted/i],
    [f => row(f, old).actor.id = 'padding-actor', /unknown|missing/i],
  ];
  for (const [corrupt, message] of corruptions) {
    const f = fixture({ [staff]: [p(-2, 0), p(2, 0)] }); corrupt(f); reject(f, message);
  }
  reject({}, /real.*adapter|93/i);
});
test('finite but numerically unrepresentable segment arithmetic fails closed instead of reporting NaN clearance', () => {
  assert.throws(() => closestHorizontalSegments(p(-1e308, 0), p(1e308, 0), p(0, 3), p(0, 4)), /range|representable|finite/i);
});
test('coherent replacement of a crossing path cannot impersonate the cached resolved path', () => {
  const f = fixture({ [staff]: [p(-5, 0), p(5, 0)], [old]: [p(0, -5), p(0, 5)] });
  assert.equal(evaluateR55StaffClearance(f).pass, false);
  const entry = row(f, staff), points = [entry.binding.path.points[0], p(9996, 10000)];
  entry.binding.path = { ...entry.binding.path, points, pointsMeters: points };
  reject(f, /path identity/i);
});
test('stationary centers cannot detach from their actual ready surface support', () => {
  const moved = fixture({ [staff]: [p(0, 0)], [old]: [p(.5, 0)] });
  assert.equal(evaluateR55StaffClearance(moved).pass, false);
  row(moved, staff).binding.position = p(10005, 10000);
  reject(moved, /surface support/i);
  const pending = fixture(); row(pending, staff).binding.support.status = 'pending'; reject(pending, /surface support/i);
});

test('a replaced loaded-zone group invalidates old bindings even before manager update and without changing adapter.generation', () => {
  const f = fixture({ [staff]: [p(-5, 0), p(5, 0)] }, { zoneRef: 'unit-zone' });
  assert.equal(evaluateR55StaffClearance(f).pass, true);
  const generation = f.adapter.generation, cached = f.adapter.cache.get(staff), entry = row(f, staff);
  const oldGroup = f.adapter.zoneManager.loaded.get('unit-zone').data.group, newGroup = new THREE.Group();
  newGroup.add(...oldGroup.children); f.adapter.scene.remove(oldGroup); f.adapter.scene.add(newGroup);
  f.adapter.zoneManager.loaded.set('unit-zone', { data: { group: newGroup } });
  assert.equal(f.adapter.generation, generation); assert.equal(f.adapter.cache.get(staff), cached);
  assert.equal(cached.result, entry.binding); assert.ok(cached.key.startsWith(`${staff}:${entry.revision}:`));
  const nextId = f.adapter.nextId, beforeStats = JSON.stringify(f.adapter.stats);
  reject(f, /generation|zone/i);
  assert.equal(f.adapter.nextId, nextId); assert.equal(f.adapter.objectIds.has(newGroup), false);
  assert.equal(JSON.stringify(f.adapter.stats), beforeStats); assert.equal(f.adapter.cache.get(staff), cached);
});

test('an unloaded zone cannot retain a ready clearance report from its old cached bindings', () => {
  const f = fixture({}, { zoneRef: 'unit-zone' });
  assert.equal(evaluateR55StaffClearance(f).pass, true);
  f.adapter.zoneManager.loaded.delete('unit-zone');
  reject(f, /generation|zone/i);
});

test('interior token, state and group replacement invalidate all old generations without resolving or mutating IDs', () => {
  for (const change of [h => h.token++, h => h.state = 'unloading', h => h.group = new THREE.Group()]) {
    const hall = { id: 'unit-interior', state: 'ready', token: 1, group: new THREE.Group() };
    const f = fixture({ [staff]: [p(-5, 0), p(5, 0)] }, { interiors: { halls: new Map([[hall.id, hall]]) } });
    assert.equal(evaluateR55StaffClearance(f).pass, true);
    change(hall);
    const nextId = f.adapter.nextId, known = f.adapter.objectIds.has(hall.group);
    reject(f, /generation|interior/i);
    assert.equal(f.adapter.nextId, nextId); assert.equal(f.adapter.objectIds.has(hall.group), known);
  }
});

test('already registered replacement groups still reject stale cache, and actual fresh bindings restore a pass', () => {
  const f = fixture({ [staff]: [p(-5, 0), p(5, 0)] }, { zoneRef: 'unit-zone' });
  const priorGeneration = row(f, staff).binding.path.validationGeneration;
  const oldGroup = f.adapter.zoneManager.loaded.get('unit-zone').data.group, newGroup = new THREE.Group();
  newGroup.add(...oldGroup.children); f.adapter.scene.remove(oldGroup); f.adapter.scene.add(newGroup);
  f.adapter.zoneManager.loaded.set('unit-zone', { data: { group: newGroup } });
  // Production method is used only for setup, NOT by the pure helper. It makes
  // the new identity known so rejection cannot rely just on an unseen-object check.
  const currentGeneration = f.adapter.getGeneration('unit-zone');
  assert.notEqual(currentGeneration, priorGeneration); assert.equal(f.adapter.objectIds.has(newGroup), true);
  for (const entry of f.resolvedBindings) delete entry.revision;
  reject(f, /generation/i);
  // The test owner explicitly obtains genuinely fresh real-adapter bindings.
  f.resolvedBindings = f.registry.actors.map(actor => {
    const binding = f.adapter.resolve(actor); assert.equal(binding.status, 'ready');
    return { actor, binding, revision: f.adapter.getRevision(actor) };
  });
  const r = evaluateR55StaffClearance(f); assert.equal(r.pass, true); assert.equal(r.pairsChecked, 708);
  assert.equal(row(f, staff).binding.path.validationGeneration, currentGeneration);
});

test('clearance generation checks never call mutable adapter methods or register object IDs', () => {
  const f = fixture({ [staff]: [p(-5, 0), p(5, 0)] }, { zoneRef: 'unit-zone' });
  const nextId = f.adapter.nextId, before = JSON.stringify({ stats: f.adapter.stats, bindings: f.resolvedBindings });
  for (const method of ['_id', 'getGeneration', 'getRevision', 'resolve', 'resolveAnchor', 'supportAt', 'validatePath', 'request', 'advance', 'invalidate']) {
    Object.defineProperty(f.adapter, method, { get() { throw new Error(`Pure helper accessed forbidden method ${method}`); } });
  }
  assert.equal(evaluateR55StaffClearance(f).pass, true);
  assert.equal(f.adapter.nextId, nextId);
  assert.equal(JSON.stringify({ stats: f.adapter.stats, bindings: f.resolvedBindings }), before);
});
