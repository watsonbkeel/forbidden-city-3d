import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import './lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from './lib/r48-real-texture-library.mjs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {inscriptionRetention} from './lib/r49-sourced-inscription-retention.mjs';
const baseline=JSON.parse(readFileSync(new URL('./fixtures/r49-sourced-inscription-baseline.json',import.meta.url)));
const source={hongyi:'https://img.dpm.org.cn/Uploads/Picture/dc/1980%5B1024%5D.jpg',baoyun:'https://img.dpm.org.cn/Uploads/image/2024/12/30/1-yrWtXOlSB260.jpg'};
function build(zone,name){const d=JSON.parse(readFileSync(new URL(`../data/zones/${zone}.json`,import.meta.url))),lib=realTextureLibrary(),z=new ZoneBase(lib,d),b=z.buildHall(d.items.find(i=>i.name===name));return{lib,z,b,dispose(){z.kit.dispose(z.kit.root);lib.dispose();}};}
function find(root,role){const found=[];root.traverse(m=>{if(m.userData.role===role)found.push(m)});assert.equal(found.length,1,`one ${role} required`);return found[0];}
function visible(root,mesh,frame,origins,rows){mesh.updateWorldMatrix(true,false);root.updateMatrixWorld(true);const targets=rows.map(y=>mesh.localToWorld(new THREE.Vector3(0,y,0)));for(const xyz of origins){const origin=frame.localToWorld(new THREE.Vector3(...xyz));for(const target of targets){const delta=target.clone().sub(origin),first=new THREE.Raycaster(origin,delta.clone().normalize(),0,delta.length()+.03).intersectObject(root,true)[0];assert.equal(first?.object.material,mesh.material,`lettered surface hidden by ${first?.object.material?.name} from ${xyz} toward ${target.toArray()}`);assert.ok(first.point.distanceTo(target)<.01);}}}

test('Hongyi official front plaque is present over its lower central door and visible after real finish',()=>{
 const w=build('axis-courts','弘义阁');try{const m=find(w.b.f,'hongyi-lower-front-nameboard');assert.equal(m.userData.text,'弘義閣');assert.equal(m.userData.source,source.hongyi);assert.match(m.userData.textStatus,/SYSTEM_FONT/);assert.equal(m.position.x,0);assert.ok(m.position.y<10.085&&m.position.y>8.5);assert.equal(w.z.kit.plaques.length,1);assert.equal(w.z.kit.plaques[0].text,'弘義閣');
 const frame=w.b.f,front=w.b.geometry.lower.front,root=w.z.kit.finish();assert.equal(m.material.name,'kit_plaques');assert.ok(m.material.map?.isCanvasTexture);assert.equal(m.material.map.colorSpace,THREE.SRGBColorSpace);visible(root,m,frame,[[0,5.5,front-6],[0,1.7,front-20],[0,1.7,front-36]],[-.45,0,.45]);
 }finally{w.dispose();}
});
test('Baoyun gets only traditional vertical lettering inside its retained pale stone and green frame',()=>{
 const w=build('outer-west','宝蕴楼');try{const m=find(w.b.f,'baoyun-sourced-stone-name-inscription'),panel=find(w.b.f,'baoyun-central-inscription-panel-untextured');assert.equal(m.userData.text,'寶蘊樓');assert.equal(m.userData.source,source.baoyun);assert.equal(m.userData.layout,'vertical');assert.match(m.userData.textStatus,/SYSTEM_FONT/);assert.equal(w.z.kit.plaques.length,0,'must not add a generic gold-frame palace plaque');assert.equal(panel.material.name,'baoyun_pale_stone');assert.equal(panel.material.color.getHex(),0xd8d1b7);assert.equal(m.material.color.getHex(),panel.material.color.getHex());assert.ok(m.material.map?.isCanvasTexture);
 const borders=w.b.f.children.filter(n=>n.userData.role==='baoyun-photo-green-inscription-frame');assert.equal(borders.length,4);assert.ok(borders.every(n=>n.material.name==='baoyun_green_gutter'));assert.equal(m.geometry.parameters.width,.68);assert.equal(m.geometry.parameters.height,1.42);assert.ok(m.position.z<panel.position.z-.02&&m.position.z>7.7,'thin face must be in front of stone but behind green frame front');
 const frame=w.b.f;frame.updateMatrixWorld(true);const borderTargets=borders.map(n=>n.localToWorld(new THREE.Vector3(0,0,-.0125)));const root=w.z.kit.finish();visible(root,m,frame,[[0,1.7,-4],[0,1.7,-14],[0,1.7,-24]],[-.45,0,.45]);
 for(const target of borderTargets){const origin=target.clone().add(new THREE.Vector3(0,0,-1)),hit=new THREE.Raycaster(origin,new THREE.Vector3(0,0,1),0,1.02).intersectObject(root,true)[0];assert.equal(hit?.object.material,borders[0].material,'all four original green border faces remain visible');assert.ok(hit.point.distanceTo(target)<.01);}
 }finally{w.dispose();}
});
for(const[zone,name]of[['axis-courts','弘义阁'],['outer-west','宝蕴楼']])test(`${name}: all retained geometry, materials, collision, routes and map positions remain exact`,()=>{const w=build(zone,name);try{w.z.kit.buildPlaqueAtlas();assert.deepEqual(inscriptionRetention(w.z.kit),baseline[name]);}finally{w.dispose();}});
