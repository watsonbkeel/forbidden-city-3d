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
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root));
const sha=b=>createHash('sha256').update(b).digest('hex');
const BASE='22c6acdf581dc7779b876963fd935ee482bd22e2a6671b486f9571debc14ac19';
const manifest=JSON.parse(read('docs/current-state/taihe-enamel-cranes/SOURCE-MANIFEST.json'));
// Frozen crane migration fixture; current surface rebinding has its own integration gate.
const cfgBytes=read('tests/fixtures/taihe-enamel-cranes-registry.json');
assert.equal(sha(cfgBytes),'82acf0bc707c817af651cbe093437db21bca97df83f3af32dd6b61937f5882b2');
const cfg=JSON.parse(cfgBytes);
const beforeBytes=read('public/models/interiors/taihe-screen-crowns-22c6acdf581d.glb'),bytes=read('public'+cfg.model);
const decode=b=>{const length=b.readUInt32LE(12),gltf=JSON.parse(b.toString('utf8',20,20+length)),start=28+length;return{gltf,views:gltf.bufferViews.map(v=>b.subarray(start+(v.byteOffset??0),start+(v.byteOffset??0)+v.byteLength))};};
const old=decode(beforeBytes),now=decode(bytes),mask=JSON.parse(read('assets-src/interiors/taihe_cranes/retired_crane_faces.json'));
const keys=['enamelCraneSourceSHA256','enamelCraneBaseAssetSHA256','enamelCraneIntegrationSHA256','enamelCraneRetirementSHA256','enamelCraneMaskSHA256','enamelCraneTriangles','enamelCraneRemovedTriangles'];
const contract=g=>g.nodes.find(n=>n.name==='TAIHE_CORE_CONTRACT').extras;
const equal=(a,b,label)=>{assert.equal(a.length,b.length,label+' length');assert.ok(a.equals(b),label+' bytes');};
const parsed=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length),'');parsed.scene.updateMatrixWorld(true);
const actual=contract(now.gltf);
test('current crane bytes, source identities, original ceilings and full fallback are bound',()=>{
 assert.equal(sha(beforeBytes),BASE);assert.match(cfg.model,/taihe-enamel-cranes-[a-f0-9]{12}\.glb$/);
 assert.equal(sha(bytes),cfg.asset.sha256);assert.equal(bytes.length,cfg.asset.encodedBytes);assert.equal(manifest.asset.sha256,sha(bytes));
 for(const [p,digest]of Object.entries(manifest.sources))assert.equal(sha(read(p)),digest,p);
 for(const key of keys){assert.equal(actual[key],manifest.identity[key],key);assert.equal(cfg.asset[key],actual[key],key);}
 assert.equal(actual.enamelCraneBaseAssetSHA256,BASE);assert.equal(actual.enamelCraneRemovedTriangles,374);assert.equal(actual.enamelCraneTriangles,544);
 assert.equal(actual.enamelCraneMaskSHA256,sha(read('assets-src/interiors/taihe_cranes/retired_crane_faces.json')));
 assert.equal(cfg.asset.renderableTriangles,17940);assert.equal(cfg.budget.tris,18000);
 assert.deepEqual(validateTaiheCore(parsed.scene,cfg),{triangles:17940,meshes:8});
 const control=captureTaiheControl('太和殿'),fallback=taiheFallbackMeshes(control.group);
 assert.equal(fallback.length,8);assert.equal(fallback.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),1600);control.builder.dispose();
});
test('exact 374 selected indices retire; all old attribute bytes and other indices remain in order',()=>{
 assert.equal(mask.triangles.length,374);assert.equal(new Set(mask.triangles.map(r=>r.material+':'+r.triangleOrdinal)).size,374);
 const counts={taihe_pearl:352,taihe_teal:16,taihe_lacquer:6};
 for(const [material,count]of Object.entries(counts))assert.equal(mask.triangles.filter(r=>r.material===material).length,count);
 for(let mi=0;mi<old.gltf.meshes.length;mi++){
  const p=old.gltf.meshes[mi].primitives[0],q=now.gltf.meshes[mi].primitives[0],name=old.gltf.materials[p.material].name;
  assert.deepEqual(q,p,'primitive handles retained');
  for(const ai of Object.values(p.attributes)){const v=old.gltf.accessors[ai].bufferView;equal(now.views[v].subarray(0,old.views[v].length),old.views[v],name+' old attributes');}
  const ai=p.indices,a=old.gltf.accessors[ai],vi=a.bufferView,width=a.componentType===5123?2:4;
  const selected=new Set(mask.triangles.filter(r=>r.material===name).map(r=>r.triangleOrdinal));
  const expected=Buffer.concat(Array.from({length:a.count/3},(_,i)=>i).filter(i=>!selected.has(i)).map(i=>old.views[vi].subarray(i*3*width,(i+1)*3*width)));
  equal(now.views[vi].subarray(0,expected.length),expected,name+' exact retained index order');
  if(!(name in counts)){equal(now.views[vi],old.views[vi],name+' untouched indices');for(const idx of Object.values(p.attributes))equal(now.views[old.gltf.accessors[idx].bufferView],old.views[old.gltf.accessors[idx].bufferView],name+' untouched attribute');}
 }
});
test('node transforms, materials, textures, and every noninventory prior contract field remain exact',()=>{
 assert.deepEqual(now.gltf.materials,old.gltf.materials);assert.deepEqual(now.gltf.images,old.gltf.images);assert.deepEqual(now.gltf.textures,old.gltf.textures);
 const clean=n=>n.name==='TAIHE_CORE_CONTRACT'?{...n,extras:undefined}:n;
 assert.deepEqual(now.gltf.nodes.map(clean),old.gltf.nodes.map(clean));assert.deepEqual(now.gltf.scenes,old.gltf.scenes);
 const previous=contract(old.gltf);for(const[k,v]of Object.entries(previous))if(k!=='inventory')assert.deepEqual(actual[k],v,k);
 assert.equal(now.gltf.meshes.length,8);assert.equal(now.gltf.materials.length,8);
});
test('new appended corners match the original generator and fixed existing material frames',()=>{
 const result=spawnSync('python',['-c',"import sys,json;sys.path.insert(0,'assets-src/interiors');from build_taihe_cranes import replacement_batches;b,i,m=replacement_batches();print(json.dumps({'batches':b,'inventory':i}))"],{cwd:root,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},encoding:'utf8',timeout:10000,maxBuffer:4*1024*1024});
 assert.equal(result.status,0,result.stderr);const source=JSON.parse(result.stdout),names={pearl:'taihe_pearl',teal:'taihe_teal',red:'taihe_lacquer'};
 let smooth=0,triangles=0;
 for(const[key,b]of Object.entries(source.batches)){
  const mi=old.gltf.meshes.findIndex(m=>old.gltf.materials[m.primitives[0].material].name===names[key]),p=old.gltf.meshes[mi].primitives[0],node=old.gltf.nodes.find(n=>n.mesh===mi),translation=node.translation??[0,0,0];
  for(const[semantic,values]of [['POSITION',b.position.map((v,i)=>v-translation[i%3])],['NORMAL',b.normal]]){
   const vi=old.gltf.accessors[p.attributes[semantic]].bufferView,tail=now.views[vi].subarray(old.views[vi].length),expected=Buffer.alloc(values.length*4);values.forEach((v,i)=>expected.writeFloatLE(v,i*4));equal(tail,expected,key+' '+semantic+' append');
  }
  for(let i=0;i<b.normal.length;i+=9){const n=b.normal.slice(i,i+9);for(let j=0;j<9;j+=3)assert.ok(Math.abs(Math.hypot(...n.slice(j,j+3))-1)<1e-7);if(n.some((v,j)=>Math.abs(v-n[j%3])>1e-5))smooth++;triangles++;}
 }
 assert.equal(triangles,544);assert.ok(smooth>400,'rounded components use real varying corner normals');
});
test('new inventories match referenced scene geometry, unaffected owners are exact',()=>{
 const inventory=JSON.parse(actual.inventory),previous=JSON.parse(contract(old.gltf).inventory),removed=new Set(['display_crane:left_pearl','display_crane:right_pearl','display_crane:left_red','display_crane:right_red']);
 const partial=new Set(['display_crane:left_teal','display_crane:right_teal']);
 for(const r of previous){const current=inventory.find(q=>q.name===r.name);if(removed.has(r.name))assert.equal(current,undefined);else if(!partial.has(r.name))assert.deepEqual(current,r,r.name);else assert.ok(current.max[1]<2.27,'teal owner now contains wave base only');}
 const added=inventory.filter(r=>r.name.startsWith('enamelCrane_'));assert.equal(added.length,10);assert.equal(inventory.length,previous.length-4+10);
 const vertices=[];parsed.scene.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(const id of new Set(o.geometry.index.array))vertices.push(new THREE.Vector3().fromBufferAttribute(p,id).applyMatrix4(o.matrixWorld).toArray());}});
 for(const r of added)for(const k of [0,1,2])for(const bound of ['min','max'])assert.ok(vertices.some(p=>Math.abs(p[k]-r[bound][k])<2e-6&&p.every((v,j)=>v>=r.min[j]-2e-6&&v<=r.max[j]+2e-6)),r.name+' '+bound+k);
});
test('asset and manifest rebuild byte-identically without Blender or product side effects',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'taihe-crane-rebuild-'));
 try{const result=spawnSync('python',['assets-src/interiors/build_taihe_cranes.py',dir],{cwd:root,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024});assert.equal(result.status,0,result.stderr);equal(fs.readFileSync(path.join(dir,manifest.asset.path)),bytes,'rebuilt asset');equal(fs.readFileSync(path.join(dir,'docs/current-state/taihe-enamel-cranes/SOURCE-MANIFEST.json')),read('docs/current-state/taihe-enamel-cranes/SOURCE-MANIFEST.json'),'rebuilt manifest');}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
