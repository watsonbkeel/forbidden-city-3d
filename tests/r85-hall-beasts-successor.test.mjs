import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {signature,loadHookupPalaceBuilder} from './lib/r85-r58-material-array-fixture.mjs';
import {library as hallLibrary} from './lib/inner-palace-fixture.mjs';
const hooked=await loadHookupPalaceBuilder(),unhooked=await loadHookupPalaceBuilder({enabled:false});
test('exact owner HOOKUP.patch rehearsal uses actual production inputs and retains all hall physics and all other hall meshes',()=>{
 for(const name of ['保和殿','中和殿','太和殿','交泰殿']){
  const data=structuredClone(PALACE_LAYOUT.find(h=>h.name===name)),captures=[];
  for(const Builder of [unhooked.PalaceBuilder,hooked.PalaceBuilder]){
   const builder=new Builder(new THREE.Scene(),hallLibrary()),group=new THREE.Group();const [floor,reference]=({'保和殿':[9,10],'中和殿':[8.6,8.6],'太和殿':[10.2,10.2],'交泰殿':[2.16,2.16]})[name];builder.buildHall(group,data,floor,{heightReferenceY:reference});group.updateMatrixWorld(true);
   const roofs=[];group.traverse(o=>{if(o.userData.ownedMaterials&&o.userData.eaveY!==undefined)roofs.push(o);});assert.equal(roofs.length,1);
   const roof=roofs[0],roofSig=signature(roof);roof.removeFromParent();
   captures.push({remainder:signature(group),roof:roofSig,physics:{colliders:builder.colliders,walkables:builder.walkables},records:group.userData.hallWalkingBeasts??[]});
  }
  const [before,after]=captures;assert.deepEqual(after.remainder,before.remainder);assert.deepEqual(after.physics,before.physics);
  if(['保和殿','中和殿'].includes(name)){assert.notDeepEqual(after.roof,before.roof);assert.equal(after.records.length,1);assert.equal(after.records[0].animalTotal,name==='保和殿'?72:28);}
  // The historical toggle removes shared metadata collection, not the new
  // Taihe roof option. Its actual geometry is retained on BOTH sides.
  else if(name==='太和殿'){assert.deepEqual(after.roof,before.roof);assert.deepEqual(before.records,[]);assert.equal(after.records.length,1);assert.equal(after.records[0].animalTotal,80);}
  else {assert.deepEqual(after.roof,before.roof);assert.deepEqual(after.records,[]);}
 }
});

