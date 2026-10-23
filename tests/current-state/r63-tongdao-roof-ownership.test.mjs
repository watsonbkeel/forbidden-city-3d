import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture,apply,signature,physics,dispose} from '../lib/r63-tongdao-roof-fixture.mjs';

// This regression would fail if the helper disposes an original roof payload
// while another kit object still owns or borrows that geometry/attribute buffer.
const cases=[
 ['same BufferGeometry',source=>source.geometry],
 ['same position BufferAttribute',source=>{const g=source.geometry.clone();g.setAttribute('position',source.geometry.attributes.position);return g;}],
 ['new attribute with same typed array',source=>{const g=source.geometry.clone();g.setAttribute('position',new THREE.BufferAttribute(source.geometry.attributes.position.array,3));return g;}],
 ['new typed-array view with same ArrayBuffer',source=>{const g=source.geometry.clone(),a=source.geometry.attributes.position.array;g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(a.buffer,a.byteOffset,a.length),3));return g;}],
 ['interleaved attribute borrowing source payload',source=>{const g=source.geometry.clone(),a=source.geometry.attributes.position.array;g.setAttribute('position',new THREE.InterleavedBufferAttribute(new THREE.InterleavedBuffer(new Float32Array(a.buffer,a.byteOffset,a.length),3),3,0));return g;}],
 ['index view borrowing source payload',source=>{const g=source.geometry.clone(),a=source.geometry.attributes.position.array;g.setIndex(new THREE.BufferAttribute(new Uint32Array(a.buffer,a.byteOffset,3),1));return g;}],
 ['morph attribute borrowing source payload',source=>{const g=source.geometry.clone();g.morphAttributes.position=[source.geometry.attributes.position];return g;}],
 ['hidden nested line borrowing source payload',source=>source.geometry],
];
function snapshot(f){return{geometry:signature(f.kit.root),physics:physics(f),rootChildren:f.kit.root.children.slice(),hallChildren:f.built.f.children.slice(),roofChildren:f.roof.children.slice(),metadata:JSON.stringify({root:f.kit.root.userData,hall:f.built.f.userData}),owned:f.kit.owned.slice()};}
for(const[label,geometry]of cases)test(`Tongdao fails atomically for kit-wide ${label}`,()=>{
 const f=fixture(),source=f.roof.children[2],g=geometry(source),borrow=label.startsWith('hidden')?new THREE.LineSegments(g,source.material):new THREE.Mesh(g,source.material);
 borrow.position.set(100,0,0);const container=new THREE.Group();container.add(borrow);f.kit.root.add(container);if(label.startsWith('hidden'))container.visible=false;
 const before=snapshot(f),events=[];for(const m of f.roof.children)m.geometry.addEventListener('dispose',()=>events.push(m.geometry));
 assert.throws(()=>apply(f),/Tongdao roof:.*borrowed/,'must reject before replacement or disposal');
 assert.deepEqual(snapshot(f),before);assert.deepEqual(events,[]);assert.equal(borrow.parent,container);assert.equal(source.parent,f.roof);
 // The assertion checks no disposal. Cleanup is intentionally outside it.
 borrow.removeFromParent();if(g!==source.geometry)g.dispose();dispose(f);
});
test('independently cloned payload is not borrowed and retains identical successful roof output',()=>{
 // Frozen actual output from predecessor a14d1ff, before this guard existed.
 const expected={hash:'c20c4e54f6a662a8f561d0b7380112201cf2186452acb1d12a1ebc00cfcdb9b1',meshes:6};
 const f=fixture(),source=f.roof.children[2],borrow=new THREE.Mesh(source.geometry.clone(),source.material);borrow.position.set(100,0,0);f.kit.root.add(borrow);const old=signature(borrow),p=physics(f);let disposed=0;borrow.geometry.addEventListener('dispose',()=>disposed++);
 apply(f);assert.deepEqual(signature(borrow),old);assert.equal(physics(f),p);assert.equal(disposed,0);assert.deepEqual(signature(f.built.f.children.find(o=>o.name==='roof_xieshan')),expected);dispose(f);
});
