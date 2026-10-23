import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {hallFragment,meshRows,hash,geometrySignature} from './lib/r54-jiaotai-fragment.mjs';
const before = JSON.parse(fs.readFileSync(new URL('./fixtures/r54-jiaotai-before.json',import.meta.url)));

test('Jiaotai alone has a source-bounded low display setting instead of the generic throneArea', () => {
  const {group,shell,builder}=hallFragment();
  const p=shell.userData.structure.displaySetting;
  assert.ok(p, 'dedicated Jiaotai display setting must replace the generic double platform');
  assert.equal(p.id,'jiaotai-display-setting-r54');
  assert.equal(p.dimensionStatus,'REVERSIBLE_PHOTO_FIT_NOT_MEASURED');
  assert.equal(p.photographyDate,null);
  assert.equal(p.originalSealInventory,null);
  assert.deepEqual(p.groups,['central-low-platform','west-covered-row','east-covered-row','rear-covered-row']);
  const revisedNames=new Set(['jiaotai-red-rear-screen','jiaotai-screen-side-frame']);
  assert.deepEqual(meshRows(group).filter(r=>!r.displayId&&!revisedNames.has(r.name)),before.retainedJiaotai.filter(r=>!revisedNames.has(r.name)),'all retained meshes except the three documented lower-screen revisions preserve exact identity');
  assert.equal(p.backdropRevision.meshes.length,3);
  // Restore only the three recorded bottom-coordinate edits on a cloned group.
  // Its full legacy hashes must then match R53; no other property may drift.
  const restored=group.clone(true);
  for(const row of p.backdropRevision.meshes){const m=restored.children.flatMap(o=>o.children).find(m=>m.name===row.owner&&m.position.x===row.x);m.geometry=m.geometry.clone();const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++)if(a.getY(i)<0)a.setY(i,row.oldBottomY-m.position.y);}
  assert.deepEqual(meshRows(restored).filter(r=>!r.displayId),before.retainedJiaotai,'only documented lower vertices differ from R53; geometry/UV/index/material/matrix/flags otherwise exact');
  for(const row of p.backdropRevision.meshes){const mesh=group.children.flatMap(o=>o.children).find(m=>m.name===row.owner&&m.position.x===row.x);assert.ok(mesh);const b=new THREE.Box3().setFromObject(mesh);assert.ok(Math.abs(b.min.y-2.19)<1e-6);assert.ok(Math.abs(b.max.y-row.unchangedTopY)<1e-6);}
  assert.ok(meshRows(group).filter(r=>r.displayId).length>10);
  assert.deepEqual(builder.colliders.slice(0,before.colliders.length-before.removedColliders.length).map(b=>({min:b.min.toArray(),max:b.max.toArray()})),before.colliders.slice(0,-before.removedColliders.length),'all pre-existing shell colliders are exact');
  for(const old of before.removedColliders)assert.equal(builder.colliders.some(b=>hash({min:b.min.toArray(),max:b.max.toArray()})===hash(old)),false,'old generic furniture envelope removed');
});

test('all R27/R28 sources and the complete Zhonghe fragment remain byte-identical', () => {
  for(const [name,digest] of Object.entries(before.retainedModules))assert.equal(hash(fs.readFileSync(new URL('../src/scene/palace/special/'+name,import.meta.url))),digest,name);
  assert.deepEqual(meshRows(hallFragment('中和殿').group),before.zhonghe);
});

test('every new collider has a visible geometric owner; only the real low base is a new walkable', () => {
  const {group,shell,builder}=hallFragment(),p=shell.userData.structure.displaySetting;
  assert.ok(p,'new owner manifest exists');
  const newMeshes=[];group.traverse(m=>{if(m.userData.jiaotaiDisplayId)newMeshes.push(m);});
  assert.ok(newMeshes.every(m=>m.isMesh&&m.name===m.userData.jiaotaiDisplayId));
  assert.equal(new Set(newMeshes.map(m=>m.name)).size,newMeshes.length,'semantic identifiers are unique, not color-based deletion');
  assert.equal(p.colliders.length,builder.colliders.length-(before.colliders.length-before.removedColliders.length));
  for(const record of p.colliders){
    const m=group.getObjectByName(record.owner);assert.ok(m,record.owner);
    const actual=new THREE.Box3().setFromObject(m);
    for(const side of ['min','max'])for(let i=0;i<3;i++)assert.ok(Math.abs(actual[side].getComponent(i)-record[side][i])<1e-6,record.owner+' exact envelope');
    assert.equal(builder.colliders.filter(c=>['min','max'].every(side=>c[side].toArray().every((v,i)=>Math.abs(v-record[side][i])<1e-6))).length,1);
  }
  assert.equal(builder.walkables.length,1);
  assert.equal(builder.walkables[0].rescue,false);
  const base=group.getObjectByName('r54-jiaotai-low-platform');
  assert.ok(base);
  const b=new THREE.Box3().setFromObject(base);
  assert.ok(b.max.y-2.16<.3);
  assert.deepEqual(builder.walkables[0].box.min.toArray(),[b.min.x,b.max.y,b.min.z]);
  assert.deepEqual(builder.walkables[0].box.max.toArray(),[b.max.x,b.max.y,b.max.z]);
  const chair=group.getObjectByName('r54-jiaotai-chair-seat');
  assert.ok(chair);
  assert.ok(new THREE.Box3().setFromObject(chair).min.y> b.max.y);
  for(const s of ['west','east']){
    const row=group.getObjectByName(`r54-jiaotai-${s}-row-drape`);assert.ok(row);
    assert.ok(Math.abs(new THREE.Box3().setFromObject(row).min.y-2.19)<1e-6,'side drape has floor contact, not central-platform support');
  }
});

test('base-material checkpoint retains every neutral vertex, UV, index, transform and physical bound',()=>{
 const neutral=JSON.parse(fs.readFileSync(new URL('../docs/validation/r54-jiaotai-display/neutral/geometry-and-navigation.json',import.meta.url)));
 const {group,shell}=hallFragment(),p=shell.userData.structure.displaySetting;
 assert.equal(geometrySignature(group),neutral.unmergedGeometryHash);
 assert.equal(hash({colliders:p.colliders,walkables:p.walkables}),neutral.physicalHash);
 assert.equal(p.stage,'SOURCE_BOUNDED_BASE_MATERIALS_PARTIAL_NOT_RESTORATION');
 const materials=new Map();group.traverse(m=>{if(m.userData.jiaotaiDisplayId)materials.set(m.material.name,m.material.color.getHex());});
 assert.deepEqual(Object.fromEntries(materials),{'r54-jiaotai-pale':0xe4dfca,'r54-jiaotai-carpet':0x56665a,'r54-jiaotai-dark':0x2d2925,'r54-jiaotai-textile':0xcdb352,'r54-jiaotai-red':0x7f261f,'r54-jiaotai-metal':0x343c37,'r54-jiaotai-blue':0x2f81a3});
});
