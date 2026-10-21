import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import * as THREE from 'three';
import { CourtKit } from '../src/scene/palace/kit.js';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { createPalaceFlightEnvelope } from '../src/scene/flight/FlightEnvelope.js';

const url = new URL('../src/scene/palace/special/YanxiStorehouses.js', import.meta.url);
const api = existsSync(url) ? await import(url) : {};
const original = [
  { kind:'hall', x:-148.2,z:341.6,w:24,d:9.6,pad:.6,ph:.45,colH:6.08,roof:'xieshan',map:'hall',source:'estimated' },
  { kind:'hall', x:-164.68,z:313.7,rot:'west',w:11.2,d:7.04,pad:.5,ph:.45,colH:5.44,roof:'gable',brackets:false,map:'hall',source:'estimated' },
  { kind:'hall', x:-131.72,z:313.7,rot:'east',w:11.2,d:7.04,pad:.5,ph:.45,colH:5.44,roof:'gable',brackets:false,map:'hall',source:'estimated' },
];
const profiles = ['north','east','west'];
const itemFor = i => ({...original[i],structure:'yanxi-storehouse',storehouseProfile:profiles[i]});
const data = JSON.parse(readFileSync(new URL('../data/zones/east-six.json',import.meta.url)));
const near = (a,b,label='') => assert.ok(Math.abs(a-b)<1e-5,`${label}: ${a} != ${b}`);
const nodes = (root,role) => { const out=[]; root.traverse(o=>{if(o.userData.role===role)out.push(o);});return out; };
function library(){ const materials=new Map(); return {materials,tileSize:()=>1,aspect:()=>1,material(n){if(!materials.has(n))materials.set(n,new THREE.MeshStandardMaterial({name:n}));return materials.get(n);}}; }
function fixture(i=0){assert.equal(typeof api.buildYanxiStorehouse,'function','dedicated storehouse builder must exist');const lib=library(),kit=new CourtKit(lib),built=api.buildYanxiStorehouse(kit,itemFor(i));kit.root.updateMatrixWorld(true);return {...built,lib,kit};}
function baseline(i=0){const kit=new CourtKit(library());kit.hall({...original[i],rot:i===1?-Math.PI/2:i===2?Math.PI/2:0});kit.root.updateMatrixWorld(true);return kit;}
function metrics(root){const materials=new Set();let tris=0,meshes=0;root.traverse(m=>{if(m.isMesh){meshes++;tris+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;materials.add(m.material);}});return {tris,meshes,materials:materials.size};}
function rayLocal(f,p,d,far=2){f.updateMatrixWorld(true);const pos=new THREE.Vector3(...p).applyMatrix4(f.matrixWorld),dir=new THREE.Vector3(...d).transformDirection(f.matrixWorld);return new THREE.Raycaster(pos,dir,0,far).intersectObject(f,true);}
const boxArray = b => [...b.min.toArray(),...b.max.toArray()];

test('exactly the three retained Yanxi auxiliary anchors select an explicit 1931 type',()=>{
  assert.equal(typeof api.buildYanxiStorehouse,'function');
  const rows=data.items.filter(i=>i.structure==='yanxi-storehouse');assert.equal(rows.length,3);
  for(let i=0;i<3;i++){assert.deepEqual(rows[i],itemFor(i));const{g,f}=fixture(i);assert.equal(g.storeys,2);assert.equal(g.planStatus,'inherited-short-wings-not-closed');assert.equal(f.userData.structure.id,`east-six/yanxi-storehouse-${profiles[i]}`);}
});

test('unsupported profile, position, roof, dimension, rotation and access overrides fail before mutation',()=>{
  assert.equal(typeof api.buildYanxiStorehouse,'function');
  for(const change of [{structure:'hall'},{storehouseProfile:'south'},{x:-148},{z:NaN},{w:26},{d:10},{rot:'east'},{roof:'wudian'},{colH:8},{enter:false},{throne:true},{interior:'palace-front'},{storeys:3}]){
    const kit=new CourtKit(library());assert.throws(()=>api.buildYanxiStorehouse(kit,{...itemFor(0),...change}),/Yanxi|storehouse|profile|retained|override/i);assert.equal(kit.root.children.length,0);assert.equal(kit.colliders.length,0);
  }
});

