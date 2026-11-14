import test from 'node:test';import assert from 'node:assert/strict';
import {actualRearPair} from './fixture.mjs';
import {withTerrainController} from '../lib/r91-controller-clock.mjs';
import {createPhysicalWaypointDriver} from '../lib/physical-waypoints.mjs';
import {PLAYER} from '../../src/config/constants.js';
import {furnitureContact,furnitureBodySweep,furnitureTryStep} from '../../src/controls/FurnitureMotion.js';
import {hallGeom,walkStraight} from '../lib/world.mjs';

const owner=x=>x?{kind:x.kind,fraction:x.fraction,source:x.collider?.mesh?.chuxiuRearSource??null,bounds:x.collider?.box?[...x.collider.box.min.toArray(),...x.collider.box.max.toArray()]:null}:null;
const contact=x=>({poseClear:x.poseClear,height:x.surface?.height??null,source:x.surface?.source??null,blocker:owner(x.blocker)});
function exercise(h,room,fps){
 const points=[-4.8,-3.6,-2.89,-2.61,-2.2,-1,0,-1,-2.2,-2.61,-2.89,-3.6,-4.8].map(z=>{const p=room.world(0,0,z);return[p.x,p.z];}),result={side:room.item.rearWing,fps,scope:h.scope,points,arrived:false,maxFeet:0,strictOverlapFrames:0,trace:[]};
 withTerrainController(h.cm,(c,cam,tick)=>{
  const start=points[0],ground=new h.THREE.Raycaster(new h.THREE.Vector3(start[0],.05,start[1]),new h.THREE.Vector3(0,-1,0),0,.1).intersectObject(h.environmentScene,true)[0];assert.ok(ground?.object.userData.environmentGroundSource&&Math.abs(ground.point.y)<1e-10,'actual rendered ground start');
  c.setPosition(start[0],PLAYER.HEIGHT,start[1]);assert.equal(c.feetY,0);assert.equal(c.airborne,false);assert.equal(h.cm.checkCollision(cam.position,.5),false,'legal original body start');
  const driver=createPhysicalWaypointDriver(points);c.moveForward=true;let stagnant=0;
  const pos=()=>[cam.position.x-c.bobOffset.x,cam.position.z-c.bobOffset.z];
  for(let frame=0;frame<fps*25&&!driver.complete;frame++){
   const before=pos(),cmd=driver.command(before,false);cam.position.sub(c.bobOffset);cam.lookAt(cmd.target[0],cam.position.y,cmd.target[1]);cam.position.add(c.bobOffset);cam.updateMatrixWorld(true);tick(fps);const after=pos();driver.observe(before,after);result.maxFeet=Math.max(result.maxFeet,c.feetY);assert.ok([...after,c.feetY,c.groundY].every(Number.isFinite));
   const body=new h.THREE.Box3(new h.THREE.Vector3(after[0]-.5,c.feetY,after[1]-.5),new h.THREE.Vector3(after[0]+.5,c.feetY+PLAYER.HEIGHT,after[1]+.5));
   const hits=h.cm.colliders.filter(v=>!v.xiqingRoofSurface&&!v.triangleSupport&&['x','y','z'].every(k=>Math.min(body.max[k],v.box.max[k])>Math.max(body.min[k],v.box.min[k])));
   if(hits.length){result.strictOverlapFrames++;result.firstOverlap??={frame,position:after,feet:c.feetY,sources:hits.map(v=>({owner:h.owners.get(v.mesh)?.index,source:v.mesh.chuxiuRearSource??null,bounds:[...v.box.min.toArray(),...v.box.max.toArray()]}))};}
   if(frame%Math.max(1,Math.floor(fps/10))===0){result.trace.push({frame,position:after,feet:c.feetY,ground:c.groundY,airborne:c.airborne,scopeStep:h.cm.lastFurnitureStepFeet??null});if(result.trace.length>25)result.trace.shift();}
   stagnant=Math.hypot(after[0]-before[0],after[1]-before[1])<1e-8?stagnant+1:0;
   if(stagnant>fps){
    const from=new h.THREE.Vector3(after[0],c.feetY,after[1]),toward=new h.THREE.Vector3(cmd.target[0],c.feetY,cmd.target[1]).sub(from).normalize().multiplyScalar(.05).add(from);
    result.stop={from:from.toArray(),to:toward.toArray(),sweep:owner(furnitureBodySweep(h.cm,from,toward,.5)),sourceContact:contact(furnitureContact(h.cm,from.x,from.z,from.y,.5)),targetContact:contact(furnitureContact(h.cm,toward.x,toward.z,from.y+PLAYER.STEP_UP,.5)),tryStep:furnitureTryStep(h.cm,from,toward,.5,PLAYER.STEP_UP,{kind:'player',airborne:c.airborne})};break;
   }
  }
  result.arrived=driver.complete;result.crossings=driver.diagnostics.crossings.length;result.end=pos();c.moveForward=false;for(let n=0;n<fps*2;n++)tick(fps);result.endFeet=c.feetY;result.endAirborne=c.airborne;
 });return result;
}

