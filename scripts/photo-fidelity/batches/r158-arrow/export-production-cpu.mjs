// Real ZoneBase outer-east path, no finalizer or module injection. CPU only.
import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';import {gzipSync,gunzipSync} from 'node:zlib';
import * as T from 'three';
import '../../../../tests/lib/inner-palace-fixture.mjs';
import {realTextureLibrary} from '../../../../tests/lib/r48-real-texture-library.mjs';
import {exportProductionView} from '../../../../tests/lib/r51-production-raster.mjs';
import {ZoneBase} from '../../../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../../../src/utils/Collision.js';
import {assertArrowCentralNameboardRemovedInWorld} from '../../../../tests/lib/r158-arrow-nameboard-world-check.mjs';
if(!global.gc)throw Error('Run with --expose-gc after the serialized World tests');
if(!process.argv[2])throw Error('Explicit NEW evidence directory required');
const out=path.resolve(process.argv[2]);if(fs.existsSync(out))throw Error('Do not overwrite existing evidence');fs.mkdirSync(out,{recursive:true});
const views=[['south-wide',[0,2.8,-35],[0,6.2,-6.8],55],['south-secondary-detail',[5.5,4.6,-14.5],[5.5,4.5,-6.8],42],['north-retained',[0,3.3,24],[0,5.5,6.8],55]];
const data=JSON.parse(fs.readFileSync('data/zones/outer-east.json')),lib=realTextureLibrary(),b=new ZoneBase(lib,data);let built;
try{built=b.build();const scene=new T.Scene();scene.add(built.group);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(built.colliders);cm.addWalkables(built.walkables);const actual=assertArrowCentralNameboardRemovedInWorld({scene,cm});
 for(const[name,eye,target,fov]of views){global.gc();const camera=new T.PerspectiveCamera(fov,960/540,.03,180);camera.position.set(eye[0]-154.7,eye[1],eye[2]+78.8);camera.lookAt(target[0]-154.7,target[1],target[2]+78.8);camera.updateMatrixWorld(true);const file=path.join(out,name+'.json.gz');exportProductionView({scene,camera,characters:{manager:{simulationSeconds:0}}},file,{far:80});const capture=JSON.parse(gunzipSync(fs.readFileSync(file)));capture.label='Uninjected Arrow cumulative production / '+name;fs.writeFileSync(file,gzipSync(JSON.stringify(capture)));execFileSync('python',['scripts/r101-plaque/render-cpu.py',file,path.join(out,name+'.png')],{stdio:'pipe'});}
 const sourcePaths=['src/scene/palace/special/EnclosedPavilions.js','src/scene/palace/special/ArrowSouthDoorLattice.js','src/scene/palace/special/ArrowSouthNameboard.js','src/scene/palace/special/ArrowSouthKnees.js','data/zones/outer-east.json'];const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');const proof={scope:'UNINJECTED_COMPLETE_OUTER_EAST_ZONE_CPU_BASE_COLOR_NOT_FULL_WORLD_OR_GPU',sourceHashes:Object.fromEntries(sourcePaths.map(p=>[p,hash(p)])),views,viewport:[960,540],aspect:960/540,actualGeometryConsumer:actual,accepted:false,visualAcceptance:'VERIFY_PENDING',wholeObjectAccepted:false,limitations:['No PBR normal maps shadows postprocessing or GPU validation','Not a source-camera registration or survey','North view is retained geometry diagnostic, not new documentary proof'],outputHashes:Object.fromEntries(fs.readdirSync(out).map(n=>[n,hash(path.join(out,n))]))};fs.writeFileSync(path.join(out,'PROOF.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify({scope:proof.scope,views:views.length,actualGeometryConsumer:actual}));
}finally{if(built)b.dispose();else b.kit.dispose(b.kit.root);lib.dispose();global.gc();}
