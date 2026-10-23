import * as THREE from 'three';
import {createHash} from 'node:crypto';
import './inner-palace-fixture.mjs';
import {realTextureLibrary} from './r48-real-texture-library.mjs';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {zhaodeGateGeometry} from '../../src/scene/palace/special/ZhaodeGateProfile.js';
export const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const nodes=(root,role)=>{const out=[];root.traverse(o=>{if(o.userData.role===role)out.push(o);});return out;};
export function fixture(options={}){
 const lib=realTextureLibrary(),kit=new CourtKit(lib),opts={name:'昭德门',x:0,z:0,gateProfile:'zhaode',gateKind:'three-bay',open:true,plaque:false,...options};
 kit.gate(opts);const frame=kit.root.children[0];frame.updateMatrixWorld(true);return {lib,kit,frame,g:frame.userData.gateGeometry};
}
export function rawPanelFixture(options={}){
 const lib=realTextureLibrary(),kit=new CourtKit(lib),g=zhaodeGateGeometry({gateProfile:'zhaode',gateKind:'three-bay',...options}),frame=kit.frame(g.x,g.z,g.rot);
 frame.name='昭德门';frame.userData.gateGeometry=g;
 for(const z of [g.core.frontZ,g.core.rearZ])for(const sign of [-1,1]){
  const w=(g.width-g.portals[0].clearWidth)/2,m=kit.box(frame,'wall_red',w,g.core.panelHeight,g.core.wallThickness,sign*(g.portals[0].clearWidth/2+w/2),g.platformY+g.core.panelHeight/2,z);
  m.name=m.userData.role='zhaode-side-panel';
 }
 return {lib,kit,frame,g};
}
export function triangles(mesh,predicate=()=>true){
 const g=mesh.geometry,a=g.attributes,idx=g.index,out=[];
 for(let i=0;i<(idx?.count??a.position.count);i+=3){const ids=[0,1,2].map(j=>idx?idx.getX(i+j):i+j);if(!predicate(ids,a))continue;
  out.push(ids.map(j=>Object.fromEntries(Object.entries(a).map(([key,v])=>[key,[...v.array.subarray(j*v.itemSize,(j+1)*v.itemSize)]]))));
 }return out;
}
export function snapshot({kit,frame,g}){
 frame.updateMatrixWorld(true);const rows=[],partial=[],materials=new Set();let count=0,meshCount=0;
 frame.traverse(m=>{if(!m.isMesh)return;materials.add(m.material.name);count+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;meshCount++;
  if(m.userData.role==='zhaode-south-panel-paint')return;
  const record={name:m.name,role:m.userData.role,matrix:m.matrixWorld.toArray(),material:m.material.name,cast:m.castShadow,receive:m.receiveShadow,triangles:triangles(m)};
  if(m.userData.role==='zhaode-side-panel'&&m.position.z===g.core.frontZ){record.triangles=triangles(m,(ids,a)=>!ids.every(j=>a.normal.getZ(j)<-.9999));partial.push(record);}else rows.push(record);
 });
 return {nonTargetHash:hash(rows),targetOtherFacesHash:hash(partial),registrationHash:hash({colliders:kit.colliders.map(b=>[b.min.toArray(),b.max.toArray()]),walkables:kit.walkables,map:kit.mapItems,regions:kit.regions,rooms:kit.rooms,plaques:kit.plaques}),bounds:new THREE.Box3().setFromObject(frame).toJSON?.()??(()=>{const b=new THREE.Box3().setFromObject(frame);return [b.min.toArray(),b.max.toArray()];})(),triangles:count,meshes:meshCount,materials:materials.size,colliders:kit.colliders.length,walkables:kit.walkables.length,rooms:kit.rooms.length};
}
export function ray(root,from,direction,far=20){root.updateMatrixWorld(true);const r=new THREE.Raycaster(new THREE.Vector3(...from),new THREE.Vector3(...direction));r.far=far;return r.intersectObject(root,true);}
