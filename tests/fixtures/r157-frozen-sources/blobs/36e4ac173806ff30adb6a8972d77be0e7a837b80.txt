import {characterBody, bodyIntersectsPlayer, sweptBodyIntersectsPlayer} from './CharacterBody.js';
import {characterQualityEligibleIds} from './CharacterLOD.js';

/** Owns committed route time and the pedestrian body channel, never architecture.
 * Formation clocks stop together. Retreat is only backwards on the same checked
 * polyline, not an unvalidated lateral sidestep or teleport around the player. */
export class CharacterInteraction {
 constructor({collisionManager,getPlayerState,registry}){
  this.cm=collisionManager;this.getPlayerState=getPlayerState;this.registry=registry;
  this.groups=new Map();this.samples=new Map();this.player=null;this.last={bodies:0,blockedGroups:0,retreatingGroups:0,activationWaiting:0};
  for(const actor of registry.actors)if(actor.placement?.mode==='path')this.groups.set(actor.placement.pathRef,{time:0,blockedSeconds:0,retreat:false,retreatMeters:0});
 }
 begin(states,elapsed){
  states=this.states=[...states];
  elapsed=Number.isFinite(elapsed)?Math.max(0,Math.min(.1,elapsed)):0;
  const supplied=this.getPlayerState?.();
  this.player=supplied&&Array.isArray(supplied.position)&&supplied.position.length===3&&supplied.position.every(Number.isFinite)&&Number.isFinite(supplied.radius)&&supplied.radius>0&&Number.isFinite(supplied.height)&&supplied.height>0?{...supplied,position:[...supplied.position]}:null;
  this.samples.clear();this.last.blockedGroups=0;this.last.retreatingGroups=0;this.last.activationWaiting=0;
  const readyGroups=new Map();
  for(const state of states){
   if(!state.binding)continue;
   if(state.routineSample){this.samples.set(state.actor.id,state.routineSample);continue;}
   if(state.patrol){const key=state.actor.placement.pathRef;if(!readyGroups.has(key))readyGroups.set(key,[]);readyGroups.get(key).push(state);}
   else this.samples.set(state.actor.id,{position:state.binding.position,rotationYRad:state.binding.rotationYRad,speedMetersPerSecond:0});
  }
  for(const [key,group]of this.groups){
   const members=readyGroups.get(key)??[];
   if(!members.length){group.time+=elapsed;continue;}
   const sampleAt=(state,time)=>state.patrol.sample(Math.max(0,time),state.actor.behavior?.followerIndex??0);
   // Keep the actual last displayed heading when stopped or changing direction.
   // Testing a forward-facing body and then publishing a reversed body is unsafe
   // on steps, where only the asymmetric lower leg capsule may overlap.
   const current=members.map(state=>state.interactionActivated&&state.interactionSample?state.interactionSample:sampleAt(state,group.time));
   const proposal=(state,time,direction)=>{const sample=sampleAt(state,time);if(direction<0)sample.rotationYRad+=Math.PI;return sample;};
   const safe=(time,direction)=>!this.player||members.every((state,i)=>!sweptBodyIntersectsPlayer(characterBody(state.actor,current[i]),characterBody(state.actor,proposal(state,time,direction)),this.player));
   const playerFar=!this.player||current.every(sample=>Math.hypot(sample.position[0]-this.player.position[0],sample.position[2]-this.player.position[2])>1.8);
   // No minimum-retreat latch: a route-start boundary may offer less than .6m.
   // A pedestrian leaving always permits a checked forward proposal to resume.
   if(group.retreat&&playerFar){group.retreat=false;group.blockedSeconds=0;group.retreatMeters=0;}
   let direction=group.retreat?-1:1,next=Math.max(0,group.time+elapsed*direction),moved=false;
   if(safe(next,direction)){moved=next!==group.time;group.blockedSeconds=0;}
   else{
    this.last.blockedGroups++;group.blockedSeconds+=elapsed;next=group.time;
    // A stationary pedestrian gets room without being pushed. Never reverse
    // through a middle/rear formation member: every member sweep must be clear.
    if(!group.retreat&&group.blockedSeconds>=.8&&group.time>elapsed&&safe(group.time-elapsed,-1)){
     group.retreat=true;direction=-1;next=group.time-elapsed;moved=elapsed>0;
    }
   }
   if(group.retreat){this.last.retreatingGroups++;if(moved)group.retreatMeters+=elapsed*(members[0].actor.behavior.speedMetersPerSecond??.75);}
   group.time=next;
   for(let i=0;i<members.length;i++){
    const state=members[i],sample=moved?proposal(state,group.time,direction):{...current[i]};
    if(!moved)sample.speedMetersPerSecond=sample.speed=0;
    this.samples.set(state.actor.id,sample);state.interactionSample=sample;
   }
  }
  for(const state of states){
   const sample=this.samples.get(state.actor.id);if(!sample)continue;
   // A late binding/teleport cannot materialize a body around the pedestrian.
   // Required IDs remain loaded and diagnosable, not deleted from coverage.
   if(!state.interactionActivated&&bodyIntersectsPlayer(characterBody(state.actor,sample),this.player)){
    this.samples.delete(state.actor.id);state.readiness=0;this.last.activationWaiting++;
   }else state.interactionActivated=true;
  }
 }
 nearby(sample){return !!this.player&&Math.hypot(sample.position[0]-this.player.position[0],sample.position[2]-this.player.position[2])<4&&Math.abs(sample.position[1]-this.player.position[1])<2.5;}
 commit(states,selected,quality){
  const chosen=new Set(selected.map(a=>a.id)),eligible=characterQualityEligibleIds(this.registry.actors,quality),bodies=[];
  for(const state of states){const sample=this.samples.get(state.actor.id);
   if(state.routineRenderable===false||!sample||!state.binding||!state.interactionActivated||state.readiness<=0||!eligible.has(state.actor.id)){state.interactionActivated=false;continue;}
   // Frustum never removes near physical presence. If an actual render budget
   // cannot submit a nearby actor, it must not become an invisible obstacle.
   if(this.nearby(sample)&&!chosen.has(state.actor.id)){state.interactionActivated=false;continue;}
   bodies.push(characterBody(state.actor,sample));
  }
  this.cm?.setDynamicBodies?.(this,bodies);this.last.bodies=bodies.length;
 }
 clear(){this.cm?.clearDynamicBodies?.(this);this.samples.clear();for(const state of this.states??[])state.interactionActivated=false;this.last.bodies=0;}
 dispose(){this.clear();this.groups.clear();}
}
