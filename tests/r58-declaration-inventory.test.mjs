import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {CourtKit} from '../src/scene/palace/kit.js';
import {validateGalleryInventoryPolicy} from '../src/scene/palace/GalleryInventoryPolicy.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {axis,axisPath,baselineAxis,baselineText,targets,previousIndices,policy,assemble,hash} from './lib/r58-declaration-inventory-fixture.mjs';
const before=assemble({candidate:false}),after=assemble();
const streams=['allMeshes','colliders','walkables','rooms','maps','regions'];
test('only four declaration policies change; previous eight and all other source bytes remain exact',()=>{
 const text=fs.readFileSync(axisPath,'utf8'),baseline=baselineText(axisPath),lines=text.split('\n'),oldLines=baseline.split('\n');
 assert.equal(lines.length,oldLines.length);
 const changed=[];lines.forEach((line,i)=>{if(line!==oldLines[i])changed.push(i)});assert.equal(changed.length,4);
 const current=structuredClone(axis);for(const index of Object.keys(targets)){assert.deepEqual(current.items[index].furnishingPolicy,policy(index));delete current.items[index].furnishingPolicy;}
 assert.deepEqual(current,baselineAxis);
 assert.deepEqual(axis.items.flatMap((x,i)=>x.furnishingPolicy?[i]:[]),[26,27,28,29,30,31,32,33,34,35,36,37]);
});
test('new policies use exact canonical runtime declarations, never candidate historical identities',()=>{
 const crosswalk=JSON.parse(fs.readFileSync('docs/photo-fidelity/CROSSWALK.json'));
 for(const [i,id]of Object.entries(targets)){const rows=crosswalk.runtimeInventory.filter(r=>r.ref===`data/zones/axis-courts.json#/items/${i}`);assert.equal(rows.length,1);assert.equal(rows[0].inventoryId,id);assert.equal(rows[0].name,null);const expected=structuredClone(axis.items[i]);delete expected.furnishingPolicy;assert.deepEqual(expected,rows[0].record);assert.deepEqual(validateGalleryInventoryPolicy(policy(i),{zone:'axis-courts',target:`axis-courts/items/${i}`,kind:'corridor'}),policy(i));}
});
for(const index of Object.keys(targets))test(`item ${index} removes only owned preset props and preserves inherited shell/bounds/navigation`,()=>{
 const b=before.rows.find(r=>r.index===+index),a=after.rows.find(r=>r.index===+index);
 assert.deepEqual(axis.items[index].furnishingPolicy,policy(index));assert.equal(hash(a.allMeshes),hash(b.retainedMeshes));assert.deepEqual(a.colliders,b.retainedColliders);
 for(const k of['walkables','maps','regions'])assert.deepEqual(a[k],b[k]);assert.equal(a.rooms.length,b.rooms.length);
 for(const [i,r]of a.rooms.entries()){const{inventory,layout,furnishingPolicy,namedRoomIdentity,boundaryValidation,navigationValidation,...retained}=r;assert.equal(inventory.status,'UNKNOWN');assert.equal(inventory.accepted,false);assert.equal(inventory.knownEmpty,false);assert.equal(inventory.displayDate,null);assert.equal(layout.status,'UNVERIFIED');assert.equal(layout.historicalRoomIdentity,null);assert.equal(layout.basis,'INHERITED_CANDIDATE_BOUNDS');assert.equal(namedRoomIdentity,null);assert.equal(boundaryValidation,'NOT_VALIDATED');assert.equal(navigationValidation,'NOT_VALIDATED');assert.deepEqual(furnishingPolicy,policy(index));assert.deepEqual(retained,{...b.rooms[i],cover:[]});}
 for(const p of a.props){assert.equal(p.meshes.length,0);assert.equal(p.colliders.length,0);assert.equal(p.cover.length,0);assert.equal(p.spawns.length,2)}
 for(const room of b.props){assert.ok(['room','storage'].includes(room.kind));assert.equal(room.meshes.length,room.colliders.length);for(const p of room.owners){assert.equal(p.mesh.geometry.type,'BoxGeometry');assert.equal(p.colliders.length,1);const box=new THREE.Box3().setFromObject(p.mesh);assert.ok(box.clone().expandByScalar(1e-6).containsBox(p.colliders[0]),'exclusive collider inside its prop');}for(const c of room.cover)assert.ok(room.owners.some(p=>{const d=p.mesh.geometry.parameters;return Math.abs(p.mesh.position.x-c.x)<1e-8&&Math.abs(p.mesh.position.z-d.depth/2-.6-c.z)<1e-8}),'cover belongs to removed preset');}
});
test('all previous eight and four unchanged default corridors retain every physical/metadata stream',()=>{for(const b of before.rows.filter(r=>!targets[r.index])){const a=after.rows.find(r=>r.index===b.index);for(const k of streams)assert.equal(hash(a[k]),hash(b[k]),`${b.index} ${k}`)}for(const[i,b]of before.controls.entries())for(const k of streams)assert.equal(hash(after.controls[i][k]),hash(b[k]),`control ${i} ${k}`)});
test('removing only the four new explicit policies exactly restores the predecessor outputs',()=>{const a=assemble({explicit:false});for(const[i,b]of before.rows.entries())for(const k of streams)assert.equal(hash(a.rows[i][k]),hash(b[k]),`${b.index} ${k}`);assert.deepEqual(a.nextRandom,before.nextRandom)});
for(const bad of[null,false,{}, {...policy(26),runtimeInventoryId:targets[27]}, {...policy(26),runtimeInventoryId:'协和门南庑房'}, {...policy(26),runtimeInventoryId:'FC-9E59B14A3C'}, {...policy(26),target:'axis-courts/items/38'}, {...policy(26),mode:'empty'}, {...policy(26),name:'协和门南庑房'}, {...policy(26),reviewId:'FC-9E59B14A3C'}, {...policy(26),knownEmpty:true}])test(`reject mismatched or name-based policy ${JSON.stringify(bad)}`,()=>{const data=structuredClone(axis),z=new ZoneBase(library(),data);data.items[26].furnishingPolicy=bad;assert.throws(()=>z.buildCorridor(data.items[26]),/policy|target|inventory/i);assert.equal(z.kit.root.children.length,0)});
for(const[i,zone,kind]of[[27,'axis-courts','corridor'],[38,'axis-courts','corridor'],[26,'east-six','corridor'],[26,'axis-courts','hall']])test(`reject wrong declaration context ${zone}/${i}/${kind}`,()=>{const data=structuredClone(axis);data.id=zone;data.items[i].kind=kind;delete data.items[i].gateJoin;data.items[i].furnishingPolicy=policy(26);const z=new ZoneBase(library(),data);assert.throws(()=>z.buildCorridor(data.items[i]),/policy|target|inventory/i);assert.equal(z.kit.root.children.length,0)});
test('cloned declarations and directly furnished unbound frames cannot acquire runtime ownership',()=>{const data=structuredClone(axis),z=new ZoneBase(library(),data);data.items[26].furnishingPolicy=policy(26);assert.throws(()=>z.buildCorridor(structuredClone(data.items[26])),/policy|target|inventory/i);const k=new CourtKit(library(),'axis-courts'),f=k.frame(0,0),r={x0:-5,x1:5,z0:-1.8,z1:1.8,y:.45,doorX:0,h:3.15};assert.throws(()=>k.corridor(0,0,0,30,'x+',{furnishingPolicy:policy(26)}),/policy|target|inventory/i);assert.throws(()=>k.furnish(f,'room',r,policy(26)),/policy|target|inventory/i);assert.throws(()=>k.registerRoom(f,{name:'candidate',kind:'room',...r,doors:[],inventoryPolicy:policy(26)}),/policy|target|inventory/i);assert.equal(f.children.length,0)});
test('only two production files change relative to immutable predecessor',()=>{for(const p of['src/scene/palace/kit.js','src/scene/zones/ZoneBase.js','src/scene/palace/interiors.js','src/utils/Collision.js','src/controls/FirstPerson.js'])assert.equal(fs.readFileSync(p,'utf8'),baselineText(p),p)});

