import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';

const script = new URL('../scripts/r58-restore-evidence-archives.mjs', import.meta.url);
const sha = (bytes, algorithm = 'sha256') => createHash(algorithm).update(bytes).digest('hex');
const blob = bytes => sha(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes]), 'sha1');
const syntheticBytes = Buffer.concat(Array.from({length: 8000}, (_, i) =>
  createHash('sha256').update(`Synthetic report record ${i}`).digest()));

function fixture() {
  const originals = new Map([
    ['reports/r58-unified/synthetic.json', Buffer.from(JSON.stringify({data: syntheticBytes.toString('base64')}))],
    ['reports/r58-unified/synthetic-motion.json.gz', gzipSync('Exact synthetic motion evidence\n')],
  ]);
  const files = new Map();
  const archives = [...originals].map(([reportPath, raw], n) => {
    const encoding = reportPath.endsWith('.gz') ? 'identity' : 'gzip';
    const packed = encoding === 'gzip' ? gzipSync(raw) : raw;
    const parts = [];
    for (let offset = 0; offset < packed.length; offset += 120000) {
      const bytes = packed.subarray(offset, offset + 120000);
      const partPath = `reports/r58-transport/parts/${n}.${String(parts.length).padStart(3, '0')}.bin`;
      files.set(partPath, Buffer.from(bytes));
      parts.push({index: parts.length, path: partPath, bytes: bytes.length, sha256: sha(bytes)});
    }
    return {path: reportPath, sourceCommit: 'a'.repeat(40), kind: 'report', encoding, originalBytes: raw.length, originalSha256: sha(raw),
      originalGitBlob: blob(raw), containerBytes: packed.length, containerSha256: sha(packed), parts};
  });
  return {originals, files, index: {schemaVersion: 1,
    maximumPartBytes: 120000, archives}};
}

async function restoreFunction() {
  assert.ok(fs.existsSync(script), 'The additive R58 restore/check script must exist');
  const module = await import(script);
  assert.equal(typeof module.restoreR58Evidence, 'function');
  return module.restoreR58Evidence;
}

function temporaryDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'r58-transport-test-'));
  t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  return directory;
}

function readFixture(f) {
  return reportPath => {
    if (!f.files.has(reportPath)) throw Error(`Missing synthetic part: ${reportPath}`);
    return f.files.get(reportPath);
  };
}

test('R58 restores exact gzip and identity bytes and verifies without writing', async t => {
  const restore = await restoreFunction();
  const f = fixture();
  assert.ok(f.index.archives[0].parts.length > 1, 'Exercise actual multi-part concatenation');
  const result = restore({index: f.index, read: readFixture(f)});
  assert.deepEqual(result, f.index.archives.map(e => ({path: e.path, bytes: e.originalBytes,
    sha256: e.originalSha256, gitBlob: e.originalGitBlob, sourceCommit: e.sourceCommit})));
  const destination = path.join(temporaryDirectory(t), 'restored');
  restore({index: f.index, read: readFixture(f), destination});
  for (const [reportPath, raw] of f.originals) assert.deepEqual(fs.readFileSync(path.join(destination, reportPath)), raw);
  restore({index: f.index, read: readFixture(f), destination});
});

const failures = [
  ['missing part', f => f.files.delete(f.index.archives.at(-1).parts[0].path), /Missing synthetic part/],
  ['reversed part order', f => f.index.archives[0].parts.reverse(), /order/i],
  ['corrupt part', f => { f.files.get(f.index.archives.at(-1).parts[0].path)[0] ^= 1; }, /corrupt/i],
  ['dropped final part', f => f.index.archives[0].parts.pop(), /concatenation/i],
  ['wrong complete container hash', f => { f.index.archives[0].containerSha256 = '0'.repeat(64); }, /concatenation/i],
  ['wrong original SHA-256', f => { f.index.archives[0].originalSha256 = '0'.repeat(64); }, /frozen original/i],
  ['wrong original Git blob', f => { f.index.archives[0].originalGitBlob = '0'.repeat(40); }, /frozen original/i],
  ['wrong original byte count', f => { f.index.archives[0].originalBytes++; }, /frozen original/i],
  ['unsupported encoding', f => { f.index.archives[0].encoding = 'zip'; }, /encoding/i],
  ['wrong gzip versus identity encoding', f => { f.index.archives[1].encoding = 'gzip'; }, /frozen original/i],
  ['invalid gzip header with valid container hashes', f => {
    const entry = f.index.archives[0];
    f.files.get(entry.parts[0].path)[0] ^= 1;
    entry.parts[0].sha256 = sha(f.files.get(entry.parts[0].path));
    entry.containerSha256 = sha(Buffer.concat(entry.parts.map(part => f.files.get(part.path))));
  }, /invalid gzip/i],
  ['malformed original hash', f => { f.index.archives[0].originalSha256 = 'not a hash'; }, /identity/i],
  ['empty index', f => { f.index.archives = []; }, /index/i],
  ['unfrozen source commit', f => { delete f.index.archives[0].sourceCommit; }, /commit/i],
  ['changed schema', f => { f.index.schemaVersion = 2; }, /schema/i],
  ['oversized part limit', f => { f.index.maximumPartBytes = 120001; }, /120000/i],
  ['empty part list', f => { f.index.archives[0].parts = []; }, /part/i],
  ['duplicate original path', f => { f.index.archives[1].path = f.index.archives[0].path; }, /duplicate/i],
  ['duplicate part path', f => { f.index.archives[1].parts[0].path = f.index.archives[0].parts[0].path; }, /duplicate/i],
  ['part outside report storage', f => { f.index.archives[0].parts[0].path = 'public/models/asset.bin'; }, /part path/i],
];

