import * as THREE from 'three';
import {qianqingCentralUV} from './QianqingCentralArt.js';
import {createXiqingSurface} from '../../controls/XiqingRoofSurface.js';
/** Four existing stair-side planes. Curves are a restrained photo-informed
 * open-rail scheme, not a traced carving. No solid panel fills their openings. */
export function buildQianqingStairRails(mat,{front,thW,stepW,dais}){
 const root=new THREE.Group(),innerGap=thW/3-stepW,outerGap=thW/2-(thW/3+stepW/2),outerX=thW/2-outerGap/2;
 for(const [index,x]of[-outerX,-thW/6,thW/6,outerX].entries()){
  const row=new THREE.Group();row.name='qianqing-open-stair-rail-'+index;row.userData.qianqingRail=index;root.add(row);
  const add=(name,g,p,cell=4)=>{const m=new THREE.Mesh(qianqingCentralUV(g,cell,{solid:true}),mat);m.name=name;m.position.copy(p);m.castShadow=m.receiveShadow=true;row.add(m);return m;};
  const box=(name,w,h,d,p,cell=4)=>add(name,new THREE.BoxGeometry(w,h,d),p,cell),points=[];
  for(const z of[front-.98,front-.28,front+.7]){const k=Math.min(5,Math.max(1,Math.floor((z-front+1.3)/.26)+1)),base=k*dais/5;box('qianqing-stair-rail-post',.075,.70,.075,new THREE.Vector3(x,base+.35,z));add('qianqing-stair-rail-finial',new THREE.SphereGeometry(.085,6,4),new THREE.Vector3(x,base+.74,z));points.push(new THREE.Vector3(x,base+.65,z));}
  for(let i=0;i<points.length-1;i++){
   const a=points[i],c=points[i+1],v=c.clone().sub(a),mid=a.clone().add(c).multiplyScalar(.5),m=box('qianqing-stair-rail',.07,.075,v.length(),mid,5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),v.clone().normalize());
   const loA=a.clone().add(new THREE.Vector3(0,-.36,0)),loC=c.clone().add(new THREE.Vector3(0,-.36,0)),q1=loA.clone().lerp(loC,1/3),q2=loA.clone().lerp(loC,2/3);q1.y-=.035;q2.y-=.035;
   add('qianqing-stair-lower-curved-rail',new THREE.TubeGeometry(new THREE.CubicBezierCurve3(loA,q1,q2,loC),10,.028,6,false),new THREE.Vector3(),5);
   const curve=[];for(let j=0;j<=16;j++){const t=j/16,p=a.clone().lerp(c,t);p.y-=.18+.11*Math.sin(t*Math.PI*2);curve.push(p);}
   add('qianqing-stair-open-gilt-return',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curve),16,.012,4,false),new THREE.Vector3());
  }
 }
 return root.children.slice();
}
/** MergeUtils preserves mesh traversal order in the single shared-material
 * bucket. Record only the selected rail faces, then read the FINISHED buffer. */
export function qianqingRailRanges(raw){
 const ranges=Array.from({length:4},()=>[]);let start=0;
 raw.traverse(m=>{if(!m.isMesh)return;const count=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;let row=m;while(row&&row!==raw&&row.userData.qianqingRail===undefined)row=row.parent;if(row?.userData.qianqingRail!==undefined)ranges[row.userData.qianqingRail].push({start,count});start+=count;});
 return{ranges,triangles:start};
}
export function registerQianqingStairRails(builder,near,{ranges,triangles}){
 if(near.children.length!==1||!near.children[0].isMesh||near.children[0].geometry.index||near.children[0].geometry.attributes.position.count!==triangles*3)throw Error('Qianqing rail source must remain one exact non-indexed finished batch');
 if(!Array.isArray(builder.colliders))throw Error('Qianqing rail installation requires owned collider lifecycle');
 near.updateWorldMatrix(true,true);const m=near.children[0],p=m.geometry.attributes.position;
 for(let i=0;i<4;i++){
  const id='qianqing-stair-rail-'+i,faces=[];
  for(const {start,count}of ranges[i])for(let t=start;t<start+count;t++)faces.push({source:{mesh:0,triangle:t},vertices:[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,t*3+j).applyMatrix4(m.matrixWorld))});
  const surface=createXiqingSurface(faces,id),owner=surface.box.clone();owner.xiqingRoofSurface=surface;owner.furnitureMotionScope={kind:'qianqing-assemblies',id,minOffsetX:-.6,maxOffsetX:owner.max.x-owner.min.x+.6,minOffsetZ:-.6,maxOffsetZ:owner.max.z-owner.min.z+.6};builder.colliders.push(owner);
 }
}
