import {cloneWuyingBalustradeFloor,registeredWuyingBalustradeFloor,wuyingBalustradeLowScope} from './WuyingBalustradeSupport.js';
import {validateQianqingScreenScope} from './QianqingScreenSupport.js';
import {sishenEnvironmentWitness} from './SishenEnvironmentWitness.js';
import {validateSishenScope} from './SishenSupport.js';
import {validateWestWellScope} from './WestWellSupport.js';
import {westWellEnvironmentWitness} from './WestWellEnvironmentWitness.js';
import {validateChangchunWestScope,registeredChangchunWestFloor} from './ChangchunWestSupport.js';
import {validateEastWellScope} from './EastWellSupport.js';
import {eastWellEnvironmentWitness} from './EastWellEnvironmentWitness.js';
import {validateShoukangEntryScope} from './ShoukangEntrySupport.js';
import {shoukangEntryEnvironmentWitness} from './ShoukangEntryEnvironmentWitness.js';
import {validateYanshouCompoundScope,registeredYanshouCompoundFloor} from './YanshouCompoundSupport.js';
import {yanshouCompoundEnvironmentWitness} from './YanshouCompoundEnvironmentWitness.js';
import {validateCiningGateScope,registeredCiningGateFloor} from './CiningGateSupport.js';
import {ciningGateEnvironmentWitness} from './CiningGateEnvironmentWitness.js';
import {validateCiyinFacadeScope,registeredCiyinFrontUpperFloor} from './CiyinFacadeSupport.js';
import {ciyinFacadeEnvironmentWitness} from './CiyinFacadeEnvironmentWitness.js';
import {validateShouanEntryScope} from './ShouanEntrySupport.js';
import {shouanEntryEnvironmentWitness} from './ShouanEntryEnvironmentWitness.js';
import {validateJiyunRailScope,registeredJiyunUpperFloor} from './JiyunRailSupport.js';
import {cloneXishangFloors,registeredXishangFloor,XISHANG_REGION} from './XishangSupport.js';
import {xishangEnvironmentWitness} from './XishangEnvironmentWitness.js';
import {cloneYanquNicheFloor,registeredYanquNicheFloor} from './YanquNicheSupport.js';
import {cloneWumenLinkFloor,registeredWumenLinkFloor,registeredWumenLinkExitFloor} from './WumenLinkSupport.js';
import {cloneChengruiSeatFloors,registeredChengruiSeatFloor} from './ChengruiSeatSupport.js';
import {RETAINED_COURTYARD_IDS} from './RetainedCourtyardAccess.js';
import {CHENGQIAN_ARRIVAL_IDS} from './ChengqianArrivalAccess.js';
import {CHENGQIAN_REAR_ACCESS_IDS} from './ChengqianRearAccess.js';
import {CHUXIU_REAR_ACCESS_IDS} from './ChuxiuRearAccess.js';
import {chengqianEnvironmentWitness} from './ChengqianEnvironmentWitness.js';
import {LIJING_ROOM_ID,cloneLijingFloor,registeredLijingFloor} from './LijingRoomSupport.js';
import {CHUXIU_SIDE_IDS} from './ChuxiuSideAccess.js';
import {QIANQING_ASSEMBLY_IDS,cloneQianqingFloor,registeredQianqingFloor} from './QianqingAssemblySupport.js';
import {STAIR_IDS,cloneStairRamp,stairRampContact,stairRampSweep} from './StairInterfaces.js';
import {xiqingSurfaceFootContact,xiqingSurfaceBodyIntersects,xiqingSurfaceSweep} from './XiqingRoofSurface.js';
import * as THREE from 'three';
import {PLAYER} from '../config/constants.js';

/** Positions here are FOOT positions, not camera/eye positions. Keeping the
 * controller's exact feet scalar avoids an eye+height-height round-trip turning
 * exact supporting contact into a tiny apparent penetration. No body shrink. */
export function furnitureBoxSweep(fromFeet,toFeet,obstacle,radius=.5,height=PLAYER.HEIGHT){
  if(!(Number.isFinite(radius)&&radius>0&&Number.isFinite(height)&&height>0))throw new TypeError('Invalid furniture body dimensions');
  for(const k of ['x','y','z']){
    if(!Number.isFinite(fromFeet[k])||!Number.isFinite(toFeet[k])||!Number.isFinite(obstacle.min[k])||!Number.isFinite(obstacle.max[k])||obstacle.min[k]>=obstacle.max[k])throw new TypeError('Invalid furniture body or solid');
  }
  let enter=0,leave=1,axis=null,normal=0;
  for(const k of ['x','y','z']){
    const lo=k==='y'?fromFeet.y:fromFeet[k]-radius;
    const hi=k==='y'?fromFeet.y+height:fromFeet[k]+radius;
    const velocity=toFeet[k]-fromFeet[k];
    if(velocity===0){if(hi<=obstacle.min[k]||lo>=obstacle.max[k])return null;continue;}
    const t0=(obstacle.min[k]-hi)/velocity,t1=(obstacle.max[k]-lo)/velocity;
    const first=Math.min(t0,t1),last=Math.max(t0,t1);
    if(first>=enter){enter=first;axis=k;normal=velocity>0?-1:1;}
    leave=Math.min(leave,last);
    if(enter>=leave)return null;
  }
  // Strict interior overlap, not closed-box face/edge/corner touching. Endpoint
  // touching is allowed; movement into a touching face returns fraction zero.
  return enter<leave&&enter<1&&leave>0?{fraction:Math.max(0,enter),axis,normal}:null;
}