for (const [name, mutate, error] of failures) {
  test(`R58 ${name} fails closed before creating any output`, async t => {
    const restore = await restoreFunction();
    const f = fixture();
    mutate(f);
    const destination = path.join(temporaryDirectory(t), 'must-not-exist');
    assert.throws(() => restore({index: f.index, read: readFixture(f), destination}), error);
    assert.equal(fs.existsSync(destination), false);
  });
}

for (const reportPath of [
  'public/models/interiors/kunning-v6-5adbf53a3114.glb',
  'tests/fixtures/r58-zhonghe-before.json',
  'src/scene/characters/CharacterSystem.js',
  'data/interiors/kunning.json',
  'docs/validation/r57-zhonghe-display/neutral/geometry-and-navigation.json',
  'docs/validation/r57-zhonghe-display/neutral/front.png',
  'reports/r58-transport/ARCHIVES.json',
  'reports/r58-unified/../outside.json',
  'reports/r58-unified/./synthetic.json',
  'reports/r58-unified//synthetic.json',
  'reports/r58-unified/synthetic\\file.json',
  '/reports/r58-unified/synthetic.json',
]) {
  test(`R58 rejects ineligible report path ${reportPath}`, async t => {
    const restore = await restoreFunction();
    const f = fixture();
    f.index.archives[0].path = reportPath;
    const destination = path.join(temporaryDirectory(t), 'must-not-exist');
    assert.throws(() => restore({index: f.index, read: readFixture(f), destination}), /evidence path/i);
    assert.equal(fs.existsSync(destination), false);
  });
}

test('R58 enforces the binary part size even when hashes are otherwise valid', async t => {
  const restore = await restoreFunction();
  const f = fixture();
  const entry = f.index.archives[0];
  const bytes = Buffer.concat(entry.parts.map(p => f.files.get(p.path)));
  const part = entry.parts[0];
  f.files.set(part.path, bytes);
  entry.parts = [{...part, bytes: bytes.length, sha256: sha(bytes)}];
  assert.ok(bytes.length > 120000);
  const destination = path.join(temporaryDirectory(t), 'must-not-exist');
  assert.throws(() => restore({index: f.index, read: readFixture(f), destination}), /120000/i);
  assert.equal(fs.existsSync(destination), false);
});

test('R58 does not overwrite different existing evidence or write earlier entries', async t => {
  const restore = await restoreFunction();
  const f = fixture();
  const destination = temporaryDirectory(t);
  const conflict = path.join(destination, f.index.archives[1].path);
  fs.mkdirSync(path.dirname(conflict), {recursive: true});
  fs.writeFileSync(conflict, 'Existing evidence must survive');
  assert.throws(() => restore({index: f.index, read: readFixture(f), destination}), /overwrite/i);
  assert.equal(fs.readFileSync(conflict, 'utf8'), 'Existing evidence must survive');
  assert.equal(fs.existsSync(path.join(destination, f.index.archives[0].path)), false);
});

test('R58 rejects symlinked output parents without writing outside the destination', async t => {
  const restore = await restoreFunction();
  const f = fixture();
  const base = temporaryDirectory(t);
  const destination = path.join(base, 'restored');
  const outside = path.join(base, 'outside');
  fs.mkdirSync(destination);
  fs.mkdirSync(outside);
  fs.symlinkSync(outside, path.join(destination, 'reports'), 'dir');
  assert.throws(() => restore({index: f.index, read: readFixture(f), destination}), /symlink/i);
  assert.deepEqual(fs.readdirSync(outside), []);
  assert.equal(fs.existsSync(path.join(destination, 'docs')), false);
});


test('R58 CLI checks a synthetic package read-only and restores only on request', async t => {
  await restoreFunction();
  const f = fixture();
  const root = temporaryDirectory(t);
  const localScript = path.join(root, 'scripts/r58-restore-evidence-archives.mjs');
  fs.mkdirSync(path.dirname(localScript));
  fs.copyFileSync(script, localScript);
  const run = (...args) => spawnSync(process.execPath, [localScript, ...args], {encoding: 'utf8'});
  const absent = run();
  assert.equal(absent.status, 1);
  assert.match(absent.stderr, /not frozen/);
  assert.equal(fs.existsSync(path.join(root, 'reports')), false);
  for (const [reportPath, bytes] of f.files) {
    const target = path.join(root, reportPath);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, bytes);
  }
  fs.writeFileSync(path.join(root, 'reports/r58-transport/ARCHIVES.json'), JSON.stringify(f.index));
  const checked = run();
  assert.equal(checked.status, 0, checked.stderr);
  assert.equal(JSON.parse(checked.stdout).verified.length, 2);
  assert.equal(fs.existsSync(path.join(root, 'reports/r58-unified')), false);
  const destination = path.join(root, 'restored');
  const restored = run(destination);
  assert.equal(restored.status, 0, restored.stderr);
  for (const [reportPath, raw] of f.originals) assert.deepEqual(fs.readFileSync(path.join(destination, reportPath)), raw);
  const unexpected = run(destination, 'extra-argument');
  assert.equal(unexpected.status, 1);
  assert.match(unexpected.stderr, /Usage:/);
});

