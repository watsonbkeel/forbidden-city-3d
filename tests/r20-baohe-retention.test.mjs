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
import {HistoricalR20PalaceBuilder} from './lib/historical-r20-baohe-fixture.mjs';
import {restorePreR21Source} from './lib/r21-baohe-retention.mjs';
import {HistoricalR19PalaceBuilder} from './lib/historical-r19-baohe-fixture.mjs';
import {restorePreR20Source,assertR20AddedSource,restorePreR20SceneRow,restorePreR20SceneRows} from './lib/r20-baohe-retention.mjs';
import {restorePreR19Source,restorePreR19SceneRows,assertR19RouteIdentity} from './lib/r19-baohe-retention.mjs';
import {restorePreR13SceneRow} from './lib/r13-plaque-retention.mjs';
import source from './fixtures/r20-baohe-source-delta.json' with {type:'json'};
import scene from './fixtures/r20-baohe-scene-delta.json' with {type:'json'};
import previousSource from './fixtures/r19-baohe-source-delta.json' with {type:'json'};
import previousScene from './fixtures/r19-baohe-scene-delta.json' with {type:'json'};
import previousNavigation from './fixtures/r19-baohe-navigation-delta.json' with {type:'json'};
import previousRoutes from './fixtures/r19-baohe-routes-delta.json' with {type:'json'};
import historicalR13 from './fixtures/r13-plaque-baseline.json' with {type:'json'};

const root=new URL('../',import.meta.url),sha=x=>createHash('sha256').update(x).digest('hex');
const hash=x=>sha(JSON.stringify(x)),clone=x=>JSON.parse(JSON.stringify(x));
function capture(Builder){
  const s=new THREE.Scene(),b=new Builder(s,library());b.buildAll(PALACE_LAYOUT);
  try{
    const rows=sceneRows(s),navigation=clone({colliders:b.colliders,walkables:b.walkables});
    const buffers=new Set(),materials=new Set(),privateShell=[];let bytes=0;
    s.traverse(m=>{if(!m.isMesh)return;
      for(const mat of(Array.isArray(m.material)?m.material:[m.material])){
        materials.add(mat);
        if(mat.userData.baoheInteriorShell)privateShell.push({name:mat.name,side:mat.side,triangles:(m.geometry.index?.count??m.geometry.attributes.position.count)/3});
      }
      for(const a of [...Object.values(m.geometry.attributes),...(m.geometry.index?[m.geometry.index]:[])]){
      if(!buffers.has(a.array.buffer)){buffers.add(a.array.buffer);bytes+=a.array.buffer.byteLength;}
    }});
    return {rows,navigation,bytes,materials:materials.size,privateShell,meshes:Object.values(rows).reduce((n,r)=>n+r.meshes,0),triangles:Object.values(rows).reduce((n,r)=>n+r.triangles,0)};
  }finally{b.dispose();}
}
// R20 assertions below intentionally execute exact frozen R20 source. Current
// R21 has its own direct acceptance; its navigation still runs unmodified here.
const current=capture(PalaceBuilder),frozenR20=capture(HistoricalR20PalaceBuilder),historical=capture(HistoricalR19PalaceBuilder);

test('R20 provenance binds only two changed sources and the new frame module; every original R19 fingerprint file stays byte-exact',()=>{
  for(const fixture of[source,scene]){
    assert.equal(fixture.base,'b0138937a1abc586aa916e128bd29f201f36263c');
    assert.equal(fixture.candidate,'9ee41d7dc3f0cb5332fe28216192c64bef4930c8');
  }
  assert.deepEqual(Object.keys(source.files),['src/scene/PalaceBuilder.js','src/scene/RoofBuilder.js']);
  assert.deepEqual(Object.keys(source.addedFiles),['src/scene/palace/BaoheInteriorFrame.js']);
  assert.equal(source.files['src/scene/PalaceBuilder.js'].baselineSHA256,previousSource.files['src/scene/PalaceBuilder.js'].candidateSHA256);
  assert.equal(scene.beforeSHA256,previousScene.afterSHA256);assert.deepEqual(scene.before,previousScene.after);
  assert.equal(Object.keys(source.preservedFixtures).length,4);
  for(const[path,digest]of Object.entries(source.preservedFixtures))assert.equal(sha(fs.readFileSync(new URL(path,root))),digest,path);
});

