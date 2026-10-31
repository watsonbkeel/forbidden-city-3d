import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {execFileSync} from 'node:child_process';
import {baoheFirewallWorld} from '../../r92-joint/fixture.mjs';
import {PalaceBuilder} from '../../../src/scene/PalaceBuilder.js';
import * as current from '../../../src/scene/palace/special/TaiheEastWallDoor.js';
const old=execFileSync('git',['show','064ecb27:src/scene/palace/special/TaiheEastWallDoor.js'],{encoding:'utf8'}).replace("from 'three'",`from '${import.meta.resolve('three')}'`);
const parent=await import('data:text/javascript;base64,'+Buffer.from(old).toString('base64'));
const gilt=g=>{const out=[];g.traverse(m=>{if(m.userData.firewallPart==='taihe-south-frame-gilt')out.push(m);});return out;};
test('Own1280 fronts have only three fixed south-frame gold strips, not four borders on each leaf',()=>{
 const w=baoheFirewallWorld();for(const side of['east','west']){
  const g=w.scene.getObjectByName(`taihe-${side}-stepped-firewall`),p=g.userData.structure,d=p.passage,strips=gilt(g);assert.equal(strips.length,3);
  for(const m of strips){assert.equal(m.parent,g,'fixed frame, not moving leaf hinge');assert.equal(m.geometry.index.count,6,'single thin painted plane, not box');const b=new T.Box3().setFromObject(m);assert.ok(b.max.z<p.z-p.thickness/2-.09);assert.ok(b.min.y>=d.floorY+.14-1e-6);assert.ok(b.max.x<=d.centerX-d.clearWidth/2||b.min.x>=d.centerX+d.clearWidth/2||b.min.y>=d.floorY+d.clearHeight,'no paint over real aperture');const n=new T.Vector3().fromBufferAttribute(m.geometry.attributes.normal,0).transformDirection(m.matrixWorld);assert.ok(n.z<-.99,'south-facing visible paint');}
  const boxes=strips.map(m=>new T.Box3().setFromObject(m));for(let i=0;i<3;i++)for(let k=i+1;k<3;k++){const a=boxes[i],b=boxes[k];assert.ok(Math.min(a.max.x,b.max.x)-Math.max(a.min.x,b.min.x)<1e-6||Math.min(a.max.y,b.max.y)-Math.max(a.min.y,b.min.y)<1e-6,'corners meet but never overlap');}
 }
});
test('Source-fitted headers preserve leaves, side frames, floor and all collisions outside explicit header pieces',()=>{
 const w=baoheFirewallWorld();for(const side of['east','west'])for(const open of[true,false]){
  const p=structuredClone(w.scene.getObjectByName(`taihe-${side}-stepped-firewall`).userData.structure);p.passage.gameplayOpen=open;const method=side==='east'?'addTaiheEastWallDoor':'addTaiheWestWallDoor',a=new PalaceBuilder(new T.Scene(),w.builder.library),b=new PalaceBuilder(new T.Scene(),w.builder.library),ga=new T.Group(),gb=new T.Group();ga.userData.structure=structuredClone(p);gb.userData.structure=structuredClone(p);parent[method](a,ga,p);current[method](b,gb,p);assert.equal(b.colliders.length,a.colliders.length);const changed=new Set([2,3,4,5,6,7,11]);for(let i=0;i<a.colliders.length;i++){if(!changed.has(i))assert.deepEqual(b.colliders[i],a.colliders[i],`retained collider${i}`);else{assert.notDeepEqual(b.colliders[i],a.colliders[i],`source-refitted header${i}`);assert.ok(b.colliders[i].min.y>=p.passage.floorY+p.passage.clearHeight,'all header changes stay above actual aperture');assert.equal(b.colliders[i].min.z,a.colliders[i].min.z);assert.equal(b.colliders[i].max.z,a.colliders[i].max.z);}}assert.deepEqual(b.walkables,a.walkables);const values=g=>{g.updateMatrixWorld(true);const out=[];g.traverse(m=>{if(m.isMesh&&m.userData.firewallPart!=='taihe-south-frame-gilt'&&!/:(south-timber:head|(south|north)-painted-lintel|south-pin:[0-3]|taihe-south-pin-(red-centre|gold-ring):[0-3])$/.test(m.name))out.push({name:m.name,matrix:m.matrixWorld.toArray(),positions:Array.from(m.geometry.attributes.position.array),index:Array.from(m.geometry.index?.array??[])});});return out;};assert.deepEqual(values(gb),values(ga));assert.equal(b.ownedMaterials.length,a.ownedMaterials.length,'reuse existing pin gold, no new material');assert.equal(gilt(gb).length,3);
 }
});
test('Own1280 header zones keep a red gap between gold frame and pins, with independent north beam level',()=>{
 const w=baoheFirewallWorld();for(const side of['east','west']){const g=w.scene.getObjectByName(`taihe-${side}-stepped-firewall`),p=g.userData.structure,top=p.passage.floorY+p.passage.clearHeight,box=name=>new T.Box3().setFromObject(g.getObjectByName(`${p.id}:${name}`)),line=box('south-frame-gilt:top');for(let i=0;i<4;i++){const b=box(`south-pin:${i}`),gap=b.min.y-line.max.y;assert.ok(gap>=.05&&gap<=.10,`${side} pin${i} gold/red separation ${gap} must follow own fronts`);assert.ok(b.max.y-b.min.y>=.195&&b.max.y-b.min.y<=.23,'own pin size relative to aperture');}const south=box('south-painted-lintel'),north=box('north-painted-lintel');assert.ok(south.min.y-top>=.34&&south.min.y-top<=.43);assert.ok(north.min.y-top>=.27&&north.min.y-top<=.34);assert.ok(box('south-timber:head').max.y-top>=.34);assert.ok(Math.abs(box('north-timber:head').max.y-top-.18)<1e-6,'north own smaller head is not copied from south');}
});
