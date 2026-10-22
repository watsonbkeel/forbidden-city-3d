import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CharacterWorldAdapter } from '../src/scene/characters/CharacterWorldAdapter.js';
import { CharacterResourcePool } from '../src/scene/characters/CharacterResourcePool.js';
import { CharacterWorkQueue } from '../src/scene/characters/CharacterWorkQueue.js';
import { CharacterSystem } from '../src/scene/characters/CharacterSystem.js';

// Independent lightweight review. These are correctness requirements, not
// assertions about progress labels or a wall-clock microbenchmark. No actual
// palace construction, browser, GPU, or frozen baseline rewrite is involved.
function fixture() {
  const scene = new THREE.Scene();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshBasicMaterial());
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const registry = {
    anchors: [{ id: 'a', zoneRef: 'static', resolver: 'world', positionMeters: [0, 0, 0], rotationYRad: 0 }],
    surfaces: [{ id: 's', zoneRef: 'static', anchorRef: 'a', kind: 'ground', localBoundsMeters: [-10, 10, -10, 10], expectedHeightMeters: 0, heightToleranceMeters: .03 }],
    seats: [],
    paths: [{ id: 'p', zoneRef: 'static', anchorRef: 'a', surfaceRef: 's', pointsLocalMeters: [[0, 0, 0], [0, 0, 1]], radiusMeters: .3, safetyMarginMeters: .1, validationSpacingMeters: .25 }],
  };
  const actor = { id: 'actor', zoneRef: 'static', templateId: 'guard-duty', behavior: { basePose: 'standing' }, placement: { mode: 'path', pathRef: 'p', surfaceRef: 's' } };
  const collisionManager = { colliders: [], walkables: [], checkBoundary: () => true, checkRiverCrossing: () => true };
  return { scene, floor, registry, actor, collisionManager };
}

async function finish(adapter, actor) {
  const pending = adapter.request(actor);
  let frames = 0;
  while (adapter.work.snapshot().pending) {
    adapter.advance({ budgetMs: 10, maxSteps: 128 });
    assert.ok(++frames < 1000, 'tiny fixture must terminate');
  }
  return pending;
}

test('cached route revalidates after its anchor moves', async () => {
  const f = fixture(), adapter = new CharacterWorldAdapter(f);
  try {
    assert.equal((await finish(adapter, f.actor)).position[0], 0);
    f.registry.anchors[0].positionMeters[0] = 2;
    const result = await finish(adapter, f.actor);
    assert.equal(result.status, 'ready');
    assert.equal(result.position[0], 2, 'a new actor revision must not reuse old anchor coordinates from pathCache');
    assert.equal(adapter.stats.pathChecks, 2);
  } finally { adapter.dispose(); }
});

test('cached route revalidates the separate surface anchor', async () => {
  const f = fixture();
  f.registry.anchors.push({ id: 'surface-a', zoneRef: 'static', resolver: 'world', positionMeters: [0, 0, 0] });
  f.registry.surfaces[0].anchorRef = 'surface-a';
  const adapter = new CharacterWorldAdapter(f);
  try {
    assert.equal((await finish(adapter, f.actor)).status, 'ready');
    f.registry.anchors[1].positionMeters[1] = .2;
    assert.notEqual((await finish(adapter, f.actor)).status, 'ready', 'the old floor is not support at the newly anchored height');
  } finally { adapter.dispose(); }
});

test('manager-visible revision changes when recognized world topology changes', async () => {
  const f = fixture(), adapter = new CharacterWorldAdapter(f);
  try {
    assert.equal((await finish(adapter, f.actor)).status, 'ready');
    const before = adapter.getRevision(f.actor);
    f.scene.remove(f.floor);
    assert.notEqual(adapter.getRevision(f.actor), before, 'manager otherwise retains asyncResolved binding and never requests a new one');
  } finally { adapter.dispose(); }
});

test('completed binding cannot reuse removed floor evidence on a new request', async () => {
  const f = fixture(), adapter = new CharacterWorldAdapter(f);
  try {
    assert.equal((await finish(adapter, f.actor)).status, 'ready');
    const before = adapter._workVersion();
    f.scene.remove(f.floor);
    assert.notEqual(adapter._workVersion(), before, 'this change is already recognized by queue invalidation');
    assert.notEqual((await finish(adapter, f.actor)).status, 'ready');
    assert.equal(adapter.cache.size, 0);
    assert.equal(adapter.pathCache.size, 0);
  } finally { adapter.dispose(); }
});

