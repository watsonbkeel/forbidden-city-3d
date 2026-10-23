import '../../lib/inner-palace-fixture.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {CourtKit} from '../../../src/scene/palace/kit.js';
import {GardenBuilder} from '../../../src/scene/GardenBuilder.js';
import {gardenLibrary} from '../../lib/r48-garden-fixture.mjs';
export const hash=x=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
export const lineage=JSON.parse(fs.readFileSync(new URL('lineage.json',import.meta.url)));
const root=new URL('../../../',import.meta.url);
async function frozen(file){const row=lineage.frozen[file],b=fs.readFileSync(new URL(row.file,import.meta.url));assert.equal(hash(b),row.gzipSHA256);const raw=gunzipSync(b);assert.equal(hash(raw),row.sourceSHA256);const code=raw.toString().replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${!id.startsWith('.')?import.meta.resolve(id):new URL(id,new URL(file,root)).href}${q}`);return import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));}
export const QinanBefore=await frozen('src/scene/palace/special/QinanHall.js');
export const CrossBefore=await frozen('src/scene/garden/CrossGardenPavilions.js');
export const GardenBefore=await frozen('src/scene/garden/RemainingGardenPavilions.js');
export const BuilderBefore=await frozen('src/scene/GardenBuilder.js');
const oldGardenBytes=gunzipSync(fs.readFileSync(new URL(lineage.frozen['data/zones/garden.json'].file,import.meta.url)));
assert.equal(hash(oldGardenBytes),lineage.frozen['data/zones/garden.json'].sourceSHA256);
export const oldGardenConfig=JSON.parse(oldGardenBytes);
export const item=JSON.parse(fs.readFileSync(new URL('data/zones/garden.json',root))).items.find(x=>x.name==='钦安殿');
export const meshes=o=>{const a=[];o.traverse(m=>{if(m.isMesh)a.push(m)});return a;};
export const select=(o,role)=>meshes(o).filter(m=>m.userData.role===role);
export function qinan(build,lib=gardenLibrary()){const kit=new CourtKit(lib,'garden'),{f,g}=build(kit,item);f.updateMatrixWorld(true);return{kit,f,g,dispose:()=>kit.dispose(kit.root)};}
export function pavilion(build,profile,name,lib=gardenLibrary()){const b=new GardenBuilder(new THREE.Scene(),lib),root=new THREE.Group(),f=build(b,root,profile(name));b.group.add(root);f.updateMatrixWorld(true);return{b,f,dispose:()=>b.dispose()};}
export function row(m){return {role:m.userData.role,name:m.name,userData:m.userData,matrix:m.matrix.toArray(),world:m.matrixWorld.toArray(),visible:m.visible,material:(Array.isArray(m.material)?m.material:[m.material]).map(v=>({name:v.name,color:v.color?.getHex(),roughness:v.roughness,metalness:v.metalness,side:v.side})),attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[a.itemSize,hash(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength))]])),index:m.geometry.index?hash(Buffer.from(m.geometry.index.array.buffer)):null};}
export const physics=f=>JSON.parse(JSON.stringify({colliders:(f.kit??f.b).colliders,walkables:(f.kit??f.b).walkables,rooms:f.kit?.rooms??[],map:f.kit?.mapItems??[]}));
export const retained=(f,exclude)=>meshes(f).filter(m=>!exclude(m)).map(row).sort((a,b)=>hash(a).localeCompare(hash(b)));
