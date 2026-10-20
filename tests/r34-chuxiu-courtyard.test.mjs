import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import * as THREE from 'three';
import { CourtKit } from '../src/scene/palace/kit.js';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { CollisionManager } from '../src/utils/Collision.js';
const url=new URL('../src/scene/palace/special/ChuxiuCourtyard.js',import.meta.url);
const api=existsSync(url)?await import(url):{};
const west=JSON.parse(readFileSync(new URL('../data/zones/west-six.json',import.meta.url)));
const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});
globalThis.document??={createElement:()=>({getContext:()=>ctx,width:0,height:0})};
function library(){const mats=new Map();return{tileSize:()=>1,aspect:()=>1,material(n){if(!mats.has(n))mats.set(n,new THREE.MeshStandardMaterial({name:n}));return mats.get(n);}};}
function fixture(){
 assert.equal(typeof api.buildChuxiuCourtyard,'function');
 const z=new ZoneBase(library(),west);
 for(const gate of west.items.filter(i=>i.kind==='gate'))z.gateWidths.set(gate.name,z.buildGate(gate));
 for(const item of west.items){
  if(item.kind==='hall')z.buildHall(item);
  else if(item.kind==='wall')z.buildWall(item);
  else if(item.kind==='courtWalls')z.buildCourtWalls(item);
 }
 const baseline={children:[...z.kit.root.children],colliders:[...z.kit.colliders],walkables:[...z.kit.walkables],rooms:structuredClone(z.kit.rooms)};
 const built=api.buildChuxiuCourtyard(z.kit,west);z.kit.root.updateMatrixWorld(true);
 const cm=new CollisionManager();cm.rivers=[];cm.addColliders(z.kit.colliders);cm.addWalkables(z.kit.walkables);
 return{kit:z.kit,cm,baseline,...built};
}
function walk(cm,points){let p=new THREE.Vector3(points[0][0],cm.getGroundHeight(...points[0],0,.6)+1.7,points[0][1]);let maxDelta=0;for(const target of points.slice(1)){const d=new THREE.Vector3(target[0]-p.x,0,target[1]-p.z),n=Math.ceil(d.length()/.06),step=d.multiplyScalar(1/n);for(let k=0;k<n;k++){const old=p.y;p=cm.getValidPosition(p,p.clone().add(step),.5,p.y-1.7,.6);maxDelta=Math.max(maxDelta,Math.abs(p.y-old));assert.equal(cm.checkCollision(p,.5),false);}assert.ok(Math.hypot(p.x-target[0],p.z-target[1])<.1,`blocked en route to ${target}: ${p.toArray()}`);}return{p,maxDelta};}
test('dedicated courtyard profile is source labelled and preserves all original halls',()=>{const{g,kit}=fixture();assert.equal(g.id,'west-six/chuxiu-courtyard');assert.equal(g.dimensionStatus,'official-topology-model-fit');assert.equal(g.routes.loop.length,5);assert.equal(kit.rooms.filter(r=>r.name?.startsWith('储秀宫·')).length,5);assert.ok(g.sources.includes('https://www.dpm.org.cn/explore/building/236529.html'));});
test('real CollisionManager follows the entire return corridor both ways and crosses every doorway',()=>{const{g,cm}=fixture();for(const route of[g.routes.loop,...g.routes.entries])for(const r of[route,[...route].reverse()])walk(cm,r);});
test('corridor walkables meet the existing floors without uncovered height holes',()=>{const{g,cm}=fixture();for(const x of[g.eastX,g.westX])for(let z=g.southZ;z<=g.northZ;z+=.05){const y=cm.getGroundHeight(x,z,.6,.6);assert.ok(y>=.45-1e-6&&y<=.6+1e-6,`${x}, ${z}: ${y}`);}for(let x=g.eastX;x<=g.westX;x+=.05)assert.equal(cm.getGroundHeight(x,g.southZ,.45,.6),.45);assert.equal(cm.getGroundHeight(94.8,418,.0,.6),0,'court remains ground level');});
test('continuous covered geometry has no miter gaps or head-height blockers',()=>{const{g,f}=fixture();for(const route of[g.routes.loop])for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.2);for(let k=0;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,z=a[1]+(b[1]-a[1])*k/n;if(z>g.roofEndZ)continue;const ray=new THREE.Raycaster(new THREE.Vector3(x,2.3,z),new THREE.Vector3(0,1,0),0,8);assert.ok(ray.intersectObject(f,true).some(h=>h.object.userData.role==='chuxiu-corridor-roof'),`uncovered ${x}, ${z}`);}}});
test('bounded geometry merges, retains architecture metadata and releases all owned resources',()=>{const{kit,f,g}=fixture();let triangles=0,meshes=0;const materials=new Set(),geometries=new Set();f.traverse(o=>{if(!o.isMesh)return;meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;materials.add(o.material);geometries.add(o.geometry);for(const a of Object.values(o.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));});assert.ok(triangles<=4000,triangles);assert.ok(meshes<=240,meshes);assert.ok(materials.size<=8,materials.size);assert.deepEqual(g.budget,{triangles,meshes,materials:materials.size});const disposed=new Map();for(const geo of geometries){disposed.set(geo,0);geo.addEventListener('dispose',()=>disposed.set(geo,disposed.get(geo)+1));}const owned=new Map();for(const m of kit.owned){owned.set(m,0);m.addEventListener('dispose',()=>owned.set(m,owned.get(m)+1));}const group=kit.finish();assert.ok(group.userData.architecture.some(a=>a.id===g.id));for(const count of disposed.values())assert.equal(count,1);kit.dispose(group);for(const count of owned.values())assert.equal(count,1);assert.equal(kit.colliders.length,0);assert.equal(kit.walkables.length,0);});
test('profile rejects wrong zone or shifted envelope before mutation',()=>{for(const change of[{id:'east-six'},{courtyardProfile:'surveyed'},{items:west.items.map(i=>i.name==='储秀宫'?{...i,x:95}:i)}]){const kit=new CourtKit(library());assert.throws(()=>api.buildChuxiuCourtyard(kit,{...west,...change}),/Chuxiu courtyard/);assert.equal(kit.root.children.length,0);}});


