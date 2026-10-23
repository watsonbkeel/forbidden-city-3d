import './lib/inner-palace-fixture.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';import {library} from './lib/inner-palace-fixture.mjs';import {CollisionManager} from '../src/utils/Collision.js';
import {assertR63FInWorld,replayR63FRoutes} from './lib/r63-f-world-check.mjs';
import {createBoundedQaMocks} from './lib/bounded-qa-clock.mjs';
test('all136 new F route modes traverse the actual complete west zone, not isolated halls',t=>{
 const cfg=JSON.parse(fs.readFileSync('data/zones/west-six.json')),z=new ZoneBase(library(),cfg),built=z.build(),scene=new THREE.Scene(),cm=new CollisionManager();scene.add(built.group);cm.rivers=[];cm.addColliders(built.colliders);cm.addWalkables(built.walkables);
 const W={THREE,scene,cm,rooms:built.rooms},qa=createBoundedQaMocks(t);
 try{const geometry=assertR63FInWorld(W),routes=replayR63FRoutes(qa.context,W,{release:label=>qa.release(label)});assert.equal(routes.length,136);assert.ok(routes.every(r=>r.arrived));fs.writeFileSync('reports/r63-f-stage/full-west-compound-routes.json',JSON.stringify({scope:'ONE_ACTUAL_WEST_ZONE_ALL_COURTS_HALLS_WALLS_AND_FURNITURE_NOT_FULL_PALACE_OR_BROWSER',colliders:cm.colliders.length,supports:cm.walkables.length,geometry,routes},null,2)+'\n');}
 finally{qa.release();z.dispose();}
});
