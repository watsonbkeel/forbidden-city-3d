import * as THREE from 'three';
import {PLAYER} from '../config/constants.js';

// The existing ordinary-body policy, not a newly lowered box or full-feet
// triangle claim. Endpoint bounds use exactly Collision.checkCollision's order.
function body(feet,r){const eyeY=feet.y+PLAYER.HEIGHT,actualFeet=eyeY-PLAYER.HEIGHT,bottom=actualFeet+.35,top=eyeY-.05,size=new THREE.Vector3(r*2,top-bottom,r*2),center=new THREE.Vector3(feet.x,(top+bottom)/2,feet.z);return new THREE.Box3().setFromCenterAndSize(center,size);}
function interiorSweep(a,b,solid){
 let enter=0,leave=1;
 for(const k of ['x','y','z']){
  // Two affine strict inequalities: lower(t)<solid.max, upper(t)>solid.min.
  for(const [v0,v1,limit,less] of [[a.min[k],b.min[k],solid.max[k],true],[a.max[k],b.max[k],solid.min[k],false]]){
   const v=v1-v0;
   if(v===0){if(less?v0>=limit:v0<=limit)return false;continue;}
   const t=(limit-v0)/v;
   if((v>0)===less)leave=Math.min(leave,t);else enter=Math.max(enter,t);
   if(enter>=leave)return false;
  }
 }
 return enter<leave&&enter<1&&leave>0;
}
export function wumenJointBodySweep(cm,fromFeet,toFeet,radius=.5){
 if(!cm||typeof cm.checkCollision!=='function'||typeof cm.queryBox!=='function'||![fromFeet,toFeet].every(p=>p?.isVector3&&p.toArray().every(Number.isFinite))||!Number.isFinite(radius)||radius<=0)throw TypeError('Wumen joint sweep requires raw manager and finite feet');
 const fromEye=fromFeet.clone();fromEye.y+=PLAYER.HEIGHT;const toEye=toFeet.clone();toEye.y+=PLAYER.HEIGHT;
 // Retain actual boundary, water, dynamic and existing triangle-sweep policies.
 if(cm.checkCollision(toEye,radius,fromEye))return{blocked:true,reason:'raw-collision'};
 const a=body(fromFeet,radius),b=body(toFeet,radius),broad=a.clone().union(b);
 for(const row of cm.queryBox(broad)){
  if(row.triangleSupport||row.xiqingRoofSurface)continue; // includes valid Duixiu triangle owners; raw sweep above is authoritative
  // An overhead-only or malformed non-triangle terrain row is unsupported here.
  if(row.overhead||row.duixiuTerrain)return{blocked:true,reason:'unsupported-foreign-curved-body',collider:row};
  if(interiorSweep(a,b,row.box))return{blocked:true,reason:'ordinary-continuous-sweep',collider:row};
 }
 return{blocked:false,reason:'clear'};
}
