import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {captureTaiheControl} from './lib/taihe-core-fixture.mjs';
import {validateTaiheCore} from '../src/scene/interior/TaiheCoreContract.js';
import {TAIHE_CAISSON_FALLBACK_DATA} from '../src/scene/palace/special/TaiheCaissonFallbackData.js';
import {decode} from './lib/taihe-column-fixture.mjs';
import {restorePreCaissonSource} from './lib/taihe-caisson-retention.mjs';
import {restorePreShellSource} from './lib/taihe-shell-retention.mjs';
import sourceDelta from './fixtures/taihe-caisson-source-delta.json' with {type:'json'};

const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root));
const sha = b => createHash('sha256').update(b).digest('hex');
const BASE_SHA = '28d7a11dbeda023762c8c9eed44eb65c5f4c8270ddfb9d7088e40f6b6991399c';
const MASK_SHA = '231113dd6726175be9de932cbf6c0a36fe7466e88e5910df6aa9660f49ba2079';
const ORIGINAL_SOURCE_FIXTURE_SHA = 'e82df9678bffc933f0544cc0bccd1899a77c4ab5b0b9eb8334ef3060d7764ee0';
const maskPath = 'assets-src/interiors/taihe_caisson/retired_shell_faces.json';
const maskBytes = read(maskPath), mask = JSON.parse(maskBytes);
const manifest = JSON.parse(read('docs/current-state/taihe-caisson/SOURCE-MANIFEST.json'));
const cfg = JSON.parse(read('data/interiors/taihe.json'));
const currentBytes = read('public'+cfg.model);
const baseBytes = read(manifest.baselineAsset), bytes = read(manifest.asset.path);
const original = decode(baseBytes), candidate = decode(bytes);
const materials = ['taihe_gold', 'taihe_dark_gold'];
const removedCounts = {taihe_gold:192, taihe_dark_gold:128};
const identityKeys = [
  'caissonSourceSHA256', 'caissonIntegrationSHA256', 'caissonBaseAssetSHA256', 'caissonTriangles',
  'caissonShellSourceSHA256', 'caissonShellRetirementSHA256', 'caissonShellMaskSHA256',
  'caissonShellTriangles', 'caissonRemovedTriangles',
];
const pythonOptions = {cwd:root, env:{...process.env, PYTHONDONTWRITEBYTECODE:'1'}, maxBuffer:8*1024*1024, timeout:30000};

function views(buffer, gltf) {
  const start = 28 + buffer.readUInt32LE(12);
  return gltf.bufferViews.map(v => buffer.subarray(start+(v.byteOffset??0), start+(v.byteOffset??0)+v.byteLength));
}
function equalBytes(actual, expected, label) {
  assert.equal(actual.length, expected.length, `${label}: byte length`);
  assert.ok(actual.equals(expected), `${label}: exact bytes/order`);
}
function without(object, keys) {
  return Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));
}
function float32Bytes(values) {
  const bytes = Buffer.alloc(values.length*4);
  values.forEach((value,i) => bytes.writeFloatLE(value,i*4));
  return bytes;
}
function numericFloat32(value) {
  const number = Math.fround(value);
  return number===0 ? 0 : number; // A normal-matrix multiply may turn -0 into +0.
}
function materialFaces(mesh, material) { return mesh.triangles.filter(t => t.material===material); }
function keptFaces(material) {
  const removed = new Set(mask.triangles.filter(r => r.material===material).map(r => r.triangleOrdinal));
  return materialFaces(original, material).filter((_, i) => !removed.has(i));
}

