import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const root = new URL('../../', import.meta.url);
const helper = new URL('../lib/r32-followthrough-source-retention.mjs', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const fixturePath = 'tests/fixtures/r32-followthrough-source-delta.json';
const fixture = JSON.parse(read(fixturePath));
async function load() {
  assert.ok(fs.existsSync(helper), 'exact frozen R32 follow-through source helper is required');
  return import(helper);
}

// Source/inventory assertions only. No scene, world, browser, route or runtime
// adapter is loaded here. Current behavior is tested on the real product.
test('follow-through registry binds only 8542 source/additions against 86a751 and preserves every old fixture', async () => {
  const {r32FollowthroughSource: registry, validateR32FollowthroughSourceRegistry: validate} = await load();
  assert.deepEqual(registry, fixture);
  assert.equal(registry.schema, 1);
  assert.equal(registry.baseline, '86a751056d9062299999c10cbfb0e2b58f0594a4');
  assert.equal(registry.candidate, '8542af2fd4d0f216cc781892f975037948767cc5');
  assert.deepEqual(Object.keys(registry.files), ['src/scene/palace/QianqingCeiling.js', 'src/ui/Minimap.js']);
  assert.deepEqual(Object.values(registry.files).map(d => d.deltas.length), [2, 5]);
  assert.deepEqual(Object.keys(registry.addedFiles), [
    'assets-src/qianqing-ceiling-paint/PROMPT.txt',
    'assets-src/qianqing-ceiling-paint/README.md',
    'assets-src/qianqing-ceiling-paint/generated-original-r32.png',
    'public/textures/art/qianqing-ceiling-illustration-r32.webp',
    'src/scene/palace/QianqingCeilingPaint.js'
  ]);
  assert.deepEqual(registry.productAdditions, [
    'public/textures/art/qianqing-ceiling-illustration-r32.webp',
    'src/scene/palace/QianqingCeilingPaint.js'
  ]);
  assert.equal(Object.keys(registry.preservedFixtures).length, 126);
  assert.equal(registry.preservedFixtures['tests/fixtures/r32-source-delta.json'], '233e700c22d2fc2bc1db1049ab9b8aca98ae88bea0a0596ab282dbf70e4013aa');
  for (const [name, digest] of Object.entries(registry.preservedFixtures)) assert.equal(sha(read(name)), digest, name);
  assert.deepEqual(validate(read(fixturePath)), registry);
  for (const bytes of [Buffer.alloc(0), Buffer.concat([read(fixturePath), Buffer.from('\n')])]) {
    assert.throws(() => validate(bytes), /immutable R32 follow-through source registry/);
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
    r => {delete r.addedFiles['src/scene/palace/QianqingCeilingPaint.js'];},
    r => {r.productAdditions.push('src/unknown.js');},
    r => {delete r.preservedFixtures['tests/fixtures/r32-source-delta.json'];}
  ]) {
    const changed = structuredClone(fixture); mutate(changed);
    assert.throws(() => validate(Buffer.from(JSON.stringify(changed, null, 2) + '\n')), /immutable R32 follow-through source registry/);
  }
  assert.ok(Object.isFrozen(registry));
  assert.ok(Object.isFrozen(Object.values(registry.files)[0].deltas[0]));
  assert.ok(Object.isFrozen(registry.productAdditions));
  assert.doesNotMatch(fs.readFileSync(helper, 'utf8'), /child_process|execSync|execFile|fetch\(|rev-parse|git show/);
});

for (const [name, delta] of Object.entries(fixture.files)) {
  test(`${name}: follow-through reverses only exact full bytes and seven unique review hunks`, async () => {
    const {restorePreR32FollowthroughSource: restore, restoreR32FollowthroughSourceIfPresent: conditional} = await load();
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
    assert.equal(delta.baselineSHA256, (r32Source.files[name] ?? r32Source.addedFiles[name]).candidateSHA256);
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
      assert.notEqual(sha(mutation), delta.baselineSHA256, 'partial restoration is not the baseline');
      assert.throws(() => restore(name, mutation), /exact R32 follow-through source candidate/);
      assert.equal(conditional(name, mutation), mutation, 'unknown full bytes are never transformed');
      assert.equal(restoreR32SourceIfPresent(name, mutation), mutation, 'older conditional dispatch remains closed');
      if (Object.hasOwn(r32Source.files, name)) {
        assert.throws(() => restorePreR32Source(name, mutation), /exact R32 source candidate/);
        assert.throws(() => restorePreR15Source(name, mutation), /Unreviewed R15 source bytes/);
      } else {
        assert.throws(() => assertR32AddedSource(name, mutation), /exact R32 added source/);
      }
    }
    assert.deepEqual(bytes, original, 'source buffers are never overwritten');
  });
}

for (const [name, delta] of Object.entries(fixture.addedFiles)) {
  test(`${name}: follow-through added source/asset has one exact identity`, async () => {
    const {assertR32FollowthroughAddedSource: check} = await load();
    const {verifiedR32AddedProductPaths, verifiedR32FollowthroughAddedProductPaths} = await import('../lib/r32-product-inventory.mjs');
    const bytes = read(name), altered = Buffer.from(bytes); altered[Math.floor(altered.length / 2)] ^= 1;
    assert.equal(bytes.length, delta.candidateBytes);
    assert.equal(check(name, bytes), bytes);
    for (const bad of [Buffer.alloc(0), altered, bytes.subarray(1), Buffer.concat([bytes, bytes]), Buffer.concat([bytes, Buffer.from('\n')])]) {
      assert.throws(() => check(name, bad), /exact R32 follow-through added source/);
      for (const verify of [verifiedR32FollowthroughAddedProductPaths, verifiedR32AddedProductPaths]) {
        assert.throws(() => verify(p => p === name ? bad : read(p)), /exact R32 follow-through added source/);
      }
    }
    for (const verify of [verifiedR32FollowthroughAddedProductPaths, verifiedR32AddedProductPaths]) {
      assert.throws(() => verify(p => {if (p === name) throw new Error('missing frozen file: ' + p); return read(p);}), /missing frozen file/);
    }
  });
}

