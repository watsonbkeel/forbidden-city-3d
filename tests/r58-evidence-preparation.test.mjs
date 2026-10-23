import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {readR58Evidence, restoreR58Evidence} from '../scripts/r58-restore-evidence-archives.mjs';

const moduleURL = new URL('../scripts/r58-prepare-evidence-archives.mjs', import.meta.url);
const randomBytes = Buffer.concat(Array.from({length: 9000}, (_, i) => createHash('sha256').update(`preparation fixture ${i}`).digest()));
const git = (root, ...args) => execFileSync('git', ['-C', root, ...args], {encoding: 'utf8'}).trim();
async function prepareFunction() {
  assert.ok(fs.existsSync(moduleURL), 'The frozen-source preparation script must exist');
  const module = await import(moduleURL);
  assert.equal(typeof module.prepareR58Evidence, 'function');
  return module.prepareR58Evidence;
}
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r58-preparation-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  git(root, 'init', '--quiet'); git(root, 'config', 'user.name', 'Transport Test'); git(root, 'config', 'user.email', 'transport-test@example.invalid');
  fs.writeFileSync(path.join(root, 'README.md'), 'Frozen test repository\n');
  git(root, 'add', '.'); git(root, 'commit', '--quiet', '-m', 'baseline');
  const baseCommit = git(root, 'rev-parse', 'HEAD');
  const originals = new Map([
    ['reports/r58-synthetic/report.json', Buffer.from(JSON.stringify({data: randomBytes.toString('base64')}))],
    ['docs/validation/r58-synthetic/front-cpu.png', Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), randomBytes])],
    ['docs/current-state/r58-synthetic/view.json.gz', gzipSync(randomBytes)],
  ]);
  for (const [p, raw] of originals) {fs.mkdirSync(path.dirname(path.join(root, p)), {recursive: true}); fs.writeFileSync(path.join(root, p), raw);}
  git(root, 'add', '.'); git(root, 'commit', '--quiet', '-m', 'freeze original evidence');
  return {root, baseCommit, sourceCommit: git(root, 'rev-parse', 'HEAD'), originals,
    paths: [...originals.keys()].map(p => ({path: p, kind: p.endsWith('.png') ? 'cpu-image' : 'report'}))};
}
const options = f => ({root: f.root, baseCommit: f.baseCommit, sourceCommit: f.sourceCommit, paths: f.paths});

test('R58 preparation is read-only by default and applied bytes equal frozen Git blobs', async t => {
  const prepare = await prepareFunction(), f = fixture(t);
  const planned = prepare(options(f));
  assert.equal(planned.applied, false);
  assert.equal(fs.existsSync(path.join(f.root, 'reports/r58-transport')), false);
  assert.equal(planned.index.archives.length, 3);
  const applied = prepare({...options(f), apply: true});
  assert.equal(applied.applied, true);
  for (const entry of applied.index.archives) {
    const raw = readR58Evidence(entry.path, {root: f.root});
    assert.deepEqual(raw, f.originals.get(entry.path));
    assert.equal(entry.originalGitBlob, git(f.root, 'rev-parse', `${entry.sourceCommit}:${entry.path}`));
    assert.deepEqual(raw, execFileSync('git', ['-C', f.root, 'show', `${entry.sourceCommit}:${entry.path}`]));
    assert.equal(fs.existsSync(path.join(f.root, entry.path)), false);
    for (const part of entry.parts) assert.ok(fs.statSync(path.join(f.root, part.path)).size <= 120000);
  }
  assert.equal(applied.index.archives.find(e => e.path.endsWith('.png')).encoding, 'identity');
  assert.equal(applied.index.archives.find(e => e.path.endsWith('.gz')).encoding, 'identity');
  assert.equal(applied.index.archives.find(e => e.path.endsWith('.json')).encoding, 'gzip');
  assert.equal(restoreR58Evidence({root: f.root}).length, 3);
});

test('R58 preparation extends an index without rebinding old entry source commits', async t => {
  const prepare = await prepareFunction(), f = fixture(t);
  const first = prepare({...options(f), paths: [f.paths[0]], apply: true});
  git(f.root, 'add', '.'); git(f.root, 'commit', '--quiet', '-m', 'first transport');
  const newer = git(f.root, 'rev-parse', 'HEAD');
  const second = prepare({...options(f), sourceCommit: newer, paths: f.paths.slice(1), apply: true});
  assert.deepEqual(second.index.archives[0], first.index.archives[0]);
  assert.equal(second.index.archives[1].sourceCommit, newer);
  assert.equal(restoreR58Evidence({root: f.root}).length, 3);
});