for(const[path,d]of Object.entries(source.files)){
  test('exact frozen R20 historical source restores frozen R19 before the original historical chain: '+path,()=>{
    const bytes=restorePreR21Source(path,fs.readFileSync(new URL(path,root)));assert.equal(sha(bytes),d.candidateSHA256);
    assert.equal(d.deltas.length,path.endsWith('/PalaceBuilder.js')?6:4);
    for(const h of d.deltas)assert.equal(bytes.toString().split(h.after).length,2);
    const restored=restorePreR20Source(path,bytes);
    assert.equal(sha(restored),d.baselineSHA256);assert.equal(restorePreR20Source(path,restored),restored);
    assert.equal(sha(bytes),d.candidateSHA256,'restoration never overwrites frozen R20 input');
    assert.equal(sha(restorePreR19Source(path,bytes)),path.endsWith('/PalaceBuilder.js')?previousSource.files[path].baselineSHA256:d.baselineSHA256);
  });
  test('R20 source rejects append/delete/duplicate/partial reverse and unrelated edits: '+path,()=>{
    const text=restorePreR21Source(path,fs.readFileSync(new URL(path,root))).toString(),bad=['',text+'\n','// unrelated\n'+text];
    for(const h of d.deltas)for(const replacement of['',h.after+h.after,h.before])bad.push(text.replace(h.after,replacement));
    for(const value of bad){assert.throws(()=>restorePreR20Source(path,Buffer.from(value)));assert.throws(()=>restorePreR19Source(path,Buffer.from(value)));}
  });
}

for(const[path,d]of Object.entries(source.addedFiles)){
  test('new R20 frame module is independently bound to complete exact bytes: '+path,()=>{
    const bytes=fs.readFileSync(new URL(path,root));assert.equal(sha(bytes),d.candidateSHA256);assert.equal(assertR20AddedSource(path,bytes),bytes);
  });
  test('new R20 frame rejects empty/duplicate/append/profile/source drift and unregistered module paths',()=>{
    const text=fs.readFileSync(new URL(path,root),'utf8');
    for(const value of['',text+text,text+'\n',text.replace('clearHeight: 9.6','clearHeight: 9.7'),text.replace('beamDepth: .35','beamDepth: .4'),text.replace('beamWidth: .6','beamWidth: .45'),text.replace('return i>=1','return i>=2')]){
      assert.notEqual(value,text);assert.throws(()=>assertR20AddedSource(path,Buffer.from(value)));
    }
    assert.throws(()=>assertR20AddedSource('src/scene/palace/Unregistered.js',Buffer.from(text)));
  });
}

test('historical frozen R20 exact scene reverses only 三台; frozen R19 builder reproduces the original scene independently',()=>{
  assert.equal(hash(frozenR20.rows),scene.afterSHA256);assert.deepEqual(frozenR20.rows['三台'],scene.after);
  assert.equal(hash(historical.rows),scene.beforeSHA256);assert.deepEqual(historical.rows['三台'],scene.before);
  assert.equal(Object.keys(scene.unchanged).length,7);
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(frozenR20.rows[name],row);
  const restored=restorePreR20SceneRows(frozenR20.rows);assert.deepEqual(restored,historical.rows);
  assert.equal(restorePreR20SceneRows(restored),restored);assert.equal(hash(frozenR20.rows),scene.afterSHA256);
  assert.deepEqual(restorePreR20SceneRow('三台',frozenR20.rows['三台']),scene.before);
  assert.equal(hash(restorePreR19SceneRows(frozenR20.rows)),previousScene.beforeSHA256);
});

