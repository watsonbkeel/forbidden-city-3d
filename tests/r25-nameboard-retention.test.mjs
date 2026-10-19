import {r30Source} from './lib/r30-qianqing-passage-retention.mjs';
import {r29Source} from './lib/r29-qianqing-retention.mjs';
import {restorePreR28Source,r28Source} from './lib/r28-jiaotai-central-retention.mjs';
import r27Source from './fixtures/r27-jiaotai-source-delta.json' with {type:'json'};
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {HistoricalR25PalaceBuilder as PalaceBuilder} from './lib/historical-r25-nameboard-fixture.mjs';
import {restorePreR26Source} from './lib/r26-qianqing-retention.mjs';
import r26Source from './fixtures/r26-qianqing-source-delta.json' with {type:'json'};
import friezeSource from './fixtures/r26-qianqing-frieze-source-delta.json' with {type:'json'};
import {HistoricalR24PalaceBuilder} from './lib/historical-r24-baohe-fixture.mjs';
import {captureNameboardScene} from './lib/r25-nameboard-capture.mjs';
import {restorePreR25Source,assertR25AddedSource,assertR25RetainedSource,restorePreR25SceneRow,restorePreR25SceneRows,restorePreR25MeshRows,assertR25NavigationIdentity} from './lib/r25-nameboard-retention.mjs';
import {restorePreR24Source,restorePreR24SceneRows} from './lib/r24-baohe-retention.mjs';
import {restorePreR23Source,restorePreR23SceneRows} from './lib/r23-baohe-retention.mjs';
import {restorePreR22Source,restorePreR22SceneRows} from './lib/r22-baohe-retention.mjs';
import {restorePreR21Source,restorePreR21SceneRows} from './lib/r21-baohe-retention.mjs';
import {restorePreR20Source,restorePreR20SceneRows} from './lib/r20-baohe-retention.mjs';
import source from './fixtures/r25-nameboard-source-delta.json' with {type:'json'};
import scene from './fixtures/r25-nameboard-scene-delta.json' with {type:'json'};
import priorSource from './fixtures/r24-baohe-source-delta.json' with {type:'json'};
import priorScene from './fixtures/r24-baohe-scene-delta.json' with {type:'json'};
import r23Scene from './fixtures/r23-baohe-scene-delta.json' with {type:'json'};
import r22Scene from './fixtures/r22-baohe-scene-delta.json' with {type:'json'};
import r21Scene from './fixtures/r21-baohe-scene-delta.json' with {type:'json'};
import r20Scene from './fixtures/r20-baohe-scene-delta.json' with {type:'json'};

const root=new URL('../',import.meta.url),read=p=>restorePreR28Source(p,fs.readFileSync(new URL(p,root)));
const sha=x=>createHash('sha256').update(x).digest('hex'),hash=x=>sha(JSON.stringify(x)),clone=structuredClone;
const current=captureNameboardScene(PalaceBuilder),historical=captureNameboardScene(HistoricalR24PalaceBuilder);
const sourceChain=[restorePreR25Source,restorePreR24Source,restorePreR23Source,restorePreR22Source,restorePreR21Source,restorePreR20Source];
const sceneChain=[restorePreR25SceneRows,restorePreR24SceneRows,restorePreR23SceneRows,restorePreR22SceneRows,restorePreR21SceneRows,restorePreR20SceneRows];

