import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const root = new URL('../../', import.meta.url);
const helper = new URL('../lib/r32-crest-source-retention.mjs', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const fixturePath = 'tests/fixtures/r32-crest-source-delta.json';
const fixture = JSON.parse(read(fixturePath));
const settingPath = 'src/scene/palace/QianqingCentralSetting.js';
const crestPath = 'src/scene/palace/QianqingScreenCrest.js';
async function load() {
  assert.ok(fs.existsSync(helper), 'exact frozen R32 crest source helper is required');
  return import(helper);
}

// Source/inventory assertions only. No scene, world, browser, route or runtime
// adapter is loaded here. Current behavior is tested on the real product.
test('crest registry binds only f7f65fd source/addition against 8ba57d6 and preserves all 133 old fixtures', async () => {
  const {r32CrestSource: registry, validateR32CrestSourceRegistry: validate} = await load();
  assert.deepEqual(registry, fixture);
  assert.equal(registry.schema, 1);
  assert.equal(registry.baseline, '8ba57d6d41919fc345e4baf8f3af2adcadb314c5');
  assert.equal(registry.candidate, 'f7f65fd1b5d4a69551f24e0c3057664c8042d0c2');
  assert.deepEqual(Object.keys(registry.files), [settingPath]);
  assert.deepEqual(Object.values(registry.files).map(d => d.deltas.length), [2]);
  assert.deepEqual(Object.keys(registry.addedFiles), [crestPath]);
  assert.deepEqual(registry.productAdditions, [crestPath]);
  assert.equal(Object.keys(registry.preservedFixtures).length, 133);
  for (const name of ['r32-source-delta.json', 'r32-followthrough-source-delta.json', 'r32-screen-source-delta.json', 'r32-frieze-source-delta.json', 'r32-qianqing-crest-baseline.json']) {
    assert.ok(Object.hasOwn(registry.preservedFixtures, 'tests/fixtures/' + name), 'prior fixture is preserved: ' + name);
  }
  for (const [name, digest] of Object.entries(registry.preservedFixtures)) assert.equal(sha(read(name)), digest, name);
  assert.deepEqual(validate(read(fixturePath)), registry);
  assert.ok(Object.isFrozen(registry));
  assert.ok(Object.isFrozen(registry.files));
  assert.ok(Object.isFrozen(registry.files[settingPath].deltas));
  assert.ok(Object.isFrozen(registry.files[settingPath].deltas[0]));
  assert.ok(Object.isFrozen(registry.addedFiles[crestPath]));
  assert.ok(Object.isFrozen(registry.productAdditions));
  assert.ok(Object.isFrozen(registry.preservedFixtures));
  assert.doesNotMatch(fs.readFileSync(helper, 'utf8'), /child_process|execSync|execFile|fetch\(|rev-parse|git show/);
});

test('crest registry rejects same-length corruption and missing, extra, altered source or inventory bindings', async () => {
  const {validateR32CrestSourceRegistry: validate} = await load();
  const raw = read(fixturePath), altered = Buffer.from(raw); altered[Math.floor(altered.length / 2)] ^= 1;
  for (const bytes of [Buffer.alloc(0), altered, raw.subarray(1), Buffer.concat([raw, Buffer.from('\n')])]) {
    assert.throws(() => validate(bytes), /immutable R32 crest source registry/);
  }
  for (const mutate of [
    r => {r.baseline = '0'.repeat(40);},
    r => {r.candidate = '0'.repeat(40);},
    r => {r.files[settingPath].candidateSHA256 = '0'.repeat(64);},
    r => {r.files[settingPath].baselineSHA256 = '0'.repeat(64);},
    r => {r.files[settingPath].candidateBytes++;},
    r => {r.files[settingPath].baselineBytes++;},
    r => {delete r.files[settingPath];},
    r => {r.files['src/unknown.js'] = r.files[settingPath];},
    r => {r.files[settingPath].deltas.pop();},
    r => {r.files[settingPath].deltas.push(r.files[settingPath].deltas[0]);},
    r => {r.files[settingPath].deltas[0].before += '// altered';},
    r => {r.files[settingPath].deltas[0].after += '// altered';},
    r => {r.files[settingPath].deltas[0].before = '';},
    r => {r.files[settingPath].deltas[0].after = '';},
    r => {delete r.addedFiles[crestPath];},
    r => {r.addedFiles[crestPath].candidateSHA256 = '0'.repeat(64);},
    r => {r.addedFiles[crestPath].candidateBytes++;},
    r => {r.addedFiles['src/unknown.js'] = r.addedFiles[crestPath];},
    r => {r.productAdditions = [];},
    r => {r.productAdditions.push(crestPath);},
    r => {r.productAdditions.push('src/unknown.js');},
    r => {delete r.preservedFixtures['tests/fixtures/r32-qianqing-crest-baseline.json'];}
  ]) {
    const changed = structuredClone(fixture); mutate(changed);
    assert.throws(() => validate(Buffer.from(JSON.stringify(changed, null, 2) + '\n')), /immutable R32 crest source registry/);
  }
});

test('crest reverses only exact full bytes and two unique review hunks without mutating input', async () => {
  const {restorePreR32CrestSource: restore, restoreR32CrestSourceIfPresent: conditional} = await load();
  const delta = fixture.files[settingPath], bytes = read(settingPath), original = Buffer.from(bytes), text = bytes.toString('utf8');
  assert.equal(sha(bytes), delta.candidateSHA256);
  assert.equal(bytes.length, delta.candidateBytes);
  const old = restore(settingPath, bytes);
  assert.equal(sha(old), delta.baselineSHA256);
  assert.equal(old.length, delta.baselineBytes);
  const {r32ScreenSource} = await import('../lib/r32-screen-source-retention.mjs');
  assert.equal(delta.baselineSHA256, r32ScreenSource.files[settingPath].candidateSHA256);
  assert.equal(restore(settingPath, old), old, 'exact baseline is never double-restored');
  assert.equal(conditional(settingPath, old), old);
  assert.deepEqual(conditional(settingPath, bytes), old);
  const altered = Buffer.from(bytes); altered[Math.floor(altered.length / 2)] ^= 1;
  assert.equal(altered.length, bytes.length, 'same-length tamper exercise');
  const bad = [Buffer.alloc(0), altered, bytes.subarray(1), Buffer.concat([bytes, bytes]), Buffer.concat([bytes, Buffer.from('\n// extra')]), Buffer.concat([old, Buffer.from('\n// wrong base')])];
  for (const hunk of delta.deltas) {
    assert.ok(hunk.before.length && hunk.after.length);
    assert.notEqual(hunk.before, hunk.after);
    assert.equal(text.split(hunk.after).length, 2, 'unique frozen candidate hunk');
    assert.equal(old.toString().split(hunk.before).length, 2, 'unique frozen baseline hunk');
    for (const replacement of ['', hunk.before, hunk.after + hunk.after, hunk.after + '// altered hunk\n', hunk.after.replace('const', 'CONST')]) {
      bad.push(Buffer.from(text.replace(hunk.after, replacement)));
    }
  }
  for (const mutation of bad) {
    assert.notEqual(sha(mutation), delta.candidateSHA256, 'each mutation changes bytes');
    assert.notEqual(sha(mutation), delta.baselineSHA256, 'partial hunk reversion is not the exact baseline');
    assert.throws(() => restore(settingPath, mutation), /exact R32 crest source candidate/);
    assert.equal(conditional(settingPath, mutation), mutation, 'unknown full bytes are never transformed');
  }
  assert.deepEqual(bytes, original, 'source buffer is never overwritten');
});

test('all historical entry chains consume crest only through exact full-byte dispatch', async () => {
  const {restorePreR32CrestSource: restore} = await load();
  const {restorePreR32Source, restoreR32SourceIfPresent} = await import('../lib/r32-source-retention.mjs');
  const {restoreR31CombinedSourceIfPresent} = await import('../lib/r31-combined-source-retention.mjs');
  const {restoreR31SourceIfPresent} = await import('../lib/r31-flight-operations-retention.mjs');
  const {restorePreR15Source} = await import('../lib/r15-flight-source-retention.mjs');
  const bytes = read(settingPath), old = restore(settingPath, bytes);
  for (const chain of [restorePreR32Source, restoreR32SourceIfPresent, restoreR31CombinedSourceIfPresent, restoreR31SourceIfPresent, restorePreR15Source]) {
    assert.deepEqual(chain(settingPath, bytes), chain(settingPath, old), 'existing strict entry chain');
  }
  const altered = Buffer.from(bytes); altered[Math.floor(altered.length / 2)] ^= 1;
  for (const mutation of [altered, Buffer.concat([bytes, Buffer.from('\n// extra')])]) {
    assert.throws(() => restorePreR32Source(settingPath, mutation), /exact R32 source candidate/);
    for (const chain of [restoreR32SourceIfPresent, restoreR31CombinedSourceIfPresent, restoreR31SourceIfPresent, restorePreR15Source]) {
      assert.equal(chain(settingPath, mutation), mutation, 'unknown identity remains closed to historical dispatch');
    }
  }
});

test('added crest module has one exact identity and every inventory rejects altered or missing bytes', async () => {
  const {assertR32CrestAddedSource: check} = await load();
  const {verifiedR32AddedProductPaths, verifiedR32CrestAddedProductPaths} = await import('../lib/r32-product-inventory.mjs');
  const delta = fixture.addedFiles[crestPath], bytes = read(crestPath), original = Buffer.from(bytes), altered = Buffer.from(bytes);
  altered[Math.floor(altered.length / 2)] ^= 1;
  assert.equal(sha(bytes), delta.candidateSHA256);
  assert.equal(bytes.length, delta.candidateBytes);
  assert.equal(check(crestPath, bytes), bytes);
  for (const bad of [Buffer.alloc(0), altered, bytes.subarray(1), Buffer.concat([bytes, bytes]), Buffer.concat([bytes, Buffer.from('\n')])]) {
    assert.throws(() => check(crestPath, bad), /exact R32 crest added source/);
    for (const verify of [verifiedR32CrestAddedProductPaths, verifiedR32AddedProductPaths]) {
      assert.throws(() => verify(p => p === crestPath ? bad : read(p)), /exact R32 crest added source/);
    }
  }
  for (const verify of [verifiedR32CrestAddedProductPaths, verifiedR32AddedProductPaths]) {
    assert.throws(() => verify(p => {if (p === crestPath) throw new Error('missing frozen file: ' + p); return read(p);}), /missing frozen file/);
  }
  assert.deepEqual(bytes, original, 'added-source buffer is never overwritten');
});

test('unregistered paths and changed epochs cannot acquire a crest exception', async () => {
  const {restorePreR32CrestSource: restore, restoreR32CrestSourceIfPresent: conditional, assertR32CrestAddedSource: added} = await load();
  const bytes = read(settingPath);
  for (const name of ['src/unknown.js', settingPath + '-copy', crestPath + '-copy', 'public/textures/art/unknown.webp', '__proto__', 'toString']) {
    assert.equal(restore(name, bytes), bytes);
    assert.equal(conditional(name, bytes), bytes);
    assert.throws(() => added(name, bytes), /registered R32 crest added source/);
  }
  const {restorePreR32Source} = await import('../lib/r32-source-retention.mjs');
  const r31 = restorePreR32Source(settingPath, restore(settingPath, bytes));
  assert.notEqual(sha(r31), fixture.files[settingPath].baselineSHA256);
  assert.throws(() => restore(settingPath, r31), /exact R32 crest source candidate/);
  assert.equal(conditional(settingPath, r31), r31);
});

test('existing product inventory adds exactly one independently bound crest runtime module', async () => {
  await load();
  const {verifiedR32AddedProductPaths, verifiedR32CrestAddedProductPaths} = await import('../lib/r32-product-inventory.mjs');
  assert.deepEqual(verifiedR32CrestAddedProductPaths(), [crestPath]);
  const all = verifiedR32AddedProductPaths();
  assert.deepEqual(all.slice(-1), fixture.productAdditions);
  assert.equal(all.length, 18);
  assert.equal(all.length, new Set(all).size, 'no duplicated inventory entries');
  assert.ok(all.every(p => /^(src|data|public)\//.test(p)), 'only runtime paths enter the product inventory');
  for (const changed of [all.filter(p => p !== crestPath), [...all, crestPath], [...all, 'src/scene/palace/UnknownCrest.js']]) {
    assert.throws(() => assert.deepEqual(changed.sort(), [...all].sort()), 'missing, duplicate and extra paths remain excluded');
  }
});
