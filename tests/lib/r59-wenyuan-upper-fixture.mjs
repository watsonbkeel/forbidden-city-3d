import './inner-palace-fixture.mjs';
import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {realTextureLibrary} from './r48-real-texture-library.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
import {buildWenyuanPavilion} from '../../src/scene/palace/special/WenyuanPavilion.js';
import {augmentRemainingHall,resolveRemainingProfile} from '../../src/scene/palace/special/RemainingOuterHalls.js';
import {applySourceGuidedNameboardMount} from '../../src/scene/palace/special/SourceGuidedNameboardMounts.js';
import {applyWenyuanUpperSouthWindows} from '../../src/scene/palace/special/WenyuanUpperSouthWindows.js';
const bytes=readFileSync(new URL('../fixtures/r59-wenyuan-upper/WenyuanPavilion.baseline.js.txt',import.meta.url));
if(createHash('sha256').update(bytes).digest('hex')!=='32c63bf14745eb123d848be7f43779fb0e17732f9741fdf0f70317635ac6b866')throw Error('Corrupted frozen Wenyuan baseline fixture');
const baseURL=new URL('../../src/scene/palace/special/WenyuanPavilion.js',import.meta.url),source=bytes.toString().replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,baseURL).href}${q}`),base=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
export const item=JSON.parse(readFileSync(new URL('../../data/zones/outer-east.json',import.meta.url))).items.find(i=>i.name==='文渊阁');
export const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export const meshes=root=>{const a=[];root.traverse(m=>{if(m.isMesh)a.push(m)});return a;};
export const row=m=>({position:m.position.toArray(),quaternion:m.quaternion.toArray(),scale:m.scale.toArray(),material:m.material.name,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[a.itemSize,...a.array]])),index:m.geometry.index?Array.from(m.geometry.index.array):null});
export function fixture({candidate=true,augment=true,production=false,library=null}={}){const lib=library??realTextureLibrary(),kit=new CourtKit(lib,'outer-east'),b=(production?buildWenyuanPavilion:base.buildWenyuanPavilion)(kit,item);if(candidate&&!production&&!applyWenyuanUpperSouthWindows(kit,b.f,item))throw Error('Wenyuan helper not applied');const built=augment?augmentRemainingHall(kit,item,b,resolveRemainingProfile('outer-east',item)):b;if(augment)applySourceGuidedNameboardMount(kit,'outer-east',item,built);kit.buildPlaqueAtlas();kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);return{kit,lib,frame:built.f,g:built.g,item,cm};}
export const parts=f=>meshes(f.frame).filter(m=>m.userData.wenyuanUpperSouthWindow);
export const dispose=f=>{f.kit.dispose(f.merged??f.kit.root);f.lib.dispose();};
export function ray(f,p,d=[0,0,1],far=2,root=f.frame){root.updateMatrixWorld(true);const v=f.frame.localToWorld(new THREE.Vector3(...p));return new THREE.Raycaster(v,new THREE.Vector3(...d),0,far).intersectObject(root,true);}
