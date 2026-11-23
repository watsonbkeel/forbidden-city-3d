import {after,before,test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import * as T from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {GardenBuilder} from '../../src/scene/GardenBuilder.js';
import {Enclosure} from '../../src/scene/Enclosure.js';
import {Environment} from '../../src/scene/Environment.js';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {PLAYER} from '../../src/config/constants.js';
import {INNER_PALACE_LEVELS} from '../../src/scene/palace/special/InnerPalaceLevels.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {installCpuDocument} from '../lib/finished-world-lifecycle.mjs';
import {walkStraight} from '../lib/world.mjs';
import {replayCuiyun} from '../r175-cuiyun-hall/replay.mjs';

const root=new URL('../../',import.meta.url);
// Finished, locally intersecting static owners only. This probes the game's
// real controller separately from the retained legacy full-world assertions.
const scope='QIANQING_JOINED_STATIC_LOCAL_OWNERS_NOT_FULL_CITY_DYNAMIC_NPCS_OR_GPU';
const snapshot=[[0,195],[-7.46,195],[-7.46,227.3],[0,227.3],[0,310.8]];
const radius=.5,rss=()=>Math.round(process.resourceUsage().maxRSS/1024);
const read=n=>JSON.parse(fs.readFileSync(new URL('data/zones/'+n,root)));
const near=(a,b)=>Math.abs(a-b)<1e-5;
const zones=[],sources=new Map();
let cpu,scene,lib,env,cm,palace,gardenStatic,enclosure,gate,shared,gateInfo,ground;
const report=(kind,x)=>console.log(JSON.stringify({scope,kind,...x,rss:rss()}));
const subpoint=(a,b,t)=>[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])];