test('completed binding cannot reuse clearance after a blocking collider is appended', async () => {
  const f = fixture(), adapter = new CharacterWorldAdapter(f);
  try {
    assert.equal((await finish(adapter, f.actor)).status, 'ready');
    f.collisionManager.colliders.push({ box: new THREE.Box3(new THREE.Vector3(-1, .2, .7), new THREE.Vector3(1, 2, .8)) });
    assert.notEqual((await finish(adapter, f.actor)).status, 'ready');
  } finally { adapter.dispose(); }
});

test('manager-visible revision notices a new wall beyond the current actor position', async () => {
  const f = fixture(), adapter = new CharacterWorldAdapter(f);
  try {
    assert.equal((await finish(adapter, f.actor)).status, 'ready');
    const revision = adapter.getRevision(f.actor);
    f.collisionManager.colliders.push({ box: new THREE.Box3(new THREE.Vector3(-1, .2, .7), new THREE.Vector3(1, 2, .8)) });
    assert.notEqual(adapter.getRevision(f.actor), revision, 'the local dependency envelope must include the entire route, not only its start');
  } finally { adapter.dispose(); }
});

test('local dependency includes the wider endpoint turn disc', async () => {
  const f = fixture();
  f.registry.paths[0].turningRadiusMeters = .75;
  const adapter = new CharacterWorldAdapter(f);
  try {
    assert.equal((await finish(adapter, f.actor)).status, 'ready');
    const revision = adapter.getRevision(f.actor);
    f.collisionManager.colliders.push({ box: new THREE.Box3(new THREE.Vector3(.6, .2, .9), new THREE.Vector3(.7, 2, 1.1)) });
    assert.notEqual(adapter.getRevision(f.actor), revision, 'a wall outside the .4 m route but inside its .75 m endpoint turn is relevant');
    assert.notEqual((await finish(adapter, f.actor)).status, 'ready');
  } finally { adapter.dispose(); }
});

test('a distant append and unrelated zone preserve a completed local binding', async () => {
  const f = fixture(), zoneManager = { loaded: new Map() }, adapter = new CharacterWorldAdapter({ ...f, zoneManager });
  try {
    assert.equal((await finish(adapter, f.actor)).status, 'ready');
    const revision = adapter.getRevision(f.actor), queries = adapter.stats.supportQueries;
    zoneManager.loaded.set('elsewhere', { data: { group: new THREE.Group() } });
    f.collisionManager.colliders.push({ box: new THREE.Box3(new THREE.Vector3(500, 0, 500), new THREE.Vector3(501, 2, 501)) });
    assert.equal(adapter.getRevision(f.actor), revision);
    assert.equal((await finish(adapter, f.actor)).status, 'ready');
    assert.equal(adapter.stats.supportQueries, queries, 'safety must not require every unrelated append to rerun the path');
  } finally { adapter.dispose(); }
});

for (const change of ['remove', 'hide', 'hide-ancestor', 'reparent', 'translate', 'translate-ancestor', 'rotate', 'scale', 'replace-geometry']) {
  test(`completed support owner ${change} is detected before reuse`, async () => {
    const f = fixture(), left = new THREE.Group(), right = new THREE.Group();
    f.scene.remove(f.floor); left.add(f.floor); f.scene.add(left, right);
    const adapter = new CharacterWorldAdapter(f);
    try {
      assert.equal((await finish(adapter, f.actor)).status, 'ready');
      const revision = adapter.getRevision(f.actor), queries = adapter.stats.supportQueries;
      if (change === 'remove') left.remove(f.floor);
      if (change === 'hide') f.floor.visible = false;
      if (change === 'hide-ancestor') left.visible = false;
      if (change === 'reparent') right.add(f.floor);
      if (change === 'translate') f.floor.position.y = .2;
      if (change === 'translate-ancestor') left.position.y = .2;
      if (change === 'rotate') f.floor.rotation.x = 0;
      if (change === 'scale') f.floor.scale.x = .01;
      if (change === 'replace-geometry') f.floor.geometry = new THREE.PlaneGeometry(1, 1).translate(20, 0, 0);
      assert.notEqual(adapter.getRevision(f.actor), revision, `${change} must invalidate the manager-visible revision`);
      const result = await finish(adapter, f.actor);
      if (change === 'reparent') assert.equal(result.status, 'ready', 'same world-space support can be reverified under its new owner');
      else assert.notEqual(result.status, 'ready', `${change} no longer supports the old route`);
      assert.ok(adapter.stats.supportQueries > queries);
    } finally { adapter.dispose(); }
  });
}

