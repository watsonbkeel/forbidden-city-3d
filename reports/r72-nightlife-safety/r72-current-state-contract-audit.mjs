import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const R72=process.env.R72_ROOT??'/workspace/scratch/02a8023d1a85/r72-nightlife-safety';
const R71=process.env.R71_ROOT??'/workspace/scratch/02a8023d1a85/r71-m-duanmen';
const OUT=process.env.R72_AUDIT_OUT??'/tmp/r72-current-state-contract-audit.json';
const load=(root,p)=>import(pathToFileURL(path.join(root,p)));
const {captureJiaotaiScene}=await load(R72,'tests/lib/r27-jiaotai-capture.mjs');
const {hallCapture}=await load(R72,'tests/lib/r58-taihe-beast-fixture.mjs');
const {release}=await load(R72,'tests/lib/r58-hall-beast-fixture.mjs');
const {PalaceBuilder:NewBuilder}=await load(R72,'src/scene/PalaceBuilder.js');
const {PalaceBuilder:OldBuilder}=await load(R71,'src/scene/PalaceBuilder.js');
const hash=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function delta(a,b){
 const pending=b.map((value,index)=>({value,index})),removed=[],retainedBefore=[],retainedAfter=[];
 for(const value of a){const j=pending.findIndex(p=>same(p.value,value));if(j<0)removed.push(value);else{const [match]=pending.splice(j,1);retainedBefore.push(value);retainedAfter.push(match);}}
 const added=pending.map(p=>p.value),oldOrderPreserved=retainedAfter.every((r,i)=>!i||r.index>retainedAfter[i-1].index);
 return{before:a.length,after:b.length,removed,added,oldOrderPreserved};
}
function leafDiff(a,b,p=''){
 if(same(a,b))return[];
 if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b))return[...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>leafDiff(a[k],b[k],`${p}.${k}`));
 return[{path:p,before:a,after:b}];
}
const report={schema:1,generatedAt:new Date().toISOString(),baseline:R71,candidate:R72,readOnly:true,limits:['CPU capture, not browser/GPU acceptance','Resident capture excludes streamed zones, optional GLBs, beds, characters, and RoomNightLights','Historical fail-closed hash dispatch is not migrated or bypassed'],inputs:{},halls:[],resident:{},passed:false};
for(const name of ['src/scene/PalaceBuilder.js','src/scene/palace/QianqingCentralSetting.js','src/scene/palace/special/TaiheCore.js','tests/lib/r27-jiaotai-capture.mjs','tests/lib/r58-taihe-beast-fixture.mjs'])report.inputs[name]={baselineSHA256:hash(fs.readFileSync(path.join(R71,name),'utf8')),candidateSHA256:hash(fs.readFileSync(path.join(R72,name),'utf8'))};
for(const name of ['太和殿','乾清宫','交泰殿']){
 const a=hallCapture(OldBuilder,name),b=hallCapture(NewBuilder,name),A=a.summary,B=b.summary;
 const row={name,remainderSame:same(A.remainder,B.remainder),roofSame:same(A.roof,B.roof),roofTrianglesSame:A.roofTriangles===B.roofTriangles,recordsSame:same(A.records,B.records),colliders:delta(A.physics.colliders,B.physics.colliders),walkables:delta(A.physics.walkables,B.physics.walkables)};
 report.halls.push(row);assert.ok(row.remainderSame&&row.roofSame&&row.roofTrianglesSame&&row.recordsSame,`${name}: non-target geometry changed`);
 const expected=name==='太和殿'?[1,8,0,8]:name==='乾清宫'?[1,27,0,27]:[0,0,0,0];
 assert.deepEqual([row.colliders.removed.length,row.colliders.added.length,row.walkables.removed.length,row.walkables.added.length],expected);
 assert.ok(row.colliders.oldOrderPreserved&&row.walkables.oldOrderPreserved);
 for(const c of[a,b]){release(c.group);for(const m of c.builder.ownedMaterials)m.dispose();}
}
const A=captureJiaotaiScene(OldBuilder),B=captureJiaotaiScene(NewBuilder);
report.resident={beforeSHA256:hash(A),afterSHA256:hash(B),equalFields:{},beforeCost:{meshes:A.meshes.length,graph:A.graph.length,geometryBytes:A.geometryBytes,uniqueMaterials:A.uniqueMaterials,uniqueTextures:A.uniqueTextures},afterCost:{meshes:B.meshes.length,graph:B.graph.length,geometryBytes:B.geometryBytes,uniqueMaterials:B.uniqueMaterials,uniqueTextures:B.uniqueTextures},graphChanges:leafDiff(A.graph,B.graph,'graph'),colliders:delta(A.navigation.colliders,B.navigation.colliders),walkables:delta(A.navigation.walkables,B.navigation.walkables)};
for(const field of Object.keys(A).filter(k=>!['graph','navigation'].includes(k))){report.resident.equalFields[field]=same(A[field],B[field]);assert.ok(report.resident.equalFields[field],`resident ${field} changed`);}
assert.deepEqual(report.resident.graphChanges,[{path:'graph.161.userData.qianqingCentral.navigation',before:'INHERITED_EXCLUSION_IDENTICAL_NO_NEW_STEP_ROUTE',after:'R72_LOCAL_SOLIDS_STEPS_AND_SIDE_SEAT_APPROACH'}]);
assert.deepEqual([report.resident.colliders.removed.length,report.resident.colliders.added.length,report.resident.walkables.removed.length,report.resident.walkables.added.length],[2,35,0,35]);
assert.ok(report.resident.colliders.oldOrderPreserved&&report.resident.walkables.oldOrderPreserved,'retained navigation order changed');
report.passed=true;fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:true,output:OUT,nonTargetFields:report.resident.equalFields,graphChanges:report.resident.graphChanges,nav:{colliders:[A.navigation.colliders.length,B.navigation.colliders.length],walkables:[A.navigation.walkables.length,B.navigation.walkables.length]}}));
