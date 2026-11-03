import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import * as THREE from 'three';
const moduleURL = process.env.BATCH_MATRIX_MODULE ? pathToFileURL(process.env.BATCH_MATRIX_MODULE) : new URL('../../src/render/BatchedBuilder.js', import.meta.url);
const {BatchedBuilder} = await import(moduleURL);

function fixture(t, {count = 2, distinctRoof = false} = {}) {
  const scene = new THREE.Scene(), parent = new THREE.Group(); scene.add(parent);
  const material = new THREE.MeshStandardMaterial({name: distinctRoof ? 'roof_ridge_glaze' : 'ordinary-shared', color: 0xc98f2c, roughness: .36, metalness: .05});
  const meshes = Array.from({length: count}, (_, i) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), distinctRoof ? material.clone() : material);
    mesh.position.set(i * 2, .1, -.2); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
  });
  const builder = new BatchedBuilder(scene); let writes = 0;
  const original = THREE.BatchedMesh.prototype.setMatrixAt;
  THREE.BatchedMesh.prototype.setMatrixAt = function(...args) { writes++; return original.apply(this, args); };
  t.after(() => { THREE.BatchedMesh.prototype.setMatrixAt = original; builder.dispose(); for (const m of meshes) { m.geometry.dispose(); if (m.material !== material) m.material.dispose(); } material.dispose(); });
  return {scene, parent, meshes, builder, writes: () => writes};
}
function frame(f, inspect = () => {}) {
  f.builder.begin();
  try { inspect(f.builder.batches); } finally { f.builder.end(); }
}
function payloads(batches) {
  for (const {batch, entries} of batches) for (const {mesh, id} of entries) {
    const actual = batch.getMatrixAt(id, new THREE.Matrix4()).elements;
    assert.deepEqual(actual, mesh.matrixWorld.elements.map(Math.fround), 'real submitted float32 payload must equal the current source world matrix');
  }
}
function writesFor(f, inspect = payloads) { const before = f.writes(); frame(f, inspect); return f.writes() - before; }

