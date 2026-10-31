import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import * as THREE from 'three';
import {readyScene} from '../r119/ready-scene.mjs';
import {buildJiaotaiFrontVessels} from '../../src/scene/palace/special/JiaotaiFrontVessels.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {PLAYER} from '../../src/config/constants.js';
import {assertJiaotaiDisplayInWorld,replayJiaotaiDisplayRoute} from '../../tests/lib/r54-jiaotai-world-check.mjs';
import {replayKunning} from '../../tests/lib/kunning-walk.mjs';
// Optional argv[2] is a retained unhooked baseline source root. Do not use a
// candidate that already includes these vessels as its own no-change baseline.
const baselineRoot=path.resolve(process.argv[2]??process.cwd());
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex'),out=process.argv[3]?path.resolve(process.argv[3]):null;
const snap=h=>{let rows=[];h.scene.updateMatrixWorld(true);h.scene.traverse(m=>{if(!m.isMesh||m.material?.name==='r159-jiaotai-front-vessel')return;rows.push({name:m.name,matrix:m.matrixWorld.toArray(),attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[...a.array]])),index:m.geometry.index?[...m.geometry.index.array]:null,material:m.material?.name});});return hash(rows);};
const a=await readyScene('high',baselineRoot);let oldVessels=false;a.scene.traverse(o=>{if(o.userData.architecture?.some(x=>x.frontVessels))oldVessels=true;});if(oldVessels){a.dispose();throw Error('Pass an unhooked retained baseline source root as argv[2]');}const physical=hash(a.builder.colliders),walk=hash(a.builder.walkables),geometry=snap(a),n=a.builder.colliders.length;const baselineCM=new CollisionManager();baselineCM.addColliders(a.builder.colliders);baselineCM.addWalkables(a.builder.walkables);a.dispose();
const h=await readyScene('high',undefined,b=>{const original=b.buildHall;b.buildHall=function(...args){const result=original.apply(this,args);if(args[1].name==='交泰殿'&&!result.userData.structure.frontVessels)buildJiaotaiFrontVessels(this,result);return result;};});
try{
 assert.equal(snap(h),geometry);assert.equal(hash(h.builder.colliders.filter(c=>!c.r159JiaotaiFrontVessel)),physical);assert.equal(hash(h.builder.walkables),walk);assert.equal(h.builder.colliders.length,n+6);
 const cm=new CollisionManager();cm.addColliders(h.builder.colliders);cm.addWalkables(h.builder.walkables);const W={THREE,scene:h.scene,cm};const structural=assertJiaotaiDisplayInWorld(W),routes=[];
 h.scene.updateMatrixWorld(true);
 const records=[];h.scene.traverse(o=>{for(const a of o.userData.architecture??[])if(a.id==='jiaotaidian'&&a.frontVessels)records.push(a.frontVessels);});assert.equal(records.length,1);
 const frontRecord=records[0],vertices=[];
 h.scene.traverse(m=>{if(!m.isMesh||m.material?.name!=='r159-jiaotai-front-vessel')return;const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)vertices.push(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld));});
 const renderedBindings=[];
 for(const row of frontRecord.colliders){
  const physical=h.builder.colliders.filter(c=>c.r159JiaotaiFrontVessel===row.owner);assert.equal(physical.length,1);const expected=new THREE.Box3(new THREE.Vector3(...row.min),new THREE.Vector3(...row.max));assert.ok(physical[0].equals(expected));
  const actual=new THREE.Box3(),tolerance=2e-5;
  for(const v of vertices)if(['x','y','z'].every(k=>v[k]>=expected.min[k]-tolerance&&v[k]<=expected.max[k]+tolerance))actual.expandByPoint(v);
  assert.ok(!actual.isEmpty());for(const side of['min','max'])for(const key of['x','y','z'])assert.ok(actual[side][key]===Math.fround(expected[side][key]),row.owner+' actual merged vertices must equal exact Float32 quantization of registered bound');
  assert.ok(expected.min.y>2.38&&expected.min.z>355.3&&Math.abs(expected.min.x)>1.8);renderedBindings.push({owner:row.owner,physicalMin:row.min,physicalMax:row.max,mergedVertexMin:actual.min.toArray(),mergedVertexMax:actual.max.toArray(),exactExpectedFloat32Min:row.min.map(Math.fround),exactExpectedFloat32Max:row.max.map(Math.fround),partitionTolerance:tolerance,comparison:'EXACT_FLOAT32_QUANTIZATION_NOT_RELAXED_CONTACT'});
 }
 for(const v of vertices)assert.ok(frontRecord.colliders.some(row=>['x','y','z'].every((k,i)=>v[k]>=row.min[i]-2e-5&&v[k]<=row.max[i]+2e-5)),'no rendered vessel vertex lacks a declared visible-part envelope');

 // node:test's real timer mock for each controller replay, restored between cases.
 const {mock}=await import('node:test');const t={mock};
 for(const fps of [10,30,60])for(const backward of [false,true]){try{routes.push(replayJiaotaiDisplayRoute(t,W,{fps,sprint:false,backward}));}finally{mock.restoreAll();}}
 const sideCM=new CollisionManager();sideCM.addColliders(h.builder.colliders);sideCM.addWalkables(h.builder.walkables);sideCM.walkables=sideCM.walkables.map(w=>w.type==='box'?{...w,rescue:false}:w);const sw={THREE,cm:sideCM},sides=[];
 for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true]){
  for(const dir of [-1,1]){const route=[[dir*21,354.1],[dir*17.5,354.1],[dir*12,354.1],[dir*8.1,354.1],[dir*12,354.1],[dir*17.5,354.1],[dir*21,354.1]];let r;try{r=replayKunning(t,sw,route,{startFeet:0,fps,sprint,backward});}finally{mock.restoreAll();}assert.ok(r.arrived);assert.ok(r.maxFeet>=2&&r.maxFeet<2.4);assert.ok(Math.abs(r.end[2])<.02);sides.push({fps,sprint,backward,dir,arrived:r.arrived,maxFeet:r.maxFeet});}
  let r;try{r=replayKunning(t,sw,[[17.6,336],[17.6,354.1],[17.6,367.2]],{startFeet:0,fps,sprint,backward});}finally{mock.restoreAll();}assert.ok(r.arrived);assert.ok(r.maxFeet<.1);sides.push({fps,sprint,backward,id:'west-low-bypass',arrived:r.arrived,maxFeet:r.maxFeet});
 }
 const close=[];for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true]){let r;try{r=replayKunning(t,W,[[0,354.8],[0,355.8],[.85,355.8],[0,355.8],[-.85,355.8],[0,355.8],[0,354.8]],{startFeet:2.16,fps,sprint,backward});}finally{mock.restoreAll();}assert.ok(r.arrived);assert.ok(r.maxFeet>2.38&&r.maxFeet<2.41);close.push({fps,sprint,backward,arrived:r.arrived,maxFeet:r.maxFeet});}
 const edgePass=[];for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true]){let r;try{r=replayKunning(t,W,[[0,354.75],[0,354.95],[2.15,354.95],[-2.15,354.95],[0,354.95],[0,354.75]],{startFeet:2.16,fps,sprint,backward,recordFrames:true});}finally{mock.restoreAll();}assert.ok(r.arrived);for(const f of r.frames)assert.equal(cm.checkCollision(new THREE.Vector3(f.x,f.feet+PLAYER.HEIGHT,f.z),.5),false);assert.ok(r.frames.some(f=>Math.abs(f.x)>2.0&&f.z>354.90),'must approach actual vessel front, not only x.85');edgePass.push({fps,sprint,backward,arrived:r.arrived,frames:r.frames.length,maxFeet:r.maxFeet});}
 const edgeBlocked=[];for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])for(const sign of[-1,1]){
  const points=[[sign*2.08,354.2],[sign*2.08,355.2]];let baseline,candidate;
  try{baseline=replayKunning(t,{THREE,cm:baselineCM},points,{startFeet:2.16,fps,sprint,backward});}finally{mock.restoreAll();}
  try{candidate=replayKunning(t,W,points,{startFeet:2.16,fps,sprint,backward,recordFrames:true});}finally{mock.restoreAll();}
  assert.ok(baseline.arrived,'old scene must admit the same attempted path');assert.equal(candidate.arrived,false,'visible upright must block body approach');assert.ok(candidate.end[1]<355.08&&candidate.end[1]>354.85,JSON.stringify(candidate.end));
  for(const f of candidate.frames)assert.equal(cm.checkCollision(new THREE.Vector3(f.x,f.feet+PLAYER.HEIGHT,f.z),.5),false);
  const target=new THREE.Vector3(sign*2.08,2.16+PLAYER.HEIGHT,355.2),newCM=new CollisionManager();newCM.addColliders(h.builder.colliders.filter(c=>c.r159JiaotaiFrontVessel));assert.equal(newCM.checkCollision(target,.5),true);assert.equal(baselineCM.checkCollision(target,.5),false);
  let exit;try{exit=replayKunning(t,W,[[candidate.end[0],candidate.end[1]],[sign*2.08,354.2]],{startFeet:candidate.end[2],fps,sprint,backward});}finally{mock.restoreAll();}assert.ok(exit.arrived,'contact must not trap the body');
  edgeBlocked.push({fps,sprint,backward,sign,baselineArrived:baseline.arrived,candidateArrived:candidate.arrived,candidateEnd:candidate.end,exitArrived:exit.arrived,frames:candidate.frames.length});
 }
 const marker=[];h.scene.traverse(o=>{const p=o.userData.architecture?.find(x=>x.id==='jiaotaidian')?.frontVessels;if(p)marker.push(p);});assert.equal(marker.length,1);
 const result={scope:'REAL_THREE_PALACE_READY_SCENE_NO_FULL_WORLD_NO_GPU',mode:'manual authoring hook after buildHall before real merge, same module geometry as proposed display-end hook',geometryHashWithoutNewMaterial:geometry,originalPhysicalRowsHash:physical,allWalkablesHash:walk,oldColliderCount:n,newColliderCount:h.builder.colliders.length,structural,routes,sides,close,renderedBindings,edgePass,edgeBlocked,frontVessels:marker[0]};if(out)fs.writeFileSync(out,JSON.stringify(result,null,2));console.log('Actual three-palace: old geometry/physical rows/walkables exact; four-door routes',routes.length,'side/bypass',sides.length,'front low-platform routes',close.length,'near-vessel passes',edgePass.length,'paired baseline/blocked/exit contacts',edgeBlocked.length);
}finally{h.dispose();}
