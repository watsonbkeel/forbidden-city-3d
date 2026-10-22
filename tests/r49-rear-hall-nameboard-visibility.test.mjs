import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import*as THREE from'three';
import'./lib/inner-palace-fixture.mjs';import{realTextureLibrary}from'./lib/r48-real-texture-library.mjs';import{ZoneBase}from'../src/scene/zones/ZoneBase.js';
for(const[zone,court,name]of[['outer-east','wenhua','主敬殿'],['outer-west','wuying','敬思殿']])test(`${name}: approach through actual front hall and connector sees all three glyph zones`,()=>{
 const d=JSON.parse(readFileSync(new URL('../data/zones/'+zone+'.json',import.meta.url))),lib=realTextureLibrary(),b=new ZoneBase(lib,d);
 try{for(const item of d.items.filter(i=>i.southCourtProfile?.startsWith(court+'-')))b.buildHall(item);
 b.kit.root.updateMatrixWorld(true);const p=b.kit.plaques.find(p=>p.text===name),center=p.mesh.getWorldPosition(new THREE.Vector3()),h=p.mesh.geometry.parameters.height;
 const group=b.kit.finish();group.updateMatrixWorld(true);
 for(const distance of[1,6,10])for(const dx of[-.25,0,.25])for(const row of[-.32,0,.32]){
 const o=new THREE.Vector3(center.x+dx,2.9,center.z-distance),target=center.clone().add(new THREE.Vector3(dx*.4,row*h,0)),delta=target.clone().sub(o);
 const hit=new THREE.Raycaster(o,delta.clone().normalize(),0,delta.length()+.025).intersectObject(group,true)[0];
 assert.equal(hit?.object.material?.name,'kit_plaques',`${name} distance ${distance}, row ${row}, side ${dx}: ${hit?.object.material?.name}`); assert.ok(hit.point.distanceTo(target)<.01,'ray must reach the intended rear-hall glyph, not a nearer nameboard');
 }
 }finally{b.kit.dispose(b.kit.root);lib.dispose();}
});