// A removed guard must fail the zero-write assertion; a stale snapshot must fail payloads.
test('first frame writes every entry, then 30 unchanged fractional-transform frames write no matrices', t => {
  const f = fixture(t, {count: 32});
  assert.equal(writesFor(f), 32);
  const batch = f.builder.batches[0].batch, version = batch._matricesTexture.version;
  for (let i = 0; i < 30; i++) assert.equal(writesFor(f), 0, 'unchanged frame must not dirty matrix texture');
  assert.equal(batch._matricesTexture.version, version);
});
test('identity matrices are still submitted on first use and after explicit rebuild', t => {
  const f = fixture(t); f.meshes.forEach(m => m.position.set(0, 0, 0));
  assert.equal(writesFor(f), 2); const old = f.builder.batches[0].batch;
  f.builder.signature = ''; assert.equal(writesFor(f), 2); assert.notEqual(f.builder.batches[0].batch, old);
  assert.equal(writesFor(f), 0);
});
for (const kind of ['child translation', 'parent translation', 'parent rotation', 'parent scale', 'reparent']) test(`${kind} submits current world transforms`, t => {
  const f = fixture(t); frame(f);
  if (kind === 'child translation') f.meshes[0].position.x += .125;
  if (kind === 'parent translation') f.parent.position.z = 7.125;
  if (kind === 'parent rotation') f.parent.rotation.y = .37;
  if (kind === 'parent scale') f.parent.scale.set(1.3, .7, 1.1);
  if (kind === 'reparent') { const p = new THREE.Group(); p.position.x = 9; f.scene.add(p); p.add(f.meshes[0]); }
  assert.equal(writesFor(f), kind === 'child translation' ? 1 : 2);
  assert.equal(writesFor(f), 0);
});
test('100 changing frames, hidden motion and replacement matrix objects never freeze a dynamic member', t => {
  const f = fixture(t); frame(f);
  for (let i = 1; i <= 100; i++) {
    f.meshes[0].position.x = Math.sin(i / 7); f.meshes[0].rotation.y = i / 50;
    f.parent.visible = i % 3 !== 0;
    assert.equal(writesFor(f), 1);
  }
  f.parent.visible = true; f.meshes[0].matrixWorld = new THREE.Matrix4();
  assert.equal(writesFor(f), 0, 'equal recomputed matrix object need not be resubmitted');
});
test('manual world matrices retain tiny finite changes and signed zero exactly', t => {
  const f = fixture(t); const m = f.meshes[0], ownedWorld = new THREE.Matrix4();
  // A world-matrix owner writes after parent traversal; Three's force=true
  // would otherwise overwrite a direct matrixWorld assignment from matrix.
  m.updateMatrixWorld = function() { this.matrixWorld.copy(ownedWorld); };
  frame(f);
  ownedWorld.elements[12] = 1e-12; assert.equal(writesFor(f), 1);
  ownedWorld.elements[12] = -0; assert.equal(writesFor(f), 1);
  ownedWorld.elements[12] = 0; assert.equal(writesFor(f), 1);
  assert.equal(writesFor(f), 0);
});
for (const value of [NaN, Infinity, -Infinity]) test(`nonfinite ${String(value)} matrix never becomes a valid unchanged snapshot`, t => {
  const f = fixture(t); const m = f.meshes[0], ownedWorld = new THREE.Matrix4();
  m.updateMatrixWorld = function() { this.matrixWorld.copy(ownedWorld); };
  frame(f); ownedWorld.elements[12] = value;
  assert.equal(writesFor(f), 1); assert.equal(writesFor(f), 1);
  ownedWorld.identity(); assert.equal(writesFor(f), 1); assert.equal(writesFor(f), 0);
});
test('visibility and real shadow/culling callbacks remain live without matrix writes', t => {
  const f = fixture(t); f.meshes[0].position.set(0,0,0); f.meshes[1].position.set(1000,0,0);
  const camera = new THREE.PerspectiveCamera(60, 1, .1, 100); camera.position.set(0,0,10); camera.lookAt(0,0,0); camera.updateMatrixWorld(true);
  frame(f); f.meshes[1].castShadow = false;
  assert.equal(writesFor(f, batches => {
    payloads(batches); const {batch, entries} = batches[0];
    assert.equal(batch.castShadow, true);
    batch.onBeforeRender({coordinateSystem: THREE.WebGLCoordinateSystem}, f.scene, camera, batch.geometry, batch.material);
    assert.equal(batch._multiDrawCount, 1);
    const depth = new THREE.MeshDepthMaterial();
    try { batch.onBeforeShadow({coordinateSystem: THREE.WebGLCoordinateSystem}, batch, camera, camera, batch.geometry, depth); }
    finally { depth.dispose(); }
    assert.equal(batch.getVisibleAt(entries[0].id), true); assert.equal(batch.getVisibleAt(entries[1].id), false);
    batch.onAfterShadow(); assert.equal(batch.getVisibleAt(entries[1].id), true);
  }), 0);
  f.parent.visible = false;
  assert.equal(writesFor(f, batches => { payloads(batches); assert.equal(batches[0].batch.castShadow, false); assert.ok(batches[0].entries.every(e => !batches[0].batch.getVisibleAt(e.id))); }), 0);
  assert.ok(f.meshes.every(m => m.visible), 'end restores source visibility');
  f.parent.visible = true; f.meshes[0].visible = false;
  assert.equal(writesFor(f, batches => { assert.equal(batches[0].batch.castShadow, false); assert.equal(batches[0].batch.getVisibleAt(batches[0].entries[0].id), false); }), 0);
  assert.equal(f.meshes[0].visible, false);
});
test('moving an initially culled source into the frustum updates native multi-draw submission', t => {
  const f = fixture(t); f.meshes[0].position.set(0,0,0); f.meshes[1].position.set(1000,0,0);
  const camera = new THREE.PerspectiveCamera(60,1,.1,100); camera.position.set(0,0,10); camera.lookAt(0,0,0); camera.updateMatrixWorld(true);
  const counts = [];
  const inspect = rows => { payloads(rows); const {batch} = rows[0]; batch.onBeforeRender({coordinateSystem: THREE.WebGLCoordinateSystem}, f.scene, camera, batch.geometry, batch.material); counts.push(batch._multiDrawCount); };
  frame(f, inspect); f.meshes[1].position.x = 2; assert.equal(writesFor(f, inspect), 1); assert.deepEqual(counts, [1,2]);
});
for (const change of ['material replacement','geometry replacement','membership addition','membership removal','receiveShadow split']) test(`${change} keeps existing invalidation and initializes rebuilt entries`, t => {
  const f = fixture(t, {count: 3}); frame(f); const old = f.builder.batches[0].batch; let disposed = 0; old.geometry.addEventListener('dispose', () => disposed++);
  if (change === 'material replacement') { const material = f.meshes[0].material.clone(); f.meshes.forEach(m => {m.material = material;}); }
  if (change === 'geometry replacement') f.meshes[0].geometry = f.meshes[0].geometry.clone();
  if (change === 'membership addition') { const m = new THREE.Mesh(new THREE.BoxGeometry(), f.meshes[0].material); m.position.z = 4; m.castShadow = m.receiveShadow = true; f.parent.add(m); f.meshes.push(m); }
  if (change === 'membership removal') f.meshes.pop().removeFromParent();
  if (change === 'receiveShadow split') f.meshes[0].receiveShadow = false;
  const expected = change === 'membership addition' ? 4 : ['membership removal','receiveShadow split'].includes(change) ? 2 : 3;
  assert.equal(writesFor(f), expected); assert.notEqual(f.builder.batches[0].batch, old); assert.equal(disposed, 1); assert.equal(writesFor(f), 0);
});
for (const change of ['roof material mutation','roof attribute revision','roof index revision']) test(`${change} preserves exact-roof signature checks`, t => {
  const f = fixture(t, {distinctRoof: true}); frame(f); const old = f.builder.batches[0].batch;
  if (change === 'roof material mutation') { f.meshes.forEach(m => {m.material.roughness = .5;}); }
  if (change === 'roof attribute revision') { const a = f.meshes[0].geometry.attributes.position; a.setX(0,a.getX(0)+1); a.needsUpdate = true; }
  if (change === 'roof index revision') { const a = f.meshes[0].geometry.index; const x=a.getX(0);a.setX(0,a.getX(1));a.setX(1,x);a.needsUpdate=true; }
  assert.equal(writesFor(f), 2); assert.notEqual(f.builder.batches[0].batch, old); assert.equal(writesFor(f), 0);
});
test('dispose and reinitialize retire matrix snapshots and preserve source resources', t => {
  const f = fixture(t); let sourceDisposed=0; f.meshes[0].geometry.addEventListener('dispose',()=>sourceDisposed++); frame(f);
  const old = f.builder.batches[0].batch; let released=0;old._matricesTexture.addEventListener('dispose',()=>released++);
  f.builder.dispose();f.builder.dispose();assert.equal(released,1);assert.equal(sourceDisposed,0);
  assert.equal(writesFor(f),2);assert.notEqual(f.builder.batches[0].batch,old);assert.equal(writesFor(f),0);
});
test('a failed matrix submission is retried rather than cached as successful', t => {
  const f = fixture(t); frame(f);const batch=f.builder.batches[0].batch, original=batch.setMatrixAt;let failed=false;
  batch.setMatrixAt=function(...args){if(!failed){failed=true;throw new Error('injected write failure');}return original.apply(this,args);};
  f.meshes[0].position.x += 2;
  assert.throws(()=>frame(f),/injected write failure/);assert.ok(f.meshes.every(m=>m.visible));
  assert.equal(writesFor(f),1);assert.equal(writesFor(f),0);
});
