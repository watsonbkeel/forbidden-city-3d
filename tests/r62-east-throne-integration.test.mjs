import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';import {CollisionManager} from '../src/utils/Collision.js';import {library} from './lib/inner-palace-fixture.mjs';
import {assertEastUnknownThroneInventoryInWorld} from './lib/r62-east-unknown-throne-world-check.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/zones/east-six.json',import.meta.url)));
test('production ZoneBase exact five opt-in dispatches remove only unknown throne components before merge',()=>{
 const z=new ZoneBase(library(),structuredClone(data)),before=JSON.stringify(z.zoneJson),indices=[2,9,16,30,37];
 for(const i of indices){const r=z.buildHall(z.zoneJson.items[i]);assert.ok(r.f.userData.structure);assert.equal(r.f.userData.structure.inventoryStatus,'UNKNOWN');assert.equal(r.f.userData.structure.knownEmpty,false);}
 assert.equal(JSON.stringify(z.zoneJson),before,'virtual policy must not mutate declarations');const cm=new CollisionManager();cm.addColliders(z.kit.colliders);cm.addWalkables(z.kit.walkables);
 const scene=new THREE.Scene();scene.add(z.kit.finish());const result=assertEastUnknownThroneInventoryInWorld({scene,cm,rooms:z.kit.rooms});assert.equal(result.absentTriangles,240);z.kit.dispose(scene.children[0]);
});
test('production opt-in identity drift rejects before creating meshes or navigation',()=>{
 const d=structuredClone(data);d.items[9].w+=.01;const z=new ZoneBase(library(),d);assert.throws(()=>z.buildHall(d.items[9]),/declaration identity\/envelope drift/);assert.equal(z.kit.root.children.length,0);assert.equal(z.kit.colliders.length,0);assert.equal(z.kit.rooms.length,0);z.kit.dispose(z.kit.root);
});
