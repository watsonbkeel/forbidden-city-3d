import {r30Source} from './lib/r30-qianqing-passage-retention.mjs';
import {r29Source} from './lib/r29-qianqing-retention.mjs';
import {restorePreR28Source,r28Source} from './lib/r28-jiaotai-central-retention.mjs';
import r27Source from './fixtures/r27-jiaotai-source-delta.json' with {type:'json'};
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {HistoricalR26WindowsPalaceBuilder as PalaceBuilder} from './lib/historical-r26-windows-fixture.mjs';
import {restorePreR26FriezeSource} from './lib/r26-qianqing-frieze-retention.mjs';
import friezeSource from './fixtures/r26-qianqing-frieze-source-delta.json' with {type:'json'};
import {HistoricalR25PalaceBuilder} from './lib/historical-r25-nameboard-fixture.mjs';
import {captureNameboardScene} from './lib/r25-nameboard-capture.mjs';
import {captureQianqingControl} from './lib/r26-qianqing-capture.mjs';
import {restorePreR26Source,assertR26AddedSource,assertR26RetainedSource,restorePreR26SceneRow,restorePreR26SceneRows,restorePreR26MeshRows,restorePreR26QianqingRows,assertR26NavigationIdentity} from './lib/r26-qianqing-retention.mjs';
import {restorePreR25Source,restorePreR25SceneRows,restorePreR25MeshRows} from './lib/r25-nameboard-retention.mjs';
import {restorePreR24Source,restorePreR24SceneRows} from './lib/r24-baohe-retention.mjs';
import source from './fixtures/r26-qianqing-source-delta.json' with {type:'json'};
import scene from './fixtures/r26-qianqing-scene-delta.json' with {type:'json'};
import priorSource from './fixtures/r25-nameboard-source-delta.json' with {type:'json'};
import priorScene from './fixtures/r25-nameboard-scene-delta.json' with {type:'json'};
const root=new URL('../',import.meta.url),read=p=>restorePreR28Source(p,fs.readFileSync(new URL(p,root)));
const sha=x=>createHash('sha256').update(x).digest('hex'),hash=x=>sha(JSON.stringify(x)),clone=structuredClone;
const current=captureNameboardScene(PalaceBuilder),historical=captureNameboardScene(HistoricalR25PalaceBuilder);
const qCurrent=captureQianqingControl(PalaceBuilder),qHistorical=captureQianqingControl(HistoricalR25PalaceBuilder);
const sourceChain=[restorePreR26Source,restorePreR25Source,restorePreR24Source],sceneChain=[restorePreR26SceneRows,restorePreR25SceneRows,restorePreR24SceneRows];

