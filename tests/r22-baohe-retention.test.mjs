import {restorePreR28Source} from './lib/r28-jiaotai-central-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {HistoricalR22PalaceBuilder} from './lib/historical-r22-baohe-fixture.mjs';
import {restorePreR23Source} from './lib/r23-baohe-retention.mjs';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {library,sceneRows} from './lib/inner-palace-fixture.mjs';
import {HistoricalR21PalaceBuilder} from './lib/historical-r21-baohe-fixture.mjs';
import {restorePreR22Source,assertR22AddedSource,assertR22RetainedSource,restorePreR22SceneRow,restorePreR22SceneRows,restorePreR22Navigation} from './lib/r22-baohe-retention.mjs';
import {restorePreR21Source,restorePreR21SceneRows} from './lib/r21-baohe-retention.mjs';
import {restorePreR20Source,restorePreR20SceneRows} from './lib/r20-baohe-retention.mjs';
import {restorePreR19Navigation} from './lib/r19-baohe-retention.mjs';
import source from './fixtures/r22-baohe-source-delta.json' with {type:'json'};
import scene from './fixtures/r22-baohe-scene-delta.json' with {type:'json'};
import nav from './fixtures/r22-baohe-navigation-delta.json' with {type:'json'};
import priorSource from './fixtures/r21-baohe-source-delta.json' with {type:'json'};
import priorScene from './fixtures/r21-baohe-scene-delta.json' with {type:'json'};
import priorNav from './fixtures/r19-baohe-navigation-delta.json' with {type:'json'};

const root=new URL('../',import.meta.url),sha=x=>createHash('sha256').update(x).digest('hex');
const hash=x=>sha(JSON.stringify(x)),clone=x=>JSON.parse(JSON.stringify(x)),read=path=>restorePreR28Source(path,fs.readFileSync(new URL(path,root)));
function capture(Builder){
  const s=new THREE.Scene(),b=new Builder(s,library());
  try{b.buildAll(PALACE_LAYOUT);return {rows:sceneRows(s),navigation:clone({colliders:b.colliders,walkables:b.walkables})};}
  finally{b.dispose();}
}
// Frozen R22 assertions; current R23 has independent direct acceptance.
const current=capture(HistoricalR22PalaceBuilder),historicalR21=capture(HistoricalR21PalaceBuilder);

test('R22 provenance freezes one builder, two added modules, retained dependencies and unchanged historical fixtures',()=>{
  for(const f of[source,scene,nav]){
    assert.equal(f.base,'dbed65dff5ab0919c2f21c6dff65bd4b2c1c850e');
    assert.equal(f.candidate,'5e6624c03d520ee91d355b09aa3060bc7a9489fe');
    assert.match(f.scope,/Historical assertions only/);
  }
  assert.deepEqual(Object.keys(source.files),['src/scene/PalaceBuilder.js']);
  assert.deepEqual(Object.keys(source.addedFiles),['src/scene/palace/BaoheFrontDoors.js','src/scene/palace/BaoheColumnCouplets.js']);
  assert.equal(source.files['src/scene/PalaceBuilder.js'].baselineSHA256,priorSource.files['src/scene/PalaceBuilder.js'].candidateSHA256);
  assert.equal(scene.beforeSHA256,priorScene.afterSHA256);assert.deepEqual(scene.before,priorScene.after);
  assert.deepEqual(scene.unchanged,priorScene.unchanged);assert.equal(nav.beforeSHA256,priorNav.afterSHA256);
  assert.equal(Object.keys(source.preservedFixtures).length,3);
  for(const[path,digest]of Object.entries(source.preservedFixtures))assert.equal(sha(read(path)),digest,path);
});

