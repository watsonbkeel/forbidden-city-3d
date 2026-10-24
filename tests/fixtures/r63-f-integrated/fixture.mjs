// QA-only frozen R62 dispatch. Rewrites import URLs, never production behavior.
import '../../lib/inner-palace-fixture.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {library} from '../../lib/r58-hall-beast-fixture.mjs';
export const root=new URL('../../../',import.meta.url);
export const hash=v=>createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v)).digest('hex');
const manifestBytes=fs.readFileSync(new URL('./lineage.json',import.meta.url));
assert.equal(hash(manifestBytes),'abad4fd8585f82895651e3ff1347ca17cfbdb91989d9fd121a5a46b847cf44ef');
export const lineage=JSON.parse(manifestBytes);
export function verifyLineage(){
 for(const [file,expected] of Object.entries(lineage.unchangedDependencies))assert.equal(hash(fs.readFileSync(new URL(file,root))),expected,`R62 unchanged dependency: ${file}`);
 return {baselineCommit:lineage.baselineCommit,frozen:lineage.frozen,unchangedDependencies:Object.keys(lineage.unchangedDependencies).length};
}
const frozen=new Map();
for(const [file,record] of Object.entries(lineage.frozen)){
 const bytes=fs.readFileSync(new URL(record.file,import.meta.url));assert.equal(hash(bytes),record.gzipSHA256,`${file}: frozen compressed bytes`);
 const source=gunzipSync(bytes).toString();assert.equal(hash(source),record.sourceSHA256,`${file}: frozen original source bytes`);frozen.set(file,source);
}
const urls=new Map();
function moduleURL(file){
 if(urls.has(file))return urls.get(file);
 const source=frozen.get(file).replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>{
  const absolute=id==='three'?import.meta.resolve('three'):new URL(id,new URL(file,root)).href;
  const frozenPath=[...frozen.keys()].find(p=>new URL(p,root).href===absolute);
  return `from ${q}${frozenPath?moduleURL(frozenPath):absolute}${q}`;
 });
 const url='data:text/javascript;base64,'+Buffer.from(source).toString('base64');urls.set(file,url);return url;
}
verifyLineage();
export const {ZoneBase:Before}=await import(moduleURL('src/scene/zones/ZoneBase.js'));
export const config=JSON.parse(fs.readFileSync(new URL('data/zones/west-six.json',root)));
export const annexIndices=[3,9,10,16,17,25,26,32,33,41,42,48,49];
export const targetIndices=[2,...annexIndices,24,47].sort((a,b)=>a-b);
export const allDispatchIndices=config.items.flatMap((item,index)=>['hall','gate'].includes(item.kind)?[index]:[]);
export function createLocal(Builder,index,lib=library()){
 const cfg=structuredClone(config),z=new Builder(lib,cfg),item=cfg.items[index];
 const built=item.kind==='hall'?z.buildHall(item):z.buildGate(item);
 z.kit.root.updateMatrixWorld(true);
 return {z,kit:z.kit,lib,item,index,built,frame:built?.f,dispose(group){z.kit.dispose(group??z.kit.root);z.kit.root.clear();lib.mats?.forEach(m=>m.dispose());lib.dispose?.();}};
}
export const meshes=root=>{const rows=[];root.traverse(m=>{if(m.isMesh)rows.push(m);});return rows;};
function material(m){
 if(Array.isArray(m))return m.map(material);if(!m)return null;
 const textures=Object.entries(m).filter(([,v])=>v?.isTexture),meta={textures:Object.fromEntries(textures.map(([,t])=>[t.uuid,{}])),images:{}};
 const {uuid,...row}=m.toJSON(meta);
 for(const [key,t] of textures)row[key]={name:t.name,wrap:[t.wrapS,t.wrapT],repeat:t.repeat.toArray(),offset:t.offset.toArray(),colorSpace:t.colorSpace};
 return row;
}
const attribute=a=>a?{itemSize:a.itemSize,type:a.array.constructor.name,normalized:a.normalized,usage:a.usage,count:a.count,sha256:hash(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength))}:null;
export function meshRow(m){return {name:m.name,userData:m.userData,world:m.matrixWorld.toArray(),local:m.matrix.toArray(),material:material(m.material),attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,attribute(a)])),index:attribute(m.geometry.index),groups:m.geometry.groups,drawRange:[m.geometry.drawRange.start,String(m.geometry.drawRange.count)],castShadow:m.castShadow,receiveShadow:m.receiveShadow,visible:m.visible,layers:m.layers.mask,renderOrder:m.renderOrder};}
const clean=(key,value)=>key==='uuid'?undefined:value?.isMaterial?material(value):value;
export function output(f){
 f.kit.root.updateMatrixWorld(true);
 const nodes=[];f.kit.root.traverse(o=>nodes.push({name:o.name,type:o.type,local:o.matrix.toArray(),world:o.matrixWorld.toArray(),visible:o.visible,userData:JSON.parse(JSON.stringify(o.userData,clean))}));
 const rows=meshes(f.kit.root).map(meshRow);
 return {triangles:meshes(f.kit.root).reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),meshRows:rows,meshHash:hash(rows),nodesHash:hash(nodes),colliders:JSON.parse(JSON.stringify(f.kit.colliders)),walkables:JSON.parse(JSON.stringify(f.kit.walkables)),rooms:structuredClone(f.kit.rooms),mapItems:structuredClone(f.kit.mapItems),regions:structuredClone(f.kit.regions),gateWidths:[...f.z.gateWidths],gateGeometries:JSON.parse(JSON.stringify([...f.z.gateGeometries]))};
}
export const isStool=m=>m.userData.role?.startsWith('r63-qinzheng-footstool');
export function legacyWindows(f){return f.frame?.children.filter(m=>m.isMesh&&m.material===f.kit.lib.material('lattice_doors')&&Math.abs(m.position.z+6.45)<1e-8&&m.rotation.y===0)??[];}
export function legacyFurniture(f){const materials=Object.values(f.kit._interiorMats??{});return f.frame?.children.filter(m=>m.isMesh&&materials.includes(m.material)&&Object.keys(m.userData).length===0)??[];}
export function exactFurnitureColliders(f,selected){
 return selected.map(m=>{const p=m.position,g=m.geometry.parameters,b=new THREE.Box3(new THREE.Vector3(p.x-g.width/2,p.y-g.height/2,p.z-g.depth/2),new THREE.Vector3(p.x+g.width/2,p.y+g.height/2,p.z+g.depth/2)).applyMatrix4(f.frame.matrixWorld),matches=f.kit.colliders.filter(c=>['min','max'].every(k=>c[k].toArray().every((v,i)=>Math.abs(v-b[k].getComponent(i))<1e-8)));assert.equal(matches.length,1,'one dedicated legacy furniture COL');return matches[0];});
}
export function retainedRows(f,{baseline=false}={}){
 const excluded=new Set();
 if(annexIndices.includes(f.index)&&baseline)for(const m of legacyFurniture(f))excluded.add(m);
 if([24,47].includes(f.index))for(const m of baseline?legacyWindows(f):meshes(f.frame).filter(m=>m.userData.westRearSouthWindow))excluded.add(m);
 if(f.index===47){const roof=f.frame.children.find(o=>o.name.startsWith('roof_'));assert.ok(roof);for(const m of meshes(roof))if(m.material!==f.kit.lib.material('dougong_band'))excluded.add(m);}
 if(f.index===2&&!baseline)for(const m of meshes(f.frame).filter(isStool))excluded.add(m);
 return meshes(f.kit.root).filter(m=>!excluded.has(m)).map(meshRow).sort((a,b)=>hash(a).localeCompare(hash(b)));
}
