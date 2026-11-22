import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {restoreR32SourceIfPresent} from '../lib/r32-source-retention.mjs';
import {readR32PaintInventory} from '../lib/r32-paint-source-inputs.mjs';
import {r31CombinedSource} from '../lib/r31-combined-source-retention.mjs';
import {restoreR31SourceIfPresent} from '../lib/r31-flight-operations-retention.mjs';
import {restorePreR30Source, r30Source} from '../lib/r30-qianqing-passage-retention.mjs';
import {restorePreR15Source} from '../lib/r15-flight-source-retention.mjs';
import {restoreR6PlaceCatalog, restoreR6PlaceSource, baseline as r6} from '../lib/r6-place-retention.mjs';
const root = new URL('../../', import.meta.url);
const readRaw = path => fs.readFileSync(new URL(path, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const sourceBytes = gunzipSync(readRaw('tests/fixtures/r31-combined-replay.json.gz'), {maxOutputLength:16_000});
assert.equal(sha(sourceBytes), '4284732f3a8160c44b19e44e6e205f2ffd66d4ccac7adc78a90feb8104afe5c2', 'immutable R31 combined replay inputs');
const replay = JSON.parse(sourceBytes);
const r32Bytes = gunzipSync(readRaw('tests/fixtures/r32-base-source-inputs.json.gz'), {maxOutputLength:800_000});
assert.equal(sha(r32Bytes), '3c6e803545e73bb53011cc6944d00a71f7e4678c2bf6af870b7e0fa316bd5dcf', 'immutable R32 bridge inputs');
const r32Inputs = JSON.parse(r32Bytes);
// Authenticate R31 candidates against their independently published Git
// blobs. Reuse existing exact R32 inputs where possible; unknown successor
// edits go to the old exact guards unchanged, never to a fixture fallback.
function checkpoint(path, raw) {
  if (!Object.hasOwn(replay.files, path) || sha(raw) !== replay.files[path].currentSHA256) return raw;
  const row = replay.files[path];
  let bytes;
  if (row.input === 'original') bytes = Buffer.from(row.utf8, 'utf8');
  else if (row.input === 'paint') bytes = restoreR32SourceIfPresent(path, readR32PaintInventory(path));
  else {
    assert.equal(row.input, 'r32');
    assert.equal(r32Inputs[path].currentSHA256, row.currentSHA256, 'same successor as R32 replay');
    bytes = restoreR32SourceIfPresent(path, Buffer.from(r32Inputs[path].utf8, 'utf8'));
  }
  assert.equal(bytes.length, row.candidateBytes, path);
  assert.equal(sha(bytes), r31CombinedSource.files[path].candidateSHA256, path);
  assert.equal(createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex'), row.candidateGitBlob, path);
  return bytes;
}
const read = path => restoreR32SourceIfPresent(path, checkpoint(path, readRaw(path)));
const helper = new URL('../lib/r31-combined-source-retention.mjs', import.meta.url);
const paths = [
  'assets-src/interiors/build_qianqing_auxiliary.py',
  'data/interiors/qianqing.json',
  'data/places/catalog.schema.json',
  'data/places/zh-CN.json',
  'src/scene/PalaceBuilder.js',
  'src/scene/interior/QianqingAuxiliaryContract.js',
  'src/scene/interior/QianqingAuxiliaryManifest.js',
  'src/scene/palace/special/InnerPalaceLevels.js',
  'src/ui/Minimap.js',
  'src/ui/PlaceCatalog.js'
];
const addedPaths = [
  'assets-src/interiors/qianqing_surface.py',
  'data/architecture/qianqing-material.json',
  'public/models/interiors/qianqing-r31.glb',
  'src/scene/palace/QianqingSurface.js'
];

test('R31 combines only the ten reviewed source changes and four added product files against 2be1751', async () => {
  assert.ok(fs.existsSync(helper), 'exact combined source retention helper is required');
  const {r31CombinedSource: registry, restorePreR31CombinedSource: restore, restoreR31CombinedSourceIfPresent: conditional, assertR31CombinedAddedSource: added} = await import(helper);
  assert.equal(registry.baseline, '2be17512d4bda20a80cb477e4ce7afc6836d8737');
  assert.equal(registry.candidate, 'e446ecd4d8c66f632c625381dc207ddf2a4f8523');
  assert.deepEqual(Object.keys(registry.files), paths);
  assert.equal(replay.publishedCommit, 'bdfcbd083b3bdf12b0151b99f7c0b30ce9dcb5a9');
  assert.equal(Object.keys(replay.files).length, 6);
  for (const path of Object.keys(replay.files)) {
    assert.ok(Object.hasOwn(registry.files, path), 'finite R31 replay path: ' + path);
    const raw = readRaw(path);
    const altered = Buffer.from(raw); altered[Math.floor(altered.length / 2)] ^= 1;
    assert.equal(checkpoint(path, altered), altered);
    for (const unknown of ['src/unknown.js', '__proto__', 'constructor']) assert.equal(checkpoint(unknown, raw), raw);
  }
  assert.equal(Object.values(registry.files).reduce((count, delta) => count + delta.deltas.length, 0), 28);
  assert.deepEqual(Object.keys(registry.addedFiles), addedPaths);
  assert.equal(Object.keys(registry.preservedFixtures).length, 120);
  for (const [path, digest] of Object.entries(registry.preservedFixtures)) assert.equal(sha(read(path)), digest, path);
  for (const [path, delta] of Object.entries(registry.files)) {
    const bytes = read(path), text = bytes.toString();
    assert.equal(sha(bytes), delta.candidateSHA256, path);
    assert.notEqual(delta.baselineSHA256, delta.candidateSHA256, path);
    assert.ok(delta.deltas.length > 0, path);
    const old = restore(path, bytes);
    assert.equal(sha(old), delta.baselineSHA256, path);
    assert.equal(restore(path, old), old, 'baseline remains byte-identical: ' + path);
    assert.equal(conditional(path, old), old, 'baseline is not double-restored: ' + path);
    assert.deepEqual(conditional(path, bytes), old, path);
    assert.deepEqual(restoreR31SourceIfPresent(path, bytes), old, 'existing source entry chain: ' + path);
    const altered = Buffer.from(bytes); altered[Math.floor(altered.length / 2)] ^= 1;
    const bad = [Buffer.alloc(0), Buffer.concat([bytes, Buffer.from('\n// unregistered source')]), altered];
    for (const hunk of delta.deltas) {
      assert.ok(hunk.before.length && hunk.after.length, path);
      assert.notEqual(hunk.before, hunk.after, path);
      assert.equal(text.split(hunk.after).length, 2, 'unique current hunk: ' + path);
      for (const replacement of ['', hunk.before, hunk.after + hunk.after, hunk.after + '// unknown hunk\n']) {
        bad.push(Buffer.from(text.replace(hunk.after, replacement)));
      }
    }
    for (const mutation of bad) {
      if (sha(mutation) === delta.baselineSHA256) continue;
      assert.throws(() => restore(path, mutation), /exact R31 combined source/, path);
      assert.equal(conditional(path, mutation), mutation, 'unknown bytes never receive restoration: ' + path);
    }
  }
  for (const path of addedPaths) {
    const bytes = read(path), altered = Buffer.from(bytes); altered[Math.floor(altered.length / 2)] ^= 1;
    assert.equal(added(path, bytes), bytes, path);
    for (const mutation of [Buffer.alloc(0), Buffer.concat([bytes, Buffer.from('\n')]), altered]) {
      assert.throws(() => added(path, mutation), /exact R31 added product/, path);
    }
  }
  const unknown = Buffer.from('unregistered');
  assert.equal(restore('src/unknown.js', unknown), unknown);
  assert.equal(conditional('src/unknown.js', unknown), unknown);
  assert.throws(() => added('src/unknown.js', unknown), /registered R31 added product/);
});

test('R31 restores exact R30 PalaceBuilder before the untouched older source chain', async () => {
  assert.ok(fs.existsSync(helper), 'exact combined source retention helper is required');
  const {r31CombinedSource: registry, restorePreR31CombinedSource: restore} = await import(helper);
  const path = 'src/scene/PalaceBuilder.js', bytes = read(path), old = restore(path, bytes);
  assert.equal(registry.files[path].baselineSHA256, r30Source.files[path].candidateSHA256);
  assert.deepEqual(restorePreR30Source(path, bytes), restorePreR30Source(path, old));
});

test('R31 aliases retain exact older R6 catalog and source contracts without changing old fixtures', async () => {
  assert.ok(fs.existsSync(helper), 'exact combined source retention helper is required');
  const {restorePreR31CombinedSource: restore} = await import(helper);
  const path = 'data/places/zh-CN.json', bytes = read(path);
  assert.deepEqual(restoreR6PlaceCatalog(bytes.toString()), restoreR6PlaceCatalog(restore(path, bytes).toString()));
  for (const path of ['src/ui/Minimap.js', 'src/ui/PlaceCatalog.js', 'data/places/catalog.schema.json']) {
    const bytes = read(path), old = restore(path, bytes);
    const currentChain = restorePreR15Source(path, bytes).toString();
    const olderChain = restorePreR15Source(path, old).toString();
    assert.equal(sha(restoreR6PlaceSource(path, currentChain)), r6.baseFiles[path]);
    assert.equal(restoreR6PlaceSource(path, currentChain), restoreR6PlaceSource(path, olderChain));
    if (path !== 'src/ui/Minimap.js') assert.equal(restoreR6PlaceSource(path, bytes.toString()), restoreR6PlaceSource(path, old.toString()));
  }
});
