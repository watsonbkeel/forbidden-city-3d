import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import * as THREE from 'three';
import {CollisionManager} from '../src/utils/Collision.js';
import {fixture,hash} from './lib/r58-zhaode-panel-fixture.mjs';
import {zhaodeRoutePoints} from './lib/zhaode-walk.mjs';
import {replayTerrace} from './lib/terrace-walk.mjs';
import {bindProfileSupports,traceProfileSupports,profileSupportReport} from './lib/profile-support-trace.mjs';
const path=new URL('./lib/r58-zhaode-panel-world-check.mjs',import.meta.url),api=existsSync(path)?await import(path):{};
test('existing-W consumer observes actual merged paint and exact supports through all cardinal transforms',()=>{
 assert.equal(typeof api.assertZhaodePanelsInWorld,'function','pure existing-W consumer required');
 for(const rot of [0,Math.PI/2,Math.PI,-Math.PI/2]){
  const f=fixture({x:-62.4,z:-214.2,rot}),scene=f.kit.finish(),cm=new CollisionManager();cm.rivers=[];cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);
  const before=hash({colliders:cm.colliders,walkables:cm.walkables}),report=api.assertZhaodePanelsInWorld({scene,cm});
  assert.equal(report.paintProbes.length,8);assert.equal(report.supportCount,3);assert.equal(report.browserAcceptance,false);assert.equal(hash({colliders:cm.colliders,walkables:cm.walkables}),before);
  f.kit.dispose(scene);f.lib.dispose();
 }
 assert.doesNotMatch(readFileSync(path,'utf8'),/import.*(?:world\.mjs|PalaceBuilder|ZoneBase|kit\.js)/,'consumer must never build another W');
});
test('existing-W consumer rejects missing real paint instead of trusting metadata',()=>{
 assert.equal(typeof api.assertZhaodePanelsInWorld,'function');
 const f=fixture({name:'not-canonical'}),scene=f.kit.finish(),cm=new CollisionManager();cm.rivers=[];cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);
 assert.throws(()=>api.assertZhaodePanelsInWorld({scene,cm}),/paint|palette|surface/);f.kit.dispose(scene);f.lib.dispose();
});

for(const [from,fps,sprint,backward] of [['front',60,false,false],['rear',10,true,true]])test(`isolated real controller retains ${from} ${fps}Hz complete support round trip`,t=>{
 const f=fixture(),scene=f.kit.finish(),cm=new CollisionManager();cm.rivers=[];cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);
 const trace=traceProfileSupports(cm,bindProfileSupports(cm,f.g));let result;
 try{result=replayTerrace(t,{THREE,scene,cm},zhaodeRoutePoints(f.g,{from}),{fps,sprint,backward,recordFrames:true});}finally{trace.restore();}
 assert.equal(result.arrived,true,JSON.stringify(result.end));assert.equal(result.startFeet,0);assert.equal(result.end[2],0);assert.equal(profileSupportReport(trace.samples,f.g,from).valid,true);
 for(const p of result.frames){assert.ok(Number.isFinite(p.feet)&&p.feet>=0);assert.equal(cm.checkCollision(new THREE.Vector3(p.x,p.ground+1.7,p.z),.5),false);}
 f.kit.dispose(scene);f.lib.dispose();
});
