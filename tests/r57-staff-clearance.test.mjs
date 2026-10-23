import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_REGISTRY } from '../data/characters/index.js';
const IDS = ['yangxing-eunuch-01','yangxing-eunuch-02','leshou-maid-01','leshou-eunuch-01','jingfu-eunuch-01','chonghua-maid-01','chonghua-eunuch-01'];
test('R57 bounded QA requires the actual seven configured candidates, not hypothetical readiness', () => {
  assert.equal(CHARACTER_REGISTRY.actors.length,108,'Actual final registry must contain108 actors');
  assert.deepEqual(CHARACTER_REGISTRY.actors.filter(a=>IDS.includes(a.id)).map(a=>a.id),IDS);
  assert.equal(CHARACTER_REGISTRY.actors.filter(a=>IDS.includes(a.id)&&a.placement.mode==='path').length,3);
});

import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {Environment} from '../src/scene/Environment.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {CharacterWorldAdapter} from '../src/scene/characters/CharacterWorldAdapter.js';
import {R57_STAFF_IDS,R57_SITES,evaluateR57StaffClearance,evaluateR57PhysicalClearance,visibleTriangleSweep} from './lib/r57-staff-clearance.mjs';
const OUT='reports/r57-unified/local-clearance';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const sourceHashes=()=>Object.fromEntries(['data/characters/actors.json','data/characters/anchors.json','data/characters/surfaces.json','data/characters/paths.json','data/zones/ningshou.json','data/zones/west-six.json','src/scene/Environment.js','src/scene/zones/ZoneBase.js','src/scene/characters/CharacterWorldAdapter.js'].map(p=>[p,hash(fs.readFileSync(p))]));
const write=(name,r)=>{fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(`${OUT}/${name}.json`,JSON.stringify(r,null,2)+'\n');};
function fragment(site,{ground=true}={}){
 const {createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas'),priorDocument=globalThis.document;
 globalThis.document={createElement:type=>type==='canvas'?createCanvas(1,1):{},createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
 const source=JSON.parse(fs.readFileSync(`data/zones/${site.zoneRef}.json`));
 const selected=new Set(source.items.filter(i=>site.includes.includes(i.name)));
 if(site.key==='jingfu')for(const item of source.items)if(item.kind==='wall'&&((item.from[0]===-354&&item.to[0]===-354)||(item.from[1]===520&&item.to[1]===520)))selected.add(item);
 if(site.key==='chonghua')for(const item of source.items)if(item.kind==='courtWalls'&&item.x0===92.62&&item.x1===145.18&&item.z0===460&&item.z1===505.6)selected.add(item);
 // Exact source walls retain their exact source gate gaps. Include the actual
 // referenced gate builders, never fabricate gap widths or an enclosure.
 for(const item of [...selected])for(const gap of item.gaps??item.gates??[])if(gap.gate){const gate=source.items.find(i=>i.kind==='gate'&&i.name===gap.gate);assert.ok(gate);selected.add(gate);}
 // Whole-zone Yikun/Chuxiu augmenters require their own distant source halls.
 // They are outside this named-neighbor fragment and are NOT reconstructed here.
 const items=source.items.filter(i=>selected.has(i)),json={id:source.id,name:source.name,bounds:source.bounds,neighbors:source.neighbors,items};
 for(const name of site.includes)assert.ok(items.some(i=>i.name===name),'Exact neighbor '+name);
 const scene=new THREE.Scene(),cm=new CollisionManager(),materials=new Map();
 const library={material(name,options={}){const key=name+JSON.stringify(options);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({name,...options}));return materials.get(key);},tileSize:()=>1,aspect:()=>1,color:()=>null,normal:()=>null,owns:m=>[...materials.values()].includes(m)};
 const environment=new Environment(scene,null,library);if(ground)environment.setupGround();
 const builder=new ZoneBase(library,json),data=builder.build();scene.add(data.group);cm.addColliders(data.colliders,site.zoneRef);cm.addWalkables(data.walkables,site.zoneRef);
 const zoneManager={zones:new Map([[source.id,source]]),loaded:new Map([[source.id,{data}]])};scene.updateMatrixWorld(true);
 const adapter=new CharacterWorldAdapter({scene,collisionManager:cm,zoneManager,registry:CHARACTER_REGISTRY,zones:[source]});
 const W={scene,cm,zoneManager};
 const actors=site.actors.map(a=>CHARACTER_REGISTRY.actors.find(v=>v.id===a.id));assert.ok(actors.every(Boolean));
 const resolve=()=>actors.map(actor=>({actor,binding:adapter.resolve(actor),revision:adapter.getRevision(actor)}));
 const evidence={site:site.key,boundary:'Isolated actual production ZoneBase neighbor fragment and Environment.setupGround; not a full world or release-readiness proof',sourceItems:items,colliders:data.colliders.length,walkables:data.walkables.length,meshCount:0,triangles:0};
 scene.traverse(o=>{if(o.isMesh){evidence.meshCount++;evidence.triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});
 return{W,adapter,actors,resolve,evidence,environment,check:(entries)=>evaluateR57PhysicalClearance(W,{adapter,resolvedBindings:entries,actorIds:actors.map(a=>a.id)}),dispose(){adapter.dispose();builder.dispose();environment.dispose();for(const m of materials.values())m.dispose();if(priorDocument===undefined)delete globalThis.document;else globalThis.document=priorDocument;}};
}

test('actual four neighbor fragments prove seven exact planned footprints and all three full route sweeps',()=>{
 const report={createdAt:new Date().toISOString(),sourceHashes:sourceHashes(),boundary:'Bounded local fragments only; all108/world/lifecycle/animation/browser acceptance remains separate',success:false,sites:[]};
 try{for(const site of R57_SITES){const f=fragment(site);try{const bindings=f.resolve();for(const b of bindings)assert.equal(b.binding.status,'ready',b.actor.id+' '+JSON.stringify(b.binding));const result=f.check(bindings);report.sites.push({...f.evidence,result});assert.equal(result.pass,true,site.key+' '+JSON.stringify(result.errors)+' '+JSON.stringify(result.actors.filter(a=>!a.pass)));
  assert.equal(result.actors.reduce((n,a)=>n+a.supportSamples.length,0),site.actors.some(a=>a.local.length===2)?16:1);
  for(const a of result.actors){assert.equal(a.supportSamples.flatMap(s=>s.ring).length,a.supportSamples.length*17);assert.ok(a.sweeps.every(s=>s.triangles.pass));}
 }finally{f.dispose();}}report.success=true;}finally{write('actual-fragments',report);}
});

test('absent real Environment ground is rejected; plan metadata never creates support',()=>{
 const f=fragment(R57_SITES[0],{ground:false});try{const entries=f.resolve();assert.ok(entries.every(e=>e.binding.status!=='ready'));const result=f.check(entries);assert.equal(result.pass,false);assert.match(result.errors.join(' '),/ready actor/);write('negative-missing-ground',{success:true,bindings:entries.map(e=>({id:e.actor.id,binding:e.binding})),check:result});}finally{f.dispose();}
});

test('actual visible triangle obstruction without a collider fails a continuous route sweep',()=>{
 const f=fragment(R57_SITES[0]);try{
  const entries=f.resolve();assert.equal(f.check(entries).pass,true);
  // A 2mm-thick visible wall placed BETWEEN the quarter-meter support samples.
  // Collider list is deliberately unchanged, so only real triangles can catch it.
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(1.5,2,.002),new THREE.MeshBasicMaterial({name:'negative-visible-only-wall'}));mesh.position.set(-281.8,1,366.425);f.W.scene.add(mesh);f.adapter.invalidate();
  const fresh=f.resolve();assert.ok(fresh.every(e=>e.binding.status==='ready'),'Adapter collider-only readiness must not impersonate triangle-clearance proof');
  const result=f.check(fresh),route=result.actors.find(a=>a.id==='yangxing-eunuch-02');assert.equal(result.pass,false);assert.equal(route.sweeps[0].collider,null);assert.equal(route.sweeps[0].triangles.pass,false);assert.ok(route.sweeps[0].triangles.hits.some(h=>h.material==='negative-visible-only-wall'));
  write('negative-visible-triangles',{success:true,result});mesh.removeFromParent();mesh.geometry.dispose();mesh.material.dispose();
 }finally{f.dispose();}
});

test('replaced loaded group rejects cached support generation before refresh, and genuinely fresh binding restores it',()=>{
 const f=fragment(R57_SITES[3]);try{const entries=f.resolve();assert.equal(f.check(entries).pass,true);const original=f.W.zoneManager.loaded.get('west-six').data.group,next=new THREE.Group();next.add(...original.children);f.W.scene.add(next);original.removeFromParent();f.W.zoneManager.loaded.set('west-six',{data:{group:next}});
  const stale=f.check(entries);assert.equal(stale.pass,false);assert.match(stale.errors.join(' '),/generation/);const fresh=f.resolve(),restored=f.check(fresh);assert.equal(restored.pass,true);write('negative-support-generation',{success:true,stale,restored});next.removeFromParent();
 }finally{f.dispose();}
});

test('triangle narrow phase does not reject empty space merely inside a merged mesh bounding box',()=>{
 const scene=new THREE.Scene(),geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([-5,0,-5,-5,2,-5,-4,1,-5,4,0,5,5,2,5,5,0,5],3));const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial());scene.add(mesh);
 try{const r=visibleTriangleSweep(scene,[0,0,0],[0,0,0]);assert.equal(r.meshesNarrowTested,1);assert.equal(r.trianglesTested,2);assert.equal(r.pass,true);mesh.visible=false;assert.equal(visibleTriangleSweep(scene,[-5,0,-5],[-5,0,-5]).pass,true);}finally{geometry.dispose();mesh.material.dispose();}
});

