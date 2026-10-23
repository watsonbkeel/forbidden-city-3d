import test from 'node:test';
import assert from 'node:assert/strict';
import {buildRoof} from '../../src/scene/RoofBuilder.js';
import {hallOptions,library,release} from '../lib/r58-hall-beast-fixture.mjs';

test('Taihe explicitly realizes ten walking beasts on each of eight corners, with eight separate riders',()=>{
  const roof=buildRoof(library(),{...hallOptions.taihe,walkingBeastProfile:'taihe'});
  const r=roof.userData.walkingBeasts;
  assert.equal(r.entityId,'FC-A478209231');
  assert.equal(r.profile,'taihe-ten-walking-beasts');
  assert.deepEqual(r.countsPerCorner,{lower:10,upper:10});
  assert.equal(r.animalTotal,80);assert.equal(r.riderTotal,8);assert.equal(r.rows.length,8);
  release(roof);
});

import * as THREE from 'three';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {library as hallLibrary} from '../lib/inner-palace-fixture.mjs';
test('actual production Taihe hall alone installs the reviewed profile',()=>{
  const builder=new PalaceBuilder(new THREE.Scene(),hallLibrary()),group=new THREE.Group();
  builder.buildHall(group,structuredClone(PALACE_LAYOUT.find(h=>h.name==='太和殿')),10.2,{heightReferenceY:10.2});
  assert.equal(group.userData.hallWalkingBeasts?.length,1,'actual hall caller must enable Taihe count-only correction');
  assert.equal(group.userData.hallWalkingBeasts[0].animalTotal,80);
  release(group);for(const m of builder.ownedMaterials)m.dispose();
});
test('profile selectors reject non-string coercion instead of accepting an array or object alias',()=>{
  for(const selector of [['taihe'],{toString:()=> 'taihe'},new String('taihe')]) {
    const lib=library();assert.throws(()=>buildRoof(lib,{...hallOptions.taihe,walkingBeastProfile:selector}),/Walking-beast/);assert.equal(lib.mats.size,0);
  }
});

