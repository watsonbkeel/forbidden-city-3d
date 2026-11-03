import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import {registerHooks} from 'node:module';
import {oldFlow,materialPrefix,oldFlowEnvelope} from './flow.mjs';
import {verifyOldSilhouetteAndTail} from './silhouette.mjs';
import {approaches,negativePlans,globalPlans} from '../r163-yinghua-stele/plans.mjs';
registerHooks({load(url,context,next){return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);}});
const {buildR52World}=await import('../lib/r52-world.mjs');
const {createActualLibrary}=await import('../r158-cumulative-1600/library.mjs');
const {replayKunning}=await import('../lib/kunning-walk.mjs');
const {withBoundedQaMocks}=await import('../lib/bounded-qa-clock.mjs');
const baseline=JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../../docs/photo-fidelity/batches/R163-RESUMPTION-2114/baseline-normal-r162.json.gz',import.meta.url))));
const readArchive=name=>JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../../docs/photo-fidelity/R163-YINGHUA-STELE-2114/'+name+'.json.gz',import.meta.url))));
const authorLocal=readArchive('task1-local-routes'),authorGlobal=readArchive('task1-global-routes');
const silhouetteBefore=JSON.parse(fs.readFileSync(new URL('../../docs/photo-fidelity/batches/R163-RESUMPTION-2114/SILHOUETTE-APPEND-BASELINE.json',import.meta.url)));
const out=process.env.R163_NORMAL_OUT??'/tmp/r163-yinghua-stele-cumulative-2119';
const clear=(W,x,z,feet)=>!W.cm.checkCollision(new W.THREE.Vector3(x,feet+1.7,z),.5);
const run=(t,W,p,fps,sprint,startFeet=0)=>({...p,fps,sprint,...withBoundedQaMocks(t,c=>replayKunning(c,W,p.pts,{startFeet,fps,sprint,recordFrames:true}))});
const summary=q=>({name:q.name,fps:q.fps,sprint:q.sprint,arrived:q.arrived,frames:q.frames.length,peak:Math.max(...q.frames.map(f=>Math.abs(f.feet-f.ground))),end:q.end});

