import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {buildRoof} from '../../src/scene/RoofBuilder.js';
import {library,signature,triangles,release,hallOptions,captureModule} from '../lib/r58-hall-beast-fixture.mjs';
const baseline=JSON.parse(readFileSync(new URL('../fixtures/r58-hall-beast-baseline.json',import.meta.url)));
for(const row of baseline.rows)test(`legacy no-profile roof is byte-exact: ${row.id}`,()=>{const g=buildRoof(library(),row.opts);assert.deepEqual(signature(g),row.final);assert.equal(triangles(g),row.triangles);assert.deepEqual({topY:g.userData.topY,eaveY:g.userData.eaveY,doubleEaveMountingBand:g.userData.doubleEaveMountingBand??null},row.metadata);assert.equal(g.userData.walkingBeasts,undefined);release(g);});
test('explicit Baohe and Zhonghe profiles emit separate walking animal / rider counts',()=>{for(const [name,count,total,riders]of[['baohe',9,72,8],['zhonghe',7,28,4]]){const g=buildRoof(library(),{...hallOptions[name],walkingBeastProfile:name});assert.ok(g.userData.walkingBeasts,'explicit profile must be realized, not silently ignored');assert.equal(g.userData.walkingBeasts.animalTotal,total);assert.equal(g.userData.walkingBeasts.riderTotal,riders);assert.ok(g.userData.walkingBeasts.rows.every(r=>r.count===count));release(g);}});

