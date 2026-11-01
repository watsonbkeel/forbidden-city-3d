import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';

/** Wumen-only masonry primitive. Ramp support is the authored visible plane;
 * ordinary internal body boxes are conservative slices, NOT exact triangle bodies.
 * No controller changes or recovery floors; the caller registers finite outputs. */
export function buildWumenJointRampSolid(p,material,tileSize=1){
 const fail=s=>{throw new TypeError(`joint ramp: ${s}`);};
 if(!p||!['x','z'].includes(p.axis)||typeof p.id!=='string'||!p.id||!material?.isMaterial)fail('explicit id, axis and material required');
 const keys=['minX','maxX','minZ','maxZ','a0','a1','y0','y1','baseY','bodySlice'];
 if(!keys.every(k=>Number.isFinite(p[k]))||!(p.minX<p.maxX&&p.minZ<p.maxZ&&p.bodySlice>0&&p.bodySlice<=.25)||p.baseY<0||Math.min(p.y0,p.y1)<p.baseY||Math.max(p.y0,p.y1)<=p.baseY)fail('finite ordered positive solid required');
 if(!keys.every(k=>Number.isFinite(Math.fround(p[k])))||!(Math.fround(p.minX)<Math.fround(p.maxX)&&Math.fround(p.minZ)<Math.fround(p.maxZ)&&Math.fround(p.baseY)<Math.fround(Math.max(p.y0,p.y1))))fail('Float32 representation must remain finite and noncollapsed');
 const lo=p.axis==='x'?p.minX:p.minZ,hi=p.axis==='x'?p.maxX:p.maxZ;
 if(!((p.a0===lo&&p.a1===hi)||(p.a0===hi&&p.a1===lo)))fail('slope endpoints must coincide with actual footprint');
 const n=Math.max(Math.ceil((hi-lo)/p.bodySlice),Math.ceil(Math.abs(p.y1-p.y0)/.1));
 if(!Number.isSafeInteger(n)||n<1||n>4096)fail('bounded subdivision count1..4096 required');
 const height=a=>p.y0+(p.y1-p.y0)*(a-p.a0)/(p.a1-p.a0);
 const original=new T.BoxGeometry(p.maxX-p.minX,1,p.maxZ-p.minZ);
 const source=original.toNonIndexed();original.dispose();
 const pos=source.attributes.position,values=[];let maximumYRepresentationError=0,maximumPositionRepresentationError=0,maximumTopPlaneResidual=0;
 for(let i=0;i<pos.count;i+=3){
  const vertices=[0,1,2].map(k=>{const x=pos.getX(i+k)>0?p.maxX:p.minX,z=pos.getZ(i+k)>0?p.maxZ:p.minZ;return new T.Vector3(x,pos.getY(i+k)>0?height(p.axis==='x'?x:z):p.baseY,z);});
  if(new T.Triangle(...vertices).getArea()===0)continue;
  for(const v of vertices){maximumYRepresentationError=Math.max(maximumYRepresentationError,Math.abs(Math.fround(v.y)-v.y));maximumPositionRepresentationError=Math.max(maximumPositionRepresentationError,...v.toArray().map(n=>Math.abs(Math.fround(n)-n)));if(v.y!==p.baseY)maximumTopPlaneResidual=Math.max(maximumTopPlaneResidual,Math.abs(Math.fround(v.y)-height(Math.fround(p.axis==='x'?v.x:v.z))));values.push(v.x,v.y,v.z);}
 }
 source.dispose();
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(values,3));const actual=geometry.attributes.position;
 for(let i=0;i<actual.count;i+=3){const vs=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(actual,i+k));if(!vs.every(v=>v.toArray().every(Number.isFinite))||new T.Triangle(...vs).getArea()<=1e-12){geometry.dispose();fail('converted triangle must be finite and nondegenerate');}}
 if(!actual.count){geometry.dispose();fail('converted solid must contain faces');}
 geometry.computeVertexNormals();
 applyBoxUV(geometry,tileSize);geometry.computeBoundingBox();geometry.computeBoundingSphere();
 const mesh=new T.Mesh(geometry,material);mesh.name=p.id;mesh.userData.jointCandidate={id:p.id,kind:'visible-closed-ramp-solid',runtimeInstalled:false};
 const colliders=[];let maxDeficit=0;
 for(let i=0;i<n;i++){
  const a=lo+(hi-lo)*i/n,b=lo+(hi-lo)*(i+1)/n,top=Math.min(height(a),height(b));maxDeficit=Math.max(maxDeficit,Math.max(height(a),height(b))-top);
  if(top<=p.baseY)continue;
  colliders.push(new T.Box3(new T.Vector3(p.axis==='x'?a:p.minX,p.baseY,p.axis==='z'?a:p.minZ),new T.Vector3(p.axis==='x'?b:p.maxX,top,p.axis==='z'?b:p.maxZ)));
 }
 const walkable={type:'ramp',axis:p.axis,minX:p.minX,maxX:p.maxX,minZ:p.minZ,maxZ:p.maxZ,a0:p.a0,a1:p.a1,y0:p.y0,y1:p.y1,rescue:false};
 const contract={status:'ENGINEERING_RAMP_SAME_PLANE_WITH_BOUNDED_INTERNAL_BODY_PROXIES',runtimeInstalled:false,maximumVerticalDeficit:Math.round(maxDeficit*1e12)/1e12,maximumYRepresentationError,maximumPositionRepresentationError,maximumTopPlaneResidual,bodyPolicy:'ordinary contained slices; standard controller step clearance retained',surfacePolicy:'continuous visible plane, not invented discrete tread count',supportPolicy:'same authored footprint and height function; no bridge over an absent surface'};
 let disposed=false;
 return{mesh,colliders,walkable,contract,dispose(){if(disposed)return;disposed=true;geometry.dispose();}};
}
