import test from 'node:test';
import assert from 'node:assert/strict';
import {api,fixture,world,dispose,parts,meshes,row,oldStairs,nonTarget,hash,ray,THREE} from './fixture.mjs';
import {replayTerrace} from '../../../lib/terrace-walk.mjs';
const {furnitureBodySweep}=await import('../../../../src/controls/FurnitureMotion.js');
const {furnitureContact,furnitureScope}=await import('../../../../src/controls/FurnitureMotion.js');
const {validateWenhuaGateApproachScope}=await import('../../../../src/controls/WenhuaGateApproachSupport.js');
const close=(a,b,e=2e-5)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
const roles=(f,r)=>parts(f).filter(m=>m.userData.wenhuaGateApproach.role===r);

// Missing/false finalizer, a mirrored north stair, or a floating unowned ramp
// must fail these actual geometry/support consumers, not only a source grep.
test('source-observed asymmetric approaches replace all six generic stairs without replacing the gate',()=>{
 assert.equal(typeof api.applyWenhuaGateApproaches,'function','missing Wenhua-specific two-sided approach finalizer');
 const before=fixture(),f=fixture(true);assert.equal(oldStairs(f).length,0);assert.equal(oldStairs(before).length,6);
 assert.equal(nonTarget(f),nonTarget(before));assert.equal(hash(f.kit.colliders.slice(0,before.kit.colliders.length)),hash(before.kit.colliders));
 assert.equal(hash(f.kit.walkables),hash(before.kit.walkables.filter(w=>w.type!=='ramp')));
 for(const k of ['rooms','regions','mapItems'])assert.equal(hash(f.kit[k]),hash(before.kit[k]),k);
 assert.equal(hash(f.kit.plaques.map(p=>[p.text,p.x,p.y,p.z])),hash(before.kit.plaques.map(p=>[p.text,p.x,p.y,p.z])));
 assert.equal(roles(f,'south-stone-incline').length,1);assert.equal(roles(f,'south-terminal-panel').length,2);
 assert.equal(roles(f,'north-paved-incline').length,2);assert.equal(roles(f,'north-central-stone-strip').length,1);
 assert.equal(roles(f,'south-tread').length,40);assert.equal(roles(f,'north-tread').length,20);
 const meta=f.g.wenhuaGateApproaches;assert.equal(meta.objectId,'FC-5652FA389B');assert.equal(meta.accepted,false);assert.equal(meta.status,'VERIFY_PENDING');assert.match(meta.dimensionStatus,/PHOTO_FIT_NOT_SURVEY/);
 assert.equal(f.g.wenhuaSouthWindow.majorDivisions.fineGridModeled,false,'do not relabel old incomplete window as repaired');
 dispose(before);dispose(f);
});

test('each actual new solid owns exact post-merge Float32 triangles, with no proxy floor outside the north flare',()=>{
 const f=fixture(true);assert.ok(parts(f).length>60,'new source-supported solids missing');
 const added=f.kit.colliders.filter(c=>c.wenhuaGateApproach);assert.equal(added.length,3);
 f.frame.updateMatrixWorld(true);
 for(const m of parts(f)){
  const c=added.find(c=>c.wenhuaGateApproach.sourceMeshes?.includes(m.userData.wenhuaGateApproach.id));
  if(!c){const anchor=added.find(c=>c.wenhuaGateApproach.id===m.userData.wenhuaGateApproach.id);assert.ok(anchor?.furnitureMotionScope);continue;}assert.ok(c.xiqingRoofSurface);
  const p=m.geometry.attributes.position,ix=m.geometry.index,vertices=[];
  for(let k=0;k<(ix?.count??p.count);k++)vertices.push(new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(k):k).applyMatrix4(m.matrixWorld).toArray().map(Math.fround));
  const id=c.wenhuaGateApproach.sourceMeshes.indexOf(m.userData.wenhuaGateApproach.id);
  assert.deepEqual(c.xiqingRoofSurface.template.triangles.filter(t=>t.source.mesh===id).flatMap(t=>[t.triangle.a.toArray(),t.triangle.b.toArray(),t.triangle.c.toArray()]),vertices);
 }
 world(f,true);
 const samples=[[0,13.35,.405],[0,16.35,.10125],[-6.62,13.35,.405],[6.62,13.35,.405]];
 for(const[x,z,y]of samples){const hit=ray(f,[x,3,z],[0,-1,0],4)[0];assert.ok(hit);close(hit.point.y,y);const contact=f.cm.supportContact(f.g.x+x,f.g.z+z,2,.01);assert.ok(contact);close(contact.height,hit.point.y,.002);}
 const x=15.5,z=13.3;assert.equal(ray(f,[x,3,z],[0,-1,0],4).length,0);assert.equal(f.cm.getGroundHeight(f.g.x+x,f.g.z+z,0),0);
 dispose(f);
});

