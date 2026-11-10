import {makeFixture,contacts,save,assert,T} from './fixture.mjs';
import {withTerrainController} from '../lib/r91-controller-clock.mjs';
import {queryXiananContact} from '../../src/scene/palace/special/XiananContactSources.js';
import {xiananGroundCovered} from '../../src/controls/XiananGroundWitness.js';
import * as motion from '../../src/controls/XiananContactMotion.js';
import {PLAYER} from '../../src/config/constants.js';
export {assert,T,motion,PLAYER,save};
export const EPS=1e-8;
export const physical=c=>c.camera.position.clone().sub(c.bobOffset);
export const feet=p=>[p.x,p.y-PLAYER.HEIGHT,p.z];
export const close=(a,b,label)=>{for(let i=0;i<a.length;i++)assert.ok(Math.abs(a[i]-b[i])<=EPS,label+' axis'+i);};
export const plainBox=b=>({min:b.min.toArray(),max:b.max.toArray()});
// Independent interval sweep. Ordinaryboxes keep legacy bottom+.35/top-.05;
// finishedfive use full feet-to-eye. No production sweep import.
export function hit(from,to,box,ordinary=false){
 let enter=0,leave=1;
 for(let axis=0;axis<3;axis++){
  const lo=from[axis]+(axis===1?(ordinary ? .35 : 0):-.5),hi=from[axis]+(axis===1?(ordinary?1.65:1.7):.5),v=to[axis]-from[axis],low=box.min[axis]+EPS-hi,high=box.max[axis]-EPS-lo;
  if(v===0){if(!(low<0&&high>0))return false;continue;}
  enter=Math.max(enter,Math.min(low/v,high/v));leave=Math.min(leave,Math.max(low/v,high/v));if(enter>=leave)return false;
 }
 return enter<leave&&leave>0&&enter<1;
}
export function intent(from,to,radius){
 const distance=Math.hypot(to.x-from.x,to.z-from.z),steps=Math.max(1,Math.ceil(distance/Math.max(radius*.5,.05)));return{distance,steps,dx:(to.x-from.x)/steps,dz:(to.z-from.z)/steps};
}
export function adapter(cm,args,run){
 const [from,to,radius,feetY,step,airFeet,token]=args,plan=intent(from,to,radius),h=motion.beginXiananMove(cm,token,from,to,radius,step),p=motion.xiananMoveStart(h),requests=[];
 assert.ok(h!==null,'SETUP authenticnative handle');
 const request=(x,z,label)=>{const before=p.toArray(),r=motion.tryXiananGroundedStep(h,x,z);if(r?.accepted)p.copy(r.position);requests.push({label,before,target:[x,z],accepted:r?.accepted===true,after:p.toArray()});return r;};
 const complete=()=>{for(let i=0;i<plan.steps;i++){if(request(p.x+plan.dx,p.z+plan.dz,'MAIN').accepted)continue;request(p.x+plan.dx,p.z,'X');request(p.x,p.z+plan.dz,'Z');}};
 const state={h,p,plan,requests,request,complete,from,to,token,radius,step};run(state);
 return state;
}
let halted=null,caseSerial=0;
export function rig(boxInputs,run){
 if(halted)throw new Error('Protocol group stopped after prior failure: '+halted);
 const caseId=++caseSerial,raw=[];
 let originals,originalValues,added=[];
 const f=makeFixture({beforeFinish:({cm})=>{
  assert.equal(cm._grid,undefined,'SETUP obstacles registered before first collisiongrid');originals=[...cm.colliders];originalValues=originals.map(c=>plainBox(c.box));
  for(const [i,b]of boxInputs.entries()){const box=new T.Box3(new T.Vector3(...b.min),new T.Vector3(...b.max));cm.addCollider(box,'protocol-thin-'+i);added.push(cm.colliders.at(-1));}
 }});
 try{return withTerrainController(f.cm,(c,camera,tick)=>{
  assert.equal(f.cm.colliders.length,26+boxInputs.length);for(let i=0;i<26;i++){assert.equal(f.cm.colliders[i]===originals[i],true,'SETUP original26 owner identity');assert.deepEqual(plainBox(f.cm.colliders[i].box),originalValues[i]);}
  for(const a of added)assert.equal(f.cm.queryBox(a.box).filter(c=>c===a).length,1,'SETUP newly registered ordinarybox found once');
  c.setPosition(300.9,PLAYER.HEIGHT,-245.515);const p=physical(c),to=p.clone();to.z+=1.2;
  close(p.toArray(),[300.9,1.7,-245.515],'SETUP actualseed');assert.equal(contacts(p.toArray(),p.y-PLAYER.HEIGHT,f.finishedBoxes).length,0,'SETUP seed clean finishedfive');assert.equal(f.cm.checkCollision(p,.5),false,'SETUP initial ordinarybodyclean');assert.equal(f.cm.checkBoundary(p,.5)&&f.cm.checkRiverCrossing(p,.5),true,'SETUP worldguard');assert.equal(xiananGroundCovered(f.scene,p,to,.5,camera),true,'SETUP real sweptground');assert.equal(queryXiananContact(f.cm,p,to,.5,camera)?.status,'valid','SETUP originalsource andfinished remainvalid');
  c.lookAt(300.9,-240.1);camera.updateMatrixWorld(true);c.moveForward=true;c.moveRight=false;c.canSprint=false;
  const eligibility=[],originalVertical=c.updateGround;
  c.updateGround=function(dt,token){eligibility.push(motion.getXiananJumpEligibility(f.cm,token));return originalVertical.call(this,dt,token);};
  f.protocolRawFrames=raw;
  const observedTick=fps=>{const before={camera:camera.position.toArray(),bobOffset:c.bobOffset.toArray(),physical:physical(c).toArray()};tick(fps);raw.push({fps,before,after:{camera:camera.position.toArray(),bobOffset:c.bobOffset.toArray(),physical:physical(c).toArray(),vv:c.verticalVelocity,airborne:c.airborne}});};
  try{return run({f,c,camera,tick:observedTick,added,eligibility});}finally{c.updateGround=originalVertical;}
 });}catch(error){halted=error.message;save((process.env.XIANAN_STAGE_NAME??'PROTOCOL')+'-unexpected-case-'+caseId+'.json',{message:error.message,name:error.name,boxInputs,raw});throw error;}finally{f.dispose();}
}
export function inspectChain(f,c,before,{blocked=false,noLift=false}={}){
 const after=physical(c),s=motion.inspectXiananGroundedMotion(c);assert.ok(s!==null);close(s.startEye,before.toArray(),'observer physicalstart');close(s.endEye,after.toArray(),'observer physicalend');
 if(blocked){assert.equal(s.status,'blocked');assert.equal(s.committedSegments.length,0);return s;}
 assert.equal(s.status,'committed');assert.equal(s.commitMatched,true);let cursor=feet(before);
 for(const seg of s.committedSegments){close(seg.fromFeet,cursor,'chain connected');if(noLift)assert.notEqual(seg.kind,'lift','rejected lift must not enter chain');for(const box of f.finishedBoxes)assert.equal(hit(seg.fromFeet,seg.toFeet,box),false,'independent finishedfive sweep');for(const row of f.cm.colliders)assert.equal(hit(seg.fromFeet,seg.toFeet,plainBox(row.box),true),false,'independent ordinarybox sweep');cursor=seg.toFeet;}
 close(cursor,feet(after),'chain reaches actualend');return s;
}
