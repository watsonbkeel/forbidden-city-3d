import * as THREE from 'three';

const EPS=1e-7;
const blend=(a,b,t)=>({point:a.point.clone().lerp(b.point,t),values:Object.fromEntries(Object.entries(a.values).map(([k,v])=>[k,v.map((n,i)=>n+(b.values[k][i]-n)*t)]))});
function split(poly,distance){
 const yes=[],no=[],cuts=[];
 if(poly.length&&poly.every(v=>Math.abs(distance(v.point))<=EPS))return{yes:poly,no:[],cuts:[]};
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length],da=distance(a.point),db=distance(b.point);
  // A boundary vertex belongs to BOTH half-polygons. Omitting it from the
  // outside half loses whole original triangles along projected tile edges.
  if(da>=-EPS)yes.push(a);
  if(da<=EPS)no.push(a);
  if(Math.abs(da)<=EPS)cuts.push(a.point);
  if((da>EPS&&db<-EPS)||(da<-EPS&&db>EPS)){
   const v=blend(a,b,da/(da-db));yes.push(v);no.push(v);cuts.push(v.point);
  }
 }
 return{yes,no,cuts};
}
function hull(points){
 const unique=new Map(points.map(p=>[`${p.x.toFixed(7)},${p.z.toFixed(7)}`,p]));
 const v=[...unique.values()].sort((a,b)=>a.x-b.x||a.z-b.z);if(v.length<3)return[];
 const cross=(a,b,c)=>(b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x),lower=[],upper=[];
 for(const p of v){while(lower.length>=2&&cross(lower.at(-2),lower.at(-1),p)<=EPS)lower.pop();lower.push(p);}
 for(const p of v.toReversed()){while(upper.length>=2&&cross(upper.at(-2),upper.at(-1),p)<=EPS)upper.pop();upper.push(p);}
 return lower.slice(0,-1).concat(upper.slice(0,-1));
}

/** Clip only an explicitly supplied auxiliary roof against the retained main
 * roof's real top triangles. UVs/normals are interpolated. A concealed cap
 * closes each cut patch 10 mm inside the existing tile surface, not in air.
 * This is a reversible local join fit, not surveyed historical joinery.
 */