// This expectation is reconstructed from the immutable mask and original raw
// index bytes in JavaScript, not from retire_shell() or manifest receipts.
function independentlyRetiredViews() {
  assert.equal(sha(baseBytes), BASE_SHA);
  assert.equal(sha(maskBytes), MASK_SHA);
  assert.equal(mask.baseSHA256, BASE_SHA);
  assert.equal(mask.parts.length, 19);
  assert.equal(new Set(mask.parts).size, 19);
  assert.deepEqual([...new Set(mask.triangles.map(r => r.part))].sort(), [...mask.parts].sort());
  assert.equal(mask.triangles.length, 320);
  assert.deepEqual(Object.keys(mask.materials).sort(), [...materials].sort());
  const originalViews = views(baseBytes, original.gltf);
  const expected = originalViews.map(v => Buffer.from(v)), changes = [];
  for (const material of materials) {
    const info = mask.materials[material];
    const primitive = original.gltf.meshes[info.mesh].primitives[info.primitive];
    assert.equal(original.gltf.materials[primitive.material].name, material);
    assert.equal(primitive.indices, info.indexAccessor);
    assert.equal(primitive.mode??4, 4);
    const accessor = original.gltf.accessors[primitive.indices];
    const view = original.gltf.bufferViews[accessor.bufferView];
    assert.equal(accessor.byteOffset??0, 0);
    assert.equal(accessor.type, 'SCALAR');
    assert.equal('sparse' in accessor || 'byteStride' in view, false);
    const size = {5123:2, 5125:4}[accessor.componentType];
    assert.ok(size, 'known index encoding');
    const before = originalViews[accessor.bufferView];
    const indexAt = i => size===2 ? before.readUInt16LE(i*size) : before.readUInt32LE(i*size);
    assert.equal(accessor.count, info.originalTriangles*3);
    assert.equal(before.length, accessor.count*size);
    const position = original.gltf.accessors[primitive.attributes.POSITION];
    assert.equal(position.componentType, 5126);
    assert.equal(position.type, 'VEC3');
    assert.equal(position.byteOffset??0, 0);
    assert.equal('byteStride' in original.gltf.bufferViews[position.bufferView], false);
    const positionBytes = originalViews[position.bufferView];
    const rows = mask.triangles.filter(r => r.material===material);
    const removed = new Set(rows.map(r => r.triangleOrdinal));
    assert.equal(rows.length, removedCounts[material]);
    assert.equal(removed.size, rows.length);
    for (const row of rows) {
      assert.ok(Number.isInteger(row.triangleOrdinal) && row.triangleOrdinal>=0 && row.triangleOrdinal<info.originalTriangles);
      const ids = [0,1,2].map(k => indexAt(row.triangleOrdinal*3+k));
      assert.deepEqual(ids, row.indices, `${material}: exact masked indices`);
      const raw = Buffer.concat(ids.map(i => positionBytes.subarray(i*12, i*12+12)));
      assert.equal(raw.length, 36);
      assert.equal(sha(raw), row.positionSHA256, `${material}: exact masked coordinates`);
    }
    const kept = [];
    for (let i=0; i<info.originalTriangles; i++) {
      if (!removed.has(i)) kept.push(before.subarray(i*3*size, (i+1)*3*size));
    }
    expected[accessor.bufferView] = Buffer.concat(kept);
    changes.push({material, accessor:primitive.indices, bufferView:accessor.bufferView,
      removedTriangles:rows.length, beforeBytes:before.length, beforeSHA256:sha(before),
      retainedBytes:expected[accessor.bufferView].length, retainedSHA256:sha(expected[accessor.bufferView])});
  }
  return {expected, changes};
}