test('photographed south stone barriers collide while the three real door apertures stay hollow after merge',()=>{
 const f=fixture(true);world(f,true);
 for(const z of[-11.66,-9.37])assert.ok(f.cm.checkCollision(new THREE.Vector3(f.g.x,2,f.g.z+z),.2),'solid terminal stone is not a ghost');
 for(const x of[-6.62,0,6.62])for(const dx of[-.75,0,.75])assert.equal(ray(f,[x+dx,2.5,-8],[0,0,1],16).length,0,'door/head ray must cross actual merged opening');
 assert.ok(ray(f,[0,1,-13],[0,0,1],4).length,'stone assembly is rendered too');
 dispose(f);
});

test('full .5m square foot reaches the real uphill edge; .3m-foot negative control demonstrably penetrates the slope',()=>{
 const f=fixture(true);world(f,true);const x=f.g.x,z=f.g.z+13.35;
 const trueContact=furnitureContact(f.cm,x,z,2,.5);assert.equal(trueContact.poseClear,true);close(trueContact.surface.height,.455625);
 close(f.cm.getGroundHeight(x,z,0),.455625);
 const narrow=furnitureContact(f.cm,x,z,2,.3);close(narrow.surface.height,.435375);
 const feet=new THREE.Vector3(x,narrow.surface.height,z);assert.ok(furnitureBodySweep(f.cm,feet,feet,.5),'a .3-foot witness is not clearance for the real .5 body');
 const support=trueContact.surface;assert.ok(support.owner.xiqingRoofSurface);const face=support.owner.xiqingRoofSurface.template.triangles[support.triangleId];const t=face.triangle;assert.ok(t.closestPointToPoint(support.witness,new THREE.Vector3()).distanceTo(support.witness)<1e-7);close(support.witness.z,z-.5);
 // No rectangle fills the open wings beside the flare.
 assert.equal(furnitureContact(f.cm,f.g.x+15.5,f.g.z+13.35,2,.5).surface.height,0);
 dispose(f);
});

test('Wenhua dispatch cannot be transplanted or expanded to another gate/slope',()=>{
 const f=fixture(true),anchor=f.kit.colliders.find(c=>c.furnitureMotionScope),input=anchor.furnitureMotionScope,r={minX:-203.7,maxX:-168.9,minZ:-259,maxZ:-226.8};
 assert.doesNotThrow(()=>validateWenhuaGateApproachScope(input,anchor,r));
 for(const change of [()=>validateWenhuaGateApproachScope({...input,id:'wuying-central-rail-east'},anchor,r),()=>validateWenhuaGateApproachScope(input,anchor.clone().translate(new THREE.Vector3(400,0,0)),r),()=>validateWenhuaGateApproachScope(input,anchor,{...r,maxZ:1000})])assert.throws(change,/exact source post/);
 world(f);for(const[x,z]of [[220.8,-249.8],[-186.3,-225],[0,0],[-204.3,-245.2]])assert.equal(furnitureScope(f.cm,new THREE.Vector3(x,0,z),new THREE.Vector3(x,0,z),.5),false);
 dispose(f);
});

test('photographed pale stair side-stones and north flare borders are actual solids, not omitted approach boundaries',()=>{
 const f=fixture(true);assert.equal(roles(f,'south-side-stone').length,6);assert.equal(roles(f,'north-flare-border').length,2);world(f,true);
 for(const x of[-9.48,-3.76,-2.86,2.86,3.76,9.48])assert.ok(ray(f,[x,3,-10.63],[0,-1,0],4).length);
 for(const sign of[-1,1]){const x=sign*(9.93+(14.8-9.93)/2),hit=ray(f,[x,3,13.35],[0,-1,0],4)[0];assert.ok(hit);close(hit.point.y,.445);}
 dispose(f);
});

test('retired stairs and successful merged source resources are released once; shared library materials remain owned by the library',()=>{
 const f=fixture(),old=oldStairs(f).flatMap(g=>g.children).map(m=>m.geometry),oldCounts=old.map(()=>0);old.forEach((g,i)=>g.addEventListener('dispose',()=>oldCounts[i]++));api.applyWenhuaGateApproaches(f.kit,f.frame);assert.ok(oldCounts.every(n=>n===1));
 const gs=parts(f).map(m=>m.geometry),counts=gs.map(()=>0);gs.forEach((g,i)=>g.addEventListener('dispose',()=>counts[i]++));const material=f.lib.material('marble');let materialDisposals=0;material.addEventListener('dispose',()=>materialDisposals++);world(f,true);assert.ok(counts.every(n=>n===1));assert.equal(materialDisposals,0);f.kit.dispose(f.scene);assert.ok(counts.every(n=>n===1));assert.equal(materialDisposals,0);f.lib.dispose();assert.equal(materialDisposals,1);
});

