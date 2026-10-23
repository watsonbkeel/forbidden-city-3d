import fs from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {library,hash} from './inner-palace-fixture.mjs';
export {hash};
export const declarations=JSON.parse(fs.readFileSync(new URL('../fixtures/r63-west-annex-declarations.json',import.meta.url)));
export const indices=Object.keys(declarations).map(Number);
export const policy=i=>({mode:'unknown-inventory',target:`west-six/items/${i}`,scope:'r63-west-13-unnamed-annex-furnish-room-only'});
export const meshes=root=>{const out=[];root.traverse(m=>{if(m.isMesh)out.push(m)});return out};
export const boxRow=b=>[b.min.toArray(),b.max.toArray()];
export function meshRow(m){m.updateWorldMatrix(true,false);return {name:m.name,userData:structuredClone(m.userData),world:m.matrixWorld.toArray(),castShadow:m.castShadow,receiveShadow:m.receiveShadow,visible:m.visible,material:m.material?{name:m.material.name,color:m.material.color?.getHex(),roughness:m.material.roughness,metalness:m.material.metalness}:null,geometry:{type:m.geometry.type,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,{type:a.array.constructor.name,itemSize:a.itemSize,normalized:a.normalized,array:[...a.array]}])),index:m.geometry.index?[...m.geometry.index.array]:null,groups:m.geometry.groups,drawRange:{start:m.geometry.drawRange.start,count:String(m.geometry.drawRange.count)}}};}
export function snapshot(kit){return {meshes:meshes(kit.root).map(meshRow),colliders:kit.colliders.map(boxRow),walkables:structuredClone(kit.walkables),rooms:structuredClone(kit.rooms),maps:structuredClone(kit.mapItems),regions:structuredClone(kit.regions),rootData:structuredClone(kit.root.userData),structures:kit.root.children.map(f=>structuredClone(f.userData))};}
export function fixture(index=3,{builder,beforeBuild,dispatch=false}={}){const original=structuredClone(declarations[index]),item={...original,furnishingPolicy:policy(index)},config={id:'west-six',items:Array.from({length:55},(_,i)=>i===index?original:{})},z=new ZoneBase(library(),config),kit=z.kit;beforeBuild?.(kit);const built=builder?builder(kit,original,index):dispatch?z.buildHall(original):z.buildHallBaseline(original);kit.root.updateMatrixWorld(true);return {z,kit,original,item,built,ctx:{zoneId:'west-six',itemIndex:index,item},dispose:()=>kit.dispose(kit.root)};}
// Test-only independent selection from real existing primitive material ownership.
// Production selection must additionally validate all payloads and registrations.
export function baselineTargets(a){const mats=Object.values(a.kit._interiorMats);return a.built.f.children.filter(m=>m.isMesh&&mats.includes(m.material)&&Object.keys(m.userData).length===0);}
