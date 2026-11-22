// Test-only, offline replay. Do not resolve historical code against live src/.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';

const fixture=new URL('../fixtures/r63-west-rear-south-windows/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('r62-compound-source-manifest.json',fixture),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex');
const archiveSHA256='36ea27e014cc9f8a9656d970f9177d074e6af4dfd06ad6015b88c27c3ac3ae19';
const compressed=readFileSync(new URL('r62-compound-source.json.gz',fixture));
assert.equal(manifest.archiveSHA256,archiveSHA256,'manifest R62 compound archive pin');
assert.equal(sha(compressed),archiveSHA256,'R62 compound archive hash');
const archive=JSON.parse(gunzipSync(compressed,{maxOutputLength:2_000_000}));
assert.deepEqual(Object.keys(archive),Object.keys(manifest.files),'complete historical runtime graph');
for(const [name,digest] of Object.entries(manifest.files)) assert.equal(sha(archive[name]),digest,name);
assert.equal(sha(archive['src/scene/zones/ZoneBase.js']),'b0016f34fa817b8986fc889e526ff89a0871dfa242e1ff7158c675d080582587','existing R62 ZoneBase pin');
assert.equal(sha(archive['data/zones/west-six.json']),'042285c8053df6586233b7827fefcbf0353bb08ada141e5c4a9784a8a61d72b7','delivered R62 west-six data');
const threePackage=new URL('../package.json',import.meta.resolve('three'));
assert.equal(JSON.parse(readFileSync(threePackage,'utf8')).version,manifest.three,'historical Three.js dependency');

// A virtual URL keeps original relative imports and source bytes intact. Only
// archived modules and the original Node/Three externals are admitted. The
// hook is gone before either historical or current route tests run.
const prefix='r62-west-six:/';
const expectedExternals=[
  'node:assert/strict',
  'node:crypto',
  'three',
  'three/addons/utils/BufferGeometryUtils.js',
  'three/examples/jsm/controls/PointerLockControls.js',
  'three/examples/jsm/utils/BufferGeometryUtils.js',
];
assert.deepEqual(manifest.externals,expectedExternals,'historical import inventory');
const externals=new Set(expectedExternals);
function historicalResolve(url){
  const path=url.slice(prefix.length);
  assert.ok(Object.hasOwn(archive,path),`missing historical module: ${path}`);
  return {url,shortCircuit:true};
}
const hooks=registerHooks({
  resolve(specifier,context,nextResolve){
    if(specifier.startsWith(prefix)) return historicalResolve(specifier);
    if(!context.parentURL?.startsWith(prefix)) return nextResolve(specifier,context);
    if(specifier.startsWith('./')||specifier.startsWith('../')) return historicalResolve(new URL(specifier,context.parentURL).href);
    assert.ok(externals.has(specifier),`unexpected historical external: ${specifier}`);
    return nextResolve(specifier,{...context,parentURL:import.meta.url});
  },
  load(url,context,nextLoad){
    if(!url.startsWith(prefix)) return nextLoad(url,context);
    return {format:url.endsWith('.json')?'json':'module',source:archive[url.slice(prefix.length)],shortCircuit:true};
  },
});
let ZoneBase, CollisionManager, realTextureLibrary;
export let replayHistoricalTerrace, replayHistoricalWestRearSouthDoorInWorld;
try {
  // The original DOM/canvas boundary only. Materials, contact and movement
  // still use the real R62 implementation in the rest of the archive.
  await import('r62-west-six:/tests/lib/inner-palace-fixture.mjs');
  ({ZoneBase}=await import('r62-west-six:/src/scene/zones/ZoneBase.js'));
  ({CollisionManager}=await import('r62-west-six:/src/utils/Collision.js'));
  ({realTextureLibrary}=await import('r62-west-six:/tests/lib/r48-real-texture-library.mjs'));
  ({replayTerrace:replayHistoricalTerrace}=await import('r62-west-six:/tests/lib/terrace-walk.mjs'));
  ({replayWestRearSouthDoorInWorld:replayHistoricalWestRearSouthDoorInWorld}=await import('r62-west-six:/tests/lib/r63-west-rear-windows-world-check.mjs'));
} finally { hooks.deregister(); }

export function historicalCompoundFixture(){
  const data=JSON.parse(archive['data/zones/west-six.json']);
  assert.equal(data.items.length,56);
  assert.equal(data.items[24].name,'储秀宫后殿');
  assert.equal(data.items[47].name,'咸福宫后殿');
  const lib=realTextureLibrary(),builder=new ZoneBase(lib,data),built=builder.build();
  const scene=new THREE.Scene(),cm=new CollisionManager();
  scene.add(built.group);scene.updateMatrixWorld(true);cm.rivers=[];
  cm.addColliders(built.colliders);cm.addWalkables(built.walkables);
  return {THREE,scene,cm,builder,built,lib,dispose(){builder.dispose();lib.dispose();}};
}
