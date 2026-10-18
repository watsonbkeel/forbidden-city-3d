import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { captureTaiheControl } from './lib/taihe-core-fixture.mjs';
import { TAIHE_CORE as P } from '../src/scene/palace/special/TaiheCoreProfile.js';
import { installTaiheGlyphs } from '../src/scene/interior/TaiheCoreContract.js';

const cfg = JSON.parse(fs.readFileSync(new URL('../data/interiors/taihe.json', import.meta.url)));
const bytes = fs.readFileSync(new URL('../public' + cfg.model, import.meta.url));
const root = (await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length), '')).scene;
root.updateMatrixWorld(true);
const fallback = captureTaiheControl('太和殿');
const bGlyph = fallback.group.children.find(o => o.material?.name === 'taihe_glyph_atlas');
installTaiheGlyphs(root, bGlyph.material.map);
const atlas = bGlyph.material.map;

// These are canvas pixel edges, independent of Blender extras and UV conventions.
// A south-side viewer looks toward +Z; their right points toward world -X.
const surfaces = [
  { name: 'plaque', x: 0, y: 7.8, z: 4.969, w: 6.62, h: 2.62, pixels: [0, 0, 1024, 384] },
  { name: 'viewer-right couplet', x: -4.233, y: 4.6, z: 4.979, w: .88, h: 7.38, pixels: [0, 384, 80, 1024] },
  { name: 'viewer-left couplet', x: 4.233, y: 4.6, z: 4.979, w: .88, h: 7.38, pixels: [80, 384, 160, 1024] },
];
function close(actual, expected, label, epsilon = 1e-4) {
  assert.ok(Math.abs(actual - expected) < epsilon, `${label}: ${actual} != ${expected}`);
}
function glyphCorners(group, floorY = 0) {
  const points = [];
  group.traverse(o => {
    if (!o.isMesh || o.material.name !== 'taihe_glyph_atlas') return;
    const { position, uv } = o.geometry.attributes;
    for (let i = 0; i < position.count; i++) {
      const p = new THREE.Vector3().fromBufferAttribute(position, i).applyMatrix4(o.matrixWorld);
      p.y -= floorY;
      const sample = o.material.map.transformUv(new THREE.Vector2().fromBufferAttribute(uv, i));
      points.push({ p, uv: [uv.getX(i), uv.getY(i)], pixels: [sample.x * 1024, sample.y * 1024] });
    }
  });
  return points;
}
function surfaceCorners(points, s) {
  const corners = points.filter(({ p }) => Math.abs(p.z - s.z) < 1e-5 && Math.abs(p.x - s.x) < s.w / 2 + 1e-5);
  assert.ok(corners.length >= 4, `${s.name} decoded corners exist`);
  return corners;
}

test('decoded S glyph corners sample their exact canvas rows and columns without a vertical or horizontal mirror', () => {
  assert.equal(atlas.flipY, true, 'the unchanged fallback owns a native CanvasTexture');
  const points = glyphCorners(root);
  for (const s of surfaces) {
    const corners = surfaceCorners(points, s);
    const unique = new Set();
    for (const { p, pixels } of corners) {
      const viewerLeft = p.x > s.x, top = p.y > s.y;
      close(Math.abs(p.x - s.x), s.w / 2, `${s.name} horizontal corner`);
      close(Math.abs(p.y - s.y), s.h / 2, `${s.name} vertical corner`);
      close(pixels[0], s.pixels[viewerLeft ? 0 : 2], `${s.name} canvas X`);
      close(pixels[1], s.pixels[top ? 1 : 3], `${s.name} canvas Y`);
      unique.add(`${viewerLeft}:${top}`);
    }
    assert.equal(unique.size, 4, `${s.name} has all four correct sampled corners`);
  }
});

test('B and decoded S share the same texture identity and sample matching pixels at every glyph corner', () => {
  root.traverse(o => { if (o.isMesh && o.material.name === 'taihe_glyph_atlas') assert.equal(o.material.map, atlas); });
  const b = glyphCorners(fallback.group, P.frame.floorY), s = glyphCorners(root);
  for (const surface of surfaces) for (const corner of surfaceCorners(s, surface)) {
    const match = surfaceCorners(b, surface).find(v => v.p.distanceTo(corner.p) < 1e-5);
    assert.ok(match, `${surface.name} has matching B corner`);
    close(corner.pixels[0], match.pixels[0], `${surface.name} matching canvas X`);
    close(corner.pixels[1], match.pixels[1], `${surface.name} matching canvas Y`);
  }
});

