import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import * as THREE from 'three';
import {CourtKit} from '../src/scene/palace/kit.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
const scope=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/ningshou-scope.json',import.meta.url)));
const moduleURL=new URL('../src/scene/palace/special/RemainingNingshouHalls.js',import.meta.url);
const api=existsSync(moduleURL)?await import(moduleURL):{};
const first=['宁寿宫','遂初堂','寻沿书屋','庆寿堂','景福宫','禊赏亭','碧螺亭'];
const nodes=(f,role)=>{const a=[];f.traverse(m=>{if(m.userData.role===role)a.push(m);});return a;};
function make(name){assert.equal(typeof api.resolveRemainingProfile,'function');const row=scope.find(s=>s.name===name),item=structuredClone(row.baselineItem),p=api.resolveRemainingProfile('ningshou',item);assert.ok(p,name);const kit=new CourtKit(library(),'ningshou');const built=api.buildRemainingHall(kit,item,p);built.f.updateMatrixWorld(true);return{kit,...built,p,item};}
test('R48 NingShou first seven profiles guard exact identities and do not claim completed inventories',()=>{
 assert.equal(typeof api.resolveRemainingProfile,'function');
 for(const name of first){const s=scope.find(s=>s.name===name),p=api.resolveRemainingProfile('ningshou',s.baselineItem);assert.equal(p.id,s.id);assert.equal(p.mode,'replace');assert.equal(p.dimensionStatus,'MODEL_FIT_NOT_SURVEY');assert.equal(p.currentInventoryVerified,false);assert.equal(api.resolveRemainingProfile('west-six',s.baselineItem),null);assert.equal(api.resolveRemainingProfile('ningshou',{...s.baselineItem,x:s.baselineItem.x+1}),null);}
 for(const name of['古华轩','颐和轩'])assert.equal(api.resolveRemainingProfile('ningshou',{name,x:0,z:0}),null);
});
for(const name of first)test(`R48 ${name} creates finite fitted structure, one map identity and no generic furnishing preset`,()=>{
 const{kit,f,p}=make(name);assert.equal(f.userData.structure.id,p.id);assert.equal(kit.mapItems.filter(m=>m.name===name).length,1);assert.ok(nodes(f,'column').length>=5);assert.ok(nodes(f,'roof-surface').length);assert.ok(kit.rooms.length>=1);assert.ok(!JSON.stringify(f.userData.structure).includes('generic-placeholder'));
 f.traverse(m=>{if(!m.isMesh)return;for(const a of m.geometry.attributes.position.array)assert.ok(Number.isFinite(a));assert.ok(m.position.toArray().every(Number.isFinite));});
 for(const b of kit.colliders)assert.ok([...b.min.toArray(),...b.max.toArray()].every(Number.isFinite));
 const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);
 for(const r of kit.rooms)for(const q of[...r.doors,...r.spawns])assert.equal(cm.checkCollision(new THREE.Vector3(q.x,r.floorY+1.7,q.z),.5),false,`${name} ${JSON.stringify(q)}`);
 kit.dispose(f);
});
test('R48 NingShou has seven bays and an east secondary-bay entrance, never a recreated kang',()=>{
 const{f,p}=make('宁寿宫');assert.equal(p.bays,7);assert.ok(p.portals[0].x<0);assert.equal(p.portals[0].z,-p.localD/2+p.gallery);assert.equal(nodes(f,'removed-historical-kang').length,0);assert.equal(nodes(f,'straight-mullion').length>0,true);assert.equal(nodes(f,'round-longevity-ceiling').length>0,true);
});
test('R48 XiShang is east-facing, composite-roofed and contains a true shallow channel',()=>{const{f,p}=make('禊赏亭');assert.equal(p.rot,Math.PI/2);assert.ok(nodes(f,'stream-channel-bed').length>0);assert.ok(nodes(f,'rear-black-screen').length);assert.ok(nodes(f,'roof-surface').length>=4);});
test('R48 JingFu has three connected rolled roof volumes, not one generic xieshan',()=>{const{f,p}=make('景福宫');assert.equal(p.bays,5);assert.equal(p.depthBays,5);assert.equal(nodes(f,'rolled-roof-unit').length,3);});
test('R48 BiLuo is one occupied level with five columns, five petals and two colored eaves',()=>{const{f,p}=make('碧螺亭');assert.equal(p.storeys,1);assert.equal(p.eaveCount,2);assert.equal(nodes(f,'column').length,5);assert.equal(nodes(f,'plum-platform-petal').length,5);assert.equal(nodes(f,'roof-surface').length,2);});

test('R48 XiShang channel is recessed into segmented paving, not painted over an opaque slab',()=>{const{f,p}=make('禊赏亭');const bed=nodes(f,'stream-channel-bed')[0];f.updateMatrixWorld(true);const origin=bed.getWorldPosition(new THREE.Vector3());origin.y+=.6;const hits=new THREE.Raycaster(origin,new THREE.Vector3(0,-1,0),0,1).intersectObject(f,true);assert.ok(hits.length);assert.equal(hits[0].object.userData.role,'stream-channel-bed');assert.ok(nodes(f,'channel-stone-field').length>1);});
test('R48 all registered first-batch portals are on supported ground floors with no rescue teleport',()=>{for(const name of first){const{kit,f,p}=make(name),cm=new CollisionManager();cm.rivers=[];cm.addWalkables(kit.walkables);for(const pt of p.portals){const q=new THREE.Vector3(pt.x,p.ph,pt.z).applyMatrix4(f.matrixWorld);assert.ok(Math.abs(cm.getGroundHeight(q.x,q.z,p.ph,.1)-p.ph)<.04,name);}
 assert.equal(kit.walkables.some(w=>w.rescue===true),false);kit.dispose(f);}});