const observed=await captureModule();
for(const name of ['baohe','zhonghe']) {
  test(`${name}: every non-walking mesh, rider, ridge, tile and material stays byte-exact`,()=>{
    let captured;globalThis.__r58HipCapture=g=>{captured=signature(g,{excludeWalking:true});};
    const roof=observed.buildRoof(library(),{...hallOptions[name],walkingBeastProfile:name});
    delete globalThis.__r58HipCapture;
    assert.deepEqual(captured,baseline.rows.find(r=>r.id===name+'-high').nonWalking);release(roof);
  });
  test(`${name}: actual submitted triangle budget counts every corner on every level`,()=>{
    const g=buildRoof(library(),{...hallOptions[name],walkingBeastProfile:name});
    const before=baseline.rows.find(r=>r.id===name+'-high').triangles,oldCount=name==='baohe'?32:12;
    const animalTotal=g.userData.walkingBeasts.animalTotal;
    assert.equal(triangles(g)-before,(animalTotal-oldCount)*24);
    assert.equal(g.children.length,baseline.rows.find(r=>r.id===name+'-high').final.meshes,'no extra material batch/draw call');
    assert.equal(g.userData.walkingBeasts.rows.reduce((s,r)=>s+r.animalTriangles,0),animalTotal*24);release(g);
  });
  test(`${name}: low-detail omission policy does not pretend to generate rows`,()=>{
    const a=buildRoof(library(),{...hallOptions[name],detail:'low'}),b=buildRoof(library(),{...hallOptions[name],detail:'low',walkingBeastProfile:name});
    assert.deepEqual(signature(a),signature(b));assert.equal(b.userData.walkingBeasts.animalTotal,0);assert.equal(b.userData.walkingBeasts.riderTotal,0);assert.deepEqual(b.userData.walkingBeasts.rows,[]);release(a);release(b);
  });
}
function meshTriangles(mesh) {
  const p=mesh.geometry.attributes.position,index=mesh.geometry.index,out=[];
  mesh.updateMatrixWorld(true);
  for(let i=0;i<(index?.count??p.count);i+=3)out.push(new THREE.Triangle(...[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,index?.getX(i+k)??i+k).applyMatrix4(mesh.matrixWorld))));
  return out;
}
for(const name of ['baohe','zhonghe']) test(`${name}: all animal base vertices contact actual ridge triangles and all stations follow the actual curved hip`,()=>{
  let raw;
  globalThis.__r58HipCapture=g=>{raw=g.children.filter(m=>m.isMesh).map(m=>({name:m.name,type:m.geometry.type,parameters:m.geometry.parameters,triangles:meshTriangles(m)}));};
  const g=observed.buildRoof(library(),{...hallOptions[name],walkingBeastProfile:name});delete globalThis.__r58HipCapture;
  const rows=g.userData.walkingBeasts.rows,ridges=raw.filter(m=>m.type==='TubeGeometry'),bodies=raw.filter(m=>m.name==='walking-beast-body');
  assert.equal(rows.length,name==='baohe'?8:4);assert.equal(ridges.length,rows.length);assert.equal(bodies.length,g.userData.walkingBeasts.animalTotal);
  let body=0,nonlinear=0;
  for(let k=0;k<rows.length;k++){
    const row=rows[k],ridge=ridges[k],path=ridge.parameters.path;
    assert.equal(new Set(row.stations.map(s=>s.distance)).size,row.count);assert.equal(row.stations.length,row.count);
    assert.ok(row.arcLength>row.stations.at(-1).distance+row.scale*.29+row.radius*2);
    const a=new THREE.Vector3().fromArray(row.stations[0].center),b=new THREE.Vector3().fromArray(row.stations.at(-1).center),line=new THREE.Line3(a,b);
    for(let j=0;j<row.stations.length;j++){
      const s=row.stations[j],p=new THREE.Vector3().fromArray(s.center),actual=path.getPoint(s.t);
      assert.ok(actual.distanceTo(p)<1e-10,'station belongs to submitted CatmullRom path');
      if(line.closestPointToPoint(p,true,new THREE.Vector3()).distanceTo(p)>.02)nonlinear++;
      assert.equal(s.footContacts.length,4,'four distinct base contact corners');
      const current=bodies[body++];
      for(const foot of s.footContacts){const v=new THREE.Vector3().fromArray(foot);assert.ok(ridge.triangles.some(t=>t.closestPointToPoint(v,new THREE.Vector3()).distanceTo(v)<1e-7),'contact point lies on actual ridge triangle');assert.ok(current.triangles.some(t=>[t.a,t.b,t.c].some(q=>q.distanceTo(v)<3e-6)),'contact is a real body vertex, not metadata-only');}
      if(j){const prior=row.stations[j-1];assert.ok(Math.abs(s.distance-prior.distance-row.spacing)<1e-10);assert.ok(p.distanceTo(new THREE.Vector3().fromArray(prior.center))>row.scale*.9,'actual center distance clears each simplified body/head envelope');}
    }
  }
  assert.ok(nonlinear>0,'rows are not a straight line suspended above the hip');release(g);
});

test('profiles fail closed on changed hall dimensions or ambiguous level overrides before creating materials',()=>{
 for(const name of ['baohe','zhonghe'])for(const delta of [{width:60},{depth:26},{baseY:NaN},{baseY:undefined},{height:9},{overhang:3},{layers:3},{sides:8},{brackets:false},{type:'wudian'},{_lift:1},{_walkingLayer:'lower'},{walkingBeastProfile:'taihe'},{walkingBeastProfile:{}}]){
  const lib=library();assert.throws(()=>buildRoof(lib,{...hallOptions[name],walkingBeastProfile:name,...delta}),/Walking-beast/);assert.equal(lib.mats.size,0);
 }
});

