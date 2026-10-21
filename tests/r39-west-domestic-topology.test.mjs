import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library,hash} from './lib/inner-palace-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
const file=new URL('../src/scene/palace/special/WestDomesticHalls.js',import.meta.url),api=existsSync(file)?await import(file):{};
const data=JSON.parse(readFileSync(new URL('../data/zones/west-six.json',import.meta.url)));
const nodes=(root,role)=>{const a=[];root.traverse(o=>{if(o.userData.role===role)a.push(o);});return a;};
const expected={长春宫:{profile:'changchun-domestic',boundaries:2,rooms:3},翊坤宫:{profile:'yikun-domestic',boundaries:4,rooms:5}};
function fixture(name){assert.equal(typeof api.buildWestDomesticHall,'function','distinct palace-specific domestic layout builder is absent');const item=data.items.find(i=>i.kind==='hall'&&i.name===name),b=new ZoneBase(library(),data),result=b.buildHall(item);b.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);return{b,item,cm,...result};}
for(const [name,p]of Object.entries(expected))test(`R39 ${name} builds a sourced distinct room topology, not Chuxiu or generic room subdivision`,()=>{
 const {b,item,f}=fixture(name);assert.equal(item.domesticProfile,p.profile);assert.equal(nodes(f,'west-domestic-boundary').length,p.boundaries);assert.equal(b.kit.rooms.length,p.rooms);
 assert.equal(nodes(f,'chuxiu-partition').length,0);assert.equal(f.userData.structure.interiorStatus,'SOURCE_TOPOLOGY_WITH_FITTED_OPENINGS_NOT_COMPLETE_INVENTORY');
 const records=nodes(f,'west-domestic-boundary').map(o=>o.userData);
 assert.ok(records.every(r=>r.source.startsWith('https://www.dpm.org.cn/')&&r.dimensionStatus==='REVERSIBLE_MODEL_FIT_NOT_SURVEYED'));
 if(name==='长春宫')assert.ok(records.every(r=>r.kind==='curtain-cover'));
 if(name==='翊坤宫')assert.deepEqual(records.map(r=>r.kind),['partition-door','openwork-cover','openwork-cover','partition-door']);
});
test('R39 Changchun alone has the two north outer-bay kang contours and photo-fitted low dark seat/screen',()=>{
 const {f,item}=fixture('长春宫'),kangs=nodes(f,'changchun-north-kang');assert.equal(kangs.length,2);
 for(const k of kangs){assert.ok(Math.abs(k.position.x)>item.w*.3&&k.position.z>2);assert.match(k.userData.source,/236436/);assert.equal(k.userData.dimensionStatus,'REVERSIBLE_MODEL_FIT_NOT_SURVEYED');}
 assert.equal(nodes(f,'changchun-five-screen-panel').length,5);assert.equal(nodes(f,'changchun-low-seat').length,1);assert.equal(nodes(f,'changchun-footstool').length,1);assert.equal(nodes(f,'changchun-seat-cushion').length,1);
 for(const name of ['翊坤宫'])assert.equal(nodes(fixture(name).f,'changchun-north-kang').length,0);
});

import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
for(const name of Object.keys(expected)){
 for(const fps of [10,60])test(`R39 ${name} real controller repeats entry, all lateral room openings and exit at ${fps}Hz`,t=>{
  const {b,item,cm,p}=fixture(name),x=item.x,z=item.z,front=[x,z-item.d/2-item.pad-2],center=[x,z+p.passageZ],east=[x-item.w/2+1.2,z+p.passageZ],west=[x+item.w/2-1.2,z+p.passageZ];
  const points=[front,center,east,west,center,front,center,west,east,center,front],trace=traceTerraceGround(cm,{flights:[]});
  try{const result=replayTerrace(t,{cm,THREE},points,{fps,sprint:false,recordFrames:true});assert.equal(result.arrived,true,JSON.stringify(result));assert.equal(result.startFeet,0);assert.equal(trace.samples.some(s=>s.source==='rescue'),false);}finally{trace.restore();}
  for(const r of b.kit.rooms)for(const p of [...r.doors,...r.spawns])assert.equal(cm.checkCollision(new THREE.Vector3(p.x,item.ph+1.7,p.z),.45),false,`${name} doorway/spawn`);
 });
 test(`R39 ${name} retains original shell, floors, map footprint and non-furniture geometry`,()=>{
  const {b,item,f}=fixture(name),base=new ZoneBase(library(),data),{structure,domesticProfile,...plain}=item;
  const {f:old}=base.buildHall({...plain,throne:name==='长春宫'?false:true,interior:'empty'});old.updateMatrixWorld(true);
  const row=m=>hash({p:m.position.toArray(),r:m.rotation.toArray(),s:m.scale.toArray(),mat:m.material?.name,a:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,v])=>[k,[...v.array]])),idx:m.geometry.index?[...m.geometry.index.array]:null});
  const rows=root=>{const out=[];root.traverse(m=>{if(m.isMesh&&!m.userData.role?.startsWith('west-domestic')&&!m.userData.role?.startsWith('changchun')&&!m.userData.role?.startsWith('taiji'))out.push(row(m));});return out.sort();};
  assert.deepEqual(rows(f),rows(old));assert.deepEqual(b.kit.walkables,base.kit.walkables);assert.deepEqual(b.kit.mapItems,base.kit.mapItems);
  const newCols=b.kit.colliders.slice(base.kit.colliders.length),visible=[];f.traverse(o=>{if(o.isMesh&&o.userData.role)visible.push(new THREE.Box3().setFromObject(o));});
  for(const c of newCols)assert.ok(visible.some(v=>v.min.distanceTo(c.min)<1e-5&&v.max.distanceTo(c.max)<1e-5),'new boundary solid must match actual visible block, not an invisible wall');
 });
 test(`R39 ${name} source status survives merge and all new owned resources dispose once`,()=>{
  const {b}=fixture(name),counts=[];
  for(const m of b.kit.owned){const c={value:0};m.addEventListener('dispose',()=>c.value++);counts.push(c);}
  const merged=b.kit.finish();assert.ok(merged.userData.architecture.some(r=>r.id==='west-six/'+expected[name].profile&&r.doorPose.includes('NOT_HISTORICAL')));
  let triangles=0;merged.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;for(const a of Object.values(o.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));}});assert.ok(triangles<100000);
  b.kit.dispose(merged);for(const c of counts)assert.equal(c.value,1);
 });
}
test('R39 domestic profiles reject malformed/transplanted identities before shell mutation',()=>{
 const item=data.items.find(i=>i.name==='长春宫'&&i.kind==='hall');
 for(const change of [{x:0},{w:28},{bays:7},{name:'储秀宫'},{domesticProfile:'unknown'},{backDoor:true}]){const b=new ZoneBase(library(),data);assert.throws(()=>b.buildHall({...item,...change}),/West domestic/);assert.equal(b.kit.root.children.length,0);}
 const b=new ZoneBase(library(),{id:'east-six'});assert.throws(()=>b.buildHall(item),/West domestic/);assert.equal(b.kit.root.children.length,0);
});