/** Ordinary-box-only contact primitive. The integration must validate scope
 * ownership; unknown curved/triangle shapes fail explicitly, not as fake floors.
 * A physical surface remains present even when another object blocks the pose. */
export function furnitureStaticContact(colliders,x,z,maxTop,radius=.5,height=PLAYER.HEIGHT){
  let surface=null;
  for(const owner of colliders){
    if(owner.triangleSupport||owner.overhead)throw new TypeError('Unsupported furniture-domain shape');
    if(owner.xiqingRoofSurface){const hit=xiqingSurfaceFootContact(owner.xiqingRoofSurface,x,z,maxTop,radius);if(hit&&(!surface||hit.height>surface.height))surface={...hit,owner};continue;}
    const box=owner.box??owner;
    const x0=Math.max(x-radius,box.min.x),x1=Math.min(x+radius,box.max.x);
    const z0=Math.max(z-radius,box.min.z),z1=Math.min(z+radius,box.max.z);
    if(x0>=x1||z0>=z1||box.max.y>maxTop||surface&&box.max.y<=surface.height)continue;
    surface={height:box.max.y,witness:new THREE.Vector3((x0+x1)/2,box.max.y,(z0+z1)/2),owner};
  }
  if(!surface)return{surface:null,poseClear:false,blocker:null};
  const feet=new THREE.Vector3(x,surface.height,z);
  for(const owner of colliders)if(owner.xiqingRoofSurface?xiqingSurfaceBodyIntersects(owner.xiqingRoofSurface,feetBox(feet,radius,height)):furnitureBoxSweep(feet,feet,owner.box??owner,radius,height))return{surface,poseClear:false,blocker:owner};
  return{surface,poseClear:true,blocker:null};
}

/** Relative-to-owner-min metadata follows translated ordinary-box owners. This
 * describes dispatch only; no new collider, walkable or rescue surface exists. */
