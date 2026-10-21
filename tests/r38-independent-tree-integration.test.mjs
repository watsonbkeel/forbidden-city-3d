import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { FirstPersonControls } from '../src/controls/FirstPerson.js';
import { FlightEnvelope } from '../src/scene/flight/FlightEnvelope.js';
import { FLIGHT_RULES, LANDING_CHOICES } from '../src/scene/flight/FlightState.js';
import { TextureLibrary, TEXTURE_SPECS } from '../src/utils/TextureLibrary.js';
import { southTreeProfile } from '../src/scene/palace/special/SouthCourtTrees.js';
import { library } from './lib/inner-palace-fixture.mjs';
import { resourceBudget } from './lib/resource-budget.mjs';
import { replayTerrace, traceTerraceGround } from './lib/terrace-walk.mjs';

// Independent actual full-zone merge / controller / lifetime evidence only.
// DOM/canvas boundaries are simulated. No browser, GPU or phone acceptance.
const baseline={
 'outer-east':{meshes:30,triangles:36732,geometryBytes:3526272,materials:30,textures:2,nav:'0ded2ea0a668069c201b3b6aaba519109c33001d0dc6c30fe7d10fd082d00c7a'},
 'outer-west':{meshes:56,triangles:113282,geometryBytes:10875072,materials:56,textures:4,nav:'146f5ef26a7d337b68df3729c325e761d500bf5e47c8c5c7090ef3dd8a467b11'},
};
const config=id=>JSON.parse(readFileSync(new URL(`../data/zones/${id}.json`,import.meta.url)));
const treeMesh=o=>o.isMesh&&/^south_tree_/.test(o.material?.name??'');
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
function fixture(id,lib=library()){
 const builder=new ZoneBase(lib,config(id)),parts=[],original=builder.kit.finish;
 builder.kit.finish=function(){
  this.root.updateMatrixWorld(true);
  this.root.traverse(o=>{if(o.isMesh&&o.userData.role?.startsWith('south-tree-'))parts.push({role:o.userData.role,id:o.userData.treeId,geometry:o.geometry,box:new THREE.Box3().setFromObject(o),world:o.matrixWorld.clone(),disposeCount:watch(o.geometry)});});
  return original.call(this);
 };
 const data=builder.build(),cm=new CollisionManager();data.group.updateMatrixWorld(true);
 cm.addColliders(data.colliders,id);cm.addWalkables(data.walkables,id);
 return {THREE,builder,data,cm,parts,p:southTreeProfile(id)};
}
const cache=new Map();
function current(id){if(!cache.has(id))cache.set(id,fixture(id));return cache.get(id);}
function hits(root,origin,direction,length=100){return new THREE.Raycaster(new THREE.Vector3(...origin),new THREE.Vector3(...direction),0,length).intersectObject(root,true).filter(h=>treeMesh(h.object));}
function watch(o){let n=0;o.addEventListener('dispose',()=>n++);return()=>n;}

