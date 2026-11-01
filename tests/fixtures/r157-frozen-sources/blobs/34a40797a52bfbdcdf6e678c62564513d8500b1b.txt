import * as THREE from 'three';
import {buildDuixiuTerrain} from './DuixiuTerrainBuild.js';
import {createTriangleTemplate, triangleInstance} from '../../utils/TriangleSupport.js';
import {faceTriplanarUV} from './shapes.js';

const REGION={x0:-7.5,x1:7.5,z0:-7.75,z1:-4.6};
const CUT=3.6;
const inside=c=>c.x0>=REGION.x0&&c.x1<=REGION.x1&&c.z0>=REGION.z0&&c.z1<=REGION.z1;
const central=c=>c.x0>=-2.5&&c.x1<=2.5;
const f=Math.fround;

// Clip the ACTUAL original world-Float32 render triangles, preserving their
// position/normal/UV/color witnesses below the cut. Never recreate an arch from
// a bounding box or an ideal formula. At this height each original cell's
// cross-section is a rectangle entirely above the original <=3m arch roof.
function lowerCell(g,cut){
  const capPoints=new Map();const names=['position','normal','uv','color'],data=Object.fromEntries(names.map(n=>[n,[]]));
  const read=i=>Object.fromEntries(names.map(n=>[n,Array.from({length:g.attributes[n].itemSize},(_,k)=>g.attributes[n].array[i*g.attributes[n].itemSize+k])]));
  const mix=(a,b,t)=>Object.fromEntries(names.map(n=>[n,a[n].map((v,k)=>v+(b[n][k]-v)*t)]));
  const emit=(a,b,c)=>{for(const v of[a,b,c])for(const n of names)data[n].push(...v[n]);};
  for(let i=0;i<g.attributes.position.count;i+=3){const p=[read(i),read(i+1),read(i+2)],q=[];for(let j=0;j<3;j++){const a=p[j],b=p[(j+1)%3],da=cut-a.position[1],db=cut-b.position[1];if(da>=0)q.push(a);if((da>=0)!==(db>=0)){const v=mix(a,b,da/(da-db));v.position[1]=cut;capPoints.set([f(v.position[0]),f(v.position[2])].join(','),[f(v.position[0]),f(v.position[2])]);q.push(v);}}for(let j=1;j<q.length-1;j++)emit(q[0],q[j],q[j+1]);}
  const points=[...capPoints.values()],center=points.reduce((v,p)=>[v[0]+p[0]/points.length,v[1]+p[1]/points.length],[0,0]);points.sort((a,b)=>Math.atan2(a[1]-center[1],a[0]-center[0])-Math.atan2(b[1]-center[1],b[0]-center[0]));
  const v=p=>({position:[p[0],cut,p[1]],normal:[0,1,0],uv:[p[0]/3,p[1]/3],color:[.7,.69,.66]});
  for(let i=0;i<points.length;i++)emit(v(center),v(points[(i+1)%points.length]),v(points[i]));
  const result=new THREE.BufferGeometry();for(const n of names)result.setAttribute(n,new THREE.Float32BufferAttribute(data[n],g.attributes[n].itemSize));return result;
}
function boxGeometry(b){const a=b.min,c=b.max,p=[[a.x,a.y,a.z],[c.x,a.y,a.z],[c.x,c.y,a.z],[a.x,c.y,a.z],[a.x,a.y,c.z],[c.x,a.y,c.z],[c.x,c.y,c.z],[a.x,c.y,c.z]],ix=[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float64Array(ix.flatMap(i=>p[i])),3));return g;}
function outside(box,r){const l=Math.max(box.min.x,r.min.x),h=Math.min(box.max.x,r.max.x),a=Math.max(box.min.z,r.min.z),b=Math.min(box.max.z,r.max.z);if(l>=h||a>=b)return[box];return[[box.min.x,l,box.min.z,box.max.z],[h,box.max.x,box.min.z,box.max.z],[l,h,box.min.z,a],[l,h,b,box.max.z]].filter(([x0,x1,z0,z1])=>x1-x0>1e-10&&z1-z0>1e-10).map(([x0,x1,z0,z1])=>new THREE.Box3(new THREE.Vector3(x0,box.min.y,z0),new THREE.Vector3(x1,box.max.y,z1)));}