test('R25 provenance binds the frozen R24 baseline, three source hunks and every preceding fixture byte',()=>{
  assert.equal(sha(read('tests/fixtures/r25-nameboard-source-delta.json')),'be2698cfc8802e8464b4915f3ebff51cbbe446ccd5dd8db17d37fb690c32611a');
  assert.equal(sha(read('tests/fixtures/r25-nameboard-scene-delta.json')),'dfcf5a9a9f0b14bc665b132dbcf8938f93db31024bcb8ef9ecc6881eddba34b9');
  for(const f of[source,scene]){
    assert.equal(f.base,'bb678753c71ba59b9766e464b135b1a51596f11b');
    assert.equal(f.baseTree,'0499496e8a3ececa8b2b29a0a0d8eb77c2fee723');
    assert.equal(f.candidate,'e383dd8dc71cb656184c18e58c592bcab7e5987a');
    assert.match(f.scope,/Historical assertions only/);
  }
  assert.deepEqual(Object.keys(source.files),['src/scene/PalaceBuilder.js']);
  assert.deepEqual(Object.keys(source.addedFiles),['src/scene/palace/HallNameboardMount.js']);
  assert.equal(source.files['src/scene/PalaceBuilder.js'].baselineSHA256,priorSource.files['src/scene/PalaceBuilder.js'].candidateSHA256);
  assert.equal(scene.beforeSHA256,priorScene.afterSHA256);
  assert.deepEqual(scene.names,['三台','后三宫']);
  assert.deepEqual(scene.changes['三台'].before,priorScene.after);
  assert.deepEqual(scene.changes['后三宫'].before,priorScene.unchanged['后三宫']);
  assert.equal(scene.navigationSHA256,priorScene.navigationSHA256);
  assert.equal(Object.keys(source.preservedFixtures).length,102);
  for(const[path,digest]of Object.entries(source.preservedFixtures))assert.equal(sha(read(path)),digest,path);
  for(const[path,digest]of Object.entries(priorSource.retainedFiles))assert.equal(source.retainedFiles[path],digest,path);
  const actual=fs.readdirSync(new URL('src/',root),{recursive:true,withFileTypes:true}).filter(x=>x.isFile()).map(x=>new URL(x.parentPath+'/'+x.name,'file:').pathname.slice(root.pathname.length)).sort();
  assert.deepEqual([...Object.keys(source.files),...Object.keys(source.addedFiles),...Object.keys(source.retainedFiles).filter(p=>p.startsWith('src/')),...Object.keys(r26Source.addedFiles),...Object.keys(friezeSource.addedFiles),...Object.keys(r27Source.addedFiles),...Object.keys(r28Source.addedFiles),...Object.keys(r30Source.addedFiles),...Object.keys(r29Source.addedFiles).filter(p=>p.startsWith('src/'))].sort(),actual);
});

test('complete R25 builder reverses three unique hunks, retains art source and feeds the complete prior source chain',()=>{
  const path='src/scene/PalaceBuilder.js',bytes=restorePreR26Source(path,read(path)),original=Buffer.from(bytes),d=source.files[path],text=bytes.toString();
  assert.equal(sha(bytes),d.candidateSHA256);assert.equal(d.deltas.length,3);
  for(const h of d.deltas){assert.ok(h.before.length&&h.after.length);assert.equal(text.split(h.after).length,2);}
  const out=restorePreR25Source(path,bytes);
  assert.equal(sha(out),d.baselineSHA256);assert.equal(restorePreR25Source(path,out),out);
  for(const h of d.deltas)assert.equal(out.toString().split(h.before).length,2);
  assert.equal(sha(restorePreR24Source(path,bytes)),priorSource.files[path].baselineSHA256);
  for(const restore of sourceChain.slice(2))assert.notEqual(sha(restore(path,bytes)),sha(bytes));
  assert.equal(PalaceBuilder.prototype.plaqueMesh.toString(),HistoricalR24PalaceBuilder.prototype.plaqueMesh.toString(),'entire existing dimensions/material/art factory is retained');
  assert.deepEqual(bytes,original,'no runtime overwrite');
});

test('R25 and all older source chains reject empty, unknown, appended, partial and duplicated source',()=>{
  const path='src/scene/PalaceBuilder.js',text=restorePreR26Source(path,read(path)).toString(),d=source.files[path],needle='const lacquer =';
  assert.equal(text.split(needle).length,2);
  const bad=['',text+'\n',text+text,'// unrelated\n'+text,text.replace(needle,needle+' /* unrelated */')];
  for(const h of d.deltas)for(const replacement of['',h.before,h.after+h.after])bad.push(text.replace(h.after,replacement));
  for(const value of bad){assert.notEqual(value,text);for(const restore of sourceChain)assert.throws(()=>restore(path,Buffer.from(value)));}
  const before=restorePreR25Source(path,read(path)).toString();
  for(const value of[before+'\n',before+before,before.replace(needle,needle+' /* unknown */')])assert.throws(()=>restorePreR25Source(path,Buffer.from(value)));
  assert.throws(()=>restorePreR25Source(path,restorePreR24Source(path,read(path))),'older R23 is not an R25/R24 identity');
});

