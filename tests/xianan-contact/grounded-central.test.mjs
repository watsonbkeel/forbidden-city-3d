import fs from 'node:fs';
import test,{before} from 'node:test';
import {makeFixture,contacts,save,assert,T,out} from './fixture.mjs';
import {withTerrainController} from '../lib/r91-controller-clock.mjs';
import {createPhysicalWaypointDriver} from '../lib/physical-waypoints.mjs';
import {PLAYER} from '../../src/config/constants.js';

const prefix=process.env.XIANAN_STAGE_NAME??'GROUNDED-CENTRAL';
const saved=(name,value)=>save(prefix+'-'+name+'.json',value);
const history=JSON.parse(fs.readFileSync(new URL('./native-central-historical-pose.json',import.meta.url)));
const EPS=1e-8;
const physical=c=>c.camera.position.clone().sub(c.bobOffset);
function observe(f,c,frame,phase){
 const p=physical(c),derivedFeet=p.y-PLAYER.HEIGHT;
 for(const n of [...p.toArray(),derivedFeet,c.feetY,c.groundY,c.verticalVelocity])assert.ok(Number.isFinite(n),'finite native scalar output');
 assert.ok(Math.abs(derivedFeet-c.feetY)<=EPS,'physical camera-derived feet match native scalar, not logical ground');
 const row={frame,phase,renderEye:c.camera.position.toArray(),bobOffset:c.bobOffset.toArray(),physicalEye:p.toArray(),derivedFeet,controllerFeet:c.feetY,logicalGround:c.groundY,verticalVelocity:c.verticalVelocity,airborne:c.airborne===true,onSupport:c.onSupport===true,speed:c.motion.speed,nativeCollision:f.cm.checkCollision(p,.5),riverSafe:f.cm.checkRiverCrossing(p,.5),boundarySafe:f.cm.checkBoundary(p,.5),finishedContacts:contacts(p.toArray(),derivedFeet,f.finishedBoxes)};
 // Never compare source-vs-finished contact roles here: Float32 finished top is authority.
 return row;
}
let route;
before(()=>{
 const f=makeFixture(),stream=new URL(prefix+'-frames.ndjson',out);fs.mkdirSync(out,{recursive:true});fs.writeFileSync(stream,'',{flag:'wx'});
 route={fps:10,sprint:false,status:'starting',initialSetPositionCalls:0,legs:[],frames:[],scope:'One central lane south-to-north only; strict finished five-box output oracle'};
 try{
  saved('identity',f.identity);
  const seed=[300.9,f.gateFloor.min.z-1],targets=[{id:'central-threshold',point:[300.9,-240.1]},{id:'north-outside',point:[300.9,f.gateFloor.max.z+1]}];
  route.seed=seed;route.targets=targets;
  withTerrainController(f.cm,(c,camera,tick)=>{
   c.setPosition(seed[0],PLAYER.HEIGHT,seed[1]);route.initialSetPositionCalls++;let frame=0;
   const initial=observe(f,c,frame,'initial');assert.ok(Math.abs(initial.derivedFeet)<=EPS);assert.equal(initial.finishedContacts.length,0);assert.equal(initial.nativeCollision,false);route.initial=initial;
   const advance=(phase,input)=>{
    tick(10);frame++;assert.ok(frame<=240,'predeclared first-route frame cap');const row={...observe(f,c,frame,phase),input};route.frames.push(row);fs.appendFileSync(stream,JSON.stringify(row)+'\n');
    if(row.nativeCollision||!row.riverSafe||!row.boundarySafe)throw Error('Unexpected original native guard failure at frame '+frame);
    return row;
   };
   for(const target of targets){
    const start=physical(c),driver=createPhysicalWaypointDriver([[start.x,start.z],target.point]);let movingFrames=0;
    c.moveForward=true;c.moveBackward=false;c.canSprint=false;
    while(!driver.complete&&movingFrames<100){
     const previous=physical(c),command=driver.command([previous.x,previous.z],false);c.lookAt(...command.target);camera.updateMatrixWorld(true);
     advance(target.id,{forward:true,sprint:false,target:command.target});movingFrames++;const next=physical(c);driver.observe([previous.x,previous.z],[next.x,next.z]);
    }
    if(!driver.complete)throw Error('Unexpected native reachability failure: '+target.id);
    c.moveForward=false;c.moveBackward=false;c.canSprint=false;
    for(let i=0;i<20;i++)advance('tail-'+target.id,{forward:false,sprint:false});
    const stop=observe(f,c,frame,'settled-'+target.id);assert.ok(stop.speed<1e-6,'normal input release settles after two seconds');
    const leg={id:target.id,reached:driver.complete,movingFrames,tailFrames:20,stop,driver:driver.diagnostics};route.legs.push(leg);saved('leg-'+route.legs.length,leg);saved('progress',{...route,frames:route.frames.length});
   }
   route.final=observe(f,c,frame,'final');
  });
  route.penetratingFrames=route.frames.filter(row=>row.finishedContacts.length>0).length;route.contactCounts=Object.fromEntries(f.finishedBoxes.map(box=>[box.label,route.frames.filter(row=>row.finishedContacts.some(c=>c.role===box.label)).length]));route.bobFrames=route.frames.filter(row=>row.bobOffset.some(n=>Math.abs(n)>EPS)).length;route.status='ROUTE_OBSERVED';saved('route-result',route);
 }catch(error){saved('unexpected',{name:error.name,message:error.message,completedFrames:route.frames.length,completedLegs:route.legs.length});throw error}finally{f.dispose()}
});

