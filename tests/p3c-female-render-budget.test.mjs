import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import { CHARACTER_REGISTRY } from '../data/characters/index.js';
import { CharacterManager } from '../src/scene/characters/CharacterManager.js';
import { CharacterRenderer } from '../src/scene/characters/CharacterRenderer.js';
import { CharacterResourcePool } from '../src/scene/characters/CharacterResourcePool.js';
import { characterGeometryOptionsFor, characterResourceKey } from '../src/scene/characters/CharacterGeometryOptions.js';
import { selectCharacterBudget } from '../src/scene/characters/CharacterLOD.js';
import { PatrolController } from '../src/scene/characters/PatrolController.js';
import { CHARACTER_ROLLOUT_APPROVED } from '../src/scene/characters/CharacterSystem.js';

// This test fails if production loses the near-LOD/visible caps, core-role
// retention, route geometry family, or renderer's real per-batch accounting.
// It never builds the palace, renders WebGL, changes a required flag, or opens
// the production rollout gate. Synthetic actors exist only inside this test.
const root = new URL('../', import.meta.url);
const file = path => new URL(path, root);
const hash = path => createHash('sha256').update(readFileSync(file(path))).digest('hex');
const limits = { high: { visible: 64, triangles: 180000, drawCalls: 60, near: 2 }, low: { visible: 32, triangles: 90000, drawCalls: 30, near: 0 } };
const actors = CHARACTER_REGISTRY.actors;
const originalRegistry = JSON.stringify(CHARACTER_REGISTRY);
const sourceFiles = ['src/scene/characters/CharacterKit.js', 'src/scene/characters/CharacterAnimation.js',
  'src/scene/characters/CharacterLOD.js', 'src/scene/characters/CharacterManager.js',
  'src/scene/characters/CharacterRenderer.js', 'src/scene/characters/CharacterResourcePool.js',
  'src/scene/characters/CharacterGeometryOptions.js', 'src/scene/characters/CharacterSystem.js',
  'data/characters/actors.json', 'data/characters/paths.json', 'data/characters/world-source-freeze.json'];
