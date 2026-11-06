import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';import {createCanvas} from '@napi-rs/canvas';
import {constructSubset} from './subset-adapter.mjs';
import {createActualLibrary} from '../r165-f49-tishun-beam-1331/tests/r158-cumulative-1600/library.mjs';
import {CollisionManager} from '../r165-f49-tishun-beam-1331/src/utils/Collision.js';
import {snapshot} from '../r165-f49-tishun-beam-1331/tests/r165-yangxin-companions/compound-snapshot.mjs';
import {hash} from '../r165-f49-tishun-beam-1331/tests/r164-three-entry-navigation/snapshot.mjs';
import {hashColliderSequence} from '../r165-f49-tishun-beam-1331/tests/r165-guhua-roof/collider-hash.mjs';
import {replayKunning} from '../r165-f49-tishun-beam-1331/tests/lib/kunning-walk.mjs';
import {withBoundedQaMocks} from '../r165-f49-tishun-beam-1331/tests/lib/bounded-qa-clock.mjs';
import {withResourceWitness} from '../r165-f49-beam-design-1151/GREEN-FULL-PROBE-1324/b-resource-witness.mjs';
import {runYuhua} from './yuhua-route-adapter.mjs';import {runRoutes as runEast} from './east-route-adapter.mjs';import {runRoutes as runWest} from './west-route-adapter.mjs';
import {resetRouteCapture,getRouteCapture} from './route-capture.mjs';
import {collectFaces,boxHits,containedSolid,firstHit,describeHit,boxFacesDistance} from './space-geometry.mjs';
import {createCandidate} from './candidate-proxy.mjs';import {cleanupResources} from './cleanup-resources.mjs';
import {verifyTargetVisibility} from './target-visibility.mjs';
import {createLedger,createFixedCollector} from './phase-guards.mjs';
const O=new URL('./',import.meta.url),report={base:'fef5c0e1904c361e7492d744f06d82a8c137e1ea',scope:'One bounded actual old subset and a conservative closed-box three-gate space proxy; not production H37 or final roof/photo/full-zone acceptance',stages:[],negativeControls:[]};
const PHASE=process.env.H37_DIAGNOSTIC_PHASE;assert.ok(['P1','P2C'].includes(PHASE),'Explicit frozen phase required before any actual fixture');
const definition=JSON.parse(fs.readFileSync(new URL('ASSERTION-LEDGER.json',O),'utf8')),ledger=createLedger(definition.phases[PHASE]);report.phase=PHASE;report.ledger=ledger.done;report.scope='Two-process staged space diagnostic; P2 routes and C share one live candidate/CM. Not equivalent to the original complete single-process probe.';
console.log('PROBE_WORKER_PID='+process.pid);
const save=()=>fs.writeFileSync(new URL('SPACE-'+PHASE+'-RESULT.json',O),JSON.stringify(report,null,2)+'\n');
function stage(name){report.stages.push({name,utc:new Date().toISOString(),memory:process.memoryUsage()});console.log('STAGE '+name);save();}
const box=(a,b)=>new T.Box3(new T.Vector3(...a),new T.Vector3(...b)),envelope=box([201,0,308.4],[231,8,313]);
test('H37 single candidate A actual space then B portal and C eye-height, once only',t=>{
 let actual,subset,cm,scene,proxy,originalState,stateFn,oldCMCount,oldWalkCount,primary,cleanupError,collector;const previousDocument=globalThis.document,extraResources=[];
 try{
  stage('setup');globalThis.document={createElement:tag=>{assert.equal(tag,'canvas');return createCanvas(1,1);}};
  actual=createActualLibrary();subset=constructSubset(actual.library);scene=new T.Group();for(const k of subset.kits)scene.add(k.root);scene.updateWorldMatrix(true,true);
  cm=new CollisionManager();cm.rivers=[];for(const k of subset.kits){cm.addColliders(k.colliders);cm.addWalkables(k.walkables);}oldCMCount=cm.colliders.length;oldWalkCount=cm.walkables.length;
  const oldView=collectFaces(scene),oldMeshes=[...new Set(oldView.meshes.map(r=>r.mesh))];
  report.subset={calls:subset.calls,gateWidths:subset.gateWidths,r63FrameUserData:subset.r63Frame.userData,meshes:oldMeshes.length,triangles:oldView.faces.length,instances:oldView.meshes.filter(r=>r.instanceId!==null).length,colliders:oldCMCount,walkables:oldWalkCount,CMInstances:1,noFullZoneBuildOrFinish:true};
  const state=withResourceWitness(()=>({kits:subset.kits.map(k=>snapshot(k)),oldCM:hashColliderSequence(cm.colliders.slice(0,oldCMCount)),oldWalkables:hash(cm.walkables.slice(0,oldWalkCount))}),()=>oldMeshes.map(m=>m.material));
  stateFn=state;originalState=state();
  const gcSnapshot=()=>({old:stateFn(),report:hash(report),capture:hash(getRouteCapture()),candidate:proxy?.meshes.map(m=>({name:m.name,parent:m.parent?.uuid??null,position:m.position.toArray(),scale:m.scale.toArray(),quaternion:m.quaternion.toArray(),index:hash(Array.from(m.geometry.index.array)),drawRange:[m.geometry.drawRange.start,m.geometry.drawRange.count],matrix:m.matrixWorld.toArray(),attributes:Object.entries(m.geometry.attributes).map(([k,a])=>[k,hash(Array.from(a.array))])}))??null,tail:cm.colliders.slice(oldCMCount).map(c=>({min:c.box.min.toArray(),max:c.box.max.toArray()})),grid:cm._grid?{count:cm._grid.count,CELL:cm._grid.CELL,entries:[...cm._grid.grid].map(([key,list])=>[key,list.map(c=>cm.colliders.indexOf(c))]),order:[...cm._grid.order].map(([c,index])=>[cm.colliders.indexOf(c),index])}:null});
  const strongRoots=()=>[subset,actual,scene,cm,proxy,originalState,report,stateFn,oldView,oldMeshes,cm.colliders,cm.walkables,cm._grid,cm._grid?.grid,cm._grid?.order,...(cm._grid?[...cm._grid.grid.values()]:[]),getRouteCapture(),report.beforeRoutes?.capture,report.afterRoutes?.capture,...(proxy?.meshes.flatMap(m=>[m,m.geometry,m.material,m.geometry.attributes.position,m.geometry.attributes.position.array,m.geometry.index,m.geometry.index.array])??[]),...cm.colliders.slice(oldCMCount).flatMap(c=>[c,c.box])];
  collector=createFixedCollector({labels:definition.collectionLabels[PHASE],ready:label=>ledger.done.at(-1)===definition.collectionReadyAfter[label],roots:strongRoots,snapshot:gcSnapshot,collect:global.gc});report.collectionReceipts=collector.receipts;stage('A-real-envelope');
  assert.ok(cm.walkables.every(w=>['box','ramp'].includes(w.type)),'A: unsupported actual walkable type');
  const upper=box([201,.04,308.4],[231,8,313]),bottom=box([201,0,308.4],[231,.04,313]);
  const hits=boxHits(upper,oldView.faces),inside=containedSolid(upper,oldView.meshes),bottomHits=boxHits(bottom,oldView.faces),oldContacts=cm.colliders.filter(q=>upper.intersectsBox(q.box)),oldTop=cm.walkables.filter(w=>{const b=w.type==='box'?w.box:new T.Box3(new T.Vector3(w.minX,Math.min(w.y0,w.y1),w.minZ),new T.Vector3(w.maxX,Math.max(w.y0,w.y1),w.maxZ));return b.max.y>0&&b.max.x>=201&&b.min.x<=231&&b.max.z>=308.4&&b.min.z<=313;});
  report.A={envelope:{min:envelope.min.toArray(),max:envelope.max.toArray()},visibleHits:hits.map(describeHit),containedInOldSolid:inside.map(q=>({mesh:q.mesh.uuid,name:q.mesh.name,instance:q.instanceId})),groundBandHits:bottomHits.map(describeHit),oldColliderHits:oldContacts.map(q=>({tag:q.tag,min:q.box.min.toArray(),max:q.box.max.toArray()})),positiveOldBoxWalkables:oldTop.length};save();
  assert.equal(hits.length,0,'A: actual old visible triangles intrude above.04');assert.equal(inside.length,0,'A: reserve contained in existing solid');assert.equal(oldContacts.length,0,'A: actual old collision owner intrusion');
  // This selected production subset has no ground mesh. All-domain continuity
  // comes from CollisionManager's explicit initial ground=0, not sparse rays.
  assert.equal(bottomHits.length,0,'A: unexpected old geometry at proposed wall footing');assert.equal(oldTop.length,0,'A: positive old walkable overlaps new footprint');
  report.A.ground={source:'Original CollisionManager.getGroundHeight ground=0 fallback plane; no physical terrain mesh instantiated',continuousPlaneAtY:0,positiveBoxWalkablesInsideFootprint:0,supportContactOwners:cm.colliders.filter(q=>q.box.max.x>=201&&q.box.min.x<=231&&q.box.max.z>=308.4&&q.box.min.z<=313).map(q=>({tag:q.tag,min:q.box.min.toArray(),max:q.box.max.toArray()})),samples:[]};
  for(const x of[201,205.05,206.4,207.75,208.6,212.8,213.74,213.8,216,218.2,218.26,219.2,223.4,224.25,225.6,226.95,230.5,231])for(const z of[306,308.4,309.2,309.8,310.2,310.6,312.4,313,315]){const y=cm.getGroundHeight(x,z,0,.01);assert.equal(y,0,'A: footing/portal sample does not use original zero ground');report.A.ground.samples.push({x,z,y});}
  for(const[label,predicate]of[
   ['actual-Cining-north-wall-above-CM3',f=>f.triangle.getMidpoint(new T.Vector3()).y>3&&f.triangle.getMidpoint(new T.Vector3()).y<6.5&&f.box.min.z>=294&&f.box.max.z<=296&&f.box.min.x>=187&&f.box.max.x<=258],
   ['actual-Cining-north-wall-cap',f=>f.triangle.getMidpoint(new T.Vector3()).y>6.5&&f.box.min.z>=294&&f.box.max.z<=296&&f.box.min.x>=187&&f.box.max.x<=258],
   ['actual-Yuhua-first-step',f=>f.mesh.userData.yuhuaStoneTop==='gameplay-low-step-fit'&&new T.Vector3().setFromMatrixPosition(f.mesh.matrixWorld).z<319.2],
  ]){const f=oldView.faces.find(predicate);assert.ok(f,label+' actual face exists');const c=f.triangle.getMidpoint(new T.Vector3()),n=new T.Box3(c.clone().addScalar(-.025),c.clone().addScalar(.025));assert.ok(boxHits(n,oldView.faces).some(q=>q===f),label+' real face negative control');report.negativeControls.push({name:label,triangle:describeHit(f),testBox:{min:n.min.toArray(),max:n.max.toArray()}});}
  report.A.actualEnvelopeSeparations={};
  for(const[name,prefix]of[['Yuhua','yuhua-ge/'],['YuhuaEast','yuhua-east-lou/'],['YuhuaWest','yuhua-west-lou/']]){const faces=oldView.faces.filter(f=>f.mesh.name.startsWith(prefix));assert.ok(faces.length);report.A.actualEnvelopeSeparations[name]=boxFacesDistance(envelope,faces);assert.ok(report.A.actualEnvelopeSeparations[name].distance>0);}
  const northWall=oldView.faces.filter(f=>f.box.min.z>=294&&f.box.max.z<=296&&f.box.min.x>=187&&f.box.max.x<=258);assert.ok(northWall.length);report.A.actualEnvelopeSeparations.CiningNorth=boxFacesDistance(envelope,northWall);assert.ok(report.A.actualEnvelopeSeparations.CiningNorth.distance>0);
  report.A.complete=true;for(const id of definition.A)ledger.complete(id);stage('A-passed');
  const W={THREE:T,cm};
  function oldRoutes(when){
   resetRouteCapture();const result={};
   for(const[name,start,end]of definition.oldGroups){
    result[name]=({yuhua:runYuhua,east:runEast,west:runWest})[name](t,W);
    const capture=getRouteCapture();assert.equal(capture.length,end,'whole original group returned with every variant');if(name==='west')assert.equal(capture.length,68);
    for(let i=start;i<end;i++){assert.deepEqual({points:capture[i].points,options:capture[i].options},definition.oldVariantDescriptors[i],'fixed original route identity '+i);ledger.complete('old.'+when+'.'+i);}
    // The entire original consumer/assertions returned; mocks already released.
    collector.after(when+'.'+name);
   }
   const capture=getRouteCapture();return {result,capture};
  }
  if(PHASE==='P1'){stage('B-old-68-before');report.beforeRoutes=oldRoutes('before');stage('B-old-68-complete');}
  proxy=createCandidate();extraResources.push(...proxy.resources);scene.add(proxy.root);scene.updateWorldMatrix(true,true);
  const view=collectFaces(proxy.root);
  for(const row of view.meshes){assert.ok(envelope.containsBox(row.box),'B: entire closed entity real geometry outside reserve '+row.mesh.name);assert.equal(boxHits(row.box,oldView.faces).length,0,'B: real old visible intersection '+row.mesh.name);assert.equal(containedSolid(row.box,oldView.meshes).length,0,'B: entity inside old solid '+row.mesh.name);ledger.complete('proxy.'+row.mesh.name.slice('H37-proxy/'.length));}
  report.B={proxy:{meshes:proxy.meshes.length,triangles:view.faces.length,allClosedBoxGeometry:true,finalProductGeometry:false,allEntitiesInEnvelope:true,newWalkables:0},ownOwners:[]};
  for(const row of view.meshes){const q=row.box.clone();cm.addColliders([q],'H37-readonly/'+row.mesh.name);report.B.ownOwners.push({name:row.mesh.name,min:q.min.toArray(),max:q.max.toArray()});}
  if(PHASE==='P1'){
   stage('B-new-68-before');report.afterRoutes=oldRoutes('after');assert.deepEqual(report.afterRoutes,report.beforeRoutes,'136 original route variants/assertions/frame hashes unchanged');ledger.complete('old.routes-equal');assert.deepEqual(state(),originalState,'all original geometry, registration, metadata, maps, room/resource refs unchanged');ledger.complete('old.state-equal');stage('B-new-68-complete');
  }else{
   assert.deepEqual(state(),originalState,'P2C all original state/reference witnesses remain unchanged after attaching the private candidate');ledger.complete('new.original-state-equal');
  function replay(points,{fps=60,sprint=false,expected=true}={}){const feet=cm.getGroundHeight(...points[0],0,.01);assert.equal(feet,0);assert.equal(cm.checkCollision(new T.Vector3(points[0][0],feet+1.7,points[0][1]),.5),false,'probe starts native-clear');const q=withBoundedQaMocks(t,m=>replayKunning(m,W,points,{startFeet:feet,fps,sprint,recordFrames:true}));assert.equal(q.arrived,expected,JSON.stringify({points,fps,sprint,end:q.end,stuck:q.stuckAt}));if(expected){assert.ok(q.maxFeet<.01);assert.ok(q.minFeet>=-.01);assert.equal(q.frames.filter(f=>cm.checkCollision(new T.Vector3(f.x,f.feet+1.7,f.z),.5)).length,0);}return {points,fps,sprint,arrived:q.arrived,end:q.end,frameSHA256:hash(q.frames),maxFeet:q.maxFeet};}
  report.B.newRoutes=[];
  function completedPositive(q){const i=report.B.newRoutes.length;assert.deepEqual({points:q.points,fps:q.fps,sprint:q.sprint,arrived:q.arrived},definition.newPositiveDescriptors[i],'fixed new positive variant '+i);report.B.newRoutes.push(q);ledger.complete('new.positive.'+i);stage('new-positive-'+i+'-complete');}
  function completedClosedNegative(q){const i=report.B.closedGateNegatives.length;assert.deepEqual({points:q.points,fps:q.fps,sprint:q.sprint,arrived:q.arrived},definition.closedNegativeDescriptors[i],'fixed closed negative variant '+i);report.B.closedGateNegatives.push(q);ledger.complete('new.closed-negative.'+i);stage('new-closed-negative-'+i+'-complete');}
  for(const points of[[[216,306],[216,315],[216,306]],[[216,315],[216,306],[216,315]],[[248,306],[183.7,306],[248,306]]])for(const fps of[30,60])for(const sprint of[false,true])completedPositive(replay(points,{fps,sprint}));
  for(const x of[215.25,216.75])for(const direction of[1,-1]){const pts=direction===1?[[x,306],[x,315]]:[[x,315],[x,306]];completedPositive(replay(pts));}
  collector.after('new.positives');report.B.closedGateNegatives=[];
  for(const x of[206.4,225.6])for(const fps of[30,60])completedClosedNegative(replay([[x,307.2],[x,311.8]],{fps,sprint:true,expected:false}));
  collector.after('new.closed-negatives');
  const backPlate=proxy.box('negative-only-middle-backplate',213.8,218.2,0,4,310.3,310.5);extraResources.push(backPlate.geometry);const plateBox=new T.Box3().setFromObject(backPlate),beforePlate=cm.colliders.length;cm.addColliders([plateBox],'H37-negative-backplate');
  report.negativeControls.push({name:'valid-closed-middle-backplate-rejects-native-controller',result:replay([[216,306],[216,315]],{expected:false})});ledger.complete('new.central-backplate-blocked');stage('central-backplate-blocked-complete');collector.after('new.central-blocked');cm.colliders.length=beforePlate;cm._grid=null;backPlate.removeFromParent();report.negativeControls.push({name:'removing-only-private-middle-backplate-restores-route',result:replay([[216,306],[216,315]])});ledger.complete('new.central-backplate-removed');stage('central-backplate-removed-complete');collector.after('new.central-restored');
  const allFaces=[...oldView.faces,...view.faces];report.C={views:[]};
  for(const[x,z]of[[216,306],[205,306],[227,306],[216,315]]){const feet=cm.getGroundHeight(x,z,0,.01);assert.equal(feet,0);assert.equal(cm.checkCollision(new T.Vector3(x,feet+1.7,z),.5),false);const eye=new T.Vector3(x,feet+1.65,z),targets=[];for(const side of['east','west']){const leaf=proxy.sideLeaves.find(m=>m.name.includes(side)),target=new T.Vector3().setFromMatrixPosition(leaf.matrixWorld),h=firstHit(eye,target,allFaces);assert.ok(h,'real eye ray hit');targets.push({side,target:target.toArray(),firstOwner:h.object.name,originalMesh:h.object.uuid,point:h.point.toArray(),distance:h.distance});}report.C.views.push({eye:eye.toArray(),feet,targets});ledger.complete('C.eye-'+(report.C.views.length-1));}
  // Perpendicular outside eyes at each side gate establish real own-leaf first
  // hits without replacing all older occluders or opening the backing wall.
  report.C.sideOpenings=[];
  for(const side of['east','west']){const x=side==='east'?206.4:225.6,eye=new T.Vector3(x,1.65,307.2),end=new T.Vector3(x,1.65,311.8),h=firstHit(eye,end,allFaces);assert.ok(proxy.sideLeaves.includes(h?.object),'side first hit must be original private leaf');const without=allFaces.filter(f=>!proxy.sideLeaves.includes(f.mesh));const clear=firstHit(eye,end,without);assert.ok(!clear||clear.distance>eye.distanceTo(end),'side structural opening is actually hollow without own closed leaves');report.C.sideOpenings.push({side,ownLeaf:h.object.name,point:h.point.toArray(),throughOpeningWithoutOwnLeaf:true});ledger.complete('C.side-'+side);}
  report.C.centralContext=[];
  for(const x of[215.5,216,216.5])for(const[a,b]of[[306,315],[315,306]]){const eye=new T.Vector3(x,1.65,a),end=new T.Vector3(x,1.65,b),h=firstHit(eye,end,allFaces);assert.ok(!h||h.distance>9,'central actual ray remains free through both high wall and opened leaves');if(a===306)assert.ok(h?.object.name.startsWith('yuhua-ge/'),'central south eye reads actual retained Yuhua context beyond portal');report.C.centralContext.push({eye:eye.toArray(),toward:end.toArray(),firstOwner:h?.object.uuid??null,firstName:h?.object.name??null,point:h?.point.toArray()??null,distance:h?.distance??null});ledger.complete('C.central-'+(report.C.centralContext.length-1));}
  const targets=[];
  for(const role of['east-canopy-conservative-volume','middle-canopy-conservative-volume','west-canopy-conservative-volume','own-short-wall-roof-0','own-short-wall-roof-1']){
   const object=proxy.meshes.find(m=>m.name==='H37-proxy/'+role);assert.ok(object,role+' unique declared owner');assert.equal(proxy.meshes.filter(m=>m.name===object.name).length,1);const bounds=new T.Box3().setFromObject(object),point=bounds.getCenter(new T.Vector3());point.z=bounds.min.z;targets.push({id:role,object,point,allowedEyes:[0,1,2]});
  }
  const highestCanopy=Math.max(...proxy.meshes.filter(m=>m.name.includes('-canopy-')).map(m=>new T.Box3().setFromObject(m).max.y));
  const wall=proxy.meshes.find(m=>m.name==='H37-proxy/high-wall-pier-0'),wallBox=new T.Box3().setFromObject(wall);assert.ok(wallBox.max.y>highestCanopy,'actual high wall above every gate canopy');const wallPoint=wallBox.getCenter(new T.Vector3());wallPoint.x=wallBox.min.x+.25;wallPoint.y=(highestCanopy+wallBox.max.y)/2;wallPoint.z=wallBox.min.z;targets.push({id:'high-wall-upper-front-fitted-end',object:wall,point:wallPoint,allowedEyes:[0,1,2]});
  const cap=proxy.meshes.find(m=>m.name==='H37-proxy/wall-cap-conservative-closed-volume'),capBox=new T.Box3().setFromObject(cap),capPoint=capBox.getCenter(new T.Vector3());capPoint.z=capBox.max.z;targets.push({id:'high-wall-cap',object:cap,point:capPoint});
  report.C.namedSurfaceEvidence=verifyTargetVisibility(report.C.views.map(v=>new T.Vector3(...v.eye)),targets,allFaces);assert.equal(report.C.namedSurfaceEvidence.length,7);for(const q of report.C.namedSurfaceEvidence)ledger.complete('C.named-'+q.id);
  report.C.scope='All seven named own surface targets require actual first-hit identity from retained supported eyes, with every old occluder. Three canopies, two short-wall roofs and upper backing require outside z306 eyes. Upper backing sample is on its fitted finite front end; cap may be read from fitted back. Independent gaze directions, not one simultaneous framed full facade. Space readability only, no photo/proportions/PBR proof.';
  report.C.complete=true;ledger.complete('C.complete');collector.after('C.complete');report.cpuImages=[];report.cpuScope='Precise eye-ray spatial result only; no image/shape/WebGL acceptance claimed. Complete geometry/context imagery remains a later product gate.';
  } // P2+C remain on the same candidate/CM until every C assertion returns.
  proxy.root.removeFromParent();cm.colliders.length=oldCMCount;cm.walkables.length=oldWalkCount;cm._grid=null;assert.deepEqual(state(),originalState,'complete original state restored after private proxy removal');report.restoration={complete:true,oldColliders:oldCMCount,oldWalkables:oldWalkCount,state:state()};report.success=true;stage('restored');
 }catch(e){primary=e;report.success=false;report.failure={message:e.message,stack:e.stack,subsetCleanup:e.subsetCleanup};save();}
 finally{
  const errors=[];
  try{proxy?.root.removeFromParent();if(cm&&oldCMCount!==undefined){cm.colliders.length=oldCMCount;cm.walkables.length=oldWalkCount;cm._grid=null;}if(stateFn&&originalState){assert.deepEqual(stateFn(),originalState,'finally complete original state restored even on primary failure');report.restoration={complete:true,oldColliders:oldCMCount,oldWalkables:oldWalkCount,state:stateFn()};if(!primary)ledger.complete('restoration');}}catch(e){errors.push({phase:'restore',message:e.message});}
  try{if(subset)report.cleanup=cleanupResources(subset.builders,actual.library,{disposeLibrary:true,extraResources});else if(actual)report.cleanup=cleanupResources([],actual.library,{disposeLibrary:true,extraResources});if(report.cleanup&&!report.cleanup.success)errors.push(...report.cleanup.errors);if(report.cleanup?.success&&!primary)ledger.complete('cleanup');}catch(e){errors.push({phase:'cleanup',message:e.message});}
  try{globalThis.document=previousDocument;}catch(e){errors.push({phase:'restore-document',message:e.message});}
  if(errors.length){report.success=false;report.cleanupErrors=errors;cleanupError=new AggregateError(errors.map(e=>Error(e.message)),'H37 cleanup/restore incomplete');}save();
 }
 if(primary)throw primary;if(cleanupError)throw cleanupError;collector.assertComplete();ledger.assertComplete();report.ledgerComplete=true;save();
});
