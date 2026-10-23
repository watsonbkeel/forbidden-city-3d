import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {existsSync} from 'node:fs';
import {captureGate,meshFingerprint} from './lib/gate-tower-fixture.mjs';
import {withWumenNorthPortals} from './lib/wumen-north-portal-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
const url=new URL('./lib/wumen-north-jump.mjs',import.meta.url),api=existsSync(url)?await import(url):null;
function world(){const c=withWumenNorthPortals(captureGate()),scene=new THREE.Scene(),root=c.group.clone(true),cm=new CollisionManager();root.position.set(c.data.position.x,0,c.data.position.z);scene.add(root);scene.updateMatrixWorld(true);cm.addColliders(c.builder.colliders);cm.addWalkables(c.builder.walkables);return {THREE,scene,cm};}
test('same-W jump helper captures actual scoped geometry without constructing or mutating a world',()=>{
 assert.equal(typeof api?.captureWumenNorthHeadTriangles,'function','missing same-W triangle consumer');const W=world(),before=meshFingerprint(W.scene),triangles=api.captureWumenNorthHeadTriangles(W);assert.ok(triangles.length>30);assert.ok(triangles.every(t=>t.isTriangle||t.a?.isVector3));assert.equal(meshFingerprint(W.scene),before);
});
test('same-W jump helper uses existing collisions for real stationary, moving and diagonal controls',t=>{
 assert.equal(typeof api?.replayWumenNorthJump,'function','missing reusable real controller driver');const W=world(),before=meshFingerprint(W.scene),physics=JSON.stringify([W.cm.colliders,W.cm.walkables]),triangles=api.captureWumenNorthHeadTriangles(W);
 for(const mode of ['stationary','walk','diagonal']){const r=api.replayWumenNorthJump(t,W,{fps:60,mode,direction:-1,x:3.999,triangles});assert.equal(r.pass,true,JSON.stringify(r));assert.ok(r.maxFeet>1);}
 assert.equal(meshFingerprint(W.scene),before);assert.equal(JSON.stringify([W.cm.colliders,W.cm.walkables]),physics);
});
test('same-W jump helper rejects missing world, invalid options and empty geometry',t=>{
 assert.equal(typeof api?.replayWumenNorthJump,'function');assert.throws(()=>api.captureWumenNorthHeadTriangles({}),TypeError);const W=world();for(const options of [{fps:0},{fps:Infinity},{fps:300},{direction:0},{x:NaN},{mode:'teleport'},{triangles:[]}])assert.throws(()=>api.replayWumenNorthJump(t,W,options));
});

test('default camera bob after a real grounded approach stays outside actual arch solids at 60 Hz',t=>{
 const W=world(),triangles=api.captureWumenNorthHeadTriangles(W);
 for(const mode of ['walk','diagonal'])for(const direction of [-1,1]){
  const r=api.replayWumenNorthJump(t,W,{fps:60,mode,direction,x:3.999,warmupSeconds:.25,triangles});
  assert.equal(r.headBobEnabled,true);assert.ok(r.maxAbsBob>0,'default residual bob is exercised, not disabled');assert.equal(r.cameraContacts,0);assert.ok(r.minCameraClearance>0,JSON.stringify(r));assert.equal(r.pass,true,JSON.stringify(r));
  t.diagnostic(JSON.stringify({mode,direction,maxAbsBob:r.maxAbsBob,minCameraClearance:r.minCameraClearance,cameraContacts:r.cameraContacts}));
 }
});
