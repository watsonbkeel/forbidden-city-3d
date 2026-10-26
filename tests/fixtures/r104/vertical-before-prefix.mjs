// Exact d96913eb vertical control flow, retained only as the pre-memo differential oracle.
// Shared pure collision primitives intentionally stay current: the only variable
// under test is same-call static-query reuse, not a second physics model.
import * as THREE from 'three';
import {PLAYER} from '../../../src/config/constants.js';
import {furnitureScope,furnitureContact,furnitureBodySweep,furnitureGroundWitness,furnitureBoxSweep} from '../../../src/controls/FurnitureMotion.js';
export function referenceRoofVertical(cm,state,delta,radius=.5){
  const from=new THREE.Vector3(state.x,state.feetY,state.z);
  if(!furnitureScope(cm,from,from,radius))return null;
  const contact=furnitureContact(cm,state.x,state.z,state.feetY,radius);
  if(!state.airborne&&contact.surface?.height===state.feetY)
    return{...state,groundY:state.feetY,verticalVelocity:0,onSupport:true,landed:false,blockedPose:!contact.poseClear};
  const velocity=Math.max((state.airborne?state.verticalVelocity:0)-(PLAYER.GRAVITY??14)*delta,-(PLAYER.MAX_FALL_SPEED??30));
  const to=new THREE.Vector3(state.x,state.feetY+velocity*delta,state.z);let impact=furnitureBodySweep(cm,from,to,radius);
  if(furnitureGroundWitness(cm,state.x,state.z,radius)&&velocity<=0&&to.y<0&&from.y>=0){const fraction=from.y/(from.y-to.y);if(!impact||fraction<impact.fraction)impact={fraction,kind:'ground'};}
  if(!impact)return{...state,feetY:to.y,groundY:contact.surface?.height??0,verticalVelocity:velocity,airborne:true,onSupport:false,landed:false};
  let feet=from.y+(to.y-from.y)*impact.fraction;
  // Exact static top is the source of truth, avoiding multiply/add rounding.
  if(impact.kind==='ground')feet=0;
  else if(impact.kind==='solid'&&impact.axis==='y'&&velocity<0&&!furnitureBoxSweep(from,from,impact.collider.box,radius))feet=impact.collider.box.max.y;
  // Use a representably clear prefix if an upward arithmetic roundtrip would
  // leave positive depth. This does not shrink the body or permit penetration.
  const at=new THREE.Vector3(state.x,feet,state.z);
  if(furnitureBodySweep(cm,from,at,radius)&&impact.fraction>0){let low=0,high=impact.fraction;for(let i=0;i<48;i++){const mid=(low+high)/2;at.y=from.y+(to.y-from.y)*mid;if(furnitureBodySweep(cm,from,at,radius))high=mid;else low=mid;}feet=from.y+(to.y-from.y)*low;}
  const final=furnitureContact(cm,state.x,state.z,feet,radius);
  const landed=velocity<=0&&impact.kind!=='dynamic'&&final.surface?.height===feet&&final.poseClear;
  return{...state,feetY:feet,groundY:final.surface?.height??0,verticalVelocity:0,airborne:!landed,onSupport:!!landed,landed:!!landed,blockedPose:!final.poseClear};
}
