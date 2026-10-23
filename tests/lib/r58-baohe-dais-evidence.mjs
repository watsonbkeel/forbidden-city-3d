import fs from 'node:fs';import {gzipSync} from 'node:zlib';import {execFileSync} from 'node:child_process';import * as THREE from 'three';
import {hallFixture,baselineSource,hookSource,SHA} from './r58-baohe-dais-fixture.mjs';
import {exportProductionView} from './r51-production-raster.mjs';
const out='reports/r58-baohe-dais',views=[{id:'front',eye:[0,3.1,-6.5],target:[0,2.4,5],fov:60},{id:'oblique',eye:[11,6,-4.5],target:[0,2.3,4.5],fov:58}];
const manifest={baseCommit:'bf7b399f2e4937ef1a6f8c2ebf39f5596f163f91',kind:'ISOLATED_ACTUAL_BAOHE_HALL_CPU_GEOMETRY_DIAGNOSTIC_NOT_BROWSER',selectedImageSHA256:'04e2bd5c1794f7fc6c65c6bbf70932d3c7313e239816deb8ad867373cd1338ae',selectedImageRedistributed:false,ownerSourceSHA256:SHA(baselineSource),hookedOwnerSHA256:SHA(hookSource(baselineSource)),helperSHA256:SHA(fs.readFileSync('src/scene/palace/BaoheDaisApproach.js')),retainedSourceHashes:Object.fromEntries(fs.readdirSync('src/scene/palace').filter(f=>f.startsWith('Baohe')&&f!=='BaoheDaisApproach.js').map(f=>[f,SHA(fs.readFileSync('src/scene/palace/'+f))])),views:[]};
for(const candidate of[false,true]){const W=await hallFixture({candidate});try{for(const v of views){const camera=new THREE.PerspectiveCamera(v.fov,960/540,.03,100);camera.position.fromArray(v.eye);camera.lookAt(...v.target);const file=`${out}/${candidate?'after':'before'}-${v.id}.json.gz`;
 const data=exportProductionView({scene:W.scene,camera,characters:{manager:{simulationSeconds:0}}},file,{far:70});manifest.views.push({state:candidate?'after':'before',...v,...data,condition:'Isolated exact production hall geometry; stub material-library base colors, no textures, no production lighting, no actors; floor datum translated to0'});
}}finally{W.dispose();}}
fs.writeFileSync(`${out}/evidence-manifest.json`,JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync('/tmp/r58-baohe-owner-before.js',baselineSource);fs.writeFileSync('/tmp/r58-baohe-owner-after.js',hookSource(baselineSource));
let patch;try{patch=execFileSync('diff',['-u','--label','a/src/scene/PalaceBuilder.js','--label','b/src/scene/PalaceBuilder.js','/tmp/r58-baohe-owner-before.js','/tmp/r58-baohe-owner-after.js']);}catch(e){if(e.status!==1)throw e;patch=e.stdout;}
fs.writeFileSync(`${out}/HOOKUP.patch`,patch);console.log(JSON.stringify(manifest.views.map(v=>({state:v.state,id:v.id,triangles:v.triangles})),null,2));
