import test from 'node:test';
import {assert,query,managerFixture,rejectedAdmission} from './supplement.fixture.mjs';

test('production result contract: different array containers with exact original elements allow real cold/cache admission',()=>{
 const f=managerFixture();try{
  const denied=rejectedAdmission(()=>f.manager.loadZone('outer-west'));assert.equal(denied,false,'production arrays are spreads, not kit containers');
  const first=f.manager.loaded.get('outer-west');assert.equal(query(f)?.status,'valid');
  for(const key of ['colliders','walkables']){assert.equal(first.data[key]===first.builder.kit[key],false);assert.equal(first.data[key].length,first.builder.kit[key].length);assert.equal(first.data[key].every((row,i)=>row===first.builder.kit[key][i]),true)}
  const generation=query(f)?.generation;f.manager.unloadZone('outer-west');assert.equal(f.manager.inactiveCache.entries.size,1);f.manager.loadZone('outer-west');
  assert.equal(f.manager.loaded.get('outer-west').builder===first.builder,true);assert.equal(f.builds,1);assert.equal(query(f)?.status,'valid');assert.notEqual(query(f)?.generation,generation);
 }finally{f.dispose()}
});
for(const [name,transformData] of [
 ['missing collider',d=>d.colliders.pop()],
 ['value-equal replacement collider',d=>d.colliders[0]=d.colliders[0].clone()],
 ['reordered original colliders',d=>{[d.colliders[0],d.colliders[1]]=[d.colliders[1],d.colliders[0]]}],
 ['extra collider',d=>d.colliders.push(d.colliders[0])],
 ['missing walkable',d=>d.walkables.pop()],
 ['value-equal replacement walkable',d=>{const w=d.walkables[0];d.walkables[0]={...w,box:w.box.clone()}}],
])test('production result contract rejects '+name,()=>{
 const f=managerFixture({transformData});try{assert.equal(rejectedAdmission(()=>f.manager.loadZone('outer-west')),true,'exact element provenance/order/count must survive production array copies');assert.equal(f.manager.loaded.size,0);assert.equal(f.manager.inactiveCache.entries.size,0)}finally{f.dispose()}
});
