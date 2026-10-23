// Explicit, bounded developer fixture generation only. Never called by consumer.
import fs from 'node:fs';
import * as THREE from 'three';
import {fixture,indices,meshes,boxRow,seatBox} from './r62-east-unknown-throne-fixture.mjs';
import {geometryKeys,boxKey} from './r58-gallery-world-check.mjs';
import {applyEastUnknownThroneInventory} from '../../src/scene/palace/special/EastUnknownThroneInventory.js';
const halls=[];
for(const index of indices){const a=fixture(index),targets=meshes(a.built.f).filter(m=>m.userData.role==='retained-throne-component'),removedTriangles=targets.flatMap(m=>[...geometryKeys(m)]),floors=meshes(a.built.f).filter(m=>m.material===a.kit.floorMat),retainedFloorTriangles=floors.flatMap(m=>[...geometryKeys(m)]),bounds=boxRow(new THREE.Box3().setFromObject(a.built.f));const removedCollider=boxKey(seatBox(index));
 const retainedPlatformColliders=a.kit.colliders.filter(c=>c.min.y===0&&c.max.y===a.item.ph).map(boxKey),floorSupports=a.kit.walkables.filter(w=>w.type==='box'&&w.box.max.y===a.item.ph).map(w=>boxKey(w.box));
 applyEastUnknownThroneInventory(a.kit,a.ctx,a.built);const {id,...room}=a.kit.rooms[0];halls.push({index,target:a.item.furnishingPolicy.target,structureId:a.built.f.userData.structure.id,bounds,room,removedTriangles,retainedFloorTriangles,removedCollider,retainedPlatformColliders,floorSupports});a.dispose()}
fs.writeFileSync(new URL('../fixtures/r62-east-unknown-throne-world-contract.json',import.meta.url),JSON.stringify({schema:'r62-east-unknown-throne-contract-v1',baseline:'e2d448e',scope:'Exact removed shapes, retained floors/platform supports and original navigation. Not complete facade acceptance.',halls},null,2)+'\n');