test('adding courtyard leaves all existing frames, collision, walkables and rooms intact',()=>{
 const{kit,baseline,f}=fixture();
 assert.deepEqual(kit.root.children.slice(0,-1),baseline.children);
 assert.equal(kit.root.children.at(-1),f);
 assert.deepEqual(kit.colliders.slice(0,baseline.colliders.length),baseline.colliders);
 assert.deepEqual(kit.walkables.slice(0,baseline.walkables.length),baseline.walkables);
 assert.deepEqual(kit.rooms,baseline.rooms);
});
test('visible floors and contact heights agree along seams and gentle north transitions',()=>{
 const{kit,cm,g}=fixture();
 for(const x of[g.eastX,g.westX]){
  let prior=null;
  for(let z=408.7;z<=g.northZ;z+=.025){
   const contact=cm.getGroundHeight(x,z,.6,.6);
   const hits=new THREE.Raycaster(new THREE.Vector3(x,1.5,z),new THREE.Vector3(0,-1,0),0,2).intersectObject(kit.root,true);
   assert.ok(hits.length,`missing visible floor ${x}, ${z}`);
   assert.ok(Math.abs(hits[0].point.y-contact)<=.031,`floor/contact mismatch ${x}, ${z}: ${hits[0].point.y} != ${contact}`);
   if(prior!==null)assert.ok(Math.abs(contact-prior)<.011,`height pop ${x}, ${z}`);
   prior=contact;
  }
 }
});
test('no private material or texture is added; shared assets survive courtyard disposal',()=>{
 const lib=library(),kit=new CourtKit(lib);const before=kit.owned.length;
 const{f}=api.buildChuxiuCourtyard(kit,west);assert.equal(kit.owned.length,before);
 const events=new Map();f.traverse(o=>{if(o.isMesh&&!events.has(o.material)){events.set(o.material,0);o.material.addEventListener('dispose',()=>events.set(o.material,events.get(o.material)+1));}});
 kit.dispose(kit.finish());for(const n of events.values())assert.equal(n,0);
});

test('corner diagonals and shallow court approaches remain bidirectionally traversable',()=>{
 const{cm,g}=fixture();
 const routes=[[[g.eastX,411],[g.eastX,410.3],[84.1,g.southZ]],[[105.5,g.southZ],[g.westX,410.3],[g.westX,411]],[[g.eastX,427.8],[84,428.35],[85,428.35]],[[104.6,428.35],[g.westX,428.35],[g.westX,427.8]],[[83.2,423.1],[86,423.1]],[[106.4,423.1],[103.6,423.1]],[[94,409.55],[94,412]]];
 for(const route of routes)for(const r of[route,[...route].reverse()])assert.ok(walk(cm,r).maxDelta<.05,'approach or corner height pop');
});
test('visible new columns are solid while their walking lanes remain clear',()=>{
 const{f,cm}=fixture();f.traverse(o=>{if(o.userData.role!=='chuxiu-corridor-column')return;const p=o.getWorldPosition(new THREE.Vector3());p.y=.45+1.7;assert.equal(cm.checkCollision(p,.08),true,'visible column lacks collision');});
});

import { replayKunning } from './lib/kunning-walk.mjs';
for(const fps of[10,60])for(const sprint of[false,true])test(`production FirstPersonControls continuous Tihe–porches–hall–accessory tour at ${fps} FPS, sprint=${sprint}`,t=>{
 const{cm,g}=fixture();
 const points=[[94,399],[94,g.southZ],[g.westX,g.southZ],[g.westX,g.northZ],[94.8,g.northZ],[94.8,433.5],[94.8,g.northZ],[g.eastX,g.northZ],[g.eastX,423.1],[78.9,423.1],[g.eastX,423.1],[g.eastX,g.southZ],[94,g.southZ],[94,399]];
 const result=replayKunning(t,{THREE,cm},points,{startFeet:.45,fps,sprint,recordFrames:true});
 assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));
 assert.ok(result.minFeet>=-.001);assert.ok(result.maxFeet<=.61);
 assert.ok(result.frames.every(f=>Number.isFinite(f.feet)&&Number.isFinite(f.x)&&Number.isFinite(f.z)));
});
