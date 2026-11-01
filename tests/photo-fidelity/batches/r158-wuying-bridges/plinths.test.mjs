import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {library} from '../../../lib/inner-palace-fixture.mjs';
import {buildWuyingThreeBridgeRails} from '../../../../src/scene/palace/special/WuyingThreeBridgeRails.js';
const bridges=[0,1,2].map(i=>({id:`wuying-${i+1}`,family:'wuying',x:220.8+(i-1)*34.9/5,z:-249.8-(17.9+1.6)/2-.8*1.6-4.8-18.4/2,axis:'z',length:18.4,width:i===1?5:3.8,minWidth:i===1?5:3.8,crest:.45,railSides:[-1,1]}));
const dispose=r=>r.group.traverse(m=>m.geometry?.dispose());
test('Three own-source bridges have six continuous low plinth runs and twelve extended end feet, not a floating rescue floor',()=>{
 for(const b of bridges){const r=buildWuyingThreeBridgeRails(library(),b);try{
  const parts=r.group.children.filter(m=>m.userData.wuyingBridgeRail.role==='low-beveled-rail-plinth');
  assert.equal(parts.length,42,`${b.id}: low plinth must join beneath every post, panel and end`);
  assert.equal(r.colliders.length,42,'plinth remains inside existing source-triangle owners');
  assert.equal(r.metadata.plinths?.runs,2);assert.equal(r.metadata.plinths?.endFeet,4);
  assert.equal(r.metadata.plinths?.dimensionStatus,'VISIBLE_TYPE_PHOTO_FIT_NOT_SURVEYED');
  for(const side of[-1,1]){
   const axis=b.x+side*(b.width/2-.12),run=parts.filter(m=>{m.geometry.computeBoundingBox();return Math.abs(m.geometry.boundingBox.getCenter(new T.Vector3()).x-axis)<.001;});
   assert.equal(run.length,21);
   const bounds=run.map(m=>m.geometry.boundingBox).sort((a,c)=>a.min.z-c.min.z);
   assert.ok(bounds[0].min.z<b.z-8.85&&bounds[0].min.z>=b.z-b.length/2);
   assert.ok(bounds.at(-1).max.z>b.z+8.85&&bounds.at(-1).max.z<=b.z+b.length/2);
   for(let i=1;i<bounds.length;i++)assert.ok(Math.abs(bounds[i].min.z-bounds[i-1].max.z)<.00004,'no gap between adjacent plinth solids');
   for(const m of run){const p=m.geometry.attributes.position;assert.ok(p.array.every(Number.isFinite));for(let i=0;i<p.count;i++){const a=p.getZ(i)-b.z,deck=b.crest*(1-(a/(b.length/2))**2);assert.ok(p.getY(i)>=deck-.031&&p.getY(i)<=deck+.113,'shallow plinth follows retained bridge deck rather than level AABB');}}
  }
 }finally{dispose(r);}}
});
import {wuyingBridgePlinthGeometry} from '../../../../src/scene/palace/special/WuyingBridgePlinths.js';
import {parentRails} from './parent.mjs';
const triangleKey=vertices=>vertices.map(v=>v.toArray().join(',')).sort().join('|');
const physicalKeys=owners=>owners.flatMap(c=>c.triangleSupport.template.triangles.map(q=>triangleKey([q.triangle.a,q.triangle.b,q.triangle.c])));
const visibleKeys=group=>{const out=[];group.updateMatrixWorld(true);group.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3){const vertices=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld));assert.ok(new T.Triangle(...vertices).getArea()>1e-12);out.push(triangleKey(vertices));}});return out;};
test('Original rail shapes survive only the declared 0.10m seating translation; added physical triangles are visible plinths',()=>{
 for(const b of bridges){const lib=library(),a=parentRails.buildWuyingThreeBridgeRails(lib,b),r=buildWuyingThreeBridgeRails(lib,b);try{
  const previous=physicalKeys(a.colliders),shifted=a.colliders.flatMap(c=>c.triangleSupport.template.triangles.map(q=>triangleKey([q.triangle.a,q.triangle.b,q.triangle.c].map(v=>new T.Vector3(v.x,Math.fround(v.y+.10),v.z))))),actual=physicalKeys(r.colliders),visible=visibleKeys(r.group);
  const set=new Set(actual);assert.ok(shifted.every(k=>set.has(k)),'existing crown/panel/opening/end shape altered beyond declared seat lift');
  assert.deepEqual(actual.sort(),visible.sort(),'visual and physical source triangles differ');
  assert.equal(actual.length-previous.length,1160);assert.equal(actual.length,8944);
 }finally{dispose(a);dispose(r);}}
});
test('New wet-span plinth projection stays beneath existing upper solids, so no new outside low-ledge body trap is created',()=>{
 for(const b of bridges){const lib=library(),a=parentRails.buildWuyingThreeBridgeRails(lib,b),r=buildWuyingThreeBridgeRails(lib,b);try{
  a.group.updateMatrixWorld(true);
  for(const m of r.group.children.filter(m=>m.userData.wuyingBridgeRail.role==='low-beveled-rail-plinth')){
   const p=m.geometry.attributes.position;
   for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(Math.abs(z-b.z)>5)continue;
    // A down ray tests the real retained upper geometry, not an inferred box.
    const hit=new T.Raycaster(new T.Vector3(x,3,z),new T.Vector3(0,-1,0),0,3).intersectObject(a.group,true).find(h=>h.point.y>y+.25);
    assert.ok(hit,`${b.id} new low catch outside retained upper projection ${x},${z}`);
   }
  }
 }finally{dispose(a);dispose(r);}}
});
test('Wrong bridge, side or nonfinite/out-of-envelope span fails before geometry is allocated',()=>{
 const base=bridges[1];for(const [b,side,a,c]of[[{...base,id:'duanhong'},1,0,1],[{...base,width:6},1,0,1],[base,0,0,1],[base,1,NaN,1],[base,1,0,Infinity],[base,1,1,0],[base,1,-9.2,0],[base,1,0,9.2]])assert.throws(()=>wuyingBridgePlinthGeometry(b,side,a,c),/identity\/span/);
});
test('Failure after the first indexed plinth converts to UV geometry releases input and converted output exactly once',()=>{
 const original=T.BufferGeometry.prototype.toNonIndexed,seen=[];try{
  T.BufferGeometry.prototype.toNonIndexed=function(...args){const converted=original.apply(this,args),row={input:0,converted:0};this.addEventListener('dispose',()=>row.input++);converted.addEventListener('dispose',()=>row.converted++);const set=converted.setAttribute;converted.setAttribute=function(name,...rest){if(name==='uv')throw Error('injected plinth UV failure');return set.call(this,name,...rest);};seen.push(row);return converted;};
  assert.throws(()=>buildWuyingThreeBridgeRails(library(),bridges[1]),/injected plinth UV failure/);assert.equal(seen.length,1);assert.deepEqual(seen[0],{input:1,converted:1});
 }finally{T.BufferGeometry.prototype.toNonIndexed=original;}
});
test('Even in-envelope spans must match an original post/panel/end interval; caller cannot create a new wide shelf',()=>{
 for(const [a,c]of[[-8,8],[-1,.5],[-9,9],[0,.29]])assert.throws(()=>wuyingBridgePlinthGeometry(bridges[1],1,a,c),/identity\/span/);
});
test('Normal-generation failure releases the helper-owned plinth before it reaches the caller allocation set',()=>{
 const normals=T.BufferGeometry.prototype.computeVertexNormals;let disposal=0;try{
  T.BufferGeometry.prototype.computeVertexNormals=function(){this.addEventListener('dispose',()=>disposal++);throw Error('injected helper normals failure');};
  const a=-7.85+15.7*5/9;assert.throws(()=>wuyingBridgePlinthGeometry(bridges[1],1,a-.145,a+.145),/injected helper normals failure/);assert.equal(disposal,1);
 }finally{T.BufferGeometry.prototype.computeVertexNormals=normals;}
});
test('Every column has an exposed uniquely visible plinth face below its seated shaft, not coincident or buried surfaces',()=>{
 for(const b of bridges){const h=buildWuyingThreeBridgeRails(library(),b);try{
  h.group.updateMatrixWorld(true);
  for(const side of[-1,1])for(let j=0;j<10;j++){
   const a=-7.85+15.7*j/9,deck=b.crest*(1-(a/(b.length/2))**2),axis=b.x+side*(b.width/2-.12);
   for(const height of[.025,.05,.08,.099]){
    const hits=new T.Raycaster(new T.Vector3(b.x,deck+height,b.z+a),new T.Vector3(side,0,0),0,b.width).intersectObject(h.group,true);
    assert.ok(hits.length);assert.equal(hits[0].object.userData.wuyingBridgeRail.role,'low-beveled-rail-plinth');
    assert.ok(!hits.some(hit=>hit.object!==hits[0].object&&Math.abs(hit.distance-hits[0].distance)<.00001),'coincident source faces can z-fight');
   }
   const stem=h.group.children.find(m=>m.userData.wuyingBridgeRail.role==='square-post-stem'&&Math.abs(new T.Box3().setFromObject(m).getCenter(new T.Vector3()).x-axis)<.001&&Math.abs(new T.Box3().setFromObject(m).getCenter(new T.Vector3()).z-b.z-a)<.001);
   const box=new T.Box3().setFromObject(stem);assert.ok(Math.abs(box.min.y-deck-.10)<.000002,'shaft is not seated on the fitted base datum');
  }
 }finally{dispose(h);}}
});