const sourceAtStart = Object.fromEntries(sourceFiles.map(path => [path, hash(path)]));
const cachePath = 'reports/r50/world-bindings.md';
const cache = readFileSync(file(cachePath), 'utf8');
const cachedCoveragePath = 'reports/r50/coverage-summary.json';
const cachedCoverage = JSON.parse(readFileSync(file(cachedCoveragePath), 'utf8'));
const cachedBindings = new Map();
for (const match of cache.matchAll(/^\| `([^`]+)` \| `[^`]+` \| `([^`]+)` \| `([^`]+)` \| (?:route start )?\(([^)]+)\).*\| ready \|$/gm)) {
  cachedBindings.set(match[1], { status: 'ready', zoneRef: match[2], position: match[4].split(',').map(Number), rotationYRad: 0,
    support: { cachedReference: match[3], evidence: 'Previously resolved CPU world coordinates, rounded in source report; not a new support query.' } });
}
const cachedPaths = new Map();
for (const path of CHARACTER_REGISTRY.paths) {
  const row = cache.split('\n').find(line => line.startsWith(`| \`${path.id}\` |`));
  const points = [...(row ?? '').matchAll(/\((-?[\d.]+),\s*(-?[\d.]+),\s*(-?[\d.]+)\)/g)].map(m => m.slice(1).map(Number));
  assert.ok(points.length >= 2, `Cached world route is missing: ${path.id}`);
  cachedPaths.set(path.id, { status: 'ready', id: path.id, points, formationSize: path.formationSize });
}
for (const actor of actors) {
  const binding = cachedBindings.get(actor.id);
  assert.ok(binding, `Cached world actor is missing: ${actor.id}`);
  const forward = actor.placement.forwardLocal;
  if (forward) binding.rotationYRad = Math.atan2(forward[0], forward[2]);
  if (actor.placement.mode === 'path') binding.path = cachedPaths.get(actor.placement.pathRef);
}
const worldFreeze = JSON.parse(readFileSync(file('data/characters/world-source-freeze.json'), 'utf8'));
const frozenMismatches = worldFreeze.files.filter(entry => hash(entry.path) !== entry.sha256).map(entry => entry.path);
const freshEvidencePath = process.env.R50_FRESH_BINDINGS;
let freshEvidence = null, inheritedWorldEvidence = null;
function verifyBindingWorld(evidence) {
  if (evidence.activeFreezeSha256 === hash('data/characters/world-source-freeze.json')) {
    assert.equal(evidence.architectureBaselineCommit, worldFreeze.baselineCommit); return;
  }
  // Only this exact reviewed one-file successor may inherit the old world run.
  // Unknown patches or absent/changed evidence still fail closed.
  const proofPath = process.env.R50_WORLD_INHERITANCE;
  assert.equal(proofPath, 'reports/r50-joint/world-benren-inheritance.json');
  assert.equal(hash(proofPath), '49bf9fd8378dd7a0f05ffba4137ae6311407c7919cb9a42f6dfc97610cea2567');
  const proof = JSON.parse(readFileSync(file(proofPath), 'utf8'));
  const base = '95db2af664ff9cb6ea405d0ba389ef428dfd7d6c', patch = 'ad64a922a8e2885fb42e1a6c64806ba8646a3b8c';
  const changed = 'src/scene/palace/special/SourceGuidedNameboardMounts.js';
  const oldManifestPath = 'data/characters/world-source-freeze-r49b.json';
  const oldManifest = JSON.parse(readFileSync(file(oldManifestPath), 'utf8'));
  const git = args => execFileSync('git', args, { cwd: root });
  const sha = bytes => createHash('sha256').update(bytes).digest('hex');
  assert.equal(proof.ok, true); assert.equal(proof.baselineCommit, patch); assert.equal(worldFreeze.baselineCommit, patch);
  assert.equal(proof.previousBaselineCommit, base); assert.equal(oldManifest.baselineCommit, base);
  assert.equal(proof.patchParentCommit, base); assert.equal(git(['rev-parse', patch + '^']).toString().trim(), base);
  assert.equal(proof.previousFreezePath, oldManifestPath);
  assert.equal(hash(oldManifestPath), 'd0b69e747a557b0ea57068357c26cdb59d9803c7a3fbe2daaaa957ae7e2390d0');
  assert.equal(proof.previousFreezeSha256, hash(oldManifestPath));
  assert.equal(evidence.activeFreezeSha256, hash(oldManifestPath)); assert.equal(evidence.architectureBaselineCommit, base);
  assert.equal(proof.activeFreezeSha256, hash('data/characters/world-source-freeze.json'));
  assert.equal(proof.activeFreezeSha256, '4999fb8aac4ee69839f22406683aa53a8e123ceb68ba5129196f494b40bf3aa3');
  assert.deepEqual(proof.changedProductionPaths, [changed]);
  assert.deepEqual(git(['diff', '--name-only', base, patch, '--', 'src', 'data']).toString().trim().split('\n'), [changed]);
  assert.equal(oldManifest.files.length, 185); assert.equal(worldFreeze.files.length, 185); assert.deepEqual(frozenMismatches, []);
  const oldFiles = new Map(oldManifest.files.map(row => [row.path, row.sha256]));
  assert.deepEqual(worldFreeze.files.map(row => row.path).sort(), [...oldFiles.keys()].sort());
  assert.deepEqual(worldFreeze.files.filter(row => row.sha256 !== oldFiles.get(row.path)).map(row => row.path), [changed]);
  assert.equal(proof.previousSourceSha256, sha(git(['show', base + ':' + changed])));
  assert.equal(proof.currentSourceSha256, sha(git(['show', patch + ':' + changed])));
  assert.equal(proof.previousSourceSha256, oldFiles.get(changed)); assert.equal(proof.currentSourceSha256, hash(changed));
  assert.equal(proof.productionDiffSha256, sha(git(['diff', base, patch, '--', changed])));
  assert.equal(proof.productionDiffSha256, worldFreeze.provenance.changedSource.gitDiffSha256);
  assert.equal(proof.inheritedArtifacts[freshEvidencePath], hash(freshEvidencePath));
  assert.ok(Object.hasOwn(proof.inheritedArtifacts, 'reports/r50-joint/world-bindings-summary.json'));
  for (const [path, expectedHash] of Object.entries(proof.inheritedArtifacts)) {
    assert.equal(hash(path), expectedHash, path);
    assert.equal(sha(git(['show', '289006b:' + path])), expectedHash, 'Original committed artifact: ' + path);
  }
  for (const key of ['nonPlaqueGeometryHash','colliders','walkables','rooms','regions','mapItems'])
    assert.equal(proof.localSnapshot.before[key], proof.localSnapshot.after[key], key);
  for (const key of ['face','frame']) {
    const before = proof.localSnapshot.before[key], after = proof.localSnapshot.after[key];
    for (const property of ['rotation','scale','geometry']) assert.deepEqual(before[property], after[property]);
    assert.deepEqual(before.position.slice(0,2), after.position.slice(0,2));
    assert.ok(Math.abs(after.position[2] - before.position[2] + .05) < 1e-12);
  }
  assert.equal(proof.rays.characterSightlineRays, 684); assert.equal(proof.rays.actualSupportOwnerRays, 796); assert.equal(proof.rays.routeSurfaceRays, 148);
  assert.equal(proof.rays.totalRays, 1628); assert.equal(proof.rays.rows.length, 1628);
  assert.equal(proof.rays.beforeIntersections, 0); assert.equal(proof.rays.afterIntersections, 0);
  assert.ok(proof.rays.rows.every(row => row.beforeHits === 0 && row.afterHits === 0));
  inheritedWorldEvidence = { source: proofPath, sha256: hash(proofPath), baselineCommit: patch, previousBaselineCommit: base,
    previousManifestPath: oldManifestPath, previousManifestSha256: hash(oldManifestPath), activeFreezeSha256: proof.activeFreezeSha256,
    changedProductionPaths: [changed], productionDiffSha256: proof.productionDiffSha256,
    previousSourceSha256: proof.previousSourceSha256, currentSourceSha256: proof.currentSourceSha256,
    rayCounts: { sightline: 684, support: 796, route: 148, total: 1628 },
    conclusion: 'Old 38/148 fresh evidence is inherited only through the exact verified Benren depth-only patch and measured local geometry/ray proof. It is not a new full-world build.' };
}

