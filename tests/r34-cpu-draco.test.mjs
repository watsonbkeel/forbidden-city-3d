import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {cpuDracoLoader} from './lib/cpu-draco.mjs';
for(const id of ['huangji','yangxin','cining'])test(`bundled CPU decoder reads ${id} actual compressed geometry`,async()=>{
 const cfg=JSON.parse(fs.readFileSync(new URL('../data/interiors/'+id+'.json',import.meta.url))),bytes=fs.readFileSync(new URL('../public'+cfg.model,import.meta.url));
 const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString()),expected=json.meshes.flatMap(m=>m.primitives).reduce((n,p)=>n+json.accessors[p.indices].count/3,0);
 const result=await new GLTFLoader().setDRACOLoader(await cpuDracoLoader()).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 let triangles=0;result.scene.traverse(o=>{if(o.isMesh){assert.ok(o.geometry.index);triangles+=o.geometry.index.count/3;assert.ok(Array.from(o.geometry.attributes.position.array).every(Number.isFinite));o.geometry.dispose();}});assert.equal(triangles,expected);
});
