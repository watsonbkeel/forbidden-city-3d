import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {captureGate, meshFingerprint} from './lib/gate-tower-fixture.mjs';
import {ascentRetention, ascentObjectRows, assertCurrentWumenAscent, restorePreWumenAscent} from './lib/wumen-ascent-retention.mjs';
import {baseline, hash, footRoundoff, restoreWumenFootRoundoff, assertUnscopedWumen} from './lib/wumen-vertical-profile-controls.mjs';
const current = captureGate();
const at = (root, path) => path.split('/').filter(Boolean).reduce((o, index) => o.children[+index], root);
const clone = () => ({...current, group: current.group.clone(true)});
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('frozen folded-ascent signatures require the complete current scope and unchanged legacy generator', () => {
  assertCurrentWumenAscent(current);
  assert.equal(ascentRetention.schema, 1);
  assert.equal(ascentRetention.baseCommit, '4ede9aaaad7059cdb30478c32e3ae0ad7fb2b368');
  assert.equal(ascentRetention.childIndex, 27);
  assert.equal(ascentRetention.colliderPrefix, 12); assert.equal(ascentRetention.colliderSuffix, 52);
  assert.equal(ascentRetention.current.colliderCount, 268); assert.equal(ascentRetention.current.walkableCount, 13);
  assert.equal(ascentRetention.current.objects.length, 184);
  assert.equal(ascentRetention.historical.colliderCount, 304); assert.equal(ascentRetention.historical.walkableCount, 3);
  for (const [path, expected] of Object.entries({...ascentRetention.currentSourceSHA256, ...ascentRetention.unchangedSourceSHA256})) {
    assert.equal(sha(fs.readFileSync(new URL('../' + path, import.meta.url))), expected, path);
  }
});

test('finite historical view preserves every other child and both collider tails without mutating current geometry or physics', () => {
  const before = meshFingerprint(current.group), physics = hash({colliders: current.builder.colliders, walkables: current.builder.walkables});
  const old = restorePreWumenAscent(current);
  assert.equal(old.group.children.length, 41); assert.equal(old.group.children[27].children.length, 150);
  for (let i = 0; i < 41; i++) if (i !== 27) {
    assert.deepEqual(ascentObjectRows(old.group.children[i]), ascentObjectRows(current.group.children[i]), `unscoped child ${i} is exact`);
    assert.deepEqual(old.group.children[i].matrix.toArray(), current.group.children[i].matrix.toArray());
  }
  for (let i = 0; i < 12; i++) assert.equal(old.builder.colliders[i], current.builder.colliders[i]);
  for (let i = 0; i < 52; i++) assert.equal(old.builder.colliders[316 + i], current.builder.colliders[12 + ascentRetention.current.colliderCount + i]);
  assert.equal(meshFingerprint(current.group), before);
  assert.equal(hash({colliders: current.builder.colliders, walkables: current.builder.walkables}), physics);
  assert.equal(restorePreWumenAscent(old), old, 'only an exact historical stage is idempotent');
  assert.throws(() => assertCurrentWumenAscent(old));
  assertUnscopedWumen(old);
  assert.equal(hash({colliders: old.builder.colliders, walkables: old.builder.walkables}), footRoundoff.rawAfterPhysics);
  assert.equal(hash({colliders: restoreWumenFootRoundoff(old.builder.colliders), walkables: old.builder.walkables}), baseline.physics);
});

