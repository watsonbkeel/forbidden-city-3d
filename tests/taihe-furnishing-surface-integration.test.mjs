import {historicalR32ModuleURL} from './lib/historical-r32-scene-dependencies.mjs';
import {restoreR33SourceIfPresent} from './lib/r33-source-retention.mjs';
const {validateTaiheCore}=await import(historicalR32ModuleURL('src/scene/interior/TaiheCoreContract.js'));
import {restorePreR7Beams} from './lib/r7-taihe-beam-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {validateTaiheCore as validateLiveTaiheCore} from '../src/scene/interior/TaiheCoreContract.js';
import {TAIHE_FURNISHING_TILES} from '../src/scene/palace/special/TaiheFurnishingSurface.js';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root));
const sha=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(read('docs/current-state/taihe-furnishing-surfaces/SOURCE-MANIFEST.json'));
const bytes=read(manifest.asset.path),cfg=JSON.parse(restoreR33SourceIfPresent('data/interiors/taihe.json',read('data/interiors/taihe.json')));
const candidateCfg={...cfg,asset:{...cfg.asset,...manifest.identity,...manifest.asset}};
const parse=async()=>new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length),'');
const keys=Object.keys(manifest.identity);
const decode=b=>{const n=b.readUInt32LE(12),g=JSON.parse(b.toString('utf8',20,20+n));return{g,views:g.bufferViews.map(v=>b.subarray(28+n+(v.byteOffset??0),28+n+(v.byteOffset??0)+v.byteLength))};};

test('new asset has exact frozen triangle/normal geometry, 40 owned rebindings and eight batches',async()=>{
 assert.equal(sha(bytes),manifest.asset.sha256);assert.equal(bytes.length,manifest.asset.encodedBytes);
 for(const[p,s]of Object.entries(manifest.sources))assert.equal(sha(restorePreR7Beams(p,read(p))),s,p);
 const result=await parse();assert.throws(()=>validateTaiheCore(result.scene,candidateCfg),/Taihe dais front identity mismatch/,'pre-dais asset is correctly rejected by frozen R32 runtime');
 const c=manifest.comparison;assert.equal(c.reboundTriangles,40);assert.equal(c.bufferBytesAdded,3840);assert.ok(c.bufferBytesAdded<=16384);assert.equal(c.positionNormalTriangleMultisetBefore,c.positionNormalTriangleMultisetAfter);
 const old=decode(read(manifest.baselineAsset)),now=decode(bytes);assert.deepEqual(now.g.materials,old.g.materials);assert.deepEqual(now.g.images,old.g.images);assert.deepEqual(now.g.textures,old.g.textures);
 const mask=JSON.parse(read('assets-src/interiors/taihe_furnishing_surface/selected_faces.json'));assert.equal(mask.triangles.length,40);assert.ok(mask.proof.uniqueSourceOwner&&mask.proof.uniqueBaselineMatch);assert.equal(mask.proof.maximumCoordinateError,0);
 // Independent decoded-byte checks: do not trust the builder receipt alone.
 const indices=(d,p)=>{const a=d.g.accessors[p.indices],b=d.views[a.bufferView],w=a.componentType===5123?2:4;return Array.from({length:a.count},(_,i)=>w===2?b.readUInt16LE(i*w):b.readUInt32LE(i*w));};
 const triangleRows=d=>d.g.meshes.flatMap((m,mi)=>{const p=m.primitives[0],pos=d.views[d.g.accessors[p.attributes.POSITION].bufferView],norm=d.views[d.g.accessors[p.attributes.NORMAL].bufferView],ids=indices(d,p),node=d.g.nodes.find(n=>n.mesh===mi),frame=JSON.stringify([node.translation,node.rotation,node.scale,node.matrix]);return Array.from({length:ids.length/3},(_,j)=>frame+sha(Buffer.concat(ids.slice(j*3,j*3+3).flatMap(i=>[pos.subarray(i*12,i*12+12),norm.subarray(i*12,i*12+12)]))));}).sort();
 assert.deepEqual(triangleRows(now),triangleRows(old),'all positions, normals, winding and placement are unchanged independent of material');
 for(let mi=0;mi<old.g.meshes.length;mi++){
  const p=old.g.meshes[mi].primitives[0],q=now.g.meshes[mi].primitives[0],name=old.g.materials[p.material].name;
  assert.deepEqual(q,p,'primitive identity retained');
  for(const ai of Object.values(p.attributes)){const vi=old.g.accessors[ai].bufferView;assert.ok(now.views[vi].subarray(0,old.views[vi].length).equals(old.views[vi]),name+' exact original attribute bytes');if(name!=='taihe_glyph_atlas')assert.equal(now.views[vi].length,old.views[vi].length);}
  const removed=new Set(mask.triangles.filter(r=>r.mesh===mi).map(r=>r.triangleOrdinal)),beforeIds=indices(old,p),afterIds=indices(now,q),retained=beforeIds.filter((_,i)=>!removed.has(Math.floor(i/3)));
  assert.deepEqual(afterIds.slice(0,retained.length),retained,name+' retained indices exact');if(name!=='taihe_glyph_atlas')assert.equal(afterIds.length,retained.length);
 }
 const glyph=result.scene.children.find(o=>o.isMesh&&o.material.name==='taihe_glyph_atlas');assert.equal(glyph.geometry.index.count/3,46);
 const uv=glyph.geometry.attributes.uv;const ids=glyph.geometry.index.array;
 for(const move of c.moves){const t=TAIHE_FURNISHING_TILES[move.tile];for(let k=0;k<3;k++){const id=ids[move.glyphTriangleOrdinal*3+k],u=uv.getX(id),v=uv.getY(id);assert.ok(u>=t.x/1024-1e-6&&u<=(t.x+t.width)/1024+1e-6);assert.ok(v>=1-(t.y+t.height)/1024-1e-6&&v<=1-t.y/1024+1e-6);assert.ok(Math.abs(u-move.uv[k][0])<1e-6&&Math.abs(v-move.uv[k][1])<1e-6);}}
 for(const row of c.buffers){assert.equal(sha(old.views[row.bufferView]),row.beforeSHA256);assert.equal(sha(now.views[row.bufferView]),row.afterSHA256);}
});

