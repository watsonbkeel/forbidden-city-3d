import {r30Source} from './lib/r30-qianqing-passage-retention.mjs';
import {r29Source} from './lib/r29-qianqing-retention.mjs';
import {restorePreR28Source,r28Source} from './lib/r28-jiaotai-central-retention.mjs';
import r27Source from './fixtures/r27-jiaotai-source-delta.json' with {type:'json'};
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {HistoricalR26CombinedPalaceBuilder as PalaceBuilder} from './lib/historical-r26-combined-fixture.mjs';
import {restorePreR27Source} from './lib/r27-jiaotai-retention.mjs';
import {HistoricalR26WindowsPalaceBuilder as Historical} from './lib/historical-r26-windows-fixture.mjs';
import {captureNameboardScene} from './lib/r25-nameboard-capture.mjs';
import {captureQianqingControl} from './lib/r26-qianqing-capture.mjs';
import {captureFriezeTriangles,captureFriezeHall} from './lib/r26-qianqing-frieze-capture.mjs';
import {restorePreR26FriezeSource,assertR26FriezeAddedSource,assertR26FriezeRetainedSource,restorePreR26FriezeSceneRow,restorePreR26FriezeSceneRows,restorePreR26FriezeMeshRows,restorePreR26FriezeQianqingRows} from './lib/r26-qianqing-frieze-retention.mjs';
import {restorePreR26Source,restorePreR26SceneRows,restorePreR26MeshRows,restorePreR26QianqingRows,assertR26NavigationIdentity} from './lib/r26-qianqing-retention.mjs';
import {restorePreR25Source,restorePreR25SceneRows,restorePreR25MeshRows} from './lib/r25-nameboard-retention.mjs';
import {restorePreR24Source,restorePreR24SceneRows} from './lib/r24-baohe-retention.mjs';
import source from './fixtures/r26-qianqing-frieze-source-delta.json' with {type:'json'};
import scene from './fixtures/r26-qianqing-frieze-scene-delta.json' with {type:'json'};
import previousSource from './fixtures/r26-qianqing-source-delta.json' with {type:'json'};
import previousScene from './fixtures/r26-qianqing-scene-delta.json' with {type:'json'};
import r25Scene from './fixtures/r25-nameboard-scene-delta.json' with {type:'json'};
const root=new URL('../',import.meta.url),read=p=>restorePreR28Source(p,fs.readFileSync(new URL(p,root)));
const sha=x=>createHash('sha256').update(x).digest('hex'),hash=x=>sha(JSON.stringify(x)),clone=structuredClone;
const current=captureNameboardScene(PalaceBuilder),previous=captureNameboardScene(Historical);
const qCurrent=captureQianqingControl(PalaceBuilder),qPrevious=captureQianqingControl(Historical);
const sourceChain=[restorePreR26FriezeSource,restorePreR26Source,restorePreR25Source,restorePreR24Source];
const sceneChain=[restorePreR26FriezeSceneRows,restorePreR26SceneRows,restorePreR25SceneRows,restorePreR24SceneRows];

