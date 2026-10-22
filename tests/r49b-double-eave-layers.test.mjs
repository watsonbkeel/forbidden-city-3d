import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import *as THREE from'three';
import{library}from'./lib/inner-palace-fixture.mjs';import{realTextureLibrary}from'./lib/r48-real-texture-library.mjs';
import{ZoneBase}from'../src/scene/zones/ZoneBase.js';import{PalaceBuilder}from'../src/scene/PalaceBuilder.js';import{PALACE_LAYOUT,getBuildingData}from'../src/scene/Layout.js';
for(const[zone,name]of[['ningshou','皇极殿'],['outer-west','慈宁宫']])test(name+': registered complete frame is in actual double-eave layer',()=>{
 const d=JSON.parse(readFileSync(new URL('../data/zones/'+zone+'.json',import.meta.url))),l=realTextureLibrary(),z=new ZoneBase(l,d);
 try{z.buildHall(d.items.find(i=>i.name===name));const p=z.kit.plaques.find(p=>p.text===name),m=p.frame.userData.hallNameboardMount;
 assert.ok(m,'source-specific actual roof surface mount required');assert.ok(m.localPosition[1]-m.fittedDimensions.height/2>=m.lowerY);assert.ok(m.localPosition[1]+m.fittedDimensions.height/2<=m.upperY);assert.equal(p.mesh.position.y,p.frame.position.y);
 }finally{z.dispose();l.dispose();}
});
for(const name of ['坤宁宫','太和门'])test(name+': final static scene uses confirmed inter-eave layer',()=>{
 const scene=new THREE.Scene(),b=new PalaceBuilder(scene,library());
 if(name==='坤宁宫')b.buildPalaces(PALACE_LAYOUT.filter(i=>['乾清宫','交泰殿','坤宁宫'].includes(i.name)));else b.buildGate(getBuildingData(name));
 const found=[];scene.traverse(m=>{if(m.userData.hallNameboardMount?.name===name)found.push(m)});assert.equal(found.length,1);
 const m=found[0].userData.hallNameboardMount;assert.ok(m.localPosition[1]-m.fittedDimensions.height/2>=m.lowerY-1e-6);assert.ok(m.localPosition[1]+m.fittedDimensions.height/2<=m.upperY+1e-6);
});
