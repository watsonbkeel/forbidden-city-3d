import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {library,sceneRows} from './lib/inner-palace-fixture.mjs';
import {HistoricalR23PalaceBuilder} from './lib/historical-r23-baohe-fixture.mjs';
import {restorePreR24Source,assertR24AddedSource,assertR24RetainedSource,restorePreR24SceneRow,restorePreR24SceneRows,assertR24NavigationIdentity} from './lib/r24-baohe-retention.mjs';
import {restorePreR23Source,restorePreR23SceneRows} from './lib/r23-baohe-retention.mjs';
import {restorePreR22Source,restorePreR22SceneRows,restorePreR22Navigation} from './lib/r22-baohe-retention.mjs';
import {restorePreR21Source,restorePreR21SceneRows} from './lib/r21-baohe-retention.mjs';
import {restorePreR20Source,restorePreR20SceneRows} from './lib/r20-baohe-retention.mjs';
import source from './fixtures/r24-baohe-source-delta.json' with {type:'json'};
import scene from './fixtures/r24-baohe-scene-delta.json' with {type:'json'};
import priorSource from './fixtures/r23-baohe-source-delta.json' with {type:'json'};
import priorScene from './fixtures/r23-baohe-scene-delta.json' with {type:'json'};
import r22Source from './fixtures/r22-baohe-source-delta.json' with {type:'json'};
import r22Scene from './fixtures/r22-baohe-scene-delta.json' with {type:'json'};
import priorNav from './fixtures/r22-baohe-navigation-delta.json' with {type:'json'};
import r21Scene from './fixtures/r21-baohe-scene-delta.json' with {type:'json'};
import r20Scene from './fixtures/r20-baohe-scene-delta.json' with {type:'json'};

const root=new URL('../',import.meta.url),sha=x=>createHash('sha256').update(x).digest('hex');
const hash=x=>sha(JSON.stringify(x)),clone=x=>JSON.parse(JSON.stringify(x)),read=path=>fs.readFileSync(new URL(path,root));
function capture(Builder){
  const s=new THREE.Scene(),b=new Builder(s,library());
  try{
    b.buildAll(PALACE_LAYOUT);let geometryBytes=0;const materials=[];
    for(const group of s.children){
      const groupMaterials=[];
      group.traverse(m=>{
        if(!m.isMesh)return;
        for(const a of Object.values(m.geometry.attributes))geometryBytes+=a.array.byteLength;
        geometryBytes+=m.geometry.index?.array.byteLength??0;
        groupMaterials.push({name:m.material.name,type:m.material.type,color:m.material.color?.getHex(),emissive:m.material.emissive?.getHex(),emissiveIntensity:m.material.emissiveIntensity,roughness:m.material.roughness,metalness:m.material.metalness,side:m.material.side,transparent:m.material.transparent,opacity:m.material.opacity,depthWrite:m.material.depthWrite,map:!!m.material.map,castShadow:m.castShadow,receiveShadow:m.receiveShadow});
      });
      materials.push([group.name,groupMaterials]);
    }
    return{rows:sceneRows(s),navigation:clone({colliders:b.colliders,walkables:b.walkables}),geometryBytes,materials};
  }finally{b.dispose();}
}
const current=capture(PalaceBuilder),historicalR23=capture(HistoricalR23PalaceBuilder);

test('R24 provenance freezes one builder edit, one added module, exact R23 baseline and all prior fixture hashes',()=>{
  assert.equal(sha(read('tests/fixtures/r24-baohe-source-delta.json')),'66cd73cd56124b42995886aca458663b2b7050c4b41d03729dd6fe3a488a17e8');
  assert.equal(sha(read('tests/fixtures/r24-baohe-scene-delta.json')),'7517363591f918c3fa396e13c322669b49810fb93d38c30434a69e36d63cc8cf');
  for(const f of[source,scene]){
    assert.equal(f.base,'9a2bed6bde1d42b309b95e7d897d679c5db497d5');
    assert.equal(f.baseTree,'c1b3c6c53bbdf1c66bc62fb4a5a7c0492c2a0f06');
    assert.equal(f.candidate,'838b6846ca8732c5d834b572ed927210061a4c3d');
    assert.match(f.scope,/Historical assertions only/);
  }
  assert.deepEqual(Object.keys(source.files),['src/scene/PalaceBuilder.js']);
  assert.deepEqual(Object.keys(source.addedFiles),['src/scene/palace/BaoheRearEnclosure.js']);
  assert.equal(source.files['src/scene/PalaceBuilder.js'].baselineSHA256,priorSource.files['src/scene/PalaceBuilder.js'].candidateSHA256);
  assert.equal(scene.beforeSHA256,priorScene.afterSHA256);assert.deepEqual(scene.before,priorScene.after);assert.deepEqual(scene.unchanged,priorScene.unchanged);
  assert.equal(scene.navigationSHA256,priorScene.navigationSHA256);assert.equal(scene.navigationSHA256,priorNav.afterSHA256);
  assert.equal(Object.keys(source.preservedFixtures).length,6);
  for(const[path,digest]of Object.entries(source.preservedFixtures))assert.equal(sha(read(path)),digest,path);
  for(const[path,digest]of Object.entries(priorSource.retainedFiles))assert.equal(source.retainedFiles[path],digest,path);
  for(const path of['src/scene/palace/BaoheFrontDoors.js','src/scene/palace/BaoheFrontEnclosure.js'])
    assert.equal(source.retainedFiles[path],(priorSource.files[path]??priorSource.addedFiles[path]).candidateSHA256);
});

