import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {registerQianqingCentral} from '../src/scene/palace/QianqingCentralSetting.js';import {CollisionManager} from '../src/utils/Collision.js';
const args={x0:0,y:2.16,H:7.22,ztb0:317.8,ztb1:324.8,thW:8.177777777777779,bayW:4};
test('Qianqing permanent navigation exposes actual stair and side approach, not a full exclusion box',()=>{
 const cm=new CollisionManager(),builder={walkables:[],col:(...p)=>cm.addCollider(new THREE.Box3(new THREE.Vector3(...p.slice(0,3)),new THREE.Vector3(...p.slice(3))))};
 registerQianqingCentral(builder,new THREE.Group(),args);cm.addWalkables(builder.walkables);
 assert.ok(builder.walkables.length>=16);assert.equal(cm.checkCollision(new THREE.Vector3(1.35,2.86+1.7,322.1),.34),false);
 assert.equal(cm.checkCollision(new THREE.Vector3(0,2.86+1.7,321.14),.34),true,'table remains solid');
 assert.ok(Math.abs(cm.getGroundHeight(2.726,318.4,2.86,.6)-2.86)<.001);
 assert.ok(!cm.colliders.some(c=>c.box.min.x< -4&&c.box.max.x>4&&c.box.max.y>5),'old full-volume blocker removed');
});