test('all original world-space COL, walkable supports, room bounds and full visible envelopes are retained',()=>{
  for(let i=0;i<3;i++){
    const{kit,f}=fixture(i),old=baseline(i);
    assert.deepEqual(kit.colliders.map(boxArray),old.colliders.map(boxArray));assert.deepEqual(kit.walkables,old.walkables);assert.deepEqual(kit.rooms,old.rooms);
    const a=new THREE.Box3().setFromObject(f),b=new THREE.Box3().setFromObject(old.root);boxArray(a).forEach((v,k)=>near(v,boxArray(b)[k],`${profiles[i]} envelope ${k}`));
    const cm=new CollisionManager(),legacy=new CollisionManager();cm.addColliders(kit.colliders);legacy.addColliders(old.colliders);
    for(let x=-original[i].w/2-1;x<=original[i].w/2+1;x+=.5)for(let z=-original[i].d/2-1;z<=original[i].d/2+1;z+=.5){const p=new THREE.Vector3(x,2.15,z).applyMatrix4(f.matrixWorld);assert.equal(cm.checkCollision(p,.5),legacy.checkCollision(p,.5));}
  }
});

test('real courtyard facades have two window rows and masonry while old timber screens and exterior columns are gone',()=>{
  for(let i=0;i<3;i++){
    const{f,g}=fixture(i),windows=nodes(f,'yanxi-storehouse-window');
    assert.equal(windows.filter(w=>w.userData.storey===1).length,g.bays-1);assert.equal(windows.filter(w=>w.userData.storey===2).length,g.bays);
    assert.equal(new Set(windows.map(w=>w.position.y)).size,2);
    assert.ok(nodes(f,'yanxi-storehouse-wall').length>=5);assert.ok(nodes(f,'yanxi-storehouse-upper-bar').length>0);assert.equal(nodes(f,'yanxi-storehouse-lower-panel').length,g.bays-1);
    for(const m of f.children.filter(n=>n.isMesh))assert.ok(!['wood_column','lattice_doors','caihua_beam'].includes(m.material.name),`generic exterior ${m.material.name}`);
    assert.equal(nodes(f,'yanxi-storehouse-retained-roof').length,1);assert.equal(f.userData.structure.currentConditionAccepted,false);
  }
});

test('retained central door is a real through-opening and window/frame/wall surfaces survive material merge',()=>{
  for(let i=0;i<3;i++){
    const{f,g,kit}=fixture(i),front=-g.d/2;
    for(const x of [-.65,0,.65])for(const y of [1.1,2.1,2.8])assert.equal(rayLocal(f,[x,y,front-.9],[0,0,1],1.5).length,0,`${profiles[i]} doorway ${x}/${y}`);
    const w=nodes(f,'yanxi-storehouse-window').find(o=>o.userData.storey===2);
    assert.ok(rayLocal(f,[w.position.x,w.position.y,front-.9],[0,0,1],1.5).length);
    assert.ok(rayLocal(f,[g.w/2-1,g.ph+.4,front-.9],[0,0,1],1.5).some(h=>h.object.userData.role==='yanxi-storehouse-wall'));
    const position=new THREE.Vector3(w.position.x,w.position.y,front-.9).applyMatrix4(f.matrixWorld),direction=new THREE.Vector3(0,0,1).transformDirection(f.matrixWorld);
    const merged=kit.finish();merged.updateMatrixWorld(true);const hits=new THREE.Raycaster(position,direction,0,1.5).intersectObject(merged,true);
    assert.equal(hits[0]?.object.material.name,'yanxi_storehouse_iron','the visible iron bar, not its backing wall, survives merge');assert.equal(merged.userData.architecture.length,1);
  }
});

