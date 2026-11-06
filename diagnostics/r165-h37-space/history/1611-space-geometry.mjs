import * as T from 'three';
export function collectFaces(root){
 const faces=[],meshes=[];
 root.updateWorldMatrix(true,true);
 root.traverse(m=>{
  if(!m.isMesh)return;for(let p=m;p;p=p.parent)if(!p.visible)return;
  if(m.isSkinnedMesh)throw Error('Unsupported skinned owner '+m.uuid);
  const g=m.geometry,p=g?.attributes?.position,ix=g?.index;
  if(!g?.isBufferGeometry||!p||p.itemSize!==3||!ArrayBuffer.isView(p.array))throw Error('Malformed visible geometry '+m.uuid);
  if(Reflect.ownKeys(g.morphAttributes).length)throw Error('Unsupported morph owner '+m.uuid);
  const matrices=[];
  if(m.isInstancedMesh)for(let i=0;i<m.count;i++){const local=new T.Matrix4();m.getMatrixAt(i,local);matrices.push({matrix:m.matrixWorld.clone().multiply(local),instanceId:i});}
  else matrices.push({matrix:m.matrixWorld,instanceId:null});
  for(const{matrix,instanceId}of matrices){
   const row={mesh:m,instanceId,box:new T.Box3(),faces:[]},orientation=Math.sign(matrix.determinant());
   const start=g.drawRange.start,end=Math.min(ix?.count??p.count,start+g.drawRange.count);
   if(!Number.isInteger(start)||start<0||start%3||end%3)throw Error('Unsupported drawRange '+m.uuid);
   for(let i=start;i<end;i+=3){
    const points=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(matrix));
    if(!points.every(v=>v.toArray().every(Number.isFinite)))throw Error('Nonfinite geometry '+m.uuid);
    const triangle=new T.Triangle(...points);if(triangle.getArea()===0)continue;
    let material=m.material;if(Array.isArray(material)){const group=g.groups.find(q=>i>=q.start&&i+3<=q.start+q.count);material=group?material[group.materialIndex]:null;}
    const f={mesh:m,instanceId,triangle,offset:i,material,side:material?.side??T.DoubleSide,orientation,box:new T.Box3().setFromPoints(points)};
    row.box.union(f.box);row.faces.push(f);faces.push(f);
   }
   meshes.push(row);
  }
 });
 return {faces,meshes};
}
export function faceHit(ray,f,target=new T.Vector3()){
 const{a,b,c}=f.triangle;
 if(f.side===T.DoubleSide)return ray.intersectTriangle(a,b,c,false,target);
 const reverse=(f.side===T.BackSide)!==(f.orientation<0);
 return reverse?ray.intersectTriangle(c,b,a,true,target):ray.intersectTriangle(a,b,c,true,target);
}
export function firstHit(origin,point,faces){
 const ray=new T.Ray(origin.clone(),point.clone().sub(origin).normalize());let hit;
 for(const f of faces){if(!ray.intersectsBox(f.box))continue;const p=faceHit(ray,f);if(!p)continue;const d=p.distanceTo(origin);if(d<.001||d>100||hit&&d>=hit.distance)continue;hit={object:f.mesh,instanceId:f.instanceId,triangle:f.offset/3,point:p.clone(),distance:d,conservativeNull:f.material==null};}
 return hit;
}
export function boxHits(box,faces){return faces.filter(f=>box.intersectsBox(f.box)&&box.intersectsTriangle(f.triangle));}
export function containedSolid(box,meshRows){
 const point=box.getCenter(new T.Vector3()),hits=[];
 for(const row of meshRows){
  if(!row.box.containsBox(box))continue;
  const odd=[new T.Vector3(1,.137,.071),new T.Vector3(.173,1,.083),new T.Vector3(.117,.213,1)].every(dir=>{
   const ray=new T.Ray(point.clone(),dir.normalize()),dist=[];
   for(const f of row.faces){const p=ray.intersectTriangle(f.triangle.a,f.triangle.b,f.triangle.c,false,new T.Vector3());if(p)dist.push(p.distanceTo(point));}
   dist.sort((a,b)=>a-b);const unique=dist.filter((d,i)=>!i||Math.abs(d-dist[i-1])>1e-7);return unique.length%2===1;
  });
  if(odd)hits.push(row);
 }
 return hits;
}
export function describeHit(f){return {meshUUID:f.mesh.uuid,name:f.mesh.name,instanceId:f.instanceId,triangle:f.offset/3,points:[f.triangle.a,f.triangle.b,f.triangle.c].map(v=>v.toArray())};}
export function boxFacesDistance(box,faces){
 const vertices=[];for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z])vertices.push(new T.Vector3(x,y,z));
 const edges=[];for(let i=0;i<8;i++)for(const bit of[1,2,4])if((i^bit)>i)edges.push([vertices[i],vertices[i^bit]]);
 let best=Infinity,source;
 const seg=(A,B,C,D)=>{const u=B.clone().sub(A),v=D.clone().sub(C),w=A.clone().sub(C),a=u.dot(u),b=u.dot(v),c=v.dot(v),d=u.dot(w),e=v.dot(w),den=a*c-b*b;let s=den>1e-20?T.MathUtils.clamp((b*e-c*d)/den,0,1):0,t=(b*s+e)/c;if(t<0){t=0;s=T.MathUtils.clamp(-d/a,0,1);}else if(t>1){t=1;s=T.MathUtils.clamp((b-d)/a,0,1);}return w.addScaledVector(u,s).addScaledVector(v,-t).length();};
 for(const f of faces){
  const dx=Math.max(0,box.min.x-f.box.max.x,f.box.min.x-box.max.x),dy=Math.max(0,box.min.y-f.box.max.y,f.box.min.y-box.max.y),dz=Math.max(0,box.min.z-f.box.max.z,f.box.min.z-box.max.z);
  if(Math.hypot(dx,dy,dz)>=best)continue;
  let distance;if(box.intersectsTriangle(f.triangle))distance=0;else{
   distance=Infinity;const tri=[f.triangle.a,f.triangle.b,f.triangle.c];
   for(const p of tri)distance=Math.min(distance,p.distanceTo(box.clampPoint(p,new T.Vector3())));
   for(const p of vertices)distance=Math.min(distance,p.distanceTo(f.triangle.closestPointToPoint(p,new T.Vector3())));
   for(const[A,B]of edges)for(let j=0;j<3;j++)distance=Math.min(distance,seg(A,B,tri[j],tri[(j+1)%3]));
  }
  if(distance<best){best=distance;source=describeHit(f);}
 }
 return {distance:best,source,scope:'Exact nearest triangle to conservative candidate envelope, not final product-to-product distance'};
}
