import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {CollisionManager} from '../src/utils/Collision.js';
import {fixture,indices,baselineTargets,meshes} from './lib/r62-east-unknown-annex-fixture.mjs';
import {applyEastUnknownAnnexInventory} from '../src/scene/palace/special/EastUnknownAnnexInventory.js';
let api={};try{api=await import('./lib/r62-east-unknown-annex-world-check.mjs')}catch(e){if(e.code!=='ERR_MODULE_NOT_FOUND')throw e}
const check=W=>{assert.equal(typeof api.assertEastUnknownAnnexInventoryInWorld,'function','existing-W consumer must exist');return api.assertEastUnknownAnnexInventoryInWorld(W)};
test('R62 annex existing-W consumer verifies 24 raw/merged LOCAL halls; rejects ghost render/COL/missing floor/evidence',()=>{
 const parts=indices.map(i=>fixture(i)),scene=new THREE.Scene(),cm=new CollisionManager();let ghost,ghostCollider;
 for(const a of parts){if(!ghost){const original=baselineTargets(a)[0];ghost=original.clone();ghost.geometry=original.geometry.clone();ghost.position.add(a.built.f.position);ghost.material=new THREE.MeshBasicMaterial({color:0x223344});const p=original.position,g=original.geometry.parameters;ghostCollider=new THREE.Box3(new THREE.Vector3(p.x-g.width/2,a.original.ph,p.z-g.depth/2),new THREE.Vector3(p.x+g.width/2,a.original.ph+g.height,p.z+g.depth/2)).applyMatrix4(a.built.f.matrixWorld)}applyEastUnknownAnnexInventory(a.kit,a.ctx,a.built);a.kit.buildPlaqueAtlas();scene.add(a.kit.root);cm.addColliders(a.kit.colliders);cm.addWalkables(a.kit.walkables)}
 const W={scene,cm,rooms:parts.flatMap(a=>a.kit.rooms)},r=check(W);assert.equal(r.halls,24);assert.equal(r.absentMeshes,168);assert.equal(r.absentColliders,168);assert.equal(r.retainedFloorTriangles,48);
 assert.throws(()=>check({...W,rooms:W.rooms.slice(1)}),/unique candidate room/);
 cm.addColliders([ghostCollider]);assert.throws(()=>check(W),/ghost annex collider/);cm.colliders.pop();
 scene.add(ghost);assert.throws(()=>check(W),/generic annex triangle remains/);ghost.removeFromParent();ghost.geometry.dispose();ghost.material.dispose();
 const floor=meshes(parts[0].built.f).find(m=>m.material===parts[0].kit.floorMat);floor.visible=false;assert.throws(()=>check(W),/floor triangle absent/);floor.visible=true;
 const record=parts[0].built.f.userData.structure;record.knownEmpty=true;assert.throws(()=>check(W),/explicit evidence knownEmpty/);record.knownEmpty=false;
 const merged=new THREE.Scene();for(const a of parts)merged.add(a.kit.finish());assert.deepEqual(check({...W,scene:merged}),r);for(const [i,a]of parts.entries())a.kit.dispose(merged.children[i]);
});
