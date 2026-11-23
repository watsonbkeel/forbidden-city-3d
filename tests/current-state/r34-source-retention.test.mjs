import {restoreR35SourceIfPresent} from '../lib/r35-source-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {r34Source, validateR34SourceRegistry, restorePreR34Source, restoreR34SourceIfPresent,
  assertR34AddedSource, independentR33Source} from '../lib/r34-source-retention.mjs';
import {verifiedR34AddedProductPaths} from '../lib/r34-product-inventory.mjs';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
const readFile = path => fs.readFileSync(new URL('../../' + path, import.meta.url));
// The six files that diverged by 1608d8c. Only these exact successor bytes
// select historical inputs: an unreviewed change must still fail the guard.
const successors = new Map([
  ['data/zones/west-six.json', '9a39fb072da2d4a608e0736e4056c688613a66cbb78783b8cfba06173966b457'],
  ['src/scene/Environment.js', 'b7a0e7531cf2d9c1009b4e0fbc65f3e5d19ed6da555c28ed6e2dd052e0cd0419'],
  ['src/scene/PalaceBuilder.js', 'a4fea0a828d1e36147506b232b1caf8a9c2d72f37837a57fee04737bd5382daa'],
  ['src/scene/zones/ZoneBase.js', 'e0728e42af334585466951359848f5b067683ad44a75001af01b0a719e32765b'],
  ['tests/lib/world.mjs', '237d1d78314f4e99b6705a1f34170d7ee7bf7381798f2c7ad526b82329118327'],
  ['src/scene/palace/special/ChuxiuCourtyard.js', 'f55725d212f71d014908681bc16e51644c4dafea90da31aa0b07220f42f72663'],
]);
// Original Git blobs from 5f5e7b3 (UTF-8 text keyed by path), obtained by
// candidateGitBlob, independently of both R33 baselineUTF8 and the reverse hunks.
const archive = Object.freeze(JSON.parse(gunzipSync(readFile('tests/fixtures/r34-source-blobs.json.gz'))));
function atR34(path, bytes) {
  if (!successors.has(path) || sha(bytes) !== successors.get(path)) return restoreR35SourceIfPresent(path, bytes);
  const d = r34Source.files[path] ?? r34Source.addedFiles[path];
  const original = Buffer.from(archive[path], 'utf8');
  assert.equal(original.length, d.candidateBytes, path);
  assert.equal(sha(original), d.candidateSHA256, path);
  assert.equal(blob(original), d.candidateGitBlob, path);
  return original;
}
const read = path => atR34(path, readFile(path));
const raw = read('tests/fixtures/r34-source-delta.json');
function mutations(bytes) {
  const altered = Buffer.from(bytes); altered[Math.floor(altered.length / 2)] ^= 1;
  return [Buffer.alloc(0), altered, bytes.subarray(1), Buffer.concat([bytes, bytes]), Buffer.concat([bytes, Buffer.from('\n// unreviewed')])];
}

