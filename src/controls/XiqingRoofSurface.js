import {QIANQING_ASSEMBLY_IDS} from './QianqingAssemblySupport.js';
import * as THREE from 'three';
import { exactSquareWitness, ceilingExact, exactDouble, compareExact, serializeExact, intervalSurfaceIntersects, exactSurfaceIntersects, exactSurfaceSweep } from './XiqingRoofExact.js';
const COURTYARD_IDS=['chengqian-main-finished-columns','tihe-finished-access','lijing-finished-access','chuxiu-gallery-finished-access','chuxiu-main-finished-access','chuxiu-yanghe-entry','chuxiu-suifu-entry','chengqian-main-finished-access'];
const ARRIVAL_IDS=['chengqian-rear-floor','chengqian-rear-cheek-east','chengqian-rear-cheek-west'];
const IDS=new Set([...COURTYARD_IDS,...ARRIVAL_IDS,'chuxiu-main-floor','chengqian-west-court-roof','xiqing-roof-south','xiqing-roof-middle','xiqing-roof-north',...QIANQING_ASSEMBLY_IDS,...Array.from({length:4},(_,i)=>'qianqing-display-vessel-'+i)]);
const surfaceKind=id=>COURTYARD_IDS.includes(id)?'retained-courtyard-surface':ARRIVAL_IDS.includes(id)?'chengqian-arrival-surface':id==='chuxiu-main-floor'?'chuxiu-main-floor-surface':id==='chengqian-west-court-roof'?'chengqian-court-roof-surface':id.startsWith('qianqing-display-')?'qianqing-display-surface':QIANQING_ASSEMBLY_IDS.includes(id)?'qianqing-assembly-surface':'xiqing-roof-surface';
const basis=[new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1)];
const axesCache=new WeakMap(),gridCache=new WeakMap();
const freezeBox=b=>{Object.freeze(b.min);Object.freeze(b.max);return Object.freeze(b);};
/** Per-template private immutable-source index; no global cache or GPU objects. */
export function queryXiqingSurfaceTriangles(shape,box){let grid=gridCache.get(shape.template);const cell=.75,key=(i,k)=>i+':'+k;if(!grid){grid=new Map();for(let id=0;id<shape.template.triangles.length;id++){const b=shape.template.triangles[id].box;for(let i=Math.floor(b.min.x/cell);i<=Math.floor(b.max.x/cell);i++)for(let k=Math.floor(b.min.z/cell);k<=Math.floor(b.max.z/cell);k++){const q=key(i,k),a=grid.get(q)??[];a.push(id);grid.set(q,a);}}gridCache.set(shape.template,grid);}
 const b=box.clone().intersect(shape.box);if(b.isEmpty())return [];const ids=new Set();for(let i=Math.floor(b.min.x/cell);i<=Math.floor(b.max.x/cell);i++)for(let k=Math.floor(b.min.z/cell);k<=Math.floor(b.max.z/cell);k++)for(const id of grid.get(key(i,k))??[])ids.add(id);return [...ids].sort((a,b)=>a-b).map(id=>({id,face:shape.template.triangles[id]}));
}
/** Actual world-space rendered triangles; these are OPEN surfaces, not solids.
 * No parity/inside-volume inference is valid here. Zero-area source faces alone
 * are omitted; every retained face keeps its original mesh/triangle identity. */
export function createXiqingSurface(faces,id){
 if(!IDS.has(id)||!Array.isArray(faces)||!faces.length)throw new TypeError('Explicit Xiqing roof faces and identity required');
 const triangles=[],omitted=[],sourceFaces=[],bounds=new THREE.Box3(),seen=new Set();
 for(const face of faces){const source=face?.source,v=face?.vertices;if(!source||!Number.isInteger(source.mesh)||source.mesh<0||!Number.isInteger(source.triangle)||source.triangle<0||!Array.isArray(v)||v.length!==3||v.some(p=>!p||!['x','y','z'].every(k=>Number.isFinite(p[k]))))throw new TypeError('Finite source-mapped roof triangle required');
  const key=source.mesh+':'+source.triangle;if(seen.has(key))throw new TypeError('Duplicate roof source face');seen.add(key);
  const triangle=new THREE.Triangle(...v.map(p=>new THREE.Vector3(p.x,p.y,p.z))),normal=new THREE.Vector3().subVectors(triangle.b,triangle.a).cross(new THREE.Vector3().subVectors(triangle.c,triangle.a)),map=Object.freeze({...source});
  sourceFaces.push(Object.freeze({vertices:Object.freeze([triangle.a,triangle.b,triangle.c].map(p=>Object.freeze(p))),source:map}));
  if(normal.lengthSq()===0){omitted.push(map);continue;}
  const box=new THREE.Box3().setFromPoints([triangle.a,triangle.b,triangle.c]);bounds.union(box);triangles.push(Object.freeze({triangle:Object.freeze(triangle),normal:Object.freeze(normal),box:freezeBox(box),source:map}));
 }
 if(!triangles.length)throw new TypeError('Roof requires a positive-area face');
 if(bounds.max.x-bounds.min.x>32||bounds.max.z-bounds.min.z>32)throw new TypeError('Xiqing roof exceeds bounded local surface domain');freezeBox(bounds);
 return Object.freeze({kind:surfaceKind(id),id,template:Object.freeze({triangles:Object.freeze(triangles),omitted:Object.freeze(omitted),sourceFaces:Object.freeze(sourceFaces),bounds}),box:freezeBox(bounds.clone())});
}
export function cloneXiqingSurface(input,box){
 if(input===undefined)return null;
 if(input?.kind!==surfaceKind(input?.id??'')||!IDS.has(input.id)||!input.template?.triangles?.length||!input.box?.equals(box)||!input.template.bounds?.equals(box))throw new TypeError('Xiqing surface requires exact owned bounds');
 // Copy/validate the full CPU source, not only a mutable bounding box.
 const copy=createXiqingSurface(input.template.sourceFaces,input.id);if(!copy.box.equals(box))throw new TypeError('Roof source differs from owned bounds');return copy;
}
function axes(q){let a=axesCache.get(q);if(a)return a;const t=q.triangle,origin=t.a,edges=[t.b.clone().sub(origin),t.c.clone().sub(t.b),origin.clone().sub(t.c)],vs=[new THREE.Vector3(),t.b.clone().sub(origin),t.c.clone().sub(origin)];a=[...basis,q.normal,...edges.flatMap(e=>basis.map(b=>e.clone().cross(b)))].filter(v=>v.lengthSq()!==0).map(axis=>({axis,low:Math.min(...vs.map(v=>v.dot(axis))),high:Math.max(...vs.map(v=>v.dot(axis)))}));axesCache.set(q,a);return a;}
function projection(box,origin,axis){let low=0,high=0;for(const k of['x','y','z']){const a=(box.min[k]-origin[k])*axis[k],b=(box.max[k]-origin[k])*axis[k];low+=Math.min(a,b);high+=Math.max(a,b);}return{low,high};}
export function xiqingSurfaceBodyIntersects(shape,box){
 if(!box.intersectsBox(shape.box))return false;
 for(const {face:q} of queryXiqingSurfaceTriangles(shape,box)){if(!box.intersectsBox(q.box))continue;const verdict=intervalSurfaceIntersects(q,box);if(verdict===true||verdict===null&&exactSurfaceIntersects(q,box))return true;}
 return false;
}
/** Continuous translation of the complete AABB; touching/sliding/away allowed,
 * motion into either side blocks at zero. No closed-solid parity anywhere. */
