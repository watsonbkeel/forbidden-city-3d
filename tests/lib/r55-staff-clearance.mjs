// Read-only analytic QA over bindings from one already-built production world.
// Never constructs a scene/System/adapter, resolves support, steps a clock, or
// mutates supplied state. The caller owns fresh resolution after world changes.
import { isDeepStrictEqual } from 'node:util';
import { CharacterWorldAdapter } from '../../src/scene/characters/CharacterWorldAdapter.js';
import baseline from '../fixtures/r55-r54-provenance.json' with { type: 'json' };

export const R55_STAFF_IDS = Object.freeze(["changchun-maid-02", "changchun-eunuch-01", "zhongcui-maid-02", "zhongcui-eunuch-01", "jingren-maid-02", "jingren-eunuch-02", "yonghe-maid-02", "yonghe-eunuch-02"]);
const requiredIds = Object.freeze([...baseline.records.actors.map(a => a.id), ...R55_STAFF_IDS]);
const staffIds = new Set(R55_STAFF_IDS), threshold = 1.2;
const vector = p => Array.isArray(p) && p.length === 3 && p.every(v => Number.isFinite(v) && Math.abs(v) <= Number.MAX_SAFE_INTEGER);
const clamp = n => Math.max(0, Math.min(1, n));
const cross = (x, z, X, Z) => x * Z - z * X;

/** Exact continuous 2-D line-segment minimization (ordinary IEEE-754 arithmetic).
 * Intersecting segments have zero clearance. Otherwise a minimum occurs at an
 * endpoint projected onto the other segment. Degenerate segments are points.
 * Inputs are world [x,y,z]; witnesses are horizontal [x,z]. No time/phase/priority.
 */
export function closestHorizontalSegments(a, b, c, d) {
  if (![a, b, c, d].every(vector)) throw new TypeError('Segment endpoints must be finite, safely representable [x,y,z] vectors');
  const ax = b[0] - a[0], az = b[2] - a[2], bx = d[0] - c[0], bz = d[2] - c[2];
  const aa = ax * ax + az * az, bb = bx * bx + bz * bz, denominator = cross(ax, az, bx, bz);
  const witness = (t, u) => {
    const pointA = [a[0] + t * ax, a[2] + t * az], pointB = [c[0] + u * bx, c[2] + u * bz];
    return { distanceMeters: Math.hypot(pointA[0] - pointB[0], pointA[1] - pointB[1]), t, u, pointA, pointB };
  };
  if (denominator !== 0) {
    const dx = c[0] - a[0], dz = c[2] - a[2];
    const t = cross(dx, dz, bx, bz) / denominator, u = cross(dx, dz, ax, az) / denominator;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return { ...witness(t, u), distanceMeters: 0 };
  }
  const onA = p => aa ? clamp(((p[0] - a[0]) * ax + (p[2] - a[2]) * az) / aa) : 0;
  const onB = p => bb ? clamp(((p[0] - c[0]) * bx + (p[2] - c[2]) * bz) / bb) : 0;
  return [witness(0, onB(a)), witness(1, onB(b)), witness(onA(c), 0), witness(onA(d), 1)]
    .reduce((best, candidate) => candidate.distanceMeters < best.distanceMeters ? candidate : best);
}

// Mirror getGeneration's format without calling it: getGeneration registers
// previously unseen objects, and getRevision may invalidate caches. This read
// only consults already assigned identities. Unknown/new groups fail closed until
// the caller resolves fresh production bindings; missing loaded zones also fail.
function currentGenerationReadOnly(adapter, zoneRef) {
  const objectId = object => !object || typeof object !== 'object' ? 'none' : adapter.objectIds.get(object);
  const root = zoneRef === 'static' ? adapter.scene : adapter.zoneManager?.loaded?.get(zoneRef)?.data?.group;
  if (!root || typeof root !== 'object') return null;
  const rootId = objectId(root);
  if (rootId === undefined) return null;
  const interiors = [];
  for (const hall of adapter.interiors?.halls?.values?.() ?? []) {
    const groupId = objectId(hall.group);
    if (groupId === undefined) return null;
    interiors.push(`${hall.id}:${hall.state}:${hall.token}:${groupId}`);
  }
  return `${adapter.generation}:${zoneRef}:${rootId}:${interiors.join('|')}`;
}

