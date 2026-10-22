/**
 * Versioned candidate06-07 geometry acceptance.
 * The female snapshot is a frozen-implementation regression reference, NOT an
 * independent art/history oracle. Candidate05 assertions and archives remain
 * untouched and are not reclassified as passing by this suite.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { readFixtureArchive } from './helpers/p3c-fixture-archive.mjs';
import * as kit from '../src/scene/characters/CharacterKit.js';

const root = new URL('../', import.meta.url);
const file = path => new URL(path, root);
const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');
const fileHash = path => sha256(fs.readFileSync(file(path)));
const sourcePaths = {
  current: 'src/scene/characters/CharacterKit.js',
  frozen06: 'reports/r50-followup/female-reference/candidate06-06/CharacterKit-source.js',
  frozen07: 'reports/r50-followup/female-reference/candidate06-07/CharacterKit-source.js',
};
const sourceHashes = {
  current: 'cc311f8fdaa912538fdfffebd66b7fa2c5de7f2c7063ffbc5bf462bc3f5edc6c',
  frozen06: '5128af161cbce30e7da8106b8350ae30455dd16c32e04f00075cb948e85cf15b',
  frozen07: 'cc311f8fdaa912538fdfffebd66b7fa2c5de7f2c7063ffbc5bf462bc3f5edc6c',
};
// Check pinned source bytes before evaluating either archived implementation.
for (const [name, path] of Object.entries(sourcePaths)) {
  assert.equal(fileHash(path), sourceHashes[name], `${name}: pinned source SHA256`);
}
const frozen06 = await import(file(sourcePaths.frozen06));
const frozen07 = await import(file(sourcePaths.frozen07));
const archivePins = [
  {
    name: 'kit-preparation-baseline', cases: 126, originalBytes: 4155008,
    originalSha256: 'a488fc0dc5c70a67f7dba584c57f7e068a38dcb91da03e7a789ca4b4511028ce',
    originalGitBlobSha: '7152a11eb3990c6307730d9c2a6edd866ebbf001',
    gzipSha256: 'e85dd90bb5ebba4dd143ae42ffbbe759d871941a79105b5527c766ad192bc16a',
  },
  {
    name: 'female-refinement-baseline', cases: 36, originalBytes: 1216649,
    originalSha256: '32ad4dafae1196806ade1971e8e1b22bae5b081d35acfda92118d708e66932ab',
    originalGitBlobSha: '029715a89ad5dc494862d1541becfa087f6f97ab',
    gzipSha256: '6f42703a5b2602cbc61ce148180698d47cf84e412553b1181b574fc1c821f43f',
  },
];
const archives = archivePins.map(pin => {
  const path = `reports/r50-followup/${pin.name}.json.gz.index.json`;
  const index = JSON.parse(fs.readFileSync(file(path)));
  const original = readFixtureArchive(file(path));
  return { pin, path, index, original, parsed: JSON.parse(original) };
});
const original = archives[0].parsed;
const candidate05 = archives[1].parsed;
const femaleIds = new Set(['consort-daily', 'maid-daily']);
const key = c => [c.templateId, c.pose, c.lod, c.seatVariant, c.femalePose ?? 'default'].join('/');
const maleCases = original.cases.filter(c => !femaleIds.has(c.templateId));
const femaleDefaultCases = [];
const femaleWalkingCases = [];
for (const templateId of femaleIds) {
  for (const pose of ['standing', 'seated', 'kneeling']) {
    for (const lod of [0, 1, 2]) {
      for (const seatVariant of pose === 'seated'
        ? ['standard', 'kang-low', 'raised-footstool', 'throne-front-perch'] : ['standard']) {
        femaleDefaultCases.push({ templateId, pose, lod, seatVariant });
      }
    }
  }
  for (const lod of [0, 1, 2]) {
    femaleWalkingCases.push({ templateId, pose: 'standing', lod, seatVariant: 'standard', femalePose: 'walking' });
  }
}
const femaleCases = [...femaleDefaultCases, ...femaleWalkingCases];
const opts = c => ({ seatVariant: c.seatVariant, ...(c.femalePose ? { femalePose: c.femalePose } : {}) });
const build = (api, c) => api.createCharacterGeometry(c.templateId, c.pose, c.lod, opts(c));
const bytes = a => Buffer.from(a.array.buffer, a.array.byteOffset, a.array.byteLength);
const entries = g => [...Object.entries(g.attributes), ['index', g.index]];
const arrayMetadata = a => ({
  type: a.array.constructor.name, itemSize: a.itemSize, count: a.count,
  normalized: a.normalized, version: a.version, usage: a.usage, gpuType: a.gpuType,
});
const fullArrayMetadata = a => ({
  ...arrayMetadata(a), name: a.name, length: a.array.length, byteLength: a.array.byteLength,
  byteOffset: a.array.byteOffset, bytesPerElement: a.array.BYTES_PER_ELEMENT,
  isBufferAttribute: a.isBufferAttribute, updateRanges: a.updateRanges,
});
const bounds = g => ({
  box: { min: g.boundingBox.min.toArray(), max: g.boundingBox.max.toArray() },
  sphere: { center: g.boundingSphere.center.toArray(), radius: g.boundingSphere.radius },
});
const geometryMetadata = g => ({
  ...bounds(g), userData: g.userData, groups: g.groups, drawRange: g.drawRange,
  morphTargetsRelative: g.morphTargetsRelative, morphAttributes: g.morphAttributes,
});
function exactBytes(actual, expected, label) {
  // Compare real bytes, not just hashes, and never print giant typed-array diffs.
  assert.equal(actual.equals(expected), true,
    `${label}: byte mismatch (${actual.length}/${expected.length} bytes; SHA256 ${sha256(actual)}/${sha256(expected)})`);
}
function againstOracle(g, c) {
  assert.deepEqual(Object.keys(g.attributes), Object.keys(c.attributes), `${key(c)} attribute names/order`);
  for (const [name, a] of entries(g)) {
    const expected = name === 'index' ? c.index : c.attributes[name];
    const raw = inflateSync(Buffer.from(expected.deflateBase64, 'base64'));
    assert.equal(sha256(raw), expected.sha256, `${key(c)}/${name}: archived raw SHA256`);
    exactBytes(bytes(a), raw, `${key(c)}/${name}`);
    assert.deepEqual(arrayMetadata(a), Object.fromEntries(Object.keys(arrayMetadata(a)).map(k => [k, expected[k]])), `${key(c)}/${name}: metadata`);
  }
  assert.deepEqual(g.userData, c.userData, `${key(c)} userData`);
  assert.deepEqual(bounds(g), { box: c.box, sphere: c.sphere }, `${key(c)} bounds`);
}
function againstGeometry(g, expected, c, permitted = new Set()) {
  assert.deepEqual(Object.keys(g.attributes), Object.keys(expected.attributes), `${key(c)} attribute names/order`);
  const changed = [];
  for (const [name, a] of entries(g)) {
    const old = name === 'index' ? expected.index : expected.attributes[name];
    assert.deepEqual(fullArrayMetadata(a), fullArrayMetadata(old), `${key(c)}/${name}: full typed-array metadata`);
    const equal = bytes(a).equals(bytes(old));
    if (!equal) changed.push(name);
    if (!permitted.has(name)) exactBytes(bytes(a), bytes(old), `${key(c)}/${name}`);
  }
  assert.deepEqual(geometryMetadata(g), geometryMetadata(expected), `${key(c)} geometry metadata/bounds`);
  return changed;
}
function drain(c) {
  const iterator = kit.createCharacterGeometrySteps(c.templateId, c.pose, c.lod, opts(c));
  let n, steps = 0;
  const totals = {}, phases = new Set();
  do {
    n = iterator.next();
    if (!n.done) {
      steps++;
      const p = n.value;
      assert.equal(p.kind, 'character-geometry');
      assert.equal(p.maxWorkUnits, 128);
      assert.ok(p.workUnits > 0 && p.workUnits <= 128, `${key(c)} bounded work`);
      assert.ok(!p.isBufferGeometry && !p.geometry, `${key(c)} no partial resources`);
      assert.ok((p.work.vertices ?? 0) <= 128);
      assert.ok((p.work.triangles ?? 0) <= 256);
      for (const [name, count] of Object.entries(p.work)) totals[name] = (totals[name] ?? 0) + count;
      phases.add(p.phase);
    }
  } while (!n.done);
  const g = n.value;
  assert.ok(steps > 4);
  for (const name of ['vertices', 'normalVertices', 'boxVertices', 'sphereVertices']) assert.equal(totals[name], g.attributes.position.count, `${key(c)} ${name}`);
  for (const name of ['triangles', 'normalTriangles']) assert.equal(totals[name], g.index.count / 3, `${key(c)} ${name}`);
  for (const name of ['normals', 'bounds', 'attributes']) assert.ok(phases.has(name), `${key(c)} phase ${name}`);
  return g;
}
const report = {
  scope: 'Versioned candidate06-07 geometry byte acceptance; no world construction.',
  caveat: 'Female expected outputs are generated by the SHA-pinned frozen implementation, not independent art or historical verification.',
  sources: Object.fromEntries(Object.keys(sourcePaths).map(name => [name, { path: sourcePaths[name], sha256: sourceHashes[name] }])),
  archives: archivePins,
  acceptance: {},
  legacyCandidate05: {
    classification: 'Not applicable to the redesigned candidate06-07 female shape. Original assertions remain unchanged. NOT counted as passing.',
    cases: [],
  },
  delta06To07: [],
};

test('final07 provenance: archived source and original oracle bytes remain pinned and available', () => {
  for (const [name, path] of Object.entries(sourcePaths)) assert.equal(fileHash(path), sourceHashes[name]);
  for (const { pin, index, original: raw, parsed } of archives) {
    assert.equal(raw.length, pin.originalBytes);
    assert.equal(sha256(raw), pin.originalSha256);
    assert.equal(index.originalGitBlobSha, pin.originalGitBlobSha);
    assert.equal(index.gzipSha256, pin.gzipSha256);
    assert.equal(index.sourceCommit, '314751a381bdbf159a3dd5bdb3c92fcbe7240700');
    assert.equal(parsed.cases.length, pin.cases);
  }
  assert.equal(fileHash('tests/p3c-kit-incremental.test.mjs'), 'f0e32a9a43d849abf5bcc85ca2145d39b06dec9bf43865d0274debd2536743ba');
  assert.equal(fileHash('tests/p3c-female-refinement.test.mjs'), 'e2450196760cd58743df8ef1bede5828f3909ecb24d9fb50d9c53f7927412cac');
  assert.equal(maleCases.length, 90);
  assert.equal(femaleDefaultCases.length, 36);
  assert.equal(femaleWalkingCases.length, 6);
  assert.equal(new Set(femaleCases.map(key)).size, 42);
  assert.deepEqual(new Set(femaleDefaultCases.map(key)), new Set(candidate05.cases.map(key)));
});

for (const mode of ['synchronous', 'incremental']) {
  test(`final07 ${mode}: all 90 male cases equal original126 oracle bytes, typed metadata and bounds`, () => {
    for (const c of maleCases) {
      const g = mode === 'synchronous' ? build(kit, c) : drain(c);
      try { againstOracle(g, c); } finally { g.dispose(); }
    }
    report.acceptance[`male_${mode}`] = { passed: 90, expected: 'original126 archived output oracle' };
  });
  test(`final07 ${mode}: all 36 female defaults and 6 walking cases equal SHA-pinned 07 snapshot`, () => {
    for (const c of femaleCases) {
      const expected = build(frozen07, c);
      const g = mode === 'synchronous' ? build(kit, c) : drain(c);
      try {
        assert.deepEqual(againstGeometry(g, expected, c), []);
        if (mode === 'synchronous' && !c.femalePose) {
          const old = candidate05.cases.find(old => key(old) === key(c));
          const hashes = {};
          for (const [name, a] of entries(g)) {
            const previous = name === 'index' ? old.index : old.attributes[name];
            const raw = inflateSync(Buffer.from(previous.deflateBase64, 'base64'));
            hashes[name] = { candidate05: sha256(raw), final07: sha256(bytes(a)), byteEqual: bytes(a).equals(raw) };
          }
          report.legacyCandidate05.cases.push({ case: key(c), hashes,
            changedBuffers: Object.keys(hashes).filter(name => !hashes[name].byteEqual),
            metadataEqual: JSON.stringify(g.userData) === JSON.stringify(old.userData),
            boxEqual: JSON.stringify(bounds(g).box) === JSON.stringify(old.box),
            sphereEqual: JSON.stringify(bounds(g).sphere) === JSON.stringify(old.sphere),
          });
        }
      } finally { g.dispose(); expected.dispose(); }
    }
    report.acceptance[`female_${mode}`] = { passed: 42, defaults: 36, walking: 6, expected: 'frozen07 implementation; not independent art proof' };
  });
}

test('final07 delta: 06 to 07 changes only the two female seated weight buffers across all 42 cases', () => {
  const permitted = new Set(['characterWeight', 'characterTorsoWeight']);
  for (const c of femaleCases) {
    const now = build(kit, c), old = build(frozen06, c);
    try {
      const changed = againstGeometry(now, old, c, c.pose === 'seated' ? permitted : new Set());
      assert.deepEqual(changed.sort(), c.pose === 'seated' ? [...permitted].sort() : [], `${key(c)} exact changed-buffer set`);
      report.delta06To07.push({ case: key(c), changedBuffers: changed, allOtherBytesAndMetadataEqual: true });
    } finally { now.dispose(); old.dispose(); }
  }
  report.acceptance.delta06To07 = { passed: 42, seatedWeightsOnly: 24, defaultNonSeatedExact: 12, walkingExact: 6 };
});

test.after(() => {
  // Optional acceptance evidence only. Normal tests have no filesystem side effects.
  // This audit records legacy differences; it does not turn legacy failures green.
  if (process.env.P3C_FINAL07_REPORT === '1') {
    report.legacyCandidate05.differentCases = report.legacyCandidate05.cases.filter(c => c.changedBuffers.length).length;
    fs.writeFileSync(file('reports/r50-joint/geometry-final07-results.json'), JSON.stringify(report, null, 2) + '\n');
  }
});
