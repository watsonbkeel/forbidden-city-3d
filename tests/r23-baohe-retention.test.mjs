import {restorePreR28Source} from './lib/r28-jiaotai-central-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {HistoricalR23PalaceBuilder} from './lib/historical-r23-baohe-fixture.mjs';
import {restorePreR24Source} from './lib/r24-baohe-retention.mjs';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {library,sceneRows} from './lib/inner-palace-fixture.mjs';
import {HistoricalR22PalaceBuilder,historicalR22FrontDoorsModule} from './lib/historical-r22-baohe-fixture.mjs';
import {restorePreR23Source,assertR23AddedSource,assertR23RetainedSource,restorePreR23SceneRow,restorePreR23SceneRows,assertR23NavigationIdentity} from './lib/r23-baohe-retention.mjs';
import {restorePreR22Source,assertR22AddedSource,restorePreR22SceneRows,restorePreR22Navigation} from './lib/r22-baohe-retention.mjs';
import {restorePreR21Source,restorePreR21SceneRows} from './lib/r21-baohe-retention.mjs';
import {restorePreR20Source,restorePreR20SceneRows} from './lib/r20-baohe-retention.mjs';
import source from './fixtures/r23-baohe-source-delta.json' with {type:'json'};
import scene from './fixtures/r23-baohe-scene-delta.json' with {type:'json'};
import priorSource from './fixtures/r22-baohe-source-delta.json' with {type:'json'};
import priorScene from './fixtures/r22-baohe-scene-delta.json' with {type:'json'};
import priorNav from './fixtures/r22-baohe-navigation-delta.json' with {type:'json'};
import r21Scene from './fixtures/r21-baohe-scene-delta.json' with {type:'json'};
import r20Scene from './fixtures/r20-baohe-scene-delta.json' with {type:'json'};

const root=new URL('../',import.meta.url),sha=x=>createHash('sha256').update(x).digest('hex');
const hash=x=>sha(JSON.stringify(x)),clone=x=>JSON.parse(JSON.stringify(x)),read=path=>restorePreR28Source(path,fs.readFileSync(new URL(path,root)));
function capture(Builder){
  const s=new THREE.Scene(),b=new Builder(s,library());
  try{
    b.buildAll(PALACE_LAYOUT);let geometryBytes=0;
    s.traverse(m=>{if(!m.isMesh)return;for(const a of Object.values(m.geometry.attributes))geometryBytes+=a.array.byteLength;geometryBytes+=m.geometry.index?.array.byteLength??0;});
    return {rows:sceneRows(s),navigation:clone({colliders:b.colliders,walkables:b.walkables}),geometryBytes};
  }finally{b.dispose();}
}
// Historical R23 identity only; live R24 has independent direct feature tests.
const current=capture(HistoricalR23PalaceBuilder),historicalR22=capture(HistoricalR22PalaceBuilder);

test('R23 provenance freezes two source edits, one added module, exact R22 baseline and unmodified prior fixtures',()=>{
  assert.equal(sha(read('tests/fixtures/r23-baohe-source-delta.json')),'92c0fe18402636b373c3b4f4a627364c3da57c1df203665acc195ebfa33168ca');
  assert.equal(sha(read('tests/fixtures/r23-baohe-scene-delta.json')),'83f512917a80020a3f91ae64317267afc1a6790dac3c2a438ca2afe1b35b7a97');
  for(const f of[source,scene]){
    assert.equal(f.base,'5dcf70f5d9452284efc94fbac9317e9a613fec08');
    assert.equal(f.candidate,'e60d0da3641f1278302a69d95519f9ce588bc752');
    assert.match(f.scope,/Historical assertions only/);
  }
  assert.match(source.baseTree,/^aa4058fc/);
  assert.deepEqual(Object.keys(source.files),['src/scene/PalaceBuilder.js','src/scene/palace/BaoheFrontDoors.js']);
  assert.deepEqual(Object.keys(source.addedFiles),['src/scene/palace/BaoheFrontEnclosure.js']);
  for(const[path,d]of Object.entries(source.files))assert.equal(d.baselineSHA256,(priorSource.files[path]??priorSource.addedFiles[path]).candidateSHA256);
  assert.equal(scene.beforeSHA256,priorScene.afterSHA256);assert.deepEqual(scene.before,priorScene.after);assert.deepEqual(scene.unchanged,priorScene.unchanged);
  assert.equal(scene.navigationSHA256,priorNav.afterSHA256);
  assert.equal(Object.keys(source.preservedFixtures).length,4);
  for(const[path,digest]of Object.entries(source.preservedFixtures))assert.equal(sha(read(path)),digest,path);
});

