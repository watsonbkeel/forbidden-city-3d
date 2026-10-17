import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {TextureLibrary,TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {buildWumenSouthPlaque} from '../../src/scene/palace/special/GatePlaques.js';
import {captureGate} from '../lib/gate-tower-fixture.mjs';

// Run the real material/cache/name implementation. Only image loading is replaced
// by inert CPU textures; no browser, network, WebGL or fixture material factory.
function productionGate({merge=false}={}){
 const expected=captureGate('午门'); // Reuses the existing CPU Canvas stub only.
 const lib=new TextureLibrary();
 for(const name of Object.keys(TEXTURE_SPECS))lib.colors.set(name,new THREE.Texture());
 const builder=new PalaceBuilder(new THREE.Scene(),lib);let group;
 if(!merge)builder.finish=g=>{group=g;g.updateMatrixWorld(true);return g;};
 builder.buildGate(expected.data);
 if(merge){group=builder.scene.children[0];group.updateMatrixWorld(true);}
 return {lib,builder,group,expected,plaque:group.getObjectByName('wumen-south-gate-name-plaque')};
}

test('real TextureLibrary production material naming initializes the Wumen plaque without changing the fitted geometry',()=>{
 const {lib,plaque,expected}=productionGate();
 assert.equal(lib.material('roof_tile').name,'roof_tile_material');
 assert.equal(lib.material('roof_tile'),lib.material('roof_tile'));
 const before=expected.group.getObjectByName(plaque.name);
 assert.deepEqual(plaque.position.toArray(),before.position.toArray());
 assert.deepEqual(plaque.userData.gatePlaque.dimensions,before.userData.gatePlaque.dimensions);
 assert.deepEqual(plaque.userData.gatePlaque.mount,before.userData.gatePlaque.mount);
 assert.deepEqual(Array.from(plaque.geometry.attributes.position.array),Array.from(before.geometry.attributes.position.array));
});

test('real production materials retain both glyph ink cells visibility from frozen C3 and unchanged actual entry',()=>{
 const {group,plaque}=productionGate(),d=plaque.userData.gatePlaque.dimensions;
 const halfInk=Math.min(d.innerHeight/2*.83,d.innerWidth*.72)/2;
 for(const from of [[3,25,-40],[0,1.7,-74.4]])for(const cy of [d.innerHeight/4,-d.innerHeight/4])for(const dx of [-.95,0,.95])for(const dy of [-.95,0,.95]){
  const origin=new THREE.Vector3(...from),to=plaque.localToWorld(new THREE.Vector3(dx*halfInk,cy+dy*halfInk,d.depth)),delta=to.sub(origin);
  const hits=new THREE.Raycaster(origin,delta.clone().normalize(),0,delta.length()+1e-5).intersectObject(group,true);
  assert.equal(hits[0]?.object,plaque);assert.equal(hits[0].face.materialIndex,1);
 }
});

test('surface validation uses cached object identity even when the display name changes',()=>{
 const {lib,builder,group}=productionGate();lib.material('roof_tile').name='diagnostic display name';
 assert.doesNotThrow(()=>buildWumenSouthPlaque(builder,group.getObjectByName('roof_wudian')));
});

test('an unrelated same-name roof material is rejected rather than accepted by a label alias',()=>{
 const {lib,builder,group}=productionGate(),roof=group.getObjectByName('roof_wudian'),tile=lib.material('roof_tile'),impostor=tile.clone();
 assert.equal(impostor.name,tile.name);assert.notEqual(impostor,tile);
 roof.traverse(o=>{if(o.material===tile)o.material=impostor;});
 assert.throws(()=>buildWumenSouthPlaque(builder,roof),/Wumen lower roof surface is unavailable/);
});

test('whole production buildGate and finish merge preserve the plaque and exact physics with real TextureLibrary',()=>{
 const {lib,builder,group,plaque,expected}=productionGate({merge:true});
 assert.equal(group.parent,builder.scene);assert.ok(builder.ownedObjects.has(group));
 assert.ok(group.children.some(o=>o.material===lib.material('roof_tile')));
 assert.equal(plaque.userData.noMerge,true);assert.equal(plaque.parent,group);
 assert.deepEqual(builder.colliders,expected.builder.colliders);assert.deepEqual(builder.walkables,expected.builder.walkables);
 const before=expected.group.getObjectByName(plaque.name);
 assert.deepEqual(plaque.userData.gatePlaque,before.userData.gatePlaque);
 const d=plaque.userData.gatePlaque.dimensions;
 for(const cy of [d.innerHeight/4,-d.innerHeight/4]){
  const origin=new THREE.Vector3(3,25,expected.data.position.z-40),to=plaque.localToWorld(new THREE.Vector3(0,cy,d.depth)),delta=to.sub(origin);
  const hits=new THREE.Raycaster(origin,delta.clone().normalize(),0,delta.length()+1e-5).intersectObject(group,true);
  assert.equal(hits[0]?.object,plaque);assert.equal(hits[0].face.materialIndex,1);
 }
});