export function cloneFurnitureMotionScope(input,ownerBox){
  if(input===undefined)return null;
  const keys=['minOffsetX','maxOffsetX','minOffsetZ','maxOffsetZ'];
  if((input?.kind==='changyin-front-rails'&&!['changyin-front-rail-0','changyin-front-rail-1'].includes(input.id))||(input?.kind==='jingqi-south-gallery'&&input.id!=='jingqi-south-gallery')||(input?.kind==='yanqu-photo-niche'&&input.id!=='yanqu-photo-niche')||(input?.kind==='cuishang-south-rails'&&input.id!=='cuishang-south-rails')||(input?.kind==='suichu-south-steps'&&input.id!=='suichu-south-steps')||(input?.kind==='suichu-front-basins'&&!['suichu-front-basin-east','suichu-front-basin-west'].includes(input.id))||(input?.kind==='wumen-transverse-links'&&!['wumen-transverse-link-east','wumen-transverse-link-west'].includes(input.id))||(input?.kind==='yanchun-front-vessels'&&!['yanchun-front-vessel-east-3','yanchun-front-vessel-west-3'].includes(input.id))||(input?.kind==='fengxian-front-vats'&&!['fengxian-front-vat-west','fengxian-front-vat-east'].includes(input.id))||(input?.kind==='chengrui-south-seats'&&!['chengrui-south-seat-west','chengrui-south-seat-east'].includes(input.id))||(input?.kind==='shoukang-south-steps'&&input.id!=='shoukang-south-steps')||(input?.kind==='jiaotai-low-roofs'&&!['jiaotai-low-west-south','jiaotai-low-west-north'].includes(input.id))||(input?.kind==='retained-courtyard'&&!RETAINED_COURTYARD_IDS.includes(input.id))||(input?.kind==='chengqian-arrival'&&!CHENGQIAN_ARRIVAL_IDS.includes(input.id))||(input?.kind==='chengqian-rear-access'&&!CHENGQIAN_REAR_ACCESS_IDS.includes(input.id))||(input?.kind==='chuxiu-rear-access'&&!CHUXIU_REAR_ACCESS_IDS.includes(input.id))||!['wuying-central-balustrades','qianqing-screen-caps','sishen','changchun-west-interior','west-well','east-well','shoukang-entry','yanshou-compound','cining-gate','ciyin-front','shouan-entry','jiyun-upper-front-rail','xishang-roof-transom','changyin-front-rails','jingqi-south-gallery','yanqu-photo-niche','cuishang-south-rails','suichu-south-steps','suichu-front-basins','wumen-transverse-links','yanchun-front-vessels','fengxian-front-vats','chengrui-south-seats','shoukang-south-steps','jiaotai-low-roofs','retained-courtyard','yangxin-furniture','xiqing-gates','stair-interface','qianqing-display','qianqing-assemblies','chuxiu-side-access','chuxiu-rear-access','chengqian-rear-access','chengqian-arrival','lijing-west-room','chengqian-court-access'].includes(input?.kind)||(input.kind==='chengqian-court-access'&&!['chengqian-west-court-access','chengqian-west-wing-entry'].includes(input.id))||(input.kind==='lijing-west-room'&&input.id!==LIJING_ROOM_ID)||(input.kind==='chuxiu-side-access'&&!CHUXIU_SIDE_IDS.includes(input.id))||(input.kind==='xiqing-gates'&&input.id!=='ningshou-xiqing-gates')||(input.kind==='qianqing-assemblies'&&!QIANQING_ASSEMBLY_IDS.includes(input.id))||(input.kind==='qianqing-display'&&!/^qianqing-display-vessel-[0-3]$/.test(input.id))||(input.kind==='stair-interface'&&!STAIR_IDS.includes(input.id))||typeof input.id!=='string'||!input.id||!keys.every(k=>Number.isFinite(input[k]))||input.minOffsetX>=input.maxOffsetX||input.minOffsetZ>=input.maxOffsetZ||!['x','y','z'].every(k=>Number.isFinite(ownerBox.min[k])&&Number.isFinite(ownerBox.max[k])&&ownerBox.min[k]<ownerBox.max[k]))throw new TypeError('Furniture scope requires finite ordered ordinary-box ownership');
  if(input.kind==='wuying-central-balustrades'&&input.groundY!==0)throw new TypeError('Wuying balustrades require the retained zero-ground boundary');
  if(input.groundY!==undefined&&input.groundY!==0)throw new TypeError('Furniture world ground witness must be the existing zero plane');
  if(input.environmentGroundHandoff!==undefined&&(input.environmentGroundHandoff!==true||!((input.kind==='stair-interface'&&input.id==='chengqian-front-stair')||(input.kind==='chengqian-court-access'&&['chengqian-west-court-access','chengqian-west-wing-entry'].includes(input.id)))||input.groundY!==0))throw new TypeError('Explicit Chengqian Environment handoff identity required');
  const ramp=input.kind==='stair-interface'?cloneStairRamp(input.ramp,input.rampOrigin,ownerBox):null;
  const region={minX:ownerBox.min.x+input.minOffsetX,maxX:ownerBox.min.x+input.maxOffsetX,minZ:ownerBox.min.z+input.minOffsetZ,maxZ:ownerBox.min.z+input.maxOffsetZ};
  if(input.kind==='qianqing-screen-caps')validateQianqingScreenScope(input,ownerBox,region);
  if(input.kind==='changyin-front-rails'){
    const i=input.id==='changyin-front-rail-0'?0:1,ox=-336.6+(i===0?7.75:-7.75),oz=372.85;
    const bounds={minX:i===0?-336.6+1.4:-336.6-7.75-.6,maxX:i===0?-336.6+7.75+.6:-336.6-1.4,minZ:oz-1.5,maxZ:oz+1.5};
    if(input.groundY!==0||Object.keys(bounds).some(k=>Math.abs(region[k]-bounds[k])>1e-10)||Math.abs((ownerBox.min.x+ownerBox.max.x)/2-ox)>1e-8||Math.abs((ownerBox.min.z+ownerBox.max.z)/2-oz)>1e-8||Math.abs(ownerBox.max.x-ownerBox.min.x-.5534533262252)>1e-8||Math.abs(ownerBox.max.z-ownerBox.min.z-.5534533262252)>1e-8||ownerBox.min.y!==1.2000000476837158||ownerBox.max.y!==5.799999952316284)throw new TypeError('Changyin requires exact original outer column and bounded side-rail scope');
  }
  if(input.kind==='jingqi-south-gallery'){
    const bounds={minX:-293.3-31/2-.7,maxX:-293.3+31/2+.7,minZ:496.8-11.2/2+.1-2,maxZ:496.8-11.2/2+.1+.7};
    const lo=[-309.6,0,490.40000000000003],hi=[-277,.8,503.2];
    if(input.groundY!==0||Object.keys(bounds).some(k=>region[k]!==bounds[k])||ownerBox.min.toArray().some((v,i)=>v!==lo[i])||ownerBox.max.toArray().some((v,i)=>v!==hi[i]))throw new TypeError('Jingqi upper gallery requires exact retained platform and bounded south scope');
  }
  if(input.kind==='changchun-west-interior')validateChangchunWestScope(input,ownerBox,region);
  if(input.kind==='yanshou-compound')validateYanshouCompoundScope(input,ownerBox,region);
  if(input.kind==='cining-gate')validateCiningGateScope(input,ownerBox,region);
  if(input.kind==='ciyin-front')validateCiyinFacadeScope(input,ownerBox,region);
  if(input.kind==='east-well')validateEastWellScope(input,ownerBox,region);
  if(input.kind==='sishen')validateSishenScope(input,ownerBox,region);
  if(input.kind==='west-well')validateWestWellScope(input,ownerBox,region);
  if(input.kind==='shoukang-entry')validateShoukangEntryScope(input,ownerBox,region);
  if(input.kind==='shouan-entry')validateShouanEntryScope(input,ownerBox,region);
  if(input.kind==='jiyun-upper-front-rail')validateJiyunRailScope(input,ownerBox,region);
  if(input.kind==='xishang-roof-transom'){
    const lo=[-243.20980000317095,.5,375.327199996829],hi=[-242.88019999682902,5,375.65680000317093];
    if(input.id!=='xishang-roof-transom'||input.groundY!==undefined||Object.keys(XISHANG_REGION).some(k=>region[k]!==XISHANG_REGION[k])||ownerBox.min.toArray().some((v,i)=>v!==lo[i])||ownerBox.max.toArray().some((v,i)=>v!==hi[i]))throw new TypeError('Xishang requires exact retained column and bounded player domain');
  }
  const floor=input.kind==='wuying-central-balustrades'?cloneWuyingBalustradeFloor(input.floor,input.id,ownerBox,region):input.kind==='xishang-roof-transom'?cloneXishangFloors(input.floor,input.id,region):input.kind==='yanqu-photo-niche'?cloneYanquNicheFloor(input.floor,input.id,region):input.kind==='wumen-transverse-links'?cloneWumenLinkFloor(input.floor,input.id,region):input.kind==='chengrui-south-seats'?cloneChengruiSeatFloors(input.floor,input.id,region):input.kind==='lijing-west-room'?cloneLijingFloor(input.floor,input.id,region):input.kind==='qianqing-assemblies'&&input.id.startsWith('qianqing-terrace-')?cloneQianqingFloor(input.floor,input.id,region):null;
  return Object.freeze({kind:input.kind,id:input.id,...(input.environmentGroundHandoff?{environmentGroundHandoff:true}:{}),...(floor?{floor}:{}),...(ramp?{ramp}:{}),...(input.groundY===0?{groundY:0}:{}),minX:ownerBox.min.x+input.minOffsetX,maxX:ownerBox.min.x+input.maxOffsetX,minZ:ownerBox.min.z+input.minOffsetZ,maxZ:ownerBox.min.z+input.maxOffsetZ});
}
export const furnitureMotionSource=cm=>cm.furnitureMotionSource??cm;
export function furnitureRegionIndex(cm){
  const source=furnitureMotionSource(cm),grid=source._duixiuGrid();
  if(source._furnitureRegionIndex?.generation===grid)return source._furnitureRegionIndex;
  return source._furnitureRegionIndex={generation:grid,regions:source.colliders.filter(c=>c.furnitureMotionScope).map(c=>c.furnitureMotionScope)};
}
export function furnitureScope(cm,fromFeet,toFeet,radius=.5,xishangFeet,jiyunUpwardFeet,wuyingFeet){
  if(!(Number.isFinite(radius)&&radius>0))throw new TypeError('Invalid furniture radius');
  return furnitureRegionIndex(cm).regions.some(r=>{
    // Xishang selects only explicit authoritative PLAYER feet, never eye/NPC vectors.
    if(r.kind==='xishang-roof-transom'&&(!Number.isFinite(xishangFeet)||xishangFeet<1.5))return false;
    // Only the local vertical caller supplies an upward endpoint. This catches
    // a sub-threshold head entering Jiyun low boards without lowering the
    // downward handoff threshold or changing NPC/other-region selection.
    if(r.kind==='jiyun-upper-front-rail'&&(!Number.isFinite(xishangFeet)||Math.max(xishangFeet,Number.isFinite(jiyunUpwardFeet)?jiyunUpwardFeet:-Infinity)<3))return false;
    if(r.kind==='wuying-central-balustrades'&&!wuyingBalustradeLowScope(r.id,fromFeet,toFeet,radius,wuyingFeet))return false;
    // Screen caps only: ground routes retain the original solver.
    if(r.kind==='qianqing-screen-caps'&&Math.max(fromFeet.y,toFeet.y)<5.5)return false;
    // Jingqi upper-only adapter: lower ramp/entrance keep their original solver.
    if(r.kind==='jingqi-south-gallery'&&Math.max(fromFeet.y,toFeet.y)<3)return false;
    let enter=0,leave=1;
    for(let i=0;i<2;i++){
      const axis=i?'z':'x',low=(i?r.minZ:r.minX)-radius,high=(i?r.maxZ:r.maxX)+radius;
      const start=fromFeet[axis],velocity=toFeet[axis]-start;
      if(!Number.isFinite(start)||!Number.isFinite(velocity))throw new TypeError('Invalid furniture scope motion');
      if(velocity===0){if(start<low||start>high)return false;}
      else{const a=(low-start)/velocity,b=(high-start)/velocity;enter=Math.max(enter,Math.min(a,b));leave=Math.min(leave,Math.max(a,b));if(enter>leave)return false;}
    }
    return enter<=leave;
  });
}
/** Only the explicitly local adapter calls this; generic clone queries keep
 * their prior semantics. Always use the live source for local static objects. */