test('R48 first seven actual controller routes enter and leave their real portals at 60 Hz',async t=>{
 const{replayTerrace,traceTerraceGround}=await import('./lib/terrace-walk.mjs');
 for(const name of first){const{kit,f,p,item}=make(name),cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);const approach=p.portals[0].approachPoints.map(q=>[q.x,q.z]),spawn=new THREE.Vector3(p.navigation.spawn.x,0,p.navigation.spawn.z).applyMatrix4(f.matrixWorld),points=[...approach,[spawn.x,spawn.z],...approach.slice().reverse()];const trace=traceTerraceGround(cm,{flights:[]});try{const r=replayTerrace(t,{cm,THREE},points,{fps:60,recordFrames:true});assert.equal(r.arrived,true,name+' '+JSON.stringify({...r,frames:undefined}));assert.equal(trace.samples.some(s=>s.source==='rescue'),false,name);assert.ok(r.frames.every(fr=>Number.isFinite(fr.feet)),name);}finally{trace.restore();kit.dispose(f);}}
});

test('R48 preserves unverified legacy furnishings unless a sourced plan or pavilion use conflicts',()=>{
 for(const name of['遂初堂','寻沿书屋','庆寿堂']){const{f,kit}=make(name);assert.equal(nodes(f,'legacy-unverified-cabinet').length,2);assert.equal(nodes(f,'legacy-unverified-bench').length,2);assert.equal(nodes(f,'legacy-unverified-table').length,0);kit.dispose(f);}
 const{f,kit}=make('景福宫');assert.equal(nodes(f,'legacy-unverified-table').length,1);assert.equal(nodes(f,'legacy-unverified-chair').length,2);assert.equal(nodes(f,'legacy-unverified-cabinet').length,2);assert.equal(nodes(f,'legacy-unverified-bench').length,2);kit.dispose(f);
 for(const name of['宁寿宫','禊赏亭','碧螺亭']){const{f,kit}=make(name);let legacy=0;f.traverse(o=>{if(o.userData?.inventoryStatus==='LEGACY_UNVERIFIED')legacy++;});assert.equal(legacy,0);kit.dispose(f);}
});
test('R48 own surfaces are finite nondegenerate triangles and survive merge/resource disposal',()=>{
 for(const name of first){const{kit,f,p}=make(name);f.traverse(m=>{if(!m.isMesh||!m.userData.identity)return;const a=m.geometry.attributes.position,i=m.geometry.index,v0=new THREE.Vector3(),v1=new THREE.Vector3(),v2=new THREE.Vector3();for(let j=0;j<(i?i.count:a.count);j+=3){v0.fromBufferAttribute(a,i?i.getX(j):j);v1.fromBufferAttribute(a,i?i.getX(j+1):j+1).sub(v0);v2.fromBufferAttribute(a,i?i.getX(j+2):j+2).sub(v0);assert.ok(v1.cross(v2).lengthSq()>1e-16,`${name}/${m.userData.role} degenerate face ${j/3}`);}});
 const owned=[...kit.owned],disposals=new Map();for(const m of owned)m.addEventListener('dispose',()=>disposals.set(m,(disposals.get(m)??0)+1));const merged=kit.finish();assert.equal(merged.userData.architecture.filter(s=>s.id===p.id).length,1);merged.traverse(m=>{if(m.isMesh){assert.ok(m.material);assert.ok(m.geometry.attributes.position.array.every(Number.isFinite));}});kit.dispose(merged);assert.equal(kit.colliders.length,0);assert.equal(kit.walkables.length,0);for(const m of owned)assert.equal(disposals.get(m),1);}
});

test('R48 every published approach path is reversibly traversable by the real controller',async t=>{
 const{replayTerrace}=await import('./lib/terrace-walk.mjs');for(const name of first){const{kit,f,p}=make(name),cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);for(const q of p.portals){const approach=q.approachPoints.map(q=>[q.x,q.z]),points=[...approach,...approach.slice(0,-1).reverse()];const r=replayTerrace(t,{cm,THREE},points,{fps:60,recordFrames:true});assert.equal(r.arrived,true,name+' '+JSON.stringify({...r,frames:undefined}));}kit.dispose(f);}
});

test('R48 approachPoints feetY equals actual support even at low-platform edge endpoints',()=>{for(const name of first){const{kit,f,p}=make(name),cm=new CollisionManager();cm.rivers=[];cm.addWalkables(kit.walkables);for(const q of p.portals.flatMap(q=>q.approachPoints)){const support=cm.getGroundHeight(q.x,q.z,Infinity);assert.ok(Math.abs(support-q.feetY)<.03,`${name} ${JSON.stringify(q)} supported at ${support}`);}kit.dispose(f);}});