test('successive small distant appends remain local, followed by an intersecting nonblocking append rebind', async () => {
  const f = fixture(), adapter = new CharacterWorldAdapter(f);
  try {
    assert.equal((await finish(adapter, f.actor)).status, 'ready');
    const revision = adapter.getRevision(f.actor), queries = adapter.stats.supportQueries;
    for (let round = 0; round < 3; round++) {
      for (let i = 0; i < 3; i++) f.collisionManager.colliders.push({ box: new THREE.Box3(new THREE.Vector3(500 + i, 0, 500), new THREE.Vector3(501 + i, 2, 501)) });
      assert.equal(adapter.getRevision(f.actor), revision);
      assert.equal((await finish(adapter, f.actor)).status, 'ready');
      assert.equal(adapter.stats.supportQueries, queries);
    }
    // Overlaps the saved proof's broad envelope, but lies below .35 m body
    // clearance. This requires a successful fresh proof, not only rejection.
    f.collisionManager.colliders.push({ box: new THREE.Box3(new THREE.Vector3(-.2, -.2, .7), new THREE.Vector3(.2, .1, .8)) });
    assert.notEqual(adapter.getRevision(f.actor), revision);
    assert.equal((await finish(adapter, f.actor)).status, 'ready');
    assert.ok(adapter.stats.supportQueries > queries);
    const reboundRevision = adapter.getRevision(f.actor), reboundQueries = adapter.stats.supportQueries;
    assert.equal((await finish(adapter, f.actor)).status, 'ready');
    assert.equal(adapter.getRevision(f.actor), reboundRevision);
    assert.equal(adapter.stats.supportQueries, reboundQueries, 'the freshly captured proof must then be reusable');
  } finally { adapter.dispose(); }
});

for (const change of ['hide', 'translate', 'replace-geometry', 'replace-equivalent-geometry-and-retry']) test(`a support owner ${change} after the last hit but before proof publication cannot become ready`, async () => {
  const f = fixture();
  f.actor.placement = { mode: 'surface', anchorRef: 'a', surfaceRef: 's', offsetMeters: [0, 0, 0], forwardLocal: [0, 0, 1] };
  const adapter = new CharacterWorldAdapter(f), pending = adapter.request(f.actor);
  const job = adapter.work.jobs.get(f.actor.id), factory = job.factory;
  let lastYield = null, changed = false;
  // Observe, but do not alter, the production generator sequence. The mutation
  // occurs only between completed queue advances, as an ordinary frame change.
  job.factory = function* () {
    const iterator = factory(); let result;
    try {
      while (!(result = iterator.next()).done) { lastYield = result.value?.kind; yield result.value; }
      return result.value;
    } finally { iterator.return(); }
  };
  try {
    let frames = 0;
    while (adapter.work.snapshot().pending) {
      lastYield = null;
      adapter.advance({ budgetMs: 10, maxSteps: 1 });
      if (!changed && adapter.stats.supportQueries === 5 && lastYield === 'support-triangles') {
        if (change === 'hide') f.floor.visible = false;
        if (change === 'translate') { f.floor.position.y = .2; f.floor.updateMatrixWorld(true); }
        if (change === 'replace-geometry') f.floor.geometry = new THREE.PlaneGeometry(1, 1).translate(20, 0, 0);
        if (change === 'replace-equivalent-geometry-and-retry') f.floor.geometry = new THREE.PlaneGeometry(20, 20);
        changed = true;
      }
      assert.ok(++frames < 1000);
    }
    assert.equal(changed, true, 'the mutation must hit the final support query checkpoint');
    assert.notEqual((await pending).status, 'ready', 'old hit positions cannot be published with a newly captured changed-owner snapshot');
    assert.equal(adapter.cache.size, 0);
    assert.equal(adapter.physicalProofs.size, 0);
    if (change === 'replace-equivalent-geometry-and-retry') {
      assert.equal((await finish(adapter, f.actor)).status, 'ready', 'a safe stale rejection must discard the old spatial index so new geometry bounds are rebuilt');
      assert.equal(adapter.physicalProofs.size, 1);
    }
  } finally { adapter.dispose(); }
});