for(const[path,d]of Object.entries(source.files)){
  test('exact current R24 bytes reverse two unique hunks into frozen R23 and the complete older source chain: '+path,()=>{
    const bytes=read(path),original=Buffer.from(bytes),text=bytes.toString();
    assert.equal(sha(bytes),d.candidateSHA256);assert.equal(d.deltas.length,2);
    for(const h of d.deltas){assert.ok(h.before.length&&h.after.length);assert.equal(text.split(h.after).length,2);}
    const restored=restorePreR24Source(path,bytes);
    assert.equal(sha(restored),d.baselineSHA256);assert.equal(restorePreR24Source(path,restored),restored);
    for(const h of d.deltas)assert.equal(restored.toString().split(h.before).length,2);
    assert.equal(sha(restorePreR23Source(path,bytes)),priorSource.files[path].baselineSHA256);
    assert.equal(sha(restorePreR22Source(path,bytes)),r22Source.files[path].baselineSHA256);
    assert.deepEqual(bytes,original,'live runtime bytes are never overwritten');
  });
  test('R24 and older source chains reject absent, unknown, appended, duplicate and partially reversed bytes: '+path,()=>{
    const text=read(path).toString(),needle='const lacquer =';assert.equal(text.split(needle).length,2);
    const bad=['',text+'\n',text+text,'// unrelated change\n'+text,text.replace(needle,needle+' /* unrelated */')];
    for(const h of d.deltas)for(const replacement of['',h.before,h.after+h.after])bad.push(text.replace(h.after,replacement));
    for(const value of bad){
      assert.notEqual(value,text);
      for(const restore of[restorePreR24Source,restorePreR23Source,restorePreR22Source,restorePreR21Source,restorePreR20Source])assert.throws(()=>restore(path,Buffer.from(value)));
    }
    const before=restorePreR24Source(path,read(path)).toString();
    for(const value of[before+'\n',before+before,before.replace(needle,needle+' /* unrelated */')])assert.throws(()=>restorePreR24Source(path,Buffer.from(value)));
    assert.throws(()=>restorePreR24Source(path,restorePreR23Source(path,read(path))),'R22 is not an R24/R23 identity');
  });
}

for(const[path,d]of Object.entries(source.addedFiles))test('entire R24 rear-wall module rejects unknown, absent, appended and duplicated bytes: '+path,()=>{
  const bytes=read(path),text=bytes.toString();assert.equal(sha(bytes),d.candidateSHA256);assert.equal(assertR24AddedSource(path,bytes),bytes);
  const needle='wallDepth: 1,';assert.equal(text.split(needle).length,2);
  for(const value of['',text+'\n',text+text,text.replace(needle,'wallDepth: .9,')])assert.throws(()=>assertR24AddedSource(path,Buffer.from(value)));
  assert.throws(()=>assertR24AddedSource('src/scene/palace/Unregistered.js',bytes));
});

for(const[path,digest]of Object.entries(source.retainedFiles))test('R24 retains complete prior dependencies, front facade, controls and route/driver bytes: '+path,()=>{
  const bytes=read(path);assert.equal(sha(bytes),digest);assert.equal(assertR24RetainedSource(path,bytes),bytes);
  const changed=Buffer.from(bytes);changed[Math.floor(changed.length/2)]^=1;
  for(const value of[Buffer.alloc(0),Buffer.concat([bytes,bytes]),Buffer.concat([bytes,Buffer.from('\n')]),changed])assert.throws(()=>assertR24RetainedSource(path,value));
  assert.throws(()=>assertR24RetainedSource('src/scene/palace/Unregistered.js',bytes));
});

