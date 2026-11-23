import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {r34Scene} from './r34-scene-retention.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const validPath = name => (name === 'package.json' || /^(src|data|tests\/lib)\//.test(name))
  && /^[A-Za-z0-9_.\/-]+$/.test(name) && !name.split('/').some(part => !part || part === '.' || part === '..');
const phases = {
  scene:[92,'8ee9f8174366b8f981248adaaf0c1358923ef993bb61e0b4172a7b21afb7fad9'],
  light:[13,'625c880990089f79fe52bbc8b4ee6533448411234dfde8968ad3a8c91bc467f9'],
  prior:[90,'3a6b6b07ec5804a4ec6c94213e9f400dadeca45dea2050b81cfdbf4de7a6b4b2']
};
function readArchive(name, maxOutputLength, digest) {
  const raw = gunzipSync(fs.readFileSync(new URL('../fixtures/' + name, import.meta.url)), {maxOutputLength});
  assert.equal(sha(raw), digest, 'immutable independently published source archive: ' + name);
  return JSON.parse(raw);
}
function bind(name, bytes, record) {
  assert.ok(validPath(name) && record, 'registered historical R34 source: ' + name);
  assert.equal(bytes.length, record.bytes, 'published source size: ' + name);
  assert.equal(sha(bytes), record.sha256, 'published source SHA-256: ' + name);
  assert.equal(blob(bytes), record.gitBlob, 'published source Git blob: ' + name);
}
function phase(names, source, [count,digest]) {
  assert.equal(names.length, count, 'closed historical runtime count');
  assert.deepEqual(names, [...new Set(names)].sort());
  const map = new Map(names.map(n => {
    assert.ok(source.has(n), 'closed historical runtime source: ' + n);
    return [n, source.get(n)];
  }));
  assert.equal(sha(names.map(n => n + ' ' + blob(map.get(n))).join('\n') + '\n'), digest, 'closed historical runtime Git closure');
  return map;
}

/** Actual authored R34 source, not a restored capture. Reuse identical R33
 * archive bytes by exact Git identity only; never borrow current game sources.
 * Lighting materializes only its 13-file runtime, not the resident scene. */