if (freshEvidencePath) {
  const evidence = JSON.parse(gunzipSync(readFileSync(file(freshEvidencePath))).toString('utf8'));
  assert.equal(evidence.ok, true); assert.equal(evidence.sourcesUnchangedDuringRun, true);
  assert.equal(evidence.requiredActors, 38); assert.equal(evidence.actorBindings.length, 38);
  assert.equal(evidence.sourceInput.CharacterKit, hash('src/scene/characters/CharacterKit.js'));
  verifyBindingWorld(evidence);
  let maximumCachedPositionDeltaMeters = 0;
  for (const row of evidence.actorBindings) {
    const old = cachedBindings.get(row.actorId);
    assert.ok(old, `Unexpected fresh actor: ${row.actorId}`);
    assert.equal(row.required, true); assert.equal(row.binding.status, 'ready');
    for (const axis of [0,1,2]) maximumCachedPositionDeltaMeters = Math.max(maximumCachedPositionDeltaMeters, Math.abs(row.binding.position[axis] - old.position[axis]));
    if (row.binding.path) {
      const oldPath = cachedPaths.get(row.binding.path.id);
      assert.ok(oldPath); assert.equal(row.binding.path.points.length, oldPath.points.length);
      row.binding.path.points.forEach((point, i) => point.forEach((value, axis) => assert.ok(Math.abs(value - oldPath.points[i][axis]) < 1e-6)));
    }
    cachedBindings.set(row.actorId, structuredClone(row.binding));
  }
  assert.ok(maximumCachedPositionDeltaMeters < 1e-6);
  freshEvidence = { source: freshEvidencePath, sha256: hash(freshEvidencePath), candidateCommit: evidence.candidateCommit,
    architectureBaselineCommit: evidence.architectureBaselineCommit, ready: evidence.ready, routeSamples: evidence.routeSamples,
    maximumCachedPositionDeltaMeters, all38SemanticBindingsUnchanged: evidence.priorCacheComparison.all38SemanticBindingsUnchanged,
    all148RouteSamplesUnchanged: evidence.priorCacheComparison.all148RouteSamplesUnchanged,
    use: 'This lightweight budget test consumes the exact fresh joint-world binding output; the separate world validator built the world. This test does not rerun world construction.' };
}

