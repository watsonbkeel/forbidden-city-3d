import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {CollisionManager} from '../src/utils/Collision.js';import {findRoutinePath} from '../src/scene/characters/RoutinePath.js';
const drain=g=>{let n;while(!(n=g.next()).done){}return n.value;};
test('bounded routine planner walks around wall instead of crossing it',()=>{const cm=new CollisionManager();cm.addCollider(new THREE.Box3(new THREE.Vector3(-1,0,-2),new THREE.Vector3(1,4,2)));const r=drain(findRoutinePath(cm,[-4,0,0],[4,0,0]));assert.equal(r.status,'ready');assert.ok(r.points.some(p=>Math.abs(p[2])>2.32));});
test('sealed route fails explicitly with no invented fallback',()=>{const cm=new CollisionManager();cm.addCollider(new THREE.Box3(new THREE.Vector3(-1,0,-50),new THREE.Vector3(1,4,50)));const r=drain(findRoutinePath(cm,[-4,0,0],[4,0,0],{maxNodes:100,margin:3}));assert.equal(r.status,'error');assert.equal(r.points,undefined);});