test('approach joints do not add positive-area coplanar skins over the retained platform cap',()=>{
 const f=fixture(true);f.frame.updateMatrixWorld(true);let area=0;
 for(const m of parts(f)){const p=m.geometry.attributes.position,n=m.geometry.attributes.normal,ix=m.geometry.index;for(let k=0;k<(ix?.count??p.count);k+=3){const ids=[0,1,2].map(i=>ix?ix.getX(k+i):k+i);if(!ids.every(i=>n.getY(i)>.999))continue;const v=ids.map(i=>f.frame.worldToLocal(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld)));if(v.every(p=>Math.abs(p.y-.81)<1e-6&&p.x>=-17.4&&p.x<=17.4&&p.z>=-9.350001&&p.z<=9.350001)&&v.some(p=>p.z> -9.34999&&p.z<9.34999))area+=new THREE.Triangle(...v).getArea();}}
 assert.equal(area,0,'new rendered top skin must not overlap the retained cap');dispose(f);
});

test('six south side stones physically touch the stair-side tread midpoints rather than leaving an air slit',()=>{
 const f=fixture(true);f.frame.updateMatrixWorld(true);
 for(const center of[-6.62,0,6.62])for(const sign of[-1,1]){const axis=center+sign*2.86,m=roles(f,'south-side-stone').find(m=>{const box=new THREE.Box3().setFromObject(m);return Math.abs((box.min.x+box.max.x)/2-f.g.x-axis)<1e-5;});assert.ok(m);const p=m.geometry.attributes.position,ix=m.geometry.index,ts=[];for(let k=0;k<(ix?.count??p.count);k+=3)ts.push(new THREE.Triangle(...[0,1,2].map(i=>f.frame.worldToLocal(new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(k+i):k+i).applyMatrix4(m.matrixWorld)))));
  for(let k=0;k<10;k++){const point=new THREE.Vector3(center+sign*2.66,.81*(10-k)/11,-9.35-(k+.5)*.256);assert.ok(ts.some(t=>t.closestPointToPoint(point,new THREE.Vector3()).distanceTo(point)<2e-6),'actual tread edge must touch an actual side-stone triangle');}
 }
 dispose(f);
});

for(const fault of['normal-generation','uv-generation'])test(`${fault} failure releases every allocated source geometry and leaves the original gate intact`,t=>{
 const f=fixture(),state=hash({m:meshes(f.frame).map(row),c:f.kit.colliders,w:f.kit.walkables}),seen=new Set(),counts=new Map(),proto=THREE.BufferGeometry.prototype,set=proto.setAttribute,normal=proto.computeVertexNormals,release=proto.dispose;
 t.mock.method(proto,'setAttribute',function(name,...args){seen.add(this);if(fault==='uv-generation'&&name==='uv')throw Error('INJECTED_GEOMETRY_FAILURE');return set.call(this,name,...args);});
 t.mock.method(proto,'computeVertexNormals',function(...args){if(fault==='normal-generation')throw Error('INJECTED_GEOMETRY_FAILURE');return normal.apply(this,args);});
 t.mock.method(proto,'dispose',function(...args){counts.set(this,(counts.get(this)??0)+1);return release.apply(this,args);});
 assert.throws(()=>api.applyWenhuaGateApproaches(f.kit,f.frame),/INJECTED_GEOMETRY_FAILURE/);assert.ok(seen.size>0);for(const g of seen)assert.equal(counts.get(g),1,'new geometry must be owned before generation can throw');assert.equal(hash({m:meshes(f.frame).map(row),c:f.kit.colliders,w:f.kit.walkables}),state);t.mock.restoreAll();dispose(f);
});

