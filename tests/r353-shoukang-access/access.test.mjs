import test from 'node:test';import assert from 'node:assert/strict';
import {actualShoukangFixture} from './fixture.mjs';
import {unbindShoukangEntryEnvironmentWitness} from '../../src/controls/ShoukangEntryEnvironmentWitness.js';
const mod=await import('../lib/shoukang-current-access.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
function required(){assert.equal(typeof mod.checkShoukangCurrentAccess,'function','actual full-world Shoukang contract required');}
test('actual full hall, with/without real retained court, supports native center and side doorway roundtrips',()=>{
 required();for(const perimeter of [false,true]){const W=actualShoukangFixture({perimeter});try{const before=W.cm.colliders.slice(),r=mod.checkShoukangCurrentAccess(W);assert.deepEqual(r.faults,[]);assert.equal(r.runs.length,9);assert.equal(r.sourceCounts.total,171);assert.equal(r.negative.length,4);assert.equal(r.legacyObservations.center.end[1],218.9);for(const row of r.runs){assert.equal(row.arrived,true);assert.equal(row.strictOverlapFrames,0);assert.equal(row.endFeet,0);assert.ok(row.maxZ>=226);assert.ok(row.crossings>0);}assert.deepEqual(W.cm.colliders,before);assert.equal(W.platform.stats.fetches,0);}finally{W.dispose();}}
});
test('missing/duplicate real owners and architecture or changed canonical item fail closed',()=>{
 required();const W=actualShoukangFixture();try{
  assert.throws(()=>mod.checkShoukangCurrentAccess({...W,finishedZones:[]}),/finished source/i);
  const front=W.zones[0].json.items[47];front.x+=.01;try{assert.throws(()=>mod.checkShoukangCurrentAccess(W),/envelope/i);}finally{front.x-=.01;}
  const index=W.cm.colliders.findIndex(c=>W.ownerOf(c)?.item===front),c=W.cm.colliders.splice(index,1)[0];try{assert.throws(()=>mod.checkShoukangCurrentAccess(W),/source owner/i);}finally{W.cm.colliders.splice(index,0,c);}
  W.cm.colliders.push(c);try{assert.throws(()=>mod.checkShoukangCurrentAccess(W),/source owner/i);}finally{W.cm.colliders.pop();}
 }finally{W.dispose();}
});
test('missing exact support and actual ground witness are not replaced with fake ground',()=>{
 required();const W=actualShoukangFixture();try{
  const source=W.finishedZones[0].builder.kit.walkables.find(w=>w.r140ShoukangSouthStep),key=w=>JSON.stringify(w.box?[...w.box.min.toArray(),...w.box.max.toArray()]:[...w.min,...w.max]);
  const index=W.cm.walkables.findIndex(w=>w.type==='box'&&key(w)===key(source)),w=W.cm.walkables.splice(index,1)[0];assert.ok(w);try{assert.throws(()=>mod.checkShoukangCurrentAccess(W),/source support/i);}finally{W.cm.walkables.splice(index,0,w);}
  unbindShoukangEntryEnvironmentWitness(W.cm);assert.throws(()=>mod.checkShoukangCurrentAccess(W),/ground witness/i);
 }finally{W.dispose();}
});
test('actual added doorway blocker fails native traversal without changing source solids or disposing caller',()=>{
 required();const W=actualShoukangFixture();try{
  const check=W.cm.checkCollision,ground=W.cm.getGroundHeight;W.cm.addCollider(new W.THREE.Box3(new W.THREE.Vector3(284,0,224),new W.THREE.Vector3(294,4,225)),'r353-blocked');
  const r=mod.checkShoukangCurrentAccess(W);assert.equal(r.runs.length,9);assert.ok(r.faults.length>=3);assert.ok(r.runs.some(x=>!x.arrived));assert.equal(W.cm.checkCollision,check);assert.equal(W.cm.getGroundHeight,ground);assert.ok(W.cm.colliders.length>0);
 }finally{W.cm.removeByTag('r353-blocked');W.dispose();}
});
test('actual registered template, offset and stair scope must still match original source',()=>{
 required();const W=actualShoukangFixture();try{
  const tri=W.cm.colliders.find(c=>c.triangleSupport&&W.ownerOf(c)?.item===W.zones[0].json.items[47]),old=tri.triangleSupport;tri.triangleSupport={...old,offset:old.offset.clone().setX(.001)};try{assert.throws(()=>mod.checkShoukangCurrentAccess(W),/source offset/i);}finally{tri.triangleSupport=old;}
  const surface=W.cm.colliders.find(c=>c.xiqingRoofSurface&&W.ownerOf(c)?.item===W.zones[0].json.items[47]),oldSurface=surface.xiqingRoofSurface;surface.xiqingRoofSurface={...oldSurface,template:{...oldSurface.template,triangles:[]}};try{assert.throws(()=>mod.checkShoukangCurrentAccess(W),/source template/i);}finally{surface.xiqingRoofSurface=oldSurface;}
  const step=W.cm.colliders.find(c=>c.furnitureMotionScope?.kind==='shoukang-south-steps'),scope=step.furnitureMotionScope;step.furnitureMotionScope={...scope,minZ:scope.minZ-1};try{assert.throws(()=>mod.checkShoukangCurrentAccess(W),/source step scope/i);}finally{step.furnitureMotionScope=scope;}
 }finally{W.dispose();}
});
