import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {CourtKit} from '../src/scene/palace/kit.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {outer,indices,nansansuoFixture,hash} from './lib/r59-nansansuo-inventory-fixture.mjs';
const before=nansansuoFixture({candidate:false}),after=nansansuoFixture({candidate:process.env.R59_FROZEN_RED!=='1'});
for(const i of indices)test(`declaration ${i}: no unsupported props, explicit UNKNOWN not historical emptiness`,()=>{
 const b=before.rows.find(r=>r.index===i),a=after.rows.find(r=>r.index===i);
 assert.equal(b.props.length,1);assert.equal(b.props[0].meshes.length,8);assert.equal(a.props.length,1);assert.equal(a.props[0].meshes.length,0,'unverified generic objects must not render');assert.equal(a.props[0].colliders.length,0);
 assert.deepEqual(a.allMeshes,b.retainedMeshes);assert.deepEqual(a.colliders,b.retainedColliders);assert.deepEqual(a.walkables,b.walkables);assert.deepEqual(a.maps,b.maps);assert.deepEqual(a.regions,b.regions);
 assert.equal(a.rooms.length,1);const r=a.rooms[0];assert.equal(r.kind,b.rooms[0].kind);assert.equal(r.inventory.status,'UNKNOWN');assert.equal(r.inventory.knownEmpty,false);assert.equal(r.inventory.accepted,false);assert.equal(r.layout.status,'UNVERIFIED');assert.equal(r.boundaryValidation,'NOT_VALIDATED');assert.equal(r.navigationValidation,'NOT_VALIDATED');assert.equal(r.namedRoomIdentity,null);assert.deepEqual(r.cover,[]);
 const {cover,...br}=b.rooms[0],{furnishingPolicy,inventory,layout,namedRoomIdentity,boundaryValidation,navigationValidation,cover:ac,...ar}=r;assert.deepEqual(ar,br,'boundaries, floor, doors and spawn points retained');
});
test('later unrelated generic room in same random stream stays exactly unchanged',()=>{const clean=r=>({meshes:r.allMeshes,colliders:r.colliders,walkables:r.walkables,rooms:r.rooms,maps:r.maps,regions:r.regions});assert.deepEqual(clean(after.controlSnapshot),clean(before.controlSnapshot));assert.equal(after.controlSnapshot.props[0].meshes.length,8)});
test('runtime JSON changes exactly six explicit policies, every original structural field remains',()=>{const old=JSON.parse(fs.readFileSync(new URL('./fixtures/r59-outer-east-baseline.json',import.meta.url))),copy=structuredClone(outer);assert.deepEqual(copy.items.flatMap((v,i)=>v.furnishingPolicy===undefined?[]:[i]),indices);for(const i of indices)delete copy.items[i].furnishingPolicy;assert.deepEqual(copy,old)});
test('wrong zone, changed declaration, spoofed target, detached item and extra policy fail before geometry allocation',()=>{
 for(const mutate of [d=>{d.id='outer-west'},d=>{d.items[12].x+=.01},d=>{d.items[12].furnishingPolicy.target='outer-east/items/13'},d=>{d.items[12].furnishingPolicy.runtimeInventoryId='wrong'},d=>{d.items[12].furnishingPolicy.other=true},d=>{d.items[12].structure='wenyuan-pavilion'}]){
  const d=structuredClone(outer);mutate(d);const z=new ZoneBase(library(),d);assert.throws(()=>z.buildHall(d.items[12]),/inventory|identity|drift/i);assert.equal(z.kit.root.children.length,0);
 }
 const z=new ZoneBase(library(),outer);assert.throws(()=>z.buildHall(structuredClone(outer.items[12])),/inventory|target/i);assert.equal(z.kit.root.children.length,0);
});
test('explicit hall entry does not allow forged direct kit parameters or unrestricted hall policy',()=>{
 const k=new CourtKit(library(),'outer-east'),item=outer.items[12],binding={zoneId:'outer-east',itemIndex:12,item};
 assert.throws(()=>k.nansansuoUnknownHall({x:0,z:0,w:10,d:10},binding),/parameters/);assert.equal(k.root.children.length,0);
 assert.throws(()=>k.hall({x:item.x,z:item.z,w:item.w,d:item.d,furnishingPolicy:item.furnishingPolicy}),/policy/);assert.equal(k.root.children.length,0);
});
test('removed meshes and collider references are absent, not post-hoc hidden objects',()=>{for(const row of after.rows){assert.equal(row.props[0].meshes.length,0);assert.equal(row.props[0].colliders.length,0);assert.equal(row.allMeshes.length,row.retainedMeshes.length)}assert.equal(before.rows.flatMap(r=>r.props.flatMap(p=>p.meshes)).length,48)});
test.after(()=>{if(process.env.R59_FROZEN_RED!=='1'){const proof=indices.map(i=>{const b=before.rows.find(r=>r.index===i),a=after.rows.find(r=>r.index===i);return{index:i,runtimeInventoryId:outer.items[i].furnishingPolicy.runtimeInventoryId,removedMeshes:b.props[0].meshes.length,removedColliders:b.props[0].colliders.length,retainedMeshSha256:hash(a.allMeshes),retainedColliderSha256:hash(a.colliders),supportSha256:hash(a.walkables),room:a.rooms[0]}});fs.mkdirSync('reports/r59-nansansuo-inventory',{recursive:true});fs.writeFileSync('reports/r59-nansansuo-inventory/local-proof.json',JSON.stringify({scope:'Existing six declarations only; no historical empty-room or three-stage identity claim.',proof},null,2)+'\n')}before.dispose();after.dispose()});
