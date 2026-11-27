import assert from 'node:assert/strict';
import { test } from 'node:test';
import { attr, cases, fixture, T } from '../r159-jingyun-frame/fixture.mjs';

function prepare(opts) {
  const f = fixture(opts);
  const p = f.kit.plaques[0];
  const sentinel = f.kit.frame(12, 12);
  f.kit.plaque(sentinel, '乾清門', 0, 2, 0, .8, 1.4);
  const q = f.kit.plaques.at(-1);
  return { ...f, p, q, geometry: attr(p.mesh.geometry),
    physical: JSON.stringify([f.kit.colliders, f.kit.walkables, f.kit.mapItems]) };
}

function cell(record) {
  const c = record.mesh.material.map.image, uv = record.mesh.geometry.attributes.uv;
  const x = Math.round(uv.getX(0) * c.width);
  const y = Math.round((1 - uv.getY(0)) * c.height);
  return c.getContext('2d').getImageData(x, y, 96, 256).data;
}

function lettering(data, x0, x1, y0, y1) {
  let count = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = 4 * (y * 96 + x);
    if (data[i] > 180 && data[i+1] > 130 && data[i] > data[i+2] + 45) count++;
  }
  return count;
}

test('real canonical 景运门 has two different vertical inscription columns in its original face', () => {
  const f = prepare(cases[0]), offsite = prepare(cases[4]);
  try {
    const ray = (dx) => {
      const host = f.p.mesh.parent;
      host.updateMatrixWorld(true);
      const origin = new T.Vector3(dx, 3.98, -7).applyMatrix4(host.matrixWorld);
      const front = new T.Vector3(0, 0, 1).transformDirection(host.matrixWorld);
      return new T.Raycaster(origin, front, 0, 4).intersectObject(f.p.mesh)[0];
    };
    assert.equal(f.p.text, '景运门', 'map/plain-text source name must not change');
    assert.ok(f.p.mesh.position.distanceTo(new T.Vector3(0, 3.98, -4.49)) < 1e-10);
    f.kit.buildPlaqueAtlas();
    offsite.kit.buildPlaqueAtlas();
    const board = cell(f.p), untouched = cell(offsite.p);
    const leftBands = [30, 100, 173].map(y => lettering(board, 17, 45, y, y + 44));
    assert.ok(leftBands.every(n => n > 120), 'three vertically spaced Han characters on the viewer’s left: ' + leftBands);
    const rightBands = [31, 106, 170].map(y => lettering(board, 48, 79, y, y + 52));
    assert.ok(rightBands.every(n => n > 85), 'two-part Manchu inscription extends down the viewer’s right: ' + rightBands);
    for (const key of ['position', 'normal']) assert.deepEqual(attr(f.p.mesh.geometry).attributes[key], f.geometry.attributes[key]);
    assert.notDeepEqual(board, untouched, 'canonical atlas slot differs from generic single-letter column');
    assert.deepEqual(cell(f.q), cell(offsite.q), 'adjacent ordinary atlas cell is pixel-identical');
    assert.ok(ray(.20).uv.x < ray(-.20).uv.x, 'left-to-right on front must not mirror the source');
    assert.equal(JSON.stringify([f.kit.colliders, f.kit.walkables, f.kit.mapItems]), f.physical);
    assert.equal(f.p.frame.userData.jingyunPlaqueFrame.scope, 'coarse-own-photo-frame');
  } finally {
    f.dispose(); offsite.dispose();
  }
});

test('generic same-name records still share a generic slot without acquiring the bilingual face', () => {
  const f = fixture(cases[0]), generic = fixture(cases[4]);
  try {
    const a = f.kit.plaques[0];
    for (const x of [12, 18]) f.kit.plaque(f.kit.frame(x, 12), a.text, 0, 2, 0, .8, 1.4);
    const [, b, c] = f.kit.plaques;
    f.kit.buildPlaqueAtlas();
    generic.kit.buildPlaqueAtlas();
    assert.notDeepEqual(cell(a), cell(b));
    assert.deepEqual(cell(b), cell(generic.kit.plaques[0]));
    assert.deepEqual(b.mesh.geometry.attributes.uv.array, c.mesh.geometry.attributes.uv.array);
  } finally {
    f.dispose(); generic.dispose();
  }
});