const report = {
  evidence: 'CPU-only real CharacterManager -> selectCharacterBudget -> CharacterRenderer/CharacterResourcePool and actual BufferGeometry index counts. No WebGL draw, GPU timing, FPS, full-world performance, or new seat/support validation.',
  generatedAt: new Date().toISOString(), commitAtStart: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  sources: sourceAtStart, limits,
  bindings: { source: freshEvidencePath ?? cachePath, sha256: hash(freshEvidencePath ?? cachePath), freshJointEvidence: freshEvidence, inheritedWorldEvidence,
    cachedComparisonSource: cachePath, cachedComparisonSha256: hash(cachePath), actors: cachedBindings.size, routeCount: cachedPaths.size,
    registryEvidence: cachedCoveragePath, registryEvidenceSha256: hash(cachedCoveragePath),
    cachedActorSourceSha256: cachedCoverage.actorsFileSha256, currentActorSourceSha256: hash('data/characters/actors.json'),
    precision: `${freshEvidence ? 'Exact positions from fresh joint-world validation output' : 'Rounded cached CPU-world positions'}; paths sampled by the real PatrolController at simulationSeconds. Camera choices are representative test poses, not measured user trajectories.`,
    worldManifest: 'data/characters/world-source-freeze.json', worldManifestSha256: hash('data/characters/world-source-freeze.json'),
    worldBaselineCommit: worldFreeze.baselineCommit, worldManifestProvenance: worldFreeze.provenance ?? null,
    unchangedFrozenWorldFiles: worldFreeze.files.length, frozenMismatches,
    boundary: 'Placement evidence is replayed, not freshly raycast by this test. When supplied, the separately generated fresh joint-world output and its source hashes are verified before replay. No building/interior geometry is instantiated here; scene occlusion and GPU frustum outcomes are not measured.' },
  geometry: [], scenarios: [], routeFamily: null,
};
function cameraFor(position, target, { fov = 70, aspect = 16 / 9 } = {}) {
  const camera = new THREE.PerspectiveCamera(fov, aspect, .1, 3000);
  camera.position.fromArray(position); camera.lookAt(...target); camera.updateMatrixWorld(); return camera;
}
function summarize(renderer, selected) {
  const batches = [...renderer.batches.entries()].map(([key, batch]) => ({
    key, resourceKey: batch.resourceKey, instances: batch.mesh.count,
    trianglesPerInstance: (batch.mesh.geometry.index?.count ?? batch.mesh.geometry.attributes.position.count) / 3,
    triangles: batch.triangles * batch.mesh.count, lod: batch.mesh.geometry.userData.lod,
    femalePose: batch.mesh.geometry.userData.femalePose ?? null,
  }));
  const rows = selected.map(actor => {
    const options = characterGeometryOptionsFor(actor), key = characterResourceKey(actor.templateId, actor.pose, actor.lod, options);
    const geometry = renderer.pool.entries.get(key).geometry;
    return { id: actor.id, templateId: actor.templateId, pose: actor.pose, lod: actor.lod, position: actor.position,
      distance: actor.distance, resourceKey: key, triangles: (geometry.index?.count ?? geometry.attributes.position.count) / 3,
      routeFamily: options.femalePose ?? 'resting/default', walkSpeed: actor.animation.walkSpeed };
  });
  return { lodCounts: [0, 1, 2].map(lod => rows.filter(row => row.lod === lod).length), rows, batches,
    independentlyCountedTriangles: rows.reduce((n, row) => n + row.triangles, 0), independentlyCountedDrawCalls: batches.filter(batch => batch.instances > 0).length };
}
function runScenario({ name, population = actors, quality, camera, bindingFor, simulationSeconds = 0, expectedVisible, kind = inheritedWorldEvidence ? 'inherited-joint-world-output-replay' : freshEvidence ? 'fresh-joint-world-output-replay' : 'cached-world-bindings' }) {
  const renderer = new CharacterRenderer({ scene: new THREE.Scene() });
  let selected = [];
  const render = renderer.render.bind(renderer);
  renderer.render = (list, options) => { selected = list; return render(list, options); };
  const manager = new CharacterManager({ registry: { ...CHARACTER_REGISTRY, actors: population }, renderer, contentApproved: true,
    adapter: { getRevision: () => 'fixed-evidence', resolve: actor => structuredClone(bindingFor ? bindingFor(actor) : cachedBindings.get(actor.id)) },
    patrolFactory: (actor, binding) => binding.path ? new PatrolController({ path: binding.path,
      speedMetersPerSecond: actor.behavior.speedMetersPerSecond, pauseSeconds: actor.behavior.pauseSeconds,
      followerSpacingMeters: actor.behavior.followerSpacingMeters }) : null,
  });
  manager.simulationSeconds = simulationSeconds;
  try {
    manager.update(.1, { camera, quality, daylight: 1, viewportHeight: quality === 'low' ? 720 : 1080 });
    const snapshot = manager.snapshot();
    const accounting = summarize(renderer, selected);
    const entry = { name, kind, quality, simulationSeconds: manager.simulationSeconds,
      camera: { position: camera.position.toArray(), targetDirection: camera.getWorldDirection(new THREE.Vector3()).toArray(), fov: camera.fov, aspect: camera.aspect },
      logicalActors: population.length, syntheticActors: Math.max(0, population.length - actors.length), expectedVisible: expectedVisible ?? null,
      snapshot: Object.fromEntries(['registered','loaded','visible','near','renderCopies','pending','errors','batches','trianglesEstimate','drawCallsEstimate'].map(key => [key, snapshot[key]])),
      limits: limits[quality], ...accounting };
    entry.violations = Object.entries({ visible: snapshot.visible, triangles: snapshot.trianglesEstimate, drawCalls: snapshot.drawCallsEstimate, near: snapshot.near }).filter(([key, value]) => value > limits[quality][key]).map(([key, value]) => ({ key, actual: value, limit: limits[quality][key] }));
    report.scenarios.push(entry); return entry;
  } finally { manager.dispose(); }
}
function assertAccounting(entry) {
  const s = entry.snapshot;
  assert.equal(s.registered, entry.logicalActors); assert.equal(s.loaded, entry.logicalActors);
  assert.equal(s.pending, 0); assert.equal(s.errors, 0); assert.equal(s.renderCopies, s.visible);
  assert.equal(new Set(entry.rows.map(row => row.id)).size, s.visible);
  assert.equal(entry.lodCounts.reduce((a,b) => a+b, 0), s.visible);
  assert.equal(s.near, entry.lodCounts[0]);
  assert.equal(s.trianglesEstimate, entry.independentlyCountedTriangles);
  assert.equal(s.drawCallsEstimate, entry.independentlyCountedDrawCalls);
  assert.equal(s.batches, entry.batches.length);
  if (entry.expectedVisible != null) assert.equal(s.visible, entry.expectedVisible);
}
function assertLimits(entry) {
  assert.deepEqual(entry.violations, [], `${entry.name}/${entry.quality}: runtime budget exceeded; LOD distribution ${entry.lodCounts}; actual ${JSON.stringify(entry.snapshot)}`);
}
const closeBinding = () => ({ status: 'ready', position: [0, 0, 0], rotationYRad: 0 });
const extraSources = actors.filter(actor => ['consort-daily', 'maid-daily'].includes(actor.templateId) && actor.behavior.basePose === 'standing');
const stress = [...actors, ...Array.from({ length: 58 }, (_, i) => ({ ...structuredClone(extraSources[i % extraSources.length]), id: `synthetic-budget-only-${String(i).padStart(2,'0')}`, priority: 'optional' }))];