test('added module and every retained runtime/route source reject unknown, absent, appended and duplicate bytes',()=>{
  for(const[paths,check]of[[source.addedFiles,assertR25AddedSource],[source.retainedFiles,assertR25RetainedSource]]){
    for(const path of Object.keys(paths)){
      const bytes=read(path),changed=Buffer.from(bytes);changed[Math.floor(changed.length/2)]^=1;
      assert.equal(check(path,bytes),bytes);
      for(const bad of[Buffer.alloc(0),Buffer.concat([bytes,bytes]),Buffer.concat([bytes,Buffer.from('\n')]),changed])assert.throws(()=>check(path,bad),path);
    }
    assert.throws(()=>check('src/scene/palace/Unregistered.js',read('src/scene/palace/HallNameboardMount.js')));
  }
});

test('portable historical R24 fixture binds dependencies without sibling, Git, network or live-builder fallback',()=>{
  const text=read('tests/lib/historical-r24-baohe-fixture.mjs').toString();
  assert.match(text,/restorePreR25Source\(path,read\(path\)\)/);
  assert.match(text,/assertR25AddedSource\(path,read\(path\)\)/);
  assert.match(text,/assertR25RetainedSource\(path,read\(path\)\)/);
  assert.doesNotMatch(text,/child_process|execSync|execFile|fetch\(|https?:\/\/|forbidden-city-3d-r24-baohe-rear|import\s*\{\s*PalaceBuilder\s*\}\s*from/);
  assert.notEqual(PalaceBuilder,HistoricalR24PalaceBuilder);
  assert.notEqual(hash(historical.rows),scene.afterSHA256);
});

test('complete frozen R25 scene differs from independent R24 only at the three retained board matrices and metadata',()=>{
  assert.equal(hash(current.rows),scene.afterSHA256);assert.equal(hash(historical.rows),scene.beforeSHA256);
  assert.equal(hash(current.meshes),scene.afterMeshesSHA256);assert.equal(hash(historical.meshes),scene.beforeMeshesSHA256);
  assert.equal(current.meshes.length,scene.meshCount);assert.equal(current.meshes.length,historical.meshes.length);
  assert.equal(current.geometryBytes,scene.geometryBytes);assert.equal(current.geometryBytes,historical.geometryBytes);
  assert.deepEqual(current.materials,historical.materials);assert.equal(hash(current.materials),scene.materialsSHA256);
  const changes=[];
  for(let i=0;i<current.meshes.length;i++)if(hash(current.meshes[i])!==hash(historical.meshes[i])){
    const a=historical.meshes[i],b=current.meshes[i];
    assert.deepEqual(Object.keys(a).filter(key=>hash(a[key])!==hash(b[key])),['matrix','userData']);
    assert.deepEqual({...b.userData,hallNameboardMount:undefined},{...a.userData,hallNameboardMount:undefined});
    changes.push({index:i,before:a,after:b});
  }
  assert.deepEqual(changes,scene.meshChanges);assert.equal(changes.length,3);
  assert.deepEqual(changes.map(x=>x.after.userData.hallNameboardMount.name),['太和殿','保和殿','乾清宫']);
  assert.deepEqual(restorePreR25MeshRows(current.meshes),historical.meshes);
  assert.equal(restorePreR25MeshRows(historical.meshes),historical.meshes);
  assert.deepEqual(restorePreR25SceneRows(current.rows),historical.rows);
  assert.equal(restorePreR25SceneRows(historical.rows),historical.rows);
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(current.rows[name],row,name);
  for(const name of scene.names){assert.deepEqual(restorePreR25SceneRow(name,current.rows[name]),historical.rows[name]);assert.equal(current.rows[name].meshes,historical.rows[name].meshes);assert.equal(current.rows[name].triangles,historical.rows[name].triangles);}
  for(const[restore,digest]of[[restorePreR24SceneRows,priorScene.beforeSHA256],[restorePreR23SceneRows,r23Scene.beforeSHA256],[restorePreR22SceneRows,r22Scene.beforeSHA256],[restorePreR21SceneRows,r21Scene.beforeSHA256],[restorePreR20SceneRows,r20Scene.beforeSHA256]])assert.equal(hash(restore(current.rows)),digest);
});

test('whole-scene mapping rejects absent, extra, wrong and partial group changes without masking historical drift',()=>{
  for(const rows of[current.rows,historical.rows])for(const name of Object.keys(rows)){
    const missing=clone(rows);delete missing[name];
    const count=clone(rows);count[name].triangles++;
    const identity=clone(rows);identity[name].hash='unknown';
    for(const bad of[missing,count,identity,{...rows,extra:rows[name]}])for(const restore of sceneChain)assert.throws(()=>restore(bad));
  }
  for(const name of scene.names){
    const partial=clone(current.rows);partial[name]=clone(historical.rows[name]);
    for(const restore of sceneChain)assert.throws(()=>restore(partial));
    for(const rows of[current.rows,historical.rows])for(const bad of[{...rows[name],hash:'unknown'},{...rows[name],meshes:rows[name].meshes+1},{...rows[name],extra:true}])assert.throws(()=>restorePreR25SceneRow(name,bad));
  }
  assert.throws(()=>restorePreR25SceneRows(restorePreR24SceneRows(current.rows)));
});

test('complete mesh mapping rejects geometry, material, matrix, metadata, order and extra unrelated changes',()=>{
  for(const rows of[current.meshes,historical.meshes]){
    for(const index of[0,...scene.meshChanges.map(x=>x.index),rows.length-1]){
      const missing=clone(rows);missing.splice(index,1);
      const duplicate=clone(rows);duplicate.splice(index,0,clone(rows[index]));
      const reordered=clone(rows),other=index===0?1:index-1;[reordered[index],reordered[other]]=[reordered[other],reordered[index]];
      const matrix=clone(rows);matrix[index].matrix[13]+=.001;
      const data=clone(rows);data[index].userData.extra=true;
      for(const bad of[missing,duplicate,reordered,matrix,data])assert.throws(()=>restorePreR25MeshRows(bad));
      for(const key of['geometrySHA256','materialSHA256','name','group']){const bad=clone(rows);bad[index][key]='unknown';assert.throws(()=>restorePreR25MeshRows(bad));}
      for(const key of['visible','castShadow','receiveShadow']){const bad=clone(rows);bad[index][key]=!bad[index][key];assert.throws(()=>restorePreR25MeshRows(bad));}
    }
  }
  for(const d of scene.meshChanges){const partial=clone(current.meshes);partial[d.index]=clone(d.before);assert.throws(()=>restorePreR25MeshRows(partial));}
});

test('all 2487 colliders and 120 walkables retain exact complete R24 identity and order',()=>{
  assert.equal(assertR25NavigationIdentity(current.navigation),current.navigation);
  assert.equal(assertR25NavigationIdentity(historical.navigation),historical.navigation);
  assert.equal(JSON.stringify(current.navigation),JSON.stringify(historical.navigation));
  assert.deepEqual([current.navigation.colliders.length,current.navigation.walkables.length],[2487,120]);
  for(const key of['colliders','walkables'])for(const index of key==='colliders'?[0,2154,2165,2170,2486]:[0,103,119]){
    const missing=clone(current.navigation);missing[key].splice(index,1);
    const duplicate=clone(current.navigation);duplicate[key].splice(index,0,clone(duplicate[key][index]));
    const drift=clone(current.navigation),row=drift[key][index];if(row.min)row.min.x+=.001;else if(row.box)row.box.min.x+=.001;else row.minX+=.001;
    const reordered=clone(current.navigation),other=index===0?1:index-1;[reordered[key][index],reordered[key][other]]=[reordered[key][other],reordered[key][index]];
    for(const bad of[missing,duplicate,drift,reordered])assert.throws(()=>assertR25NavigationIdentity(bad));
  }
  assert.throws(()=>assertR25NavigationIdentity({...current.navigation,extra:[]}));
});
