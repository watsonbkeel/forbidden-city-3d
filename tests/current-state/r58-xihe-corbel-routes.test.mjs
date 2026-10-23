import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture} from '../lib/r58-court-facade-fixture.mjs';
import {replayTerrace} from '../lib/terrace-walk.mjs';
import {assertXiheCorbelsInWorld,assertCourtRouteHeadClearance} from '../lib/r58-court-facade-world-check.mjs';
function world(f){const scene=new THREE.Scene();scene.add(f.kit.finish());scene.updateMatrixWorld(true);return{THREE,scene,cm:f.cm};}
test('Xihe pure existing-W consumer checks six actual merged members',()=>{assert.equal(assertXiheCorbelsInWorld(world(fixture('xihe'))).probes.length,6);});
for(const fps of [30,60,120])test(`Xihe actual first-person three-portal round trips at ${fps} fps keep body and rendered head clearance`,t=>{
 const f=fixture('xihe'),g=f.g,W=world(f);
 for(const portal of g.portals){const front=g.ramps[0],rear=g.ramps[1],z=[front.zToe-1,front.zTop,-g.depth/2,0,g.depth/2,rear.zTop,rear.zToe+1],go=z.map(z=>g.toWorld(portal.centerX,z)),points=[...go,...go.slice(0,-1).reverse()],result=replayTerrace(t,W,points,{fps,recordFrames:true,sprint:fps===120});const check=assertCourtRouteHeadClearance(W,result);t.diagnostic(JSON.stringify({portal:portal.bay,fps,frames:result.frames.length,...check}));assert.ok(Math.abs(result.end[2])<1e-6);}
});