// Inspect every resource reachable by the unchanged official roster, at all
// three LODs, rather than multiplying a single highest-detail sample by 64.
test('geometry inventory uses real route/resting/seated cache families and retains the 38-role release gate', () => {
  const pool = new CharacterResourcePool();
  try {
    for (const actor of actors) for (const lod of [0,1,2]) {
      const resource = pool.acquire(actor.templateId, actor.behavior.basePose, lod, characterGeometryOptionsFor(actor));
      pool.release(resource.key);
    }
    for (const [key, { geometry }] of pool.entries) report.geometry.push({ key, triangles: (geometry.index?.count ?? geometry.attributes.position.count) / 3, vertices: geometry.attributes.position.count });
    report.geometryMaxByLod = [0,1,2].map(lod => Math.max(...report.geometry.filter(row => Number(row.key.split('|')[2]) === lod).map(row => row.triangles)));
    report.conservativeCurrentRegistryTriangleBoundsWithNearCap = { high: 2 * report.geometryMaxByLod[0] + 62 * report.geometryMaxByLod[1], low: 32 * report.geometryMaxByLod[1] };
    assert.ok(report.conservativeCurrentRegistryTriangleBoundsWithNearCap.high <= limits.high.triangles);
    assert.ok(report.conservativeCurrentRegistryTriangleBoundsWithNearCap.low <= limits.low.triangles);
    assert.equal(pool.entries.size, 27); assert.equal(pool.stats().references, 0);
    assert.equal(actors.length, 38); assert.ok(actors.every(actor => actor.required));
    assert.equal(CHARACTER_ROLLOUT_APPROVED, false); assert.equal(CHARACTER_REGISTRY.scope.sceneEnabledByDefault, false);
    assert.deepEqual(frozenMismatches, []); assert.equal(cachedBindings.size, 38);
    assert.equal(hash('data/characters/actors.json'), cachedCoverage.actorsFileSha256, 'Do not reuse cached world coordinates after changing authored actors.');
    for (const path of CHARACTER_REGISTRY.paths) {
      const points = cachedPaths.get(path.id).points;
      assert.equal(points.length, path.pointsLocalMeters.length);
      for (let i = 1; i < points.length; i++) for (const axis of [0,1,2])
        assert.ok(Math.abs((points[i][axis] - points[0][axis]) - (path.pointsLocalMeters[i][axis] - path.pointsLocalMeters[0][axis])) < 1e-8, 'Cached route vectors must still match the authored path.');
    }
  } finally { pool.dispose(); }
});