// A pure surface-intersection test could miss a body wholly inside a large solid.
// This guards the actual visible-volume case independently of authored colliders.
test('visible closed solid enclosing the whole body is not mistaken for empty space',()=>{
 const scene=new THREE.Scene(),mesh=new THREE.Mesh(new THREE.BoxGeometry(10,10,10),new THREE.MeshBasicMaterial({name:'negative-enclosing-solid'}));mesh.position.y=1;scene.add(mesh);
 try{const r=visibleTriangleSweep(scene,[0,0,0],[0,0,1]);assert.equal(r.pass,false,'Whole body is inside a rendered closed solid, even though no surface crosses its small box');assert.ok(r.hits.some(h=>h.kind==='inside-visible-solid'));}finally{mesh.geometry.dispose();mesh.material.dispose();}
});

test('visible instance transforms are checked instead of ignoring or rejecting all instanced architecture',()=>{
 const scene=new THREE.Scene(),mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,2,1),new THREE.MeshBasicMaterial(),2),m=new THREE.Matrix4();mesh.setMatrixAt(0,m.makeTranslation(30,1,30));mesh.setMatrixAt(1,m.makeTranslation(0,1,0));scene.add(mesh);
 try{assert.equal(visibleTriangleSweep(scene,[10,0,10],[11,0,10]).pass,true);const hit=visibleTriangleSweep(scene,[0,0,0],[0,0,0]);assert.equal(hit.pass,false);assert.ok(hit.hits.some(h=>h.instanceIndex===1));mesh.count=1;assert.equal(visibleTriangleSweep(scene,[0,0,0],[0,0,0]).pass,true);}finally{mesh.geometry.dispose();mesh.material.dispose();mesh.dispose();}
});

