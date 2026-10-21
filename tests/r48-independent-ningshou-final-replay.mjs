/** Portable R48 independent final-six audit, original product 8b974ee.
 * Architectural kit/world tests intentionally use library() from the stub
 * fixture. Real Draco GLB decoding does NOT make that a real TextureLibrary
 * rendering test. See docs/current-state/r48-independent-ningshou-final/REVIEW.md.
 * Test execution writes no reports or production files.
 */
import { FirstPersonControls } from '../src/controls/FirstPerson.js';
import { PLAYER } from '../src/config/constants.js';
import { createPhysicalWaypointDriver } from './lib/physical-waypoints.mjs';

export function replayTerrace(t,W,points,{fps=60,sprint=false,backward=false,recordFrames=false,onBlocked=null}={}) {
  const oldDoc=globalThis.document,oldWindow=globalThis.window,noop=()=>{};
  const doc={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};
  globalThis.document=doc;globalThis.window={addEventListener:noop,removeEventListener:noop};
  let now=0;const clock=t.mock.method(performance,'now',()=>now);
  const camera=new W.THREE.PerspectiveCamera();
  const controls=new FirstPersonControls(camera,{ownerDocument:doc,addEventListener:noop,removeEventListener:noop},W.cm);
  controls.controls.isLocked=true;
  controls.setPosition(points[0][0],PLAYER.HEIGHT,points[0][1]);
  const startFeet=controls.feetY;
  controls.moveForward=!backward;controls.moveBackward=backward;controls.canSprint=sprint;
  let maxFeet=0;
  const frames=[];
  try {
    const physical=()=>[camera.position.x-controls.bobOffset.x,camera.position.z-controls.bobOffset.z];
    let driver=createPhysicalWaypointDriver(points); let blockedEvents=0;
    let legFrames=0,stuck=0,last=physical(),maxSpeed=0;
    while(!driver.complete) {
      const before=physical(),command=driver.command(before,sprint),[x,z]=command.target;
      controls.canSprint=command.canSprint;
      now+=1000/fps;
      // Mouse aim is based on the unbobbed physical position, and continuous
      // collinear stair contacts do not cause artificial direction reversals.
      camera.position.sub(controls.bobOffset);
      camera.lookAt(backward?2*camera.position.x-x:x,camera.position.y,backward?2*camera.position.z-z:z);
      camera.position.add(controls.bobOffset);
      camera.updateMatrixWorld(true);
      controls.update();maxFeet=Math.max(maxFeet,controls.feetY);
      const after=physical();
      maxSpeed=Math.max(maxSpeed,controls.motion.speed);
      if(recordFrames)frames.push({time:now/1000,x:after[0],z:after[1],feet:controls.feetY,ground:controls.groundY,
        speed:controls.motion.speed,sprintInput:controls.canSprint,waypoint:driver.index});
      if(driver.observe(before,after)){legFrames=0;stuck=0;last=after;continue;}
      const k=driver.index;
      legFrames++;
      if(legFrames%fps===0){stuck=Math.hypot(after[0]-last[0],after[1]-last[1])<.3?stuck+1:0;last=after;}
      const limit=Math.ceil(Math.hypot(points[k][0]-points[k-1][0],points[k][1]-points[k-1][1])/2*fps)+fps*4;
      if((stuck>=2||legFrames>=limit)&&onBlocked&&blockedEvents===0){blockedEvents++;points=onBlocked(after);driver=createPhysicalWaypointDriver(points);legFrames=0;stuck=0;last=after;continue;}
      if(stuck>=2||legFrames>=limit)return{arrived:false,blockedEvents,stuckAt:points[k],startFeet,maxFeet,maxSpeed,driver:driver.diagnostics,...(recordFrames?{frames}:{}),end:[camera.position.x,camera.position.z,controls.feetY]};
    }
    controls.moveForward=false;controls.moveBackward=false;
    for(let i=0;i<fps*2;i++){now+=1000/fps;controls.update();}
    return{arrived:true,blockedEvents,startFeet,maxFeet,maxSpeed,driver:driver.diagnostics,...(recordFrames?{frames}:{}),end:[camera.position.x,camera.position.z,controls.feetY]};
  } finally {controls.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWindow;}
}