for(const[path,d]of Object.entries(source.files)){
  test('exact historical R22 source reverses three unique insertion hunks and reaches frozen R21/R20: '+path,()=>{
    const bytes=restorePreR23Source(path,read(path)),original=Buffer.from(bytes),text=bytes.toString();
    assert.equal(sha(bytes),d.candidateSHA256);assert.equal(d.deltas.length,3);
    for(const h of d.deltas){assert.ok(h.before.length);assert.ok(h.after.length);assert.equal(text.split(h.after).length,2);}
    const restored=restorePreR22Source(path,bytes);
    assert.equal(sha(restored),d.baselineSHA256);assert.equal(restorePreR22Source(path,restored),restored);
    for(const h of d.deltas)assert.equal(restored.toString().split(h.before).length,2);
    assert.equal(sha(restorePreR21Source(path,bytes)),priorSource.files[path].baselineSHA256);
    assert.deepEqual(bytes,original,'current source is never overwritten');
  });
  test('R22 and older source entries reject absent, appended, duplicated, partially reversed and unknown bytes: '+path,()=>{
    const text=restorePreR23Source(path,read(path)).toString();
    const mutations=['',text+'\n',text+text,'// unrelated source change\n'+text,text.replace('const lacquer =','const changedLacquer =')];
    for(const h of d.deltas)for(const replacement of['',h.after+h.after,h.before])mutations.push(text.replace(h.after,replacement));
    for(const value of mutations){
      assert.notEqual(value,text);
      for(const restore of[restorePreR22Source,restorePreR21Source,restorePreR20Source])assert.throws(()=>restore(path,Buffer.from(value)));
    }
    const before=restorePreR22Source(path,read(path)).toString();
    for(const value of[before+'\n',before+before,before.replace('const lacquer =','const changedLacquer =')])assert.throws(()=>restorePreR22Source(path,Buffer.from(value)));
  });
}

for(const[path,d]of Object.entries(source.addedFiles)){
  test('R22 added module binds complete bytes and rejects unknown or duplicated content: '+path,()=>{
    const bytes=restorePreR23Source(path,read(path)),text=bytes.toString();assert.equal(sha(bytes),d.candidateSHA256);assert.equal(assertR22AddedSource(path,bytes),bytes);
    const needle=path.endsWith('BaoheFrontDoors.js')?'divisions: 4':'columnX: 3.65';
    assert.equal(text.split(needle).length,2);
    for(const value of['',text+'\n',text+text,text.replace(needle,needle+'0')])assert.throws(()=>assertR22AddedSource(path,Buffer.from(value)));
    assert.throws(()=>assertR22AddedSource('src/scene/palace/Unregistered.js',bytes));
  });
}
for(const[path,digest]of Object.entries(source.retainedFiles))test('retained R21 dependency remains byte-exact: '+path,()=>{
  const bytes=read(path);assert.equal(sha(bytes),digest);assert.equal(assertR22RetainedSource(path,bytes),bytes);
  for(const value of[Buffer.alloc(0),Buffer.concat([bytes,bytes]),Buffer.concat([bytes,Buffer.from('\n')])])assert.throws(()=>assertR22RetainedSource(path,value));
  assert.throws(()=>assertR22RetainedSource('src/scene/palace/Unregistered.js',bytes));
});

test('historical R22 resident scene adds exactly100 triangles and one batch; exact reverse reproduces the independent historical R21 builder',()=>{
  assert.equal(hash(current.rows),scene.afterSHA256);assert.equal(hash(historicalR21.rows),scene.beforeSHA256);
  assert.deepEqual(current.rows['三台'],scene.after);assert.deepEqual(historicalR21.rows['三台'],scene.before);
  assert.equal(scene.after.triangles-scene.before.triangles,100);assert.equal(scene.after.meshes-scene.before.meshes,1);
  assert.equal(Object.keys(scene.unchanged).length,7);
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(current.rows[name],row);
  const restored=restorePreR22SceneRows(current.rows);assert.deepEqual(restored,historicalR21.rows);
  assert.equal(restorePreR22SceneRows(restored),restored);assert.equal(hash(current.rows),scene.afterSHA256);
  assert.deepEqual(restorePreR22SceneRow('三台',current.rows['三台']),scene.before);
  assert.equal(hash(restorePreR21SceneRows(current.rows)),priorScene.beforeSHA256);
  assert.notEqual(hash(historicalR21.rows),scene.afterSHA256,'historical fixture cannot be current acceptance');
});

