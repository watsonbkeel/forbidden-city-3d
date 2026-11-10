// Test-only historical comparison. Never mutates a live geometry/contact.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {sha256,readPinnedFixture} from './source-view.mjs';
const contract=JSON.parse(readPinnedFixture('beam-contract.json'));
const ROLE='lower-front-entablature',OFFSET=new T.Vector3(221.9,0,241.1);
const same=(a,b,why)=>assert.deepEqual(a,b,why);
const bytes=a=>Buffer.from(a.buffer,a.byteOffset,a.byteLength);
const attribute=a=>({type:a.array.constructor.name,itemSize:a.itemSize,normalized:a.normalized,count:a.count,usage:a.usage,sha256:sha256(bytes(a.array))});
const bounds=g=>new T.Box3().setFromBufferAttribute(g.attributes.position);
const box=b=>[b.min.toArray(),b.max.toArray()];
function geometryValue(g){return{attributes:Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,attribute(a)])),index:g.index?attribute(g.index):null,groups:g.groups,drawRange:{start:g.drawRange.start,count:String(g.drawRange.count)},morphAttributes:g.morphAttributes,morphTargetsRelative:g.morphTargetsRelative,storedBounds:g.boundingBox?box(g.boundingBox):null,bounds:box(bounds(g))};}
function materialValue(m){const v=m.toJSON();delete v.uuid;return v;}
function properties(m){return{name:m.name,userData:m.userData,position:m.position.toArray(),quaternion:m.quaternion.toArray(),scale:m.scale.toArray(),matrix:m.matrix.toArray(),matrixWorld:m.matrixWorld.toArray(),visible:m.visible,castShadow:m.castShadow,receiveShadow:m.receiveShadow,frustumCulled:m.frustumCulled,renderOrder:m.renderOrder,matrixAutoUpdate:m.matrixAutoUpdate,matrixWorldAutoUpdate:m.matrixWorldAutoUpdate,layers:m.layers.mask,material:materialValue(m.material)};}
function identity(o,position=[0,0,0]){same(o.position.toArray(),position);same(o.quaternion.toArray(),[0,0,0,1]);same(o.scale.toArray(),[1,1,1]);assert.equal(o.visible,true);assert.equal(o.matrixAutoUpdate,true);assert.equal(o.matrixWorldAutoUpdate,true);same(o.matrix.toArray(),new T.Matrix4().compose(o.position,o.quaternion,o.scale).toArray(),'exact local matrix');}
function validateStructure(h){
 const {kit,f,out}=h;assert.ok(kit?.root&&f&&out?.frame);assert.equal(kit.root.name,'outer-west');assert.ok(kit.root.parent===null,'exact object identity: kit.root.parent');identity(kit.root);identity(f,OFFSET.toArray());identity(out.frame);
 assert.ok(f.parent===kit.root,'exact object identity: f.parent');assert.equal(kit.root.children.filter(x=>x===f).length,1);assert.ok(out.frame.parent===f,'exact object identity: out.frame.parent');assert.equal(f.children.filter(x=>x===out.frame).length,1);
 const ms=out.frame.children;assert.equal(ms.length,85);same(ms.map(m=>m.userData.dafotangLayoutRole),contract.orderedRoles);assert.equal(ms.filter(m=>m.userData.dafotangLayoutRole===ROLE).length,1);assert.equal(new Set(ms).size,85);assert.equal(new Set(ms.map(m=>m.uuid)).size,85);
 assert.equal(out.contacts.length,85);assert.equal(new Set(out.contacts).size,85);assert.equal(kit.colliders.length,88);assert.equal(new Set(kit.colliders).size,88);
 for(const m of ms){assert.ok(m.isMesh);assert.ok(m.parent===out.frame,'exact object identity: m.parent');assert.equal(out.frame.children.filter(x=>x===m).length,1);identity(m);assert.equal(m.castShadow,true);assert.equal(m.receiveShadow,true);assert.ok(kit.owned.includes(m.material));}
 return ms;
}
// Independently derive every actual local triangle and translated owner box.
// Reads world placement from guarded identity transforms, not mutable cache updates.
export function assertCurrentLayoutSupport(h){
 const ms=validateStructure(h),seen=new Set();
 for(let j=0;j<ms.length;j++){
  const m=ms[j],c=h.out.contacts[j],s=c?.triangleSupport,g=m.geometry,p=g.attributes.position,ix=g.index;
  assert.ok(p&&ix);assert.equal(p.itemSize,3);assert.equal(ix.count%3,0);assert.equal(c.dafotangLayoutRole,m.userData.dafotangLayoutRole);assert.equal(c.dafotangLayoutMesh,m.uuid);assert.equal(s.id,m.name+'/'+m.uuid);assert.ok(!seen.has(s.id));seen.add(s.id);
  assert.equal(h.kit.colliders.filter(x=>x===c).length,1);assert.equal(h.kit.colliders.filter(x=>x.dafotangLayoutMesh===m.uuid).length,1);same(s.offset.toArray(),OFFSET.toArray());assert.equal(s.template.triangles.length,ix.count/3);
  const local=new T.Box3();
  for(let i=0;i<ix.count;i+=3){
   const vs=[0,1,2].map(k=>{const n=ix.getX(i+k);assert.ok(Number.isInteger(n)&&n>=0&&n<p.count);const v=new T.Vector3().fromBufferAttribute(p,n);assert.ok(v.toArray().every(Number.isFinite));return v;});
   const t=new T.Triangle(...vs),row=s.template.triangles[i/3];assert.ok(t.getArea()>1e-12);for(let k=0;k<3;k++)same(row.triangle[['a','b','c'][k]].toArray(),vs[k].toArray());same(row.normal.toArray(),t.getNormal(new T.Vector3()).toArray());const tb=new T.Box3().setFromPoints(vs);same(box(row.box),box(tb));local.union(tb);
  }
  same(box(s.template.bounds),box(local));const world=local.clone().translate(OFFSET);same(box(s.box),box(world));same(box(c),box(world));
  if(g.boundingBox)same(box(g.boundingBox),box(bounds(g)));
  if(g.boundingSphere){const centre=bounds(g).getCenter(new T.Vector3());let radius2=0;for(let k=0;k<p.count;k++)radius2=Math.max(radius2,centre.distanceToSquared(new T.Vector3().fromBufferAttribute(p,k)));same(g.boundingSphere.center.toArray(),centre.toArray(),'actual sphere centre');assert.equal(g.boundingSphere.radius,Math.sqrt(radius2),'actual sphere radius');}

 }
 return true;
}
export function snapshotLegacyMesh(m){return{name:m.name,role:m.userData.dafotangLayoutRole??null,position:m.position.toArray(),quaternion:m.quaternion.toArray(),scale:m.scale.toArray(),visible:m.visible,castShadow:m.castShadow,receiveShadow:m.receiveShadow,material:m.material.name,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,normalized:a.normalized,array:Array.from(a.array)}])),index:Array.from(m.geometry.index.array),groups:structuredClone(m.geometry.groups)};}
function freeze(o){if(o&&typeof o==='object'){for(const v of Object.values(o))freeze(v);Object.freeze(o);}return o;}
export function projectR264LayoutSnapshot(current,baseline){
 assertCurrentLayoutSupport(current);assertCurrentLayoutSupport(baseline);
 const parentState=o=>({matrix:o.matrix.toArray(),matrixWorld:o.matrixWorld.toArray(),matrixAutoUpdate:o.matrixAutoUpdate,matrixWorldAutoUpdate:o.matrixWorldAutoUpdate,matrixWorldNeedsUpdate:o.matrixWorldNeedsUpdate,layers:o.layers.mask,visible:o.visible});
 for(const[x,y]of[[current.kit.root,baseline.kit.root],[current.f,baseline.f],[current.out.frame,baseline.out.frame]])same(parentState(x),parentState(y),'same-stage ancestor matrix/cache state');
 const a=current.out.frame.children,b=baseline.out.frame.children;
 for(let i=0;i<85;i++){
  same(properties(a[i]),properties(b[i]),'unchanged owner properties');
  if(a[i].userData.dafotangLayoutRole===ROLE){same(geometryValue(a[i].geometry),contract.current,'exact reviewed beam');same(geometryValue(b[i].geometry),contract.baseline,'exact old beam');}
  else same(geometryValue(a[i].geometry),geometryValue(b[i].geometry),'unchanged other-owner geometry');
 }
 const meta=structuredClone(current.out.meta);same(meta.lowerFrontEntablatureProfile,{endTreatment:'PLAIN_MODEL_RETURNS_NOT_SOURCE_CARVING',columnInset:.08,narrowBays:'UNCHANGED_PLAIN',dimensionStatus:'MODEL_FIT_NOT_SURVEY'});delete meta.lowerFrontEntablatureProfile;same(meta,baseline.out.meta);
 assert.ok(current.out.frame.userData.dafotangHistoricLayout===current.out.meta,'exact object identity: current.out.frame.userData.dafotangHistoricLayout');assert.ok(current.g.historicLayout===current.out.meta,'exact object identity: current.g.historicLayout');assert.ok(baseline.out.frame.userData.dafotangHistoricLayout===baseline.out.meta,'exact object identity: baseline.out.frame.userData.dafotangHistoricLayout');assert.ok(baseline.g.historicLayout===baseline.out.meta,'exact object identity: baseline.g.historicLayout');
 return freeze(a.map((m,i)=>snapshotLegacyMesh(m.userData.dafotangLayoutRole===ROLE?b[i]:m)));
}
