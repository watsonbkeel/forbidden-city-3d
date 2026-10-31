// Final uninjected production path. CPU base-color diagnostic, never GPU acceptance.
import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import * as T from 'three';
import '../../../../tests/lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from '../../../../tests/lib/r48-real-texture-library.mjs';
import {exportProductionView} from '../../../../tests/lib/r51-production-raster.mjs';
import {ZoneBase} from '../../../../src/scene/zones/ZoneBase.js';
if(!global.gc)throw Error('Run node --expose-gc and serialize after full-suite terminal.');
if(!process.argv[2])throw Error('Explicit NEW evidence directory required');
const out=path.resolve(process.argv[2]);if(fs.existsSync(out))throw Error('Refuse to overwrite prior evidence');fs.mkdirSync(out,{recursive:true});
const data=JSON.parse(fs.readFileSync('data/zones/outer-east.json'));
const views=[['south-whole',[0,6,-34],[0,3.8,0],55],['north-whole',[0,7,36],[0,3.3,1],55],['south-approach',[11,7,-21],[0,1,-10],55],['north-approach',[16,11,28],[0,.8,12],58]];
const lib=realTextureLibrary(),b=new ZoneBase(lib,data);let result;
try{
 result=b.build();const record=result.group.userData.architecture.find(s=>s.id==='south-gate:wenhua');if(!record?.wenhuaGateApproaches||record.wenhuaGateApproaches.addedColliders!==3)throw Error('Production Wenhua approach finalizer missing');
 for(const[name,eye,target,fov]of views){global.gc();const camera=new T.PerspectiveCamera(fov,960/540,.03,180);camera.position.set(eye[0]-186.3,eye[1],eye[2]-245.2);camera.lookAt(target[0]-186.3,target[1],target[2]-245.2);camera.updateMatrixWorld(true);const file=path.join(out,`${name}.json.gz`);exportProductionView({scene:result.group,camera,characters:{manager:{simulationSeconds:0}}},file,{far:80});const capture=JSON.parse(gunzipSync(fs.readFileSync(file)));capture.label='Final uninjected Wenhua gate approaches / '+name;fs.writeFileSync(file,gzipSync(JSON.stringify(capture)));execFileSync('python',['scripts/r101-plaque/render-cpu.py',file,path.join(out,`${name}.png`)],{stdio:'pipe'});}
 const evidence={scope:'UNINJECTED_FULL_PRODUCTION_OUTER_EAST_FINAL_POSE_CPU_BASE_COLORS_ONLY_NOT_GPU',cameraProvenance:'Same four local camera numbers as author diagnostic; old images remain pre-seam historical, this is the final uninjected full-zone state',cameras:views,approachRecord:record.wenhuaGateApproaches,colliders:result.colliders.length,walkables:result.walkables.length,hashes:Object.fromEntries(fs.readdirSync(out).map(n=>[n,createHash('sha256').update(fs.readFileSync(path.join(out,n))).digest('hex')]))};fs.writeFileSync(path.join(out,'PROOF.json'),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify({scope:evidence.scope,cameras:views.length,colliders:evidence.colliders,walkables:evidence.walkables}));
}finally{if(result)b.dispose();else b.kit.dispose(b.kit.root);lib.dispose();global.gc();}