test('normal sole-hook solid Yinghua stele, full old streams and both actual gate-hall bypasses',async t=>{
 const W=await buildR52World({loadAll:false,initialPosition:{x:277.2,z:451.2},createLibrary:createActualLibrary,zoneManagerOptions:{reuseInactive:true}});
 const T=W.THREE,r={baseRuntime:baseline.fixedRuntime,scope:'normal production call, no author injection/capture; real stele blocks old center line; old hall-step peaks retained',localRows:[],globalRows:[],oldSideRows:[],negative:[]};
 try{
  for(const zone of ['outer-west','west-six','garden'])W.zoneManager.loadZone(zone);
  r.loaded=[...W.zoneManager.loaded.keys()];assert.deepEqual(r.loaded,baseline.loaded);
  const architecture=W.zoneManager.loaded.get('outer-west').data.group.userData.architecture;
  const rows=architecture.filter(q=>q.sourceObjectId==='FC-D385802B72');
  assert.equal(rows.length,1,'normal unique independent Yinghua stele record');
  r.normalRecord=rows[0];assert.equal(rows[0].wholeObjectAccepted,false);assert.equal(rows[0].currentAdmissionVerified,false);assert.equal(rows[0].name,'英华殿碑亭');assert.equal(rows[0].newRooms,0);assert.equal(rows[0].newMapItems,0);assert.equal(rows[0].totalColumnsStatus,'ENGINEERING_FIT_UNVERIFIED');
  const envelope=new T.Box3(new T.Vector3(...oldFlowEnvelope.slice(0,3)),new T.Vector3(...oldFlowEnvelope.slice(3)));
  r.newOwners=W.cm.colliders.filter(q=>q.box.intersectsBox(envelope)).map(q=>({id:q.triangleSupport?.id??null,box:q.box}));
  r.newTops=W.cm.walkables.filter(q=>q.box?.intersectsBox(envelope));
  assert.equal(r.newOwners.length,38);assert.ok(r.newOwners.some(q=>q.id?.includes('/stele/')),'real central stele owner after normal registration');assert.ok(r.newOwners.some(q=>q.id?.includes('/stele-base/')));assert.equal(r.newTops.length,1);assert.equal(r.newTops[0].rescue,false);
  r.stream=oldFlow(W,envelope);assert.deepEqual(r.stream,baseline.stream,'all old geometry/instances/material stream including exact old silhouette prefixes; physics/maps/rooms/regions/records preserved');
  const added=[];W.scene.updateMatrixWorld(true);W.scene.traverse(m=>{if(m.isMesh&&(Array.isArray(m.material)?m.material:[m.material]).some(q=>q?.name?.startsWith(materialPrefix)))added.push(m);});
  const bounds=new T.Box3();for(const m of added)bounds.union(new T.Box3().setFromObject(m));r.newGeometry={mergedMeshes:added.length,triangles:added.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),bounds};
  assert.equal(r.newGeometry.mergedMeshes,4);assert.equal(r.newGeometry.triangles,970);
  // Unchanged SilhouetteBuilder automatically appends this pavilion's roof.
  // Keep every old position/index byte, and admit only the exact new roof
  // triangle stream as the added tail: never ignore an entire old proxy mesh.
  const proxy=W.zoneManager.silhouettes.get('outer-west'),position=proxy.geometry.attributes.position.array,index=proxy.geometry.index.array;
  const hash=a=>crypto.createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
  assert.equal(hash(position.subarray(0,42390)),silhouetteBefore.attributes.position.hash);assert.equal(hash(index.subarray(0,69840)),silhouetteBefore.index.hash);
  const roof=added.filter(m=>/roof_tile|kit_roof/.test(m.material.name));assert.equal(roof.length,1);
  const expected=[];for(const m of roof){const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i++){const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(i)??i).applyMatrix4(m.matrixWorld);expected.push(...v.toArray().map(Math.fround));}}
  const actual=[];for(const i of index.subarray(69840))actual.push(...position.subarray(i*3,i*3+3));assert.deepEqual(actual,expected,'automatic silhouette tail is exactly the new real roof/finial, nothing else');
  r.silhouette={name:proxy.name,oldPositionScalars:42390,oldIndices:69840,oldPositionPrefixExact:true,oldIndexPrefixExact:true,addedPositionScalars:position.length-42390,addedIndices:index.length-69840,newRoofTriangles:expected.length/9,newTailExactRealRoof:true,visible:proxy.visible};assert.equal(r.silhouette.addedPositionScalars,411);assert.equal(r.silhouette.addedIndices,786);r.silhouettePinnedProof=verifyOldSilhouetteAndTail(W);

  const safe=envelope.clone();safe.min.y=-1e-6;assert.ok(safe.containsBox(bounds));
  r.oldEnvelopeHits=[];W.scene.traverse(m=>{if(!m.isMesh||!m.geometry?.attributes.position||(Array.isArray(m.material)?m.material:[m.material]).some(q=>q?.name?.startsWith(materialPrefix)))return;for(let q=m;q;q=q.parent)if(!q.visible)return;const g=m.geometry;if(!g.boundingBox)g.computeBoundingBox();const matrices=[];if(m.isInstancedMesh){for(let i=0;i<m.count;i++){const local=new T.Matrix4();m.getMatrixAt(i,local);matrices.push(m.matrixWorld.clone().multiply(local));}}else matrices.push(m.matrixWorld);for(const mx of matrices){const scan=bounds.clone();scan.min.y=.04;if(!g.boundingBox.clone().applyMatrix4(mx).intersectsBox(scan))continue;const p=g.attributes.position,ix=g.index;let n=0;for(let i=0;i<(ix?.count??p.count);i+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(i+j)??i+j).applyMatrix4(mx)),tri=new T.Triangle(...v);if(tri.getArea()>1e-12&&scan.intersectsTriangle(tri))n++;}if(n)r.oldEnvelopeHits.push({mesh:m.name,triangles:n});}});assert.deepEqual(r.oldEnvelopeHits,[],'final actual envelope clear of old resident/instance triangles above old ground');
  for(const p of approaches)for(const fps of [10,60])for(const sprint of [false,true]){assert.ok(clear(W,...p.pts[0],0));const q=run(t,W,p,fps,sprint);r.localRows.push(q);assert.ok(q.arrived);assert.ok(clear(W,q.end[0],q.end[1],q.end[2]));assert.ok(q.frames.some(f=>Math.abs(f.feet-.12)<1e-6),'real platform support');for(const f of q.frames){assert.ok(Math.abs(f.feet-f.ground)<=.300001);assert.ok(clear(W,f.x,f.z,f.feet),'each local body native-clear');}}
  for(const p of globalPlans)for(const fps of [10,30,60])for(const sprint of [false,true]){const startFeet=p.reverse?.9:0,ground=W.cm.getGroundHeight(...p.pts[0],startFeet,.6,.5);assert.ok(Math.abs(ground-startFeet)<1e-6);assert.ok(clear(W,...p.pts[0],startFeet));const q=run(t,W,p,fps,sprint,startFeet);q.startGround={nativeGround:ground,requestedFeet:startFeet,source:p.reverse?'existing Yinghua hall platform support':'existing gate exterior ground'};r.globalRows.push(q);assert.ok(q.arrived);assert.ok(clear(W,q.end[0],q.end[1],q.end[2]));for(const f of q.frames.filter(f=>f.z>=464.5&&f.z<=473.5)){assert.ok(Math.abs(f.feet-f.ground)<=.300001);assert.ok(clear(W,f.x,f.z,f.feet));}}
  // Original positive-X courtyard side route remains clear of the new reserve.
  for(const before of baseline.routes.filter(q=>q.name==='old-positive-X-side-court-return')){const {name,pts,fps,sprint}=before;const q=run(t,W,{name,pts},fps,sprint);q.startBlocked=!clear(W,...pts[0],0);q.endBlocked=!clear(W,q.end[0],q.end[1],q.end[2]);assert.deepEqual(q,before,'entire old side-court route unchanged');r.oldSideRows.push(q);}
  for(const p of negativePlans){assert.ok(clear(W,...p.pts[0],.12));const q=run(t,W,p,60,true,.12);r.negative.push(q);assert.equal(q.arrived,false,'real solid '+p.name+' must block');}
  // QA mutant only: removing both real stele/base owners must expose the
  // center-line negative condition. Restore the original native list after.
  const original=W.cm.colliders;
  try{W.cm.colliders=original.filter(q=>!q.triangleSupport?.id?.includes('/stele/')&&!q.triangleSupport?.id?.includes('/stele-base/'));r.removedSteleOwners=original.length-W.cm.colliders.length;assert.equal(r.removedSteleOwners,2);r.removedStele=run(t,W,negativePlans[0],60,true,.12);assert.equal(r.removedStele.arrived,true,'negative is sensitive to missing stele collision');}finally{W.cm.colliders=original;W.cm._grid=null;}
  assert.deepEqual(r.localRows,authorLocal.rows,'all normal local reports exact independent component');assert.deepEqual(r.globalRows.filter(q=>q.fps!==30),authorGlobal.rows,'all normal10/60 full gate-hall reports exact author injected World');assert.deepEqual(r.negative,authorLocal.negative);r.authorCompleteRawEquality=true;
  r.localSummary=r.localRows.map(summary);r.globalSummary=r.globalRows.map(summary);r.negativeSummary=r.negative.map(summary);
  r.inheritedOldAxis=baseline.summary.filter(q=>q.name==='old-axis-gate-hall-return');
  r.legacyHallStepPeakRange=[Math.min(...r.globalSummary.map(q=>q.peak)),Math.max(...r.globalSummary.map(q=>q.peak))];
  assert.equal(r.localRows.length,16);assert.equal(r.globalRows.length,24);assert.equal(r.oldSideRows.length,2);assert.equal(r.negative.length,4);
  console.log(JSON.stringify({stream:r.stream,newGeometry:r.newGeometry,newOwners:r.newOwners.length,newTops:r.newTops.length,local:r.localSummary,global:r.globalSummary,negative:r.negativeSummary,legacyHallStepPeakRange:r.legacyHallStepPeakRange}));
 }finally{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/world.json.gz',zlib.gzipSync(JSON.stringify(r)));W.dispose();}
});
