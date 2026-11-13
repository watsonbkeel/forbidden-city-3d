import test from 'node:test';
import assert from 'node:assert/strict';
import {actualWuyingFixture} from './fixture.mjs';
const module=await import('../lib/wuying-current-access.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return{};throw e;});
test('exact current Wuying full-finish access validates both actual sides and keeps the two invalid ground starts',()=>{
 assert.equal(typeof module.checkWuyingCurrentAccess,'function','source-bound continuous current Wuying validator required');
 const W=actualWuyingFixture();try{const r=module.checkWuyingCurrentAccess(W);assert.deepEqual(r.faults,[]);assert.equal(r.runs.length,6);assert.equal(r.negative.length,2);assert.equal(r.supports,19);for(const row of r.runs){assert.equal(row.arrived,true);assert.equal(row.crossings,40);assert.ok(row.acceptedSubsteps>0);assert.ok(row.northEscape>=row.requiredNorthEscape);assert.equal(row.endFeet,0);}assert.equal(W.platform.stats.fetches,0);}finally{W.dispose();}
});
test('missing actual current metadata and source support fail closed rather than exempt the building',()=>{
 assert.equal(typeof module.checkWuyingCurrentAccess,'function');const W=actualWuyingFixture();try{
  assert.throws(()=>module.checkWuyingCurrentAccess({...W,finishedZones:[]}),/finished.*Wuying/i);
  const source=W.finishedZones[0].group.userData.architecture.find(r=>r.remainingProfile==='wuying').moonTerrace.addedWalkables[0];
  const selected=W.cm.walkables.find(w=>w.type==='box'&&JSON.stringify([...w.box.min.toArray(),...w.box.max.toArray()])===JSON.stringify([...source.min,...source.max]));assert.ok(selected);const index=W.cm.walkables.indexOf(selected);W.cm.walkables.splice(index,1);
  try{assert.throws(()=>module.checkWuyingCurrentAccess(W),/actual.*support/i);}finally{W.cm.walkables.splice(index,0,selected);}
 }finally{W.dispose();}
});
test('a newly blocked real west portal stays a failing route, with restoration after observation',()=>{
 assert.equal(typeof module.checkWuyingCurrentAccess,'function');const W=actualWuyingFixture(),original={check:W.cm.checkCollision,ground:W.cm.getGroundHeight,keys:Object.keys(W.cm)};try{
  const gate=W.gates[0],x=gate.item.x+gate.item.w/5;W.cm.addCollider(new W.THREE.Box3(new W.THREE.Vector3(x-1,0,gate.z-1),new W.THREE.Vector3(x+1,5,gate.z+1)),'r350-negative-wall');
  const r=module.checkWuyingCurrentAccess(W);assert.ok(r.faults.some(x=>x.includes('west')&&x.includes('blocked')));assert.equal(W.cm.checkCollision,original.check);assert.equal(W.cm.getGroundHeight,original.ground);assert.equal(Object.hasOwn(W.cm,'checkCollision'),original.keys.includes('checkCollision'));assert.equal(Object.hasOwn(W.cm,'getGroundHeight'),original.keys.includes('getGroundHeight'));
 }finally{W.cm.removeByTag('r350-negative-wall');W.dispose();}
});
test('partial observation installation restores the first method if the second is read-only',()=>{
 assert.equal(typeof module.checkWuyingCurrentAccess,'function');const W=actualWuyingFixture(),original=W.cm.checkCollision;try{
  Object.defineProperty(W.cm,'getGroundHeight',{value:W.cm.getGroundHeight,writable:false,configurable:true});
  assert.throws(()=>module.checkWuyingCurrentAccess(W),TypeError);
  assert.equal(W.cm.checkCollision,original);assert.equal(Object.hasOwn(W.cm,'checkCollision'),false);
 }finally{delete W.cm.getGroundHeight;W.dispose();}
});