export function fitCanopyToMainRoof({hall,mainRoof,meshes,capParent,capMaterial,penetration=.01}){
 if(!mainRoof||!meshes.length||!Number.isFinite(penetration)||penetration<0||penetration>.011)throw Error('Explicit canopy/main-roof joint required');
 hall.updateWorldMatrix(true,true);const invHall=hall.matrixWorld.clone().invert();
 // Exact geometry role emitted by RoofBuilder, within the supplied main roof.
 // Shared material identity is never used to select or mutate objects.
 const tileMeshes=[];mainRoof.traverse(m=>{if(m.isMesh&&/^roof_(?:gable|xieshan)_roof_tile(?:_material)?$/.test(m.name))tileMeshes.push(m);});
 if(tileMeshes.length!==1)throw Error('Expected one registered main-roof top surface');
 const patches=[];
 for(const m of tileMeshes){const a=m.geometry.attributes.position,idx=m.geometry.index,M=invHall.clone().multiply(m.matrixWorld);
  for(let i=0;i<(idx?.count??a.count);i+=3){const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(a,idx?idx.getX(i+j):i+j).applyMatrix4(M));
   const plane=new THREE.Plane().setFromCoplanarPoints(...v);if(plane.normal.y<=1e-6)continue;
   const sides=v.map((p,k)=>{const q=v[(k+1)%3],r=v[(k+2)%3];let nx=q.z-p.z,nz=p.x-q.x;if(nx*(r.x-p.x)+nz*(r.z-p.z)<0){nx=-nx;nz=-nz;}return t=>nx*(t.x-p.x)+nz*(t.z-p.z);});
   patches.push({v,plane,sides,minX:Math.min(...v.map(p=>p.x)),maxX:Math.max(...v.map(p=>p.x)),minZ:Math.min(...v.map(p=>p.z)),maxZ:Math.max(...v.map(p=>p.z)),cuts:[]});
  }
 }
 if(!patches.length)throw Error('Main-roof upper triangle envelope is empty');
 // Polygon arrays/points are immutable after split/blend creation. This cache
 // is owned by this synchronous fit only; no scene/source survives via it.
 const boundsByPolygon=new WeakMap();
 const boundsFor=poly=>{
  let bounds=boundsByPolygon.get(poly);
  if(!bounds){const xs=poly.map(v=>v.point.x),zs=poly.map(v=>v.point.z);
   bounds={maxX:Math.max(...xs),minX:Math.min(...xs),maxZ:Math.max(...zs),minZ:Math.min(...zs)};
   boundsByPolygon.set(poly,bounds);
  }
  return bounds;
 };
 let beforeTriangles=0,afterTriangles=0;
 for(const m of meshes){
  const old=m.geometry,attrs=Object.entries(old.attributes),idx=old.index,M=invHall.clone().multiply(m.matrixWorld),out=Object.fromEntries(attrs.map(([k])=>[k,[]]));
  const vertex=i=>{const values=Object.fromEntries(attrs.map(([k,a])=>[k,Array.from(a.array.slice(i*a.itemSize,(i+1)*a.itemSize))]));return{values,point:new THREE.Vector3().fromArray(values.position).applyMatrix4(M)};};
  const append=poly=>{for(let j=1;j<poly.length-1;j++){const tri=[poly[0],poly[j],poly[j+1]];if(new THREE.Triangle(...tri.map(v=>v.point)).getArea()<1e-10)continue;for(const v of tri)for(const[k]of attrs)out[k].push(...v.values[k]);afterTriangles++;}};
  for(let i=0;i<(idx?.count??old.attributes.position.count);i+=3){beforeTriangles++;let pending=[[0,1,2].map(j=>vertex(idx?idx.getX(i+j):i+j))];
   for(const p of patches){const next=[];
    for(const poly of pending){const bounds=boundsFor(poly);
     if(bounds.maxX<p.minX-EPS||bounds.minX>p.maxX+EPS||bounds.maxZ<p.minZ-EPS||bounds.minZ>p.maxZ+EPS){next.push(poly);continue;}
     let inside=poly;
     for(const side of p.sides){const s=split(inside,side);if(s.no.length>=3)next.push(s.no);inside=s.yes;if(inside.length<3)break;}
     if(inside.length>=3){const s=split(inside,q=>p.plane.distanceToPoint(q)+penetration*p.plane.normal.y);append(s.yes);p.cuts.push(...s.cuts);}
    }
    pending=next;if(!pending.length)break;
   }
   pending.forEach(append);
  }
  const geo=new THREE.BufferGeometry();for(const[k,a]of attrs)geo.setAttribute(k,new THREE.Float32BufferAttribute(out[k],a.itemSize));
  geo.normalizeNormals();geo.computeBoundingBox();geo.computeBoundingSphere();m.geometry=geo;old.dispose();
 }
 const capPositions=[],capUV=[];let capPatches=0;
 const toCap=capParent.matrixWorld.clone().invert().multiply(hall.matrixWorld);
 for(const p of patches){const poly=hull(p.cuts);if(poly.length<3)continue;capPatches++;
  for(let i=1;i<poly.length-1;i++){let tri=[poly[0],poly[i],poly[i+1]];
   if(new THREE.Triangle(...tri).getNormal(new THREE.Vector3()).dot(p.plane.normal)>0)tri=[tri[0],tri[2],tri[1]];
   for(const q of tri){capPositions.push(...q.clone().applyMatrix4(toCap).toArray());capUV.push(q.x/1.2,q.z/1.2);}
  }
 }
 if(!capPatches)throw Error('Canopy correction did not form a closed roof contact');
 const capGeometry=new THREE.BufferGeometry();capGeometry.setAttribute('position',new THREE.Float32BufferAttribute(capPositions,3));capGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(capUV,2));capGeometry.computeVertexNormals();
 const cap=new THREE.Mesh(capGeometry,capMaterial);cap.name='r49b-concealed-canopy-roof-joint-cap';capParent.add(cap);
 const record={status:'ACTUAL_MAIN_ROOF_TRIANGLE_CLIPPED_CONCEALED_JOINT_FIT_NOT_SURVEY',penetration,mainRoofUnchanged:true,beforeTriangles,afterTriangles,capPatches,capTriangles:capPositions.length/9};
 cap.userData.roofSurfaceJoint=record;capParent.userData.roofSurfaceJoint=record;return record;
}

// Exported only for deterministic clipping boundary regressions.
export {split as splitRoofJointPolygon};
