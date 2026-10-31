// Real complete outer-east construction + terminal hook injection. Flat-base
// CPU perspective evidence only; no texture/GPU/mobile/performance acceptance.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {gzipSync,gunzipSync} from 'node:zlib';
import * as T from 'three';
import '../../../../tests/lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from '../../../../tests/lib/r48-real-texture-library.mjs';
import {exportProductionView} from '../../../../tests/lib/r51-production-raster.mjs';
import {ZoneBase} from '../../../../src/scene/zones/ZoneBase.js';
import {finishWenhuaCentralDoors} from '../../../../src/scene/palace/special/WenhuaCentralDoors.js';
if(!global.gc)throw Error('Run this bounded diagnostic SERIALIZED with node --expose-gc; do not export concurrently with a broad test suite.');
const out=path.resolve(process.argv[2]??'../r158-wenhua-court-evidence');fs.mkdirSync(out,{recursive:true});
const data=JSON.parse(fs.readFileSync('data/zones/outer-east.json'));
const stats=root=>{let meshes=0,triangles=0,bytes=0;const gs=new Set(),ms=new Set();root.traverse(m=>{if(!m.isMesh)return;meshes++;triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;gs.add(m.geometry);ms.add(m.material)});for(const g of gs){for(const a of Object.values(g.attributes))bytes+=a.array.byteLength;if(g.index)bytes+=g.index.array.byteLength}return{meshes,triangles,bytes,materials:ms.size}};
const views=[['south-whole',[0,3.1,-24],[0,4,-2],48],['south-central',[0,3.2,-17],[0,4,-8.5],48],['south-oblique',[-6,3.5,-15],[0,3.8,-8.5],48],['north-reverse',[0,3.3,-4.5],[0,3.8,-8.5],65]];
const rows=[];
for(const candidate of[false,true]){
 global.gc?.();
 const mode=candidate?'six-leaf-candidate':'inherited-two-leaf',lib=realTextureLibrary(),b=new ZoneBase(lib,data),finish=b.kit.finish.bind(b.kit);let source;
 b.kit.finish=()=>{if(candidate)finishWenhuaCentralDoors(b.kit);source=stats(b.kit.root);return finish()};
 const start=performance.now(),result=b.build(),buildMergeMs=performance.now()-start,record=result.group.userData.architecture.find(s=>s.profile==='wenhua-front');
 rows.push({mode,source,merged:stats(result.group),buildMergeMs,colliders:result.colliders.length,walkables:result.walkables.length,rooms:result.rooms.length,doorRecord:record.wenhuaCentralDoors??null});
 for(const[name,eye,target,fov]of views){global.gc?.();const camera=new T.PerspectiveCamera(fov,960/540,.03,180);camera.position.set(eye[0]-186.4,eye[1],eye[2]-199);camera.lookAt(target[0]-186.4,target[1],target[2]-199);camera.updateMatrixWorld(true);const file=path.join(out,`${mode}-${name}.json.gz`);exportProductionView({scene:result.group,camera,characters:{manager:{simulationSeconds:0}}},file,{far:80});const capture=JSON.parse(gunzipSync(fs.readFileSync(file)));capture.label=mode+' '+name;fs.writeFileSync(file,gzipSync(JSON.stringify(capture)));const im=file.replace('.json.gz','.png');execFileSync('python',['scripts/r101-plaque/render-cpu.py',file,im],{stdio:'pipe'});}
 b.dispose();lib.dispose();global.gc?.();
}
const evidence={scope:'FULL_PRODUCTION_OUTER_EAST_WITH_PRE_MERGE_CENTRAL_HOOK_INJECTION_CPU_BASE_COLORS_ONLY_NOT_GPU_OR_DEVICE',parent:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),rows,cameras:views,hashes:Object.fromEntries(fs.readdirSync(out).filter(n=>n.endsWith('.png')||n.endsWith('.json.gz')).map(n=>[n,createHash('sha256').update(fs.readFileSync(path.join(out,n))).digest('hex')]))};
fs.writeFileSync(path.join(out,'wenhua-central-proof.json'),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence.rows,null,2));
