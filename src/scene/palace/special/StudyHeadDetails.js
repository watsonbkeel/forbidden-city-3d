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
 const positions=[],indices=[],uv=[],cache=new Map(),innerOf=new Map();const N=16,M=32,layers=[];
 const point=(theta,phi,scale)=>[theta===0?0:.18*Math.sin(theta)*Math.cos(phi)*scale,2.005+.22*Math.cos(theta)*scale,theta===0||phi===0||phi===-Math.PI?0:.16*Math.sin(theta)*Math.sin(phi)*scale];
 const paint=[];
 const vertex=(v,fade)=>{const key=v.map(x=>x.toFixed(12)).join(',');if(cache.has(key)){const id=cache.get(key);paint[id]=Math.max(paint[id],fade);return id;}const id=positions.length/3;positions.push(...v);uv.push(0,0);paint.push(fade);cache.set(key,id);return id;};
 const tri=(a,b,c)=>{if(a!==b&&b!==c&&a!==c)indices.push(a,b,c);};
 // One shared parameter boundary for BOTH layers. Forward wings only begin
 // after adjacent rows clear the protected front rectangle; no z clamping.
 const beta=i=>i===1?.35:i===2?.15:i===7||i===11?.25:i>=8&&i<=10?.50:0;
 for(const outer of[true,false]){const grid=[];for(let i=0;i<=N;i++){const row=[];for(let j=0;j<=M;j++){const angle=beta(i),phi=-Math.PI-angle+(Math.PI+2*angle)*j/M,edge=Math.min(j,M-j)/2,lower=(N-i)/2,fade=T.MathUtils.smoothstep(Math.min(edge,lower),0,1),scale=outer?.998+.014*fade:.990;row.push(vertex(point(1.37*i/N,phi,scale),fade));}grid.push(row);}layers.push(grid);}

 for(let i=0;i<=N;i++)for(let j=0;j<=M;j++)innerOf.set(layers[0][i][j],layers[1][i][j]);
 for(let i=0;i<N;i++)for(let j=0;j<M;j++){const g=layers[0];tri(g[i][j],g[i+1][j+1],g[i+1][j]);tri(g[i][j],g[i][j+1],g[i+1][j+1]);}
 const outer=indices.slice(),edge=new Map();for(let k=0;k<outer.length;k+=3)for(const[a,b]of[[outer[k],outer[k+1]],[outer[k+1],outer[k+2]],[outer[k+2],outer[k]]]){const key=[Math.min(a,b),Math.max(a,b)].join(',');const e=edge.get(key);if(e)e.count++;else edge.set(key,{a,b,count:1});}
 for(let i=0;i<outer.length;i+=3)tri(innerOf.get(outer[i]),innerOf.get(outer[i+2]),innerOf.get(outer[i+1]));
 for(const{a,b,count}of edge.values())if(count===1){tri(b,a,innerOf.get(a));tri(b,innerOf.get(a),innerOf.get(b));}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const colour=[],gold=new T.Color(0xad8146),hair=new T.Color(STUDY_HAIR_COLOUR);for(const fade of paint){const c=gold.clone().lerp(hair,fade);colour.push(c.r,c.g,c.b);}g.setAttribute('color',new T.Float32BufferAttribute(colour,3));return g;
}
export function createStudyHair(){
 const pieces=[cap()],centers=[],axis=new T.Vector3(0,0,1);let merged;
 try{for(let row=0;row<8;row++){const theta=.20+row*.14,count=Math.round(4+13*Math.sin(theta));for(let j=0;j<count;j++){
   const phi=-Math.PI-.40+(Math.PI+.80)*(j+.5*(row%2))/(count-1+.5*(row%2));const point=new T.Vector3(.18*Math.sin(theta)*Math.cos(phi),2.005+.22*Math.cos(theta),.16*Math.sin(theta)*Math.sin(phi)),normal=new T.Vector3(point.x/.18**2,(point.y-2.005)/.22**2,point.z/.16**2).normalize();
   const center=point.clone().addScaledVector(normal,.001),g=new T.SphereGeometry(1,10,6);const gp=g.attributes.position;for(let k=0;k<gp.count;k++){const x=gp.getX(k),y=gp.getY(k),z=gp.getZ(k),r=Math.hypot(x,y),groove=z>0?T.MathUtils.smoothstep(Math.cos(Math.atan2(y,x)-12*r),.55,.95)*.38:0;gp.setXYZ(k,x,y,z*(1-groove));}g.computeVertexNormals();g.scale(.014,.013,.0045);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(axis,normal));g.translate(...center.toArray());g.computeBoundingBox();
   let valid=true;for(let k=0;k<g.attributes.position.count;k++){const x=g.attributes.position.getX(k),y=g.attributes.position.getY(k),z=g.attributes.position.getZ(k);if(z>.09||(z>0&&(y<=2.10||(Math.abs(x)<=.08&&y<=2.205))))valid=false;}if(!valid){g.dispose();continue;}const colour=new Float32Array(g.attributes.position.count*3),c=new T.Color(STUDY_HAIR_COLOUR);for(let k=0;k<colour.length;k+=3)colour.set([c.r,c.g,c.b],k);g.setAttribute('color',new T.BufferAttribute(colour,3));pieces.push(g);centers.push(center.toArray());
  }}
  if(centers.length>128)throw Error('Curl budget exceeded');merged=mergeGeometries(pieces,false);if(!merged)throw Error('Hair merge failed');merged.attributes.uv.array.fill(0);merged.computeBoundingBox();merged.userData={kind:'HAIRLINE_SIDE_BRIDGE_AND_LOW_SPIRAL_ENGINEERING_FIT',curlCount:centers.length,curlCenters:centers,frontPlaneMaxZ:.09,frontProtectedBelowY:2.10,centralGemProtectedBelowY:2.205,historicalShapeVerified:false,sourceDepthRecovered:false};return merged;
 }catch(e){merged?.dispose();throw e;}finally{for(const g of pieces)g.dispose();}
}
