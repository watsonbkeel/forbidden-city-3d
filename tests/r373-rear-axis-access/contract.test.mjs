import test from 'node:test';import assert from 'node:assert/strict';import {fixture} from './fixture.mjs';
import {captureRearGate,recordRearWalkables,bindRearSource,checkRearCurrentAccess} from '../lib/rear-axis-current-access.mjs';
const hooks={capture:captureRearGate,record:recordRearWalkables};
for(const index of[16,18]){
test(`exact gate ${index}`,()=>{const W=fixture(index,hooks);try{const b=bindRearSource(W,W.gate);assert.equal(b.s.colliders.length,403);assert.equal(b.s.walkables.length,3);}finally{W.dispose();}});
for(const mutation of['item','registered','support','source','frame','visual'])test(`reject ${index} ${mutation}`,()=>{const W=fixture(index,hooks);try{if(mutation==='item')W.gate.item={...W.item};if(mutation==='registered')W.cm.colliders[0]={...W.cm.colliders[0]};if(mutation==='support')W.cm.walkables[0]={...W.cm.walkables[0]};if(mutation==='source')W.builder.kit.colliders[0].min.x+=.01;if(mutation==='visual'){const f=W.builder.kit.root.children.find(f=>f.name===W.item.name);f.remove(f.children[0]);}if(mutation==='frame')W.builder.kit.root.children.find(f=>f.name===W.item.name).position.y=.1;assert.throws(()=>bindRearSource(W,W.gate));}finally{W.dispose();}});
test(`native and unchanged outside semantics ${index}`,()=>{const W=fixture(index,hooks);try{const r=checkRearCurrentAccess(W,W.gate);assert.deepEqual(r.faults,[]);assert.equal(r.runs.length,3);assert.equal(r.original.length,2);for(const o of r.original){assert.equal(o.scan.total,8);assert.ok(o.scan.reached>=8);assert.ok(Math.abs(o.feet-1.575)<1e-9);assert.ok(o.outside.maxDist>=16);}assert.ok(r.outside.every(v=>v.maxDist>=27.2));assert.ok(r.clearance.every(v=>v.reached>=4));assert.equal(r.legacy.invalidPlatformY,true);}finally{W.dispose();}});
}

for(const z of[123,104,107.1])test(`foreign neighbor blocker z=${z} retained`,()=>{const W=fixture(16,hooks);try{W.cm.addColliders([new W.THREE.Box3(new W.THREE.Vector3(-100,0,z-.3),new W.THREE.Vector3(-50,10,z+.3))],'foreign');let refused=false;try{refused=checkRearCurrentAccess(W,W.gate).faults.length>0;}catch{refused=true;}assert.ok(refused);}finally{W.dispose();}});
test('missing capture rejected',()=>{const W=fixture(16);try{assert.throws(()=>bindRearSource(W,W.gate));}finally{W.dispose();}});
import {reachFrom} from '../lib/world.mjs';
test('invalid BFS seed heights rejected and default unchanged',()=>{const W=fixture(16,hooks);try{const args=[W,[-76.4,106],[-76.4,123],27.2,()=>false,.5];for(const initialFeet of[NaN,-1,Infinity])assert.throws(()=>reachFrom(...args,{initialFeet}));assert.deepEqual(reachFrom(...args),reachFrom(...args,{initialFeet:0}));}finally{W.dispose();}});
test('actual Environment ground removal rejected',()=>{const W=fixture(16,hooks);try{W.environmentScene.clear();assert.throws(()=>bindRearSource(W,W.gate));}finally{W.dispose();}});

import {runRearNative} from '../lib/rear-axis-current-access.mjs';
test('real dynamic person blocks native ramp route',()=>{const W=fixture(16,hooks);try{const b=bindRearSource(W,W.gate);W.cm.setDynamicBodies('r373-person',[{id:'person',parts:[{ax:-76.4,az:115,bx:-76.4,bz:115,radius:.25,minY:0,maxY:4}]}]);assert.ok(runRearNative(W,b,W.gate,30).error);W.cm.clearDynamicBodies('r373-person');assert.equal(runRearNative(W,b,W.gate,30).error,undefined);}finally{W.dispose();}});
