import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CollisionManager} from '../src/utils/Collision.js';
import {zhongheFragment} from './lib/r55-zhonghe-fragment.mjs';
import {assertZhongheDisplayInWorld,replayZhongheDisplayRoute} from './lib/r55-zhonghe-world-check.mjs';
const {scene,builder}=zhongheFragment({plinth:true,merge:true}),cm=new CollisionManager();cm.addColliders(builder.colliders);cm.addWalkables(builder.walkables);const W={scene,cm,THREE};
test('merged production Zhonghe fragment owns a real visible supported platform and four clear doors',()=>assertZhongheDisplayInWorld(W));
for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true])for(const diagonal of [false,true])for(const reverse of [false,true])test(`real four-door control ${fps}Hz sprint=${sprint} backward=${backward} diagonal=${diagonal} reverse=${reverse}`,t=>replayZhongheDisplayRoute(t,W,{fps,sprint,backward,diagonal,reverse}));
for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true])test(`actual low-platform support ${fps}Hz sprint=${sprint} backward=${backward}`,t=>replayZhongheDisplayRoute(t,W,{fps,sprint,backward,platform:true}));
test('chair and screen stop a human-sized player instead of leaving the old entire front area blocked',()=>{
 const front=new THREE.Vector3(0,8.81+1.7,67.1),chair=cm.getValidPosition(front,new THREE.Vector3(0,front.y,69.18),.5,8.81);
 assert.ok(chair.z<68.3&&chair.z>67.1,'approach open until actual seat');
 const back=new THREE.Vector3(0,8.6+1.7,72.7),screen=cm.getValidPosition(back,new THREE.Vector3(0,back.y,70.7),.5,8.6);
 assert.ok(screen.z>71.4&&screen.z<72.7,'actual thin screen blocks approach');
});
