import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CollisionManager} from '../src/utils/Collision.js';
import {characterBody, bodyIntersectsPlayer, sweptBodyIntersectsPlayer} from '../src/scene/characters/CharacterBody.js';

const actor=(pose='standing',variant='standard')=>({id:'test-person',templateId:'guard-duty',behavior:{basePose:pose,seatVariant:variant}});
const body=(p=[0,0,0],pose='standing',variant='standard',rotation=0)=>characterBody(actor(pose,variant),{position:p,rotationYRad:rotation});
const eye=(x,y=1.7,z=0)=>new THREE.Vector3(x,y,z);
test('authored standing, seated and kneeling bodies have distinct height/footprint and finite rotated parts',()=>{
 const standing=body(),seated=body([0,0,0],'seated','throne-front-perch'),kneeling=body([0,0,0],'kneeling');
 assert.ok(Math.max(...standing.parts.map(p=>p.maxY))>Math.max(...seated.parts.map(p=>p.maxY)));
 assert.ok(Math.max(...seated.parts.map(p=>p.maxY))>Math.max(...kneeling.parts.map(p=>p.maxY)));
 const rotated=body([10,2,20],'seated','throne-front-perch',Math.PI/2);
 assert.ok(rotated.parts.some(p=>p.ax>10.4||p.bx>10.4));
 assert.ok(bodyIntersectsPlayer(seated,{position:[0,0,.6],radius:.2,height:1.7}));
 assert.equal(bodyIntersectsPlayer(standing,{position:[0,3,0],radius:.5,height:1.7}),false);
});
test('owner-scoped dynamic bodies do not become architectural colliders, supports or broadphase entries',()=>{
 const cm=new CollisionManager(),owner={};const colliders=cm.colliders,walkables=cm.walkables;
 cm.setDynamicBodies(owner,[body()]);assert.equal(cm.checkCollision(eye(.2)),true);
 assert.equal(cm.colliders,colliders);assert.equal(cm.walkables,walkables);assert.equal(cm.queryBox(new THREE.Box3(new THREE.Vector3(-1,-1,-1),new THREE.Vector3(1,3,1))).length,0);
 assert.equal(cm.supportHeight(0,0,5),-Infinity);assert.equal(cm.getGroundHeight(0,0,0),0);
 cm.clearDynamicBodies(owner);assert.equal(cm.checkCollision(eye(.2)),false);
});
test('player swept walking/sprinting cannot tunnel through a standing person but can leave an initial overlap',()=>{
 const cm=new CollisionManager();cm.setDynamicBodies('people',[body()]);
 for(const step of [.02,.2,1.2,4]){let p=eye(-2);for(let i=0;i<200;i++)p=cm.getValidPosition(p,eye(p.x+step),.5,0);assert.ok(p.x<-.7);}
 const escaped=cm.getValidPosition(eye(.1),eye(2),.5,0);assert.ok(escaped.x>1.5,'do not trap a pre-existing overlapping player');
 assert.equal(cm.checkCollision(eye(0,4)),false,'other floors remain independent');
});
test('NPC swept proposals detect a player even when both endpoint bodies are clear',()=>{
 const player={position:[0,0,0],radius:.5,height:1.7};
 assert.equal(bodyIntersectsPlayer(body([-2,0,0]),player),false);assert.equal(bodyIntersectsPlayer(body([2,0,0]),player),false);
 assert.equal(sweptBodyIntersectsPlayer(body([-2,0,0]),body([2,0,0]),player),true);
 assert.equal(sweptBodyIntersectsPlayer(body([-2,3,0]),body([2,3,0]),player),false);
});
test('short grazing player chord cannot cut a capsule between clear endpoints; overlap escape cannot cross through the centre',()=>{
 const cm=new CollisionManager();cm.setDynamicBodies('person',[body()]);
 const from=eye(-.125,1.7,.837),target=eye(.125,1.7,.837);
 assert.equal(cm.checkCollision(from),false);assert.equal(cm.checkCollision(target),false);assert.equal(cm.checkCollision(eye(0,1.7,.837)),true);
 assert.ok(cm.getValidPosition(from,target,.5,0).distanceTo(target)>.1);
 const crossed=cm.getValidPosition(eye(.1),eye(-2),.5,0);assert.ok(crossed.x>=.1-1e-8);
});
test('dynamic vertical sweep blocks upward and downward penetration without making an architectural ground',()=>{
 const cm=new CollisionManager();cm.setDynamicBodies('person',[body([0,2,0])]);
 assert.ok(cm.limitDynamicFeet(0,0,0,2,.5,1.7)<.4);
 cm.setDynamicBodies('person',[body()]);const top=Math.max(...body().parts.map(p=>p.maxY));
 assert.ok(cm.limitDynamicFeet(0,0,3,0,.5,1.7)>=top);
 assert.equal(cm.getGroundHeight(0,0,10),0);assert.equal(cm.supportHeight(0,0,10),-Infinity);
 assert.equal(cm.limitDynamicFeet(3,0,3,0,.5,1.7),0);
});
test('invalid or duplicate dynamic records fail atomically, owners clear independently and static clear removes all bodies',()=>{
 const cm=new CollisionManager();cm.setDynamicBodies('a',[body()]);cm.setDynamicBodies('b',[{...body([4,0,0]),id:'other'}]);
 assert.throws(()=>cm.setDynamicBodies('a',[body(),body()]),/duplicate/i);
 assert.throws(()=>cm.setDynamicBodies('a',[{...body(),parts:[{...body().parts[0],radius:NaN}]}]),/finite|body/i);
 assert.equal(cm.checkCollision(eye(.1)),true);cm.clearDynamicBodies('a');assert.equal(cm.checkCollision(eye(.1)),false);assert.equal(cm.checkCollision(eye(4)),true);
 cm.clear();assert.equal(cm.checkCollision(eye(4)),false);
});

test('bounded dynamic channel accepts128 synthetic bodies and rejects129 without discarding the prior valid set',()=>{
 const cm=new CollisionManager(),bodies=Array.from({length:128},(_,i)=>({...body([i*3,0,0]),id:'capacity-'+i}));
 cm.setDynamicBodies('capacity',bodies);assert.equal(cm.dynamicBodies.get('capacity').length,128);
 assert.throws(()=>cm.setDynamicBodies('capacity',[...bodies,{...body([500,0,0]),id:'capacity-129'}]),/128/);
 assert.equal(cm.dynamicBodies.get('capacity').length,128);assert.equal(cm.colliders.length,0);assert.equal(cm.walkables.length,0);cm.clear();
});
