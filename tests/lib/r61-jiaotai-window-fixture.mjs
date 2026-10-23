import './inner-palace-fixture.mjs';
import fs from 'node:fs';import {createHash}from'node:crypto';import * as THREE from'three';
import {PalaceBuilder}from'../../src/scene/PalaceBuilder.js';import{PALACE_LAYOUT}from'../../src/scene/Layout.js';import{library}from'./inner-palace-fixture.mjs';import{buildSquareHall}from'../../src/scene/palace/special/SquareHalls.js';
export const hash=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const raw=fs.readFileSync(new URL('../fixtures/r61-d/square-halls-91c6770.js.txt',import.meta.url),'utf8'),origin=new URL('../../src/scene/palace/special/SquareHalls.js',import.meta.url);
export const frozenSourceHash=hash(raw);
const resolved=raw.replace("from 'three'",`from '${import.meta.resolve('three')}'`).replace(/from '(\.[^']+)'/g,(_,s)=>`from '${new URL(s,origin).href}'`);
export const oldBuild=(await import('data:text/javascript;base64,'+Buffer.from(resolved).toString('base64'))).buildSquareHall;
export function fixture(fn=buildSquareHall,name='交泰殿'){const lib=library(),builder=new PalaceBuilder(new THREE.Scene(),lib),group=new THREE.Group(),data=structuredClone(PALACE_LAYOUT.find(h=>h.name===name)),shell=fn(builder,group,data,2.16);group.updateMatrixWorld(true);return{lib,builder,group,shell,data,dispose(){builder.dispose();}};}
export function rows(group,filter=()=>true){const result=[];group.updateMatrixWorld(true);group.traverse(m=>{if(!m.isMesh||!filter(m))return;const a=m.geometry.attributes,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.position.count);i+=3){const ids=[0,1,2].map(j=>ix?ix.getX(i+j):i+j);result.push({name:m.name,material:m.material.name,matrix:m.matrixWorld.toArray(),attributes:Object.fromEntries(Object.entries(a).map(([k,v])=>[k,ids.map(j=>Array.from(v.array.subarray(j*v.itemSize,(j+1)*v.itemSize)))]))});}});return result;}
export const nav=f=>JSON.parse(JSON.stringify({colliders:f.builder.colliders,walkables:f.builder.walkables,portals:f.shell.userData.structure.portals}));
