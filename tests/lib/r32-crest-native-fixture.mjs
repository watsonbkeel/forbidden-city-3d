import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';
import {gunzipSync} from 'node:zlib';

const repo = new URL('../../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, repo));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
function manifest(name, limit, digest) {
  const bytes = gunzipSync(read('tests/fixtures/' + name), {maxOutputLength:limit});
  assert.equal(sha(bytes), digest, 'immutable historical source archive: ' + name);
  return JSON.parse(bytes);
}
function bind(name, bytes, length, digest, git) {
  assert.equal(bytes.length, length, 'exact crest epoch length: ' + name);
  assert.equal(sha(bytes), digest, 'exact crest epoch SHA-256: ' + name);
  assert.equal(blob(bytes), git, 'exact crest epoch Git blob: ' + name);
}

// Keep both private trees separate from production imports and from one
// another. The source of the old central level is independently published,
// not a mesh, capture, or output of the reversal under test.
export function stageNativeR32Crest(baselineSources) {
  const crest = manifest('r32-crest-native-sources.json.gz', 48_000, 'd95d6c993750d7edaaac1e02f735810240d52d8a235e6abe67e0e2c89140ea25');
  const resident = manifest('r32-resident-native-sources.json.gz', 320_000, '57cf4db48bfa9b72ada21417349937f0165abb7462d0f619960d2cf493953d48');
  assert.equal(crest.candidateCommit, 'ce8915ab8a37cf6a180c60195e7f39abcecf28cc');
  assert.equal(crest.candidateTree, 'b9bc82618a44c8435d230642ceafbe1657f11247');
  assert.equal(crest.baselineCommit, '1862fca7108be8f2ae3b040a1f3b2390613ca596');
  assert.equal(Object.keys(crest.files).length, 88);
  assert.deepEqual(Object.keys(baselineSources).sort(), Object.keys(crest.baseline).sort());
  const files = new Map();
  for (const [name, row] of Object.entries(crest.files)) {
    assert.ok(name === 'package.json' || /^(src\/|data\/|tests\/lib\/)/.test(name), 'finite crest native input: ' + name);
    assert.ok(!name.split('/').some(part => !part || part === '.' || part === '..'), 'canonical crest native path');
    const live = read(name);
    assert.equal(sha(live), row.successorSHA256, 'exact R32 crest successor: ' + name);
    let bytes;
    if (row.input === 'live') bytes = live;
    else if (row.input === 'extra') bytes = Buffer.from(row.utf8, 'utf8');
    else {
      assert.equal(row.input, 'resident');
      assert.equal(resident.files[name].githubBlob, row.candidateGitBlob, 'same exact Git blob in resident archive: ' + name);
      bytes = Buffer.from(resident.files[name].utf8, 'utf8');
    }
    bind(name, bytes, row.candidateBytes, row.candidateSHA256, row.candidateGitBlob);
    files.set(name, bytes);
  }
  const baseline = new Map(files);
  assert.equal(baseline.delete('src/scene/palace/QianqingScreenCrest.js'), true, 'crest module belongs only to the after epoch');
  for (const [name, row] of Object.entries(crest.baseline)) {
    assert.ok(files.has(name), 'retained crest baseline input: ' + name);
    const source = baselineSources[name];
    assert.equal(source.sha256, row.sha256, 'independent published crest baseline: ' + name);
    const bytes = Buffer.from(source.utf8, 'utf8');
    bind(name, bytes, row.bytes, row.sha256, row.gitBlob);
    baseline.set(name, bytes);
  }
  const lock = JSON.parse(read('package-lock.json')).packages['node_modules/three'];
  for (const [key, value] of Object.entries(crest.three)) assert.equal(lock[key], value, 'exact crest Three.js lock: ' + key);
  const packages = new Map(['three','three/examples/jsm/utils/BufferGeometryUtils.js'].map(name => [name, import.meta.resolve(name)]));
  assert.equal(JSON.parse(fs.readFileSync(new URL('../package.json', packages.get('three')))).version, crest.three.version);
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'palace-r32-crest-'));
  let hooks;
  const dispose = () => {
    hooks?.deregister();
    fs.rmSync(temp, {recursive:true, force:true});
  };
  try {
    for (const [phase, epoch] of [['before', baseline], ['after', files]]) for (const [name, bytes] of epoch) {
      const target = path.join(temp, phase, name);
      fs.mkdirSync(path.dirname(target), {recursive:true});
      fs.writeFileSync(target, bytes, {flag:'wx'});
    }
    const root = pathToFileURL(temp + path.sep).href;
    hooks = registerHooks({
      resolve(name, context, next) {
        if (context.parentURL?.startsWith(root) && packages.has(name)) return {url:packages.get(name), shortCircuit:true};
        return next(name, context);
      },
      load(url, context, next) {
        if (url.startsWith(root) && url.endsWith('.json')) {
          return {format:'module', source:'export default ' + fs.readFileSync(new URL(url), 'utf8'), shortCircuit:true};
        }
        return next(url, context);
      }
    });
    return {before:new URL('before/', root), after:new URL('after/', root), dispose};
  } catch (error) {
    dispose();
    throw error;
  }
}
