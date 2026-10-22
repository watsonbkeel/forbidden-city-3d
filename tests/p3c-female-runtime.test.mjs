import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CHARACTER_REGISTRY } from '../data/characters/index.js';
import { createCharacterGeometry } from '../src/scene/characters/CharacterKit.js';
import { CharacterResourcePool } from '../src/scene/characters/CharacterResourcePool.js';
import { CharacterRenderer } from '../src/scene/characters/CharacterRenderer.js';
import { CharacterSystem, CHARACTER_ROLLOUT_APPROVED } from '../src/scene/characters/CharacterSystem.js';
import { CharacterManager } from '../src/scene/characters/CharacterManager.js';
import { CharacterWorldAdapter } from '../src/scene/characters/CharacterWorldAdapter.js';
import { PatrolController } from '../src/scene/characters/PatrolController.js';

const femaleIds = ['consort-daily', 'maid-daily'];
const drain = iterator => { let step; do { step = iterator.next(); } while (!step.done); return step.value; };
const resourceKey = (id, lod, walking = false, pose = 'standing', seat = 'standard') => `${id}|${pose}|${lod}|${seat}${walking ? '|femalePose=walking' : ''}`;
const sameGeometry = (actual, expected) => {
  assert.deepEqual(Object.keys(actual.attributes), Object.keys(expected.attributes));
  for (const [key, attr] of Object.entries(expected.attributes)) assert.deepEqual(actual.attributes[key].array, attr.array, key);
  assert.deepEqual(actual.index.array, expected.index.array);
  assert.deepEqual(actual.userData, expected.userData);
};
const actor = (id, templateId = 'consort-daily', mode = 'path') => ({
  id, templateId, zoneRef: 'static', required: true, priority: 'core', schedule: 'daily-daylight',
  behavior: { basePose: 'standing', speedMetersPerSecond: .6, pauseSeconds: 1, followerIndex: 0, followerSpacingMeters: 1.2 },
  placement: mode === 'path' ? { mode, pathRef: 'route', surfaceRef: 'floor' } : { mode, anchorRef: 'a', surfaceRef: 'floor', offsetMeters: [0, 0, 0], forwardLocal: [0, 0, 1] },
});
const rendered = (a, lod = 1, speed = .6) => ({ ...a, pose: a.behavior?.basePose ?? 'standing', lod, position: [0, 0, 0], rotationYRad: 0, visibility: 1, animation: { phase: 0, amplitude: .7, walkSpeed: speed, poseIndex: 0 } });
const preparation = pool => Object.assign(Object.create(CharacterSystem.prototype), { pool, metrics: new Map() });
const makeCamera = () => { const camera = new THREE.PerspectiveCamera(60, 1, .1, 1000); camera.position.set(0, 1.6, 8); camera.lookAt(0, 1, 0); camera.updateMatrixWorld(); return camera; };
function miniatureWorld() {
  const scene = new THREE.Scene(), floor = new THREE.Mesh(new THREE.BoxGeometry(20, .2, 20), new THREE.MeshBasicMaterial());
  floor.position.y = -.1; scene.add(floor);
  const registry = {
    anchors: [{ id: 'a', zoneRef: 'static', resolver: 'world', positionMeters: [0, 0, 0], rotationYRad: 0 }],
    surfaces: [{ id: 'floor', zoneRef: 'static', anchorRef: 'a', kind: 'ground', localBoundsMeters: [-10, 10, -10, 10], expectedHeightMeters: 0, heightToleranceMeters: .03 }],
    seats: [], paths: [{ id: 'route', zoneRef: 'static', anchorRef: 'a', surfaceRef: 'floor', pointsLocalMeters: [[0, 0, 0], [0, 0, 2]], radiusMeters: .3, safetyMarginMeters: .1, validationSpacingMeters: .25, turningRadiusMeters: .5, formationSize: 1 }],
  };
  const adapter = new CharacterWorldAdapter({ scene, registry, collisionManager: { colliders: [], walkables: [], checkBoundary: () => true, checkRiverCrossing: () => true } });
  return { scene, adapter, dispose() { adapter.dispose(); floor.geometry.dispose(); floor.material.dispose(); } };
}
async function finish(adapter, promise) {
  let frames = 0;
  while (adapter.work.snapshot().pending) { adapter.advance({ budgetMs: 20, maxSteps: 128 }); assert.ok(++frames < 20000, 'bounded preparation must terminate'); }
  return promise;
}