test('actual immutable predecessor removal census is 261 preset meshes/colliders, 3132 triangles and 116 covers',()=>{
 const rows=before.rows.filter(r=>targets[r.index]),remaining=after.rows.filter(r=>targets[r.index]),props=rows.flatMap(r=>r.props),owners=props.flatMap(p=>p.owners);
 assert.equal(owners.length,261);assert.equal(owners.reduce((n,p)=>n+(p.mesh.geometry.index?.count??p.mesh.geometry.attributes.position.count)/3,0),3132);assert.equal(owners.flatMap(p=>p.colliders).length,261);assert.equal(rows.flatMap(r=>r.rooms).flatMap(r=>r.cover).length,116);assert.equal(remaining.flatMap(r=>r.rooms).flatMap(r=>r.cover).length,0);assert.equal(remaining.flatMap(r=>r.rooms).length,32);assert.equal(remaining.flatMap(r=>r.rooms).flatMap(r=>r.spawns).length,64);assert.equal(remaining.flatMap(r=>r.walkables).length,4);
 const bedrooms=props.filter(p=>p.kind==='room'),storage=props.filter(p=>p.kind==='storage');assert.equal(bedrooms.length,22);for(const p of bedrooms)assert.deepEqual(p.owners.map(o=>o.mesh.material.name),['kit_furn_wood','kit_furn_cloth','kit_furn_wood','kit_lacquer','kit_lacquer','kit_furn_wood']);assert.equal(storage.length,10);assert.equal(storage.flatMap(p=>p.owners).length,129);assert.ok(storage.flatMap(p=>p.owners).every(p=>p.mesh.material.name==='kit_furn_crate'));
});