export function furnitureLocalColliders(cm,bounds){return furnitureMotionSource(cm).queryBox(bounds);}

const cross2=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function convexHull(points){
  points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const low=[],high=[];
  for(const p of points){while(low.length>1&&cross2(low.at(-2),low.at(-1),p)<=0)low.pop();low.push(p);}
  for(let i=points.length-1;i>=0;i--){const p=points[i];while(high.length>1&&cross2(high.at(-2),high.at(-1),p)<=0)high.pop();high.push(p);}
  return low.slice(0,-1).concat(high.slice(0,-1));
}
function closestPoint(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],den=dx*dx+dz*dz,t=den?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/den)):0;return[a[0]+t*dx,a[1]+t*dz];}
const distance2=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function segmentDistance2(a,b,c,d){
  const u=cross2(a,b,c),v=cross2(a,b,d),s=cross2(c,d,a),t=cross2(c,d,b);
  if(u*v<0&&s*t<0)return 0;
  return Math.min(distance2(a,closestPoint(a,c,d)),distance2(b,closestPoint(b,c,d)),distance2(c,closestPoint(c,a,b)),distance2(d,closestPoint(d,a,b)));
}
const inside2=(p,poly)=>poly.every((a,i)=>cross2(a,poly[(i+1)%poly.length],p)>=0);
function segmentPolygonDistance(a,b,poly){
  if(inside2(a,poly)||inside2(b,poly))return 0;
  let best=Infinity;for(let i=0;i<poly.length;i++)best=Math.min(best,segmentDistance2(a,b,poly[i],poly[(i+1)%poly.length]));return best;
}
/** Signed separation from segment + actual square footprint. Unlike unsigned
 * distance, the inside value does not saturate at zero and trap deep overlaps. */
