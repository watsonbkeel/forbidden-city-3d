import fs from 'node:fs';
import * as THREE from 'three';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {buildEastResidentialFacade} from '../../src/scene/palace/special/EastResidentialFacades.js';
import {resolveRemainingProfile,buildRemainingHall} from '../../src/scene/palace/special/RemainingResidentialHalls.js';
import {applySourceGuidedNameboardMount} from '../../src/scene/palace/special/SourceGuidedNameboardMounts.js';
import {library,hash} from './inner-palace-fixture.mjs';
export {hash};
export const declarations=JSON.parse(fs.readFileSync(new URL('../fixtures/r62-east-throne-declarations.json',import.meta.url)));
export const indices=[2,9,16,30,37];
export const policy=i=>({mode:'unknown-inventory',target:`east-six/items/${i}`,scope:'r62-east-five-generic-thrones-only'});
export const meshes=root=>{const out=[];root.traverse(m=>{if(m.isMesh)out.push(m)});return out};
export const boxRow=b=>[b.min.toArray(),b.max.toArray()];
export function meshRow(m){m.updateWorldMatrix(true,false);return {name:m.name,userData:structuredClone(m.userData),world:m.matrixWorld.toArray(),material:m.material?{name:m.material.name,color:m.material.color?.getHex(),roughness:m.material.roughness,metalness:m.material.metalness}:null,geometry:{type:m.geometry.type,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,{type:a.array.constructor.name,itemSize:a.itemSize,normalized:a.normalized,array:[...a.array]}])),index:m.geometry.index?[...m.geometry.index.array]:null,groups:m.geometry.groups,drawRange:{start:m.geometry.drawRange.start,count:String(m.geometry.drawRange.count)}}};}
export function snapshot(kit){return {meshes:meshes(kit.root).map(meshRow),colliders:kit.colliders.map(boxRow),walkables:structuredClone(kit.walkables),rooms:structuredClone(kit.rooms),maps:structuredClone(kit.mapItems),regions:structuredClone(kit.regions),rootData:structuredClone(kit.root.userData),structures:kit.root.children.map(f=>structuredClone(f.userData))};}
// Bounded baseline builders, deliberately bypassing the owner's final ZoneBase
// hookup. This keeps old/new comparison valid after the opt-in wrapper is wired.
export function fixture(index=2){const original=structuredClone(declarations[index]),item={...original,furnishingPolicy:policy(index)},kit=new CourtKit(library(),'east-six'),z={kit};const raw=original.structure==='east-residential-facade'?buildEastResidentialFacade(kit,original):buildRemainingHall(kit,original,resolveRemainingProfile('east-six',original));const built=applySourceGuidedNameboardMount(kit,'east-six',original,raw);kit.root.updateMatrixWorld(true);return {z,kit,item,built,ctx:{zoneId:'east-six',itemIndex:index,item},dispose:()=>kit.dispose(kit.root)};}

export function seatBox(i){const a=declarations[i],tz=a.d/2-(i===2?Math.min(3.4,a.d*.36):Math.min(2.6,a.d*.3)),tw=Math.min(a.w/a.bays*1.4,5);return new THREE.Box3(new THREE.Vector3(a.x-tw/2,a.ph,a.z+(tz-1.2)),new THREE.Vector3(a.x+tw/2,a.ph+3,a.z+(tz+1.3)));}
