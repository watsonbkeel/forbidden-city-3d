import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {library,sceneRows} from './lib/inner-palace-fixture.mjs';
import {HistoricalR20PalaceBuilder} from './lib/historical-r20-baohe-fixture.mjs';
import {restorePreR21Source,assertR21AddedSource,restorePreR21SceneRow,restorePreR21SceneRows} from './lib/r21-baohe-retention.mjs';
import {restorePreR20Source,restorePreR20SceneRows} from './lib/r20-baohe-retention.mjs';
import {restorePreR19Source,restorePreR19SceneRows} from './lib/r19-baohe-retention.mjs';
import {restorePreR13SceneRow} from './lib/r13-plaque-retention.mjs';
import source from './fixtures/r21-baohe-source-delta.json' with {type:'json'};
import scene from './fixtures/r21-baohe-scene-delta.json' with {type:'json'};
import previousSource from './fixtures/r20-baohe-source-delta.json' with {type:'json'};
import previousScene from './fixtures/r20-baohe-scene-delta.json' with {type:'json'};
import r19Source from './fixtures/r19-baohe-source-delta.json' with {type:'json'};
import r19Scene from './fixtures/r19-baohe-scene-delta.json' with {type:'json'};
import r13 from './fixtures/r13-plaque-baseline.json' with {type:'json'};

const root=new URL('../',import.meta.url),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const hash=value=>sha(JSON.stringify(value)),read=path=>fs.readFileSync(new URL(path,root));
function capture(Builder){
  const s=new THREE.Scene(),b=new Builder(s,library());
  try{b.buildAll(PALACE_LAYOUT);return sceneRows(s);}finally{b.dispose();}
}
const current=capture(PalaceBuilder),historicalR20=capture(HistoricalR20PalaceBuilder);

test('R21 provenance binds frozen commits, one changed source, one added module and unchanged R20 fixtures',()=>{
  for(const fixture of[source,scene]){
    assert.equal(fixture.base,'91ef33d8a185ddb9306e341d4f8f9c85e816c20a');
    assert.equal(fixture.candidate,'8dbbefa1a3bd6580c74000d66f080c47f80400b8');
    assert.match(fixture.scope,/Historical assertions only/);
  }
  assert.deepEqual(Object.keys(source.files),['src/scene/PalaceBuilder.js']);
  assert.deepEqual(Object.keys(source.addedFiles),['src/scene/palace/BaoheThroneScreen.js']);
  assert.equal(source.files['src/scene/PalaceBuilder.js'].baselineSHA256,previousSource.files['src/scene/PalaceBuilder.js'].candidateSHA256);
  assert.equal(scene.beforeSHA256,previousScene.afterSHA256);assert.deepEqual(scene.before,previousScene.after);
  assert.deepEqual(scene.unchanged,previousScene.unchanged);
  assert.equal(Object.keys(source.preservedFixtures).length,3);
  for(const[path,digest]of Object.entries(source.preservedFixtures))assert.equal(sha(read(path)),digest,path);
});

for(const[path,d]of Object.entries(source.files)){
  test('exact live R21 source reverses five unique hunks before frozen R20 and R19 adapters: '+path,()=>{
    const bytes=read(path),before=Buffer.from(bytes),text=bytes.toString();
    assert.equal(sha(bytes),d.candidateSHA256);assert.equal(d.deltas.length,5);
    for(const h of d.deltas){assert.ok(h.before.length>0);assert.ok(h.after.length>0);assert.equal(text.split(h.after).length,2);}
    const restored=restorePreR21Source(path,bytes);
    assert.equal(sha(restored),d.baselineSHA256);assert.equal(restorePreR21Source(path,restored),restored);
    assert.equal(sha(restorePreR20Source(path,bytes)),previousSource.files[path].baselineSHA256);
    assert.equal(sha(restorePreR19Source(path,bytes)),r19Source.files[path].baselineSHA256);
    assert.deepEqual(bytes,before,'live source bytes are never modified');
  });
  test('R21 and older source entries reject append, missing/duplicate/partial hunks and unknown edits: '+path,()=>{
    const text=read(path).toString();
    const bad=['',text+'\n','// unknown source change\n'+text,text.replace('const lacquer =','const changedLacquer =')];
    for(const h of d.deltas)for(const replacement of['',h.after+h.after,h.before])bad.push(text.replace(h.after,replacement));
    for(const value of bad){
      assert.notEqual(value,text,'negative mutation must change actual source');
      for(const restore of[restorePreR21Source,restorePreR20Source,restorePreR19Source])assert.throws(()=>restore(path,Buffer.from(value)));
    }
    const baseline=restorePreR21Source(path,read(path)).toString();
    for(const value of[baseline+'\n',baseline.replace('const lacquer =','const changedLacquer =')])
      assert.throws(()=>restorePreR21Source(path,Buffer.from(value)),'historical R20 input must also be byte-exact');
  });
}

