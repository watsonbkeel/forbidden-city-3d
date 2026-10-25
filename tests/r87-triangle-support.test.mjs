import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createTriangleTemplate,triangleInstance,triangleFootContact,triangleBodyIntersects} from '../src/utils/TriangleSupport.js';
function tri(points){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));return createTriangleTemplate(g);}
test('tilted disk maximum has an actual triangle/foot witness, not apex clamp',()=>{
 const s=triangleInstance(tri([[0,0,0],[0,0,2],[2,2,0]]),[10,3,20],'tilt');
 const c=triangleFootContact(s,10.5,20.5,.2,9);assert.ok(c);assert.ok(Math.abs(c.height-3.7)<1e-6);assert.ok(Math.abs(c.witness.x-10.7)<1e-6);assert.ok(Math.hypot(c.witness.x-10.5,c.witness.z-20.5)<=.2+1e-7);assert.equal(triangleFootContact(s,10.5,20.5,.2,3.6),null);
});
test('flat triangle has witness at edge but square-only corner misses',()=>{
 const s=triangleInstance(tri([[0,1,0],[0,1,1],[1,1,0]]),[0,0,0],'flat');
 assert.ok(triangleFootContact(s,-.2,0,.3,2));assert.equal(triangleFootContact(s,-.25,-.25,.3,2),null);assert.equal(triangleFootContact(s,2,2,.3,2),null);
});
test('closed shape body detects surface and fully contained box, not broadphase gaps',()=>{
 const s=triangleInstance(createTriangleTemplate(new THREE.BoxGeometry(2,2,2)),[4,5,6],'box');
 assert.ok(triangleBodyIntersects(s,new THREE.Box3(new THREE.Vector3(3.9,4.9,5.9),new THREE.Vector3(4.1,5.1,6.1))));
 assert.equal(triangleBodyIntersects(s,new THREE.Box3(new THREE.Vector3(8,9,10),new THREE.Vector3(9,10,11))),false);
});
test('invalid and degenerate geometry rejected; downward triangle not support',()=>{
 assert.throws(()=>tri([[0,0,0],[0,0,0],[0,0,0]]));
 const s=triangleInstance(tri([[0,1,0],[1,1,0],[0,1,1]]),[0,0,0],'down');assert.equal(triangleFootContact(s,.1,.1,.3,2),null);
});
test('swept body detects intermediate corner strike with clear endpoints',async()=>{
 const {triangleBodySweptIntersects}=await import('../src/utils/TriangleSupport.js');
 const s=triangleInstance(createTriangleTemplate(new THREE.BoxGeometry(.2,1,.2)),[0,1,0],'sweep');
 const box=(x,z)=>new THREE.Box3(new THREE.Vector3(x-.1,.7,z-.1),new THREE.Vector3(x+.1,1.3,z+.1));
 const a=box(-.4,.1),b=box(.1,-.4);assert.equal(triangleBodyIntersects(s,a),false);assert.equal(triangleBodyIntersects(s,b),false);assert.equal(triangleBodySweptIntersects(s,a,b),true);assert.equal(triangleBodySweptIntersects(s,box(-1,1),box(1,1)),false);
});
test('continuous impact time is exact, not repeated binary body probes',async()=>{const {triangleBodySweepFraction}=await import('../src/utils/TriangleSupport.js');const s=triangleInstance(createTriangleTemplate(new THREE.BoxGeometry(.2,1,.2)),[0,1,0],'toi');const b=x=>new THREE.Box3(new THREE.Vector3(x-.1,.7,-.1),new THREE.Vector3(x+.1,1.3,.1));assert.ok(Math.abs(triangleBodySweepFraction(s,b(-.4),b(.4))-.25)<1e-7);});
