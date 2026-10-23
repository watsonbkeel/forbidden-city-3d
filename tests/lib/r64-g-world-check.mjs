import assert from 'node:assert/strict';import * as THREE from 'three';
import {tianyiAccess} from '../../src/scene/palace/special/TianyiGate.js';
import {overheadHeightAtFootprint} from '../../src/utils/OverheadShape.js';
import {captureTianyiMasonry,replayTianyiJump} from './r64-tianyi-motion.mjs';
import {replayKunning} from './kunning-walk.mjs';

export function assertR64GInWorld(W){
 const gate=W.cm.colliders.filter(c=>c.overhead?.sourceId==='garden/tianyi-arch');assert.equal(gate.length,1);
 const records=[];W.scene.traverse(o=>records.push(...(o.userData.architecture??[]).filter(x=>x.id==='garden/tianyi-gate')));assert.equal(records.length,1);assert.equal(records[0].accepted,false);
 const map=W.zoneManager.allMapItems.filter(x=>x.name==='天一门');assert.equal(map.length,1);assert.equal(map[0].gateProfile,'tianyi');
 const ts=captureTianyiMasonry(W.scene);assert.equal(ts.length,232,'Merged actual masonry and leaves, not profile-only validation');
 const ray=new THREE.Ray(),hit=new THREE.Vector3();for(let i=0;i<31;i++){const x=.5-1.25+2.5*(i+.25)/31;ray.set(new THREE.Vector3(x,.5,465),new THREE.Vector3(0,1,0));let y=Infinity;for(const t of ts){const p=ray.intersectTriangle(t.a,t.b,t.c,false,hit);if(p)y=Math.min(y,p.y);}assert.ok(Math.abs(y-overheadHeightAtFootprint(gate[0].overhead,x,x,465,465))<1e-4);}
 assert.equal(W.garden.stats.trees,34);assert.equal(W.garden.legacyTreeSamplingObstacles.length,2);
 for(const x of[-3.3,3.3])assert.equal(W.cm.colliders.filter(c=>{const b=c.box??c;return Math.abs(b.min.x-(x-.45))<1e-8&&Math.abs(b.max.x-(x+.45))<1e-8&&Math.abs(b.min.z-462.65)<1e-8&&Math.abs(b.max.z-463.55)<1e-8&&b.max.y===2.8;}).length,0);
 assert.equal(W.garden.group.userData.yujingProfile.rail,'SOUTH_VISIBLE_POSTS_AND_OPEN_RAILS_PHOTO_FIT_THREE_OTHER_SLABS_UNVERIFIED_RETAINED');
 return{scope:'G_BOUNDED_GEOMETRY_AND_PHYSICS_NOT_G29_ACCEPTANCE',oneGate:1,actualMasonryTriangles:ts.length,archSamples:31,trees:34,legacySamplingBoxesNotGameColliders:2,sourceFit:true};
}
export function replayR64GRoutes(t,W,{release=()=>{}}={}){
 const rows=[],go=tianyiAccess(),points=[...go,...go.slice(0,-1).reverse()],masonry=captureTianyiMasonry(W.kit?.root??W.scene);
 for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true]){const r=replayKunning(t,W,points,{fps,sprint,backward,startFeet:0,recordFrames:true});assert.ok(r.arrived,JSON.stringify({...r,frames:undefined}));const contacts=r.frames.map(f=>assertTianyiWalkFrame(W,f,masonry));rows.push({type:'TIANYI_ROUNDTRIP',fps,sprint,backward,frames:r.frames.length,maxFeet:r.maxFeet,end:r.end,maxCameraGroundLag:Math.max(...contacts.map(x=>x.cameraGroundLag)),smoothedCameraStepContactFrames:contacts.filter(x=>x.cameraStepContact).length});release('r64-tianyi-route');}
 for(const fps of[5,10,60])for(const c of[{x:-.05},{x:.5},{x:1.05},{z:462.2,direction:1,moving:true},{z:467.8,direction:-1,moving:true},{z:463.8,direction:1,diagonal:1,moving:true},{z:466.2,direction:-1,diagonal:-1,moving:true},{drop:true}]){const r=replayTianyiJump(t,W,{fps,...c});assert.equal(r.contacts.length,0,JSON.stringify({...r,frames:undefined}));assert.ok(Math.abs(r.end[2]-r.ground)<1e-8);rows.push({...r,type:'TIANYI_JUMP_DROP',frames:r.frames.length});release('r64-tianyi-motion');}
 assert.equal(rows.length,32);return rows;
}

// Walking physics explicitly follows groundY; feetY is the inherited smoothed
// camera datum. Keep both checks: physical body against every collider, and
// actual smoothed camera body against the rendered curved masonry/door leaves.
export function assertTianyiWalkFrame(W,f,masonry){
 const physicalFeet=Math.max(f.feet,f.ground),eye=new THREE.Vector3(f.x,physicalFeet+1.7,f.z);
 assert.equal(W.cm.checkCollision(eye,.5),false,'actual ground-following controller body');
 const body=new THREE.Box3(new THREE.Vector3(f.x-.5,f.feet+.03,f.z-.5),new THREE.Vector3(f.x+.5,f.feet+1.7,f.z+.5));
 assert.equal(masonry.some(t=>body.intersectsTriangle(t)),false,'smoothed camera body against real arch and leaves');
 const cameraStepContact=W.cm.checkCollision(new THREE.Vector3(f.x,f.feet+1.7,f.z),.5);
 if(cameraStepContact){
  const hits=W.cm.queryBox(W.cm.playerBox).filter(c=>c.overhead?false:W.cm.playerBox.intersectsBox(c.box));
  assert.ok(hits.length>0,'camera-only contact has real step collider witness');
  assert.ok(hits.every(c=>c.box.max.y<=.45+1e-8&&c.box.min.x===-1&&c.box.max.x===2),'only authored low stair solids may meet lagging camera datum');
 }
 return{cameraGroundLag:Math.max(0,f.ground-f.feet),cameraStepContact};
}
