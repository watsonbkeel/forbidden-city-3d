import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
// All added depth, curl count and cap/ear boundaries are engineering fits.
// No historical side/back image, measured depth or recovered sculpture is claimed.
export const STUDY_HAIR_COLOUR=0x6a4c2f;
export function createStudyEar(sign){
 if(sign!==1&&sign!==-1)throw Error('Ear side must be -1 or 1');
 const g=new T.SphereGeometry(1,24,16),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),out=Math.max(0,x),recess=.010*Math.exp(-((y/.6)**2+(z/.6)**2))*out*out;
  p.setXYZ(i,sign*(.175+.020*x-recess),1.95+.085*y,-.015+.035*z);
 }
 // Reflection changes winding; preserve outward normals on the left shell.
 if(sign<0){const a=g.index.array;for(let i=0;i<a.length;i+=3)[a[i+1],a[i+2]]=[a[i+2],a[i+1]];}
 g.computeVertexNormals();g.computeBoundingBox();g.userData={kind:'CLOSED_THIN_EAR_WITH_SHALLOW_CONCHA_ENGINEERING_FIT',recessMetres:.010};return g;
}
function cap(){
 const positions=[],indices=[],uv=[],cache=new Map(),innerOf=new Map();const N=12,M=24,layers=[];
 const point=(theta,phi,scale)=>[theta===0?0:.18*Math.sin(theta)*Math.cos(phi)*scale,2.005+.22*Math.cos(theta)*scale,theta===0||phi===0||phi===-Math.PI?0:.16*Math.sin(theta)*Math.sin(phi)*scale];
 const vertex=(v)=>{const key=v.map(x=>x.toFixed(12)).join(',');if(cache.has(key))return cache.get(key);const id=positions.length/3;positions.push(...v);uv.push(0,0);cache.set(key,id);return id;};
 const tri=(a,b,c)=>{if(a!==b&&b!==c&&a!==c)indices.push(a,b,c);};
 for(const scale of[1.012,.990]){const grid=[];for(let i=0;i<=N;i++){const row=[];for(let j=0;j<=M;j++)row.push(vertex(point(1.37*i/N,-Math.PI+Math.PI*j/M,scale)));grid.push(row);}layers.push(grid);}
 for(let i=0;i<=N;i++)for(let j=0;j<=M;j++)innerOf.set(layers[0][i][j],layers[1][i][j]);
 for(let i=0;i<N;i++)for(let j=0;j<M;j++){const g=layers[0];tri(g[i][j],g[i+1][j+1],g[i+1][j]);tri(g[i][j],g[i][j+1],g[i+1][j+1]);}
 const outer=indices.slice(),edge=new Map();for(let k=0;k<outer.length;k+=3)for(const[a,b]of[[outer[k],outer[k+1]],[outer[k+1],outer[k+2]],[outer[k+2],outer[k]]]){const key=[Math.min(a,b),Math.max(a,b)].join(',');const e=edge.get(key);if(e)e.count++;else edge.set(key,{a,b,count:1});}
 for(let i=0;i<outer.length;i+=3)tri(innerOf.get(outer[i]),innerOf.get(outer[i+2]),innerOf.get(outer[i+1]));
 for(const{a,b,count}of edge.values())if(count===1){tri(b,a,innerOf.get(a));tri(b,innerOf.get(a),innerOf.get(b));}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function createStudyHair(){
 const pieces=[cap()],centers=[],axis=new T.Vector3(0,0,1);let merged;
 try{for(let row=0;row<7;row++){const theta=.22+row*.18,count=Math.round(3+10*Math.sin(theta));for(let j=0;j<count;j++){
   const phi=-Math.PI+.16+(Math.PI-.32)*(j+.5*(row%2))/(count-1+.5*(row%2));const point=new T.Vector3(.18*Math.sin(theta)*Math.cos(phi),2.005+.22*Math.cos(theta),.16*Math.sin(theta)*Math.sin(phi)),normal=new T.Vector3(point.x/.18**2,(point.y-2.005)/.22**2,point.z/.16**2).normalize();
   const center=point.clone().addScaledVector(normal,.001),g=new T.SphereGeometry(1,8,6);g.scale(.014,.014,.006);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(axis,normal));g.translate(...center.toArray());g.computeBoundingBox();
   if(g.boundingBox.max.z>0){g.dispose();continue;}pieces.push(g);centers.push(center.toArray());
  }}
  if(centers.length>128)throw Error('Curl budget exceeded');merged=mergeGeometries(pieces,false);if(!merged)throw Error('Hair merge failed');merged.attributes.uv.array.fill(0);merged.computeBoundingBox();merged.userData={kind:'BACK_ONLY_CODE_CURL_CAP_ENGINEERING_FIT',curlCount:centers.length,curlCenters:centers,frontPlaneMaxZ:0,historicalShapeVerified:false,sourceDepthRecovered:false};return merged;
 }catch(e){merged?.dispose();throw e;}finally{for(const g of pieces)g.dispose();}
}
