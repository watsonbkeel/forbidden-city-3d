import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import * as THREE from 'three';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { CourtKit } from '../src/scene/palace/kit.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { replayKunning } from './lib/kunning-walk.mjs';
const url=new URL('../src/scene/palace/special/YikunSideAccess.js',import.meta.url),api=existsSync(url)?await import(url):{};
const west=JSON.parse(readFileSync(new URL('../data/zones/west-six.json',import.meta.url)));
const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});globalThis.document??={createElement:()=>({getContext:()=>ctx,width:0,height:0})};
function library(){const m=new Map();return{tileSize:()=>1,aspect:()=>1,material(n){if(!m.has(n))m.set(n,new THREE.MeshStandardMaterial({name:n}));return m.get(n);}};}
function fixture(json=west){const zone=new ZoneBase(library(),json),built=zone.build(),cm=new CollisionManager();cm.rivers=[];cm.addColliders(built.colliders);cm.addWalkables(built.walkables);return{zone,built,cm,THREE};}
const chain=x=>[[94.6,362],[94.6,370],[x<94?84:104,370],[x<94?84:104,374.05],[x,374.05],[x,392.5],[94,392.5],[94,399],[94,409.55],[106.4,409.55],[106.4,428.35],[94.8,428.35],[94.8,433.5],[94.8,428.35],[83.2,428.35],[83.2,409.55],[94,409.55],[94,399],[94,392.5],[x,392.5],[x,374.05],[x<94?84:104,374.05],[x<94?84:104,370],[94.6,370],[94.6,362]];
for(const x of[78.8,109.2])for(const fps of[10,60])test(`actual controller reaches Chuxiu and returns through ${x} alley at ${fps} FPS`,t=>{const w=fixture(),r=replayKunning(t,w,chain(x),{startFeet:0,fps,sprint:true});assert.equal(r.arrived,true,JSON.stringify(r));assert.ok(r.maxFeet<=.61);assert.ok(r.minFeet>=-.001);w.zone.dispose();});
test('source evidence and fitted coordinates are explicitly distinct, dimensions remain fixed',()=>{assert.equal(typeof api.buildYikunSideAccess,'function');const g=api.yikunSideAccessGeometry(west);assert.equal(g.positionStatus,'estimated-coordinate-correction');for(const x of[77.52,110.48]){const i=west.items.find(i=>i.kind==='hall'&&i.x===x&&i.z===367.3);assert.ok(i);assert.equal(i.positionFit.previousZ,371.3);assert.equal(i.source,'estimated');assert.deepEqual([i.w,i.d,i.pad,i.ph,i.colH,i.roof],[11.2,7.04,.5,.45,5.44,'gable']);assert.equal(i.name,undefined);}assert.ok(g.limitations.some(s=>s.includes('Tihe')));});
test('pre-fix envelopes reproduce the inherited disconnection, not a newly invented test route',t=>{const old=structuredClone(west);delete old.yikunAccessProfile;for(const i of old.items)if(i.positionFit?.profile==='yikun-side-access-fit-v1'){i.z=i.positionFit.previousZ;delete i.positionFit;}const w=fixture(old),r=replayKunning(t,w,chain(78.8),{startFeet:0,fps:60});assert.equal(r.arrived,false);w.zone.dispose();});
test('paving is visible, uses shared material and has matching floor contact, without new blocking solids',()=>{const kit=new CourtKit(library()),owned=kit.owned.length,{f,g}=api.buildYikunSideAccess(kit,west);assert.equal(kit.owned.length,owned);assert.equal(kit.colliders.length,0);assert.equal(kit.walkables.length,5);f.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addWalkables(kit.walkables);for(const[x,z]of[[78.8,374.05],[78.8,385],[109.2,374.05],[109.2,385],[94,392.5]]){assert.equal(cm.getGroundHeight(x,z,0,.6),g.pavingY);const h=new THREE.Raycaster(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0),0,2).intersectObject(f,true);assert.ok(h.length);assert.ok(Math.abs(h[0].point.y-g.pavingY)<1e-6);}assert.equal(g.budget.triangles,60);assert.equal(g.budget.materials,1);kit.dispose(kit.finish());});
test('profile validates all fitted placements before adding geometry',()=>{for(const change of[{id:'east-six'},{yikunAccessProfile:'surveyed'},{items:west.items.map(i=>i.x===77.52&&i.kind==='hall'?{...i,z:371.3}:i)}]){const kit=new CourtKit(library());assert.throws(()=>api.buildYikunSideAccess(kit,{...west,...change}),/Yikun side access/);assert.equal(kit.root.children.length,0);}});

test('the fit only translates the two wing buildings; vertices, doors, furniture and collider shapes are identical',()=>{
 for(const i of west.items.filter(i=>i.positionFit?.profile==='yikun-side-access-fit-v1')){
  const a=new ZoneBase(library(),west),b=new ZoneBase(library(),west);a.buildHall({...i,z:i.positionFit.previousZ});b.buildHall(i);
  const fa=a.kit.root.children[0],fb=b.kit.root.children[0];assert.equal(fa.position.z-fb.position.z,4);
  const sig=f=>{const out=[];f.traverse(o=>{if(o.isMesh)out.push({p:o.position.toArray(),r:o.rotation.toArray(),s:o.scale.toArray(),mat:o.material?.name,v:[...o.geometry.attributes.position.array],index:o.geometry.index?[...o.geometry.index.array]:null});});return out;};assert.deepEqual(sig(fa),sig(fb));
  assert.equal(a.kit.colliders.length,b.kit.colliders.length);a.kit.colliders.forEach((box,k)=>assert.deepEqual(box.clone().translate(new THREE.Vector3(0,0,-4)),b.kit.colliders[k]));
 }
});
test('shifted wing roofs remain clear of the southern gate envelope',()=>{
 const zone=new ZoneBase(library(),west),roofs=[];
 for(const i of west.items.filter(i=>i.positionFit?.profile==='yikun-side-access-fit-v1')){
  zone.buildHall(i);const f=zone.kit.root.children.at(-1),roof=new THREE.Box3();f.updateMatrixWorld(true);f.traverse(o=>{if(o.isMesh&&['roof_tile','kit_ridge'].includes(o.material?.name))roof.union(new THREE.Box3().setFromObject(o));});assert.ok(roof.min.z>361.1);assert.ok(roof.max.z<373.5);roofs.push(roof);
 }
 zone.buildGate(west.items.find(i=>i.name==='翊坤门'));const gate=new THREE.Box3().setFromObject(zone.kit.root.children.at(-1));for(const roof of roofs)assert.equal(roof.intersectsBox(gate),false);
});
test('normal avatar has real corner clearance while untouched hall walls continue to block',()=>{
 const{cm,zone}=fixture();
 for(const z of[373.85,374.05,374.25])for(const x of[80.45,107.55])assert.equal(cm.checkCollision(new THREE.Vector3(x,1.712,z),.5),false);
 for(const[x,z]of[[80.45,382.5],[107.55,382.5],[94,389.4]])assert.equal(cm.checkCollision(new THREE.Vector3(x,2.3,z),.5),true,'do not carve a fictitious main-hall escape');
 zone.dispose();
});
