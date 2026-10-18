import assert from 'node:assert/strict';
import fs from 'node:fs';import * as THREE from 'three';import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const bytes=fs.readFileSync(new URL('../fixtures/r8-incense-fallback-delta.json',import.meta.url));
assert.equal(sha(bytes),'14a7168824a93ed9bea582e05461f4ce58c244ef34043c4b91d28c2aa0dc8bb2');
const fixture=JSON.parse(bytes);
// This view is only for frozen older tests. Validate EVERY current byte first,
// including retained and new surfaces; never return an unchecked old snapshot.
export function preIncenseFallbackView(mesh){
 const row=fixture.rows[mesh.material?.name];if(!row)return mesh;const g=mesh.geometry;
 assert.equal(g.index,null);assert.equal(mesh.material.side,row.side);
 assert.deepEqual(Object.keys(g.attributes).sort(),Object.keys(row.attributes).sort());
 const attributes={};
 for(const[name,r]of Object.entries(row.attributes)){
  const a=g.attributes[name];assert.ok(a.array instanceof Float32Array);assert.equal(a.itemSize,r.itemSize);assert.equal(a.normalized,r.normalized);
  const actual=Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength);
  assert.equal(actual.length,r.afterBytes);assert.equal(sha(actual),r.afterSHA256,`${mesh.material.name}/${name}: exact current incense migration bytes`);
  const old=Buffer.from(r.beforeBytes,'base64');assert.equal(sha(old),r.beforeSHA256);
  const array=new Float32Array(old.length/4);for(let i=0;i<array.length;i++)array[i]=old.readFloatLE(i*4);
  attributes[name]=new THREE.BufferAttribute(array,r.itemSize,r.normalized);
 }
 return{...mesh,material:mesh.material,geometry:{index:null,attributes}};
}