function signedPolygonDistance(p,poly,velocity){
  if(inside2(p,poly)){
    let distance=-Infinity,derivative=-Infinity;
    for(let i=0;i<poly.length;i++){
      const a=poly[i],b=poly[(i+1)%poly.length],len=distance2(a,b),nx=(b[1]-a[1])/len,nz=-(b[0]-a[0])/len;
      const d=(p[0]-a[0])*nx+(p[1]-a[1])*nz,dv=velocity[0]*nx+velocity[1]*nz;
      if(d>distance){distance=d;derivative=dv;}else if(d===distance)derivative=Math.max(derivative,dv);
    }
    return{distance,derivative};
  }
  let distance=Infinity,nearest;for(let i=0;i<poly.length;i++){const q=closestPoint(p,poly[i],poly[(i+1)%poly.length]),d=distance2(p,q);if(d<distance){distance=d;nearest=q;}}
  return{distance,derivative:((p[0]-nearest[0])*velocity[0]+(p[1]-nearest[1])*velocity[1])/distance};
}
/** Exact positive-overlap test on a path prefix against one vertical capsule.
 * Vertical overlap clips the center segment; the horizontal test is segment
 * distance to capsule-segment + square, not a circular player approximation. */
function capsulePrefix(part,poly,from,to,height,end){
  const dy=to.y-from.y;let low=0,high=end;
  if(dy===0){if(from.y>=part.maxY||from.y+height<=part.minY)return false;}
  else{const a=(part.minY-height-from.y)/dy,b=(part.maxY-from.y)/dy;low=Math.max(low,Math.min(a,b));high=Math.min(high,Math.max(a,b));if(low>=high)return false;}
  const at=t=>[from.x+(to.x-from.x)*t,from.z+(to.z-from.z)*t];
  return segmentPolygonDistance(at(low),at(high),poly)<part.radius;
}
export function furnitureDynamicSweep(fromFeet,toFeet,actor,radius=.5,height=PLAYER.HEIGHT){
  if(!(Number.isFinite(radius)&&radius>0&&Number.isFinite(height)&&height>0))throw new TypeError('Invalid furniture body dimensions');
  if(!['x','y','z'].every(k=>Number.isFinite(fromFeet[k])&&Number.isFinite(toFeet[k]))||!Array.isArray(actor.parts)||!actor.parts.every(p=>['ax','az','bx','bz','radius','minY','maxY'].every(k=>Number.isFinite(p[k]))&&p.radius>0&&p.minY<p.maxY))throw new TypeError('Invalid furniture dynamic body or motion');
  let first=null;const vx=toFeet.x-fromFeet.x,vz=toFeet.z-fromFeet.z,dy=toFeet.y-fromFeet.y;
  for(const part of actor.parts){
    if(Math.max(fromFeet.y,toFeet.y)+height<=part.minY||Math.min(fromFeet.y,toFeet.y)>=part.maxY||Math.max(fromFeet.x,toFeet.x)+radius+part.radius<Math.min(part.ax,part.bx)||Math.min(fromFeet.x,toFeet.x)-radius-part.radius>Math.max(part.ax,part.bx)||Math.max(fromFeet.z,toFeet.z)+radius+part.radius<Math.min(part.az,part.bz)||Math.min(fromFeet.z,toFeet.z)-radius-part.radius>Math.max(part.az,part.bz))continue;
    const points=[];for(const [x,z]of[[part.ax,part.az],[part.bx,part.bz]])for(const dx of[-radius,radius])for(const dz of[-radius,radius])points.push([x+dx,z+dz]);const poly=convexHull(points);
    const start=signedPolygonDistance([fromFeet.x,fromFeet.z],poly,[vx,vz]),v0=part.minY-fromFeet.y-height,v1=fromFeet.y-part.maxY,vertical=Math.max(v0,v1);
    if(start.distance<part.radius&&vertical<0){
      const finish=signedPolygonDistance([toFeet.x,toFeet.z],poly,[vx,vz]),endVertical=Math.max(part.minY-toFeet.y-height,toFeet.y-part.maxY),verticalDerivative=v0>v1?-dy:v1>v0?dy:Math.abs(dy);
      // Signed distance to a convex set is convex. A nonnegative initial
      // directional derivative proves no later deepening along this segment.
      // Require progress on at least one separating coordinate, for EACH part.
      if(start.derivative>=0&&verticalDerivative>=0&&(finish.distance>start.distance||endVertical>vertical))continue;
      return{fraction:0,kind:'dynamic',actorId:actor.id,existingOverlap:true};
    }
    if(!capsulePrefix(part,poly,fromFeet,toFeet,height,1))continue;
    let low=0,high=1;for(let i=0;i<40;i++){const mid=(low+high)/2;if(capsulePrefix(part,poly,fromFeet,toFeet,height,mid))high=mid;else low=mid;}
    if(!first||low<first.fraction)first={fraction:low,kind:'dynamic',actorId:actor.id};
  }
  return first;
}

const feetBox=(p,r,h)=>new THREE.Box3(new THREE.Vector3(p.x-r,p.y,p.z-r),new THREE.Vector3(p.x+r,p.y+h,p.z+r));
/** Full static and dynamic occupancy on every straight subsegment. Navigation
 * borrows live static owners, but deliberately keeps its own dynamic exclusion. */