for(const[path,d]of Object.entries(source.addedFiles)){
  test('R21 new module is independently bound to complete exact bytes: '+path,()=>{
    const bytes=read(path);assert.equal(sha(bytes),d.candidateSHA256);assert.equal(assertR21AddedSource(path,bytes),bytes);
  });
  test('R21 new module rejects append, absent/duplicate content, changed screen/chair/plaque and unregistered paths',()=>{
    const text=read(path).toString();
    const changes=[['width: 4.8','width: 4.9'],['1.8,.22,1.3','1.8,.23,1.3'],["canvasLeftToRight:'極有建皇'","canvasLeftToRight:'皇建有極'"]];
    for(const value of['',text+text,text+'\n',...changes.map(([a,b])=>{assert.equal(text.split(a).length,2);return text.replace(a,b);})]){
      assert.notEqual(value,text);assert.throws(()=>assertR21AddedSource(path,Buffer.from(value)));
    }
    assert.throws(()=>assertR21AddedSource('src/scene/palace/Unregistered.js',Buffer.from(text)));
  });
}

test('exact R21 complete scene restores independently built frozen R20 before original R20/R19 chains',()=>{
  assert.equal(hash(current),scene.afterSHA256);assert.deepEqual(current['三台'],scene.after);
  assert.equal(hash(historicalR20),scene.beforeSHA256);assert.deepEqual(historicalR20['三台'],scene.before);
  assert.equal(Object.keys(scene.unchanged).length,7);
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(current[name],row);
  const restored=restorePreR21SceneRows(current);assert.deepEqual(restored,historicalR20);
  assert.equal(restorePreR21SceneRows(restored),restored);assert.equal(hash(current),scene.afterSHA256);
  assert.deepEqual(restorePreR21SceneRow('三台',current['三台']),scene.before);
  assert.equal(hash(restorePreR20SceneRows(current)),previousScene.beforeSHA256);
  assert.equal(hash(restorePreR19SceneRows(current)),r19Scene.beforeSHA256);
  assert.deepEqual(restorePreR13SceneRow('三台',current['三台']),r13.sceneBefore);
});

test('R21 and older scene chains reject missing/extra groups and count-preserving material or geometry changes',()=>{
  for(const name of Object.keys(current)){
    const missing=structuredClone(current);delete missing[name];
    const count=structuredClone(current);count[name].triangles++;
    const identity=structuredClone(current);identity[name].hash='unknown-geometry-or-material';
    for(const bad of[missing,count,identity])for(const restore of[restorePreR21SceneRows,restorePreR20SceneRows,restorePreR19SceneRows])assert.throws(()=>restore(bad));
  }
  assert.throws(()=>restorePreR21SceneRows({...current,extra:current['午门']}));
  for(const row of[scene.before,scene.after])for(const bad of[{...row,hash:'unknown'}, {...row,triangles:row.triangles+1},{...row,meshes:row.meshes+1},{...row,extra:true}]){
    assert.throws(()=>restorePreR21SceneRow('三台',bad));assert.throws(()=>restorePreR13SceneRow('三台',bad));
  }
  assert.throws(()=>restorePreR21SceneRows({...historicalR20,extra:historicalR20['午门']}));
});
