import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import './lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from './lib/r48-real-texture-library.mjs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';

for(const [zone,name]of [['east-six','永和宫'],['west-six','太极殿']])test(`${name} nameboard remains readable after real material merging`,()=>{
 const d=JSON.parse(readFileSync(new URL('../data/zones/'+zone+'.json',import.meta.url))),item=d.items.find(i=>i.name===name),lib=realTextureLibrary(),b=new ZoneBase(lib,d);
 try{b.buildHall(item);b.kit.root.updateMatrixWorld(true);const plaque=b.kit.plaques.find(p=>p.text===item.name),m=plaque.mesh;
 const center=m.getWorldPosition(new THREE.Vector3()),h=m.geometry.parameters.height*m.scale.y,w=m.geometry.parameters.width*m.scale.x;
 const finished=b.kit.finish();const group=finished.group??finished;group.updateMatrixWorld(true);
 for(const distance of[4,8,12])for(const side of[-.3,0,.3])for(const row of[-.32,0,.32]){
 const origin=new THREE.Vector3(item.x+side*2,item.ph+1.7,item.z-item.d/2-distance),target=center.clone().add(new THREE.Vector3(side*w,row*h,0)),delta=target.clone().sub(origin);
 const hits=new THREE.Raycaster(origin,delta.clone().normalize(),0,delta.length()+.03).intersectObject(group,true);
 assert.equal(hits[0]?.object.material?.name,'kit_plaques',`distance ${distance}, glyph row ${row}, column ${side}: ${hits[0]?.object.material?.name}`); assert.ok(hits[0].point.distanceTo(target)<.01,'ray must reach this exact glyph position, not another plaque');
 }
 }finally{b.kit.dispose(b.kit.root);lib.dispose();}
});
