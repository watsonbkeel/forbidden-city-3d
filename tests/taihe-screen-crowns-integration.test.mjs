import {restorePreFurnishingSurfaceSource} from './lib/taihe-furnishing-surface-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {validateTaiheCore, taiheFallbackMeshes} from '../src/scene/interior/TaiheCoreContract.js';
import {captureTaiheControl} from './lib/taihe-core-fixture.mjs';
import {decode} from './lib/taihe-column-fixture.mjs';

const root = new URL('../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const without = (object, keys) => Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key)));
const BASE_SHA = '0bfa52b758cba052b0b8258ebc338cb9b0f80129e00d0bb5970ef343758432ea';
const MASK_SHA = '7231ffb388115f3cf3f9e9745de82e645bd9cda091a2d352c795d54479490805';
const manifestPath = 'docs/current-state/taihe-screen-crowns/SOURCE-MANIFEST.json';
const maskPath = 'assets-src/interiors/taihe_screen_crowns/retired_screen_header_faces.json';
const manifest = JSON.parse(read(manifestPath));
// Historical migration proof is pinned to the exact registry at 033a3921.
// Current assets and runtime checks continue to use the live registry elsewhere.
const registryBytes = read('tests/fixtures/taihe-screen-crowns-registry.json');
const cfg = JSON.parse(registryBytes);
const baseBytes = read('public/models/interiors/taihe-furniture-0bfa52b758cb.glb');
const bytes = read('public'+cfg.model);
const maskBytes = read(maskPath), mask = JSON.parse(maskBytes);
const base = decode(baseBytes), actual = decode(bytes);
const materialKeys = {taihe_lacquer:'red', taihe_dark_gold:'darkGold', taihe_gold:'gold'};
const removedCounts = {taihe_lacquer:224, taihe_dark_gold:168, taihe_gold:1344};
const addedCounts = {taihe_lacquer:84, taihe_dark_gold:168, taihe_gold:1988};
const keys = ['screenCrownSourceSHA256', 'screenCrownBaseAssetSHA256', 'screenCrownIntegrationSHA256',
  'screenCrownRetirementSHA256', 'screenCrownMaskSHA256', 'screenCrownTriangles', 'screenCrownRemovedTriangles'];
const options = {cwd:root, env:{...process.env, PYTHONDONTWRITEBYTECODE:'1'}, maxBuffer:8*1024*1024, timeout:30000};
function equalBytes(actual, expected, label) {
  assert.equal(actual.length, expected.length, label+' byte length');
  assert.ok(actual.equals(expected), label+' exact bytes/order');
}
function views(buffer, gltf) {
  const start = 28+buffer.readUInt32LE(12);
  return gltf.bufferViews.map(v => buffer.subarray(start+(v.byteOffset??0), start+(v.byteOffset??0)+v.byteLength));
}
const beforeViews = views(baseBytes, base.gltf), nowViews = views(bytes, actual.gltf);
const f32 = values => {const bytes=Buffer.alloc(values.length*4);values.forEach((v,i)=>bytes.writeFloatLE(v,i*4));return bytes;};
const indexAt = (bytes, size, i) => size===2 ? bytes.readUInt16LE(i*size) : bytes.readUInt32LE(i*size);
function orientedBytes(raw) {
  const normalized = Buffer.from(raw);
  for (let i=0; i<9; i++) if (normalized.readFloatLE(i*4)===0) normalized.writeFloatLE(0,i*4);
  return [0,1,2].map(i => Buffer.concat([normalized.subarray(i*12),normalized.subarray(0,i*12)])).sort(Buffer.compare)[0];
}
function bounds(points) {
  const encoded = points.map(point => point.map(Math.fround));
  return {min:[0,1,2].map(k=>Math.min(...encoded.map(p=>p[k]))), max:[0,1,2].map(k=>Math.max(...encoded.map(p=>p[k])))};
}
const expectedParts = Object.fromEntries(Array.from({length:7}, (_,i) => [
  [`screen_${i}`, ['taihe_lacquer',32]],
  ...['panel','panel.001'].map(s=>[`screen_${i}_${s}`,['taihe_dark_gold',12]]),
  ...['stile','stile.001','stile.002','stile.003','rail.001','rail.003'].map(s=>[`screen_${i}_${s}`,['taihe_gold',12]]),
  [`furniture_screen_${i}_crest_curls`,['taihe_gold',88]],
  [`furniture_screen_${i}_register_frames/cap`,['taihe_gold',32]],
]).flat());
const retiredNames = Object.keys(expectedParts).filter(n=>!n.includes('/')).sort();
const partialNames = Array.from({length:7},(_,i)=>`furniture_screen_${i}_register_frames`);

// Independent expectation: read the frozen raw indices and pinned face mask.
// Neither the retirement function nor its manifest receipt determines the result.
function retainedViews() {
  assert.equal(sha(baseBytes), BASE_SHA);
  assert.equal(sha(maskBytes), MASK_SHA);
  assert.equal(mask.baseSHA256, BASE_SHA);
  assert.equal(mask.schema, 'taihe-screen-crown-retirement-v1');
  assert.deepEqual(mask.parts, Object.keys(expectedParts).sort());
  assert.deepEqual(mask.retiredInventoryNames, retiredNames);
  assert.deepEqual(mask.partialInventoryNames, partialNames);
  assert.deepEqual(Object.keys(mask.materials).sort(), Object.keys(removedCounts).sort());
  assert.equal(mask.triangles.length,1736);
  assert.equal(new Set(mask.triangles.map(r=>`${r.material}:${r.triangleOrdinal}`)).size,1736);
  const expected = beforeViews.map(v=>Buffer.from(v)), changes=[];
  for (const [part,[material,count]] of Object.entries(expectedParts)) {
    const rows=mask.triangles.filter(r=>r.part===part).sort((a,b)=>a.sourceTriangleOrdinal-b.sourceTriangleOrdinal);
    assert.equal(rows.length,count,part);
    assert.ok(rows.every(r=>r.material===material));
    assert.deepEqual(rows.map(r=>r.sourceTriangleOrdinal),Array.from({length:count},(_,i)=>i));
    assert.equal(mask.partProofs[part].material,material);
    assert.equal(mask.partProofs[part].triangles,count);
    assert.equal(mask.partProofs[part].orientedTriangleHashesSHA256,sha(Buffer.concat(rows.map(r=>Buffer.from(r.sourcePositionSHA256,'hex')))));
  }
  for (const [material,count] of Object.entries(removedCounts)) {
    const info=mask.materials[material], primitive=base.gltf.meshes[info.mesh].primitives[info.primitive];
    assert.equal(base.gltf.materials[primitive.material].name,material);
    assert.equal(primitive.indices,info.indexAccessor);
    assert.equal(primitive.attributes.POSITION,info.positionAccessor);
    assert.equal(primitive.mode??4,4);
    const a=base.gltf.accessors[primitive.indices], position=base.gltf.accessors[primitive.attributes.POSITION];
    const size={5123:2,5125:4}[a.componentType], before=beforeViews[a.bufferView], positions=beforeViews[position.bufferView];
    assert.ok(size);assert.equal(a.type,'SCALAR');assert.equal(a.count,info.originalTriangles*3);
    assert.equal(a.byteOffset??0,0);assert.equal(position.byteOffset??0,0);
    assert.equal('sparse' in a || 'sparse' in position || 'byteStride' in base.gltf.bufferViews[a.bufferView] || 'byteStride' in base.gltf.bufferViews[position.bufferView],false);
    assert.equal(position.componentType,5126);assert.equal(position.type,'VEC3');
    assert.equal(before.length,a.count*size);assert.equal(positions.length,position.count*12);
    assert.equal(info.removedTriangles,count);
    const rows=mask.triangles.filter(r=>r.material===material), removed=new Set(rows.map(r=>r.triangleOrdinal));
    assert.equal(rows.length,count);assert.equal(removed.size,count);
    for (const row of rows) {
      assert.ok(Number.isInteger(row.triangleOrdinal)&&row.triangleOrdinal>=0&&row.triangleOrdinal<info.originalTriangles);
      const ids=[0,1,2].map(k=>indexAt(before,size,row.triangleOrdinal*3+k));
      assert.deepEqual(ids,row.indices);assert.ok(ids.every(i=>i<position.count));
      const raw=Buffer.concat(ids.map(i=>positions.subarray(i*12,i*12+12)));
      assert.equal(sha(raw),row.positionSHA256);
      assert.equal(sha(orientedBytes(raw)),row.sourcePositionSHA256,'masked source winding');
    }
    expected[a.bufferView]=Buffer.concat(Array.from({length:info.originalTriangles},(_,i)=>i).filter(i=>!removed.has(i)).map(i=>before.subarray(i*3*size,(i+1)*3*size)));
    const oldIds=new Set(Array.from({length:a.count},(_,i)=>indexAt(before,size,i)));
    const keptIds=new Set(Array.from({length:expected[a.bufferView].length/size},(_,i)=>indexAt(expected[a.bufferView],size,i)));
    changes.push({material,accessor:primitive.indices,bufferView:a.bufferView,removedTriangles:count,
      beforeSHA256:sha(before),retainedSHA256:sha(expected[a.bufferView]),beforeBytes:before.length,
      retainedBytes:expected[a.bufferView].length,vertexCount:position.count,newlyUnusedVertices:[...oldIds].filter(i=>!keptIds.has(i)).length});
  }
  return {expected,changes};
}

let authored;
function authoredData() {
  if (authored) return authored;
  const code=`import sys,json
sys.path.insert(0,'assets-src/interiors')
from taihe_screen_crowns.geometry import build_candidate
from taihe_furniture.geometry import build_candidate as furniture
from taihe_caisson.geometry import material_batches
p=json.load(open('data/architecture/taihe-core.json'))
m=build_candidate(p,'detail',crown_style='sculptural')
f=furniture(p)
frames={}
for i in range(7):
    name='screen_'+str(i)+'_register_frames'
    frames['furniture_'+name]=[[[f['vertices'][v] for v in f['triangles'][j]] for j in c['triangles']] for c in f['metadata']['components'] if c['name']==name]
print(json.dumps({'batches':material_batches(m),'vertices':m['vertices'],'triangles':m['triangles'],'parts':m['parts'],'frames':frames,'metadata':m['metadata']}))`;
  const result=spawnSync('python',['-c',code],{...options,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.error?.message);
  authored=JSON.parse(result.stdout);return authored;
}

// A registry rollback, stale provenance, broadened retirement or raised budget
// must fail even when the candidate's own manifest makes the same mistake.
test('frozen crown migration pins its exact registry, furniture base, complete sources and unchanged allocation',()=>{
  assert.equal(sha(registryBytes),'e1f09c4b7b154df36d92d2c3e3b72ab0bd25fe51958ac1101f5c2f24a84c9124');
  assert.equal(cfg.model,'/models/interiors/taihe-screen-crowns-22c6acdf581d.glb');
  assert.equal(sha(bytes),'22c6acdf581dc7779b876963fd935ee482bd22e2a6671b486f9571debc14ac19');
  assert.equal(manifest.schema,'taihe-screen-crowns-1');assert.equal(manifest.baselineSHA256,BASE_SHA);
  assert.equal(manifest.baselineAsset,'public/models/interiors/taihe-furniture-0bfa52b758cb.glb');
  assert.equal(sha(baseBytes),BASE_SHA);assert.equal(base.triangles.length,17266);
  assert.equal(sha(bytes),cfg.asset.sha256);assert.equal(sha(bytes),manifest.asset.sha256);
  assert.equal(bytes.length,cfg.asset.encodedBytes);assert.equal(bytes.length,manifest.asset.encodedBytes);
  assert.equal('public'+cfg.model,manifest.asset.path);
  assert.match(cfg.model,new RegExp(`^/models/interiors/taihe-screen-crowns-${sha(bytes).slice(0,12)}\\.glb$`));
  assert.deepEqual(Object.keys(manifest.identity),keys);
  const identitySources={screenCrownSourceSHA256:'assets-src/interiors/taihe_screen_crowns/geometry.py',
    screenCrownIntegrationSHA256:'assets-src/interiors/append_taihe_screen.py',
    screenCrownRetirementSHA256:'assets-src/interiors/taihe_screen_crowns/retire.py',screenCrownMaskSHA256:maskPath};
  assert.deepEqual(Object.keys(manifest.sources).sort(),[...Object.values(identitySources),
    'assets-src/interiors/taihe_screen_crowns/derive_retirement.py','assets-src/interiors/append_taihe_caisson.py',
    'assets-src/interiors/taihe_furniture/geometry.py','assets-src/interiors/taihe_caisson/geometry.py',
    'assets-src/interiors/build_taihe_screen_crowns.py'].sort());
  for(const [file,hash] of Object.entries({...manifest.sources,...mask.sources}))assert.equal(sha(read(file)),hash,file);
  for(const [key,file] of Object.entries(identitySources))assert.equal(manifest.identity[key],sha(read(file)),key);
  for(const key of keys){assert.equal(actual.contract[key],manifest.identity[key],key);assert.equal(cfg.asset[key],manifest.identity[key],key);}
  assert.equal(manifest.profileSHA256,sha(read('data/architecture/taihe-core.json')));
  assert.equal(manifest.identity.screenCrownBaseAssetSHA256,BASE_SHA);
  assert.equal(manifest.identity.screenCrownMaskSHA256,MASK_SHA);
  assert.equal(manifest.identity.screenCrownTriangles,2240);assert.equal(manifest.identity.screenCrownRemovedTriangles,1736);
  assert.equal(actual.triangles.length,17266-1736+2240);assert.equal(actual.triangles.length,17770);
  assert.equal(cfg.asset.renderableTriangles,17770);assert.equal(manifest.asset.renderableTriangles,17770);
  assert.equal(cfg.budget.tris,18000);assert.equal(cfg.asset.visibleBatches,8);assert.equal(manifest.asset.visibleBatches,8);
  assert.equal(actual.gltf.meshes.length,8);assert.equal(actual.gltf.materials.length,8);
  assert.equal(manifest.geometry.crownStyle,'sculptural');assert.equal(manifest.geometry.mainSectionScale,1.65);
});

test('only the 1736 exact masked faces retire; every old attribute prefix and retained index remains in order',()=>{
  const {expected,changes}=retainedViews();
  assert.deepEqual([...manifest.retirement.indexChanges].sort((a,b)=>a.accessor-b.accessor),changes.sort((a,b)=>a.accessor-b.accessor));
  assert.equal(manifest.retirement.removedTriangles,1736);
  assert.equal(manifest.retirement.baselineSHA256,BASE_SHA);assert.equal(manifest.retirement.maskSHA256,MASK_SHA);
  assert.deepEqual(manifest.retirement.retiredParts,Object.keys(expectedParts).sort());
  assert.deepEqual(manifest.retirement.sourceSHA256,mask.sources);
  const expectedPrefixes=Object.keys(materialKeys).flatMap(material=>{
    const p=base.gltf.meshes[mask.materials[material].mesh].primitives[0];
    return Object.entries({...p.attributes,INDICES:p.indices}).map(([semantic,accessor])=>({semantic,accessor,material}));
  });
  assert.deepEqual(manifest.accessorPrefixes.map(r=>({semantic:r.semantic,accessor:r.accessor,material:r.material})),expectedPrefixes);
  const append=new Map(manifest.accessorPrefixes.map(r=>[base.gltf.accessors[r.accessor].bufferView,r]));
  assert.equal(append.size,10);assert.equal(nowViews.length,beforeViews.length);
  for(let i=0;i<expected.length;i++){
    equalBytes(nowViews[i].subarray(0,expected[i].length),expected[i],`retained view ${i}`);
    const row=append.get(i);
    if(row){assert.equal(row.retainedBytes,expected[i].length);assert.equal(row.retainedSHA256,sha(expected[i]));assert.equal(nowViews[i].length,row.retainedBytes+row.addedBytes);}
    else equalBytes(nowViews[i],expected[i],`untouched view ${i}`);
    assert.deepEqual(without(actual.gltf.bufferViews[i],['byteOffset','byteLength']),without(base.gltf.bufferViews[i],['byteOffset','byteLength']));
  }
  assert.equal(actual.gltf.accessors.length,base.gltf.accessors.length);
  const altered=new Set(manifest.accessorPrefixes.map(r=>r.accessor));
  base.gltf.accessors.forEach((a,i)=>assert.deepEqual(altered.has(i)?without(actual.gltf.accessors[i],['count','min','max']):actual.gltf.accessors[i],altered.has(i)?without(a,['count','min','max']):a));
  for(const row of manifest.accessorPrefixes){
    const a=actual.gltf.accessors[row.accessor], components={SCALAR:1,VEC2:2,VEC3:3}[a.type],size={5123:2,5125:4,5126:4}[a.componentType];
    assert.equal(a.count,nowViews[a.bufferView].length/(components*size));
  }
  for(const key of ['materials','meshes','scenes','scene','textures','images','samplers','extensions','extensionsUsed','extensionsRequired'])assert.deepEqual(actual.gltf[key],base.gltf[key],key);
  assert.equal(actual.gltf.nodes.length,base.gltf.nodes.length);
  actual.gltf.nodes.forEach((node,i)=>assert.deepEqual(node.name==='TAIHE_CORE_CONTRACT'?without(node,['extras']):node,base.gltf.nodes[i].name==='TAIHE_CORE_CONTRACT'?without(base.gltf.nodes[i],['extras']):base.gltf.nodes[i]));
  assert.deepEqual(without(actual.contract,['inventory',...keys]),without(base.contract,['inventory']));
});

test('all appended red, gold and darkGold streams exactly reproduce authored sculptural geometry',()=>{
  const {batches}=authoredData();
  assert.deepEqual(Object.keys(batches).sort(),['darkGold','gold','red']);
  for(const [material,key] of Object.entries(materialKeys))assert.equal(batches[key].indices.length/3,addedCounts[material]);
  for(const row of manifest.accessorPrefixes){
    const a=actual.gltf.accessors[row.accessor],tail=nowViews[a.bufferView].subarray(row.retainedBytes),batch=batches[materialKeys[row.material]];
    let expected;
    if(row.semantic==='INDICES'){
      const primitive=base.gltf.meshes[mask.materials[row.material].mesh].primitives[0],offset=base.gltf.accessors[primitive.attributes.POSITION].count;
      const size={5123:2,5125:4}[a.componentType];assert.ok(size);
      expected=Buffer.alloc(batch.indices.length*size);
      batch.indices.forEach((v,i)=>size===2?expected.writeUInt16LE(v+offset,i*size):expected.writeUInt32LE(v+offset,i*size));
    }else expected=f32(row.semantic==='POSITION'?batch.position:row.semantic==='NORMAL'?batch.normal:Array(batch.position.length/3*2).fill(0));
    assert.equal(row.addedBytes,expected.length);equalBytes(tail,expected,row.material+' '+row.semantic);
  }
  for(const material of Object.keys(materialKeys)){
    const oldCount=base.triangles.filter(t=>t.material===material).length;
    const appended=actual.triangles.filter(t=>t.material===material).slice(oldCount-removedCounts[material]);
    assert.equal(appended.length,addedCounts[material]);
    for(const t of appended){
      const triangle=new THREE.Triangle(...t.vertices.map(v=>new THREE.Vector3(...v.POSITION))),normal=triangle.getNormal(new THREE.Vector3());
      assert.ok(triangle.getArea()>1e-10);
      for(const v of t.vertices){assert.ok([...v.POSITION,...v.NORMAL].every(Number.isFinite));assert.ok(new THREE.Vector3(...v.NORMAL).distanceTo(normal)<1e-4);if(material==='taihe_gold')assert.deepEqual(v.TEXCOORD_0,[0,0]);}
    }
  }
});

test('inventory retires exactly 70 whole owners and seven caps while preserving all other bounds',()=>{
  assert.equal(retiredNames.length,70);assert.equal(partialNames.length,7);
  assert.deepEqual(manifest.retirement.retiredInventoryNames,retiredNames);
  assert.deepEqual(manifest.retirement.partialInventoryNames,partialNames);
  const {vertices,triangles,parts,frames}=authoredData();
  assert.equal(Object.keys(parts).length,77);
  const appended=Object.entries(parts).map(([name,ids])=>({name:'screenCrown_'+name,...bounds(ids.flatMap(i=>triangles[i].map(v=>vertices[v])))}));
  assert.deepEqual(manifest.appendedInventory,appended);
  const changes=partialNames.map(name=>{
    const components=frames[name];assert.deepEqual(components.map(c=>c.length),[16,16,16,32]);
    const before=base.inventory.find(r=>r.name===name);assert.ok(before);
    return {name,before,after:{name,...bounds(components.slice(0,3).flat(2))},retainedTriangles:48,retiredCapTriangles:32};
  });
  assert.deepEqual(manifest.retainedInventoryChanges,changes);
  const byName=new Map(changes.map(r=>[r.name,r.after]));
  const kept=base.inventory.filter(r=>!retiredNames.includes(r.name)).map(r=>byName.get(r.name)??r);
  assert.deepEqual(actual.inventory,[...kept,...appended]);
  assert.equal(new Set(actual.inventory.map(r=>r.name)).size,actual.inventory.length);
  for(const name of retiredNames)assert.equal(actual.inventory.find(r=>r.name===name),undefined,name);
  for(const row of base.inventory.filter(r=>!retiredNames.includes(r.name)&&!partialNames.includes(r.name)))assert.deepEqual(actual.inventory.find(r=>r.name===row.name),row,row.name);
  assert.equal(appended.filter(r=>/^screenCrown_screen_\d_open_crown$/.test(r.name)).length,7);
  assert.match(manifest.geometry.dimensions,/estimates/);
});

test('actual GLTFLoader accepts the frozen crown migration and rejects each absent or changed crown identity',async()=>{
  const scene=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length),'')).scene;
  assert.deepEqual(validateTaiheCore(scene,cfg),{triangles:17770,meshes:8});
  const c=scene.getObjectByName('TAIHE_CORE_CONTRACT').userData;
  for(const key of keys){
    const value=c[key];
    try{
      delete c[key];assert.throws(()=>validateTaiheCore(scene,cfg),/screen crown identity/,`missing asset ${key}`);
      c[key]=typeof value==='number'?value+1:'changed';assert.throws(()=>validateTaiheCore(scene,cfg),/screen crown identity/,`changed asset ${key}`);
    }finally{c[key]=value;}
    const changed=structuredClone(cfg);delete changed.asset[key];
    assert.throws(()=>validateTaiheCore(scene,changed),/screen crown identity/,`missing registry ${key}`);
    changed.asset[key]=typeof value==='number'?value+1:'changed';
    assert.throws(()=>validateTaiheCore(scene,changed),/screen crown identity/,`changed registry ${key}`);
  }
  assert.deepEqual(validateTaiheCore(scene,cfg),{triangles:17770,meshes:8});
  const oldScene=(await new GLTFLoader().parseAsync(baseBytes.buffer.slice(baseBytes.byteOffset,baseBytes.byteOffset+baseBytes.length),'')).scene;
  assert.throws(()=>validateTaiheCore(oldScene,cfg),/screen crown identity/,'frozen pre-crown asset rejected by pinned crown registry');
});