function register(tag,cols,walks=[]) {
  const beforeC=cm.colliders.length,beforeW=cm.walkables.length;
  cm.addColliders(cols,tag);cm.addWalkables(walks,tag);
  const all=cm.colliders.slice(beforeC),supports=cm.walkables.slice(beforeW);
  assert.equal(all.length,cols.length);
  assert.equal(supports.length,walks.length);
  assert.ok(all.every((o,i)=>o.mesh===cols[i]&&o.tag===tag));
  assert.ok(supports.every((o,i)=>o.tag===tag&&o.type===walks[i].type&&
    (o.type!=='box'||o.box.equals(walks[i].box))));
  supports.forEach((row,i)=>sources.set(row,{tag,index:i,raw:walks[i]}));
  return {cols:all.length,supports:supports.length};
}
function ownedSupport(x,z,y) {
  return cm.walkables.flatMap(row=>{
    if(row.type==='box') {
      const {min,max}=row.box;if(x<min.x||x>max.x||z<min.z||z>max.z||!near(max.y,y))return [];
    } else {
      if(x<row.minX||x>row.maxX||z<row.minZ||z>row.maxZ)return [];
      const a=row.axis==='x'?x:z,cross=row.axis==='x'?z:x;
      const t=row.a0===row.a1?1:Math.max(0,Math.min(1,(a-row.a0)/(row.a1-row.a0)));
      if(row.crossMin0!==undefined&&(cross<row.crossMin0+t*(row.crossMin1-row.crossMin0)||cross>row.crossMax0+t*(row.crossMax1-row.crossMax0)))return [];
      if(!near(y,row.y0+(row.y1-row.y0)*t))return [];
    }
    const owner=sources.get(row);
    return [{tag:owner.tag,index:owner.index,type:row.type}];
  });
}
function classify({x,z,feet}) {
  const floor=cm.getGroundHeight(x,z,feet,PLAYER.STEP_UP,radius);
  const rawEye=new T.Vector3(x,feet+PLAYER.HEIGHT,z);
  const floorEye=new T.Vector3(x,floor+PLAYER.HEIGHT,z);
  const blockedOnFloor=cm.checkCollision(floorEye,radius);
  const candidates=cm.queryBox(cm._overheadBodyBox).filter(c=>c.box.intersectsBox(
    c.xiqingRoofSurface||c.overhead||c.triangleSupport?cm._overheadBodyBox:cm.playerBox));
  return {x,z,feet,floor,blockedAtFeet:cm.checkCollision(rawEye,radius),blockedOnFloor,
    actors:cm.dynamicBodies.size,owner:ownedSupport(x,z,floor),
    broadPhaseSolidCandidates:candidates.slice(0,12).map(c=>({tag:c.tag,min:c.box.min.toArray(),max:c.box.max.toArray(),
      id:c.furnitureMotionScope?.id??c.xiqingRoofSurface?.id??c.triangleSupport?.id??null}))};
}
function floorEvidence(x,z,startY=0) {
  const y=cm.getGroundHeight(x,z,startY,PLAYER.STEP_UP,radius);
  return {pos:[x,z],y,source:ownedSupport(x,z,y),blocked:cm.checkCollision(new T.Vector3(x,y+PLAYER.HEIGHT,z),radius)};
}
function groundHit(x,z) {
  const ray=new T.Raycaster(new T.Vector3(x,.02,z),new T.Vector3(0,-1,0));
  const hit=ray.intersectObject(ground,false).find(x=>near(x.point.y,0));
  return hit?.point.y??null;
}
before(()=>{
  cpu=installCpuDocument(createCanvas);
  scene=new T.Scene();lib=realTextureLibrary();cm=new CollisionManager();
  env=new Environment(scene,null,lib);
  env.setupGround();ground=scene.children.find(n=>n.isMesh&&n.userData.environmentGroundSource===true)??null;
  assert.ok(ground,'normally finished environment ground mesh');
  const defs=fs.readdirSync(new URL('data/zones/',root)).filter(n=>n.endsWith('.json')).sort().map(read);
  const localDefs=defs.filter(({bounds:b})=>b.x0<=.5&&b.x1>=-7.96&&b.z0<=311.3&&b.z1>=194.5);
  assert.deepEqual(localDefs.map(z=>z.id),['axis-courts','garden']);
  const layoutNames=['乾清门','乾清宫','交泰殿','坤宁宫'];
  const layout=PALACE_LAYOUT.filter(x=>layoutNames.includes(x.name));
  assert.deepEqual(layout.map(x=>x.name).sort(),layoutNames.sort());
  palace=new PalaceBuilder(scene,lib);
  palace.buildAll(layout.filter(d=>d.name==='乾清门'));
  const gateCols=palace.getColliders().length,gateWalks=palace.getWalkables().length;
  palace.buildAll(layout.filter(d=>d.name!=='乾清门'));
  const palaceRoots=[...palace.ownedObjects];
  [gate,shared]=palaceRoots;
  assert.deepEqual(palaceRoots.map(g=>g.name),['乾清门','后三宫']);
  gateInfo=gate.userData.qianqingGate;
  assert.ok(near(gateInfo.stairs[0].x,snapshot[1][0]));
  assert.ok(gateInfo.connector.endZ>297&&gateInfo.connector.endZ<301.6);
  assert.equal(gateInfo.connector.height,1.5);
  gardenStatic=new GardenBuilder(scene,lib).build(PALACE_LAYOUT.find(p=>p.type==='garden'));
  enclosure=new Enclosure(scene,lib).build();
  const totals={};
  for(const definition of localDefs){
    const builder=new ZoneBase(lib,definition);
    const data=builder.build();scene.add(data.group);zones.push({builder,data});
    totals[definition.id]=register(definition.id,data.colliders,data.walkables);
  }
  totals.qianqingGate=register('qianqing-gate',palace.getColliders().slice(0,gateCols),palace.getWalkables().slice(0,gateWalks));
  totals.commonThree=register('common-three-halls',palace.getColliders().slice(gateCols),palace.getWalkables().slice(gateWalks));
  totals.enclosure=register('enclosure',enclosure.getColliders());
  totals.gardenStatic=register('garden-static',gardenStatic.getColliders(),gardenStatic.getWalkables());
  cm.setRegions(zones.flatMap(({data})=>data.regions));
  scene.updateMatrixWorld(true);
  assert.ok([...palaceRoots,enclosure.group,gardenStatic.group,...zones.map(z=>z.data.group)].every(g=>g.parent===scene));
  assert.equal(cm.dynamicBodies.size,0);
  const physicalGroundY=groundHit(...snapshot[0]);
  assert.ok(physicalGroundY!==null&&Math.abs(physicalGroundY)<1e-9,'only analytic Plane rotation roundoff is accepted');
  report('owners',{totals,stairs:gateInfo.stairs.map(p=>({x:p.x,z:p.z,run:p.run})),
    connector:gateInfo.connector,start:floorEvidence(...snapshot[0]),player:{height:PLAYER.HEIGHT,stepUp:PLAYER.STEP_UP,radius},
    exactHistoricalPoints:snapshot});
});
after(()=>{
  try {cm?.clear();for(const z of zones){z.data.group.removeFromParent();z.builder.dispose();}
    gardenStatic?.dispose();enclosure?.dispose();palace?.dispose();env?.dispose();lib?.dispose();}
  finally{cpu?.restore();}
});

