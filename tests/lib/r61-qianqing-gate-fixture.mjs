import './inner-palace-fixture.mjs';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {realTextureLibrary} from './r48-real-texture-library.mjs';
import {buildQianqingGate} from '../../src/scene/palace/special/QianqingGate.js';
export const hash=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const raw=fs.readFileSync(new URL('../fixtures/r61-d/qianqing-gate-r60.js.txt',import.meta.url),'utf8');
const frozenHash='81a0b40ce40f0a635977bd112c2ad107ad9095214ae07b566d95dd6695ebe7b3';
if(hash(raw)!==frozenHash)throw Error('R60 gate fixture bytes changed');
const origin=new URL('../../src/scene/palace/special/QianqingGate.js',import.meta.url);
const resolved=raw.replace("from 'three'",`from '${import.meta.resolve('three')}'`).replace(/from '(\.[^']+)'/g,(_,s)=>`from '${new URL(s,origin).href}'`);
export const baselineGate=(await import('data:text/javascript;base64,'+Buffer.from(resolved).toString('base64'))).buildQianqingGate;
export function gateFixture(fn=buildQianqingGate){const lib=realTextureLibrary(),builder=new PalaceBuilder(new THREE.Scene(),lib),data=PALACE_LAYOUT.find(x=>x.name==='乾清门'),root=fn(builder,data);root.updateMatrixWorld(true);return{lib,builder,data,root,dispose(){builder.dispose();lib.dispose();}};}
export function triangleRows(f){const rows=[];f.root.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,a=g.attributes,p=a.position,ix=g.index;for(let i=0;i<(ix?.count??p.count);i+=3){const js=[0,1,2].map(j=>ix?ix.getX(i+j):i+j),source=m.userData.solidMaterialBatch?.sources.find(r=>i/3>=r.firstTriangle&&i/3<r.firstTriangle+r.triangleCount),material=Array.isArray(m.material)?m.material[g.groups.find(r=>i>=r.start&&i<r.start+r.count).materialIndex]:m.material;const local=js.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld).sub(new THREE.Vector3(f.data.position.x,0,f.data.position.z)).toArray());rows.push({material:source?.materialName??material.name,v:local,attributes:Object.fromEntries(Object.entries(a).map(([key,attr])=>[key,js.map(j=>Array.from(attr.array.subarray(j*attr.itemSize,(j+1)*attr.itemSize)))]))});}});return rows;}
export function retainedRows(f){const bay=f.data.dimensions.width/5,ww=bay-2*Math.min(.5,bay*.06),z=-f.data.dimensions.depth/2;return triangleRows(f).filter(r=>![-2*bay,2*bay].some(cx=>r.v.every(([x,y,zz])=>Math.abs(x-cx)<=ww/2+.051&&y>=2.549999&&y<=6.600001&&zz>=z-.251&&zz<=z-.039))).map(r=>JSON.stringify(r)).sort();}
export function nav(f){return JSON.parse(JSON.stringify({colliders:f.builder.colliders,walkables:f.builder.walkables}));}