test('existing unloaded-zone flight extraction includes every new visible triangle without special exceptions',()=>{
  const zone=new ZoneBase(library(),{id:'yanxi-test',items:[0,1,2].map(itemFor)}),built=zone.build();
  const empty=new THREE.Group(),grid=createPalaceFlightEnvelope({palaceBuilder:{ownedObjects:[]},enclosure:{group:empty},garden:{group:empty},zoneManager:{zones:new Map([['yanxi-test',{}]]),loaded:new Map(),prebuilt:new Map([['yanxi-test',{data:built}]])},layout:[]});
  assert.equal(grid.triangles,metrics(built.group).tris);
  for(const i of original){assert.ok(grid.minimumY(i.x,i.z,0)>i.ph+i.colH);assert.equal(grid.isSafe({x:i.x,y:i.ph+i.colH,z:i.z},0),false);}
  zone.dispose();
});

test('actual geometry is finite, stays within 6100 triangles and a 1200 increment, and adds at most three shared materials',()=>{
  assert.equal(typeof api.buildYanxiStorehouse,'function');const kit=new CourtKit(library()),old=new CourtKit(library());
  for(let i=0;i<3;i++){api.buildYanxiStorehouse(kit,itemFor(i));old.hall({...original[i],rot:i===1?-Math.PI/2:i===2?Math.PI/2:0});}
  kit.root.traverse(m=>{if(m.isMesh)for(const a of Object.values(m.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));});
  const after=metrics(kit.root),before=metrics(old.root);assert.ok(after.tris<=6100,`${after.tris} total triangles`);assert.ok(after.tris-before.tris<=1200,`${after.tris-before.tris} triangle increase`);assert.ok(after.materials-before.materials<=3);assert.equal(kit.colliders.length,old.colliders.length);
  const merged=kit.finish();assert.ok(merged.children.length<=before.materials+3);assert.equal(merged.userData.architecture.length,3);
});

test('removed facades, surviving geometry and owned materials are disposed exactly once',()=>{
  const lib=library(),kit=new CourtKit(lib),counts=new Map();const watch=r=>{if(!counts.has(r)){counts.set(r,0);r.addEventListener('dispose',()=>counts.set(r,counts.get(r)+1));}};
  const realHall=kit.hall;let legacy=[];
  kit.hall=function(o){const result=realHall.call(this,o);result.f.traverse(m=>{if(m.geometry)watch(m.geometry);});legacy=[...counts.keys()];return result;};
  api.buildYanxiStorehouse(kit,itemFor(0));const retained=new Set();kit.root.traverse(m=>{if(m.geometry){retained.add(m.geometry);watch(m.geometry);}});
  const removed=legacy.filter(g=>!retained.has(g));assert.ok(removed.length>0);removed.forEach(g=>assert.equal(counts.get(g),1,'removed facade released before merge'));
  const source=[...counts.keys()],owned=[...kit.owned];owned.forEach(watch);const shared=[...lib.materials.values()];shared.forEach(watch);
  const merged=kit.finish();source.forEach(g=>assert.equal(counts.get(g),1));const dest=[];merged.traverse(m=>{if(m.geometry){dest.push(m.geometry);watch(m.geometry);}});kit.dispose(merged);[...dest,...owned].forEach(g=>assert.equal(counts.get(g),1));removed.forEach(g=>assert.equal(counts.get(g),1));shared.forEach(m=>assert.equal(counts.get(m),0));
});

test('new red masonry preserves the shared library four-metre texture scale',()=>{
  const lib=library();lib.tileSize=n=>n==='wall_red'?4:1;const kit=new CourtKit(lib),{f}=api.buildYanxiStorehouse(kit,itemFor(0));
  for(const wall of nodes(f,'yanxi-storehouse-wall')){
    const p=wall.geometry.attributes.position,n=wall.geometry.attributes.normal,uv=wall.geometry.attributes.uv,ys=[],vs=[];
    for(let i=0;i<p.count;i++)if(n.getZ(i)<-.99){ys.push(p.getY(i));vs.push(uv.getY(i));}
    near(Math.max(...vs)-Math.min(...vs),(Math.max(...ys)-Math.min(...ys))/4,'wall_red UV scale');
  }
});
