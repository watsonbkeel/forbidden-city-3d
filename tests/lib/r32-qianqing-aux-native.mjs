import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {r32FriezeScene} from './r32-frieze-scene-retention.mjs';
import {stageNativeR32Frieze} from './r32-frieze-native-fixture.mjs';

const archiveSHA='998f7714d61d2148aeae39cb983cbfbe4529bc9d7efa72ebe26fe41eabbab51a';
const archivedExtras=[
  "assets-src/interiors/build_qianqing_auxiliary.py",
  "data/interiors/qianqing.json",
  "package-lock.json",
  "src/scene/interior/QianqingAuxiliaryContract.js",
  "src/scene/interior/QianqingAuxiliaryManifest.js",
  "src/scene/interior/QianqingAuxiliarySignature.js",
  "src/utils/TextureGenerator.js",
  "src/utils/TextureLibrary.js",
  "tests/current-state/r31-qianqing-material.test.mjs"
];
const retained={
  "assets-src/interiors/qianqing_surface.py": {
    "gitBlob": "8c51e9ee8617697f5d8b8c676452846796ffc575",
    "sha256": "7d036da5d51808c4f4b480d8392980e3d32157680701f931790639ffd266661e",
    "size": 4517
  },
  "data/architecture/qianqing-material.json": {
    "gitBlob": "f4979f09743b747fc2c8f7b1af7c8c6e5a1aa928",
    "sha256": "50e52fa4f3f18e946a9d836568a10356dda1a8479ff91744c8107957dc868b7e",
    "size": 877
  },
  "public/models/interiors/qianqing-r29.glb": {
    "gitBlob": "d6b3e6a833150895afdd51e85e648f3fc61d1c05",
    "sha256": "5247ce8137b6891ac385c2d5a37535074e459c72e4b25625222f014138c7650f",
    "size": 599584
  },
  "public/models/interiors/qianqing-r31.glb": {
    "gitBlob": "1a3bf4336948f05639a1e79f98f11ac80bcbc195",
    "sha256": "76b14ddf270ba1a6c1d0109b47c7c99f441af49b469c908f5af41d93697d3d5d",
    "size": 641840
  },
  "public/models/interiors/qianqing-r32.glb": {
    "gitBlob": "608252446c75d1fe95896580ee026f5e1e6a9289",
    "sha256": "6e55cd07c32e01343d0b25da259317017b2bc13b0564347d0861db9c2dae5bfa",
    "size": 502920
  }
};
const three={
  "package.json": {
    "sha256": "2c5b740385ede44b4963ef366c3d29dd8e2e542a354af0ae2063f7dcb3dcde30",
    "size": 4167
  },
  "build/three.module.js": {
    "sha256": "ec3ddc3897ec75288b5502057456c471c2eb7d6e7cf36140d0a5224e94a1984b",
    "size": 1285851
  },
  "examples/jsm/loaders/GLTFLoader.js": {
    "sha256": "d073b438e6a07e1359741dd5d6c76c953420cc0d4fd84eb1bdde94315540e6a3",
    "size": 108522
  },
  "examples/jsm/utils/BufferGeometryUtils.js": {
    "sha256": "b0c64fe6f3b9907262921b73fafc4ade874c07ba6b4876e164c87a830c2c2113",
    "size": 31554
  }
};
const publishedThree={
  "version": "0.162.0",
  "resolved": "https://registry.npmjs.org/three/-/three-0.162.0.tgz",
  "integrity": "sha512-xfCYj4RnlozReCmUd+XQzj6/5OjDNHBy5nT6rVwrOKGENAvpXe2z1jL+DZYaMu4/9pNsjH/4Os/VvS9IrH7IOQ==",
  "license": "MIT"
};
const originalSuite='tests/current-state/r31-qianqing-material.test.mjs';
const originalCase='actual exported bytes, source/profile and all 27 collision/walking proxies are bound; old asset retained';
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const gitBlob=bytes=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');

function bind(bytes, pin, name) {
  assert.equal(bytes.length,pin.size,name+' exact bytes');
  assert.equal(sha256(bytes),pin.sha256,name+' exact SHA-256');
  if (pin.gitBlob) assert.equal(gitBlob(bytes),pin.gitBlob,name+' exact Git blob');
}

