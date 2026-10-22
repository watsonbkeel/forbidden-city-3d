import fs from 'node:fs';
import crypto from 'node:crypto';
import os from 'node:os';
import {PerformanceObserver} from 'node:perf_hooks';
import * as THREE from 'three';
import {buildCharacterWorld} from '../tests/p3c-world-fixture.mjs';
import {CharacterSystem} from '../src/scene/characters/CharacterSystem.js';
const output=process.argv[2]??'reports/r50-followup/incremental-cold-exploratory.json';
const realtime=process.env.P3C_PROFILE_REALTIME==='1',quality=process.env.P3C_PROFILE_QUALITY??'high';
const diagnose=process.env.P3C_PROFILE_DIAGNOSTICS==='1',gcEvents=[];
const gcObserver=diagnose?new PerformanceObserver(list=>{for(const e of list.getEntries())gcEvents.push({startTime:e.startTime,duration:e.duration,kind:e.detail?.kind,flags:e.detail?.flags});}):null;
gcObserver?.observe({entryTypes:['gc']});
// Fingerprint the complete character pipeline, including LOD policy, geometry
// option selection and registry data, rather than only the original modules.
const sourceFiles=['src/scene/characters','data/characters'].flatMap(dir=>fs.readdirSync(dir).sort().map(name=>`${dir}/${name}`).filter(file=>fs.statSync(file).isFile()));
sourceFiles.push('scripts/p3c-profile-incremental.mjs','tests/p3c-world-fixture.mjs');
const hashSources=()=>Object.fromEntries(sourceFiles.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const sourceInput=hashSources(),W=await buildCharacterWorld(),camera=new THREE.PerspectiveCamera(60,16/9,.1,2500);
const a=W.adapter.resolveAnchor('taihe-hall').position;camera.position.set(a[0],a[1]+3,a[2]-22);camera.lookAt(a[0],a[1]+1,a[2]);camera.updateMatrixWorld();
const system=new CharacterSystem({scene:W.scene,camera,collisionManager:W.cm,zoneManager:W.zoneManager,documentObject:null,contentApproved:true});
const percentile=(v,q)=>{const s=[...v].sort((a,b)=>a-b);return s[Math.floor((s.length-1)*q)]??0;};
const report={kind:'CPU-only incremental preparation; not GPU, browser or full-application frame time',dateUTC:new Date().toISOString(),environment:{node:process.version,three:THREE.REVISION,cpu:os.cpus()[0]?.model,platform:os.platform(),arch:os.arch()},sourceInput,quality,frameScheduling:realtime?'CPU calls spaced by a nominal 16.667ms timer; actual readiness wall time is recorded; not a display or GPU measurement':'tight loop with one awaited microtask between synthetic 1/60 updates; 60Hz latency is an estimate, not display recording',runs:[]};
async function settle(name){
 const frames=[],frameDiagnostics=[],readyTimeline=[],start=performance.now(),cpuStart=process.cpuUsage();let lastLoaded=-1,firstVisibleFrame=null,emperorReady=null;
 const tick=()=>{const frameCpu=diagnose?process.cpuUsage():null,t=performance.now();system.update(1/60,{quality});const end=performance.now();frames.push(end-t);if(diagnose){const c=process.cpuUsage(frameCpu);frameDiagnostics.push({frame:frames.length,startTime:t,endTime:end,wallMs:end-t,processCpuMs:(c.user+c.system)/1000});}return t;};
 for(let i=0;i<30000;i++){
  const t=tick();await Promise.resolve();
  const loaded=[...system.manager.states.values()].filter(s=>s.binding).length;
  if(firstVisibleFrame===null&&system.manager.stats.visible>0)firstVisibleFrame=i+1;
  if(!emperorReady&&system.manager.states.get('taihe-emperor-01')?.binding)emperorReady={frame:i+1,elapsedMs:performance.now()-start};
  if(loaded!==lastLoaded){readyTimeline.push({frame:i+1,loaded,elapsedMs:performance.now()-start});lastLoaded=loaded;}
  if([...system.manager.states.values()].some(s=>s.error))throw Error(JSON.stringify(system.snapshot().diagnostics));
  if(loaded===38){tick();break;}
  if(i===29999)throw Error('Preparation did not finish: '+JSON.stringify(system.snapshot()));
  if(realtime)await new Promise(resolve=>setTimeout(resolve,Math.max(0,1000/60-(performance.now()-t))));
 }
 const snapshot=system.snapshot(),cpu=process.cpuUsage(cpuStart),end=performance.now();if(diagnose)await new Promise(resolve=>setImmediate(resolve));
 const events=gcEvents.filter(e=>e.startTime>=start&&e.startTime<=end),outliers=frameDiagnostics.filter(f=>f.wallMs>4).map(f=>({...f,overlappingGC:events.filter(e=>e.startTime<f.endTime&&e.startTime+e.duration>f.startTime)}));
 return {name,frames:frames.length,p50Ms:percentile(frames,.5),p95Ms:percentile(frames,.95),maxMs:Math.max(...frames),summedUpdateWallMs:frames.reduce((a,b)=>a+b,0),processCpuMs:(cpu.user+cpu.system)/1000,readinessWallMs:end-start,estimated60HzReadyMs:frames.length/60*1000,firstVisibleFrame,emperorReady,firstActorReady:readyTimeline.find(x=>x.loaded>0)??null,readyTimeline,frameTimesMs:frames,snapshot,...(diagnose?{diagnostics:{note:'Extra Node process-CPU reads and GC observer; not identical instrumentation to the primary run. GC overlap is correlation, not a complete attribution of a wall-time outlier.',gcEvents:events,framesAbove4ms:outliers,frameCpu:frameDiagnostics}}:{})};
}
report.runs.push(await settle('cold-all-38'));
system.setEnabled(false);system.setEnabled(true);report.runs.push(await settle('off-on-cached'));
system.world.invalidate();report.runs.push(await settle('explicit-world-rebind'));
report.endSourceInput=hashSources();report.sourcesUnchangedDuringRun=JSON.stringify(report.sourceInput)===JSON.stringify(report.endSourceInput);
system.dispose();gcObserver?.disconnect();report.disposed={states:system.manager.states.size,queue:system.world.work.snapshot().pending,pool:system.pool.stats()};
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.runs.map(({name,frames,p50Ms,p95Ms,maxMs,summedUpdateWallMs,processCpuMs,readinessWallMs,estimated60HzReadyMs,firstVisibleFrame,snapshot})=>({name,frames,p50Ms,p95Ms,maxMs,summedUpdateWallMs,processCpuMs,readinessWallMs,estimated60HzReadyMs,firstVisibleFrame,loaded:snapshot.loaded,visible:snapshot.visible,queue:snapshot.preparation})),null,2));
