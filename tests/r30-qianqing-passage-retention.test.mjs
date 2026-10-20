import {verifiedR33AddedProductPaths} from './lib/r33-product-inventory.mjs';
import {verifiedR32AddedProductPaths} from './lib/r32-product-inventory.mjs';
import {restorePreR31SurfaceCapture} from './lib/r31-qianqing-surface-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {restoreR31SourceIfPresent} from './lib/r31-flight-operations-retention.mjs';
import {r31CombinedSource, assertR31CombinedAddedSource} from './lib/r31-combined-source-retention.mjs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {library,sceneRows} from './lib/inner-palace-fixture.mjs';
import {HistoricalR29PalaceBuilder} from './lib/historical-r29-qianqing-fixture.mjs';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {captureJiaotaiScene} from './lib/r27-jiaotai-capture.mjs';
import {r29Scene,restorePreR29Capture,restorePreR29Source} from './lib/r29-qianqing-retention.mjs';
import {r30Source as S,r30Scene as G,restorePreR30Source,assertR30AddedSource,assertR30RetainedSource,restorePreR30Capture,restorePreR30SceneRow,restorePreR30SceneRows,restorePreR30MeshRows,restorePreR30GraphRows,restorePreR30Materials,restorePreR30Navigation} from './lib/r30-qianqing-passage-retention.mjs';
const root=new URL('../',import.meta.url),read=p=>restoreR31SourceIfPresent(p,fs.readFileSync(new URL(p,root)));
const sha=x=>createHash('sha256').update(x).digest('hex'),hash=x=>sha(JSON.stringify(x));
const current=restorePreR31SurfaceCapture(captureJiaotaiScene(PalaceBuilder)),previous=restorePreR30Capture(current);

