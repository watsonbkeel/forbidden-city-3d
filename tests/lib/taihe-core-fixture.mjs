import * as THREE from 'three';
import crypto from 'node:crypto';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});globalThis.document={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
export const hash=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const arrayHash=a=>crypto.createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
export function serialMesh(o,{material=true}={}){return {matrix:o.matrixWorld.toArray(),attributes:Object.fromEntries(Object.entries(o.geometry.attributes).map(([n,a])=>[n,{itemSize:a.itemSize,count:a.count,hash:arrayHash(a.array)}])),index:o.geometry.index?arrayHash(o.geometry.index.array):null,...(material?{material:{name:o.material.name,color:o.material.color?.getHex(),roughness:o.material.roughness,metalness:o.material.metalness,side:o.material.side,transparent:o.material.transparent,opacity:o.material.opacity,depthWrite:o.material.depthWrite,map:!!o.material.map}}:{})};}
export function captureTaiheControl(name,Builder=PalaceBuilder){const mats=new Map();const lib={material:(n,p={})=>{const k=n+JSON.stringify(p);if(!mats.has(k))mats.set(k,new THREE.MeshStandardMaterial({name:n,...p}));return mats.get(k)},tileSize:()=>1,aspect:()=>1};const builder=new Builder(new THREE.Scene(),lib),group=new THREE.Group();const data=structuredClone(PALACE_LAYOUT.find(v=>v.name===name));if(name!=='坤宁宫')data.position={x:0,y:0,z:0};const old=builder.throneArea.bind(builder),core=new Set();builder.throneArea=(g,args)=>{const n=g.children.length;old(g,args);g.children.slice(n).forEach(o=>o.traverse(v=>core.add(v)));};builder.buildHall(group,data,name==='坤宁宫'?2.16:9.9375);group.updateMatrixWorld(true);return{builder,group,core};}
// Historical V16 non-target comparison only. The new actual2.16m registration
// and rigid-body delta are checked independently by r12-inner-palace-terrace.
export async function captureHistoricalKunningControl(){
 const {buildKunningPalace}=await import('../../src/scene/palace/special/KunningPalace.js');
 const {KUNNING_PROFILE}=await import('../../src/scene/palace/special/KunningProfile.js');
 if(KUNNING_PROFILE.frameExpectation.floorY!==2.16)throw Error('Unexpected current floor');
 const mats=new Map(),library={material:(n,p={})=>{const k=n+JSON.stringify(p);if(!mats.has(k))mats.set(k,new THREE.MeshStandardMaterial({name:n,...p}));return mats.get(k);},tileSize:()=>1,aspect:()=>1};
 const builder=new PalaceBuilder(new THREE.Scene(),library),group=new THREE.Group(),p=structuredClone(KUNNING_PROFILE);
 p.frameExpectation.floorY=6.9375;buildKunningPalace(builder,group,PALACE_LAYOUT.find(h=>h.name==='坤宁宫'),6.9375,p);group.updateMatrixWorld(true);return{builder,group};
}