for (const reverse of [false, true]) {
  test(`R58 rejects conflicting planned output ancestry before writing, reverse=${reverse}`, async t => {
    const restore = await restoreFunction();
    const f = fixture();
    f.index.archives[0].path = 'reports/r58-unified/a.json';
    f.index.archives[1].path = 'reports/r58-unified/a.json/b.json';
    if (reverse) f.index.archives.reverse();
    const destination = path.join(temporaryDirectory(t), 'must-not-exist');
    assert.throws(() => restore({index: f.index, read: readFixture(f), destination}), /conflicting evidence paths/i);
    assert.equal(fs.existsSync(destination), false);
  });
}


test('R58 read API returns exact archived PNG bytes and preserves per-entry source commits', async t => {
  await restoreFunction();
  const {readR58Evidence, restoreR58Evidence} = await import(script);
  const f = fixture();
  const entry = f.index.archives[1];
  const oldPath = entry.path;
  const png = Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), syntheticBytes]);
  entry.path = 'docs/photo-fidelity/EVIDENCE/r58-synthetic/front-cpu.png';
  entry.kind = 'cpu-image';
  entry.sourceCommit = 'b'.repeat(40);
  entry.originalBytes = entry.containerBytes = png.length;
  entry.originalSha256 = entry.containerSha256 = sha(png);
  entry.originalGitBlob = blob(png);
  entry.parts = [];
  for (let offset = 0; offset < png.length; offset += 120000) {
    const bytes = png.subarray(offset, offset + 120000);
    const part = {index: entry.parts.length, path: `reports/r58-transport/parts/png.${entry.parts.length}.bin`, bytes: bytes.length, sha256: sha(bytes)};
    f.files.set(part.path, bytes); entry.parts.push(part);
  }
  assert.deepEqual(readR58Evidence(entry.path, {index: f.index, read: readFixture(f)}), png);
  assert.throws(() => readR58Evidence(oldPath, {index: f.index, read: readFixture(f)}), /not archived/i);
  assert.equal(restoreR58Evidence({index: f.index, read: readFixture(f)})[1].sourceCommit, 'b'.repeat(40));
});

test('R58 default filesystem reader rejects symlinked source part ancestry', async t => {
  const restore = await restoreFunction();
  const f = fixture();
  const root = temporaryDirectory(t), outside = temporaryDirectory(t);
  fs.mkdirSync(path.join(root, 'reports'));
  fs.symlinkSync(outside, path.join(root, 'reports/r58-transport'), 'dir');
  for (const [p, bytes] of f.files) {
    const target = path.join(outside, p.replace('reports/r58-transport/', ''));
    fs.mkdirSync(path.dirname(target), {recursive: true}); fs.writeFileSync(target, bytes);
  }
  assert.throws(() => restore({index: f.index, root}), /symlink/i);
});

for (const evidencePath of [
  'docs/photo-fidelity/QUEUE.json',
  'docs/photo-fidelity/RELEASES/R58-A.json',
  'docs/photo-fidelity/SOURCES.json',
  'docs/photo-fidelity/BASELINE-FIDELITY-SNAPSHOT.json',
  'docs/photo-fidelity/EVIDENCE/SOURCE-VIEWS.json',
  'reports/r58-example/reference/photo.png',
  'reports/r58-example/source-cache/photo.png',
  'docs/photo-fidelity/REVIEWS/official/example.png',
  'docs/photo-fidelity/REVIEWS/test/source.pdf',
]) {
  test(`R58 excludes protected source or canonical path ${evidencePath}`, async () => {
    const restore = await restoreFunction(), f = fixture(); f.index.archives[0].path = evidencePath;
    assert.throws(() => restore({index: f.index, read: readFixture(f)}), /evidence path/i);
  });
}

for (const dangling of [false, true]) {
  test(`R58 refuses a symlinked output file, dangling=${dangling}`, async t => {
    const restore = await restoreFunction(), f = fixture(), destination = temporaryDirectory(t);
    const target = path.join(destination, f.index.archives[0].path);
    const outside = path.join(destination, 'outside');
    if (!dangling) fs.writeFileSync(outside, f.originals.get(f.index.archives[0].path));
    fs.mkdirSync(path.dirname(target), {recursive: true}); fs.symlinkSync(outside, target);
    assert.throws(() => restore({index: f.index, read: readFixture(f), destination}), /symlink/i);
    assert.equal(fs.existsSync(path.join(destination, f.index.archives[1].path)), false);
    assert.equal(fs.existsSync(outside), !dangling);
  });
}
