// Run the exact two-line integration hookup in a temporary sibling module.
// PalaceBuilder.js itself is never edited. Builds Wumen only, never a world.
import * as THREE from 'three';
import {writeFileSync,readFileSync,unlinkSync} from 'node:fs';
import {captureSource} from './lib/r58-wumen-pavilion-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {assertWumenNortheastColumnsInWorld} from './lib/r58-wumen-pavilion-world-check.mjs';
const sourceURL=new URL('../src/scene/PalaceBuilder.js',import.meta.url),tempURL=new URL(`../src/scene/.wumen-northeast-hook-${process.pid}.js`,import.meta.url);
const original=readFileSync(sourceURL,'utf8');let patched=original;
if(!patched.includes('refineWumenPavilionNorthColumns')){
 const importLine="import { buildWumenSouthPortalCanopies } from './palace/special/WumenSouthPortalCanopies.js';";
 const importAdd="import { refineWumenPavilionNorthColumns, WUMEN_NORTHEAST_PAVILION_ID } from './palace/special/WumenPavilionColumns.js';";
 const placement='        pb.position.set(s * hx, top, pz);';
 if(patched.split(importLine).length!==2||patched.split(placement).length!==2)throw Error('Hook source anchors changed');
 patched=patched.replace(importLine,`${importLine}\n${importAdd}`).replace(placement,`${placement}\n        if (s === -1 && pz === pN) refineWumenPavilionNorthColumns(pb, { instanceId: WUMEN_NORTHEAST_PAVILION_ID });`);
}
try {
 writeFileSync(tempURL,patched);
 const {PalaceBuilder}=await import(tempURL.href),source=captureSource(),scene=new THREE.Scene(),builder=new PalaceBuilder(scene,source.lib);
 builder.buildWumen(source.data);scene.updateMatrixWorld(true);const cm=new CollisionManager();cm.addColliders(builder.colliders);cm.addWalkables(builder.walkables);
 const report=assertWumenNortheastColumnsInWorld({scene,cm});
 if(JSON.stringify([builder.colliders,builder.walkables])!==JSON.stringify([source.builder.colliders,source.builder.walkables]))throw Error('Runtime registrations changed');
 if(readFileSync(sourceURL,'utf8')!==original)throw Error('Production builder unexpectedly changed');
 console.log(JSON.stringify({hookup:'PASS_EXACT_IMPORT_AND_NORTHEAST_BRANCH_CALL',productionBuilderUnedited:true,registeredColliders:builder.colliders.length,registeredWalkables:builder.walkables.length,report},null,2));builder.dispose();
} finally {unlinkSync(tempURL);}
