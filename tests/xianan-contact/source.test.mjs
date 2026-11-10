import test from 'node:test';
import {makeFixture,assert,T} from './fixture.mjs';
import * as EnvironmentAPI from '../../src/scene/Environment.js';
const modulePath='../../src/scene/palace/special/XiananContactSources.js';
const sources=await import(modulePath).catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND'&&e.message.includes('XiananContactSources.js'))return {};throw e});
const query=(f)=>sources.queryXiananContact?.(f.cm,new T.Vector3(300.9,0,-245.3),new T.Vector3(300.9,0,-244.9),.5);

test('authentic five-box binding waits for finish, preserves atlas and original physical flow',()=>{
 let pending;
 const f=makeFixture({beforeFinish:a=>{pending=query(a)}});
 try{
  assert.equal(pending?.status,'pending','registered source must be pending, not absent, before actual finish');
  const q=query(f);assert.equal(q?.status,'valid','finished source-bound five-box capability is required');
  assert.equal(q.boxes.length,5);assert.deepEqual(q.boxes.map(b=>({min:b.min.toArray(),max:b.max.toArray()})),f.finishedBoxes.map(b=>({min:b.min,max:b.max})));
  assert.equal(f.cm.colliders.length,26);assert.equal(f.cm.walkables.length,1);assert.equal(f.width,24.1);
  assert.equal(EnvironmentAPI.getCreatedEnvironmentGround?.(f.scene)===f.ground,true,'ground birth identity, not public tag');
  f.builder.group=f.merged;f.builder.releaseConstructionReferences();assert.equal(query(f)?.status,'valid','release must retain source frame');
 }finally{f.dispose()}
});

test('no registration is granted to a copied ordinary owner row',()=>{const f=makeFixture();try{const clone={...f.builder.kit.walkables[0],box:f.builder.kit.walkables[0].box.clone()};const other=new f.cm.constructor();other.addWalkable(clone,'forged');assert.equal(sources.queryXiananContact?.(other,new T.Vector3(300.9,0,-245.3),new T.Vector3(300.9,0,-244.9),.5)===null,true,'copied owner has no private query result')}finally{f.dispose()}});
