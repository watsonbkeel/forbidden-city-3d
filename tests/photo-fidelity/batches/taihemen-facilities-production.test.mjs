import test from 'node:test';import assert from 'node:assert/strict';
import {facilitiesCWorld} from '../../lib/r157-taihemen-facilities-c-world.mjs';
test('actual uninjected production dispatch owns six source-registered partial fixtures without accepting them',async()=>{
 const W=await facilitiesCWorld({candidate:'production'});try{
  assert.equal((W.p.fixtures??[]).length,6,'actual production must build all six reviewed fixtures');
  assert.equal(W.p.candidateStatus,'PRODUCTION_C_SOURCE_FIT_NOT_SURVEY');assert.equal(W.p.accepted,false);
  for(const f of W.p.fixtures){assert.equal(f.implementedInProduction,true);assert.equal(f.productionBinding,f.id);assert.equal(f.accepted,false);}
 }finally{W.dispose();}
});

import * as T from 'three';import {PalaceBuilder} from '../../../src/scene/PalaceBuilder.js';import {library} from '../../lib/inner-palace-fixture.mjs';
test('observed production approach rejects wrong multi-rect or nonfinite front datum before creating any terrace objects',()=>{
 for(const rects of [[{hw:25.03,z0:-225.47,z1:-202.93},{hw:25.03,z0:-202.93,z1:-190}],[{hw:25.03,z0:NaN,z1:-202.93}]]){
  const b=new PalaceBuilder(new T.Scene(),library()),g=new T.Group();g.name='太和门';b.addObject(g);
  try{assert.throws(()=>b.buildTerraceUnion(g,rects,{layers:1,lh:3.44,run:5.504,setback:0,stairW:11.748,taihemenSouth:true}),/Taihemen observed/);assert.equal(g.children.length,0);assert.equal(b.colliders.length,0);assert.equal(b.walkables.length,0);}finally{b.dispose();}
 }
});
test('actual approach owns exactly77 physical records and3 real supports via explicit provenance, not a spatial exclusion box',async()=>{
 const W=await facilitiesCWorld({candidate:'production'});try{
  assert.equal(W.b.colliders.filter(c=>c.taihemenObservedSource==='axis/taihemen-observed-approach').length,77);
  assert.equal(W.b.walkables.filter(c=>c.taihemenObservedSource==='axis/taihemen-observed-approach').length,3);
 }finally{W.dispose();}
});
import {assertTaihemenFacilitiesCInWorld} from '../../lib/r157-taihemen-facilities-c-check.mjs';
test('pure production consumer observes all reviewed visible/physical facilities and rejects an isolated identity',async()=>{
 const W=await facilitiesCWorld({candidate:'production'});try{
  const result=assertTaihemenFacilitiesCInWorld(W,{production:true});assert.equal(result.fixtures,6);assert.equal(result.accepted,false);
  assert.throws(()=>assertTaihemenFacilitiesCInWorld(W),/candidate missing/);
  W.p.fixtures[0].productionBinding='wrong-owner';assert.throws(()=>assertTaihemenFacilitiesCInWorld(W,{production:true}),/binding/);
 }finally{W.dispose();}
});
import {taihemenPromotionSignature} from '../../lib/r157-taihemen-promotion-signature.mjs';
test('actual production exactly preserves corrected isolated C geometry/material/render/metadata/physics, with narrow binding adaptation',async()=>{
 const reference=await facilitiesCWorld(),live=await facilitiesCWorld({candidate:'production'});try{
  assert.deepEqual(taihemenPromotionSignature(live),taihemenPromotionSignature(reference));
 }finally{reference.dispose();live.dispose();}
});
test('promotion oracle rejects hidden groups, shifted geometry, material change and missing real physics',async()=>{
 const W=await facilitiesCWorld({candidate:'production'});try{
  const baseline=taihemenPromotionSignature(W);W.root.visible=false;assert.notDeepEqual(taihemenPromotionSignature(W),baseline);W.root.visible=true;
  let mesh;W.root.traverse(o=>{if(!mesh&&o.isMesh)mesh=o;});const p=mesh.geometry.attributes.position,old=p.array[0];p.array[0]+=.01;assert.notDeepEqual(taihemenPromotionSignature(W),baseline);p.array[0]=old;
  const material=Array.isArray(mesh.material)?mesh.material[0]:mesh.material,opacity=material.opacity;material.opacity=.25;assert.notDeepEqual(taihemenPromotionSignature(W),baseline);material.opacity=opacity;
  const c=W.cm.colliders.pop();assert.notDeepEqual(taihemenPromotionSignature(W),baseline);W.cm.colliders.push(c);assert.deepEqual(taihemenPromotionSignature(W),baseline);
 }finally{W.dispose();}
});
test('raw pre-merge object hierarchy also equals reviewed C and detects a hidden fixture group',async()=>{
 const reference=await facilitiesCWorld({merge:false}),live=await facilitiesCWorld({candidate:'production',merge:false});try{
  const expected=taihemenPromotionSignature(reference);assert.deepEqual(taihemenPromotionSignature(live),expected);
  live.root.getObjectByName(live.p.fixtureIds[0]).visible=false;assert.notDeepEqual(taihemenPromotionSignature(live),expected);
 }finally{reference.dispose();live.dispose();}
});