test('central native control: one real10Hz walk reaches both legs with normal two-second tails',()=>{
 assert.equal(route.initialSetPositionCalls,1);assert.equal(route.legs.length,2);assert.ok(route.legs.every(leg=>leg.reached&&leg.tailFrames===20));assert.ok(route.bobFrames>0,'default native head bob is exercised');assert.ok(Math.abs(route.final.derivedFeet)<=EPS,'north outside settles to real ground0');assert.equal(route.final.airborne,false);assert.equal(route.final.verticalVelocity,0);
});
test('central grounded output: actual unbobbed camera poses never penetrate finished five solids',()=>{
 assert.equal(route.penetratingFrames,0,'physical camera-derived full-foot body must clear finished five boxes including all no-input tails');
});
test('central invalid pose: immutable historical start is not rescued or granted a new jump',()=>{
 const f=makeFixture();let report;
 try{
  withTerrainController(f.cm,(c,camera,tick)=>{
   c.setPosition(...history.physicalEye);const initial=observe(f,c,0,'historical-seed');for(let i=0;i<3;i++)assert.ok(Math.abs(initial.physicalEye[i]-history.physicalEye[i])<=EPS,'actual post-setPosition historical coordinate');assert.ok(Math.abs(initial.derivedFeet-history.feet)<=EPS);assert.ok(initial.finishedContacts.length>0,'historical bad pose remains geometryRED');
   tick(10);const still=observe(f,c,1,'invalid-no-input');c.jump();tick(10);const jumped=observe(f,c,2,'invalid-queued-jump');
   report={history,initial,still,jumped};saved('historical-invalid',report);
  });
  assert.ok(Math.abs(report.still.derivedFeet-report.initial.derivedFeet)<=EPS,'invalid starting pose must not be rescued');
  assert.ok(report.jumped.derivedFeet<=report.initial.derivedFeet+EPS&&report.jumped.verticalVelocity<=EPS&&report.jumped.airborne===false,'invalid full-body penetration cannot grant ground-jump eligibility');
 }finally{f.dispose()}
});
test('central identity control: a direct public player-shaped motion receives no new lift',()=>{
 const f=makeFixture();
 try{
  const cap=f.finishedBoxes.find(box=>box.label==='cap'),from=new T.Vector3(300.9,PLAYER.HEIGHT,cap.min[2]-.55),target=new T.Vector3(300.9,PLAYER.HEIGHT,cap.min[2]-.45),motion={kind:'player',airborne:false,feetY:0};
  const result=f.cm.getValidPosition(from,target,.5,0,PLAYER.STEP_UP??.6,null,motion);
  saved('identity-control',{from:from.toArray(),target:target.toArray(),returned:result.toArray(),meaning:'Only no-new-lift control; not a complete private receipt/session test'});
  for(const key of ['x','y','z'])assert.ok(Math.abs(result[key]-target[key])<=EPS,'untrusted public shape keeps selected legacy scalar result');
 }finally{f.dispose()}
});