export function stageNativeR34(mode) {
  assert.ok(mode === 'scene' || mode === 'light', 'registered R34 replay mode');
  const source = readArchive('r34-resident-night-native-delta.json.gz', 168_692,
    '55d22d6d5a015b0da36369cdbdc45999d68e8f0c282446bbc9635271a0296263');
  const prior = readArchive('r33-native-sources.json.gz', 2_266_115,
    'e6c1cbc235d1ecabb8da5a1e33ec434a64aea8dcfe179ab25c02df8ecd94ba9d');
  assert.equal(source.publishedR34, '12682c3d1bcf2b5da13a18fda7d07b4a31f0c274');
  assert.equal(source.publishedR34Tree, '8c8252249bbd261f96abed9c0e413ffc21269ce3');
  assert.equal(source.publicR33, '3b9f01f1fafad61f7c23efee1f1bb0a37c2ed8fb');
  assert.equal(source.publicR33Tree, '4f81cce5185002fdd52da92bd8bba5cc37aece74');
  assert.equal(prior.publishedCandidate, source.publicR33);
  assert.equal(prior.publishedTree, source.publicR33Tree);
  const retained = Object.keys(r34Scene.retainedSources);
  assert.equal(retained.length, 169);
  const paths = [...new Set([...retained,...source.modes.scene,...source.modes.light])].sort();
  assert.equal(paths.length, 182);
  assert.deepEqual(Object.keys(source.inputs), paths);
  assert.equal(Object.keys(source.extra).length, 13);
  assert.deepEqual(Object.keys(source.extra), paths.filter(n => prior.files[n]?.gitBlob !== source.inputs[n].gitBlob));
  const files = new Map();
  for (const name of mode === 'scene' ? paths : source.modes.light) {
    const record = source.inputs[name];
    const bytes = Buffer.from(Object.hasOwn(source.extra, name) ? source.extra[name] : prior.files[name].utf8, 'utf8');
    bind(name, bytes, record);
    if (Object.hasOwn(r34Scene.retainedSources,name)) {
      assert.equal(record.sha256,r34Scene.retainedSources[name], 'R34 retained-source registry: ' + name);
    }
    files.set(name,bytes);
  }
  const after = phase(source.modes[mode], files, phases[mode]);
  const mounts = new Map([['after/', after]]);
  if (mode === 'scene') {
    const baseline = Object.keys(source.baselineSources);
    assert.equal(baseline.length, 13);
    assert.deepEqual(baseline, Object.keys(r34Scene.baselineSources).sort());
    for (const name of baseline) {
      const record = r34Scene.baselineSources[name], pin = source.baselineSources[name];
      assert.equal(record.sha256,pin.sha256);
      assert.equal(record.bytes,pin.bytes);
      bind(name,Buffer.from(record.utf8,'utf8'),pin);
      if (prior.afterModules.includes(name)) assert.equal(prior.files[name].gitBlob,pin.gitBlob,'same independent prior bytes');
    }
    const old = new Map(prior.afterModules.map(name => {
      const row=prior.files[name], bytes=Buffer.from(row.utf8,'utf8');bind(name,bytes,row);return [name,bytes];
    }));
    mounts.set('before/', phase(prior.afterModules, old, phases.prior));
  }
  const lock = JSON.parse(fs.readFileSync(new URL('../../package-lock.json', import.meta.url))).packages['node_modules/three'];
  for (const [key, value] of Object.entries(source.three)) assert.equal(lock[key], value, 'historical Three.js lock: ' + key);
  const packages = new Map(['three','three/examples/jsm/utils/BufferGeometryUtils.js'].map(name => [name,import.meta.resolve(name)]));
  assert.equal(JSON.parse(fs.readFileSync(new URL('../package.json',packages.get('three')))).version,source.three.version);

  const temp = fs.mkdtempSync(path.join(os.tmpdir(),'palace-r34-native-'));
  const root = pathToFileURL(temp + path.sep);
  let hooks;
  const dispose = () => {
    if (hooks) { hooks.deregister(); hooks = undefined; }
    fs.rmSync(temp,{recursive:true,force:true});
  };
  function lookup(url) {
    const suffix=url.slice(root.href.length), phase=suffix.slice(0,suffix.indexOf('/')+1);
    const name=suffix.slice(phase.length);
    assert.ok(validPath(name) && mounts.get(phase)?.has(name),'registered historical R34 module: ' + suffix);
    return phase;
  }
  try {
    for (const [key, contents] of mounts) for (const [name,bytes] of contents) {
      const dest=new URL(key+name,root);
      fs.mkdirSync(new URL('./',dest),{recursive:true});
      fs.writeFileSync(dest,bytes,{flag:'wx',mode:0o444});
    }
    hooks=registerHooks({
      resolve(name,context,next) {
        if (!context.parentURL?.startsWith(root.href)) return next(name,context);
        const phase=lookup(context.parentURL);
        if (packages.has(name)) return {url:packages.get(name),shortCircuit:true};
        if (name==='node:crypto') return next(name,context);
        assert.match(name,/^\.\.?\//,'registered historical R34 import');
        const url=new URL(name,context.parentURL);
        assert.ok(url.href.startsWith(root.href+phase),'historical R34 imports remain in their own epoch');
        lookup(url.href);
        return next(url.href,context);
      },
      load(url,context,next) {
        if (!url.startsWith(root.href)) return next(url,context);
        lookup(url);
        return url.endsWith('.json')
          ? {format:'module',source:'export default ' + fs.readFileSync(new URL(url),'utf8'),shortCircuit:true}
          : next(url,context);
      }
    });
    const readRetained = name => {
      assert.ok(mode==='scene'&&Object.hasOwn(r34Scene.retainedSources,name),'registered R34 retained source');
      return Buffer.from(files.get(name));
    };
    const readIntegratedEnvironment = () => {
      assert.equal(mode,'light','R34 historical lighting mode');
      return Buffer.from(files.get('src/scene/Environment.js'));
    };
    return {after:new URL('after/',root),before:mode==='scene'?new URL('before/',root):null,
      readRetained,readIntegratedEnvironment,dispose};
  } catch(error) {
    dispose();
    throw error;
  }
}
