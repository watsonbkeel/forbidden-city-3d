import {after,before,test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {Enclosure} from '../../src/scene/Enclosure.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {LAYOUT,PLAYER} from '../../src/config/constants.js';
import {wumenTowerGeometry} from '../../src/scene/palace/special/GateTowerProfiles.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {installCpuDocument} from '../lib/finished-world-lifecycle.mjs';
import {replayCuiyun} from '../r175-cuiyun-hall/replay.mjs';

// Finished production Wumen and enclosure only; no GPU or full-city actors.
const Z=LAYOUT.WUMEN_Z,Y=12.3,R=.5;
const scope='ACTUAL_FINISHED_WUMEN_AND_ENCLOSURE_STATIC_TOP_COMPONENT_NOT_FULL_CITY_NPC_OR_GPU';
const localRoutes={
  veranda:[[35,11.2],[35,-11.2],[-35,-11.2],[-35,11.2],[35,11.2]],
  openings:[[0,-11.2],[0,0],[0,11.2],[0,0],[0,-11.2]],
  southStrip:[[0,-12.3],[6.67,-12.3]],
};
const vec=(x,y,z)=>new T.Vector3(x,y,z);
const points=local=>local.map(([x,z])=>[x,z+Z]);
const near=(a,b,eps=1e-8)=>Math.abs(a-b)<=eps;
const receipt=(kind,d)=>console.log(JSON.stringify({kind,scope,...d,peakMiB:Math.round(process.resourceUsage().maxRSS/1024)}));
let cpu,scene,lib,gate,cm,builder,wall,rawCols,rawWalks,realSlabs;
before(()=>{
  cpu=installCpuDocument(createCanvas);
  lib=realTextureLibrary();scene=new T.Scene();builder=new PalaceBuilder(scene,lib);
  const layout=PALACE_LAYOUT.find(d=>d.name==='午门');
  assert.ok(layout);assert.deepEqual(layout.position,{x:0,y:0,z:Z});
  builder.buildAll([layout]);
  wall=new Enclosure(scene,lib).build();
  scene.updateMatrixWorld(true);
  gate=[...builder.ownedObjects].find(g=>g.name==='午门');
  assert.ok(gate?.userData.architecture?.some(a=>a.id==='FC-AD4377DF51'&&a.status==='R157_PRACTICAL_ENGINEERING_ASSEMBLY'));
  assert.equal(gate.parent,scene);assert.equal(wall.group.parent,scene);
  rawCols=builder.getColliders();rawWalks=builder.getWalkables();
  const wallCols=wall.getColliders();
  cm=new CollisionManager();
  cm.addColliders(rawCols,'palace:Wumen');
  cm.addWalkables(rawWalks,'palace:Wumen');
  cm.addColliders(wallCols,'enclosure:city');
  assert.equal(cm.colliders.length,rawCols.length+wallCols.length);
  assert.ok(cm.colliders.every((c,i)=>c.mesh===(i<rawCols.length?rawCols[i]:wallCols[i-rawCols.length])));
  assert.equal(cm.walkables.length,rawWalks.length);
  realSlabs=rawWalks.flatMap((w,i)=>w.wumenJointPlatformPart?.endsWith('/slab')&&
    w.type==='box'&&w.rescue===false&&w.box.max.y===Y?[{w,r:cm.walkables[i]}]:[]);
  assert.ok(realSlabs.length>10);
  assert.ok(realSlabs.every(({w,r})=>r.tag==='palace:Wumen'&&r.rescue===false&&r.box.equals(w.box)));
  assert.equal(cm.dynamicBodies.size,0);
  receipt('owners',{worldAnchor:Z,ownerNames:[gate.name,wall.group.name],colliders:[rawCols.length,wallCols.length],
    walkables:rawWalks.length,realNoRescueSlabs:realSlabs.length,dynamicBodies:cm.dynamicBodies.size,
    exactLocalInputs:localRoutes});
});
after(()=>{
  try{cm?.clear();builder?.dispose();wall?.dispose();lib?.dispose();}finally{cpu?.restore();}
});

function ownedSlab(x,z) {
  const p=vec(x,Y,z);
  return realSlabs.filter(({w,r})=>w.box.containsPoint(p)&&r.box.containsPoint(p)).map(({w})=>w.wumenJointPlatformPart);
}
function tapFloor([x,z]) {
  const floor=cm.getGroundHeight(x,z,Y,PLAYER.STEP_UP,R);
  const ray=new T.Raycaster(vec(x,Y+.1,z),vec(0,-1,0),0,.12);
  const rayHit=ray.intersectObject(gate,true)[0];
  return {x,z,floor,support:ownedSlab(x,z),drawnY:rayHit?.point.y??null,blocked:cm.checkCollision(vec(x,Y+PLAYER.HEIGHT,z),R)};
}
function contacts(x,z,feet=Y) {
  const eye=vec(x,feet+PLAYER.HEIGHT,z);
  const blocked=cm.checkCollision(eye,R);
  const matches=cm.queryBox(cm._overheadBodyBox).filter(c=>c.box.intersectsBox(
    c.overhead||c.triangleSupport||c.xiqingRoofSurface?cm._overheadBodyBox:cm.playerBox));
  return {x,z,feet,blocked,floor:cm.getGroundHeight(x,z,feet,PLAYER.STEP_UP,R),support:ownedSlab(x,z),
    owners:matches.map(c=>({tag:c.tag,id:c.mesh.wumenJointPlatformPart??c.furnitureMotionScope?.id??c.triangleSupport?.id??null,
      min:c.box.min.toArray(),max:c.box.max.toArray()}))};
}
function native(t,target,options) {
  const result=replayCuiyun(t,{THREE:T,cm},target,{startFeet:Y,recordFrames:true,...options});
  // Read the native registrations after the real controller finishes; do not
  // disable rescue or replace walkables even temporarily.
  const badFrame=result.allFrames.findIndex(f=>!ownedSlab(f.x,f.z).length||f.ground!==Y||f.feet!==Y||
    f.airborne||cm.checkCollision(vec(f.x,f.feet+PLAYER.HEIGHT,f.z),R));
  const {frames,allFrames,...summary}=result,last=allFrames.at(-1);
  return {summary,last,count:allFrames.length,badFrame,bad:badFrame>=0?allFrames[badFrame]:null,
    stop:!result.arrived?[contacts(last.x,last.z,last.feet),...(result.stuckAt?[
      contacts(last.x+.15*Math.sign(result.stuckAt[0]-last.x),last.z+.15*Math.sign(result.stuckAt[1]-last.z),last.feet),
    ]:[])]:[]};
}

const measuredModes=[
  {fps:10,sprint:false,backward:false},{fps:10,sprint:true,backward:true},
  {fps:60,sprint:false,backward:true},{fps:60,sprint:true,backward:false},
];
for(const [key,name] of [
  ['veranda','Current Wumen upper floor walk and sprint complete the original recessed verandas and four corners'],
  ['openings','Current Wumen upper north and south central openings are connected on real supported floor'],
]) test(name,t=>{
  const route=points(localRoutes[key]),baseline=route.map(tapFloor);
  assert.ok(baseline.every(f=>f.support.length&&f.floor===Y&&!f.blocked&&f.drawnY!==null&&near(f.drawnY,Y,.05)));
  for(const options of measuredModes){
    const r=native(t,route,options);
    receipt('unmodified-first-person-positive',{key,options,baseline,...r});
    assert.ok(r.summary.arrived,JSON.stringify(r.stop));
    assert.equal(r.summary.driver.crossings.length,route.length-1);
    assert.equal(r.badFrame,-1);
    assert.equal(r.last.speed,0);
    assert.equal(r.last.feet,Y);
  }
});

// Identify the actual released eave shaft and its finished visible wood.
// The old fixed 3m equality-bay assumption remains a separate diagnostic.
test('Current Wumen upper south strip stops before the actual first eave column',t=>{
  const [a,b]=points(localRoutes.southStrip),probeZ=a[1];
  const profile=wumenTowerGeometry();
  const first=profile.columns.filter(c=>c.kind==='outer-column'&&c.z<0&&c.x>0).sort((a,b)=>a.x-b.x)[0];
  assert.ok(first?.x>3&&first.x<6.67);
  // Float32 taper's lower envelope is about 2.94e-8m above the slab.
  const rows=cm.colliders.filter(c=>c.tag==='palace:Wumen'&&near(c.box.min.y,Y,1e-7)&&near(c.box.max.y,Y+3)&&
    near((c.box.min.x+c.box.max.x)/2,first.x)&&near((c.box.min.z+c.box.max.z)/2,Z+first.z));
  assert.equal(rows.length,1,'the actual first upper shaft must own exactly one contact');
  const column=rows[0];
  assert.ok(rawCols.includes(column.mesh));
  const hit=new T.Raycaster(vec(a[0],Y+.85,probeZ),vec(1,0,0),0,b[0]).intersectObject(gate,true)[0];
  assert.ok(hit&&column.box.containsPoint(hit.point),'the first physical shaft proxy must coincide with the actual finished visible obstruction');
  assert.equal(hit.object.parent,gate,'the witnessed wood comes from the finished Wumen material batch');
  assert.equal(hit.object.material,lib.material('wood_column'),'the registered shaft must enclose the actual column material hit');
  const r=native(t,[a,b],{fps:10,sprint:false,backward:false});
  const front=column.box.min.x-R;
  const clearBefore=contacts(front-.01,probeZ),blockedAfter=contacts(front+.01,probeZ);
  receipt('unmodified-first-person-negative',{a,b,shaft:column.box.min.toArray().concat(column.box.max.toArray()),first,
    actualVisibleHit:hit.point.toArray(),visibleMaterial:hit.object.material.name,physicalBodyLimit:front,clearBefore,blockedAfter,...r});
  assert.equal(r.summary.arrived,false);
  // Independent fixed local bound, in addition to the tighter current
  // body-to-actual-shaft bound. This is not the historical <3 predicate.
  assert.ok(r.last.x>0&&r.last.x<=3.8);
  assert.ok(r.last.x>=front-.5&&r.last.x<=front+1e-8);
  assert.equal(r.last.feet,Y);
  assert.equal(r.badFrame,-1);
  assert.equal(clearBefore.blocked,false,'unobstructed directly before the owned body edge');
  assert.equal(blockedAfter.blocked,true,'the shaft must block directly after its body edge');
  assert.ok(blockedAfter.owners.some(o=>o.tag===column.tag&&
    column.box.min.toArray().every((v,i)=>v===o.min[i])&&column.box.max.toArray().every((v,i)=>v===o.max[i])),
    'the contact immediately beyond the transition must include the same registered shaft');

});