let authored;
function authoredBatches() {
  if (authored) return authored;
  const code = `import sys,json
sys.path.insert(0,'assets-src/interiors')
from taihe_caisson.geometry import build_candidate,material_batches
from taihe_caisson.shell import build_shell
p=json.load(open('data/architecture/taihe-core.json'))['caisson']
result={}
for q in ['detail','fallback']:
    batches={}; inventory=[]; counts={}
    for prefix,mesh in [('caisson_shell_',build_shell(p,q)),('caisson_dragon_',build_candidate(p,q))]:
        counts[prefix]=len(mesh['triangles'])
        for name,ids in mesh['parts'].items():
            points=[mesh['vertices'][v] for i in ids for v in mesh['triangles'][i]]
            inventory.append({'name':prefix+name,'min':[min(p[k] for p in points) for k in range(3)],'max':[max(p[k] for p in points) for k in range(3)]})
        for key,batch in material_batches(mesh).items():
            target=batches.setdefault(key,{'position':[],'normal':[]})
            for field in target: target[field].extend(batch[field])
    result[q]={'batches':batches,'inventory':inventory,'counts':counts}
print(json.dumps(result))`;
  const result = spawnSync('python', ['-c', code], {...pythonOptions, encoding:'utf8'});
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  authored = JSON.parse(result.stdout);
  return authored;
}

// Historical byte/source checks above retain the pinned caisson artifact.
// Runtime validation below always loads the current registry-selected asset.
const loadScene = async () => (await new GLTFLoader().parseAsync(currentBytes.buffer.slice(currentBytes.byteOffset,currentBytes.byteOffset+currentBytes.length), '')).scene;

test('replacement asset has complete reproducible source and pinned base/mask identity', () => {
  assert.equal(manifest.schema, 'taihe-caisson-shell-replacement-2');
  assert.equal(manifest.baselineSHA256, BASE_SHA);
  assert.equal(sha(baseBytes), BASE_SHA);
  assert.equal(sha(maskBytes), MASK_SHA);
  assert.equal(sha(bytes), manifest.asset.sha256);
  assert.equal(bytes.length, manifest.asset.encodedBytes);
  assert.equal(cfg.asset.furnitureBaseAssetSHA256, sha(bytes));
  assert.equal(cfg.asset.sha256, sha(currentBytes));
  assert.equal(sha(read(manifest.fallback.path)), manifest.fallback.sha256);
  assert.deepEqual(Object.keys(manifest.identity).sort(), [...identityKeys].sort());
  const identitySources = {
    caissonSourceSHA256:'assets-src/interiors/taihe_caisson/geometry.py',
    caissonIntegrationSHA256:'assets-src/interiors/append_taihe_caisson.py',
    caissonShellSourceSHA256:'assets-src/interiors/taihe_caisson/shell.py',
    caissonShellRetirementSHA256:'assets-src/interiors/retire_taihe_shell.py',
    caissonShellMaskSHA256:maskPath,
  };
  assert.deepEqual(Object.keys(manifest.sources).sort(), [...Object.values(identitySources),'assets-src/interiors/build_taihe_caisson.py'].sort());
  for (const [file, hash] of Object.entries(manifest.sources)) assert.equal(sha(read(file)), hash, file);
  for (const [key,file] of Object.entries(identitySources)) assert.equal(manifest.identity[key],sha(read(file)),key);
  assert.equal(manifest.identity.caissonBaseAssetSHA256,BASE_SHA);
  for (const key of identityKeys) {
    assert.equal(candidate.contract[key], manifest.identity[key], key);
    assert.equal(cfg.asset[key], manifest.identity[key], key);
  }
  assert.equal(manifest.identity.caissonShellMaskSHA256, MASK_SHA);
  assert.equal(sha(read('data/architecture/taihe-core.json')), manifest.profileSHA256);
});