test('fallback still renders exactly 1600 triangles in eight unchanged source-owned batches',()=>{
  assert.deepEqual(manifest.fallback,{changed:false,renderableTriangles:1596,visibleBatches:8});
  const frozenSources={
    'TaiheCore.js':'67980cf6965d1e3e4a1e22719e777e90b9ebbacb91900eddd9a70050147cd80c',
    'TaiheCoreProfile.js':'61eb7e9bf0f946b60d7effd3a0e16d4731c00dd02d8476000757ccd32257609d',
    'TaiheCaissonDetail.js':'272160b14f498416a267739166c93c78d41e27917713287a3ec288890a41d7e4',
    'TaiheCaissonFallbackData.js':'d7bfaa6102a0bcb10f27c4c7f720d16a3778324376e1ef2550cd05f6880587c6',
    'TaiheDisplayPairs.js':'7af5145e6bbc15011b3534b62a375db6a4cab757fee45bfccc383a1d3e2cd339',
    'TaiheDisplayFallbackData.js':'9f581400cc6053186d98c1b34353b06853b23fa677fb8d5c8d79a727e22e953c',
  };
  for(const [file,hash] of Object.entries(frozenSources))assert.equal(sha(restorePreFurnishingSurfaceSource('src/scene/palace/special/'+file,read('src/scene/palace/special/'+file))),hash,file);
  const control=captureTaiheControl('太和殿');
  try{
    const meshes=taiheFallbackMeshes(control.group);
    assert.equal(meshes.length,8);assert.equal(new Set(meshes.map(m=>m.material)).size,8);
    assert.equal(meshes.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),1600);
    for(const mesh of meshes){assert.ok(mesh.geometry.attributes.position.array.every(Number.isFinite));assert.equal(mesh.geometry.index,null);}
  }finally{control.builder.dispose();}
});

test('standalone crown builder reproduces exact asset and manifest and never writes fallback',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'taihe-screen-crowns-'));
  try{
    const result=spawnSync('python',['assets-src/interiors/build_taihe_screen_crowns.py',dir],options);
    assert.equal(result.status,0,result.stderr?.toString()||result.error?.message);
    equalBytes(fs.readFileSync(path.join(dir,manifest.asset.path)),bytes,'deterministic asset');
    equalBytes(fs.readFileSync(path.join(dir,manifestPath)),read(manifestPath),'deterministic manifest');
    const files=[];
    function walk(relative=''){for(const item of fs.readdirSync(path.join(dir,relative),{withFileTypes:true})){const name=path.join(relative,item.name);if(item.isDirectory())walk(name);else files.push(name);}}
    walk();assert.deepEqual(files.sort(),[manifest.asset.path,manifestPath].sort());
    assert.equal(sha(read(manifest.baselineAsset)),BASE_SHA);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