test('R26 provenance binds exact candidate/R25 source, all runtime dependencies and every prior fixture byte',()=>{
  assert.equal(sha(read('tests/fixtures/r26-qianqing-source-delta.json')),'17f698cb62c0fe4d49714410c9bb5ae9ce7ce8afc61912af58470a899bcb0ac6');
  assert.equal(sha(read('tests/fixtures/r26-qianqing-scene-delta.json')),'d23f2d49c36c93c38d4a9190cdb4cc52956ff9169bb89c6e96de2821aee505e0');
  for(const f of[source,scene]){
    assert.equal(f.base,'33ed2c2666b4477077ca0bc0912b477e106ebf40');
    assert.equal(f.baseTree,'ae7a21e2a50d2f3e1e9b10cc58b021583efab11c');
    assert.equal(f.candidate,'bad4ee29b12b2d079d6504de42516ac34d0e8868');assert.match(f.scope,/Historical assertions only/);
  }
  assert.deepEqual(Object.keys(source.files),['src/scene/PalaceBuilder.js']);
  assert.deepEqual(Object.keys(source.addedFiles),['src/scene/palace/QianqingFrontEnclosure.js']);
  assert.equal(source.files['src/scene/PalaceBuilder.js'].baselineSHA256,priorSource.files['src/scene/PalaceBuilder.js'].candidateSHA256);
  assert.equal(scene.beforeSHA256,priorScene.afterSHA256);assert.equal(scene.beforeMeshesSHA256,priorScene.afterMeshesSHA256);
  assert.equal(scene.beforeMaterialsSHA256,priorScene.materialsSHA256);assert.equal(scene.navigationSHA256,priorScene.navigationSHA256);
  assert.equal(Object.keys(source.preservedFixtures).length,104);
  for(const[path,digest]of Object.entries(source.preservedFixtures))assert.equal(sha(read(path)),digest,path);
  for(const[path,digest]of Object.entries(priorSource.retainedFiles))assert.equal(source.retainedFiles[path],digest,path);
  const actual=['src','data','public'].flatMap(dir=>fs.readdirSync(new URL(dir+'/',root),{recursive:true,withFileTypes:true}).filter(x=>x.isFile()).map(x=>path.relative(root.pathname,path.join(x.parentPath,x.name)))).sort();
  assert.deepEqual([...Object.keys(source.files),...Object.keys(source.addedFiles),...Object.keys(source.retainedFiles).filter(p=>/^(src|data|public)\//.test(p)),...Object.keys(friezeSource.addedFiles),...Object.keys(r27Source.addedFiles),...Object.keys(r28Source.addedFiles),...Object.keys(r30Source.addedFiles),...Object.keys(r29Source.addedFiles).filter(p=>/^(src|data|public)\//.test(p))].sort(),actual);
});

test('complete R26 builder reverses exactly three unique hunks without changing runtime or the older source chain',()=>{
  const path='src/scene/PalaceBuilder.js',bytes=restorePreR26FriezeSource(path,read(path)),original=Buffer.from(bytes),d=source.files[path];
  assert.equal(sha(bytes),d.candidateSHA256);assert.equal(d.deltas.length,3);
  for(const h of d.deltas){assert.ok(h.before.length&&h.after.length);assert.equal(bytes.toString().split(h.after).length,2);}
  const old=restorePreR26Source(path,bytes);assert.equal(sha(old),d.baselineSHA256);assert.equal(restorePreR26Source(path,old),old);
  for(const h of d.deltas)assert.equal(old.toString().split(h.before).length,2);
  assert.equal(sha(restorePreR25Source(path,bytes)),priorSource.files[path].baselineSHA256);
  assert.deepEqual(bytes,original);assert.equal(PalaceBuilder.prototype.plaqueMesh.toString(),HistoricalR25PalaceBuilder.prototype.plaqueMesh.toString());
  const needle='const lacquer =',text=bytes.toString();assert.equal(text.split(needle).length,2);
  const bad=['',text+'\n',text+text,'// unknown\n'+text,text.replace(needle,needle+' /* unknown */')];
  for(const h of d.deltas)for(const replacement of['',h.before,h.after+h.after])bad.push(text.replace(h.after,replacement));
  for(const value of bad){assert.notEqual(value,text);for(const restore of sourceChain)assert.throws(()=>restore(path,Buffer.from(value)));}
  for(const value of[old.toString()+'\n',old.toString()+old.toString()])assert.throws(()=>restorePreR26Source(path,Buffer.from(value)));
  assert.throws(()=>restorePreR26Source(path,restorePreR25Source(path,bytes)),'R24 is not an R25 or R26 builder');
});

test('added atlas and all retained source/asset dependencies reject missing, extra, duplicated and mutated bytes',()=>{
  for(const[paths,check]of[[source.addedFiles,assertR26AddedSource],[source.retainedFiles,assertR26RetainedSource]]){
    for(const path of Object.keys(paths)){
      const bytes=read(path),changed=Buffer.from(bytes);changed[Math.floor(changed.length/2)]^=1;
      assert.equal(check(path,bytes),bytes);
      for(const bad of[Buffer.alloc(0),Buffer.concat([bytes,bytes]),Buffer.concat([bytes,Buffer.from('\n')]),changed])assert.throws(()=>check(path,bad),path);
    }
    assert.throws(()=>check('src/scene/palace/Unregistered.js',read('src/scene/palace/QianqingFrontEnclosure.js')));
  }
});

test('portable historical R25 fixture binds exact sources without sibling, Git, network or live-builder fallback',()=>{
  const text=read('tests/lib/historical-r25-nameboard-fixture.mjs').toString();
  assert.match(text,/restorePreR26Source\(path,read\(path\)\)/);
  assert.match(text,/assertR26AddedSource\(path,read\(path\)\)/);assert.match(text,/assertR26RetainedSource\(path,read\(path\)\)/);
  assert.doesNotMatch(text,/child_process|execSync|execFile|fetch\(|https?:\/\/|forbidden-city-3d-r25-nameboard|import\s*\{\s*PalaceBuilder\s*\}\s*from/);
  assert.notEqual(PalaceBuilder,HistoricalR25PalaceBuilder);
});

test('complete current and historical scenes bind every mesh, material and geometry byte with only +1 merged mesh and +48 triangles',()=>{
  assert.equal(hash(current.rows),scene.afterSHA256);assert.equal(hash(historical.rows),scene.beforeSHA256);
  assert.equal(hash(current.meshes),scene.afterMeshesSHA256);assert.equal(hash(historical.meshes),scene.beforeMeshesSHA256);
  assert.equal(hash(current.materials),scene.afterMaterialsSHA256);assert.equal(hash(historical.materials),scene.beforeMaterialsSHA256);
  assert.equal(current.geometryBytes,scene.afterGeometryBytes);assert.equal(historical.geometryBytes,scene.beforeGeometryBytes);assert.equal(current.geometryBytes-historical.geometryBytes,4608);
  assert.deepEqual([historical.meshes.length,current.meshes.length],[163,164]);
  const tris=rows=>Object.values(rows).reduce((n,r)=>n+r.triangles,0);assert.deepEqual([tris(historical.rows),tris(current.rows)],[188027,188075]);
  assert.deepEqual(scene.names,['后三宫']);
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(current.rows[name],row,name);
  assert.deepEqual(restorePreR26SceneRows(current.rows),historical.rows);assert.equal(restorePreR26SceneRows(historical.rows),historical.rows);
  assert.deepEqual(restorePreR26MeshRows(current.meshes),historical.meshes);assert.equal(restorePreR26MeshRows(historical.meshes),historical.meshes);
  assert.equal(hash(restorePreR25SceneRows(current.rows)),priorScene.beforeSHA256);assert.equal(hash(restorePreR25MeshRows(current.meshes)),priorScene.beforeMeshesSHA256);
});

test('only ten exact front elements change into fourteen registered seven-bay elements; every end/rear/side/roof element is retained in order',()=>{
  const d=scene.qianqing,before=qHistorical.rows,after=qCurrent.rows;
  assert.equal(hash(before),d.beforeSHA256);assert.equal(hash(after),d.afterSHA256);assert.deepEqual([before.length,after.length],[111,115]);
  assert.equal(d.changes.length,10);assert.equal(d.changes.reduce((n,c)=>n+c.before.length,0),10);assert.equal(d.changes.reduce((n,c)=>n+c.after.length,0),14);
  assert.deepEqual(d.changes.map(x=>x.beforeIndex),[40,41,42,43,44,45,46,47,48,49]);
  assert.deepEqual(d.changes.map(x=>x.afterIndex),[40,42,44,45,46,47,48,49,50,52]);
  const labels=[];
  for(const change of d.changes){
    assert.deepEqual(before.slice(change.beforeIndex,change.beforeIndex+change.before.length),change.before);
    assert.deepEqual(after.slice(change.afterIndex,change.afterIndex+change.after.length),change.after);
    const old=change.before[0],first=change.after[0];assert.equal(old.material.name,'lattice_doors');
    for(const row of change.after){const mark=row.userData.qianqingFrontEnclosure;labels.push([mark.bay,mark.kind]);assert.equal(row.material.name,'qianqing_front_enclosure');assert.equal(row.triangles,12);}
    if(change.after.length===1){
      assert.deepEqual(Object.keys(old).filter(key=>hash(old[key])!==hash(first[key])),['geometry','material','userData']);
      assert.deepEqual(qCurrent.orientedSurfaces[change.afterIndex],qHistorical.orientedSurfaces[change.beforeIndex],'every oriented leaf position/normal and full local envelope is retained despite indexed storage and atlas UV changes');
      assert.equal(first.geometry.type,'BoxGeometry');assert.equal(old.geometry.type,'BufferGeometry');
      assert.equal(first.geometry.attributes.position.count,24);assert.equal(old.geometry.attributes.position.count,36);
    }else assert.deepEqual(change.after.map(x=>x.userData.qianqingFrontEnclosure.kind),['base','window']);
  }
  assert.deepEqual(labels,[[1,'base'],[1,'window'],[2,'base'],[2,'window'],[3,'leaf'],[3,'leaf'],[4,'leaf'],[4,'leaf'],[5,'leaf'],[5,'leaf'],[6,'base'],[6,'window'],[7,'base'],[7,'window']]);
  // These exact unchanged prefixes/suffixes exhaust every non-target mesh.
  assert.deepEqual(after.slice(0,40),before.slice(0,40));assert.deepEqual(after.slice(54),before.slice(50));
  for(const index of[39,50])assert.equal(before[index].material.name,'lattice_doors','unresolved end panels are retained');
  assert.equal(after.filter(x=>x.userData.qianqingFrontEnclosure).length,14);
  assert.deepEqual(restorePreR26QianqingRows(after),before);assert.equal(restorePreR26QianqingRows(before),before);
  assert.equal(after.reduce((n,r)=>n+r.triangles,0)-before.reduce((n,r)=>n+r.triangles,0),48);
  assert.deepEqual(qCurrent.navigation,qHistorical.navigation);assert.equal(hash(qCurrent.navigation),d.navigationSHA256);
});

for(const[name,d]of Object.entries(scene.controls))test(`${name} complete unmerged geometry, materials, metadata and navigation are byte-identical to R25`,()=>{
  const current=captureQianqingControl(PalaceBuilder,name),old=captureQianqingControl(HistoricalR25PalaceBuilder,name);
  assert.deepEqual(current,old);assert.equal(hash(current.rows),d.rowsSHA256);assert.equal(hash(current.navigation),d.navigationSHA256);assert.equal(current.rows.length,d.meshCount);
});

test('whole-scene and mesh reversals reject missing, extra, reordered, partial and unrelated changes',()=>{
  for(const rows of[current.rows,historical.rows])for(const name of Object.keys(rows)){
    const missing=clone(rows);delete missing[name];const count=clone(rows);count[name].triangles++;
    const identity=clone(rows);identity[name].hash='unknown';
    for(const bad of[missing,count,identity,{...rows,extra:rows[name]}])for(const restore of sceneChain)assert.throws(()=>restore(bad));
  }
  for(const rows of[current.rows,historical.rows])for(const bad of[{...rows['后三宫'],hash:'unknown'},{...rows['后三宫'],meshes:100},{...rows['后三宫'],extra:true}])assert.throws(()=>restorePreR26SceneRow('后三宫',bad));
  for(const rows of[current.meshes,historical.meshes])for(const index of[0,139,rows.length-1]){
    const missing=clone(rows);missing.splice(index,1);const extra=clone(rows);extra.splice(index,0,clone(rows[index]));
    const reordered=clone(rows),other=index===0?1:index-1;[reordered[index],reordered[other]]=[reordered[other],reordered[index]];
    for(const bad of[missing,extra,reordered])assert.throws(()=>restorePreR26MeshRows(bad));
    for(const key of['geometrySHA256','materialSHA256','name','group']){const bad=clone(rows);bad[index][key]='unknown';assert.throws(()=>restorePreR26MeshRows(bad));}
    for(const key of['visible','castShadow','receiveShadow']){const bad=clone(rows);bad[index][key]=!bad[index][key];assert.throws(()=>restorePreR26MeshRows(bad));}
    const matrix=clone(rows);matrix[index].matrix[13]+=.001;assert.throws(()=>restorePreR26MeshRows(matrix));
    const data=clone(rows);data[index].userData.extra=true;assert.throws(()=>restorePreR26MeshRows(data));
  }
  const partial=clone(current.meshes);partial[139]=clone(historical.meshes[139]);assert.throws(()=>restorePreR26MeshRows(partial));
});

test('seven-bay reversal rejects changes to targets, retained end passages, rear, roof, attributes, materials and order',()=>{
  for(const rows of[qCurrent.rows,qHistorical.rows])for(const index of[0,39,40,49,50,rows.length-1]){
    const missing=clone(rows);missing.splice(index,1);const extra=clone(rows);extra.splice(index,0,clone(rows[index]));
    const reordered=clone(rows),other=index===0?1:index-1;[reordered[index],reordered[other]]=[reordered[other],reordered[index]];
    const matrix=clone(rows);matrix[index].matrixWorld[14]+=.001;
    const material=clone(rows);material[index].material.roughness+=.001;
    const uv=clone(rows);uv[index].geometry.attributes.uv.SHA256='unknown';
    const position=clone(rows);position[index].geometry.attributes.position.SHA256='unknown';
    const data=clone(rows);data[index].userData.extra=true;
    for(const bad of[missing,extra,reordered,matrix,material,uv,position,data])assert.throws(()=>restorePreR26QianqingRows(bad));
  }
  for(const d of scene.qianqing.changes){const partial=clone(qCurrent.rows);partial.splice(d.afterIndex,d.after.length,...clone(d.before));assert.throws(()=>restorePreR26QianqingRows(partial));}
});

test('all 2487 colliders and 120 walkables bind complete R25/R26 identity and ordering; mutations fail closed',()=>{
  assert.equal(scene.navigationSHA256,'a1668d4eaf2b4ea21b0ea5a45fb421ef299ff48888d4d23bb1f60396be825853');
  for(const value of[current.navigation,historical.navigation])assert.equal(assertR26NavigationIdentity(value),value);
  assert.deepEqual(current.navigation,historical.navigation);assert.deepEqual([current.navigation.colliders.length,current.navigation.walkables.length],[2487,120]);
  for(const key of['colliders','walkables'])for(const index of key==='colliders'?[0,2154,2165,2170,2486]:[0,103,119]){
    const missing=clone(current.navigation);missing[key].splice(index,1);
    const extra=clone(current.navigation);extra[key].splice(index,0,clone(extra[key][index]));
    const drift=clone(current.navigation),row=drift[key][index];if(row.min)row.min.x+=.001;else if(row.box)row.box.min.x+=.001;else row.minX+=.001;
    const reordered=clone(current.navigation),other=index===0?1:index-1;[reordered[key][index],reordered[key][other]]=[reordered[key][other],reordered[key][index]];
    for(const bad of[missing,extra,drift,reordered])assert.throws(()=>assertR26NavigationIdentity(bad));
  }
  assert.throws(()=>assertR26NavigationIdentity({...current.navigation,extra:[]}));
});