for(const id of Object.keys(baseline)){
 test(`R38 independent ${id}: only fixed photo-side trees and trunk colliders are added to baseline navigation`,()=>{
  const f=current(id),n=f.p.trees.length,b=baseline[id];
  assert.equal(n,id==='outer-east'?4:2);
  const navigation={colliders:f.data.colliders.slice(0,-n),walkables:f.data.walkables,rooms:f.data.rooms,mapItems:f.data.mapItems,regions:f.data.regions};
  assert.equal(digest(navigation),b.nav,'all previous navigation, room and public records are byte-equivalent to de4b5567 baseline');
  for(const t of f.p.trees){
   assert.ok(Math.abs(t.x-f.p.axisX)>10,'no central approach fill');assert.ok(t.z<-210&&t.z>-235);
   assert.equal(t.dimensionStatus,'REVERSIBLE_MODEL_FIT_NOT_SURVEYED');assert.equal(t.species,'UNKNOWN');
   assert.ok(f.p.sources.find(s=>s.id===t.source&&s.photographyDate===null));
  }
  for(const room of f.data.rooms)for(const spawn of room.spawns??[]){
   const body=new THREE.Box3(new THREE.Vector3(spawn.x-.45,.15,spawn.z-.45),new THREE.Vector3(spawn.x+.45,2.3,spawn.z+.45));
   assert.ok(f.data.colliders.slice(-n).every(c=>!c.intersectsBox(body)),room.name+' retained spawn has no tree intrusion');
  }
  assert.equal(config('axis-courts').southTreeProfile,undefined);
 });

 test(`R38 independent ${id}: real merged trunks match solids and crowns remain above pedestrian body`,()=>{
  const f=current(id),trunks=f.parts.filter(p=>p.role==='south-tree-trunk'),crowns=f.parts.filter(p=>p.role==='south-tree-crown');
  assert.equal(trunks.length,f.p.trees.length);
  for(const t of trunks)assert.ok(Math.abs(t.box.min.y)<1e-5,'actual trunk meets ground instead of hovering');assert.equal(crowns.length,trunks.length*10);
  for(const trunk of trunks){
   const box=trunk.box,solid=f.data.colliders.find(c=>c.equals(box));assert.ok(solid,trunk.id+' actual transformed trunk box, not a metadata-only test');
   const t=f.p.trees.find(t=>t.id===trunk.id);
   for(const y of [.2,1,1.7,2.5])for(const axis of ['x','z']){
    const origin=[t.x,y,t.z],dir=[0,0,0],index=axis==='x'?0:2;origin[index]+=2;dir[index]=-1;
    const h=hits(f.data.group,origin,dir,4).find(h=>h.object.material.name==='south_tree_bark');
    assert.ok(h,trunk.id+' trunk is visibly solid at '+y);
    assert.ok(solid.clone().expandByScalar(1e-5).containsPoint(h.point),'real merged trunk cannot extend beyond collision');
   }
   assert.equal(f.cm.checkCollision(new THREE.Vector3(t.x,1.7,t.z),.45),true);
   assert.equal(f.cm.getGroundHeight(t.x,t.z,0),0,'trunk is not a rescue platform');
  }
  for(const crown of crowns){
   assert.ok(crown.box.min.y>3,'no low uncollidable foliage');
   const center=crown.box.getCenter(new THREE.Vector3());
   assert.ok(hits(f.data.group,[center.x,crown.box.max.y+1,center.z],[0,-1,0],crown.box.max.y-crown.box.min.y+2).some(h=>h.object.material.name.startsWith('south_tree_foliage_')),'actual final canopy survives merge');
  }
  const materials=new Set();f.data.group.traverse(o=>{if(treeMesh(o)){materials.add(o.material);assert.equal(o.material.vertexColors,false);assert.equal(o.isInstancedMesh,undefined);}});
  assert.equal(materials.size,id==='outer-west'?5:4,'fixed silhouettes share bounded actual merged materials rather than one draw mesh per tree part');
 });

 test(`R38 independent ${id}: actual canopy enters flight clearance without adding a landing surface`,()=>{
  const f=current(id),env=new FlightEnvelope().addRoot(f.data.group);
  for(const part of f.parts.filter(p=>p.role==='south-tree-crown')){
   const p=part.box.getCenter(new THREE.Vector3()),h=hits(f.data.group,[p.x,30,p.z],[0,-1,0]).filter(h=>h.object.material.name.startsWith('south_tree_foliage_'));
   assert.ok(h.length);const top=Math.max(...h.map(h=>h.point.y));
   assert.ok(env.minimumY(p.x,p.z,0)>top,'flight samples cover actual crown surface');
   assert.equal(env.safeGround(p.x,p.z,FLIGHT_RULES.radius),false);
   const move=env.move({x:p.x,y:40,z:p.z},{x:p.x,y:0,z:p.z},FLIGHT_RULES.radius);
   assert.equal(move.blocked,true);assert.ok(move.position.y>top);
   assert.equal(f.cm.getGroundHeight(p.x,p.z,0),0,'canopy never becomes invisible walkable support');
  }
  // Tree-only actual geometry must not contaminate any declared landing disk.
  const root=new THREE.Group();f.data.group.traverse(o=>{if(treeMesh(o))root.add(o.clone());});
  const treeEnvelope=new FlightEnvelope().addRoot(root);
  for(const p of LANDING_CHOICES)assert.equal(treeEnvelope.safeGround(p.x,p.z,FLIGHT_RULES.radius),true,p.id);
 });

 for(const fps of [10,60])for(const sprint of [false,true])test(`R38 independent ${id}: tree-side ground loops remain traversable ${fps}Hz sprint=${sprint}`,t=>{
  const f=current(id);
  for(const tree of f.p.trees){
   const r=1.6,x=tree.x,z=tree.z,points=[[x-r,z-r],[x+r,z-r],[x+r,z+r],[x-r,z+r],[x-r,z-r]];
   const placed=t.mock.method(FirstPersonControls.prototype,'setPosition'),trace=traceTerraceGround(f.cm,{flights:[]});let result;
   try{result=replayTerrace(t,f,points,{fps,sprint,recordFrames:true});}finally{trace.restore();}
   assert.equal(placed.mock.callCount(),1);placed.mock.restore();
   assert.equal(result.arrived,true,JSON.stringify({tree:tree.id,end:result.end,stuckAt:result.stuckAt}));
   assert.equal(result.startFeet,0);assert.ok(result.frames.every(p=>p.feet===0&&p.ground===0));
   assert.ok(trace.samples.every(p=>!['rescue','unverified'].includes(p.source)));
  }
 });

 test(`R38 independent ${id}: three merged unloads release private trees exactly once and retain borrowed materials`,()=>{
  const lib=new TextureLibrary();for(const name of Object.keys(TEXTURE_SPECS))lib.colors.set(name,new THREE.Texture({width:64,height:64}));
  const shared=new Map(),retired=[],seen=new Set();let expected;
  const baselineConfig=config(id);delete baselineConfig.southTreeProfile;
  const baselineBuilder=new ZoneBase(lib,baselineConfig),baselineData=baselineBuilder.build(),realBaseline=resourceBudget([baselineData.group]);baselineBuilder.dispose();
  try{for(let cycle=0;cycle<3;cycle++){
   const f=fixture(id,lib),budget=resourceBudget([f.data.group]),base=realBaseline,treeResources=[],geometry=new Set();
   if(expected)assert.deepEqual(budget,expected);else expected=budget;
   assert.equal(budget.meshes-base.meshes,id==='outer-west'?5:4);assert.equal(budget.materials-base.materials,id==='outer-west'?5:4);assert.equal(budget.textures,base.textures);
   assert.equal(budget.triangles-base.triangles,f.p.trees.length*(id==='outer-west'?968:920));
   assert.equal(budget.geometryBytes-base.geometryBytes,f.p.trees.length*(id==='outer-west'?968:920)*3*32);
   assert.equal(budget.instanceBytes,0,'ordinary merge, no hidden instance buffers');
   f.data.group.traverse(o=>{if(o.geometry)geometry.add(o.geometry);if(treeMesh(o)){assert.ok(f.builder.kit.owned.includes(o.material));treeResources.push(o.material);}});
   assert.equal(new Set(treeResources).size,id==='outer-west'?5:4);
   for(const resource of treeResources){assert.ok(!seen.has(resource));seen.add(resource);retired.push(watch(resource));}
   for(const resource of geometry)retired.push(watch(resource));
   for(const part of f.parts){assert.equal(part.disposeCount(),1,'premerge tree geometry retired exactly once');retired.push(part.disposeCount);}
   for(const resource of [...lib.materials.values(),...lib.allTextures()])if(!shared.has(resource))shared.set(resource,watch(resource));
   f.builder.dispose();f.builder.dispose();assert.equal(f.builder.group,null);assert.equal(f.builder.kit.colliders.length,0);
   for(const count of retired)assert.equal(count(),1);
   for(const count of shared.values())assert.equal(count(),0);
  }}finally{lib.dispose();}
 });
}
