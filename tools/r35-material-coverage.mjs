import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { registerHooks } from 'node:module';

// Usage: node tools/r35-material-coverage.mjs [repository-root] [output.json]
// CPU construction only. Texture image placeholders have real manifest sizes;
// no browser, rasterization, image decode, optional GLB or performance claim.
const root = pathToFileURL(path.resolve(process.argv[2] ?? '.') + '/');
registerHooks({ load(url, context, next) {
  if (url.endsWith('.json')) return {
    format: 'module',
    source: 'export default ' + fs.readFileSync(new URL(url), 'utf8'),
    shortCircuit: true,
  };
  return next(url, context);
} });
const T = await import(new URL('node_modules/three/build/three.module.js', root));
const load = relative => import(new URL(relative, root));
const read = relative => fs.readFileSync(new URL(relative, root));
const sha = value => createHash('sha256').update(value).digest('hex');
const ctx = new Proxy({}, {
  get: (_, key) => key === 'createLinearGradient'
    ? () => ({ addColorStop() {} }) : () => ({ data: [] }),
  set: () => true,
});
globalThis.document = {
  createElement: () => ({ getContext: () => ctx, width: 0, height: 0 }),
  createElementNS: () => ({ addEventListener() {}, removeEventListener() {} }),
};
const { TextureLibrary, TEXTURE_SPECS } = await load('src/utils/TextureLibrary.js');
const { PalaceBuilder } = await load('src/scene/PalaceBuilder.js');
const { Enclosure } = await load('src/scene/Enclosure.js');
const { GardenBuilder } = await load('src/scene/GardenBuilder.js');
const { Environment } = await load('src/scene/Environment.js');
const { ZoneBase } = await load('src/scene/zones/ZoneBase.js');
const { PALACE_LAYOUT } = await load('src/scene/Layout.js');
const { ZONES } = await load('data/zones/index.js');
const { resourceBudget } = await load('tests/lib/resource-budget.mjs');
const names = ['ground_brick', 'stone_slab', 'wall_red', 'wood_column'];
const library = new TextureLibrary();
library.manifest = JSON.parse(read('public/textures/hd/manifest.json'));
for (const name of Object.keys(TEXTURE_SPECS)) {
  const info = library.manifest.textures[name];
  library.colors.set(name, library.configure(new T.Texture(info.hd), name, 'color'));
  if (info.normal) library.normals.set(name, library.configure(new T.Texture(info.hd), name, 'normal'));
}
const materialRecords = new Map();
const productionMaterial = library.material.bind(library);
library.material = (name, params = {}) => {
  const material = productionMaterial(name, params);
  if (names.includes(name)) {
    if (!materialRecords.has(material)) materialRecords.set(material, {
      name, params: structuredClone(params), requests: 0,
      color: material.color.getHex(), roughness: material.roughness,
      metalness: material.metalness, normalScale: material.normalScale.toArray(),
      normalMap: material.normalMap?.name ?? null,
    });
    materialRecords.get(material).requests++;
  }
  return material;
};
const components = {}, owners = [];
const scene = new T.Scene();
const consoleLog = console.log;
console.log = () => {};
function capture(label, roots, navigation = {}) {
  const stream = createHash('sha256'), surfaces = new Map();
  for (const root of roots) {
    root.updateMatrixWorld(true);
    root.traverse(object => {
      stream.update(JSON.stringify({
        name: object.name, type: object.type, matrix: object.matrix.toArray(),
        matrixWorld: object.matrixWorld.toArray(), visible: object.visible,
        castShadow: object.castShadow, receiveShadow: object.receiveShadow,
      }));
      if (!object.isMesh) return;
      const geometry = object.geometry;
      for (const [key, attr] of Object.entries(geometry.attributes)) {
        stream.update(`${key}|${attr.itemSize}|${attr.normalized}|${attr.array.constructor.name}|`);
        stream.update(Buffer.from(attr.array.buffer, attr.array.byteOffset, attr.array.byteLength));
      }
      if (geometry.index) stream.update(Buffer.from(
        geometry.index.array.buffer, geometry.index.array.byteOffset, geometry.index.array.byteLength,
      ));
      stream.update(JSON.stringify({ groups: geometry.groups, drawRange: geometry.drawRange }));
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        const record = materialRecords.get(material);
        if (!record) continue;
        if (!surfaces.has(material)) surfaces.set(material, { ...record, meshes: 0, triangles: 0 });
        const row = surfaces.get(material);
        row.meshes++;
        row.triangles += (geometry.index?.count ?? geometry.attributes.position.count) / 3
          * (object.isInstancedMesh ? object.count : 1);
      }
    });
  }
  components[label] = {
    geometryTransformSHA256: stream.digest('hex'),
    navigationSHA256: sha(JSON.stringify(navigation)),
    budget: resourceBudget(roots),
    surfaces: [...surfaces.values()],
  };
}
function build(label, factory, navigation) {
  const existing = new Set(scene.children);
  const owner = factory();
  owners.push(owner);
  capture(label, scene.children.filter(object => !existing.has(object)), navigation(owner));
}
try {
  build('resident-palace', () => {
    const palace = new PalaceBuilder(scene, library);
    palace.buildAll(PALACE_LAYOUT);
    return palace;
  }, owner => ({ colliders: owner.getColliders(), walkables: owner.getWalkables() }));
  build('resident-enclosure', () => new Enclosure(scene, library).build(),
    owner => ({ colliders: owner.getColliders() }));
  build('resident-garden', () => new GardenBuilder(scene, library)
    .build(PALACE_LAYOUT.find(item => item.type === 'garden')),
  owner => ({ colliders: owner.getColliders(), walkables: owner.getWalkables() }));
  build('resident-ground', () => {
    const environment = new Environment(scene, null, library);
    environment.setupGround();
    return environment;
  }, () => ({}));
  for (const zone of ZONES) {
    const builder = new ZoneBase(library, zone);
    owners.push(builder);
    const data = builder.build();
    capture(`zone-${zone.id}`, [data.group], {
      colliders: data.colliders, walkables: data.walkables, rooms: data.rooms,
      mapItems: data.mapItems, regions: data.regions,
    });
  }
  const report = {
    schema: 1,
    scope: 'CPU resident architecture, ground and all seven zone constructions, including hidden LODs; optional GLBs excluded.',
    sourceSHA256: sha(read('src/utils/TextureLibrary.js')),
    limitations: [
      'Dimension-only image fixtures; no rendered appearance or GPU validation.',
      'Merged mesh counts are references, not buildings or independently rendered surfaces.',
      'Request counts include lookups and merge bookkeeping, not draw calls.',
      'Geometry identity excludes materials intentionally; actual material responses are reported separately.',
    ],
    materialVariants: [...materialRecords.values()],
    components,
  };
  const output = JSON.stringify(report, null, 2) + '\n';
  if (process.argv[3]) fs.writeFileSync(process.argv[3], output);
  else process.stdout.write(output);
} finally {
  for (const owner of owners.reverse()) owner.dispose();
  library.dispose();
  console.log = consoleLog;
}
