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
for(const hall of['太和殿','乾清宫'])test(`${hall} retains both original cap groups`,()=>{
 for(const{mesh}of captureBaoheDepth(hall).columns)assert.ok(mesh.geometry.groups.some(g=>g.materialIndex===2));
});
