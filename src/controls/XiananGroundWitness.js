import {getCreatedEnvironmentGround} from '../scene/Environment.js';
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const area=p=>Math.abs(p.reduce((s,v,i)=>{const n=p[(i+1)%p.length];return s+v[0]*n[1]-n[0]*v[1]},0))/2;
function clip(poly,a,b,inside){
  const out=[];
  for(let i=0;i<poly.length;i++){
    const p=poly[i],q=poly[(i+1)%poly.length],cp=cross(a,b,p),cq=cross(a,b,q),pin=inside?cp>=0:cp<=0,qin=inside?cq>=0:cq<=0;
    if(pin)out.push(p);
    if(pin!==qin){const t=cp/(cp-cq);out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}
  }
  return out;
}
// Split each remainder along all three triangle half-planes. Only pieces
// outside the triangle survive. Overlapping/duplicate triangles never add area.
export function triangleUnionCovers(polygon,triangles){
  let remaining=[polygon];
  for(const input of triangles){
    const sign=cross(input[0],input[1],input[2]);if(sign===0)continue;
    const tri=sign>0?input:[input[0],input[2],input[1]],next=[];
    for(const poly of remaining){
      let inside=poly;
      for(let i=0;i<3&&inside.length>=3;i++){
        const a=tri[i],b=tri[(i+1)%3],outside=clip(inside,a,b,false);
        if(outside.length>=3&&area(outside)>1e-10)next.push(outside);
        inside=clip(inside,a,b,true);
      }
    }
    remaining=next;if(!remaining.length)return true;
  }
  return remaining.every(p=>area(p)<=1e-10);
}
export function sweptFootPolygon(from,to,radius=.5){
  const pts=[];for(const p of [from,to])for(const x of [-radius,radius])for(const z of [-radius,radius])pts.push([p.x+x,p.z+z]);
  pts.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const unique=pts.filter((p,i)=>!i||p[0]!==pts[i-1][0]||p[1]!==pts[i-1][1]);
  const half=rows=>{const h=[];for(const p of rows){while(h.length>=2&&cross(h.at(-2),h.at(-1),p)<=0)h.pop();h.push(p)}return h};
  const lower=half(unique),upper=half([...unique].reverse());return [...lower.slice(0,-1),...upper.slice(0,-1)];
}
export function xiananGroundCovered(scene,from,to=from,radius=.5,camera=null){
  if(radius!==.5||![from.x,from.z,to.x,to.z].every(Number.isFinite))return false;
  const mesh=getCreatedEnvironmentGround(scene);if(!mesh)return false;
  if(camera&&(!camera.isCamera||!mesh.layers.test(camera.layers)))return false;
  // The local ShapeGeometry is world0 only with identity ancestors. A birth
  // recorded in a transformed scene is genuine, but not a ground0 witness.
  for(let ancestor=mesh.parent;ancestor;ancestor=ancestor.parent){
    ancestor.updateWorldMatrix(true,false);
    const e=ancestor.matrixWorld.elements;
    if(e.some((v,i)=>v!==(i%5===0?1:0)))return false;
  }
  // The birth witness is the actual unshifted XY shape rotated into ground0.
  // Reject any changed transform rather than inventing a replacement plane.
  if(mesh.position.lengthSq()||mesh.rotation.x!==-Math.PI/2||mesh.rotation.y||mesh.rotation.z||mesh.scale.x!==1||mesh.scale.y!==1||mesh.scale.z!==1)return false;
  const p=mesh.geometry.attributes.position,ix=mesh.geometry.index,poly=sweptFootPolygon(from,to,radius),triangles=[];
  const xs=poly.map(q=>q[0]),zs=poly.map(q=>q[1]),loX=Math.min(...xs),hiX=Math.max(...xs),loZ=Math.min(...zs),hiZ=Math.max(...zs);
  for(let i=0;i<(ix?.count??p.count);i+=3){
    const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k);
    if(ids.some(j=>p.getZ(j)!==0||![p.getX(j),p.getY(j)].every(Number.isFinite)))return false;
    const t=ids.map(j=>[p.getX(j),-p.getY(j)]);
    if(Math.max(...t.map(q=>q[0]))<loX||Math.min(...t.map(q=>q[0]))>hiX||Math.max(...t.map(q=>q[1]))<loZ||Math.min(...t.map(q=>q[1]))>hiZ)continue;
    triangles.push(t);
  }
  return triangleUnionCovers(poly,triangles);
}
