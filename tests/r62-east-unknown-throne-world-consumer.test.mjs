import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {CollisionManager} from '../src/utils/Collision.js';
import {fixture,indices,meshes,seatBox} from './lib/r62-east-unknown-throne-fixture.mjs';
import {applyEastUnknownThroneInventory} from '../src/scene/palace/special/EastUnknownThroneInventory.js';
import {assertEastUnknownThroneInventoryInWorld} from './lib/r62-east-unknown-throne-world-check.mjs';
test('R62 existing-W consumer verifies raw and merged five LOCAL halls; rejects ghost shape/box/missing floor/metadata',()=>{
 const parts=indices.map(i=>fixture(i)),scene=new THREE.Scene(),cm=new CollisionManager();let ghost;
 for(const a of parts){if(!ghost){const original=meshes(a.built.f).find(m=>m.userData.thronePart==='seat');ghost=original.clone();ghost.geometry=original.geometry.clone();ghost.position.add(a.built.f.position);ghost.material=new THREE.MeshBasicMaterial({color:0x223344})}applyEastUnknownThroneInventory(a.kit,a.ctx,a.built);a.kit.buildPlaqueAtlas();scene.add(a.kit.root);cm.addColliders(a.kit.colliders);cm.addWalkables(a.kit.walkables)}
 const W={scene,cm,rooms:parts.flatMap(a=>a.kit.rooms)},r=assertEastUnknownThroneInventoryInWorld(W);assert.equal(r.absentTriangles,240);assert.equal(r.retainedFloorTriangles,10);
 assert.throws(()=>assertEastUnknownThroneInventoryInWorld({...W,rooms:W.rooms.slice(1)}),/unique candidate room/);
 cm.addColliders([seatBox(2)]);assert.throws(()=>assertEastUnknownThroneInventoryInWorld(W),/ghost throne collider/);cm.colliders.pop();
 scene.add(ghost);assert.throws(()=>assertEastUnknownThroneInventoryInWorld(W),/generic throne triangle remains/);ghost.removeFromParent();ghost.geometry.dispose();ghost.material.dispose();
 const floor=meshes(parts[0].built.f).find(m=>m.material===parts[0].kit.floorMat);floor.visible=false;assert.throws(()=>assertEastUnknownThroneInventoryInWorld(W),/floor triangle absent/);floor.visible=true;
 const record=parts[0].built.f.userData.structure;record.knownEmpty=true;assert.throws(()=>assertEastUnknownThroneInventoryInWorld(W),/explicit evidence knownEmpty/);record.knownEmpty=false;
 const merged=new THREE.Scene();for(const a of parts)merged.add(a.kit.finish());assert.deepEqual(assertEastUnknownThroneInventoryInWorld({...W,scene:merged}),r);for(const [i,a]of parts.entries())a.kit.dispose(merged.children[i]);
});
