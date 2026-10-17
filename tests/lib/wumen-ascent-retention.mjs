import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {buildGateAscent, toWorld} from '../../src/scene/palace/gateAscent.js';

export const ascentRetention = JSON.parse(fs.readFileSync(new URL('../fixtures/wumen-folded-ascent-retention.json', import.meta.url)));
const json = value => JSON.stringify(value, (_, v) => typeof v === 'number' && !Number.isFinite(v) ? String(v) : v);
export const ascentHash = value => createHash('sha256').update(json(value)).digest('hex');
const bytesHash = value => createHash('sha256').update(value).digest('hex');
function attribute(a) {
  return {array: a.array.constructor.name, bytes: bytesHash(Buffer.from(a.array.buffer, a.array.byteOffset, a.array.byteLength)),
    itemSize: a.itemSize, count: a.count, normalized: a.normalized, usage: a.usage, gpuType: a.gpuType};
}
function material(m, lib) {
  if (lib) assert.equal(m, lib.material(m.name, m.name === 'balustrade' ? {alphaTest: .5, side: THREE.DoubleSide} : {}), 'ascent keeps exact shared library material identity');
  const {uuid, ...state} = m.toJSON();
  return state;
}
/** Every object, attribute byte, primitive/index shape, render flag, material,
 * local transform and metadata entry is keyed by its exact child path. UUIDs
 * are the sole excluded nondeterministic values; material identity is checked.
 */
export function ascentObjectRows(root, lib = null) {
  root.updateMatrixWorld(true);
  const rows = [];
  function visit(o, path) {
    const state = {type: o.type, name: o.name, position: o.position.toArray(), rotation: o.rotation.toArray(),
      quaternion: o.quaternion.toArray(), scale: o.scale.toArray(), matrix: o.matrix.toArray(),
      flags: [o.visible, o.castShadow, o.receiveShadow, o.frustumCulled, o.renderOrder, o.layers.mask, o.matrixAutoUpdate, o.matrixWorldAutoUpdate],
      userData: o.userData, children: o.children.length};
    if (o.isMesh) {
      const g = o.geometry;
      state.geometry = {type: g.type, parameters: g.parameters, attributes: Object.fromEntries(Object.entries(g.attributes).map(([name, a]) => [name, attribute(a)])),
        index: g.index ? attribute(g.index) : null, groups: g.groups, drawRange: g.drawRange, userData: g.userData,
        morphAttributes: Object.fromEntries(Object.entries(g.morphAttributes).map(([name, list]) => [name, list.map(attribute)])), morphTargetsRelative: g.morphTargetsRelative};
      state.material = Array.isArray(o.material) ? o.material.map(m => material(m, lib)) : material(o.material, lib);
    }
    rows.push({path, sha256: ascentHash(state)});
    o.children.forEach((child, i) => visit(child, `${path}/${i}`));
  }
  visit(root, '/27');
  return rows;
}
export function ascentPhysicsRows(colliders, walkables) {
  return {colliders: colliders.map((b, index) => ({index, sha256: ascentHash({min: b.min.toArray(), max: b.max.toArray()})})),
    walkables: walkables.map((w, index) => ({index, sha256: ascentHash(w)}))};
}
function scope(c) {
  assert.equal(c.data.name, '午门');
  assert.equal(c.group.children.length, 41, 'only Wumen child 27 is in ascent scope');
  const rows = ascentObjectRows(c.group.children[27], c.lib);
  const stage = json(rows) === json(ascentRetention.current.objects) ? 'current' : 'historical';
  assert.deepEqual(rows, ascentRetention[stage].objects, 'complete keyed Wumen ascent geometry/render/metadata signature');
  const expected = ascentRetention[stage];
  assert.equal(c.builder.colliders.length, 12 + expected.colliderCount + 52, 'ascent scope leaves exact 12-prefix and 52-suffix collider slots');
  assert.equal(c.builder.walkables.length, expected.walkableCount, 'only the enumerated Wumen ascent supports may be restored');
  assert.deepEqual(ascentPhysicsRows(c.builder.colliders.slice(12, 12 + expected.colliderCount), c.builder.walkables), expected.physics,
    'complete keyed Wumen ascent collider/support signature; historical gate physics changed');
  return stage;
}
export function assertCurrentWumenAscent(c) {assert.equal(scope(c), 'current', 'current Wumen must contain the frozen folded ascent');}
export function buildHistoricalWumenAscent(c) {
  for (const [path, expected] of Object.entries(ascentRetention.unchangedSourceSHA256)) {
    assert.equal(bytesHash(fs.readFileSync(new URL('../../' + path, import.meta.url))), expected, 'historical ascent generator source is immutable');
  }
  const dm = c.data.dimensions, W = dm.platformWidth, D = dm.platformNorth - dm.platformSouth;
  const zc = (dm.platformSouth + dm.platformNorth) / 2, top = dm.platformHeight + .3;
  const group = new THREE.Group(); group.position.z = zc;
  const physics = toWorld(buildGateAscent(c.lib, group, {W, D, topY: top, band: [D / 2 - 6, D / 2], edge: 'rail', railFacadeOnly: true}),
    new THREE.Matrix4().makeTranslation(c.data.position.x, 0, c.data.position.z + zc));
  assert.equal(group.children.length, 150); assert.equal(physics.colliders.length, 304); assert.equal(physics.walkables.length, 3);
  return {group, ...physics};
}
/** A historical comparison view, never a production mutation or a new golden.
 * Validate all current scoped bytes before replacing only child 27, collider
 * slots [12, 12+N), and the enumerated supports using the unchanged old builder.
 * Every other child/index and both collider prefixes/suffixes survive verbatim.
 */
export function restorePreWumenAscent(c) {
  if (c.data.name !== '午门') return c;
  if (scope(c) === 'historical') return c;
  const old = buildHistoricalWumenAscent(c);
  assert.deepEqual(ascentObjectRows(old.group, c.lib), ascentRetention.historical.objects);
  assert.deepEqual(ascentPhysicsRows(old.colliders, old.walkables), ascentRetention.historical.physics);
  const group = c.group.clone(true), removed = group.children[27];
  // Object3D.clone copies quaternions and can canonicalize a pi Euler into a
  // different equivalent representation. Keep the exact historical parameters
  // as well, without changing any quaternion or matrix bytes.
  function retainEuler(source, copy) {
    const onChange = copy.rotation._onChangeCallback;
    // This test-only copy intentionally suppresses Euler -> quaternion feedback:
    // recomputing an equivalent quaternion can also change signed-zero bytes.
    copy.rotation._onChange(() => {});
    copy.rotation.copy(source.rotation);
    copy.rotation._onChange(onChange);
    assert.deepEqual(copy.quaternion.toArray(), source.quaternion.toArray(), 'cloning must preserve exact source quaternion bytes');
    source.children.forEach((child, index) => retainEuler(child, copy.children[index]));
  }
  retainEuler(c.group, group);
  group.remove(removed); group.add(old.group);
  group.children.splice(group.children.indexOf(old.group), 1); group.children.splice(27, 0, old.group);
  const builder = Object.assign(Object.create(Object.getPrototypeOf(c.builder)), c.builder, {
    colliders: [...c.builder.colliders.slice(0, 12), ...old.colliders, ...c.builder.colliders.slice(12 + ascentRetention.current.colliderCount)],
    walkables: old.walkables,
  });
  group.updateMatrixWorld(true);
  return {...c, group, builder};
}
