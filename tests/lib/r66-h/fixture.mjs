import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {CourtKit} from '../../../src/scene/palace/kit.js';
import {library} from '../inner-palace-fixture.mjs';
import * as residential from '../../../src/scene/palace/special/RemainingResidentialHalls.js';
import * as outer from '../../../src/scene/palace/special/RemainingOuterHalls.js';
export {THREE};
export const hash=x=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
export const prefix='r66-chonghua-south-knee';
export function fixture(name='重华宫',lib=library()){
 const zone=name==='重华宫'?'west-six':'outer-west',item=JSON.parse(readFileSync(new URL(`../../../data/zones/${zone}.json`,import.meta.url))).items.find(i=>i.kind==='hall'&&i.name===name),kit=new CourtKit(lib,zone),api=zone==='west-six'?residential:outer,p=api.resolveRemainingProfile(zone,item),built=api.buildRemainingHall(kit,item,p);kit.root.updateMatrixWorld(true);return{kit,item,p,...built,dispose:()=>kit.dispose(kit.root)};
}
export function meshes(root){const a=[];root.traverse(m=>{if(m.isMesh)a.push(m)});return a;}
const digestArray=a=>hash(Buffer.from(a.buffer,a.byteOffset,a.byteLength));
export function meshRow(m){const g=m.geometry;return{role:m.userData.role??m.name,type:g.type,attributes:Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,count:a.count,normalized:a.normalized,type:a.array.constructor.name,sha256:digestArray(a.array)}])),index:g.index?{count:g.index.count,sha256:digestArray(g.index.array)}:null,groups:g.groups,drawRange:{start:g.drawRange.start,count:String(g.drawRange.count)},matrix:m.matrixWorld.toArray(),materials:(Array.isArray(m.material)?m.material:[m.material]).map(t=>t?{name:t.name,type:t.type,color:t.color?.getHexString(),roughness:t.roughness,metalness:t.metalness,transparent:t.transparent,opacity:t.opacity,side:t.side,map:t.map?.name??null}:null),visible:m.visible,castShadow:m.castShadow,receiveShadow:m.receiveShadow};}
export function snapshot(w,{excludeAdded=false}={}){w.kit.root.updateMatrixWorld(true);return{meshes:hash(meshes(w.f).filter(m=>!excludeAdded||!m.userData.role?.startsWith(prefix)).map(meshRow)),meshCount:meshes(w.f).filter(m=>!excludeAdded||!m.userData.role?.startsWith(prefix)).length,colliders:hash(w.kit.colliders),walkables:hash(w.kit.walkables),rooms:hash(w.kit.rooms),maps:hash(w.kit.mapItems),regions:hash(w.kit.regions)};}
