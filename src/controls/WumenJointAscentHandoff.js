import * as THREE from 'three';
import {hasWumenJointAscentBinding,wumenJointAscentBindingIdentity} from './WumenJointAscentContact.js';
import {tryWumenJointGroundStep} from './WumenJointAscentMotion.js';

// Explicitly registered local experiment only. The vertical entry is called by
// FirstPerson; it is not a general actor-authentication API. No default installer.
const calls=new WeakMap(),pending=new WeakMap();
const fail=message=>{throw new TypeError(`Wumen joint handoff: ${message}`);};
export function beginWumenJointCall(cm,motion,feetY){
 calls.delete(cm);pending.delete(cm);
 if(!hasWumenJointAscentBinding(cm)||motion?.kind!=='player'||motion.airborne!==false||!Number.isFinite(feetY)||!Number.isFinite(motion.feetY))return;
 calls.set(cm,{eligible:true,originalFeet:motion.feetY,binding:wumenJointAscentBindingIdentity(cm)});
}
export function tryWumenJointCallStep(cm,from,to,radius){
 const call=calls.get(cm);if(!call)return null;
 if(call.binding!==wumenJointAscentBindingIdentity(cm)){abortWumenJointCall(cm);fail('registration generation changed during call');}
 call.proposal=null;
 const result=tryWumenJointGroundStep(cm,from,to,{kind:'player',airborne:false},radius);
 if(result.status==='OUTSIDE')return null;
 if(!call.eligible)return{status:'CHAIN_INTERRUPTED',accepted:false};
 if(result.status==='SUPPORTED')call.proposal=result;
 return result;
}
export function acceptedWumenJointStep(cm,result){
 const call=calls.get(cm);
 if(call&&call.binding!==wumenJointAscentBindingIdentity(cm)){abortWumenJointCall(cm);fail('registration generation changed before publication');}
 if(!call?.eligible||call.proposal!==result||result.status!=='SUPPORTED'||result.accepted!==true)fail('only accepted certified substeps may publish');
 call.proposal=null;
 pending.set(cm,{binding:call.binding,originalFeet:call.originalFeet,position:result.position.clone()});
}
export function acceptedWumenJointLegacyStep(cm){
 const call=calls.get(cm);if(call){call.eligible=false;call.proposal=null;}
 pending.delete(cm);
}
export function endWumenJointCall(cm){calls.delete(cm);}
export function abortWumenJointCall(cm){calls.delete(cm);pending.delete(cm);}
export function resolveWumenJointVertical(cm,state,delta,radius){
 const token=pending.get(cm);pending.delete(cm); // consumed even on error/air
 const binding=wumenJointAscentBindingIdentity(cm);
 if(token&&token.binding!==binding)fail('registration generation changed before consumption');
 if(!binding)return null;
 if(state.airborne)return null;
 if(![state.x,state.z,state.feetY,state.groundY,state.verticalVelocity,delta].every(Number.isFinite)||delta<0)fail('finite complete FirstPerson state required');
 if(token&&(state.x!==token.position.x||state.z!==token.position.z||state.feetY!==token.originalFeet||state.verticalVelocity!==0))fail('single-call pose/state mismatch');
 const feet=token?token.position.clone():new THREE.Vector3(state.x,state.feetY,state.z);
 const result=tryWumenJointGroundStep(cm,feet,feet,{kind:'player',airborne:false},radius);
 if(result.status==='OUTSIDE'){
  if(token)fail('handoff left its actual support domain');
  return null;
 }
 if(result.status!=='SUPPORTED'||state.verticalVelocity!==0)fail(`unimplemented vertical state ${result.status}`);
 return{feetY:result.feetY,groundY:result.feetY,airborne:false,verticalVelocity:0,onSupport:true,landed:false,wumenJointHandoff:!!token};
}
