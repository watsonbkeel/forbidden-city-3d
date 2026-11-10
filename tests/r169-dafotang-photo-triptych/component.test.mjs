// CPU-only isolated spike. Solid DataTextures below are test inputs, never assets.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { buildDafotangPhotoTriptych } from '../../src/scene/palace/special/DafotangPhotoTriptych.js';

const subjects = ['amitabha', 'shakyamuni', 'bhaisajyaguru'];
const slots = ['west', 'center', 'east'];
function fixture() {
  const approvedAssets = {};
  const manifest = slots.map((slot, i) => {
    const assetId = `TEST_ONLY_${slot}`;
    approvedAssets[assetId] = {
      assetId, subjectId: subjects[i], sourceSha256: String(i + 1).repeat(64), sourceUrl: 'https://example.test/nonexistent-test-fixture',
      rightsHolder: 'TEST FIXTURE ONLY', license: 'TEST ASSERTION, NOT A LICENSE',
      permissionEvidence: 'TEST ASSERTION, NOT A REAL PERMISSION', publicRedistribution: true,
      subjectConfirmed: true, unmirrored: true, transparentBackground: true,
      pixelDimensions: [8, 12], figureAndLotusBounds: [.125, .125, .875, .875],
    };
    return {slot, assetId, fit: { status: 'MODEL_FIT_NOT_SURVEY', figureBase: [3 - i * 3, 1, 5] }};
  });
  const textures = Object.fromEntries(manifest.map((m, i) => {
    const rgba = new Uint8Array(8 * 12 * 4);
    for (let j = 0; j < rgba.length; j += 4) rgba.set([32 + i * 64, 64, 96, 255], j);
    const texture = new T.DataTexture(rgba, 8, 12);
    texture.flipY = true;
    texture.name = m.assetId; texture.userData.sourceSha256 = approvedAssets[m.assetId].sourceSha256;
    return [m.assetId, texture];
  }));
  return { manifest, textures, approvedAssets };
}
function rejected(input, code) {
  const out = buildDafotangPhotoTriptych(input);
  assert.equal(out.status, 'BLOCKED');
  assert.equal(out.group, null);
  assert.equal(out.meshes.length, 0);
  assert.ok(out.reasons.some(r => r.code === code), JSON.stringify(out.reasons));
  return out;
}

