import * as THREE from 'three';

const EPS=1e-8;
/** Immutable local-space CPU geometry shared by explicit translated owners.
 * No fallback to a broadphase box, inferred floor, or rescued height. */
export function createTriangleTemplate(geometry){
 const p=geometry?.attributes?.position,index=geometry?.index;if(!p||p.itemSize!==3)throw new TypeError('Triangle positions required');
 const count=index?index.count:p.count;if(count%3)throw new TypeError('Complete triangles required');
 const triangles=[],bounds=new THREE.Box3();
 for(let i=0;i<count;i+=3){
  const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+k):i+k));
  if(v.some(a=>![a.x,a.y,a.z].every(Number.isFinite)))throw new TypeError('Finite triangles required');
  const triangle=new THREE.Triangle(...v),normal=triangle.getNormal(new THREE.Vector3());
  if(triangle.getArea()<1e-12)throw new TypeError('Nondegenerate triangles required');
  const box=new THREE.Box3().setFromPoints(v);bounds.union(box);triangles.push({triangle,normal,box});
 }
 if(!triangles.length)throw new TypeError('Nonempty triangle geometry required');
 return Object.freeze({triangles:Object.freeze(triangles),bounds});
}
export function triangleInstance(template,translation,id){
 if(!template?.triangles?.length||!Array.isArray(translation)||translation.length!==3||!translation.every(Number.isFinite)||typeof id!=='string'||!id)throw new TypeError('Explicit triangle owner and finite translation required');
 const offset=new THREE.Vector3(...translation);return {template,offset,id,box:template.bounds.clone().translate(offset)};
}
function insideXZ(x,z,t){
 const {a,b,c}=t;const d=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);if(Math.abs(d)<EPS)return false;
 const u=((b.z-c.z)*(x-c.x)+(c.x-b.x)*(z-c.z))/d,v=((c.z-a.z)*(x-c.x)+(a.x-c.x)*(z-c.z))/d;
 return u>=-EPS&&v>=-EPS&&u+v<=1+EPS;
}
/** Maximum linear plane height on triangle ∩ actual circular foot, with witness.
 * maxTop rejects unreachable faces; it never clamps a higher face downward. */
export function triangleFootContact(shape,x,z,r,maxTop){
 if(![x,z,r,maxTop].every(Number.isFinite)||r<=0)throw new TypeError('Finite foot and height required');
 if(x+r<shape.box.min.x||x-r>shape.box.max.x||z+r<shape.box.min.z||z-r>shape.box.max.z)return null;
 x-=shape.offset.x;z-=shape.offset.z;let best=null;
 for(let i=0;i<shape.template.triangles.length;i++){
  const {triangle:t,normal:n,box}=shape.template.triangles[i];if(n.y<=EPS||x+r<box.min.x||x-r>box.max.x||z+r<box.min.z||z-r>box.max.z)continue;
  const candidates=[];
  const add=(px,pz)=>{if((px-x)**2+(pz-z)**2<=r*r+EPS&&insideXZ(px,pz,t))candidates.push([px,pz]);};
  for(const v of [t.a,t.b,t.c])add(v.x,v.z);add(x,z);
  for(const [a,b] of [[t.a,t.b],[t.b,t.c],[t.c,t.a]]){
   const dx=b.x-a.x,dz=b.z-a.z,A=dx*dx+dz*dz;if(A<EPS)continue;
   const B=2*((a.x-x)*dx+(a.z-z)*dz),C=(a.x-x)**2+(a.z-z)**2-r*r,D=B*B-4*A*C;
   if(D>=-EPS)for(const u of [(-B-Math.sqrt(Math.max(0,D)))/(2*A),(-B+Math.sqrt(Math.max(0,D)))/(2*A)])if(u>=-EPS&&u<=1+EPS)add(a.x+u*dx,a.z+u*dz);
  }
  const gx=-n.x/n.y,gz=-n.z/n.y,len=Math.hypot(gx,gz);if(len>EPS)add(x+r*gx/len,z+r*gz/len);
  let face=null;for(const [px,pz] of candidates){const height=t.a.y-(n.x*(px-t.a.x)+n.z*(pz-t.a.z))/n.y+shape.offset.y;
   if(!face||height>face.height)face={height,witness:new THREE.Vector3(px+shape.offset.x,height,pz+shape.offset.z),instanceId:shape.id,triangleId:i};}
  if(face&&(!best||face.height>best.height))best=face;
 }
 return best && best.height<=maxTop+EPS ? best : null;
}
/** Full-volume triangle narrowphase. Box is only broadphase; contained volumes
 * use parity after all surface intersections, so no hollow-solid loophole. */
