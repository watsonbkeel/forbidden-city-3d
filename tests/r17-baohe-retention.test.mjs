import {restorePreR18Source,restorePreR18Navigation,restorePreR18SceneRows} from './lib/r18-baohe-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {library,sceneRows} from './lib/inner-palace-fixture.mjs';
import {
  restorePreR17Source,restorePreR17Navigation,
  restorePreR17SceneRow,restorePreR17SceneRows,restorePreR17BaoheNorthRoute,
  restorePreR17FixedRoutes,currentBaoheHallPlinthRoute,
} from './lib/r17-baohe-retention.mjs';
import {
  restorePreR16Source,restoreR16SourceIfPresent,restorePreR16Navigation,
  restorePreR16SceneRow,withLegacyBaoheNorthRoutes,currentBaoheNorthRoute,
} from './lib/r16-baohe-retention.mjs';
import source from './fixtures/r17-baohe-source-delta.json' with {type:'json'};
import nav from './fixtures/r17-baohe-navigation-delta.json' with {type:'json'};
import route from './fixtures/r17-baohe-route-delta.json' with {type:'json'};
import scene from './fixtures/r17-baohe-scene-delta.json' with {type:'json'};
import previousSource from './fixtures/r16-baohe-source-delta.json' with {type:'json'};
import previousNav from './fixtures/r16-baohe-navigation-delta.json' with {type:'json'};
import previousRoute from './fixtures/r16-baohe-route-delta.json' with {type:'json'};
import previousScene from './fixtures/r16-baohe-scene-delta.json' with {type:'json'};

const sha=x=>createHash('sha256').update(x).digest('hex');
const hash=x=>sha(JSON.stringify(x));
const clone=x=>JSON.parse(JSON.stringify(x));
const root=new URL('../',import.meta.url);
const s=new THREE.Scene(),b=new PalaceBuilder(s,library());
b.buildAll(PALACE_LAYOUT);
// Explicit R18 restoration keeps these historical assertions bound to R17 bytes.
// Live R18 identity is asserted directly in r18-baohe-retention.test.mjs.
const currentNavigation=restorePreR18Navigation(clone({colliders:b.colliders,walkables:b.walkables}));
const currentScene=restorePreR18SceneRows(sceneRows(s));
b.dispose();
const currentRoutes=execFileSync(process.execPath,['tests/stepwalk.cjs','60','0','all'],{
  cwd:root,env:{...process.env,DUMP:'1'},encoding:'utf8',
}).trim().split('\n').map(line=>{const at=line.indexOf(' ');return{name:line.slice(0,at),pts:JSON.parse(line.slice(at+1))};});

test('R17 fixture provenance fixes the reviewed R16 and R17 source revisions',()=>{
  for(const fixture of[source,nav,route,scene]){
    assert.equal(fixture.base,'8dc373e0417aada9cab0a6e52fa4daa4ebb941db');
    assert.equal(fixture.candidate,'acc7d8d4a7f237a746d208e4892e539daa07461b');
  }
  assert.deepEqual(Object.keys(source.files),['src/scene/PalaceBuilder.js','tests/stepwalk.cjs']);
  assert.equal(nav.beforeSHA256,previousNav.afterSHA256);
  assert.deepEqual(scene.before,previousScene.after);
  assert.deepEqual(route.before,previousRoute.after);
});