test('temporary and submitted geometry resources and owned materials have one clear disposal owner',()=>{
 const originalGeoDispose=THREE.BufferGeometry.prototype.dispose,originalMaterialDispose=THREE.Material.prototype.dispose;
 const geometries=new Map(),materials=new Map();
 THREE.BufferGeometry.prototype.dispose=function(){geometries.set(this,(geometries.get(this)??0)+1);return originalGeoDispose.call(this);};
 THREE.Material.prototype.dispose=function(){materials.set(this,(materials.get(this)??0)+1);return originalMaterialDispose.call(this);};
 try {
  for(let repeat=0;repeat<3;repeat++)for(const name of ['baohe','zhonghe']){
   let raw;globalThis.__r58HipCapture=g=>{raw=g.children.filter(x=>x.isMesh).map(x=>x.geometry);};const lib=library(),g=observed.buildRoof(lib,{...hallOptions[name],walkingBeastProfile:name});delete globalThis.__r58HipCapture;
   for(const geometry of raw)assert.equal(geometries.get(geometry),1,'all source geometry disposed on merge');
   g.traverse(m=>{if(m.isMesh)assert.equal(geometries.get(m.geometry),undefined);});
   const owned=[...g.userData.ownedMaterials];assert.equal(owned.length,name==='baohe'?1:2);
   release(g);g.traverse(m=>{if(m.isMesh)assert.equal(geometries.get(m.geometry),1);});
   for(const material of owned)assert.equal(materials.get(material),1);
   for(const material of lib.mats.values())assert.equal(materials.get(material),undefined,'do not dispose shared library materials');
  }
  assert.ok([...geometries.values()].every(n=>n===1),'no double disposal including merge intermediates');
 } finally {delete globalThis.__r58HipCapture;THREE.BufferGeometry.prototype.dispose=originalGeoDispose;THREE.Material.prototype.dispose=originalMaterialDispose;}
});

import {mergeByMaterial} from '../../src/utils/MergeUtils.js';
import {assertHallWalkingBeastsInWorld} from '../lib/r58-hall-beasts-world-check.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
test('pure W consumer verifies existing roof fragments before and after final hall-material merge without adding a world',()=>{
 const scene=new THREE.Scene(),root=new THREE.Group();root.userData.hallWalkingBeasts=[];root.position.set(12,0,125);
 for(const [i,name]of ['baohe','zhonghe'].entries()){
  const roof=buildRoof(library(),{...hallOptions[name],baseY:8,walkingBeastProfile:name});roof.position.set(i*70,0,0);root.add(roof);
  root.userData.hallWalkingBeasts.push({...roof.userData.walkingBeasts,position:roof.position.toArray()});
 }
 scene.add(root);const W={scene,cm:new CollisionManager()},first=assertHallWalkingBeastsInWorld(W);
 assert.equal(first.halls.reduce((s,h)=>s+h.actualMergedFootContacts,0),400);assert.equal(scene.children.length,1);assert.equal(root.children.length,2);
 const merged=mergeByMaterial(root);scene.remove(root);scene.add(merged);assert.deepEqual(assertHallWalkingBeastsInWorld(W),first);assert.equal(scene.children.length,1);
 const record=merged.userData.hallWalkingBeasts[0];record.rows[0].stations[0].footContacts[0][1]+=.05;assert.throws(()=>assertHallWalkingBeastsInWorld(W),/vertex missing/);record.rows[0].stations[0].footContacts[0][1]-=.05;
 merged.userData.hallWalkingBeasts.push(record);assert.throws(()=>assertHallWalkingBeastsInWorld(W),/exactly/);merged.userData.hallWalkingBeasts.pop();
 merged.traverse(m=>{if(m.isMesh)m.geometry.dispose();});
});

test('actual walking body/head bounds clear adjacent animals and the retained rider, not just station metadata',()=>{
 for(const name of ['baohe','zhonghe']){
  let raw;globalThis.__r58HipCapture=g=>{raw=g.children.filter(x=>x.isMesh).map(m=>({name:m.name,type:m.geometry.type,bounds:new THREE.Box3().setFromObject(m)}));};
  const g=observed.buildRoof(library(),{...hallOptions[name],walkingBeastProfile:name});delete globalThis.__r58HipCapture;
  const animals=raw.filter(m=>m.name.startsWith('walking-beast-')),riders=raw.filter(m=>m.type==='ConeGeometry');
  let k=0;
  for(const [i,row]of g.userData.walkingBeasts.rows.entries()){
   const envelopes=[];
   for(let j=0;j<row.count;j++){envelopes.push(animals[k++].bounds.clone().union(animals[k++].bounds));}
   assert.equal(envelopes[0].intersectsBox(riders[i].bounds),false,'first animal must not overlap rider');
   for(let j=1;j<envelopes.length;j++)assert.equal(envelopes[j-1].intersectsBox(envelopes[j]),false,'actual complete adjacent body+head AABBs do not overlap');
  }
  release(g);
 }
});

