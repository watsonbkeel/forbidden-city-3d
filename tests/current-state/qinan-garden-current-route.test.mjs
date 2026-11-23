import {after,before,test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {GardenBuilder} from '../../src/scene/GardenBuilder.js';
import {Environment} from '../../src/scene/Environment.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {qinanGeometry} from '../../src/scene/palace/special/QinanProfile.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {PLAYER} from '../../src/config/constants.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {installCpuDocument} from '../lib/finished-world-lifecycle.mjs';
import {replayQinanExterior} from '../lib/qinan-exterior-walk.mjs';
import {replayKunning} from '../lib/kunning-walk.mjs';
import {zoneRoutes} from '../lib/auto-routes.mjs';
import {walkStraight} from '../lib/world.mjs';

// Supplemental current CPU Garden component only. The pre-existing source
// and fixed-generator case (#35) remains unchanged; no historic or city claim.
const repo=new URL('../../',import.meta.url);
const scope='GARDEN_ZONE_REAL_FINISH_AND_GARDEN_STATIC_GROUND_COMPONENTS_NOT_FULL_CITY_OR_GPU';
const autoName='[garden] 坤宁门→钦安殿地面外观→返回';
const oldName='御花园→钦安殿内→穿殿北出';
const json=p=>JSON.parse(fs.readFileSync(new URL(p,repo)));
const garden=json('data/zones/garden.json');
const qinan=garden.items.find(i=>i.qinanProfile==='qinan');
const profile=qinanGeometry(qinan);
const omission=profile.omittedFeatures.find(f=>f.id==='qinan-south-axial-composite').footprint;
const oldRecord=json('tests/fixtures/v7-qinan-route-baseline.json').fixed.find(r=>r.name===oldName);
const near=(a,b)=>Math.abs(a-b)<1e-7;
const mb=()=>Math.round(process.resourceUsage().maxRSS/1024);
const v=(x,y,z)=>new THREE.Vector3(x,y,z);
const containsXZ=(b,x,z)=>x>=b.min.x&&x<=b.max.x&&z>=b.min.z&&z<=b.max.z;
const registeredId=(w,s)=>w.type==='box'&&s.type==='box'&&w.box.equals(s.box);
const registration=(cm,raw,tag)=>cm.colliders.filter(c=>c.tag===tag).every(c=>raw.includes(c.mesh));
let autoRoute,W,lib,doc,zone,staticGarden,env,zoneData,scene;

before(()=>{
  doc=installCpuDocument(createCanvas);
  lib=realTextureLibrary();scene=new THREE.Scene();
  env=new Environment(scene,null,lib);env.setupGround();
  staticGarden=new GardenBuilder(scene,lib).build(PALACE_LAYOUT.find(i=>i.type==='garden'));
  zone=new ZoneBase(lib,garden);zoneData=zone.build();scene.add(zoneData.group);
  scene.updateMatrixWorld(true);
  const cm=new CollisionManager();
  // Real producer contributions and normal CollisionManager registration. Do
  // not override finish, substitute a fake lib.colors, or edit support/rescue.
  cm.addColliders(zoneData.colliders,'garden');cm.addWalkables(zoneData.walkables,'garden');
  const staticBoxes=staticGarden.getColliders(),staticSupports=staticGarden.getWalkables();
  cm.addColliders(staticBoxes,'garden-static');cm.addWalkables(staticSupports,'garden-static');
  cm.setRegions(zoneData.regions);
  assert.equal(zoneData.group.parent,scene);assert.equal(staticGarden.group.parent,scene);
  assert.ok(registration(cm,zoneData.colliders,'garden')&&registration(cm,staticBoxes,'garden-static'));
  assert.ok(cm.colliders.some(c=>c.tag==='garden')&&cm.colliders.some(c=>c.tag==='garden-static'));
  const actual=zoneData.mapItems.filter(m=>m.qinanProfile==='qinan');
  assert.equal(actual.length,1);
  assert.equal(actual[0].profileHash,profile.profileHash);
  assert.deepEqual(actual[0].navigation.position,profile.navigation.position);
  assert.ok(zoneData.rooms.some(r=>r.name==='钦安殿·主殿'));
  W={THREE,cm};
  console.log(JSON.stringify({scope,profileHash:profile.profileHash,
    counts:[zoneData.colliders.length,zoneData.walkables.length,staticBoxes.length,staticSupports.length],
    mb:mb()}));
});
after(()=>{
  try{W?.cm.clear();zoneData?.group.removeFromParent();zone?.dispose();staticGarden?.dispose();env?.dispose();lib?.dispose();}
  finally{doc?.restore();}
});

function currentAuto(){
  if(autoRoute)return autoRoute;
  const auto=zoneRoutes(W,garden).filter(r=>r.name===autoName);
  assert.equal(auto.length,1);autoRoute=auto[0];
  assert.equal(autoRoute.waypointDriver,'physical-crossing-v1','current R61 route must not use old flat threshold driver');
  return autoRoute;
}
function ownedKunningTreads(){
  // The formal route is the native side-tread entry; the two intact center
  // stones are ramps but cannot masquerade as a valid side-tread witness.
  const raw=zoneData.walkables.filter(w=>w.kunningGate===true&&w.type==='box');
  assert.ok(raw.some(w=>w.supportId==='kunning-platform'&&w.box.max.y===1.2));
  const kunningOwners=new Map();
  for(const source of raw) {
    const entries=W.cm.walkables.filter(w=>w.tag==='garden'&&registeredId(w,source));
    assert.equal(entries.length,1,'unique current Kunning support '+source.supportId);
    assert.equal(entries[0].rescue,false);
    kunningOwners.set(entries[0],source.supportId);
  }
  return kunningOwners;
}

function endRouteContract(r) {
  const [x,z]=[profile.navigation.position.x,profile.navigation.position.z],m=(r.pts.length-1)/2;
  assert.ok(Number.isInteger(m)&&m>1);
  assert.deepEqual(r.pts[m],[x,z]);
  assert.deepEqual(r.pts.slice(m+1),r.pts.slice(0,m).reverse());
  assert.ok(r.pts.every(([x,z])=>x>garden.bounds.x0+.5&&x<garden.bounds.x1-.5&&
    z>garden.bounds.z0+.5&&z<garden.bounds.z1-.5));
}
function hitsOmission(a,b){
  let lo=0,hi=1;
  for(const [i,min,max] of [[0,omission.minX-.5,omission.maxX+.5],[1,omission.minZ-.5,omission.maxZ+.5]]){
    const d=b[i]-a[i];
    if(Math.abs(d)<1e-12){if(a[i]<min||a[i]>max)return false;continue;}
    const x=(min-a[i])/d,y=(max-a[i])/d;
    lo=Math.max(lo,Math.min(x,y));hi=Math.min(hi,Math.max(x,y));
    if(lo>hi)return false;
  }
  return true;
}
function verifyObservedOmissionSafety(start,frames){
  const physical=[start,...frames.map(f=>[f.x,f.z])];
  assert.ok(physical.every(([x,z])=>Number.isFinite(x)&&Number.isFinite(z)));
  for(let i=1;i<physical.length;i++)
    assert.equal(hitsOmission(physical[i-1],physical[i]),false,'actual 1m body swept into omitted stonework at frame '+i);
}
function cleanGround(x,z) {
  return W.cm.getGroundHeight(x,z,0,PLAYER.STEP_UP,.5)===0 &&
    !W.cm.checkCollision(v(x,PLAYER.HEIGHT,z),.5);
}

test('Qin’an current automatic exterior descriptor retains the grounded viewpoint without the obsolete centerline',()=>{
  const autoRoute=currentAuto();
  endRouteContract(autoRoute);
  assert.ok(autoRoute.pts.some(([x,z])=>x===18&&z===429.7));
  assert.ok(autoRoute.pts.every((p,i)=>!i||!hitsOmission(autoRoute.pts[i-1],p)));
  assert.ok(hitsOmission([0,433.7],[0,477]),'exact south axial omitted feature really is crossed by retired route');
  assert.ok(hitsOmission([-3,477],[3,477]),'a clear pair of endpoints is not sufficient');
  const p=profile.navigation.position;assert.ok(cleanGround(p.x,p.z));
  assert.equal(profile.navigation.mode,'exterior-view');
  assert.equal(autoRoute.navigationMode,'exterior-view');
  assert.equal(autoRoute.replacesLegacyRoute,'[garden] 坤宁门→钦安殿→返回');
});

test('Qin’an current automatic round trip at 10Hz obtains real Kunning stairs and only ground at the exterior viewpoint',t=>{
  const autoRoute=currentAuto(),kunningOwners=ownedKunningTreads();
  assert.ok(cleanGround(...autoRoute.pts[0]));
  const r=replayKunning(t,W,autoRoute.pts,{fps:10,sprint:false,backward:false,startFeet:0,recordFrames:true});
  const pos=r.frames.filter(f=>f.ground>0),names=new Set();
  for(const f of pos)for(const [owner,id] of kunningOwners)if(containsXZ(owner.box,f.x,f.z)&&near(owner.box.max.y,f.ground))names.add(id);
  const unsupported=pos.filter(f=>![...kunningOwners].some(([owner])=>containsXZ(owner.box,f.x,f.z)&&near(owner.box.max.y,f.ground)));
  console.log(JSON.stringify({scope,type:'auto',arrived:r.arrived,stuckAt:r.stuckAt??null,end:r.end,maxFeet:r.maxFeet,
    supportWitnesses:[...names],unsupportedFrames:unsupported.slice(0,4),frames:r.frames.length,mb:mb()}));
  assert.equal(r.arrived,true);
  assert.equal(r.driver.crossings.length,autoRoute.pts.length-1);
  assert.ok(names.has('kunning-platform')&&[...names].some(n=>n.includes('tread')),'must exercise actual gate treads and deck');
  assert.deepEqual(unsupported,[],'no other structure/rescue may lift the walk');
  assert.ok(r.frames.filter(f=>f.z>=433.7).every(f=>f.ground===0&&f.feet===0));
  assert.equal(r.end[2],0);
  verifyObservedOmissionSafety(autoRoute.pts[0],r.frames);
});

test('Qin’an unmodified legacy south and north through-hall attempts hit the current physical boundary',t=>{
  assert.deepEqual(oldRecord.pts,[[0,433.7],[0,473.1],[0,492.1],[3.5,492.1],[3.5,499.1],[0,499.1],[0,509.1]]);
  const cases=[['south',oldRecord.pts[1],oldRecord.pts[2]],['north',[0,503],[0,495]]],result=[];
  for(const [side,start,target] of cases) {
    assert.ok(cleanGround(...start),side+' original origin must be clear and on real ground');
    const r=walkStraight(W,start,target,{feet0:0});
    assert.ok(r.reached>0&&r.reached<r.total-1,side+' must approach a real stop and not reach target');
    assert.equal(r.feet,0);
    const probeZ=r.end[1]+Math.sign(target[1]-start[1])*.7;
    const blockers=W.cm.colliders.filter(c=>c.tag==='garden'&&containsXZ(c.box,0,probeZ)&&
      c.box.min.y<PLAYER.HEIGHT&&c.box.max.y>0).map(c=>[c.box.min.toArray(),c.box.max.toArray()]);
    assert.ok(blockers.length>0,side+' stop must be bound to a registered Garden collider, not bad launch/timeout');
    const actual=replayQinanExterior(t,W,[start,target],{fps:10,recordFrames:true});
    assert.equal(actual.arrived,false);
    assert.ok(actual.frames.length>10,'not a no-op');
    assert.equal(actual.collisionFrames,0,'successful block must not penetrate');
    result.push({side,oldStart:start,oldTarget:target,...r,liveControllerEnd:actual.end,blockers});
  }
  console.log(JSON.stringify({scope,type:'obsolete-negative',result,mb:mb()}));
});
