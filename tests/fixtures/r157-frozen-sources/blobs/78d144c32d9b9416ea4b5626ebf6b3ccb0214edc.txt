import * as THREE from 'three';
import {buildDuixiuSideRelief} from './DuixiuSideRelief.js';
import {createTriangleTemplate,triangleInstance} from '../../utils/TriangleSupport.js';
import {faceTriplanarUV} from './shapes.js';
const f=Math.fround;
function outside(box,r){const l=Math.max(box.min.x,r.min.x),h=Math.min(box.max.x,r.max.x),a=Math.max(box.min.z,r.min.z),b=Math.min(box.max.z,r.max.z);if(l>=h||a>=b)return[box];return[[box.min.x,l,box.min.z,box.max.z],[h,box.max.x,box.min.z,box.max.z],[l,h,box.min.z,a],[l,h,b,box.max.z]].filter(([x0,x1,z0,z1])=>x1-x0>1e-10&&z1-z0>1e-10).map(([x0,x1,z0,z1])=>new THREE.Box3(new THREE.Vector3(x0,box.min.y,z0),new THREE.Vector3(x1,box.max.y,z1)));}
function boxGeometry(b){const a=b.min,c=b.max,p=[[a.x,a.y,a.z],[c.x,a.y,a.z],[c.x,c.y,a.z],[a.x,c.y,a.z],[a.x,a.y,c.z],[c.x,a.y,c.z],[c.x,c.y,c.z],[a.x,c.y,c.z]],ix=[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float64Array(ix.flatMap(i=>p[i])),3));return g;}
export function buildDuixiuOuterRock(options){
 const sourceOnlyCell = (cell,box) => {
  const {x0,x1,z0,z1}=cell, [cx,,cz]=options.center.toArray();
  if(x0>=-7.5&&x1<=7.5&&z0>=-7.75&&z1<=-4.6&&!(x0>=-2.5&&x1<=2.5)) return true;
  for(const [lo,hi] of [[-9,-7],[6.75,9.25]])
   if(box.min.x>=f(cx+lo)&&box.max.x<=f(cx+hi)&&box.min.z>=f(cz-4.5)&&box.max.z<=f(cz+4.75))return true;
  return (box.max.x<=f(cx-11.5)||box.min.x>=f(cx+11.5))&&box.min.z>=f(cz-3.25)&&box.max.z<=f(cz+3.25);
 };
 const buildOptions=options.skipDiscardedGeometry===false?options:{...options,sourceOnlyCell};
 const b=buildDuixiuSideRelief(buildOptions),p=b.profile,[cx,cy,cz]=p.center,inner=11.5,regions=[],pieces=[],removed=new Set(),source=b.geometries.map((g,i)=>{g.computeBoundingBox();return{g,i,box:g.boundingBox};});
 for(const sign of[-1,1]){
  const innerX=f(cx+sign*inner),r=new THREE.Box3(new THREE.Vector3(sign<0?cx-p.radiusX-1:innerX,-1e6,f(cz-3.25)),new THREE.Vector3(sign<0?innerX:cx+p.radiusX+1,1e6,f(cz+3.25))),cells=[];regions.push(r);
  for(const{box:q,i}of source)if(q.min.x>=r.min.x&&q.max.x<=r.max.x&&q.min.z>=r.min.z&&q.max.z<=r.max.z){removed.add(i);cells.push({x0:q.min.x,x1:q.max.x,z0:q.min.z,z1:q.max.z,h:q.max.y,bottom:q.min.y});}
  const xs=[...new Set(cells.flatMap(c=>[c.x0,c.x1]))].sort((a,b)=>a-b),zs=[...new Set(cells.flatMap(c=>[c.z0,c.z1]))].sort((a,b)=>a-b),grid=new Map();for(const c of cells){c.i=xs.indexOf(c.x0);c.j=zs.indexOf(c.z0);if(xs[c.i+1]!==c.x1||zs[c.j+1]!==c.z1)throw Error('Non-aligned outer source cell');grid.set(`${c.i},${c.j}`,c);}const at=(i,j)=>grid.get(`${i},${j}`);
  const routeHeight=z=>{const q=source.filter(({box:b})=>Math.abs((sign<0?b.min.x:b.max.x)-innerX)<1e-7&&b.min.z<=z&&b.max.z>=z&&b.max.x-b.min.x<.3);if(!q.length)throw Error('Missing real route boundary');return Math.min(...q.map(q=>q.box.max.y));};
  const node=new Map(),point=(i,j)=>{const key=`${i},${j}`;if(node.has(key))return node.get(key);const x=xs[i],z=zs[j],incident=[at(i-1,j-1),at(i,j-1),at(i-1,j),at(i,j)].filter(Boolean),isInner=x===innerX,outerBoundary=!isInner&&incident.length<4,tip=j===0||j===zs.length-1;let y=cy;
   if(!tip&&!outerBoundary){const rowCells=cells.filter(c=>c.z0<=z&&c.z1>=z),outer=sign<0?Math.min(...rowCells.map(c=>c.x0)):Math.max(...rowCells.map(c=>c.x1)),t=(x-outer)/(innerX-outer),ceiling=Math.min(...incident.map(c=>c.h)),high=Math.min(routeHeight(z),Math.max(...rowCells.filter(c=>c.x0===innerX||c.x1===innerX).map(c=>c.h)));let detail=0;for(const[a,c,w,d]of(sign<0?[[-1.5,.35,1.2,.12],[1.1,.68,1.4,-.13]]:[[-1.1,.58,1.4,-.12],[1.7,.35,1.2,.13]]))detail+=Math.max(0,1-Math.abs(z-cz-a-.3*t)/w)*Math.max(0,1-Math.abs(t-c)/.25)*d;const fade=Math.max(0,Math.min(1,(z-zs[0])/.5,(zs.at(-1)-z)/.5));y=Math.max(cy,Math.min(ceiling,cy+(high-cy)*(t+detail*Math.sin(Math.PI*t))*fade));}
   const v=new THREE.Vector3(x,f(y),z);node.set(key,v);return v;};
  const cuts=[0,6,12,18,zs.length-1];for(let k=0;k<cuts.length-1;k++){const first=cuts[k],last=cuts[k+1],pos=[],color=[],edges=new Map(),id=`duixiu:outer-rock:${sign}:${k}`,tri=(a,b,c,want)=>{const n=b.clone().sub(a).cross(c.clone().sub(a));if(n.lengthSq()<1e-18)return;if(n.dot(want)<0)[b,c]=[c,b];for(const p of[a,b,c]){pos.push(...p.toArray());const q=.69+.022*Math.sin(p.z*.65+p.y*.7);color.push(q,q*.985,q*.94);}};
   const top=(a,b,c)=>{if(Math.max(a.y,b.y,c.y)<=f(cy))return;const v=[a,b,c];if(b.clone().sub(a).cross(c.clone().sub(a)).y<0)[v[1],v[2]]=[v[2],v[1]];tri(...v,new THREE.Vector3(0,1,0));tri(...v.map(p=>new THREE.Vector3(p.x,f(cy),p.z)),new THREE.Vector3(0,-1,0));for(let n=0;n<3;n++){const a=v[n],b=v[(n+1)%3],key=[a.toArray().join(','),b.toArray().join(',')].sort().join('|');if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);}};
   for(const c of cells.filter(c=>c.j>=first&&c.j<last)){const{i,j}=c,a=point(i,j),bb=point(i+1,j),cc=point(i+1,j+1),d=point(i,j+1);if((i+j)%2){top(a,bb,d);top(bb,cc,d);}else{top(a,bb,cc);top(a,cc,d);}}
   for(const[a,bb]of edges.values()){const ba=new THREE.Vector3(a.x,f(cy),a.z),bc=new THREE.Vector3(bb.x,f(cy),bb.z),want=new THREE.Vector3(a.z-bb.z,0,bb.x-a.x);tri(ba,bc,bb,want);tri(ba,bb,a,want);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();g.setAttribute('color',new THREE.Float32BufferAttribute(color,3));faceTriplanarUV(g,3);g.userData.naturalOwner=id;pieces.push({g,id,boundaryWorld:[...edges.values()].flatMap(v=>v.map(p=>p.toArray())),boundaryEdgesWorld:[...edges.values()].map(v=>v.map(p=>p.toArray())),sourceCells:cells.filter(c=>c.j>=first&&c.j<last).map(({x0,x1,z0,z1,h,bottom})=>({x0,x1,z0,z1,h,bottom})),kind:'OUTER_NONPATH_FOOT',first,last});
  }
 }
 const own=(g,id)=>{const s=triangleInstance(createTriangleTemplate(g),[0,0,0],id),q=s.box.clone();q.triangleSupport=s;q.duixiuTerrain=true;return q;};let part=0;
 b.geometries=b.geometries.filter((g,i)=>{if(removed.has(i)){g.dispose();return false;}return true;});for(const r of regions)b.colliders=b.colliders.flatMap(c=>outside(c,r).map(q=>{if(q===c)return c;const g=boxGeometry(q),o=own(g,`duixiu:outer-retained:${part++}`);g.dispose();return o;}));const rocks=[];for(const{g,...meta}of pieces){b.geometries.push(g);b.colliders.push(own(g,meta.id));rocks.push(meta);}if(b.geometries.some(g=>g.userData.duixiuSourceOnly))throw Error('Unconsumed source-only Duixiu cell');b.profile={...p,outerRock:{status:'CONTROLLED_OUTER_FOOT',source:'actual old nonroute cell footprint; not historical survey',removedGeometry:removed.size,inner,regions:regions.map(r=>({min:r.min.toArray(),max:r.max.toArray()})),rocks}};return b;
}
