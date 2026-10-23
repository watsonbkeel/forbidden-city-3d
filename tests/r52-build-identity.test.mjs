import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const modulePath = new URL('../scripts/build-identity.mjs', import.meta.url);
const available = fs.existsSync(modulePath);
const identity = available ? await import(modulePath) : {};

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'palace-build-identity-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'src'));
  fs.writeFileSync(path.join(root, 'src/app.js'), 'export const n = 1;');
  fs.writeFileSync(path.join(root, 'release.json'), '{"release":"R52"}');
  return root;
}

test('build metadata is deterministic for source bytes and base, not runtime HEAD', t => {
  assert.equal(typeof identity.createBuildInfo, 'function', 'build metadata generator is implemented');
  const root = fixture(t);
  const a = identity.createBuildInfo({ root, base: '/', sourceCommit: 'a'.repeat(40), sourceDirty: false });
  const b = identity.createBuildInfo({ root, base: '/', sourceCommit: 'b'.repeat(40), sourceDirty: false });
  assert.equal(a.release, 'R52');
  assert.equal(a.buildId, b.buildId);
  assert.equal(a.sourceFingerprint, b.sourceFingerprint);
  assert.match(a.sourceFingerprint, /^[a-f0-9]{64}$/);
  assert.equal(a.base, '/');
  const subpath = identity.createBuildInfo({ root, base: '/forbidden-city-3d/' });
  assert.notEqual(a.buildId, subpath.buildId);
  assert.equal(a.sourceFingerprint, subpath.sourceFingerprint);
  fs.mkdirSync(path.join(root, 'reports'));
  fs.writeFileSync(path.join(root, 'reports/note.txt'), 'test output does not alter built runtime');
  assert.equal(identity.createBuildInfo({ root }).buildId, a.buildId);
  fs.writeFileSync(path.join(root, 'src/app.js'), 'export const n = 2;');
  assert.notEqual(identity.createBuildInfo({ root }).sourceFingerprint, a.sourceFingerprint);
});

test('packaging rejects absent or stale build metadata before copying a package', t => {
  assert.equal(typeof identity.verifyBuildSource, 'function', 'source verification is implemented');
  const root = fixture(t), dist = path.join(root, 'dist');
  fs.mkdirSync(dist);
  assert.throws(() => identity.verifyBuildSource({ root, dist }), /build-info|build/i);
  const built = identity.createBuildInfo({ root, base: '/' });
  fs.writeFileSync(path.join(dist, 'build-info.json'), JSON.stringify(built));
  fs.mkdirSync(path.join(dist, 'assets'));
  fs.writeFileSync(path.join(dist, 'assets/app.js'), JSON.stringify(built));
  fs.writeFileSync(path.join(dist, 'index.html'), `<meta name="palace-build-id" content="${built.buildId}"><script type="module" src="/assets/app.js"></script>`);
  assert.deepEqual(identity.verifyBuildSource({ root, dist }), built);
  fs.writeFileSync(path.join(root, 'src/app.js'), 'changed after build');
  assert.throws(() => identity.verifyBuildSource({ root, dist }), /stale|fingerprint/i);
});

test('build metadata refuses remote or query-bearing base paths', t => {
  assert.equal(typeof identity.createBuildInfo, 'function');
  const root = fixture(t);
  for (const base of ['https://example.com/', '//example.com/', '/app/?token=secret', '/app/#fragment', '../']) {
    assert.throws(() => identity.createBuildInfo({ root, base }), /base/i);
  }
});


test('packaging rejects a current manifest mixed with old HTML or missing/old compiled JS', t => {
  const root=fixture(t),dist=path.join(root,'dist');fs.mkdirSync(path.join(dist,'assets'),{recursive:true});
  const info=identity.createBuildInfo({root});
  fs.writeFileSync(path.join(dist,'build-info.json'),JSON.stringify(info));
  const html=id=>`<meta name="palace-build-id" content="${id}"><script type="module" src="/assets/app.js"></script>`;
  fs.writeFileSync(path.join(dist,'index.html'),html('R51-old'));
  fs.writeFileSync(path.join(dist,'assets/app.js'),JSON.stringify(info));
  assert.throws(()=>identity.verifyBuildSource({root,dist}),/HTML|Mixed dist/);
  fs.writeFileSync(path.join(dist,'index.html'),html(info.buildId));
  fs.rmSync(path.join(dist,'assets/app.js'));
  assert.throws(()=>identity.verifyBuildSource({root,dist}),/JavaScript|Mixed dist/);
  fs.writeFileSync(path.join(dist,'assets/app.js'),'old compiled app');
  assert.throws(()=>identity.verifyBuildSource({root,dist}),/JavaScript|Mixed dist/);
});