for (const [label, mutate, pattern] of [
  ['dirty original', f => fs.appendFileSync(path.join(f.root, f.paths[1].path), 'changed'), /differs from frozen/i],
  ['missing original', f => fs.unlinkSync(path.join(f.root, f.paths[1].path)), /ENOENT|missing/i],
  ['invalid source commit', f => {f.sourceCommit = 'HEAD';}, /full.*commit/i],
  ['duplicate selected path', f => f.paths.push(f.paths[0]), /duplicate/i],
  ['protected fixture path', f => {f.paths[0].path = 'tests/fixtures/r58-gallery-world-contract.json.gz';}, /evidence path/i],
  ['source traversal', f => {f.paths[0].path = 'reports/r58-synthetic/../outside.json';}, /evidence path/i],
  ['changed base exclusion', f => {f.baseCommit = f.sourceCommit;}, /changed.*base/i],
]) {
  test(`R58 preparation rejects ${label} before writing or removing originals`, async t => {
    const prepare = await prepareFunction(), f = fixture(t); mutate(f);
    assert.throws(() => prepare({...options(f), apply: true}), pattern);
    assert.equal(fs.existsSync(path.join(f.root, 'reports/r58-transport')), false);
    assert.ok(fs.existsSync(path.join(f.root, 'README.md')));
  });
}

test('R58 preparation refuses existing parts and leaves original evidence intact', async t => {
  const prepare = await prepareFunction(), f = fixture(t), plan = prepare(options(f));
  const collision = path.join(f.root, plan.index.archives[0].parts[0].path);
  fs.mkdirSync(path.dirname(collision), {recursive: true}); fs.writeFileSync(collision, 'existing');
  assert.throws(() => prepare({...options(f), apply: true}), /overwrite|exists/i);
  assert.equal(fs.readFileSync(collision, 'utf8'), 'existing');
  for (const [p, raw] of f.originals) assert.deepEqual(fs.readFileSync(path.join(f.root, p)), raw);
  assert.equal(fs.existsSync(path.join(f.root, 'reports/r58-transport/ARCHIVES.json')), false);
});

test('R58 preparation refuses source and archive parent symlinks', async t => {
  const prepare = await prepareFunction(), f = fixture(t);
  const first = path.join(f.root, f.paths[0].path), outside = path.join(f.root, 'outside-file');
  fs.renameSync(first, outside); fs.symlinkSync(outside, first);
  assert.throws(() => prepare({...options(f), apply: true}), /symlink/i);
  assert.equal(fs.existsSync(path.join(f.root, 'reports/r58-transport')), false);
  fs.unlinkSync(first); fs.renameSync(outside, first);
  const target = path.join(f.root, 'outside-directory'); fs.mkdirSync(target);
  fs.symlinkSync(target, path.join(f.root, 'reports/r58-transport'));
  assert.throws(() => prepare({...options(f), apply: true}), /symlink/i);
  assert.deepEqual(fs.readdirSync(target), []);
});

test('R58 preparation keeps small directly viewable evidence out of transport', async t => {
  const prepare = await prepareFunction(), f = fixture(t);
  const small = 'reports/r58-synthetic/small.png';
  fs.writeFileSync(path.join(f.root, small), Buffer.from('89504e470d0a1a0a', 'hex'));
  git(f.root, 'add', '.'); git(f.root, 'commit', '--quiet', '-m', 'small view');
  assert.throws(() => prepare({...options(f), sourceCommit: git(f.root, 'rev-parse', 'HEAD'), paths: [{path: small, kind: 'cpu-image'}], apply: true}), /small.*directly/i);
  assert.ok(fs.existsSync(path.join(f.root, small)));
});

test('R58 preparation refuses a corrupt existing archive before extending', async t => {
  const prepare = await prepareFunction(), f = fixture(t);
  const first = prepare({...options(f), paths: [f.paths[0]], apply: true});
  const corrupted = path.join(f.root, first.index.archives[0].parts[0].path);
  fs.appendFileSync(corrupted, 'corrupt');
  assert.throws(() => prepare({...options(f), paths: f.paths.slice(1), apply: true}), /corrupt/i);
  for (const selection of f.paths.slice(1)) assert.ok(fs.existsSync(path.join(f.root, selection.path)));
});

test('R58 preparation fails closed before exceeding the compact index transport ceiling', async t => {
  const prepare = await prepareFunction(), f = fixture(t);
  const first = prepare({...options(f), paths: [f.paths[0]], apply: true});
  first.index.operatorNote = 'x'.repeat(120000);
  const manifest = path.join(f.root, 'reports/r58-transport/ARCHIVES.json');
  fs.writeFileSync(manifest, JSON.stringify(first.index));
  const previous = fs.readFileSync(manifest);
  assert.throws(() => prepare({...options(f), paths: f.paths.slice(1), apply: true}), /index exceeds 120000/i);
  assert.deepEqual(fs.readFileSync(manifest), previous);
  for (const selection of f.paths.slice(1)) assert.ok(fs.existsSync(path.join(f.root, selection.path)));
});
