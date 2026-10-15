import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
import {PLAYER} from '../../src/config/constants.js';

/** CPU adapter for the UNCHANGED legacy waypoint protocol: radius/speeds,
 * 0.8m arrival, inertia and stuck budgets remain production values. The only
 * spawn difference is intentional feet=0 instead of the legacy high drop.
 * The backwards variation uses real S input. No snapping, braking or rescue. */
export function replayQinanExterior(t,W,pts,{fps=60,sprint=false,backward=false,recordFrames=false}={}) {
 const noop=()=>{},savedDoc=globalThis.document,savedWindow=globalThis.window;
 const doc={...savedDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};
 globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
 let time=0;const clock=t.mock.method(performance,'now',()=>time);
 const camera=new W.THREE.PerspectiveCamera(),controls=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},W.cm);
 controls.controls.isLocked=true;controls.setPosition(pts[0][0],PLAYER.HEIGHT,pts[0][1]);
 controls.moveForward=!backward;controls.moveBackward=backward;controls.canSprint=sprint;
 const startFeet=controls.feetY,frames=[],waypoints=[];let maxFeet=0,minFeet=0,maxSpeed=0,arrived=true,stuckAt=null,collisionFrames=0;
 try {
  for(let k=1;k<pts.length;k++) {
   const [x,z]=pts[k],limit=Math.ceil(Math.hypot(x-camera.position.x,z-camera.position.z)/2*fps)+fps*4;
   let stuck=0,last=[camera.position.x,camera.position.z],reached=false;
   for(let frame=0;frame<limit;frame++) {
    time+=1000/fps;camera.lookAt(backward?2*camera.position.x-x:x,camera.position.y,backward?2*camera.position.z-z:z);controls.update();
    const p=camera.position,physical=new W.THREE.Vector3(p.x-controls.bobOffset.x,controls.feetY+PLAYER.HEIGHT,p.z-controls.bobOffset.z);
    maxFeet=Math.max(maxFeet,controls.feetY);minFeet=Math.min(minFeet,controls.feetY);maxSpeed=Math.max(maxSpeed,controls.motion.speed);
    if(W.cm.checkCollision(physical,.5))collisionFrames++;
    if(recordFrames)frames.push({time:time/1000,x:physical.x,z:physical.z,feet:controls.feetY,ground:controls.groundY,airborne:controls.airborne,onSupport:controls.onSupport,verticalVelocity:controls.verticalVelocity,speed:controls.motion.speed,waypoint:k});
    if(Math.hypot(p.x-x,p.z-z)<.8){reached=true;waypoints.push({index:k,target:pts[k],actual:[physical.x,physical.z],feet:controls.feetY});break;}
    if(frame%fps===0&&frame>0){stuck=Math.hypot(p.x-last[0],p.z-last[1])<.3?stuck+1:0;last=[p.x,p.z];if(stuck>=2)break;}
   }
   if(!reached){arrived=false;stuckAt=pts[k];break;}
  }
  return {arrived,stuckAt,startFeet,maxFeet,minFeet,maxSpeed,collisionFrames,end:[camera.position.x-controls.bobOffset.x,camera.position.z-controls.bobOffset.z,controls.feetY],waypoints,
   waypointDriver:'legacy-0.8m-unchanged',spawn:'explicit-world-ground',fps,sprint,backward,...(recordFrames?{frames}:{})};
 }finally{controls.dispose();clock.mock.restore();globalThis.document=savedDoc;globalThis.window=savedWindow;}
}
