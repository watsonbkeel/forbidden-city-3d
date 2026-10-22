import * as THREE from 'three';
import {createHash} from 'node:crypto';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {library} from './inner-palace-fixture.mjs';
export const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
export function hallFragment(name = '交泰殿') {
  const builder = new PalaceBuilder(new THREE.Scene(), library()), group = new THREE.Group();
  const data = structuredClone(PALACE_LAYOUT.find(h => h.name === name));
  builder.buildHall(group, data, 2.16); group.updateMatrixWorld(true);
  return {builder,group,data,shell:group.getObjectByName(`${name}·现状结构`)};
}
export function meshRows(group) {
  group.updateMatrixWorld(true); const rows = [];
  group.traverse(m => { if (!m.isMesh) return;
    rows.push({name:m.name, displayId:m.userData.jiaotaiDisplayId ?? null,
      hash:hash({matrix:m.matrixWorld.toArray(),geometry:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a]) => [k,{itemSize:a.itemSize,values:Array.from(a.array)}])),index:m.geometry.index ? Array.from(m.geometry.index.array) : null,
        material:{name:m.material.name,color:m.material.color?.getHex(),roughness:m.material.roughness,metalness:m.material.metalness,side:m.material.side,map:m.material.map?{width:m.material.map.image.width,height:m.material.map.image.height}:null},castShadow:m.castShadow,receiveShadow:m.receiveShadow})});
  }); return rows;
}
export function oldDisplay(builder) {
  const g = new THREE.Group();
  builder.throneArea(g,{x0:0,y:2.16,H:6.2,ztb0:355.3,ztb1:360.5,thW:4.56,bayW:19/3,text:null,caisson:false,jiaotai:true});
  return g;
}
export function rearPalaceFragment() {
  const scene = new THREE.Scene(), builder = new PalaceBuilder(scene,library());
  builder.buildComplex(PALACE_LAYOUT.filter(h => ['乾清宫','交泰殿','坤宁宫'].includes(h.name)),{name:'后三宫',apron:6,margin:4});
  scene.updateMatrixWorld(true); return {scene,builder};
}
// Geometry-only checkpoint: the later palette checkpoint may not move a vertex,
// normal, UV, index, mesh transform or physical registration.
export function geometrySignature(group) {
  group.updateMatrixWorld(true);const rows=[];
  group.traverse(m=>{if(m.isMesh)rows.push({name:m.name,matrix:m.matrixWorld.toArray(),attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,values:Array.from(a.array)}])),index:m.geometry.index?Array.from(m.geometry.index.array):null});});
  return hash(rows);
}
