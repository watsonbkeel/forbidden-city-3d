import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {CollisionManager} from '../src/utils/Collision.js';
import {createTriangleTemplate,triangleInstance} from '../src/utils/TriangleSupport.js';
function marked(){const s=triangleInstance(createTriangleTemplate(new THREE.BoxGeometry(.4,1,.4)),[0,1,0],'owned');const b=s.box.clone();b.triangleSupport=s;return b;}
test('explicit owner surface carries witness, unregister/reload and update preserve dispatch',()=>{
 const cm=new CollisionManager(),b=marked();cm.addCollider(b,'bridge2');assert.equal(cm.supportContact(0,0,2).instanceId,'owned');assert.equal(cm.supportHeight(.49,.49,2),-Infinity);assert.equal(cm.supportHeight(0,0,1),-Infinity);
 assert.throws(()=>cm.addCollider(b,'bridge2'),/duplicate/i);cm.removeByTag('bridge2');assert.equal(cm.supportContact(0,0,2),null);cm.addCollider(b,'bridge2');cm.clear();assert.equal(cm.colliders.length,0);
});
test('unmarked box retains square support while marked body cannot use coarse box gaps',()=>{
 const cm=new CollisionManager(),b=marked();cm.addCollider(b);assert.equal(cm.supportHeight(.49,.49,2),-Infinity);const legacy=b.clone();cm.clear();cm.addCollider(legacy);assert.equal(cm.supportHeight(.49,.49,2),1.5);
});
test('marked underside prevents upward head pass while unmarked path unchanged',()=>{const cm=new CollisionManager(),b=marked();cm.addCollider(b);const r=cm.resolveTriangleVertical(0,0,-2,1,.1);assert.ok(r);assert.equal(r.kind,'head-impact');assert.ok(Math.abs(r.feet-(-1.2))<1e-6);assert.equal(cm.resolveTriangleVertical(10,10,0,2,.1),null);});
