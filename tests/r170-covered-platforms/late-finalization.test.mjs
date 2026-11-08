import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanvas} from '@napi-rs/canvas';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import * as halls from '../../src/scene/palace/special/RemainingNingshouHalls.js';
import {buildQingshouRaisedWalk} from '../../src/scene/palace/special/QingshouRaisedWalk.js';
import {buildXuhuiGallery} from '../../src/scene/palace/special/XuhuiGallery.js';
import {removeCoveredPlatformSurface} from '../../src/render/CoveredPlatformSurface.js';
import {physical,upward} from './fixture.mjs';
const zone=JSON.parse(fs.readFileSync('data/zones/ningshou.json'));
function fixture(names){
 const prior=globalThis.document;globalThis.document={createElement:()=>createCanvas(1,1),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
 const lib=realTextureLibrary(),kit=new CourtKit(lib,'ningshou');
 try{const pairs=names.map(name=>{const item=zone.items.find(i=>i.name===name),built=halls.buildRemainingHall(kit,item,halls.resolveRemainingProfile('ningshou',item));
  return{base:built.f.children.find(m=>m.userData.role==='platform-base'),cover:built.f.children.find(m=>m.userData.role==='platform-paving'),height:built.g.ph};});
  return{kit,pairs,dispose(){kit.dispose(kit.root);lib.dispose();globalThis.document=prior;}};
 }catch(e){kit.dispose(kit.root);lib.dispose();globalThis.document=prior;throw e;}
}
for(const [name,names,hook] of [['Qingshou',['寻沿书屋','庆寿堂'],buildQingshouRaisedWalk],['Xuhui',['禊赏亭'],buildXuhuiGallery]]){
 test(name+': real original source hook runs before the render-only finalizer',()=>{const f=fixture(names);try{
  for(const {base} of f.pairs){assert.equal(base.geometry.attributes.position.count,24,'original source box must remain intact until final merge');assert.equal(base.geometry.index.count,36);}
  assert.ok(hook(f.kit,zone));const before=physical(f.kit),contacts=[...f.kit.colliders],supports=[...f.kit.walkables];
  assert.equal(typeof halls.finalizeNingshouCoveredPlatforms,'function');assert.equal(halls.finalizeNingshouCoveredPlatforms(f.kit),names.length);
  f.kit.root.updateMatrixWorld(true);for(const {base,cover,height} of f.pairs){assert.equal(upward(base,height).length,0);assert.equal(upward(cover,height).length,2);}
  assert.deepEqual(physical(f.kit),before);assert.deepEqual(f.kit.colliders,contacts);assert.deepEqual(f.kit.walkables,supports);assert.ok(f.kit.colliders.every((c,i)=>c===contacts[i]));assert.ok(f.kit.walkables.every((w,i)=>w===supports[i]));assert.equal(halls.finalizeNingshouCoveredPlatforms(f.kit),0,'queue consumed exactly once');
 }finally{f.dispose();}});
 test(name+': unchanged source guard still rejects premature clipping',()=>{const f=fixture(names);try{
  assert.equal(f.pairs[0].base.geometry.attributes.position.count,24);
  for(const {base,cover,height} of f.pairs)removeCoveredPlatformSurface(base,cover,height,{clipCoincidentSides:true});
  assert.throws(()=>hook(f.kit,zone),name==='Qingshou'?/Original platform geometry changed/:/Xuhui visible reserve occupied or retained joint changed/);
 }finally{f.dispose();}});
}
test('production finalizer runs in the existing merge step after every source hook, without moving or adding yields',()=>{
 const source=fs.readFileSync('src/scene/zones/ZoneBase.js','utf8');
 assert.match(source,/buildXiangxuGlazedGate\(this\.kit,this\.zoneJson\);\s*yield \{phase:'merge',index:0\};\s*finalizeNingshouCoveredPlatforms\(this\.kit\);\s*this\.group = this\.kit\.finish\(\);/);
 const final=source.indexOf('finalizeNingshouCoveredPlatforms(this.kit)');
 for(const hook of ['buildQingshouRaisedWalk(this.kit','buildXuhuiGallery(this.kit'])assert.ok(source.indexOf(hook)<final);
});
test('empty or other-zone kit has no deferred geometry or physical effects',()=>{
 assert.equal(typeof halls.finalizeNingshouCoveredPlatforms,'function');const kit={root:{name:'axis-courts'},colliders:[],walkables:[]};assert.equal(halls.finalizeNingshouCoveredPlatforms(kit),0);assert.deepEqual(kit,{root:{name:'axis-courts'},colliders:[],walkables:[]});
});
test('only still-owned reachable bases are finalized; removed source frames are not processed',()=>{
 const f=fixture(['寻沿书屋']);try{const base=f.pairs[0].base;const frame=base.parent;frame.removeFromParent();assert.equal(halls.finalizeNingshouCoveredPlatforms(f.kit),0);assert.equal(base.geometry.attributes.position.count,24);f.kit.root.add(frame);assert.equal(halls.finalizeNingshouCoveredPlatforms(f.kit),1);}finally{f.dispose();}
});
