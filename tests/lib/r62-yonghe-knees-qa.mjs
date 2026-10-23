import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {library} from './inner-palace-fixture.mjs';
import {kneeMeshHealth} from './r59-arrow-knees-qa.mjs';
export {kneeMeshHealth};
export const ROLE='yonghe-canopy-front-knee';
export const sha=v=>createHash('sha256').update(v).digest('hex');
export const hash=v=>sha(JSON.stringify(v));
export const data=JSON.parse(readFileSync(new URL('../../data/zones/east-six.json',import.meta.url)));
export const item=data.items.find(i=>i.name==='永和宫');
export const meshes=root=>{const a=[];root.traverse(o=>{if(o.isMesh)a.push(o);});return a;};
export function liveFixture(lib=library()){
 const b=new ZoneBase(lib,data),{f:frame}=b.buildHall(item),kit=b.kit;
 kit.root.updateMatrixWorld(true);
 return{frame,kit,b,dispose:()=>kit.dispose(kit.root)};
}
const frozenBytes=readFileSync(new URL('../fixtures/r62-yonghe/EastResidentialFacades.R61.js.txt',import.meta.url));
if(sha(frozenBytes)!=='10685a888adade27cf3dbfca94564567db9d3d56d01eb233bfd09ffb86007406')throw Error('Frozen R61 Yonghe source SHA mismatch');
const rewritten=frozenBytes.toString('utf8').replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,new URL('../../src/scene/palace/special/EastResidentialFacades.js',import.meta.url)).href}${q}`);
const baseline=await import('data:text/javascript;base64,'+Buffer.from(rewritten).toString('base64'));
export function fixture(lib=library()){
 const kit=new CourtKit(lib,data.id),{f:frame}=baseline.buildEastResidentialFacade(kit,item);
 kit.root.updateMatrixWorld(true);return{frame,kit,dispose:()=>kit.dispose(kit.root)};
}
export function snapshot({frame,kit}){
 frame.updateMatrixWorld(true);
 const retained=meshes(frame).filter(m=>m.userData.role!==ROLE);
 const rows=retained.map(m=>({name:m.name,role:m.userData.role??null,matrix:m.matrixWorld.toArray(),attrs:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,{size:a.itemSize,type:a.array.constructor.name,bytes:sha(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength))}])),index:m.geometry.index?sha(Buffer.from(m.geometry.index.array.buffer)):null,material:m.material?{name:m.material.name,color:m.material.color?.getHex(),side:m.material.side,map:m.material.map?.name??null}:null,cast:m.castShadow,receive:m.receiveShadow}));
 return{meshCount:retained.length,triangles:retained.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),meshHash:hash(rows),physicsHash:hash(Object.fromEntries(['colliders','walkables','rooms','regions','mapItems'].map(k=>[k,kit[k]]))),plaqueHash:hash(kit.plaques.map(p=>({text:p.text,mesh:p.mesh.position.toArray(),frame:p.frame.position.toArray()})))};
}
export function audit(f){
 f.frame.updateMatrixWorld(true);const all=meshes(f.frame),knees=all.filter(m=>m.userData.role===ROLE),old=all.filter(m=>m.userData.role!==ROLE);
 const bounds=m=>new THREE.Box3().setFromObject(m);
 const overlaps=[];
 for(const k of knees)for(const m of old){const a=bounds(k),b=bounds(m),dx=Math.min(a.max.x,b.max.x)-Math.max(a.min.x,b.min.x),dy=Math.min(a.max.y,b.max.y)-Math.max(a.min.y,b.min.y),dz=Math.min(a.max.z,b.max.z)-Math.max(a.min.z,b.min.z);if(Math.min(dx,dy,dz)>1e-6)overlaps.push({knee:k.userData.columnX,direction:k.userData.inward,oldRole:m.userData.role??m.name,overlap:[dx,dy,dz]});}
 return{count:knees.length,triangles:knees.reduce((n,m)=>n+kneeMeshHealth(m).triangles,0),lowestY:knees.length?Math.min(...knees.map(m=>bounds(m).min.y)):null,health:knees.map(kneeMeshHealth),positiveVolumeAabbIntersectionsWithRetained:overlaps,snapshot:snapshot(f)};
}
