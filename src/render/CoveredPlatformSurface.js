import {BackSide,BufferAttribute,Triangle,Vector3} from 'three';

const EPS=1e-6;
// Explicit, assembly-owned box pairs only. This is not a scene-wide epsilon,
// material offset or arbitrary-bounds occlusion pass. Physics is never read or
// changed here. Keep the visible paving and remove only the underlying skin.
export function removeCoveredPlatformSurface(base,cover,height,{clipCoincidentSides=false}={}) {
 const fail=()=>{throw Error('Covered platform requires an exact opaque rectangular cap and owned horizontal base');};
 if(!base?.isMesh||!cover?.isMesh||base===cover||!base.parent||base.parent!==cover.parent||!Number.isFinite(height))fail();
 for(const m of[base,cover]){
  const g=m.geometry,mat=m.material;
  if(!m.matrixAutoUpdate||!m.matrixWorldAutoUpdate||m.layers.mask!==cover.layers.mask||m.isInstancedMesh||m.isSkinnedMesh||!mat||Array.isArray(mat)||mat.side===BackSide||mat.wireframe||mat.clippingPlanes?.length||mat.transparent||mat.opacity!==1||!mat.depthWrite||!mat.depthTest||mat.alphaTest||mat.displacementMap||!mat.visible||!m.visible||Math.abs(m.quaternion.x)+Math.abs(m.quaternion.y)+Math.abs(m.quaternion.z)>EPS||m.scale.toArray().some(v=>!Number.isFinite(v)||v<=0)||g.drawRange.start!==0||g.drawRange.count!==Infinity||Object.keys(g.morphAttributes).length||Object.values(g.attributes).some(a=>a.isInterleavedBufferAttribute||a.normalized))fail();
  m.updateMatrix();g.computeBoundingBox();
 }
 let root=base.parent;while(root.parent)root=root.parent;let owners=0;root.traverse(m=>{if(m.isMesh&&m.geometry===base.geometry)owners++;});if(owners!==1)fail();
 const bounds=m=>m.geometry.boundingBox.clone().applyMatrix4(m.matrix),b=bounds(base),c=bounds(cover);
 if(Math.abs(b.max.y-height)>EPS||Math.abs(c.max.y-height)>EPS||c.min.x>b.min.x+EPS||c.max.x<b.max.x-EPS||c.min.z>b.min.z+EPS||c.max.z<b.max.z-EPS||c.min.y<=b.min.y||c.min.y>=height)fail();
 if(clipCoincidentSides&&['x','z'].some(k=>Math.abs(b.min[k]-c.min[k])>EPS||Math.abs(b.max[k]-c.max[k])>EPS))fail();
 const triangles=m=>{const p=m.geometry.attributes.position,i=m.geometry.index,n=i?.count??p.count;if(n%3)fail();return Array.from({length:n/3},(_,q)=>{const ids=[0,1,2].map(k=>i?i.getX(q*3+k):q*3+k),points=ids.map(j=>new Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrix));return{offset:q*3,ids,points,normal:new Triangle(...points).getNormal(new Vector3())};});};
 // Each submitted rectangular face has two distinct triangular halves. A
 // box AABB alone cannot prove that a side or the top is actually drawn.
 function face(m,box,axis,sign){const plane=sign>0?box.max[axis]:box.min[axis],others=['x','y','z'].filter(k=>k!==axis),rows=triangles(m).filter(t=>t.normal[axis]*sign>1-EPS&&t.points.every(v=>Math.abs(v[axis]-plane)<EPS));if(rows.length!==2)fail();const corner=v=>{const values=others.map(k=>Math.abs(v[k]-box.min[k])<EPS?0:Math.abs(v[k]-box.max[k])<EPS?1:-1);if(values.includes(-1))fail();return values[0]+2*values[1];};const a=rows.map(r=>r.points.map(corner));if(a.some(q=>new Set(q).size!==3)||new Set(a.flat()).size!==4)fail();const shared=a[0].filter(k=>a[1].includes(k));if(shared.length!==2||(shared[0]^shared[1])!==3)fail();return rows;}
 if(triangles(base).length!==12)fail();
 for(const axis of['x','y','z'])for(const sign of[-1,1])face(base,b,axis,sign);
 const topRows=face(base,b,'y',1);face(cover,c,'y',1);
 if(clipCoincidentSides)for(const axis of['x','z'])for(const sign of[-1,1])face(cover,c,axis,sign);
 const g=base.geometry,sourceCount=g.index?.count??g.attributes.position.count,sourceGroups=structuredClone(g.groups);
 if(sourceGroups.length){let end=0;for(const q of sourceGroups){if(q.start!==end||q.start%3||q.count%3||q.count<=0||!Number.isInteger(q.materialIndex)||q.materialIndex<0)fail();end+=q.count;}if(end!==sourceCount)fail();}
 const attributes=Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,{source:a,values:Array.from(a.array)}])),kept=[],groups=[];
 const emit=(ids,offset)=>{const start=kept.length;kept.push(...ids);if(sourceGroups.length){const group=sourceGroups.find(q=>offset>=q.start&&offset<q.start+q.count);const last=groups.at(-1);if(last?.materialIndex===group.materialIndex)last.count+=ids.length;else groups.push({start,count:ids.length,materialIndex:group.materialIndex});}};
 const append=(a,d,t)=>{const id=attributes.position.values.length/3;for(const{source,values}of Object.values(attributes))for(let k=0;k<source.itemSize;k++)values.push(source.array[a*source.itemSize+k]+(source.array[d*source.itemSize+k]-source.array[a*source.itemSize+k])*t);return id;};
 for(const row of triangles(base)){
  if(topRows.some(t=>t.ids.every((id,i)=>id===row.ids[i])))continue;
  if(!clipCoincidentSides||row.points.every(v=>v.y<=c.min.y+EPS)){emit(row.ids,row.offset);continue;}
  // Sutherland-Hodgman against the cap's actual lower plane. Existing lower
  // vertices survive verbatim; intersection position/normal/UV are interpolated.
  const polygon=[];for(let i=0;i<3;i++){const j=(i+1)%3,a=row.points[i],d=row.points[j],inside=a.y<=c.min.y,other=d.y<=c.min.y;if(inside)polygon.push(row.ids[i]);if(inside!==other)polygon.push(append(row.ids[i],row.ids[j],(c.min.y-a.y)/(d.y-a.y)));}
  for(let i=1;i+1<polygon.length;i++)emit([polygon[0],polygon[i],polygon[i+1]],row.offset);
 }
 if(!kept.length)fail();
 for(const[k,{source,values}]of Object.entries(attributes))if(values.length!==source.array.length){const a=new BufferAttribute(new source.array.constructor(values),source.itemSize,source.normalized);a.name=source.name;a.setUsage(source.usage);g.setAttribute(k,a);}
 g.setIndex(kept);g.clearGroups();for(const q of groups)g.addGroup(q.start,q.count,q.materialIndex);
 return{removedTopTriangles:2,clippedSideStrip:clipCoincidentSides,capBottom:c.min.y};
}