import {readFileSync} from 'node:fs';
import {signature,triangles,captureModule,hash} from '../lib/r58-hall-beast-fixture.mjs';
import {baselineHooklessBuilder,hallCapture,triangleRecords} from '../lib/r58-taihe-beast-fixture.mjs';
const baseline=JSON.parse(readFileSync(new URL('../fixtures/r58-taihe-beast-baseline.json',import.meta.url)));
const legacy=JSON.parse(readFileSync(new URL('../fixtures/r58-hall-beast-baseline.json',import.meta.url)));
const observed=await captureModule();
function captureTaihe(options={}) {
  let raw,nonWalking;
  globalThis.__r58HipCapture=g=>{
    nonWalking=signature(g,{excludeWalking:true});
    raw=g.children.filter(m=>m.isMesh).map(m=>({name:m.name,type:m.geometry.type,parameters:m.geometry.parameters,geometry:m.geometry,triangles:triangleRecords(m),bounds:new THREE.Box3().setFromObject(m)}));
  };
  try {const lib=library(),roof=observed.buildRoof(lib,{...hallOptions.taihe,walkingBeastProfile:'taihe',...options});return {roof,raw,nonWalking,lib};}
  finally {delete globalThis.__r58HipCapture;}
}
test('Taihe retains every non-walking mesh including all eight old riders, ridges, tiles and materials',()=>{
  const {roof,nonWalking}=captureTaihe();
  assert.deepEqual(nonWalking,legacy.rows.find(r=>r.id==='taihe-high').nonWalking);
  release(roof);
});
test('Taihe has exactly 80 actual replacement bodies/heads, 8 separate riders and no duplicated old animals',()=>{
  const {roof,raw}=captureTaihe();
  const bodies=raw.filter(m=>m.name==='walking-beast-body'),heads=raw.filter(m=>m.name==='walking-beast-head'),riders=raw.filter(m=>m.type==='ConeGeometry');
  assert.equal(bodies.length,80);assert.equal(heads.length,80);assert.equal(riders.length,8);
  for(const level of ['lower','upper']){
    const rows=roof.userData.walkingBeasts.rows.filter(r=>r.level===level);
    assert.deepEqual(rows.map(r=>r.corner),[0,1,2,3]);assert.equal(rows.reduce((n,r)=>n+r.stations.length,0),40);
  }
  assert.equal(raw.filter(m=>m.name.startsWith('walking-beast-')).length,160);
  const old=legacy.rows.find(r=>r.id==='taihe-high');
  assert.equal(triangles(roof),old.triangles+(80-32)*24);
  assert.equal(triangles(roof),14116);assert.equal(roof.children.length,old.final.meshes);
  release(roof);
});
test('Taihe all 320 real body corners contact submitted hip triangles and remain spaced on the true curved path',()=>{
  const {roof,raw}=captureTaihe(),rows=roof.userData.walkingBeasts.rows;
  const ridges=raw.filter(m=>m.type==='TubeGeometry'),bodies=raw.filter(m=>m.name==='walking-beast-body');
  const animals=raw.filter(m=>m.name.startsWith('walking-beast-')),riders=raw.filter(m=>m.type==='ConeGeometry');
  assert.equal(ridges.length,8);let k=0,contacts=0,nonlinear=0;
  for(const [i,row]of rows.entries()){
    const ridge=ridges[i],line=new THREE.Line3(new THREE.Vector3().fromArray(row.stations[0].center),new THREE.Vector3().fromArray(row.stations.at(-1).center));
    assert.ok(row.arcLength>row.stations.at(-1).distance+row.scale*.29+row.radius*2);
    let previous;
    for(const station of row.stations){
      const p=new THREE.Vector3().fromArray(station.center);
      assert.ok(p.distanceTo(ridge.parameters.path.getPoint(station.t))<1e-10);
      if(line.closestPointToPoint(p,true,new THREE.Vector3()).distanceTo(p)>.02)nonlinear++;
      assert.equal(station.footContacts.length,4);
      for(const foot of station.footContacts){
        const v=new THREE.Vector3().fromArray(foot);
        assert.ok(ridge.triangles.some(t=>t.closestPointToPoint(v,new THREE.Vector3()).distanceTo(v)<1e-7),'submitted ridge triangle contact');
        assert.ok(bodies[k].triangles.some(t=>[t.a,t.b,t.c].some(q=>q.distanceTo(v)<3e-6)),'actual body base vertex');contacts++;
      }
      const envelope=animals[k*2].bounds.clone().union(animals[k*2+1].bounds);k++;
      if(previous)assert.equal(envelope.intersectsBox(previous),false,'actual body/head AABBs remain disjoint');
      else assert.equal(envelope.intersectsBox(riders[i].bounds),false,'first animal clears the retained rider');
      previous=envelope;
    }
  }
  assert.equal(contacts,320);assert.ok(nonlinear>0);release(roof);
});
test('Taihe low-detail remains byte-exact to legacy omission without claiming visible animals',()=>{
  const {roof}=captureTaihe({detail:'low'}),old=legacy.rows.find(r=>r.id==='taihe-low');
  assert.deepEqual(signature(roof),old.final);assert.equal(triangles(roof),old.triangles);
  assert.deepEqual(roof.userData.walkingBeasts.rows,[]);assert.equal(roof.userData.walkingBeasts.animalTotal,0);assert.equal(roof.userData.walkingBeasts.riderTotal,0);release(roof);
});
test('Taihe guard fails closed before materials for wrong type, every dimension/layer override and unknown profiles',()=>{
  for(const delta of [{type:'xieshan'},{type:'pavilion'},{width:63.61},{depth:37.61},{width:'63.6'},{width:Infinity},{depth:NaN},{layers:1},{layers:'2'},{baseY:NaN},{baseY:undefined},{height:9},{overhang:3},{sides:8},{brackets:false},{_lift:1},{_walkingLayer:'upper'},{wumenVerticalProfile:{}},{jiaotaiCeilingOpening:{}},{walkingBeastProfile:'unknown'},{walkingBeastProfile:'baohe'},{walkingBeastProfile:'zhonghe'},{walkingBeastProfile:null}]){
    const lib=library();assert.throws(()=>buildRoof(lib,{...hallOptions.taihe,walkingBeastProfile:'taihe',...delta}),/Walking-beast|Wumen/);assert.equal(lib.mats.size,0);
  }
});
test('Taihe valid real caller arithmetic and finite baseY offsets retain reviewed counts',()=>{
  const data=PALACE_LAYOUT.find(h=>h.name==='太和殿');
  for(const baseY of [0,10.2,20.004,-2]) {
    const roof=buildRoof(library(),{...hallOptions.taihe,width:data.dimensions.width+.6,depth:data.dimensions.depth+.6,baseY,walkingBeastProfile:'taihe'});
    assert.equal(roof.userData.walkingBeasts.animalTotal,80);release(roof);
  }
});
for(const name of ['baohe','zhonghe'])test(`${name} entire already-reviewed roof/profile matches c9a82aa exactly`,()=>{
  const roof=buildRoof(library(),{...hallOptions[name],walkingBeastProfile:name}),old=baseline.profiles[name];
  assert.deepEqual(signature(roof),old.geometry);assert.equal(triangles(roof),old.triangles);assert.equal(hash(roof.userData.walkingBeasts),old.recordHash);release(roof);
});
const hookless=await baselineHooklessBuilder();
for(const name of ['太和殿','保和殿','中和殿','交泰殿','乾清宫'])test(`${name} actual hall retains baseline physics and non-target roof/nonroof bytes`,()=>{
  const before=hallCapture(hookless.PalaceBuilder,name),after=hallCapture(PalaceBuilder,name),old=baseline.halls[name];
  assert.deepEqual(after.summary.remainder,before.summary.remainder);assert.deepEqual(after.summary.remainder,old.remainder);
  assert.deepEqual(after.summary.physics,before.summary.physics);assert.equal(hash(after.summary.physics),old.physicsHash);
  assert.equal(after.summary.physics.colliders.length,old.colliders);assert.equal(after.summary.physics.walkables.length,old.walkables);
  assert.deepEqual(before.summary.roof,old.roof);
  if(name==='太和殿'){
    assert.equal(before.summary.records.length,0);assert.equal(after.summary.records.length,1);assert.equal(after.summary.records[0].animalTotal,80);
    assert.equal(after.summary.roofTriangles-old.roofTriangles,1152);assert.equal(after.summary.roof.meshes,old.roof.meshes);
  } else {
    assert.deepEqual(after.summary.roof,old.roof);assert.equal(after.summary.roofTriangles,old.roofTriangles);
    assert.equal(hash(after.summary.records),old.recordsHash);
  }
  for(const x of [before,after]){release(x.group);for(const m of x.builder.ownedMaterials)m.dispose();}
});
test('Taihe repeated rebuild/dispose gives every temporary/final geometry and owned material one owner',()=>{
  const gd=THREE.BufferGeometry.prototype.dispose,md=THREE.Material.prototype.dispose,geos=new Map(),mats=new Map();
  THREE.BufferGeometry.prototype.dispose=function(){geos.set(this,(geos.get(this)??0)+1);return gd.call(this);};
  THREE.Material.prototype.dispose=function(){mats.set(this,(mats.get(this)??0)+1);return md.call(this);};
  try {
    for(let repeat=0;repeat<3;repeat++){
      const {roof,raw,lib}=captureTaihe();for(const r of raw)assert.equal(geos.get(r.geometry),1);
      roof.traverse(m=>{if(m.isMesh)assert.equal(geos.get(m.geometry),undefined);});
      const owned=[...roof.userData.ownedMaterials];assert.equal(owned.length,1);release(roof);
      roof.traverse(m=>{if(m.isMesh)assert.equal(geos.get(m.geometry),1);});for(const m of owned)assert.equal(mats.get(m),1);for(const m of lib.mats.values())assert.equal(mats.get(m),undefined);
    }
    assert.ok([...geos.values()].every(n=>n===1));
  } finally {THREE.BufferGeometry.prototype.dispose=gd;THREE.Material.prototype.dispose=md;}
});

