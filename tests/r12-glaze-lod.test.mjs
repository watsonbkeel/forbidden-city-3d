// Exact pre-R25 nameboard poses for historical whole-hall fingerprints only.
import {HistoricalR24PalaceBuilder} from './lib/historical-r24-baohe-fixture.mjs';
import {restorePreR16Navigation}from './lib/r16-baohe-retention.mjs';
import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import *as T from'three';
import{PalaceBuilder}from'../src/scene/PalaceBuilder.js';import{PALACE_LAYOUT}from'../src/scene/Layout.js';import{library,hash}from'./lib/inner-palace-fixture.mjs';
import{INNER_GLAZE_LOD as L,captureInnerGlazeCoarse,installInnerGlazeLOD}from'../src/scene/palace/special/InnerPalaceGlazeLOD.js';
const ref=JSON.parse(fs.readFileSync(new URL('./fixtures/r12-glaze-lod-baseline.json',import.meta.url)));
const scene=new T.Scene(),b=new PalaceBuilder(scene,library());b.buildAll(PALACE_LAYOUT);scene.updateMatrixWorld(true);const rear=scene.getObjectByName('后三宫'),lod=rear.getObjectByName('rear-glaze-distance-detail');
const tris=g=>{let n=0;g.traverseVisible(m=>{if(m.isMesh)n+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3});return n;};
function update(distance){const c=new T.PerspectiveCamera(70,16/9,.1,1500);c.position.set(distance,0,L.centerZ);c.updateMatrixWorld(true);lod.update(c);return lod.getCurrentLevel();}
test('frozen R24 near geometry and live world navigation retain exact a40d91a bytes',()=>{
 update(20);const frozenScene=new T.Scene(),frozenBuilder=new HistoricalR24PalaceBuilder(frozenScene,library());frozenBuilder.buildAll(PALACE_LAYOUT);frozenScene.updateMatrixWorld(true);
 const rows=[];frozenScene.getObjectByName('后三宫').traverseVisible(m=>{if(!m.isMesh)return;rows.push({name:m.name,matrix:m.matrixWorld.toArray(),material:m.material.name,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[a.itemSize,...a.array]])),index:m.geometry.index?[...m.geometry.index.array]:null})});rows.sort((a,b)=>a.name.localeCompare(b.name)||a.attributes.position.length-b.attributes.position.length);
 assert.equal(hash(rows),ref.nearHash);frozenBuilder.dispose();const oldNav=restorePreR16Navigation({colliders:b.colliders,walkables:b.walkables});assert.equal(hash(oldNav.colliders),ref.colliders);assert.equal(hash(oldNav.walkables),ref.walkables);assert.equal(tris(rear),50100);
});
test('real Three LOD switches only at240m with return hysteresis; never both levels visible',()=>{
 assert.equal(lod.autoUpdate,true);assert.equal(lod.levels.length,2);assert.equal(lod.levels[1].distance,240);assert.equal(lod.levels[1].hysteresis,.1);
 for(const[d,level]of [[20,0],[239,0],[241,1],[225,1],[215,0]]){assert.equal(update(d),level);assert.deepEqual(lod.levels.map(l=>l.object.visible),level?[false,true]:[true,false]);}
});
test('3696 fewer submitted triangles at far range; separately account all1872 additional resident triangles',()=>{
 update(20);const near=tris(rear);update(300);const far=tris(rear);assert.equal(near,50100);assert.equal(far,46404);assert.equal(near-far,3696);
 let resident=0,meshes=0,bytes=0;rear.traverse(m=>{if(!m.isMesh)return;meshes++;resident+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;if(m.parent===lod.levels[1].object)for(const a of Object.values(m.geometry.attributes))bytes+=a.array.byteLength;});assert.equal(resident,51972);assert.equal(meshes,33);assert.equal(bytes,179712);
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
