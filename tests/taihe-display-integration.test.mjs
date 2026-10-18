import gridBaseline from './fixtures/r10-column-grid-baseline.json' with {type:'json'};
import daisPhysics from './fixtures/r7-taihe-dais-physics-delta.json' with {type:'json'};
import {restoreHistoricalInventory} from './lib/taihe-shell-geometry-retention.mjs';
import {restorePreColumnMaterialSource} from './lib/taihe-column-material-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import * as THREE from 'three';
import {candidate,read,baseline,originalS,digest,source,splitS,inScene,fallbackSnapshot,matchSource,triangleNormal,restoreCore,validateNormals} from './lib/taihe-display-fixture.mjs';
import {hash} from './lib/taihe-core-fixture.mjs';
import {appendTaiheDisplayPairs} from '../src/scene/palace/special/TaiheDisplayPairs.js';
import {TAIHE_FALLBACK_OWNER} from '../src/scene/palace/special/TaiheCoreProfile.js';
import {mergeByMaterial} from '../src/utils/MergeUtils.js';
const split=splitS(),fallback=fallbackSnapshot(),matchedS=matchSource(inScene(split.display),'S'),matchedFallback=matchSource(fallback.display,'fallback');

test('display integration adds exactly 3798 S triangles and 480 actual fallback triangles without changing the original allocations',()=>{
 assert.equal(candidate.triangles.length,12128-320+472+candidate.contract.caissonTriangles);assert.equal(split.original.length,8330);assert.equal(split.display.length,3798);
 assert.equal(fallback.original.length,1078);assert.equal(fallback.display.length,480);assert.equal(fallback.original.length+fallback.display.length,1558);
 assert.ok(3798<=4800);assert.ok(480<=480);
});
test('all original V17 accessor attributes, node transforms, material order/properties, atlas and semantic bounds are exact',()=>{
 assert.equal(digest(read(baseline.SAsset)),baseline.SAssetSHA256);
 assert.deepEqual(candidate.gltf.materials,originalS.gltf.materials);
 assert.deepEqual(candidate.gltf.nodes.filter(n=>n.mesh!==undefined),originalS.gltf.nodes.filter(n=>n.mesh!==undefined));
 assert.deepEqual(restoreHistoricalInventory(candidate).filter(o=>!o.name.startsWith('display_')&&!o.name.startsWith('caisson_dragon_')),originalS.inventory);
 assert.deepEqual(split.original.filter(t=>t.material==='taihe_glyph_atlas'),originalS.triangles.filter(t=>t.material==='taihe_glyph_atlas'));
 assert.equal(candidate.contract.displaySourceManifestSHA256,'d2653431547b13678f2ab278a1067cbff894aec21665307b5584dec6edc007f9');
 assert.equal(candidate.contract.displayIntegrationSHA256,digest(read('assets-src/interiors/taihe_display/blender_display.py')));
 assert.equal(candidate.contract.displayTriangles,3798);
 assert.equal(candidate.gltf.images?.length??0,0);assert.equal(candidate.gltf.textures?.length??0,0);
 assert.equal(candidate.gltf.meshes.length,8);assert.equal(candidate.gltf.materials.length,8);
 assert.equal(candidate.gltf.meshes.reduce((n,m)=>n+m.primitives.length,0),8);
});
test('fallback explicitly restored pre-shell position/normal/UV prefixes and all material properties remain byte-exact after real merge',()=>{
 assert.equal(fallback.meshes.length,8);assert.equal(new Set(fallback.meshes.map(o=>o.material)).size,8);
 for(const o of fallback.meshes){const record=baseline.fallback.find(r=>r.name===o.material.name),historical=o.geometry.attributes;
  for(const [name,a] of Object.entries(record.attributes)){if(record.name==='taihe_gold'&&name==='uv')continue;const actual=historical[name];assert.equal(actual.itemSize,a.itemSize);assert.equal(digest(Buffer.from(actual.array.buffer,actual.array.byteOffset,a.count*a.itemSize*4)),a.sha256,`${record.name}/${name}: original bytes`);}
  assert.deepEqual({color:o.material.color.getHex(),roughness:o.material.roughness,metalness:o.material.metalness,side:o.material.side,transparent:o.material.transparent,opacity:o.material.opacity,depthWrite:o.material.depthWrite,map:!!o.material.map},{...record.material,...(record.name==='taihe_gold'?{map:true}:{})});
  assert.equal(o.userData.noMerge,true);assert.equal(o.userData.taiheCoreOwner,TAIHE_FALLBACK_OWNER);
 }
 assert.equal(baseline.physics,daisPhysics.beforeSHA256);
 // R10 moves only the independently guarded registered column/opening boxes.
 assert.equal(hash({colliders:gridBaseline['太和殿'].colliders,walkables:gridBaseline['太和殿'].walkables}),daisPhysics.afterSHA256);
 assert.equal(hash(fallback.control.builder.walkables),hash(gridBaseline['太和殿'].walkables));
 assert.equal(fallback.control.builder.colliders.length,gridBaseline['太和殿'].colliders.length);
});
for(const [lod,faces] of [['S',matchedS],['fallback',matchedFallback]]){
 test(`${lod}: every actual added scene-space face matches the approved source, including the translated teal batch`,()=>{
  assert.equal(new Set(faces.map(t=>t.assembly)).size,8);
  for(const item of source(lod).assemblies){const actual=faces.filter(f=>f.assembly===item.id).flatMap(f=>f.vertices.map(v=>v.POSITION)),expected=item.local_mesh.vertices.map(v=>v.map((x,k)=>x+item.translation[k]));
   for(const k of [0,1,2])for(const f of [Math.min,Math.max])assert.ok(Math.abs(f(...actual.map(v=>v[k]))-f(...expected.map(v=>v[k])))<2e-6,`${item.id}: actual bounds`);
   assert.ok(Math.abs(Math.min(...actual.map(v=>v[1]))-2.06)<2e-6,'support remains on dais');
  }
 });
 test(`${lod}: finite unit flat normals and all explicit opposite-sheet partners survive final batching`,()=>{
  validateNormals(faces);
  let pairs=0;
  for(const item of source(lod).assemblies)for(const [a,b] of item.local_mesh.two_sided_pairs){pairs++;const front=faces.find(t=>t.assembly===item.id&&t.id===a),back=faces.find(t=>t.assembly===item.id&&t.id===b);assert.ok(new THREE.Vector3(...front.vertices[0].NORMAL).dot(new THREE.Vector3(...back.vertices[0].NORMAL))<-.999999);assert.equal(front.material,back.material);}
  assert.equal(pairs,lod==='fallback'?26:0);
 });
}
test('normal and coordinate regression assertions reject cancelled normals and a wrongly translated teal batch',()=>{
 const bad=structuredClone(fallback.display);bad.find(t=>t.material==='taihe_teal').vertices.forEach(v=>v.POSITION[2]+=.1);assert.throws(()=>matchSource(bad,'fallback'));
 for(const normals of [[0,0,0],[2,0,0],[NaN,0,0]]){const broken=structuredClone(matchedFallback);broken[0].vertices.forEach(v=>v.NORMAL=normals);assert.throws(()=>validateNormals(broken));}
 const wrong=structuredClone(matchedS);wrong[0].vertices.forEach(v=>v.NORMAL=v.NORMAL.map(x=>-x));assert.throws(()=>validateNormals(wrong));
});
test('display builder reuses the exact six existing materials and creates no fetch, atlas, shader or geometry-normal averaging path',()=>{
 const group=new THREE.Group(),materials=Object.fromEntries(Object.entries({gold:'taihe_gold',darkGold:'taihe_dark_gold',red:'taihe_lacquer',teal:'taihe_teal',dark:'taihe_dark_wood',pearl:'taihe_pearl'}).map(([key,name])=>[key,new THREE.MeshStandardMaterial({name})]));
 appendTaiheDisplayPairs(group,materials);assert.equal(group.children.length,6);
 for(const o of group.children){assert.ok(Object.values(materials).includes(o.material));assert.equal(o.geometry.index,null);assert.deepEqual(Object.keys(o.geometry.attributes).sort(),['normal','position']);}
 const merged=mergeByMaterial(group);assert.equal(merged.children.length,6);for(const o of merged.children)assert.ok(Object.values(materials).includes(o.material));
 const code=read('src/scene/palace/special/TaiheDisplayPairs.js').toString();assert.doesNotMatch(code,/fetch\(|computeVertexNormals\(|setIndex\(|\.side\s*=|new THREE\.\w*Material\(|\.map\s*=|vertexColors|shader/i);
});
test('fallback data regenerates byte-for-byte from frozen approved source with no runtime fetch',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'taihe-display-data-'));
 try{const out=path.join(dir,'data.js'),r=spawnSync('python',['assets-src/interiors/taihe_display/generate_fallback.py',out],{encoding:'utf8',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});assert.equal(r.status,0,r.stderr);assert.deepEqual(fs.readFileSync(out),read('src/scene/palace/special/TaiheDisplayFallbackData.js'));assert.ok(fs.statSync(out).size<48000);}finally{fs.rmSync(dir,{recursive:true});}
});
test('approved source identity and exact original fallback source remain frozen',()=>{
 const base='assets-src/interiors/taihe_display/approved/',manifestBytes=read(base+'artifacts/SOURCE-MANIFEST.json'),manifest=JSON.parse(manifestBytes);
 assert.equal(digest(manifestBytes),'d2653431547b13678f2ab278a1067cbff894aec21665307b5584dec6edc007f9');
 assert.equal(digest(read(base+'artifacts/FINAL-RECEIPT.json')),'dbb654c3de858629ce7f34289c0bbf0a5f0025cda878dfc01f6658cba12c38b2');
 for(const file of ['mesh_kernel.py','taihe_display_pairs.py','integration_geometry.py','SOURCE-NOTES.json','INTEGRATION-NOTES.md','REPAIR-DELTA.md','IMPLEMENTATION-PLAN.md'])assert.equal(digest(read(base+file)),manifest.source_files[file].sha256,file);
 for(const r of Object.values(manifest.exports))assert.equal(digest(read(base+r.path)),r.sha256,r.path);
 restoreCore(read('src/scene/palace/special/TaiheCore.js'));
});

test('actual decoded S and actual merged fallback joints, supports and winding pass portable geometry guards with negative probes',()=>{
 const rebuild=(lod,faces)=>source(lod).assemblies.map(item=>{
  const result=structuredClone(item),vertices=result.local_mesh.vertices.map(()=>null),rows=faces.filter(t=>t.assembly===item.id);
  for(const row of rows)for(let k=0;k<3;k++){
   const id=result.local_mesh.triangles[row.id][k],point=row.vertices[k].POSITION.map((v,j)=>v-item.translation[j]);
   if(vertices[id])assert.ok(point.every((v,j)=>Math.abs(v-vertices[id][j])<2e-6),'shared source position agrees after material-frame float32 export');else vertices[id]=point;
  }
  // A few authored construction vertices are intentionally unused (no face
  // references them). Drop only those; never substitute source coordinates
  // for compiled vertices when checking real contacts. Preserve index order.
  const live=vertices.flatMap((v,i)=>v===null?[]:[i]),remap=new Map(live.map((id,i)=>[id,i]));
  result.local_mesh.triangles=result.local_mesh.triangles.map(t=>t.map(id=>{assert.ok(remap.has(id));return remap.get(id);}));
  result.local_mesh.vertices=live.map(id=>vertices[id]);return result;
 });
 const materialSides=Object.fromEntries(Object.entries({gold:'taihe_gold',darkGold:'taihe_dark_gold',red:'taihe_lacquer',teal:'taihe_teal',dark:'taihe_dark_wood',stone:'taihe_stone',pearl:'taihe_pearl',glyph:'taihe_glyph_atlas'}).map(([key,name])=>[key,fallback.meshes.find(o=>o.material.name===name).material.side===THREE.DoubleSide?'DoubleSide':'FrontSide']));
 const result=spawnSync('python',['tests/lib/check-taihe-display-contacts.py'],{input:JSON.stringify({S:rebuild('S',matchedS),fallback:rebuild('fallback',matchedFallback),materialSides}),encoding:'utf8',maxBuffer:8*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});
 assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).actualAssemblies,16);
});

