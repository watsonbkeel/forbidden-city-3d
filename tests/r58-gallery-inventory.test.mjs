import test from 'node:test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {CourtKit} from '../src/scene/palace/kit.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {axis,targets,policy,assemble,hash,meshRow,boxRow} from './lib/r58-gallery-fixture.mjs';
const before=assemble({candidate:false}),after=assemble();
for(const [index,reviewId] of Object.entries(targets))test(`item ${index} explicitly suppresses only unverified props and registers UNKNOWN / UNVERIFIED`,()=>{
 assert.deepEqual(axis.items[index].furnishingPolicy,policy(index));const b=before.rows.find(r=>r.index===+index),a=after.rows.find(r=>r.index===+index);
 assert.equal(a.allMeshes.length,b.retainedMeshes.length);assert.equal(hash(a.allMeshes),hash(b.retainedMeshes),'all retained attributes/materials/matrices exact');
 assert.deepEqual(a.colliders,b.retainedColliders);assert.deepEqual(a.walkables,b.walkables);assert.deepEqual(a.maps,b.maps);assert.deepEqual(a.regions,b.regions);
 assert.equal(a.rooms.length,b.rooms.length);
 for(let i=0;i<a.rooms.length;i++){const {inventory,layout,furnishingPolicy,...rest}=a.rooms[i];assert.equal(inventory.status,'UNKNOWN');assert.equal(inventory.accepted,false);assert.equal(layout.status,'UNVERIFIED');assert.equal(layout.basis,'INHERITED_CANDIDATE_BOUNDS');assert.equal(layout.historicalRoomIdentity,null);assert.deepEqual(furnishingPolicy,policy(index));assert.deepEqual(rest,{...b.rooms[i],cover:[]});}
});
test('all 406 removed meshes each own their removed collider; cover provenance is prop-local; no spawn deletion',()=>{
 const removed=before.rows.filter(r=>targets[r.index]).flatMap(r=>r.props);assert.equal(removed.reduce((n,r)=>n+r.meshes.length,0),406);
 for(const r of removed){assert.equal(r.meshes.length,r.colliders.length);for(const p of r.owners){assert.equal(p.colliders.length,1);assert.equal(p.mesh.geometry.type,'BoxGeometry');const dims=p.mesh.geometry.parameters,c=p.colliders[0];assert.ok(c.max.y<=p.mesh.position.y+dims.height/2+1e-8);}for(const cover of r.cover)assert.ok(r.owners.some(p=>{const d=p.mesh.geometry.parameters;return Math.abs(p.mesh.position.x-cover.x)<1e-8&&Math.abs(p.mesh.position.z-d.depth/2-.6-cover.z)<1e-8}));}
 const a=after.rows.filter(r=>targets[r.index]);assert.equal(a.flatMap(r=>r.rooms).length,52);assert.equal(a.flatMap(r=>r.rooms).flatMap(r=>r.spawns).length,104);assert.equal(a.flatMap(r=>r.rooms).flatMap(r=>r.cover).length,0);
});
test('same sequential-zone RNG and all south/non-target streams remain exact',()=>{
 // UUID/global cursor differences are not physical regressions; compare actual later streams below.
 for(const b of before.rows.filter(r=>!targets[r.index])){const a=after.rows.find(r=>r.index===b.index);for(const k of ['allMeshes','colliders','walkables','rooms','maps','regions'])assert.equal(hash(a[k]),hash(b[k]),`${b.index} ${k}`);}
 before.controls.forEach((b,i)=>{for(const k of ['allMeshes','colliders','walkables','rooms','maps','regions'])assert.equal(hash(after.controls[i][k]),hash(b[k]),`control ${i} ${k}`)});
});
test('undefined policy retains old default bytes including all room/furniture streams',()=>{
 const a=assemble({explicit:false});for(let i=0;i<a.rows.length;i++)for(const k of ['allMeshes','colliders','walkables','rooms','maps','regions'])assert.equal(hash(a.rows[i][k]),hash(before.rows[i][k]));assert.deepEqual(a.nextRandom,before.nextRandom);
});
for(const bad of [null,'empty',false,{}, {...policy(28),mode:'empty'}, {...policy(28),reviewId:'FC-86FF7FC2AB'}, {...policy(28),target:'axis-courts/items/38'}, {...policy(28),accepted:true}])test(`reject illegal explicit policy ${JSON.stringify(bad)}`,()=>{const data=structuredClone(axis);data.items[28].furnishingPolicy=bad;const z=new ZoneBase(library(),data);assert.throws(()=>z.buildCorridor(data.items[28]),/policy|target|inventory/i);assert.equal(z.kit.root.children.length,0)});
for(const [i,zoneId,kind] of [[38,'axis-courts','corridor'],[28,'west-six','corridor'],[28,'axis-courts','hall']])test(`reject wrong target ${zoneId}/${i}/${kind}`,()=>{const data=structuredClone(axis);data.id=zoneId;data.items[i].kind=kind;delete data.items[i].gateJoin;data.items[i].furnishingPolicy=policy(28);const z=new ZoneBase(library(),data);assert.throws(()=>z.buildCorridor(data.items[i]),/policy|target|inventory/i)});
test('direct generic kit may not adopt an unidentified or mismatched gallery opt-in',()=>{const k=new CourtKit(library(),'unrelated');assert.throws(()=>k.corridor(0,0,0,30,'x+',{furnishingPolicy:policy(28)}),/policy|target|inventory/i)});
test('skip means no mesh/material construction, not construct-and-discard',()=>{for(const row of after.rows.filter(r=>targets[r.index]))for(const call of row.props){assert.equal(call.meshes.length,0);assert.equal(call.colliders.length,0)}});

test('JSON adds only the exact eight policy fields and no structural values',()=>{const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/r58-gallery-baseline-axis.json',import.meta.url))),current=structuredClone(axis);assert.deepEqual(current.items.flatMap((r,i)=>r.furnishingPolicy===undefined?[]:[i]),Object.keys(targets).map(Number));for(const i of Object.keys(targets))delete current.items[i].furnishingPolicy;assert.deepEqual(current,baseline)});
test('actual hall dispatch rejects explicit misplaced gallery policy',()=>{const data=structuredClone(axis),z=new ZoneBase(library(),data);data.items[24].furnishingPolicy=policy(28);assert.throws(()=>z.buildHall(data.items[24]),/policy|target|inventory/i);assert.equal(z.kit.root.children.length,0)});
for(const bad of[null,false,{},policy(28)])test(`direct furnishing cannot bypass target validation: ${JSON.stringify(bad)}`,()=>{const k=new CourtKit(library(),'unrelated'),f=k.frame(0,0),r={x0:-5,x1:5,z0:-1.8,z1:1.8,y:.45,doorX:0,h:3.15};assert.throws(()=>k.furnish(f,'room',r,bad),/policy|target|inventory/i);assert.equal(f.children.length,0);assert.throws(()=>k.registerRoom(f,{name:'unrelated',kind:'room',...r,doors:[],inventoryPolicy:bad}),/policy|target|inventory/i)});
test('detached item clone cannot silently claim a registered target slot',()=>{const data=structuredClone(axis),z=new ZoneBase(library(),data);assert.throws(()=>z.buildCorridor(structuredClone(data.items[28])),/policy|target|inventory/i);assert.equal(z.kit.root.children.length,0)});
