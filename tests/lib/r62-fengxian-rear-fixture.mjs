import './inner-palace-fixture.mjs';
import * as THREE from 'three';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {realTextureLibrary} from './r48-real-texture-library.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
export const originalItem=Object.freeze({kind:'hall',x:-182.5,z:283.4,w:51.6,d:20,pad:1,ph:.9,colH:7.36,roof:'wudian',map:'hall'});
export const actualItem=JSON.parse(readFileSync(new URL('../../data/zones/east-six.json',import.meta.url))).items[54];
const profileURL=new URL('../../src/scene/palace/special/FengxianRearProfile.js',import.meta.url);
export const api=existsSync(profileURL)?await import(profileURL):{};
export const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const meshes=root=>{const a=[];root.traverse(m=>{if(m.isMesh)a.push(m);});return a;};
export const rows=root=>meshes(root).map(m=>({type:m.geometry.type,position:m.position.toArray(),rotation:m.rotation.toArray(),scale:m.scale.toArray(),material:m.material.name,a:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,v])=>[k,[v.itemSize,...v.array]])),index:m.geometry.index?[...m.geometry.index.array]:null}));
export const columns=f=>f.frame.children.filter(m=>m.isMesh&&m.geometry.type==='CylinderGeometry'&&m.material.name==='wood_column_material');
export function dependent(m){return m.material?.name==='wood_column_material'||m.material?.name==='lattice_doors_material'||m.isMesh&&m.position.z < -11;}
export const nav=kit=>({colliders:kit.colliders,walkables:kit.walkables,rooms:kit.rooms,mapItems:kit.mapItems,regions:kit.regions});
export function fixture(candidate=true){
 const lib=realTextureLibrary(),kit=new CourtKit(lib,'east-six');
 // This baseline directly calls the untouched production CourtKit.hall, never
 // ZoneBase or a patched profile, so the owner's later hook cannot pollute it.
 const built=candidate&&api.buildFengxianRearHall?api.buildFengxianRearHall(kit,{...originalItem},54):kit.hall({...originalItem});
 kit.buildPlaqueAtlas();kit.root.updateMatrixWorld(true);
 const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);
 return {lib,kit,frame:built.f,built,cm,THREE,dispose(){kit.dispose(this.merged??kit.root);lib.dispose();}};
}
export function triangles(m){const p=m.geometry.attributes.position,idx=m.geometry.index;const out=[];for(let i=0;i<(idx?.count??p.count);i+=3)out.push([0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+j):i+j)));return out;}
