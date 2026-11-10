import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { createCanvas } from '@napi-rs/canvas';
import { Box3, Vector3 } from 'three';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { resolveCourtWallContract } from '../src/scene/zones/CourtWallContract.js';
import { createActualLibrary } from './r158-cumulative-1600/library.mjs';

// Actual CPU geometry/material/atlas calls, with inert library image pixels.
// This is neither a render nor GPU/photographic appearance acceptance.
const originalDocument = globalThis.document;
const originalFetch = globalThis.fetch;
globalThis.document = { createElement(tag) { assert.equal(tag, 'canvas'); return createCanvas(1, 1); } };
globalThis.fetch = () => { throw new Error('Network is forbidden in the single-gate regression'); };
const zone = JSON.parse(fs.readFileSync(new URL('../data/zones/west-six.json', import.meta.url)));
const reports = {};
const hash = value => createHash('sha256').update(value).digest('hex');
const bytes = array => Buffer.from(array.buffer, array.byteOffset, array.byteLength);
const box = b => ({ min: b.min.toArray(), max: b.max.toArray() });
const legacyItem = { kind: 'gate', name: '太极门', x: 139.5, z: 304.5 };

function texture(t) {
  if (!t) return null;
  const value = t.toJSON({ textures: {}, images: { [t.source.uuid]: {} } });
  delete value.uuid; delete value.metadata; delete value.image;
  value.imageSize = [t.image?.width, t.image?.height];
  if (t.image?.getContext) value.pixelSha256 = hash(bytes(t.image.getContext('2d').getImageData(0, 0, t.image.width, t.image.height).data));
  return value;
}

function material(m, kit) {
  if (!m) return null;
  const images = Object.fromEntries(Object.values(m).filter(v => v?.isTexture).map(t => [t.source.uuid, {}]));
  const value = m.toJSON({ textures: {}, images });
  delete value.uuid; delete value.metadata; delete value.textures; delete value.images;
  for (const key of Object.keys(m)) if (m[key]?.isTexture) value[key] = texture(m[key]);
  return { value, libraryOwned: kit.lib.owns(m), kitOwned: kit.owned.includes(m) };
}

function object(o, kit) {
  const value = { type: o.type, name: o.name, position: o.position.toArray(), rotation: o.rotation.toArray(), scale: o.scale.toArray(), matrix: o.matrix.toArray(), matrixWorld: o.matrixWorld.toArray(), visible: o.visible, castShadow: o.castShadow, receiveShadow: o.receiveShadow, renderOrder: o.renderOrder, userData: o.userData };
  if (o.isMesh) {
    const g = o.geometry;
    value.geometry = { type: g.type, parameters: g.parameters, groups: g.groups, drawRange: g.drawRange, attributes: {} };
    for (const [key, a] of Object.entries(g.attributes)) value.geometry.attributes[key] = { type: a.array.constructor.name, count: a.count, itemSize: a.itemSize, normalized: a.normalized, sha256: hash(bytes(a.array)) };
    value.geometry.index = g.index && { type: g.index.array.constructor.name, count: g.index.count, sha256: hash(bytes(g.index.array)) };
    value.material = (Array.isArray(o.material) ? o.material : [o.material]).map(m => material(m, kit));
  }
  return value;
}

function countDisposals(resources) {
  const counts = new Map([...new Set(resources)].map(r => [r, 0]));
  for (const r of counts.keys()) r.addEventListener('dispose', () => counts.set(r, counts.get(r) + 1));
  return counts;
}