import {mergeByMaterial} from '../../src/utils/MergeUtils.js';
import {assertThreeHallWalkingBeastsInWorld} from '../lib/r58-three-hall-beasts-world-check.mjs';
function threeRoofFragments(){
  const scene=new THREE.Scene(),root=new THREE.Group(),lib=library();root.userData.hallWalkingBeasts=[];root.position.set(13,0,125);root.rotation.y=.27;
  for(const [i,name]of ['taihe','baohe','zhonghe'].entries()){
    const roof=buildRoof(lib,{...hallOptions[name],baseY:8,walkingBeastProfile:name});roof.position.set(i*85,0,0);root.add(roof);
    root.userData.hallWalkingBeasts.push({...roof.userData.walkingBeasts,position:roof.position.toArray()});
  }
  scene.add(root);return {scene,cm:{},root};
}
test('three-hall pure W successor measures all 720 base/ridge-triangle contacts after actual final material merge',()=>{
  const W=threeRoofFragments(),before=signature(W.scene),first=assertThreeHallWalkingBeastsInWorld(W);
  assert.deepEqual(signature(W.scene),before,'consumer does not alter submitted geometry/material/scene transforms');
  assert.equal(first.halls.reduce((n,h)=>n+h.actualMergedRidgeTriangleContacts,0),720);
  assert.equal(first.halls.find(h=>h.entityId==='FC-A478209231').actualMergedRidgeTriangleContacts,320);
  const merged=mergeByMaterial(W.root);W.scene.remove(W.root);W.scene.add(merged);const mergedBefore=signature(W.scene);
  assert.deepEqual(assertThreeHallWalkingBeastsInWorld(W),first);assert.deepEqual(signature(W.scene),mergedBefore);
  assert.equal(W.scene.children.length,1);assert.equal(merged.userData.hallWalkingBeasts.length,3);
  const taihe=merged.userData.hallWalkingBeasts.find(r=>r.entityId==='FC-A478209231');
  taihe.rows[0].stations[0].footContacts[0][1]+=.05;
  assert.throws(()=>assertThreeHallWalkingBeastsInWorld(W),/vertex missing/);taihe.rows[0].stations[0].footContacts[0][1]-=.05;
  merged.userData.hallWalkingBeasts.push(taihe);assert.throws(()=>assertThreeHallWalkingBeastsInWorld(W),/exactly/);merged.userData.hallWalkingBeasts.pop();
  release(merged);
});
test('three-hall consumer rejects missing support even when every actual walking-body foot vertex remains',()=>{
  const W=threeRoofFragments(),merged=mergeByMaterial(W.root);W.scene.remove(W.root);W.scene.add(merged);merged.updateMatrixWorld(true);
  const r=merged.userData.hallWalkingBeasts.find(r=>r.entityId==='FC-A478209231');
  const p=new THREE.Vector3().fromArray(r.rows[0].stations[0].footContacts[0]).add(new THREE.Vector3().fromArray(r.position)).applyMatrix4(merged.matrixWorld);
  let moved=0;
  merged.traverse(m=>{
    if(!m.isMesh||m.material.name!=='roof_ridge_glaze')return;
    assert.equal(m.geometry.index,null);const a=m.geometry.attributes.position;
    for(let i=0;i<a.count;i+=3){
      const pts=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(a,i+k).applyMatrix4(m.matrixWorld)),t=new THREE.Triangle(...pts);
      if(!pts.some(v=>v.distanceTo(p)<4e-5)&&t.closestPointToPoint(p,new THREE.Vector3()).distanceTo(p)<4e-5){
        for(let k=0;k<3;k++)a.setY(i+k,a.getY(i+k)-1);moved++;
      }
    }
  });
  assert.ok(moved>0,'remove actual support triangle(s), not body/contact metadata');
  assert.throws(()=>assertThreeHallWalkingBeastsInWorld(W),/support triangle missing/);release(merged);
});