for (const id of femaleIds) test(`${id}: prepared and acquired folded/hanging variants coexist at every LOD`, () => {
  const pool = new CharacterResourcePool();
  try {
    for (const lod of [0, 1, 2]) {
      const folded = pool.acquire(id, 'standing', lod);
      const ready = drain(pool.prepare(id, 'standing', lod, { femalePose: 'walking' }));
      const hanging = pool.acquire(id, 'standing', lod, { femalePose: 'walking' });
      assert.equal(folded.key, resourceKey(id, lod));
      assert.equal(hanging.key, resourceKey(id, lod, true));
      assert.notEqual(hanging.geometry, folded.geometry);
      assert.equal(hanging.geometry, ready.geometry, 'acquire must reuse the exact prepared variant');
      assert.notDeepEqual(hanging.geometry.attributes.position.array, folded.geometry.attributes.position.array);
      const expected = createCharacterGeometry(id, 'standing', lod, { femalePose: 'walking' });
      sameGeometry(hanging.geometry, expected); expected.dispose();
      const alias = pool.acquire(id, 'standing', lod, { femalePose: 'resting' });
      assert.equal(alias.key, folded.key); assert.equal(alias.geometry, folded.geometry);
      for (const r of [folded, hanging, alias]) pool.release(r.key);
    }
    assert.equal(pool.stats().entries, 6); assert.equal(pool.stats().references, 0);
  } finally { pool.dispose(); }
});

test('cached defaults cannot hide invalid female options, poses, templates or LODs', () => {
  const pool = new CharacterResourcePool();
  try {
    pool.acquire('guard-duty', 'standing', 1);
    pool.acquire('consort-daily', 'standing', 1);
    pool.acquire('consort-daily', 'seated', 1);
    const invalid = [
      ['guard-duty', 'standing', 1, { femalePose: 'walking' }, /female/i],
      ['consort-daily', 'seated', 1, { femalePose: 'walking' }, /standing/i],
      ['consort-daily', 'standing', 1, { femalePose: 'typo' }, /female/i],
      ['consort-daily', 'standing', '1', {}, /LOD/i],
      ['not-a-template', 'standing', 1, {}, /template/i],
      ['consort-daily', 'not-a-pose', 1, {}, /pose/i],
      ['consort-daily', 'standing', 1, { seatVariant: 'kang-low' }, /seat/i],
      ['consort-daily', 'seated', 1, { seatVariant: 'typo' }, /seat/i],
    ];
    for (const [id, pose, lod, options, pattern] of invalid) {
      assert.throws(() => pool.acquire(id, pose, lod, options), pattern);
      assert.throws(() => drain(pool.prepare(id, pose, lod, options)), pattern);
    }
    assert.equal(pool.stats().entries, 3); assert.equal(pool.stats().references, 3);
  } finally { pool.dispose(); }
});