export function triangleBodyIntersects(shape,worldBox){
 if(!worldBox.intersectsBox(shape.box))return false;
 const box=worldBox.clone().translate(shape.offset.clone().negate());
 for(const q of shape.template.triangles)if(box.intersectsBox(q.box)&&box.intersectsTriangle(q.triangle))return true;
 const point=box.getCenter(new THREE.Vector3()),ray=new THREE.Ray(point,new THREE.Vector3(1,.371,.217).normalize()),hits=[];
 for(const q of shape.template.triangles){const hit=ray.intersectTriangle(q.triangle.a,q.triangle.b,q.triangle.c,false,new THREE.Vector3());if(hit){const d=hit.distanceTo(point);if(!hits.some(v=>Math.abs(v-d)<EPS))hits.push(d);}}
 return hits.length%2===1;
}
/** Continuous SAT for a translating, fixed-size player AABB versus triangles.
 * Every accepted horizontal segment is checked, not just sampled endpoints. */
export function triangleBodySweepFraction(shape,fromWorld,toWorld){
 const union=fromWorld.clone().union(toWorld);if(!union.intersectsBox(shape.box))return null;
 if(triangleBodyIntersects(shape,fromWorld))return 0;
 const from=fromWorld.clone().translate(shape.offset.clone().negate()),to=toWorld.clone().translate(shape.offset.clone().negate()),center=from.getCenter(new THREE.Vector3()),end=to.getCenter(new THREE.Vector3()),velocity=end.sub(center),half=from.getSize(new THREE.Vector3()).multiplyScalar(.5),other=to.getSize(new THREE.Vector3()).multiplyScalar(.5);
 if(half.distanceTo(other)>1e-7)throw new TypeError('Triangle sweep requires fixed body dimensions');
 const bounds=from.clone().union(to),basis=[new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1)];
 let earliest=null;
 for(const q of shape.template.triangles){if(!bounds.intersectsBox(q.box))continue;
  const {a,b,c}=q.triangle,edges=[b.clone().sub(a),c.clone().sub(b),a.clone().sub(c)],axes=[...basis,q.normal,...edges.flatMap(e=>basis.map(v=>e.clone().cross(v)))];let enter=0,exit=1;
  for(const axis of axes){if(axis.lengthSq()<1e-18)continue;const values=[a.dot(axis),b.dot(axis),c.dot(axis)],radius=Math.abs(axis.x)*half.x+Math.abs(axis.y)*half.y+Math.abs(axis.z)*half.z,origin=center.dot(axis),speed=velocity.dot(axis),low=Math.min(...values)-radius,high=Math.max(...values)+radius;
   if(Math.abs(speed)<1e-12){if(origin<=low+1e-12||origin>=high-1e-12){enter=2;break;}}
   else{const t0=(low-origin)/speed,t1=(high-origin)/speed;enter=Math.max(enter,Math.min(t0,t1));exit=Math.min(exit,Math.max(t0,t1));if(enter>=exit-1e-12)break;}
  }
  if(enter<exit-1e-12&&enter<1&&exit>0)earliest=Math.min(earliest??1,Math.max(0,enter));
 }
 return earliest;
}
export function triangleBodySweptIntersects(shape,fromWorld,toWorld){return triangleBodySweepFraction(shape,fromWorld,toWorld)!==null;}