function bodySweep(cm,fromFeet,toFeet,radius,height,staticMemo=null){
  const fromEye=new THREE.Vector3(fromFeet.x,fromFeet.y+height,fromFeet.z),toEye=new THREE.Vector3(toFeet.x,toFeet.y+height,toFeet.z);
  if(!cm.checkBoundary(toEye,radius)||!cm.checkRiverCrossing(toEye,radius,fromEye))return{fraction:0,kind:'world-boundary'};
  const bounds=feetBox(fromFeet,radius,height).union(feetBox(toFeet,radius,height));let first=null;
  // A memo exists only inside one roof vertical solve. Static ownership is
  // generation-bound; world limits and every dynamic part are ALWAYS queried.
  const source=furnitureMotionSource(cm),key=Object.is(toFeet.y,-0)?'negative-zero':toFeet.y;
  if(staticMemo){const generation=source._duixiuGrid();if(staticMemo.generation!==generation){staticMemo.values.clear();staticMemo.generation=generation;}}
  if(staticMemo?.values.has(key))first=staticMemo.values.get(key);
  else {for(const owner of furnitureLocalColliders(cm,bounds)){
    if(!bounds.intersectsBox(owner.box))continue;
    if(owner.triangleSupport||owner.overhead)throw new TypeError('Unsupported furniture-domain shape');
    if(owner.xiqingRoofSurface){const hit=xiqingSurfaceSweep(owner.xiqingRoofSurface,feetBox(fromFeet,radius,height),feetBox(toFeet,radius,height));if(hit&&(!first||hit.fraction<first.fraction))first={...hit,kind:'surface',collider:owner};continue;}
    const hit=furnitureBoxSweep(fromFeet,toFeet,owner.box,radius,height);
    if(hit&&(!first||hit.fraction<first.fraction))first={...hit,kind:'solid',collider:owner};
  }
  if(staticMemo)staticMemo.values.set(key,first);}
  if(source._duixiuGrid)for(const region of furnitureRegionIndex(cm).regions){const hit=stairRampSweep(region,fromFeet,toFeet,radius);if(hit&&(!first||hit.fraction<first.fraction))first=hit;}
  for(const actors of cm.dynamicBodies.values())for(const actor of actors){const hit=furnitureDynamicSweep(fromFeet,toFeet,actor,radius,height);if(hit&&(!first||hit.fraction<first.fraction))first=hit;}
  return first;
}
export function furnitureBodySweep(cm,fromFeet,toFeet,radius=.5,height=PLAYER.HEIGHT){return bodySweep(cm,fromFeet,toFeet,radius,height);}
export function furnitureContact(cm,x,z,maxTop,radius=.5,height=PLAYER.HEIGHT){
  const bounds=new THREE.Box3(new THREE.Vector3(x-radius,-Infinity,z-radius),new THREE.Vector3(x+radius,Infinity,z+radius));
  const owners=furnitureLocalColliders(cm,bounds).filter(c=>bounds.intersectsBox(c.box));
  const contact=furnitureStaticContact(owners,x,z,maxTop,radius,height);
  const ground=furnitureGroundWitness(cm,x,z,radius);
  let surface=contact.surface??(ground&&maxTop>=ground.height?ground:null);
  // Only the new raised Wumen links: the inherited gate masonry proxy stops
  // at y=3, below its actual registered platform. Prefer that validated live
  // floor over a lower proxy top, never over a higher real roof/beam surface.
  if(['existing-wuying-stair-floor','existing-yanshou-compound-floor','existing-cining-gate-floor','existing-ciyin-front-upper-floor','existing-wumen-link-platform-floor','existing-jiyun-upper-floor'].includes(ground?.source)&&maxTop>=ground.height&&(!surface||ground.height>surface.height))surface=ground;
  if(furnitureMotionSource(cm)._duixiuGrid)for(const region of furnitureRegionIndex(cm).regions){const ramp=stairRampContact(region,x,z,maxTop,radius);if(ramp&&(!surface||ramp.height>surface.height))surface=ramp;}
  if(!surface)return{surface:null,poseClear:false,blocker:null};
  const feet=new THREE.Vector3(x,surface.height,z),blocker=furnitureBodySweep(cm,feet,feet,radius,height);
  return{surface,poseClear:!blocker,blocker};
}

/** Inputs and outputs retain exact FEET scalars. Each lift/translate/settle
 * segment checks every static solid and every capsule part independently. */
export function furnitureTryStep(cm,from,to,radius,stepUp,motion){
  const failed={accepted:false},plain=furnitureBodySweep(cm,from,to,radius);
  const stairRise=!motion?.airborne&&motion&&furnitureMotionSource(cm)._duixiuGrid&&furnitureRegionIndex(cm).regions.some(r=>stairRampContact(r,to.x,to.z,from.y+stepUp,radius)?.height>from.y);
  if(!plain&&!stairRise){
    let target=furnitureContact(cm,to.x,to.z,from.y,radius);
    if(furnitureMotionSource(cm)._duixiuGrid)for(const region of furnitureRegionIndex(cm).regions){
      const exit=registeredWumenLinkExitFloor(furnitureMotionSource(cm),region,from,to,radius);
      if(exit&&from.y>=exit.height&&(!target.surface||exit.height>target.surface.height)){
        const at=new THREE.Vector3(to.x,exit.height,to.z);
        if(!bodySweep(cm,at,at,radius,PLAYER.HEIGHT))target={surface:exit,poseClear:true,blocker:null};
      }
    }
    const ground=target.surface?.height??0;
    if(motion?.kind==='kinematic'&&!motion.airborne){
      const source=furnitureContact(cm,from.x,from.z,from.y,radius);
      if(!source.poseClear||source.surface?.height!==from.y||!target.poseClear||!target.surface||from.y-ground>stepUp)return failed;
      const settled=new THREE.Vector3(to.x,ground,to.z);
      if(furnitureBodySweep(cm,to,settled,radius))return failed;
      return{accepted:true,position:settled,feetY:ground,groundY:ground,settled:true};
    }
    return{accepted:true,position:to.clone(),feetY:from.y,groundY:ground,settled:false};
  }
  if(!motion||motion.airborne)return failed;
  const source=furnitureContact(cm,from.x,from.z,from.y,radius);
  if(!source.surface||!source.poseClear||source.surface.height!==from.y)return failed;
  const target=furnitureContact(cm,to.x,to.z,from.y+stepUp,radius);
  if(!target.surface||!target.poseClear||target.surface.height<=from.y)return failed;
  const top=target.surface.height,raised=new THREE.Vector3(from.x,top,from.z),across=new THREE.Vector3(to.x,top,to.z);
  if(furnitureBodySweep(cm,from,raised,radius)||furnitureBodySweep(cm,raised,across,radius)||furnitureBodySweep(cm,across,across,radius))return failed;
  return{accepted:true,position:across,feetY:top,groundY:top,settled:true};
}
/** Scoped vertical response precedes the legacy ground-query upward snap.
 * Dynamic impact stops velocity but is never a floor/jump-reset event. */
