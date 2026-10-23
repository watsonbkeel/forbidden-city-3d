import fs from 'node:fs';
import * as THREE from 'three';
import {PalaceBuilder as CurrentBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {library} from '../lib/inner-palace-fixture.mjs';
// The before checkout is an explicit input, never an automatically rewritten
// current fixture or a fabricated estimate. Its HEAD is recorded by the caller.
const oldPath=process.argv[2];if(!oldPath)throw Error('Frozen baseline PalaceBuilder file URL required');
const {PalaceBuilder:OldBuilder}=await import(oldPath);
function measure(Builder){const scene=new THREE.Scene(),b=new Builder(scene,library()),g=new THREE.Group();
 b.buildPlinth(g,{z0:65,w:28,d:28,y:8,ph:.6,stairW:4.6,stairSides:['south','north','east','west'],stairCenters:[-19/3,0,19/3],zhongheImperial:true});b.buildHall(g,structuredClone(PALACE_LAYOUT.find(h=>h.name==='中和殿')),8.6);
 const result={unmergedMeshes:0,triangles:0,unmergedAttributeBytes:0,unmergedIndexBytes:0,newDisplayMeshes:0,newDisplayTriangles:0,newLights:0,privateMaterials:b.ownedMaterials.length,colliders:b.colliders.length,walkables:b.walkables.length};
 g.traverse(m=>{if(m.isLight)result.newLights++;if(!m.isMesh)return;const n=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;result.unmergedMeshes++;result.triangles+=n;result.unmergedAttributeBytes+=Object.values(m.geometry.attributes).reduce((s,a)=>s+a.array.byteLength,0);result.unmergedIndexBytes+=m.geometry.index?.array.byteLength??0;if(m.userData.zhongheDisplayId){result.newDisplayMeshes++;result.newDisplayTriangles+=n;}});
 b.finish(g);const materials=new Set(),geometries=new Set();result.residentMergedMeshes=0;scene.traverse(m=>{if(m.isMesh){result.residentMergedMeshes++;materials.add(m.material);geometries.add(m.geometry);}});
 result.residentMaterials=materials.size;result.mergedAttributeBytes=[...geometries].reduce((s,g)=>s+Object.values(g.attributes).reduce((n,a)=>n+a.array.byteLength,0),0);result.mergedIndexBytes=[...geometries].reduce((s,g)=>s+(g.index?.array.byteLength??0),0);
 result.newTextureCount=[...materials].filter(m=>m.name.startsWith('r55-zhonghe-')&&m.map).length;result.drawCallUpperBoundNoFrustum=result.residentMergedMeshes;b.dispose();return result;
}
const before=measure(OldBuilder),after=measure(CurrentBuilder),delta=Object.fromEntries(Object.keys(before).map(k=>[k,after[k]-before[k]]));
const report={baseline:'edd1d6de15ad1393a45d6da8712e37ac3d8dc388',scope:'Actual local hall plus real plinth, before/after material merge. Draw-call upper bound only, not measured GPU calls or frame time. Attribute byte lengths, not total JS/GPU residency.',before,after,delta};
fs.writeFileSync(process.argv[3],JSON.stringify(report,null,2)+'\n');console.log(report);
