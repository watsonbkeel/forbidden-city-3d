import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {r32CrestScene} from './r32-crest-scene-retention.mjs';

const repo = new URL('../../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, repo));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
const laterCrest = 'src/scene/palace/QianqingScreenCrest.js';
const friezePaint = 'src/scene/palace/QianqingFriezePaint.js';
const setting = 'src/scene/palace/QianqingCentralSetting.js';
const art = 'src/scene/palace/QianqingCentralArt.js';
// Exact native tree 1862fca (e4cba19...), not the later ce8915ab crest tree.
// Only CentralSetting's Git blob differs in the 87 common runtime files.
const settingPin = {bytes:9417, sha256:'aa186b449dd23a2675a9c2f037998c9b1576ca10b12332d812b16ae8d4656fe3',
  gitBlob:'95fa8259e32750a761e1aecffb0c3761575eb706'};
const preFriezePins = {
  [art]: {bytes:5478, sha256:'087020210cc88715d4cd03bdea87dfbf59004c0f7b6faa617b2d10064ef1113e', gitBlob:'7d8ec05f6060ddbb0d0a83562f39c3f57e65fe5e'},
  [setting]: settingPin
};
function manifest(name, limit, digest) {
  const bytes = gunzipSync(read('tests/fixtures/' + name), {maxOutputLength:limit});
  assert.equal(sha(bytes), digest, 'immutable historical source archive: ' + name);
  return JSON.parse(bytes);
}
function bind(name, bytes, pin) {
  assert.equal(bytes.length, pin.bytes, 'exact frieze epoch length: ' + name);
  assert.equal(sha(bytes), pin.sha256, 'exact frieze epoch SHA-256: ' + name);
  assert.equal(blob(bytes), pin.gitBlob, 'exact frieze epoch Git blob: ' + name);
}

/** Materialize the exact original frieze product closure plus its independent
 * pre-frieze input. No geometry, captures, or reversed results are stored. */
export function stageNativeR32Frieze(baselineSources) {
  const crest = manifest('r32-crest-native-sources.json.gz', 48_000, 'd95d6c993750d7edaaac1e02f735810240d52d8a235e6abe67e0e2c89140ea25');
  const resident = manifest('r32-resident-native-sources.json.gz', 320_000, '57cf4db48bfa9b72ada21417349937f0165abb7462d0f619960d2cf493953d48');
  assert.equal(crest.baselineCommit, '1862fca7108be8f2ae3b040a1f3b2390613ca596');
  assert.ok(Object.hasOwn(crest.files, laterCrest), 'known distinct later-only crest source');
  const names = Object.keys(crest.files).filter(name => name !== laterCrest).sort();
  assert.equal(names.length, 87);
  const publishedClosure = names.map(name => name + ' ' + (name === setting ? settingPin.gitBlob : crest.files[name].candidateGitBlob)).join('\n') + '\n';
  // Independently extracted from the real 1862fca Git tree and static imports.
  assert.equal(sha(publishedClosure), 'dbfcda7f683905df5e51d44192658481c4459e9d4f2d0cda71ddef5c05c17ddb', 'exact published 1862 frieze module closure');
  const after = new Map();
  for (const name of names) {
    assert.ok(name === 'package.json' || /^(src\/|data\/|tests\/lib\/)/.test(name), 'finite frieze native input: ' + name);
    assert.ok(!name.split('/').some(part => !part || part === '.' || part === '..'), 'canonical frieze native path');
    const row = crest.files[name], live = read(name);
    assert.equal(sha(live), row.successorSHA256, 'exact R32 frieze successor: ' + name);
    let bytes;
    let pin = {bytes:row.candidateBytes, sha256:row.candidateSHA256, gitBlob:row.candidateGitBlob};
    if (name === setting) {
      pin = settingPin;
      bytes = Buffer.from(r32CrestScene.baselineSources[name].utf8, 'utf8');
    } else if (row.input === 'live') bytes = live;
    else if (row.input === 'extra') bytes = Buffer.from(row.utf8, 'utf8');
    else {
      assert.equal(row.input, 'resident');
      assert.equal(resident.files[name].githubBlob, pin.gitBlob, 'same exact Git blob in resident archive: ' + name);
      bytes = Buffer.from(resident.files[name].utf8, 'utf8');
    }
    bind(name, bytes, pin);
    after.set(name, bytes);
  }
  const before = new Map(after);
  assert.equal(before.delete(friezePaint), true, 'frieze paint module belongs only to the after epoch');
  assert.deepEqual(Object.keys(baselineSources).sort(), Object.keys(preFriezePins).sort());
  for (const [name, pin] of Object.entries(preFriezePins)) {
    assert.ok(before.has(name), 'registered pre-frieze source: ' + name);
    const source = baselineSources[name], bytes = Buffer.from(source.utf8, 'utf8');
    assert.equal(source.sha256, pin.sha256, 'immutable 898b4e6 source registry: ' + name);
    bind(name, bytes, pin);
    before.set(name, bytes);
  }
  const lock = JSON.parse(read('package-lock.json')).packages['node_modules/three'];
  for (const [key, value] of Object.entries(crest.three)) assert.equal(lock[key], value, 'exact frieze Three.js lock: ' + key);
  const packages = new Map(['three','three/examples/jsm/utils/BufferGeometryUtils.js'].map(name => [name, import.meta.resolve(name)]));
  assert.equal(JSON.parse(fs.readFileSync(new URL('../package.json', packages.get('three')))).version, crest.three.version);
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'palace-r32-frieze-'));
  let hooks;
  const dispose = () => {
    hooks?.deregister();
    fs.rmSync(temp, {recursive:true, force:true});
  };
  try {
    for (const [phase, epoch] of [['before', before], ['after', after]]) for (const [name, bytes] of epoch) {
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
