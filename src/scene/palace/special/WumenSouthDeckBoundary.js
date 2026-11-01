import {PLAYER} from '../../../config/constants.js';

// Capabilities belong to actual installed platform supports, not copyable labels.
// No global rectangle/floor or cached permission survives support unloading.
const sources=new WeakMap(),registered=new WeakMap();
const EPS=1e-7,TOP=12.3,FOOT_TOLERANCE=.08;
// Existing player ballistic apex, not a new flight height or support surface.
const MAX_JUMP_RISE=(PLAYER.JUMP_VELOCITY??6.7)**2/(2*(PLAYER.GRAVITY??14));
const snapshot=b=>[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z];
const same=(b,a)=>b?.isBox3&&snapshot(b).every((v,i)=>v===a[i]);

/** Called only by the Wumen installer on its newly built world-space supports. */
export function authorizeWumenSouthDeckSources(supports){
 for(const s of supports){
  if(s.type!=='box'||!/^wumen-joint\/platform-cell\/\d+\/slab$/.test(s.wumenJointPlatformPart??''))continue;
  const b=s.box,a=snapshot(b);
  if(!a.every(Number.isFinite)||b.min.y!==TOP||b.max.y!==TOP||b.min.x< -63.5-EPS||b.max.x>63.5+EPS||b.min.z< -515.6-EPS||b.max.z> -405.1+EPS||b.min.x>=b.max.x||b.min.z>=b.max.z)throw Error('Invalid actual Wumen platform support');
  // North-only cells need no exception and are not granted one.
  if(b.min.z< -499.5)sources.set(s,Object.freeze(a));
 }
}
export function preserveWumenSouthDeckOwner(target,source){
 const bounds=sources.get(source);
 if(bounds&&target?.type==='box'&&same(source.box,bounds)&&same(target.box,bounds))registered.set(target,{source,bounds});
}

/** Only a standing/ordinary-jumping body fully above live authored slabs may cross
 * the old south limit. Called after the normal X and north bounds are checked.
 * Adjacent cells count jointly; tiny numerical seams do not become air walls. */
export function canUseWumenSouthDeckBoundary(manager,position,radius){
 if(![position.x,position.y,position.z,radius].every(Number.isFinite)||radius<=0||radius>1)return false;
 const rise=position.y-PLAYER.HEIGHT-TOP;
 if(rise< -FOOT_TOLERANCE||rise>MAX_JUMP_RISE+FOOT_TOLERANCE)return false;
 const x0=position.x-radius,x1=position.x+radius,z0=position.z-radius,z1=position.z+radius;
 const rectangles=[];
 for(const w of manager.walkables){
  const owner=registered.get(w);
  if(!owner||w.type!=='box'||!same(w.box,owner.bounds)||!same(owner.source.box,owner.bounds))continue;
  const b=w.box,minX=Math.max(x0,b.min.x),maxX=Math.min(x1,b.max.x),minZ=Math.max(z0,b.min.z),maxZ=Math.min(z1,b.max.z);
  if(maxX>minX&&maxZ>minZ)rectangles.push({minX,maxX,minZ,maxZ});
 }
 if(!rectangles.length)return false;
 const xs=[...new Set([x0,x1,...rectangles.flatMap(r=>[r.minX,r.maxX])])].sort((a,b)=>a-b);
 for(let i=1;i<xs.length;i++){
  if(xs[i]-xs[i-1]<=EPS)continue;
  const x=(xs[i]+xs[i-1])/2,intervals=rectangles.filter(r=>x>=r.minX&&x<=r.maxX).sort((a,b)=>a.minZ-b.minZ);
  let covered=z0;
  for(const r of intervals){if(r.minZ>covered+EPS)break;covered=Math.max(covered,r.maxZ);}
  if(covered<z1-EPS)return false;
 }
 return true;
}
