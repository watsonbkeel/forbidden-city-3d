import {restorePreR22RouteSource,restorePreR22FixedRoutes} from './lib/r22-baohe-route-retention.mjs';
import {restorePreR22Navigation} from './lib/r22-baohe-retention.mjs';
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
import {captureColumns} from './lib/baohe-column-capture.mjs';
import {HistoricalR18PalaceBuilder} from './lib/historical-r18-baohe-fixture.mjs';
import {restorePreR20Source,restorePreR20SceneRows} from './lib/r20-baohe-retention.mjs';
import {
  restorePreR19Source,assertR19AddedSource,restorePreR19Navigation,
  restorePreR19SceneRow,restorePreR19SceneRows,assertR19RouteIdentity,
  restorePreR19FixedRoutes,restorePreR19BaoheTraversalRoute,
} from './lib/r19-baohe-retention.mjs';
import {
  restorePreR18Source,restorePreR18Navigation,restorePreR18SceneRow,restorePreR18SceneRows,
} from './lib/r18-baohe-retention.mjs';
import source from './fixtures/r19-baohe-source-delta.json' with {type:'json'};
import nav from './fixtures/r19-baohe-navigation-delta.json' with {type:'json'};
import scene from './fixtures/r19-baohe-scene-delta.json' with {type:'json'};
import routes from './fixtures/r19-baohe-routes-delta.json' with {type:'json'};
import previousSource from './fixtures/r18-baohe-source-delta.json' with {type:'json'};
import previousNav from './fixtures/r18-baohe-navigation-delta.json' with {type:'json'};
import previousScene from './fixtures/r18-baohe-scene-delta.json' with {type:'json'};
import previousRoute from './fixtures/r18-baohe-routes-delta.json' with {type:'json'};

const sha=x=>createHash('sha256').update(x).digest('hex');
const hash=x=>sha(JSON.stringify(x));
const clone=x=>JSON.parse(JSON.stringify(x));
const root=new URL('../',import.meta.url);
const s=new THREE.Scene(),b=new PalaceBuilder(s,library());
b.buildAll(PALACE_LAYOUT);
// Historical navigation removes only the exact registered R22 twelve-leaf
// insertion. Source/scene assertions restore frozen R19. Live routes below
// continue to use the actual current product, with no navigation restoration.
const historicalR21Navigation=restorePreR22Navigation(clone({colliders:b.colliders,walkables:b.walkables}));
const historicalR19Scene=restorePreR20SceneRows(sceneRows(s));
b.dispose();
const liveFixed=execFileSync(process.execPath,['tests/stepwalk.cjs','60','0','all'],{
  cwd:root,env:{...process.env,DUMP:'1'},encoding:'utf8',
}).trim().split('\n').map(line=>{const at=line.indexOf(' ');return{name:line.slice(0,at),pts:JSON.parse(line.slice(at+1))};});
// Explicit historical descriptor comparison; live R22 route acceptance is separate.
const fixed=restorePreR22FixedRoutes(liveFixed);
const zones=loadZoneJsons(),world=await buildWorld({zones});
const auto=buildAutoRoutes(world,zones.map(z=>z.json),{knownIssues:{}});

test('R19 provenance binds the frozen R18 baseline and R19 depth/door/continuous-ceiling product',()=>{
  for(const fixture of[source,nav,scene,routes]){
    assert.equal(fixture.base,'dca3ea8add1776310b363c878e97c78dcea27def');
    assert.equal(fixture.candidate,(fixture===source||fixture===scene)?'70827ad3cb263beffa4dd8363405b537ab76fe29':'a5917e181c641d2a58789258a9a2dfeeb12776c8');
  }
  assert.deepEqual(Object.keys(source.files),['src/scene/PalaceBuilder.js']);
  assert.deepEqual(Object.keys(source.addedFiles),['src/scene/palace/BaoheDepthGrid.js']);
  assert.equal(source.files['src/scene/PalaceBuilder.js'].baselineSHA256,previousSource.files['src/scene/PalaceBuilder.js'].candidateSHA256);
  assert.equal(nav.beforeSHA256,previousNav.afterSHA256);
  assert.equal(scene.beforeSHA256,previousScene.afterSHA256);
  assert.deepEqual(scene.before,previousScene.after);
  for(const kind of ['fixed','auto'])assert.equal(routes[kind].beforeSHA256,previousRoute[kind].afterSHA256);
});