test('frieze provenance binds current source, one added module, unchanged RoofBuilder and all 106 prior fixtures',()=>{
  assert.equal(sha(read('tests/fixtures/r26-qianqing-frieze-source-delta.json')),'637240a7d81477329bd212b6e3fe19c462da785f196830faa736539629563c2e');
  assert.equal(sha(read('tests/fixtures/r26-qianqing-frieze-scene-delta.json')),'8d59d6ba8bd4327e6aefd2adda4240dadc0c15e4ebca08a9f92d4765b3ce0daf');
  for(const f of[source,scene]){assert.equal(f.base,'bad4ee29b12b2d079d6504de42516ac34d0e8868');assert.equal(f.candidate,'da853e5f95603beb3cfda11c79f48eed16286b28');assert.match(f.scope,/Historical assertions only/);}
  assert.deepEqual(Object.keys(source.files),['src/scene/PalaceBuilder.js']);assert.deepEqual(Object.keys(source.addedFiles),['src/scene/palace/QianqingUpperEnclosure.js']);
  assert.equal(source.files['src/scene/PalaceBuilder.js'].baselineSHA256,previousSource.files['src/scene/PalaceBuilder.js'].candidateSHA256);
  assert.equal(Object.keys(source.retainedFiles).length,276);assert.equal(Object.keys(source.preservedFixtures).length,106);
  for(const[p,digest]of Object.entries(source.preservedFixtures))assert.equal(sha(read(p)),digest,p);
  for(const[p,digest]of Object.entries(previousSource.retainedFiles))assert.equal(source.retainedFiles[p],digest,p);
  assert.equal(source.retainedFiles['src/scene/palace/QianqingFrontEnclosure.js'],previousSource.addedFiles['src/scene/palace/QianqingFrontEnclosure.js'].candidateSHA256);
  assert.equal(sha(read('src/scene/RoofBuilder.js')),previousSource.retainedFiles['src/scene/RoofBuilder.js']);
  const actual=['src','data','public'].flatMap(dir=>fs.readdirSync(new URL(dir+'/',root),{recursive:true,withFileTypes:true}).filter(x=>x.isFile()).map(x=>path.relative(root.pathname,path.join(x.parentPath,x.name)))).sort();
  assert.deepEqual([...Object.keys(source.files),...Object.keys(source.addedFiles),...Object.keys(source.retainedFiles).filter(p=>/^(src|data|public)\//.test(p)),...Object.keys(r27Source.addedFiles),...Object.keys(r28Source.addedFiles),...Object.keys(r30Source.addedFiles),...Object.keys(r29Source.addedFiles).filter(p=>/^(src|data|public)\//.test(p))].sort(),actual);
});

test('the full frozen combined R26 builder reverses exactly two unique import/call hunks to the exact windows-only source',()=>{
  const p='src/scene/PalaceBuilder.js',bytes=restorePreR27Source(p,read(p)),d=source.files[p],text=bytes.toString(),original=Buffer.from(bytes);
  assert.equal(sha(bytes),d.candidateSHA256);assert.equal(d.deltas.length,2);
  assert.match(d.deltas[0].after,/import \{ paintQianqingUpperEnclosure \}/);assert.match(d.deltas[1].after,/paintQianqingUpperEnclosure\(roof,this.library,data.name\)/);
  const old=restorePreR26FriezeSource(p,bytes);assert.equal(sha(old),d.baselineSHA256);assert.equal(restorePreR26FriezeSource(p,old),old);
  for(const h of d.deltas){assert.ok(h.before.length&&h.after.length);assert.equal(text.split(h.after).length,2);assert.equal(old.toString().split(h.before).length,2);}
  assert.equal(sha(restorePreR26Source(p,bytes)),previousSource.files[p].baselineSHA256);assert.deepEqual(bytes,original);
  assert.equal(PalaceBuilder.prototype.plaqueMesh.toString(),Historical.prototype.plaqueMesh.toString());
  const needle='const lacquer =';assert.equal(text.split(needle).length,2);
  const bad=['',text+'\n',text+text,'// extra\n'+text,text.replace(needle,needle+' /* drift */')];
  for(const h of d.deltas)for(const replacement of['',h.before,h.after+h.after])bad.push(text.replace(h.after,replacement));
  for(const value of bad)for(const restore of sourceChain)assert.throws(()=>restore(p,Buffer.from(value)));
  for(const value of[old.toString()+'\n',old.toString()+old.toString()])assert.throws(()=>restorePreR26FriezeSource(p,Buffer.from(value)));
  assert.throws(()=>restorePreR26FriezeSource(p,restorePreR26Source(p,bytes)),'older R25 is not an accepted combined/windows-only builder');
});

test('the added module and every retained runtime, asset and route dependency reject unregistered or mutated bytes',()=>{
  for(const[paths,check]of[[source.addedFiles,assertR26FriezeAddedSource],[source.retainedFiles,assertR26FriezeRetainedSource]]){
    for(const p of Object.keys(paths)){const bytes=read(p),changed=Buffer.from(bytes);changed[Math.floor(changed.length/2)]^=1;assert.equal(check(p,bytes),bytes);
      for(const bad of[Buffer.alloc(0),Buffer.concat([bytes,bytes]),Buffer.concat([bytes,Buffer.from('\n')]),changed])assert.throws(()=>check(p,bad),p);}
    assert.throws(()=>check('src/scene/Unregistered.js',Buffer.from('unknown')));
  }
});

test('portable historical windows-only fixture locks all dependencies without Git, sibling paths, network or current-builder fallback',()=>{
  const text=read('tests/lib/historical-r26-windows-fixture.mjs').toString();
  for(const fn of['restorePreR26FriezeSource','assertR26FriezeAddedSource','assertR26FriezeRetainedSource'])assert.ok(text.includes(fn+'(path,read(path))'));
  assert.doesNotMatch(text,/child_process|execSync|execFile|fetch\(|https?:\/\/|\/workspace\/|import\s*\{\s*PalaceBuilder\s*\}\s*from/);
  assert.notEqual(PalaceBuilder,Historical);
});

test('complete scene retains every material, 164 merged meshes, 188075 triangles and 18296468 geometry bytes',()=>{
  assert.equal(hash(current.rows),scene.afterSHA256);assert.equal(hash(previous.rows),scene.beforeSHA256);assert.equal(scene.beforeSHA256,previousScene.afterSHA256);
  assert.equal(hash(current.meshes),scene.meshes.afterSHA256);assert.equal(hash(previous.meshes),scene.meshes.beforeSHA256);assert.equal(scene.meshes.beforeSHA256,previousScene.afterMeshesSHA256);
  assert.equal(hash(current.materials),scene.materialsSHA256);assert.equal(hash(previous.materials),scene.beforeMaterialsSHA256);assert.deepEqual(current.materials,previous.materials);
  assert.deepEqual([current.meshes.length,previous.meshes.length],[164,164]);assert.deepEqual([current.geometryBytes,previous.geometryBytes],[18296468,18296468]);
  assert.equal(Object.values(current.rows).reduce((n,r)=>n+r.triangles,0),188075);assert.deepEqual(scene.names,['后三宫']);
  assert.deepEqual(scene.meshes.changes.map(d=>d.beforeIndex),[136,142]);
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(current.rows[name],row,name);
  for(let i=0;i<current.meshes.length;i++)if(![136,142].includes(i))assert.deepEqual(current.meshes[i],previous.meshes[i],`unchanged merged mesh ${i}`);
  for(const i of[136,142])assert.deepEqual(Object.keys(current.meshes[i]).filter(k=>hash(current.meshes[i][k])!==hash(previous.meshes[i][k])),['geometrySHA256']);
  assert.deepEqual(restorePreR26FriezeSceneRows(current.rows),previous.rows);assert.deepEqual(restorePreR26FriezeMeshRows(current.meshes),previous.meshes);
  assert.equal(restorePreR26FriezeSceneRows(previous.rows),previous.rows);assert.equal(restorePreR26FriezeMeshRows(previous.meshes),previous.meshes);
  assert.equal(hash(restorePreR26SceneRows(current.rows)),previousScene.beforeSHA256);assert.equal(hash(restorePreR26MeshRows(current.meshes)),previousScene.beforeMeshesSHA256);
  assert.equal(hash(restorePreR25SceneRows(current.rows)),r25Scene.beforeSHA256);assert.equal(hash(restorePreR25MeshRows(current.meshes)),r25Scene.beforeMeshesSHA256);
});

test('all resident oriented triangle positions/normals retain multiplicity; only two material/UV triangle identities change',()=>{
  const before=captureFriezeTriangles(Historical),after=captureFriezeTriangles(PalaceBuilder),sorted=(t,k)=>t.rows.map(x=>x[k]).sort();
  assert.deepEqual([before.rows.length,after.rows.length],[188075,188075]);assert.deepEqual([before.uniqueMaterials,after.uniqueMaterials],[85,85]);
  const a=sorted(before,'surface'),b=sorted(after,'surface');assert.deepEqual(b,a);assert.equal(hash(b),scene.triangles.orientedSurfaceSHA256);
  const x=sorted(before,'identity'),y=sorted(after,'identity');assert.equal(hash(x),scene.triangles.beforeIdentitySHA256);assert.equal(hash(y),scene.triangles.afterIdentitySHA256);
  const delta=(a,b)=>{const counts=new Map();for(const x of b)counts.set(x,(counts.get(x)||0)+1);return a.filter(x=>{if(counts.get(x)){counts.set(x,counts.get(x)-1);return false;}return true;});};
  assert.deepEqual(delta(x,y),scene.triangles.removed);assert.deepEqual(delta(y,x),scene.triangles.added);assert.equal(delta(x,y).length,2);assert.equal(delta(y,x).length,2);
});

test('exact south body split retains east/north/west attributes and every earlier window element, with no added triangles or materials',()=>{
  const old=captureFriezeHall(Historical),now=captureFriezeHall(PalaceBuilder),before=old.meshes,after=now.meshes;
  assert.equal(hash(old),scene.qianqing.rawBeforeSHA256);assert.equal(hash(now),scene.qianqing.rawAfterSHA256);assert.equal(now.uniqueMaterials,old.uniqueMaterials);
  assert.deepEqual([before.length,after.length],[115,116]);assert.deepEqual(after.slice(0,113),before.slice(0,113));assert.deepEqual(after[114],before[114]);
  const original=before[113],body=after[113],face=after[115];assert.equal(original.material,'wood_column');assert.equal(body.material,original.material);assert.equal(face.material,'caihua_beam');
  assert.ok(before.some(m=>m.materialIndex===face.materialIndex&&m.material==='caihua_beam'),'reuse existing material object');
  assert.deepEqual(body.matrixWorld,original.matrixWorld);assert.deepEqual(face.matrixWorld,original.matrixWorld);assert.deepEqual(face.matrix,original.matrix);
  assert.equal(original.index,null);assert.equal(body.index,null);assert.equal(face.index,null);
  for(const[key,a]of Object.entries(original.attributes)){
    assert.deepEqual(body.attributes[key],{...a,array:a.array.slice(6*a.itemSize)},`entire retained ${key}`);
    if(key!=='uv')assert.deepEqual(face.attributes[key],{...a,array:a.array.slice(0,6*a.itemSize)},`south ${key} identity`);
  }
  assert.equal(face.attributes.position.array.length,18);assert.equal(body.attributes.position.array.length,54);
  const meta=face.userData.qianqingUpperEnclosure,p=face.attributes.position.array,n=face.attributes.normal.array,uv=face.attributes.uv.array;
  const halfWidth=Math.max(...original.attributes.position.array.filter((_,i)=>i%3===0));
  const southZ=Math.min(...original.attributes.position.array.filter((_,i)=>i%3===2));
  assert.equal(meta.face,'south');assert.match(meta.status,/APPROXIMATE/);assert.ok(meta.visibleTop>meta.visibleBottom);
  for(let i=0;i<6;i++){
    assert.equal(p[i*3+2],southZ);assert.deepEqual(n.slice(i*3,i*3+3),[0,0,-1]);
    assert.ok(Math.abs(uv[i*2]-(p[i*3]+halfWidth)/(meta.visibleTop-meta.visibleBottom))<1e-5);
    assert.ok(Math.abs(uv[i*2+1]-(p[i*3+1]-meta.visibleBottom)/(meta.visibleTop-meta.visibleBottom))<1e-5);
  }
  assert.notDeepEqual(uv,original.attributes.uv.array.slice(0,12));
  assert.equal(hash(qCurrent.rows),scene.qianqing.afterSHA256);assert.equal(hash(qPrevious.rows),scene.qianqing.beforeSHA256);assert.equal(scene.qianqing.beforeSHA256,previousScene.qianqing.afterSHA256);
  assert.deepEqual(restorePreR26FriezeQianqingRows(qCurrent.rows),qPrevious.rows);assert.equal(restorePreR26FriezeQianqingRows(qPrevious.rows),qPrevious.rows);
  assert.equal(hash(restorePreR26QianqingRows(qCurrent.rows)),previousScene.qianqing.beforeSHA256);
  assert.equal(qCurrent.rows.reduce((n,r)=>n+r.triangles,0),qPrevious.rows.reduce((n,r)=>n+r.triangles,0));
  assert.deepEqual(qCurrent.rows.filter(m=>m.userData.qianqingFrontEnclosure),qPrevious.rows.filter(m=>m.userData.qianqingFrontEnclosure));
  assert.equal(qCurrent.rows.filter(m=>m.userData.qianqingFrontEnclosure).length,14);
});

for(const[name,d]of Object.entries(scene.controls))test(`${name} complete unmerged geometry, material, metadata and navigation retain windows-only identity`,()=>{
  const now=captureQianqingControl(PalaceBuilder,name),old=captureQianqingControl(Historical,name);assert.deepEqual(now,old);assert.equal(hash(now.rows),d.rowsSHA256);assert.equal(hash(now.navigation),d.navigationSHA256);
});

test('complete historical reversals reject missing, added, reordered, partial or unrelated current/previous scene and mesh mutations',()=>{
  for(const rows of[current.rows,previous.rows])for(const name of Object.keys(rows)){
    const missing=clone(rows);delete missing[name];const drift=clone(rows);drift[name].triangles++;const identity=clone(rows);identity[name].hash='unknown';
    for(const bad of[missing,drift,identity,{...rows,extra:rows[name]}])for(const restore of sceneChain)assert.throws(()=>restore(bad));
  }
  for(const rows of[current.rows,previous.rows])assert.throws(()=>restorePreR26FriezeSceneRow('后三宫',{...rows['后三宫'],hash:'unknown'}));
  for(const[values,restore,indices]of[[[current.meshes,previous.meshes],restorePreR26FriezeMeshRows,[0,136,142,163]],[[qCurrent.rows,qPrevious.rows],restorePreR26FriezeQianqingRows,[0,39,40,53,113,114]]])for(const rows of values)for(const i of indices){
    const missing=clone(rows);missing.splice(i,1);const extra=clone(rows);extra.splice(i,0,clone(rows[i]));const reorder=clone(rows),other=i===0?1:i-1;[reorder[i],reorder[other]]=[reorder[other],reorder[i]];
    const matrix=clone(rows);matrix[i].matrix[13]+=.001;const data=clone(rows);data[i].userData.unknown=true;
    for(const bad of[missing,extra,reorder,matrix,data])assert.throws(()=>restore(bad));
    for(const key of rows===current.meshes||rows===previous.meshes?['geometrySHA256','materialSHA256']:['geometry','material']){const bad=clone(rows);bad[i][key]='unknown';assert.throws(()=>restore(bad));}
  }
  for(const d of scene.meshes.changes){const partial=clone(current.meshes);partial[d.afterIndex]=clone(d.before[0]);assert.throws(()=>restorePreR26FriezeMeshRows(partial));}
  const missingFace=clone(qCurrent.rows);missingFace.pop();assert.throws(()=>restorePreR26FriezeQianqingRows(missingFace));
});

test('all 2487 colliders and 120 walkables retain exact ordered complete identities with no navigation changes',()=>{
  assert.equal(scene.navigationSHA256,'a1668d4eaf2b4ea21b0ea5a45fb421ef299ff48888d4d23bb1f60396be825853');
  assert.deepEqual(current.navigation,previous.navigation);assert.equal(hash(current.navigation),scene.navigationSHA256);assert.deepEqual([current.navigation.colliders.length,current.navigation.walkables.length],[2487,120]);
  assert.deepEqual(qCurrent.navigation,qPrevious.navigation);assert.equal(hash(qCurrent.navigation),scene.qianqing.navigationSHA256);
  for(const nav of[current.navigation,previous.navigation])assert.equal(assertR26NavigationIdentity(nav),nav);
  for(const key of['colliders','walkables']){const absent=clone(current.navigation);absent[key].pop();const extra=clone(current.navigation);extra[key].push(clone(extra[key][0]));const reordered=clone(current.navigation);reordered[key].reverse();for(const bad of[absent,extra,reordered])assert.throws(()=>assertR26NavigationIdentity(bad));}
});
