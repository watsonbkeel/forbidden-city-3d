import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
const data=JSON.parse(readFileSync(new URL('../data/zones/ningshou.json',import.meta.url)));
const item=data.items.find(i=>i.name==='颐和轩');
function fixture(){const b=new ZoneBase(library(),data),{f}=b.buildHall(item);b.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);return{b,f,blocked:(x,z,r=.48)=>cm.checkCollision(new THREE.Vector3(item.x+x,item.ph+1.7,item.z+z),r),dispose:()=>b.kit.dispose(b.kit.root)};}
function role(f,r){const a=[];f.traverse(o=>{if(o.userData.role===r)a.push(o)});return a;}
test('R43 independent source topology: shoulder enclosure, open rear join and closed unbuilt connector',()=>{
 const{f,blocked,dispose}=fixture();try{
  const p=f.userData.structure.fit,bay=item.w/7;
  assert.ok(p.front<p.endFront&&p.endFront<p.mainFront&&p.mainFront<p.mainRear&&p.mainRear<p.rear);
  for(const x of[-3*bay,3*bay]){assert.equal(blocked(x,p.endFront),true);assert.equal(blocked(x,p.mainFront),false);}
  for(const x of[-bay,0,bay]){assert.equal(blocked(x,(p.front+p.mainFront)/2),false,'open canopy bay');assert.equal(blocked(x,p.mainRear),false,'rear projection joins main without invented wall');}
  assert.equal(blocked(0,p.rear),true,'absent external connector remains closed');
  for(const x of[-2*bay,2*bay])assert.equal(blocked(x,p.front),true,'enclosed end front');
 }finally{dispose();}
});
test('R43 independent Suian asymmetric vestibule and two necks have real width, not point-only apertures',()=>{
 const{f,blocked,dispose}=fixture();try{
  const p=f.userData.structure.fit,bay=item.w/7,west=-1.5*bay,cx=-2*bay;
  assert.ok(cx<0&&p.secondNeckZ<p.firstNeckZ&&p.firstNeckZ<p.mainFront);
  // West-facing entry is a Z-length slot in an X-normal partition.
  for(const dz of[-.15,0,.15])for(const dx of[-.6,0,.6])assert.equal(blocked(west+dx,p.vestibuleDoorZ+dz),false);
  assert.equal(blocked(west,p.vestibuleDoorZ+1.25),true);
  assert.equal(blocked(cx,p.mainFront),true,'north window cannot become a door');
  for(const z of[p.firstNeckZ,p.secondNeckZ]){
   for(const dx of[-.65,0,.65])assert.equal(blocked(cx+dx,z),false,'usable central neck width');
   for(const dx of[-1.75,1.75])assert.equal(blocked(cx+dx,z,.15),true,'short neck returns exist');
  }
  const niche=role(f,'yihe-bed-niche-contour');assert.equal(niche.length,1);assert.ok(niche[0].position.z<p.secondNeckZ);assert.ok(niche[0].position.x<0);
  assert.equal(role(f,'yihe-suian-west-entry-lintel')[0].geometry.parameters.width,.25);
 }finally{dispose();}
});
test('R43 independent replacement geometry is finite and releases owned resources without shared materials',()=>{
 const disposed=new Set(),original=THREE.BufferGeometry.prototype.dispose;
 THREE.BufferGeometry.prototype.dispose=function(){disposed.add(this);return original.call(this);};
 try{const{b,f,dispose}=fixture();const live=new Set(),custom=new Set(),mats=new Set(),borrowed=new Set();f.traverse(o=>{if(o.isMesh){live.add(o.geometry);if(o.userData.role)custom.add(o.geometry);for(const a of Object.values(o.geometry.attributes))assert.ok(Array.from(a.array).every(Number.isFinite));for(const m of (Array.isArray(o.material)?o.material:[o.material]).filter(Boolean)){if(m.name.startsWith('yihe_'))mats.add(m);else if(!b.kit.owned.includes(m))borrowed.add(m);}}});
  assert.ok(disposed.size>0,'old shell geometries disposed during replacement');for(const g of live)assert.equal(disposed.has(g),false,'no live geometry disposed during shell stripping');
  let ownedCount=0,borrowedCount=0;for(const m of mats)m.addEventListener('dispose',()=>ownedCount++);for(const m of borrowed)m.addEventListener('dispose',()=>borrowedCount++);
  dispose();for(const g of custom)assert.ok(disposed.has(g));assert.equal(ownedCount,mats.size);assert.equal(borrowedCount,0);assert.equal(b.kit.colliders.length,0);assert.equal(b.kit.walkables.length,0);
 }finally{THREE.BufferGeometry.prototype.dispose=original;}
});

test('R43 independent retained roof platform front stair and support signature exactly match frozen R42 target',async()=>{
 const {retainedYiheSignature}=await import('./lib/r43-retained-yihe-signature.mjs');
 const expected=JSON.parse(readFileSync(new URL('./fixtures/r43-independent-retained-yihe-r42.json',import.meta.url)));
 const{b,f,dispose}=fixture();try{const actual=retainedYiheSignature(f,b.kit);for(const key of['roof','platform','frontStair'])assert.ok(actual[key].count>0);assert.deepEqual(actual,expected);}finally{dispose();}
});

test('R43 independent whole Ningshou merger preserves each Yihe material count and world bounds',()=>{
 const b=new ZoneBase(library(),data),finish=b.kit.finish.bind(b.kit);let raw;
 function signature(root){root.updateMatrixWorld(true);const out={};root.traverse(o=>{if(!o.isMesh||!o.material?.name?.startsWith('yihe_'))return;const k=o.material.name,r=out[k]??={triangles:0,bounds:new THREE.Box3()};r.triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;const v=new THREE.Vector3(),a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);assert.ok(v.toArray().every(Number.isFinite));r.bounds.expandByPoint(v);}});return out;}
 b.kit.finish=(...args)=>{raw=signature(b.kit.root);return finish(...args);};
 try{const result=b.build(),merged=signature(result.group);assert.deepEqual(Object.keys(merged).sort(),Object.keys(raw).sort());assert.equal(Object.keys(raw).length,4);for(const k of Object.keys(raw)){assert.equal(merged[k].triangles,raw[k].triangles,k);for(const side of['min','max'])for(const axis of['x','y','z'])assert.ok(Math.abs(merged[k].bounds[side][axis]-raw[k].bounds[side][axis])<.0001,`${k} ${side}.${axis}`);}const records=result.group.userData.architecture.filter(a=>a.id==='ningshou/yihe-ground-hall');assert.equal(records.length,1);assert.equal(records[0].currentInventoryVerified,false);}finally{b.dispose();}
});
