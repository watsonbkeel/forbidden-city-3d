import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {restoreR32FollowthroughSourceIfPresent} from '../lib/r32-followthrough-source-retention.mjs';
import {restoreR32ScreenSourceIfPresent} from '../lib/r32-screen-source-retention.mjs';
import {restoreR32FriezeSourceIfPresent} from '../lib/r32-frieze-source-retention.mjs';
import {restoreR32CrestSourceIfPresent} from '../lib/r32-crest-source-retention.mjs';

const root = new URL('../../', import.meta.url);
const helper = new URL('../lib/r32-source-retention.mjs', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const fixturePath = 'tests/fixtures/r32-source-delta.json';
const fixture = JSON.parse(read(fixturePath));

// These are historical source guards, not acceptance tests for current R32
// geometry, collision, lifecycle or UI behavior. Those use the actual product.
test('R32 historical source adapter and immutable exact registry are required', async () => {
  assert.ok(fs.existsSync(helper), 'strict R32 source helper is required');
  const {r32Source, validateR32SourceRegistry} = await import(helper);
  assert.deepEqual(r32Source, fixture);
  assert.equal(r32Source.schema, 1);
  assert.equal(r32Source.baseline, 'c02ee53be5b0d6c6ced0837f7b76eabc008a7cd2');
  assert.equal(r32Source.candidate, 'ade4334905cf27a3ae9daa2da862fc8cb4d3496b');
  assert.equal(Object.keys(r32Source.files).length, 24);
  assert.equal(Object.keys(r32Source.addedFiles).length, 12);
  assert.equal(Object.values(r32Source.files).reduce((n, d) => n + d.deltas.length, 0), 65);
  for (const path of ['main.js', 'style.css', 'src/ui/PlaceInfoPanel.js', 'src/scene/zones/ZoneBase.js',
    'data/zones/east-six.json', 'data/zones/ningshou.json', 'data/zones/west-six.json']) {
    assert.ok(Object.hasOwn(r32Source.files, path), 'registered final R32 source/config change: ' + path);
  }
  for (const path of ['src/ui/HelpPanel.js', 'src/ui/ModelFidelity.js',
    'src/scene/palace/special/YanxiStorehouses.js', 'src/scene/palace/QianqingDisplay.js',
    'src/scene/palace/special/YanxiRuinLOD.js']) {
    assert.ok(Object.hasOwn(r32Source.addedFiles, path), 'registered final R32 added module: ' + path);
  }
  assert.equal(Object.keys(r32Source.preservedFixtures).length, 122);
  for (const [path, digest] of Object.entries(r32Source.preservedFixtures)) assert.equal(sha(read(path)), digest, path);
  assert.deepEqual(validateR32SourceRegistry(read(fixturePath)), fixture);
  for (const mutation of [Buffer.alloc(0), Buffer.concat([read(fixturePath), Buffer.from('\n')])]) {
    assert.throws(() => validateR32SourceRegistry(mutation), /immutable R32 source registry/);
  }
  for (const mutate of [
    r => {r.baseline = '0'.repeat(40);},
    r => {r.candidate = '0'.repeat(40);},
    r => {Object.values(r.files)[0].baselineSHA256 = '0'.repeat(64);},
    r => {Object.values(r.files)[0].candidateSHA256 = '0'.repeat(64);},
    r => {Object.values(r.files)[0].deltas.pop();},
    r => {Object.values(r.files)[0].deltas.push(Object.values(r.files)[0].deltas[0]);},
    r => {Object.values(r.files)[0].deltas[0].before += '// changed base';}
  ]) {
    const changed = structuredClone(fixture); mutate(changed);
    assert.throws(() => validateR32SourceRegistry(Buffer.from(JSON.stringify(changed, null, 2) + '\n')), /immutable R32 source registry/);
  }
  assert.ok(Object.isFrozen(r32Source));
  assert.ok(Object.isFrozen(Object.values(r32Source.files)[0].deltas[0]));
});

test('historical R27/R28 retained-driver guards bind all three exact R32 test-source deltas', async () => {
  const {assertR28RetainedSource} = await import('../lib/r28-jiaotai-central-retention.mjs');
  const {assertR29RetainedSource} = await import('../lib/r29-qianqing-retention.mjs');
  for (const path of ['tests/lib/auto-routes.mjs', 'tests/lib/world.mjs', 'tests/stepwalk.cjs']) {
    const delta = fixture.files[path];
    assert.ok(delta, 'registered R32 historical-driver source: ' + path);
    const bytes = read(path);
    for (const retained of [assertR28RetainedSource, assertR29RetainedSource]) {
      const old = retained(path, bytes);
      assert.equal(sha(old), delta.baselineSHA256, path);
      assert.equal(retained(path, old), old, 'historical driver is never double-restored');
      assert.throws(() => retained(path, Buffer.concat([bytes, Buffer.from('\n// unknown driver edit')])), /exact retained R2[78] dependency/);
      for (const hunk of delta.deltas) {
        for (const replacement of ['', hunk.after + hunk.after, hunk.after + '// unknown hunk\n']) {
          assert.throws(() => retained(path, Buffer.from(bytes.toString().replace(hunk.after, replacement))), /exact retained R2[78] dependency/);
        }
      }
    }
  }
});

for (const [path, delta] of Object.entries(fixture.files)) {
  test(`${path}: exact frozen R32 bytes restore exact R31 bytes; all other bytes fail closed`, async () => {
    assert.ok(fs.existsSync(helper), 'strict R32 source helper is required');
    const {restorePreR32Source: restore, restoreR32SourceIfPresent: conditional} = await import(helper);
    const bytes = restoreR32FollowthroughSourceIfPresent(path, restoreR32ScreenSourceIfPresent(path, restoreR32FriezeSourceIfPresent(path, restoreR32CrestSourceIfPresent(path, read(path))))), text = bytes.toString();
    assert.equal(sha(bytes), delta.candidateSHA256);
    assert.equal(bytes.length, delta.candidateBytes);
    const old = restore(path, bytes);
    assert.equal(sha(old), delta.baselineSHA256);
    assert.equal(old.length, delta.baselineBytes);
    assert.equal(restore(path, old), old, 'baseline is never double-restored');
    assert.equal(conditional(path, old), old);
    assert.deepEqual(conditional(path, bytes), old);
    const altered = Buffer.from(bytes); altered[Math.floor(altered.length / 2)] ^= 1;
    const wrongBase = Buffer.concat([old, Buffer.from('\n// wrong R31 base')]);
    const bad = [Buffer.alloc(0), altered, wrongBase, Buffer.concat([bytes, Buffer.from('\n// unrelated')])];
    for (const hunk of delta.deltas) {
      assert.ok(hunk.before.length && hunk.after.length);
      assert.notEqual(hunk.before, hunk.after);
      assert.equal(text.split(hunk.after).length, 2, 'candidate hunk is unique');
      assert.equal(old.toString().split(hunk.before).length, 2, 'baseline hunk is unique');
      for (const replacement of ['', hunk.before, hunk.after + hunk.after, hunk.after + '// modified\n']) {
        bad.push(Buffer.from(text.replace(hunk.after, replacement)));
      }
    }
    for (const mutation of bad) {
      // A whole-file single hunk can intentionally restore the exact baseline.
      if (sha(mutation) === delta.baselineSHA256) continue;
      assert.throws(() => restore(path, mutation), /exact R32 source candidate/);
      assert.equal(conditional(path, mutation), mutation, 'unknown bytes are passed unchanged to older strict guards');
    }
  });
}

for (const [path, delta] of Object.entries(fixture.addedFiles)) {
  test(`${path}: added R32 source has a complete fixed identity`, async () => {
    assert.ok(fs.existsSync(helper), 'strict R32 source helper is required');
    const {assertR32AddedSource} = await import(helper);
    const bytes = restoreR32FollowthroughSourceIfPresent(path, restoreR32FriezeSourceIfPresent(path, restoreR32CrestSourceIfPresent(path, read(path))));
    assert.equal(bytes.length, delta.candidateBytes);
    assert.equal(assertR32AddedSource(path, bytes), bytes);
    const altered = Buffer.from(bytes); altered[Math.floor(altered.length / 2)] ^= 1;
    for (const mutation of [Buffer.alloc(0), altered, Buffer.concat([bytes, Buffer.from('\n')])]) {
      assert.throws(() => assertR32AddedSource(path, mutation), /exact R32 added source/);
    }
  });
}

test('unknown paths receive no R32 restoration and cannot masquerade as added sources', async () => {
  assert.ok(fs.existsSync(helper), 'strict R32 source helper is required');
  const {restorePreR32Source, restoreR32SourceIfPresent, assertR32AddedSource} = await import(helper);
  const bytes = Buffer.from('unknown source');
  assert.equal(restorePreR32Source('src/unknown.js', bytes), bytes);
  assert.equal(restoreR32SourceIfPresent('src/unknown.js', bytes), bytes);
  assert.throws(() => assertR32AddedSource('src/unknown.js', bytes), /registered R32 added source/);
});

test('older source guard entry chains consume R32 only through exact full-byte dispatch', async () => {
  assert.ok(fs.existsSync(helper), 'strict R32 source helper is required');
  const {restorePreR32Source} = await import(helper);
  const {restoreR31CombinedSourceIfPresent} = await import('../lib/r31-combined-source-retention.mjs');
  const {restoreR31SourceIfPresent} = await import('../lib/r31-flight-operations-retention.mjs');
  const {restorePreR15Source} = await import('../lib/r15-flight-source-retention.mjs');
  for (const path of Object.keys(fixture.files)) {
    const bytes = read(path), old = restorePreR32Source(path, bytes);
    assert.deepEqual(restoreR31CombinedSourceIfPresent(path, bytes), restoreR31CombinedSourceIfPresent(path, old), path);
    assert.deepEqual(restoreR31SourceIfPresent(path, bytes), restoreR31SourceIfPresent(path, old), path);
    assert.deepEqual(restorePreR15Source(path, bytes), restorePreR15Source(path, old), path);
  }
});

test('later product inventory lists only independently bound R31 and R32 additions', async () => {
  const {verifiedR31AddedProductPaths, verifiedR32AddedProductPaths} = await import('../lib/r32-product-inventory.mjs');
  assert.deepEqual(verifiedR31AddedProductPaths(), [
    'data/architecture/qianqing-material.json',
    'public/models/interiors/qianqing-r31.glb',
    'src/scene/palace/QianqingSurface.js'
  ]);
  assert.deepEqual(verifiedR32AddedProductPaths(), [
    'data/architecture/qianqing-display-geometry.json',
    'src/scene/palace/QianqingCeiling.js',
    'src/scene/palace/QianqingDisplay.js',
    'src/scene/palace/special/HuangjiGate.js',
    'src/scene/palace/special/InnerJinshui.js',
    'src/scene/palace/special/YanxiRuin.js',
    'src/scene/palace/special/YanxiRuinLOD.js',
    'src/scene/palace/special/YanxiStorehouses.js',
    'src/ui/HelpPanel.js',
    'src/ui/ModelFidelity.js',
    'public/models/interiors/qianqing-r32.glb',
    'public/textures/art/qianqing-ceiling-illustration-r32.webp',
    'src/scene/palace/QianqingCeilingPaint.js',
    'public/textures/art/qianqing-screen-illustration-r32.webp',
    'src/scene/palace/QianqingScreenPaint.js',
    'public/textures/art/qianqing-five-dragon-illustration-r32.webp',
    'src/scene/palace/QianqingFriezePaint.js',
    'src/scene/palace/QianqingScreenCrest.js'
  ]);
});

test('later product inventory rejects every missing, duplicated, appended or mutated source/asset and wrong GLB binding', async () => {
  const {verifiedR31AddedProductPaths, verifiedR32AddedProductPaths} = await import('../lib/r32-product-inventory.mjs');
  const {r31CombinedSource} = await import('../lib/r31-combined-source-retention.mjs');
  for (const [verify, paths] of [
    [verifiedR31AddedProductPaths, Object.keys(r31CombinedSource.addedFiles)],
    [verifiedR32AddedProductPaths, [...Object.keys(fixture.addedFiles), 'data/interiors/qianqing.json', 'public/models/interiors/qianqing-r32.glb']]
  ]) for (const path of paths) {
    const bytes = read(path), changed = Buffer.from(bytes); changed[Math.floor(changed.length / 2)] ^= 1;
    for (const bad of [Buffer.alloc(0), Buffer.concat([bytes, bytes]), Buffer.concat([bytes, Buffer.from('\n')]), changed]) {
      assert.throws(() => verify(p => p === path ? bad : read(p)), path);
    }
  }
  const wrongConfig = JSON.parse(read('data/interiors/qianqing.json'));
  wrongConfig.model = '/models/interiors/qianqing-r31.glb';
  assert.throws(() => verifiedR32AddedProductPaths(p => p === 'data/interiors/qianqing.json' ? Buffer.from(JSON.stringify(wrongConfig)) : read(p)), /exact R32 asset-binding config/);
});
