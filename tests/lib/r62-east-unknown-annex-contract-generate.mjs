// Bounded, explicit contract generation. Never imported by the existing-W consumer.
import fs from 'node:fs';import {gzipSync} from 'node:zlib';import * as THREE from 'three';
import {fixture,indices,baselineTargets,meshes,boxRow,snapshot,hash} from './r62-east-unknown-annex-fixture.mjs';
import {geometryKeys,boxKey} from './r58-gallery-world-check.mjs';
import {applyEastUnknownAnnexInventory} from '../../src/scene/palace/special/EastUnknownAnnexInventory.js';
const halls=[],baseline=[];
for(const index of indices){const a=fixture(index),before=snapshot(a.kit),oldCols=a.kit.colliders.slice(),targets=baselineTargets(a),removedTriangles=targets.flatMap(m=>[...geometryKeys(m)]),floors=meshes(a.built.f).filter(m=>m.material===a.kit.floorMat),retainedFloorTriangles=floors.flatMap(m=>[...geometryKeys(m)]),bounds=boxRow(new THREE.Box3().setFromObject(a.built.f));
 applyEastUnknownAnnexInventory(a.kit,a.ctx,a.built);const {id,...room}=a.kit.rooms[0],removedColliders=oldCols.filter(c=>!a.kit.colliders.includes(c)).map(boxKey),retainedPlatformColliders=a.kit.colliders.filter(c=>c.min.y===0&&c.max.y===a.original.ph).map(boxKey),floorSupports=a.kit.walkables.filter(w=>w.type==='box').map(w=>boxKey(w.box));
 halls.push({index,target:a.item.furnishingPolicy.target,bounds,room,removedMeshes:targets.length,removedTriangles,retainedFloorTriangles,removedColliders,retainedPlatformColliders,floorSupports});
 baseline.push({index,meshes:before.meshes.length,geometryHash:hash(before.meshes),colliders:before.colliders,walkables:before.walkables,rooms:before.rooms,maps:before.maps,structures:before.structures});a.dispose();}
fs.writeFileSync(new URL('../fixtures/r62-east-unknown-annex-world-contract.json.gz',import.meta.url),gzipSync(JSON.stringify({schema:'r62-east-unknown-annex-contract-v1',baseline:'6b396800b6a03582aebf513fcef4966e9f5d0db3',scope:'Exact 24 legacy furnishRoom shape/COL removal and floor retention. Not complete facade or interior acceptance.',halls})));
fs.writeFileSync('reports/r62-east-unknown-annex/r61-baseline.json',JSON.stringify({baseline:'6b396800b6a03582aebf513fcef4966e9f5d0db3',scope:'24 bounded pre-removal production hall constructors; frozen previous expectation, no new acceptance claim.',halls:baseline},null,2)+'\n');