test('exact 320-face retirement changes only the pinned indices and 19 inventory rows', () => {
  const {expected, changes} = independentlyRetiredViews();
  const code = "import sys;sys.path.insert(0,'assets-src/interiors');from retire_taihe_shell import retire_shell;sys.stdout.buffer.write(retire_shell(open(sys.argv[1],'rb').read(),open(sys.argv[2],'rb').read())[0])";
  const result = spawnSync('python', ['-c', code, manifest.baselineAsset, maskPath], pythonOptions);
  assert.equal(result.status, 0, result.stderr?.toString() || result.error?.message);
  const retired = decode(result.stdout), actual = views(result.stdout, retired.gltf);
  assert.equal(sha(result.stdout), manifest.retirement.retiredBaseSHA256);
  assert.equal(actual.length, expected.length);
  expected.forEach((v, i) => equalBytes(actual[i], v, `retired view ${i}`));
  assert.deepEqual(manifest.retirement.indexChanges, changes);
  assert.equal(manifest.retirement.removedTriangles, 320);
  assert.equal(manifest.identity.caissonRemovedTriangles, 320);
  assert.equal(manifest.retirement.baselineSHA256, BASE_SHA);
  assert.equal(manifest.retirement.maskSHA256, MASK_SHA);
  assert.deepEqual(manifest.retirement.retiredParts, mask.parts);
  assert.equal(retired.triangles.length, 12128-320);
  assert.deepEqual(retired.inventory, original.inventory.filter(r => !mask.parts.includes(r.name)));
  const changed = new Map(changes.map(r => [r.accessor, r]));
  original.gltf.accessors.forEach((accessor, i) => {
    const row = changed.get(i);
    if (!row) assert.deepEqual(retired.gltf.accessors[i], accessor, `retired accessor ${i}`);
    else {
      assert.deepEqual(without(retired.gltf.accessors[i], ['count','min','max']), without(accessor, ['count','min','max']));
      assert.equal(retired.gltf.accessors[i].count, accessor.count-row.removedTriangles*3);
    }
  });
  for (const key of ['materials','meshes','scenes','scene']) assert.deepEqual(retired.gltf[key], original.gltf[key]);
  for (const [key,value] of Object.entries(original.contract)) if (key!=='inventory') assert.deepEqual(retired.contract[key], value, key);
});

test('all retained accessor bytes/order precede additions, with unchanged non-target batches and contract fields', () => {
  const {expected} = independentlyRetiredViews();
  const now = views(bytes, candidate.gltf);
  const allowed = materials.flatMap(material => {
    const info = mask.materials[material], p = original.gltf.meshes[info.mesh].primitives[info.primitive];
    return [...Object.values(p.attributes), p.indices];
  });
  assert.deepEqual(manifest.accessorPrefixes.map(r => r.accessor).sort((a,b)=>a-b), allowed.sort((a,b)=>a-b));
  const touched = new Map(manifest.accessorPrefixes.map(r => [original.gltf.accessors[r.accessor].bufferView,r]));
  assert.equal(touched.size, allowed.length);
  assert.equal(now.length, expected.length);
  expected.forEach((b,i) => {
    equalBytes(now[i].subarray(0,b.length), b, `candidate retained view ${i}`);
    const row = touched.get(i);
    if (row) {
      assert.equal(b.length, row.retainedBytes);
      assert.equal(sha(b), row.retainedSHA256);
      assert.equal(now[i].length, b.length+row.addedBytes);
    } else equalBytes(now[i], b, `untouched view ${i}`);
    assert.deepEqual(without(candidate.gltf.bufferViews[i], ['byteOffset','byteLength']), without(original.gltf.bufferViews[i], ['byteOffset','byteLength']));
  });
  original.gltf.accessors.forEach((accessor,i) => {
    if (!allowed.includes(i)) assert.deepEqual(candidate.gltf.accessors[i], accessor, `untouched accessor ${i}`);
    else assert.deepEqual(without(candidate.gltf.accessors[i], ['count','min','max']), without(accessor, ['count','min','max']));
  });
  for (const key of ['materials','meshes','scenes','scene']) assert.deepEqual(candidate.gltf[key], original.gltf[key]);
  assert.deepEqual(candidate.gltf.nodes.filter(n => n.name!=='TAIHE_CORE_CONTRACT'), original.gltf.nodes.filter(n => n.name!=='TAIHE_CORE_CONTRACT'));
  for (const [key,value] of Object.entries(original.contract)) if (key!=='inventory') assert.deepEqual(candidate.contract[key], value, key);
  const retainedInventory = original.inventory.filter(r => !mask.parts.includes(r.name));
  assert.deepEqual(candidate.inventory, [...retainedInventory, ...manifest.appendedInventory]);
  assert.deepEqual(manifest.appendedInventory, authoredBatches().detail.inventory);
  assert.deepEqual(manifest.appendedInventory, [...manifest.shell.detail.inventory, ...manifest.geometry.detail.inventory]);
});

