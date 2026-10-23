// Actual local builder triangles. The inherited CourtKit.gateHall is the before
// source; the independent Zhendu builder is after. No full-world construction.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
import {zhenduFixture} from '../lib/r58-zhendu-fixture.mjs';
import {exportProductionView} from '../lib/r51-production-raster.mjs';
const out=process.argv[2]??'docs/validation/r58-zhendu/EVIDENCE';fs.mkdirSync(out,{recursive:true});
const after=zhenduFixture(),ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});
globalThis.document??={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const beforeKit=new CourtKit(after.lib),beforeScene=new THREE.Scene();
// Direct generic baseline call remains reproducible after parent dispatch edits.
const frame=beforeKit.frame(64.4,-214.2,0);beforeKit.gateHall(frame,{w:3.6,h:4.4,name:undefined,roof:'xieshan',brackets:true,layers:1});beforeScene.add(beforeKit.root);
for(const [name,material]of after.materials)material.color.set(TEXTURE_SPECS[name]?.fallback??'#b4ada3');
const cameras=[{id:'south',offset:[0,11,-57],target:[0,7,0]},{id:'south-oblique',offset:[33,17,-45],target:[0,7,0]},{id:'north-oblique',offset:[-31,16,43],target:[0,7,0]}];
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const sourceHashes=Object.fromEntries(['src/scene/palace/kit.js','src/scene/palace/special/ZhenduGateProfile.js','src/scene/palace/special/ZhenduGate.js','tests/lib/r58-zhendu-fixture.mjs'].map(p=>[p,hash(p)]));
const reports=[];
for(const [phase,scene]of [['before',beforeScene],['after',after.scene]])for(const c of cameras){
 const camera=new THREE.PerspectiveCamera(43,16/9,.03,180);camera.position.set(64.4+c.offset[0],c.offset[1],-214.2+c.offset[2]);camera.lookAt(64.4+c.target[0],c.target[1],-214.2+c.target[2]);camera.updateMatrixWorld(true);
 const file=path.join(out,`${phase}-${c.id}.json.gz`),summary=exportProductionView({scene,camera,characters:{manager:{simulationSeconds:0}}},file,{far:150});
 const d=JSON.parse(gunzipSync(fs.readFileSync(file)));delete d.characterSourceHashes;d.diagnosticSize=[960,540];d.label=`R58 ZHENDU ${phase.toUpperCase()} ${c.id.toUpperCase()}`;d.phase=phase;d.sourceHashes=sourceHashes;d.baselineCommit='755dd9ac5c6f8a8766c1db3e8e4f8fe17fa142da';
 d.kind='CPU diagnostic from actual local builder triangles, source fallback palette only. NO browser/GPU, textures, runtime shadows or photo visual acceptance.';fs.writeFileSync(file,gzipSync(JSON.stringify(d)));reports.push({...summary,phase,view:c.id});
}
fs.writeFileSync(path.join(out,'CAPTURE-RECORD.json'),JSON.stringify({kind:'CPU_DIAGNOSTIC_ONLY_NOT_BROWSER',baselineCommit:'755dd9ac5c6f8a8766c1db3e8e4f8fe17fa142da',sourceHashes,reports,profile:after.frame.userData.structure,
 pending:{browserBefore:true,browserAfter:true,matchedPhotoCamera:true,visualAcceptance:true},sourceImagesIncluded:false},null,2)+'\n');
console.log(JSON.stringify(reports.map(r=>({phase:r.phase,view:r.view,triangles:r.triangles})),null,2));
