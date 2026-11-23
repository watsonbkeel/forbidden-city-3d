import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {r33Scene} from './r33-scene-retention.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
const validPath = name => (name === 'package.json' || /^(src|data|tests\/lib)\//.test(name))
  && /^[A-Za-z0-9_.\/-]+$/.test(name) && !name.split('/').some(part => !part || part === '.' || part === '..');
function bind(name, bytes, pin) {
  assert.ok(pin, 'registered R33 native source: ' + name);
  assert.equal(bytes.length, pin.bytes, 'historical R33 byte count: ' + name);
  assert.equal(sha(bytes), pin.sha256, 'historical R33 SHA-256: ' + name);
  assert.equal(blob(bytes), pin.gitBlob, 'historical R33 Git blob: ' + name);
}
function phase(names, source, count, digest) {
  assert.equal(names.length, count, 'historical R33 runtime input count');
  assert.deepEqual(names, [...new Set(names)].sort(), 'canonical historical runtime list');
  const files = new Map(names.map(name => {
    assert.ok(source.has(name), 'registered historical runtime input: ' + name);
    return [name, source.get(name)];
  }));
  const rows = names.map(name => name + ' ' + blob(files.get(name))).join('\n') + '\n';
  assert.equal(sha(rows), digest, 'historical R33 runtime Git closure');
  return files;
}

// Exact published R33 and independently published earlier R32 runtime bytes.
// The additional 169-file retained-source comparison is historical too: it
// must not freeze unrelated edits to the live scene or substitute saved meshes.
export function stageNativeR33() {
  const data = gunzipSync(fs.readFileSync(new URL('../fixtures/r33-native-sources.json.gz', import.meta.url)),
    {maxOutputLength:2_266_115});
  assert.equal(sha(data), 'e6c1cbc235d1ecabb8da5a1e33ec434a64aea8dcfe179ab25c02df8ecd94ba9d',
    'immutable published R33 source archive');
  const archive = JSON.parse(data);
  assert.equal(archive.publishedCandidate, '3b9f01f1fafad61f7c23efee1f1bb0a37c2ed8fb');
  assert.equal(archive.publishedTree, '4f81cce5185002fdd52da92bd8bba5cc37aece74');
  assert.equal(archive.matchingIndependentR32PublishedRuntime, 'ce8915ab8a37cf6a180c60195e7f39abcecf28cc');
  assert.equal(archive.matchingIndependentR32PublishedTree, 'b9bc82618a44c8435d230642ceafbe1657f11247');
  const files = new Map();
  const retained = Object.keys(r33Scene.retainedSources);
  assert.equal(retained.length, 169);
  assert.equal(Object.keys(archive.files).length, 177);
  assert.deepEqual(Object.keys(archive.files), [...new Set([...retained, ...archive.afterModules])].sort());
  for (const [name, pin] of Object.entries(archive.files)) {
    assert.ok(validPath(name), 'canonical historical R33 path: ' + name);
    const bytes = Buffer.from(pin.utf8, 'utf8');
    bind(name, bytes, pin);
    if (Object.hasOwn(r33Scene.retainedSources, name)) {
      assert.equal(pin.sha256, r33Scene.retainedSources[name], 'independent R33 retained-source registry: ' + name);
    }
    files.set(name, bytes);
  }
  const oldSources = new Map(files);
  const prior = Object.keys(r33Scene.baselineSources).sort();
  assert.equal(prior.length, 11);
  assert.deepEqual(Object.keys(archive.changedBaselineSources).sort(), prior);
  for (const name of prior) {
    assert.ok(validPath(name), 'canonical historical R32 path: ' + name);
    const source = r33Scene.baselineSources[name], pin = archive.changedBaselineSources[name];
    const bytes = Buffer.from(source.utf8, 'utf8');
    assert.equal(source.sha256, pin.sha256, 'independent published R32 baseline: ' + name);
    assert.equal(source.bytes, pin.bytes, 'independent published R32 size: ' + name);
    bind(name, bytes, pin);
    oldSources.set(name, bytes);
  }
  const afterFiles = phase(archive.afterModules, files, 90, '3a6b6b07ec5804a4ec6c94213e9f400dadeca45dea2050b81cfdbf4de7a6b4b2');
  const beforeFiles = phase(archive.beforeModules, oldSources, 89, '3b680f4c346abb560d73601b07c67da1eda77519ca15d28251fbdc4463f87d39');
  const lock = JSON.parse(fs.readFileSync(new URL('../../package-lock.json', import.meta.url))).packages['node_modules/three'];
  for (const [key, value] of Object.entries(archive.three)) assert.equal(lock[key], value, 'historical Three.js lock: ' + key);
  const packages = new Map(['three', 'three/examples/jsm/utils/BufferGeometryUtils.js'].map(name => [name, import.meta.resolve(name)]));
  assert.equal(JSON.parse(fs.readFileSync(new URL('../package.json', packages.get('three')))).version, archive.three.version);

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'palace-r33-native-'));
  let hooks;
  const dispose = () => {
    if (hooks) { hooks.deregister(); hooks = undefined; }
    fs.rmSync(temp, {recursive:true, force:true});
  };
  const root = pathToFileURL(temp + path.sep);
  const phases = new Map([['before/', beforeFiles], ['after/', afterFiles]]);
  function lookup(url) {
    const suffix = url.slice(root.href.length);
    const key = suffix.slice(0, suffix.indexOf('/') + 1);
    const name = suffix.slice(key.length);
    assert.ok(validPath(name) && phases.get(key)?.has(name), 'registered historical R33 module: ' + suffix);
    return key;
  }
  try {
    for (const [key, epoch] of phases) for (const [name, bytes] of epoch) {
      const target = new URL(key + name, root);
      fs.mkdirSync(new URL('./', target), {recursive:true});
      fs.writeFileSync(target, bytes, {flag:'wx'});
    }
    hooks = registerHooks({
      resolve(name, context, next) {
        if (!context.parentURL?.startsWith(root.href)) return next(name, context);
        const key = lookup(context.parentURL);
        if (packages.has(name)) return {url:packages.get(name), shortCircuit:true};
        if (name === 'node:crypto') return next(name, context);
        assert.match(name, /^\.\.?\//, 'registered historical R33 import');
        const url = new URL(name, context.parentURL);
        assert.ok(url.href.startsWith(root.href + key), 'historical imports stay in their own epoch');
        lookup(url.href);
        return next(url.href, context);
      },
      load(url, context, next) {
        if (!url.startsWith(root.href)) return next(url, context);
        lookup(url);
        if (url.endsWith('.json')) {
          return {format:'module', source:'export default ' + fs.readFileSync(new URL(url), 'utf8'), shortCircuit:true};
        }
        return next(url, context);
      }
    });
    const readRetained = name => {
      assert.ok(Object.hasOwn(r33Scene.retainedSources, name), 'registered retained source: ' + name);
      return Buffer.from(files.get(name));
    };
    return {before:new URL('before/', root), after:new URL('after/', root), readRetained, dispose};
  } catch (error) {
    dispose();
    throw error;
  }
}
