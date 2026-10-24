import test from'node:test';import assert from'node:assert/strict';import{fixture,meshes,meshRow,hash}from'./lib/r68-j/fixture.mjs';
test('SuiChu stone facing stays on front plinth without modifying support or other geometry',async()=>{const a=await fixture('遂初堂',{before:true}),b=await fixture('遂初堂');try{const facing=meshes(b.f).filter(m=>m.userData.detailRole==='r68-suichu-tiger-stone-facing');assert.equal(facing.length,1);const m=facing[0];assert.ok(m.geometry.attributes.color.count>90);assert.equal(m.userData.exactStoneLayout,false);assert.equal(m.userData.scope,'SOUTH_PLINTH_FACE_ONLY');assert.equal(hash(meshes(a.f).filter(m=>!m.userData.role?.startsWith('legacy-unverified-')).map(meshRow)),hash(meshes(b.f).filter(m=>m!==facing[0]).map(meshRow)));for(const k of['walkables','mapItems','regions'])assert.equal(hash(a.kit[k]),hash(b.kit[k]));m.geometry.computeBoundingBox();const bb=m.geometry.boundingBox;assert.ok(bb.min.y>=0&&bb.max.y<=b.p.ph-.03);assert.ok(bb.max.z-bb.min.z<.001);}finally{a.dispose();b.dispose()}});

test('SuiChu stone colors survive production CourtKit.finish merge and dispose', async () => {
  const built = await fixture('遂初堂');
  let finished;
  try {
    const facing = meshes(built.f).find(m => m.userData.detailRole === 'r68-suichu-tiger-stone-facing');
    const colors = Array.from(facing.geometry.attributes.color.array);
    const worldMatrix = facing.matrixWorld.toArray();
    const material = facing.material;
    let materialDisposed = 0, geometryDisposed = 0;
    material.addEventListener('dispose', () => materialDisposed++);
    facing.geometry.addEventListener('dispose', () => geometryDisposed++);
    finished = built.kit.finish();
    finished.updateMatrixWorld(true);
    const matches = meshes(finished).filter(m => m.material === material);
    assert.equal(matches.length, 1);
    const kept = matches[0];
    assert.ok(kept.geometry.attributes.color, 'production merge must retain stone vertex colors');
    assert.deepEqual(Array.from(kept.geometry.attributes.color.array), colors);
    assert.equal(kept.material.vertexColors, true);
    for (let i = 0; i < worldMatrix.length; i++) {
      assert.ok(Math.abs(kept.matrixWorld.elements[i] - worldMatrix[i]) < 1e-8);
    }
    assert.equal(materialDisposed, 0);
    assert.equal(geometryDisposed, 0);
    built.kit.dispose(finished);
    finished = null;
    assert.equal(materialDisposed, 1);
    assert.equal(geometryDisposed, 1);
  } finally {
    if (finished) built.kit.dispose(finished);
  }
});


test('SuiChu terrain-classified facing stays within original platform envelope', async () => {
  const old = await fixture('遂初堂', {before:true});
  const current = await fixture('遂初堂');
  try {
    const base = meshes(old.f).find(m => m.userData.role === 'platform-base');
    const facing = meshes(current.f).find(m => m.userData.detailRole === 'r68-suichu-tiger-stone-facing');
    assert.ok(base && facing);
    assert.equal(facing.userData.role, 'platform-base');
    assert.equal(facing.material.polygonOffset, true);
    assert.equal(facing.material.polygonOffsetFactor, -1);
    assert.equal(facing.material.polygonOffsetUnits, -1);
    base.geometry.computeBoundingBox();
    facing.geometry.computeBoundingBox();
    const envelope = base.geometry.boundingBox.clone().applyMatrix4(base.matrix);
    const face = facing.geometry.boundingBox.clone().applyMatrix4(facing.matrix);
    const epsilon = 1e-6;
    assert.ok(face.min.x >= envelope.min.x - epsilon && face.max.x <= envelope.max.x + epsilon);
    assert.ok(face.min.y >= envelope.min.y - epsilon && face.max.y <= envelope.max.y + epsilon);
    assert.ok(Math.abs(face.min.z - envelope.min.z) < epsilon);
    assert.ok(Math.abs(face.max.z - envelope.min.z) < epsilon);
    const normal = facing.geometry.attributes.normal;
    for (let i = 0; i < normal.count; i++) assert.ok(normal.getZ(i) < -.999);
  } finally {
    old.dispose();
    current.dispose();
  }
});
