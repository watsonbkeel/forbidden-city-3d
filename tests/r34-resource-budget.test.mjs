import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { resourceBudget } from './lib/resource-budget.mjs';

test('resource budget separates hidden resident geometry from effective visible geometry', () => {
 const root=new THREE.Group(), geometry=new THREE.BoxGeometry(1,1,1), material=new THREE.MeshStandardMaterial();
 const a=new THREE.Mesh(geometry,material), hidden=new THREE.Group(), b=new THREE.Mesh(geometry,material);
 hidden.visible=false;hidden.add(b);root.add(a,hidden);
 const result=resourceBudget([root]);
 assert.equal(result.meshes,2);assert.equal(result.visibleMeshes,1);
 assert.equal(result.triangles,24);assert.equal(result.visibleTriangles,12);
 assert.equal(result.geometries,1);assert.equal(result.materials,1);
 assert.equal(result.geometryBytes,840); // position, normal, UV and uint16 index, once.
});

test('resource budget counts instance submission and unique typed buffers without duplicate backing allocation', () => {
 const data=new Float32Array(6*3),buffer=new THREE.InterleavedBuffer(data,6),g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.InterleavedBufferAttribute(buffer,3,0));g.setAttribute('normal',new THREE.InterleavedBufferAttribute(buffer,3,3));
 const texture=new THREE.Texture(),a=new THREE.MeshStandardMaterial({map:texture}),b=new THREE.MeshStandardMaterial({normalMap:texture});
 const mesh=new THREE.InstancedMesh(g,[a,b],4);
 const result=resourceBudget([mesh]);
 assert.equal(result.triangles,4);assert.equal(result.geometries,1);assert.equal(result.geometryBytes,data.byteLength);
 assert.equal(result.instanceBytes,4*16*4);assert.equal(result.textures,1);assert.equal(result.materials,2);
});
