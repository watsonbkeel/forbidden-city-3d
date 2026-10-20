import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildSilhouette } from '../src/render/SilhouetteBuilder.js';
function expanded(g){const a=g.attributes.position;return Array.from({length:g.index?.count??a.count},(_,i)=>{const j=g.index?g.index.getX(i):i;return [a.getX(j),a.getY(j),a.getZ(j)];});}
function fixture(){const root=new THREE.Group();root.position.set(10,2,9);for(let i=0;i<2;i++){const mesh=new THREE.Mesh(new THREE.BoxGeometry(3,2,4),new THREE.MeshStandardMaterial({name:'roof_tile_material'}));mesh.position.set(i*3,0,0);root.add(mesh);}return root;}
test('far roof silhouette uses exact indexed positions without changing expanded triangles or source geometry',()=>{
 const root=fixture();root.updateMatrixWorld(true);const expected=root.children.flatMap(m=>{const g=m.geometry.toNonIndexed();g.applyMatrix4(m.matrixWorld);return expanded(g);});
 const original=root.children.map(m=>expanded(m.geometry)),silhouette=buildSilhouette(root),g=silhouette.geometry;
 assert.ok(g.index,'silhouette must index repeated exact position triples');
 assert.deepEqual(expanded(g),expected);assert.deepEqual(root.children.map(m=>expanded(m.geometry)),original);
 assert.deepEqual(Object.keys(g.attributes),['position']);
 assert.ok(g.attributes.position.array.byteLength+g.index.array.byteLength<expected.length*12);
 assert.equal(silhouette.castShadow,false);assert.equal(silhouette.material.fog,true);
});
for(const uniqueCount of [65536,65537])test(`silhouette preserves ${uniqueCount} distinct vertices with correct index width`,()=>{
 const positions=new Float32Array(uniqueCount*9);
 for(let i=0;i<uniqueCount;i++)for(let copy=0;copy<3;copy++)positions[(i*3+copy)*3]=i;
 const source=new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(positions,3));
 const group=new THREE.Group();group.add(new THREE.Mesh(source,new THREE.MeshBasicMaterial({name:'roof_tile_material'})));
 const silhouette=buildSilhouette(group),g=silhouette.geometry;
 assert.equal(g.attributes.position.count,uniqueCount);
 assert.equal(g.index.array.constructor,uniqueCount<=65536?Uint16Array:Uint32Array);
 assert.equal(g.index.count,uniqueCount*3);assert.equal(g.index.getX(g.index.count-1),uniqueCount-1);
 assert.deepEqual(expanded(g),expanded(source));assert.equal(g.attributes.normal,undefined,'unlit silhouettes must not generate smooth normals');
});
test('silhouette does not weld nearby but distinct coordinates, and leaves unprofitable geometry expanded',()=>{
 const values=[0,0,0,1e-7,0,0,1,0,0],source=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(values,3));
 const group=new THREE.Group();group.add(new THREE.Mesh(source,new THREE.MeshBasicMaterial({name:'roof_tile_material'})));
 const result=buildSilhouette(group);
 assert.equal(result.geometry.index,null);assert.deepEqual(expanded(result.geometry),expanded(source));
});
