import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {library,gate,sceneFor,binding,west,hash,triangles} from './lib/r59-donghua-door-fixture.mjs';
import {buildEastWestCityGate} from '../src/scene/palace/special/EastWestCityGate.js';
import {applyDonghuaExteriorEnvelope as apply} from '../src/scene/palace/special/DonghuaExteriorEnvelope.js';
const physics=c=>hash([c.kit.colliders,c.kit.walkables,c.kit.mapItems,c.kit.rooms,c.kit.regions]);
const close=(c,lib)=>{c.kit.dispose(c.root??c.kit.root);lib.dispose();};

test('exact Donghua declaration only, repeat no-op, and all other gate faces/physics remain intact',async()=>{
 const lib=await library(),c=gate(lib),before=triangles(c.frame),phys=physics(c);
 for(const b of [{},{...binding,zoneId:'outer-west'},{...binding,itemIndex:20},{...binding,item:{...binding.item,x:-365.81}}])assert.equal(apply(c.kit,c.frame,b),false);
 const knownTargets=c.frame.children.filter(m=>m.isMesh&&(m.material===lib.material('lattice_doors')||m.material===lib.material('wall_brick')&&Math.abs(m.position.y-.5)<1e-9));
 assert.equal(knownTargets.length,5);
 assert.equal(apply(c.kit,c.frame,binding),true);assert.equal(physics(c),phys);
 const matKeys=c.kit.owned.map(m=>m.uuid),meshHash=hash(triangles(c.frame));
 assert.equal(apply(c.kit,c.frame,binding),false);assert.equal(hash(triangles(c.frame)),meshHash);assert.deepEqual(c.kit.owned.map(m=>m.uuid),matKeys);
 assert.equal(c.frame.userData.donghuaExteriorEnvelope.visibleWindowGroups,5);assert.equal(c.frame.userData.donghuaExteriorEnvelope.accepted,false);
 const retained=triangles(c.frame).filter(t=>!t.material?.startsWith('donghua_'));
 assert.equal(before.length-retained.length,10,'remove only two front triangles from each of five boxes');
 const retainedSet=new Set(before.map(JSON.stringify));for(const t of retained)assert.ok(retainedSet.has(JSON.stringify(t)),'non-target triangle bytes and materials unchanged');
 assert.equal(triangles(c.frame).filter(t=>t.material==='donghua_front_stone_plinth').length,56);
 const westGate=buildEastWestCityGate(c.kit,west.items.find(i=>i.kind==='cityGate'));
 const westBefore=hash(triangles(westGate));assert.equal(apply(c.kit,westGate,binding),false);assert.equal(hash(triangles(westGate)),westBefore);
 close(c,lib);
});

test('merged face rays see fitted windows and stone, original portals remain clear, and resources dispose once',async()=>{
 const lib=await library(),c=gate(lib);apply(c.kit,c.frame,binding);
 const mat=c.kit.owned.find(m=>m.name==='donghua_front_five_window_groups'),tex=mat.map,watched=new Map();
 for(const r of[mat,tex]){watched.set(r,0);r.addEventListener('dispose',()=>watched.set(r,watched.get(r)+1));}
 const texels=tex.image.data;assert.equal(texels.length,1024*256*4);assert.ok(texels.every(Number.isFinite));
 const py=Math.floor((12-9.3)/4.92*256),runs=[];let start=null;
 for(let x=0;x<=1024;x++){const i=(py*1024+x)*4,red=x===1024||(texels[i]===114&&texels[i+1]===37&&texels[i+2]===27);
  if(!red&&start===null)start=x;if(red&&start!==null){runs.push([start,x]);start=null;}}
 assert.equal(runs.length,5,'actual generated pixel content has five separated window groups, not metadata only');
 const totalBefore=triangles(c.frame).length;assert.ok(totalBefore>0);
 const s=sceneFor(c,{finish:true});c.root=s.root;const record=s.root.userData.architecture.find(a=>a.id==='city-gates/donghua');
 assert.equal(record.donghuaExteriorEnvelope.visibleWindowGroups,5);
 const toW=(x,y,z)=>new THREE.Vector3(x,y,z).applyMatrix4(c.frame.matrixWorld);
 for(const [x,y,z,name]of [[0,12,-3.35,'donghua_front_five_window_groups'],[-13.5,.5,-7.42,'donghua_front_stone_plinth']]){
  const p=toW(x,y,z),from=toW(x,y,z-2),r=new THREE.Raycaster(from,p.clone().sub(from).normalize(),0,2.2).intersectObject(s.root,true)[0];assert.equal(r?.object.material.name,name);
 }
 for(const x of[-8.4,0,8.4])assert.equal(new THREE.Raycaster(toW(x,1.7,-10),toW(x,1.7,10).sub(toW(x,1.7,-10)).normalize(),0,20).intersectObject(s.root,true).length,0);
 s.root.traverse(m=>{if(!m.isMesh)return;for(const a of Object.values(m.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));});
 close(c,lib);for(const count of watched.values())assert.equal(count,1);
});

