import test from 'node:test';
import {makeFixture,contacts,save,assert,T} from './fixture.mjs';
import {withTerrainController} from '../lib/r91-controller-clock.mjs';
import * as motion from '../../src/controls/XiananContactMotion.js';
import {xiananGroundCovered} from '../../src/controls/XiananGroundWitness.js';
import {PLAYER} from '../../src/config/constants.js';

const EPS=1e-8,prefix=process.env.XIANAN_STAGE_NAME??'OBSERVER';
const physical=c=>c.camera.position.clone().sub(c.bobOffset);
const feet=p=>[p.x,p.y-PLAYER.HEIGHT,p.z];
const close=(a,b,message)=>{assert.equal(a.length,b.length,message);for(let i=0;i<a.length;i++)assert.ok(Math.abs(a[i]-b[i])<=EPS,message+' axis'+i);};
function api(){assert.equal(typeof motion.inspectXiananGroundedMotion,'function','missing read-only committed-segment observer export');return motion.inspectXiananGroundedMotion;}
function fixture(run){const f=makeFixture();try{return withTerrainController(f.cm,(c,camera,tick)=>{
 c.setPosition(300.9,PLAYER.HEIGHT,-245.515);const p=physical(c);
 assert.ok(Math.abs(p.y-PLAYER.HEIGHT)<=EPS);assert.equal(contacts(p.toArray(),p.y-PLAYER.HEIGHT,f.finishedBoxes).length,0);assert.equal(f.cm.checkCollision(p,.5),false);assert.equal(f.cm.checkBoundary(p,.5)&&f.cm.checkRiverCrossing(p,.5),true);
 assert.equal(xiananGroundCovered(f.scene,p,p,.5,camera),true,'real source-ground preflight');
 c.lookAt(300.9,-240.1);camera.updateMatrixWorld(true);c.moveForward=true;c.canSprint=false;
 return run(f,c,camera,tick);
 });}finally{f.dispose();}}
function pureFrozen(value){
 if(value===null||['string','boolean'].includes(typeof value))return;
 if(typeof value==='number'){assert.ok(Number.isFinite(value));return;}
 assert.equal(typeof value,'object','observer contains no function/capability');
 assert.ok(Array.isArray(value)||Object.getPrototypeOf(value)===Object.prototype,'ordinary records/arrays only');assert.equal(Object.isFrozen(value),true,'deeply frozen');
 for(const item of Object.values(value))pureFrozen(item);
}
// Independent interval oracle; does not import any product sweep function.
// Strict overlap depth>the original1e-8 on all axes somewhere in [0,1].
function penetratesSegment(from,to,box){
 let enter=0,leave=1;
 for(let axis=0;axis<3;axis++){
  const lo=from[axis]-(axis===1?0:.5),hi=from[axis]+(axis===1?PLAYER.HEIGHT:.5),v=to[axis]-from[axis];
  const low=box.min[axis]+EPS-hi,high=box.max[axis]-EPS-lo;
  if(v===0){if(!(low<0&&high>0))return false;continue;}
  enter=Math.max(enter,Math.min(low/v,high/v));leave=Math.min(leave,Math.max(low/v,high/v));
  if(enter>=leave)return false;
 }
 return enter<leave&&leave>0&&enter<1;
}
function observationMatches(s,before,after,c){
 assert.ok(s!==null);pureFrozen(s);assert.ok(Number.isInteger(s.frame)&&s.frame>0);assert.ok(Number.isInteger(s.generation));assert.ok(Math.abs(s.dt-.1)<=EPS);
 close(s.startEye,before.toArray(),'snapshot actual frame start');close(s.startFeet,feet(before),'snapshot derived startfeet');close(s.endEye,after.toArray(),'snapshot actual camera end');close(s.endFeet,feet(after),'snapshot derived endfeet');assert.equal(s.verticalVelocity,c.verticalVelocity);
}

