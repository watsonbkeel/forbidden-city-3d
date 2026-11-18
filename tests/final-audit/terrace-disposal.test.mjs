import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';import {createCanvas} from '@napi-rs/canvas';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';import {PALACE_LAYOUT} from '../../src/scene/Layout.js';import {CollisionManager} from '../../src/utils/Collision.js';import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';import {installCpuDocument} from '../lib/finished-world-lifecycle.mjs';
test('actual complete three-hall lifecycle retires Baohe and terrace metadata, owned geometry, keeps library material and rebuilds once',()=>{
 const platform=installCpuDocument(createCanvas);
 try{for(let cycle=0;cycle<2;cycle++){
  const scene=new T.Scene(),lib=realTextureLibrary(),b=new PalaceBuilder(scene,lib),cm=new CollisionManager();
  try{
   b.buildComplex(PALACE_LAYOUT.filter(h=>['太和殿','中和殿','保和殿'].includes(h.name)),{name:'三台',apron:14,margin:4,bottom:{halfW:65,z0:-54,z1:178}});
   assert.equal(b.baoheNorthTiers.length,3);assert.equal(b.terraceProfiles.length,1);assert.equal(b.walkables.filter(w=>w.type==='ramp'&&w.axis==='x'&&w.minZ===55.95&&w.maxZ===60.05).length,6);
   const geos=new Set(),mats=new Set();scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);for(const m of o.material?[o.material].flat():[])mats.add(m)});const counts=new Map([...geos,...mats].map(r=>[r,0]));for(const [r]of counts)r.addEventListener('dispose',()=>counts.set(r,counts.get(r)+1));const owned=new Set(b.ownedMaterials),borrowed=[...mats].filter(m=>lib.owns(m));assert.ok(borrowed.length>0);assert.ok([...owned].every(m=>!lib.owns(m)),'actual ownership is disjoint');
   cm.addColliders(b.colliders,'terrace');cm.addWalkables(b.walkables,'terrace');cm.removeByTag('terrace');b.dispose();
   assert.equal(b.baoheNorthTiers.length,0,'disposed Baohe profile must not remain live metadata');
   for(const a of[b.terraceProfiles,b.taiheSouthTiers,b.colliders,b.walkables,scene.children,cm.colliders,cm.walkables])assert.equal(a.length,0);
   assert.ok([...geos].every(g=>counts.get(g)===1));assert.ok([...mats].filter(m=>owned.has(m)).every(m=>counts.get(m)===1));assert.ok(borrowed.every(m=>counts.get(m)===0));b.dispose();assert.ok([...geos].every(g=>counts.get(g)===1));
  }finally{b.dispose();lib.dispose();}
 }}finally{platform.restore();}
});
