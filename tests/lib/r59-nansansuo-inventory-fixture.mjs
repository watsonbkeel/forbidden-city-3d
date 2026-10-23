import fs from 'node:fs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {library} from './inner-palace-fixture.mjs';
import {material,boxRow,hash} from './r58-gallery-fixture.mjs';
export {hash};
export const outer=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-east.json',import.meta.url)));
export const indices=[12,13,14,15,16,17];
export function nansansuoFixture({candidate=true,seed=917}={}){
 const data=structuredClone(outer);if(!candidate)for(const i of indices)delete data.items[i].furnishingPolicy;
 const saved=Math.random;let state=seed;Math.random=()=>((state=(state*1664525+1013904223)>>>0)/4294967296);
 try{
 const z=new ZoneBase(library(),data),rows=[];let active=null;
 const furnish=z.kit.furnish.bind(z.kit),mesh=z.kit.mesh.bind(z.kit),col=z.kit.col.bind(z.kit);
 z.kit.mesh=(...a)=>{const m=mesh(...a);if(active)active.meshes.push(m);return m};
 z.kit.col=(...a)=>{col(...a);if(active)active.colliders.push(z.kit.colliders.at(-1))};
 let props=[];
 z.kit.furnish=(f,kind,room,...rest)=>{const p={kind,room,meshes:[],colliders:[]};active=p;try{const r=furnish(f,kind,room,...rest);p.cover=r.cover;p.spawns=r.spawns;props.push(p);return r}finally{active=null}};
 for(const i of indices){props=[];const offsets={colliders:z.kit.colliders.length,walkables:z.kit.walkables.length,rooms:z.kit.rooms.length,maps:z.kit.mapItems.length,regions:z.kit.regions.length};const built=z.buildHall(data.items[i]);rows.push({index:i,...snapshot(z,built.f,offsets,props)});}
 props=[];const offsets={colliders:z.kit.colliders.length,walkables:z.kit.walkables.length,rooms:z.kit.rooms.length,maps:z.kit.mapItems.length,regions:z.kit.regions.length};
 const control=z.kit.hall({x:180,z:200,w:18,d:12,name:'Unrelated control hall',plaque:false,interior:'hall'});
 const controlSnapshot=snapshot(z,control.f,offsets,props);
 return{z,data,rows,controlSnapshot,dispose:()=>z.kit.dispose(z.kit.root)};
 }finally{Math.random=saved}
}

function meshRow(m){return {attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,normalized:a.normalized,type:a.array.constructor.name,values:[...a.array]}])),index:m.geometry.index?[...m.geometry.index.array]:null,groups:m.geometry.groups,drawRange:{start:m.geometry.drawRange.start,count:String(m.geometry.drawRange.count)},matrix:m.matrixWorld.toArray(),material:m.material===null?null:Array.isArray(m.material)?m.material.map(material):material(m.material),castShadow:m.castShadow,receiveShadow:m.receiveShadow,visible:m.visible};}
function snapshot(z,frame,o,props){frame.updateMatrixWorld(true);const meshes=[];frame.traverse(m=>{if(m.isMesh)meshes.push(m)});const removed=new Set(props.flatMap(p=>p.meshes)),colSet=new Set(props.flatMap(p=>p.colliders));return {allMeshes:meshes.map(meshRow),retainedMeshes:meshes.filter(m=>!removed.has(m)).map(meshRow),colliders:z.kit.colliders.slice(o.colliders).map(boxRow),retainedColliders:z.kit.colliders.slice(o.colliders).filter(c=>!colSet.has(c)).map(boxRow),walkables:z.kit.walkables.slice(o.walkables).map(w=>w.box?({...w,box:boxRow(w.box)}):({...w})),rooms:structuredClone(z.kit.rooms.slice(o.rooms)),maps:structuredClone(z.kit.mapItems.slice(o.maps)),regions:structuredClone(z.kit.regions.slice(o.regions)),props,frame};}
