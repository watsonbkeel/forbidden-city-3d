import {historicalR32ModuleURL} from './lib/historical-r32-scene-dependencies.mjs';
const {PalaceBuilder:HistoricalR32PalaceBuilder}=await import(historicalR32ModuleURL('src/scene/PalaceBuilder.js'));
import {PalaceBuilder} from '../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {library} from './lib/inner-palace-fixture.mjs';
import baseline from './fixtures/r19-baohe-depth-baseline.json' with {type:'json'};
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {captureBaoheDepth} from './lib/baohe-depth-capture.mjs';
import {HistoricalR19PalaceBuilder} from './lib/historical-r19-baohe-fixture.mjs';
import {baoheInteriorFrame} from '../src/scene/palace/BaoheInteriorFrame.js';
const a=captureBaoheDepth('保和殿');
test('live R20 two height groups retain all54 buried-cap omissions,14sides,tops,attributes,placement and shadow',()=>{
 const historical=captureBaoheDepth('保和殿',HistoricalR19PalaceBuilder);
 const low=historical.columns[0].mesh.geometry.parameters.height;
 const high=baoheInteriorFrame({w:49.7,d:25,y:9.9375,H:low}).columnHeight;
 const geometries=[...new Set(a.columns.map(({mesh})=>mesh.geometry))];
 assert.equal(a.columns.length,54);assert.equal(geometries.length,2);
 assert.deepEqual(geometries.map(g=>g.parameters.height).sort((a,b)=>a-b),[low,high]);
 let saved=0;
 for(const geo of geometries){
  const p=geo.parameters;
  const original=new THREE.CylinderGeometry(p.radiusTop,p.radiusBottom,p.height,p.radialSegments,p.heightSegments,p.openEnded);
  const bottom=original.groups.find(g=>g.materialIndex===2),members=a.columns.filter(({mesh})=>mesh.geometry===geo);
  assert.equal(p.radialSegments,14);assert.equal(members.length,p.height===low?28:26);
  assert.deepEqual(Array.from(geo.index.array),Array.from(original.index.array.slice(0,bottom.start)));
  assert.deepEqual(geo.groups,original.groups.filter(g=>g.materialIndex!==2));
  for(const key of Object.keys(original.attributes))assert.deepEqual(geo.attributes[key].array,original.attributes[key].array,key);
  saved+=(original.index.count-geo.index.count)/3*members.length;
  original.dispose();
 }
 assert.equal(saved,756);
 for(const{mesh}of a.columns){const{i,k}=mesh.userData.baoheColumn;assert.equal(mesh.geometry.parameters.height,i>=1&&i<=8&&k>=1&&k<=4?high:low);assert.equal(mesh.castShadow,true);assert.equal(mesh.position.y-mesh.geometry.parameters.height/2,9.9375);}
 const floor=a.group.children.find(m=>m.geometry?.type==='PlaneGeometry'&&Math.abs(m.position.y-9.9675)<1e-9);
 assert.ok(floor);assert.equal(floor.material.transparent,false);assert.equal(floor.material.opacity,1);
 const[w,d]=[floor.geometry.parameters.width,floor.geometry.parameters.height];
 for(const{mesh}of a.columns){const p=mesh.geometry.parameters;assert.ok(Math.abs(mesh.position.x)<=w/2);if(Math.abs(mesh.position.x)+p.radiusBottom>w/2){const wall=a.boxes.find(b=>b.material==='wall_brick'&&Math.abs(b.position[0]-mesh.position.x)<1e-9);assert.ok(wall);assert.ok(p.radiusBottom<wall.size[0]/2);assert.equal(wall.mesh.material.transparent,false);}assert.ok(Math.abs(mesh.position.z)+p.radiusBottom<d/2);}
 historical.builder.dispose();
});
test('太和殿 retains both original cap groups',()=>{
 const control=captureBaoheDepth('太和殿');
 try{for(const{mesh}of control.columns)assert.ok(mesh.geometry.groups.some(g=>g.materialIndex===2));}finally{control.builder.dispose();}
});
test('frozen R32 乾清宫 retains every original column cap in its registered world frame',()=>{
 const builder=new HistoricalR32PalaceBuilder(new THREE.Scene(),library()),group=new THREE.Group(),columns=[];
 const original=builder.column.bind(builder);
 builder.column=(...args)=>{original(...args);columns.push(args[0].children.at(-1));};
 try{
  builder.buildHall(group,PALACE_LAYOUT.find(h=>h.name==='乾清宫'),2.16,{heightReferenceY:7});
  assert.equal(columns.length,baseline.halls['乾清宫'].columnCount);
  for(const mesh of columns)assert.ok(mesh.geometry.groups.some(g=>g.materialIndex===2));
 }finally{builder.dispose();}
});

// The R33 grid is intentionally larger; check raw live geometry separately.
test('live R33 乾清宫 retains both cap groups on all 56 registered columns',()=>{
 const builder=new PalaceBuilder(new THREE.Scene(),library()),group=new THREE.Group();
 try{builder.buildHall(group,PALACE_LAYOUT.find(h=>h.name==='乾清宫'),2.16,{heightReferenceY:7});
 const columns=group.children.filter(m=>m.userData.qianqingColumn);assert.equal(columns.length,56);
 for(const mesh of columns)assert.deepEqual(mesh.geometry.groups.map(g=>g.materialIndex),[0,1,2]);
 }finally{builder.dispose();}
});