function inspect(item, secondItem, production = false) {
  const input = structuredClone(zone);
  input.items[28] = structuredClone(item);
  const actual = createActualLibrary();
  const builder = new ZoneBase(actual.library, input), kit = builder.kit;
  let libraryDisposed = false;
  try {
    // Generic plaque contract intentionally uses a non-target source context.
    // The production test below still exercises the actual current item28 hook.
    if (!production) input.id = 'r197-generic-wall-gate';
    const width = builder.buildGate(input.items[28]);
    const gate = kit.root.children[0];
    assert.equal(kit.root.children.length, 1);
    const plaqueObjects = new Set(kit.plaques.flatMap(p => [p.frame, p.mesh]));
    if (secondItem) kit.gate(secondItem);
    kit.buildPlaqueAtlas();
    kit.root.updateWorldMatrix(true, true);
    const meshes = [], retained = [], worldBounds = new Box3(), point = new Vector3();
    let vertices = 0;
    gate.traverse(o => {
      if (o.isMesh) {
        meshes.push(object(o, kit));
        const positions = o.geometry.attributes.position;
        vertices += positions.count;
        for (let i = 0; i < positions.count; i++) {
          point.fromBufferAttribute(positions, i).applyMatrix4(o.matrixWorld);
          assert.ok(point.toArray().every(Number.isFinite));
          worldBounds.expandByPoint(point);
        }
      }
      if (!plaqueObjects.has(o)) retained.push(object(o, kit));
    });
    assert.ok(meshes.length <= 16 && vertices <= 3736, 'single-gate geometry bound');
    const result = {
      meshCount: meshes.length, vertices, meshes, retained, worldBounds: box(worldBounds),
      width, colliders: kit.colliders.map(box), walkables: kit.walkables, rooms: kit.rooms, regions: kit.regions,
      mapItems: structuredClone(kit.mapItems),
      walls: resolveCourtWallContract(input.items[29], new Map([[item.name, width]])),
      plaqueTexts: kit.plaques.map(p => p.text),
      atlasEntries: kit.plaques.map(p => ({ text: p.text, uv: Array.from(p.mesh.geometry.attributes.uv.array), material: p.mesh.material.name, kitOwned: kit.owned.includes(p.mesh.material), textureOwned: kit.ownedTextures?.includes(p.mesh.material.map) ?? false })),
      plaqueMeshCount: plaqueObjects.size,
      ownedMaterialNames: kit.owned.map(m => m.name), ownedTextureCount: kit.ownedTextures?.length ?? 0,
    };
    const geometries = [];
    kit.root.traverse(o => { if (o.geometry) geometries.push(o.geometry); });
    const geometryCounts = countDisposals(geometries);
    const ownCounts = countDisposals([...kit.owned, ...(kit.ownedTextures ?? [])]);
    const libraryCounts = countDisposals([...actual.library.materials.values(), ...actual.library.allTextures()]);
    builder.dispose();
    builder.dispose(); // ZoneBase is the resource owner and must remain idempotent.
    for (const n of geometryCounts.values()) assert.equal(n, 1, 'own geometry disposed once');
    for (const n of ownCounts.values()) assert.equal(n, 1, 'own material/atlas disposed once');
    for (const n of libraryCounts.values()) assert.equal(n, 0, 'gate disposal preserves shared library');
    assert.equal(kit.root.children.length, 0);
    assert.equal(kit.plaques.length, 0);
    actual.dispose();
    libraryDisposed = true;
    for (const n of libraryCounts.values()) assert.equal(n, 1, 'shared resource disposed only by library');
    result.disposal = { geometries: geometryCounts.size, kitResources: ownCounts.size, libraryResources: libraryCounts.size, exactlyOnce: true, sharedPreservedUntilOwnerDisposal: true };
    return result;
  } finally {
    builder.dispose();
    if (!libraryDisposed) actual.dispose();
  }
}

test('wall gate explicit false omits both plaque meshes and atlas resources', () => {
  const defaultGate = reports.default = inspect(legacyItem);
  const noPlaque = reports.false = inspect({ ...legacyItem, plaque: false });
  assert.equal(defaultGate.meshCount, 16);
  assert.equal(defaultGate.vertices, 3736);
  assert.equal(defaultGate.plaqueMeshCount, 2);
  assert.deepEqual(defaultGate.plaqueTexts, ['太极门']);
  assert.deepEqual(noPlaque.plaqueTexts, [], 'explicit false must not enqueue a plaque');
  assert.equal(noPlaque.plaqueMeshCount, 0);
  assert.equal(noPlaque.meshCount, 14);
  assert.equal(noPlaque.vertices, 3708);
  assert.equal(noPlaque.ownedTextureCount, 0);
  assert.equal(noPlaque.ownedMaterialNames.includes('kit_plaques'), false);
  assert.deepEqual(noPlaque.retained, defaultGate.retained, 'all non-plaque geometry, transforms and materials unchanged');
  for (const key of ['worldBounds', 'width', 'colliders', 'walkables', 'rooms', 'regions', 'mapItems', 'walls']) assert.deepEqual(noPlaque[key], defaultGate[key], key);
});

