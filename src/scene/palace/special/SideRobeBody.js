import * as T from 'three';
import {createRobeProfileField} from './SideRobeField.js';
import {createCrossLegRobeField} from './SideCrossLegField.js';
import {createSideHemWarp} from './SideHemWarp.js';
// Fixed-budget continuous engineering surface; no recovered or surveyed depth.
export function createSideRobeBody({profile,retainedParts:parts,step=.025,blend=.035,hemWarp=null,crossLeg=null}){
 const lower=crossLeg===null?null:createCrossLegRobeField(crossLeg);if(lower&&hemWarp!==null)throw Error('Lower structure replaces, not combines with, hem warp');
 const robe=createRobeProfileField(profile),hem=hemWarp===null?null:createSideHemWarp(hemWarp);
 if(!Array.isArray(parts)||parts.length>24||!Number.isFinite(step)||step<.02||step>.08||!Number.isFinite(blend)||blend<0||blend>.06)throw Error('Bounded body field required');
 const fields=parts.map(p=>{if(![...p.center,...p.radii].every(Number.isFinite)||p.radii.some(r=>r<=0))throw Error('Invalid ellipsoid');return{...p,q:new T.Quaternion(...(p.orientation??[0,0,0,1])).invert(),scale:Math.min(...p.radii)};});
 const v=new T.Vector3();const field=(x,y,z)=>{let d=robe.distance(x,y,hem?hem.mapZ(x,y,z):z);if(lower){d=Math.max(d,lower.controls.upperClip-y);const e=lower.distance(x,y,z),h=blend===0?0:Math.max(0,Math.min(1,.5+.5*(e-d)/blend));d=blend===0?Math.min(d,e):e+(d-e)*h-blend*h*(1-h);}for(const p of fields){v.set(x-p.center[0],y-p.center[1],z-p.center[2]).applyQuaternion(p.q);const e=(Math.hypot(v.x/p.radii[0],v.y/p.radii[1],v.z/p.radii[2])-1)*p.scale;if(!Number.isFinite(d)||blend===0)d=Math.min(d,e);else{const h=T.MathUtils.clamp(.5+.5*(e-d)/blend,0,1);d=T.MathUtils.lerp(e,d,h)-blend*h*(1-h);}}return d;};
 const box=new T.Box3(new T.Vector3(...robe.bounds.min).addScalar(-blend-.04),new T.Vector3(...robe.bounds.max).addScalar(blend+.04));for(const p of fields){const radius=Math.max(...p.radii)+blend+.04;box.expandByPoint(new T.Vector3(...p.center).addScalar(radius));box.expandByPoint(new T.Vector3(...p.center).addScalar(-radius));}
 if(hem)box.max.z+=hem.frontExpansion;if(lower){box.expandByPoint(new T.Vector3(...lower.bounds.min).addScalar(-blend-.04));box.expandByPoint(new T.Vector3(...lower.bounds.max).addScalar(blend+.04));}
 const lo=box.min.toArray().map(x=>Math.floor(x/step)*step),hi=box.max.toArray().map(x=>Math.ceil(x/step)*step),n=hi.map((x,i)=>Math.round((x-lo[i])/step)+1);if(n[0]*n[1]*n[2]>650000)throw Error('Body field budget exceeded');
 const at=(x,y,z)=>(z*n[1]+y)*n[0]+x,xyz=i=>{const x=i%n[0],y=Math.floor(i/n[0])%n[1],z=Math.floor(i/(n[0]*n[1]));return[lo[0]+x*step,lo[1]+y*step,lo[2]+z*step];};const values=new Float32Array(n[0]*n[1]*n[2]);for(let i=0;i<values.length;i++){const d=field(...xyz(i));values[i]=Math.abs(d)<1e-7?0:d;}
 // Shared zero-node identity plus sub-micron field snapping avoids duplicate
 // vertices at exact grid intersections. Never discard merely small faces.
 for(let z=0;z<n[2];z++)for(let y=0;y<n[1];y++)for(let x=0;x<n[0];x++)if((x===0||y===0||z===0||x===n[0]-1||y===n[1]-1||z===n[2]-1)&&values[at(x,y,z)]<=0)throw Error('Body field touches finite domain boundary');
 const points=[],indices=[],edgeVertices=new Map();const vertex=(a,b)=>{if(a>b)[a,b]=[b,a];const zero=values[a]===0?a:values[b]===0?b:null,key=zero===null?`${a}:${b}`:`node:${zero}`;if(edgeVertices.has(key))return edgeVertices.get(key);const pa=xyz(a),pb=xyz(b),t=values[a]/(values[a]-values[b]),id=points.length/3;points.push(...pa.map((x,i)=>x+(pb[i]-x)*t));edgeVertices.set(key,id);return id;};
 const emit=(a,b,c,direction)=>{const va=new T.Vector3().fromArray(points,a*3),vb=new T.Vector3().fromArray(points,b*3),vc=new T.Vector3().fromArray(points,c*3),cross=vb.sub(va).cross(vc.sub(va));if(cross.lengthSq()===0)return;if(cross.dot(direction)<0)[b,c]=[c,b];if(indices.length>=750000)throw Error('Body triangle budget exceeded');indices.push(a,b,c);};
 const tets=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
 for(let z=0;z<n[2]-1;z++)for(let y=0;y<n[1]-1;y++)for(let x=0;x<n[0]-1;x++){
  const cube=[at(x,y,z),at(x+1,y,z),at(x+1,y+1,z),at(x,y+1,z),at(x,y,z+1),at(x+1,y,z+1),at(x+1,y+1,z+1),at(x,y+1,z+1)];
  if(cube.every(i=>values[i]<0)||cube.every(i=>values[i]>=0))continue;
  for(const tet of tets){const inside=tet.map(i=>cube[i]).filter(i=>values[i]<0),outside=tet.map(i=>cube[i]).filter(i=>values[i]>=0);if(!inside.length||!outside.length)continue;
   const mean=arr=>arr.reduce((v,i)=>v.add(new T.Vector3(...xyz(i))),new T.Vector3()).multiplyScalar(1/arr.length),direction=mean(outside).sub(mean(inside));
   if(inside.length===1){const ids=outside.map(i=>vertex(inside[0],i));emit(...ids,direction);}else if(outside.length===1){const ids=inside.map(i=>vertex(i,outside[0]));emit(...ids,direction);}else{const[a,b]=inside,[c,d]=outside,ac=vertex(a,c),ad=vertex(a,d),bc=vertex(b,c),bd=vertex(b,d);emit(ac,ad,bc,direction);emit(ad,bd,bc,direction);}
  }
 }
 const g=new T.BufferGeometry();try{g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(points.length/3*2),2));g.setIndex(indices);g.computeVertexNormals();
  // Smooth shading follows the same continuous field, not irregular tetrahedron
  // triangle area averages. Geometry/topology are unchanged by this step.
  const normals=g.attributes.normal,h=.001;
  for(let i=0;i<points.length/3;i++){const x=points[i*3],y=points[i*3+1],z=points[i*3+2],nx=field(x+h,y,z)-field(x-h,y,z),ny=field(x,y+h,z)-field(x,y-h,z),nz=field(x,y,z+h)-field(x,y,z-h),length=Math.hypot(nx,ny,nz);if(length>1e-12)normals.setXYZ(i,nx/length,ny/length,nz/length);}
  g.computeBoundingBox();g.computeBoundingSphere();g.userData.bodyField={step,blend,normalMethod:'SAME_FIELD_CENTRAL_GRADIENT',gradientStepMetres:.001,zeroSnapMetres:1e-7,distanceApproximation:'MIN_RADIUS_SCALED_NORMALIZED_ELLIPSOID',domainBoundaryOutside:true,samples:values.length,profile:robe.profile,hemWarp:hem?.controls??null,lowerRobe:lower?.controls??null,hemMinJacobian:hem?.minJacobian??1,kind:'CONTINUOUS_PROFILE_AND_RETAINED_PARTS_ENGINEERING_FIT'};return g;}catch(e){try{g.dispose();}catch{}throw e;}
}
