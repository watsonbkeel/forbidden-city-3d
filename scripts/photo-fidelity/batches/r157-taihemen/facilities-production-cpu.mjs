// Actual complete PalaceBuilder production scene, no method/finalizer injection.
// CPU base-color only: not browser/GPU or source-camera historical acceptance.
import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import * as T from 'three';import '../../../../tests/lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from '../../../../tests/lib/r48-real-texture-library.mjs';
import {exportProductionView} from '../../../../tests/lib/r51-production-raster.mjs';
import {PalaceBuilder} from '../../../../src/scene/PalaceBuilder.js';
import {Environment} from '../../../../src/scene/Environment.js';
import {PALACE_LAYOUT} from '../../../../src/scene/Layout.js';
if(!global.gc||!process.argv[2])throw Error('--expose-gc and NEW output directory required');
const out=path.resolve(process.argv[2]);if(fs.existsSync(out))throw Error('Do not overwrite evidence');fs.mkdirSync(out,{recursive:true});
const scene=new T.Scene(),lib=realTextureLibrary(),b=new PalaceBuilder(scene,lib),environment=new Environment(scene,null,lib),hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
try{
 environment.setupGround();b.buildAll(PALACE_LAYOUT);scene.updateMatrixWorld(true);const root=scene.getObjectByName('太和门'),profile=root?.userData.taihemenSouth;
 if(profile?.candidateStatus!=='PRODUCTION_C_SOURCE_FIT_NOT_SURVEY'||profile.fixtures.filter(f=>f.implementedInProduction&&f.productionBinding===f.id).length!==6)throw Error('Actual source-bound production six fixtures absent');
 const target=b.colliders.filter(c=>c.taihemenObservedSource==='axis/taihemen-observed-approach');if(target.length!==77)throw Error('Actual source-owned approach not77');
 const views=[{name:'central-oblique-close',eye:[8,6,-246],look:[0,1.7,-235.5],fov:61},{name:'central-foot-close',eye:[0,1.7,-246.5],look:[0,1.2,-237],fov:65},{name:'south-front',eye:[0,1.7,-267],look:[0,6,-228],fov:55},{name:'west-oblique',eye:[24,2,-254],look:[0,3,-233],fov:57},{name:'east-oblique',eye:[-24,2,-254],look:[0,3,-233],fov:57},{name:'south-top',eye:[0,45,-238],look:[0,0,-228],fov:63},{name:'censer-close',eye:[4.155,1.5,-237.2],look:[4.155,1.1,-234.175],fov:46},{name:'pavilion-close',eye:[-14.56,1.8,-244],look:[-14.56,1.9,-239.4],fov:52},{name:'box-close',eye:[14.09,1.35,-242.2],look:[14.09,.7,-239.65],fov:42}];
 for(const {name,eye,look,fov}of views){global.gc();const camera=new T.PerspectiveCamera(fov,960/540,.03,150);camera.position.set(...eye);camera.lookAt(...look);camera.updateMatrixWorld(true);
  const file=path.join(out,name+'.json.gz');exportProductionView({scene,camera,characters:{manager:{simulationSeconds:0}}},file,{far:100});const captured=JSON.parse(gunzipSync(fs.readFileSync(file)));captured.label='Uninjected Taihemen facilities production / '+name+' / CPU only';fs.writeFileSync(file,gzipSync(JSON.stringify(captured)));execFileSync('python',['scripts/r101-plaque/render-cpu.py',file,path.join(out,name+'.png')],{stdio:'pipe'});
 }
 const inputs=['src/scene/PalaceBuilder.js','src/scene/palace/TaihemenObservedApproach.js','src/scene/palace/TaihemenObservedSolids.js','src/scene/palace/TaihemenObservedFixtures.js','src/scene/palace/TaihemenObservedTransaction.js','src/scene/Layout.js','src/utils/Collision.js','src/utils/TriangleSupport.js'];
 const proof={scope:'UNINJECTED_COMPLETE_PALACE_BUILDER_SCENE_CPU_BASE_COLOR_NOT_COMPLETE_WORLD_OR_GPU',sourceHashes:Object.fromEntries(inputs.map(p=>[p,hash(p)])),views,viewport:[960,540],actualProfile:profile,actualSourceOwnedColliders:target.length,accepted:false,wholeObjectAccepted:false,limitations:['No texture PBR shader shadow or GPU verification','Not registered source camera or measured dimensions','Four censers class-form only, individual identities and hidden sides unknown','Views reuse isolated-C diagnostic cameras, not registered photographic cameras'],outputHashes:Object.fromEntries(fs.readdirSync(out).map(n=>[n,hash(path.join(out,n))]))};fs.writeFileSync(path.join(out,'PROOF.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify({views:views.length,owners:target.length,accepted:false}));
}finally{environment.dispose();b.dispose();lib.dispose();global.gc();}
