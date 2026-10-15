import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {captureGate,meshFingerprint,outerColumnSignature} from '../lib/gate-tower-fixture.mjs';
import {restoreGateRails} from '../lib/gate-rail-retention.mjs';
import {restoreGatePlaques} from '../lib/gate-plaque-retention.mjs';
const g=captureGate(),baseline=JSON.parse(fs.readFileSync(new URL('../fixtures/v9-wumen-retained-geometry.json',import.meta.url)));
test('Wumen retains the original geometry hash after only finite plaque and verified rail-cap/V restoration',()=>{
 const restored=restoreGateRails(restoreGatePlaques(g,'午门'),'午门');
 assert.equal(meshFingerprint(restored,restored.children[g.group.children.indexOf(g.tower)]),baseline.outsideShell);
});
test('Wumen outer eave-column meshes remain bitwise retained',()=>assert.deepEqual(outerColumnSignature(g.tower),baseline.outerColumns));
test('Wumen top and ramp supports remain unchanged',()=>assert.deepEqual(g.builder.walkables.map(r=>r.type==='box'?{...r,box:{min:r.box.min.toArray(),max:r.box.max.toArray()}}:r),baseline.walkables));
test('Wumen upper doors use lattice leaves on both sides, never ground-gate studded boards',()=>{
 const studded=[];g.tower.traverse(m=>{if(m.isMesh&&m.material.name==='door_studded')studded.push(m);});assert.equal(studded.length,0);
 const leaves=g.tower.children.filter(m=>m.userData.gatePart==='open-lattice-leaf');assert.equal(leaves.length,4);assert.deepEqual(new Set(leaves.map(m=>m.userData.geographicSide)),new Set(['north','south']));
 for(const leaf of leaves)assert.equal(leaf.material.name,'lattice_doors');
});
test('Wumen gable outside depth ends at the recessed enclosure faces',()=>{
 const gables=g.tower.children.filter(m=>m.userData.gatePart==='gable-wall');assert.equal(gables.length,2);
 for(const m of gables){const b=new g.THREE.Box3().setFromObject(m);assert.ok(Math.abs(b.min.z+10.05)<1e-5);assert.ok(Math.abs(b.max.z-10.05)<1e-5);}
});

import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
for(const name of ['午门','神武门'])test(`${name} production material merge preserves metadata, visible openings and finite geometry`,()=>{
 const c=captureGate(name),before=new Set();let triangles=0;
 c.group.traverse(m=>{if(m.isMesh){before.add(m.material);triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;}});
 const merged=PalaceBuilder.prototype.finish.call(c.builder,c.group);merged.updateMatrixWorld(true);
 assert.equal(merged.userData.architecture.filter(a=>a.id===`axis/${name==='午门'?'wumen':'shenwu'}-upper-tower`).length,1);
 let after=0;merged.traverse(m=>{if(!m.isMesh)return;assert.ok(before.has(m.material));after+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;assert.ok([...m.geometry.attributes.position.array].every(Number.isFinite));});assert.equal(after,triangles);
 const top=name==='午门'?12.3:10.3,z=c.data.position.z,range=name==='午门'?11.2:7.65;
 for(const x of name==='午门'?[0]:[-8.19625,0,8.19625]){
  for(const sign of [-1,1]){const origin=new c.THREE.Vector3(x,top+1,z-sign*range),direction=new c.THREE.Vector3(0,0,sign);const ray=new c.THREE.Raycaster(origin,direction,0,2*range);assert.equal(ray.intersectObject(merged,true).length,0,`${name} door at ${x} visibly sealed`);}
 }
 const ray=new c.THREE.Raycaster(new c.THREE.Vector3(name==='午门'?15:14,top+1,z-range),new c.THREE.Vector3(0,0,1),0,2*range);assert.ok(ray.intersectObject(merged,true).length>0,'closed facade still visible after merge');
});