test('actual paired short steps permit continuous native entry and return from legal ground without midroute reset',()=>{
 const h=actualRearPair();try{const results=[];for(const room of h.rooms)for(const fps of[10,30,60])results.push(exercise(h,room,fps));console.log('CHUXIU_REAR_NATIVE_JSON '+JSON.stringify({scope:h.scope,colliders:h.cm.colliders.length,walkables:h.cm.walkables.length,results}));assert.ok(results.every(r=>r.arrived&&r.crossings===12&&r.endFeet===0&&!r.endAirborne),'actual original pair has a continuous-route failure');assert.ok(results.every(r=>r.strictOverlapFrames===0),'actual source AABB has positive-volume body overlap');}finally{h.dispose();}
});

test('unchanged original five-argument QA walker reproduces the exact retained east and west failure on the same source',()=>{
 const h=actualRearPair();try{const results=h.rooms.map(room=>{const g=hallGeom(room.item),a=g.toW(g.doorX,-(g.PD/2+g.run+2)),b=g.toW(g.doorX,-(g.d/2-1));return{side:room.item.rearWing,start:a,target:b,result:walkStraight(h,a,b)};});console.log('CHUXIU_REAR_LEGACY_JSON '+JSON.stringify(results));for(const r of results){assert.equal(r.result.reached,1);assert.equal(r.result.total,3.35);assert.deepEqual(r.result.end,[r.side==='east'?80.55:109.05,440.85]);}}finally{h.dispose();}
});

test('same original source step rejects absent motion but permits grounded step eligibility without changing any collision owner',()=>{
 const h=actualRearPair();try{const rows=[];for(const room of h.rooms){const g=hallGeom(room.item),a=g.toW(0,-3.55),b=g.toW(0,-3.35),from=new h.THREE.Vector3(a[0],0,a[1]),to=new h.THREE.Vector3(b[0],0,b[1]);const noMotion=furnitureTryStep(h.cm,from,to,.5,PLAYER.STEP_UP,null),grounded=furnitureTryStep(h.cm,from,to,.5,PLAYER.STEP_UP,{kind:'player',airborne:false});rows.push({side:room.item.rearWing,from:from.toArray(),to:to.toArray(),noMotion,grounded,source:contact(furnitureContact(h.cm,from.x,from.z,0,.5)),target:contact(furnitureContact(h.cm,to.x,to.z,PLAYER.STEP_UP,.5))});assert.equal(noMotion.accepted,false);assert.equal(grounded.accepted,true);assert.ok(grounded.feetY>0);}console.log('CHUXIU_REAR_MOTION_CONTRACT_JSON '+JSON.stringify(rows));}finally{h.dispose();}
});

test('true original closed walls and thin foreign solids still block native entry, with restoration',()=>{
 const h=actualRearPair();try{for(const room of h.rooms){for(const x of[-8.2/3,8.2/3]){const p=room.world(x,Math.fround(.47)+PLAYER.HEIGHT,-2.2);assert.equal(h.cm.checkCollision(p,.5),true,'original closed side window remains solid');}const wall=new h.THREE.Box3(new h.THREE.Vector3(-1.3,0,-3.805),new h.THREE.Vector3(1.3,3,-3.795)).applyMatrix4(room.transform);h.cm.addCollider(wall,'r369-actual-obstruction');try{for(const fps of[10,30,60])assert.equal(exercise(h,room,fps).arrived,false,'thin actual obstruction cannot be skipped');}finally{h.cm.removeByTag('r369-actual-obstruction');}assert.equal(exercise(h,room,60).arrived,true,'ordinary source recovers after foreign blocker removal');}}finally{h.dispose();}
});
