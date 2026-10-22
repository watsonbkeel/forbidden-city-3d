// Audit the actual captured instance triangles against the actual captured
// architectural triangles. This does not reuse anchor heights as support proof.
import fs from 'node:fs';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {createCharacterGeometry} from '../src/scene/characters/CharacterKit.js';
const sha=b=>createHash('sha256').update(b).digest('hex');
const dir=process.env.R51_VISIBILITY_GEOMETRY_DIR||'/tmp/r51-production-visibility-geometry';
const suffix=process.env.R51_VISIBILITY_REPORT_SUFFIX||'';
const bindingPath=process.env.R51_VISIBILITY_BINDINGS||(suffix==='-after-lod2'?'reports/r51-unified/world-bindings-after-lod2-38-148.json.gz':'reports/r51-unified/world-bindings-38-148.json.gz');
const bindingBytes=fs.readFileSync(bindingPath);
const bindings=JSON.parse(gunzipSync(bindingBytes)).actorBindings;
const rows=[];const toleranceMeters=1e-5;
for(const label of ['spawn','taihe']){
 const source=path.join(dir,`production-visibility-${label}-geometry${suffix}.json.gz`),bytes=fs.readFileSync(source),data=JSON.parse(gunzipSync(bytes));
 if(data.characterSourceHashes?.['CharacterKit.js']&&data.characterSourceHashes['CharacterKit.js']!==sha(fs.readFileSync('src/scene/characters/CharacterKit.js')))throw Error('Kit source differs from captured geometry; cannot infer foot part stream.');
 let start=0;const chunks=data.meshes.map(mesh=>{const triangles=data.triangles.slice(start,start+mesh.triangles);start+=mesh.triangles;return{...mesh,triangles};});
 const architecture=chunks.filter(m=>!m.character).flatMap(m=>m.triangles.map((t,index)=>({name:m.name,instance:m.instance,index,vertices:t.v.map(v=>new THREE.Vector3(...v)),minX:Math.min(...t.v.map(v=>v[0])),maxX:Math.max(...t.v.map(v=>v[0])),minZ:Math.min(...t.v.map(v=>v[2])),maxZ:Math.max(...t.v.map(v=>v[2]))})));
 for(const mesh of chunks.filter(m=>m.character)){
  const [templateId,pose,lodText,zoneRef,seatVariant]=mesh.name.replace(/^characters:/,'').split('|'),lod=Number(lodText),geometry=createCharacterGeometry(templateId,pose,lod,{seatVariant}),parts=geometry.attributes.characterPart,index=geometry.index;
  if(mesh.triangles.length!==index.count/3)throw Error('Clipped character geometry cannot prove complete sole: '+mesh.name);
  const all=mesh.triangles.flatMap(t=>t.v),center=[(Math.min(...all.map(v=>v[0]))+Math.max(...all.map(v=>v[0])))/2,(Math.min(...all.map(v=>v[2]))+Math.max(...all.map(v=>v[2])))/2];
  const nearest=[...bindings].sort((a,b)=>Math.hypot(a.binding.position[0]-center[0],a.binding.position[2]-center[1])-Math.hypot(b.binding.position[0]-center[0],b.binding.position[2]-center[1]))[0];
  const feet=[];
  for(const part of [4,5]){
   const points=[];for(let ti=0;ti<mesh.triangles.length;ti++)for(let k=0;k<3;k++)if(parts.getX(index.getX(ti*3+k))===part)points.push(mesh.triangles[ti].v[k]);
   const minY=Math.min(...points.map(v=>v[1]));
   const bottom=[...new Map(points.filter(v=>Math.abs(v[1]-minY)<1e-7).map(v=>[v.join(','),v])).values()];
   const probes=bottom.map(v=>{
    const origin=new THREE.Vector3(v[0],v[1]+.05,v[2]),ray=new THREE.Ray(origin,new THREE.Vector3(0,-1,0));let best=null;
    for(const tri of architecture){if(v[0]<tri.minX-1e-7||v[0]>tri.maxX+1e-7||v[2]<tri.minZ-1e-7||v[2]>tri.maxZ+1e-7)continue;const hit=ray.intersectTriangle(...tri.vertices,false,new THREE.Vector3());if(!hit||v[1]-hit.y>1)continue;if(!best||hit.y>best.supportY)best={supportY:hit.y,gapMeters:v[1]-hit.y,sourceMesh:tri.name,sourceInstance:tri.instance,sourceTriangle:tri.index,sourceTriangleVertices:tri.vertices.map(p=>p.toArray())};}
    return{footVertex:v,...(best??{missing:true})};
   });
   const gaps=probes.filter(p=>!p.missing).map(p=>p.gapMeters);
   feet.push({part,minY,samples:probes.length,supportedSamples:gaps.length,minGapMeters:gaps.length?Math.min(...gaps):null,maxGapMeters:gaps.length?Math.max(...gaps):null,withinContactTolerance:gaps.length===probes.length&&gaps.every(g=>Math.abs(g)<=toleranceMeters),probes});
  }
  rows.push({view:label,actorId:nearest.actorId,identification:'Nearest unchanged fresh-world binding in X/Z; the measurement itself uses captured foot-part triangles and captured architecture, not the binding height.',batch:mesh.name,instance:mesh.instance,lod,feet,sourceCaptureSha256:sha(bytes)});
  geometry.dispose();
 }
}
const report={createdAt:new Date().toISOString(),kind:'Independent CPU downward triangle intersection audit of deformed rendered feet; not anchor-only validation.',toleranceMeters,sourceKitSha256:sha(fs.readFileSync('src/scene/characters/CharacterKit.js')),freshBindingPath:bindingPath,freshBindingSha256:sha(bindingBytes),summary:{instances:rows.length,exactContact:rows.filter(r=>r.feet.every(f=>f.withinContactTolerance)).length,positiveGapInstances:rows.filter(r=>r.feet.some(f=>f.maxGapMeters>toleranceMeters)).length,penetratingInstances:rows.filter(r=>r.feet.some(f=>f.minGapMeters< -toleranceMeters)).length},limits:'Captures use actual geometry and instance transforms, all whole character triangle streams verified complete. Foot-part indices are recovered from the hash-matching unchanged CharacterKit index/part stream. Rays begin 50 mm above each sole vertex so penetrations up to 50 mm are measured, not discarded. Architecture is the same view export, so a missing architectural triangle is reported rather than assumed. Production textures were not deleted: the screenshots intentionally omit textures and contact shadows for CPU geometry diagnosis.',rows};
fs.writeFileSync(`reports/r51/production-visibility-foot-contact${suffix}.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(rows.map(r=>({view:r.view,actor:r.actorId,lod:r.lod,feet:r.feet.map(f=>({minY:f.minY,minGap:f.minGapMeters,maxGap:f.maxGapMeters,supported:f.supportedSamples,total:f.samples,contact:f.withinContactTolerance}))})),null,2));