test('only immutable standing female route identity selects hanging arms, never speed or behavior.pathRef', () => {
  const pool = new CharacterResourcePool(), system = preparation(pool), renderer = new CharacterRenderer({ scene: new THREE.Scene(), pool });
  const cases = [];
  for (const id of femaleIds) {
    cases.push([actor(`${id}-walk`, id), true]);
    cases.push([actor(`${id}-fixed`, id, 'surface'), false]);
    cases.push([{ ...actor(`${id}-missing-path`, id), placement: { mode: 'path' }, behavior: { basePose: 'standing', pathRef: 'route' } }, false]);
    cases.push([{ ...actor(`${id}-misplaced-path`, id, 'surface'), placement: { mode: 'surface', pathRef: 'route' } }, false]);
    cases.push([{ ...actor(`${id}-kneeling`, id), behavior: { basePose: 'kneeling' } }, false]);
    cases.push([{ ...actor(`${id}-seated`, id), behavior: { basePose: 'seated' } }, false]);
  }
  cases.push([actor('male-route', 'guard-duty'), false]);
  try {
    for (const [a, walking] of cases) {
      drain(system.prepareFor(a));
      for (const lod of [0, 1, 2]) {
        const pose = a.behavior.basePose;
        assert.ok(pool.entries.has(resourceKey(a.templateId, lod, walking, pose)));
        renderer.render([rendered(a, lod, walking ? 0 : 5)]);
        const batch = [...renderer.batches.values()][0];
        assert.equal(batch.resourceKey, resourceKey(a.templateId, lod, walking, pose));
        const expected = createCharacterGeometry(a.templateId, pose, lod, walking ? { femalePose: 'walking' } : {});
        assert.deepEqual(batch.mesh.geometry.attributes.position.array, expected.attributes.position.array); expected.dispose();
      }
    }
  } finally { renderer.dispose(); }
});

test('folded and hanging women get unique batches while default and male keys stay byte-for-byte compatible', () => {
  const renderer = new CharacterRenderer({ scene: new THREE.Scene() });
  try {
    const fixed = actor('fixed', 'consort-daily', 'surface'), route = actor('route');
    const maid = actor('maid', 'maid-daily', 'surface'), male = actor('male', 'guard-duty');
    const stats = renderer.render([fixed, route, maid, male].map(a => rendered(a, 1)));
    assert.equal(stats.renderCopies, 4); assert.equal(stats.batches, 4);
    assert.deepEqual([...renderer.batches.keys()], [
      'consort-daily|standing|1|static|standard',
      'consort-daily|standing|1|static|standard|femalePose=walking',
      'maid-daily|standing|1|static|standard',
      'guard-duty|standing|1|static|standard',
    ]);
    for (const a of [fixed, maid, male]) {
      const expected = createCharacterGeometry(a.templateId, 'standing', 1);
      const cached = renderer.pool.entries.get(resourceKey(a.templateId, 1)).geometry;
      sameGeometry(cached, expected); expected.dispose();
    }
    assert.equal(renderer.pool.stats().references, 4);
    renderer.clear(); assert.equal(renderer.pool.stats().references, 0);
  } finally { renderer.dispose(); }
});

test('actual registry prewarms 27 resource keys for all 38 required actors and keeps emperor priority', () => {
  const scene = new THREE.Scene(), pool = new CharacterResourcePool(), prep = preparation(pool), renderer = new CharacterRenderer({ scene, pool });
  const camera = makeCamera(), path = { status: 'ready', id: 'fixture', points: [[0, 0, 0], [0, 0, 4]], formationSize: 3 };
  const manager = new CharacterManager({ registry: CHARACTER_REGISTRY, renderer, contentApproved: true,
    adapter: { getRevision: () => 'same', resolve: () => ({ status: 'ready', position: [0, 0, 0], rotationYRad: 0, path }) },
    patrolFactory: (a, binding) => new PatrolController({ path: { ...binding.path, formationSize: a.templateId === 'guard-duty' ? 3 : 1 } }),
  });
  try {
    for (const a of CHARACTER_REGISTRY.actors) drain(prep.prepareFor(a));
    assert.equal(CHARACTER_REGISTRY.actors.length, 38); assert.ok(CHARACTER_REGISTRY.actors.every(a => a.required));
    assert.equal(pool.entries.size, 27);
    assert.deepEqual([...pool.entries.keys()].filter(k => k.includes('femalePose=')), [0, 1, 2].map(lod => resourceKey('consort-daily', lod, true)));
    assert.equal(CHARACTER_REGISTRY.actors.filter(a => femaleIds.includes(a.templateId) && a.placement.mode === 'path').length, 1);
    const cached = new Map([...pool.entries].map(([key, entry]) => [key, entry.geometry]));
    manager.update(.1, { camera, quality: 'high' });
    assert.equal(manager.snapshot().loaded, 38); assert.equal(manager.snapshot().visible, 38);
    for (const s of manager.states.values()) assert.ok(s.binding, `${s.actor.id}: required coverage`);
    for (const quality of ['low', 'high']) {
      manager.update(.1, { camera, quality });
      assert.equal(manager.snapshot().errors, 0);
      assert.ok([...renderer.batches.values()].some(b => b.mesh.geometry.userData.templateId === 'emperor-ceremonial'), 'required emperor is retained');
      assert.equal(pool.entries.size, 27, 'renderer must not author a missing default/walking geometry');
      for (const [key, geometry] of cached) assert.equal(pool.entries.get(key).geometry, geometry);
    }
    assert.equal(CHARACTER_ROLLOUT_APPROVED, false);
  } finally { manager.dispose(); }
});