test('all non-ascent Euler, quaternion and matrix values preserve signed zeros and positive/negative pi exactly', () => {
  for (const angles of [[-0, +0, -0], [-0, Math.PI, +0], [+0, -Math.PI, -0], [Math.PI, -0, -Math.PI]]) {
    const changed = clone(), probe = changed.group.children[0];
    probe.rotation.set(...angles); probe.position.x = -0;
    changed.group.updateMatrixWorld(true);
    const before = {rotation: probe.rotation.toArray(), quaternion: probe.quaternion.toArray(), matrix: probe.matrix.toArray()};
    const old = restorePreWumenAscent(changed);
    function compare(source, copy) {
      for (const key of ['position', 'rotation', 'quaternion', 'scale', 'matrix', 'matrixWorld']) {
        // strict deep equality distinguishes -0 from +0; JSON fingerprints do not.
        assert.deepEqual(copy[key].toArray(), source[key].toArray(), `${source.name || source.type}: exact ${key}`);
      }
      assert.equal(copy.children.length, source.children.length);
      source.children.forEach((child, index) => compare(child, copy.children[index]));
    }
    for (let i = 0; i < 41; i++) if (i !== 27) compare(changed.group.children[i], old.group.children[i]);
    assert.ok(Object.is(old.group.children[0].position.x, -0));
    assert.deepEqual(probe.rotation.toArray(), before.rotation);
    assert.deepEqual(probe.quaternion.toArray(), before.quaternion);
    assert.deepEqual(probe.matrix.toArray(), before.matrix);
    old.group.children[0].rotation.y += .1;
    assert.notDeepEqual(old.group.children[0].quaternion.toArray(), before.quaternion, 'Euler feedback callback is restored on the copy');
    assert.deepEqual(probe.quaternion.toArray(), before.quaternion, 'the source remains untouched');
  }
});

test('restoration never applies to Shenwu or reconstructs any unscoped Wumen child', () => {
  const shenwu = captureGate('神武门'); assert.equal(restorePreWumenAscent(shenwu), shenwu);
  for (let i = 0; i < 41; i++) if (i !== 27) {
    const changed = clone(); changed.group.children[i].position.x += .001;
    const old = restorePreWumenAscent(changed);
    assert.equal(old.group.children[i].position.x, changed.group.children[i].position.x);
    if (![28, 29, 30].includes(i)) assert.throws(() => assertUnscopedWumen(old), `unscoped child ${i}`);
  }
  const inserted = clone(); inserted.group.add(new current.THREE.Group());
  assert.throws(() => restorePreWumenAscent(inserted));
  const moved = clone(); [moved.group.children[26], moved.group.children[27]] = [moved.group.children[27], moved.group.children[26]];
  assert.throws(() => restorePreWumenAscent(moved));
});

test('every current ascent object and mesh remains keyed; no removed, reordered, transformed or modified entry is normalized away', () => {
  for (const row of ascentRetention.current.objects) {
    const changed = clone(), object = at(changed.group, row.path);
    if (object.isMesh) { object.geometry = object.geometry.clone(); object.geometry.attributes.position.array[0] += .001; }
    else object.position.z += .001;
    assert.throws(() => restorePreWumenAscent(changed), row.path);
  }
  for (const change of [
    root => root.children.pop(),
    root => root.children.push(root.children[0].clone(true)),
    root => { const children = root.children[0].children; [children[0], children[1]] = [children[1], children[0]]; },
    root => root.children[0].userData.structure.counts.meshes++,
    root => { root.name = 'unreviewed'; },
    root => { root.visible = false; },
  ]) { const changed = clone(); change(changed.group.children[27]); assert.throws(() => restorePreWumenAscent(changed)); }
});

