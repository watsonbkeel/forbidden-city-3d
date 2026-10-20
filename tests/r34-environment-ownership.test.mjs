import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Environment} from '../src/scene/Environment.js';
import {TextureLibrary} from '../src/utils/TextureLibrary.js';
function fixture(t) {
 const library=new TextureLibrary(),scene=new THREE.Scene();
 for(const name of ['ground_brick','stone_slab','skyline'])library.colors.set(name,new THREE.Texture({width:1211,height:301}));
 const targets=[];
 t.mock.method(THREE.PMREMGenerator.prototype,'fromScene',()=>{const target={texture:new THREE.Texture(),count:0,dispose(){this.count++;this.texture.dispose();}};targets.push(target);return target;});
 const e=new Environment(scene,{compile(){}},library);
 return {e,library,scene,targets};
}
const countDispose=resource=>{let count=0;resource.addEventListener('dispose',()=>count++);return()=>count;};
test('environment releases owned geometry/sky/glow/IBL once but leaves shared library materials and textures to their owner',t=>{
 const {e,library,scene,targets}=fixture(t);e.init();
 const borrowed=[...library.materials.values(),...library.allTextures()].map(countDispose);
 const owned=[e.sky.geometry,e.sky.material,e.skylineRing.geometry,e.skylineRing.material,e.nightLampGlow,e.nightLampGlow.geometry,e.nightLampGlow.material,e.iblSky.material,targets[0].texture].map(countDispose);
 e.dispose();e.dispose();assert.ok(borrowed.every(n=>n()===0),'library resources untouched');assert.ok(owned.every(n=>n()===1),'owned resources disposed once');assert.equal(targets[0].count,1);assert.equal(scene.children.length,0);assert.equal(scene.environment,null);
 library.dispose();assert.ok(borrowed.every(n=>n()===1),'library disposes each resource exactly once');
});
test('init is idempotent while active; dispose permits a fresh init without leaking or destroying shared materials',t=>{
 const {e,library,scene,targets}=fixture(t);e.init();const old=e.sky,childCount=scene.children.length,oldDispose=countDispose(old.material);
 e.init();assert.ok(e.sky===old,'active init is idempotent');assert.equal(scene.children.length,childCount);assert.equal(targets.length,1);
 e.dispose();assert.equal(oldDispose(),1);e.init();assert.ok(e.sky!==old);assert.equal(scene.children.length,childCount);assert.equal(targets.length,2);
 e.dispose();library.dispose();assert.ok(targets.every(x=>x.count===1));
});
test('borrowed ownership remains known if the library is disposed before the environment',t=>{
 const {e,library}=fixture(t);e.init();const counts=[...library.materials.values(),...library.allTextures()].map(countDispose);library.dispose();e.dispose();assert.ok(counts.every(n=>n()===1));
});