test('real route pauses and resumes without geometry replacement, binding churn or readiness restart', () => {
  const pool = new CharacterResourcePool(), prep = preparation(pool), a = actor('route'), renderer = new CharacterRenderer({ scene: new THREE.Scene(), pool }), camera = makeCamera();
  drain(prep.prepareFor(a));
  const path = { status: 'ready', id: 'route', points: [[0, 0, 0], [0, 0, .6]], formationSize: 1 };
  const manager = new CharacterManager({ registry: { actors: [a] }, renderer, contentApproved: true,
    adapter: { getRevision: () => 'same-route', resolve: () => ({ status: 'ready', position: [0, 0, 0], rotationYRad: 0, path }) },
    patrolFactory: (actor, binding) => new PatrolController({ path: binding.path, speedMetersPerSecond: .6, pauseSeconds: 1 }),
  });
  try {
    let mesh, geometry, resource, sawWalking = false, sawPause = false, sawResume = false;
    for (let i = 0; i < 27; i++) {
      manager.update(.1, { camera });
      const batch = [...renderer.batches.values()][0]; assert.ok(batch);
      if (!mesh) { mesh = batch.mesh; geometry = mesh.geometry; resource = batch.resourceKey; }
      assert.equal(batch.mesh, mesh); assert.equal(batch.mesh.geometry, geometry); assert.equal(batch.resourceKey, resourceKey(a.templateId, 0, true));
      assert.equal(batch.resourceKey, resource); assert.equal(manager.snapshot().renderCopies, 1);
      const speed = mesh.geometry.attributes.characterAnim.getZ(0);
      if (speed > 0) { if (sawPause) sawResume = true; else sawWalking = true; } else sawPause = true;
      if (i >= 3) { assert.equal(manager.states.get(a.id).readiness, 1); assert.equal(mesh.geometry.attributes.characterVisibility.getX(0), 1); }
    }
    assert.ok(sawWalking && sawPause && sawResume, 'exercise actual outbound, stopped turn and return travel');
    assert.equal(pool.stats().entries, 3); assert.equal(pool.stats().references, 1);
    for (const distance of [25, 70, 25, 8]) {
      camera.position.z = distance; camera.lookAt(0, 1, 0); manager.update(.016, { camera });
      const batch = [...renderer.batches.values()][0];
      assert.match(batch.resourceKey, /\|femalePose=walking$/); assert.equal(manager.states.get(a.id).readiness, 1);
      assert.equal(pool.stats().entries, 3); assert.equal(pool.stats().references, 1); assert.equal(manager.snapshot().renderCopies, 1);
    }
    manager.setEnabled(false); assert.equal(pool.stats().references, 0); assert.equal(renderer.batches.size, 0);
    manager.setEnabled(true); manager.update(.1, { camera });
    assert.equal(pool.stats().entries, 3); assert.equal(pool.stats().references, 1);
    assert.match([...renderer.batches.values()][0].resourceKey, /\|femalePose=walking$/);
  } finally { manager.dispose(); }
});