test('no asset manifest stays explicitly incomplete without making a substitute', () => {
  rejected({}, 'THREE_AUTHORIZED_PHOTOS_REQUIRED');
});
test('raw external manifest cannot grant itself copyright approval', () => {
  const f = fixture(); delete f.approvedAssets;
  f.manifest[0].photo = { publicRedistribution:true, permissionEvidence:'self claimed' };
  rejected(f, 'HOST_APPROVED_ASSET_REQUIRED');
});
test('one old central statue cannot pass as the three required identities', () => {
  const f = fixture(); f.manifest = [f.manifest[1]];
  rejected(f, 'THREE_AUTHORIZED_PHOTOS_REQUIRED');
});
test('an unconfirmed subject or missing public redistribution permission blocks all three', () => {
  for (const field of ['subjectConfirmed', 'publicRedistribution']) {
    const f = fixture(); f.approvedAssets.TEST_ONLY_center[field] = false;
    rejected(f, 'PHOTO_NOT_APPROVED');
  }
});
test('missing source evidence, mirrored photo, wrong Buddha or wrong order is blocked', () => {
  const cases = [
    [f => f.approvedAssets.TEST_ONLY_west.permissionEvidence = '', 'PHOTO_NOT_APPROVED'],
    [f => f.approvedAssets.TEST_ONLY_west.unmirrored = false, 'PHOTO_NOT_APPROVED'],
    [f => f.approvedAssets.TEST_ONLY_west.subjectId = 'generic-buddha', 'IDENTITY_MISMATCH'],
    [f => f.manifest[0].fit.figureBase[0] = -6, 'WEST_EAST_ORDER_INVALID'],
  ];
  for (const [mutate, code] of cases) { const f = fixture(); mutate(f); rejected(f, code); }
});
test('no guessed fit, missing decoded texture or inconsistent texture dimensions can render', () => {
  const cases = [
    [f => delete f.manifest[0].fit, 'MODEL_FIT_REQUIRED'],
    [f => delete f.textures.TEST_ONLY_west, 'DECODED_TEXTURE_REQUIRED'],
    [f => f.textures.TEST_ONLY_west.userData.sourceSha256 = '0'.repeat(64), 'TEXTURE_SOURCE_MISMATCH'],
    [f => f.approvedAssets.TEST_ONLY_west.pixelDimensions = [7, 12], 'TEXTURE_DIMENSION_MISMATCH'],
    [f => f.approvedAssets.TEST_ONLY_west.figureAndLotusBounds = [0, 0, 1, 0], 'CROP_INVALID'],
  ];
  for (const [mutate, code] of cases) { const f = fixture(); mutate(f); rejected(f, code); }
});
test('three fixed unmirrored planes preserve source aspect and sourced 2.25m figure-and-lotus height', () => {
  const f = fixture(), before = JSON.stringify(f.manifest), out = buildDafotangPhotoTriptych(f);
  assert.equal(out.status, 'READY_FOR_HOST_QA');
  assert.equal(out.group.children.length, 3);
  assert.equal(JSON.stringify(f.manifest), before);
  assert.deepEqual(out.meshes.map(m => m.userData.subjectId), subjects);
  out.group.updateMatrixWorld(true);
  for (const m of out.meshes) {
    const bounds = new T.Box3().setFromObject(m);
    // crop .125...875 is .75 of image height; full photo becomes 3m high.
    assert.ok(Math.abs(bounds.min.y - .625) < 1e-7);
    assert.ok(Math.abs(bounds.max.y - 3.625) < 1e-7);
    assert.ok(Math.abs(bounds.min.y + .125 * 3 - 1) < 1e-7);
    assert.ok(Math.abs(bounds.max.y - .125 * 3 - 3.25) < 1e-7);
    assert.ok(Math.abs((bounds.max.x - bounds.min.x) / (bounds.max.y - bounds.min.y) - 8 / 12) < 1e-7);
    assert.ok(new T.Vector3(0, 0, 1).applyQuaternion(m.quaternion).z < -.999);
    const p = m.geometry.attributes.position, uv = m.geometry.attributes.uv;
    const left = new T.Vector3().fromBufferAttribute(p, 0).applyMatrix4(m.matrixWorld);
    assert.equal(uv.getX(0), 0);
    assert.ok(left.x > m.position.x, 'image-left remains visitor-left, local +X');
    assert.equal(m.material.map.colorSpace, T.SRGBColorSpace);
    assert.equal(m.material.transparent, false);
    assert.equal(m.material.alphaTest, .5);
    assert.equal(m.material.depthWrite, true);
    assert.equal(m.material.depthTest, true);
    assert.equal(m.material.side, T.FrontSide);
    assert.equal(m.material.isMeshStandardMaterial, true);
    assert.equal(m.castShadow, false);
    assert.equal(m.receiveShadow, true);
  }
  assert.equal(out.metadata.dimensionStatus, 'FIGURE_AND_LOTUS_HEIGHT_SOURCED__PLACEMENT_AND_CROP_MODEL_FIT');
  assert.equal(out.metadata.historicalInventoryAccepted, false);
  assert.equal(out.metadata.visualValidated, false);
  assert.equal(out.metadata.newColliders, 0);
});
test('front-facing ray hits retain depth order behind a foreground column; back faces stay hidden', () => {
  const out = buildDafotangPhotoTriptych(fixture());
  const column = new T.Mesh(new T.BoxGeometry(.3, 5, .3), new T.MeshBasicMaterial());
  column.position.set(0, 2.5, 2);
  const scene = new T.Group(); scene.add(out.group, column); scene.updateMatrixWorld(true);
  const front = new T.Raycaster(new T.Vector3(0, 2, -10), new T.Vector3(0, 0, 1));
  const hits = front.intersectObjects([column, ...out.meshes]);
  assert.equal(hits[0].object, column);
  assert.ok(hits.some(h => h.object === out.meshes[1]));
  const back = new T.Raycaster(new T.Vector3(0, 2, 10), new T.Vector3(0, 0, -1));
  assert.equal(back.intersectObjects(out.meshes).length, 0);
  column.geometry.dispose(); column.material.dispose(); out.dispose();
});
test('dispose frees only new geometry/material once and never disposes caller-owned textures', () => {
  const f = fixture(), out = buildDafotangPhotoTriptych(f);
  let material = 0, geometry = 0, texture = 0, clonedTexture = 0;
  for (const original of Object.values(f.textures)) original.addEventListener('dispose', () => texture++);
  for (const clone of out.ownedTextures) clone.addEventListener('dispose', () => clonedTexture++);
  for (const m of out.meshes) {
    m.geometry.addEventListener('dispose', () => geometry++);
    m.material.addEventListener('dispose', () => material++);
    assert.notEqual(m.material.map, f.textures[m.userData.assetId]);
  }
  out.dispose(); out.dispose();
  assert.equal(material, 3); assert.equal(geometry, 3); assert.equal(texture, 0); assert.equal(clonedTexture, 3);
});