function runMode(t,points,options) {
  const ret=replayCuiyun(t,{THREE:T,cm},points,{fps:10,recordFrames:true,...options});
  const middle=ret.allFrames.flatMap((q,i)=>q.z>=297&&q.z<=301.6&&Math.abs(q.x)<1?[{i,x:q.x,z:q.z,feet:q.feet,ground:q.ground,airborne:q.airborne,source:ownedSupport(q.x,q.z,q.ground)}]:[]);
  const last=ret.allFrames.at(-1);
  const lastMoving=ret.allFrames.findLast(f=>f.moving);
  const contact=!ret.arrived&&ret.stuckAt?[
    classify({x:last.x,z:last.z,feet:last.feet}),
    ...[.05,.15,.25,.4,.6].map(m=>{
      const d=Math.hypot(ret.stuckAt[0]-last.x,ret.stuckAt[1]-last.z),f=Math.min(1,m/d);
      const [x,z]=subpoint([last.x,last.z],ret.stuckAt,f);return classify({x,z,feet:last.feet});}),
  ]:[];
  const {allFrames,frames,...summary}=ret;
  const details={...summary,options,frameCount:allFrames.length,last,lastMoving,join:middle,contact};
  report('real-controller',details);
  return details;
}
test('Current Qianqing Gate and joined causeway reach the original Qianqing Palace endpoint in native walking',t=>{
  const forward=runMode(t,snapshot,{startFeet:0});assert.ok(forward.arrived);
  assert.ok(forward.join.length>3&&forward.join.every(f=>f.source.length>0&&!f.airborne));
  assert.ok(forward.join.some(f=>f.source.some(s=>s.tag==='qianqing-gate')));
  assert.ok(forward.join.some(f=>f.source.some(s=>s.tag==='common-three-halls')));
  assert.ok(near(forward.last.feet,INNER_PALACE_LEVELS.hallFloorY));
});
test('Current Qianqing Palace returns across the joined causeway and Gate to the original exterior floor',t=>{
  const start=cm.getGroundHeight(...snapshot.at(-1),2,PLAYER.STEP_UP,radius);
  assert.ok(near(start,INNER_PALACE_LEVELS.hallFloorY));
  const reverse=runMode(t,snapshot.toReversed(),{backward:true,startFeet:start});
  assert.ok(reverse.arrived);
  assert.ok(reverse.join.length>3&&reverse.join.every(f=>f.source.length>0&&!f.airborne));
  assert.ok(reverse.join.some(f=>f.source.some(s=>s.tag==='qianqing-gate')));
  assert.ok(reverse.join.some(f=>f.source.some(s=>s.tag==='common-three-halls')));
  assert.equal(reverse.last.feet,0);assert.equal(reverse.last.airborne,false);
});
test('Current Qianqing Gate central carved slab blocks the shortcut while the outer flight remains open',t=>{
  const south=gateInfo.base.southZ,run=gateInfo.imperialApproach.run;
  const a=[0,south-run-2],b=[0,south+1];
  assert.equal(cm.getGroundHeight(...a,0,PLAYER.STEP_UP,radius),0);
  const floor=walkStraight({THREE:T,cm},a,b,{feet0:0});
  const player=runMode(t,[a,b],{startFeet:0});
  const historicalContact=classify({x:0,z:floor.end[1]+.25,feet:floor.feet});
  report('central-carved-stone',{a,b,floor,historicalContact});
  assert.ok(floor.reached>0&&floor.reached<floor.total-1);
  assert.equal(player.arrived,false);
  assert.equal(historicalContact.blockedAtFeet,true);
  assert.ok(historicalContact.broadPhaseSolidCandidates.some(c=>c.tag==='qianqing-gate'));
  assert.ok(player.contact.some(p=>p.blockedAtFeet&&p.broadPhaseSolidCandidates.some(c=>c.tag==='qianqing-gate')));
});
