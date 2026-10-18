import assert from 'node:assert/strict';
import fs from 'node:fs';import * as THREE from 'three';import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const bytes=fs.readFileSync(new URL('../fixtures/r7-taihe-dais-fallback-delta.json',import.meta.url));
assert.equal(sha(bytes),'a8f55eb85d30a9faf882cb53e64713122fbc3c13320ec531ed60e6c102e35a1d');
const fixture=JSON.parse(bytes);
// This view is only for frozen older tests. Validate EVERY current byte first,
// including retained and new surfaces; never return an unchecked old snapshot.
export function preDaisFallbackView(mesh){
 const row=fixture.rows[mesh.material?.name];assert.ok(row);const g=mesh.geometry;
 assert.equal(g.index,null);assert.equal(mesh.material.side,row.side);
 assert.deepEqual(Object.keys(g.attributes).sort(),Object.keys(row.attributes).sort());
 const attributes={};
 for(const[name,r]of Object.entries(row.attributes)){
  const a=g.attributes[name];assert.ok(a.array instanceof Float32Array);assert.equal(a.itemSize,r.itemSize);assert.equal(a.normalized,r.normalized);
  const actual=Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength);
  assert.equal(actual.length,r.afterBytes);assert.equal(sha(actual),r.afterSHA256,`${mesh.material.name}/${name}: exact current dais migration bytes`);
  const old=Buffer.from(r.beforeBytes,'base64');assert.equal(sha(old),r.beforeSHA256);
  const array=new Float32Array(old.length/4);for(let i=0;i<array.length;i++)array[i]=old.readFloatLE(i*4);
  attributes[name]=new THREE.BufferAttribute(array,r.itemSize,r.normalized);
 }
 return{...mesh,material:mesh.material,geometry:{index:null,attributes}};
}