function upperChunks(profile){
  const[cx,cy,cz]=profile.center,rx=profile.radiusX,rz=profile.radiusZ;
  const xs=[-7.5,-6.94,-6.26,-5.55,-4.91,-4.6,-4.25,-3.66,-3.07,-2.5,-1.875,-1.25,-.625,0,.625,1.25,1.875,2.5,3.07,3.66,4.25,4.6,4.91,5.55,6.26,6.94,7.5],bands=[0,.12,.25,.39,.53,.67,.8,.91,1];
  const base=(x,z)=>{let h=profile.topY*Math.max(0,1-(x/rx)**2-(z/rz)**2)**.45;const cutBlend=THREE.MathUtils.clamp((3-Math.abs(x))/.5,0,1);h+=cutBlend*Math.max(0,CUT+.08-h);const wx=THREE.MathUtils.clamp((4.6-Math.abs(x))/.7,0,1),t=THREE.MathUtils.clamp((z+5.75)/1.15,0,1),w=wx*t*t*(3-2*t);return h+(profile.summitY-h)*w;};
  const nominal=xs.map(x=>{const foot=-rz*Math.sqrt(Math.max(0,1-(x/rx)**2)),front=Math.max(REGION.z0,foot),lo=front===foot?0:base(x,front),hi=base(x,REGION.z1);return bands.map((t,j)=>{const y=lo+(hi-lo)*t;let low=front,high=REGION.z1;for(let n=0;n<40;n++){const m=(low+high)/2;if(base(x,m)<y)low=m;else high=m;}return{y,z:j===0?front:j===bands.length-1?REGION.z1:(low+high)/2};});});
  const grid=bands.map((t,j)=>xs.map((x,i)=>{let{y,z}=nominal[i][j];const edge=i===0||i===xs.length-1||j===0||j===bands.length-1;if(!edge){z+=.18*Math.min(z-nominal[i][j-1].z,nominal[i][j+1].z-z)*Math.sin(i*1.3+j*3.7);}const fade=edge?0:Math.max(0,Math.min(1,(x-REGION.x0)*3,(REGION.x1-x)*3,(z-REGION.z0)*3,(REGION.z1-z)*3));let shift=0,relief=0;for(const[a,b,w,h,d]of[[-6.3,3.1,1.45,1.1,.42],[-4.1,4.9,1.5,1.25,.48],[-5.6,6.8,1.25,.9,.36],[6.6,2.7,1.2,1.05,.38],[4.7,4.5,1.5,1.1,.43],[3.4,6.4,1.1,.8,.3],[-1.1,5.1,1.6,1,.28],[1,7.1,1.7,1.1,.3]]){const q=Math.max(0,1-Math.abs(x-a)/w)*Math.max(0,1-Math.abs(y-b)/h);shift-=d*q;relief+=.12*q;}return new THREE.Vector3(f(cx+x),f(cy+y+relief*fade),f(cz+z+shift*fade));}));
  const cuts=[0,xs.indexOf(-2.5),xs.indexOf(2.5),xs.length-1],result=[];
  for(let k=0;k<3;k++){const first=cuts[k],last=cuts[k+1],rows=grid.map(r=>r.slice(first,last+1)),bottom=f(cy+(k===1?CUT:0)),positions=[],colors=[];
    const tri=(a,b,c)=>{if(new THREE.Vector3().subVectors(b,a).cross(new THREE.Vector3().subVectors(c,a)).lengthSq()<1e-18)return;for(const p of[a,c,b]){positions.push(...p.toArray());const s=.69+.025*Math.sin(p.x*.7+p.z*1.3);colors.push(s,s*.985,s*.94);}};
    for(let j=0;j<rows.length-1;j++)for(let i=0;i<rows[0].length-1;i++){const a=rows[j][i],b=rows[j][i+1],c=rows[j+1][i+1],d=rows[j+1][i];if((i+first+j)%2){tri(a,b,d);tri(b,c,d);}else{tri(a,b,c);tri(a,c,d);}}
    const topTriangleCount=positions.length/9;
    const edge=[...rows[0],...rows.slice(1).map(r=>r.at(-1)),...rows.at(-1).slice(0,-1).reverse(),...rows.slice(1,-1).reverse().map(r=>r[0])],origin=new THREE.Vector3(f(cx+(xs[first]+xs[last])/2),bottom,f(cz+(REGION.z0+REGION.z1)/2));
    for(let i=0;i<edge.length;i++){const a=edge[i],b=edge[(i+1)%edge.length],ba=new THREE.Vector3(a.x,bottom,a.z),bb=new THREE.Vector3(b.x,bottom,b.z);tri(ba,bb,b);tri(ba,b,a);tri(origin,bb,ba);}
    let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();g=faceTriplanarUV(g,3);g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));result.push({g,topTriangleCount,boundaryWorld:edge.map(p=>p.toArray()),bottom,firstX:xs[first],lastX:xs[last]});
  }return result;
}

