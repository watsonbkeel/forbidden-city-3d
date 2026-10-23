import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {taihemenFragment,meshRows,hash} from './lib/r58-taihemen-fragment.mjs';
const url=new URL('./lib/r58-taihemen-world-check.mjs',import.meta.url);
const api=existsSync(url)?await import(url):{};
test('read-only existing-W QA verifies actual porch geometry / collision and never reconstructs a world',()=>{
  assert.equal(typeof api.assertTaihemenInWorld,'function','missing existing-W consumer');
  const W=taihemenFragment(),before=hash({scene:meshRows(W.scene),colliders:W.cm.colliders.map(c=>c.box),walkables:W.cm.walkables});
  try {
    const r=api.assertTaihemenInWorld(W);
    assert.equal(r.openPorchSamples,7);assert.equal(r.closedEndSamples,2);assert.equal(r.blockedInnerSamples,6);
    assert.equal(r.documentedDepthBays,4);assert.equal(r.retainedModelDepthBays,3);assert.equal(r.depthStatus,'BLOCKED_SOURCE');
    assert.equal(hash({scene:meshRows(W.scene),colliders:W.cm.colliders.map(c=>c.box),walkables:W.cm.walkables}),before);
    assert.throws(()=>api.assertTaihemenInWorld({}),/existing/);
  } finally {W.builder.dispose();}
});
test('existing-W consumer rejects unintegrated baseline instead of silently manufacturing the feature',()=>{
  assert.equal(typeof api.assertTaihemenInWorld,'function');
  const W=taihemenFragment({candidate:false});try {assert.throws(()=>api.assertTaihemenInWorld(W),/Taihemen south/);}finally{W.builder.dispose();}
});
for(const [label,mutate] of [
  ['missing rendered platform and paving',W=>{const removed=[];W.root.traverse(m=>{if(m.isMesh&&['stone_slab','sumeru_band'].includes(m.material.name))removed.push(m);});assert.ok(removed.length);removed.forEach(m=>m.removeFromParent());}],
  ['hidden closed lattice',W=>W.root.traverse(m=>{if(m.isMesh&&m.material.name==='lattice_doors')m.visible=false;})],
  ['hidden ancestor',W=>{W.root.visible=false;}],
  ['hidden material',W=>W.root.traverse(m=>{if(m.isMesh&&m.material.name==='lattice_doors')m.material.visible=false;})],
])test(`existing-W consumer rejects ${label} despite retained colliders and metadata`,()=>{
  const W=taihemenFragment();try {mutate(W);assert.throws(()=>api.assertTaihemenInWorld(W),/visible|rendered/);}finally{W.builder.dispose();}
});
