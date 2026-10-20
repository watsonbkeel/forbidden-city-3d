import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {r34Source, validateR34SourceRegistry, restorePreR34Source, restoreR34SourceIfPresent,
  assertR34AddedSource, independentR33Source} from '../lib/r34-source-retention.mjs';
import {verifiedR34AddedProductPaths} from '../lib/r34-product-inventory.mjs';
const read = path => fs.readFileSync(new URL('../../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
const raw = read('tests/fixtures/r34-source-delta.json');
function mutations(bytes) {
  const altered = Buffer.from(bytes); altered[Math.floor(altered.length / 2)] ^= 1;
  return [Buffer.alloc(0), altered, bytes.subarray(1), Buffer.concat([bytes, bytes]), Buffer.concat([bytes, Buffer.from('\n// unreviewed')])];
}

test('R34 integrated registry binds exact raw production and keeps every R33-era fixture untouched', () => {
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

for (const [path, delta] of Object.entries(r34Source.files)) test(`${path}: exact raw R34 identity restores independently frozen R33 bytes, rejects mutations, and does not modify input`, () => {
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

for (const [path, delta] of Object.entries(r34Source.addedFiles)) test(`${path}: exact raw added bytes and finite inventory reject missing, duplicated or changed data`, () => {
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
  assert.deepEqual(verifiedR34AddedProductPaths(), r34Source.productAdditions);
  assert.equal(new Set(r34Source.productAdditions).size, r34Source.productAdditions.length);
  assert.deepEqual(r34Source.productAdditions, Object.keys(r34Source.addedFiles).filter(path => /^(src|data|public)\//.test(path)));
  const bytes = read(Object.keys(r34Source.files)[0]);
  for (const path of ['src/unknown.js', '__proto__', 'constructor', 'toString']) {
    assert.equal(restorePreR34Source(path, bytes), bytes);
    assert.equal(restoreR34SourceIfPresent(path, bytes), bytes);
    assert.throws(() => assertR34AddedSource(path, bytes), /registered R34 added source/);
    assert.throws(() => independentR33Source(path), /registered independent R33 source/);
  }
  for (const paths of [r34Source.productAdditions.slice(1), [...r34Source.productAdditions, r34Source.productAdditions[0]], [...r34Source.productAdditions, 'src/unknown.js']]) assert.throws(() => assert.deepEqual(paths, verifiedR34AddedProductPaths()));
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
