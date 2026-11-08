import * as T from 'three';
import {fixture as raw} from '../r164-yangxin-east-panels/fixture.mjs';
import {installYangxinEastNorthSurface} from '../../src/scene/interior/YangxinEastNorthSurface.js';
import {installYangxinMainPartitions} from '../../src/scene/interior/YangxinMainPartitions.js';
import {installYangxinFoldedDoors} from '../../src/scene/interior/YangxinFoldedDoors.js';
export async function prepared(){const f=await raw();installYangxinEastNorthSurface(f.root);installYangxinMainPartitions(f.root);installYangxinFoldedDoors(f.root);return f}
export function row(m){return {name:m.name,position:m.position.toArray(),quaternion:m.quaternion.toArray(),scale:m.scale.toArray(),visible:m.visible,data:m.userData,attrs:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,normalized:a.normalized,type:a.array.constructor.name,array:Array.from(a.array)}])),index:{type:m.geometry.index.array.constructor.name,array:Array.from(m.geometry.index.array)},material:{name:m.material.name,side:m.material.side,map:m.material.map?.name??null,color:m.material.color.toArray(),roughness:m.material.roughness}}}
export function snapshot(root){const rows=[];root.traverse(m=>{if(m.isMesh)rows.push(row(m))});return JSON.stringify(rows)}
export function visible(root){const a=[];root.updateMatrixWorld(true);root.traverse(m=>{if(m.isMesh&&m.visible&&!/^(COL_|WALK_)/.test(m.name))a.push(m)});return a}
export function hits(root,x,y,z,dx,dy,dz,far){return new T.Raycaster(new T.Vector3(x,y,z),new T.Vector3(dx,dy,dz),0,far).intersectObjects(visible(root),false)}
