import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {r35Source, validateR35SourceRegistry, restorePreR35Source, restoreR35SourceIfPresent,
  independentR34Source, assertR35RetainedSource} from '../lib/r35-source-retention.mjs';

const root = new URL('../../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
const raw = read('tests/fixtures/r35-source-delta.json');
const expectedPaths = ['src/render/PostProcessing.js', 'src/scene/palace/kit.js', 'src/scene/zones/ZoneBase.js', 'src/utils/TextureLibrary.js'];
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
  const actual = ['src', 'data', 'public'].flatMap(dir => fs.readdirSync(new URL(dir + '/', root), {recursive: true, withFileTypes: true})
    .filter(entry => entry.isFile())
    .map(entry => path.relative(root.pathname, path.join(entry.parentPath, entry.name)))).sort();
  assert.deepEqual(actual, [...Object.keys(r35Source.files), ...Object.keys(r35Source.retainedFiles)].filter(name => /^(src|data|public)\//.test(name)).sort());
  for (const [name, digest] of Object.entries(r35Source.preservedFixtures)) assert.equal(sha(read(name)), digest, name);
  assert.ok(Object.hasOwn(r35Source.preservedFixtures, 'tests/fixtures/r34-source-delta.json'));
  assert.ok(Object.hasOwn(r35Source.preservedFixtures, 'tests/fixtures/r34-scene-delta.json'));
  assert.doesNotMatch(read('tests/lib/r35-source-retention.mjs').toString(), /child_process|execSync|execFile|fetch\(|git show|rev-parse/);
});

test('R35 immutable registry rejects forged epochs, source identities, finite hunks, retained paths and fixture bindings', () => {
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
  const delta = r35Source.files[name], bytes = read(name), original = Buffer.from(bytes), text = bytes.toString();
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
  for (const name of Object.keys(r35Source.retainedFiles)) {
    const bytes = read(name);
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