test('decoded glyph triangle winding faces the south viewer and U increases to their right', () => {
  let triangles = 0;
  root.traverse(o => {
    if (!o.isMesh || o.material.name !== 'taihe_glyph_atlas') return;
    const g = o.geometry, p = g.attributes.position, uv = g.attributes.uv, idx = g.index;
    // Original six lettering faces are an exact retained prefix. Later surface
    // faces share the atlas and are covered by furnishing-surface integration.
    for (let i = 0; i < 18; i += 3) {
      const ids = [idx.getX(i), idx.getX(i + 1), idx.getX(i + 2)];
      const vertices = ids.map(j => new THREE.Vector3().fromBufferAttribute(p, j).applyMatrix4(o.matrixWorld));
      assert.ok(new THREE.Triangle(...vertices).getNormal(new THREE.Vector3()).z < -.99);
      for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) {
        if (Math.abs(vertices[a].x - vertices[b].x) > .01)
          assert.ok((vertices[a].x - vertices[b].x) * (uv.getX(ids[a]) - uv.getX(ids[b])) < 0, 'world -X is viewer-right / increasing U');
      }
      triangles++;
    }
  });
  assert.equal(triangles, 6);
});

test('frozen V16 UV correction preserves db52 triangles, other attributes and original asset bytes', async () => {
  // Keep the historical UV-only proof pinned to its corrected V16 asset.
  // The live V17 asset is still covered by all three current-atlas tests above.
  const fixedBytes = fs.readFileSync(new URL('../public/models/interiors/taihe-v16-ba59e7321fda.glb', import.meta.url));
  const root = (await new GLTFLoader().parseAsync(fixedBytes.buffer.slice(fixedBytes.byteOffset, fixedBytes.byteOffset + fixedBytes.length), '')).scene;
  const oldBytes = fs.readFileSync(new URL('../public/models/interiors/taihe-v16-bdc5d69b1265.glb', import.meta.url));
  const { createHash } = await import('node:crypto');
  assert.equal(createHash('sha256').update(oldBytes).digest('hex'), 'bdc5d69b1265a2575376827a0ff49b848fbd3acdeb58584360a0e3bfa16e0486');
  const oldRoot = (await new GLTFLoader().parseAsync(oldBytes.buffer.slice(oldBytes.byteOffset, oldBytes.byteOffset + oldBytes.length), '')).scene;
  const oldMeshes = new Map();
  oldRoot.traverse(o => { if (o.isMesh) oldMeshes.set(o.name, o); });
  let meshes = 0;
  root.traverse(o => {
    if (!o.isMesh) return;
    const before = oldMeshes.get(o.name);
    assert.ok(before, `${o.name} exists in db52`);
    assert.deepEqual(o.position.toArray(), before.position.toArray());
    assert.deepEqual(o.quaternion.toArray(), before.quaternion.toArray());
    assert.deepEqual(o.scale.toArray(), before.scale.toArray());
    // Blender can reorder emitted faces without changing their oriented triangles.
    const triangles = index => {
      const result = [];
      for (let i = 0; i < index.count; i += 3) {
        const a = index.getX(i), b = index.getX(i + 1), c = index.getX(i + 2);
        result.push([[a,b,c], [b,c,a], [c,a,b]].map(v => v.join(',')).sort()[0]);
      }
      return result.sort();
    };
    assert.deepEqual(triangles(o.geometry.index), triangles(before.geometry.index), `${o.name} oriented triangles`);
    for (const [name, attr] of Object.entries(o.geometry.attributes)) {
      const old = before.geometry.attributes[name];
      assert.ok(old, `${o.name} ${name} existed before`);
      if (name === 'uv' && o.material.name === 'taihe_glyph_atlas') {
        for (let i = 0; i < attr.count; i++) {
          close(attr.getX(i), old.getX(i), 'U remains byte-equivalent');
          close(attr.getY(i), 1 - old.getY(i), 'only exported glyph V is corrected');
        }
      } else assert.deepEqual(attr.array, old.array, `${o.name} ${name} unchanged`);
    }
    meshes++;
  });
  assert.equal(meshes, oldMeshes.size);
  assert.equal(meshes, 8);
});
