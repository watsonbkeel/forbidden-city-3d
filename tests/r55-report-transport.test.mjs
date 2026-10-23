import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';

const script = new URL('../scripts/r55-restore-report-archives.mjs', import.meta.url);
const sha = (bytes, algorithm = 'sha256') => createHash(algorithm).update(bytes).digest('hex');
const blob = bytes => sha(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes]), 'sha1');
const syntheticBytes = Buffer.concat(Array.from({length: 8000}, (_, i) =>
  createHash('sha256').update(`Synthetic report record ${i}`).digest()));

function fixture() {
  const originals = new Map([
    ['reports/r55-unified/synthetic.json', Buffer.from(JSON.stringify({data: syntheticBytes.toString('base64')}))],
    ['docs/validation/r55-kunning-low-stoves/synthetic-motion.json.gz', gzipSync('Exact synthetic motion evidence\n')],
  ]);
  const files = new Map();
  const archives = [...originals].map(([reportPath, raw], n) => {
    const encoding = reportPath.endsWith('.gz') ? 'identity' : 'gzip';
    const packed = encoding === 'gzip' ? gzipSync(raw) : raw;
    const parts = [];
    for (let offset = 0; offset < packed.length; offset += 120000) {
      const bytes = packed.subarray(offset, offset + 120000);
      const partPath = `reports/r55-transport/parts/${n}.${String(parts.length).padStart(3, '0')}.bin`;
      files.set(partPath, Buffer.from(bytes));
      parts.push({index: parts.length, path: partPath, bytes: bytes.length, sha256: sha(bytes)});
    }
    return {path: reportPath, encoding, originalBytes: raw.length, originalSha256: sha(raw),
      originalGitBlob: blob(raw), containerBytes: packed.length, containerSha256: sha(packed), parts};
  });
  return {originals, files, index: {schemaVersion: 1, originalFrozenLocalCommit: 'a'.repeat(40),
    maximumPartBytes: 120000, archives}};
}

async function restoreFunction() {
  assert.ok(fs.existsSync(script), 'The additive R55 restore/check script must exist');
  const module = await import(script);
  assert.equal(typeof module.restoreR55Reports, 'function');
  return module.restoreR55Reports;
}

function temporaryDirectory(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'r55-transport-test-'));
  t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  return directory;
}

function readFixture(f) {
  return reportPath => {
    if (!f.files.has(reportPath)) throw Error(`Missing synthetic part: ${reportPath}`);
    return f.files.get(reportPath);
  };
}

test('R55 restores exact gzip and identity bytes and verifies without writing', async t => {
  const restore = await restoreFunction();
  const f = fixture();
  assert.ok(f.index.archives[0].parts.length > 1, 'Exercise actual multi-part concatenation');
  const result = restore({index: f.index, read: readFixture(f)});
  assert.deepEqual(result, f.index.archives.map(e => ({path: e.path, bytes: e.originalBytes,
    sha256: e.originalSha256, gitBlob: e.originalGitBlob})));
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
  ['unfrozen source commit', f => { delete f.index.originalFrozenLocalCommit; }, /commit/i],
  ['changed schema', f => { f.index.schemaVersion = 2; }, /schema/i],
  ['oversized part limit', f => { f.index.maximumPartBytes = 120001; }, /120000/i],
  ['empty part list', f => { f.index.archives[0].parts = []; }, /part/i],
  ['duplicate original path', f => { f.index.archives[1].path = f.index.archives[0].path; }, /duplicate/i],
  ['duplicate part path', f => { f.index.archives[1].parts[0].path = f.index.archives[0].parts[0].path; }, /duplicate/i],
  ['part outside report storage', f => { f.index.archives[0].parts[0].path = 'public/models/asset.bin'; }, /part path/i],
];

for (const [name, mutate, error] of failures) {
  test(`R55 ${name} fails closed before creating any output`, async t => {
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
  'tests/fixtures/r55-zhonghe-before.json',
  'src/scene/characters/CharacterSystem.js',
  'data/interiors/kunning.json',
  'docs/validation/r55-zhonghe-display/neutral/geometry-and-navigation.json',
  'docs/validation/r55-zhonghe-display/neutral/front.png',
  'reports/r55-transport/ARCHIVES.json',
  'reports/r55-unified/../outside.json',
  'reports/r55-unified/./synthetic.json',
  'reports/r55-unified//synthetic.json',
  'reports/r55-unified/synthetic\\file.json',
  '/reports/r55-unified/synthetic.json',
]) {
  test(`R55 rejects ineligible report path ${reportPath}`, async t => {
    const restore = await restoreFunction();
    const f = fixture();
    f.index.archives[0].path = reportPath;
    const destination = path.join(temporaryDirectory(t), 'must-not-exist');
    assert.throws(() => restore({index: f.index, read: readFixture(f), destination}), /report path/i);
    assert.equal(fs.existsSync(destination), false);
  });
}

test('R55 enforces the binary part size even when hashes are otherwise valid', async t => {
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

test('R55 does not overwrite different existing evidence or write earlier entries', async t => {
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

test('R55 rejects symlinked output parents without writing outside the destination', async t => {
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


test('R55 CLI checks a synthetic package read-only and restores only on request', async t => {
  await restoreFunction();
  const f = fixture();
  const root = temporaryDirectory(t);
  const localScript = path.join(root, 'scripts/r55-restore-report-archives.mjs');
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
  fs.writeFileSync(path.join(root, 'reports/r55-transport/ARCHIVES.json'), JSON.stringify(f.index));
  const checked = run();
  assert.equal(checked.status, 0, checked.stderr);
  assert.equal(JSON.parse(checked.stdout).verified.length, 2);
  assert.equal(fs.existsSync(path.join(root, 'reports/r55-unified')), false);
  const destination = path.join(root, 'restored');
  const restored = run(destination);
  assert.equal(restored.status, 0, restored.stderr);
  for (const [reportPath, raw] of f.originals) assert.deepEqual(fs.readFileSync(path.join(destination, reportPath)), raw);
  const unexpected = run(destination, 'extra-argument');
  assert.equal(unexpected.status, 1);
  assert.match(unexpected.stderr, /Usage:/);
});

for (const reverse of [false, true]) {
  test(`R55 rejects conflicting planned output ancestry before writing, reverse=${reverse}`, async t => {
    const restore = await restoreFunction();
    const f = fixture();
    f.index.archives[0].path = 'reports/r55-unified/a.json';
    f.index.archives[1].path = 'reports/r55-unified/a.json/b.json';
    if (reverse) f.index.archives.reverse();
    const destination = path.join(temporaryDirectory(t), 'must-not-exist');
    assert.throws(() => restore({index: f.index, read: readFixture(f), destination}), /conflicting report paths/i);
    assert.equal(fs.existsSync(destination), false);
  });
}