test('R30 registers only the two exact integrations and new passage module; all earlier fixtures and retained product bytes are immutable',()=>{
  assert.equal(S.base,'8475e2f269b8974d8e6dab8cc0d25ae2c072ad07');
  assert.equal(S.candidate,'d5f96961e54e2666fd8520eb02e9f5916497e222');
  assert.deepEqual(Object.keys(S.files),['src/scene/PalaceBuilder.js','src/scene/palace/QianqingFrontEnclosure.js']);
  assert.deepEqual(Object.keys(S.addedFiles),['src/scene/palace/QianqingEndPassages.js']);
  for(const[p,h]of Object.entries(S.preservedFixtures))assert.equal(sha(read(p)),h,p);
  const actual=['src','data','public'].flatMap(d=>fs.readdirSync(new URL(d+'/',root),{recursive:true,withFileTypes:true}).filter(x=>x.isFile()).map(x=>path.relative(root.pathname,path.join(x.parentPath,x.name)))).sort();
  const added=Object.keys(r31CombinedSource.addedFiles).filter(p=>/^(src|data|public)\//.test(p));
  assert.deepEqual(actual,[...Object.keys(S.files),...Object.keys(S.addedFiles),...Object.keys(S.retainedFiles),...added,...verifiedR32AddedProductPaths(),...verifiedR33AddedProductPaths()].sort());
  for(const p of added)assertR31CombinedAddedSource(p,read(p));
  for(const[rows,check]of[[S.addedFiles,assertR30AddedSource],[S.retainedFiles,assertR30RetainedSource]])for(const p of Object.keys(rows)){
    const bytes=read(p);assert.equal(check(p,bytes),bytes);
    const altered=Buffer.from(bytes);altered[Math.floor(altered.length/2)]^=1;
    for(const bad of[Buffer.alloc(0),Buffer.concat([bytes,Buffer.from('\n')]),altered])assert.throws(()=>check(p,bad),p);
  }
});
test('R30 exact source reversal rejects unknown bytes, deleted/duplicated/partially reversed hunks and preserves the older source chain',()=>{
  for(const[p,d]of Object.entries(S.files)){
    const bytes=read(p),text=bytes.toString(),old=restorePreR30Source(p,bytes);
    assert.equal(sha(bytes),d.candidateSHA256);assert.equal(sha(old),d.baselineSHA256);assert.equal(restorePreR30Source(p,old),old);
    const altered=Buffer.from(bytes);altered[Math.floor(altered.length/2)]^=1;
    const bad=[Buffer.alloc(0),Buffer.concat([bytes,Buffer.from('\n')]),altered];
    for(const h of d.deltas){assert.equal(text.split(h.after).length,2);for(const value of['',h.before,h.after+h.after])bad.push(Buffer.from(text.replace(h.after,value)));}
    for(const value of bad){if(sha(value)===d.baselineSHA256)assert.equal(restorePreR30Source(p,value),value);else assert.throws(()=>restorePreR30Source(p,value),p);}
    assert.deepEqual(restorePreR29Source(p,bytes),restorePreR29Source(p,old));
  }
  assert.throws(()=>assertR30AddedSource('src/unknown.js',Buffer.from('unknown')));
  assert.throws(()=>assertR30RetainedSource('src/unknown.js',Buffer.from('unknown')));
});
test('complete R30 source-bound scene reverses exactly to frozen R29 including ordered navigation, all LODs, graph, materials and cost',()=>{
  assert.equal(hash(current),G.afterCaptureSHA256);assert.equal(hash(previous),G.beforeCaptureSHA256);
  assert.equal(G.beforeCaptureSHA256,r29Scene.afterCaptureSHA256);
  assert.equal(restorePreR30Capture(previous),previous);
  assert.deepEqual(G.names,['后三宫']);
  for(const[name,row]of Object.entries(G.unchanged))assert.deepEqual(current.rows[name],row);
  assert.deepEqual([previous.meshes.length,current.meshes.length],[168,169]);
  assert.deepEqual([previous,current].map(c=>Object.values(c.rows).reduce((n,r)=>n+r.triangles,0)),[191439,191727]);
  assert.deepEqual([previous.geometryBytes,current.geometryBytes],[18620036,18647684]);
  assert.deepEqual([previous.navigation.colliders.length,current.navigation.colliders.length],[2489,2503]);
  assert.deepEqual(current.navigation.walkables,previous.navigation.walkables);assert.equal(current.navigation.walkables.length,120);
  assert.equal(hash(restorePreR29Capture(current)),r29Scene.beforeCaptureSHA256);
  const raw=JSON.parse(read('tests/fixtures/r30-qianqing-passage-baseline.json'));
  assert.deepEqual(previous.navigation,{colliders:raw.colliders,walkables:raw.walkables});
  const rawScene=new THREE.Scene(),rawBuilder=new HistoricalR29PalaceBuilder(rawScene,library());
  try{rawBuilder.buildAll(PALACE_LAYOUT);rawScene.updateMatrixWorld(true);assert.deepEqual(sceneRows(rawScene),raw.groups);}finally{rawBuilder.dispose();}
  assert.deepEqual(captureJiaotaiScene(HistoricalR29PalaceBuilder),previous);
});
test('R30 scene reversals reject missing/duplicated/reordered/altered geometry, hierarchy, materials and partial reversals',()=>{
  for(const[key,restore]of[['meshes',restorePreR30MeshRows],['graph',restorePreR30GraphRows],['materials',restorePreR30Materials]]){
    for(const rows of[current[key],previous[key]])for(const i of[0,Math.floor(rows.length/2),rows.length-1]){
      const missing=structuredClone(rows);missing.splice(i,1);
      const duplicate=structuredClone(rows);duplicate.splice(i,0,duplicate[i]);
      const reordered=structuredClone(rows);reordered.reverse();
      const altered=structuredClone(rows);if(Array.isArray(altered[i]))altered[i][1][0].roughness+=.01;else altered[i].matrix[13]+=.001;
      for(const bad of[missing,duplicate,reordered,altered])assert.throws(()=>restore(bad));
    }
    for(const d of G[key].changes){const partial=structuredClone(current[key]);partial.splice(d.afterIndex,d.after.length,...structuredClone(d.before));if(hash(partial)!==G[key].beforeSHA256)assert.throws(()=>restore(partial));}
  }
  for(const[name,row]of Object.entries(current.rows)){
    const bad={...row,hash:'unknown'};assert.throws(()=>restorePreR30SceneRows({...current.rows,[name]:bad}));
    if(G.names.includes(name))assert.throws(()=>restorePreR30SceneRow(name,bad));
  }
  for(const key of['geometryBytes','uniqueMaterials','uniqueTextures'])assert.throws(()=>restorePreR30Capture({...current,[key]:current[key]+1}));
  for(const key of['geometrySHA256','materialSHA256','name','group']){const bad=structuredClone(current.meshes);bad[bad.length-1][key]='unknown';assert.throws(()=>restorePreR30MeshRows(bad));}
});
test('R30 ordered navigation reversal rejects any missing, duplicated, reordered or mutated collider/walkable, including partial reversals',()=>{
  for(const value of[current.navigation,previous.navigation])for(const key of['colliders','walkables'])for(const i of[0,Math.floor(value[key].length/2),value[key].length-1]){
    const missing=structuredClone(value);missing[key].splice(i,1);
    const duplicate=structuredClone(value);duplicate[key].splice(i,0,duplicate[key][i]);
    const reorder=structuredClone(value);reorder[key].reverse();
    const modified=structuredClone(value);modified[key][i].unknown=true;
    const shifted=structuredClone(value),row=shifted[key][i];if(row.min)row.min.x+=.001;else if(row.box)row.box.min.x+=.001;else row.minX+=.001;
    for(const bad of[missing,duplicate,reorder,modified,shifted])assert.throws(()=>restorePreR30Navigation(bad));
  }
  for(const d of G.navigation.colliders.changes){const partial=structuredClone(current.navigation);partial.colliders.splice(d.afterIndex,d.after.length,...structuredClone(d.before));if(hash(partial)!==G.navigation.beforeSHA256)assert.throws(()=>restorePreR30Navigation(partial));}
  assert.throws(()=>restorePreR30Navigation({...current.navigation,extra:[]}));
});
