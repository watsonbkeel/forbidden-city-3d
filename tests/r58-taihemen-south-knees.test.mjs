import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import * as THREE from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {buildTaihemenSouthEnclosure} from '../src/scene/palace/special/TaihemenEnclosure.js';
const moduleURL=new URL('../src/scene/palace/special/TaihemenSouthKnees.js',import.meta.url);
const api=existsSync(moduleURL)?await import(moduleURL):{};
export const input={x0:0,z0:0,y:3.44,w:48.06,d:20.54,H:7.7368,beamH:.928416,r:.4272};
const meshes=g=>{const a=[];g.traverse(m=>{if(m.isMesh)a.push(m);});return a;};
function fixture(){assert.equal(typeof api.buildTaihemenSouthKnees,'function');const b=new PalaceBuilder(new THREE.Scene(),library()),g=new THREE.Group();b.ownedObjects.add(g);const p=api.buildTaihemenSouthKnees(b,g,input);g.updateMatrixWorld(true);return {b,g,p};}

test('fourteen shallow own-source knee halves are restricted to the seven existing south porch bays',()=>{
 const {b,g,p}=fixture();try{
  const mm=meshes(g);assert.equal(mm.length,14);assert.equal(p.entityId,'FC-B3B12CF397');assert.equal(p.accepted,false);
  assert.deepEqual([...new Set(mm.map(m=>m.userData.taihemenSouthKnee.bay))],[1,2,3,4,5,6,7]);
  for(let bay=1;bay<=7;bay++)assert.deepEqual(mm.filter(m=>m.userData.taihemenSouthKnee.bay===bay).map(m=>m.userData.taihemenSouthKnee.inward),[1,-1]);
  assert.equal(b.colliders.length,0);assert.equal(b.walkables.length,0);assert.equal(p.depthStatus,'PHOTO_FIT_UNMEASURED');
  for(const m of mm){assert.equal(m.material.map,null);assert.equal(m.material.side,THREE.FrontSide);assert.ok(m.castShadow);assert.ok(m.receiveShadow);}
 }finally{b.dispose();}
});

test('actual geometry is finite, closed, outward wound, nondegenerate and contacts retained beam and column volumes',()=>{
 const {b,g,p}=fixture();try{
  for(const m of meshes(g)){
   const a=m.geometry.attributes.position,idx=m.geometry.index,edges=new Map();let volume=0;
   assert.ok(a.count<=360,'bounded low-poly half');assert.ok([...a.array].every(Number.isFinite));
   for(let i=0;i<(idx?.count??a.count);i+=3){
    const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(a,idx?idx.getX(i+k):i+k));
    assert.ok(new THREE.Vector3().crossVectors(v[1].clone().sub(v[0]),v[2].clone().sub(v[0])).length()>1e-8,'zero-area face');
    volume+=v[0].dot(new THREE.Vector3().crossVectors(v[1],v[2]))/6;
    for(let k=0;k<3;k++){const u=v[k].toArray().map(n=>n.toFixed(6)).join(','),w=v[(k+1)%3].toArray().map(n=>n.toFixed(6)).join(',');const key=[u,w].sort().join('|');const e=edges.get(key)??[];e.push(u<w?1:-1);edges.set(key,e);}
   }
   assert.ok(volume>0,'outward winding / positive signed volume');for(const e of edges.values())assert.deepEqual(e.sort(),[-1,1],'closed consistently wound edges');
   const q=m.userData.taihemenSouthKnee,x=q.columnX+q.inward*(input.r*.75+.02),z=-input.d/2;
   const beamRay=new THREE.Raycaster(new THREE.Vector3(x,p.topY+.1,z),new THREE.Vector3(0,-1,0),0,.2).intersectObject(m);
   assert.ok(beamRay.length,'actual top triangle reaches retained beam volume');
   assert.ok(beamRay[0].point.y>input.y+input.H-input.beamH);
   const rootRay=new THREE.Raycaster(new THREE.Vector3(x,p.topY-p.drop*.7,z-.4),new THREE.Vector3(0,0,1),0,.8).intersectObject(m);
   assert.ok(rootRay.length,'actual root triangle exists within retained column radial volume');
   assert.ok(Math.hypot(rootRay[0].point.x-q.columnX,rootRay[0].point.z-z)<input.r);
  }
 }finally{b.dispose();}
});


test('three simplified scallop groups are actual silhouette cutouts rather than a filled rectangle',()=>{
 const {b,g,p}=fixture();try{
  const m=meshes(g).find(m=>m.userData.taihemenSouthKnee.bay===4&&m.userData.taihemenSouthKnee.inward===1);
  const q=m.userData.taihemenSouthKnee;
  const hit=(u,v)=>new THREE.Raycaster(new THREE.Vector3(q.columnX+p.rootInset+p.reach*u,p.topY-p.drop*v,p.eaveZ-.5),new THREE.Vector3(0,0,1),0,1).intersectObject(m).length>0;
  for(const [outside,inside,drop] of [[.42,.48,.57],[.66,.72,.37],[.90,.96,.21]]){
   assert.equal(hit(outside,drop),false);assert.equal(hit(inside,drop),true);
  }
 }finally{b.dispose();}
});

test('guarded helper fails before writes for non-Taihemen or invalid envelopes',()=>{
 assert.equal(typeof api.buildTaihemenSouthKnees,'function');const b=new PalaceBuilder(new THREE.Scene(),library()),g=new THREE.Group();
 try{for(const change of [{w:48},{d:20},{r:0},{beamH:0},{H:NaN},{y:NaN},{x0:Infinity},{H:3}]){assert.throws(()=>api.buildTaihemenSouthKnees(b,g,{...input,...change}),/Taihemen/);assert.equal(g.children.length,0);assert.equal(b.ownedMaterials.length,0);}}
 finally{b.dispose();}
});

test('production hookup is only an additive south enclosure call, not a shared or north geometry rewrite',()=>{
 const s=readFileSync(new URL('../src/scene/palace/special/TaihemenEnclosure.js',import.meta.url),'utf8');
 assert.equal((s.match(/buildTaihemenSouthKnees\(builder, group,/g)??[]).length,1);
 assert.doesNotMatch(existsSync(moduleURL)?readFileSync(moduleURL,'utf8'):'',/Xihe|Xiehe|\.col\(|\.walkBox\(|\.walkRamp/);
});

test('new knee clearance rejection leaves the enclosure caller atomic too',()=>{
 const b=new PalaceBuilder(new THREE.Scene(),library()),g=new THREE.Group();
 try{assert.throws(()=>buildTaihemenSouthEnclosure(b,g,{...input,H:5}),/Taihemen south knees/);
  assert.equal(g.children.length,0);assert.equal(b.colliders.length,0);assert.equal(b.walkables.length,0);assert.equal(b.ownedMaterials.length,0);assert.equal(g.userData.taihemenSouthEnclosure,undefined);
 }finally{b.dispose();}
});
