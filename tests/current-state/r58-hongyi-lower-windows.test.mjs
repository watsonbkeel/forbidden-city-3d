import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {fixture,roles,meshes,meshRows,lowerWindow,hash,physical,snapshot,rayLocal,geometryHealth} from '../lib/r58-court-facade-fixture.mjs';
const baseline=JSON.parse(readFileSync(new URL('../fixtures/r58-hongyi-lower-baseline.json',import.meta.url)));
const module=await import('../../src/scene/palace/special/HongyiLowerWindowLeaves.js').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return{};throw e;});
// Production mutations caught: wrong profile dispatch, missing one sash, moving
// non-target geometry, changed colliders, old frame hidden behind new frames.
test('Hongyi replaces exactly six lower groups with twelve separately framed leaves and retains every non-target byte',()=>{
 const f=fixture('hongyi'),lo=f.g.lower,leaves=roles(f.frame,'lower-window-leaf');assert.equal(leaves.length,12);
 assert.equal(hash(meshRows(f.frame,lowerWindow)),baseline.profiles.hongyi.retainedWithoutLowerWindows);
 assert.equal(hash(physical(f.kit)),baseline.profiles.hongyi.physics);
 assert.equal(roles(f.frame,'lower-window').length,6);assert.equal(roles(f.frame,'upper-lattice-leaf').length,28);
 assert.equal(roles(f.frame,'lower-window-frame').length,0);assert.equal(roles(f.frame,'lower-window-bar').length,0);
 for(const bay of [1,2,3,5,6,7]){const pair=leaves.filter(o=>o.userData.bay===bay);assert.equal(pair.length,2);for(const leaf of pair){assert.equal(leaf.userData.sourceImage,'1980[1024].jpg');assert.equal(leaf.userData.objectId,'FC-A43B1DAB0B');assert.equal(roles(leaf,'lower-window-leaf-stile').length,2);assert.equal(roles(leaf,'lower-window-leaf-rail').length,2);assert.equal(roles(leaf,'lower-window-leaf-bar').length,6);}}
 assert.ok(Math.abs(lo.width-43.680)<1e-9);assert.ok(Math.abs(lo.depth-16.704)<1e-9);geometryHealth(f.frame);
});
test('Hongyi paired leaf envelope, original straight-bar positions and shared material remain bounded',()=>{
 const f=fixture('hongyi'),lo=f.g.lower,h=lo.height-.65-.85-.2;assert.equal(roles(f.frame,'lower-window-leaf').length,12);
 for(const window of roles(f.frame,'lower-window')){
  const bay=window.userData.bay,cx=(lo.columnXs[bay]+lo.columnXs[bay+1])/2,clear=lo.intervals[bay]-.6,box=new THREE.Box3();
  for(const m of meshes(window)){assert.equal(m.material,f.lib.material('wood_column'));m.geometry.computeBoundingBox();box.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrix));}
  const expected=[cx-clear/2-.065,lo.floorY+.85-.07,lo.front-.1,cx+clear/2+.065,lo.floorY+.85+h+.07,lo.front+.1];[...box.min.toArray(),...box.max.toArray()].forEach((n,i)=>assert.ok(Math.abs(n-expected[i])<2e-6));
  const bars=roles(window,'lower-window-leaf-bar').map(o=>o.position.x).sort((a,b)=>a-b),old=Array.from({length:13},(_,i)=>cx-clear/2+(i+1)*clear/14).filter((_,i)=>i!==6);assert.deepEqual(bars,old);
  const oldRows=[-1,1].flatMap(end=>Array.from({length:3},(_,j)=>lo.floorY+.85+h/2+end*(h*.29+j*.1)));
  for(const leaf of roles(window,'lower-window-leaf'))assert.deepEqual(roles(leaf,'lower-window-leaf-crossbar').map(o=>o.position.y),oldRows);
  const fronts=meshes(window).map(m=>{m.geometry.computeBoundingBox();return m.geometry.boundingBox.clone().applyMatrix4(m.matrix);});
  for(let i=0;i<fronts.length;i++)for(let j=i+1;j<fronts.length;j++){const a=fronts[i],b=fronts[j];if(Math.abs(a.min.z-b.min.z)>1e-7)continue;assert.ok(Math.min(a.max.x,b.max.x)-Math.max(a.min.x,b.min.x)<1e-6||Math.min(a.max.y,b.max.y)-Math.max(a.min.y,b.min.y)<1e-6,'coplanar outward-facing rectangles must not overlap');}
 }
});
test('existing Hongyi central inscription and every other non-target stream stay exact',()=>{
 const f=fixture('hongyi',{plaque:true});f.kit.buildPlaqueAtlas();assert.equal(hash(meshRows(f.frame,lowerWindow)),baseline.hongyiWithPlaque.retainedWithoutLowerWindows);assert.deepEqual(f.frame.userData.pavilion.nameInscription,baseline.inscription);assert.equal(f.kit.plaques.length,1);
});
test('Tiren entire assembly, materials and navigation stay exact',()=>assert.deepEqual(snapshot(fixture('tiren')),baseline.profiles.tiren));
test('Hongyi helper refuses to act on Tiren or an unrelated profile',()=>{
 assert.equal(typeof module.buildHongyiLowerWindowLeaves,'function');for(const profile of ['tiren','unknown']){const root=new THREE.Group();assert.deepEqual(module.buildHongyiLowerWindowLeaves(null,root,{profile},()=>assert.fail('must not emit geometry')),[]);assert.equal(root.children.length,0);}
});
test('all twelve meeting stiles remain first visible surfaces from real terrace feet after production merge',()=>{
 const f=fixture('hongyi'),lo=f.g.lower;assert.equal(roles(f.frame,'lower-window-leaf').length,12);
 const visible=root=>{for(const bay of [1,2,3,5,6,7])for(const side of [-1,1]){const x=(lo.columnXs[bay]+lo.columnXs[bay+1])/2+side*.08,z=lo.front-2,[wx,wz]=f.g.toWorld(x,z),feet=f.cm.getGroundHeight(wx,wz,f.g.platform.y);assert.equal(feet,f.g.platform.y);assert.equal(f.cm.checkCollision(new THREE.Vector3(wx,feet+1.7,wz),.5),false);const hit=rayLocal(root,f.g,[x,feet+1.7,z],[0,0,1],2.1)[0];assert.ok(hit);assert.ok(Math.abs(hit.distance-1.9)<.002);}};
 visible(f.frame);for(const x of [-1,0,1]){assert.equal(rayLocal(f.frame,f.g,[x,lo.floorY+1.7,lo.front-1],[0,0,1],3).length,0);const [wx,wz]=f.g.toWorld(x,lo.front);assert.equal(f.cm.checkCollision(new THREE.Vector3(wx,lo.floorY+1.7,wz),.5),false);}
 const root=f.kit.finish();visible(root);assert.equal(meshes(root).length,12);geometryHealth(root);
});
test('Hongyi leaf surfaces have no coincident duplicate triangles and retain separated front depths',()=>{
 const f=fixture('hongyi'),leaves=roles(f.frame,'lower-window-leaf');assert.equal(leaves.length,12);const triangles=new Set();
 for(const m of leaves.flatMap(meshes)){const p=m.geometry.attributes.position,idx=m.geometry.index;for(let i=0;i<(idx?.count??p.count);i+=3){const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+j):i+j).applyMatrix4(m.matrix).toArray().map(x=>x.toFixed(6)).join(',')).sort().join('|');assert.ok(!triangles.has(v),`${m.name}: duplicate triangle`);triangles.add(v);}}
 // The three front depths are separated, not a decorative layer coplanar
 // with the preserved lattice. Rails join between stiles at edges only.
 const depth=role=>roles(f.frame,role).map(m=>{m.geometry.computeBoundingBox();return m.position.z+m.geometry.boundingBox.min.z;});
 for(const z of depth('lower-window-leaf-bar'))assert.ok(Math.abs(z-(f.g.lower.front-.08))<1e-7);
 for(const z of depth('lower-window-leaf-crossbar'))assert.ok(Math.abs(z-(f.g.lower.front-.095))<1e-7);
 for(const z of depth('lower-window-leaf-stile'))assert.ok(Math.abs(z-(f.g.lower.front-.1))<1e-7);
});
test('Hongyi source boxes are finite before pruning, have private geometries, and never dispose caller materials',()=>{
 let raw=0;const a=fixture('hongyi',{},null,kit=>{const box=kit.box.bind(kit);kit.box=(...args)=>{const m=box(...args);if(args[0].userData.role==='lower-window-leaf'){geometryHealth(m);raw++;}return m;};});assert.equal(raw,192);
 const b=fixture('hongyi'),sources=roles(a.frame,'lower-window-leaf').flatMap(meshes),disposed=new Map();for(const m of sources){assert.ok(!meshes(b.frame).some(n=>n.geometry===m.geometry));disposed.set(m.geometry,0);m.geometry.addEventListener('dispose',()=>disposed.set(m.geometry,disposed.get(m.geometry)+1));}
 let materialFreed=0;a.lib.material('wood_column').addEventListener('dispose',()=>materialFreed++);const root=a.kit.finish();for(const n of disposed.values())assert.equal(n,1);a.kit.dispose(root);assert.equal(materialFreed,0);for(const n of disposed.values())assert.equal(n,1);
});
