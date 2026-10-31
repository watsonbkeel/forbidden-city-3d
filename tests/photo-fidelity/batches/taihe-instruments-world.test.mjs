import {readTaihemenWorldFixture} from '../../lib/r157-taihemen-world-fixture.mjs';
import {physicalNonmutationFingerprint} from '../../lib/r159-physical-nonmutation-fingerprint.mjs';
// R159 comparison-only: authenticate six new solids before removing them from NEW aligned arrays; all movement stays raw W.
import {wumenWidthThenJiaotaiPriorComparison as r159JiaotaiPriorComparison} from '../../lib/wumen-main-width-world-comparison.mjs';
// Comparison only: authenticate raw new126 Wuying owners, restore old126 in a NEW view. All movement uses raw W.cm.
import {wuying55PhysicsView} from '../../lib/r158-wuying-55-physics-view.mjs';
import {wenhua493PhysicsView} from '../../lib/r158-wenhua-493-physics-view.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {buildTaiheInstrumentWorld} from '../../lib/r157-taihe-instruments-fixture.mjs';
import {FirstPersonControls} from '../../../src/controls/FirstPerson.js';
import {triangleBodyIntersects} from '../../../src/utils/TriangleSupport.js';
import {createPhysicalWaypointDriver} from '../../lib/physical-waypoints.mjs';
const W=await buildTaiheInstrumentWorld();
const record=()=>{const a=[];W.scene.traverse(o=>a.push(...(o.userData.architecture??[]).filter(p=>p.id==='axis/taihe-terrace-instruments')));assert.equal(a.length,1,'actual production World installs one source-bound pair');return a[0];};
const target=()=>W.cm.colliders.filter(c=>c.triangleSupport?.id.startsWith('taihe-terrace-instrument:'));
const body=(x,y,z,r=.5,h=1.7)=>new T.Box3(new T.Vector3(x-r,y,z-r),new T.Vector3(x+r,y+h,z+r));
const noPenetration=(x,y,z)=>{for(const c of target())assert.equal(triangleBodyIntersects(c.triangleSupport,body(x,y+2e-5,z)),false,`body penetrates visible instrument ${c.triangleSupport.id}`);};
function controller(t,x,y,z){
 const doc0=globalThis.document,win0=globalThis.window,noop=()=>{},doc={...doc0,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
 let now=0;const clock=t.mock.method(performance,'now',()=>now),camera=new T.PerspectiveCamera(),ctrl=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},W.cm);ctrl.controls.isLocked=true;ctrl.headBobEnabled=false;ctrl.setPosition(x,y+1.7,z);
 return{ctrl,camera,tick:fps=>{now+=1000/fps;ctrl.update();noPenetration(camera.position.x,ctrl.feetY,camera.position.z);},close:()=>{ctrl.dispose();clock.mock.restore();globalThis.document=doc0;globalThis.window=win0;}};
}
test('real world replaces only four legacy meshes/two air boxes and preserves every other ornament and support',()=>{
 const p=record();assert.equal(p.instruments.length,2);assert.ok(target().length>20);
 assert.equal(W.instrumentReplacement.removedMeshes,4);assert.equal(W.instrumentReplacement.removedColliders,2);
 assert.equal(W.instrumentReplacement.otherMeshHashBefore,W.instrumentReplacement.otherMeshHashAfter);assert.deepEqual(W.instrumentReplacement.nonTargetCollidersBefore,W.instrumentReplacement.nonTargetCollidersAfter);assert.deepEqual(W.instrumentReplacement.walkablesBefore,W.instrumentReplacement.walkablesAfter);
 for(const a of p.instruments){const small=body(a.centerX,a.baseY+(a.kind==='sundial'?.9:1.8),a.centerZ,.05,.2);assert.equal(target().some(c=>triangleBodyIntersects(c.triangleSupport,small)),false);}
});
test('both instruments preserve existing external square bypasses at 10/60Hz walking and running',t=>{
 const p=record();let routes=0;
 for(const a of p.instruments)for(const fps of[10,60])for(const sprint of[false,true])for(const reverse of[false,true]){
  const x=a.centerX,z=a.centerZ,s=1.6,points=[[x-s,z-s],[x+s,z-s],[x+s,z+s],[x-s,z+s],[x-s,z-s]];if(reverse)points.reverse();
  const r=controller(t,points[0][0],a.baseY,points[0][1]),driver=createPhysicalWaypointDriver(points);r.ctrl.moveForward=true;
  try{for(let i=0;i<fps*30&&!driver.complete;i++){const before=[r.camera.position.x,r.camera.position.z],cmd=driver.command(before,sprint);r.ctrl.canSprint=cmd.canSprint;r.camera.lookAt(cmd.target[0],r.camera.position.y,cmd.target[1]);r.camera.updateMatrixWorld(true);r.tick(fps);driver.observe(before,[r.camera.position.x,r.camera.position.z]);assert.ok(Math.abs(r.ctrl.feetY-a.baseY)<.003,'external bypass stays original platform height');}
   assert.equal(driver.complete,true,`${a.kind} fps${fps} sprint${sprint} reverse${reverse}`);routes++;
  }finally{r.close();}
 }
 assert.equal(routes,16);
});
test('real high falls land on visible instrument triangles and can leave them without body penetration or rescue pads',t=>{
 const p=record();let cases=0;
 for(const a of p.instruments)for(const fps of[10,60]){
  const r=controller(t,a.centerX,a.baseY+5,a.centerZ);
  // setPosition deliberately grounds a teleport. A high-drop experiment must
  // initialize the actual airborne state, as the existing whole-wall tests do.
  r.ctrl.feetY=a.baseY+5;r.ctrl.groundY=0;r.ctrl.airborne=true;r.ctrl.verticalVelocity=0;r.camera.position.y=r.ctrl.feetY+1.7;
  try{for(let i=0;i<fps*4;i++)r.tick(fps);assert.ok(r.ctrl.feetY>a.baseY+.3,'actual high fall rests on its stone, not through it');assert.equal(r.ctrl.airborne,false,'not merely suspended on a body impact');
   const witness=W.cm.supportContact(r.camera.position.x,r.camera.position.z,r.ctrl.feetY+.0001);assert.ok(witness?.instanceId.startsWith('taihe-terrace-instrument:'+a.kind+':'));assert.ok(Math.abs(witness.height-r.ctrl.feetY)<1e-4);
   const ray=new T.Raycaster(witness.witness.clone().add(new T.Vector3(0,.03,0)),new T.Vector3(0,-1,0),0,.06),hits=ray.intersectObject(W.scene,true);assert.ok(hits.some(h=>Math.abs(h.point.y-witness.height)<1e-4),'actual final merged rendered face supports the foot, not a synthetic plane');
   const points=[[r.camera.position.x,r.camera.position.z],[a.centerX+2.5,a.centerZ]],driver=createPhysicalWaypointDriver(points);r.ctrl.moveForward=true;
   for(let i=0;i<fps*15&&!driver.complete;i++){const before=[r.camera.position.x,r.camera.position.z],cmd=driver.command(before,false);r.camera.lookAt(cmd.target[0],r.camera.position.y,cmd.target[1]);r.camera.updateMatrixWorld(true);r.tick(fps);driver.observe(before,[r.camera.position.x,r.camera.position.z]);}
   assert.equal(driver.complete,true,'leave actual stone without a rescue plane');r.ctrl.moveForward=false;for(let i=0;i<fps*3;i++)r.tick(fps);assert.ok(Math.abs(r.ctrl.feetY-a.baseY)<.003);cases++;
  }finally{r.close();}
 }
 assert.equal(cases,4);
});
test('ordinary 1m-wide bodies cannot walk through photographed narrow stone apertures at either update rate',t=>{
 for(const a of record().instruments)for(const fps of[10,60]){
  const r=controller(t,a.centerX,a.baseY,a.centerZ-2);r.ctrl.moveForward=true;r.camera.lookAt(a.centerX,r.camera.position.y,a.centerZ+2);r.camera.updateMatrixWorld(true);
  try{for(let i=0;i<fps*3;i++)r.tick(fps);assert.ok(r.camera.position.z<a.centerZ-.45,'stopped by real stone, not allowed through a narrow window');assert.ok(r.camera.position.z>a.centerZ-2,'actually approached the object');}
  finally{r.close();}
 }
});
test.after(()=>W.dispose());