export function xiqingSurfaceSweep(shape,from,to){
 for(const k of['x','y','z'])if(!Number.isFinite(from.min[k])||!Number.isFinite(from.max[k])||!Number.isFinite(to.min[k])||!Number.isFinite(to.max[k])||from.max[k]<=from.min[k]||to.max[k]<=to.min[k]||Math.abs((to.max[k]-to.min[k])-(from.max[k]-from.min[k]))>1e-12)throw new TypeError('Finite fixed-size surface sweep required');
 const bounds=from.clone().union(to);if(!bounds.intersectsBox(shape.box))return null;
 const velocity=new THREE.Vector3().subVectors(to.min,from.min);let first=null;
 for(const {id:i,face:q} of queryXiqingSurfaceTriangles(shape,bounds)){if(!bounds.intersectsBox(q.box))continue;
  if(intervalSurfaceIntersects(q,from)===null||intervalSurfaceIntersects(q,to)===null){const fraction=exactSurfaceSweep(q,from,to);if(fraction!==null&&(!first||fraction<first.fraction))first={fraction,triangleId:i};continue;}
  let enter=0,leave=1;
  for(const a of axes(q)){const p=projection(from,q.triangle.a,a.axis),speed=velocity.dot(a.axis);if(speed===0){if(p.high<=a.low||p.low>=a.high){enter=2;break;}}
   else{const t0=(a.low-p.high)/speed,t1=(a.high-p.low)/speed;enter=Math.max(enter,Math.min(t0,t1));leave=Math.min(leave,Math.max(t0,t1));if(enter>=leave)break;}}
  if(enter<leave&&enter<1&&leave>0&&(!first||enter<first.fraction))first={fraction:Math.max(0,enter),triangleId:i};
 }
 return first;
}
export function xiqingSurfaceFootContact(shape,x,z,maxTop,radius=.5){
 if(![x,z,radius].every(Number.isFinite)||radius<=0||Number.isNaN(maxTop))throw new TypeError('Finite real square footprint required');
 if(shape.box.min.y>maxTop||x+radius<shape.box.min.x||x-radius>shape.box.max.x||z+radius<shape.box.min.z||z-radius>shape.box.max.z)return null;
 let best=null,bestExact=null;const footprint=new THREE.Box3(new THREE.Vector3(x-radius,shape.box.min.y,z-radius),new THREE.Vector3(x+radius,Math.min(maxTop,shape.box.max.y),z+radius));for(const {id:i,face:q} of queryXiqingSurfaceTriangles(shape,footprint)){if(q.normal.y<=0||q.box.min.y>maxTop||x+radius<q.box.min.x||x-radius>q.box.max.x||z+radius<q.box.min.z||z-radius>q.box.max.z)continue;const exact=exactSquareWitness(q,x-radius,x+radius,z-radius,z+radius);if(!exact)continue;
 const height=ceilingExact(exact.y);if(Number.isFinite(maxTop)&&compareExact(exact.y,exactDouble(maxTop))>0||bestExact&&compareExact(exact.y,bestExact)<=0)continue;
 const witness=new THREE.Vector3(Number(exact.x.n)/Number(exact.x.d),Number(exact.y.n)/Number(exact.y.d),Number(exact.z.n)/Number(exact.z.d));
 bestExact=exact.y;best={height,witness,exactWitness:Object.fromEntries(['x','y','z'].map(k=>[k,serializeExact(exact[k])])),exactHeight:serializeExact(exact.y),instanceId:shape.id,triangleId:i,source:q.source};}return best;
}
