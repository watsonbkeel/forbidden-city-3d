import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const root = new URL('../../', import.meta.url);
const helper = new URL('../lib/r32-frieze-source-retention.mjs', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const fixturePath = 'tests/fixtures/r32-frieze-source-delta.json';
const fixture = JSON.parse(read(fixturePath));
async function load() {
  assert.ok(fs.existsSync(helper), 'exact frozen R32 frieze source helper is required');
  return import(helper);
}

// Source/inventory assertions only. No scene, world, browser, route or runtime
// adapter is loaded here. Current behavior is tested on the real product.
test('frieze registry binds only d5e1 source/additions against 898b4e6 and preserves every old fixture', async () => {
  const {r32FriezeSource: registry, validateR32FriezeSourceRegistry: validate} = await load();
  assert.deepEqual(registry, fixture);
  assert.equal(registry.schema, 1);
  assert.equal(registry.baseline, '898b4e6ac29150ab898521cc0112dc638202a393');
  assert.equal(registry.candidate, 'd5e1ef0454185d69a29fdb0804ff8753189657a0');
  assert.deepEqual(Object.keys(registry.files), ['src/scene/palace/QianqingCentralArt.js', 'src/ui/ModelFidelity.js']);
  assert.deepEqual(Object.values(registry.files).map(d => d.deltas.length), [2, 1]);
  assert.deepEqual(Object.keys(registry.addedFiles), [
    'assets-src/qianqing-frieze-paint/CORRECTION-PROMPT.txt',
    'assets-src/qianqing-frieze-paint/PROMPT.txt',
    'assets-src/qianqing-frieze-paint/README.md',
    'assets-src/qianqing-frieze-paint/generated-original-r32.png',
    'public/textures/art/qianqing-five-dragon-illustration-r32.webp',
    'src/scene/palace/QianqingFriezePaint.js'
  ]);
  assert.deepEqual(registry.productAdditions, [
    'public/textures/art/qianqing-five-dragon-illustration-r32.webp',
    'src/scene/palace/QianqingFriezePaint.js'
  ]);
  assert.equal(Object.keys(registry.preservedFixtures).length, 130);
  assert.equal(registry.preservedFixtures['tests/fixtures/r32-source-delta.json'], '233e700c22d2fc2bc1db1049ab9b8aca98ae88bea0a0596ab282dbf70e4013aa');
  for (const [name, digest] of Object.entries(registry.preservedFixtures)) assert.equal(sha(read(name)), digest, name);
  assert.deepEqual(validate(read(fixturePath)), registry);
  for (const bytes of [Buffer.alloc(0), Buffer.concat([read(fixturePath), Buffer.from('\n')])]) {
    assert.throws(() => validate(bytes), /immutable R32 frieze source registry/);
  }
  for (const mutate of [
    r => {r.baseline = '0'.repeat(40);},
    r => {r.candidate = '0'.repeat(40);},
    r => {Object.values(r.files)[0].candidateSHA256 = '0'.repeat(64);},
    r => {Object.values(r.files)[0].baselineSHA256 = '0'.repeat(64);},
    r => {Object.values(r.files)[0].candidateBytes++;},
    r => {Object.values(r.files)[0].deltas.pop();},
    r => {Object.values(r.files)[0].deltas.push(Object.values(r.files)[0].deltas[0]);},
    r => {Object.values(r.files)[0].deltas[0].before += '// altered';},
    r => {Object.values(r.files)[0].deltas[0].after += '// altered';},
    r => {delete r.addedFiles['src/scene/palace/QianqingFriezePaint.js'];},
    r => {r.productAdditions.push('src/unknown.js');},
    r => {delete r.preservedFixtures['tests/fixtures/r32-source-delta.json'];}
  ]) {
    const changed = structuredClone(fixture); mutate(changed);
    assert.throws(() => validate(Buffer.from(JSON.stringify(changed, null, 2) + '\n')), /immutable R32 frieze source registry/);
  }
  assert.ok(Object.isFrozen(registry));
  assert.ok(Object.isFrozen(Object.values(registry.files)[0].deltas[0]));
  assert.ok(Object.isFrozen(registry.productAdditions));
  assert.doesNotMatch(fs.readFileSync(helper, 'utf8'), /child_process|execSync|execFile|fetch\(|rev-parse|git show/);
});

for (const [name, delta] of Object.entries(fixture.files)) {
  test(`${name}: frieze reverses only exact full bytes and three unique review hunks`, async () => {
    const {restorePreR32FriezeSource: restore, restoreR32FriezeSourceIfPresent: conditional} = await load();
    const {restorePreR32Source, restoreR32SourceIfPresent, assertR32AddedSource, r32Source} = await import('../lib/r32-source-retention.mjs');
    const {restoreR31CombinedSourceIfPresent} = await import('../lib/r31-combined-source-retention.mjs');
    const {restoreR31SourceIfPresent} = await import('../lib/r31-flight-operations-retention.mjs');
    const {restorePreR15Source} = await import('../lib/r15-flight-source-retention.mjs');
    const bytes = read(name), original = Buffer.from(bytes), text = bytes.toString('utf8');
    assert.equal(sha(bytes), delta.candidateSHA256);
    assert.equal(bytes.length, delta.candidateBytes);
    const old = restore(name, bytes);
    assert.equal(sha(old), delta.baselineSHA256);
    assert.equal(old.length, delta.baselineBytes);
    const {r32ScreenSource} = await import('../lib/r32-screen-source-retention.mjs');
    assert.equal(delta.baselineSHA256, (r32ScreenSource.files[name] ?? r32Source.addedFiles[name]).candidateSHA256);
    assert.equal(restore(name, old), old, 'exact baseline is never double-restored');
    assert.equal(conditional(name, old), old);
    assert.deepEqual(conditional(name, bytes), old);
    for (const chain of [restorePreR32Source, restoreR32SourceIfPresent, restoreR31CombinedSourceIfPresent, restoreR31SourceIfPresent, restorePreR15Source]) {
      assert.deepEqual(chain(name, bytes), chain(name, old), 'existing strict entry chain: ' + name);
    }
    if (Object.hasOwn(r32Source.addedFiles, name)) assert.equal(assertR32AddedSource(name, bytes), bytes);
    const altered = Buffer.from(bytes); altered[Math.floor(altered.length / 2)] ^= 1;
    const bad = [Buffer.alloc(0), altered, Buffer.concat([bytes, bytes]), Buffer.concat([bytes, Buffer.from('\n// extra')]), Buffer.concat([old, Buffer.from('\n// wrong base')])];
    for (const hunk of delta.deltas) {
      assert.ok(hunk.before.length && hunk.after.length);
      assert.notEqual(hunk.before, hunk.after);
      assert.equal(text.split(hunk.after).length, 2, 'unique frozen candidate hunk');
      assert.equal(old.toString().split(hunk.before).length, 2, 'unique frozen baseline hunk');
      for (const replacement of ['', hunk.before, hunk.after + hunk.after, hunk.after + '// altered hunk\n']) {
        bad.push(Buffer.from(text.replace(hunk.after, replacement)));
      }
    }
    for (const mutation of bad) {
      // The one-hunk disclosure change can reverse to the exact baseline.
      if (sha(mutation) === delta.baselineSHA256) { assert.equal(restore(name, mutation), mutation); continue; }
      assert.throws(() => restore(name, mutation), /exact R32 frieze source candidate/);
      assert.equal(conditional(name, mutation), mutation, 'unknown full bytes are never transformed');
      assert.equal(restoreR32SourceIfPresent(name, mutation), mutation, 'older conditional dispatch remains closed');
      if (Object.hasOwn(r32Source.files, name)) {
        assert.throws(() => restorePreR32Source(name, mutation), /exact R32 source candidate/);
      } else {
        assert.throws(() => assertR32AddedSource(name, mutation), /exact R32 added source/);
      }
    }
    assert.deepEqual(bytes, original, 'source buffers are never overwritten');
  });
}

for (const [name, delta] of Object.entries(fixture.addedFiles)) {
  test(`${name}: frieze added source/asset has one exact identity`, async () => {
    const {assertR32FriezeAddedSource: check} = await load();
    const {verifiedR32AddedProductPaths, verifiedR32FriezeAddedProductPaths} = await import('../lib/r32-product-inventory.mjs');
    const bytes = read(name), altered = Buffer.from(bytes); altered[Math.floor(altered.length / 2)] ^= 1;
    assert.equal(bytes.length, delta.candidateBytes);
    assert.equal(check(name, bytes), bytes);
    for (const bad of [Buffer.alloc(0), altered, bytes.subarray(1), Buffer.concat([bytes, bytes]), Buffer.concat([bytes, Buffer.from('\n')])]) {
      assert.throws(() => check(name, bad), /exact R32 frieze added source/);
      for (const verify of [verifiedR32FriezeAddedProductPaths, verifiedR32AddedProductPaths]) {
        assert.throws(() => verify(p => p === name ? bad : read(p)), /exact R32 frieze added source/);
      }
    }
    for (const verify of [verifiedR32FriezeAddedProductPaths, verifiedR32AddedProductPaths]) {
      assert.throws(() => verify(p => {if (p === name) throw new Error('missing frozen file: ' + p); return read(p);}), /missing frozen file/);
    }
  });
}

test('unregistered paths and changed epochs cannot acquire a frieze exception', async () => {
  const {restorePreR32FriezeSource: restore, restoreR32FriezeSourceIfPresent: conditional, assertR32FriezeAddedSource: added} = await load();
  const bytes = read('src/scene/palace/QianqingCentralArt.js');
  for (const name of ['src/unknown.js', 'src/ui/Minimap-copy.js', 'src/scene/palace/QianqingFriezePaint-copy.js', 'public/textures/art/unknown.webp']) {
    assert.equal(restore(name, bytes), bytes);
    assert.equal(conditional(name, bytes), bytes);
    assert.throws(() => added(name, bytes), /registered R32 frieze added source/);
  }
  // Existing R32 restoration is a separate epoch; the new strict adapter
  // accepts only 898b4e6/d5e1 identities, never a broad historical whitelist.
  const {restorePreR32Source} = await import('../lib/r32-source-retention.mjs');
  const r31 = restorePreR32Source('src/scene/palace/QianqingCentralArt.js', restore('src/scene/palace/QianqingCentralArt.js', bytes));
  assert.throws(() => restore('src/scene/palace/QianqingCentralArt.js', r31), /exact R32 frieze source candidate/);
  assert.equal(conditional('src/scene/palace/QianqingCentralArt.js', r31), r31);
});

test('existing product inventory includes exactly the two bound frieze product additions', async () => {
  await load();
  const {verifiedR32AddedProductPaths, verifiedR32FriezeAddedProductPaths} = await import('../lib/r32-product-inventory.mjs');
  assert.deepEqual(verifiedR32FriezeAddedProductPaths(), fixture.productAdditions);
  const all = verifiedR32AddedProductPaths();
  assert.deepEqual(all.slice(-3), [...fixture.productAdditions, 'src/scene/palace/QianqingScreenCrest.js']);
  assert.equal(all.length, new Set(all).size, 'no duplicated inventory entries');
  assert.ok(all.every(p => /^(src|data|public)\//.test(p)), 'provenance is bound but not a runtime inventory path');
});

