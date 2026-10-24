import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
import{fixture,meshes,meshRow,hash}from'./lib/r66-h/fixture.mjs';import{frozenFixture}from'./lib/r66-h/frozen-fixture.mjs';
const before=JSON.parse(fs.readFileSync(new URL('./fixtures/r66-h/inventory-before.json',import.meta.url)));
for(const name of['重华宫','延春阁'])test('R66 final cumulative precise retention against frozen R65: '+name,async()=>{const old=await frozenFixture(name),w=fixture(name);try{
 const role=before[name].role,oldPlaques=new Set(old.kit.plaques.flatMap(p=>[p.mesh,p.frame])),newPlaques=new Set(w.kit.plaques.flatMap(p=>[p.mesh,p.frame]));
 const select=(a,plaques)=>meshes(a.f).filter(m=>m.userData.role!==role&&!m.userData.role?.startsWith('r66-chonghua-south-knee')&&!(name==='延春阁'&&plaques.has(m)));
 assert.equal(hash(select(w,newPlaques).map(meshRow)),hash(select(old,oldPlaques).map(meshRow)),'all retained old render bytes, including original complete balcony, unchanged');
 const removals=new Set(before[name].removedColliders.map(hash));assert.equal(old.kit.colliders.filter(c=>removals.has(hash(c))).length,before[name].removedColliders.length);
 assert.deepEqual(JSON.parse(JSON.stringify(w.kit.colliders)),JSON.parse(JSON.stringify(old.kit.colliders.filter(c=>!removals.has(hash(c))))));
 for(const k of['walkables','mapItems','regions'])assert.equal(hash(w.kit[k]),hash(old.kit[k]));
 const clean=rs=>rs.map(({inventory,layout,...r})=>r);assert.deepEqual(clean(w.kit.rooms),old.kit.rooms);
 assert.equal(w.f.userData.structure.inventory.knownEmpty,false);
 if(name==='延春阁'){assert.equal(w.f.userData.r66YanchunSouth,undefined);assert.equal(meshes(w.f).filter(m=>m.userData.role?.startsWith('r66-yanchun-south-')).length,0);const p=w.kit.plaques.find(p=>p.text===name);assert.equal(p.mesh.position.y,4.97);}
 }finally{old.dispose();w.dispose()}});
