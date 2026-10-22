/** Reproducible CPU submission microbenchmark, never a GPU/frame-time verdict. */
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import path from 'node:path';
import * as THREE from 'three';
import {buildCharacterWorld} from '../tests/p3c-world-fixture.mjs';
import {CharacterSystem} from '../src/scene/characters/CharacterSystem.js';
import {CHARACTER_REGISTRY} from '../data/characters/index.js';
const output=process.argv[2]??'reports/r50/cpu-submission-benchmark.json';
const W=await buildCharacterWorld(),camera=new THREE.PerspectiveCamera(60,16/9,.1,2500);
const system=new CharacterSystem({scene:W.scene,camera,collisionManager:W.cm,zoneManager:W.zoneManager,documentObject:null,contentApproved:true});
const position=id=>{const a=CHARACTER_REGISTRY.actors.find(a=>a.id===id);const r=W.adapter.resolve(a,system.metricsFor(a));if(r.status!=='ready')throw Error(id+': '+r.reason);return r.position;};
const emperor=position('taihe-emperor-01'),consort=position('chuxiu-consort-01'),patrol=position('west-lane-guard-01');
const officials=CHARACTER_REGISTRY.actors.filter(a=>a.templateId==='official-ceremonial').map(a=>position(a.id));const court=officials.reduce((out,p)=>out.map((v,i)=>v+p[i]/officials.length),[0,0,0]);
const plus=(p,q)=>p.map((v,i)=>v+q[i]);
const views=[
 {id:'emperor-close',eye:plus(emperor,[0,1.4,-3]),look:plus(emperor,[0,1.1,0])},
 {id:'court-formation',eye:plus(court,[0,3,-21]),look:plus(court,[0,1,0])},
 {id:'patrol-near',eye:plus(patrol,[4,2,4]),look:plus(patrol,[0,1,0])},
 {id:'inner-seat',eye:plus(consort,[0,1.5,-3]),look:plus(consort,[0,1,0])},
 {id:'helicopter-aerial',eye:[0,150,-190],look:[0,0,200]},
 {id:'court-night',eye:plus(court,[0,3,-21]),look:plus(court,[0,1,0]),daylight:0},
];
const percentile=(v,q)=>{const sorted=[...v].sort((a,b)=>a-b);return sorted[Math.floor((sorted.length-1)*q)]??0;};
const sourceInput={};
for(const root of ['src/scene/characters','data/characters'])for(const name of fs.readdirSync(root)){const file=path.join(root,name);if(fs.statSync(file).isFile())sourceInput[file]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}
for(const file of ['scripts/p3c-cpu-benchmark.mjs','tests/p3c-world-fixture.mjs','main.js','src/ui/SettingsMenu.js','src/ui/PerfHUD.js'])sourceInput[file]=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const result={sourceInput,kind:'CPU-only submission microbenchmark, not browser, GPU, full-frame A/B, or visual acceptance',environment:{dateUTC:new Date().toISOString(),node:process.version,three:THREE.REVISION,cpu:os.cpus()[0]?.model,platform:os.platform(),arch:os.arch()},method:{warmupFrames:1800,sampleFrames:3600,repetitions:3,dtSeconds:1/60,simulationWarmupSeconds:30,simulationSampleSeconds:60,wallClockScheduling:'tight loop, NOT a real-time 60-second display recording',resolution:'projection 1920x1080 only; no framebuffer',drawCalls:'main-pass InstancedMesh count estimate; not renderer.info actual',gpuFrameTime:'unverified',currentProductionGate:'awaiting-user-C1-approval'},runs:[]};
camera.position.fromArray(views[1].eye);camera.lookAt(...views[1].look);camera.updateMatrixWorld();
const coldStart=performance.now();system.update(1/60,{quality:'high',daylight:1,viewportHeight:1080});result.coldFirstSceneFrameMs=performance.now()-coldStart;result.coldSnapshot=system.snapshot();
for(const quality of ['high','low'])for(const view of views){
 camera.position.fromArray(view.eye);camera.lookAt(...view.look);camera.updateMatrixWorld();
 for(let repeat=1;repeat<=3;repeat++){
  const pair={view:view.id,quality,repeat,eye:view.eye,look:view.look};
  for(const enabled of [false,true]){
   system.setEnabled(enabled);const options={quality,daylight:view.daylight??1,viewportHeight:1080};const firstStart=performance.now();system.update(1/60,options);const firstUpdateMs=performance.now()-firstStart;for(let i=0;i<1800;i++)system.update(1/60,options);
   const times=[];for(let i=0;i<3600;i++){const start=performance.now();system.update(1/60,options);times.push(performance.now()-start);}
   const s=system.snapshot();pair[enabled?'on':'off']={firstUpdateMs,p50Ms:percentile(times,.5),p95Ms:percentile(times,.95),p99Ms:percentile(times,.99),maxMs:Math.max(...times),registered:s.registered,loaded:s.loaded,visible:s.visible,near:s.near,renderCopies:s.renderCopies,batches:s.batches,trianglesEstimate:s.trianglesEstimate,batchGeometryBytes:s.batchGeometryBytes,instanceBytes:s.instanceBytes,sharedResources:s.sharedResources,textureGpuEstimateBytes:s.textureGpuEstimateBytes,errors:s.errors,pending:s.pending,lastError:s.lastError};
  }
  result.runs.push(pair);
 }
 console.log(view.id,quality,'done');
}
result.disposalBefore=system.snapshot();system.dispose();result.disposalAfter={rootDetached:system.renderer.root.parent===null,pool:system.pool.stats(),worldCacheSize:system.world.cache.size};
fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(output);
