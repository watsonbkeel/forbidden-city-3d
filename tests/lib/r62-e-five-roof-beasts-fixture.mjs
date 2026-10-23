import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {buildEastResidentialFacade} from '../../src/scene/palace/special/EastResidentialFacades.js';
import {applySourceGuidedNameboardMount} from '../../src/scene/palace/special/SourceGuidedNameboardMounts.js';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {library} from './inner-palace-fixture.mjs';
import {hallSignature} from './r40-hall-signature.mjs';
export {hallSignature};
export const config=JSON.parse(readFileSync(new URL('../../data/zones/east-six.json',import.meta.url)));
export const targets=[2,16];
export function fixture(index){const zone=new ZoneBase(library(),config),item=structuredClone(config.items[index]),built=targets.includes(index)?applySourceGuidedNameboardMount(zone.kit,config.id,item,buildEastResidentialFacade(zone.kit,item)):zone.buildHall(item);return{zone,kit:zone.kit,item,built,roof:built.f.children.find(o=>o.name==='roof_xieshan')};}
export function triangles(root){const rows=[];root.updateMatrixWorld(true);root.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,idx=m.geometry.index;for(let i=0;i<(idx?.count??p.count);i+=3)rows.push(new THREE.Triangle(...[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,idx?.getX(i+k)??i+k).applyMatrix4(m.matrixWorld))));});return rows;}
export function containsVertex(rows,point,epsilon=4e-5){const p=new THREE.Vector3().fromArray(point);return rows.some(t=>[t.a,t.b,t.c].some(v=>v.distanceTo(p)<epsilon));}
