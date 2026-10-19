import {verifiedR31AddedProductPaths,verifiedR32AddedProductPaths} from './lib/r32-product-inventory.mjs';
import {r30Source} from './lib/r30-qianqing-passage-retention.mjs';
import {r29Source} from './lib/r29-qianqing-retention.mjs';
import {restorePreR28Source,r28Source} from './lib/r28-jiaotai-central-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {HistoricalR27PalaceBuilder as PalaceBuilder} from './lib/historical-r27-jiaotai-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {PLAYER} from '../src/config/constants.js';
import {HistoricalR26CombinedPalaceBuilder as Historical} from './lib/historical-r26-combined-fixture.mjs';
import {captureJiaotaiScene} from './lib/r27-jiaotai-capture.mjs';
import {restorePreR27Source,assertR27AddedSource,assertR27RetainedSource,restorePreR27SceneRow,restorePreR27SceneRows,restorePreR27MeshRows,restorePreR27GraphRows,restorePreR27Materials,restorePreR27Navigation} from './lib/r27-jiaotai-retention.mjs';
import {restorePreR26FriezeSource,restorePreR26FriezeSceneRows,restorePreR26FriezeMeshRows} from './lib/r26-qianqing-frieze-retention.mjs';
import {restorePreR26Source,restorePreR26SceneRows,restorePreR26MeshRows} from './lib/r26-qianqing-retention.mjs';
import {restorePreR25Source,restorePreR25SceneRows,restorePreR25MeshRows} from './lib/r25-nameboard-retention.mjs';
import {restorePreR22Navigation} from './lib/r22-baohe-retention.mjs';
import source from './fixtures/r27-jiaotai-source-delta.json' with {type:'json'};
import scene from './fixtures/r27-jiaotai-scene-delta.json' with {type:'json'};
import priorSource from './fixtures/r26-qianqing-frieze-source-delta.json' with {type:'json'};
import priorScene from './fixtures/r26-qianqing-frieze-scene-delta.json' with {type:'json'};
import windowsScene from './fixtures/r26-qianqing-scene-delta.json' with {type:'json'};
import r25Scene from './fixtures/r25-nameboard-scene-delta.json' with {type:'json'};
import r22Navigation from './fixtures/r22-baohe-navigation-delta.json' with {type:'json'};
const root=new URL('../',import.meta.url),read=p=>restorePreR28Source(p,fs.readFileSync(new URL(p,root)));
const sha=x=>createHash('sha256').update(x).digest('hex'),hash=x=>sha(JSON.stringify(x)),clone=structuredClone;
const current=captureJiaotaiScene(PalaceBuilder),previous=captureJiaotaiScene(Historical);
const sourceChain=[restorePreR27Source,restorePreR26FriezeSource,restorePreR26Source,restorePreR25Source];
const sceneChain=[restorePreR27SceneRows,restorePreR26FriezeSceneRows,restorePreR26SceneRows,restorePreR25SceneRows];
const meshChain=[restorePreR27MeshRows,restorePreR26FriezeMeshRows,restorePreR26MeshRows,restorePreR25MeshRows];

