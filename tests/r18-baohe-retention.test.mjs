import {restorePreR19Source,restorePreR19Navigation,restorePreR19SceneRows,restorePreR19FixedRoutes} from './lib/r19-baohe-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {library,sceneRows} from './lib/inner-palace-fixture.mjs';
import {buildWorld,loadZoneJsons} from './lib/world.mjs';
import {buildAutoRoutes} from './lib/auto-routes.mjs';
import {
  restorePreR18Source,assertR18AddedSource,restorePreR18Navigation,
  restorePreR18SceneRow,restorePreR18SceneRows,assertR18RouteIdentity,
} from './lib/r18-baohe-retention.mjs';
import {
  restorePreR17Source,restorePreR17Navigation,restorePreR17SceneRow,restorePreR17SceneRows,
} from './lib/r17-baohe-retention.mjs';
import source from './fixtures/r18-baohe-source-delta.json' with {type:'json'};
import nav from './fixtures/r18-baohe-navigation-delta.json' with {type:'json'};
import scene from './fixtures/r18-baohe-scene-delta.json' with {type:'json'};
import routes from './fixtures/r18-baohe-routes-delta.json' with {type:'json'};
import previousSource from './fixtures/r17-baohe-source-delta.json' with {type:'json'};
import previousNav from './fixtures/r17-baohe-navigation-delta.json' with {type:'json'};
import previousScene from './fixtures/r17-baohe-scene-delta.json' with {type:'json'};
import previousRoute from './fixtures/r17-baohe-route-delta.json' with {type:'json'};

const sha=x=>createHash('sha256').update(x).digest('hex');
const hash=x=>sha(JSON.stringify(x));
const clone=x=>JSON.parse(JSON.stringify(x));
const root=new URL('../',import.meta.url);
const s=new THREE.Scene(),b=new PalaceBuilder(s,library());
b.buildAll(PALACE_LAYOUT);
// Historical R18 assertions use exact R19 → R18 restoration only.
// Live R19 identity is asserted in r19-baohe-retention and depth-ceiling tests.
const currentNavigation=restorePreR19Navigation(clone({colliders:b.colliders,walkables:b.walkables}));
const currentScene=restorePreR19SceneRows(sceneRows(s));
b.dispose();
const liveFixed=execFileSync(process.execPath,['tests/stepwalk.cjs','60','0','all'],{
  cwd:root,env:{...process.env,DUMP:'1'},encoding:'utf8',
}).trim().split('\n').map(line=>{const at=line.indexOf(' ');return{name:line.slice(0,at),pts:JSON.parse(line.slice(at+1))};});
const fixed=restorePreR19FixedRoutes(liveFixed);
const zones=loadZoneJsons(),world=await buildWorld({zones});
const auto=buildAutoRoutes(world,zones.map(z=>z.json),{knownIssues:{}});

test('R18 provenance binds the frozen R17 baseline and R18 column-only product',()=>{
  for(const fixture of[source,nav,scene,routes]){
    assert.equal(fixture.base,'311ac549779654620b85284749d5201337dd9d4d');
    assert.equal(fixture.candidate,'23583cd443765e8de23bdbc90255a2861a55f8d9');
  }
  assert.deepEqual(Object.keys(source.files),['src/scene/PalaceBuilder.js']);
  assert.deepEqual(Object.keys(source.addedFiles),['src/scene/palace/BaoheColumnIdentity.js']);
  assert.equal(source.files['src/scene/PalaceBuilder.js'].baselineSHA256,previousSource.files['src/scene/PalaceBuilder.js'].candidateSHA256);
  assert.equal(nav.beforeSHA256,previousNav.afterSHA256);
  assert.equal(scene.beforeSHA256,previousScene.afterSHA256);
  assert.deepEqual(scene.before,previousScene.after);
  assert.equal(routes.fixed.beforeSHA256,previousRoute.afterSHA256);
});

