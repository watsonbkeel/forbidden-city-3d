import assert from 'node:assert/strict';
import * as THREE from 'three';
export function actualTriangles(record){
 const a=record.attributes,p=a.position.array,n=a.normal.array,uv=a.uv.array,ix=record.index,rows=[];
 for(let i=0;i<(ix?.length??p.length/3);i+=3){const js=[0,1,2].map(k=>ix?ix[i+k]:i+k),v=js.map(j=>p.slice(j*3,j*3+3)),norm=js.map(j=>n.slice(j*3,j*3+3)),tex=js.map(j=>uv.slice(j*2,j*2+2));
  const cross=new THREE.Vector3(...v[1]).sub(new THREE.Vector3(...v[0])).cross(new THREE.Vector3(...v[2]).sub(new THREE.Vector3(...v[0])));
  assert.ok(cross.lengthSq()>1e-14,'positive triangle area');const axis=norm[0].findIndex(x=>Math.abs(x)===1),sign=norm[0][axis];assert.ok(axis>=0);assert.ok(norm.every(q=>q.every((x,k)=>x===(k===axis?sign:0))),'unaltered outward axis normal');assert.ok(cross.normalize().dot(new THREE.Vector3(...norm[0]))>.999999,'winding matches normal');
  assert.ok(v.every(q=>q[axis]===v[0][axis]),'triangle is actually planar');for(let j=0;j<3;j++)assert.deepEqual(tex[j],[v[j][0],v[j][1]],'same actual affine UV');
  rows.push({v,normal:norm[0],axis,sign,coordinate:v[0][axis]});
 }return rows;
}
function clippedArea(poly,u0,u1,v0,v1){
 for(const [axis,bound,sign]of[[0,u0,1],[0,u1,-1],[1,v0,1],[1,v1,-1]]){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(a[axis]-bound)*sign,db=(b[axis]-bound)*sign;if(da>=0)out.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}poly=out;if(poly.length<3)return 0;}
 let area=0;for(let i=1;i<poly.length-1;i++)area+=(poly[i][0]-poly[0][0])*(poly[i+1][1]-poly[0][1])-(poly[i][1]-poly[0][1])*(poly[i+1][0]-poly[0][0]);return Math.abs(area)/2;
}
function actualCoverage(rows,axes){
 const indices=axes.map(a=>new Map(a.map((v,i)=>[v,i]))),planes=new Map();
 for(const t of rows){const {axis,sign,coordinate}=t,u=(axis+1)%3,v=(axis+2)%3,key=[axis,sign,coordinate].join(':'),plane=planes.get(key)??{axis,sign,coordinate,cells:new Map()};planes.set(key,plane);
  const p=t.v.map(q=>[q[u],q[v]]),a=indices[u].get(Math.min(...p.map(q=>q[0]))),b=indices[u].get(Math.max(...p.map(q=>q[0]))),c=indices[v].get(Math.min(...p.map(q=>q[1]))),d=indices[v].get(Math.max(...p.map(q=>q[1])));
  for(let i=a;i<b;i++)for(let j=c;j<d;j++){const area=clippedArea(p,axes[u][i],axes[u][i+1],axes[v][j],axes[v][j+1]);if(area>1e-14){const k=i+','+j;plane.cells.set(k,(plane.cells.get(k)??0)+area);}}
 }
 const surfaces=[],edges=new Map();let area=0;
 function edge(a,b){const sa=a.join(','),sb=b.join(','),key=sa<sb?sa+'|'+sb:sb+'|'+sa;edges.set(key,(edges.get(key)??0)+(sa<sb?1:-1));}
 for(const [key,p]of planes){const u=(p.axis+1)%3,v=(p.axis+2)%3;for(const [cell,covered]of p.cells){const [i,j]=cell.split(',').map(Number),u0=axes[u][i],u1=axes[u][i+1],v0=axes[v][j],v1=axes[v][j+1],expected=(u1-u0)*(v1-v0);assert.ok(Math.abs(covered-expected)<Math.max(1e-11,expected*1e-8),'actual triangles fill each atomic surface cell exactly once, without overlap or holes');area+=covered;surfaces.push(key+'/'+cell);
   let corners=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]].map(([x,y])=>{const q=[];q[p.axis]=p.coordinate;q[u]=x;q[v]=y;return q;});if(p.sign<0)corners.reverse();for(let k=0;k<4;k++)edge(corners[k],corners[(k+1)%4]);
  }}
 assert.equal([...edges.values()].filter(n=>n!==0).length,0,'actual surface-cell boundaries cancel: closed geometric envelope, including rear and inside returns');
 return{surfaces:surfaces.sort(),area,atomicCells:surfaces.length,planes:planes.size};
}
export function compareJingyangActualSurfaces(before,after){
 const old=actualTriangles(before),current=actualTriangles(after),axes=[0,1,2].map(axis=>[...new Set([...old,...current].flatMap(t=>t.v.map(v=>v[axis])))].sort((a,b)=>a-b));
 const a=actualCoverage(old,axes),b=actualCoverage(current,axes);assert.deepEqual(b.surfaces,a.surfaces,'exact actual oriented surface support and silhouette preserved, not just metadata/area');assert.ok(Math.abs(a.area-b.area)<1e-8);return{oldTriangles:old.length,newTriangles:current.length,actualSurfaceArea:a.area,atomicCells:a.atomicCells,orientedPlanes:a.planes,closed:true};
}
export function compareJingyangActualRays(before,after,samplesPerDirection=80){
 const old=actualTriangles(before),current=actualTriangles(after),all=old.flatMap(t=>t.v),min=[0,1,2].map(k=>Math.min(...all.map(v=>v[k]))),max=[0,1,2].map(k=>Math.max(...all.map(v=>v[k])));let seed=48185,hits=0,misses=0;
 const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296),ray=new THREE.Ray(),point=new THREE.Vector3();
 const trace=rows=>{const contacts=[];for(const t of rows){const hit=ray.intersectTriangle(...t.v.map(v=>new THREE.Vector3(...v)),false,point);if(hit){const distance=ray.origin.distanceTo(hit),n=t.normal.join(',');if(!contacts.some(c=>Math.abs(c.distance-distance)<1e-7&&c.normal===n))contacts.push({distance,normal:n});}}return contacts.sort((a,b)=>a.distance-b.distance||a.normal.localeCompare(b.normal));};
 for(let axis=0;axis<3;axis++)for(const side of[-1,1])for(let i=0;i<samplesPerDirection;i++){
  const origin=min.map((m,k)=>m+(max[k]-m)*rng()),direction=[0,0,0];origin[axis]=side<0?min[axis]-.3:max[axis]+.3;direction[axis]=-side;ray.set(new THREE.Vector3(...origin),new THREE.Vector3(...direction));const a=trace(old),b=trace(current);assert.equal(b.length,a.length,'all crossings retained, including rear/inside faces');for(let j=0;j<a.length;j++){assert.ok(Math.abs(a[j].distance-b[j].distance)<1e-7);assert.equal(a[j].normal,b[j].normal);}if(a.length)hits++;else misses++;
 }return{rays:samplesPerDirection*6,hits,misses,allFaceDirections:true};
}