test('R27 provenance binds the frozen candidate, exact previous builder, two modules and all 108 immutable preceding fixtures',()=>{
  assert.equal(sha(read('tests/fixtures/r27-jiaotai-source-delta.json')),'e5e981196686903953e804af3cb5a02a1761f55f1edd28ec5d28a00d485d8bf9');
  assert.equal(sha(read('tests/fixtures/r27-jiaotai-scene-delta.json')),'cab2816c3bb4db6845a97bcb5d30aa0b8afa4288abc6425bb1ebf58c1224621d');
  for(const f of[source,scene]){
    assert.equal(f.base,'bec5da17e1f0110887dca5ff2c760c857360a4cb');
    assert.equal(f.baseTree,'aaab1c5218da1b79c1cbcc8780b8b832db6c2bbb');
    assert.equal(f.candidate,'7fcea03c8a51b13b0e3b9db8b86adf2832b7ed4d');assert.match(f.scope,/Historical assertions only/);
  }
  const p='src/scene/PalaceBuilder.js';assert.deepEqual(Object.keys(source.files),[p]);
  assert.equal(source.files[p].baselineSHA256,'1f4d36c802ed845c070f9ec52b9efc7b6da259aa1f5d004250ffcbbf99684ac2');
  assert.equal(source.files[p].candidateSHA256,'301858f4d6018301c111e14837538ce59f7d2a2b03038e52bfb6ab834b359e93');
  assert.equal(source.files[p].baselineSHA256,priorSource.files[p].candidateSHA256);
  assert.deepEqual(Object.keys(source.addedFiles),['src/scene/palace/special/JiaotaiLandmarks.js','src/scene/palace/special/JiaotaiLandmarkArt.js']);
  assert.equal(Object.keys(source.retainedFiles).length,277);assert.equal(Object.keys(source.preservedFixtures).length,108);
  for(const[p,digest]of Object.entries(source.preservedFixtures))assert.equal(sha(read(p)),digest,p);
  for(const[p,digest]of Object.entries(priorSource.retainedFiles))assert.equal(source.retainedFiles[p],digest,p);
  assert.equal(source.retainedFiles['src/scene/palace/QianqingUpperEnclosure.js'],priorSource.addedFiles['src/scene/palace/QianqingUpperEnclosure.js'].candidateSHA256);
  const actual=['src','data','public'].flatMap(dir=>fs.readdirSync(new URL(dir+'/',root),{recursive:true,withFileTypes:true}).filter(x=>x.isFile()).map(x=>path.relative(root.pathname,path.join(x.parentPath,x.name)))).sort();
  assert.deepEqual([...Object.keys(source.files),...Object.keys(source.addedFiles),...Object.keys(source.retainedFiles).filter(p=>/^(src|data|public)\//.test(p)),...Object.keys(r28Source.addedFiles),...Object.keys(r30Source.addedFiles),...Object.keys(r29Source.addedFiles).filter(p=>/^(src|data|public)\//.test(p)),...verifiedR31AddedProductPaths(),...verifiedR32AddedProductPaths()].sort(),actual);
});

test('only the two exact import and post-merge install hunks reverse; unrelated, partial, missing and duplicate source fail closed',()=>{
  const p='src/scene/PalaceBuilder.js',bytes=read(p),d=source.files[p],text=bytes.toString(),original=Buffer.from(bytes);
  assert.equal(sha(bytes),d.candidateSHA256);assert.equal(d.deltas.length,2);
  assert.match(d.deltas[0].after,/import \{ installJiaotaiLandmarks \}/);
  assert.match(d.deltas[1].after,/if \(name === '后三宫'\) installJiaotaiLandmarks\(this, finished\)/);
  const old=restorePreR27Source(p,bytes);assert.equal(sha(old),d.baselineSHA256);assert.equal(restorePreR27Source(p,old),old);
  for(const h of d.deltas){assert.equal(text.split(h.after).length,2);assert.equal(old.toString().split(h.before).length,2);}
  assert.deepEqual(bytes,original);
  assert.equal(sha(restorePreR26FriezeSource(p,bytes)),priorSource.files[p].baselineSHA256);
  const needle='const lacquer =';assert.equal(text.split(needle).length,2);
  const bad=['',text+'\n',text+text,'// extra\n'+text,text.replace(needle,needle+' /* drift */')];
  for(const h of d.deltas)for(const replacement of['',h.before,h.after+h.after])bad.push(text.replace(h.after,replacement));
  for(const value of bad)for(const restore of sourceChain)assert.throws(()=>restore(p,Buffer.from(value)));
  for(const value of[old.toString()+'\n',old.toString()+old.toString()])assert.throws(()=>restorePreR27Source(p,Buffer.from(value)));
  assert.throws(()=>restorePreR27Source(p,restorePreR26FriezeSource(p,bytes)),'older windows-only R26 is not a combined R26/R27 builder');
});

test('both new modules and all retained runtime, asset, route and configuration bytes reject mutation or absence',()=>{
  for(const[paths,check]of[[source.addedFiles,assertR27AddedSource],[source.retainedFiles,assertR27RetainedSource]]){
    for(const p of Object.keys(paths)){const bytes=read(p),changed=Buffer.from(bytes);changed[Math.floor(changed.length/2)]^=1;assert.equal(check(p,bytes),bytes);
      for(const bad of[Buffer.alloc(0),Buffer.concat([bytes,bytes]),Buffer.concat([bytes,Buffer.from('\n')]),changed])assert.throws(()=>check(p,bad),p);}
    assert.throws(()=>check('src/scene/Unregistered.js',Buffer.from('unknown')));
  }
});

test('portable combined R26 snapshot binds dependencies with no Git, sibling checkout, network, runtime overwrite or current-builder fallback',()=>{
  const text=read('tests/lib/historical-r26-combined-fixture.mjs').toString();
  for(const fn of['restorePreR27Source','assertR27AddedSource','assertR27RetainedSource'])assert.ok(text.includes(fn+'(path,read(path))'));
  assert.doesNotMatch(text,/child_process|execSync|execFile|fetch\(|https?:\/\/|\/workspace\/|writeFile|import\s*\{\s*PalaceBuilder\s*\}\s*from/);
  assert.notEqual(PalaceBuilder,Historical);
  assert.ok(read('tests/lib/historical-r26-windows-fixture.mjs').toString().includes("import './historical-r26-combined-fixture.mjs'"));
});

test('every prior resident mesh retains exact ordered geometry, indices, UV, normals, materials, transforms and flags; only two meshes are appended to the rear group',()=>{
  assert.equal(hash(current.rows),scene.afterSHA256);assert.equal(hash(previous.rows),scene.beforeSHA256);assert.equal(scene.beforeSHA256,priorScene.afterSHA256);
  assert.equal(hash(current.meshes),scene.meshes.afterSHA256);assert.equal(hash(previous.meshes),scene.meshes.beforeSHA256);assert.equal(scene.meshes.beforeSHA256,priorScene.meshes.afterSHA256);
  assert.deepEqual([previous.meshes.length,current.meshes.length],[164,166]);
  assert.deepEqual([previous.geometryBytes,current.geometryBytes],[scene.beforeGeometryBytes,scene.afterGeometryBytes]);
  assert.equal(current.geometryBytes-previous.geometryBytes,111936);
  assert.deepEqual([Object.values(previous.rows).reduce((n,r)=>n+r.triangles,0),Object.values(current.rows).reduce((n,r)=>n+r.triangles,0)],[188075,189241]);
  assert.deepEqual(scene.names,['后三宫']);for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(current.rows[name],row,name);
  assert.equal(scene.meshes.changes.length,1);const d=scene.meshes.changes[0];assert.deepEqual(d.before,[]);assert.equal(d.after.length,2);
  assert.deepEqual(current.meshes.slice(0,d.afterIndex),previous.meshes.slice(0,d.beforeIndex));
  assert.deepEqual(current.meshes.slice(d.afterIndex+2),previous.meshes.slice(d.beforeIndex));
  assert.deepEqual(d.after,current.meshes.slice(d.afterIndex,d.afterIndex+2));assert.ok(d.after.every(m=>m.group==='后三宫'&&m.materialSHA256===d.after[0].materialSHA256));
  assert.deepEqual(restorePreR27SceneRows(current.rows),previous.rows);assert.deepEqual(restorePreR27MeshRows(current.meshes),previous.meshes);
  assert.equal(restorePreR27SceneRows(previous.rows),previous.rows);assert.equal(restorePreR27MeshRows(previous.meshes),previous.meshes);
  assert.equal(hash(restorePreR26FriezeSceneRows(current.rows)),priorScene.beforeSHA256);assert.equal(hash(restorePreR26FriezeMeshRows(current.meshes)),priorScene.meshes.beforeSHA256);
  assert.equal(hash(restorePreR26SceneRows(current.rows)),windowsScene.beforeSHA256);assert.equal(hash(restorePreR26MeshRows(current.meshes)),windowsScene.beforeMeshesSHA256);
  assert.equal(hash(restorePreR25SceneRows(current.rows)),r25Scene.beforeSHA256);assert.equal(hash(restorePreR25MeshRows(current.meshes)),r25Scene.beforeMeshesSHA256);
});

test('the full hierarchy adds one LOD and two single-mesh levels; existing parent transforms and metadata retain exact identity',()=>{
  assert.equal(hash(current.graph),scene.graph.afterSHA256);assert.equal(hash(previous.graph),scene.graph.beforeSHA256);
  assert.deepEqual(restorePreR27GraphRows(current.graph),previous.graph);assert.equal(restorePreR27GraphRows(previous.graph),previous.graph);
  const changes=scene.graph.changes;assert.equal(changes.length,2);
  const parentChange=changes.find(d=>d.before.length);assert.equal(parentChange.before.length,1);assert.equal(parentChange.after.length,1);
  const old=parentChange.before[0],now=parentChange.after[0];assert.equal(old.name,'后三宫');assert.equal(now.name,'后三宫');
  assert.deepEqual(Object.keys(now).filter(k=>hash(now[k])!==hash(old[k])),['userData','children']);
  const data=clone(now.userData);delete data.jiaotaiLandmarks;assert.deepEqual(data,old.userData);
  assert.deepEqual(now.children.slice(0,-1),old.children);
  const added=changes.find(d=>!d.before.length).after;assert.deepEqual(added.map(n=>n.type),['LOD','Group','Mesh','Group','Mesh']);
  assert.equal(now.children.at(-1),added[0].path);assert.deepEqual(added.filter(n=>n.type==='Mesh').map(n=>n.triangles),[1024,142]);
  assert.equal(added[0].name,'jiaotai-timekeeping-detail');assert.deepEqual(added[0].levels.map(l=>[l.distance,l.hysteresis]),[[0,0],[90,.1]]);
  assert.deepEqual(added.filter(n=>n.type==='Group').map(n=>n.visible),[true,false]);
});

test('all prior material and texture values remain exact; one private 1024 by 512 atlas/material is shared by both resident levels',()=>{
  assert.equal(hash(current.materials),scene.materials.afterSHA256);assert.equal(hash(previous.materials),scene.materials.beforeSHA256);assert.equal(scene.materials.beforeSHA256,priorScene.materialsSHA256);
  assert.deepEqual(restorePreR27Materials(current.materials),previous.materials);assert.equal(restorePreR27Materials(previous.materials),previous.materials);
  assert.deepEqual([previous.uniqueMaterials,current.uniqueMaterials],[85,86]);assert.equal(current.uniqueTextures-previous.uniqueTextures,1);
  assert.equal(scene.materials.changes.length,1);const d=scene.materials.changes[0];assert.equal(d.before.length,1);assert.equal(d.after.length,1);
  const [beforeName,before]=d.before[0],[afterName,after]=d.after[0];assert.equal(beforeName,'后三宫');assert.equal(afterName,beforeName);assert.deepEqual(after.slice(0,-2),before);
  assert.deepEqual(after.at(-2),after.at(-1));const material=after.at(-1);assert.equal(material.name,'jiaotai-landmark-atlas');assert.deepEqual(material.map.image,{width:1024,height:512});
  assert.equal(material.emissive.r,0);assert.equal(material.emissive.g,0);assert.equal(material.emissive.b,0);assert.equal(material.map.colorSpace,'srgb');
});

test('complete scene and mesh reversals reject missing, extra, reordered, partially restored and altered old or new identities',()=>{
  for(const rows of[current.rows,previous.rows])for(const name of Object.keys(rows)){
    const missing=clone(rows);delete missing[name];const count=clone(rows);count[name].triangles++;const geometry=clone(rows);geometry[name].hash='unknown';
    for(const bad of[missing,count,geometry,{...rows,extra:rows[name]}])for(const restore of sceneChain)assert.throws(()=>restore(bad));
  }
  for(const rows of[current.rows,previous.rows])assert.throws(()=>restorePreR27SceneRow('后三宫',{...rows['后三宫'],hash:'unknown'}));
  const start=scene.meshes.changes[0].afterIndex;
  for(const rows of[current.meshes,previous.meshes])for(const i of new Set([0,Math.floor(rows.length/2),start-1,Math.min(start,rows.length-1),Math.min(start+1,rows.length-1),rows.length-1])){
    const missing=clone(rows);missing.splice(i,1);const duplicate=clone(rows);duplicate.splice(i,0,clone(rows[i]));const reorder=clone(rows),other=i?i-1:1;[reorder[i],reorder[other]]=[reorder[other],reorder[i]];
    const matrix=clone(rows);matrix[i].matrix[13]+=.001;const data=clone(rows);data[i].userData.unknown=true;
    const geometry=clone(rows);geometry[i].geometrySHA256='unknown';const material=clone(rows);material[i].materialSHA256='unknown';
    for(const bad of[missing,duplicate,reorder,matrix,data,geometry,material])for(const restore of meshChain)assert.throws(()=>restore(bad));
  }
  const partial=clone(current.meshes);partial.splice(start,1);assert.throws(()=>restorePreR27MeshRows(partial));
});

test('ancestor, world transform, LOD threshold, visibility and private atlas mutations fail closed without spatial exclusions',()=>{
  const added=scene.graph.changes.find(d=>!d.before.length),parent=scene.graph.changes.find(d=>d.before.length);
  for(const rows of[current.graph,previous.graph])for(const i of new Set([0,parent.afterIndex,Math.min(added.afterIndex,rows.length-1),rows.length-1])){
    const missing=clone(rows);missing.splice(i,1);const duplicate=clone(rows);duplicate.splice(i,0,clone(rows[i]));
    const world=clone(rows);world[i].matrixWorld[13]+=.001;const data=clone(rows);data[i].userData.unknown=true;const visible=clone(rows);visible[i].visible=!visible[i].visible;
    for(const bad of[missing,duplicate,world,data,visible])assert.throws(()=>restorePreR27GraphRows(bad));
  }
  for(const offset of[0,1,2,3,4]){const missing=clone(current.graph);missing.splice(added.afterIndex+offset,1);assert.throws(()=>restorePreR27GraphRows(missing));}
  const threshold=clone(current.graph);threshold[added.afterIndex].levels[1].distance++;assert.throws(()=>restorePreR27GraphRows(threshold));
  const meta=clone(current.graph);delete meta[parent.afterIndex].userData.jiaotaiLandmarks;assert.throws(()=>restorePreR27GraphRows(meta));
  for(const rows of[current.materials,previous.materials])for(let i=0;i<rows.length;i++){
    const missing=clone(rows);missing.splice(i,1);const changed=clone(rows);changed[i][1][0].roughness+=.01;
    for(const bad of[missing,changed])assert.throws(()=>restorePreR27Materials(bad));
  }
  const group=scene.materials.changes[0].afterIndex;
  for(const offset of[1,2]){const bad=clone(current.materials);bad[group][1].at(-offset).map.image.width++;assert.throws(()=>restorePreR27Materials(bad));}
});

test('all 2487 previous colliders and 120 walkables remain ordered and byte-exact; only two final solids reverse',()=>{
  assert.equal(hash(current.navigation),scene.navigation.afterSHA256);assert.equal(hash(previous.navigation),scene.navigation.beforeSHA256);
  assert.equal(scene.navigation.beforeSHA256,'a1668d4eaf2b4ea21b0ea5a45fb421ef299ff48888d4d23bb1f60396be825853');
  assert.deepEqual([current.navigation.colliders.length,previous.navigation.colliders.length,current.navigation.walkables.length],[2489,2487,120]);
  assert.deepEqual(current.navigation.colliders.slice(0,-2),previous.navigation.colliders);assert.deepEqual(current.navigation.walkables,previous.navigation.walkables);
  assert.deepEqual(current.navigation.colliders.slice(-2),scene.navigation.added);
  assert.deepEqual(restorePreR27Navigation(current.navigation),previous.navigation);assert.equal(restorePreR27Navigation(previous.navigation),previous.navigation);
  assert.equal(hash(restorePreR22Navigation(current.navigation)),r22Navigation.beforeSHA256);
  for(const nav of[current.navigation,previous.navigation])for(const key of['colliders','walkables']){
    const missing=clone(nav);missing[key].pop();const duplicate=clone(nav);duplicate[key].push(clone(nav[key][0]));const reordered=clone(nav);reordered[key].reverse();const extra=clone(nav);extra.unknown=true;
    for(const bad of[missing,duplicate,reordered,extra])for(const restore of[restorePreR27Navigation,restorePreR22Navigation])assert.throws(()=>restore(bad));
    for(const i of[0,Math.floor(nav[key].length/2),nav[key].length-1]){const bad=clone(nav);bad[key][i].unknown=true;assert.throws(()=>restorePreR27Navigation(bad));}
  }
  for(const i of[2487,2488]){const bad=clone(current.navigation);bad.colliders[i].max.x+=.001;assert.throws(()=>restorePreR27Navigation(bad));}
  const partial=clone(current.navigation);partial.colliders.pop();assert.throws(()=>restorePreR27Navigation(partial));
});

test('the former R12 side-stair inner endpoints are intentionally blocked by the new objects while the vestibules remain free',()=>{
  const asBoxes=nav=>nav.colliders.map(c=>new THREE.Box3(new THREE.Vector3(c.min.x,c.min.y,c.min.z),new THREE.Vector3(c.max.x,c.max.y,c.max.z)));
  const live={...current.navigation,colliders:asBoxes(current.navigation)};assert.deepEqual(restorePreR27Navigation(live),previous.navigation);
  assert.equal(live.colliders.length,2489);assert.ok(live.colliders.every(c=>c instanceof THREE.Box3),'restoration does not overwrite the live registrations');
  const currentCM=new CollisionManager(),previousCM=new CollisionManager();currentCM.addColliders(asBoxes(current.navigation));previousCM.addColliders(asBoxes(previous.navigation));
  for(const direction of[-1,1]){
    const oldEndpoint=new THREE.Vector3(direction*7,2.16+PLAYER.HEIGHT,354.1);
    assert.equal(previousCM.checkCollision(oldEndpoint),false);assert.equal(currentCM.checkCollision(oldEndpoint),true);
    assert.equal(currentCM.checkCollision(new THREE.Vector3(direction*8.1,2.16+PLAYER.HEIGHT,354.1)),false);
  }
});
