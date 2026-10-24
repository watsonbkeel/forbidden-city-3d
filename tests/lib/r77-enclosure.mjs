import * as THREE from 'three';
import {Enclosure} from '../../src/scene/Enclosure.js';
import {meshRecord} from './r76-hall-snapshot.mjs';
export function enclosureFixture(){const mats=new Map(),library={material:(name,params={})=>{const k=name+JSON.stringify(params);if(!mats.has(k))mats.set(k,new THREE.MeshStandardMaterial({name,...params}));return mats.get(k);},tileSize:()=>2,aspect:()=>1};const en=new Enclosure(new THREE.Scene(),library),group=new THREE.Group();en.buildOuterWalls(group);group.updateMatrixWorld(true);return{en,group,dispose(){group.traverse(o=>o.geometry?.dispose());for(const m of mats.values())m.dispose();}};}
export function record(f){const meshes=[];f.group.traverse(o=>{if(o.isMesh)meshes.push(meshRecord(o));});return JSON.parse(JSON.stringify({meshes,colliders:f.en.colliders,lines:f.en.wallLines(),spec:f.en.wallSpec()}));}
export function crenels(f){return f.group.children.filter(o=>o.isMesh&&o.geometry.parameters?.height===1.2);}
