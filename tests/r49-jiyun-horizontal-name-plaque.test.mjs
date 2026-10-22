import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import './lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from './lib/r48-real-texture-library.mjs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {hallSignature} from './lib/r40-hall-signature.mjs';
const zoneData=JSON.parse(fs.readFileSync(new URL('../data/zones/outer-west.json',import.meta.url))),item=zoneData.items.find(i=>i.name==='吉云楼'&&i.kind==='hall');
function build(){const lib=realTextureLibrary(),zone=new ZoneBase(lib,{id:'outer-west',items:[item]});zone.buildHall(item);return{lib,zone,kit:zone.kit,frame:zone.kit.root.children[0]};}
test('R49 Jiyun official upper front-eave horizontal plaque exists, preserves the old building and is visible after production finish',()=>{
 const W=build();let merged,disposedKit=false;
 try{
  const p=W.frame.getObjectByName('jiyun-upper-front-name-plaque');assert.ok(p,'official Jiyun photograph proves this dedicated builder omission');
  const d=p.userData.namePlaque;assert.equal(d.text,'吉雲樓');assert.equal(d.layout,'horizontal');assert.equal(d.hanReadingOrder,'right-to-left');assert.equal(d.omittedScript.script,'Manchu');assert.equal(d.mount.kind,'upper-floor-front-colonnade-beam');
  p.removeFromParent();const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/r49-jiyun-preplaque.json',import.meta.url)));assert.deepEqual(hallSignature(W.kit),{geometry:baseline.geometry,navigation:baseline.navigation},'nameboard is the only geometry delta, with every collider/walkable/room/map record unchanged');W.frame.add(p);
  const points=[[0,1.7,-14],[0,1.7,-26],[5,1.7,-26],[-5,1.7,-26]].map(a=>W.frame.localToWorld(new THREE.Vector3(...a)));
  const lifetimes=new Map();for(const asset of [p.geometry,...new Set(p.material)]){lifetimes.set(asset,0);asset.addEventListener('dispose',()=>lifetimes.set(asset,lifetimes.get(asset)+1));}
  for(const material of new Set(p.material))assert.ok(W.kit.owned.includes(material),'each material-array slot is kit-owned');
  merged=W.kit.finish();merged.updateMatrixWorld(true);assert.ok(merged.getObjectByName(p.name)===p);
  for(const count of lifetimes.values())assert.equal(count,0,'noMerge board and its materials must remain live through finish');
  for(const from of points)for(const x of[-.62,0,.62]){
   const target=p.localToWorld(new THREE.Vector3(x,0,.05)),delta=target.sub(from),h=new THREE.Raycaster(from,delta.clone().normalize(),0,delta.length()+.01).intersectObject(merged,true)[0];
   assert.ok(h?.object===p,`Jiyun Han position ${x} blocked by ${h?.object.name}`);assert.equal(h.face.materialIndex,4);
  }
  let disposed=0;p.material[4].map.addEventListener('dispose',()=>disposed++);W.kit.dispose(merged);disposedKit=true;assert.equal(disposed,1,'owned plaque texture disposes exactly once');for(const count of lifetimes.values())assert.equal(count,1,'retained board geometry and each unique owned material dispose exactly once');
 }finally{if(!disposedKit)W.kit.dispose(merged??W.kit.root);W.lib.dispose();}
});