for(const[path,d]of Object.entries(source.files)){
  test('R17 exact one-occurrence reverse source hunks: '+path,()=>{
    const bytes=restorePreR18Source(path,fs.readFileSync(new URL(path,root)));
    assert.equal(sha(bytes),d.candidateSHA256);
    assert.equal(d.baselineSHA256,previousSource.files[path].candidateSHA256);
    for(const h of d.deltas)assert.equal(bytes.toString().split(h.after).length,2);
    const baseline=restorePreR17Source(path,bytes);
    assert.equal(sha(baseline),d.baselineSHA256);
    assert.deepEqual(restorePreR17Source(path,baseline),baseline);
    assert.equal(sha(restorePreR16Source(path,bytes)),previousSource.files[path].baselineSHA256);
    assert.equal(sha(restoreR16SourceIfPresent(path,bytes)),previousSource.files[path].baselineSHA256);
  });
  test('R17 source rejects drift, missing hunks, duplicate hunks and unrelated edits: '+path,()=>{
    const text=restorePreR18Source(path,fs.readFileSync(new URL(path,root))).toString();
    for(const bad of[text+'\n','// unrelated change\n'+text])assert.throws(()=>restorePreR17Source(path,Buffer.from(bad)));
    for(const h of d.deltas)for(const replacement of['',h.after+h.after,h.before]){
      const bad=Buffer.from(text.replace(h.after,replacement));
      assert.throws(()=>restorePreR17Source(path,bad));
      assert.throws(()=>restorePreR16Source(path,bad));
    }
  });
}

test('R17 navigation restores exactly one Baohe collider splice and one walkable splice',()=>{
  assert.equal(hash(currentNavigation),nav.afterSHA256);
  const restored=restorePreR17Navigation(currentNavigation);
  assert.equal(hash(restored),nav.beforeSHA256);
  assert.equal(hash(currentNavigation),nav.afterSHA256,'input remains current geometry');
  assert.equal(restorePreR17Navigation(restored),restored);
  assert.equal(hash(restorePreR16Navigation(currentNavigation)),previousNav.beforeSHA256);
  assert.deepEqual(Object.keys(nav.collections),['colliders','walkables']);
  for(const[key,d]of Object.entries(nav.collections)){
    assert.equal(d.changes.length,1);
    const c=d.changes[0];
    assert.deepEqual([c.beforeIndex,c.afterIndex,c.before.length,c.after.length],key==='colliders'?[2020,2020,69,127]:[103,103,3,6]);
    assert.deepEqual(currentNavigation[key].slice(0,c.afterIndex),restored[key].slice(0,c.beforeIndex));
    assert.deepEqual(currentNavigation[key].slice(c.afterIndex+c.after.length),restored[key].slice(c.beforeIndex+c.before.length));
    for(const row of[...c.before,...c.after]){
      if(key==='colliders'||row.type==='box'){
        const box=row.box??row;
        assert.ok(box.min.x>=-26.35&&box.max.x<=26.35);
        assert.ok(box.min.z>=106&&box.max.z<=140.4);
        assert.ok(box.min.y>=8&&box.max.y<=13);
      }else{
        assert.equal(row.axis,'z');
        assert.ok(row.minX>=-8.251&&row.maxX<=8.251&&row.minZ>=106&&row.maxZ<=140.4);
        assert.ok(row.y0>=8&&row.y0<=10&&row.y1===8);
      }
    }
  }
  assert.deepEqual([currentNavigation.colliders.length,currentNavigation.walkables.length],[2459,120]);
  assert.deepEqual([restored.colliders.length,restored.walkables.length],[2401,117]);
});

test('R17 navigation rejects local drift, missing/duplicate rows, and changes outside Baohe',()=>{
  for(const[key,d]of Object.entries(nav.collections))for(const index of[0,d.changes[0].afterIndex]){
    const missing=clone(currentNavigation);missing[key].splice(index,1);
    const duplicate=clone(currentNavigation);duplicate[key].splice(index,0,clone(duplicate[key][index]));
    const drift=clone(currentNavigation);const row=drift[key][index];
    if(row.min)row.min.x+=.001;else if(row.box)row.box.min.x+=.001;else row.minX+=.001;
    for(const value of[missing,duplicate,drift]){
      assert.throws(()=>restorePreR17Navigation(value));
      assert.throws(()=>restorePreR16Navigation(value));
    }
  }
});