test('current geometry shape, full attributes, index representation, render state and shared material identity cannot be hidden', () => {
  const targets = ascentRetention.current.objects.filter(row => at(current.group, row.path).isMesh);
  const rails = targets.filter(row => at(current.group, row.path).material.name === 'balustrade');
  assert.equal(rails.length, 6);
  for (const row of [targets[0], ...rails]) for (const mutation of ['position', 'normal', 'uv', 'array-type', 'item-size', 'normalized', 'usage', 'groups', 'draw-range', 'cast-shadow', 'material', 'material-state', 'metadata', 'transform']) {
    const changed = clone(), mesh = at(changed.group, row.path); mesh.geometry = mesh.geometry.clone();
    const g = mesh.geometry;
    if (['position', 'normal', 'uv'].includes(mutation)) g.attributes[mutation].array[0] += .25;
    else if (mutation === 'array-type') g.attributes.position.array = new Float64Array(g.attributes.position.array);
    else if (mutation === 'item-size') g.attributes.position.itemSize = 2;
    else if (mutation === 'normalized') g.attributes.normal.normalized = true;
    else if (mutation === 'usage') g.attributes.position.usage = current.THREE.DynamicDrawUsage;
    else if (mutation === 'groups') g.groups.push({start: 0, count: 3, materialIndex: 0});
    else if (mutation === 'draw-range') g.setDrawRange(0, 3);
    else if (mutation === 'cast-shadow') mesh.castShadow = !mesh.castShadow;
    else if (mutation === 'material') mesh.material = mesh.material.clone();
    else if (mutation === 'material-state') { mesh.material = mesh.material.clone(); mesh.material.opacity = .4; }
    else if (mutation === 'metadata') mesh.userData.unreviewed = true;
    else mesh.rotation.y += .01;
    assert.throws(() => restorePreWumenAscent(changed), `${row.path}: ${mutation}`);
  }
  for (const row of rails) for (const mutation of ['cap-uv', 'cap-position', 'index', 'index-type', 'index-shape', 'index-normalized', 'winding']) {
    const changed = clone(), mesh = at(changed.group, row.path); mesh.geometry = mesh.geometry.clone(); const g = mesh.geometry;
    if (mutation === 'cap-uv') g.attributes.uv.array[24] += .25;
    else if (mutation === 'cap-position') g.attributes.position.array[36] += .25;
    else if (mutation === 'index-type') g.setIndex(new current.THREE.Uint32BufferAttribute(g.index.array, 1));
    else if (mutation === 'index-shape') { g.index.itemSize = 2; g.index.count = 12; }
    else if (mutation === 'index-normalized') g.index.normalized = true;
    else if (mutation === 'winding') [g.index.array[0], g.index.array[1]] = [g.index.array[1], g.index.array[0]];
    else g.index.array[0] = 12;
    assert.throws(() => restorePreWumenAscent(changed), `${row.path}: ${mutation}`);
  }
});

test('every scoped collider and support is exact; collider prefixes and suffixes remain visible to historical guards', () => {
  for (let i = 0; i < ascentRetention.current.colliderCount; i++) {
    const colliders = current.builder.colliders.map(b => b.clone()); colliders[12 + i].max.x += .001;
    assert.throws(() => restorePreWumenAscent({...current, builder: {...current.builder, colliders}}), `collider ${i}`);
  }
  for (let i = 0; i < current.builder.walkables.length; i++) {
    const walkables = current.builder.walkables.map(w => w.type === 'box' ? {...w, box: w.box.clone()} : {...w});
    if (walkables[i].type === 'box') walkables[i].box.max.y += .001; else walkables[i].y1 += .001;
    assert.throws(() => restorePreWumenAscent({...current, builder: {...current.builder, walkables}}), `support ${i}`);
  }
  for (const index of [...Array(12).keys(), ...Array.from({length: 52}, (_, i) => 12 + ascentRetention.current.colliderCount + i)]) {
    const colliders = current.builder.colliders.map(b => b.clone()); colliders[index].max.x += .001;
    const old = restorePreWumenAscent({...current, builder: {...current.builder, colliders}});
    const oldIndex = index < 12 ? index : index - ascentRetention.current.colliderCount + 304;
    assert.equal(old.builder.colliders[oldIndex], colliders[index]);
    assert.notEqual(hash({colliders: old.builder.colliders, walkables: old.builder.walkables}), footRoundoff.rawAfterPhysics);
  }
  for (const mutate of [list => list.splice(12, 1), list => list.push(list[12].clone()), list => [list[12], list[13]] = [list[13], list[12]]]) {
    const colliders = current.builder.colliders.map(b => b.clone()); mutate(colliders);
    assert.throws(() => restorePreWumenAscent({...current, builder: {...current.builder, colliders}}));
  }
});
