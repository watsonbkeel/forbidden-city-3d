import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from 'three';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {library} from './inner-palace-fixture.mjs';
export const hash=v=>crypto.createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v)).digest('hex');
const moduleURL=(source,base,overrides={})=>'data:text/javascript;base64,'+Buffer.from(source.replace(/from '([^']+)'/g,(_,s)=>`from '${overrides[s]??(s==='three'?import.meta.resolve('three'):new URL(s,base).href)}'`)).toString('base64');
const kitURL=moduleURL(fs.readFileSync(new URL('../fixtures/r58-gallery-baseline-kit.txt',import.meta.url),'utf8'),new URL('../../src/scene/palace/kit.js',import.meta.url));
export const {CourtKit:BaselineKit}=await import(kitURL);
export const {ZoneBase:BaselineZone}=await import(moduleURL(fs.readFileSync(new URL('../fixtures/r58-gallery-baseline-zone.txt',import.meta.url),'utf8'),new URL('../../src/scene/zones/ZoneBase.js',import.meta.url),{'../palace/kit.js':kitURL}));
export const axis=JSON.parse(fs.readFileSync(new URL('../../data/zones/axis-courts.json',import.meta.url)));
export const targets={28:'FC-CA9102BFFB',29:'FC-CA9102BFFB',30:'FC-CA9102BFFB',31:'FC-0D3F161564',34:'FC-B31A272965',35:'FC-B31A272965',36:'FC-B31A272965',37:'FC-86FF7FC2AB'};
export const policy=i=>({mode:'unknown-inventory',target:`axis-courts/items/${i}`,reviewId:targets[i]});
export function material(m){return Object.fromEntries(['name','type','color','emissive','roughness','metalness','opacity','transparent','side','visible','vertexColors','depthTest','depthWrite','colorWrite','polygonOffset','polygonOffsetFactor','polygonOffsetUnits','alphaTest','flatShading','wireframe','map'].map(k=>[k,k==='color'||k==='emissive'?m[k]?.toArray():k==='map'?(m[k]?{name:m[k].name,wrapS:m[k].wrapS,wrapT:m[k].wrapT,colorSpace:m[k].colorSpace,repeat:m[k].repeat.toArray()}:null):m[k]]));}
export function meshRow(m){m.updateMatrixWorld(true);return {attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,normalized:a.normalized,type:a.array.constructor.name,values:[...a.array]}])),index:m.geometry.index?[...m.geometry.index.array]:null,groups:m.geometry.groups,drawRange:{start:m.geometry.drawRange.start,count:String(m.geometry.drawRange.count)},matrix:m.matrixWorld.toArray(),material:material(m.material),castShadow:m.castShadow,receiveShadow:m.receiveShadow,visible:m.visible};}
export const boxRow=b=>({min:b.min.toArray(),max:b.max.toArray()});
export function snapshot(z,frame,offsets,props){frame.updateMatrixWorld(true);const meshes=[];frame.traverse(m=>{if(m.isMesh)meshes.push(m)});const removed=new Set(props.flatMap(p=>p.meshes));const colSet=new Set(props.flatMap(p=>p.colliders));return {allMeshes:meshes.map(meshRow),retainedMeshes:meshes.filter(m=>!removed.has(m)).map(meshRow),colliders:z.kit.colliders.slice(offsets.colliders).map(boxRow),retainedColliders:z.kit.colliders.slice(offsets.colliders).filter(c=>!colSet.has(c)).map(boxRow),walkables:z.kit.walkables.slice(offsets.walkables).map(w=>w.box?({...w,box:boxRow(w.box)}):({...w})),rooms:structuredClone(z.kit.rooms.slice(offsets.rooms)),maps:structuredClone(z.kit.mapItems.slice(offsets.maps)),regions:structuredClone(z.kit.regions.slice(offsets.regions)),props,frame};}
// Warm module-singleton materials consistently. Real fallback texture pixels are checked separately.
for(const K of [BaselineKit,CourtKit]){const k=new K(library());k.furnish(k.frame(0,0),'empty',{x0:0,x1:3,z0:0,z1:3,y:0,doorX:1,h:3});}
export function assemble({candidate=true,indices=[28,29,30,31,34,35,36,37,38,39,40,41],seed=4711,explicit=true,libraryFactory=library}={}){
 const json=structuredClone(axis);if(!explicit)for(const i of Object.keys(targets))delete json.items[i].furnishingPolicy;
 const saved=Math.random;let state=seed>>>0,calls=0;Math.random=()=>{calls++;return ((state=(state*1664525+1013904223)>>>0)/4294967296)};
 try{
 const z=new(candidate?ZoneBase:BaselineZone)(libraryFactory(),json),rows=[],allProps=[];let active=null,lastProp=null;
 const mesh=z.kit.mesh.bind(z.kit),col=z.kit.col.bind(z.kit),furnish=z.kit.furnish.bind(z.kit);
 z.kit.mesh=(...args)=>{const m=mesh(...args);if(active){lastProp={id:`${active.item}/room/${active.roomIndex}/prop/${active.meshes.length}`,mesh:m,colliders:[]};active.meshes.push(m);active.owners.push(lastProp)}return m};
 z.kit.col=(...args)=>{col(...args);if(active){const c=z.kit.colliders.at(-1);active.colliders.push(c);lastProp.colliders.push(c)}};
 let itemIndex=-1,roomIndex=0,props=[];
 z.kit.furnish=(f,kind,room,...rest)=>{const rec={item:itemIndex,roomIndex:roomIndex++,kind,room,meshes:[],colliders:[],owners:[]};active=rec;const result=furnish(f,kind,room,...rest);active=null;rec.cover=result.cover;rec.spawns=result.spawns;props.push(rec);allProps.push(rec);return result};
 for(const i of [8,10])z.gateWidths.set(json.items[i].name,z.buildGate(json.items[i]));
 for(const i of indices){itemIndex=i;roomIndex=0;props=[];const offsets={colliders:z.kit.colliders.length,walkables:z.kit.walkables.length,rooms:z.kit.rooms.length,maps:z.kit.mapItems.length,regions:z.kit.regions.length};z.buildCorridor(json.items[i]);rows.push({index:i,...snapshot(z,z.kit.root.children.at(-1),offsets,props)});}
 // Later non-target room/storage corridor and generic furnished hall in the SAME RNG stream.
 const controls=[];for(const build of [()=>z.kit.corridor(220,180,220,230,'x-'),()=>z.kit.hall({x:180,z:200,w:18,d:12,name:'Unrelated control hall',plaque:false,interior:'hall'})]){itemIndex='control';roomIndex=0;props=[];const offsets={colliders:z.kit.colliders.length,walkables:z.kit.walkables.length,rooms:z.kit.rooms.length,maps:z.kit.mapItems.length,regions:z.kit.regions.length};build();controls.push(snapshot(z,z.kit.root.children.at(-1),offsets,props));}
 const nextRandom=Array.from({length:12},()=>Math.random());return {z,rows,controls,calls,nextRandom,allProps};
 }finally{Math.random=saved;}
}