test('R22 scene and older chains reject missing/extra groups and count-preserving geometry/material drift',()=>{
  for(const rows of[current.rows,historicalR21.rows]){
    for(const name of Object.keys(rows)){
      const missing=clone(rows);delete missing[name];
      const count=clone(rows);count[name].triangles++;
      const identity=clone(rows);identity[name].hash='unknown-geometry-material';
      for(const bad of[missing,count,identity,{...rows,extra:rows[name]}])
        for(const restore of[restorePreR22SceneRows,restorePreR21SceneRows,restorePreR20SceneRows])assert.throws(()=>restore(bad));
    }
    for(const bad of[{...rows['三台'],hash:'unknown'}, {...rows['三台'],meshes:rows['三台'].meshes+1}, {...rows['三台'],extra:true}])assert.throws(()=>restorePreR22SceneRow('三台',bad));
  }
});

test('historical R22 navigation owns exactly twelve front-leaf colliders and retains every other collider and walkable',()=>{
  assert.equal(hash(current.navigation),nav.afterSHA256);assert.equal(hash(historicalR21.navigation),nav.beforeSHA256);
  assert.deepEqual([current.navigation.colliders.length,current.navigation.walkables.length],[2487,120]);
  assert.deepEqual(Object.keys(nav.collections),['colliders','walkables']);
  const changes=nav.collections.colliders.changes;assert.equal(changes.length,1);
  const c=changes[0];assert.deepEqual([c.beforeIndex,c.afterIndex,c.before.length,c.after.length],[2154,2154,0,12]);
  assert.deepEqual(current.navigation.colliders.slice(c.afterIndex,c.afterIndex+c.after.length),c.after);
  assert.deepEqual(current.navigation.colliders.slice(0,c.afterIndex),historicalR21.navigation.colliders.slice(0,c.beforeIndex));
  assert.deepEqual(current.navigation.colliders.slice(c.afterIndex+c.after.length),historicalR21.navigation.colliders.slice(c.beforeIndex));
  for(const row of c.after){assert.equal(row.min.y,9);assert.equal(row.max.y,14.08288);assert.ok(row.min.x>=-8.71&&row.max.x<=8.71&&row.min.z>=114.84&&row.max.z<=116.51);}
  assert.deepEqual(nav.collections.walkables.changes,[]);assert.deepEqual(current.navigation.walkables,historicalR21.navigation.walkables);
  const restored=restorePreR22Navigation(current.navigation);assert.deepEqual(restored,historicalR21.navigation);
  assert.equal(restorePreR22Navigation(restored),restored);assert.equal(hash(current.navigation),nav.afterSHA256);
  assert.equal(hash(restorePreR19Navigation(current.navigation)),priorNav.beforeSHA256);
});

test('navigation rejects deleted/duplicated/reordered/unknown leaf and unrelated rows plus any walkable drift',()=>{
  for(const original of[current.navigation,historicalR21.navigation]){
    for(const key of['colliders','walkables'])for(const index of key==='colliders'?[0,2154,2165,original.colliders.length-1]:[0,103,119]){
      const missing=clone(original);missing[key].splice(index,1);
      const duplicate=clone(original);duplicate[key].splice(index,0,clone(duplicate[key][index]));
      const drift=clone(original),row=drift[key][index];if(row.min)row.min.x+=.001;else if(row.box)row.box.min.x+=.001;else row.minX+=.001;
      for(const bad of[missing,duplicate,drift])for(const restore of[restorePreR22Navigation,restorePreR19Navigation])assert.throws(()=>restore(bad));
    }
    const reordered=clone(original);[reordered.colliders[2154],reordered.colliders[2155]]=[reordered.colliders[2155],reordered.colliders[2154]];
    assert.throws(()=>restorePreR22Navigation(reordered));assert.throws(()=>restorePreR22Navigation({...original,extra:[]}));
  }
});
