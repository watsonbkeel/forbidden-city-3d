import * as THREE from 'three';
const basis=[new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1)];
const axisCache=new WeakMap();
function axesFor(q){let cached=axisCache.get(q);if(cached)return cached;const {a,b,c}=q.triangle,ab=b.clone().sub(a),ac=c.clone().sub(a),edges=[ab,c.clone().sub(b),a.clone().sub(c)];cached=[...basis,ab.clone().cross(ac),...edges.flatMap(e=>basis.map(v=>e.clone().cross(v)))].filter(axis=>axis.lengthSq()!==0).map(axis=>({axis,low:Math.min(a.dot(axis),b.dot(axis),c.dot(axis)),high:Math.max(a.dot(axis),b.dot(axis),c.dot(axis))}));axisCache.set(q,cached);return cached;}
/** Positive interior intersection, not inclusive boundary contact. The body
 * dimensions remain exact. Unnormalised axes avoid square-root roundoff. */
export function duixiuTriangleBodyIntersects(shape,worldBox){
 if(!worldBox.intersectsBox(shape.box))return false;
 const box=worldBox.clone().translate(shape.offset.clone().negate()),center=box.getCenter(new THREE.Vector3()),half=box.getSize(new THREE.Vector3()).multiplyScalar(.5);
 for(const q of shape.template.triangles){if(!box.intersectsBox(q.box)||!box.intersectsTriangle(q.triangle))continue;const {a,b,c}=q.triangle;let separated=false;
  for(const {axis,low,high} of axesFor(q)){const r=Math.abs(axis.x)*half.x+Math.abs(axis.y)*half.y+Math.abs(axis.z)*half.z,o=center.dot(axis);if(o+r<=low||o-r>=high){separated=true;break;}}
  if(!separated)return true;
 }
 // AABB fully enclosed by the solid need not meet an exterior triangle.
 const ray=new THREE.Ray(center,new THREE.Vector3(1,.371,.217).normalize()),hits=[],target=new THREE.Vector3();
 for(const q of shape.template.triangles){const p=ray.intersectTriangle(q.triangle.a,q.triangle.b,q.triangle.c,false,target);if(p){const d=p.distanceTo(center);if(!hits.some(v=>Math.abs(v-d)<1e-8))hits.push(d);}}
 return hits.length%2===1;
}
/** Continuous strict-interior SAT, with the same contact convention as the
 * initial-pose predicate. Entering from a tangent boundary blocks at t=0;
 * separating or sliding on that boundary is not initial penetration. */
export function duixiuTriangleBodySweepFraction(shape,fromWorld,toWorld){
 const union=fromWorld.clone().union(toWorld);if(!union.intersectsBox(shape.box))return null;
 if(duixiuTriangleBodyIntersects(shape,fromWorld))return 0;
 const from=fromWorld.clone().translate(shape.offset.clone().negate()),to=toWorld.clone().translate(shape.offset.clone().negate()),center=from.getCenter(new THREE.Vector3()),velocity=to.getCenter(new THREE.Vector3()).sub(center),half=from.getSize(new THREE.Vector3()).multiplyScalar(.5),other=to.getSize(new THREE.Vector3()).multiplyScalar(.5);
 if(half.distanceTo(other)>1e-7)throw new TypeError('Duixiu sweep requires fixed body dimensions');
 const bounds=from.clone().union(to);let earliest=null;
 for(const q of shape.template.triangles){if(!bounds.intersectsBox(q.box))continue;const {a,b,c}=q.triangle;let enter=0,exit=1;
  for(const {axis,low:faceLow,high:faceHigh} of axesFor(q)){const r=Math.abs(axis.x)*half.x+Math.abs(axis.y)*half.y+Math.abs(axis.z)*half.z,o=center.dot(axis),speed=velocity.dot(axis),low=faceLow-r,high=faceHigh+r;
   if(speed===0){if(o<=low||o>=high){enter=2;break;}}
   else{const t0=(low-o)/speed,t1=(high-o)/speed;enter=Math.max(enter,Math.min(t0,t1));exit=Math.min(exit,Math.max(t0,t1));if(enter>=exit)break;}
  }
  if(enter<exit&&enter<1&&exit>0)earliest=Math.min(earliest??1,Math.max(0,enter));
 }
 return earliest;
}
