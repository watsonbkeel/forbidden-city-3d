import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PalaceBuilder } from '../../src/scene/PalaceBuilder.js';
import { PALACE_LAYOUT } from '../../src/scene/Layout.js';
import { CollisionManager } from '../../src/utils/Collision.js';
import { PLAYER } from '../../src/config/constants.js';
import { KUNNING_PROFILE as profile } from '../../src/scene/palace/special/KunningProfile.js';

const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});
globalThis.document??={createElement:()=>({getContext:()=>ctx,width:0,height:0})};
const origin=profile.frameExpectation;
let cached;
function fixture(){
  if(cached)return cached;
  const mats=new Map(),library={material:n=>mats.get(n)??(mats.set(n,new THREE.MeshStandardMaterial({name:n})),mats.get(n)),tileSize:()=>1,aspect:()=>1};
  const scene=new THREE.Scene(),builder=new PalaceBuilder(scene,library);
  builder.buildPalaces(PALACE_LAYOUT.filter(h=>['乾清宫','交泰殿','坤宁宫'].includes(h.name)));
  scene.updateMatrixWorld(true);
  const cm=new CollisionManager();cm.addColliders(builder.colliders);cm.addWalkables(builder.walkables);
  return cached={cm,builder,scene};
}
const world = id => {const [x,y,z]=profile.navigation.points[id];return new THREE.Vector3(origin.x+x,origin.floorY+y+PLAYER.HEIGHT,origin.z+z);};

/** Fixed physical speed and complete segments: no per-frame steering attenuation. */
function drive(points,fps,speed){
 const {cm}=fixture();let p=points[0].clone();
 assert.ok(Math.abs(cm.getGroundHeight(p.x,p.z,p.y-PLAYER.HEIGHT)-(p.y-PLAYER.HEIGHT))<1e-6,'start on actual lower support, not highest rescue');
 assert.equal(cm.checkCollision(p,.5),false,'start body-clear');
 for(const goal of points.slice(1)){
  const initial=Math.hypot(goal.x-p.x,goal.z-p.z);
  const dx=(goal.x-p.x)/initial,dz=(goal.z-p.z)/initial;
  for(let i=0;i<Math.ceil(initial/(speed/fps))+3;i++){
   const remaining=Math.hypot(goal.x-p.x,goal.z-p.z);if(remaining<1e-7)break;
   const step=Math.min(speed/fps,remaining),before=p.clone();
   const target=new THREE.Vector3(p.x+dx*step,p.y,p.z+dz*step);
   p=cm.getValidPosition(p,target,.5,p.y-PLAYER.HEIGHT);
   const moved=Math.hypot(p.x-before.x,p.z-before.z);
   assert.ok(Math.abs(p.y-before.y)<=moved*.65+.101,`no rescue/pop at ${p.x},${p.z}: ${p.y-before.y}`);
   assert.ok(p.y-PLAYER.HEIGHT>=5-1e-6 && p.y-PLAYER.HEIGHT<=origin.floorY+.100001,'never fall below the retained terrace or jump');
   assert.equal(cm.checkCollision(p,.5),false,'moving body must not intersect a barrier');
  }
  assert.ok(Math.hypot(p.x-goal.x,p.z-goal.z)<1e-5,`actual segment blocked before (${goal.x},${goal.z}), at (${p.x},${p.z})`);
  assert.ok(Math.abs(p.y-goal.y)<1e-6,`waypoint has expected support ${p.y},${goal.y}`);
 }
 return p;
}

for(const fps of [60,10])for(const speed of [PLAYER.MOVE_SPEED,PLAYER.SPRINT_SPEED]){
 test(`real lower-stair approach crosses the south door and exits in reverse, ${fps}fps speed${speed}`,()=>{
  const entry=profile.navigation.routes.entry.map(world);
  const last=drive(entry,fps,speed);
  assert.ok(last.z>origin.z+profile.depthPlanes.southEnclosure+.5,'actual doorway-plane crossing');
  drive([...entry].reverse(),fps,speed);
 });
 for(const side of ['east','west'])test(`real ${side} end passage reaches retained rear stair in both directions, ${fps}fps speed${speed}`,()=>{
   const route=profile.navigation.routes[`${side}Bypass`].map(world);
   const last=drive(route,fps,speed);
   assert.ok(last.z>origin.z+10,'actually reaches north side');
   drive([...route].reverse(),fps,speed);
 });
}

for(const [id,x,z]of[['south-center',0,-7.5],['north-center',0,7.5],['legacy-rear-x4.7',4.7,7.5]]){
 for(const direction of [-1,1])test(`${id} legacy path stays blocked at its actual enclosure, direction${direction}`,()=>{
  const {cm}=fixture();
  const before=new THREE.Vector3(x,origin.floorY+PLAYER.HEIGHT,origin.z+z-direction*1.2);
  const goal=new THREE.Vector3(x,before.y,origin.z+z+direction*1.2);
  const result=cm.getValidPosition(before,goal,.5,origin.floorY);
  assert.ok(direction*(result.z-(origin.z+z))<-.49,'must stop on expected wall side');
  assert.ok(Math.abs(result.z-(origin.z+z))<1.1,'block is the intended enclosure, not a remote prop/post');
  const ray=new THREE.Raycaster(before,new THREE.Vector3(0,0,direction),0,2.4);
  // Eye-level bars may leave a visual slit, so verify sill/north wall at body level.
  ray.ray.origin.y=origin.floorY+.8;
  const hit=ray.intersectObject(fixture().scene,true)[0];
  assert.ok(hit && Math.abs(hit.point.z-(origin.z+z))<.3,'actual wall/sill triangle supports barrier');
 });
}
