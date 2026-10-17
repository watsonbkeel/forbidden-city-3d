import { createPhysicalWaypointDriver } from './physical-waypoints.mjs';
import { bindProfileSupports, traceProfileSupports, profileSupportReport } from './profile-support-trace.mjs';

export const ZHAODE_WAYPOINT_DRIVER='zhaode-physical-crossing-v1';
export function zhaodeRoutePoints(profile,{from='front',offset=0}={}) {
  const names=['frontGround','frontToe','frontTop','portalFront','portalRear','rearTop','rearToe','rearGround'];
  const c=Math.cos(profile.rot),s=Math.sin(profile.rot);
  let go=names.map(name=>{const [lx,lz]=profile.routeContacts[name],x=lx+offset;return [profile.x+x*c+lz*s,profile.z-x*s+lz*c];});
  if(from==='rear')go=go.reverse();
  return [...go,...go.slice(0,-1).reverse()];
}

/** Drive the application's actual controller; diagnostic observers never supply
 * heights, positions or velocities after the single ground-origin reset. The
 * established physical waypoint contract retains inertia and endpoint braking. */
export function runZhaodeRoute(app,profile,points,{fps=60,sprint=false,backward=false,from='front',
  identities,recordFrames=false,eyeHeight=1.7,stepUp=.6,tickZones=true}={}) {
  const c=app.controls,cm=app.collisionManager,camera=app.camera,zm=app.zoneManager;
  const tick=()=>{if(tickZones)zm?.update({x:camera.position.x,z:camera.position.z});};
  const [x,z]=points[0];
  if(tickZones)zm?.ensureLoadedAt(x,z);
  c.stop();c.setPosition(x,eyeHeight,z);tick();
  const startFeet=c.feetY;
  if(Math.abs(startFeet)>1e-7)throw new Error('昭德 physical route must begin feet=0 outside the actual toe');
  const supports=identities??bindProfileSupports(cm,profile),trace=traceProfileSupports(cm,supports);
  const physical=()=>[camera.position.x-c.bobOffset.x,camera.position.z-c.bobOffset.z];
  const driver=createPhysicalWaypointDriver(points),dt=1/fps,frames=[],feetFailures=[],zonesSeen=[];
  c.moveForward=!backward;c.moveBackward=backward;
  let maxFeet=0,maxSpeed=0,maxFeetGroundSeparation=0,stuckAt=null,legFrames=0,stuck=0,last=physical(),unloadedWalk=0;
  const cos=Math.cos(profile.rot),sin=Math.sin(profile.rot);
  const sample=()=>{
    const pos=physical(),lx=(pos[0]-profile.x)*cos-(pos[1]-profile.z)*sin,lz=(pos[0]-profile.x)*sin+(pos[1]-profile.z)*cos;
    maxFeet=Math.max(maxFeet,c.feetY);maxSpeed=Math.max(maxSpeed,c.motion.speed);
    maxFeetGroundSeparation=Math.max(maxFeetGroundSeparation,Math.abs(c.feetY-c.groundY));
    if(Math.abs(lx)<profile.platform.width/2-.5&&Math.abs(lz)<profile.platform.depth/2-.5&&
      (c.feetY<=profile.platform.topY-stepUp||Math.abs(c.groundY-profile.platform.topY)>1e-7))feetFailures.push({x:pos[0],z:pos[1],feet:c.feetY,ground:c.groundY});
    if(recordFrames)frames.push({x:pos[0],z:pos[1],feet:c.feetY,ground:c.groundY,speed:c.motion.speed});
    return pos;
  };
  try{
    while(!driver.complete){
      const before=physical(),command=driver.command(before,sprint),[tx,tz]=command.target;
      c.canSprint=command.canSprint;
      camera.position.sub(c.bobOffset);
      camera.lookAt(backward?2*camera.position.x-tx:tx,camera.position.y,backward?2*camera.position.z-tz:tz);
      camera.position.add(c.bobOffset);camera.updateMatrixWorld(true);
      tick();c.prevTime=performance.now()-dt*1000;c.update();const after=sample();
      const zid=zm?.findZone(after[0],after[1]);
      if(zid&&zonesSeen.at(-1)!==zid)zonesSeen.push(zid);
      if(zid&&!cm.colliders.some(col=>col.tag===zid))unloadedWalk+=Math.hypot(after[0]-before[0],after[1]-before[1]);
      if(driver.observe(before,after)){legFrames=0;stuck=0;last=after;continue;}
      legFrames++;
      if(legFrames%fps===0){stuck=Math.hypot(after[0]-last[0],after[1]-last[1])<.3?stuck+1:0;last=after;}
      const k=driver.index,limit=Math.ceil(Math.hypot(points[k][0]-points[k-1][0],points[k][1]-points[k-1][1])/2*fps)+fps*4;
      if(stuck>=2||legFrames>=limit){stuckAt=points[k];break;}
    }
    c.moveForward=false;c.moveBackward=false;
    if(driver.complete)for(let i=0;i<fps*2;i++){tick();c.prevTime=performance.now()-dt*1000;c.update();sample();}
    const support=profileSupportReport(trace.samples,profile,from),end=physical();
    return {fps,sprint,backward,from,startFeet,xyArrived:driver.complete,
      arrived:driver.complete&&support.valid&&feetFailures.length===0&&Math.abs(c.feetY)<.02,
      stuckAt,end:[...end,c.feetY],maxFeet,maxSpeed,maxFeetGroundSeparation,zonesSeen,unloadedWalk,
      fellUnder:feetFailures[0]??null,feetFailures:feetFailures.slice(0,8),support,driver:driver.diagnostics,
      waypointDriver:ZHAODE_WAYPOINT_DRIVER,...(recordFrames?{frames}:{})};
  }finally{c.moveForward=false;c.moveBackward=false;trace.restore();}
}

/** Locate permanent B metadata, with no S-loader dependency. */
export function runtimeZhaodeProfile(app) {
  let result;
  app.scene.traverse(object=>{for(const entry of object.userData.architecture??[])if(entry.gateProfile==='zhaode'||entry.profile==='zhaode'){
    const candidate=entry.geometry??entry.gateGeometry??entry;
    if(candidate.supports&&candidate.routeContacts)result=candidate;
  }});
  if(!result)throw new Error('Permanent B 昭德 runtime geometry/support profile is missing');
  return result;
}
