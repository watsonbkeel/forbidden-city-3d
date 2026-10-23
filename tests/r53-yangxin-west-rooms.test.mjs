import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {CourtKit} from '../src/scene/palace/kit.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {replayTerrace, traceTerraceGround} from './lib/terrace-walk.mjs';
import {augmentRemainingHall, resolveRemainingProfile} from '../src/scene/palace/special/RemainingResidentialHalls.js';
import {readYangxinEnvelope} from './r48-residential-glb-envelope.mjs';
const moduleUrl=new URL('../src/scene/palace/special/YangxinWestWarmRooms.js',import.meta.url);
const scope=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/residential-scope.json',import.meta.url)));
const item=scope.find(r=>r.name==='养心殿').baselineItem;
const contract=async()=>{assert.ok(existsSync(moduleUrl),'source-backed Yangxin west-room component must exist');return import(moduleUrl);};
const nodes=(f,role)=>{const a=[];f.traverse(o=>{if(o.userData.role===role)a.push(o);});return a;};
function fixture(){const kit=new CourtKit(library(),'west-six'),built=kit.hall(item),p=resolveRemainingProfile('west-six',item);augmentRemainingHall(kit,item,built,p);kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders,'west-six');cm.addWalkables(kit.walkables,'west-six');return{kit,...built,cm};}

test('R53 uses actual p123/p125/p127 measurements without calling its model fit a survey',async()=>{
 const {YANGXIN_WEST_ROOM_PLAN:p}=await contract();
 assert.deepEqual(p.sourceDimensions.rooms,{eastPassage:[2.14,5.15],qinzhengqinxian:[5.04,5.15],sanxitang:[2.12,6]});
 assert.deepEqual(p.sourceDimensions.westBay,[10.15,11.56]);assert.equal(p.sourceDimensions.unallocatedWidthDifference,.85);
 assert.equal(p.dimensionStatus,'REVERSIBLE_MODEL_FIT_NOT_SURVEYED');
 assert.equal(p.sources.plaque.currentObject,'1960s restoration using collected Yongzheng calligraphy');
 assert.equal(p.sources.photos.captureDate,null);assert.equal(p.sources.photos.urlDate,'2026-04-30');
 assert.equal(p.sources.paper.publication,'2023-07');assert.equal(p.sources.paper.state,'DOCUMENTED_2023_CONDITION_AND_HISTORICAL_ANALYSIS');
 assert.ok(p.transform.residuals.some(r=>r.id==='unbuilt-north-envelope'));assert.ok(Object.isFrozen(p.transform));
});
test('R53 augmentation adds one permanent source-based west-room component only to the exact Yangxin hall',async()=>{
 await contract();const {f,kit}=fixture(),g=nodes(f,'r53-yangxin-west-warm-rooms');assert.equal(g.length,1);
 assert.equal(g[0].userData.stage,'SOURCE_BASED_BASIC_FORMS_PARTIAL_NOT_FULL_RESTORATION');
 assert.equal(f.userData.structure.yangxinWestWarmRooms.rearPolicy,'UNBUILT_NO_DEFAULT_FURNITURE');
 assert.equal(nodes(f,'r53-qinzheng-north-kang').length,1);assert.equal(nodes(f,'r53-sanxi-south-window-kang').length,1);
 assert.equal(nodes(f,'r53-sanxi-south-room-partition').length,1);assert.equal(nodes(f,'r53-sanxi-kan-frame').length,2);
 assert.equal(kit.rooms.filter(r=>r.kind==='r53-yangxin-source-room').length,4);
 assert.equal(kit.mapItems.filter(r=>r.name==='养心殿').length,1);
});
test('R53 refuses wrong, duplicate, rotated and unregistered frame inputs before changing geometry',async()=>{
 const {buildYangxinWestWarmRooms:build}=await contract();const {kit,f}=fixture();let n=f.children.length,c=kit.colliders.length;
 assert.throws(()=>build(kit,item,f),/already/);assert.equal(f.children.length,n);assert.equal(kit.colliders.length,c);
 for(const patch of[{name:'三希堂'},{w:35},{x:109},{d:13},{rot:Math.PI}]){const k=new CourtKit(library(),'west-six'),b=k.hall(item),before=b.f.children.length;assert.throws(()=>build(k,{...item,...patch},b.f),/identity|envelope/);assert.equal(b.f.children.length,before);}
});
test('R53 keeps new solid bounds and their conservative collision AABBs identical and finite',async()=>{
 await contract();const {f,kit}=fixture(),g=nodes(f,'r53-yangxin-west-warm-rooms')[0];let n=0;
 g.traverse(m=>{if(!m.isMesh)return;n++;for(const a of Object.values(m.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));
 const b=new THREE.Box3().setFromObject(m);if(m.userData.solid)assert.equal(kit.colliders.filter(c=>c.min.distanceTo(b.min)<1e-5&&c.max.distanceTo(b.max)<1e-5).length,1,m.name);});
 assert.ok(n===109);assert.ok(new THREE.Box3().setFromObject(g).max.y<6.5);
});
test('R53 new room solids avoid all retained GLB furniture and partitions, allowing only floor-bearing contact',async()=>{
 await contract();const {f}=fixture(),g=nodes(f,'r53-yangxin-west-warm-rooms')[0],rows=await readYangxinEnvelope(),tri=new THREE.Triangle();let newMeshes=0;assert.equal(rows.length,11);assert.equal(rows.reduce((n,r)=>n+r.triangles.length,0),8720);
 g.traverse(m=>{if(!m.isMesh)return;newMeshes++;const b=new THREE.Box3().setFromObject(m).translate(new THREE.Vector3(-item.x,-item.ph,-item.z));
 for(const r of rows){if(!b.intersectsBox(r.box))continue;if(['merged_brick_grout','merged_wood_floor'].includes(r.name)){assert.ok(r.box.max.y<.069);assert.ok(b.min.y<=.069);continue;}
 for(const pts of r.triangles){tri.set(...pts);assert.equal(b.intersectsTriangle(tri),false,`${m.name} intersects ${r.name}`);}}});
 assert.equal(newMeshes,109);
 assert.equal(createHash('sha256').update(readFileSync(new URL('../public/models/interiors/yangxin.glb',import.meta.url))).digest('hex'),'e29192ab78f14811cbbbb94f8736d984f3c8bfece197e54cb81e023cb7c8fde3');
});
for(const fps of[10,60])for(const sprint of[false,true])test(`R53 real B controls traverse the two-turn west-room route both ways, ${fps}Hz sprint=${sprint}`,async t=>{
 const {YANGXIN_WEST_ROOM_PLAN:p}=await contract(),w=fixture();const path=[[0,-16],[0,-3],[4.8,-3],[4.8,p.route[0][1]],...p.route,...p.route.slice(0,-1).reverse(),[4.8,p.route[0][1]],[4.8,-3],[0,-3],[0,-16]].map(([x,z])=>[item.x+x,item.z+z]);
 const tr=traceTerraceGround(w.cm,{flights:[]});try{const r=replayTerrace(t,{...w,THREE},path,{fps,sprint});assert.equal(r.arrived,true,JSON.stringify(r));assert.equal(tr.samples.some(s=>s.source==='rescue'),false);}finally{tr.restore();}
});
test('R53 room doors and deliberately chosen spawn points clear a full 0.5m player radius',async()=>{
 await contract();const {kit,cm}=fixture();for(const r of kit.rooms.filter(r=>r.kind==='r53-yangxin-source-room'))for(const p of[...r.doors,...r.spawns])assert.equal(cm.checkCollision(new THREE.Vector3(p.x,item.ph+1.7,p.z),.5),false,`${r.name}: ${JSON.stringify(p)}`);
});
test('R53 finish retains provenance and disposes its owned materials exactly once',async()=>{
 await contract();const {kit}=fixture();const own=kit.owned.filter(m=>m.name.startsWith('r53-yangxin')),counts=own.map(m=>{const q={n:0};m.addEventListener('dispose',()=>q.n++);return q;});
 assert.ok(own.length>0);const g=kit.finish();const a=g.userData.architecture.find(a=>a.catalogId==='place-west-six-17d883bce6');assert.equal(a.yangxinWestWarmRooms.stage,'SOURCE_BASED_BASIC_FORMS_PARTIAL_NOT_FULL_RESTORATION');kit.dispose(g);assert.ok(counts.every(q=>q.n===1));
});

