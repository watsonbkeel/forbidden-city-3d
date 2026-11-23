import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {PLAYER} from '../../src/config/constants.js';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
import {replayTerrace,traceTerraceGround} from './terrace-walk.mjs';
import {assertCourtRouteHeadClearance} from './r58-court-facade-world-check.mjs';

// Same CPU boundary used by the existing full-world public-entry regression.
const hooks=registerHooks({load(url,context,next){return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);}});
let Teleport;
try {({Teleport}=await import('../../src/ui/Teleport.js'));} finally {hooks.deregister();}

export function lijingPublicLanding(W,zone,mapItems){
  const name='储秀宫后殿',hall=zone.items.find(i=>i.name===name);
  assert.equal(hall?.rearHallProfile,'lijingxuan');
  const resolver=Object.assign(Object.create(Teleport.prototype),{
    targets:new Map([[name,hall]]),zoneManager:{getMapItems:()=>mapItems},collisionManager:W.cm
  });
  const landing=resolver.resolveLanding(name);
  assert.ok(landing,'live map resolver must supply a safe ground target');
  assert.equal(landing.y,0);
  const historical=[110.5,440],oldFeet=W.cm.getGroundHeight(...historical,0,.6);
  assert.equal(W.cm.checkCollision(new W.THREE.Vector3(historical[0],oldFeet+PLAYER.HEIGHT,historical[1]),.5),true,'fitted west wing must remain a solid blocker at historical east start');
  assert.equal(W.cm.checkCollision(new W.THREE.Vector3(landing.x,PLAYER.HEIGHT,landing.z),.5),false,'resolved landing is not occupied');
  return {hall,landing};
}

export function replayLijingPublicEntry(t,W,zone,mapItems,{fps,backward,sprint}){
  const {hall,landing}=lijingPublicLanding(W,zone,mapItems);
  const outside=[landing.x,landing.z],porch=[hall.x,hall.z-7.7],inside=[hall.x,hall.z-1.5];
  // R113 retained a real side wall at the old lateral route and modeled the
  // 1.8m entrance at local z=-4.8..-3.0 in LijingWestRoom.js.
  const doorZ=hall.z-3.9,mid=[hall.x,doorZ],right=[hall.x+3,doorZ],left=[hall.x-3,doorZ];
  const oldSideWall=new W.THREE.Vector3(hall.x+2.62,hall.ph+PLAYER.HEIGHT,inside[1]);
  assert.equal(W.cm.checkCollision(oldSideWall,.5),true,'the direct R63 lateral shortcut remains intentionally walled');
  const wallRay=new W.THREE.Raycaster(new W.THREE.Vector3(hall.x,oldSideWall.y,inside[1]),new W.THREE.Vector3(1,0,0),0,3).intersectObject(W.scene,true)[0];
  assert.ok(wallRay&&solidMaterialNameAt(wallRay.object,wallRay.faceIndex)==='lijing_ivory_wall','real modeled side wall blocks historical shortcut');
  const points=[outside,porch,inside,mid,right,left,mid,inside,porch,outside,porch,inside,porch,outside];
  const trace=traceTerraceGround(W.cm,{flights:[]});
  try {
    const route=replayTerrace(t,W,points,{fps,backward,sprint,recordFrames:true});
    assert.equal(route.arrived,true,JSON.stringify({...route,frames:undefined}));
    assert.equal(route.startFeet,0); assert.ok(Math.abs(route.end[2])<1e-6);
    assert.ok(route.maxFeet>=hall.ph-1e-6,'actual terrace reached');
    assert.equal(route.driver.crossings.filter(c=>c.point[0]===inside[0]&&c.point[1]===inside[1]&&[2,points.length-3].includes(c.index)).length,2,'two actual interior entries');
    assert.ok(Math.hypot(route.end[0]-outside[0],route.end[1]-outside[1])<.65,'returned to live map landing');
    for(const target of [right,left])assert.ok(route.driver.crossings.some(c=>c.point[0]===target[0]&&c.point[1]===target[1]),'both lateral interior spans use the current modeled doorway');
    const unknown=trace.samples.filter(s=>s.source==='rescue'||s.source==='unverified');
    assert.equal(unknown.length,0,JSON.stringify({requirement:'verified physical support without rescue',examples:unknown.slice(0,3)}));
    if(sprint)assert.ok(route.maxSpeed>PLAYER.MOVE_SPEED,'actual sprint movement reached');
    const clearance=assertCourtRouteHeadClearance(W,route);
    assert.ok(clearance.samples>10);
    t.diagnostic(JSON.stringify({fps,backward,sprint,landing:outside,inside,end:route.end,maxFeet:route.maxFeet,maxSpeed:route.maxSpeed,clearance}));
  } finally {trace.restore();}
}

