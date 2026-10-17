import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {validateTaiheCore} from '../src/scene/interior/TaiheCoreContract.js';
import {decode} from './lib/taihe-column-fixture.mjs';
import {restorePreScreenCrownsSource} from './lib/taihe-screen-crowns-retention.mjs';
import {restorePreFurnitureSource} from './lib/taihe-furniture-retention.mjs';

const root=new URL('../',import.meta.url), read=p=>fs.readFileSync(new URL(p,root));
const sha=b=>createHash('sha256').update(b).digest('hex');
// Historical ee5353ec migration fixture; the current crown integration has its own gate.
const cfgBytes=read('tests/fixtures/taihe-furniture-registry.json');
assert.equal(sha(cfgBytes),'7f92749a449b7217c7ffe2edb381a2502bc909d2d4b716c6934b424129ef7b48');
const cfg=JSON.parse(cfgBytes);
const manifest=JSON.parse(read('docs/current-state/taihe-furniture/SOURCE-MANIFEST.json'));
const baseBytes=read(manifest.baselineAsset), bytes=read('public'+cfg.model);
const base=decode(baseBytes), actual=decode(bytes);
const BASE_SHA='9067bcce8b91f719a5e39ca1cfc2a1d1c5c013d5fcd4488dc92ee920ada7015d';
const MASK_SHA='dc4cf61f8441280347c8bd292d163f5465624f6cbf50513a30fb1b9c9018f287';
const maskBytes=read('assets-src/interiors/taihe_furniture/retired_throne_back_faces.json'), mask=JSON.parse(maskBytes);
const expectedCounts={taihe_gold:240,taihe_dark_gold:24,taihe_lacquer:32};
const keys=['furnitureSourceSHA256','furnitureBaseAssetSHA256','furnitureIntegrationSHA256','furnitureRetirementSHA256','furnitureMaskSHA256','furnitureTriangles','furnitureRemovedTriangles'];
const opts={cwd:root,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},maxBuffer:8*1024*1024,timeout:30000};
const without=(o,ks)=>Object.fromEntries(Object.entries(o).filter(([k])=>!ks.includes(k)));
const equal=(a,b,label)=>assert.ok(a.equals(b),label+' exact bytes/order');
function views(buffer,gltf){const start=28+buffer.readUInt32LE(12);return gltf.bufferViews.map(v=>buffer.subarray(start+(v.byteOffset??0),start+(v.byteOffset??0)+v.byteLength));}
const beforeViews=views(baseBytes,base.gltf), nowViews=views(bytes,actual.gltf);

// Independent raw-index expectation; never calls the migration under test.
function retiredViews(){
  assert.equal(sha(baseBytes),BASE_SHA);assert.equal(sha(maskBytes),MASK_SHA);
  const expected=beforeViews.map(v=>Buffer.from(v));
  assert.equal(mask.triangles.length,296);assert.equal(mask.parts.length,17);
  assert.ok(mask.parts.every(n=>n.startsWith('throne_back')));
  assert.deepEqual(mask.parts,[...new Set(mask.triangles.map(r=>r.part))].sort());
  for(const[material,count]of Object.entries(expectedCounts)){
    const info=mask.materials[material],p=base.gltf.meshes[info.mesh].primitives[info.primitive];
    assert.equal(base.gltf.materials[p.material].name,material);assert.equal(p.indices,info.indexAccessor);
    const a=base.gltf.accessors[p.indices],pos=base.gltf.accessors[p.attributes.POSITION];
    const size={5123:2,5125:4}[a.componentType],stream=beforeViews[a.bufferView];
    assert.ok(size);assert.equal(a.count,info.originalTriangles*3);
    const index=i=>size===2?stream.readUInt16LE(i*size):stream.readUInt32LE(i*size);
    const rows=mask.triangles.filter(r=>r.material===material),removed=new Set(rows.map(r=>r.triangleOrdinal));
    assert.equal(rows.length,count);assert.equal(removed.size,count);
    for(const row of rows){const ids=[0,1,2].map(k=>index(row.triangleOrdinal*3+k));assert.deepEqual(ids,row.indices);assert.equal(sha(Buffer.concat(ids.map(i=>beforeViews[pos.bufferView].subarray(i*12,i*12+12)))),row.positionSHA256);}
    expected[a.bufferView]=Buffer.concat(Array.from({length:info.originalTriangles},(_,i)=>i).filter(i=>!removed.has(i)).map(i=>stream.subarray(i*3*size,(i+1)*3*size)));
  }
  return expected;
}

