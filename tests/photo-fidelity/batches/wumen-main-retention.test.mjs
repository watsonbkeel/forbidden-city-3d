import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {captureGate,meshFingerprint,outerColumnSignature} from '../../lib/gate-tower-fixture.mjs';
const old=JSON.parse(fs.readFileSync(new URL('../../fixtures/r157-wumen-main-controls.json',import.meta.url)));
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function renderStateHash(group){const rows=[];group.traverse(m=>{if(!m.isMesh)return;const material=(Array.isArray(m.material)?m.material:[m.material]).map(mat=>{const textures=Object.entries(mat).filter(([,v])=>v?.isTexture),meta={textures:Object.fromEntries(textures.map(([,t])=>[t.uuid,{}])),images:{}};const {uuid,...data}=mat.toJSON(meta);for(const [key,t]of textures)data[key]={name:t.name,wrap:[t.wrapS,t.wrapT],repeat:t.repeat.toArray(),offset:t.offset.toArray(),colorSpace:t.colorSpace};return data;});rows.push({material,flags:[m.castShadow,m.receiveShadow,m.visible,m.frustumCulled,m.renderOrder],groups:m.geometry.groups,drawRange:m.geometry.drawRange});});return hash(rows);}
test('R157 main tower preserves exact d70a4a02 outside-body geometry/material/physics and every support primitive',()=>{
 // Exact old assertions live unchanged in the historical companion. The child
 // freezes the full ebd production src/data closure; live equality is a separate test.
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const child=spawnSync(process.execPath,['--import',fileURLToPath(new URL('../../lib/r157-wumen-main-parent-hook.mjs',import.meta.url)),'--test','--test-reporter=tap',fileURLToPath(new URL('./wumen-main-retention.historical.mjs',import.meta.url))],{cwd:fileURLToPath(new URL('../../../',import.meta.url)),env,encoding:'utf8',timeout:60000,maxBuffer:4*1024*1024});
 assert.equal(child.error,undefined);assert.equal(child.signal,null);assert.equal(child.status,0,child.stdout+'\n'+child.stderr);assert.match(child.stdout,/ok 1 - R157 main tower preserves exact/);assert.match(child.stdout,/# tests 1(?:\r?\n|$)/);
});

test('R157 main tower does not alter Shenwu geometry/material/physics',()=>{
 const s=captureGate('神武门');assert.equal(meshFingerprint(s.group),old.shenwu.geometry);assert.equal(renderStateHash(s.group),old.shenwu.renderState);assert.equal(hash({colliders:s.builder.colliders,walkables:s.builder.walkables}),old.shenwu.physics);
});
test('all visible main-tower shafts meet the retained lower beam and share the inherited floor datum',()=>{
 const c=captureGate(),beam=c.tower.children.find(m=>m.userData.gatePart==='retained-upper-beam');
 beam.geometry.computeBoundingBox();const beamMin=beam.position.y+beam.geometry.boundingBox.min.y;
 for(const m of c.tower.children.filter(m=>m.userData.gatePart?.endsWith('column'))){
  assert.ok(Math.abs(m.position.y-m.geometry.parameters.height/2)<1e-9);
  assert.ok(Math.abs(m.position.y+m.geometry.parameters.height/2-beamMin)<1e-6);
 }
 // This establishes the retained lower-body join only, not full-height historical timber joinery.
 assert.equal(c.tower.position.y,12.3);assert.equal(c.tower.userData.structure.horizontalGrid.completeTimberFrame,false);
});

import {PalaceBuilder} from '../../../src/scene/PalaceBuilder.js';
test('production merging preserves all eighteen facade identities and their unknown leaf evidence',()=>{
 const c=captureGate(),merged=PalaceBuilder.prototype.finish.call(c.builder,c.group);
 const main=merged.userData.architecture.find(a=>a.id==='axis/wumen-upper-tower');
 assert.equal(main.facadeBays?.length,18);
 assert.equal(new Set(main.facadeBays.map(b=>b.id)).size,18);
 assert.ok(main.facadeBays.every(b=>b.leafCount==='UNKNOWN'));
 c.builder.dispose();
});
test('new main-tower geometry is released during production merge and final builder disposal',()=>{
 for(let cycle=0;cycle<2;cycle++){
  const c=captureGate(),original=new Map();c.tower.traverse(m=>{if(m.isMesh)original.set(m.geometry,0);});
  for(const [geo]of original)geo.addEventListener('dispose',()=>original.set(geo,original.get(geo)+1));
  c.lib.owns=mat=>!c.builder.ownedMaterials.includes(mat);
  const merged=PalaceBuilder.prototype.finish.call(c.builder,c.group);
  assert.ok([...original.values()].every(n=>n===1));
  const final=new Map();merged.traverse(m=>{if(m.isMesh)final.set(m.geometry,0);});
  for(const [geo]of final)geo.addEventListener('dispose',()=>final.set(geo,final.get(geo)+1));
  c.builder.dispose();assert.ok([...final.values()].every(n=>n===1));assert.equal(c.builder.ownedObjects.size,0);assert.equal(c.builder.colliders.length,0);assert.equal(c.builder.walkables.length,0);
 }
});