test('real queue publishes a path binding only after all matching walking LODs are prepared', async () => {
  const w = miniatureWorld(), pool = new CharacterResourcePool(), system = preparation(pool), a = actor('route');
  try {
    const promise = w.adapter.request(a, subject => system.prepareFor(subject)); let settled = false;
    promise.then(() => { settled = true; });
    w.adapter.advance({ budgetMs: 100, maxSteps: 1 }); await Promise.resolve();
    assert.equal(settled, false); assert.equal(pool.stats().entries, 0); assert.equal(w.adapter.cache.size, 0);
    const binding = await finish(w.adapter, promise); assert.equal(binding.status, 'ready');
    assert.deepEqual([...pool.entries.keys()], [0, 1, 2].map(lod => resourceKey(a.templateId, lod, true)));
    const renderer = new CharacterRenderer({ scene: w.scene, pool });
    const cached = [...pool.entries.values()].map(e => e.geometry);
    for (const lod of [0, 1, 2, 0]) renderer.render([{ ...rendered(a, lod), position: binding.position }]);
    assert.deepEqual([...pool.entries.values()].map(e => e.geometry), cached);
    renderer.dispose();
  } finally { pool.dispose(); w.dispose(); }
});

test('cancelled preparation, changed identity and reloaded world cannot publish stale walking bindings', async () => {
  for (const change of ['explicit-disable', 'base-pose', 'placement', 'template', 'reload']) {
    const w = miniatureWorld(), pool = new CharacterResourcePool(), system = preparation(pool), a = actor('route');
    try {
      const promise = w.adapter.request(a, subject => system.prepareFor(subject));
      w.adapter.advance({ budgetMs: 100, maxSteps: 3 });
      assert.equal(pool.stats().entries, 0); assert.equal(w.adapter.cache.size, 0);
      if (change === 'explicit-disable') w.adapter.cancelPending('Characters disabled');
      if (change === 'base-pose') a.behavior.basePose = 'kneeling';
      if (change === 'placement') a.placement = actor('fixed', 'consort-daily', 'surface').placement;
      if (change === 'template') a.templateId = 'guard-duty';
      if (change === 'reload') w.adapter.invalidate();
      w.adapter.advance({ budgetMs: 0 });
      assert.equal((await promise).status, 'pending', change); assert.equal(w.adapter.cache.size, 0); assert.equal(pool.stats().entries, 0);
      if (change === 'base-pose') a.behavior.basePose = 'standing';
      const result = await finish(w.adapter, w.adapter.request(a, subject => system.prepareFor(subject)));
      assert.equal(result.status, 'ready', change);
      const walking = a.templateId === 'consort-daily' && a.placement.mode === 'path';
      assert.deepEqual([...pool.entries.keys()], [0, 1, 2].map(lod => resourceKey(a.templateId, lod, walking)));
      assert.equal(pool.stats().references, 0); assert.equal(w.adapter.work.snapshot().pending, 0);
    } finally { pool.dispose(); w.dispose(); }
  }
});

test('partial LOD preparation can be cancelled and resumed without stale reuse or leaked resources', () => {
  const pool = new CharacterResourcePool(), system = preparation(pool), a = actor('route');
  try {
    const fixed = pool.acquire(a.templateId, 'standing', 0), iterator = system.prepareFor(a);
    let count = 0;
    while (!pool.entries.has(resourceKey(a.templateId, 0, true))) { assert.equal(iterator.next().done, false); assert.ok(++count < 20000); }
    iterator.return(); assert.deepEqual(iterator.next(), { value: undefined, done: true });
    assert.equal(pool.entries.size, 2); assert.equal(pool.entries.get(fixed.key).references, 1);
    const firstLOD = pool.entries.get(resourceKey(a.templateId, 0, true)).geometry;
    drain(system.prepareFor(a));
    assert.equal(pool.entries.size, 4); assert.equal(pool.entries.get(resourceKey(a.templateId, 0, true)).geometry, firstLOD);
    const released = [];
    for (const [key, entry] of pool.entries) entry.geometry.addEventListener('dispose', () => released.push(key));
    pool.release(fixed.key); assert.equal(pool.stats().references, 0); pool.dispose(); pool.dispose();
    assert.equal(released.length, 4); assert.equal(new Set(released).size, 4); assert.equal(pool.stats().entries, 0);
    assert.throws(() => pool.acquire(a.templateId, 'standing', 0, { femalePose: 'walking' }), /disposed/);
    assert.throws(() => drain(system.prepareFor(a)), /disposed/);
  } finally { pool.dispose(); }
});