function pairFixture({crossing=false}={}){
 const zoneRef='unit-zone',registry={actors:CHARACTER_REGISTRY.actors.map((a,i)=>({id:a.id,required:true,templateId:'eunuch-daily',zoneRef,placement:{mode:'surface',anchorRef:'origin',surfaceRef:'floor',offsetMeters:[i*10,0,20],forwardLocal:[0,0,1]},behavior:{basePose:'standing'}})),anchors:[{id:'origin',resolver:'world',zoneRef,positionMeters:[10000,0,10000]}],surfaces:[{id:'floor',anchorRef:'origin',zoneRef,kind:'ground',localBoundsMeters:[-100,1200,-100,100],expectedHeightMeters:0,heightToleranceMeters:.001}],paths:[],seats:[]};
 if(crossing)for(const [id,points]of[[IDS[0],[[-5,0,0],[5,0,0]]],[registry.actors[0].id,[[0,0,-5],[0,0,5]]]]){const a=registry.actors.find(a=>a.id===id),p={id:id+'-test-route',zoneRef,anchorRef:'origin',surfaceRef:'floor',pointsLocalMeters:points,radiusMeters:.5,safetyMarginMeters:.15,validationSpacingMeters:.25,turningRadiusMeters:.7,formationSize:1};registry.paths.push(p);a.placement={mode:'path',pathRef:p.id,surfaceRef:'floor'};}
 const scene=new THREE.Scene(),group=new THREE.Group(),mesh=new THREE.Mesh(new THREE.PlaneGeometry(1500,300),new THREE.MeshBasicMaterial());mesh.rotation.x=-Math.PI/2;mesh.position.set(10550,0,10000);group.add(mesh);scene.add(group);const zoneManager={loaded:new Map([[zoneRef,{data:{group}}]])},adapter=new CharacterWorldAdapter({scene,registry,zoneManager,collisionManager:{colliders:[],walkables:[]}});
 const resolvedBindings=registry.actors.map(actor=>{const binding=adapter.resolve(actor);assert.equal(binding.status,'ready');return{actor,binding,revision:adapter.getRevision(actor)};});return{registry,adapter,resolvedBindings,dispose(){adapter.dispose();mesh.geometry.dispose();mesh.material.dispose();}};
}

