import * as THREE from 'three';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { buildWuyingObservedCases } from '../../../src/scene/palace/special/WuyingObservedCases.js';
const phase=process.argv[2]??'optimized';
const out=new URL('./',import.meta.url);
const kit={owned:[],ownedTextures:[],colliders:[],col(...v){this.colliders.push(v.slice(1));}};
const materials=Object.fromEntries(['frame','glass','light','plinth','paper'].map(k=>[k,new THREE.MeshStandardMaterial({name:k,color:k==='plinth'?0xe8e4dc:0x777777})]));
const root=new THREE.Group();
for(const part of['front','rear'])buildWuyingObservedCases(kit,root,{part,ph:0,exhibit:{designSource:'isolated-unchanged-case-fixture'}},materials);
root.updateMatrixWorld(true);
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const stableGeometry=g=>({type:g.type,parameters:g.parameters,attributes:Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,array:Array.from(a.array)}])),index:g.index?Array.from(g.index.array):null});
const stableMaterial=m=>({name:m.name,color:m.color.toArray(),roughness:m.roughness,map:m.map?{name:m.map.name,data:Array.from(m.map.image.data),width:m.map.image.width,height:m.map.image.height}:null});
const cases=root.children.filter(n=>n.userData.role==='wuying-independent-case');
const fingerprints={};
const models=[];const contracts={};
for(const c of cases){
 const key=c.userData.scene.replace('scene_','');const parts=[],fixtures=[];const row={transform:c.matrix.toArray(),meta:c.userData,parts:[]};
 for(const mesh of c.children.filter(n=>n.isMesh)){
  row.parts.push({role:mesh.userData.role,meta:mesh.userData,transform:mesh.matrix.toArray(),geometry:stableGeometry(mesh.geometry),material:stableMaterial(mesh.material)});
  const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal,positions=[],normals=[],colors=[];
  const color=mesh.material.color;
  for(let i=0;i<p.count;i++){
   const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrix);v.y-=1.025;positions.push(...v.toArray());
   normals.push(...new THREE.Vector3().fromBufferAttribute(n,i).transformDirection(mesh.matrix).toArray());
   colors.push(...color.toArray());
  }
  const record={role:mesh.userData.role,positions,normals,colors,indices:mesh.geometry.index?Array.from(mesh.geometry.index.array):Array.from({length:p.count},(_,i)=>i)};
  if(['wuying-ceramic-form','observed-vessel-ear','observed-tripod-leg'].includes(mesh.userData.role)||mesh.userData.refinement==='R52_FRONT_PHOTO_FORM')parts.push(record);
  else if(mesh.userData.role==='independent-case-upper-pad')fixtures.push(record);
 }
 fingerprints[key]=hash(row);if(['d111','d112','59','61'].includes(key)){const f=c.children.find(n=>n.userData.role==='wuying-ceramic-form');contracts[key]={parameters:f.userData.formParameters,roles:parts.map(n=>n.role)};}
 if(['d111','d112','59','61'].includes(key))models.push({key,parts,fixtures,triangles:parts.reduce((n,p)=>n+p.indices.length/3,0),meshes:parts.length});
}
fs.writeFileSync(new URL(`${phase}-fingerprints.json`,out),JSON.stringify({base:'fac791c',cases:fingerprints,colliders:kit.colliders},null,2));
fs.writeFileSync(new URL(`${phase}-geometry.json.gz`,out),gzipSync(JSON.stringify({method:'Actual direct WuyingObservedCases BufferGeometry and transforms; no substitute shapes',phase,models})));
fs.writeFileSync(new URL(`${phase}-contracts.json`,out),JSON.stringify(contracts,null,2));
console.log(JSON.stringify({phase,cases:cases.length,models:models.map(({key,triangles,meshes})=>({key,triangles,meshes}))}));