test('R20 scene reverse rejects missing/extra/unrelated groups and count-preserving material/geometry drift',()=>{
  for(const name of Object.keys(frozenR20.rows)){
    const missing=clone(frozenR20.rows);delete missing[name];
    const count=clone(frozenR20.rows);count[name].triangles++;
    const identity=clone(frozenR20.rows);identity[name].hash='changed-geometry-or-material';
    for(const bad of[missing,count,identity]){assert.throws(()=>restorePreR20SceneRows(bad));assert.throws(()=>restorePreR19SceneRows(bad));}
  }
  assert.throws(()=>restorePreR20SceneRows({...frozenR20.rows,extra:frozenR20.rows['午门']}));
  for(const bad of[{...scene.after,hash:scene.before.hash},{...scene.after,triangles:scene.after.triangles+1}])assert.throws(()=>restorePreR20SceneRow('三台',bad));
});

test('R13 single-row entry restores exact R21, R20 and earlier identities without a mesh-count gate; rejects mutated rows',()=>{
  for(const row of[current.rows['三台'],frozenR20.rows['三台'],historical.rows['三台'],historicalR13.sceneAfter,historicalR13.sceneBefore])
    assert.deepEqual(restorePreR13SceneRow('三台',row),historicalR13.sceneBefore);
  for(const row of[current.rows['三台'],frozenR20.rows['三台'],historical.rows['三台'],historicalR13.sceneAfter,historicalR13.sceneBefore]){
    for(const bad of[{...row,hash:'unreviewed geometry/material'}, {...row,triangles:row.triangles+1}, {...row,meshes:row.meshes+1}, {...row,extra:true}])
      assert.throws(()=>restorePreR13SceneRow('三台',bad));
  }
  assert.throws(()=>restorePreR13SceneRow('三台',{...frozenR20.rows['三台'],meshes:42}));
  for(const[name,row]of Object.entries(scene.unchanged))assert.equal(restorePreR13SceneRow(name,row),row);
});

test('historical frozen R20 resident scene adds exactly132 triangles,12672 buffer bytes and two private material batches',()=>{
  assert.deepEqual([historical.meshes,historical.triangles,historical.bytes],[157,187630,18253748]);
  assert.deepEqual([frozenR20.meshes,frozenR20.triangles,frozenR20.bytes],[159,187762,18266420]);
  assert.equal(frozenR20.triangles-historical.triangles,132);assert.equal(frozenR20.bytes-historical.bytes,12672);
  assert.deepEqual([historical.materials,frozenR20.materials],[80,82]);assert.deepEqual(historical.privateShell,[]);
  assert.deepEqual(frozenR20.privateShell,[{name:'wood_column',side:THREE.DoubleSide,triangles:80},{name:'caihua_beam',side:THREE.DoubleSide,triangles:8}]);
});

test('all2475 colliders and120 walkables retain exact full R19 identity without navigation normalization',()=>{
  assert.equal(hash(current.navigation),previousNavigation.afterSHA256);
  assert.deepEqual(current.navigation,frozenR20.navigation);
  assert.deepEqual(frozenR20.navigation,historical.navigation);
  assert.deepEqual([frozenR20.navigation.colliders.length,frozenR20.navigation.walkables.length],[2475,120]);
});

test('all33 corrected fixed and59 automatic route objects retain original R19 identity',async()=>{
  const fixed=execFileSync(process.execPath,['tests/stepwalk.cjs','60','0','all'],{cwd:root,env:{...process.env,DUMP:'1'},encoding:'utf8'}).trim().split('\n').map(line=>{const at=line.indexOf(' ');return{name:line.slice(0,at),pts:JSON.parse(line.slice(at+1))};});
  const zones=loadZoneJsons(),world=await buildWorld({zones}),auto=buildAutoRoutes(world,zones.map(z=>z.json),{knownIssues:{}});
  for(const[kind,rows]of Object.entries({fixed,auto})){assert.equal(rows.length,kind==='fixed'?33:59);assert.equal(hash(rows),previousRoutes[kind].afterSHA256);assert.equal(assertR19RouteIdentity(kind,rows),rows);}
});