test('R17 scene locks every unchanged group and exactly fourteen added 三台 triangles',()=>{
  assert.equal(hash(currentScene),scene.afterSHA256);
  assert.deepEqual(currentScene['三台'],scene.after);
  assert.equal(scene.after.meshes,scene.before.meshes);
  assert.equal(scene.after.triangles-scene.before.triangles,14);
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(currentScene[name],row);
  assert.equal(Object.keys(scene.unchanged).length,7);
  const restored=restorePreR17SceneRows(currentScene);
  assert.equal(hash(restored),scene.beforeSHA256);
  assert.equal(hash(currentScene),scene.afterSHA256);
  assert.equal(restorePreR17SceneRows(restored),restored);
  assert.deepEqual(restorePreR17SceneRow('三台',currentScene['三台']),scene.before);
  assert.deepEqual(restorePreR16SceneRow('三台',currentScene['三台']),previousScene.before);
});

test('R17 scene rejects missing groups, unrelated changes and changed 三台 identity',()=>{
  for(const name of Object.keys(currentScene)){
    const missing=clone(currentScene);delete missing[name];
    const drift=clone(currentScene);drift[name].triangles++;
    assert.throws(()=>restorePreR17SceneRows(missing));
    assert.throws(()=>restorePreR17SceneRows(drift));
  }
  assert.throws(()=>restorePreR17SceneRows({...currentScene,extra:currentScene['午门']}));
  assert.throws(()=>restorePreR17SceneRow('三台',{...scene.after,hash:'unexpected'}));
});

test('R17 fixed descent preserves 33 routes and endpoints while leaving through a real stone-side strip',()=>{
  assert.equal(currentRoutes.length,33);
  assert.equal(hash(currentRoutes),route.afterSHA256);
  assert.deepEqual(currentRoutes[route.index],route.after);
  assert.deepEqual(route.after.pts[0],route.before.pts[0]);
  assert.deepEqual(route.after.pts.at(-1),route.before.pts.at(-1));
  assert.equal(route.after.pts.length,route.before.pts.length+5);
  assert.deepEqual(route.after.pts.slice(1,6),[[2.1,133.7],[2.1,137.2],[2.1,138.8],[2.1,140.2],[0,140.2]]);
  const restored=restorePreR17FixedRoutes(currentRoutes);
  assert.equal(hash(restored),route.beforeSHA256);
  assert.equal(restorePreR17FixedRoutes(restored),restored);
  assert.deepEqual(restorePreR17BaoheNorthRoute(route.after),route.before);
  assert.deepEqual(currentBaoheHallPlinthRoute(route.before),route.after);
  assert.deepEqual(currentBaoheNorthRoute(previousRoute.before),route.after);
  assert.deepEqual(withLegacyBaoheNorthRoutes([route.after]),[previousRoute.before]);
  assert.deepEqual(withLegacyBaoheNorthRoutes([route.before]),[previousRoute.before]);
  for(let i=0;i<currentRoutes.length;i++)if(i!==route.index)assert.deepEqual(restored[i],currentRoutes[i]);
});

test('R17 route conversion rejects missing/duplicate points, changed endpoints and unrelated routes',()=>{
  for(const pts of[route.after.pts.slice(1),route.after.pts.toReversed(),[...route.after.pts,route.after.pts.at(-1)],route.after.pts.map((p,i)=>i===3?[p[0]+.1,p[1]]:p)]){
    const bad={...route.after,pts};
    assert.throws(()=>restorePreR17BaoheNorthRoute(bad));
    assert.throws(()=>withLegacyBaoheNorthRoutes([bad]));
  }
  for(const index of[0,route.index]){
    const missing=clone(currentRoutes);missing.splice(index,1);
    const duplicate=clone(currentRoutes);duplicate.splice(index,0,clone(duplicate[index]));
    const drift=clone(currentRoutes);drift[index].pts[0][0]+=.1;
    for(const bad of[missing,duplicate,drift])assert.throws(()=>restorePreR17FixedRoutes(bad));
  }
  assert.throws(()=>currentBaoheHallPlinthRoute({...route.before,name:'unregistered'}));
  assert.throws(()=>currentBaoheNorthRoute(route.before));
});
