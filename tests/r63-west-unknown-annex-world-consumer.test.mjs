import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {CollisionManager} from '../src/utils/Collision.js';
import {fixture,indices,baselineTargets,meshes} from './lib/r63-west-unknown-annex-fixture.mjs';
import {applyWestUnknownAnnexInventory} from '../src/scene/palace/special/WestUnknownAnnexInventory.js';
let api={};try{api=await import('./lib/r63-west-unknown-annex-world-check.mjs')}catch(e){if(e.code!=='ERR_MODULE_NOT_FOUND')throw e}
const check=W=>{assert.equal(typeof api.assertWestUnknownAnnexInventoryInWorld,'function','existing-W consumer must exist');return api.assertWestUnknownAnnexInventoryInWorld(W)};
test('R63 west annex existing-W consumer verifies 13 raw/merged LOCAL halls; rejects ghost render/COL/missing floor/evidence',()=>{
 const parts=indices.map(i=>fixture(i)),scene=new THREE.Scene(),cm=new CollisionManager();let ghost,ghostCollider;
 for(const a of parts){if(!ghost){const original=baselineTargets(a)[0];ghost=original.clone();ghost.geometry=original.geometry.clone();ghost.position.add(a.built.f.position);ghost.material=new THREE.MeshBasicMaterial({color:0x223344});const p=original.position,g=original.geometry.parameters;ghostCollider=new THREE.Box3(new THREE.Vector3(p.x-g.width/2,a.original.ph,p.z-g.depth/2),new THREE.Vector3(p.x+g.width/2,a.original.ph+g.height,p.z+g.depth/2)).applyMatrix4(a.built.f.matrixWorld)}applyWestUnknownAnnexInventory(a.kit,a.ctx,a.built);a.kit.buildPlaqueAtlas();scene.add(a.kit.root);cm.addColliders(a.kit.colliders);cm.addWalkables(a.kit.walkables)}
 const W={scene,cm,rooms:parts.flatMap(a=>a.kit.rooms)},r=check(W);assert.equal(r.halls,13);assert.equal(r.absentMeshes,80);assert.equal(r.absentColliders,80);assert.equal(r.retainedFloorTriangles,26);
 assert.throws(()=>check({...W,rooms:W.rooms.slice(1)}),/unique candidate room/);
 cm.addColliders([ghostCollider]);assert.throws(()=>check(W),/ghost annex collider/);cm.colliders.pop();
 scene.add(ghost);assert.throws(()=>check(W),/generic annex triangle remains/);ghost.removeFromParent();ghost.geometry.dispose();ghost.material.dispose();
 const floor=meshes(parts[0].built.f).find(m=>m.material===parts[0].kit.floorMat);floor.visible=false;assert.throws(()=>check(W),/floor triangle absent/);floor.visible=true;
 const record=parts[0].built.f.userData.structure;record.knownEmpty=true;assert.throws(()=>check(W),/explicit evidence knownEmpty/);record.knownEmpty=false;
 const merged=new THREE.Scene();for(const a of parts)merged.add(a.kit.finish());assert.deepEqual(check({...W,scene:merged}),r);for(const [i,a]of parts.entries())a.kit.dispose(merged.children[i]);
});
test('R63 west annex contract is immutable and the existing-W diagnostic does not modify registrations or resources',()=>{
 const contract=api.readWestUnknownAnnexContract();assert.equal(Object.isFrozen(contract),true);assert.equal(Object.isFrozen(contract.halls[0].room.doors),true);assert.throws(()=>contract.halls[0].room.knownEmpty=true,TypeError);
 const parts=indices.map(i=>fixture(i)),scene=new THREE.Scene(),cm=new CollisionManager();
 for(const a of parts){applyWestUnknownAnnexInventory(a.kit,a.ctx,a.built);scene.add(a.kit.root);cm.addColliders(a.kit.colliders);cm.addWalkables(a.kit.walkables)}
 const W={scene,cm,rooms:parts.flatMap(a=>a.kit.rooms)};scene.updateMatrixWorld(true);
 const state=()=>({rooms:structuredClone(W.rooms),cols:cm.colliders.map(c=>[c.box.min.toArray(),c.box.max.toArray()]),walkables:cm.walkables.map(w=>({type:w.type,box:w.box?[w.box.min.toArray(),w.box.max.toArray()]:null})),objects:parts.map(a=>[...a.built.f.children]),metadata:parts.map(a=>structuredClone(a.built.f.userData))});
 const before=state();for(const a of parts)a.kit.root.traverse(m=>{if(m.geometry)m.geometry.addEventListener('dispose',()=>assert.fail('consumer may not dispose geometry'));if(m.material)m.material.addEventListener('dispose',()=>assert.fail('consumer may not dispose materials'))});
 Object.freeze(W.rooms);Object.freeze(cm.colliders);Object.freeze(cm.walkables);Object.freeze(W);
 assert.equal(check(W).halls,13);assert.deepEqual(state(),before);
 for(const a of parts){a.kit.root.traverse(m=>{if(m.geometry)m.geometry._listeners={};if(m.material)m.material._listeners={}});a.dispose()}
});
test('R63 west annex canonical route export preserves all 13 rotated outside-inside-outside probes',()=>{
 assert.equal(typeof api.westUnknownAnnexEntryPoints,'function');
 const contract=api.readWestUnknownAnnexContract();
 for(const hall of contract.halls){const room=hall.room,door=room.doors[0],before=structuredClone(room),points=api.westUnknownAnnexEntryPoints(room),dx=(room.min.x+room.max.x)/2-door.x,dz=(room.min.z+room.max.z)/2-door.z,nx=Math.abs(dx)>Math.abs(dz)?Math.sign(dx):0,nz=nx?0:Math.sign(dz),expected=[[door.x-nx*3,door.z-nz*3],[door.x+nx*2.2,door.z+nz*2.2],[door.x-nx*3,door.z-nz*3]];
  for(let i=0;i<3;i++)for(let j=0;j<2;j++)assert.ok(Math.abs(points[i][j]-expected[i][j])<1e-10,hall.target);assert.deepEqual(room,before);
 }
 assert.throws(()=>api.westUnknownAnnexEntryPoints({min:{x:0,z:0},max:{x:0,z:0},doors:[{x:0,z:0}]}),/door-to-center/);
});
