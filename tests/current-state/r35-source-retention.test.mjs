import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {r35Source, validateR35SourceRegistry, restorePreR35Source, restoreR35SourceIfPresent,
  independentR34Source, assertR35RetainedSource} from '../lib/r35-source-retention.mjs';

const root = new URL('../../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
const raw = read('tests/fixtures/r35-source-delta.json');
const expectedPaths = ['src/render/PostProcessing.js', 'src/scene/palace/kit.js', 'src/scene/zones/ZoneBase.js', 'src/utils/TextureLibrary.js'];
// Independent source from published R35 commit 0d7bbf23c1d79b36170a36b27a988488554f1b9f
// (Git tree 8536222213a47655a66e0280d28df183c299ae29).
// Only the two exact superseding 2eaac9c inputs select authenticated original
// candidate blobs. The inventory/retained-file sections remain uncoupled.
const successors = new Map([
  ['src/scene/palace/kit.js', 'b06365e333bfd0235aa6ab3fb8913a02d844d85296858355214e5375575d5322'],
  ['src/scene/zones/ZoneBase.js', 'e0728e42af334585466951359848f5b067683ad44a75001af01b0a719e32765b'],
]);
const archiveBytes = read('tests/fixtures/r35-finish-source-blobs.json.gz');
assert.equal(sha(archiveBytes), '67ba4e73da99fab450954d2884ce233fdc4eded3a350c16eda7b47d67d750582', 'immutable R35 finish source inputs');
const archive = Object.freeze(JSON.parse(gunzipSync(archiveBytes, {maxOutputLength: 250_000})));
function atR35Finish(name, bytes) {
  if (!successors.has(name) || sha(bytes) !== successors.get(name)) return bytes;
  const d = r35Source.files[name], original = Buffer.from(archive[name], 'utf8');
  assert.equal(original.length, d.candidateBytes, name);
  assert.equal(sha(original), d.candidateSHA256, name);
  assert.equal(blob(original), d.candidateGitBlob, name);
  return original;
}
// Independently enumerated Git tree plus original bytes only for retained
// paths changed in the pinned current checkout. Never derive original files
// from the registry or silently trim the live path inventory to old paths.
const retainedArchiveBytes = read('tests/fixtures/r35-retained-epoch.json.gz');
assert.equal(sha(retainedArchiveBytes), '6dd1b23c000909e9c8ae1fb3c24dd54fbd3b1fc9e63a2273706d6f534c2b9870', 'immutable independent R35 inventory and source archive');
const historical = JSON.parse(gunzipSync(retainedArchiveBytes, {maxOutputLength: 2_000_000}));
const liveInventorySHA256 = '2f7effa66bf6f74ca5df30317fae12151509c74293f8abc040ee9d24cce756d4';
function assertLiveProductInventory(paths) {
  assert.equal(sha(JSON.stringify(paths)), liveInventorySHA256, 'unreviewed live product path inventory');
}
function atR35Retained(name, bytes) {
  if (!Object.hasOwn(historical.retainedOverlay, name)) return bytes;
  const [successor, encoding, source] = historical.retainedOverlay[name];
  if (sha(bytes) !== successor) return bytes;
  assert.ok(encoding === 'utf8' || encoding === 'base64');
  return assertR35RetainedSource(name, Buffer.from(source, encoding));
}
function mutations(bytes) {
  const changed = Buffer.from(bytes); changed[Math.floor(changed.length / 2)] ^= 1;
  return [Buffer.alloc(0), changed, bytes.subarray(1), Buffer.concat([bytes, bytes]), Buffer.concat([bytes, Buffer.from('\n// unreviewed')])];
}

test('R35 binds the complete raw finish scope, independent R34 sources, unchanged product inventory and all previous fixtures', () => {
  assert.equal(r35Source.schema, 1);
  assert.equal(r35Source.baseline, '2cd8189db462e34a2ffc5573a435db8a0a77cccb');
  assert.match(r35Source.candidate, /^[a-f0-9]{40}$/);
  assert.notEqual(r35Source.candidate, r35Source.baseline);
  assert.deepEqual(Object.keys(r35Source.files), expectedPaths);
  assert.deepEqual(r35Source.addedFiles, {});
  assert.deepEqual(r35Source.productAdditions, []);
  assert.deepEqual(validateR35SourceRegistry(raw), r35Source);
  assert.ok(Object.isFrozen(r35Source));
  assert.ok(Object.isFrozen(r35Source.files));
  assert.ok(Object.isFrozen(r35Source.retainedFiles));
  assert.ok(Object.isFrozen(r35Source.preservedFixtures));
  const live = ['src', 'data', 'public'].flatMap(dir => fs.readdirSync(new URL(dir + '/', root), {recursive: true, withFileTypes: true})
    .filter(entry => entry.isFile())
    .map(entry => path.relative(root.pathname, path.join(entry.parentPath, entry.name)))).sort();
  assertLiveProductInventory(live);
  for (const changed of [[...live, 'src/unreviewed.js'].sort(), live.slice(1), [...live, live[0]].sort(), live.toReversed()]) {
    assert.throws(() => assertLiveProductInventory(changed), /unreviewed live product path inventory/);
  }
  assert.equal(historical.commit, '0d7bbf23c1d79b36170a36b27a988488554f1b9f');
  assert.equal(historical.tree, '8536222213a47655a66e0280d28df183c299ae29');
  assert.equal(Object.keys(historical.retainedOverlay).length, 78);
  const actual = Object.entries(historical.inventory).map(([name, gitBlob]) => {
    const raw = read(name);
    const bytes = Object.hasOwn(r35Source.files, name) ? atR35Finish(name, raw) : atR35Retained(name, raw);
    assert.equal(blob(bytes), gitBlob, 'exact historical product-tree blob: ' + name);
    return name;
  });
  assert.deepEqual(actual, [...Object.keys(r35Source.files), ...Object.keys(r35Source.retainedFiles)].filter(name => /^(src|data|public)\//.test(name)).sort());
  for (const [name, digest] of Object.entries(r35Source.preservedFixtures)) assert.equal(sha(read(name)), digest, name);
  assert.ok(Object.hasOwn(r35Source.preservedFixtures, 'tests/fixtures/r34-source-delta.json'));
  assert.ok(Object.hasOwn(r35Source.preservedFixtures, 'tests/fixtures/r34-scene-delta.json'));
  assert.doesNotMatch(read('tests/lib/r35-source-retention.mjs').toString(), /child_process|execSync|execFile|fetch\(|git show|rev-parse/);
});

test('R35 immutable registry rejects forged epochs, source identities, finite hunks, retained paths and fixture bindings', () => {
  assert.deepEqual(Object.keys(archive), [...successors.keys()]);
  for (const [name, approved] of successors) {
    const current = read(name);
    assert.equal(sha(current), approved, 'unreviewed live R35 finish source change: ' + name);
    for (const mutation of mutations(current)) assert.equal(atR35Finish(name, mutation), mutation);
    for (const unknown of ['src/unknown.js', '__proto__', 'constructor']) assert.equal(atR35Finish(unknown, current), current);
  }
  for (const bytes of mutations(raw)) assert.throws(() => validateR35SourceRegistry(bytes), /immutable R35/);
  const first = expectedPaths[0], retained = Object.keys(r35Source.retainedFiles)[0];
  for (const mutate of [
    registry => {registry.baseline = '0'.repeat(40);}, registry => {registry.candidate = '0'.repeat(40);},
    registry => {delete registry.files[first];}, registry => {registry.files['src/unknown.js'] = registry.files[first];},
    ...['baselineSHA256', 'candidateSHA256', 'baselineGitBlob', 'candidateGitBlob'].map(key => registry => {registry.files[first][key] = '0'.repeat(64);}),
    ...['baselineBytes', 'candidateBytes'].map(key => registry => {registry.files[first][key]++;}),
    registry => {registry.files[first].baselineUTF8 += '\n';}, registry => {registry.files[first].deltas.pop();},
    registry => {registry.files[first].deltas.push(registry.files[first].deltas[0]);},
    registry => {registry.files[first].deltas[0].before = '';}, registry => {registry.files[first].deltas[0].after += '// forged';},
    registry => {delete registry.retainedFiles[retained];}, registry => {registry.retainedFiles[retained].baselineBytes++;},
    registry => {registry.productAdditions.push('src/unknown.js');}, registry => {registry.preservedFixtures = {};}
  ]) {
    const forged = structuredClone(r35Source); mutate(forged);
    assert.throws(() => validateR35SourceRegistry(Buffer.from(JSON.stringify(forged, null, 2) + '\n')), /immutable R35/);
  }
});

for (const name of expectedPaths) test(`${name}: raw R35 bytes restore only the independently frozen R34 identity and reject every mutated candidate`, () => {
  const delta = r35Source.files[name], bytes = atR35Finish(name, read(name)), original = Buffer.from(bytes), text = bytes.toString();
  assert.equal(sha(bytes), delta.candidateSHA256);
  assert.equal(bytes.length, delta.candidateBytes);
  assert.equal(blob(bytes), delta.candidateGitBlob);
  const independent = independentR34Source(name), restored = restorePreR35Source(name, bytes);
  assert.deepEqual(restored, independent);
  assert.equal(sha(restored), delta.baselineSHA256);
  assert.equal(blob(restored), delta.baselineGitBlob);
  assert.equal(restorePreR35Source(name, independent), independent);
  assert.equal(restoreR35SourceIfPresent(name, independent), independent);
  assert.deepEqual(restoreR35SourceIfPresent(name, bytes), independent);
  const bad = [...mutations(bytes), ...mutations(independent)];
  for (const hunk of delta.deltas) {
    assert.ok(Object.isFrozen(hunk));
    assert.ok(hunk.before.length && hunk.after.length);
    assert.notEqual(hunk.before, hunk.after);
    assert.equal(text.split(hunk.after).length, 2);
    assert.equal(independent.toString().split(hunk.before).length, 2);
    for (const replacement of ['', hunk.before, hunk.after + hunk.after, hunk.after + '// forged']) bad.push(Buffer.from(text.replace(hunk.after, replacement)));
  }
  for (const mutation of bad) {
    if (sha(mutation) === delta.baselineSHA256) continue;
    assert.throws(() => restorePreR35Source(name, mutation), /exact R35 source candidate/);
    assert.equal(restoreR35SourceIfPresent(name, mutation), mutation);
  }
  assert.deepEqual(bytes, original);
});

test('every retained production and provenance file remains byte-exact, including binary assets', () => {
  for (const name of Object.keys(historical.retainedOverlay)) assert.ok(Object.hasOwn(r35Source.retainedFiles, name));
  for (const name of Object.keys(r35Source.retainedFiles)) {
    const raw = read(name), bytes = atR35Retained(name, raw);
    const binding = Object.hasOwn(historical.retainedOverlay, name) ? historical.retainedOverlay[name] : null;
    if (binding) {
      assert.equal(sha(raw), binding[0], 'unreviewed superseding retained source: ' + name);
      assert.notEqual(bytes, raw, 'frozen restoration cannot overwrite live bytes');
      assert.throws(() => assertR35RetainedSource(name, raw), /exact retained R34 source/);
      for (const mutation of mutations(raw)) {
        assert.equal(atR35Retained(name, mutation), mutation);
        assert.throws(() => assertR35RetainedSource(name, mutation), /exact retained R34 source/);
      }
      for (const unknown of ['src/unknown.js', '__proto__', 'constructor']) assert.equal(atR35Retained(unknown, raw), raw);
    } else assert.equal(bytes, raw, 'matching live bytes are read directly');
    assert.equal(assertR35RetainedSource(name, bytes), bytes);
    for (const mutation of mutations(bytes)) assert.throws(() => assertR35RetainedSource(name, mutation), /exact retained R34 source/);
  }
});

test('R35 dispatch never projects unregistered paths, prototype properties, or an unrelated source identity', () => {
  const bytes = read(expectedPaths[0]);
  for (const name of ['src/unknown.js', '__proto__', 'constructor', 'toString']) {
    assert.equal(restorePreR35Source(name, bytes), bytes);
    assert.equal(restoreR35SourceIfPresent(name, bytes), bytes);
    assert.throws(() => independentR34Source(name), /registered independent R34 source/);
    assert.throws(() => assertR35RetainedSource(name, bytes), /registered R35 retained source/);
  }
  for (const name of expectedPaths.slice(1)) {
    assert.throws(() => restorePreR35Source(name, bytes), /exact R35 source candidate/);
    assert.equal(restoreR35SourceIfPresent(name, bytes), bytes);
  }
});