test('unregistered paths and changed epochs cannot acquire a follow-through exception', async () => {
  const {restorePreR32FollowthroughSource: restore, restoreR32FollowthroughSourceIfPresent: conditional, assertR32FollowthroughAddedSource: added} = await load();
  const bytes = read('src/ui/Minimap.js');
  for (const name of ['src/unknown.js', 'src/ui/Minimap-copy.js', 'src/scene/palace/QianqingCeilingPaint-copy.js', 'public/textures/art/unknown.webp']) {
    assert.equal(restore(name, bytes), bytes);
    assert.equal(conditional(name, bytes), bytes);
    assert.throws(() => added(name, bytes), /registered R32 follow-through added source/);
  }
  // Existing R32 restoration is a separate epoch; the new strict adapter
  // accepts only 86a751/8542 identities, never a broad historical whitelist.
  const {restorePreR32Source} = await import('../lib/r32-source-retention.mjs');
  const r31 = restorePreR32Source('src/ui/Minimap.js', restore('src/ui/Minimap.js', bytes));
  assert.throws(() => restore('src/ui/Minimap.js', r31), /exact R32 follow-through source candidate/);
  assert.equal(conditional('src/ui/Minimap.js', r31), r31);
});

test('existing product inventory includes exactly the two bound follow-through product additions', async () => {
  await load();
  const {verifiedR32AddedProductPaths, verifiedR32FollowthroughAddedProductPaths} = await import('../lib/r32-product-inventory.mjs');
  assert.deepEqual(verifiedR32FollowthroughAddedProductPaths(), fixture.productAdditions);
  const all = verifiedR32AddedProductPaths();
  assert.deepEqual(all.slice(-7), [...fixture.productAdditions,
    'public/textures/art/qianqing-screen-illustration-r32.webp', 'src/scene/palace/QianqingScreenPaint.js',
    'public/textures/art/qianqing-five-dragon-illustration-r32.webp', 'src/scene/palace/QianqingFriezePaint.js',
    'src/scene/palace/QianqingScreenCrest.js']);
  assert.equal(all.length, new Set(all).size, 'no duplicated inventory entries');
  assert.ok(all.every(p => /^(src|data|public)\//.test(p)), 'provenance is bound but not a runtime inventory path');
});

// Re-evaluate the exact R25-R30 inventory unions without their unrelated
// top-level scene captures. The original historical test entry points remain
// unchanged and consume the same verifiedR32AddedProductPaths implementation.
const registry = name => JSON.parse(read('tests/fixtures/' + name + '.json'));
const r25 = registry('r25-nameboard-source-delta'), r26 = registry('r26-qianqing-source-delta');
const frieze = registry('r26-qianqing-frieze-source-delta'), r27 = registry('r27-jiaotai-source-delta');
const r28 = registry('r28-jiaotai-central-source-delta'), r29 = registry('r29-qianqing-source-delta');
const r30 = registry('r30-qianqing-passage-source-delta');
for (const [label, source, later, roots] of [
  ['R25', r25, [r26, frieze, r27, r28, r30, r29], ['src']],
  ['R26', r26, [frieze, r27, r28, r30, r29], ['src', 'data', 'public']],
  ['R26 frieze', frieze, [r27, r28, r30, r29], ['src', 'data', 'public']],
  ['R27', r27, [r28, r30, r29], ['src', 'data', 'public']],
  ['R28', r28, [r30, r29], ['src', 'data', 'public']],
  ['R29', r29, [r30], ['src', 'data', 'public']],
  ['R30', r30, [], ['src', 'data', 'public']]
]) {
  test(`${label} unchanged exact product inventory rejects extra, missing and duplicate paths`, async () => {
    await load();
    const {verifiedR31AddedProductPaths, verifiedR32AddedProductPaths} = await import('../lib/r32-product-inventory.mjs');
    const expected = [
      ...Object.keys(source.files), ...Object.keys(source.addedFiles), ...Object.keys(source.retainedFiles),
      ...later.flatMap(r => Object.keys(r.addedFiles)),
      ...verifiedR31AddedProductPaths(), ...verifiedR32AddedProductPaths()
    ].filter(p => roots.some(dir => p.startsWith(dir + '/'))).sort();
    const actual = roots.flatMap(dir => fs.readdirSync(new URL(dir + '/', root), {recursive: true, withFileTypes: true})
      .filter(entry => entry.isFile()).map(entry => path.relative(root.pathname, path.join(entry.parentPath, entry.name)))).sort();
    assert.equal(expected.length, new Set(expected).size);
    assert.deepEqual(actual, expected);
    for (const extra of ['src/scene/palace/Unregistered.js', 'src/ui/Unregistered.js', ...(roots.includes('public') ? ['public/textures/art/unregistered.webp'] : [])]) {
      assert.throws(() => assert.deepEqual([...actual, extra].sort(), expected));
    }
    for (const added of [...fixture.productAdditions, 'src/scene/palace/QianqingScreenCrest.js'].filter(p => roots.some(dir => p.startsWith(dir + '/')))) {
      assert.throws(() => assert.deepEqual(actual.filter(p => p !== added), expected));
      assert.throws(() => assert.deepEqual([...actual, added].sort(), expected));
    }
  });
}
