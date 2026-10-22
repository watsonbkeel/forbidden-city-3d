/** R51 current production acceptance against the immutable c8ae19b source.
 * No historical oracle is regenerated. CPU geometry/support evidence only.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import * as kit from '../src/scene/characters/CharacterKit.js';
import {deformCharacterVertex} from '../src/scene/characters/CharacterAnimation.js';
import {frozenKit,frozenKitSource} from './helpers/r51-frozen-character-kit.mjs';
const cases=[];
for(const templateId of Object.keys(kit.CHARACTER_TEMPLATES))for(const pose of kit.CHARACTER_POSES)for(const lod of [0,1,2])for(const seatVariant of pose==='seated'?['standard','kang-low','raised-footstool','throne-front-perch']:['standard'])cases.push({templateId,pose,lod,seatVariant});
for(const templateId of ['consort-daily','maid-daily'])for(const lod of [0,1,2])cases.push({templateId,pose:'standing',lod,seatVariant:'standard',femalePose:'walking'});
const key=c=>[c.templateId,c.pose,c.lod,c.seatVariant,c.femalePose??'resting'].join('/');
const make=(api,c)=>api.createCharacterGeometry(c.templateId,c.pose,c.lod,c);
const bytes=a=>Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength);
const metadata=a=>({type:a.array.constructor.name,itemSize:a.itemSize,count:a.count,normalized:a.normalized,version:a.version,usage:a.usage,gpuType:a.gpuType,name:a.name,length:a.array.length,byteLength:a.array.byteLength,byteOffset:a.array.byteOffset,bytesPerElement:a.array.BYTES_PER_ELEMENT,isBufferAttribute:a.isBufferAttribute,updateRanges:a.updateRanges});
const bounds=g=>({box:{min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()},sphere:{center:g.boundingSphere.center.toArray(),radius:g.boundingSphere.radius}});
const gmeta=g=>({userData:g.userData,groups:g.groups,drawRange:g.drawRange,morphTargetsRelative:g.morphTargetsRelative,morphAttributes:g.morphAttributes});
const entries=g=>[...Object.entries(g.attributes),['index',g.index]];
const attr=(g,n)=>n==='index'?g.index:g.attributes[n];
const equalBytes=(a,b,label)=>assert.ok(bytes(a).equals(bytes(b)),`${label}: every actual typed-array byte must match`);
function footVertices(g,part){const a=g.attributes,ids=[];for(let i=0;i<a.position.count;i++)if(a.characterPart.getX(i)===part)ids.push(i);return ids;}
function contactY(c){return c.pose!=='seated'?0:c.seatVariant==='kang-low'?.04:['raised-footstool','throne-front-perch'].includes(c.seatVariant)?.30:0;}
function expectedDelta(old,c){
 const expected=old.clone(),moved=new Set(),adjacent=new Set();
 if(c.lod===2){
  for(const part of [4,5]){const ids=footVertices(old,part),minY=Math.min(...ids.map(i=>old.attributes.position.getY(i)));const bottom=ids.filter(i=>old.attributes.position.getY(i)===minY);assert.equal(bottom.length,6,`${key(c)} five-ring vertices plus bottom cap`);for(const i of bottom){moved.add(i);expected.attributes.position.setY(i,contactY(c));}}
  for(let i=0;i<old.index.count;i+=3){const ids=[old.index.getX(i),old.index.getX(i+1),old.index.getX(i+2)];if(ids.some(id=>moved.has(id)))for(const id of ids)adjacent.add(id);}
  expected.computeVertexNormals();expected.computeBoundingBox();expected.computeBoundingSphere();
 }
 return{expected,moved,adjacent};
}
function compare(g,old,c){
 const {expected,moved,adjacent}=expectedDelta(old,c);
 try{
  assert.deepEqual(Object.keys(g.attributes),Object.keys(old.attributes),`${key(c)} attribute order`);
  for(const [name,a]of entries(g)){
   assert.deepEqual(metadata(a),metadata(attr(old,name)),`${key(c)}/${name} full metadata`);
   equalBytes(a,attr(expected,name),`${key(c)}/${name} exact permitted delta`);
  }
  assert.deepEqual(gmeta(g),gmeta(old),`${key(c)} all geometry metadata unchanged`);
  assert.deepEqual(bounds(g),bounds(expected),`${key(c)} only derived bounds may change`);
  assert.equal(g.index.count,old.index.count,`${key(c)} unchanged triangle budget`);
  if(c.lod<2){assert.deepEqual(bounds(g),bounds(old));return;}
  let changedScalars=0,normalChanged=0;
  for(let i=0;i<g.attributes.position.array.length;i++){
   if(Object.is(g.attributes.position.array[i],old.attributes.position.array[i]))continue;
   changedScalars++;assert.equal(i%3,1,`${key(c)} only position.y`);assert.ok(moved.has(Math.floor(i/3)),`${key(c)} only bottom ring/cap`);
  }
  assert.equal(changedScalars,12,`${key(c)} exact two six-vertex bottoms`);
  for(let i=0;i<g.attributes.normal.array.length;i++)if(!Object.is(g.attributes.normal.array[i],old.attributes.normal.array[i])){normalChanged++;assert.ok(adjacent.has(Math.floor(i/3)),`${key(c)} normal changes restricted to triangles incident to bottom`);}
  assert.ok(normalChanged>0,`${key(c)} normals recomputed for the extended shoe wall`);
 }finally{expected.dispose();}
}
function incremental(c){
 const it=kit.createCharacterGeometrySteps(c.templateId,c.pose,c.lod,c),totals={},phases=new Set();let next,n=0;
 do{next=it.next();if(!next.done){const p=next.value;n++;assert.equal(p.kind,'character-geometry');assert.equal(p.maxWorkUnits,128);assert.ok(p.workUnits>0&&p.workUnits<=128);assert.ok(!p.isBufferGeometry&&!p.geometry);assert.ok((p.work.vertices??0)<=128);assert.ok((p.work.triangles??0)<=256);for(const[k,v]of Object.entries(p.work))totals[k]=(totals[k]??0)+v;phases.add(p.phase);}}while(!next.done);
 assert.ok(n>4);const g=next.value;for(const k of ['vertices','normalVertices','boxVertices','sphereVertices'])assert.equal(totals[k],g.attributes.position.count);for(const k of ['triangles','normalTriangles'])assert.equal(totals[k],g.index.count/3);for(const p of ['normals','bounds','attributes'])assert.ok(phases.has(p));return g;
}
test('R51 sole repair is the only production source delta from pinned c8ae19b',()=>{
 const before='yield* b.loft([{x,y:y+.024,rx:.064',after='yield* b.loft([{x,y:lod===2?y:y+.024,rx:.064';
 assert.equal(frozenKitSource.split(before).length,2,'one uniquely identified upper-shoe ring');
 assert.equal(fs.readFileSync(new URL('../src/scene/characters/CharacterKit.js',import.meta.url),'utf8'),frozenKitSource.replace(before,after));
 assert.equal(cases.length,132);assert.equal(cases.filter(c=>c.lod<2).length,88);assert.equal(cases.filter(c=>c.lod===2).length,44);
});
for(const mode of ['synchronous','incremental'])test(`R51 ${mode}: all 132 current geometries retain exact arrays/index/metadata except LOD2 bottom and mathematical derivatives`,()=>{
 for(const c of cases){const old=make(frozenKit,c),g=mode==='synchronous'?make(kit,c):incremental(c);try{compare(g,old,c);}finally{g.dispose();old.dispose();}}
});
test('R51 actual shoe minY touches ground/step/floor/footstool surfaces for every identity, pose, LOD and seat/walking variant',()=>{
 const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
 for(const c of cases){const g=make(kit,c),a=g.attributes;try{
  for(const height of [0,12.2075]){
   const y=contactY(c),surface=new THREE.Mesh(new THREE.BoxGeometry(3,.1,3),material);surface.position.set(0,height+y-.05,0);surface.updateMatrixWorld(true);
   for(const part of [4,5]){
    const ids=footVertices(g,part),minY=Math.min(...ids.map(i=>a.position.getY(i)));assert.ok(Math.abs(minY-y)<2e-8,`${key(c)}/foot${part}: actual minY ${minY}, support ${y}`);
    const contact=g.userData.groundContacts[part-4];assert.equal(contact[1],y,`${key(c)} explicit foot metadata`);
    const bottom=ids.filter(i=>Math.abs(a.position.getY(i)-minY)<1e-9);assert.ok(bottom.length>=6);
    for(const i of bottom){const p=[a.position.getX(i),a.position.getY(i),a.position.getZ(i)],normal=[a.normal.getX(i),a.normal.getY(i),a.normal.getZ(i)],rig={part,pivot:[a.characterPivot.getX(i),a.characterPivot.getY(i),a.characterPivot.getZ(i)],weight:a.characterWeight.getX(i),torsoWeight:a.characterTorsoWeight.getX(i)};
     for(const time of [0,2,8]){const q=deformCharacterVertex(p,normal,rig,{pose:c.pose,time,amplitude:.7,walkSpeed:0}).position;const ray=new THREE.Raycaster(new THREE.Vector3(q[0],height+q[1]+.05,q[2]),new THREE.Vector3(0,-1,0),0,.1),hit=ray.intersectObject(surface,false)[0];assert.ok(hit,`${key(c)} actual support triangle beneath every bottom vertex`);assert.ok(Math.abs(height+q[1]-hit.point.y)<3e-8,`${key(c)} deformed shoe/support separation`);}
    }
   }
   if(c.pose==='seated'){assert.deepEqual(g.userData.seatContact,[0,.49,-.04]);assert.deepEqual(g.userData.seatPelvis,[0,.57,-.04]);assert.ok(Math.abs((height+g.userData.seatContact[1])-(height+y)-(.49-y))<1e-12,'seat/foot surface height relation');}
   surface.geometry.dispose();
  }
 }finally{g.dispose();}}
 material.dispose();
});
test('historical c8ae19b independently reproduces the LOD2 24mm sole omission without changing old oracle bytes',()=>{
 for(const c of cases.filter(c=>c.lod===2)){const g=make(frozenKit,c);for(const part of[4,5]){const minY=Math.min(...footVertices(g,part).map(i=>g.attributes.position.getY(i)));assert.ok(Math.abs(minY-contactY(c)-.024)<2e-8);}g.dispose();}
});