for(const[path,d]of Object.entries(source.files)){
  test('Historical R18 exact source reverses three one-occurrence hunks: '+path,()=>{
    const bytes=restorePreR19Source(path,fs.readFileSync(new URL(path,root)));
    assert.equal(sha(bytes),d.candidateSHA256);
    assert.equal(d.deltas.length,3);
    for(const h of d.deltas)assert.equal(bytes.toString().split(h.after).length,2);
    const restored=restorePreR18Source(path,bytes);
    assert.equal(sha(restored),d.baselineSHA256);
    assert.equal(sha(bytes),d.candidateSHA256,'restored fixture source is never overwritten');
    assert.equal(restorePreR18Source(path,restored),restored);
    assert.equal(sha(restorePreR17Source(path,bytes)),previousSource.files[path].baselineSHA256);
  });
  test('R18 source rejects missing/duplicate/partially reverted hunks and unrelated drift: '+path,()=>{
    const text=restorePreR19Source(path,fs.readFileSync(new URL(path,root))).toString();
    const bad=[text+'\n','// unrelated change\n'+text];
    for(const h of d.deltas)for(const replacement of['',h.after+h.after,h.before])bad.push(text.replace(h.after,replacement));
    for(const value of bad){
      assert.throws(()=>restorePreR18Source(path,Buffer.from(value)));
      assert.throws(()=>restorePreR17Source(path,Buffer.from(value)));
    }
  });
}

for(const[path,d]of Object.entries(source.addedFiles)){
  test('R18 new column rule has an independent exact source binding: '+path,()=>{
    const bytes=fs.readFileSync(new URL(path,root));
    assert.equal(sha(bytes),d.candidateSHA256);
    assert.equal(assertR18AddedSource(path,bytes),bytes);
  });
  test('R18 rejects changed/absent/duplicated column rule bytes and unregistered paths',()=>{
    const text=fs.readFileSync(new URL(path,root),'utf8');
    for(const value of['',text+text,text+'\n',text.replace('[2,3,4,5,6,7]','[3,4,5,6]'),text.replace('k === 1','k === 2')]){
      assert.throws(()=>assertR18AddedSource(path,Buffer.from(value)));
    }
    assert.throws(()=>assertR18AddedSource('src/scene/palace/Unregistered.js',Buffer.from(text)));
  });
}

test('Historical R18 navigation has six front omissions, two rear restorations and no other splice',()=>{
  assert.equal(hash(currentNavigation),nav.afterSHA256);
  assert.deepEqual([currentNavigation.colliders.length,currentNavigation.walkables.length],[2455,120]);
  assert.deepEqual(Object.keys(nav.collections),['colliders','walkables']);
  const d=nav.collections.colliders;
  assert.deepEqual(d.changes.map(c=>[c.beforeIndex,c.afterIndex,c.before.length,c.after.length]),[
    [2109,2109,1,0],[2113,2112,1,0],[2117,2115,1,1],
    [2120,2118,1,1],[2123,2121,1,0],[2127,2124,1,0],
  ]);
  const removed=d.changes.flatMap(c=>c.before),added=d.changes.flatMap(c=>c.after);
  const centers=rows=>rows.map(r=>[(r.min.x+r.max.x)/2,(r.min.z+r.max.z)/2]);
  assert.deepEqual(centers(removed),[-14.7,-9.15,-3.65,3.65,9.15,14.7].map(x=>[x,119.03333333333333]));
  assert.deepEqual(centers(added),[-3.65,3.65].map(x=>[x,127.36666666666667]));
  for(const row of[...removed,...added])assert.deepEqual([row.min.y,row.max.y],[9,12]);
  assert.deepEqual(nav.collections.walkables.changes,[]);
  assert.equal(nav.collections.walkables.beforeSHA256,nav.collections.walkables.afterSHA256);
  const restored=restorePreR18Navigation(currentNavigation);
  assert.equal(hash(restored),nav.beforeSHA256);
  assert.equal(hash(currentNavigation),nav.afterSHA256);
  assert.equal(restorePreR18Navigation(restored),restored);
  assert.deepEqual(restored.walkables,currentNavigation.walkables);
  let before=0,after=0;
  for(const c of d.changes){
    assert.deepEqual(currentNavigation.colliders.slice(after,c.afterIndex),restored.colliders.slice(before,c.beforeIndex));
    assert.deepEqual(currentNavigation.colliders.slice(c.afterIndex,c.afterIndex+c.after.length),c.after);
    assert.deepEqual(restored.colliders.slice(c.beforeIndex,c.beforeIndex+c.before.length),c.before);
    before=c.beforeIndex+c.before.length;after=c.afterIndex+c.after.length;
  }
  assert.deepEqual(currentNavigation.colliders.slice(after),restored.colliders.slice(before));
  assert.equal(hash(restorePreR17Navigation(currentNavigation)),previousNav.beforeSHA256);
});

