import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Enclosure } from '../src/scene/Enclosure.js';
import { LAYOUT } from '../src/config/constants.js';
import { WUMEN_ASCENT_PROFILE as P } from '../src/scene/palace/special/WumenAscentProfile.js';
const mats=new Map();const lib={material:(name,params={})=>{const k=name+JSON.stringify(params);if(!mats.has(k))mats.set(k,new THREE.MeshStandardMaterial({name,...params}));return mats.get(k);},tileSize:()=>2,aspect:()=>1};
function fixture(fit){const en=new Enclosure(new THREE.Scene(),lib),group=new THREE.Group();
 if(!fit)en.addWallSegment=function(parent,{wumenCapFit,...opts},...rest){return Enclosure.prototype.addWallSegment.call(this,parent,opts,...rest);};
 en.buildOuterWalls(group);group.updateMatrixWorld(true);return {en,group};}
const before=fixture(false),after=fixture(true);
const changed=group=>group.children.filter(o=>o.name==='wall_cap'&&Math.abs(o.position.z-(-420.7))<1e-8);
function signature(root,omitTop=false){const rows=[];root.traverse(o=>{if(o.isMesh)rows.push({position:o.position.toArray(),rotation:o.quaternion.toArray(),material:o.material.name,attributes:Object.fromEntries(Object.entries(o.geometry.attributes).map(([k,a])=>[k,[...a.array].filter((_,i)=>!omitTop||o.geometry.attributes.normal.getY(Math.floor(i/a.itemSize))!==1)])),index:o.geometry.index?[...o.geometry.index.array]:null,cast:o.castShadow,receive:o.receiveShadow});});return rows;}
const southBody=o=>o.isMesh&&o.material.name==='wall_red'&&Math.abs(o.position.z+420.7)<1e-8;
test('only two local caps and covered wall-top notches change; every other enclosure face and all crenels remain exact',()=>{
 assert.equal(changed(before.group).length,2);assert.equal(changed(after.group).length,2);
 assert.equal(before.group.children.length,after.group.children.length);
 const oldCaps=new Set(changed(before.group)),newCaps=new Set(changed(after.group));
 for(let i=0;i<before.group.children.length;i++){
  const a=before.group.children[i],b=after.group.children[i];assert.equal(oldCaps.has(a),newCaps.has(b));
  assert.deepEqual(a.position.toArray(),b.position.toArray());
  if(!oldCaps.has(a))assert.deepEqual(signature(a,southBody(a)),signature(b,southBody(b)),`unscoped enclosure child${i}`);
 }
 assert.deepEqual(before.en.colliders,after.en.colliders);assert.deepEqual(before.en.getColliders(),after.en.getColliders());
});
test('actual fitted cap end stays outside the return-flight and fold footprint at both signs',()=>{
 for(const cap of changed(after.group)){
  const side=Math.sign(cap.position.x),box=new THREE.Box3().setFromObject(cap),edge=side>0?box.min.x:-box.max.x;
  assert.ok(Math.abs(edge-P.wallInterface.absoluteX[1])<1e-5);
  assert.equal(cap.userData.topY,changed(before.group).find(c=>Math.sign(c.position.x)===side).userData.topY);
  assert.ok(box.max.y>12.9,'the original tall cap is retained outside the cut');
  const footprint=new THREE.Box3(new THREE.Vector3(side>0?60:-97.9,9.8,LAYOUT.WUMEN_Z-2.55),new THREE.Vector3(side>0?97.9:-60,14,LAYOUT.WUMEN_Z+9.4));
  // Float32 cap endpoint differs by micrometres; no claimed clear surveyed gap.
  if(side>0)footprint.max.x-=1e-4;else footprint.min.x+=1e-4;
  assert.equal(box.intersectsBox(footprint),false);
 }
});
test('wall-top notches add exactly eight triangles; cap fit adds none, with no new material, texture or wall walkable',()=>{
 const count=g=>{let n=0;g.traverse(o=>{if(o.isMesh)n+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;});return n;};
 assert.equal(count(after.group)-count(before.group),8);
 assert.equal(changed(after.group).reduce((n,g)=>n+count(g),0),changed(before.group).reduce((n,g)=>n+count(g),0));
 assert.equal(after.en.getWalkables?.(),undefined);
 assert.equal(after.en.ownedMaterials.length,before.en.ownedMaterials.length);
});