for(const[path,d]of Object.entries(source.files)){
  test('exact historical R23 bytes reverse two unique hunks into frozen R22: '+path,()=>{
    const bytes=restorePreR24Source(path,read(path)),original=Buffer.from(bytes),text=bytes.toString();
    assert.equal(sha(bytes),d.candidateSHA256);assert.equal(d.deltas.length,2);
    for(const h of d.deltas){assert.ok(h.before.length&&h.after.length);assert.equal(text.split(h.after).length,2);}
    const restored=restorePreR23Source(path,bytes);
    assert.equal(sha(restored),d.baselineSHA256);assert.equal(restorePreR23Source(path,restored),restored);
    for(const h of d.deltas)assert.equal(restored.toString().split(h.before).length,2);
    if(path.endsWith('PalaceBuilder.js'))assert.equal(sha(restorePreR22Source(path,bytes)),priorSource.files[path].baselineSHA256);
    else assert.deepEqual(assertR22AddedSource(path,bytes),restored);
    assert.deepEqual(bytes,original,'live runtime bytes are never overwritten');
  });
  test('R23 and older source chains reject empty, unknown, appended, duplicate and partial reversals: '+path,()=>{
    const text=restorePreR24Source(path,read(path)).toString(),needle=path.endsWith('PalaceBuilder.js')?'const lacquer =':'divisions: 4';
    assert.equal(text.split(needle).length,2);
    const bad=['',text+'\n',text+text,'// unrelated change\n'+text,text.replace(needle,needle+' /* unrelated */')];
    for(const h of d.deltas)for(const replacement of['',h.before,h.after+h.after])bad.push(text.replace(h.after,replacement));
    for(const value of bad){
      assert.notEqual(value,text);
      for(const restore of[restorePreR23Source,restorePreR22Source,restorePreR21Source,restorePreR20Source])assert.throws(()=>restore(path,Buffer.from(value)));
      if(path.endsWith('BaoheFrontDoors.js'))assert.throws(()=>assertR22AddedSource(path,Buffer.from(value)));
    }
    const before=restorePreR23Source(path,read(path)).toString();
    for(const value of[before+'\n',before+before,before.replace(needle,needle+' /* unrelated */')])assert.throws(()=>restorePreR23Source(path,Buffer.from(value)));
  });
}

for(const[path,d]of Object.entries(source.addedFiles))test('entire R23 atlas/enclosure module rejects unknown, absent, appended and duplicated bytes: '+path,()=>{
  const bytes=read(path),text=bytes.toString();assert.equal(sha(bytes),d.candidateSHA256);assert.equal(assertR23AddedSource(path,bytes),bytes);
  const needle='wallHeightRatio: .22';assert.equal(text.split(needle).length,2);
  for(const value of['',text+'\n',text+text,text.replace(needle,'wallHeightRatio: .23')])assert.throws(()=>assertR23AddedSource(path,Buffer.from(value)));
  assert.throws(()=>assertR23AddedSource('src/scene/palace/Unregistered.js',bytes));
});
for(const[path,digest]of Object.entries(source.retainedFiles))test('R23 retains complete prior dependencies, controls and route/driver bytes: '+path,()=>{
  const bytes=read(path);assert.equal(sha(bytes),digest);assert.equal(assertR23RetainedSource(path,bytes),bytes);
  for(const value of[Buffer.alloc(0),Buffer.concat([bytes,bytes]),Buffer.concat([bytes,Buffer.from('\n')])])assert.throws(()=>assertR23RetainedSource(path,value));
  assert.throws(()=>assertR23RetainedSource('src/scene/palace/Unregistered.js',bytes));
});

test('independent frozen R22 door module retains its original twelve triangles and shared lattice material',async()=>{
  const {buildBaoheFrontDoors}=await import(historicalR22FrontDoorsModule);
  const b=new HistoricalR22PalaceBuilder(new THREE.Scene(),library()),g=new THREE.Group();
  try{
    buildBaoheFrontDoors(b,g,{xc:0,zf:0,y:9,height:5.0832,bayWidth:7.3,columnRadius:49.7/9*.08});
    assert.equal(g.children.length,4);
    for(const m of g.children){assert.equal((m.geometry.index?.count??m.geometry.attributes.position.count)/3,12);assert.equal(m.material.name,'lattice_doors');assert.equal(m.userData.baoheFrontEnclosure,undefined);}
  }finally{b.dispose();}
});