import fs from 'node:fs';import zlib from 'node:zlib';import crypto from 'node:crypto';
import {compareInstrumentsWithObservedApproach} from '../../lib/r157-taihemen-cumulative-physics.mjs';
import {assertTaihemenFacilitiesCInWorld} from '../../lib/r157-taihemen-facilities-c-check.mjs';
import {taiheWorldPhysics,compareTaiheWorldPhysics} from '../../lib/r157-taihe-world-retention.mjs';
test('complete uninjected World preserves exact instrument-baseline physics outside both explicit instrument and observed-approach source products',()=>{
 const raw=zlib.gunzipSync(fs.readFileSync(new URL('../../fixtures/r157-taihe-integration/world-physics-055947.json.gz',import.meta.url))),provenance=JSON.parse(fs.readFileSync(new URL('../../fixtures/r157-taihe-integration/provenance.json',import.meta.url)));
 assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),provenance.worldPhysicsUncompressedSHA256);
 const baseline=JSON.parse(raw),rawPhysical=taiheWorldPhysics(W),comparison=r159JiaotaiPriorComparison(W,rawPhysical),actual=wenhua493PhysicsView(comparison.world,wuying55PhysicsView(comparison.physics)),approachRaw=zlib.gunzipSync(readTaihemenWorldFixture());assert.equal(crypto.createHash('sha256').update(approachRaw).digest('hex'),'dbda1e6e18635d7a80425b25e46337280a716f393c70b0b88dfaa9141f2904b4');const approach=JSON.parse(approachRaw),compare=a=>compareInstrumentsWithObservedApproach(comparison.world,a,baseline,approach);assertTaihemenFacilitiesCInWorld(W,{production:true});const r=compare(actual);
 assert.deepEqual(r,{targetCount:29,total:30873,retainedCount:30767,retainedExact:true,walkablesExact:true,riversExact:true,observedSourceColliders:77,observedSourceSupports:3});
 const row=actual.rows.find((c,i)=>!c.triangleSupport?.id.startsWith('taihe-terrace-instrument:')&&!comparison.world.cm.colliders[i].mesh.taihemenObservedSource),old=row.min[0];row.min[0]+=.001;
 assert.equal(compare(actual).retainedExact,false,'actual retained physical drift must reject');row.min[0]=old;
 const beforeFingerprint=physicalNonmutationFingerprint(actual),supportCount=actual.walkables.length,supportDigest=crypto.createHash('sha256').update(JSON.stringify(actual.walkables)).digest('hex');
 const support={...actual,walkables:structuredClone(actual.walkables)};assert.equal(support.rows,actual.rows);assert.equal(support.rivers,actual.rivers);assert.notEqual(support.walkables,actual.walkables);assert.notEqual(support.walkables[0],actual.walkables[0]);support.walkables.pop();assert.equal(compare(support).walkablesExact,false,'missing old support rejects');
 assert.equal(actual.walkables.length,supportCount);assert.equal(crypto.createHash('sha256').update(JSON.stringify(actual.walkables)).digest('hex'),supportDigest);assert.equal(physicalNonmutationFingerprint(actual),beforeFingerprint,'support negative cannot mutate any shared actual physics');
 if(process.env.TAIHE_INSTRUMENT_WORLD_OUT)fs.writeFileSync(process.env.TAIHE_INSTRUMENT_WORLD_OUT,JSON.stringify({scope:'UNINJECTED_LIVE_WORLD_ORIGINAL_ROUTES_WITH_EXPLICIT_493_PHYSICS_COMPARISON_VIEW',rawTotal:rawPhysical.rows.length,rawSupports:rawPhysical.walkables.length,projectedTotal:actual.rows.length,projectedSupports:actual.walkables.length,...r,accepted:false},null,2)+'\n');
});
