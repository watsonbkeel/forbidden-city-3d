import{restoreR16SourceIfPresent}from'./lib/r16-baohe-retention.mjs';
import{restorePreR13SceneRow}from'./lib/r13-plaque-retention.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync}from'node:child_process';import *as T from'three';
import {PalaceBuilder}from'../src/scene/PalaceBuilder.js';import {PALACE_LAYOUT}from'../src/scene/Layout.js';
import {buildQianqingGate}from'../src/scene/palace/special/QianqingGate.js';import {buildWorld}from'./lib/world.mjs';
import {library,serial,sceneRows,gateFrontRows}from'./lib/inner-palace-fixture.mjs';import {replayKunning}from'./lib/kunning-walk.mjs';
import {INNER_PALACE_LEVELS as L,buildInnerPalaceLip}from'../src/scene/palace/special/InnerPalaceLevels.js';
import {innerPalaceTerraceProfile,buildInnerTerraceRail}from'../src/scene/palace/special/InnerPalaceTerrace.js';
const B=JSON.parse(fs.readFileSync(new URL('./fixtures/r12-inner-palace-baseline.json',import.meta.url)));
const scene=new T.Scene(),builder=new PalaceBuilder(scene,library());builder.buildAll(PALACE_LAYOUT);const groups=sceneRows(scene);
const world=await buildWorld();world.cm.walkables=world.cm.walkables.map(w=>w.type==='box'?{...w,rescue:false}:w);
const gBuilder=new PalaceBuilder(new T.Scene(),library()),gate=buildQianqingGate(gBuilder,PALACE_LAYOUT.find(h=>h.name==='乾清门'));
test('nominal shared terrace2m, provisional one-stone lip0.16m, unchanged horizontal anchors',()=>{
 assert.equal(L.terraceY,2);assert.equal(L.hallLip,.16);assert.equal(L.hallFloorY,2.16);
 for(const [name,z]of [['乾清宫',316.8],['交泰殿',354.1],['坤宁宫',386.1]]){const h=PALACE_LAYOUT.find(h=>h.name===name);assert.deepEqual(h.position,{x:0,y:0,z});assert.equal(h.dimensions.baseHeight,2);assert.equal(world.cm.getGroundHeight(0,z,0,999),2.16);}
 for(const z of[300,340,370,400])assert.equal(world.cm.getGroundHeight(0,z,0,999),2);
 assert.throws(()=>buildInnerPalaceLip(builder,new T.Group(),{z0:0,w:10,d:10,y:5,ph:.16}),/interface/);
 assert.throws(()=>buildInnerPalaceLip(builder,new T.Group(),{z0:0,w:10,d:10,y:2,ph:1.5}),/interface/);
});
test('all other static merged buildings and original front-hall geometry remain byte exact',()=>{
 for(const [name,row]of Object.entries(B.groups))if(!['乾清门','后三宫'].includes(name))assert.deepEqual(restorePreR13SceneRow(name,groups[name]),row,name);
 assert.equal(groups['后三宫'].meshes,33);assert.equal(groups['后三宫'].triangles,51972);
 assert.equal(groups['后三宫'].triangles-B.groups['后三宫'].triangles,6252,'include both LOD levels in resident inventory');
 assert.equal(groups['乾清门'].triangles,B.groups['乾清门'].triangles);
});
test('complete gate front triangles/normals/UV/color unchanged below the back-deck seam',()=>assert.deepEqual(gateFrontRows(gate),B.gateFront));
test('only eight known gate back-deck collision boxes differ; exact horizontal join2m ramp/1.5m causeway',()=>{
 const now=gBuilder.colliders.map(serial),diff=now.flatMap((c,i)=>JSON.stringify(c)===JSON.stringify(B.gateColliders[i])?[]:[i]);
 assert.deepEqual(diff,[120,121,122,123,124,125,126,127]);
 const connector=gate.userData.qianqingGate.connector;assert.equal(connector.width,10);assert.equal(connector.height,1.5);assert.equal(connector.endZ,297.5);
 // Changed side rails and retaining boxes bound5m half-width; no central blocker.
 for(const i of diff){const c=now[i];assert.ok(c.min[2]>=227.9);assert.ok(c.max[2]<=297.65);assert.ok(c.min[0]>=4.65||c.max[0]<=-4.65);}
 assert.equal(world.cm.getGroundHeight(0,297.5,1.5),1.5);assert.equal(world.cm.getGroundHeight(0,298.3,1.5),2);
});
test('actual east/west side stairs align with both Jiaotai central doors; only2 flights',()=>{
 const p=scene.getObjectByName('后三宫').userData.architecture.find(p=>p.id==='inner-palace-terrace');assert.equal(p.flights.length,2);
 for(const f of p.flights){assert.equal(f.centerZ,354.1);assert.equal(f.y1,2);assert.equal(f.y0,0);assert.equal(f.width,5.6);assert.equal(f.run,3.2);assert.equal(f.treadCount,13);assert.equal(f.xEdge,f.dir*13.5);assert.equal(f.xToe,f.dir*16.7);
  for(const t of[0,.25,.5,.75,1])assert.ok(Math.abs(world.cm.getGroundHeight(f.xEdge+f.dir*f.run*t,f.centerZ,0,999)-2*(1-t))<1e-7);
 }
});
for(const dir of[-1,1])for(const fps of[60,10])for(const sprint of[false,true])for(const backward of[false,true])
 test(`Jiaotai ground/side-stair/door native-controller roundtrip ${dir}/${fps}/${sprint}/${backward}`,t=>{
 const pts=[[dir*21,354.1],[dir*17.5,354.1],[dir*12,354.1],[dir*7,354.1],[dir*12,354.1],[dir*17.5,354.1],[dir*21,354.1]];
 const r=replayKunning(t,world,pts,{startFeet:0,fps,sprint,backward,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({...r,frames:undefined}));assert.ok(r.maxFeet>=2.15&&r.maxFeet<2.28);assert.ok(r.end[2]<.02);assert.equal(r.driver.crossings.length,6);
 });
test('greybrick/glazed low wall has real open holes and tight visible collision height',()=>{
 const b=new PalaceBuilder(new T.Scene(),library()),g=new T.Group();buildInnerTerraceRail(b,g,-2.1,0,2.1,0,2);g.updateMatrixWorld(true);
 const rail=g.children[0];assert.equal(rail.children.filter(m=>m.material.name.startsWith('inner-palace-glazed-brick:')).length,11);
 assert.equal(b.colliders.length,1);assert.equal(b.colliders[0].max.y,2.65);
 const ray=x=>new T.Raycaster(new T.Vector3(x,2.27,-1),new T.Vector3(0,0,1),0,2).intersectObject(g,true);
 assert.equal(ray(-1.575+.3).length,0,'open masonry aperture');assert.ok(ray(-1.575).length,'real yellow pier');
 const colors=new Set();for(const m of rail.children.filter(m=>m.material.name.startsWith('inner-palace-glazed-brick:'))){assert.equal(m.material.map,null);assert.equal(m.material.vertexColors,false);assert.equal(m.geometry.attributes.color,undefined);colors.add(m.material.color.getHex());}assert.equal(colors.size,2);
});
test('Kunning rebind reproducible with no BIN, proxy or material change',()=>{const r=JSON.parse(execFileSync(process.execPath,['tools/rebind-kunning-inner-levels.mjs','--check'],{encoding:'utf8'}));assert.equal(r.status,'pass');assert.equal(r.binAndGeometry,'unchanged');});
test('three hall bodies lower rigidly; tight float32 tolerance, only known world-height UV phase changes',async()=>{
 const{hallSurfaces}=await import('./lib/inner-palace-fixture.mjs'),{gunzipSync}=await import('node:zlib');
 const before=JSON.parse(gunzipSync(fs.readFileSync(new URL('./fixtures/r12-inner-hall-surfaces.json.gz',import.meta.url))));
 for(const[name,ref]of Object.entries(before)){const b=new PalaceBuilder(new T.Scene(),library()),g=new T.Group();b.buildHall(g,PALACE_LAYOUT.find(h=>h.name===name),2.16,{heightReferenceY:name==='乾清宫'?7:2.16});const rows=hallSurfaces(g,2.16);assert.equal(rows.length,ref.surfaces.length);
  for(let i=0;i<rows.length;i++){const a=rows[i],o=ref.surfaces[i];assert.equal(a.name,o.name);assert.equal(a.material,o.material);assert.deepEqual(a.index,o.index);
   for(const k of['position','normal','uv']){if(a[k]===null){assert.equal(o[k],null);continue;}assert.equal(a[k].length,o[k].length);for(let j=0;j<a[k].length;j++){const d=Math.abs(a[k][j]-o[k][j]);
    if(k==='position')assert.ok(d<.000003,`${name}/${i} rigid shape ${d}`);
    else if(k==='normal')assert.ok(d<.00003,`${name}/${i} float32 roof normal ${d}`);
    else {const worldUV=['roof_wudian_roof_ridge_glaze','roof_wudian_wood_column'].includes(a.name);assert.ok(d<.000003||(worldUV&&Math.abs(d-(ref.floorY-2.16))<.000003),`${name}/${i} UV differs outside known vertical box projection`);}
   }}
  }
 }
});
test('finite source restoration rejects unrelated edits, omissions and duplicate hunks',async()=>{
 const{restorePreR12InnerSource:restore}=await import('./lib/r12-inner-source-retention.mjs');
 const deltas=JSON.parse(fs.readFileSync(new URL('./fixtures/r12-inner-source-deltas.json',import.meta.url)));
 for(const[path,d]of Object.entries(deltas.files)){const raw=restoreR16SourceIfPresent(path,fs.readFileSync(new URL('../'+path,import.meta.url)));assert.notDeepEqual(restore(path,raw),raw);assert.throws(()=>restore(path,Buffer.concat([raw,Buffer.from('\n')])));
  for(const h of d.deltas)for(const replacement of[h.before,h.after+h.after,h.after+'// changed\n'])assert.throws(()=>restore(path,Buffer.from(raw.toString().replace(h.after,replacement))));
 }
});

test('glaze colours survive the actual complete PalaceBuilder finish/merge path',()=>{
 const rear=scene.getObjectByName('后三宫'),meshes=[];rear.traverseVisible(m=>{if(m.isMesh&&m.material.name.startsWith('inner-palace-glazed-brick:'))meshes.push(m);});
 assert.equal(meshes.length,2,'two honest merged batches');
 assert.deepEqual(meshes.map(m=>m.material.color.getHex()).sort((a,b)=>a-b),[0x387756,0xb78626]);
 for(const m of meshes){assert.equal(m.material.vertexColors,false);assert.equal(m.geometry.attributes.color,undefined);assert.equal(m.material.map,null);assert.ok(m.geometry.attributes.position.count>100);}
});