test('live product retains54 column sites; the explicitly historical R18 fixture retains34',()=>{
  assert.equal(captureColumns('保和殿').columns.length,54);
  assert.equal(captureColumns('保和殿',HistoricalR18PalaceBuilder).columns.length,34);
});

test('historical R18 builder produces the complete frozen R18 scene and navigation',()=>{
  const historicalScene=new THREE.Scene(),historical=new HistoricalR18PalaceBuilder(historicalScene,library());
  historical.buildAll(PALACE_LAYOUT);
  try{
    assert.equal(hash({colliders:historical.colliders,walkables:historical.walkables}),nav.beforeSHA256);
    assert.equal(hash(sceneRows(historicalScene)),scene.beforeSHA256);
  }finally{historical.dispose();}
});

for(const[path,d]of Object.entries(source.files)){
  test('historical R19 exact source reverses nine one-occurrence hunks: '+path,()=>{
    const bytes=restorePreR20Source(path,fs.readFileSync(new URL(path,root)));
    assert.equal(sha(bytes),d.candidateSHA256);
    assert.equal(d.deltas.length,9);
    for(const h of d.deltas)assert.equal(bytes.toString().split(h.after).length,2);
    const restored=restorePreR19Source(path,bytes);
    assert.equal(sha(restored),d.baselineSHA256);
    assert.equal(sha(bytes),d.candidateSHA256,'live source is never overwritten');
    assert.equal(restorePreR19Source(path,restored),restored);
    assert.equal(sha(restorePreR18Source(path,bytes)),previousSource.files[path].baselineSHA256);
  });
  test('R19 source rejects missing/duplicate/partially reverted hunks and unrelated drift: '+path,()=>{
    const text=restorePreR20Source(path,fs.readFileSync(new URL(path,root))).toString();
    const bad=[text+'\n','// unrelated change\n'+text];
    for(const h of d.deltas)for(const replacement of['',h.after+h.after,h.before])bad.push(text.replace(h.after,replacement));
    for(const value of bad){
      assert.throws(()=>restorePreR19Source(path,Buffer.from(value)));
      assert.throws(()=>restorePreR18Source(path,Buffer.from(value)));
    }
  });
}

for(const[path,d]of Object.entries(source.addedFiles)){
  test('R19 new depth registration has an independent exact source binding: '+path,()=>{
    const bytes=fs.readFileSync(new URL(path,root));
    assert.equal(sha(bytes),d.candidateSHA256);
    assert.equal(assertR19AddedSource(path,bytes),bytes);
  });
  test('R19 rejects changed/absent/duplicated depth registration bytes and unregistered paths',()=>{
    const text=fs.readFileSync(new URL(path,root),'utf8');
    for(const value of['',text+text,text+'\n',text.replace('[2,3,4,5,6,7]','[3,4,5,6]'),text.replace('reducedRow: 2','reducedRow: 1')]){
      assert.throws(()=>assertR19AddedSource(path,Buffer.from(value)));
    }
    assert.throws(()=>assertR19AddedSource('src/scene/palace/Unregistered.js',Buffer.from(text)));
  });
}