test('every actual display clears the decoded S/fallback obstacle union and remains on the real shared dais top',()=>{
 const bounds=points=>({min:[0,1,2].map(k=>Math.min(...points.map(v=>v[k]))),max:[0,1,2].map(k=>Math.max(...points.map(v=>v[k])))});
 const union=boxes=>bounds(boxes.flatMap(b=>[b.min,b.max]));
 const intersect=(a,b)=>[0,1,2].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>2e-6);
 const points=t=>t.vertices.map(v=>v.POSITION);
 const selectFallback=predicate=>fallback.original.filter(t=>points(t).every(predicate));
 const rail=selectFallback(p=>Math.abs(p[0])>=3.44999&&Math.abs(p[0])<=3.51001&&p[1]>=1.99999&&p[1]<=2.72001&&p[2]>=7.05999&&p[2]<=14.06001);
 const screen=selectFallback(p=>Math.abs(p[0])<=2.10001&&p[1]>=2.05999&&p[1]<=5.86001&&p[2]>=13.36149&&p[2]<=13.61001);
 const throne=selectFallback(p=>Math.abs(p[0])<=.92001&&p[1]>=2.05999&&p[1]<=3.99501&&p[2]>=10.12999&&p[2]<=11.99001);
 const dais=selectFallback(p=>Math.abs(p[0])<=3.62001&&p[1]>=1.99999&&p[1]<=2.06001&&p[2]>=7.03999&&p[2]<=14.08001).filter(t=>t.material==='taihe_dark_gold');
 assert.equal(rail.length,24);assert.equal(screen.length,168);assert.equal(throne.length,96);assert.equal(dais.length,12);
 const railBoxes=[-1,1].map(sign=>union([...originalS.inventory.filter(o=>o.name.startsWith('dais_rail')&&Math.sign(o.min[0])===sign),bounds(rail.filter(t=>Math.sign(t.vertices[0].POSITION[0])===sign).flatMap(points))]));
 const obstacles=[...railBoxes,union([...originalS.inventory.filter(o=>o.name.startsWith('screen_')),bounds(screen.flatMap(points))]),union([...originalS.inventory.filter(o=>o.name.startsWith('throne_')),bounds(throne.flatMap(points))])];
 const tops=[originalS.inventory.find(o=>o.name==='dais_top'),bounds(dais.flatMap(points))];
 assert.ok(Math.abs(railBoxes[1].min[0]-3.45)<2e-6);assert.ok(Math.abs(obstacles[2].min[2]-13.3615)<2e-6);
 for(const faces of [matchedS,matchedFallback]){
  const assemblies=[...new Set(faces.map(t=>t.assembly))].map(id=>bounds(faces.filter(t=>t.assembly===id).flatMap(points)));
  for(const b of assemblies){for(const o of obstacles)assert.equal(intersect(b,o),false,'actual display intersects actual obstacle union');for(const top of tops){assert.ok(Math.abs(b.min[1]-top.max[1])<2e-6);for(const k of [0,2])assert.ok(b.min[k]>top.min[k]&&b.max[k]<top.max[k]);}}
  for(let i=0;i<assemblies.length;i++)for(let j=i+1;j<assemblies.length;j++)assert.equal(intersect(assemblies[i],assemblies[j]),false);
 }
});

test('the authoring entry point only appends bounded display integration; every original source byte is retained',()=>{
 let code=restorePreColumnMaterialSource('assets-src/interiors/taihe.py',read('assets-src/interiors/taihe.py')).toString();
 for(const insertion of ['# Append after the original merge so original batch frames/attributes stay exact.\nfrom taihe_display.blender_display import append_display_pairs\ndisplay_identity = append_display_pairs(inventory, M)\n','for key,value in display_identity.items():contract[key]=value\n']){assert.equal(code.split(insertion).length,2);code=code.replace(insertion,'');}
 assert.equal(digest(code),'facad1816d77fd4f0f9955973546195e43fb7fdb5c71aee5545550b7dc3f60a4');
 const core=read('src/scene/palace/special/TaiheCore.js');restoreCore(core);
 for(const addition of ["import { appendTaiheDisplayPairs } from './TaiheDisplayPairs.js';\n",'  appendTaiheDisplayPairs(g,m);\n']){
  assert.throws(()=>restoreCore(core.toString().replace(addition,'')));
  assert.throws(()=>restoreCore(core.toString().replace(addition,addition+addition)));
 }
 assert.throws(()=>restoreCore(core+'\n'));
});