for(const key of keys)for(const target of ['asset','registry'])test(`furnishing ${target} ${key} missing fails closed`,async()=>{
 const {scene}=await parse(),registry=structuredClone(candidateCfg);
 const subject=target==='asset'?scene.getObjectByName('TAIHE_CORE_CONTRACT').userData:registry.asset;delete subject[key];
 assert.throws(()=>validateTaiheCore(scene,registry),/Taihe furnishing surface identity mismatch/);
});

test('historical asset and material manifest rebuild exactly without Blender',()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'taihe-surface-build-'));
 try{
 // Isolated historical inputs: never overwrite the live R33 profile. Keep the
 // source-semantic hash gate and every original manifest assertion unchanged.
 const input=path.join(out,'input'),output=path.join(out,'output');
 const mask=JSON.parse(read('assets-src/interiors/taihe_furnishing_surface/selected_faces.json'));
 const files=new Set([...Object.keys(mask.sources),...Object.keys(manifest.sources),manifest.baselineAsset,
  'assets-src/interiors/append_taihe_caisson.py','assets-src/interiors/taihe_furniture/derive_retirement.py']);
 for(const p of files){const target=path.join(input,p);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,restoreR33SourceIfPresent(p,read(p)));}
 const result=spawnSync('python',['assets-src/interiors/build_taihe_furnishing_surface.py',output],{cwd:input,encoding:'utf8',timeout:10000});assert.equal(result.status,0,result.stderr);assert.ok(fs.readFileSync(path.join(output,manifest.asset.path)).equals(bytes));const rebuilt=JSON.parse(fs.readFileSync(path.join(output,'docs/current-state/taihe-furnishing-surfaces/SOURCE-MANIFEST.json')));const changed='src/scene/palace/special/TaiheCore.js';assert.equal(rebuilt.sources[changed],sha(read(changed)));rebuilt.sources[changed]=sha(restorePreR7Beams(changed,read(changed)));assert.deepEqual(rebuilt,manifest);}finally{fs.rmSync(out,{recursive:true,force:true});}
});

test('raw current runtime rejects the historical furnishing asset before deeper semantic validation',async()=>{
 const {scene}=await parse(),liveCfg=JSON.parse(read('data/interiors/taihe.json'));
 assert.throws(()=>validateLiveTaiheCore(scene,liveCfg),/Taihe core revision mismatch/);
});