test('portable frozen R23 fixture has no sibling-checkout, Git, network or current-builder fallback',()=>{
  const text=read('tests/lib/historical-r23-baohe-fixture.mjs').toString();
  assert.match(text,/restorePreR24Source\(path,read\(path\)\)/);
  assert.match(text,/assertR24AddedSource\(path,read\(path\)\)/);
  assert.match(text,/assertR24RetainedSource\(path,read\(path\)\)/);
  assert.doesNotMatch(text,/child_process|execSync|execFile|fetch\(|https?:\/\/|forbidden-city-3d-r23-baohe-facade|import\s*\{\s*PalaceBuilder\s*\}\s*from/);
  assert.notEqual(HistoricalR23PalaceBuilder,PalaceBuilder);
  assert.notEqual(hash(historicalR23.rows),scene.afterSHA256,'historical fixture cannot pass live R24 geometry identity');
});

test('actual complete R24 groups restore independent R23 with 48 fewer triangles, 4608 fewer bytes and unchanged batches/materials',()=>{
  assert.equal(hash(current.rows),scene.afterSHA256);assert.equal(hash(historicalR23.rows),scene.beforeSHA256);
  assert.deepEqual(current.rows['三台'],scene.after);assert.deepEqual(historicalR23.rows['三台'],scene.before);
  assert.equal(scene.after.triangles-scene.before.triangles,-48);assert.equal(scene.after.meshes,scene.before.meshes);
  assert.equal(current.geometryBytes,scene.afterGeometryBytes);assert.equal(historicalR23.geometryBytes,scene.beforeGeometryBytes);
  assert.equal(current.geometryBytes-historicalR23.geometryBytes,-4608);
  assert.deepEqual(current.materials,historicalR23.materials);assert.equal(hash(current.materials),scene.materialsSHA256);
  assert.equal(Object.keys(scene.unchanged).length,7);
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(current.rows[name],row);
  const restored=restorePreR24SceneRows(current.rows);assert.deepEqual(restored,historicalR23.rows);assert.equal(restorePreR24SceneRows(restored),restored);
  assert.deepEqual(restorePreR24SceneRow('三台',current.rows['三台']),scene.before);assert.equal(hash(current.rows),scene.afterSHA256);
  assert.equal(hash(restorePreR23SceneRows(current.rows)),priorScene.beforeSHA256);
  assert.equal(hash(restorePreR22SceneRows(current.rows)),r22Scene.beforeSHA256);
  assert.equal(hash(restorePreR21SceneRows(current.rows)),r21Scene.beforeSHA256);
  assert.equal(hash(restorePreR20SceneRows(current.rows)),r20Scene.beforeSHA256);
});

test('whole-scene reversal rejects missing, extra and count-preserving geometry/material identity drift in current and frozen input',()=>{
  for(const rows of[current.rows,historicalR23.rows]){
    for(const name of Object.keys(rows)){
      const missing=clone(rows);delete missing[name];
      const count=clone(rows);count[name].triangles++;
      const identity=clone(rows);identity[name].hash='unknown-geometry-material';
      for(const bad of[missing,count,identity,{...rows,extra:rows[name]}])
        for(const restore of[restorePreR24SceneRows,restorePreR23SceneRows,restorePreR22SceneRows,restorePreR21SceneRows,restorePreR20SceneRows])assert.throws(()=>restore(bad));
    }
    for(const bad of[{...rows['三台'],hash:'unknown'},{...rows['三台'],meshes:rows['三台'].meshes+1},{...rows['三台'],extra:true}])assert.throws(()=>restorePreR24SceneRow('三台',bad));
  }
  assert.throws(()=>restorePreR24SceneRows(restorePreR23SceneRows(current.rows)),'R22 is not an R24/R23 scene');
});

test('all 2487 colliders and 120 walkables remain byte-identical to independent R23, without navigation reversal',()=>{
  assert.equal(assertR24NavigationIdentity(current.navigation),current.navigation);
  assert.equal(assertR24NavigationIdentity(historicalR23.navigation),historicalR23.navigation);
  assert.equal(JSON.stringify(current.navigation),JSON.stringify(historicalR23.navigation));
  assert.deepEqual([current.navigation.colliders.length,current.navigation.walkables.length],[2487,120]);
  assert.equal(hash(current.navigation),priorNav.afterSHA256);
  assert.equal(hash(restorePreR22Navigation(current.navigation)),priorNav.beforeSHA256);
});

test('navigation identity rejects missing, duplicated, reordered and unknown rear/front/unrelated rows and all walkable drift',()=>{
  for(const key of['colliders','walkables'])for(const index of key==='colliders'?[0,2154,2165,2170,2486]:[0,103,119]){
    const missing=clone(current.navigation);missing[key].splice(index,1);
    const duplicate=clone(current.navigation);duplicate[key].splice(index,0,clone(duplicate[key][index]));
    const drift=clone(current.navigation),row=drift[key][index];if(row.min)row.min.x+=.001;else if(row.box)row.box.min.x+=.001;else row.minX+=.001;
    for(const bad of[missing,duplicate,drift])assert.throws(()=>assertR24NavigationIdentity(bad));
    const reordered=clone(current.navigation),other=index===0?1:index-1;
    [reordered[key][index],reordered[key][other]]=[reordered[key][other],reordered[key][index]];
    assert.throws(()=>assertR24NavigationIdentity(reordered));
  }
  assert.throws(()=>assertR24NavigationIdentity({...current.navigation,extra:[]}));
});
