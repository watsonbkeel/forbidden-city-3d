import * as THREE from 'three';

// A deliberately narrow proof for the existing route-facing platform solid.
// No tolerance-based union/CSG and no inference from surface area alone.
export function proveSupportRockUnion(build){
 const owner=build.colliders.find(c=>c.triangleSupport?.id==='duixiu:terrain:2051');
 if(!owner)throw Error('Missing support-rock owner');
 const cells=[];let capTriangles=0;
 for(const[index,g]of build.geometries.entries()){
  g.computeBoundingBox();const q=g.boundingBox;
  if([0,1,2].some(k=>Math.min(q.max.getComponent(k),owner.max.getComponent(k))<=Math.max(q.min.getComponent(k),owner.min.getComponent(k))))continue;
  if(!owner.containsBox(q))throw Error('Source cell crosses target union');
  if(q.min.y!==owner.min.y||q.max.y!==owner.max.y)throw Error('Source cell incomplete vertical partition');
  const a=g.attributes.position,ix=g.index,count=ix?.count??a.count;
  let caps=0;for(let i=0;i<count;i+=3){const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(a,ix?ix.getX(i+k):i+k));
   if(v.some(p=>!q.containsPoint(p)))throw Error('Invalid source bounds');
   if(v.every(p=>p.y===q.min.y)||v.every(p=>p.y===q.max.y))caps++;
   else if(!['x','z'].some(k=>v.every(p=>p[k]===q.min[k])||v.every(p=>p[k]===q.max[k])))throw Error('Not a rectangular source cell');
  }
  if(caps!==4)throw Error('Unexpected cap partition');capTriangles+=caps;cells.push({index,g,box:q});
 }
 const xs=[...new Set(cells.flatMap(c=>[c.box.min.x,c.box.max.x]))].sort((a,b)=>a-b),zs=[...new Set(cells.flatMap(c=>[c.box.min.z,c.box.max.z]))].sort((a,b)=>a-b);
 if(xs[0]!==owner.min.x||xs.at(-1)!==owner.max.x||zs[0]!==owner.min.z||zs.at(-1)!==owner.max.z)throw Error('Incomplete union boundary');
 const occupied=new Set();for(const c of cells){const i=xs.indexOf(c.box.min.x),j=zs.indexOf(c.box.min.z);if(xs[i+1]!==c.box.max.x||zs[j+1]!==c.box.max.z)throw Error('Not a simple source partition');const key=`${i},${j}`;if(occupied.has(key))throw Error('Overlapping source partition');occupied.add(key);}
 const gridCells=(xs.length-1)*(zs.length-1);if(occupied.size!==gridCells)throw Error('Missing cell in complete union');
 return{owner,cells,xs,zs,gridCells,capTriangles,y0:owner.min.y,y1:owner.max.y};
}

import {createTriangleTemplate,triangleInstance} from '../../utils/TriangleSupport.js';
import {faceTriplanarUV} from './shapes.js';