for (const [name, population] of [['formal38-cluster', actors], ['synthetic96-cluster', stress]]) for (const quality of ['high','low']) {
  test(`${name}/${quality}: exact visible cap, emperor/core court retention, and per-LOD geometry budgets`, () => {
    const entry = runScenario({ name, population, quality, kind: 'synthetic-close-bindings', camera: cameraFor([0,1.6,8],[0,1,0]), bindingFor: closeBinding,
      expectedVisible: quality === 'low' ? 32 : Math.min(64, population.length) });
    assertAccounting(entry);
    assert.ok(entry.rows.some(row => row.id === 'taihe-emperor-01'));
    if (quality === 'high') assert.equal(entry.rows.find(row => row.id === 'taihe-emperor-01').lod, 0, 'Nearby essential emperor keeps the highest-detail slot.');
    const court = entry.rows.filter(row => row.id.startsWith('taihe-'));
    assert.equal(court.length, quality === 'low' ? 19 : 23);
    if (quality === 'low') for (const side of ['left','right']) {
      const expected = actors.filter(actor => actor.templateId === 'official-ceremonial' && actor.formation.side === side).sort((a,b) => a.formation.index - b.formation.index).slice(0,6).map(actor => actor.id);
      assert.ok(expected.every(id => entry.rows.some(row => row.id === id)));
    }
    assertLimits(entry);
  });
}

for (const quality of ['high','low']) test(`synthetic96-mixed/${quality}: all real LOD-distance tiers are counted individually`, () => {
  const positions = new Map(stress.map((actor, i) => [actor.id, [((i % 5) - 2) * .35, 0, -(i % 3 === 0 ? 5 : i % 3 === 1 ? 24 : 90)]]));
  const entry = runScenario({ name: 'synthetic96-mixed', population: stress, quality, kind: 'synthetic-mixed-distance-bindings', camera: cameraFor([0,1.6,0],[0,1,-30]),
    bindingFor: actor => ({ status: 'ready', position: positions.get(actor.id), rotationYRad: 0 }), expectedVisible: quality === 'low' ? 32 : 64 });
  assertAccounting(entry); assert.ok(entry.lodCounts[1] > 0 && entry.lodCounts[2] > 0); assertLimits(entry);
});

