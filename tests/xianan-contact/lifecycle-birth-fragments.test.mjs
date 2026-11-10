import test from 'node:test';
import {T,assert,makeFixture,ZoneBase,zoneData,query,freshGate,managerFixture,XiananOnly,rejectedAdmission} from './supplement.fixture.mjs';
import {registerXiananSource} from '../../src/scene/palace/special/XiananContactSources.js';
import {zoneRetainedResourceCost} from '../../src/scene/zones/InactiveZoneCache.js';

test('supplement birth: self-consistent cloned frame/kit/item is rejected',()=>{const f=makeFixture();try{
 const root=f.builder.kit.root.clone(true),walkable={...f.builder.kit.walkables[0],box:f.builder.kit.walkables[0].box.clone()},fake={root,walkables:[walkable],colliders:f.builder.kit.colliders.map(b=>b.clone())},data=zoneData();
 assert.throws(()=>registerXiananSource(fake,root.children[0],data.items[30],data,walkable),/Xianan|birth|construction/i,'geometry equality is not actual builder birth');
}finally{f.dispose()}});
test('supplement birth: inherited but unconstructed builder receiver cannot mint birth',()=>{const f=makeFixture();const real=new ZoneBase(f.lib,zoneData());try{
 const fake=Object.create(real);assert.throws(()=>ZoneBase.prototype.buildGate.call(fake,real.zoneJson.items[30]),/Xianan|birth|construction/i);
}finally{real.dispose();f.dispose()}});
for(const method of ['removeByTag','clear'])test('supplement epoch: '+method+' permits a NEW actual source in same CM',()=>{const f=makeFixture();let next;try{
 const prior=query(f);assert.equal(prior?.status,'valid');if(method==='clear')f.cm.clear();else f.cm.removeByTag('xianan-only');f.builder.kit.dispose(f.merged);f.merged.removeFromParent();
 next=freshGate(f);assert.equal(query(f)?.status,'valid','new genuine source must replace explicitly cleared registration');assert.notEqual(query(f)?.generation,prior.generation);
}finally{next?.dispose();f.dispose()}});
test('supplement epoch control: old original row alone never revives cleared binding',()=>{const f=makeFixture();try{f.cm.removeByTag('xianan-only');f.cm.addColliders(f.builder.kit.colliders,'xianan-only');f.cm.addWalkables(f.builder.kit.walkables,'xianan-only');assert.equal(query(f)?.status,'invalid')}finally{f.dispose()}});
test('supplement epoch control: raw remove/readd permanently revokes source',()=>{const f=makeFixture();try{f.merged.removeFromParent();f.scene.add(f.merged);assert.equal(query(f)?.status,'invalid')}finally{f.dispose()}});
test('supplement managed cache: actual cold load→unload/cache.put→load/cache.take grants NEW epoch',()=>{const f=managerFixture();try{
 assert.equal(f.manager.prebuilt.size,0);assert.equal(f.manager.inactiveCache.entries.size,0);f.manager.loadZone('outer-west');
 const first=f.manager.loaded.get('outer-west'),generation=query(f)?.generation;assert.equal(f.builds,1);assert.equal(query(f)?.status,'valid');
 f.manager.unloadZone('outer-west');assert.equal(query(f)?.status,'invalid');assert.equal(f.manager.inactiveCache.entries.size,1,'actual cache.put must retain this completed single gate');
 f.manager.loadZone('outer-west');const second=f.manager.loaded.get('outer-west');assert.equal(first.builder===second.builder,true);assert.equal(f.builds,1,'real cached reuse must not silently cold-rebuild');assert.equal(query(f)?.status,'valid');assert.notEqual(query(f)?.generation,generation);
}finally{f.dispose()}});
for(const channel of ['prebuilt','inactiveCache'])test('supplement managed admission: public '+channel+' cannot authorize genuine but unadmitted builder/data',()=>{const f=managerFixture();let builder;try{
 const config=f.manager.zones.get('outer-west');builder=new XiananOnly(f.lib,config);const data=builder.build(),entry={builder,data,config,detailQuality:'independent',lastUsedAt:performance.now()};
 if(channel==='prebuilt')f.manager.prebuilt.set('outer-west',entry);else{entry.cost=zoneRetainedResourceCost(entry,f.lib);assert.equal(entry.cost.cacheable,true,'fixture cache accounting must be real');assert.equal(f.manager.inactiveCache.put('outer-west',entry),true)}
 const denied=rejectedAdmission(()=>f.manager.loadZone('outer-west'));assert.equal(denied||query(f)?.status!=='valid',true,'only private initial/prebuilt/cache admission may authorize managed entry');
}finally{f.dispose();builder?.dispose()}});
test('supplement managed admission: forged manager receiver cannot reuse public registered config',()=>{const f=managerFixture();try{
 const fake=Object.create(f.manager);const denied=rejectedAdmission(()=>fake.loadZone('outer-west'));assert.equal(denied||query(f)?.status!=='valid',true);
}finally{f.dispose()}});
test('supplement lifecycle control: unload callback throw precedes managed removal window',()=>{const f=managerFixture();try{
 f.manager.loadZone('outer-west');const generation=query(f)?.generation;f.manager.onUnload=()=>{throw Error('INTENTIONAL_UNLOAD_CALLBACK')};assert.throws(()=>f.manager.unloadZone('outer-west'),/INTENTIONAL_UNLOAD_CALLBACK/);assert.equal(query(f)?.status,'valid');assert.equal(query(f)?.generation,generation);
}finally{f.dispose()}});
test('supplement rollback: notify failure revokes old epoch but next actual cold build works',()=>{const f=managerFixture();try{
 f.manager.onLoad=()=>{throw Error('INTENTIONAL_LOAD_CALLBACK')};assert.throws(()=>f.manager.loadZone('outer-west'),/INTENTIONAL_LOAD_CALLBACK/);assert.equal(query(f)?.status,'invalid');assert.equal(f.manager.loaded.size,0);assert.equal(f.manager.inactiveCache.entries.size,0);
 f.manager.onLoad=null;f.manager.loadZone('outer-west');assert.equal(query(f)?.status,'valid');assert.equal(f.builds,2);
}finally{f.dispose()}});
test('supplement cached integrity: source mutation during genuine cache interval cannot reauthorize',()=>{const f=managerFixture();try{
 f.manager.loadZone('outer-west');const entry=f.manager.loaded.get('outer-west');f.manager.unloadZone('outer-west');entry.builder.kit.root.children[0].children[0].geometry.attributes.position.array[0]+=.01;
 const denied=rejectedAdmission(()=>f.manager.loadZone('outer-west'));assert.equal(denied||query(f)?.status!=='valid',true);
}finally{f.dispose()}});
for(const [name,change] of [
 ['original type',f=>f.builder.kit.walkables[0].type='ramp'],
 ['original rescue',f=>f.builder.kit.walkables[0].rescue=false],
 ['original tag',f=>f.builder.kit.walkables[0].tag='forged'],
 ['original box identity',f=>f.builder.kit.walkables[0].box=f.builder.kit.walkables[0].box.clone()],
 ['original extra physical field',f=>f.builder.kit.walkables[0].sideGateGalleryDeck={}],
 ['cloned rescue',f=>f.cm.walkables[0].rescue=false],
 ['cloned tag',f=>f.cm.walkables[0].tag='other-tag'],
 ['cloned box identity',f=>f.cm.walkables[0].box=f.cm.walkables[0].box.clone()],
])test('supplement descriptor integrity: '+name,()=>{const f=makeFixture();try{assert.equal(query(f)?.status,'valid');change(f);assert.equal(query(f)?.status,'invalid')}finally{f.dispose()}});
test('supplement fragment: unrelated wood-bucket vertex mutation must not invalidate target60 triangles',()=>{const f=makeFixture();try{
 const threshold=f.finishedBoxes[2],mesh=f.merged.children.find(m=>m.name===threshold.matches[0].mesh),claimed=new Set(f.finishedBoxes.flatMap(b=>b.matches.filter(m=>m.mesh===mesh.name).map(m=>m.index)));
 const count=(mesh.geometry.index?.count??mesh.geometry.attributes.position.count)/3;let triangle=-1;for(let i=0;i<count;i++)if(!claimed.has(i)){triangle=i;break}assert.ok(triangle>=0,'real shared bucket must have a non-target triangle');
 const vertex=mesh.geometry.index?mesh.geometry.index.getX(triangle*3):triangle*3;mesh.geometry.attributes.position.array[vertex*3]+=.001;assert.equal(query(f)?.status,'valid','only target fragment payload belongs to Xianan certificate');
}finally{f.dispose()}});
test('supplement fragment control: actual threshold vertex mutation revokes',()=>{const f=makeFixture();try{
 const match=f.finishedBoxes[2].matches[0],mesh=f.merged.children.find(m=>m.name===match.mesh),vertex=mesh.geometry.index?mesh.geometry.index.getX(match.index*3):match.index*3;mesh.geometry.attributes.position.array[vertex*3]+=.001;assert.equal(query(f)?.status,'invalid');
}finally{f.dispose()}});
test('supplement fragment control: separate appended non-target mesh preserves certificate',()=>{const f=makeFixture();try{const extra=new T.Mesh(new T.BoxGeometry(1,1,1),f.sources[2].mesh.material);extra.position.set(500,20,500);f.merged.add(extra);assert.equal(query(f)?.status,'valid')}finally{f.dispose()}});