test('identity drift refuses application before any resource, geometry or physics mutation',async()=>{
 const lib=await library(),c=gate(lib),lattice=c.frame.children.find(m=>m.isMesh&&m.material===lib.material('lattice_doors'));
 lattice.position.y+=.01;const before=hash(triangles(c.frame)),phys=physics(c),owned=c.kit.owned.length;
 assert.equal(apply(c.kit,c.frame,binding),false);assert.equal(hash(triangles(c.frame)),before);assert.equal(physics(c),phys);assert.equal(c.kit.owned.length,owned);assert.equal(c.kit.ownedTextures?.length??0,0);
 close(c,lib);
});

for(const failAt of[1,2,5,'attach'])test(`skin construction failure ${failAt} is atomic, releases only candidate resources, and permits retry`,async t=>{
 const lib=await library(),c=gate(lib),hierarchy=()=>{const rows=[];c.kit.root.traverse(o=>rows.push({o,parent:o.parent,geometry:o.geometry,material:o.material,position:o.position.toArray(),rotation:o.rotation.toArray(),scale:o.scale.toArray(),userData:structuredClone(o.userData)}));return rows;};
 const before={triangles:hash(triangles(c.kit.root)),hierarchy:hierarchy(),physics:physics(c),owned:c.kit.owned.slice(),hasOwnedTextures:Object.hasOwn(c.kit,'ownedTextures'),ownedTextures:c.kit.ownedTextures?.slice(),cache:[...lib.materials],colors:[...lib.colors],normals:[...lib.normals]};
 const originalGeometry=new Set(before.hierarchy.map(r=>r.geometry).filter(Boolean)),createdGeometry=new Set(),disposed=new Map(),originalMesh=c.kit.mesh;
 const watchDispose=proto=>{const original=proto.dispose;return t.mock.method(proto,'dispose',function(){disposed.set(this,(disposed.get(this)??0)+1);return original.call(this);});};
 const disposers=[watchDispose(THREE.BufferGeometry.prototype),watchDispose(THREE.Material.prototype),watchDispose(THREE.Texture.prototype)],originalSphere=THREE.BufferGeometry.prototype.computeBoundingSphere;
 const sphere=t.mock.method(THREE.BufferGeometry.prototype,'computeBoundingSphere',function(){createdGeometry.add(this);return originalSphere.call(this);});
 const observedResources=new Set(),originalAdd=c.frame.add;let calls=0;
 if(failAt==='attach')c.frame.add=function(...objects){originalAdd.apply(this,objects);throw Error('Injected candidate skin construction failure');};
 c.kit.mesh=function(...args){const mesh=originalMesh.apply(this,args);observedResources.add(mesh.material);if(mesh.material.map)observedResources.add(mesh.material.map);if(++calls===failAt)throw Error('Injected candidate skin construction failure');return mesh;};
 try{
  assert.throws(()=>apply(c.kit,c.frame,binding),/Injected candidate skin construction failure/);
  assert.equal(hash(triangles(c.kit.root)),before.triangles,'no original face was stripped and no candidate mesh survived');
  assert.deepEqual(hierarchy(),before.hierarchy,'entire original hierarchy, transforms, geometry identities and metadata unchanged');
  assert.equal(physics(c),before.physics);assert.deepEqual(c.kit.owned,before.owned);
  assert.equal(Object.hasOwn(c.kit,'ownedTextures'),before.hasOwnedTextures);assert.deepEqual(c.kit.ownedTextures,before.ownedTextures);
  assert.deepEqual([...lib.materials],before.cache);assert.deepEqual([...lib.colors],before.colors);assert.deepEqual([...lib.normals],before.normals);
  for(const g of originalGeometry)assert.equal(disposed.get(g)??0,0,'original geometry never disposed on failed preparation');
  assert.equal(createdGeometry.size,2*(failAt==='attach'?5:failAt));
  assert.equal([...disposed.keys()].filter(r=>r.isMaterial).length,2,'both allocated candidate materials were released, including the unused one');
  assert.equal([...disposed.keys()].filter(r=>r.isTexture).length,1,'the candidate texture was released');
  for(const r of disposed.keys())assert.equal(disposed.get(r),1);for(const g of createdGeometry)assert.equal(disposed.get(g),1,'every prepared candidate geometry released exactly once');
  for(const r of observedResources)assert.equal(disposed.get(r),1,'prepared candidate material/texture released exactly once');
 }finally{c.kit.mesh=originalMesh;c.frame.add=originalAdd;sphere.mock.restore();for(const d of disposers)d.mock.restore();}
 assert.equal(apply(c.kit,c.frame,binding),true,'retry after restoring allocator succeeds on the same original gate');
 assert.equal(c.frame.userData.donghuaExteriorEnvelope.visibleWindowGroups,5);close(c,lib);
});
