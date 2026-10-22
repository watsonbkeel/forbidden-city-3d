import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { inflateSync } from 'node:zlib';
import { readFixtureArchive } from './helpers/p3c-fixture-archive.mjs';
import * as THREE from 'three';
import * as kit from '../src/scene/characters/CharacterKit.js';

const baseline=JSON.parse(readFixtureArchive(new URL('../reports/r50-followup/kit-preparation-baseline.json.gz.index.json',import.meta.url)));
const femaleBaseline=JSON.parse(readFixtureArchive(new URL('../reports/r50-followup/female-refinement-baseline.json.gz.index.json',import.meta.url)));
const femaleIds=new Set(['consort-daily','maid-daily']);
const caseKey=c=>[c.templateId,c.pose,c.lod,c.seatVariant].join('/');
const femaleCases=new Map(femaleBaseline.cases.map(c=>[caseKey(c),c]));
// Never rewrite the 126-output performance-stage baseline: the 90 male cases
// stay byte-exact, and the 36 intentionally revised female cases use a separate
// frozen candidate artifact. Both production APIs remain exact against it.
const comparisonCases=baseline.cases.map(c=>femaleIds.has(c.templateId)?femaleCases.get(caseKey(c)):c);
const bytes=a=>Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength);
function equivalent(g,c){
 assert.deepEqual(Object.keys(g.attributes),Object.keys(c.attributes));
 for(const [name,a] of [...Object.entries(g.attributes),['index',g.index]]){
  const old=name==='index'?c.index:c.attributes[name];
  assert.deepEqual(bytes(a),inflateSync(Buffer.from(old.deflateBase64,'base64')),`${c.templateId}/${c.pose}/${c.lod}/${c.seatVariant} ${name}: exact bytes`);
  for(const k of ['itemSize','count','normalized','version','usage','gpuType'])assert.equal(a[k],old[k],`${name}.${k}`);
  assert.equal(a.array.constructor.name,old.type);
 }
 assert.deepEqual(g.userData,c.userData);
 assert.deepEqual({min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()},c.box);
 assert.deepEqual({center:g.boundingSphere.center.toArray(),radius:g.boundingSphere.radius},c.sphere);
}
function drain(c){
 assert.equal(typeof kit.createCharacterGeometrySteps,'function','incremental geometry API must exist');
 const iterator=kit.createCharacterGeometrySteps(c.templateId,c.pose,c.lod,{seatVariant:c.seatVariant});
 let result,steps=0;const totals={};const phases=new Set();
 do{
  result=iterator.next();
  if(!result.done){
   steps++;const p=result.value;
   assert.equal(p.kind,'character-geometry');assert.equal(p.maxWorkUnits,128);
   assert.ok(p.workUnits>0&&p.workUnits<=128,`bounded work: ${p.workUnits}`);
   assert.ok(!p.isBufferGeometry);assert.ok(!p.geometry,'partial resources must not escape');
   assert.ok((p.work.vertices??0)<=128);assert.ok((p.work.triangles??0)<=256);
   for(const [k,v] of Object.entries(p.work))totals[k]=(totals[k]??0)+v;
   phases.add(p.phase);
  }
 }while(!result.done);
 assert.ok(steps>4);assert.equal(totals.vertices,result.value.attributes.position.count);
 assert.equal(totals.triangles,result.value.index.count/3);
 assert.equal(totals.normalTriangles,result.value.index.count/3);
 assert.equal(totals.normalVertices,result.value.attributes.position.count);
 assert.equal(totals.boxVertices,result.value.attributes.position.count);
 assert.equal(totals.sphereVertices,result.value.attributes.position.count);
 assert.ok(phases.has('normals'));assert.ok(phases.has('bounds'));assert.ok(phases.has('attributes'));
 return result.value;
}

