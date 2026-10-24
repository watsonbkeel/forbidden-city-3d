import * as THREE from 'three';
import {existsSync, readFileSync} from 'node:fs';
import {loadTongdaoZoneBase} from './r63-tongdao-hookup-loader.mjs';
const {ZoneBase}=await loadTongdaoZoneBase();
import {library, hash, serial} from './inner-palace-fixture.mjs';
import {signature as nonNullSignature} from './r58-hall-beast-fixture.mjs';
const unsetMaterial=new THREE.MeshBasicMaterial({name:'UNASSIGNED_PLAQUE_ATLAS'});
export function signature(root){const missing=[];root.traverse(m=>{if(m.isMesh&&!m.material){missing.push(m);m.material=unsetMaterial;}});try{return nonNullSignature(root);}finally{missing.forEach(m=>m.material=null);}}
export {hash};
const url=new URL('../../src/scene/palace/special/TongdaoRoof.js',import.meta.url);
export const api=existsSync(url)?await import(url):{applyTongdaoRoof:(_k,_z,_i,_item,built)=>built};
export const config=JSON.parse(readFileSync(new URL('../../data/zones/west-six.json',import.meta.url)));
// Scope-only fixtures call the real baseline builder so later facade work in
// buildHall cannot contaminate the frozen roof-only lower-mesh preservation test.
// The separate hookup test calls buildHall, and the W consumer disables nothing.
export function fixture(index=47){const cfg=structuredClone(config),zone=new ZoneBase(library(),cfg),item=cfg.items[index],built=zone.buildHallBaseline(item);return{zone,kit:zone.kit,item,index,built,roof:built.f.children.find(o=>o.name.startsWith('roof_'))};}
export const apply=f=>api.applyTongdaoRoof(f.kit,'west-six',f.index,f.item,f.built);
export function physics(f){return hash({colliders:f.kit.colliders.map(serial),walkables:f.kit.walkables,rooms:f.kit.rooms,map:f.kit.mapItems,regions:f.kit.regions});}
export function retained(f){const roof=f.built.f.children.find(o=>o.name.startsWith('roof_')),index=f.built.f.children.indexOf(roof);f.built.f.remove(roof);const r=signature(f.built.f);f.built.f.add(roof);f.built.f.children.splice(f.built.f.children.indexOf(roof),1);f.built.f.children.splice(index,0,roof);return r;}
export function world(f,{merge=true}={}){const scene=new THREE.Scene();f.merged=merge?f.kit.finish():f.kit.root;scene.add(f.merged);return{scene,cm:{colliders:f.kit.colliders,walkables:f.kit.walkables},rooms:f.kit.rooms};}
export function triangles(root){const a=[];root.updateMatrixWorld(true);root.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3)a.push(new THREE.Triangle(...[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld))));});return a;}
export const dispose=f=>f.kit.dispose(f.merged??f.kit.root);