test('historical R21 navigation retains exactly the R19 the registered six-depth columns and door/wall splice',()=>{
  assert.equal(hash(historicalR21Navigation),nav.afterSHA256);
  assert.deepEqual([historicalR21Navigation.colliders.length,historicalR21Navigation.walkables.length],[2475,120]);
  assert.deepEqual(Object.keys(nav.collections),['colliders','walkables']);
  const d=nav.collections.colliders;
  assert.deepEqual(d.changes.map(c=>[c.beforeIndex,c.afterIndex,c.before.length,c.after.length]),[[2100,2100,40,60]]);
  const removed=d.changes.flatMap(c=>c.before),added=d.changes.flatMap(c=>c.after);
  assert.equal(added.length-removed.length,20);
  for(const row of[...removed,...added])assert.deepEqual([row.min.y,row.max.y],[9,12]);
  assert.deepEqual(nav.collections.walkables.changes,[]);
  assert.equal(nav.collections.walkables.beforeSHA256,nav.collections.walkables.afterSHA256);
  const restored=restorePreR19Navigation(historicalR21Navigation);
  assert.equal(hash(restored),nav.beforeSHA256);
  assert.equal(hash(historicalR21Navigation),nav.afterSHA256);
  assert.equal(restorePreR19Navigation(restored),restored);
  assert.deepEqual(restored.walkables,historicalR21Navigation.walkables);
  let before=0,after=0;
  for(const c of d.changes){
    assert.deepEqual(historicalR21Navigation.colliders.slice(after,c.afterIndex),restored.colliders.slice(before,c.beforeIndex));
    assert.deepEqual(historicalR21Navigation.colliders.slice(c.afterIndex,c.afterIndex+c.after.length),c.after);
    assert.deepEqual(restored.colliders.slice(c.beforeIndex,c.beforeIndex+c.before.length),c.before);
    before=c.beforeIndex+c.before.length;after=c.afterIndex+c.after.length;
  }
  assert.deepEqual(historicalR21Navigation.colliders.slice(after),restored.colliders.slice(before));
  assert.equal(hash(restorePreR18Navigation(historicalR21Navigation)),previousNav.beforeSHA256);
});

test('R19 navigation rejects missing/duplicate/reordered/local/outside rows and any walkable drift',()=>{
  for(const key of['colliders','walkables'])for(const index of key==='colliders'?[0,2100,2125,2159,2474]:[0,103,119]){
    const missing=clone(historicalR21Navigation);missing[key].splice(index,1);
    const duplicate=clone(historicalR21Navigation);duplicate[key].splice(index,0,clone(duplicate[key][index]));
    const drift=clone(historicalR21Navigation);const row=drift[key][index];
    if(row.min)row.min.x+=.001;else if(row.box)row.box.min.x+=.001;else row.minX+=.001;
    for(const value of[missing,duplicate,drift]){
      assert.throws(()=>restorePreR19Navigation(value));
      assert.throws(()=>restorePreR18Navigation(value));
    }
  }
  const reordered=clone(historicalR21Navigation);[reordered.colliders[2115],reordered.colliders[2118]]=[reordered.colliders[2118],reordered.colliders[2115]];
  assert.throws(()=>restorePreR19Navigation(reordered));
  assert.throws(()=>restorePreR19Navigation({...historicalR21Navigation,extra:[]}));
});

test('historical R19 scene changes only 三台 by minus 288 triangles after only54 buried lower caps are omitted with exact material/geometry identity',()=>{
  assert.equal(hash(historicalR19Scene),scene.afterSHA256);
  assert.deepEqual(historicalR19Scene['三台'],scene.after);
  assert.equal(scene.after.meshes,42);
  assert.equal(scene.after.triangles-scene.before.triangles,-288);
  assert.equal(Object.keys(scene.unchanged).length,7);
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(historicalR19Scene[name],row);
  const restored=restorePreR19SceneRows(historicalR19Scene);
  assert.equal(hash(restored),scene.beforeSHA256);
  assert.equal(hash(historicalR19Scene),scene.afterSHA256);
  assert.equal(restorePreR19SceneRows(restored),restored);
  assert.deepEqual(restorePreR19SceneRow('三台',historicalR19Scene['三台']),scene.before);
  assert.deepEqual(restorePreR18SceneRow('三台',historicalR19Scene['三台']),previousScene.before);
  assert.equal(hash(restorePreR18SceneRows(historicalR19Scene)),previousScene.beforeSHA256);
});