test('R57 pure analytic helper checks all728 new-involved pairs without mutating existing bindings',()=>{
 const f=pairFixture();try{const before=JSON.stringify({stats:f.adapter.stats,bindings:f.resolvedBindings});const r=evaluateR57StaffClearance(f);assert.equal(r.pass,true,JSON.stringify(r));assert.equal(r.actorsChecked,108);assert.equal(r.pairsChecked,728);assert.equal(r.minimumSeparationMeters,1.3);assert.deepEqual(r.staffActorIds,R57_STAFF_IDS);assert.equal(JSON.stringify({stats:f.adapter.stats,bindings:f.resolvedBindings}),before);}finally{f.dispose();}
});

test('R57 pair helper rejects crossings, missing108th actor, and stale route/zone generations',()=>{
 const f=pairFixture({crossing:true});try{const crossing=evaluateR57StaffClearance(f);assert.equal(crossing.pass,false);assert.equal(crossing.minimumPair.distanceMeters,0);assert.equal(crossing.pairsChecked,728);
  const absent=evaluateR57StaffClearance({...f,resolvedBindings:f.resolvedBindings.slice(1)});assert.equal(absent.pass,false);assert.equal(absent.pairsChecked,0);
  f.adapter.zoneManager.loaded.set('unit-zone',{data:{group:new THREE.Group()}});const stale=evaluateR57StaffClearance(f);assert.equal(stale.pass,false);assert.match(stale.errors.join(' '),/generation/);assert.equal(stale.pairsChecked,0);write('negative-separation',{success:true,crossing,absent,stale});
 }finally{f.dispose();}
});
