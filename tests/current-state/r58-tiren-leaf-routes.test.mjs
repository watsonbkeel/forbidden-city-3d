import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture} from '../lib/r58-court-facade-fixture.mjs';
import {replayTerrace} from '../lib/terrace-walk.mjs';
import {assertTirenLeavesInWorld,assertCourtRouteHeadClearance} from '../lib/r58-court-facade-world-check.mjs';
function world(f){const scene=new THREE.Scene();scene.add(f.kit.finish());scene.updateMatrixWorld(true);return{THREE,scene,cm:f.cm};}
test('Tiren pure existing-W consumer checks twelve actual merged meeting stiles',()=>{assert.equal(assertTirenLeavesInWorld(world(fixture('tiren'))).probes.length,12);});
for(const side of ['frontLeft','frontRight'])test(`Tiren actual first-person ${side} round trip preserves stairs, threshold and lower entry`,t=>{
 const f=fixture('tiren'),g=f.g,W=world(f),go=g.approaches[side].worldPoints.map(p=>[p.x,p.z]),points=[...go,...go.slice(0,-1).reverse()];const result=replayTerrace(t,W,points,{fps:60,recordFrames:true});const check=assertCourtRouteHeadClearance(W,result);t.diagnostic(JSON.stringify({side,frames:result.frames.length,...check}));assert.ok(Math.abs(result.end[2])<1e-6);
});
