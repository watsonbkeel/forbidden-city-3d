import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {kneeFixture,triangleRows,hash,hook,enclosureSource} from './lib/r58-taihemen-knees-fixture.mjs';
import {assertTaihemenSouthKneesInWorld} from './lib/r58-taihemen-knees-world-check.mjs';
import {assertTaihemenInWorld} from './lib/r58-taihemen-world-check.mjs';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
import {FirstPersonControls} from '../src/controls/FirstPerson.js';
const signature=W=>hash({triangles:triangleRows(W.root),colliders:W.builder.colliders,walkables:W.builder.walkables,architecture:W.root.userData.architecture});

test('all prior merged geometry, transforms, material attributes, columns and navigation registrations remain exact',()=>{
 const before=kneeFixture({candidate:false}),after=kneeFixture();try{
  assert.equal(hash(triangleRows(after.root,{includeKnees:false})),hash(triangleRows(before.root)));
  assert.deepEqual(after.root.matrixWorld.toArray(),before.root.matrixWorld.toArray());
  assert.equal(after.builder.columns.length,40);assert.deepEqual(after.builder.columns,before.builder.columns);
  assert.deepEqual(after.builder.colliders,before.builder.colliders);assert.deepEqual(after.builder.walkables,before.builder.walkables);
  assert.deepEqual(after.p,before.p);assert.deepEqual(after.root.userData.taihemenSouthEnclosure,before.root.userData.taihemenSouthEnclosure);
  assert.deepEqual(after.root.userData.architecture.filter(r=>r.id!=='axis/taihemen-south-knees'),before.root.userData.architecture);
  assert.equal(triangleRows(after.root,{onlyKnees:true}).length,1008);
  const names=W=>W.root.children.filter(m=>m.isMesh).map(m=>m.material.name);
  assert.deepEqual(names(after).filter(n=>n!=='taihemen-south-knee-teal'),names(before));
  assert.equal(assertTaihemenInWorld(after).openPorchSamples,7);
 }finally{before.builder.dispose();after.builder.dispose();}
});

test('pure existing-W consumer verifies real merged attachment and does not mutate geometry or registrations',()=>{
 const W=kneeFixture();try{const before=signature(W),r=assertTaihemenSouthKneesInWorld(W);
  assert.equal(r.probes.length,14);assert.ok(r.minimumJumpHeadGap>1.9);assert.equal(r.colliderDelta,0);assert.equal(r.supportDelta,0);
  assert.equal(signature(W),before);assert.throws(()=>assertTaihemenSouthKneesInWorld({}),/existing W/);
  const s=readFileSync(new URL('./lib/r58-taihemen-knees-world-check.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(s,/import.*(?:world\.mjs|PalaceBuilder|ZoneBase|fixture|TaihemenSouthKnees|kit\.js)/);
 }finally{W.builder.dispose();}
});


test('consumer refreshes stale derived matrices without requiring a renderer or an earlier consumer',()=>{
 const W=kneeFixture();try{
  W.root.traverse(o=>{o.matrixWorld.identity();o.matrixWorldNeedsUpdate=true;});
  const localBefore=hash(W.root.children.map(m=>[m.position.toArray(),m.quaternion.toArray(),m.scale.toArray()]));
  const registeredBefore=hash([W.builder.colliders,W.builder.walkables]);
  assert.equal(assertTaihemenSouthKneesInWorld(W).probes.length,14);
  assert.equal(hash(W.root.children.map(m=>[m.position.toArray(),m.quaternion.toArray(),m.scale.toArray()])),localBefore);
  assert.equal(hash([W.builder.colliders,W.builder.walkables]),registeredBefore);
 }finally{W.builder.dispose();}
});

for(const [label,mutate] of [
 ['missing knee geometry',W=>W.root.children.find(m=>m.material?.name==='taihemen-south-knee-teal').removeFromParent()],
 ['hidden knee material',W=>W.root.children.find(m=>m.material?.name==='taihemen-south-knee-teal').material.visible=false],
 ['hidden parent',W=>W.root.visible=false],
 ['detached beam',W=>W.root.children.filter(m=>m.material?.name==='caihua_beam').forEach(m=>m.position.z+=1)],
 ['detached columns',W=>W.root.children.filter(m=>m.material?.name==='wood_column').forEach(m=>m.position.z+=1)],
])test(`consumer rejects ${label} despite metadata`,()=>{
 const W=kneeFixture();try{mutate(W);W.scene.updateMatrixWorld(true);assert.throws(()=>assertTaihemenSouthKneesInWorld(W),/knee|attachment/);}finally{W.builder.dispose();}
});

test('consumer rejects retained pre-knee Taihemen rather than repairing or manufacturing it',()=>{
 const W=kneeFixture({candidate:false});try{assert.throws(()=>assertTaihemenSouthKneesInWorld(W),/exactly one/);}finally{W.builder.dispose();}
});

for(const [fps,sprint,backward] of [[60,false,false],[10,true,true]])test(`ground-start real-controller porch sweep and north return ${fps}Hz sprint=${sprint} backward=${backward}`,t=>{
 const W=kneeFixture(),placed=t.mock.method(FirstPersonControls.prototype,'setPosition'),f=W.p.flights[1],eave=W.data.position.z-W.data.dimensions.depth/2,porch=eave+2.3;
 const go=[[0,W.p.zToe-3],[f.centerX,W.p.zToe-3],[f.centerX,W.p.zEdge],[f.centerX,porch],[-16.02,porch],[16.02,porch],[0,porch],[0,W.data.position.z+22]];
 const trace=traceTerraceGround(W.cm,W.p);
 try{const result=replayTerrace(t,W,[...go,...go.slice(0,-1).reverse()],{fps,sprint,backward,recordFrames:true});
  assert.equal(placed.mock.callCount(),1);assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));assert.equal(result.startFeet,0);assert.equal(result.end[2],0);
  assert.ok(trace.samples.every(s=>!['rescue','unverified'].includes(s.source)));
  assert.ok(result.frames.filter(s=>s.z>eave+.6&&s.z<eave+4&&Math.abs(s.x)<18).length>20);
  assertTaihemenSouthKneesInWorld(W);
 }finally{trace.restore();placed.mock.restore();W.builder.dispose();}
});

test('baseline comparison removes only one new call and retains the exact current enclosure',()=>{
 assert.equal(enclosureSource.split(hook).length,2);assert.ok(enclosureSource.includes("add('retained-south-eave-beam'"));
 const before=kneeFixture({candidate:false});try{assert.equal(assertTaihemenInWorld(before).openPorchSamples,7);}finally{before.builder.dispose();}
});
