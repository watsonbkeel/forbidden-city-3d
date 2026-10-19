import {restorePreR30SceneRows} from './lib/r30-qianqing-passage-retention.mjs';
import {restorePreR29SceneRows} from './lib/r29-qianqing-retention.mjs';
import {r28Scene,restorePreR28SceneRows} from './lib/r28-jiaotai-central-retention.mjs';
import {restorePreR27SceneRows} from './lib/r27-jiaotai-retention.mjs';
import {restorePreR26SceneRows} from './lib/r26-qianqing-retention.mjs';
// Exact pre-R25 nameboard poses for historical whole-hall fingerprints only.
import {HistoricalR24PalaceBuilder} from './lib/historical-r24-baohe-fixture.mjs';
import {restorePreR16Navigation}from './lib/r16-baohe-retention.mjs';
import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import *as T from'three';
import{PalaceBuilder}from'../src/scene/PalaceBuilder.js';import{PALACE_LAYOUT}from'../src/scene/Layout.js';import{library,hash,sceneRows}from'./lib/inner-palace-fixture.mjs';
import{INNER_GLAZE_LOD as L,captureInnerGlazeCoarse,installInnerGlazeLOD}from'../src/scene/palace/special/InnerPalaceGlazeLOD.js';
const ref=JSON.parse(fs.readFileSync(new URL('./fixtures/r12-glaze-lod-baseline.json',import.meta.url)));
const scene=new T.Scene(),b=new PalaceBuilder(scene,library());b.buildAll(PALACE_LAYOUT);const rear=scene.getObjectByName('后三宫'),lod=rear.getObjectByName('rear-glaze-distance-detail');
// Exact complete R26/R25 scene binding, before any LOD visibility changes.
const currentRows=sceneRows(scene),r26Rows=restorePreR27SceneRows(currentRows),historicalRows=restorePreR26SceneRows(currentRows);
// Bind the entire R28 resident scene before accounting for the registered
// central replacement. These tests update glaze only; both Jiaotai LODs stay
// near. Original R12/R26/R27 thresholds below remain unchanged.
const r27Rows=restorePreR28SceneRows(currentRows);
const r28Rows=restorePreR29SceneRows(currentRows);
const r29Rows=restorePreR30SceneRows(currentRows);
const r30Triangles=currentRows['后三宫'].triangles-r29Rows['后三宫'].triangles,r30Meshes=currentRows['后三宫'].meshes-r29Rows['后三宫'].meshes;
assert.deepEqual([r30Triangles,r30Meshes],[288,1]);
const r29Triangles=r29Rows['后三宫'].triangles-r28Rows['后三宫'].triangles,r29Meshes=r29Rows['后三宫'].meshes-r28Rows['后三宫'].meshes;
const qianqing=rear.getObjectByName('qianqing-central-setting-detail'),r29HiddenTriangles=qianqing.levels[1].object.children.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0);
assert.deepEqual([r29Triangles,r29Meshes,r29HiddenTriangles],[1334,0,192]);
const r29VisibleTriangles=r29Triangles-r29HiddenTriangles;
const r28Triangles=r28Rows['后三宫'].triangles-r27Rows['后三宫'].triangles;
const r28Meshes=r28Rows['后三宫'].meshes-r27Rows['后三宫'].meshes;
const r28HiddenTriangles=r28Scene.graph.changes.at(-1).after.find(n=>n.name==='jiaotai-central-far_jiaotai-central-atlas').triangles;
assert.deepEqual([r28Triangles,r28Meshes,r28HiddenTriangles],[864,2,172]);
const r28VisibleTriangles=r28Triangles-r28HiddenTriangles;
scene.updateMatrixWorld(true);
const r26Triangles=r26Rows['后三宫'].triangles-historicalRows['后三宫'].triangles,r26Meshes=r26Rows['后三宫'].meshes-historicalRows['后三宫'].meshes;
// This test updates only the glaze LOD; Jiaotai stays near (1024 drawn, 142 hidden).
const tris=g=>{let n=0;g.traverseVisible(m=>{if(m.isMesh)n+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3});if(g===rear){const central=rear.getObjectByName('jiaotai-central-ceiling-detail');assert.deepEqual(central.levels.map(l=>l.object.visible),[true,false]);assert.deepEqual(qianqing.levels.map(l=>l.object.visible),[true,false]);return n-r28VisibleTriangles-r29VisibleTriangles-r30Triangles;}return n;};
function update(distance){const c=new T.PerspectiveCamera(70,16/9,.1,1500);c.position.set(distance,0,L.centerZ);c.updateMatrixWorld(true);lod.update(c);return lod.getCurrentLevel();}
test('frozen R24 near geometry and live world navigation retain exact a40d91a bytes',()=>{
 update(20);const frozenScene=new T.Scene(),frozenBuilder=new HistoricalR24PalaceBuilder(frozenScene,library());frozenBuilder.buildAll(PALACE_LAYOUT);frozenScene.updateMatrixWorld(true);
 const rows=[];frozenScene.getObjectByName('后三宫').traverseVisible(m=>{if(!m.isMesh)return;rows.push({name:m.name,matrix:m.matrixWorld.toArray(),material:m.material.name,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[a.itemSize,...a.array]])),index:m.geometry.index?[...m.geometry.index.array]:null})});rows.sort((a,b)=>a.name.localeCompare(b.name)||a.attributes.position.length-b.attributes.position.length);
 assert.equal(hash(rows),ref.nearHash);assert.equal(tris(frozenScene.getObjectByName('后三宫')),50100);frozenBuilder.dispose();assert.deepEqual([r26Triangles,r26Meshes],[48,1]);const oldNav=restorePreR16Navigation({colliders:b.colliders,walkables:b.walkables});assert.equal(hash(oldNav.colliders),ref.colliders);assert.equal(hash(oldNav.walkables),ref.walkables);assert.equal(tris(rear),50100+r26Triangles+1024);
});
test('real Three LOD switches only at240m with return hysteresis; never both levels visible',()=>{
 assert.equal(lod.autoUpdate,true);assert.equal(lod.levels.length,2);assert.equal(lod.levels[1].distance,240);assert.equal(lod.levels[1].hysteresis,.1);
 for(const[d,level]of [[20,0],[239,0],[241,1],[225,1],[215,0]]){assert.equal(update(d),level);assert.deepEqual(lod.levels.map(l=>l.object.visible),level?[false,true]:[true,false]);}
});
test('3696 fewer submitted triangles at far range; separately account all1872 additional resident triangles',()=>{
 update(20);const near=tris(rear);update(300);const far=tris(rear);assert.equal(near,50100+r26Triangles+1024);assert.equal(far,46404+r26Triangles+1024);assert.equal(near-far,3696);
 let resident=0,meshes=0,bytes=0;rear.traverse(m=>{if(!m.isMesh)return;meshes++;resident+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;if(m.parent===lod.levels[1].object)for(const a of Object.values(m.geometry.attributes))bytes+=a.array.byteLength;});resident-=r28Triangles+r29Triangles+r30Triangles;meshes-=r28Meshes+r29Meshes+r30Meshes;assert.equal(resident,51972+r26Triangles+1166);assert.equal(meshes,33+r26Meshes+2);assert.equal(resident-near,1872+142);assert.equal(bytes,179712);
 assert.equal(lod.levels[0].object.children.length,2);assert.equal(lod.levels[1].object.children.length,2);assert.equal(lod.levels[0].object.children[0].material,lod.levels[1].object.children[0].material);update(20);
});
test('only glaze geometry is owned by LOD; every full-size cap and stair cheek is included in far source',()=>{
 const raw=new T.Group(),smallBuilder=new PalaceBuilder(new T.Scene(),library());let source;
 const orig=smallBuilder.finish.bind(smallBuilder);smallBuilder.finish=g=>{source=g;return orig(g)};
 smallBuilder.buildComplex(PALACE_LAYOUT.filter(x=>['乾清宫','交泰殿','坤宁宫'].includes(x.name)),{name:'后三宫',apron:6,margin:4});
 let marked=0;source.traverse(m=>{if(m.isMesh&&m.material.name.startsWith('inner-palace-glazed-brick:')){marked++;assert.equal(typeof m.userData.innerGlazeCoarse,'boolean');}});assert.equal(marked,464);
 for(const level of lod.levels)for(const m of level.object.children){assert.ok(m.material.name.startsWith('inner-palace-glazed-brick:'));assert.equal(m.material.map,null);assert.equal(m.castShadow,true);assert.equal(m.receiveShadow,true);}
 assert.throws(()=>captureInnerGlazeCoarse(raw),/missing/);assert.throws(()=>installInnerGlazeLOD(raw,new T.Group()),/exactly two/);
});
test('coarse geometries have distinct resource ownership and are disposed with the builder',()=>{
 const owned=[];for(const l of lod.levels)for(const m of l.object.children)owned.push(m.geometry);assert.equal(new Set(owned).size,4);const counts=new Map(owned.map(g=>[g,0]));for(const g of owned)g.addEventListener('dispose',()=>counts.set(g,counts.get(g)+1));b.dispose();assert.deepEqual([...counts.values()],[1,1,1,1]);
});
