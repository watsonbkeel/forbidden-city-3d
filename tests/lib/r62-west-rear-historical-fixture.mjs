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
// Virtual URLs preserve original relative imports and source bytes. The hook
// is removed before tests run; it never handles paths outside this epoch.
async function restoreEpoch(version,sources){
  const prefix=`r${version}-west-six:/`;
  function historicalResolve(url){
    const path=url.slice(prefix.length);
    assert.ok(Object.hasOwn(sources,path),`missing historical module: ${path}`);
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
      return {format:url.endsWith('.json')?'json':'module',source:sources[url.slice(prefix.length)],shortCircuit:true};
    },
  });
  const from=path=>import(prefix+path);
  let ZoneBase, CollisionManager, realTextureLibrary, replayTerrace, replayWestRearSouthDoorInWorld;
  try {
    // The original DOM/canvas boundary only. Materials, contact and movement
    // still use the real epoch implementation in the rest of the archive.
    await from('tests/lib/inner-palace-fixture.mjs');
    ({ZoneBase}=await from('src/scene/zones/ZoneBase.js'));
    ({CollisionManager}=await from('src/utils/Collision.js'));
    ({realTextureLibrary}=await from('tests/lib/r48-real-texture-library.mjs'));
    ({replayTerrace}=await from('tests/lib/terrace-walk.mjs'));
    ({replayWestRearSouthDoorInWorld}=await from('tests/lib/r63-west-rear-windows-world-check.mjs'));
  } finally { hooks.deregister(); }
  function compoundFixture(){
    const data=JSON.parse(sources['data/zones/west-six.json']);
    assert.equal(data.items.length,56);
    assert.equal(data.items[24].name,'储秀宫后殿');
    assert.equal(data.items[47].name,'咸福宫后殿');
    const lib=realTextureLibrary(),builder=new ZoneBase(lib,data),built=builder.build();
    const scene=new THREE.Scene(),cm=new CollisionManager();
    scene.add(built.group);scene.updateMatrixWorld(true);cm.rivers=[];
    cm.addColliders(built.colliders);cm.addWalkables(built.walkables);
    return {THREE,scene,cm,builder,built,lib,dispose(){builder.dispose();lib.dispose();}};
  }
  return {compoundFixture,replayTerrace,replayWestRearSouthDoorInWorld};
}

export const r62=await restoreEpoch(62,archive);

// The delivered R63 stage shares every other base byte, including west-six
// data and the test-only route helper. Never resolve the overlay into live src.
const r63Manifest=JSON.parse(readFileSync(new URL('r63-compound-source-delta-manifest.json',fixture),'utf8'));
const r63ArchiveSHA256='81bcf05d2fe0f537bb7c3b5941469c4815a9bd2f8e315b5c40751f1a747f9fba';
const r63Compressed=readFileSync(new URL('r63-compound-source-delta.json.gz',fixture));
assert.equal(r63Manifest.baseArchiveSHA256,archiveSHA256,'R63 overlay base archive pin');
assert.equal(r63Manifest.deltaArchiveSHA256,r63ArchiveSHA256,'manifest R63 source delta pin');
assert.equal(sha(r63Compressed),r63ArchiveSHA256,'R63 source delta hash');
const r63Delta=JSON.parse(gunzipSync(r63Compressed,{maxOutputLength:250_000}));
assert.deepEqual(Object.keys(r63Delta),Object.keys(r63Manifest.files),'complete historical R63 overlay');
for(const [name,digest] of Object.entries(r63Manifest.files)) assert.equal(sha(r63Delta[name]),digest,name);
assert.equal(Object.keys(r63Delta).length,6,'six production sources changed at the R63 epoch');
assert.equal(sha(r63Delta['src/scene/zones/ZoneBase.js']),'c753ad4276a1f411c05a342f27d156ff0ada5a297779080a83b807533c01c3f1','delivered R63 ZoneBase bytes');
export const r63=await restoreEpoch(63,{...archive,...r63Delta});
