// Bounded supplement. Original R42 test is unchanged and still fails its obsolete all-source-disposed-at-merge assertion.
// Run from the target repository: node --test /path/to/r42-bounded-merge-tail.mjs
// Real production source files are imported; this preserves R42's lightweight material fixture boundary.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const base=pathToFileURL((process.env.R48_REPO??process.cwd())+'/');
const THREE=await import(new URL('node_modules/three/build/three.module.js',base));
const {ZoneBase}=await import(new URL('src/scene/zones/ZoneBase.js',base));
const {library}=await import(new URL('tests/lib/inner-palace-fixture.mjs',base));
const {FlightEnvelope}=await import(new URL('src/scene/flight/FlightEnvelope.js',base));
const {huangjiFallbackMeshes}=await import(new URL('src/scene/interior/HuangjiFallbackContract.js',base));
const originalR42=readFileSync(new URL('tests/r42-independent-pavilion.test.mjs',base));
assert.equal(createHash('sha256').update(originalR42).digest('hex'),'92867e792f86441385e0be694418caca65ae6b0daa31e7e788dc01a96219f537','original R42 test bytes retained');
const config=JSON.parse(readFileSync(new URL('data/zones/ningshou.json',base)));
function stats(root) { const out=new Map();root.updateMatrixWorld(true);root.traverse(m=>{if(!m.isMesh||!m.material||m.material.name==='kit_plaques')return;const p=m.geometry.attributes.position,s=out.get(m.material)??{count:0,box:new THREE.Box3()};s.count+=m.geometry.index?.count??p.count;for(const a of Object.values(m.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));for(let i=0;i<p.count;i++)s.box.expandByPoint(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld));out.set(m.material,s);});return out; }
test('R48 bounded R42 whole-zone merge ownership tail accounts for exactly four live transferred Huangji fallbacks',()=>{
 for(let repeat=0;repeat<2;repeat++){
  const b=new ZoneBase(library(),config),watched=new Map(),watch=o=>{if(watched.has(o))return;watched.set(o,0);o.addEventListener('dispose',()=>watched.set(o,watched.get(o)+1));};
  const original=b.kit.finish.bind(b.kit);let before,vertices=[],sourceGeometries;
  b.kit.finish=()=>{
   before=stats(b.kit.root);sourceGeometries=new Set();
   b.kit.root.traverse(o=>{if(o.geometry){watch(o.geometry);sourceGeometries.add(o.geometry);}if(o.isMesh&&o.material?.name.startsWith('guhua_')){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)vertices.push(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld));}});
   for(const o of b.kit.owned)watch(o);for(const o of b.kit.ownedTextures??[])watch(o);
   assert.equal(b.kit.owned.filter(m=>m.name.startsWith('guhua_')).length,6);
   return original();
  };
  const {group}=b.build(),after=stats(group);for(const o of b.kit.owned)watch(o);for(const o of b.kit.ownedTextures??[])watch(o);assert.equal(after.size,before.size);
  for(const[m,s]of before){const a=after.get(m);assert.ok(a,m.name);assert.equal(a.count,s.count,m.name);assert.ok(a.box.min.distanceTo(s.box.min)<1e-4,m.name);assert.ok(a.box.max.distanceTo(s.box.max)<1e-4,m.name);}
  // Only actual transferred Huangji fallback objects may survive the merge.
  const returnedGeometryOwners=new Map();group.traverse(o=>{if(o.geometry)returnedGeometryOwners.set(o.geometry,o);});
  const survivors=[];
  for(const g of sourceGeometries){const retained=returnedGeometryOwners.get(g);if(retained){assert.equal(watched.get(g),0,'transferred source geometry is still live');survivors.push(retained);}else assert.equal(watched.get(g),1,'every other source geometry disposed exactly once by merge');}
  assert.equal(survivors.length,4,'only four explicitly isolated Huangji fallback meshes survive');
  assert.deepEqual(new Set(survivors),new Set(huangjiFallbackMeshes(group)),'exact returned fallback mesh objects, not name-only exceptions');
  assert.equal(new Set(survivors.map(m=>m.material)).size,4,'four independently owned fallback materials');
  for(const m of survivors){assert.equal(m.userData.noMerge,true);assert.equal(m.userData.role,'huangji-kit-throne-fallback');assert.ok(b.kit.owned.includes(m.material));}
  console.log(JSON.stringify({repeat,sourceGeometryCount:sourceGeometries.size,sourceDisposedAtMerge:sourceGeometries.size-4,liveTransferredFallbacks:survivors.map(m=>({name:m.name,part:m.userData.fallbackPart}))}));
  group.traverse(o=>{if(o.geometry)watch(o.geometry);});
  const env=new FlightEnvelope().addRoot(group);assert.ok(vertices.length>1000);for(const p of vertices)assert.ok(env.sample(p.x,p.z).height>=p.y-1e-5);
  const record=group.userData.architecture.filter(r=>r.id==='ningshou/guhua-open-pavilion');assert.equal(record.length,1);assert.match(record[0].state,/REPLICA.*NOT_ORIGINAL_QIANLONG/);
  b.dispose();for(const[o,n]of watched)assert.equal(n,1,o.name||o.type);assert.equal(b.kit.colliders.length,0);assert.equal(b.kit.walkables.length,0);
 }
});

