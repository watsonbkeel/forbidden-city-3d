import test from 'node:test';
import {makeFixture,assert,T} from './fixture.mjs';
import * as EnvironmentAPI from '../../src/scene/Environment.js';
const api=await import('../../src/controls/XiananGroundWitness.js').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND'&&e.message.includes('XiananGroundWitness.js'))return {};throw e});
const from=new T.Vector3(300.9,0,-245.4),to=new T.Vector3(300.9,0,-244.9);
test('real setupGround covers full square and swept square',()=>{const f=makeFixture();try{assert.equal(EnvironmentAPI.getCreatedEnvironmentGround?.(f.scene)===f.ground,true);assert.equal(api.xiananGroundCovered?.(f.scene,from,to,.5),true)}finally{f.dispose()}});
for(const [name,change] of [
 ['public tag copy',f=>{f.ground.removeFromParent();f.scene.add(f.ground.clone())}],
 ['hidden',f=>f.ground.visible=false],
 ['moved',f=>f.ground.position.y=.01],
 ['unversioned vertex array',f=>f.ground.geometry.attributes.position.array[0]+=.1],
 ['unversioned index array',f=>f.ground.geometry.index.array[0]=f.ground.geometry.index.array[1]],
 ['geometry replacement',f=>f.ground.geometry=f.ground.geometry.clone()],
 ['material hidden',f=>f.ground.material.visible=false],
 ['disposed',f=>f.environment.dispose()],
])test('ground birth revokes '+name,()=>{const f=makeFixture();try{assert.equal(api.xiananGroundCovered?.(f.scene,from,to,.5),true);change(f);assert.equal(api.xiananGroundCovered?.(f.scene,from,to,.5),false)}finally{f.dispose()}});
// Pure coverage verifier has no registration side effect. Use disjoint true
// triangles with a corner/path hole, rather than changing a rectangle label.
const rectangle=(x0,z0,x1,z1)=>[[[x0,z0],[x1,z0],[x1,z1]],[[x0,z0],[x1,z1],[x0,z1]]];
test('polygon difference rejects corner holes and intermediate swept holes',()=>{
 const square=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]];
 const corner=[...rectangle(-1,-1,.4,1),...rectangle(.4,-1,1,.4)];
 assert.equal(api.triangleUnionCovers?.(square,rectangle(-1,-1,1,1)),true);
 assert.equal(api.triangleUnionCovers?.(square,corner),false,'center covered does not cover corner');
 const swept=[[-.5,-.5],[2.5,-.5],[2.5,.5],[-.5,.5]];
 const gap=[...rectangle(-1,-1,.8,1),...rectangle(1.2,-1,3,1)];
 assert.equal(api.triangleUnionCovers?.(swept,gap),false,'both endpoint squares covered, middle missing');
 assert.equal(api.triangleUnionCovers?.(square,[...rectangle(-1,-1,.4,1),...rectangle(-1,-1,.4,1)]),false,'duplicate triangle area cannot hide a gap');
});