test('R18 navigation rejects missing/duplicate/reordered/local/outside rows and any walkable drift',()=>{
  for(const key of['colliders','walkables'])for(const index of key==='colliders'?[0,2109,2115,2118,2454]:[0,103,119]){
    const missing=clone(currentNavigation);missing[key].splice(index,1);
    const duplicate=clone(currentNavigation);duplicate[key].splice(index,0,clone(duplicate[key][index]));
    const drift=clone(currentNavigation);const row=drift[key][index];
    if(row.min)row.min.x+=.001;else if(row.box)row.box.min.x+=.001;else row.minX+=.001;
    for(const value of[missing,duplicate,drift]){
      assert.throws(()=>restorePreR18Navigation(value));
      assert.throws(()=>restorePreR17Navigation(value));
    }
  }
  const reordered=clone(currentNavigation);[reordered.colliders[2115],reordered.colliders[2118]]=[reordered.colliders[2118],reordered.colliders[2115]];
  assert.throws(()=>restorePreR18Navigation(reordered));
  assert.throws(()=>restorePreR18Navigation({...currentNavigation,extra:[]}));
});

test('Historical R18 scene changes only 三台 by minus 224 triangles with exact material/geometry identity',()=>{
  assert.equal(hash(currentScene),scene.afterSHA256);
  assert.deepEqual(currentScene['三台'],scene.after);
  assert.equal(scene.after.meshes,42);
  assert.equal(scene.after.triangles-scene.before.triangles,-224);
  assert.equal(Object.keys(scene.unchanged).length,7);
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(currentScene[name],row);
  const restored=restorePreR18SceneRows(currentScene);
  assert.equal(hash(restored),scene.beforeSHA256);
  assert.equal(hash(currentScene),scene.afterSHA256);
  assert.equal(restorePreR18SceneRows(restored),restored);
  assert.deepEqual(restorePreR18SceneRow('三台',currentScene['三台']),scene.before);
  assert.deepEqual(restorePreR17SceneRow('三台',currentScene['三台']),previousScene.before);
  assert.equal(hash(restorePreR17SceneRows(currentScene)),previousScene.beforeSHA256);
});

test('R18 scene rejects missing/extra/unrelated groups and same-count hash or material drift',()=>{
  for(const name of Object.keys(currentScene)){
    const missing=clone(currentScene);delete missing[name];
    const drift=clone(currentScene);drift[name].triangles++;
    const identity=clone(currentScene);identity[name].hash='changed-geometry-or-material';
    for(const bad of[missing,drift,identity]){
      assert.throws(()=>restorePreR18SceneRows(bad));
      assert.throws(()=>restorePreR17SceneRows(bad));
    }
  }
  assert.throws(()=>restorePreR18SceneRows({...currentScene,extra:currentScene['午门']}));
  assert.throws(()=>restorePreR18SceneRow('三台',{...scene.after,hash:scene.before.hash}));
  assert.throws(()=>restorePreR18SceneRow('三台',{...scene.after,triangles:scene.after.triangles+1}));
});

for(const[kind,rows]of Object.entries({fixed,auto})){
  test(`Historical R18 ${kind} routes preserve the complete frozen R17 collection`,()=>{
    assert.equal(rows.length,kind==='fixed'?33:59);
    assert.equal(routes[kind].beforeSHA256,routes[kind].afterSHA256);
    assert.equal(hash(rows),routes[kind].afterSHA256);
    assert.equal(assertR18RouteIdentity(kind,rows),rows);
  });
  test(`R18 ${kind} route check rejects missing/duplicate/reordered/drifted points and metadata`,()=>{
    const missing=clone(rows);missing.pop();
    const duplicate=clone(rows);duplicate.push(clone(duplicate[0]));
    const reordered=clone(rows);[reordered[0],reordered[1]]=[reordered[1],reordered[0]];
    const point=clone(rows);point[0].pts[0][0]+=.001;
    const metadata=clone(rows);metadata[0].name+=' changed';
    for(const bad of[missing,duplicate,reordered,point,metadata])assert.throws(()=>assertR18RouteIdentity(kind,bad));
  });
}