test('R19 scene rejects missing/extra/unrelated groups and same-count hash or material drift',()=>{
  for(const name of Object.keys(historicalR19Scene)){
    const missing=clone(historicalR19Scene);delete missing[name];
    const drift=clone(historicalR19Scene);drift[name].triangles++;
    const identity=clone(historicalR19Scene);identity[name].hash='changed-geometry-or-material';
    for(const bad of[missing,drift,identity]){
      assert.throws(()=>restorePreR19SceneRows(bad));
      assert.throws(()=>restorePreR18SceneRows(bad));
    }
  }
  assert.throws(()=>restorePreR19SceneRows({...historicalR19Scene,extra:historicalR19Scene['午门']}));
  assert.throws(()=>restorePreR19SceneRow('三台',{...scene.after,hash:scene.before.hash}));
  assert.throws(()=>restorePreR19SceneRow('三台',{...scene.after,triangles:scene.after.triangles+1}));
});

for(const[kind,rows]of Object.entries({fixed,auto})){
  test(`historical R19 ${kind} routes bind the reviewed full collection and historical reverse`,()=>{
    assert.equal(rows.length,kind==='fixed'?33:59);
    if(kind==='auto')assert.equal(routes[kind].beforeSHA256,routes[kind].afterSHA256);
    assert.equal(hash(rows),routes[kind].afterSHA256);
    assert.equal(assertR19RouteIdentity(kind,rows),rows);
    if(kind==='fixed'){
      const d=routes.fixed,restored=restorePreR19FixedRoutes(rows);
      assert.equal(hash(restored),d.beforeSHA256);assert.equal(restorePreR19FixedRoutes(restored),restored);
      assert.deepEqual(rows[d.index],d.after);assert.deepEqual(restored[d.index],d.before);
      assert.deepEqual(d.before.pts[0],d.after.pts[0]);assert.deepEqual(d.before.pts.at(-1),d.after.pts.at(-1));
      assert.equal(d.after.pts.length,d.before.pts.length+2);
      for(let i=0;i<rows.length;i++)if(i!==d.index)assert.deepEqual(rows[i],restored[i]);
      assert.throws(()=>assertR19RouteIdentity('fixed',restored),'historical routes cannot pass current acceptance');
      assert.deepEqual(restorePreR19BaoheTraversalRoute(d.after),d.before);
    }
  });
  test(`R19 ${kind} route check rejects missing/duplicate/reordered/drifted points and metadata`,()=>{
    const missing=clone(rows);missing.pop();
    const duplicate=clone(rows);duplicate.push(clone(duplicate[0]));
    const reordered=clone(rows);[reordered[0],reordered[1]]=[reordered[1],reordered[0]];
    const point=clone(rows);point[0].pts[0][0]+=.001;
    const metadata=clone(rows);metadata[0].name+=' changed';
    for(const bad of[missing,duplicate,reordered,point,metadata]){
      assert.throws(()=>assertR19RouteIdentity(kind,bad));
      if(kind==='fixed')assert.throws(()=>restorePreR19FixedRoutes(bad));
    }
    if(kind==='fixed')for(const index of[0,routes.fixed.index]){
      const changed=clone(rows);changed[index].pts.splice(-1,0,[0,134]);
      assert.throws(()=>restorePreR19FixedRoutes(changed));
      if(index===routes.fixed.index)assert.throws(()=>restorePreR19BaoheTraversalRoute(changed[index]));
    }
  });
}

for(const[path,d]of Object.entries(source.testFiles)){
  test('historical R19 exact tests-only route source binds and restores the older source: '+path,()=>{
    const bytes=restorePreR22RouteSource(path,fs.readFileSync(new URL(path,root)));assert.equal(sha(bytes),d.candidateSHA256);
    assert.equal(d.deltas.length,1);assert.equal(sha(restorePreR19Source(path,bytes)),d.baselineSHA256);
    assert.equal(sha(restorePreR18Source(path,bytes)),d.baselineSHA256);
    const text=bytes.toString(),bad=[text+'\n','// unrelated\n'+text];
    for(const h of d.deltas)for(const replacement of['',h.after+h.after])bad.push(text.replace(h.after,replacement));
    for(const value of bad){assert.throws(()=>restorePreR19Source(path,Buffer.from(value)));assert.throws(()=>restorePreR18Source(path,Buffer.from(value)));}
  });
}
