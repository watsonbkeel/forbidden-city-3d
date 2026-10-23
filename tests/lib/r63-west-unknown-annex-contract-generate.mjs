// Bounded, explicit contract generation. Never imported by the existing-W consumer.
import fs from 'node:fs';import {gzipSync} from 'node:zlib';import * as THREE from 'three';
import {fixture,indices,baselineTargets,meshes,boxRow,snapshot,hash} from './r63-west-unknown-annex-fixture.mjs';
import {geometryKeys,boxKey} from './r58-gallery-world-check.mjs';
import {applyWestUnknownAnnexInventory} from '../../src/scene/palace/special/WestUnknownAnnexInventory.js';
const halls=[],baseline=[];
for(const index of indices){const a=fixture(index),before=snapshot(a.kit),oldCols=a.kit.colliders.slice(),targets=baselineTargets(a),removedTriangles=targets.flatMap(m=>[...geometryKeys(m)]),floors=meshes(a.built.f).filter(m=>m.material===a.kit.floorMat),retainedFloorTriangles=floors.flatMap(m=>[...geometryKeys(m)]),bounds=boxRow(new THREE.Box3().setFromObject(a.built.f));
 applyWestUnknownAnnexInventory(a.kit,a.ctx,a.built);const retainedTriangles=[...geometryKeys(a.built.f)],retainedColliders=a.kit.colliders.map(boxKey),{id,...room}=a.kit.rooms[0],removedColliders=oldCols.filter(c=>!a.kit.colliders.includes(c)).map(boxKey),retainedPlatformColliders=a.kit.colliders.filter(c=>c.min.y===0&&c.max.y===a.original.ph).map(boxKey),floorSupports=a.kit.walkables.filter(w=>w.type==='box').map(w=>boxKey(w.box));
 halls.push({index,target:a.item.furnishingPolicy.target,bounds,room,removedMeshes:targets.length,removedTriangles,retainedTriangles,retainedFloorTriangles,removedColliders,retainedColliders,retainedPlatformColliders,floorSupports});
 baseline.push({index,meshes:before.meshes.length,geometryHash:hash(before.meshes),colliders:before.colliders,walkables:before.walkables,rooms:before.rooms,maps:before.maps,structures:before.structures});a.dispose();}
fs.writeFileSync(new URL('../fixtures/r63-west-unknown-annex-world-contract.json.gz',import.meta.url),gzipSync(JSON.stringify({schema:'r63-west-unknown-annex-contract-v1',baseline:'f87342d7e1506713df4a6877943eb377e8299593',scope:'Exact 13 legacy furnishRoom shape/COL removal and floor retention. Not complete facade or interior acceptance.',halls})));
fs.writeFileSync('reports/r63-west-unknown-annex/r62-baseline.json',JSON.stringify({baseline:'f87342d7e1506713df4a6877943eb377e8299593',scope:'13 bounded pre-removal production hall constructors; frozen previous expectation, no new acceptance claim.',halls:baseline},null,2)+'\n');
