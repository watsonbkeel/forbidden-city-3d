import * as THREE from 'three';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import './inner-palace-fixture.mjs';
import {realTextureLibrary} from './r48-real-texture-library.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
export const hash=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const source=gunzipSync(readFileSync(new URL('../fixtures/r62-jingren-rear-windows/ZoneBase.r61.js.txt.gz',import.meta.url))).toString('utf8');
if(hash(source)!=='509e784a584139e976a929789734446a5a3fb6de0e3b448910d2315285bd9819')throw Error('Frozen R61 ZoneBase bytes mismatch');
const base=new URL('../../src/scene/zones/ZoneBase.js',import.meta.url);
const {ZoneBase}=await import('data:text/javascript;base64,'+Buffer.from(source.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,base).href}${q}`)).toString('base64'));
const apiURL=new URL('../../src/scene/palace/special/JingrenRearWindows.js',import.meta.url);
export const api=existsSync(apiURL)?await import(apiURL):{};
export const meshes=root=>{const a=[];root.traverse(o=>{if(o.isMesh)a.push(o);});return a;};
export const targets=f=>f.frame.children.filter(m=>m.isMesh&&m.material===f.kit.lib.material('lattice_doors')&&Math.abs(m.position.z+4.8)<1e-8&&m.rotation.y===0);
export const parts=f=>meshes(f.frame).filter(m=>m.userData.jingrenRearWindow);
export const physical=kit=>({colliders:kit.colliders,walkables:kit.walkables,rooms:kit.rooms,mapItems:kit.mapItems,regions:kit.regions});
export const row=m=>({p:m.position.toArray(),r:m.rotation.toArray(),s:m.scale.toArray(),material:m.material.name,visible:m.visible,cast:m.castShadow,receive:m.receiveShadow,a:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,v])=>[k,[v.itemSize,...v.array]])),index:m.geometry.index?[...m.geometry.index.array]:null});
export const snapshot=f=>({all:hash(meshes(f.frame).map(row)),retained:hash(meshes(f.frame).filter(m=>!targets(f).includes(m)&&!m.userData.jingrenRearWindow).map(row)),physics:hash(physical(f.kit)),owned:f.kit.owned.length,meshes:meshes(f.frame).length,metadata:hash(f.frame.userData)});
export function fixture(index=3,candidate=false){const data=JSON.parse(readFileSync(new URL('../../data/zones/east-six.json',import.meta.url))),item=data.items[index],lib=realTextureLibrary(),builder=new ZoneBase(lib,data),kit=builder.kit,frame=builder.buildHall(item).f;kit.buildPlaqueAtlas();frame.updateMatrixWorld(true);const f={kit,lib,item,frame};if(candidate)api.applyJingrenRearWindows(kit,frame,item);f.cm=new CollisionManager();f.cm.rivers=[];f.cm.addColliders(kit.colliders);f.cm.addWalkables(kit.walkables);return f;}
export function world(f,merged=true){const scene=new THREE.Scene();if(merged){f.merged=f.kit.finish();scene.add(f.merged);}else scene.add(f.kit.root);scene.updateMatrixWorld(true);return{THREE,scene,cm:f.cm};}
export const dispose=f=>{f.kit.dispose(f.merged??f.kit.root);f.lib.dispose();};
