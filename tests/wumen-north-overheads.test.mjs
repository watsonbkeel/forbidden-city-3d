import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import * as portal from '../src/scene/palace/special/WumenNorthPortal.js';
import {captureGate,meshFingerprint} from './lib/gate-tower-fixture.mjs';
import {withWumenNorthPortals,wumenNorthOverheadStages} from './lib/wumen-north-portal-fixture.mjs';
const options={openings:[{x:-17.5,w:5},{x:0,w:9},{x:17.5,w:5}],southZ:-13.3,northZ:18.6,platformHeight:12};
function register(b){assert.equal(typeof portal.registerWumenNorthPortalOverheads,'function','missing three bounded overhead proxies');return portal.registerWumenNorthPortalOverheads(b,options);}
test('register exactly three immutable overhead shapes after legacy colliders, no mesh or support edits',()=>{
 const c=withWumenNorthPortals(captureGate()),old=wumenNorthOverheadStages(c).legacy,physics=JSON.stringify(old),mesh=meshFingerprint(c.group),supports=JSON.stringify(c.builder.walkables),b={colliders:[...old],ox:10,oz:250};
 const added=register(b);assert.equal(added.length,3);assert.equal(b.colliders.length,old.length+3);assert.deepEqual(b.colliders.slice(0,old.length),old);assert.equal(JSON.stringify(old),physics);assert.equal(meshFingerprint(c.group),mesh);assert.equal(JSON.stringify(c.builder.walkables),supports);
 for(let i=0;i<3;i++){const o=options.openings[i],box=added[i],s=box.overhead,p=portal.wumenNorthPortalProfile({x:o.x,width:o.w,tunnelHeight:o.w>=8?8:6.5,platformHeight:12,southZ:-13.3,northZ:18.6});assert.equal(b.colliders[old.length+i],box);assert.ok(box.isBox3);assert.ok(Object.isFrozen(s)&&Object.isFrozen(s.points)&&s.points.every(Object.isFrozen));s.points.forEach(([x,y],j)=>{assert.ok(Math.abs(x-(p.arc[j][0]+o.x+10))<1e-12);assert.equal(y,p.arc[j][1]);});assert.equal(box.min.x,o.x-o.w/2+10);assert.equal(box.max.x,o.x+o.w/2+10);assert.equal(box.min.y,p.springY);assert.equal(box.max.y,12);assert.equal(s.minZ,p.headStartZ+250);assert.equal(s.maxZ,18.6+250);assert.equal(s.sourceId,`axis/wumen-north-head/${o.x}`);}
 assert.throws(()=>register(b),/duplicate/i);assert.equal(b.colliders.length,old.length+3);
});
test('registration is atomic on malformed coordinates, count, identity and order',()=>{
 register({colliders:[],ox:0,oz:0});for(const change of [{openings:[]},{openings:options.openings.slice().reverse()},{northZ:19},{platformHeight:13}]){const b={colliders:[],ox:0,oz:0};assert.throws(()=>portal.registerWumenNorthPortalOverheads(b,{...options,...change}));assert.equal(b.colliders.length,0);}
 for(const b of [{colliders:[],ox:NaN,oz:0},{colliders:[],ox:0,oz:Infinity},{colliders:null,ox:0,oz:0}])assert.throws(()=>portal.registerWumenNorthPortalOverheads(b,options),TypeError);
});

const {overheadHeightAtFootprint}=await import('../src/utils/OverheadShape.js');
test('registered exact inner curve agrees with upward rays against actual masonry/lining meshes',()=>{
 const c=withWumenNorthPortals(captureGate()),added=register({colliders:[],ox:0,oz:0});
 for(let j=0;j<3;j++)for(let i=0;i<32;i++){
  const o=options.openings[j],x=o.x-o.w/2+o.w*(i+.37)/32,z=18;
  const rays=new THREE.Raycaster(new THREE.Vector3(x,0,z),new THREE.Vector3(0,1,0),0,12).intersectObject(c.group,true);
  assert.ok(rays.length);const actual=rays[0].point.y,curve=overheadHeightAtFootprint(added[j].overhead,x,x,z,z);
  assert.ok(Math.abs(actual-curve)<1e-5,`actual mesh mismatch ${x}: ${actual} / ${curve}`);
 }
});

const {CollisionManager}=await import('../src/utils/Collision.js');
const {replayKunning}=await import('./lib/kunning-walk.mjs');
function worlds(){const c=withWumenNorthPortals(captureGate()),old=new CollisionManager(),current=new CollisionManager();old.addColliders(wumenNorthOverheadStages(c).legacy);current.addColliders(c.builder.colliders);for(const cm of [old,current])cm.addWalkables(c.builder.walkables);return {c,old,current};}
test('new overhead broadphase does not create standable supports below the retained platform',()=>{
 const {c,old,current}=worlds(),z=c.data.position.z+18;
 for(const x of [-17.5,0,17.5,3.999])for(const maxTop of [0,3,11.99,12,12.35,14])assert.equal(current.supportHeight(x,z,maxTop),old.supportHeight(x,z,maxTop),`extra overhead support at ${x}, maxTop=${maxTop}`);
 for(const x of [-17.5,0,17.5,3.999])assert.equal(current.getGroundHeight(x,z,12.3),12.3,'retained upper walkable remains the platform support');
});
for(const fps of [10,60])test(`actual upper north platform stays at 12.3m with new overheads, ${fps}Hz`,t=>{
 const {c,current}=worlds(),z=c.data.position.z+17.6,r=replayKunning(t,{THREE,cm:current},[[-3,z],[3,z]],{startFeet:12.3,fps,recordFrames:true});
 assert.equal(r.arrived,true);assert.ok(r.frames.length>1);assert.equal(r.minFeet,12.3);assert.equal(r.maxFeet,12.3);
});
