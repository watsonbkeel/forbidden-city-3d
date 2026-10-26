import {CHARACTER_SEAT_FOOT_Y} from './CharacterSeatVariants.js';
/** R65 pedestrian-only 2.5D capsules. Metres, same +Z-facing pose frame as
 * CharacterKit. These approximate clothed body volumes, not arms/hat ornaments
 * or furniture. They never provide architectural ground or navigation proof. */
const EPS=1e-7;
const part=(ax,az,bx,bz,radius,minY,maxY)=>({ax,az,bx,bz,radius,minY,maxY});
export function characterBody(actor,{position,rotationYRad=0}){
 const pose=actor.behavior?.basePose??actor.pose??'standing';
 const female=['consort','maid'].some(s=>actor.templateId?.includes(s));
 const torso=female?.29:.34;
 let parts;
 if(pose==='sleeping'){
  parts=[part(0,-.78,0,.75,.29,0,.65)];
 }else if(pose==='seated'){
  const variant=actor.behavior?.seatVariant??'standard';
  const footZ=variant==='raised-footstool'?.815:variant==='throne-front-perch'?.58:.535;
  const footY=CHARACTER_SEAT_FOOT_Y[variant]??0;
  parts=[part(0,-.04,0,.25,.27,.45,.74),part(0,.27,0,footZ,.255,footY,.60),part(0,-.04,0,-.04,torso,.66,1.18),part(0,-.04,0,-.04,.18,1.12,1.44)];
 }else if(pose==='kneeling'){
  parts=[part(0,-.20,0,.29,.275,0,.47),part(0,.04,0,.04,torso,.32,.91),part(0,.04,0,.04,.18,.84,1.15)];
 }else parts=[part(0,0,0,.05,.29,0,.99),part(0,0,0,0,torso,.88,1.48),part(0,0,0,0,.18,1.40,1.73)];
 const c=Math.cos(rotationYRad),s=Math.sin(rotationYRad),[x,y,z]=position;
 return{id:actor.id,pose,parts:parts.map(p=>({...p,ax:x+p.ax*c+p.az*s,az:z-p.ax*s+p.az*c,bx:x+p.bx*c+p.bz*s,bz:z-p.bx*s+p.bz*c,minY:y+p.minY,maxY:y+p.maxY}))};
}
export function pointSegmentDistance(x,z,p){
 const dx=p.bx-p.ax,dz=p.bz-p.az,den=dx*dx+dz*dz;
 const t=den?Math.max(0,Math.min(1,((x-p.ax)*dx+(z-p.az)*dz)/den)):0;
 return Math.hypot(x-p.ax-t*dx,z-p.az-t*dz);
}
export function bodyPenetration(body,player){
 if(!player)return 0;
 const [x,y,z]=player.position;let depth=0;
 for(const p of body.parts){
  if(y>=p.maxY-EPS||y+player.height<=p.minY+EPS)continue;
  depth=Math.max(depth,p.radius+player.radius-pointSegmentDistance(x,z,p));
 }
 return Math.max(0,depth);
}
export const bodyIntersectsPlayer=(body,player)=>bodyPenetration(body,player)>EPS;
function segmentDistance(a,b){
 const ux=a.bx-a.ax,uz=a.bz-a.az,vx=b.bx-b.ax,vz=b.bz-b.az,wx=b.ax-a.ax,wz=b.az-a.az,den=ux*vz-uz*vx;
 if(Math.abs(den)>1e-12){const s=(wx*vz-wz*vx)/den,t=(wx*uz-wz*ux)/den;if(s>=0&&s<=1&&t>=0&&t<=1)return 0;}
 return Math.min(pointSegmentDistance(a.ax,a.az,b),pointSegmentDistance(a.bx,a.bz,b),pointSegmentDistance(b.ax,b.az,a),pointSegmentDistance(b.bx,b.bz,a));
}
/** Exact horizontal capsule sweep, clipped to the interval of vertical overlap.
 * Detects a short grazing chord even when both movement endpoints are clear. */
export function sweptPlayerBodyPenetration(body,from,to){
 let depth=0;
 for(const p of body.parts){
  let low=0,high=1;const y0=from.position[1],dy=to.position[1]-y0,minimum=p.minY-from.height+EPS,maximum=p.maxY-EPS;
  if(Math.abs(dy)<1e-12){if(y0<=minimum||y0>=maximum)continue;}
  else{const a=(minimum-y0)/dy,b=(maximum-y0)/dy;low=Math.max(0,Math.min(a,b));high=Math.min(1,Math.max(a,b));if(low>high)continue;}
  const x=from.position[0],z=from.position[2],dx=to.position[0]-x,dz=to.position[2]-z;
  const sweep={ax:x+dx*low,az:z+dz*low,bx:x+dx*high,bz:z+dz*high};
  depth=Math.max(depth,p.radius+from.radius-segmentDistance(sweep,p));
 }
 return Math.max(0,depth);
}
export function sweptBodyIntersectsPlayer(from,to,player){
 if(!player)return false;
 if(from.parts.length!==to.parts.length)throw Error('A body sweep requires matching pose parts');
 let travel=0;
 for(let i=0;i<from.parts.length;i++){const a=from.parts[i],b=to.parts[i];travel=Math.max(travel,Math.hypot(b.ax-a.ax,b.az-a.az),Math.hypot(b.bx-a.bx,b.bz-a.bz),Math.abs(b.minY-a.minY),Math.abs(b.maxY-a.maxY));}
 // Bounded authored movement is <=.075m/frame. The standalone helper also
 // safely handles larger test sweeps without endpoint-only tunnelling.
 const steps=Math.max(1,Math.ceil(travel/.025)),padding=travel/steps/2;
 for(let n=0;n<=steps;n++){
  const t=n/steps,parts=from.parts.map((a,i)=>{const b=to.parts[i],p={radius:Math.max(a.radius,b.radius)+(n?padding:0)};for(const k of ['ax','az','bx','bz','minY','maxY'])p[k]=a[k]+(b[k]-a[k])*t;return p;});
  if(bodyIntersectsPlayer({parts},player))return true;
 }
 return false;
}
export function validateDynamicBodies(bodies){
 if(!Array.isArray(bodies)||bodies.length>128)throw new TypeError('Dynamic body list must contain at most 128 actors');
 const ids=new Set();
 return bodies.map(body=>{
  if(typeof body.id!=='string'||!body.id||ids.has(body.id))throw new TypeError('Invalid or duplicate dynamic body ID');ids.add(body.id);
  if(!Array.isArray(body.parts)||!body.parts.length||body.parts.length>8)throw new TypeError('Invalid body parts');
  return{id:body.id,parts:body.parts.map(p=>{
   if(!['ax','az','bx','bz','radius','minY','maxY'].every(k=>Number.isFinite(p[k]))||p.radius<=0||p.radius>1||p.minY>=p.maxY)throw new TypeError('Finite ordered dynamic body parts required');
   return{...p};
  })};
 });
}
