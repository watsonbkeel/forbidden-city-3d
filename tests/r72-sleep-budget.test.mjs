import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createCharacterGeometry,createCharacterGeometrySteps} from '../src/scene/characters/CharacterKit.js';
const B=THREE.BufferGeometry.prototype,A=THREE.BufferAttribute.prototype;
const old={dispose:B.dispose,applyMatrix4:B.applyMatrix4,computeBoundingBox:B.computeBoundingBox,computeBoundingSphere:B.computeBoundingSphere,setXYZ:A.setXYZ};
let events={writes:0,bulk:0,disposed:[]};
A.setXYZ=function(...v){events.writes++;return old.setXYZ.apply(this,v);};
for(const name of ['applyMatrix4','computeBoundingBox','computeBoundingSphere'])B[name]=function(...v){events.bulk++;return old[name].apply(this,v);};
B.dispose=function(...v){events.disposed.push(this);return old.dispose.apply(this,v);};
const records=[];
try{
 for(const template of ['consort-daily','maid-daily'])for(const lod of [0,1,2]){
  const reference=createCharacterGeometry(template,'standing',lod,{femalePose:'resting'});reference.rotateX(-Math.PI/2);reference.computeBoundingBox();reference.translate(0,-reference.boundingBox.min.y,-(reference.boundingBox.min.z+reference.boundingBox.max.z)/2);reference.computeBoundingBox();reference.computeBoundingSphere();
  const it=createCharacterGeometrySteps(template,'sleeping',lod);let r,transformed=0,transformSteps=0,maxWrites=0,finalMs=0;
  do{events={writes:0,bulk:0,disposed:[]};const start=performance.now();r=it.next();const elapsed=performance.now()-start;
   if(r.value?.phase==='sleep-transform'){const progress=r.value;assert.ok(progress.workUnits>0&&progress.workUnits<=128);assert.equal(progress.workUnits,progress.work.transformedVertices);assert.equal(events.writes,2*progress.workUnits,'position and normal each written once per vertex');assert.ok(events.writes<=256);assert.equal(events.bulk,0,'no synchronous whole-mesh methods during transform');transformed+=progress.workUnits;transformSteps++;maxWrites=Math.max(maxWrites,events.writes);}
   if(r.done){assert.equal(events.writes,0);assert.equal(events.bulk,0,'final publication must not rescan geometry');finalMs=elapsed;}
  }while(!r.done);
  const actual=r.value,p=actual.attributes.position,n=actual.attributes.normal;
  assert.equal(transformed,p.count);assert.equal(transformSteps,Math.ceil(p.count/128));assert.equal(events.disposed.length,0);
  for(const name of ['position','normal']){const a=actual.attributes[name].array,b=reference.attributes[name].array;assert.equal(a.length,b.length);for(let i=0;i<a.length;i++)assert.ok(Math.abs(a[i]-b[i])<2e-6,`${template} LOD${lod} ${name}[${i}] changed`);}
  for(let i=0;i<p.count;i++){const point=new THREE.Vector3().fromBufferAttribute(p,i);assert.ok(actual.boundingBox.clone().expandByScalar(1e-7).containsPoint(point));assert.ok(point.distanceTo(actual.boundingSphere.center)<=actual.boundingSphere.radius+1e-7);}
  records.push({template,lod,vertices:p.count,transformSteps,maxWrites,finalMs});actual.dispose();reference.dispose();
  for(const method of ['return','throw']){
   const cancel=createCharacterGeometrySteps(template,'sleeping',lod);let yielded;do{yielded=cancel.next();assert.equal(yielded.done,false);}while(yielded.value.phase!=='sleep-transform');
   events={writes:0,bulk:0,disposed:[]};if(method==='return')assert.equal(cancel.return().done,true);else assert.throws(()=>cancel.throw(new Error('review-cancel')),/review-cancel/);
   assert.equal(events.disposed.length,1,`${template} LOD${lod} ${method} must dispose partial geometry once`);assert.equal(cancel.next().done,true);
  }
 }
 console.log(JSON.stringify(records,null,2));console.log('PASS: 6 template/LOD transforms match former geometry, every transform step ≤128 vertices, no bulk rescans, bounds contain all vertices, 12 return/throw cancellation paths dispose exactly once.');
}finally{A.setXYZ=old.setXYZ;for(const name of ['dispose','applyMatrix4','computeBoundingBox','computeBoundingSphere'])B[name]=old[name];}
