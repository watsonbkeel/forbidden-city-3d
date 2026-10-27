import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {readyScene} from '../../scripts/r119/ready-scene.mjs';import {CollisionManager} from '../../src/utils/Collision.js';
import {assertJiaotaiDisplayInWorld,replayJiaotaiDisplayRoute} from '../lib/r54-jiaotai-world-check.mjs';
const h=await readyScene(),cm=new CollisionManager();cm.addColliders(h.builder.colliders);cm.addWalkables(h.builder.walkables);const W={THREE,scene:h.scene,cm};test.after(()=>h.dispose());
test('R119 actual ready room retains four open doors and clock/clepsydra/platform observation support',()=>assertJiaotaiDisplayInWorld(W));
for(const fps of [10,30,60])for(const backward of [false,true])test(`R119 real controller four-door clock/clepsydra rear-loop return ${fps}Hz backward=${backward}`,t=>{const r=replayJiaotaiDisplayRoute(t,W,{fps,sprint:false,backward});assert.equal(r.arrived,true);});
