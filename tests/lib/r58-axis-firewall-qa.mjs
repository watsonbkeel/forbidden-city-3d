// Bounded QA against an already constructed W. Never builds/loads a world,
// changes architecture, installs colliders, or claims browser acceptance.
import * as THREE from 'three';
import {PLAYER} from '../../src/config/constants.js';
import {walkStraight} from './world.mjs';
import {visibleTriangleSweep} from './r57-staff-clearance.mjs';
import {createPhysicalWaypointDriver} from './physical-waypoints.mjs';

export function firewallFootprint(profile,pad=0){
 return new THREE.Box3(new THREE.Vector3(Math.min(...profile.spans.map(s=>s.x0))-pad,-Infinity,profile.z-profile.thickness/2-pad),new THREE.Vector3(Math.max(...profile.spans.map(s=>s.x1))+pad,Infinity,profile.z+profile.thickness/2+pad));
}
const near=(box,a,b)=>box.intersectsBox(new THREE.Box3(new THREE.Vector3(Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.min(a[2],b[2])),new THREE.Vector3(Math.max(a[0],b[0]),Math.max(a[1],b[1]),Math.max(a[2],b[2]))));

function installedEvidence(W,profile){
 const metadata=[];W.scene.traverse(o=>{for(const m of [o.userData.structure,...(o.userData.architecture??[])])if(m?.id===profile.id)metadata.push(m);});
 const keys=['id','objectId','side','z','thickness','spans','passage','terminalJoin','hallJoin'];
 const metadataMatches=metadata.some(m=>keys.every(k=>JSON.stringify(m[k])===JSON.stringify(profile[k])));
 const p=profile.passage,boxes=[];
 for(const span of profile.spans){
  const rows=span.id==='tier-3'?[[span.x0,p.centerX-p.clearWidth/2,span.floorY,span.topY],[p.centerX+p.clearWidth/2,span.x1,span.floorY,span.topY],[p.centerX-p.clearWidth/2,p.centerX+p.clearWidth/2,p.floorY+p.clearHeight,span.topY]]:[[span.x0,span.x1,span.floorY,span.topY]];
  for(const [x0,x1,y0,y1] of rows)boxes.push(new THREE.Box3(new THREE.Vector3(x0,y0,profile.z-profile.thickness/2),new THREE.Vector3(x1,y1,profile.z+profile.thickness/2)));
 }
 const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};W.scene.updateMatrixWorld(true);
 const solids=boxes.map(box=>{
  const exactCollider=W.cm.colliders.some(c=>{const b=c.box??c;return b.min.distanceTo(box.min)<1e-7&&b.max.distanceTo(box.max)<1e-7;});
  const visualSamples=[];
  for(const fraction of [.2,.5,.8])for(const direction of [-1,1]){
   const x=box.min.x+(box.max.x-box.min.x)*fraction,y=(box.min.y+box.max.y)/2;
   const ray=new THREE.Raycaster(new THREE.Vector3(x,y,profile.z-direction*2),new THREE.Vector3(0,0,direction),0,4);
   visualSamples.push(ray.intersectObject(W.scene,true).some(h=>visible(h.object)&&(()=>{const m=Array.isArray(h.object.material)?h.object.material[h.face.materialIndex]:h.object.material;return m&&m.visible!==false&&m.colorWrite!==false&&(!m.transparent||m.opacity>0);})()&&box.clone().expandByScalar(1e-5).containsPoint(h.point)));
  }
  return {min:box.min.toArray(),max:box.max.toArray(),exactCollider,visualSamples,pass:exactCollider&&visualSamples.every(Boolean)};
 });
 return {pass:metadataMatches&&solids.every(s=>s.pass),metadataMatches,solids};
}

/** Existing live bindings can be passed unchanged from CharacterManager.states.
 * Complete resolved bindings are necessary for a full actor-intersection pass.
 * Distant routes are rejected by a conservative footprint enclosure, not by a
 * made-up alternate path. Nearby body checks consume THIS W's triangles.
 */