test('actual whole R23 groups reverse to independently built R22 with exactly one mesh, four triangles and 384 geometry bytes added',()=>{
  assert.equal(hash(current.rows),scene.afterSHA256);assert.equal(hash(historicalR22.rows),scene.beforeSHA256);
  assert.deepEqual(current.rows['三台'],scene.after);assert.deepEqual(historicalR22.rows['三台'],scene.before);
  assert.equal(scene.after.triangles-scene.before.triangles,4);assert.equal(scene.after.meshes-scene.before.meshes,1);
  assert.equal(current.geometryBytes,scene.afterGeometryBytes);assert.equal(historicalR22.geometryBytes,scene.beforeGeometryBytes);
  assert.equal(current.geometryBytes-historicalR22.geometryBytes,384);
  assert.equal(Object.keys(scene.unchanged).length,7);
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(current.rows[name],row);
  const restored=restorePreR23SceneRows(current.rows);assert.deepEqual(restored,historicalR22.rows);assert.equal(restorePreR23SceneRows(restored),restored);
  assert.deepEqual(restorePreR23SceneRow('三台',current.rows['三台']),scene.before);assert.equal(hash(current.rows),scene.afterSHA256);
  assert.equal(hash(restorePreR22SceneRows(current.rows)),priorScene.beforeSHA256);
  assert.equal(hash(restorePreR21SceneRows(current.rows)),r21Scene.beforeSHA256);
  assert.equal(hash(restorePreR20SceneRows(current.rows)),r20Scene.beforeSHA256);
  assert.notEqual(hash(historicalR22.rows),scene.afterSHA256,'historical R22 cannot pass current R23 identity');
});

test('whole-scene reversal rejects missing, extra and count-preserving geometry/material identity drift for current and historical input',()=>{
  for(const rows of[current.rows,historicalR22.rows]){
    for(const name of Object.keys(rows)){
      const missing=clone(rows);delete missing[name];
      const count=clone(rows);count[name].triangles++;
      const identity=clone(rows);identity[name].hash='unknown-geometry-material';
      for(const bad of[missing,count,identity,{...rows,extra:rows[name]}])
        for(const restore of[restorePreR23SceneRows,restorePreR22SceneRows,restorePreR21SceneRows,restorePreR20SceneRows])assert.throws(()=>restore(bad));
    }
    for(const bad of[{...rows['三台'],hash:'unknown'}, {...rows['三台'],meshes:rows['三台'].meshes+1}, {...rows['三台'],extra:true}])assert.throws(()=>restorePreR23SceneRow('三台',bad));
  }
});

test('all 2487 colliders and 120 walkables stay byte-identical to independent R22, with no navigation normalization',()=>{
  assert.equal(assertR23NavigationIdentity(current.navigation),current.navigation);
  assert.equal(assertR23NavigationIdentity(historicalR22.navigation),historicalR22.navigation);
  assert.equal(JSON.stringify(current.navigation),JSON.stringify(historicalR22.navigation));
  assert.deepEqual([current.navigation.colliders.length,current.navigation.walkables.length],[2487,120]);
  assert.equal(hash(current.navigation),priorNav.afterSHA256);
  assert.equal(hash(restorePreR22Navigation(current.navigation)),priorNav.beforeSHA256);
});

test('unchanged navigation rejects missing, duplicated, reordered and unknown front or unrelated rows and any walkable drift',()=>{
  for(const key of['colliders','walkables'])for(const index of key==='colliders'?[0,2154,2165,2486]:[0,103,119]){
    const missing=clone(current.navigation);missing[key].splice(index,1);
    const duplicate=clone(current.navigation);duplicate[key].splice(index,0,clone(duplicate[key][index]));
    const drift=clone(current.navigation),row=drift[key][index];if(row.min)row.min.x+=.001;else if(row.box)row.box.min.x+=.001;else row.minX+=.001;
    for(const bad of[missing,duplicate,drift])assert.throws(()=>assertR23NavigationIdentity(bad));
  }
  const reordered=clone(current.navigation);[reordered.colliders[2154],reordered.colliders[2155]]=[reordered.colliders[2155],reordered.colliders[2154]];
  assert.throws(()=>assertR23NavigationIdentity(reordered));assert.throws(()=>assertR23NavigationIdentity({...current.navigation,extra:[]}));
});
