import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {r32FriezeScene} from './r32-frieze-scene-retention.mjs';
import {stageNativeR32Frieze} from './r32-frieze-native-fixture.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
const art = 'src/scene/palace/QianqingCentralArt.js';
const setting = 'src/scene/palace/QianqingCentralSetting.js';
const ceiling = 'src/scene/palace/QianqingCeiling.js';
const screenPaint = 'src/scene/palace/QianqingScreenPaint.js';
const ceilingPaint = 'src/scene/palace/QianqingCeilingPaint.js';
const prior = {
  [art]: {bytes:4336, sha256:'189ea53d720c3ad82bdc5f5d57eb9049dcd6d3b296c0e41762a5c96542db4e4b', gitBlob:'05ed432b0add448751f8488ce78f1e0ab0836baf'},
  [setting]: {bytes:9358, sha256:'3350402d42f73ec17d9ec85d6142ca05075c33d51f62294c2e4d4c363fcaa701', gitBlob:'ef56db3bb19254d68a68f767345d7b24d741df95'},
  [ceiling]: {bytes:2875, sha256:'8ae1752c18f7f325101a0e61bcf736e3bdb25cda883fd850d154caa245ec9fa9', gitBlob:'9e376cad45eefd506b3cc60bbc148acf1b1a669e'}
};
function exactClosure(url, count, digest, label) {
  const absolute = fileURLToPath(url);
  const entries = fs.readdirSync(absolute, {recursive:true, withFileTypes:true});
  assert.ok(entries.every(entry => entry.isFile() || entry.isDirectory()), 'only owned native screen inputs');
  const names = entries.filter(entry => entry.isFile()).map(entry =>
    path.relative(absolute, path.join(entry.parentPath, entry.name)).split(path.sep).join('/')).sort();
  assert.equal(names.length, count, label);
  const rows = names.map(name => name + ' ' + blob(fs.readFileSync(new URL(name, url)))).join('\n') + '\n';
  assert.equal(sha(rows), digest, label);
}

/** The public 1862fca test actually builds d5, then performs its exact
 * frieze-metadata inverse for a9. Independently reproduce the two older
 * source phases as well; never materialize a stored capture or mesh. */
export function stageNativeR32Screen(baselineSources) {
  assert.deepEqual(Object.keys(baselineSources).sort(), Object.keys(prior).sort());
  const old = new Map();
  for (const [name, pin] of Object.entries(prior)) {
    // These three independent original fixture strings match the public
    // d0c7342 Git tree (86a751). afb retains the newer ceiling instead.
    const source = baselineSources[name], bytes = Buffer.from(source.utf8, 'utf8');
    assert.equal(bytes.length, pin.bytes, 'exact older screen source length: ' + name);
    assert.equal(source.sha256, pin.sha256, 'exact older screen source registry: ' + name);
    assert.equal(sha(bytes), pin.sha256, 'exact older screen SHA-256: ' + name);
    assert.equal(blob(bytes), pin.gitBlob, 'exact older screen Git blob: ' + name);
    old.set(name, bytes);
  }
  // Inherit the independently authenticated 87-file d5 runtime and its scoped
  // loader. Repurpose only that helper's private pre-frieze tree as pre-screen;
  // neither production files nor the verified d5 root are edited.
  const staged = stageNativeR32Frieze(r32FriezeScene.baselineSources);
  try {
    const before = staged.before, original = new URL('../before-ceiling/', before);
    for (const name of [art, setting]) fs.writeFileSync(new URL(name, before), old.get(name), {flag:'w'});
    fs.unlinkSync(new URL(screenPaint, before));
    exactClosure(before, 85, '9423f744d12fbc565313fc9c3f602df5a99e4663bba2bcb80c0e9296405a1831', 'exact afb pre-screen module closure');
    fs.cpSync(path.resolve(fileURLToPath(before)), path.resolve(fileURLToPath(original)),
      {recursive:true, errorOnExist:true, force:false});
    fs.writeFileSync(new URL(ceiling, original), old.get(ceiling), {flag:'w'});
    fs.unlinkSync(new URL(ceilingPaint, original));
    // Complete 83 used runtime modules + package.json, independently pinned
    // to the actual d0c7342 Git tree, not derived from candidate assertions.
    exactClosure(original, 84, 'f624eccf20342a442db2d1bdf8ef2d838dd6b64dccd93d61f12582266467fc85', 'exact published 86a pre-ceiling module closure');
    return {after:staged.after, before, original, dispose:staged.dispose};
  } catch (error) {
    staged.dispose();
    throw error;
  }
}