export function evaluateTaiheEastFirewall(W,{profile,resolvedBindings=null,expectedActorCount=null,expectedActorIds=null}={}){
 if(!W?.scene?.isScene||!W.cm||profile?.objectId!=='FC-1ABC6622CB')throw TypeError('Existing scene, CollisionManager and Taihe profile required');
 const installation=installedEvidence(W,profile),p=profile.passage,door=[];
 for(const direction of [-1,1]){
  const a=[p.centerX,p.floorY,profile.z-direction*4],b=[p.centerX,p.floorY,profile.z+direction*4];
  const walk=walkStraight({...W,THREE},[a[0],a[2]],[b[0],b[2]],{step:.1,feet0:p.floorY});
  door.push({direction,walk,visibleBody:visibleTriangleSweep(W.scene,a,b,{radius:.5,height:PLAYER.HEIGHT,bottom:.03})});
 }
 const retainedZhongzuo=walkStraight({...W,THREE},[-77,profile.z-4],[-77,profile.z+4],{step:.1,feet0:0});
 const retainedWaistStairs=[];for(const side of [-1,1])for(const ascending of [false,true]){const a=[side*(ascending?36:15.5),58],b=[side*(ascending?15.5:36),58];retainedWaistStairs.push({side,ascending,walk:walkStraight({...W,THREE},a,b,{feet0:ascending?0:8}),expectedFeet:ascending?8:0});}
 const actorCheck={status:resolvedBindings?'CHECKED_SUPPLIED_BINDINGS':'PENDING_BINDINGS',count:resolvedBindings?.length??0,expectedActorCount,expectedActorIds,nearby:[],unready:[],errors:[]};
 if(!resolvedBindings&&(expectedActorCount!==null||expectedActorIds!==null))actorCheck.pass=false;
 if(resolvedBindings){
  if(!resolvedBindings.length)actorCheck.errors.push('Empty supplied actor bindings');
  const suppliedIds=resolvedBindings.map(e=>e.actor?.id);
  if(suppliedIds.some(id=>typeof id!=='string'||!id)||new Set(suppliedIds).size!==suppliedIds.length)actorCheck.errors.push('Missing or duplicate supplied actor identity');
  if(expectedActorIds!==null&&(!Array.isArray(expectedActorIds)||new Set(expectedActorIds).size!==expectedActorIds.length||expectedActorIds.length!==suppliedIds.length||expectedActorIds.some(id=>!suppliedIds.includes(id))))actorCheck.errors.push('Supplied actor identities differ from expected identities');
  if(expectedActorCount!==null&&resolvedBindings.length!==expectedActorCount)actorCheck.errors.push('Supplied binding count differs from caller expected actor count');
  const footprint=firewallFootprint(profile,1);
  for(const entry of resolvedBindings){
   const {actor,binding}=entry;if(binding?.status!=='ready'){actorCheck.unready.push(actor?.id??'unknown');continue;}
   const points=binding.path?.pointsMeters??binding.path?.points??[binding.position];
   if(!points?.length||points.some(p=>!Array.isArray(p)||p.length!==3||!p.every(Number.isFinite))){actorCheck.errors.push(`Invalid world route: ${actor?.id}`);continue;}
   const legs=points.length===1?[[points[0],points[0]]]:points.slice(1).map((p,i)=>[points[i],p]);
   for(const [a,b] of legs)if(near(footprint,a,b))actorCheck.nearby.push({id:actor.id,a,b,visibleBody:visibleTriangleSweep(W.scene,a,b,{radius:1,height:2.4})});
  }
  actorCheck.pass=actorCheck.unready.length===0&&actorCheck.errors.length===0&&actorCheck.nearby.every(x=>x.visibleBody.pass);
 }
 return {pass:installation.pass&&door.every(d=>d.walk.reached===d.walk.total&&d.visibleBody.pass)&&retainedZhongzuo.reached===retainedZhongzuo.total&&retainedWaistStairs.every(r=>r.walk.reached===r.walk.total&&r.walk.feet===r.expectedFeet)&&actorCheck.pass!==false,
  boundary:'Supplied-world local geometry only. No historical-metric, full-world lifecycle or browser acceptance.',installation,door,retainedZhongzuo,retainedWaistStairs,actorCheck};
}

/** Drives the actual existing controls and actual existing collision manager.
 * Caller supplies an exact deterministic tick in tests; otherwise the test-only
 * clock adapter advances prevTime by dt. No repeated teleport or height override.
 * Only the initial spawn is set to the preserved real upper terrace support.
 */
export function runTaiheFirewallControllerRoute(W,profile,{fps=60,direction=1,sprint=false,backward=false,tick=null}={}){
 const {camera,controls}=W;if(!camera||!controls||controls.collisionManager!==(W.collisionManager??W.cm))throw TypeError('Actual existing controls and their CollisionManager required');
 if(![10,60].includes(fps)||![-1,1].includes(direction))throw TypeError('Reviewed 10/60Hz and signed direction required');
 const p=profile.passage,points=[[p.centerX,profile.z-direction*4],[p.centerX,profile.z+direction*4],[p.centerX,profile.z-direction*4]];
 controls.setPosition(points[0][0],p.floorY+PLAYER.HEIGHT,points[0][1]);const startFeet=controls.feetY;
 controls.moveForward=!backward;controls.moveBackward=backward;controls.canSprint=sprint;
 const driver=createPhysicalWaypointDriver(points),physical=()=>[camera.position.x-controls.bobOffset.x,camera.position.z-controls.bobOffset.z];
 let minFeet=startFeet,maxFeet=startFeet,frames=0,maxSpeed=0;
 try{
  while(!driver.complete&&frames<fps*20){
   const before=physical(),command=driver.command(before,sprint),[x,z]=command.target;controls.canSprint=command.canSprint;
   camera.position.sub(controls.bobOffset);camera.lookAt(backward?2*camera.position.x-x:x,camera.position.y,backward?2*camera.position.z-z:z);camera.position.add(controls.bobOffset);camera.updateMatrixWorld(true);
   if(tick)tick(1000/fps);else controls.prevTime=performance.now()-1000/fps;
   controls.update();frames++;minFeet=Math.min(minFeet,controls.feetY);maxFeet=Math.max(maxFeet,controls.feetY);maxSpeed=Math.max(maxSpeed,controls.motion.speed);driver.observe(before,physical());
  }
  return {arrived:driver.complete,fps,direction,sprint,backward,startFeet,minFeet,maxFeet,maxSpeed,frames,end:[...physical(),controls.feetY],driver:driver.diagnostics};
 }finally{controls.moveForward=false;controls.moveBackward=false;controls.canSprint=false;controls.stop();}
}