function stageExtras(root) {
  const compressed=readFileSync(new URL('../fixtures/r32-qianqing-aux-native-delta.json.gz',import.meta.url));
  assert.equal(sha256(compressed),archiveSHA,'exact published R32 Qianqing archival delta');
  const delta=JSON.parse(gunzipSync(compressed,{maxOutputLength:76235}));
  assert.equal(delta.commit,'1862fca7108be8f2ae3b040a1f3b2390613ca596');
  assert.equal(delta.tree,'e4cba19bcfabcaa82b5ed8d5501125d4edd3ed9d');
  assert.deepEqual(delta.externals,["node:assert/strict", "node:crypto", "node:fs", "node:module", "node:test", "three", "three/examples/jsm/loaders/GLTFLoader.js", "three/examples/jsm/utils/BufferGeometryUtils.js"]);
  assert.deepEqual(Object.keys(delta.files).sort(),archivedExtras);
  const inputs=new Map();
  for (const name of archivedExtras) {
    const pin=delta.files[name],bytes=Buffer.from(pin.payload,'utf8');
    assert.equal(bytes.toString('utf8'),pin.payload,name);
    bind(bytes,pin,name);
    inputs.set(name,bytes);
  }
  assert.equal(sha256(inputs.get(originalSuite)),'0a58a7e67e5456168924d2465ffb836c7a3661ca2e2599c554016b4fe1a7301b','unchanged authored R32 callback file');
  assert.deepEqual(JSON.parse(inputs.get('package-lock.json')).packages['node_modules/three'],publishedThree);
  for (const [name,pin] of Object.entries(retained)) {
    const bytes=readFileSync(new URL('../../'+name,import.meta.url));
    bind(bytes,pin,name);
    inputs.set(name,bytes);
  }
  for (const [name,bytes] of inputs) {
    const target=new URL(name,root);
    mkdirSync(new URL('.',target),{recursive:true});
    writeFileSync(target,bytes,{flag:'wx',mode:0o444});
  }
  const dir=fileURLToPath(root);
  const entries=readdirSync(dir,{recursive:true,withFileTypes:true});
  assert.ok(entries.every(e=>e.isFile()||e.isDirectory()),'exact owned historical inputs');
  const names=entries.filter(e=>e.isFile()).map(e=>path.relative(dir,path.join(e.parentPath,e.name)).split(path.sep).join('/')).sort();
  assert.equal(names.length,101,'same closure as published 1862fca Qianqing inputs');
  const digests=names.map(name=>[name,readFileSync(new URL(name,root))]);
  assert.equal(sha256(digests.map(([name,b])=>name+' '+gitBlob(b)+'\n').join('')),'55cc4e3f2f3b94d86275a1615f8e41d9e546919aa287308ac38111c9cfbdea76','published entire Qianqing closure Git roster');
  assert.equal(sha256(digests.map(([name,b])=>name+' '+sha256(b)+'\n').join('')),'0dd2fa7954eeb7f1d1f716009f56c68fc841fc47c7b3986dcdb5b6136e3d907f','published entire Qianqing closure SHA roster');

  const threeRoot=new URL('../',import.meta.resolve('three'));
  for (const [name,pin] of Object.entries(three)) {
    const bytes=readFileSync(new URL(name,threeRoot));
    bind(bytes,pin,'same exact Three.js '+name);
    const target=new URL('node_modules/three/'+name,root);
    mkdirSync(new URL('.',target),{recursive:true});
    writeFileSync(target,bytes,{flag:'wx',mode:0o444});
  }
}

function checkExactTAP(text,name){
  const rows=text.replaceAll('\r\n','\n').trimEnd().split('\n');
  assert.equal(rows[0],'TAP version 13');
  assert.deepEqual(rows.filter(row=>row.startsWith('# Subtest: ')),['# Subtest: '+name]);
  assert.deepEqual(rows.filter(row=>/^\s*(?:not )?ok \d+ - /.test(row)),['ok 1 - '+name]);
  assert.deepEqual(rows.filter(row=>/^\d+\.\.\d+/.test(row)),['1..1']);
  for(const [key,expected] of Object.entries({tests:1,suites:0,pass:1,fail:0,cancelled:0,skipped:0,todo:0})){
    assert.deepEqual(rows.filter(row=>row.startsWith('# '+key+' ')),['# '+key+' '+expected]);
  }
}

// Integrity fixture, not a security sandbox. Execute the untouched original
// exported-bytes/collision geometry callback in the authenticated R32 tree.
// The four neighbouring cases still exercise today's usual production imports.
export function replayHistoricalR32QianqingAuxiliary() {
  const frozen=stageNativeR32Frieze(r32FriezeScene.baselineSources);
  try {
    stageExtras(frozen.after);
    const selector='^'+originalCase.replace(/[.*+?^$()|[\]\\]/g,'\\$&')+'$';
    const env={TZ:'UTC',LC_ALL:'C'};
    const systemRoot=process.platform==='win32'&&(process.env.SystemRoot??process.env.SYSTEMROOT);
    if(systemRoot)env.SystemRoot=systemRoot;
    const r=spawnSync(process.execPath,['--max-old-space-size=768','--test','--test-concurrency=1',
      '--test-reporter=tap','--test-name-pattern='+selector,originalSuite],
      {cwd:frozen.after,env,encoding:'utf8',timeout:25_000,maxBuffer:768_000,windowsHide:true});
    assert.ifError(r.error);
    assert.equal(r.signal,null,r.stderr);
    assert.equal(r.status,0,r.stdout+'\n'+r.stderr);
    checkExactTAP(r.stdout,originalCase);
  } finally {
    frozen.dispose();
  }
}
