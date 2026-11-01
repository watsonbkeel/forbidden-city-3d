import * as THREE from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

/** Explicit bridge-2-only registration. Render primitives and CPU triangles
 * share geometry. Borrowed marble is never disposed here. */
export function bridge2ContactOwner(colliders,ox,oz){
 const templates=new Map();
 return (mesh,id)=>{
  mesh.updateMatrix();
  if(mesh.rotation.x||mesh.rotation.y||mesh.rotation.z||!mesh.scale.equals(new THREE.Vector3(1,1,1)))throw new Error('Only authored translations are supported');
  let template=templates.get(mesh.geometry);if(!template){template=createTriangleTemplate(mesh.geometry);templates.set(mesh.geometry,template);}
  const shape=triangleInstance(template,[mesh.position.x+ox,mesh.position.y,mesh.position.z+oz],`inner-jinshui:bridge-2:${id}`);
  const box=shape.box.clone();box.triangleSupport=shape;colliders.push(box);
 };
}
export function addBridge2Caps(root,marble,placements,colliders,ox,oz){
 const outline=[[.105,0],[.125,.02],[.125,.04],[.095,.055],[.102,.074],[.121,.108],[.111,.15],[.077,.188],[0,.22]];
 const raw=new THREE.LatheGeometry(outline.map(([r,y])=>new THREE.Vector2(r,y)),8),p=raw.attributes.position,ix=raw.index,xyz=[],uv=[];
 for(let i=0;i<ix.count;i+=3){const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,ix.getX(i+k)));if(new THREE.Triangle(...v).getArea()>1e-12)for(let k=0;k<3;k++){const a=v[k];xyz.push(a.x,a.y,a.z);uv.push(raw.attributes.uv.getX(ix.getX(i+k)),raw.attributes.uv.getY(ix.getX(i+k)));}}
 // Explicit closed underside, not a support plane (normal points down).
 for(let i=0;i<8;i++){const a=i*Math.PI/4,b=(i+1)*Math.PI/4;xyz.push(0,0,0,.105*Math.sin(b),0,.105*Math.cos(b),.105*Math.sin(a),0,.105*Math.cos(a));uv.push(.5,.5,.5+.5*Math.sin(b),.5+.5*Math.cos(b),.5+.5*Math.sin(a),.5+.5*Math.cos(a));}
 raw.dispose();const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(xyz,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();
 const template=createTriangleTemplate(geo),caps=new THREE.InstancedMesh(geo,marble,placements.length),matrix=new THREE.Matrix4();caps.name='bridge2-enabled-torch-caps';caps.castShadow=caps.receiveShadow=true;
 placements.forEach((p,i)=>{caps.setMatrixAt(i,matrix.makeTranslation(p.x,p.y,p.z));const shape=triangleInstance(template,[p.x+ox,p.y,p.z+oz],`inner-jinshui:bridge-2:cap:${i}`);const b=shape.box.clone();b.triangleSupport=shape;colliders.push(b);});
 caps.instanceMatrix.needsUpdate=true;caps.computeBoundingBox();caps.computeBoundingSphere();
 const release=()=>{geo.removeEventListener('dispose',release);caps.dispose();};geo.addEventListener('dispose',release);root.add(caps);
 root.userData.bridge2Contact={status:'PHOTO_FIT_NOT_SURVEYED',enabledBridge:'inner-jinshui:bridge-2',capCount:22,otherSideBridgesEnabled:false,historicalPostCountVerified:false,footRadius:.3,playerBodyRadius:.5,flatSupportProxy:false};
}