for(const failAt of[0,21])test(`retired geometry cleanup failure at ${failAt} preserves the committed entrance and attempts every retired resource once`,t=>{
 const f=fixture(),retired=oldStairs(f).flatMap(g=>g.children).map(m=>m.geometry),indices=new Map(retired.map((g,i)=>[g,i])),calls=new Map(),release=THREE.BufferGeometry.prototype.dispose;let newDisposals=0,error;
 t.mock.method(THREE.BufferGeometry.prototype,'dispose',function(...args){if(indices.has(this)){calls.set(this,(calls.get(this)??0)+1);if(indices.get(this)===failAt)throw Error('INJECTED_RETIRED_DISPOSE_FAILURE');}else newDisposals++;return release.apply(this,args);});
 try{api.applyWenhuaGateApproaches(f.kit,f.frame);}catch(e){error=e;}
 assert.ok(parts(f).length>60,'committed new entrance must remain rendered after old-resource cleanup fails');assert.equal(oldStairs(f).length,0);assert.equal(f.kit.colliders.length,30);assert.equal(f.kit.walkables.length,1);assert.equal(f.g.wenhuaGateApproaches.cleanup.status,'COMMITTED_CLEANUP_FAILED');
 assert.ok(error instanceof AggregateError);assert.equal(error.committed,true);assert.equal(error.phase,'RETIRED_GEOMETRY_CLEANUP');assert.equal(error.errors.length,1);assert.equal(error.cleanupAttempted,42);assert.equal(newDisposals,0,'committed new source geometry must not be disposed as rollback');for(const g of retired)assert.equal(calls.get(g),1,'every retired geometry must be attempted, including those after the failure');
 const state=hash({m:meshes(f.frame).map(row),c:f.kit.colliders,w:f.kit.walkables,meta:f.g.wenhuaGateApproaches});assert.equal(api.applyWenhuaGateApproaches(f.kit,f.frame),false);assert.equal(hash({m:meshes(f.frame).map(row),c:f.kit.colliders,w:f.kit.walkables,meta:f.g.wenhuaGateApproaches}),state);for(const g of retired)assert.equal(calls.get(g),1,'retry must not repeat registration or retired cleanup');
 t.mock.restoreAll();world(f,true);assert.ok(Math.abs(f.cm.getGroundHeight(f.g.x,f.g.z+13.35,0)-.455625)<2e-5,'actual merged entrance and its registered collision must remain coherent');assert.equal(ray(f,[0,2.5,-8],[0,0,1],16).length,0);dispose(f);
});

test('wrong identity, changed/shared source geometry, frozen metadata and a repeated finalizer never partially mutate',()=>{
 assert.equal(typeof api.applyWenhuaGateApproaches,'function');
 const other=fixture(false,'wuying'),snap=hash(meshes(other.frame).map(row)),physics=hash(other.kit.colliders);assert.equal(api.applyWenhuaGateApproaches(other.kit,other.frame),false);assert.equal(hash(meshes(other.frame).map(row)),snap);assert.equal(hash(other.kit.colliders),physics);dispose(other);
 for(const change of [f=>oldStairs(f)[0].children[0].position.y+=.01,f=>{const m=oldStairs(f)[0].children[0];f.frame.add(new THREE.Mesh(m.geometry,m.material));},f=>Object.freeze(f.g)]){
  const f=fixture();change(f);const state=hash({meshes:meshes(f.frame).map(row),c:f.kit.colliders,w:f.kit.walkables,owned:f.kit.owned.length});assert.throws(()=>api.applyWenhuaGateApproaches(f.kit,f.frame),/retained source drift/);assert.equal(hash({meshes:meshes(f.frame).map(row),c:f.kit.colliders,w:f.kit.walkables,owned:f.kit.owned.length}),state);dispose(f);
 }
 const f=fixture(true),state=hash({meshes:meshes(f.frame).map(row),c:f.kit.colliders,w:f.kit.walkables});assert.equal(api.applyWenhuaGateApproaches(f.kit,f.frame),false);assert.equal(hash({meshes:meshes(f.frame).map(row),c:f.kit.colliders,w:f.kit.walkables}),state);dispose(f);
});

for(const fps of[10,60])for(const bay of[-1,0,1])test(`real FirstPerson ${bay} portal two-way approach at ${fps} Hz uses real stair flanks and north incline`,t=>{
 const f=fixture(true);assert.ok(f.g.wenhuaGateApproaches,'finalizer not applied');const W=world(f,true),x=bay*6.62,southX=bay?x:2.12;
 const local=[[southX,-13],[southX,-9.5],[x,-7],[x,-2],[x,2],[x,8],[x,18.3]],go=local.map(([x,z])=>[f.g.x+x,f.g.z+z]),points=[...go,...go.slice(0,-1).reverse()];
 const result=replayTerrace(t,W,points,{fps,recordFrames:true,sprint:fps===10});assert.equal(result.arrived,true,JSON.stringify({end:result.end,stuckAt:result.stuckAt,frames:result.frames.slice(-3)}));assert.equal(result.startFeet,0);close(result.end[2],0);assert.ok(result.maxFeet>.79);
 for(let i=0;i<result.frames.length;i+=4){const v=result.frames[i],feet=new THREE.Vector3(v.x,v.feet,v.z);assert.equal(furnitureBodySweep(f.cm,feet,feet,.5),null,'full authoritative feet-to-head body must not penetrate');const hit=new THREE.Raycaster(new THREE.Vector3(v.x,v.feet+1.7,v.z),new THREE.Vector3(0,1,0),0,40).intersectObject(f.scene,true)[0];if(hit)assert.ok(hit.distance>.25);}
 t.diagnostic(JSON.stringify({bay,fps,frames:result.frames.length,maxFeet:result.maxFeet,end:result.end}));dispose(f);
});