test('frozen historical furniture asset pins source/base/mask and preserves original budgets',()=>{
  assert.equal(manifest.schema,'taihe-furniture-detail-1');assert.equal(manifest.baselineSHA256,BASE_SHA);
  assert.equal(sha(bytes),cfg.asset.sha256);assert.equal(sha(bytes),manifest.asset.sha256);
  assert.equal(bytes.length,manifest.asset.encodedBytes);assert.equal('public'+cfg.model,manifest.asset.path);
  assert.deepEqual(Object.keys(manifest.identity),keys);
  for(const[file,hash]of Object.entries(manifest.sources))assert.equal(sha(read(file)),hash,file);
  for(const key of keys){assert.equal(actual.contract[key],manifest.identity[key]);assert.equal(cfg.asset[key],manifest.identity[key]);}
  assert.equal(manifest.identity.furnitureBaseAssetSHA256,BASE_SHA);assert.equal(manifest.identity.furnitureTriangles,2980);assert.equal(manifest.identity.furnitureRemovedTriangles,296);
  assert.equal(actual.triangles.length,14582-296+2980);assert.equal(cfg.asset.renderableTriangles,17266);assert.equal(cfg.budget.tris,18000);
  assert.equal(actual.gltf.meshes.length,8);assert.equal(actual.gltf.materials.length,8);
  assert.equal(manifest.fallback.changed,false);assert.equal(manifest.fallback.renderableTriangles,1596);assert.equal(manifest.fallback.visibleBatches,8);
});

test('all old attributes and retained index order survive; only bounded gold tails append',()=>{
  const expected=retiredViews(),append=new Map(manifest.accessorPrefixes.map(r=>[base.gltf.accessors[r.accessor].bufferView,r]));
  assert.equal(append.size,7);assert.equal(nowViews.length,beforeViews.length);
  for(let i=0;i<expected.length;i++){
    equal(nowViews[i].subarray(0,expected[i].length),expected[i],'view '+i);
    const row=append.get(i);
    if(row){assert.equal(row.retainedBytes,expected[i].length);assert.equal(row.retainedSHA256,sha(expected[i]));assert.equal(nowViews[i].length,row.retainedBytes+row.addedBytes);}
    else equal(nowViews[i],expected[i],'untouched view '+i);
    assert.deepEqual(without(actual.gltf.bufferViews[i],['byteOffset','byteLength']),without(base.gltf.bufferViews[i],['byteOffset','byteLength']));
  }
  const altered=new Set([...manifest.accessorPrefixes.map(r=>r.accessor),...Object.values(mask.materials).map(r=>r.indexAccessor)]);
  base.gltf.accessors.forEach((a,i)=>assert.deepEqual(altered.has(i)?without(actual.gltf.accessors[i],['count','min','max']):actual.gltf.accessors[i],altered.has(i)?without(a,['count','min','max']):a));
  for(const key of ['materials','meshes','scenes','scene'])assert.deepEqual(actual.gltf[key],base.gltf[key]);
  assert.deepEqual(actual.gltf.nodes.filter(n=>n.name!=='TAIHE_CORE_CONTRACT'),base.gltf.nodes.filter(n=>n.name!=='TAIHE_CORE_CONTRACT'));
  for(const[key,value]of Object.entries(base.contract))if(key!=='inventory')assert.deepEqual(actual.contract[key],value,key);
  assert.deepEqual(actual.inventory,[...base.inventory.filter(r=>!mask.parts.includes(r.name)),...manifest.appendedInventory]);
  assert.ok(!actual.inventory.some(r=>r.name.startsWith('throne_back')));
});

test('appended positions/normals reproduce authored data and neutral gold UVs',()=>{
  const code="import sys,json;sys.path.insert(0,'assets-src/interiors');from taihe_furniture.geometry import build_candidate;from taihe_caisson.geometry import material_batches;print(json.dumps(material_batches(build_candidate(json.load(open('data/architecture/taihe-core.json'))))))";
  const result=spawnSync('python',['-c',code],{...opts,encoding:'utf8'});assert.equal(result.status,0,result.stderr||result.error?.message);
  const authored=JSON.parse(result.stdout);
  for(const row of manifest.accessorPrefixes){
    const a=actual.gltf.accessors[row.accessor],tail=nowViews[a.bufferView].subarray(row.retainedBytes),key=row.material==='taihe_gold'?'gold':'darkGold';
    if(row.semantic==='INDICES'){
      const p=base.gltf.meshes.flatMap(m=>m.primitives).find(p=>base.gltf.materials[p.material].name===row.material);
      const offset=base.gltf.accessors[p.attributes.POSITION].count,size={5123:2,5125:4}[a.componentType];assert.ok(size);
      const expected=Buffer.alloc(authored[key].indices.length*size);authored[key].indices.forEach((v,i)=>size===2?expected.writeUInt16LE(v+offset,i*size):expected.writeUInt32LE(v+offset,i*size));equal(tail,expected,row.material+' appended indices');continue;
    }
    const values=row.semantic==='POSITION'?authored[key].position:row.semantic==='NORMAL'?authored[key].normal:Array(authored[key].position.length/3*2).fill(0);
    const expected=Buffer.alloc(values.length*4);values.forEach((v,i)=>expected.writeFloatLE(v,i*4));equal(tail,expected,row.material+' '+row.semantic);
  }
  for(const material of ['taihe_gold','taihe_dark_gold']){
    const old=base.triangles.filter(t=>t.material===material),added=actual.triangles.filter(t=>t.material===material).slice(old.length-expectedCounts[material]);
    for(const t of added){const tri=new THREE.Triangle(...t.vertices.map(v=>new THREE.Vector3(...v.POSITION)));assert.ok(tri.getArea()>1e-10);const n=tri.getNormal(new THREE.Vector3());for(const v of t.vertices){assert.ok([...v.POSITION,...v.NORMAL].every(Number.isFinite));assert.ok(new THREE.Vector3(...v.NORMAL).distanceTo(n)<1e-4);if(material==='taihe_gold')assert.deepEqual(v.TEXCOORD_0,[0,0]);}}
  }
});