test('incremental Kit preserves 90 original male and 36 explicit female candidate cases byte for byte',()=>{
 assert.equal(baseline.cases.length,126);assert.equal(femaleCases.size,36);assert.ok(comparisonCases.every(Boolean));assert.equal(comparisonCases.filter(c=>!femaleIds.has(c.templateId)).length,90);
 for(const c of comparisonCases){const g=drain(c);equivalent(g,c);g.dispose();}
});
test('synchronous API drives the same production sequence without changing frozen arrays or metadata',()=>{
 for(const c of comparisonCases){const g=kit.createCharacterGeometry(c.templateId,c.pose,c.lod,{seatVariant:c.seatVariant});equivalent(g,c);g.dispose();}
});
test('cancellation at every phase never publishes or allocates partial geometry and is final',()=>{
 assert.equal(typeof kit.createCharacterGeometrySteps,'function','incremental geometry API must exist');
 const original=THREE.BufferGeometry.prototype.setAttribute;let allocations=0;
 THREE.BufferGeometry.prototype.setAttribute=function(...args){allocations++;return original.apply(this,args);};
 try{
  for(const target of ['mesh','triangulate','attributes','normals','bounds','complete']){
   const it=kit.createCharacterGeometrySteps('emperor-ceremonial','standing',0);let n;let seen=false;
   while(!(n=it.next()).done){assert.equal(allocations,0);if(n.value.phase===target){seen=true;break;}}
   assert.ok(seen,`phase ${target} must be cancellable`);assert.deepEqual(it.return(),{value:undefined,done:true});assert.deepEqual(it.next(),{value:undefined,done:true});assert.equal(allocations,0);
  }
 }finally{THREE.BufferGeometry.prototype.setAttribute=original;}
 const c=baseline.cases[0],g=drain(c);equivalent(g,c);g.dispose();
});
test('incremental validation fails before producing work and preserves synchronous errors',()=>{
 assert.equal(typeof kit.createCharacterGeometrySteps,'function');
 for(const args of [['unknown'],['guard-duty','unknown'],['guard-duty','standing',4],['guard-duty','seated',0,{seatVariant:'unknown'}],['guard-duty','standing',0,{seatVariant:'kang-low'}]]){
  assert.throws(()=>kit.createCharacterGeometrySteps(...args).next());assert.throws(()=>kit.createCharacterGeometry(...args));
 }
});

test('independent Three operations obey per-next bounds without whole-buffer normal or bounds calls',()=>{
 const original={color:THREE.Color.prototype.setHex,read:THREE.Vector3.prototype.fromBufferAttribute,write:THREE.BufferAttribute.prototype.setXYZ,triangulate:THREE.ShapeUtils.triangulateShape};
 const forbidden={};let counts;
 THREE.Color.prototype.setHex=function(...args){counts.colors++;return original.color.apply(this,args);};
 THREE.Vector3.prototype.fromBufferAttribute=function(...args){counts.reads++;return original.read.apply(this,args);};
 THREE.BufferAttribute.prototype.setXYZ=function(...args){counts.writes++;return original.write.apply(this,args);};
 THREE.ShapeUtils.triangulateShape=function(contour,...args){counts.contours++;assert.ok(contour.length<=20);return original.triangulate.call(this,contour,...args);};
 for(const name of ['computeVertexNormals','normalizeNormals','computeBoundingBox','computeBoundingSphere']){forbidden[name]=THREE.BufferGeometry.prototype[name];THREE.BufferGeometry.prototype[name]=()=>assert.fail(`unbounded ${name} call`);}
 try{
  for(const templateId of Object.keys(kit.CHARACTER_TEMPLATES)){
   const it=kit.createCharacterGeometrySteps(templateId,'standing',0);let n;
   do{
    counts={colors:0,reads:0,writes:0,contours:0};n=it.next();
    assert.ok(counts.colors<=128,`actual vertex colors: ${counts.colors}`);
    assert.ok(counts.reads<=768,`actual normal/bounds reads: ${counts.reads}`);
    assert.ok(counts.writes<=384,`actual Float32 normal writes: ${counts.writes}`);
    assert.ok(counts.contours<=1,'only one bounded contour per step');
    if(!n.done)assert.equal(counts.colors,n.value.work.vertices??0);
   }while(!n.done);
   n.value.dispose();
  }
 }finally{
  THREE.Color.prototype.setHex=original.color;THREE.Vector3.prototype.fromBufferAttribute=original.read;THREE.BufferAttribute.prototype.setXYZ=original.write;THREE.ShapeUtils.triangulateShape=original.triangulate;
  for(const [name,fn] of Object.entries(forbidden))THREE.BufferGeometry.prototype[name]=fn;
 }
});
test('throw cancellation unwinds preparation and never returns a geometry',()=>{
 const it=kit.createCharacterGeometrySteps('guard-duty','standing',0);assert.equal(it.next().done,false);
 const reason=new Error('cancel preparation');assert.throws(()=>it.throw(reason),e=>e===reason);
 assert.deepEqual(it.next(),{value:undefined,done:true});
});

test('the intentional female update preserves historical contact metadata and does not relabel historical approval',()=>{
 for(const old of baseline.cases.filter(c=>femaleIds.has(c.templateId))){const current=femaleCases.get(caseKey(old));assert.deepEqual({...current.userData,triangles:old.userData.triangles},old.userData);const g=kit.createCharacterGeometry(old.templateId,old.pose,old.lod,{seatVariant:old.seatVariant});try{assert.notDeepEqual(bytes(g.attributes.position),inflateSync(Buffer.from(old.attributes.position.deflateBase64,'base64')));}finally{g.dispose();}}
});
