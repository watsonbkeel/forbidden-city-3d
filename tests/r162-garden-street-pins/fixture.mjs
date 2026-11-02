import {createCanvas} from '@napi-rs/canvas';
import * as T from 'three';
import {CourtKit,FACE} from '../../src/scene/palace/kit.js';
import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';
export {T};
globalThis.document ??= {createElement:()=>createCanvas(1,1)};
export const CASES=[
 {itemIndex:30,item:{kind:'gate',name:'长康左门',x:-64,z:422.7},sourceObjectId:'FC-D2B1DB1C8C',side:-1},
 {itemIndex:31,item:{kind:'gate',name:'长康右门',x:63.7,z:422.7},sourceObjectId:'FC-E18D4B34CA',side:-1},
 {itemIndex:26,item:{kind:'gate',name:'琼苑东门',x:-68,z:429.7,rot:'east',source:'estimated'},sourceObjectId:'FC-4BC6AD858B',side:1},
 {itemIndex:27,item:{kind:'gate',name:'琼苑西门',x:68,z:429.7,rot:'west',source:'estimated'},sourceObjectId:'FC-75C4A83F02',side:1},
];
export function fixture(c=CASES[0],options={}){
 const r=createActualLibrary(),kit=new CourtKit(r.library,'garden');
 kit.gate({...c.item,rot:FACE[c.item.rot]??0,...options});
 const frame=kit.root.children.at(-1);
 return {kit,frame,lib:r.library,context:{zoneId:'garden',itemIndex:c.itemIndex,item:{...c.item}},dispose(group=kit.root){for(const k of ['colliders','walkables'])if(Object.isFrozen(kit[k]))kit[k]=[...kit[k]];kit.dispose(group);r.dispose();}};
}
export function native(kit){return JSON.stringify(Object.fromEntries(['colliders','walkables','rooms','mapItems','regions','plaques'].map(k=>[k,kit[k].map(o=>k==='plaques'?{text:o.text,mesh:o.mesh.uuid,frame:o.frame.uuid}:o)])));}
export function streams(frame){const rows=[];frame.traverse(o=>{rows.push({object:o,parent:o.parent,geometry:o.geometry,material:o.material,stream:JSON.stringify({name:o.name,p:o.position.toArray(),q:o.quaternion.toArray(),s:o.scale.toArray(),matrix:o.matrix.toArray(),world:o.matrixWorld.toArray(),data:o.userData,attributes:o.geometry&&Object.fromEntries(Object.entries(o.geometry.attributes).map(([k,a])=>[k,[a.itemSize,a.normalized,[...a.array]]])),index:o.geometry?.index&&[...o.geometry.index.array],material:o.material?.toJSON({textures:Object.fromEntries(Object.values(o.material??{}).filter(v=>v?.isTexture).map(t=>[t.uuid,{uuid:t.uuid}])),images:{}})})});});return rows;}
export function unchanged(before,frame){const old=new Map(streams(frame).map(row=>[row.object,row]));for(const row of before){const now=old.get(row.object);if(!now||now.parent!==row.parent||now.geometry!==row.geometry||now.material!==row.material||now.stream!==row.stream)throw Error('retained stream changed: '+row.object.name);}}