test('R53 modeled kang, seats and desk have exact visible top support and never rescue feet upward',async()=>{
 await contract();const {f,kit,cm}=fixture(),supports=kit.walkables.filter(w=>w.sourceRole?.startsWith('r53-'));
 assert.equal(supports.length,10);const ray=new THREE.Raycaster();for(const w of supports){assert.equal(w.rescue,false);const m=f.getObjectByName(w.sourceRole),b=new THREE.Box3().setFromObject(m);assert.ok(w.box.max.distanceTo(b.max)<1e-6);assert.ok(Math.abs(w.box.min.x-b.min.x)<1e-6);assert.ok(Math.abs(w.box.min.z-b.min.z)<1e-6);assert.ok(Math.abs(w.box.min.y-b.max.y)<1e-6);for(const u of[.1,.5,.9])for(const v of[.1,.5,.9]){const x=THREE.MathUtils.lerp(b.min.x,b.max.x,u),z=THREE.MathUtils.lerp(b.min.z,b.max.z,v);ray.set(new THREE.Vector3(x,b.max.y+1,z),new THREE.Vector3(0,-1,0));const h=ray.intersectObject(m)[0];assert.ok(h);assert.ok(Math.abs(h.point.y-w.box.max.y)<1e-6);assert.ok(cm.getGroundHeight(x,z,b.max.y+.1,0)>=b.max.y-1e-6);}}
 const q=kit.walkables.find(w=>w.sourceRole==='r53-qinzheng-kang-seat');assert.equal(cm.getGroundHeight(q.box.getCenter(new THREE.Vector3()).x,q.box.getCenter(new THREE.Vector3()).z,item.ph,0),item.ph,'solid furniture must not act as an upward rescue');
});