test('geometry replacement after mesh indexing but before any hit remains retryable', async () => {
  const f = fixture();
  f.actor.placement = { mode: 'surface', anchorRef: 'a', surfaceRef: 's', offsetMeters: [0, 0, 0], forwardLocal: [0, 0, 1] };
  const adapter = new CharacterWorldAdapter(f), pending = adapter.request(f.actor);
  const job = adapter.work.jobs.get(f.actor.id), factory = job.factory;
  let lastYield = null, changed = false;
  job.factory = function* () {
    const iterator = factory(); let result;
    try {
      while (!(result = iterator.next()).done) { lastYield = result.value?.kind; yield result.value; }
      return result.value;
    } finally { iterator.return(); }
  };
  try {
    let frames = 0;
    while (adapter.work.snapshot().pending) {
      lastYield = null;
      adapter.advance({ budgetMs: 10, maxSteps: 1 });
      if (!changed && lastYield === 'world-mesh-index') {
        assert.equal(adapter.stats.raycastMeshTests, 0);
        f.floor.geometry = new THREE.PlaneGeometry(20, 20);
        changed = true;
      }
      assert.ok(++frames < 1000);
    }
    assert.equal(changed, true, 'mutation must occur after indexing the old source, before collecting any owner hit');
    assert.notEqual((await pending).status, 'ready');
    assert.equal(adapter.cache.size, 0);
    assert.equal((await finish(adapter, f.actor)).status, 'ready', 'an aborted validation must not keep a source-mismatched index across retries');
  } finally { adapter.dispose(); }
});

test('shared manager read snapshots do not carry support evidence across frames', async () => {
  const f = fixture(), adapter = new CharacterWorldAdapter(f);
  try {
    assert.equal((await finish(adapter, f.actor)).status, 'ready');
    const original = adapter._geometrySignature.bind(adapter);
    let geometryReads = 0;
    adapter._geometrySignature = mesh => { geometryReads++; return original(mesh); };
    adapter.beginReadFrame();
    const revision = adapter.getRevision(f.actor);
    assert.equal(adapter.getRevision(f.actor), revision);
    assert.equal(geometryReads, 1, 'the same source may be read once inside one synchronous traversal');
    adapter.endReadFrame();
    assert.equal(adapter.frameReads, null, 'the synchronous traversal must leave no active shared snapshot');
    f.floor.visible = false;
    adapter.beginReadFrame();
    assert.notEqual(adapter.getRevision(f.actor), revision, 'the next traversal must read the changed owner again');
    assert.equal(geometryReads, 2);
    adapter.endReadFrame();
    assert.notEqual((await finish(adapter, f.actor)).status, 'ready');
  } finally { adapter.endReadFrame(); adapter.dispose(); }
});

test('system closes the manager read scope before queue advance and after manager exceptions', () => {
  const adapter = new CharacterWorldAdapter({ scene: new THREE.Scene() }), trace = [];
  const begin = adapter.beginReadFrame.bind(adapter), end = adapter.endReadFrame.bind(adapter);
  adapter.beginReadFrame = () => { trace.push('begin'); begin(); };
  adapter.endReadFrame = () => { end(); trace.push('end'); };
  adapter.advance = () => { assert.equal(adapter.frameReads, null); trace.push('advance'); return { pending: 0 }; };
  let throwFromManager = false;
  // Exercise the real System.update control flow without constructing a renderer,
  // preparing any Kit, or depending on unrelated registry fixture validation.
  const system = Object.create(CharacterSystem.prototype);
  Object.assign(system, {
    disposed: false, validation: { valid: true }, world: adapter, document: null,
    preparationBudgetMs: 1, totalUpdateSamples: [], lastError: null,
    manager: {
      enabled: true, contentApproved: true,
      update() { assert.ok(adapter.frameReads); trace.push('manager'); if (throwFromManager) throw new Error('injected manager failure'); },
      setEnabled(enabled) { assert.equal(adapter.frameReads, null); this.enabled = enabled; trace.push('disable'); },
    },
  });
  try {
    system.update(.016);
    assert.deepEqual(trace, ['begin', 'manager', 'end', 'advance']);
    assert.equal(adapter.frameReads, null);
    trace.length = 0; throwFromManager = true;
    system.update(.016);
    assert.deepEqual(trace, ['begin', 'manager', 'end', 'disable']);
    assert.equal(adapter.frameReads, null);
    assert.match(system.lastError, /injected manager failure/);
    assert.equal(system.manager.enabled, false);
  } finally { adapter.dispose(); }
});

