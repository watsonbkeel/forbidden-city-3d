// Normal production ZoneManager hook, merging and collision registration.
// CPU-only: not GPU/browser visual acceptance or a new upper-level access claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import {registerHooks} from 'node:module';
import {verifyOldSilhouetteAndTail} from './r163-yinghua-stele-cumulative-2119/silhouette.mjs';
import {oldFlow,oldFlowEnvelope} from './r163-yinghua-stele-cumulative-2119/flow.mjs';
registerHooks({load(url,context,next){return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);}});
const {buildR52World}=await import('./lib/r52-world.mjs');
const {createActualLibrary}=await import('./r158-cumulative-1600/library.mjs');
const {replayKunning}=await import('./lib/kunning-walk.mjs');
const {withBoundedQaMocks}=await import('./lib/bounded-qa-clock.mjs');
const steleBefore=JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../docs/photo-fidelity/batches/R163-YINGHUA-STELE-CUMULATIVE-2133/world.json.gz',import.meta.url))));
const before=JSON.parse(zlib.gunzipSync(fs.readFileSync(new URL('../docs/photo-fidelity/batches/R163-RESUMPTION-2114/baseline-normal-r162.json.gz',import.meta.url))));

test('R163 south pale rail reaches normal merged world; complete prior collision/navigation/architecture streams stay exact',async t=>{
 const W=await buildR52World({loadAll:false,initialPosition:{x:277.2,z:451.2},createLibrary:createActualLibrary,zoneManagerOptions:{reuseInactive:true}}),T=W.THREE;
 try{
  for(const zone of['outer-west','west-six','garden'])W.zoneManager.loadZone(zone);
  assert.deepEqual([...W.zoneManager.loaded.keys()],before.loaded);
  const envelope=new T.Box3(new T.Vector3(...oldFlowEnvelope.slice(0,3)),new T.Vector3(...oldFlowEnvelope.slice(3))),flow=oldFlow(W,envelope);
  // The old stele compatibility helper excludes only the already accepted
  // Yinghua stele envelope. No Yanchun collider or navigation row is omitted.
  for(const field of['colliderCount','colliders','walkableCount','walkables','maps','rooms','regions','architecture'])assert.deepEqual(flow[field],before.stream[field],field);
  const owners=W.cm.colliders.filter(q=>q.box.intersectsBox(envelope)).map(q=>({id:q.triangleSupport?.id??null,box:q.box})),tops=W.cm.walkables.filter(q=>q.box?.intersectsBox(envelope));
  const plain=x=>JSON.parse(JSON.stringify(x));
  // triangleInstance owner ids end in Three.js random mesh UUIDs; retain the
  // exact owner role/order and all numeric box bytes, canonicalizing only UUID.
  const ownerRows=rows=>plain(rows).map(q=>({...q,id:q.id?.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,'/RUNTIME_UUID')??null}));
  assert.deepEqual(ownerRows(owners),ownerRows(steleBefore.newOwners),'all 38 existing Yinghua owners: roles/order/boxes exact; runtime UUID excluded');assert.deepEqual(plain(tops),steleBefore.newTops,'existing Yinghua non-rescue slab retained exactly');
  const records=W.zoneManager.loaded.get('outer-west').data.group.userData.architecture.filter(q=>q.sourceObjectId==='FC-D385802B72');assert.deepEqual(records,[steleBefore.normalRecord],'normal accepted stele architecture record unchanged');
  const kept=[];W.scene.traverse(m=>{if(m.isMesh&&(Array.isArray(m.material)?m.material:[m.material]).some(q=>q?.name?.startsWith('r163_yinghua_stele_')))kept.push(m);});const keptBounds=new T.Box3();for(const m of kept)keptBounds.union(new T.Box3().setFromObject(m));
  assert.deepEqual(plain({mergedMeshes:kept.length,triangles:kept.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),bounds:keptBounds}),steleBefore.newGeometry,'real existing stele 4 merged meshes/970 triangles/bounds preserved');
  assert.equal(verifyOldSilhouetteAndTail(W).newRoofExpandedTailExact,true,'all retained outer-west silhouette bytes and exact existing stele roof append still match');
  const pale=[];W.scene.traverse(m=>{if(m.isMesh&&(Array.isArray(m.material)?m.material:[m.material]).some(q=>q?.name==='yanchun_south_pale_finish_photo_fit'))pale.push(m);});
  assert.equal(pale.length,1,'normal sole hook creates one real merged pale-material mesh');
  assert.equal((pale[0].geometry.index?.count??pale[0].geometry.attributes.position.count)/3,6648,'25 closed turned profiles plus 2 horizontal and 2 retained corner boxes');
  const b=new T.Box3().setFromObject(pale[0]);assert.ok(b.min.x>=208.2&&b.max.x<=223.8);assert.ok(b.min.z>=477.3299&&b.max.z<=477.4301);assert.ok(b.min.y>=6.9999&&b.max.y<=7.9801);
  const i=JSON.parse(fs.readFileSync(new URL('../data/zones/outer-west.json',import.meta.url))).items.find(i=>i.kind==='hall'&&i.name==='延春阁'),z=i.z-i.d/2-i.pad,start=z-i.ph*1.6-.6,pts=[[i.x,start],[i.x,z-i.ph*1.6],[i.x,z],[i.x,i.z-i.d/2],[i.x,i.z-i.d/2+3.1]];
  const route=withBoundedQaMocks(t,q=>replayKunning(q,W,[...pts,...pts.slice(0,-1).reverse()],{fps:30,sprint:false,startFeet:0,recordFrames:true}));
  assert.equal(route.arrived,true);assert.ok(Math.max(...route.frames.map(f=>f.feet))<1,'unchanged ground entry does not gain automatic upper access');
 }finally{W.dispose();}
});