test('observer control: genuine fixture and two native ticks remain available',()=>fixture((f,c,camera,tick)=>{
 const rows=[];for(let i=0;i<2;i++){tick(10);const p=physical(c);assert.equal(contacts(p.toArray(),p.y-PLAYER.HEIGHT,f.finishedBoxes).length,0);rows.push(p.toArray());}
 assert.ok(rows[1][2]>rows[0][2]);save(prefix+'-control.json',{rows});
}));
test('observer: real committed lift/horizontal chains connect independent physical frame poses',()=>{
 const inspect=api();fixture((f,c,camera,tick)=>{
  const rows=[];let priorFrame=0,foundLift=false;
  for(let i=0;i<4;i++){
   const before=physical(c);tick(10);const after=physical(c),s=inspect(c);observationMatches(s,before,after,c);assert.ok(s.frame>priorFrame);priorFrame=s.frame;
   assert.equal(s.status,'committed');assert.equal(s.participated,true);assert.equal(s.commitMatched,true);assert.equal(s.epochValid,true);assert.ok(s.committedSegments.length>0);
   let cursor=feet(before);
   for(const [index,seg]of s.committedSegments.entries()){
    assert.equal(seg.index,index);assert.ok(['lift','horizontal','descent'].includes(seg.kind));close(seg.fromFeet,cursor,'accepted chain continuity');
    if(seg.kind==='lift')foundLift=true;
    for(const box of f.finishedBoxes)assert.equal(penetratesSegment(seg.fromFeet,seg.toFeet,box),false,'independent finished segment oracle '+box.label);
    cursor=seg.toFeet;
   }
   close(cursor,feet(after),'chain reaches actual native end');rows.push(s);
  }
  assert.equal(foundLift,true,'real cap entry exposes an accepted lift');save(prefix+'-chains.json',{rows});
 });
});
test('observer: rejected expanded command is not published as a committed chain',()=>{
 const inspect=api();fixture((f,c,camera,tick)=>{
  const original=f.cm.getValidPosition,before=physical(c);
  f.cm.getValidPosition=function(from,to,radius,feetY,step,airFeet,token){const h=motion.beginXiananMove(this,token,from,to,radius,step),p=motion.xiananMoveStart(h);motion.tryXiananGroundedStep(h,from.x,from.z+1.2);motion.finishXiananMove(h,p);return p;};
  try{tick(10);}finally{f.cm.getValidPosition=original;}
  const after=physical(c),s=inspect(c);observationMatches(s,before,after,c);close(after.toArray(),before.toArray(),'blocked actual prefix retained');assert.equal(s.status,'blocked');assert.equal(s.participated,true);assert.equal(s.committedSegments.length,0);save(prefix+'-rejected.json',{s});
 });
});
test('observer: frozen detached copies cannot mutate state or acquire native authority',()=>{
 const inspect=api();fixture((f,c,camera,tick)=>{
  tick(10);const a=inspect(c),b=inspect(c);pureFrozen(a);pureFrozen(b);assert.notEqual(a,b);assert.notEqual(a.endEye,b.endEye);assert.deepEqual(a,b);
  const before=physical(c).toArray();assert.throws(()=>{a.endEye[1]+=1;},TypeError);assert.throws(()=>{a.committedSegments.push({});},TypeError);assert.deepEqual(inspect(c),b);close(physical(c).toArray(),before,'query did not move camera');
  const cap=f.finishedBoxes.find(b=>b.label==='cap'),from=new T.Vector3(300.9,1.7,cap.min[2]-.55),to=new T.Vector3(300.9,1.7,cap.min[2]-.45),copy={...JSON.parse(JSON.stringify(a)),kind:'player',airborne:false,feetY:0};
  const result=f.cm.getValidPosition(from,to,.5,0,PLAYER.STEP_UP??.6,null,copy);close(result.toArray(),to.toArray(),'snapshot cannot grant a native step');close(physical(c).toArray(),before,'copy cannot affect native controller');save(prefix+'-copies.json',{a,returned:result.toArray()});
 });
});
test('observer: new native frame, stop, reset, dispose and exception hide old success',()=>{
 const inspect=api();fixture((f,c,camera,tick)=>{
  tick(10);const first=inspect(c);assert.ok(first!==null);c.stop();assert.equal(inspect(c),null,'stop invalidates old observation');
  c.setPosition(300.9,1.7,-245.515);assert.equal(inspect(c),null,'position reset invalidates observation');c.moveForward=true;tick(10);const next=inspect(c);assert.ok(next.frame>first.frame);
  const original=c.updateGround;let midFrame;
  c.updateGround=function(){midFrame=inspect(this);throw new Error('controlled observer exception');};
  try{assert.throws(()=>tick(10),/controlled observer exception/);}finally{c.updateGround=original;}
  assert.equal(midFrame,null,'next frame hides old success before commit');assert.equal(inspect(c),null,'native exception cannot reuse old success');
  c.dispose();assert.equal(inspect(c),null,'dispose invalidates observation');save(prefix+'-lifecycle.json',{firstFrame:first.frame,nextFrame:next.frame,midFrame,afterException:null,afterDispose:null});
 });
});
test('observer: outside and genuine AIR_ONLY get fresh endpoints without invented local segments',()=>{
 const inspect=api();fixture((f,c,camera,tick)=>{
  tick(10);const local=inspect(c);c.setPosition(f.finishedBoxes[1].max[0]+10,1.7,-245.515);c.moveForward=false;
  let before=physical(c);assert.equal(xiananGroundCovered(f.scene,before,before,.5,camera),true,'outside fixture still has real ground');tick(10);let after=physical(c),outside=inspect(c);observationMatches(outside,before,after,c);assert.equal(outside.status,'outside');assert.equal(outside.participated,false);assert.equal(outside.committedSegments.length,0);assert.ok(outside.frame>local.frame);
  c.setPosition(300.9,1.7,-245.515);c.jump();before=physical(c);tick(10);after=physical(c);const air=inspect(c);observationMatches(air,before,after,c);assert.equal(c.airborne,true,'actual queued jump entered ordinaryair');assert.equal(air.status,'air_only');assert.equal(air.committedSegments.length,0);assert.ok(air.frame>outside.frame);save(prefix+'-outside-air.json',{outside,air});
 });
});
test('observer: commit-time source epoch recheck labels discontinuity without changing pose',()=>{
 const inspect=api();fixture((f,c,camera,tick)=>{
  const original=c.updateGround,before=physical(c);let endBeforeCommit;
  c.updateGround=function(...args){const result=original.apply(this,args);endBeforeCommit=physical(this).toArray();f.merged.visible=false;return result;};
  try{tick(10);}finally{c.updateGround=original;}
  const after=physical(c),s=inspect(c);observationMatches(s,before,after,c);close(after.toArray(),endBeforeCommit,'observer does not rewrite movement after source mutation');assert.equal(s.epochValid,false);assert.equal(s.status,'discontinuous');assert.equal(s.committedSegments.length,0);save(prefix+'-epoch-label.json',{s,endBeforeCommit});
 });
});
