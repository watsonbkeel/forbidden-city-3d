import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {buildRoof} from '../src/scene/RoofBuilder.js';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library,hash} from './lib/inner-palace-fixture.mjs';
const config=id=>JSON.parse(readFileSync(new URL(`../data/zones/${id}.json`,import.meta.url)));
const targets=[['east-six',-93,347.4,'jingren-rear'],['east-six',-93,403.9,'chengqian-rear'],['east-six',-93,456,'zhongcui-rear'],['east-six',-148.7,401.9,'yonghe-rear'],['west-six',94.5,450.2,'lijingxuan'],['west-six',149.3,449.8,'tongdaotang']];
const fixture=(zone,x,z)=>{const data=config(zone),item=data.items.find(i=>i.kind==='hall'&&i.x===x&&i.z===z);assert.ok(item,`existing ${zone} hall ${x},${z}`);const b=new ZoneBase(library(),data),out=b.buildHall(item);b.kit.root.updateMatrixWorld(true);return{b,item,...out};};
function signature(g){g.updateMatrixWorld(true);const rows=[];g.traverse(m=>{if(m.isMesh)rows.push({matrix:m.matrixWorld.toArray(),mat:m.material?.name,color:m.material?.color?.getHex(),side:m.material?.side,a:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,v])=>[k,[v.itemSize,...v.array]])),index:m.geometry.index?[...m.geometry.index.array]:null});});return hash(rows);}
const base=JSON.parse(readFileSync(new URL('./fixtures/r39-ordinary-roof-baseline.json',import.meta.url)));
test('R39 no-opt-in roof forms keep exact R38 geometry and material signatures in both detail/eave modes',()=>{for(const row of base.rows)assert.equal(signature(buildRoof(library(),row.opts)),row.sha256,JSON.stringify(row.opts));});
for(const [zone,x,z,id] of targets)test(`R39 ${id} uses official five-bay rear-hall profile and flush hard-gable roof`,()=>{
 const {b,item,f}=fixture(zone,x,z);assert.equal(item.rearHallProfile,id);assert.equal(item.bays,5);assert.equal(item.roof,'gable');assert.equal(f.userData.rearHall?.id,id);
 const roof=f.children.find(o=>o.userData.hardGableEnd);assert.ok(roof,'source-scoped hard-gable profile must reach actual roof');
 assert.equal(roof.userData.hardGableEnd.widthBasis,'RETAINED_SHELL_MODEL_FIT_NOT_SURVEYED');
 assert.equal(roof.userData.hardGableEnd.endPlaneX,item.w/2);
 const tile=[];roof.traverse(m=>{if(m.isMesh&&m.material?.name?.includes('roof_tile'))tile.push(m);});assert.ok(tile.length);
 for(const mesh of tile){const box=new THREE.Box3().setFromObject(mesh);assert.ok(box.min.x>=x-item.w/2-1e-4&&box.max.x<=x+item.w/2+1e-4,'tile slopes do not oversail gable end plane');}
 assert.equal(b.kit.rooms.length,1);assert.equal(b.kit.rooms[0].doors[0].x,x,'central entrance remains on retained model axis');
});
test('R39 hard-gable-end option rejects unsupported roof types or malformed values',()=>{for(const opts of [{type:'xieshan',hardGableEnd:true},{type:'gable',hardGableEnd:'yes'}])assert.throws(()=>buildRoof(library(),{width:24,depth:10,baseY:6,...opts}),/hard.gable/i);});

import {CollisionManager} from '../src/utils/Collision.js';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
import {rearHallProfile} from '../src/scene/palace/special/RearHallProfiles.js';
for(const [zone,x,z,id] of targets){
 test(`R39 ${id} actual five-bay columns and door stay within the retained shell`,()=>{
  const {b,item,f}=fixture(zone,x,z),cols=f.children.filter(m=>m.isMesh&&m.geometry.type==='CylinderGeometry'&&m.material?.name==='wood_column');
  assert.equal(cols.length,12);const xs=[...new Set(cols.map(m=>m.position.x))].sort((a,b)=>a-b);
  assert.equal(xs.length,6);for(let k=0;k<6;k++)assert.ok(Math.abs(xs[k]-(-item.w/2+k*item.w/5))<1e-8);
  const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);
  for(const r of b.kit.rooms)for(const p of [...r.doors,...r.spawns])assert.equal(cm.checkCollision(new THREE.Vector3(p.x,item.ph+1.7,p.z),.45),false,'registered door/spawn must remain clear');
  for(const c of cols)assert.equal(cm.checkCollision(new THREE.Vector3(x+c.position.x,item.ph+1.7,z+c.position.z),.2),true,'shifted visible column has collision');
 });
 for(const fps of [10,60])test(`R39 ${id} repeated real-controller ground-entry and exit at ${fps}Hz`,t=>{
  const {b,item}=fixture(zone,x,z),cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);
  const start=[x,z-item.d/2-item.pad-2],inside=[x,z-2],points=[start,inside,start,inside,start];
  const trace=traceTerraceGround(cm,{flights:[]});try{const result=replayTerrace(t,{cm,THREE},points,{fps,sprint:false,recordFrames:true});assert.equal(result.arrived,true,JSON.stringify(result));assert.equal(result.startFeet,0);assert.ok(result.maxFeet>=item.ph-.01);assert.equal(trace.samples.some(p=>p.source==='rescue'),false,'no teleport/rescue substitutes for stair entry');}finally{trace.restore();}
 });
}
test('R39 source-specific rear hall profiles cannot be transplanted, renamed or malformed before mutation',()=>{
 const data=config('east-six'),item=data.items.find(i=>i.rearHallProfile==='jingren-rear');
 for(const change of [{x:item.x+1},{name:'Invented'},{roof:'xieshan'},{bays:7},{rearHallProfile:'other'},{rot:0},{structure:'other'}]){const b=new ZoneBase(library(),data);assert.throws(()=>b.buildHall({...item,...change}),/Rear hall/);assert.equal(b.kit.root.children.length,0);}
 assert.throws(()=>rearHallProfile('west-six',item),/Rear hall/);
});
test('R39 rear-hall provenance survives the actual material merge',()=>{
 const {b}=fixture('east-six',-93,347.4),merged=b.kit.finish();
 const record=merged.userData.architecture?.find(p=>p.id==='east-six/jingren-rear');
 assert.ok(record,'source/fit boundary must not be discarded with source mesh group');assert.match(record.source,/236509/);assert.equal(record.interiorStatus,'EXISTING_GENERIC_INTERIOR_UNVERIFIED');
});