import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
test('reviewed widths accept actual production arithmetic without rounding or changing the roof input',()=>{
 const data=PALACE_LAYOUT.find(h=>h.name==='保和殿'),opts={...hallOptions.baohe,width:data.dimensions.width+.6,depth:data.dimensions.depth+.6};
 assert.notEqual(opts.width,hallOptions.baohe.width,'regression exposes the caller floating-point addition');
 const roof=buildRoof(library(),{...opts,walkingBeastProfile:'baohe'});assert.equal(roof.userData.walkingBeasts.animalTotal,72);release(roof);
});

import {loadHookupPalaceBuilder} from '../lib/r58-hall-beast-fixture.mjs';
import {library as hallLibrary} from '../lib/inner-palace-fixture.mjs';

const hooked=await loadHookupPalaceBuilder(),unhooked=await loadHookupPalaceBuilder({enabled:false});
test('exact owner HOOKUP.patch rehearsal uses actual production inputs and retains all hall physics and all other hall meshes',()=>{
 for(const name of ['保和殿','中和殿','太和殿','交泰殿']){
  const data=structuredClone(PALACE_LAYOUT.find(h=>h.name===name)),captures=[];
  for(const Builder of [unhooked.PalaceBuilder,hooked.PalaceBuilder]){
   const builder=new Builder(new THREE.Scene(),hallLibrary()),group=new THREE.Group();const [floor,reference]=({'保和殿':[9,10],'中和殿':[8.6,8.6],'太和殿':[10.2,10.2],'交泰殿':[2.16,2.16]})[name];builder.buildHall(group,data,floor,{heightReferenceY:reference});group.updateMatrixWorld(true);
   const roofs=[];group.traverse(o=>{if(o.userData.ownedMaterials&&o.userData.eaveY!==undefined)roofs.push(o);});assert.equal(roofs.length,1);
   const roof=roofs[0],roofSig=signature(roof);roof.removeFromParent();
   captures.push({remainder:signature(group),roof:roofSig,physics:{colliders:builder.colliders,walkables:builder.walkables},records:group.userData.hallWalkingBeasts??[]});
  }
  const [before,after]=captures;assert.deepEqual(after.remainder,before.remainder);assert.deepEqual(after.physics,before.physics);
  if(['保和殿','中和殿'].includes(name)){assert.notDeepEqual(after.roof,before.roof);assert.equal(after.records.length,1);assert.equal(after.records[0].animalTotal,name==='保和殿'?72:28);}
  // The historical toggle removes shared metadata collection, not the new
  // Taihe roof option. Its actual geometry is retained on BOTH sides.
  else if(name==='太和殿'){assert.deepEqual(after.roof,before.roof);assert.deepEqual(before.records,[]);assert.equal(after.records.length,1);assert.equal(after.records[0].animalTotal,80);}
  else {assert.deepEqual(after.roof,before.roof);assert.deepEqual(after.records,[]);}
 }
});

test('unconfigured legacy calls still ignore the newly reserved walking-layer field',()=>{
 const plain=buildRoof(library(),hallOptions.baohe),legacy=buildRoof(library(),{...hallOptions.baohe,_walkingLayer:'previously-ignored'});
 assert.deepEqual(signature(legacy),signature(plain));release(plain);release(legacy);
});