export function resolveFurnitureVertical(cm,state,delta,radius=.5){
  const from=new THREE.Vector3(state.x,state.feetY,state.z);
  const jiyunUpwardFeet=state.airborne&&state.feetY<3&&state.verticalVelocity>0?state.feetY+Math.max(0,state.verticalVelocity-(PLAYER.GRAVITY??14)*delta)*delta:undefined;
  if(!furnitureScope(cm,from,from,radius,state.feetY,jiyunUpwardFeet,state.feetY))return null;
  const contact=furnitureContact(cm,state.x,state.z,state.feetY,radius);
  if(!state.airborne&&contact.surface?.height===state.feetY)
    return{...state,groundY:state.feetY,verticalVelocity:0,onSupport:true,landed:false,blockedPose:!contact.poseClear};
  const velocity=Math.max((state.airborne?state.verticalVelocity:0)-(PLAYER.GRAVITY??14)*delta,-(PLAYER.MAX_FALL_SPEED??30));
  const to=new THREE.Vector3(state.x,state.feetY+velocity*delta,state.z);let impact=furnitureBodySweep(cm,from,to,radius);
  if(['existing-environment-ground-sishen','existing-environment-ground-west-well','existing-environment-ground-east-well','existing-environment-ground-yanshou-compound','existing-environment-ground-cining-gate','existing-environment-ground-ciyin-front','existing-environment-ground-shoukang-entry','existing-environment-ground-shouan-entry','environment-ground','existing-environment-ground-r114-handoff','existing-environment-ground-xishang-handoff'].includes(furnitureGroundWitness(cm,state.x,state.z,radius)?.source)&&velocity<=0&&to.y<0&&from.y>=0){const fraction=from.y/(from.y-to.y);if(!impact||fraction<impact.fraction)impact={fraction,kind:'ground'};}
  if(velocity<=0&&['existing-wuying-stair-floor','existing-yanshou-compound-floor','existing-cining-gate-floor','existing-ciyin-front-upper-floor','existing-jiyun-upper-floor','existing-xishang-retained-floor','existing-wumen-link-platform-floor','existing-chengrui-plinth-floor','existing-qianqing-engineering-floor'].includes(contact.surface?.source)&&to.y<contact.surface.height&&from.y>=contact.surface.height){const fraction=(from.y-contact.surface.height)/(from.y-to.y);if(!impact||fraction<impact.fraction)impact={fraction,kind:'qianqing-floor',surface:contact.surface};}
  if(velocity<=0&&contact.surface?.source==='existing-lijing-engineering-floor'&&to.y<contact.surface.height&&from.y>=contact.surface.height){const fraction=(from.y-contact.surface.height)/(from.y-to.y);if(!impact||fraction<impact.fraction)impact={fraction,kind:'lijing-floor',surface:contact.surface};}
  if(velocity<=0&&contact.surface?.source==='existing-engineering-ramp'&&to.y<contact.surface.height&&from.y>=contact.surface.height){const fraction=(from.y-contact.surface.height)/(from.y-to.y);if(!impact||fraction<impact.fraction)impact={fraction,kind:'stair-ramp',surface:contact.surface};}
  if(!impact)return{...state,feetY:to.y,groundY:contact.surface?.height??0,verticalVelocity:velocity,airborne:true,onSupport:false,landed:false};
  let feet=from.y+(to.y-from.y)*impact.fraction;
  // Exact static top is the source of truth, avoiding multiply/add rounding.
  if(impact.kind==='ground')feet=0;
  else if(impact.kind==='stair-ramp'||impact.kind==='qianqing-floor'||impact.kind==='lijing-floor')feet=impact.surface.height;
  else if(impact.kind==='solid'&&impact.axis==='y'&&velocity<0&&!furnitureBoxSweep(from,from,impact.collider.box,radius))feet=impact.collider.box.max.y;
  // Use a representably clear prefix if an upward arithmetic roundtrip would
  // leave positive depth. This does not shrink the body or permit penetration.
  const at=new THREE.Vector3(state.x,feet,state.z);
  // Preserve all 48 fraction updates and their exact binary64 output. Repeated
  // represented heights need no duplicate static SAT; this cache cannot escape
  // the synchronous call, and never stores dynamic-NPC decisions.
  const staticMemo=impact.kind==='surface'?{generation:null,values:new Map()}:null;
  const probe=()=>bodySweep(cm,from,at,radius,PLAYER.HEIGHT,staticMemo);
  if(probe()&&impact.fraction>0){let low=0,high=impact.fraction;for(let i=0;i<48;i++){const mid=(low+high)/2;at.y=from.y+(to.y-from.y)*mid;if(probe())high=mid;else low=mid;}feet=from.y+(to.y-from.y)*low;}
  const final=furnitureContact(cm,state.x,state.z,feet,radius);
  const landed=velocity<=0&&impact.kind!=='dynamic'&&final.surface?.height===feet&&final.poseClear;
  return{...state,feetY:feet,groundY:final.surface?.height??0,verticalVelocity:0,airborne:!landed,onSupport:!!landed,landed:!!landed,blockedPose:!final.poseClear};
}