/**
 * @param {{registry: object, adapter: CharacterWorldAdapter,
 *   resolvedBindings: Array<{actor: object, binding: object, revision?: string}>}} input
 * Pass [...system.manager.states.values()] and system.world, after all93 bindings
 * are ready. Actor identity, adapter registry, cached binding identity, saved
 * revision when supplied, current complete zone/interior generation, path identity/
 * specification, and support references are
 * checked before geometry. Invalid input returns no partial or misleading pass.
 *
 * Each moving role contributes EVERY full validated path segment, even a guard
 * follower whose current phase traverses less. This deliberately conservative
 * envelope cannot hide crossing routes using clocks, LOD, schedule or priority.
 * Seat and surface roles contribute a zero-length segment at binding.position.
 */
export function evaluateR55StaffClearance({ registry, adapter, resolvedBindings } = {}) {
  const errors = [], report = {
    pass: false, status: 'invalid-bindings', method: 'phase-independent analytic horizontal swept centerline',
    minimumSeparationMeters: threshold, staffActorIds: [...R55_STAFF_IDS], actorsChecked: 0,
    pairsChecked: 0, segmentPairsChecked: 0, minimumPair: null, minimumByStaff: {}, violations: [], errors
  };
  if (!(adapter instanceof CharacterWorldAdapter)) errors.push('A real, already-used CharacterWorldAdapter is required');
  if (adapter?.disposed) errors.push('Adapter is disposed');
  if (adapter?.registry !== registry) errors.push('Adapter registry identity differs from supplied registry');
  if (!Array.isArray(registry?.actors) || registry.actors.length !== 93) errors.push('Registry must contain exactly93 actors');
  if (!Array.isArray(resolvedBindings) || resolvedBindings.length !== 93) errors.push('Exactly93 resolved binding entries are required');
  if (errors.length) return report;
  const actors = new Map(), entries = new Map();
  for (const actor of registry.actors) {
    if (!requiredIds.includes(actor?.id)) errors.push(`Unknown registry actor: ${actor?.id}`);
    if (actors.has(actor?.id)) errors.push(`Duplicate registry actor: ${actor?.id}`);
    if (actor?.required !== true) errors.push(`Required actor demoted: ${actor?.id}`);
    actors.set(actor?.id, actor);
  }
  for (const entry of resolvedBindings) {
    const id = entry?.actor?.id;
    if (!actors.has(id)) errors.push(`Unknown binding actor: ${id}`);
    if (entries.has(id)) errors.push(`Duplicate binding actor: ${id}`);
    entries.set(id, entry);
  }
  const curves = new Map(), generations = new Map();
  for (const id of requiredIds) {
    const actor = actors.get(id), entry = entries.get(id), binding = entry?.binding;
    if (!actor || !entry) { errors.push(`Missing actor/binding: ${id}`); continue; }
    if (entry.actor !== actor) errors.push(`Wrong actor identity: ${id}`);
    if (binding?.status !== 'ready') { errors.push(`Binding not ready: ${id} (${binding?.status ?? 'missing'}: ${binding?.reason ?? ''})`); continue; }
    const cached = adapter.cache.get(id);
    if (cached?.result !== binding) errors.push(`Wrong/stale binding identity in adapter cache: ${id}`);
    if (entry.revision !== undefined && (typeof entry.revision !== 'string' || !cached?.key?.startsWith(`${id}:${entry.revision}:`))) errors.push(`Binding revision differs: ${id}`);
    if (!generations.has(actor.zoneRef)) generations.set(actor.zoneRef, currentGenerationReadOnly(adapter, actor.zoneRef));
    const generation = generations.get(actor.zoneRef), epoch = adapter.physicalEpochs.get(id) ?? 0;
    if (generation === null || !cached?.key?.startsWith(`${id}:${generation}:physical=${epoch}:`)) errors.push(`Stale or unresolved current zone/interior generation: ${id}`);
    if (!vector(binding.position) || !Number.isFinite(binding.rotationYRad)) errors.push(`Invalid resolved transform: ${id}`);
    if (binding.zoneRef !== actor.zoneRef) errors.push(`Wrong binding zone: ${id}`);
    const placement = actor.placement;
    if (placement?.mode === 'path') {
      const declared = registry.paths?.find(p => p.id === placement.pathRef), path = binding.path;
      if (!declared || adapter.maps.paths.get(placement.pathRef) !== declared || path?.id !== placement.pathRef || path?.status !== 'ready' || adapter.pathCache.get(placement.pathRef)?.result !== path) {
        errors.push(`Wrong/unready path identity: ${id}`); continue;
      }
      if (Object.entries(declared).some(([key, value]) => !isDeepStrictEqual(path[key], value))) errors.push(`Path specification differs: ${id}`);
      if (!Array.isArray(path.points) || path.points.length < 2 || path.points.length !== declared.pointsLocalMeters?.length || !path.points.every(vector) || !isDeepStrictEqual(path.pointsMeters, path.points)) {
        errors.push(`Invalid/inconsistent resolved path points: ${id}`); continue;
      }
      if (binding.support?.kind !== 'validated-path' || binding.support?.surfaceRef !== placement.surfaceRef || path.surfaceRef !== placement.surfaceRef || path.zoneRef !== actor.zoneRef) errors.push(`Wrong path support identity: ${id}`);
      if (!isDeepStrictEqual(binding.position, path.points[0])) errors.push(`Binding does not start at its resolved path: ${id}`);
      if (generation === null || path.validationGeneration !== generation) errors.push(`Stale path generation: ${id}`);
      curves.set(id, path.points.slice(1).map((to, i) => [path.points[i], to]));
    } else if (placement?.mode === 'surface' || placement?.mode === 'seat') {
      const supportKey = placement.mode === 'seat' ? 'seatRef' : 'surfaceRef';
      if (binding.path !== undefined || binding.support?.[supportKey] !== placement[supportKey]) errors.push(`Wrong stationary support identity: ${id}`);
      if (placement.mode === 'surface' && (binding.support?.status !== 'ready' || !vector(binding.support.position) || !isDeepStrictEqual(binding.position, binding.support.position))) errors.push(`Invalid/not-ready surface support or detached center: ${id}`);
      if (placement.mode === 'seat' && binding.support?.kind !== 'seat') errors.push(`Wrong seat support identity: ${id}`);
      curves.set(id, [[binding.position, binding.position]]);
    } else errors.push(`Unsupported placement mode: ${id}`);
  }
  if (errors.length) return report;
  report.actorsChecked = requiredIds.length;
  for (let i = 0; i < requiredIds.length; i++) for (let j = i + 1; j < requiredIds.length; j++) {
    const a = requiredIds[i], b = requiredIds[j];
    if (!staffIds.has(a) && !staffIds.has(b)) continue;
    let nearest = null;
    const A = curves.get(a), B = curves.get(b);
    for (let ai = 0; ai < A.length; ai++) for (let bi = 0; bi < B.length; bi++) {
      const result = closestHorizontalSegments(...A[ai], ...B[bi]); report.segmentPairsChecked++;
      if (!nearest || result.distanceMeters < nearest.distanceMeters) nearest = {
        actorIds: [a, b], pathRefs: [actors.get(a).placement.pathRef ?? null, actors.get(b).placement.pathRef ?? null],
        segmentIndices: [ai, bi], distanceMeters: result.distanceMeters,
        closestPointsXZ: [result.pointA, result.pointB], segmentParameters: [result.t, result.u]
      };
    }
    report.pairsChecked++;
    if (!report.minimumPair || nearest.distanceMeters < report.minimumPair.distanceMeters) report.minimumPair = nearest;
    for (const id of [a, b]) if (staffIds.has(id) && (!report.minimumByStaff[id] || nearest.distanceMeters < report.minimumByStaff[id].distanceMeters)) report.minimumByStaff[id] = nearest;
    if (nearest.distanceMeters < threshold) report.violations.push(nearest);
  }
  report.pass = report.violations.length === 0;
  report.status = report.pass ? 'clear' : 'insufficient-clearance';
  return report;
}