test('actual appended shell and dragon have outward unit normals, finite positions and neutral gold UVs', () => {
  let count = 0;
  for (const material of materials) {
    const retained = keptFaces(material), all = materialFaces(candidate, material);
    assert.deepEqual(all.slice(0,retained.length), retained);
    for (const triangle of all.slice(retained.length)) {
      count++;
      const tri = new THREE.Triangle(...triangle.vertices.map(v => new THREE.Vector3(...v.POSITION)));
      const normal = tri.getNormal(new THREE.Vector3());
      assert.ok(tri.getArea()>1e-10);
      for (const v of triangle.vertices) {
        assert.ok([...v.POSITION,...v.NORMAL].every(Number.isFinite));
        const vn = new THREE.Vector3(...v.NORMAL);
        assert.ok(Math.abs(vn.length()-1)<2e-6);
        assert.ok(vn.dot(normal)>.99999);
        if (material==='taihe_gold') assert.deepEqual(v.TEXCOORD_0,[0,0]);
      }
    }
  }
  assert.equal(count, manifest.identity.caissonTriangles+manifest.identity.caissonShellTriangles);
  assert.equal(candidate.triangles.length, 12128-320+count);
  assert.equal(candidate.triangles.length, manifest.asset.renderableTriangles);
  assert.ok(candidate.triangles.length<=18000);
  assert.equal(candidate.gltf.meshes.length,8);
  assert.equal(candidate.gltf.materials.length,8);
});

test('loaded and fallback geometry retain original budgets, ownership and neutral appended attributes', async () => {
  assert.equal(validateTaiheCore(await loadScene(),cfg).triangles,cfg.asset.renderableTriangles);
  const control = captureTaiheControl('太和殿');
  try {
    const meshes = control.group.children.filter(o => o.userData.taiheCoreOwner);
    assert.equal(meshes.length,8);
    assert.equal(new Set(meshes.map(m => m.material)).size,8);
    let triangles = 0;
    for (const mesh of meshes) {
      triangles += mesh.geometry.attributes.position.count/3;
      assert.equal(mesh.geometry.index,null);
      assert.ok(mesh.geometry.attributes.position.array.every(Number.isFinite));
    }
    assert.equal(manifest.fallback.retiredTriangles,48);
    assert.equal(triangles,1558-48+manifest.fallback.addedTriangles);
    assert.equal(triangles,manifest.fallback.renderableTriangles);
    assert.ok(triangles<=1600);
    for (const [key,batch] of Object.entries(authoredBatches().fallback.batches)) {
      const material = key==='gold'?'taihe_gold':'taihe_dark_gold';
      const mesh = meshes.find(m => m.material.name===material);
      const {position,uv,color} = mesh.geometry.attributes;
      const start = position.count-batch.position.length/3;
      for (let i=start; i<position.count; i++) {
        if (uv) {assert.equal(uv.getX(i),0);assert.equal(uv.getY(i),0);}
        if (color) for (let k=0;k<3;k++) assert.equal(color.array[i*3+k],1);
      }
    }
  } finally {control.builder.dispose();}
});

for (const key of identityKeys) test(`loaded replacement rejects missing ${key}`, async () => {
  const scene = await loadScene();
  delete scene.getObjectByName('TAIHE_CORE_CONTRACT').userData[key];
  assert.throws(() => validateTaiheCore(scene,cfg), /caisson identity mismatch/);
  const altered = structuredClone(cfg);
  delete altered.asset[key];
  const intactScene = await loadScene();
  assert.throws(() => validateTaiheCore(intactScene,altered), /caisson identity mismatch/);
});