/** Controlled front/cave-roof/upper-shoulder candidate, never production-enabled implicitly. */
export function buildDuixiuNaturalFront(options){
  const b=buildDuixiuTerrain(options),[cx,cy,cz]=b.profile.center,cut=f(cy+CUT),remove=new Set(),lower=[];let caveIndex=0;
  for(const[cIndex,c]of b.profile.cells.entries()){if(inside(c)){remove.add(cIndex);if(c.cave)remove.add(b.profile.cells.length+caveIndex);if(central(c)){if(c.top<=CUT)throw Error('Upper replacement crosses retained lower shell');lower.push(lowerCell(b.geometries[cIndex],cut));}}if(c.cave)caveIndex++;}
  b.geometries=b.geometries.filter((g,i)=>{if(remove.has(i)){g.dispose();return false;}return true;});
  const owner=(g,id)=>{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],id),box=shape.box.clone();box.triangleSupport=shape;box.duixiuTerrain=true;return box;},r=new THREE.Box3(new THREE.Vector3(f(cx+REGION.x0),-1e6,f(cz+REGION.z0)),new THREE.Vector3(f(cx+REGION.x1),1e6,f(cz+REGION.z1)));let split=0;
  b.colliders=b.colliders.flatMap(c=>{if(c.max.y<=cy+.021&&c.min.x>=cx-1.501&&c.max.x<=cx+1.501)return[c];const parts=outside(c,r);if(parts.length&&parts[0]!==c&&c.triangleSupport.template.triangles.some(q=>Math.abs(q.normal.x*q.normal.y)>1e-8))throw Error('Cannot box-split a partial cave extrusion');return parts.map(p=>{if(p===c)return c;const g=boxGeometry(p),out=owner(g,`duixiu:front-keep:${split++}`);g.dispose();return out;});});
  for(const[gIndex,g]of lower.entries()){g.userData.retainedLower=true;b.geometries.push(g);b.colliders.push(owner(g,`duixiu:retained-cave-lower:${gIndex}`));}
  const rocks=[];for(const[i,{g,...meta}]of upperChunks(b.profile).entries()){const id=`duixiu:front-upper:${i}`;g.userData.naturalOwner=id;b.geometries.push(g);b.colliders.push(owner(g,id));rocks.push({id,...meta});}
  b.profile={...b.profile,naturalFront:{status:'CONTROLLED_CAVE_SHOULDER_NOT_RELEASED',region:REGION,cutY:CUT,retainedLowerCount:lower.length,removedGeometry:remove.size,rocks}};return b;
}
