import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture,roles} from '../lib/r58-court-facade-fixture.mjs';
import {replayTerrace} from '../lib/terrace-walk.mjs';
import {assertCourtRouteHeadClearance} from '../lib/r58-court-facade-world-check.mjs';
const module=await import('../lib/r58-hongyi-window-world-check.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return{};throw e;});
function world(f){const scene=new THREE.Scene();scene.add(f.kit.finish());scene.updateMatrixWorld(true);return{THREE,scene,cm:f.cm};}
const consume=W=>{assert.equal(typeof module.assertHongyiLeavesInWorld,'function');return module.assertHongyiLeavesInWorld(W);};
test('Hongyi already-built W consumer checks twelve real merged stiles, six blocking windows and three open door rays',()=>{
 const W=world(fixture('hongyi')),before=JSON.stringify({c:W.cm.colliders,w:W.cm.walkables}),children=W.scene.children.slice(),result=consume(W);assert.equal(result.probes.length,12);assert.equal(result.windowCollisionProbes,6);assert.equal(result.doorHeadRays,3);assert.equal(JSON.stringify({c:W.cm.colliders,w:W.cm.walkables}),before);assert.deepEqual(W.scene.children,children);
});
test('Hongyi consumer rejects a missing meeting stile rather than trusting role labels',()=>{const f=fixture('hongyi'),stile=roles(f.frame,'lower-window-leaf-stile').find(m=>m.userData.edge==='meeting');assert.ok(stile);stile.removeFromParent();assert.throws(()=>consume(world(f)),/meeting stile/);});
test('Hongyi consumer rejects removed collisions or terrace support',()=>{
 for(const field of ['colliders','walkables']){const W=world(fixture('hongyi'));W.cm[field]=[];assert.throws(()=>consume(W),field==='colliders'?/window collision/:/terrace supports/);}
});
test('Hongyi consumer rejects Tiren or a missing assembly',()=>assert.throws(()=>consume(world(fixture('tiren'))),/Hongyi assembly/));
for(const side of ['frontLeft','frontRight'])test(`Hongyi ${side} actual first-person round trip preserves both stairs and the original entry`,t=>{
 const f=fixture('hongyi'),W=world(f),go=f.g.approaches[side].worldPoints.map(p=>[p.x,p.z]),result=replayTerrace(t,W,[...go,...go.slice(0,-1).reverse()],{fps:60,recordFrames:true}),head=assertCourtRouteHeadClearance(W,result);t.diagnostic(JSON.stringify({side,frames:result.frames.length,...head}));assert.ok(Math.abs(result.end[2])<1e-6);
});