test('bounded cache eviction never disposes a referenced folded or hanging sibling', () => {
  const pool = new CharacterResourcePool({ maxEntries: 2 });
  try {
    const folded = pool.acquire('maid-daily', 'standing', 2), hanging = pool.acquire('maid-daily', 'standing', 2, { femalePose: 'walking' });
    let foldedDisposed = 0, hangingDisposed = 0;
    folded.geometry.addEventListener('dispose', () => foldedDisposed++); hanging.geometry.addEventListener('dispose', () => hangingDisposed++);
    assert.throws(() => pool.acquire('guard-duty', 'standing', 2), /capacity/);
    pool.release(hanging.key);
    drain(pool.prepare('guard-duty', 'standing', 2));
    assert.equal(hangingDisposed, 1); assert.equal(foldedDisposed, 0); assert.equal(pool.entries.get(folded.key).references, 1);
    pool.release(folded.key); pool.dispose(); assert.equal(foldedDisposed, 1); assert.equal(hangingDisposed, 1);
  } finally { pool.dispose(); }
});

test('System off/on cancels a real pending female request and late work cannot resurrect a disabled actor', async () => {
  const w = miniatureWorld(), pool = new CharacterResourcePool(), system = preparation(pool), a = actor('route'), camera = makeCamera();
  const renderer = new CharacterRenderer({ scene: w.scene, pool });
  const manager = new CharacterManager({ registry: { actors: [a] }, renderer, contentApproved: true,
    adapter: { getRevision: subject => w.adapter.getRevision(subject), resolve: subject => w.adapter.request(subject, next => system.prepareFor(next)) },
    patrolFactory: (subject, binding) => new PatrolController({ path: binding.path, speedMetersPerSecond: .6, pauseSeconds: 1 }),
  });
  Object.assign(system, { manager, world: w.adapter, validation: { valid: true }, ceremony: { dispose() {} } });
  try {
    manager.update(.1, { camera }); const stale = manager.states.get(a.id).request;
    assert.ok(stale); w.adapter.advance({ budgetMs: 100, maxSteps: 3 });
    system.setEnabled(false); assert.equal((await stale).status, 'pending'); await Promise.resolve();
    assert.equal(w.adapter.work.snapshot().pending, 0); assert.equal(manager.states.get(a.id).binding, null);
    assert.equal(renderer.batches.size, 0); assert.equal(pool.entries.size, 0);
    for (let cycle = 0; cycle < 3; cycle++) {
      system.setEnabled(true); manager.update(.1, { camera });
      const current = manager.states.get(a.id).request;
      assert.ok(current); assert.notEqual(current, stale);
      assert.equal((await finish(w.adapter, current)).status, 'ready'); await Promise.resolve();
      manager.update(.1, { camera });
      assert.equal(manager.snapshot().visible, 1); assert.equal(renderer.batches.size, 1);
      assert.match([...renderer.batches.values()][0].resourceKey, /\|femalePose=walking$/);
      assert.equal(pool.entries.size, 3); assert.equal(pool.stats().references, 1);
      system.setEnabled(false); assert.equal(pool.stats().references, 0); assert.equal(renderer.batches.size, 0);
    }
    system.dispose(); system.dispose();
    assert.equal(pool.stats().entries, 0); assert.equal(w.adapter.work.snapshot().pending, 0);
  } finally { system.dispose(); w.dispose(); }
});