test('R34 integrated registry binds exact historical production and keeps every R33-era fixture untouched', () => {
  assert.equal(r34Source.schema, 1);
  assert.equal(r34Source.baseline, '1c60d533ee91db20ccde2a9ffb449b8c7b8d0fd8');
  assert.equal(r34Source.candidate, '5f5e7b3c5f22f73a82cd2c8d6ef2ea6c6955b269');
  assert.equal(Object.keys(r34Source.files).length, 14);
  assert.equal(Object.keys(r34Source.addedFiles).length, 7);
  assert.equal(Object.values(r34Source.files).reduce((n, d) => n + d.deltas.length, 0), 36);
  assert.deepEqual(r34Source.productAdditions, [
    'public/models/interiors/taihe-display-grid-6012719f9618.glb',
    'src/scene/palace/QianqingFrontageGrid.js', 'src/scene/palace/QianqingWarmRooms.js',
    'src/scene/palace/special/ChuxiuCourtyard.js', 'src/scene/palace/special/YikunSideAccess.js'
  ]);
  assert.deepEqual(validateR34SourceRegistry(raw), r34Source);
  assert.deepEqual(Object.keys(archive).sort(), [...successors.keys()].sort());
  for (const path of successors.keys()) {
    const bytes = readFile(path);
    for (const mutation of mutations(bytes)) assert.equal(atR34(path, mutation), mutation);
    for (const unknown of ['src/unknown.js', '__proto__', 'constructor']) assert.equal(atR34(unknown, bytes), bytes);
  }
  assert.ok(Object.isFrozen(r34Source));
  assert.ok(Object.isFrozen(r34Source.files));
  assert.ok(Object.isFrozen(r34Source.productAdditions));
  for (const [path, digest] of Object.entries(r34Source.preservedFixtures)) assert.equal(sha(read(path)), digest, path);
  assert.doesNotMatch(read('tests/lib/r34-source-retention.mjs').toString(), /child_process|execSync|execFile|fetch\(|git show|rev-parse/);
});

test('R34 integrated registry fails closed on corrupted identity, epoch, hunks, independent source, inventory and old-fixture bindings', () => {
  for (const bytes of mutations(raw)) assert.throws(() => validateR34SourceRegistry(bytes), /immutable R34 integrated/);
  const first = Object.keys(r34Source.files)[0], added = Object.keys(r34Source.addedFiles)[0];
  for (const mutate of [
    r => {r.baseline = '0'.repeat(40);}, r => {r.candidate = '0'.repeat(40);},
    r => {delete r.files[first];}, r => {r.files['src/unknown.js'] = r.files[first];},
    ...['baselineSHA256', 'candidateSHA256', 'baselineGitBlob', 'candidateGitBlob'].map(key => r => {r.files[first][key] = '0'.repeat(64);}),
    ...['baselineBytes', 'candidateBytes'].map(key => r => {r.files[first][key]++;}),
    r => {r.files[first].baselineUTF8 += '\n';}, r => {r.files[first].deltas.pop();},
    r => {r.files[first].deltas.push(r.files[first].deltas[0]);},
    r => {r.files[first].deltas[0].before = '';}, r => {r.files[first].deltas[0].after += '// changed';},
    r => {delete r.addedFiles[added];}, r => {r.addedFiles[added].candidateBytes++;},
    r => {r.productAdditions.push('src/unknown.js');}, r => {delete r.preservedFixtures['r33-source-delta.json']; r.preservedFixtures = {};}
  ]) {
    const changed = structuredClone(r34Source); mutate(changed);
    assert.throws(() => validateR34SourceRegistry(Buffer.from(JSON.stringify(changed, null, 2) + '\n')), /immutable R34 integrated/);
  }
});

for (const [path, delta] of Object.entries(r34Source.files)) test(`${path}: exact historical R34 identity restores independently frozen R33 bytes, rejects mutations, and does not modify input`, () => {
  const bytes = read(path), original = Buffer.from(bytes), text = bytes.toString();
  assert.equal(sha(bytes), delta.candidateSHA256);
  assert.equal(bytes.length, delta.candidateBytes);
  assert.equal(blob(bytes), delta.candidateGitBlob);
  const old = restorePreR34Source(path, bytes), independent = independentR33Source(path);
  assert.deepEqual(old, independent);
  assert.equal(sha(old), delta.baselineSHA256);
  assert.equal(blob(old), delta.baselineGitBlob);
  assert.equal(restorePreR34Source(path, old), old);
  assert.equal(restoreR34SourceIfPresent(path, old), old);
  assert.deepEqual(restoreR34SourceIfPresent(path, bytes), old);
  const bad = [...mutations(bytes), ...mutations(old)];
  for (const hunk of delta.deltas) {
    assert.ok(Object.isFrozen(hunk));
    assert.ok(hunk.before.length && hunk.after.length);
    assert.notEqual(hunk.before, hunk.after);
    assert.equal(text.split(hunk.after).length, 2);
    assert.equal(independent.toString().split(hunk.before).length, 2);
    for (const replacement of ['', hunk.before, hunk.after + hunk.after, hunk.after + '// changed']) bad.push(Buffer.from(text.replace(hunk.after, replacement)));
  }
  for (const mutation of bad) {
    if (sha(mutation) === delta.baselineSHA256) continue;
    assert.throws(() => restorePreR34Source(path, mutation), /exact R34 integrated source candidate/);
    assert.equal(restoreR34SourceIfPresent(path, mutation), mutation);
  }
  assert.deepEqual(bytes, original);
});

for (const [path, delta] of Object.entries(r34Source.addedFiles)) test(`${path}: exact historical added bytes and finite inventory reject missing, duplicated or changed data`, () => {
  const bytes = read(path);
  assert.equal(sha(bytes), delta.candidateSHA256);
  assert.equal(blob(bytes), delta.candidateGitBlob);
  assert.equal(assertR34AddedSource(path, bytes), bytes);
  assert.equal(restoreR34SourceIfPresent(path, bytes), bytes);
  assert.equal(restorePreR34Source(path, bytes), bytes);
  for (const mutation of mutations(bytes)) {
    assert.throws(() => assertR34AddedSource(path, mutation), /exact R34 added source/);
    assert.throws(() => verifiedR34AddedProductPaths(p => p === path ? mutation : read(p)), /exact R34 added source/);
  }
  assert.throws(() => verifiedR34AddedProductPaths(p => {if (p === path) throw new Error('missing exact addition'); return read(p);}), /missing exact addition/);
});

test('R34 inventory and dispatch allow no unregistered paths, prototype properties or broad filename exceptions', () => {
  assert.deepEqual(verifiedR34AddedProductPaths(read), r34Source.productAdditions);
  assert.equal(new Set(r34Source.productAdditions).size, r34Source.productAdditions.length);
  assert.deepEqual(r34Source.productAdditions, Object.keys(r34Source.addedFiles).filter(path => /^(src|data|public)\//.test(path)));
  const bytes = read(Object.keys(r34Source.files)[0]);
  for (const path of ['src/unknown.js', '__proto__', 'constructor', 'toString']) {
    assert.equal(restorePreR34Source(path, bytes), bytes);
    assert.equal(restoreR34SourceIfPresent(path, bytes), bytes);
    assert.throws(() => assertR34AddedSource(path, bytes), /registered R34 added source/);
    assert.throws(() => independentR33Source(path), /registered independent R33 source/);
  }
  for (const paths of [r34Source.productAdditions.slice(1), [...r34Source.productAdditions, r34Source.productAdditions[0]], [...r34Source.productAdditions, 'src/unknown.js']]) assert.throws(() => assert.deepEqual(paths, verifiedR34AddedProductPaths(read)));
});

test('later integrated fixes preserve only the exact original lighting checkpoint and never normalize unknown sources', async () => {
  const {restoreR34NightCheckpointIfPresent: checkpoint} = await import('../lib/r34-night-checkpoint-retention.mjs');
  const {r34NightSource, restorePreR34NightSource} = await import('../lib/r34-night-source-retention.mjs');
  for (const [path, delta] of Object.entries(r34NightSource.files)) {
    const bytes = read(path), original = Buffer.from(bytes), frozen = checkpoint(path, bytes);
    assert.equal(sha(frozen), delta.candidateSHA256);
    assert.deepEqual(restorePreR34NightSource(path, frozen), independentR33Source(path));
    for (const mutation of mutations(bytes)) assert.equal(checkpoint(path, mutation), mutation);
    assert.deepEqual(bytes, original);
  }
  for (const path of ['src/unknown.js','__proto__','constructor']) {
    const bytes = read('src/scene/Environment.js'); assert.equal(checkpoint(path,bytes),bytes);
  }
});


test('R34 added fine asset inventory also requires its exact current config-to-binary binding', () => {
  const path = 'data/interiors/taihe.json';
  for (const mutation of mutations(read(path))) assert.throws(() => verifiedR34AddedProductPaths(p => p === path ? mutation : read(p)), /exact R34 asset-binding config/);
  assert.throws(() => verifiedR34AddedProductPaths(p => {if (p === path) throw new Error('missing config'); return read(p);}), /missing config/);
  for (const mutate of [c=>{c.model='/models/interiors/unknown.glb';},c=>{c.asset.sha256='0'.repeat(64);},c=>{c.asset.encodedBytes++;}]) {
    const config=JSON.parse(read(path));mutate(config);
    assert.throws(() => verifiedR34AddedProductPaths(p => p === path ? Buffer.from(JSON.stringify(config)) : read(p)), /exact R34 asset-binding config/);
  }
});
