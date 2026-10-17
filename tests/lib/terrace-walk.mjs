import { FirstPersonControls } from '../../src/controls/FirstPerson.js';
import { PLAYER } from '../../src/config/constants.js';
import { createPhysicalWaypointDriver } from './physical-waypoints.mjs';

/** Reproduce the production candidate/eligibility/max/tie rules using the
 * actual current walkables. This is a read-only diagnostic, not a height source.
 * The returned height is cross-checked against the real getGroundHeight result.
 */
function selectedGroundSupport(cm, x, z, feet, stepUp) {
  let ground=0, rescue=0, selected=null, rescuedBy=null;
  const limit=feet+stepUp;
  for(let index=0;index<cm.walkables.length;index++) {
    const w=cm.walkables[index];
    let top;
    if(w.type==='box') {
      const b=w.box;
      if(x<b.min.x||x>b.max.x||z<b.min.z||z>b.max.z)continue;
      top=b.max.y;
      if(w.rescue&&top>limit&&x>b.min.x+.6&&x<b.max.x-.6&&z>b.min.z+.6&&z<b.max.z-.6&&top>rescue) {
        rescue=top;rescuedBy={walkable:w,index};
      }
    } else {
      if(x<w.minX||x>w.maxX||z<w.minZ||z>w.maxZ)continue;
      const a=w.axis==='x'?x:z;
      const t=w.a1===w.a0?1:Math.min(1,Math.max(0,(a-w.a0)/(w.a1-w.a0)));
      if(w.crossMin0!==undefined) {
        const cross=w.axis==='x'?z:x;
        const low=w.crossMin0+(w.crossMin1-w.crossMin0)*t;
        const high=w.crossMax0+(w.crossMax1-w.crossMax0)*t;
        if(cross<low-1e-9||cross>high+1e-9)continue;
      }
      top=w.y0+(w.y1-w.y0)*t;
    }
    // Production uses strict greater-than: the first eligible equal-height
    // primitive wins; a height-zero ramp never replaces initial ground zero.
    if(top>limit||top<=ground)continue;
    ground=top;selected={walkable:w,index};
  }
  return rescue>ground?{height:rescue,selected:rescuedBy,rescue:true}:{height:ground,selected,rescue:false};
}

/** Test-only instrumentation: labels an actual selected primitive, never just
 * an expected profile height. Production movement and rescue are unchanged. */
export function traceTerraceGround(cm, profile) {
  const original=cm.getGroundHeight, samples=[];
  const rampKeys=['axis','minX','maxX','minZ','maxZ','a0','a1','y0','y1',
    'crossMin0','crossMax0','crossMin1','crossMax1'];
  cm.getGroundHeight=function(x,z,feet=0,stepUp=.6) {
    const height=original.call(this,x,z,feet,stepUp);
    const actual=selectedGroundSupport(this,x,z,feet,stepUp),w=actual.selected?.walkable;
    let source;
    if(Math.abs(actual.height-height)>1e-9)source='unverified';
    else if(actual.rescue)source='rescue';
    else if(!w)source='ground';
    else if(w.type==='box')source='box';
    else {
      const flight=profile.flights.find(f=>rampKeys.every(key=>w[key]===f.ramp[key]));
      source=flight?.id??'other-ramp';
    }
    samples.push({x,z,feetIn:feet,height,source,supportIndex:actual.selected?.index??null,supportType:w?.type??'ground'});
    return height;
  };
  return {samples,restore:()=>{cm.getGroundHeight=original;}};
}

export function terraceTraceSummary(samples, profile, side) {
  const flights=profile.flights.filter(f=>f.side===side);
  const waist=samples.filter(p=>Math.abs(p.z-profile.centerZ)<.8&&Math.abs(p.x)>=Math.abs(flights.at(-1).xEdge)-.1&&Math.abs(p.x)<=Math.abs(flights[0].xToe)+.1);
  const ascending=flights.filter(f=>waist.some(p=>p.source===f.id&&p.height-p.feetIn>1e-5)).map(f=>f.id);
  const descending=flights.filter(f=>waist.some(p=>p.source===f.id&&p.height-p.feetIn< -1e-5)).map(f=>f.id);
  const unsafe=waist.filter(p=>p.source==='rescue'||p.source==='unverified'||p.source==='unsupported'||p.height-p.feetIn>.15625+1e-6);
  return {ascending,descending,unsafe,maxRise:Math.max(0,...waist.map(p=>p.height-p.feetIn)),samples:waist.length};
}

/** Real FirstPersonControls with only DOM event targets and its clock stubbed.
 * Start feet=0, not an infinite/high spawn. Backward mode uses actual S motion. */
export function replayTerrace(t,W,points,{fps=60,sprint=false,backward=false,recordFrames=false}={}) {
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
    const driver=createPhysicalWaypointDriver(points);
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
      if(stuck>=2||legFrames>=limit)return{arrived:false,stuckAt:points[k],startFeet,maxFeet,maxSpeed,driver:driver.diagnostics,...(recordFrames?{frames}:{}),end:[camera.position.x,camera.position.z,controls.feetY]};
    }
    controls.moveForward=false;controls.moveBackward=false;
    for(let i=0;i<fps*2;i++){now+=1000/fps;controls.update();}
    return{arrived:true,startFeet,maxFeet,maxSpeed,driver:driver.diagnostics,...(recordFrames?{frames}:{}),end:[camera.position.x,camera.position.z,controls.feetY]};
  } finally {controls.dispose();clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWindow;}
}
