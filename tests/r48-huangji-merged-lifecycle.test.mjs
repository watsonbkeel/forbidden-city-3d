import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {cpuDracoLoader} from './lib/cpu-draco.mjs';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from './lib/r48-real-texture-library.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {huangjiFallbackMeshes} from '../src/scene/interior/HuangjiFallbackContract.js';
const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});
const {InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js');hook.deregister();
const cfg=JSON.parse(readFileSync(new URL('../data/interiors/huangji.json',import.meta.url)));
const bytes=readFileSync(new URL('../public'+cfg.model,import.meta.url));
const decoder=new GLTFLoader().setDRACOLoader(await cpuDracoLoader());
const asset=async()=> (await decoder.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;
for(const [label,makeLibrary] of [['',library],[' with production TextureLibrary',realTextureLibrary]])test('R48 actual full-zone merged Huangji switches only its four real fallbacks through load, unload and cancellation'+label,async()=>{
 const lib=makeLibrary();if(label)assert.equal(lib.material('roof_tile').name,'roof_tile_material');
 const zone=new ZoneBase(lib,JSON.parse(readFileSync(new URL('../data/zones/ningshou.json',import.meta.url))));
 const data=zone.build(),scene=new THREE.Scene(),cm=new CollisionManager();cm.rivers=[];scene.add(data.group);cm.addColliders(data.colliders);cm.addWalkables(data.walkables);
 const fallback=huangjiFallbackMeshes(scene),materials=new Set(fallback.map(m=>m.material));assert.equal(materials.size,4);
 const other=[];data.group.traverse(m=>{if(m.isMesh&&!fallback.includes(m))other.push([m,m.visible]);});
 const ownedDisposals=new Map([...materials].map(m=>[m,0]));for(const m of materials)m.addEventListener('dispose',()=>ownedDisposals.set(m,ownedDisposals.get(m)+1));
 const colliders=[...cm.colliders],walkables=[...cm.walkables],loader=new InteriorLoader(scene,cm,{registry:{huangji:cfg}});
 try{
  for(let cycle=0;cycle<3;cycle++){
   const root=await asset();loader.gltf.load=(_url,ok)=>ok({scene:root});assert.equal(await loader.load('huangji'),true);assert.equal(cm.colliders.filter(c=>c.tag==='interior:huangji').length,53,'five retained asset proxies plus exactly48 pillar slices');
   assert.ok(fallback.every(m=>!m.visible));assert.equal(loader.getGroup('huangji').visible,true);assert.equal(Boolean(loader.halls.get('huangji').fade),false);
   for(const[m,visible]of other)assert.equal(m.visible,visible,'unrelated merged material batch remains unchanged');
   loader.unload('huangji');assert.deepEqual(cm.colliders,colliders);assert.deepEqual(cm.walkables,walkables);assert.ok(fallback.every(m=>m.visible));
   for(const n of ownedDisposals.values())assert.equal(n,0,'GLB unload never disposes zone-owned fallback material');
  }
  let deliver;loader.gltf.load=(_url,ok)=>{deliver=ok;};const pending=loader.load('huangji');loader.setSuspended(true);deliver({scene:await asset()});assert.equal(await pending,false);assert.ok(fallback.every(m=>m.visible));
  assert.deepEqual(cm.colliders,colliders);assert.deepEqual(cm.walkables,walkables);
 }finally{loader.dispose();zone.dispose();lib.dispose?.();}
 for(const n of ownedDisposals.values())assert.equal(n,1,'zone teardown disposes each isolated material once');
});
