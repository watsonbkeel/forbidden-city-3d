import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fixture,indices,declarations,meshes,hash} from './lib/r63-west-unknown-annex-fixture.mjs';
const audit=JSON.parse(fs.readFileSync(new URL('./fixtures/r63-west-annex-independent-audit.json',import.meta.url)));
const actualDeclarations=JSON.parse(fs.readFileSync(new URL('../data/zones/west-six.json',import.meta.url))).items;
for(const index of indices)test(`R63 west annex ${index}: actual production dispatch matches independent furnish-boundary audit`,()=>{
 const expected=audit.rows.find(r=>r.index===index),calls=[],furnished=new Set();
 assert.deepEqual(declarations[index],expected.item);
 assert.deepEqual(actualDeclarations[index],expected.item,'exact original declaration, no new historical room name');
 assert.equal(expected.item.name,undefined);
 assert.deepEqual(expected.otherSourceBackedRoles,[]);
 assert.equal(expected.sourceGapEvidence.length,1);
 const evidence=expected.sourceGapEvidence[0];assert.deepEqual(evidence.sourceEvidence,{});assert.equal(evidence.namedEntity,null);assert.equal(evidence.currentCycleAccepted,false);
 const a=fixture(index,{dispatch:true,beforeBuild:kit=>{
  const original=kit.furnish;
  kit.furnish=function(...args){
   const beforeMeshes=new Set(meshes(kit.root)),beforeCols=new Set(kit.colliders),walkables=kit.walkables.length;
   const result=original.apply(this,args);
   const added=meshes(kit.root).filter(m=>!beforeMeshes.has(m));for(const m of added)furnished.add(m);
   calls.push({kind:args[1],room:structuredClone(args[2]),meshes:added.map((m,localIndex)=>{m.geometry.computeBoundingBox();const b=m.geometry.boundingBox;return {localIndex,material:m.material.name,position:m.position.toArray(),dimensions:b.max.clone().sub(b.min).toArray(),name:m.name,userData:structuredClone(m.userData),geometryType:m.geometry.type}}),colliders:kit.colliders.filter(c=>!beforeCols.has(c)).map(c=>({min:c.min.toArray(),max:c.max.toArray()})),walkableDelta:kit.walkables.length-walkables});
   return result;
  };
 }});
 assert.equal(calls.length,1,'one actual original generic furnishRoom dispatch');
 for(const key of ['kind','room','meshes','colliders','walkableDelta'])assert.deepEqual(calls[0][key],expected.furnishCalls[0][key],key);
 assert.equal(calls[0].meshes.length,expected.genericMeshes);assert.equal(calls[0].colliders.length,expected.genericColliders);
 assert.equal(a.kit.rooms.length,1);for(const key of ['id','name','kind','min','max','floorY','doors','spawns'])assert.deepEqual(a.kit.rooms[0][key],expected.rooms[0][key],key);
 const retained=[];a.built.f.traverse(m=>{if(!m.isMesh||furnished.has(m))return;retained.push({mat:m.material.name,pos:m.position.toArray(),rot:m.rotation.toArray(),role:m.userData.role??null,geo:Object.fromEntries(Object.entries(m.geometry.attributes).map(([key,attr])=>[key,[attr.itemSize,...attr.array]])),index:m.geometry.index?[...m.geometry.index.array]:null})});
 assert.equal(hash(retained),expected.retainedGeometryHash,'independent audited retained-shell hash');
 a.dispose();
});
test('R63 west annex independent audit keeps scope at 13 declarations, 80 props, 80 own COL, 14 cover',()=>{
 assert.deepEqual(audit.rows.map(r=>r.index),indices);assert.equal(indices.length,13);
 assert.deepEqual(audit.totals,{genericMeshes:80,genericColliders:80,cover:14});
 for(const excluded of [2,8,14,15,23,24,30,31,39,40,46,47,54])assert.ok(!indices.includes(excluded));
});
