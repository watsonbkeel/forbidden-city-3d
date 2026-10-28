import * as THREE from 'three';
import {furnitureScope,furnitureBodySweep} from '../../controls/FurnitureMotion.js';
import {PLAYER} from '../../config/constants.js';
import {SharedRestNavigation,SHARED_REST_PATHS} from './SharedRestNavigation.js';
import {SHARED_REST_IDS} from './SharedRestSlots.js';
import {characterBody,bodiesIntersect,sweptBodiesIntersect,sweptBodyIntersectsPlayer} from './CharacterBody.js';
const sample=(position,rotationYRad=0,speedMetersPerSecond=0)=>({position:[...position],rotationYRad,speedMetersPerSecond});
/** Exactly two actors and two stable slots, on a single reversible checked
 * polyline each. Time changes reverse from the current position, never route 0. */
export class SharedRestRoutine {
 constructor(owner){this.owner=owner;this.navigation=new SharedRestNavigation(owner.world,owner.registry);this.states=[];}
 get status(){return this.navigation.status;}
 prepareState(state){if(!SHARED_REST_IDS.includes(state.actor.id)||!this.navigation.seeds.has(state.actor.id))return false;if(!state.binding)state.binding=this.navigation.seeds.get(state.actor.id);state.pending=false;return true;}
 safe(beforeActor,before,afterActor,after){if(!this.owner.safeTransfer(beforeActor,before,afterActor,after))return false;return this.states.every(s=>{if(s.actor.id===afterActor.id||!s.binding)return true;const other=characterBody(s.actor,this.owner.current(s));return!bodiesIntersect(characterBody(afterActor,after),other)&&!sweptBodiesIntersect(characterBody(beforeActor,before),characterBody(beforeActor,after),other)&&!sweptBodiesIntersect(characterBody(afterActor,before),characterBody(afterActor,after),other);});}
 update(states,dt,night){
  this.states=states.filter(s=>SHARED_REST_IDS.includes(s.actor.id));for(const state of this.states)this.prepareState(state);const valid=this.navigation.validate(this.states.filter(s=>s.binding).map(s=>this.owner.current(s).position));
  for(const state of this.states){this.prepareState(state);if(!state.binding)continue;const current=this.owner.current(state);state.routineRenderable=valid&&this.navigation.renderable(current.position);if(!valid){if(state.routineSample)state.routineSample={...state.routineSample,speedMetersPerSecond:0};this.owner.stats.waiting++;continue;}
   if(!state.routine&&night){const original=state.actor,points=SHARED_REST_PATHS.get(original.id),standing=this.owner.effective(original),first=sample(points[0],current.rotationYRad);
    // A validated S asset can bake a profile height to a slightly higher F32
    // plane. Bind the first standing sample to that actual source as movement
    // already does; never change X/Z, the body, the route, or its tolerance.
    if(original.id===SHARED_REST_IDS[0]&&this.navigation.taiheReplacement){const y=this.navigation.surfaceHeight(first.position[0],first.position[2],first.position[1],.45);if(!Number.isFinite(y)){this.owner.stats.waiting++;continue;}first.position[1]=Math.max(first.position[1],y);}
    if(!this.safe(original,current,standing,first)){this.owner.stats.waiting++;continue;}state.dayActor=original;state.routine={kind:'shared-rest',phase:'to-bed',points,index:1,direction:1,originalBinding:state.binding,originalPatrol:state.patrol,daySample:current};state.actor=standing;state.patrol=null;state.routineSample=first;}
   const r=state.routine;if(r?.kind!=='shared-rest')continue;
   const direction=night?1:-1;
   if(direction!==r.direction){const actor=this.owner.effective(state.dayActor),point=state.routineSample;if(!this.safe(state.actor,point,actor,point)){this.owner.stats.waiting++;continue;}state.actor=actor;r.index+=direction;r.direction=direction;r.phase=night?'to-bed':'return';}
   if(r.phase==='sleeping'){r.sourceIdentity=this.navigation.bedIdentity;this.owner.stats.sleeping++;continue;}
   if(r.index>=r.points.length){const slot=this.navigation.slots.find(s=>s.actorId===state.actor.id),actor=this.owner.effective(state.dayActor,'sleeping'),point=sample(slot.position,slot.rotationYRad);if(!this.safe(state.actor,state.routineSample,actor,point)){this.owner.stats.waiting++;continue;}state.actor=actor;state.routineSample=point;r.slotId=slot.id;r.sourceIdentity=this.navigation.bedIdentity;r.phase='sleeping';this.owner.stats.sleeping++;continue;}
   if(r.index<0){if(this.safe(state.actor,state.routineSample,state.dayActor,r.daySample))this.owner.finishDay(state);else this.owner.stats.waiting++;continue;}
   this.advance(state,dt);state.routineRenderable=this.navigation.renderable(state.routineSample.position);
  }
 }
 advance(state,dt){
  const r=state.routine,nav=this.navigation.nav,speed=state.actor.id===SHARED_REST_IDS[0]?PLAYER.SPRINT_SPEED:.65,radius=state.actor.id===SHARED_REST_IDS[0]?.36:.30,supportRadius=Math.max(radius,.34);
  let remaining=speed*Math.max(0,Math.min(Number.isFinite(dt)?dt:0,.1)),steps=0;
  state.routineSample={...state.routineSample,speedMetersPerSecond:0};
  const wait=()=>{this.owner.stats.waiting++;if(this.navigation.status!=='ready')state.routineRenderable=false;};
  while(remaining>1e-9&&r.index>=0&&r.index<r.points.length&&steps++<128){
   const old=state.routineSample,target=r.points[r.index],dx=target[0]-old.position[0],dz=target[2]-old.position[2],d=Math.hypot(dx,dz);
   if(d<.015){r.index+=r.direction;continue;}
   const amount=Math.min(d,remaining,.15),t=amount/d,proposed=sample([old.position[0]+dx*t,old.position[1],old.position[2]+dz*t],Math.atan2(dx,dz),speed);
   const fromEye=new THREE.Vector3(old.position[0],old.position[1]+PLAYER.HEIGHT,old.position[2]),goal=new THREE.Vector3(proposed.position[0],fromEye.y,proposed.position[2]);
   const actual=this.navigation.surfaceHeight(goal.x,goal.z,old.position[1],.45);if(Number.isNaN(actual)){wait();return;}
   const support=Math.max(nav.supportHeight(goal.x,goal.z,old.position[1]+PLAYER.STEP_UP,supportRadius),actual),liftStart=Math.max(old.position[1],support);
   // The unchanged engineering solver cannot certify its old exact 2.00m
   // ground when the finished slab is 2.02m. Here the verified actual surface
   // owns the lift/settle; the existing solver retains horizontal collision.
   // R129 includes the actual Taihe prefix instead of a geographic 59.1m cut.
   const eye=nav.getValidPosition(new THREE.Vector3(fromEye.x,liftStart+PLAYER.HEIGHT,fromEye.z),goal,radius,liftStart,PLAYER.STEP_UP,liftStart,null);
   const floor=Math.max(nav.getGroundHeight(eye.x,eye.z,old.position[1],PLAYER.STEP_UP,radius),nav.supportHeight(eye.x,eye.z,old.position[1]+PLAYER.STEP_UP,supportRadius),this.navigation.surfaceHeight(eye.x,eye.z,old.position[1],.45));
   if(!Number.isFinite(floor)){wait();return;}
   eye.y=floor+PLAYER.HEIGHT;proposed.position=[eye.x,floor,eye.z];
   const travel=Math.hypot(eye.x-old.position[0],eye.z-old.position[2]),a=characterBody(state.actor,old),b=characterBody(state.actor,proposed),lift=Math.max(old.position[1],floor);
   const before=new THREE.Vector3(...old.position),raised=new THREE.Vector3(old.position[0],lift,old.position[2]),across=new THREE.Vector3(eye.x,lift,eye.z),settled=new THREE.Vector3(eye.x,floor,eye.z);
   const scoped=furnitureScope(nav,fromEye,eye,radius),blockedStep=scoped&&(furnitureBodySweep(nav,before,raised,radius)||furnitureBodySweep(nav,raised,across,radius)||furnitureBodySweep(nav,across,settled,radius));
   if(blockedStep||travel<.0001||floor-old.position[1]>PLAYER.STEP_UP+.001||nav.checkCollision(eye,radius)||sweptBodyIntersectsPlayer(a,b,this.owner.playerState())||this.states.some(s=>s!==state&&s.binding&&sweptBodiesIntersect(a,b,characterBody(s.actor,this.owner.current(s))))){wait();return;}
   state.routineSample=proposed;remaining-=travel;if(Math.hypot(eye.x-target[0],eye.z-target[2])<.015)r.index+=r.direction;
  }
  this.owner.stats.travelling++;
 }
 dispose(){this.navigation.dispose();this.states=[];}
}
