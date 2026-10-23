import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {sha256, gitBlob, restoreR58Evidence} from '../scripts/r58-restore-evidence-archives.mjs';

const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root));
const direct = JSON.parse(read('reports/r58-transport/DIRECT-CPU-IMAGES.json'));
const archive = JSON.parse(read('reports/r58-transport/ARCHIVES.json'));

test('R58 direct CPU PNGs retain all 21 exact original containers and Git blobs', () => {
  assert.equal(direct.images.length, 21);
  for (const entry of direct.images) {
    const raw = read(entry.path);
    assert.equal(raw.length, entry.originalBytes, entry.path);
    assert.equal(sha256(raw), entry.originalSha256, entry.path);
    assert.equal(gitBlob(raw), entry.originalGitBlob, entry.path);
    assert.match(entry.sourceCommit, /^[a-f0-9]{40}$/);
    assert.deepEqual(raw.subarray(0, 8), Buffer.from('89504e470d0a1a0a', 'hex'));
  }
});

test('R58 report archives contain no PNG duplicate, missing part or orphan part', () => {
  assert.ok(archive.archives.length >= 66, 'Retain the frozen report set while allowing later distinct entries');
  for (const entry of archive.archives) {
    assert.equal(entry.kind, 'report');
    assert.match(entry.path, /\.json(?:\.gz)?$/);
    assert.equal(direct.images.some(image => image.path === entry.path), false);
  }
  const expected = archive.archives.flatMap(entry => entry.parts.map(part => part.path)).sort();
  const actual = fs.readdirSync(new URL('reports/r58-transport/parts/', root)).map(name => `reports/r58-transport/parts/${name}`).sort();
  assert.deepEqual(actual, expected);
  assert.equal(restoreR58Evidence({root: fileURLToPath(root)}).length, archive.archives.length);
});

test('R58 original SHA and Git-blob verification proofs survive direct PNG restoration', () => {
  const proofs = JSON.parse(read('reports/r58-transport/frozen-blob-verification.json'));
  for (const image of direct.images) {
    const proof = proofs.find(entry => entry.path === image.path);
    assert.ok(proof, image.path);
    assert.equal(proof.bytes, image.originalBytes);
    assert.equal(proof.sha256, image.originalSha256);
    assert.equal(proof.gitBlob, image.originalGitBlob);
    assert.equal(proof.sourceCommit, image.sourceCommit);
  }
});
