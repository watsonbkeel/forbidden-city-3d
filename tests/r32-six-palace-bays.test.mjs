import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';

const groups = [
  ['east-six', [['景仁宫',5],['承乾宫',5],['钟粹宫',5],['永和宫',5],['景阳宫',3]]],
  ['west-six', [['永寿宫',5],['翊坤宫',5],['储秀宫',5],['太极殿',5],['长春宫',5],['咸福宫',3]]],
];
function library() {
 const mats=new Map();
 return {material(name){if(!mats.has(name))mats.set(name,new THREE.MeshStandardMaterial({name}));return mats.get(name);},tileSize:()=>1,aspect:()=>1};
}
for(const [id,halls] of groups){
 const data=JSON.parse(readFileSync(new URL(`../data/zones/${id}.json`,import.meta.url)));
 for(const [name,bays]of halls)test(`${name}: official ${bays} bays reach actual front-eave column geometry`,()=>{
  const matches=data.items.filter(i=>i.kind==='hall'&&i.name===name);assert.equal(matches.length,1);
  const item=matches[0], zone=new ZoneBase(library(),data); zone.buildHall(item);
  const frame=zone.kit.root.children.find(g=>g.userData.structure);
  assert.ok(frame,'real hall frame');
  const cols=frame.children.filter(m=>m.geometry?.type==='CylinderGeometry'&&m.material?.name==='wood_column'&&Math.abs(m.position.z+item.d/2)<1e-7&&Math.abs(m.position.y-(item.ph+item.colH/2))<1e-7);
  const xs=[...new Set(cols.map(m=>m.position.x.toFixed(7)))].map(Number).sort((a,b)=>a-b);
  assert.equal(xs.length-1,bays,'actual generated front bays, not metadata');
  assert.equal(item.bays,bays,'explicit count required: no width-derived identity');
  assert.equal(xs[0],-item.w/2);assert.equal(xs.at(-1),item.w/2);
  assert.equal(frame.position.x,item.x);assert.equal(frame.position.z,item.z);
  assert.ok(zone.kit.colliders.every(c=>[...c.min.toArray(),...c.max.toArray()].every(Number.isFinite)));
 });
}