export function applyDuixiuSupportRock(build){
 const proof=proveSupportRockUnion(build),{owner,cells,y0,y1}=proof,a=owner.min,b=owner.max,positions=[];
 const tri=(a,b,c,want)=>{const n=b.clone().sub(a).cross(c.clone().sub(a));if(n.lengthSq()===0)throw Error('Degenerate support rock face');if(n.dot(want)<0)[b,c]=[c,b];for(const v of[a,b,c])positions.push(...v.toArray());};
 const f=Math.fround,V=(x,y,z)=>new THREE.Vector3(f(x),f(y),f(z));
 const zs=[0,.14,.32,.51,.69,.86,1].map(t=>f(a.z+(b.z-a.z)*t));
 const ys=[0,.19,.40,.61,.82,1],shifts=[0,.19,.62,.16,.54,0],lean=[0,.18,-.14,.24,-.12,.08,0];
 const rows=ys.map((t,j)=>zs.map((z,i)=>{const edge=i===0||i===zs.length-1||j===0||j===ys.length-1;const wave=[1,.81,1.02,.78,1,.86,1][i];return V(a.x+(edge?0:shifts[j]*wave),y0+(y1-y0)*t+(edge?0:lean[i]*(j%2?1:-.7)),z);}));
 const left=new THREE.Vector3(-1,0,0);for(let j=0;j<rows.length-1;j++)for(let i=0;i<zs.length-1;i++){const a=rows[j][i],b=rows[j][i+1],c=rows[j+1][i+1],d=rows[j+1][i];if((i+j)%2){tri(a,b,d,left);tri(b,c,d,left);}else{tri(a,b,c,left);tri(a,c,d,left);}}
 const quad=(a,b,c,d,n)=>{tri(a,b,c,n);tri(a,c,d,n);};
 // All perimeter coordinates coincide with the original rectangular owner.
 quad(V(b.x,y0,a.z),V(b.x,y0,b.z),V(b.x,y1,b.z),V(b.x,y1,a.z),new THREE.Vector3(1,0,0));
 quad(V(a.x,y0,a.z),V(b.x,y0,a.z),V(b.x,y1,a.z),V(a.x,y1,a.z),new THREE.Vector3(0,0,-1));
 quad(V(a.x,y0,b.z),V(b.x,y0,b.z),V(b.x,y1,b.z),V(a.x,y1,b.z),new THREE.Vector3(0,0,1));
 const sideCount=positions.length/9;
 const side=new THREE.BufferGeometry();side.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));side.computeVertexNormals();faceTriplanarUV(side,3);const colors=[];for(let i=0;i<side.attributes.position.count;i++){const p=side.attributes.position,v=.69+.018*Math.sin(p.getY(i)*.6+p.getZ(i)*.4);colors.push(v,v*.985,v*.94);}side.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 const names=Object.keys(side.attributes),arrays=Object.fromEntries(names.map(n=>[n,Array.from(side.attributes[n].array)]));
 for(const {g}of cells){const p=g.attributes.position,ix=g.index;for(let i=0;i<(ix?.count??p.count);i+=3){const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k);if(![y0,y1].some(y=>ids.every(k=>p.getY(k)===y)))continue;for(const n of names){const at=g.attributes[n];if(!at||at.itemSize!==side.attributes[n].itemSize)throw Error('Incompatible retained cap attributes');for(const k of ids)for(let c=0;c<at.itemSize;c++)arrays[n].push(at.array[k*at.itemSize+c]);}}}
 const render=new THREE.BufferGeometry();for(const n of names)render.setAttribute(n,new THREE.Float32BufferAttribute(arrays[n],side.attributes[n].itemSize));side.dispose();
 quad(V(a.x,y1,a.z),V(b.x,y1,a.z),V(b.x,y1,b.z),V(a.x,y1,b.z),new THREE.Vector3(0,1,0));
 quad(V(a.x,y0,a.z),V(b.x,y0,a.z),V(b.x,y0,b.z),V(a.x,y0,b.z),new THREE.Vector3(0,-1,0));
 const physics=new THREE.BufferGeometry();physics.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const id='duixiu:support-rock:platform-negative-x',shape=triangleInstance(createTriangleTemplate(physics),[0,0,0],id),box=shape.box.clone();physics.dispose();box.triangleSupport=shape;box.duixiuTerrain=true;render.userData.naturalOwner=id;
 if(shape.template.triangles.length>160)throw Error('Support rock exceeds local triangle budget');
 const removed=new Set(cells.map(c=>c.index));build.geometries=build.geometries.filter((g,i)=>{if(!removed.has(i))return true;g.dispose();return false;});build.geometries.push(render);build.colliders=build.colliders.map(c=>c===owner?box:c);
 build.profile={...build.profile,supportRock:{status:'BOUNDED_METHOD_CANDIDATE',owner:id,sourceOwner:owner.triangleSupport.id,sourceCells:cells.length,sourceCaps:proof.capTriangles,sideTriangles:sideCount,physicsTriangles:shape.template.triangles.length,renderTriangles:render.attributes.position.count/3,bounds:[a.toArray(),b.toArray()],capDomain:'exact complete disjoint source rectangle partition; coplanar physical caps simplified',scope:'one negative-X route-facing platform support; other four residual groups remain open'}};
 return build;
}
