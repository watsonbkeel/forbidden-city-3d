import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {read,decode,historicalCaissonCandidate as candidate} from './lib/taihe-column-fixture.mjs';
import {captureTaiheControl} from './lib/taihe-core-fixture.mjs';
import {restoreHistoricalDetail,restoreHistoricalInventory,restoreHistoricalFallbackAttributes} from './lib/taihe-shell-geometry-retention.mjs';
const original=decode(read('public/models/interiors/taihe-v17-display-28d7a11dbeda.glb'));
const fixture=JSON.parse(read('tests/fixtures/taihe-shell-fallback-retirement.json'));
function fallback(){const c=captureTaiheControl('太和殿');return{...c,meshes:c.group.children.filter(o=>o.userData.taiheCoreOwner)};}
function brokenMesh(mesh){const copy=mesh.clone(false);copy.material=mesh.material.clone();copy.geometry=mesh.geometry.clone();return copy;}

test('detail restoration reinserts only the exact320 retired faces and preserves original order',()=>{
 assert.deepEqual(restoreHistoricalDetail(candidate),original.triangles);
 assert.deepEqual(restoreHistoricalInventory(candidate),original.inventory);
});
test('detail restoration rejects changed retained attributes, swapped faces and missing faces',()=>{
 for(const key of ['POSITION','NORMAL','TEXCOORD_0']){const bad=structuredClone(candidate),face=bad.triangles.find(t=>t.vertices[0][key]);face.vertices[0][key][0]+=.125;assert.throws(()=>restoreHistoricalDetail(bad));}
 const swapped=structuredClone(candidate);[swapped.triangles[0],swapped.triangles[1]]=[swapped.triangles[1],swapped.triangles[0]];assert.throws(()=>restoreHistoricalDetail(swapped));
 const missing=structuredClone(candidate);missing.triangles.shift();assert.throws(()=>restoreHistoricalDetail(missing));
});
test('detail restoration rejects extra, missing or modified declared tails and identity drift',()=>{
 for(const change of [x=>{const i=x.triangles.findLastIndex(t=>t.material==='taihe_gold');x.triangles.splice(i+1,0,structuredClone(x.triangles[i]));},x=>x.triangles.splice(x.triangles.findLastIndex(t=>t.material==='taihe_gold'),1),x=>{const t=x.triangles.filter(t=>t.material==='taihe_gold').at(-1);t.vertices[0].POSITION[0]+=.125;},x=>x.contract.caissonShellTriangles++,x=>delete x.contract.caissonShellMaskSHA256]){const bad=structuredClone(candidate);change(bad);assert.throws(()=>restoreHistoricalDetail(bad));}
});
test('inventory restoration rejects a changed retained entry or unrelated appended entry',()=>{
 for(const change of [x=>x.inventory[0].min[0]+=.1,x=>x.inventory.push({name:'unrelated',min:[0,0,0],max:[1,1,1]})]){const bad=structuredClone(candidate);change(bad);bad.contract.inventory=JSON.stringify(bad.inventory);assert.throws(()=>restoreHistoricalInventory(bad));}
});
test('fallback restoration returns all exact historical attribute arrays without mutating live geometry',()=>{
 const c=fallback();try{assert.equal(c.meshes.length,8);for(const mesh of c.meshes){const before=mesh.geometry.attributes,restored=restoreHistoricalFallbackAttributes(mesh),row=fixture.perMaterial[mesh.material.name];assert.equal(mesh.geometry.attributes,before);for(const [name,a]of Object.entries(restored)){assert.equal(a.count,row.preCaissonVertexCount);assert.notEqual(a.array,before[name].array);}}}finally{c.builder.dispose();}
});
test('fallback restoration rejects changed retained position, normal, UV and runtime color',()=>{
 const c=fallback();try{const gold=c.meshes.find(m=>m.material.name==='taihe_gold');for(const name of ['position','normal','uv','color']){const bad=brokenMesh(gold);bad.geometry.attributes[name].array[0]+=.125;assert.throws(()=>restoreHistoricalFallbackAttributes(bad));bad.geometry.dispose();bad.material.dispose();}}finally{c.builder.dispose();}
});
test('fallback restoration rejects tail mutation, neutral ownership drift and incorrect array lengths',()=>{
 const c=fallback();try{const gold=c.meshes.find(m=>m.material.name==='taihe_gold');for(const name of ['position','normal','uv','color']){const bad=brokenMesh(gold);bad.geometry.attributes[name].array[bad.geometry.attributes[name].array.length-1]+=.125;assert.throws(()=>restoreHistoricalFallbackAttributes(bad));bad.geometry.dispose();bad.material.dispose();}
 const bad=brokenMesh(gold),p=bad.geometry.attributes.position;bad.geometry.setAttribute('position',new THREE.BufferAttribute(p.array.slice(3),3));assert.throws(()=>restoreHistoricalFallbackAttributes(bad));bad.geometry.dispose();bad.material.dispose();}finally{c.builder.dispose();}
});
test('fallback restoration does not hide material sidedness or foreign attribute regressions',()=>{
 const c=fallback();try{const gold=c.meshes.find(m=>m.material.name==='taihe_gold');for(const change of [m=>m.material.side=THREE.FrontSide,m=>m.geometry.setAttribute('foreign',new THREE.Float32BufferAttribute(new Float32Array(m.geometry.attributes.position.count),1)),m=>m.geometry.attributes.normal.normalized=true]){const bad=brokenMesh(gold);change(bad);assert.throws(()=>restoreHistoricalFallbackAttributes(bad));bad.geometry.dispose();bad.material.dispose();}}finally{c.builder.dispose();}
});
