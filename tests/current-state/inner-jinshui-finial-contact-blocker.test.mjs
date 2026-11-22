import {replayR58FinialDiagnostic} from '../lib/r58-finial-native-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CollisionManager} from '../../src/utils/Collision.js';
import {finialFixture} from '../lib/r58-bridge-contact-probe.mjs';
// The four named blocker reproductions use the exact unhooked R58 fixture.
for(const fps of [10,60])for(const walkAlongRail of [false,true]){
 const name=`unhooked experimental caps reproduce ${walkAlongRail?'rail-walk':'jump'} penetration at ${fps}Hz`;
 test(name,()=>replayR58FinialDiagnostic(name));
}

test('a full-cap AABB creates unsupported diagonal apex-height support',()=>{
 const W=finialFixture(),p=W.g.userData.innerJinshuiSideFinials.placements[0],box=new THREE.Box3(new THREE.Vector3(p.x-.125,p.y,p.z-.125),new THREE.Vector3(p.x+.125,p.y+.22,p.z+.125));
 const cm=new CollisionManager();cm.addCollider(box);const x=p.x+.4,z=p.z+.4,actualCapRadius=.125,nearestFootprintRadius=Math.hypot(.4-.3,.4-.3);
 assert.ok(nearestFootprintRadius>actualCapRadius,'the foot square cannot intersect any actual cap triangle');assert.equal(cm.supportHeight(x,z,p.y+.3),p.y+.22,'AABB would incorrectly hold feet at apex in empty space');
});

test('flat peak-height walkable would hover above real low-collar edge',()=>{
 const W=finialFixture(),p=W.g.userData.innerJinshuiSideFinials.placements[0],box=new THREE.Box3(new THREE.Vector3(p.x-.125,p.y,p.z-.125),new THREE.Vector3(p.x+.125,p.y+.22,p.z+.125));
 const cm=new CollisionManager();cm.addWalkable({type:'box',box,rescue:false});const x=p.x+.124,z=p.z;
 const hit=new THREE.Raycaster(new THREE.Vector3(x,p.y+1,z),new THREE.Vector3(0,-1,0),0,2).intersectObject(W.g,true)[0];assert.ok(hit);
 assert.ok(cm.getGroundHeight(x,z,p.y,.6)-hit.point.y>.17,'flat cap platform would be visibly above real collar triangles');
 assert.equal(cm.getGroundHeight(x,z,p.y-1.17,.6),0,'non-rescue box must not rescue from ordinary deck height');
});