test('seat candidate iteration does not copy an entire input list in one next()', () => {
  const adapter = new CharacterWorldAdapter({ scene: new THREE.Scene() });
  let reads = 0;
  const entry = { mesh: null, box: new THREE.Box3(new THREE.Vector3(5, 5, 5), new THREE.Vector3(6, 6, 6)) };
  const entries = Array.from({ length: 4096 }, () => entry);
  entries[Symbol.iterator] = function* () { for (let i = 0; i < this.length; i++) { reads++; yield this[i]; } };
  adapter.meshCache = { buckets: new Map([['0:0', entries]]), globals: [], cellSize: 32 };
  adapter._meshListSteps = function* () { return []; };
  const iterator = adapter._insideSeatFurnitureSteps([0, 0, 0]);
  try {
    let result;
    do {
      reads = 0;
      result = iterator.next();
      assert.ok(reads <= 256, `one next() read ${reads} candidates; yielded labels do not bound array spread`);
    } while (!result.done);
    assert.equal(result.value, null);
  } finally { iterator.return(); adapter.dispose(); }
});

test('world traversal also bounds terminal ancestor unwinding work', () => {
  const scene = new THREE.Scene(), nodes = [scene];
  let parent = scene;
  for (let i = 0; i < 1024; i++) { const next = new THREE.Group(); parent.add(next); nodes.push(next); parent = next; }
  let reads = 0;
  for (const node of nodes) node.children = new Proxy(node.children, {
    get(target, key, receiver) { if (key === 'length') reads++; return Reflect.get(target, key, receiver); },
  });
  const adapter = new CharacterWorldAdapter({ scene }), iterator = adapter._meshListSteps();
  try {
    let result;
    do {
      reads = 0;
      result = iterator.next();
      assert.ok(reads <= 256, `one ${result.done ? 'completion' : 'yielding'} next() visited ${reads} child arrays`);
    } while (!result.done);
  } finally { iterator.return(); adapter.dispose(); }
});

test('resource preparation cancellation publishes no half-built entry and preserves live references', () => {
  const pool = new CharacterResourcePool();
  const live = pool.acquire('guard-duty', 'standing', 2);
  const iterator = pool.prepare('maid-daily', 'standing', 0);
  try {
    for (let i = 0; i < 4; i++) assert.equal(iterator.next().done, false);
    iterator.return();
    assert.equal(pool.entries.size, 1);
    assert.equal(pool.entries.get(live.key).geometry, live.geometry);
    assert.equal(pool.stats().references, 1);
    assert.deepEqual(iterator.next(), { value: undefined, done: true });
  } finally { pool.release(live.key); pool.dispose(); }
});

test('queue rechecks mutable identity before resuming a paused iterator', async () => {
  const queue = new CharacterWorkQueue();
  let current = true, resumed = 0, cleaned = false;
  const promise = queue.request('actor', function* () {
    try { yield { kind: 'test', workUnits: 1, maxWorkUnits: 1 }; resumed++; return { status: 'ready' }; }
    finally { cleaned = true; }
  }, { version: 'same-world', identity: 'old-spec', isCurrent: () => current });
  queue.advance({ budgetMs: 10, maxSteps: 1, version: 'same-world' });
  current = false;
  queue.advance({ budgetMs: 0, version: 'same-world' });
  assert.equal((await promise).status, 'pending');
  assert.equal(resumed, 0);
  assert.equal(cleaned, true);
  assert.equal(queue.snapshot().pending, 0);
  queue.dispose();
});