test('System disposal during real female preparation settles the request without publishing geometry', async () => {
  const w = miniatureWorld(), pool = new CharacterResourcePool(), system = preparation(pool), a = actor('route'), camera = makeCamera();
  const renderer = new CharacterRenderer({ scene: w.scene, pool });
  const manager = new CharacterManager({ registry: { actors: [a] }, renderer, contentApproved: true,
    adapter: { getRevision: subject => w.adapter.getRevision(subject), resolve: subject => w.adapter.request(subject, next => system.prepareFor(next)) },
  });
  Object.assign(system, { manager, world: w.adapter, validation: { valid: true }, ceremony: { dispose() {} } });
  try {
    manager.update(.1, { camera }); const pending = manager.states.get(a.id).request;
    w.adapter.advance({ budgetMs: 100, maxSteps: 3 }); system.dispose();
    assert.equal((await pending).status, 'pending'); await Promise.resolve();
    assert.equal(pool.entries.size, 0); assert.equal(manager.states.size, 0);
    assert.equal(renderer.batches.size, 0); assert.equal(w.adapter.work.snapshot().pending, 0);
    assert.equal(w.scene.children.includes(renderer.root), false);
  } finally { system.dispose(); w.dispose(); }
});

test('all 90 male requests preserve legacy keys and exact unmodified factory output with omitted/resting options', () => {
  const pool = new CharacterResourcePool(); let cases = 0;
  try {
    for (const templateId of ['emperor-ceremonial', 'official-ceremonial', 'ritual-attendant', 'eunuch-daily', 'guard-duty'])
      for (const pose of ['standing', 'seated', 'kneeling'])
        for (const seatVariant of pose === 'seated' ? ['standard', 'raised-footstool', 'kang-low', 'throne-front-perch'] : ['standard'])
          for (const lod of [0, 1, 2]) {
            const options = { seatVariant }, expected = createCharacterGeometry(templateId, pose, lod, options);
            const actual = pool.acquire(templateId, pose, lod, options);
            const explicitRest = drain(pool.prepare(templateId, pose, lod, { ...options, femalePose: 'resting' }));
            assert.equal(actual.key, `${templateId}|${pose}|${lod}|${seatVariant}`);
            assert.equal(explicitRest.geometry, actual.geometry);
            sameGeometry(actual.geometry, expected);
            expected.dispose(); pool.release(actual.key); cases++;
          }
    assert.equal(cases, 90); assert.equal(pool.stats().references, 0); assert.ok(pool.entries.size <= pool.maxEntries);
  } finally { pool.dispose(); }
});

test('real System cold queue starts the required emperor before any female variant preparation', () => {
  const w = miniatureWorld(), system = new CharacterSystem({ scene: w.scene, camera: makeCamera(), adapter: w.adapter,
    registry: CHARACTER_REGISTRY, contentApproved: true, documentObject: null, preparationBudgetMs: 0 });
  try {
    system.update(.016);
    const jobs = [...w.adapter.work.jobs.values()];
    assert.equal(jobs.length, 38); assert.equal(jobs[0].key, 'taihe-emperor-01');
    assert.equal(system.pool.entries.size, 0);
    w.adapter.advance({ budgetMs: 100, maxSteps: 1 });
    assert.ok(jobs[0].iterator, 'the actual emperor generator started');
    assert.ok(jobs.slice(1).every(job => job.iterator === null), 'no later actor generator started first');
    let count = 0;
    while (system.pool.entries.size === 0) {
      w.adapter.advance({ budgetMs: 100, maxSteps: 1 }); assert.ok(++count < 20000);
    }
    assert.deepEqual([...system.pool.entries.keys()], ['emperor-ceremonial|seated|0|throne-front-perch']);
    assert.ok(jobs.slice(1).every(job => job.iterator === null));
  } finally { system.dispose(); w.dispose(); }
});