/** Explicitly audited Environment ground plane ownership, never an implicit
 * floor in an arbitrary synthetic collision space. */
export function furnitureGroundWitness(cm,x,z,radius=.5){
  if(!furnitureMotionSource(cm)._duixiuGrid)return null;
  const regions=furnitureRegionIndex(cm).regions;
  for(const r of regions)if(r.kind==='wuying-central-balustrades'){const floor=registeredWuyingBalustradeFloor(furnitureMotionSource(cm),r,x,z,radius);if(floor)return {...floor,witness:new THREE.Vector3(floor.witness.x,floor.witness.y,floor.witness.z)};}
  for(const r of regions)if(r.kind==='yanshou-compound'){const source=furnitureMotionSource(cm),floor=registeredYanshouCompoundFloor(source,r,x,z,radius);if(floor)return floor;const ground=yanshouCompoundEnvironmentWitness(source,r,x,z,radius);if(ground)return ground;}
  for(const r of regions)if(r.kind==='changchun-west-interior'){const floor=registeredChangchunWestFloor(furnitureMotionSource(cm),r,x,z,radius);if(floor)return floor;}
  for(const r of regions)if(r.kind==='cining-gate'){const source=furnitureMotionSource(cm),floor=registeredCiningGateFloor(source,r,x,z,radius);if(floor)return floor;const ground=ciningGateEnvironmentWitness(source,r,x,z,radius);if(ground)return ground;}
  for(const r of regions)if(r.kind==='ciyin-front'){const source=furnitureMotionSource(cm),upper=registeredCiyinFrontUpperFloor(source,r,x,z,radius);if(upper)return upper;const ground=ciyinFacadeEnvironmentWitness(source,r,x,z,radius);if(ground)return ground;}
  for(const r of regions)if(r.kind==='sishen'){const ground=sishenEnvironmentWitness(furnitureMotionSource(cm),r,x,z,radius);if(ground)return ground;}
  for(const r of regions)if(r.kind==='west-well'){const ground=westWellEnvironmentWitness(furnitureMotionSource(cm),r,x,z,radius);if(ground)return ground;}
  for(const r of regions)if(r.kind==='east-well'){const ground=eastWellEnvironmentWitness(furnitureMotionSource(cm),r,x,z,radius);if(ground)return ground;}
  for(const r of regions)if(r.kind==='shoukang-entry'){const ground=shoukangEntryEnvironmentWitness(furnitureMotionSource(cm),r,x,z,radius);if(ground)return ground;}
  for(const r of regions)if(r.kind==='shouan-entry'){const ground=shouanEntryEnvironmentWitness(furnitureMotionSource(cm),r,x,z,radius);if(ground)return ground;}
  for(const r of regions)if(r.kind==='jiyun-upper-front-rail'){const floor=registeredJiyunUpperFloor(furnitureMotionSource(cm),r,x,z,radius);if(floor)return floor;}
  for(const r of regions)if(r.kind==='xishang-roof-transom'){const floor=registeredXishangFloor(furnitureMotionSource(cm),r,x,z,radius);if(floor)return floor;const ground=xishangEnvironmentWitness(furnitureMotionSource(cm),r,x,z,radius);if(ground)return ground;}
  for(const r of regions)if(r.kind==='yanqu-photo-niche'){const floor=registeredYanquNicheFloor(furnitureMotionSource(cm),r,x,z,radius);if(floor)return{...floor,witness:new THREE.Vector3(x,floor.height,z)};}
  for(const r of regions)if(r.kind==='wumen-transverse-links'){const floor=registeredWumenLinkFloor(furnitureMotionSource(cm),r,x,z,radius);if(floor)return{...floor,witness:new THREE.Vector3(x,floor.height,z)};}
  for(const r of regions)if(r.kind==='chengrui-south-seats'){const floor=registeredChengruiSeatFloor(furnitureMotionSource(cm),r,x,z,radius);if(floor)return{...floor,witness:new THREE.Vector3(x,floor.height,z)};}
  for(const r of regions)if(r.kind==='lijing-west-room'){const floor=registeredLijingFloor(furnitureMotionSource(cm),r,x,z,radius);if(floor)return{...floor,witness:new THREE.Vector3(x,floor.height,z)};}
  for(const r of regions)if(r.kind==='qianqing-assemblies'){const floor=registeredQianqingFloor(furnitureMotionSource(cm),r,x,z,radius);if(floor)return{...floor,witness:new THREE.Vector3(x,floor.height,z)};}
  for(const r of regions)if(r.environmentGroundHandoff){const floor=chengqianEnvironmentWitness(furnitureMotionSource(cm),r,x,z,radius);if(floor)return{...floor,witness:new THREE.Vector3(x,0,z)};}
  const region=regions.find(r=>!r.environmentGroundHandoff&&r.groundY===0&&x+radius>=r.minX&&x-radius<=r.maxX&&z+radius>=r.minZ&&z-radius<=r.maxZ);
  return region?{height:0,witness:new THREE.Vector3(x,0,z),owner:null,source:'environment-ground',regionId:region.id}:null;
}
