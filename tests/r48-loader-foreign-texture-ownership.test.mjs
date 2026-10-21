import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import * as THREE from 'three';
import { CollisionManager } from '../src/utils/Collision.js';
const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});
const { InteriorLoader }=await import('../src/scene/interior/InteriorLoader.js');hook.deregister();
const cfg=JSON.parse(readFileSync(new URL('../data/interiors/huangji.json',import.meta.url)));
// The historical Taihe probe used a single fake box labelled Huangji. R48 now
// correctly rejects that asset. Preserve its ownership assertion in both paths.
for (const id of ['foreign-probe','huangji']) test(`R48 fake shared-atlas extras cannot suppress ${id} texture cleanup`,async()=>{
 const scene=new THREE.Scene(),cm=new CollisionManager(),loader=new InteriorLoader(scene,cm,{registry:{[id]:{...cfg,id}}});
 const root=new THREE.Group(),map=new THREE.Texture(),material=new THREE.MeshStandardMaterial({map}),geometry=new THREE.BoxGeometry();
 material.userData.taiheSharedAtlas=map;root.add(new THREE.Mesh(geometry,material));
 const counts={texture:0,material:0,geometry:0};map.addEventListener('dispose',()=>counts.texture++);material.addEventListener('dispose',()=>counts.material++);geometry.addEventListener('dispose',()=>counts.geometry++);
 loader.gltf.load=(_u,ok)=>ok({scene:root});const warn=console.warn;console.warn=()=>{};
 try {assert.equal(await loader.load(id),id==='foreign-probe');loader.unload(id);assert.deepEqual(counts,{texture:1,material:1,geometry:1});loader.dispose();assert.deepEqual(counts,{texture:1,material:1,geometry:1});assert.equal(cm.colliders.length,0);assert.equal(scene.children.length,0);}
 finally {console.warn=warn;loader.dispose();}
});