test('open narrow back stays at published height; every nonretired inventory bound is unchanged',()=>{
  const item=name=>actual.inventory.find(r=>r.name===name),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5);
  const panel=item('furniture_throne_central_panel');near(panel.max[0]-panel.min[0],.58);near(item('furniture_throne_crown').max[1],3.995);
  for(const row of base.inventory.filter(r=>!r.name.startsWith('throne_back')))assert.deepEqual(item(row.name),row);
  assert.equal(manifest.appendedInventory.filter(r=>/^furniture_screen_\d_register_frames$/.test(r.name)).length,7);
  for(const row of manifest.appendedInventory){assert.ok(row.min[0]>=-2.1&&row.max[0]<=2.1);assert.ok(row.min[1]>=2.06&&row.max[1]<=5.86+1e-8);assert.ok(row.min[2]>10.7&&row.max[2]<13.5);}
  assert.match(manifest.geometry.limitations.join(' '),/Fallback remains coarse/);assert.match(manifest.geometry.dimensions,/estimates/);
});

test('actual loader accepts candidate and rejects absent/changed furniture identities',async()=>{
  const scene=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length),'')).scene;
  assert.deepEqual(validateTaiheCore(scene,cfg),{triangles:17266,meshes:8});
  const c=scene.getObjectByName('TAIHE_CORE_CONTRACT').userData;
  for(const key of keys){const old=c[key];delete c[key];assert.throws(()=>validateTaiheCore(scene,cfg),/furniture identity/);c[key]=typeof old==='number'?old+1:'changed';assert.throws(()=>validateTaiheCore(scene,cfg),/furniture identity/);c[key]=old;}
});

test('standalone builder reproduces exact asset and manifest without writing fallback',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'taihe-furniture-'));
  try{const result=spawnSync('python',['assets-src/interiors/build_taihe_furniture.py',dir],opts);assert.equal(result.status,0,result.stderr?.toString()||result.error?.message);equal(fs.readFileSync(path.join(dir,manifest.asset.path)),bytes,'rebuild');equal(fs.readFileSync(path.join(dir,'docs/current-state/taihe-furniture/SOURCE-MANIFEST.json')),read('docs/current-state/taihe-furniture/SOURCE-MANIFEST.json'),'manifest');assert.equal(fs.existsSync(path.join(dir,'src')),false);assert.equal(sha(read(manifest.baselineAsset)),BASE_SHA);}finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('finite runtime source reversal rejects unrelated bytes and duplicated identity loop',()=>{
  const name='src/scene/interior/TaiheCoreContract.js',current=restorePreScreenCrownsSource(name,read(name)),text=current.toString();
  const fixture=JSON.parse(read('tests/fixtures/taihe-furniture-source-delta.json')),row=fixture.files[name];assert.equal(sha(current),row.candidateSHA256);assert.equal(row.deltas.length,1);
  const restored=restorePreFurnitureSource(name,current);assert.notEqual(sha(restored),sha(current));
  assert.equal(sha(restored),row.baselineSHA256);assert.notEqual(sha(Buffer.from(text.replace(row.deltas[0].after,row.deltas[0].before))),row.candidateSHA256);
  assert.throws(()=>restorePreFurnitureSource(name,Buffer.from(text+'\n// unrelated mutation\n')));
  const line=text.split('\n').find(s=>s.includes("throw new Error('Taihe furniture identity mismatch')"));assert.ok(line);
  assert.throws(()=>restorePreFurnitureSource(name,Buffer.from(text.replace(line,line+'\n'+line))));
});
