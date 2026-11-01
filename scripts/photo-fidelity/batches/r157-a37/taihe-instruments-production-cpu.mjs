// Actual complete PalaceBuilder production scene, no method/finalizer injection.
// CPU base-color only: not browser/GPU or source-camera historical acceptance.
import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import * as T from 'three';import '../../../../tests/lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from '../../../../tests/lib/r48-real-texture-library.mjs';
import {exportProductionView} from '../../../../tests/lib/r51-production-raster.mjs';
import {PalaceBuilder} from '../../../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../../../src/scene/Layout.js';
if(!global.gc||!process.argv[2])throw Error('--expose-gc and NEW output directory required');
const out=path.resolve(process.argv[2]);if(fs.existsSync(out))throw Error('Do not overwrite evidence');fs.mkdirSync(out,{recursive:true});
const scene=new T.Scene(),lib=realTextureLibrary(),b=new PalaceBuilder(scene,lib),hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
try{
 b.buildAll(PALACE_LAYOUT);scene.updateMatrixWorld(true);const records=[];scene.traverse(g=>records.push(...(g.userData.architecture??[]).filter(p=>p.id==='axis/taihe-terrace-instruments')));if(records.length!==1)throw Error('Actual merged pair missing/duplicated');
 const target=b.colliders.filter(c=>c.triangleSupport?.id.startsWith('taihe-terrace-instrument:'));if(target.length!==29)throw Error('Actual physical pair not29');
 const views=[];
 for(const a of records[0].instruments)for(const[v,offset]of[['front',[0,1.8,-6]],['quarter',[4,3.3,-5]],['rear',[-4,3.3,5]]]){
  global.gc();const camera=new T.PerspectiveCamera(40,960/540,.03,100),eye=[a.centerX+offset[0],a.baseY+offset[1],a.centerZ+offset[2]],look=[a.centerX,a.baseY+1.45,a.centerZ];camera.position.set(...eye);camera.lookAt(...look);camera.updateMatrixWorld(true);
  const name=a.kind+'-'+v,file=path.join(out,name+'.json.gz');exportProductionView({scene,camera,characters:{manager:{simulationSeconds:0}}},file,{far:25});const captured=JSON.parse(gunzipSync(fs.readFileSync(file)));captured.label='Uninjected Taihe production / '+name+' / CPU only';fs.writeFileSync(file,gzipSync(JSON.stringify(captured)));execFileSync('python',['scripts/r101-plaque/render-cpu.py',file,path.join(out,name+'.png')],{stdio:'pipe'});views.push({name,eye,look,fov:40});
 }
 const inputs=['src/scene/PalaceBuilder.js','src/scene/palace/special/TaiheTerraceInstruments.js','src/scene/Layout.js','src/utils/Collision.js','src/utils/TriangleSupport.js'];
 const proof={scope:'UNINJECTED_COMPLETE_PALACE_BUILDER_SCENE_CPU_BASE_COLOR_NOT_COMPLETE_WORLD_OR_GPU',sourceHashes:Object.fromEntries(inputs.map(p=>[p,hash(p)])),views,viewport:[960,540],actualPair:records[0],actualTriangleOwners:target.length,accepted:false,wholeObjectAccepted:false,limitations:['No texture PBR shader shadow or GPU verification','Not registered source camera or measured dimensions','Rear is unverified compatibility geometry, not documentary evidence'],outputHashes:Object.fromEntries(fs.readdirSync(out).map(n=>[n,hash(path.join(out,n))]))};fs.writeFileSync(path.join(out,'PROOF.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify({views:views.length,owners:target.length,accepted:false}));
}finally{b.dispose();lib.dispose();global.gc();}