test('compiled suffixes match authored shell then dragon at float32 precision in both qualities', () => {
  const control = captureTaiheControl('太和殿');
  try {
    for (const [quality,{batches,counts}] of Object.entries(authoredBatches())) {
      let triangleCount = 0;
      for (const [key,expected] of Object.entries(batches)) {
        const material = key==='gold'?'taihe_gold':'taihe_dark_gold';
        triangleCount += expected.position.length/9;
        if (quality==='detail') {
          const faces = materialFaces(candidate,material).slice(keptFaces(material).length);
          assert.deepEqual(faces.flatMap(t => t.vertices.flatMap(v => v.POSITION)), expected.position.map(Math.fround));
          assert.deepEqual(faces.flatMap(t => t.vertices.flatMap(v => v.NORMAL)), expected.normal.map(Math.fround));
        } else {
          const mesh = control.group.children.find(o => o.userData.taiheCoreOwner && o.material.name===material);
          const raw = TAIHE_CAISSON_FALLBACK_DATA.find(row => row.material===key);
          assert.ok(raw, `generated fallback ${key}`);
          for (const name of ['position','normal']) {
            // The encoded source payload remains bit-exact, including signed
            // zero. The ordinary merge may normalize only that zero sign.
            equalBytes(Buffer.from(raw[name],'base64'),float32Bytes(expected[name]),`fallback source ${key}/${name}`);
            assert.deepEqual(Array.from(mesh.geometry.attributes[name].array.slice(-expected[name].length),numericFloat32),expected[name].map(numericFloat32));
          }
        }
      }
      assert.equal(manifest.geometry[quality].triangles,counts.caisson_dragon_);
      assert.equal(manifest.shell[quality].triangles,counts.caisson_shell_);
      if (quality==='detail') {
        assert.equal(manifest.identity.caissonTriangles,counts.caisson_dragon_);
        assert.equal(manifest.identity.caissonShellTriangles,counts.caisson_shell_);
      }
      assert.equal(triangleCount,manifest.geometry[quality].triangles+manifest.shell[quality].triangles);
      if (quality==='fallback') assert.equal(triangleCount,manifest.fallback.addedTriangles);
    }
  } finally {control.builder.dispose();}
});

test('original finite source fixture is unchanged after unwrapping only the enumerated shell delta', () => {
  assert.equal(sha(read('tests/fixtures/taihe-caisson-source-delta.json')),ORIGINAL_SOURCE_FIXTURE_SHA);
  for (const [file,row] of Object.entries(sourceDelta.files)) {
    const current = read(file), preShell = restorePreShellSource(file,current);
    assert.equal(sha(preShell),row.candidateSHA256,file);
    assert.equal(sha(restorePreCaissonSource(file,current)),row.baselineSHA256,file);
    for (const delta of row.deltas) {
      assert.equal(preShell.toString().split(delta.after).length,2);
      assert.throws(() => restorePreCaissonSource(file,preShell.toString().replace(delta.after,delta.after+delta.after)));
    }
    assert.throws(() => restorePreCaissonSource(file,current+'\n'));
  }
});

test('portable retirement-plus-append pipeline reproduces GLB, fallback and manifest byte for byte', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),'taihe-caisson-rebuild-'));
  try {
    const result = spawnSync('python',['assets-src/interiors/build_taihe_caisson.py',dir],{...pythonOptions,encoding:'utf8'});
    assert.equal(result.status,0,result.stderr || result.error?.message);
    for (const file of [manifest.asset.path,manifest.fallback.path,'docs/current-state/taihe-caisson/SOURCE-MANIFEST.json']) equalBytes(fs.readFileSync(path.join(dir,file)),read(file),file);
  } finally {fs.rmSync(dir,{recursive:true});}
});
