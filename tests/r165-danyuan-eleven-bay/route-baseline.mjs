import assert from 'node:assert/strict';
import * as T from 'three';
import {CollisionManager} from '../../src/utils/Collision.js';
import {replayKunning} from '../lib/kunning-walk.mjs';
import {withBoundedQaMocks} from '../lib/bounded-qa-clock.mjs';
import {hash} from '../r164-three-entry-navigation/snapshot.mjs';
export function manager(kit){const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);return cm}
export const groundPath=()=>[[183.7,406],[183.7,417],[205,417],[205,432],[216,432],[216,433.5],[216,432],[205,432],[205,417],[183.7,417],[183.7,406]];
export function runGroundAccess(t,kit){const cm=manager(kit),rows=[];for(const fps of[10,60])for(const sprint of[false,true]){const q=withBoundedQaMocks(t,m=>replayKunning(m,{THREE:T,cm},groundPath(),{fps,sprint,startFeet:0,recordFrames:true}));assert.equal(q.arrived,true);assert.equal(q.frames.filter(f=>cm.checkCollision(new T.Vector3(f.x,f.feet+1.7,f.z),.5)).length,0);assert.ok(q.maxFeet<.01);rows.push({fps,sprint,frames:q.frames.length,frameHash:hash(q.frames),end:q.end,maxFeet:q.maxFeet})}assert.equal(cm.checkCollision(new T.Vector3(216,1.7,409.4),.5),true);return rows}