test('wall gate default and explicit true preserve the same plaque behavior', () => {
  const defaultGate = reports.default ?? inspect(legacyItem);
  const explicitTrue = reports.true = inspect({ ...legacyItem, plaque: true });
  assert.deepEqual(explicitTrue, defaultGate);
  assert.equal(explicitTrue.ownedTextureCount, 1);
  assert.ok(explicitTrue.ownedMaterialNames.includes('kit_plaques'));
});

test('production item28 keeps its name, stable card binding and openings without a plaque', () => {
  assert.deepEqual(zone.items[28], { ...legacyItem, plaque: false });
  const built = reports.production = inspect(zone.items[28], undefined, true);
  assert.equal(built.meshCount, 14);
  assert.deepEqual(built.plaqueTexts, []);
  assert.equal(built.width, 6.4);
  assert.deepEqual(built.mapItems, [{ kind: 'gate', name: '太极门', x: 139.5, z: 304.5, w: 6.4, d: 2.8 }]);
  assert.equal(built.colliders.length, 2);
  assert.ok(Math.abs(built.colliders[1].min[0] - built.colliders[0].max[0] - 3.6) < 1e-10);
  const south = built.walls.gates.find(g => g.side === 's');
  assert.deepEqual([south.at - south.w / 2, south.at + south.w / 2], [136.3, 142.7]);
  assert.equal(built.walls.gates.find(g => g.side === 'n').w, 42);
  const places = JSON.parse(fs.readFileSync(new URL('../data/places/zh-CN.json', import.meta.url)));
  const card = places.places.find(p => p.id === 'place-west-six-1dd691141c');
  assert.equal(card.name, zone.items[28].name);
  assert.deepEqual(card.sceneBinding, { kind: 'zone', name: '太极门', zoneId: 'west-six' });
});

test('opted-out wall gate never contributes text to another gate shared atlas', () => {
  const mixed = reports.mixed = inspect({ ...legacyItem, plaque: false }, { x: 0, z: 0, name: '其他测试门' });
  assert.equal(mixed.meshCount, 14);
  assert.equal(mixed.plaqueMeshCount, 0);
  assert.deepEqual(mixed.plaqueTexts, ['其他测试门']);
  assert.equal(mixed.ownedTextureCount, 1);
  const [entry] = mixed.atlasEntries;
  assert.equal(entry.material, 'kit_plaques');
  assert.equal(entry.kitOwned && entry.textureOwned, true);
  assert.ok(entry.uv.every(n => Number.isFinite(n) && n >= 0 && n <= 1));
  const u = entry.uv.filter((_, i) => i % 2 === 0);
  const v = entry.uv.filter((_, i) => i % 2 === 1);
  assert.deepEqual([Math.min(...u), Math.max(...u), Math.min(...v), Math.max(...v)], [0, 96 / 2048, 0, 1]);
});

after(() => {
  if (process.env.R197_REPORT_PATH) {
    const output = JSON.stringify(reports, null, 2) + '\n';
    assert.ok(Buffer.byteLength(output) <= 1024 * 1024, 'snapshot output bound');
    fs.writeFileSync(process.env.R197_REPORT_PATH, output);
  }
  if (process.env.R197_RESOURCE_PATH) fs.writeFileSync(process.env.R197_RESOURCE_PATH, JSON.stringify({ scope: 'actual Node test process; native canvas included in maxRSS', resourceUsage: process.resourceUsage(), processUptimeSeconds: process.uptime(), memoryUsage: process.memoryUsage() }, null, 2) + '\n');
  if (originalDocument === undefined) delete globalThis.document; else globalThis.document = originalDocument;
  globalThis.fetch = originalFetch;
});
