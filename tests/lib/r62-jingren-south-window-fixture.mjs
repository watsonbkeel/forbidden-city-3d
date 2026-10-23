import * as THREE from 'three';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import './inner-palace-fixture.mjs';
import {realTextureLibrary} from './r48-real-texture-library.mjs';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {CollisionManager} from '../../src/utils/Collision.js';
export const hash=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const source=readFileSync(new URL('../fixtures/r62-jingren-south-windows/EastResidentialFacades.baseline.js.txt',import.meta.url),'utf8');
if(hash(source)!=='10685a888adade27cf3dbfca94564567db9d3d56d01eb233bfd09ffb86007406')throw Error('Frozen R61 facade bytes mismatch');
const baselineURL=new URL('../../src/scene/palace/special/EastResidentialFacades.js',import.meta.url);
const {buildEastResidentialFacade}=await import('data:text/javascript;base64,'+Buffer.from(source.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,baselineURL).href}${q}`)).toString('base64'));
const apiURL=new URL('../../src/scene/palace/special/JingrenSouthWindows.js',import.meta.url);
export const api=existsSync(apiURL)?await import(apiURL):{};
export const meshes=root=>{const a=[];root.traverse(o=>{if(o.isMesh)a.push(o);});return a;};
export const targets=f=>meshes(f.frame).filter(m=>m.material===f.kit.lib.material('lattice_doors')&&Math.abs(m.position.z+6.85)<1e-8&&m.rotation.y===0);
export const parts=f=>meshes(f.frame).filter(m=>m.userData.jingrenSouthWindow);
export const physical=kit=>({colliders:kit.colliders,walkables:kit.walkables,rooms:kit.rooms,mapItems:kit.mapItems,regions:kit.regions});
export const row=m=>({p:m.position.toArray(),r:m.rotation.toArray(),s:m.scale.toArray(),material:m.material.name,visible:m.visible,cast:m.castShadow,receive:m.receiveShadow,a:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,v])=>[k,[v.itemSize,...v.array]])),index:m.geometry.index?[...m.geometry.index.array]:null});
export const snapshot=f=>({all:hash(meshes(f.frame).map(row)),retained:hash(meshes(f.frame).filter(m=>!targets(f).includes(m)&&!m.userData.jingrenSouthWindow).map(row)),physics:hash(physical(f.kit)),owned:f.kit.owned.length,meshes:meshes(f.frame).length});
export function fixture(name='景仁宫',candidate=false){const data=JSON.parse(readFileSync(new URL('../../data/zones/east-six.json',import.meta.url))),item=data.items.find(i=>i.kind==='hall'&&i.name===name),lib=realTextureLibrary(),kit=new CourtKit(lib,'east-six'),frame=buildEastResidentialFacade(kit,item).f;kit.buildPlaqueAtlas();frame.updateMatrixWorld(true);const f={kit,lib,item,frame};if(candidate)api.applyJingrenSouthWindows(kit,frame,item);f.cm=new CollisionManager();f.cm.rivers=[];f.cm.addColliders(kit.colliders);f.cm.addWalkables(kit.walkables);return f;}
export function world(f){const scene=new THREE.Scene();f.merged=f.kit.finish();scene.add(f.merged);scene.updateMatrixWorld(true);return{THREE,scene,cm:f.cm};}
export const dispose=f=>{f.kit.dispose(f.merged??f.kit.root);f.lib.dispose();};
