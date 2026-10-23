import * as THREE from 'three';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import './inner-palace-fixture.mjs';
import {realTextureLibrary} from './r48-real-texture-library.mjs';
import {CourtKit} from '../../src/scene/palace/kit.js';
const baselineURL=new URL('../../src/scene/palace/special/SouthCourtGates.js',import.meta.url);
export const baselineHead='2b983ae82e50e23fd55bbe0845942a0a3855f8dd';
const baselineBytes=readFileSync(new URL('../fixtures/r59-wenhua-gate-window/SouthCourtGates.baseline.js.txt',import.meta.url));
const baselineSHA256='10bc98e9b77ab2ab16b8bac8a2bc5881b01761d023e0c3b56a52e4ef5f185f5a';
if(createHash('sha256').update(baselineBytes).digest('hex')!==baselineSHA256)throw Error('Wenhua gate baseline fixture SHA-256 mismatch');
const baselineSource=baselineBytes.toString('utf8').replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,baselineURL).href}${q}`);
const {buildSouthCourtGate}=await import('data:text/javascript;base64,'+Buffer.from(baselineSource).toString('base64'));
// SHA-checked, vendored original bytes require no historical Git object.
// Immutable original builder prevents the eventual integration hook from
// silently contaminating the before case. Candidate adds the real helper once.
import {CollisionManager} from '../../src/utils/Collision.js';
export const sourceURL=new URL('../../src/scene/palace/special/WenhuaGateSouthWindows.js',import.meta.url);
export const api=existsSync(sourceURL)?await import(sourceURL):{};
export const hash=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
export const meshes=root=>{const out=[];root.traverse(m=>{if(m.isMesh)out.push(m);});return out;};
export const target=f=>f.frame.children.find(m=>m.isMesh&&Math.abs(m.position.x+13.24)<1e-8&&Math.abs(m.position.y-4.05)<1e-8&&m.position.z===0);
export const parts=f=>meshes(f.frame).filter(m=>m.userData.wenhuaGateSouthWindow);
export const physical=kit=>({colliders:kit.colliders,walkables:kit.walkables,rooms:kit.rooms,mapItems:kit.mapItems,regions:kit.regions});
export function fixture(profile='wenhua',candidate=false){
 const zone=profile==='wenhua'?'outer-east':'outer-west',data=JSON.parse(readFileSync(new URL(`../../data/zones/${zone}.json`,import.meta.url))),item=data.items.find(i=>i.southGateProfile===profile),lib=realTextureLibrary(),kit=new CourtKit(lib,zone),built=buildSouthCourtGate(kit,item);
 const f={kit,lib,frame:built.f,g:built.g,item};if(candidate){if(typeof api.applyWenhuaGateSouthWindows!=='function')throw Error('Missing helper');api.applyWenhuaGateSouthWindows(kit,f.frame);}
 kit.buildPlaqueAtlas();f.frame.updateMatrixWorld(true);f.cm=new CollisionManager();f.cm.rivers=[];f.cm.addColliders(kit.colliders);f.cm.addWalkables(kit.walkables);return f;
}
export function triangles(m,filter=()=>true){const g=m.geometry,a=g.attributes,ix=g.index,out=[];for(let i=0;i<(ix?.count??a.position.count);i+=3){const ids=[0,1,2].map(k=>ix?ix.getX(i+k):i+k);if(filter(ids,a))out.push(ids.map(k=>Object.fromEntries(Object.entries(a).map(([n,v])=>[n,Array.from(v.array.subarray(k*v.itemSize,(k+1)*v.itemSize))]))));}return out;}
export const row=m=>({position:m.position.toArray(),rotation:m.rotation.toArray(),scale:m.scale.toArray(),material:m.material.name,castShadow:m.castShadow,receiveShadow:m.receiveShadow,visible:m.visible,triangles:triangles(m)});
export const snapshot=f=>({all:hash(meshes(f.frame).map(row)),nonTarget:hash(meshes(f.frame).filter(m=>m!==target(f)&&!m.userData.wenhuaGateSouthWindow).map(row)),otherFiveFaces:hash(triangles(target(f),(ids,a)=>!ids.every(k=>a.normal.getZ(k)<-.999))),physics:hash(physical(f.kit)),parts:parts(f).length,meshes:meshes(f.frame).length,triangles:meshes(f.frame).reduce((n,m)=>n+triangles(m).length,0)});
export function ray(f,p,d=[0,0,1],far=5,root=f.frame){root.updateMatrixWorld(true);const point=f.frame.localToWorld(new THREE.Vector3(...p));return new THREE.Raycaster(point,new THREE.Vector3(...d),0,far).intersectObject(root,true);}
export const dispose=f=>{f.kit.dispose(f.merged??f.kit.root);f.lib.dispose();};
