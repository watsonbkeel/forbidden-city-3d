import * as THREE from 'three';
import emperorRoute from '../../../data/characters/emperor-night-route.json' with {type:'json'};
import routes from '../../../data/characters/night-routes.json' with {type:'json'};
import {NIGHT_BEDS} from './NightBeds.js';
import {isRestTime,routineRole} from './DailyRoutineClock.js';
import {characterBody,bodyIntersectsPlayer,sweptBodyIntersectsPlayer} from './CharacterBody.js';
import {staticRoutineNavigation} from './RoutinePath.js';
import {PLAYER} from '../../config/constants.js';
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const sample=(position,rotationYRad=0,speed=0)=>({position:[...position],rotationYRad,speedMetersPerSecond:speed});
/** Requested game routine. Stable IDs, checked routes, no midnight despawning.
 * Transitioning a posture is discrete and occupancy-checked; walking itself is
 * continuous, and a blocked player pauses progress rather than being crossed. */
export class DailyRoutine {
 constructor({world,collisionManager,interaction,registry}){Object.assign(this,{world,cm:collisionManager,interaction,registry});this.beds=new Map(NIGHT_BEDS.filter(b=>b.actorId).map(b=>[b.actorId,b]));this.paths=new Map(routes.paths.map(p=>[p.bedId,p.points]));this.night=false;this.stats={sleeping:0,travelling:0,duty:0,waiting:0};}
 effective(original,pose='standing') {return{...original,placement:{mode:'path',pathRef:`routine:${original.id}`},behavior:{...original.behavior,basePose:pose,seatVariant:'standard',followerIndex:0}};}
 reset(states){for(const state of states){if(state.dayActor)state.actor=state.dayActor;delete state.routine;delete state.routineSample;delete state.dayActor;}}
 current(state){return state.routineSample??state.interactionSample??sample(state.binding.position,state.binding.rotationYRad);}
 playerState(){return this.interaction?.getPlayerState?this.interaction.getPlayerState():this.interaction?.player;}
 safePose(actor,point){return!bodyIntersectsPlayer(characterBody(actor,point),this.playerState());}
 safeTransfer(beforeActor,before,afterActor,after){
  const player=this.playerState();
  return this.safePose(afterActor,after)&&!sweptBodyIntersectsPlayer(characterBody(beforeActor,before),characterBody(beforeActor,after),player)&&!sweptBodyIntersectsPlayer(characterBody(afterActor,before),characterBody(afterActor,after),player);
 }
 beginBed(state){
  const bed=this.beds.get(state.actor.id),path=this.paths.get(bed?.id);if(!bed||!path)return false;
  const original=state.actor,current=this.current(state),points=[];
  if(state.patrol){
   // Join the fixed night route by retracing the already validated daytime
   // polyline to its first vertex, not cutting across the courtyard.
   const day=state.patrol.points;let nearest=0,best=Infinity;
   for(let i=1;i<day.length;i++){const a=day[i-1],b=day[i],v=b.map((x,k)=>x-a[k]),l=v.reduce((s,x)=>s+x*x,0),t=Math.max(0,Math.min(1,v.reduce((s,x,k)=>s+x*(current.position[k]-a[k]),0)/l));const d=distance(current.position,a.map((x,k)=>x+v[k]*t));if(d<best){best=d;nearest=i-1;}}
   points.push([...current.position],...day.slice(0,nearest+1).reverse().map(p=>[...p]));
  }
  points.push(...path.map(p=>[...p]));
  const actor=this.effective(original),first=points[0],standing=sample(first,current.rotationYRad);
  if(!this.safeTransfer(original,current,actor,standing))return false;
  state.dayActor=original;
  state.routine={kind:'bed',bed,points,reversePoints:points.map(p=>[...p]).reverse(),index:1,phase:'to-bed',originalBinding:state.binding,originalPatrol:state.patrol,
   dayClock:this.interaction?.groups.get(original.placement?.pathRef)?.time,daySample:current};
  state.actor=actor;state.patrol=null;state.routineSample=standing;return true;
 }
 beginWork(state){
  const original=state.actor,current=this.current(state),actor=this.effective(original),points=emperorRoute.points.map(p=>[...p]),standing=sample(points[0],current.rotationYRad);
  if(!this.safeTransfer(original,current,actor,standing))return false;
  state.dayActor=original;state.routine={kind:'work',phase:'to-work',points,index:1,originalBinding:state.binding,originalPatrol:null,daySample:current};
  state.actor=actor;state.patrol=null;state.routineSample=standing;return true;
 }
 beginDuty(state){
  if(state.patrol||state.actor.behavior.basePose!=='standing')return;
  const current=this.current(state),start=current.position,nav=this.nav;
  for(const [dx,dz]of [[1.2,0],[-1.2,0],[0,1.2],[0,-1.2],[.85,.85],[-.85,-.85]]){
   const eye=new THREE.Vector3(start[0],start[1]+PLAYER.HEIGHT,start[2]),target=eye.clone().add(new THREE.Vector3(dx,0,dz));
   const p=nav.getValidPosition(eye,target,.36,start[1],PLAYER.STEP_UP,null,{kind:'kinematic',airborne:false});if(Math.hypot(p.x-target.x,p.z-target.z)>.02||Math.abs(p.y-PLAYER.HEIGHT-start[1])>.15)continue;
   state.dayActor=state.actor;state.routine={kind:'duty',phase:'duty',points:[[...start],[p.x,p.y-PLAYER.HEIGHT,p.z]],index:1,originalBinding:state.binding,originalPatrol:null,daySample:current};state.routineSample=sample(start,current.rotationYRad);return;
  }
 }
 finishDay(state){
  const r=state.routine,actor=state.dayActor,point=r.daySample;
  if(!this.safeTransfer(state.actor,state.routineSample,actor,point)){this.stats.waiting++;return false;}
  state.actor=actor;state.binding=r.originalBinding;state.patrol=r.originalPatrol;state.interactionSample=point;
  const group=this.interaction?.groups.get(actor.placement?.pathRef);if(group&&Number.isFinite(r.dayClock))group.time=r.dayClock;
  delete state.routine;delete state.routineSample;delete state.dayActor;return true;
 }
 /** Consume distance, not one waypoint per frame. The same .1s frame cap as
  * FirstPerson/CharacterManager plus <=.15m static sweeps prevents low-FPS
  * shortcuts across walls, stair supports or the player's occupied body. */
 advanceWork(state, dt) {
  const r=state.routine, speed=PLAYER.SPRINT_SPEED, radius=.36;
  let remaining=speed*Math.max(0,Math.min(Number.isFinite(dt)?dt:0,.1));
  state.routineSample={...state.routineSample,speedMetersPerSecond:0};
  let substeps=0;
  while(remaining>1e-9&&r.index<r.points.length&&substeps++<128){
   const old=state.routineSample,target=r.points[r.index];
   const dx=target[0]-old.position[0],dz=target[2]-old.position[2],d=Math.hypot(dx,dz);
   if(d<.015){r.index++;continue;}
   const amount=Math.min(d,remaining,.15),t=amount/d;
   const proposed=sample([old.position[0]+dx*t,old.position[1],old.position[2]+dz*t],Math.atan2(dx,dz),speed);
   const previousEye=new THREE.Vector3(old.position[0],old.position[1]+PLAYER.HEIGHT,old.position[2]);
   const goal=new THREE.Vector3(proposed.position[0],previousEye.y,proposed.position[2]);
   const support=this.nav.supportHeight(goal.x,goal.z,old.position[1]+PLAYER.STEP_UP,radius);
   const eye=this.nav.getValidPosition(previousEye,goal,radius,old.position[1],PLAYER.STEP_UP,Math.max(old.position[1],support),{kind:'kinematic',airborne:false});
   const floor=Math.max(this.nav.getGroundHeight(eye.x,eye.z,old.position[1],PLAYER.STEP_UP,radius),this.nav.supportHeight(eye.x,eye.z,old.position[1]+PLAYER.STEP_UP,radius));
   eye.y=floor+PLAYER.HEIGHT;proposed.position=[eye.x,floor,eye.z];
   const travelled=Math.hypot(eye.x-old.position[0],eye.z-old.position[2]);
   const blocked=travelled<.0001||floor-old.position[1]>PLAYER.STEP_UP+.001||
    sweptBodyIntersectsPlayer(characterBody(state.actor,old),characterBody(state.actor,proposed),this.playerState())||this.nav.checkCollision(eye,radius);
   if(blocked){state.routineSample={...old,speedMetersPerSecond:0};this.stats.waiting++;return;}
   state.routineSample=proposed;remaining-=travelled;
   if(Math.hypot(eye.x-target[0],eye.z-target[2])<.015)r.index++;
  }
  this.stats.travelling++;
 }
 update(states,dt,beijingTime){
  this.night=isRestTime(beijingTime);this.stats={sleeping:0,travelling:0,duty:0,waiting:0};
  if(!this.cm)return;
  this.nav=staticRoutineNavigation(this.cm);
  for(const state of states){
   if(!state.binding)continue;
   if(state.routine&&this.world.isZoneReady&&!this.world.isZoneReady(state.dayActor.zoneRef)){this.reset([state]);state.binding=null;continue;}
   const role=routineRole(state.dayActor??state.actor);
   if(!state.routine&&this.night){if(role==='rest')this.beginBed(state);else if(role==='night-duty')this.beginDuty(state);else if(role==='work-transfer')this.beginWork(state);}
   const r=state.routine;if(!r)continue;
   if(!this.night&&r.phase!=='return'){
    const actor=this.effective(state.dayActor),departure=r.phase==='working'?sample(r.points.at(-1),Math.PI):state.routineSample;if(!this.safeTransfer(state.actor,state.routineSample,actor,departure)){this.stats.waiting++;continue;}
    state.routineSample=departure;
    if(r.kind==='bed'||r.kind==='work'){const back=r.points.slice(0,r.index).reverse();if(r.kind==='bed'&&state.dayActor.behavior.basePose==='seated'&&back.length>1)back.pop();r.points=[state.routineSample.position,...back];r.index=1;}
    else {r.points=[state.routineSample.position,r.daySample.position];r.index=1;}
    state.actor=actor;r.phase='return';
   }
   if(r.phase==='sleeping'){this.stats.sleeping++;continue;}
   if(r.phase==='working'){this.stats.working=1;continue;}
   const target=r.points[r.index];
   if(!target){
    if(r.phase==='return'){this.finishDay(state);continue;}
    if(r.kind==='work'){const actor=this.effective(state.dayActor,'seated');actor.behavior.seatVariant=emperorRoute.nightSeat.seatVariant;const point=sample(emperorRoute.nightSeat.position,emperorRoute.nightSeat.rotationYRad);if(!this.safeTransfer(state.actor,state.routineSample,actor,point)){this.stats.waiting++;continue;}state.actor=actor;state.routineSample=point;r.phase='working';this.stats.working=1;continue;}
    if(r.kind==='bed'){
     const actor=this.effective(state.dayActor,'sleeping'),point=sample([r.bed.x,r.bed.floorY+.60,r.bed.z],r.bed.rotationYRad);
     if(!this.safeTransfer(state.actor,state.routineSample,actor,point)){this.stats.waiting++;continue;}
     state.actor=actor;state.routineSample=point;r.phase='sleeping';this.stats.sleeping++;continue;
    }
    r.points.reverse();r.index=1;continue;
   }
   if(r.kind==='work'){this.advanceWork(state,dt);continue;}
   const old=state.routineSample,d=Math.hypot(old.position[0]-target[0],old.position[2]-target[2]),amount=Math.min(d,(r.kind==='duty'?.40:.65)*dt),t=d?amount/d:1;
   const proposed=sample(old.position.map((v,i)=>v+(target[i]-v)*t),Math.atan2(target[0]-old.position[0],target[2]-old.position[2]),amount>0?(r.kind==='duty'?.40:.65):0);
   const radius=['consort-daily','maid-daily'].includes(state.actor.templateId)?.30:.36;
   const previousEye=new THREE.Vector3(old.position[0],old.position[1]+PLAYER.HEIGHT,old.position[2]);
   const goal=new THREE.Vector3(proposed.position[0],previousEye.y,proposed.position[2]);
   const stepFloor=Math.max(old.position[1],this.nav.supportHeight(goal.x,goal.z,old.position[1]+PLAYER.STEP_UP,radius));
   const eye=this.nav.getValidPosition(previousEye,goal,radius,old.position[1],PLAYER.STEP_UP,stepFloor,{kind:'kinematic',airborne:false});
   if(d>.001&&Math.hypot(eye.x-old.position[0],eye.z-old.position[2])<.0001){this.stats.waiting++;continue;}
   let floor=Math.max(this.nav.getGroundHeight(eye.x,eye.z,old.position[1],PLAYER.STEP_UP,radius),this.nav.supportHeight(eye.x,eye.z,old.position[1]+PLAYER.STEP_UP,radius));
   if(floor-old.position[1]>PLAYER.STEP_UP+.001){this.stats.waiting++;continue;}
   floor=Math.max(floor,old.position[1]-3*dt);
   eye.y=floor+PLAYER.HEIGHT;proposed.position=[eye.x,floor,eye.z];
   const a=characterBody(state.actor,old),b=characterBody(state.actor,proposed),player=this.interaction?.getPlayerState?.();
   if(sweptBodyIntersectsPlayer(a,b,player)||this.nav.checkCollision(eye,radius)){
    state.routineSample={...old,speedMetersPerSecond:0};this.stats.waiting++;continue;
   }
   state.routineSample=proposed;if(Math.hypot(eye.x-target[0],eye.z-target[2])<.015)r.index++;
   this.stats[r.kind==='duty'?'duty':'travelling']++;
  }
 }
}
