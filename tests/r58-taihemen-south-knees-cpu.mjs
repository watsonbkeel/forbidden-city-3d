// Actual merged Taihemen-only production geometry. No world, browser or GLB.
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import * as THREE from 'three';
import {kneeFixture,triangleRows,hash,hook,enclosureSource} from './lib/r58-taihemen-knees-fixture.mjs';
import {TAIHEMEN_KNEE_VIEWS,assertTaihemenSouthKneesInWorld} from './lib/r58-taihemen-knees-world-check.mjs';
import {assertTaihemenInWorld} from './lib/r58-taihemen-world-check.mjs';
const out=process.argv[2]??'docs/current-state/r58-taihemen-south-knees/evidence';mkdirSync(out,{recursive:true});
const files=['src/scene/palace/special/TaihemenSouthKnees.js','src/scene/palace/special/TaihemenEnclosure.js','src/scene/palace/special/TaihemenProfile.js','src/scene/PalaceBuilder.js','src/scene/RoofBuilder.js','src/utils/MergeUtils.js','src/scene/palace/TaihemenSouthApproach.js','src/controls/FirstPerson.js','src/config/constants.js','tests/lib/r58-taihemen-knees-fixture.mjs','tests/lib/r58-taihemen-knees-world-check.mjs','tests/r58-taihemen-south-knees-cpu.mjs','tests/r58-taihemen-cpu-raster.py'];
const palette={roof_tile:'#ba913e',kit_ridge:'#bc9c53',wood_column:'#8b3b28',wall_red:'#a34b37',wall_brick:'#71695b',stone_slab:'#90897e',marble:'#d1c9b8',rafters:'#514631',caihua_beam:'#3e665a',dougong_band:'#4f6651',lattice_doors:'#4c3528',sumeru_band:'#c4bcad',balustrade:'#d2cabb',yulu:'#bcb3a3','taihemen-south-knee-teal':'#316363'};
const report={baselineCommit:'c85e770',captureHEAD:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 sourceHashes:Object.fromEntries(files.map(p=>[p,hash(readFileSync(p,'utf8'))])),
 baselineMethod:'Current production PalaceBuilder, with only the one new enclosure knee call removed in memory.',
 baselineEnclosureSHA256:hash(enclosureSource.replace(hook,'')),candidateEnclosureSHA256:hash(enclosureSource),
 kind:'ACTUAL_PRODUCTION_MERGED_GATE_TRIANGLES_CPU_DIAGNOSTIC_ONLY',status:'VERIFY_PENDING_BROWSER',
 warning:'Declared flat palette, no production texture rendering, WebGL, runtime lighting/shadow, browser screenshot, source-camera match, or visual acceptance.',states:{},views:[]};
for(const [state,candidate] of [['before',false],['after',true]]){
 const W=kneeFixture({candidate}),rows=triangleRows(W.root),retained=triangleRows(W.root,{includeKnees:false}),triangles=rows.map(r=>({v:r.v,color:palette[r.material.name]??'#8b683f',side:r.material.side,material:r.material.name}));
 report.states[state]={triangles:rows.length,mergedMeshes:W.root.children.filter(m=>m.isMesh).length,geometrySHA256:hash(rows),retainedTriangleCount:retained.length,retainedGeometryMaterialAttributeSHA256:hash(retained),
  columnsCount:W.builder.columns.length,columnsSHA256:hash(W.builder.columns),collidersCount:W.builder.colliders.length,collidersSHA256:hash(W.builder.colliders),walkablesCount:W.builder.walkables.length,walkablesSHA256:hash(W.builder.walkables),
  approachSHA256:hash(W.p),enclosureSHA256:hash(W.root.userData.taihemenSouthEnclosure),matrixSHA256:hash(W.root.matrixWorld.toArray()),existingVerandaCheck:assertTaihemenInWorld(W)};
 if(candidate)report.pureExistingWorldCheck=assertTaihemenSouthKneesInWorld(W);
 for(const view of TAIHEMEN_KNEE_VIEWS){
  const camera=new THREE.PerspectiveCamera(view.fov,16/9,.03,200);camera.position.fromArray(view.eye);camera.lookAt(...view.target);camera.updateMatrixWorld(true);
  const data={state,view:view.id,kind:report.kind,warning:report.warning,palette,camera:{...view,aspect:16/9,width:1280,height:720,matrixWorldInverse:camera.matrixWorldInverse.toArray(),projectionMatrix:camera.projectionMatrix.toArray()},triangles};
  const file=`${out}/${view.id}-${state}.json.gz`;writeFileSync(file,gzipSync(JSON.stringify(data)));report.views.push({state,view:view.id,file,camera:data.camera,geometrySHA256:hash(rows)});
 }W.builder.dispose();
}
const a=report.states.after,b=report.states.before;
report.delta={triangles:a.triangles-b.triangles,mergedMeshes:a.mergedMeshes-b.mergedMeshes,colliders:a.collidersCount-b.collidersCount,walkables:a.walkablesCount-b.walkablesCount};
report.retained=Object.fromEntries(['retainedGeometryMaterialAttributeSHA256','columnsSHA256','collidersSHA256','walkablesSHA256','approachSHA256','enclosureSHA256','matrixSHA256'].map(k=>[k,a[k]===b[k]]));
writeFileSync(`${out}/geometry-summary.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({delta:report.delta,retained:report.retained,minimumJumpHeadGap:report.pureExistingWorldCheck.minimumJumpHeadGap},null,2));
