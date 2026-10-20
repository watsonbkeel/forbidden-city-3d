import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const root = new URL('../../', import.meta.url);
const helper = new URL('../lib/r33-source-retention.mjs', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
const fixturePath = 'tests/fixtures/r33-source-delta.json';
const changedPaths = [
  'assets-src/interiors/bind_qianqing_auxiliary.mjs',
  'assets-src/interiors/build_qianqing_auxiliary.py',
  'data/architecture/taihe-core.json', 'data/interiors/qianqing.json',
  'data/interiors/taihe.json', 'data/zones/west-six.json',
  'src/scene/PalaceBuilder.js', 'src/scene/interior/QianqingAuxiliaryContract.js',
  'src/scene/interior/QianqingAuxiliaryManifest.js', 'src/scene/interior/TaiheCoreContract.js',
  'src/scene/palace/QianqingEndPassages.js', 'src/scene/zones/ZoneBase.js', 'src/ui/ModelFidelity.js'
];
const addedSourcePaths = [
  'assets-src/interiors/fit_taihe_hanging.py',
  'assets-src/interiors/taihe_hanging_fit/r32-profile.json',
  'src/scene/palace/QianqingDepthGrid.js', 'src/scene/palace/special/ChuxiuHall.js'
];
const assetPaths = [
  'public/models/interiors/qianqing-r33.glb',
  'public/models/interiors/taihe-hanging-fit-b032ccb094e0.glb'
];
const productPaths = [...assetPaths, ...addedSourcePaths.filter(p => p.startsWith('src/'))].sort();
async function load() {
  assert.ok(fs.existsSync(helper), 'strict frozen R33 source helper is required');
  return import(helper);
}

// These tests inspect raw current sources. Only the explicitly historical
// assertions invoke the source projection; no scene/runtime adapter is loaded.
test('R33 registry binds the exact frozen checkpoint, independent Git blob identities and every prior fixture', async () => {
  const {r33Source: registry, validateR33SourceRegistry: validate} = await load();
  assert.equal(registry.schema, 1);
  assert.equal(registry.baseline, '1fb85925f7ab6358661df9a1ac564ad70013d7f7');
  assert.equal(registry.candidate, 'c5a1cc2f27a652f4a1233e0a308858cbb9c9965d');
  assert.equal(registry.implementationCheckpoint, '21472ee195555bd6438a94634c93fe183d24f977');
  assert.deepEqual(Object.keys(registry.files), changedPaths);
  assert.equal(Object.values(registry.files).reduce((count, file) => count + file.deltas.length, 0), 37);
  assert.deepEqual(Object.keys(registry.addedFiles), addedSourcePaths);
  assert.deepEqual(Object.keys(registry.addedAssets), assetPaths);
  assert.deepEqual(registry.productAdditions, productPaths);
  assert.equal(Object.keys(registry.preservedFixtures).length, 135);
  for (const [path, digest] of Object.entries(registry.preservedFixtures)) assert.equal(sha(read(path)), digest, path);
  assert.deepEqual(validate(read(fixturePath)), registry);
  for (const value of [registry, registry.files, registry.files[changedPaths[0]], registry.files[changedPaths[0]].deltas[0], registry.addedFiles, registry.addedAssets, registry.productAdditions, registry.preservedFixtures]) assert.ok(Object.isFrozen(value));
  assert.doesNotMatch(fs.readFileSync(helper, 'utf8'), /child_process|execSync|execFile|fetch\(|rev-parse|git show/);
});

test('R33 registry corruption, epoch drift and missing, duplicate or altered bindings are rejected', async () => {
  const {r33Source: registry, validateR33SourceRegistry: validate} = await load();
  const raw = read(fixturePath), altered = Buffer.from(raw); altered[Math.floor(altered.length / 2)] ^= 1;
  for (const bytes of [Buffer.alloc(0), altered, raw.subarray(1), Buffer.concat([raw, raw]), Buffer.concat([raw, Buffer.from('\n')])]) assert.throws(() => validate(bytes), /immutable R33 source registry/);
  const p = changedPaths[0], s = addedSourcePaths[0], a = assetPaths[0];
  for (const mutate of [
    r => {r.baseline = '0'.repeat(40);}, r => {r.candidate = '0'.repeat(40);},
    r => {delete r.files[p];}, r => {r.files['src/unknown.js'] = r.files[p];},
    ...['baselineSHA256', 'candidateSHA256', 'baselineGitBlob', 'candidateGitBlob'].map(key => r => {r.files[p][key] = '0'.repeat(64);}),
    ...['baselineBytes', 'candidateBytes'].map(key => r => {r.files[p][key]++;}),
    r => {r.files[p].deltas.pop();}, r => {r.files[p].deltas.push(r.files[p].deltas[0]);},
    ...['before', 'after'].flatMap(key => [r => {r.files[p].deltas[0][key] = '';}, r => {r.files[p].deltas[0][key] += '// changed';}]),
    r => {delete r.addedFiles[s];}, r => {r.addedFiles[s].candidateSHA256 = '0'.repeat(64);},
    r => {r.addedFiles[s].candidateBytes++;}, r => {r.addedFiles['src/unknown.js'] = r.addedFiles[s];},
    r => {delete r.addedAssets[a];}, r => {r.addedAssets[a].candidateSHA256 = '0'.repeat(64);},
    r => {r.addedAssets[a].candidateBytes++;}, r => {r.addedAssets[a].configPath = 'data/interiors/taihe.json';},
    r => {r.productAdditions.pop();}, r => {r.productAdditions.push(productPaths[0]);},
    r => {r.productAdditions.push('src/unknown.js');}, r => {delete r.preservedFixtures['tests/fixtures/r32-source-delta.json'];}
  ]) {
    const changed = structuredClone(registry); mutate(changed);
    assert.throws(() => validate(Buffer.from(JSON.stringify(changed, null, 2) + '\n')), /immutable R33 source registry/);
  }
});

for (const path of changedPaths) test(`${path}: raw R33 source restores one independently frozen R32 blob and fails closed on every mutation`, async () => {
  const {r33Source: registry, restorePreR33Source: restore, restoreR33SourceIfPresent: conditional} = await load();
  const delta = registry.files[path], bytes = read(path), original = Buffer.from(bytes), text = bytes.toString('utf8');
  assert.equal(sha(bytes), delta.candidateSHA256);
  assert.equal(bytes.length, delta.candidateBytes);
  assert.equal(blob(bytes), delta.candidateGitBlob);
  const old = restore(path, bytes);
  assert.equal(sha(old), delta.baselineSHA256);
  assert.equal(old.length, delta.baselineBytes);
  assert.equal(blob(old), delta.baselineGitBlob);
  assert.equal(restore(path, old), old, 'baseline is never double-restored');
  assert.equal(conditional(path, old), old);
  assert.deepEqual(conditional(path, bytes), old);
  const changed = Buffer.from(bytes); changed[Math.floor(changed.length / 2)] ^= 1;
  const bad = [Buffer.alloc(0), changed, bytes.subarray(1), Buffer.concat([bytes, bytes]), Buffer.concat([bytes, Buffer.from('\n// extra')]), Buffer.concat([old, Buffer.from('\n// changed base')])];
  for (const hunk of delta.deltas) {
    assert.ok(hunk.before.length && hunk.after.length);
    assert.notEqual(hunk.before, hunk.after);
    assert.equal(text.split(hunk.after).length, 2, 'unique candidate hunk');
    assert.equal(old.toString('utf8').split(hunk.before).length, 2, 'unique baseline hunk');
    for (const replacement of ['', hunk.before, hunk.after + hunk.after, hunk.after + '// altered\n']) bad.push(Buffer.from(text.replace(hunk.after, replacement)));
  }
  for (const mutation of bad) {
    if (sha(mutation) === delta.baselineSHA256) continue; // Exact one-hunk baseline is intentionally idempotent.
    assert.notEqual(sha(mutation), delta.candidateSHA256);
    assert.throws(() => restore(path, mutation), /exact R33 source candidate/);
    assert.equal(conditional(path, mutation), mutation, 'unknown bytes cannot acquire a historical exception');
  }
  assert.deepEqual(bytes, original, 'raw input remains untouched');
});

test('existing R32 and older strict source chains dispatch only complete registered R33 identities', async () => {
  const {restorePreR33Source: restore} = await load();
  const {restorePreR32Source, restoreR32SourceIfPresent, assertR32AddedSource} = await import('../lib/r32-source-retention.mjs');
  const {restoreR31CombinedSourceIfPresent} = await import('../lib/r31-combined-source-retention.mjs');
  const {restoreR31SourceIfPresent} = await import('../lib/r31-flight-operations-retention.mjs');
  const {restorePreR15Source} = await import('../lib/r15-flight-source-retention.mjs');
  const {restorePreR32FriezeSource, restoreR32FriezeSourceIfPresent} = await import('../lib/r32-frieze-source-retention.mjs');
  for (const path of changedPaths) {
    const bytes = read(path), old = restore(path, bytes);
    for (const chain of [restorePreR32Source, restoreR32SourceIfPresent, restoreR31CombinedSourceIfPresent, restoreR31SourceIfPresent, restorePreR15Source]) assert.deepEqual(chain(path, bytes), chain(path, old), path);
    const changed = Buffer.from(bytes); changed[Math.floor(changed.length / 2)] ^= 1;
    for (const mutation of [changed, Buffer.concat([bytes, Buffer.from('\n// unknown')])]) assert.equal(restoreR32SourceIfPresent(path, mutation), mutation, 'unknown R33 identity is not normalized');
  }
  for (const path of ['src/ui/ModelFidelity.js', 'assets-src/interiors/bind_qianqing_auxiliary.mjs']) assert.equal(assertR32AddedSource(path, read(path)).equals(read(path)), true);
  const fidelity = 'src/ui/ModelFidelity.js';
  for (const chain of [restorePreR32FriezeSource, restoreR32FriezeSourceIfPresent]) assert.deepEqual(chain(fidelity, read(fidelity)), chain(fidelity, restore(fidelity, read(fidelity))));
});

for (const path of [...addedSourcePaths, ...assetPaths]) test(`${path}: added R33 source or binary is independently byte-bound and never reversed`, async () => {
  const {r33Source: registry, assertR33AddedSource, assertR33AddedAsset, restorePreR33Source, restoreR33SourceIfPresent} = await load();
  const isAsset = assetPaths.includes(path), delta = (isAsset ? registry.addedAssets : registry.addedFiles)[path], check = isAsset ? assertR33AddedAsset : assertR33AddedSource;
  const bytes = read(path), changed = Buffer.from(bytes); changed[Math.floor(changed.length / 2)] ^= 1;
  assert.equal(sha(bytes), delta.candidateSHA256);
  assert.equal(blob(bytes), delta.candidateGitBlob);
  assert.equal(bytes.length, delta.candidateBytes);
  assert.equal(check(path, bytes), bytes);
  assert.equal(restorePreR33Source(path, bytes), bytes);
  assert.equal(restoreR33SourceIfPresent(path, bytes), bytes);
  for (const bad of [Buffer.alloc(0), changed, bytes.subarray(1), Buffer.concat([bytes, bytes]), Buffer.concat([bytes, Buffer.from('\n')])]) assert.throws(() => check(path, bad), /exact R33 added (source|asset)/);
});

test('R33 product inventory admits exactly two runtime modules and two GLBs after checking all source/provenance and asset bindings', async () => {
  await load();
  const {verifiedR33AddedProductPaths: verify} = await import('../lib/r33-product-inventory.mjs');
  assert.deepEqual(verify(), productPaths);
  assert.equal(new Set(verify()).size, productPaths.length);
  for (const path of [...addedSourcePaths, ...assetPaths, 'data/interiors/qianqing.json', 'data/interiors/taihe.json']) {
    const bytes = read(path), altered = Buffer.from(bytes); altered[Math.floor(altered.length / 2)] ^= 1;
    for (const bad of [Buffer.alloc(0), altered, bytes.subarray(1), Buffer.concat([bytes, bytes]), Buffer.concat([bytes, Buffer.from('\n')])]) assert.throws(() => verify(p => p === path ? bad : read(p)), path);
    assert.throws(() => verify(p => {if (p === path) throw new Error('missing exact file'); return read(p);}), /missing exact file/);
  }
  for (const path of ['data/interiors/qianqing.json', 'data/interiors/taihe.json']) for (const key of ['model', 'sha256']) {
    const config = JSON.parse(read(path));
    if (key === 'model') config.model = '/models/interiors/unknown.glb'; else config.asset.sha256 = '0'.repeat(64);
    assert.throws(() => verify(p => p === path ? Buffer.from(JSON.stringify(config)) : read(p)), /exact R33 asset-binding config/);
  }
  for (const paths of [productPaths.slice(1), [...productPaths, productPaths[0]], [...productPaths, 'src/unknown.js']]) assert.throws(() => assert.deepEqual(paths, verify()));
});

test('unknown paths, inherited property names and older epochs cannot acquire an R33 exception', async () => {
  const {restorePreR33Source: restore, restoreR33SourceIfPresent: conditional, assertR33AddedSource: source, assertR33AddedAsset: asset} = await load();
  const bytes = read(changedPaths[0]);
  for (const path of ['src/unknown.js', changedPaths[0] + '-copy', assetPaths[0] + '-copy', '__proto__', 'constructor', 'toString']) {
    assert.equal(restore(path, bytes), bytes); assert.equal(conditional(path, bytes), bytes);
    assert.throws(() => source(path, bytes), /registered R33 added source/);
    assert.throws(() => asset(path, bytes), /registered R33 added asset/);
  }
  const {restorePreR32Source} = await import('../lib/r32-source-retention.mjs');
  const path = 'src/scene/PalaceBuilder.js', old = restorePreR32Source(path, restore(path, read(path)));
  assert.throws(() => restore(path, old), /exact R33 source candidate/);
  assert.equal(conditional(path, old), old);
});

test('R30 added passage-source guard accepts only exact R33 projection and still rejects all altered full bytes', async () => {
  const {restorePreR33Source} = await load();
  const {assertR30AddedSource, r30Source} = await import('../lib/r30-qianqing-passage-retention.mjs');
  const path = 'src/scene/palace/QianqingEndPassages.js', bytes = read(path), old = restorePreR33Source(path, bytes);
  assert.equal(sha(old), r30Source.addedFiles[path].candidateSHA256);
  assert.equal(assertR30AddedSource(path, bytes), bytes, 'historical hash check does not overwrite raw source');
  assert.equal(assertR30AddedSource(path, old), old);
  const changed = Buffer.from(bytes); changed[Math.floor(changed.length / 2)] ^= 1;
  for (const bad of [Buffer.alloc(0), changed, bytes.subarray(1), Buffer.concat([bytes, bytes]), Buffer.concat([bytes, Buffer.from('\n')])]) assert.throws(() => assertR30AddedSource(path, bad), /exact R30 module/);
});
