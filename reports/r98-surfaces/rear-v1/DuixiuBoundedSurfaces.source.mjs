import * as THREE from 'three';
import {buildDuixiuOuterRock} from './DuixiuOuterRock.js';
import {createTriangleTemplate,triangleInstance} from '../../utils/TriangleSupport.js';

// Controlled R98 opt-in. No production hook until independent surface/route gate.
export function buildDuixiuBoundedSurfaces(options) {
 const b=buildDuixiuOuterRock(options),ownerIndex=b.colliders.findIndex(c=>c.triangleSupport.id==='duixiu:terrain:2054');
 if(ownerIndex<0)throw Error('Missing retained rear solid');
 const box=b.colliders[ownerIndex],cells=[];
 for(let i=0;i<b.geometries.length;i++){
  const g=b.geometries[i];g.computeBoundingBox();const q=g.boundingBox;
  if(q.max.x<=box.min.x||q.min.x>=box.max.x||q.max.z<=box.min.z||q.min.z>=box.max.z)continue;
  if(!box.containsBox(q)||q.min.y!==box.min.y||q.max.y!==box.max.y)throw Error('Rear union is not an exact ordinary filled box');
  cells.push({i,g,box:q});
 }
 const xs=[...new Set(cells.flatMap(c=>[c.box.min.x,c.box.max.x]))].sort((a,b)=>a-b),zs=[...new Set(cells.flatMap(c=>[c.box.min.z,c.box.max.z]))].sort((a,b)=>a-b);
 let holes=0,overlaps=0,sourceArea=0;for(const c of cells)sourceArea+=(c.box.max.x-c.box.min.x)*(c.box.max.z-c.box.min.z);
 for(let i=1;i<xs.length;i++)for(let j=1;j<zs.length;j++){
  const x=(xs[i-1]+xs[i])/2,z=(zs[j-1]+zs[j])/2,n=cells.filter(c=>x>c.box.min.x&&x<c.box.max.x&&z>c.box.min.z&&z<c.box.max.z).length;
  if(n===0)holes++;if(n>1)overlaps++;
 }
 const ownerArea=(box.max.x-box.min.x)*(box.max.z-box.min.z);
 if(holes||overlaps||sourceArea!==ownerArea||xs[0]!==box.min.x||xs.at(-1)!==box.max.x||zs[0]!==box.min.z||zs.at(-1)!==box.max.z)throw Error('Rear union coverage must be exact');
 const data={position:[],normal:[],uv:[],color:[]};
 // Keep every real top/bottom triangle and its original attributes exactly.
 for(const{g}of cells){const p=g.attributes.position;if(g.index)throw Error('Unexpected indexed rear source');for(let i=0;i<p.count;i+=3){const y=p.getY(i);if((y!==box.min.y&&y!==box.max.y)||p.getY(i+1)!==y||p.getY(i+2)!==y)continue;for(const key of Object.keys(data)){const a=g.attributes[key];for(let j=i;j<i+3;j++)for(let k=0;k<a.itemSize;k++)data[key].push(a.array[j*a.itemSize+k]);}}}
 const [cx,cy,cz]=b.profile.center,levels=[box.min.y,Math.fround(cy+8.5),Math.fround(cy+8.9),Math.fround(cy+9.25),Math.fround(cy+9.65),Math.fround(cy+10),box.max.y];
 const point=(x,y,z)=>{
  if(z===box.max.z&&x!==box.min.x&&x!==box.max.x&&y>cy+8.5&&y<box.max.y){
   const local=x-cx,yy=y-cy;
   const a=Math.max(0,1-Math.abs((local+1.65)/1.65)-Math.abs((yy-9.23-.16*(local+1.65))/.57));
   const c=Math.max(0,1-Math.abs((local-1.55)/1.95)-Math.abs((yy-9.65+.12*(local-1.55))/.52));
   z=Math.fround(z-.16*a-.12*c);
  }
  return new THREE.Vector3(x,y,z);
 };
 const tri=(a,bb,c)=>{const n=bb.clone().sub(a).cross(c.clone().sub(a)).normalize();for(const v of[a,bb,c]){data.position.push(...v.toArray());data.normal.push(...n.toArray());data.uv.push((Math.abs(n.z)>.5?v.x:v.z)/(options.tile??3),v.y/(options.tile??3));const shade=.72+.13*Math.sin(v.x*2.7+v.z*1.9)+.07*Math.cos(v.y*4.1);data.color.push(shade,shade*.99,shade*.95);}};
 for(let j=1;j<levels.length;j++){
  const y0=levels[j-1],y1=levels[j];
  for(let i=1;i<xs.length;i++){const x0=xs[i-1],x1=xs[i];for(const rear of[false,true]){const z=rear?box.max.z:box.min.z,a=point(x0,y0,z),bb=point(x1,y0,z),c=point(x1,y1,z),d=point(x0,y1,z);if(rear){tri(a,bb,c);tri(a,c,d);}else{tri(a,c,bb);tri(a,d,c);}}}
  for(let i=1;i<zs.length;i++){const z0=zs[i-1],z1=zs[i];for(const right of[false,true]){const x=right?box.max.x:box.min.x,a=point(x,y0,z0),bb=point(x,y0,z1),c=point(x,y1,z1),d=point(x,y1,z0);if(right){tri(a,c,bb);tri(a,d,c);}else{tri(a,bb,c);tri(a,c,d);}}}
 }
 const g=new THREE.BufferGeometry();for(const[key,values]of Object.entries(data))g.setAttribute(key,new THREE.Float32BufferAttribute(values,key==='uv'?2:3));g.userData.naturalOwner='duixiu:r98:rear-canonical';
 const s=triangleInstance(createTriangleTemplate(g),[0,0,0],g.userData.naturalOwner),replacement=s.box.clone();replacement.triangleSupport=s;replacement.duixiuTerrain=true;b.colliders[ownerIndex]=replacement;
 const removedGeometry=cells.map(c=>c.i),removed=new Set(removedGeometry);b.geometries=b.geometries.filter((g,i)=>{if(!removed.has(i))return true;g.dispose();return false;});b.geometries.push(g);
 b.profile={...b.profile,boundedSurfaces:{status:'CONTROLLED_REAR_ONLY_NOT_PRODUCTION',ownerIndex,sourceCells:cells.length,removedGeometry,sourceArea,ownerArea,holes,overlaps,bounds:[box.min.toArray(),box.max.toArray()],xs,zs,levels,sourceOwner:'duixiu:terrain:2054',owner:g.userData.naturalOwner,changedBounds:[[cx-3.5,cy+8.5,box.max.z-.28],[cx+3.5,box.max.y,box.max.z]]}};
 return b;
}