const views = [
  { name: 'high-aerial-cull', position: [0,800,40], target: [0,0,40], expectedVisible: { high: 0, low: 0 } },
  { name: 'taihe-interior', position: [0,11.6,-1], target: [0,11.5,9] },
  { name: 'taihe-court', position: [-15,1.7,-106], target: [-15,1,-86] },
  { name: 'chuxiu-room', position: [100.22,2.2,431], target: [100.22,1.2,438] },
  { name: 'yikun-courtyard', position: [90.2,1.6,362], target: [90.2,1,369.5] },
  { name: 'yongshou-route', position: [94,1.6,307], target: [94,1,316] },
  { name: 'west-lane', position: [122,1.6,314], target: [122,1,332] },
];
const worldScenarioPrefix = inheritedWorldEvidence ? 'inherited38' : freshEvidence ? 'joint38' : 'cached38';
for (const view of views) for (const quality of ['high','low']) test(`${worldScenarioPrefix}-${view.name}/${quality}: representative camera replays verified world positions`, () => {
  const entry = runScenario({ name: `${worldScenarioPrefix}-${view.name}`, quality, camera: cameraFor(view.position, view.target), expectedVisible: view.expectedVisible?.[quality] });
  assertAccounting(entry); assertLimits(entry);
});

test('real fixed-route female retains hanging geometry while moving and paused, with no duplicate copies', () => {
  const route = actors.find(actor => actor.id === 'yongshou-consort-01');
  const path = cachedPaths.get(route.placement.pathRef);
  const controller = new PatrolController({ path, speedMetersPerSecond: route.behavior.speedMetersPerSecond, pauseSeconds: route.behavior.pauseSeconds, followerSpacingMeters: route.behavior.followerSpacingMeters });
  const results = [0, controller.travelSeconds + .5].map(simulationSeconds => runScenario({ name: simulationSeconds ? 'female-route-paused' : 'female-route-moving',
    quality: 'high', simulationSeconds, camera: cameraFor([94,1.6,307],[94,1,316]) }));
  const rows = results.map(entry => entry.rows.find(row => row.id === route.id));
  assert.ok(rows.every(Boolean)); assert.ok(rows.every(row => row.resourceKey.endsWith('|femalePose=walking')));
  assert.ok(rows[0].walkSpeed > 0); assert.equal(rows[1].walkSpeed, 0); // Distance may legitimately change LOD, never the hanging-arm family.
  report.routeFamily = { moving: rows[0], paused: rows[1], route: path };
  results.forEach(entry => { assertAccounting(entry); assertLimits(entry); }); controller.dispose();
});

test('budget selection is deterministic under input permutation and never changes the registry', () => {
  for (const quality of ['high','low']) {
    const candidates = stress.map((actor, i) => ({ ...actor, distance: i % 3 + 5, lod: quality === 'low' ? 1 : 0 }));
    const before = JSON.stringify(candidates);
    const selected = selectCharacterBudget(candidates, quality, actors).map(actor => actor.id);
    assert.deepEqual(selectCharacterBudget([...candidates].reverse(), quality, actors).map(actor => actor.id), selected);
    assert.equal(JSON.stringify(candidates), before, 'Budget selection must not mutate candidate LOD/state.');
  }
  assert.equal(JSON.stringify(CHARACTER_REGISTRY), originalRegistry);
});

after(() => {
  report.sourcesUnchangedDuringRun = sourceFiles.every(path => sourceAtStart[path] === hash(path)) && worldFreeze.files.every(entry => hash(entry.path) === entry.sha256);
  report.violationCount = report.scenarios.reduce((n, entry) => n + entry.violations.length, 0);
  report.status = report.sourcesUnchangedDuringRun && report.violationCount === 0 ? 'budget-checks-pass' : 'budget-checks-fail';
  if (process.env.R50_WRITE_BUDGET_REPORT === '1') {
    const suffix = process.env.R50_BUDGET_REPORT_SUFFIX ?? '';
    assert.match(suffix, /^[a-z0-9-]*$/, 'Report suffix must be a local filename component.');
    writeFileSync(file(`reports/r50-followup/female-runtime-budget${suffix ? '.' + suffix : ''}.json`), JSON.stringify(report, null, 2) + '\n');
  }
  assert.ok(report.sourcesUnchangedDuringRun, 'Production source changed during budget run; rerun before using the evidence.');
});
