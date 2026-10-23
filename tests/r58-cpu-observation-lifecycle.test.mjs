import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {CharacterRenderer} from '../src/scene/characters/CharacterRenderer.js';
import {observeCharacterSubmissions} from './lib/r52-character-scene.mjs';
const pause=()=>new Promise(resolve=>setImmediate(resolve));
test('QA CPU observation copies have no retained scene/renderer owner after disposal and collection',async()=>{
 assert.equal(typeof global.gc,'function','Run this resource-lifecycle probe with --expose-gc; no production GC hook is added');
 const scene=new THREE.Scene(),renderer=new CharacterRenderer({scene}),system={renderer},observer=observeCharacterSubmissions(system);
 const actors=Array.from({length:64},(_,i)=>({id:`probe-${i}`,templateId:i<2?'maid-daily':'guard-duty',pose:'standing',lod:i<2?0:2,zoneRef:'probe',position:[i,0,0],rotationYRad:0,animation:{phase:i,amplitude:.5,walkSpeed:0,poseIndex:0}}));
 renderer.render(actors);scene.updateMatrixWorld(true);global.gc();const before=process.memoryUsage();let disposals=0;const weak=[];
 function observeOnce(){const copies=observer.meshes();assert.equal(copies.length,64);for(const copy of copies){assert.equal(copy.mesh.parent,null);assert.notEqual(copy.mesh.geometry,renderer.batches.get(copy.batch).mesh.geometry);weak.push(new WeakRef(copy.mesh.geometry));copy.mesh.geometry.addEventListener('dispose',()=>disposals++);copy.mesh.geometry.dispose();}}
 for(let group=0;group<32;group++){observeOnce();if(group%8===7){await pause();global.gc();}}
 await pause();global.gc();const after=process.memoryUsage();const retained=weak.filter(r=>r.deref()!==undefined).length;assert.equal(retained,0);assert.equal(disposals,2048);assert.equal(renderer.last.renderCopies,64);assert.equal(scene.children.length,1);observer.dispose();renderer.dispose();assert.equal(scene.children.length,0);
 fs.mkdirSync('reports/r58-a-batch3',{recursive:true});fs.writeFileSync('reports/r58-a-batch3/cpu-copy-lifecycle.json',JSON.stringify({kind:'QA-only reproduction, no full world or browser memory claim',groups:32,copiesPerGroup:64,disposals,retained,before,after,manualGc:true},null,2)+'\n');
});