export function assertCurrentChuxiuNorthWall(t,W,zone){
  const main=zone.items.find(i=>i.kind==='hall'&&i.name==='储秀宫');
  assert.equal(main?.chuxiuProfile,'chuxiu-official-topology-fit-r123');
  assert.equal(main.z,429.3);assert.equal(Boolean(main.backDoor),false);
  const h=main.d/2,wallZ=main.z+h,court=[94.5,439.7],inside=[94.5,434.7];
  const {THREE,cm}=W,radius=.5,epsilon=1e-8;
  const near=(a,b)=>Math.abs(a-b)<epsilon;
  const wall=cm.colliders.filter(({box:b})=>near(b.min.x,main.x-main.w/2)&&near(b.max.x,main.x+main.w/2)&&near(b.min.y,main.ph)&&near(b.max.y,main.ph+3)&&near(b.min.z,wallZ-.3)&&near(b.max.z,wallZ+.3));
  assert.equal(wall.length,1,'unique registered retained north-wall collider');
  const bounds=wall[0].box;
  const start=new THREE.Vector3(court[0],PLAYER.HEIGHT,court[1]);
  assert.equal(cm.getGroundHeight(...court,0,.6),0,'witness starts on courtyard ground');
  assert.equal(cm.checkCollision(start,radius),false,'witness must not start occupied');
  const hit=new THREE.Raycaster(start,new THREE.Vector3(0,0,-1),0,10).intersectObject(W.scene,true)[0];
  assert.ok(hit&&Math.abs(hit.point.z-bounds.max.z)<.002,'visible north wall at its registered model source');
  assert.equal(solidMaterialNameAt(hit.object,hit.faceIndex),W.lib.material('wall_red').name);
  const oldDirection=replayTerrace(t,W,[court,[94.5,448.7]],{fps:60,recordFrames:true});
  assert.equal(oldDirection.arrived,true,'outdated start now crosses actual courtyard into Lijing, not through the translated wall');
  // Approaching from the courtyard hits the valid platform edge before the
  // wall; a supported origin inside the hall is the actual wall witness.
  const originGround=cm.getGroundHeight(...inside,Infinity);
  assert.equal(originGround,Math.fround(main.ph+.02),'actual finished hall floor');
  assert.equal(cm.checkCollision(new THREE.Vector3(inside[0],originGround+PLAYER.HEIGHT,inside[1]),radius),false,'indoor witness starts clear');
  const fps=60,route=replayTerrace(t,W,[inside,court],{fps,recordFrames:true});
  assert.equal(route.arrived,false,'cannot walk across retained north wall');
  assert.equal(route.startFeet,main.ph);assert.deepEqual(route.stuckAt,court);
  const f=route.frames.at(-1),contactZ=bounds.min.z-radius;
  assert.equal(f.feet,originGround,'witness remains supported at wall');
  assert.ok(f.z>inside[1]&&f.z<contactZ&&contactZ-f.z<PLAYER.MOVE_SPEED/fps,JSON.stringify({end:route.end,contactZ}));
  const intoWall=new THREE.Vector3(inside[0],f.feet+PLAYER.HEIGHT,contactZ+.02);
  assert.equal(cm.checkCollision(intoWall,radius),true,'first step into witnessed wall must be rejected');
  // checkCollision just constructed this actual player's body box. Distinguish
  // wall-owned obstruction from lower supporting platform and nearby leaves.
  const body=cm.playerBox.clone(),hits=cm.queryBox(body).filter(o=>body.intersectsBox(o.box));
  assert.deepEqual(hits,[wall[0]],'the actual wall, not a neighbor, occupies the rejected body pose');
  t.diagnostic(JSON.stringify({inside,court,source:[bounds.min.toArray(),bounds.max.toArray()],visibleZ:hit.point.z,end:route.end,formerRouteEnd:oldDirection.end}));
}
