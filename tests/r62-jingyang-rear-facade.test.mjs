import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library,hash} from './lib/inner-palace-fixture.mjs';
import {buildR61JingyangRearBaseline,R61_JINGYANG_BASELINE} from './lib/r62-jingyang-rear-baseline.mjs';
import {hallSignature} from './lib/r40-hall-signature.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
const url=new URL('../src/scene/palace/special/JingyangRearFacade.js',import.meta.url),api=existsSync(url)?await import(url):{};
const zone=JSON.parse(readFileSync(new URL('../data/zones/east-six.json',import.meta.url))),item=zone.items[38];
function fixture(after=true){const b=new ZoneBase(library(),zone);assert.equal(typeof api.buildJingyangRearFacade,'function','bounded Jingyang rear builder missing');const result=after?api.buildJingyangRearFacade(b.kit,item,zone.id):buildR61JingyangRearBaseline(b,item);b.kit.root.updateMatrixWorld(true);if(!after)assert.deepEqual(hallSignature(b.kit),R61_JINGYANG_BASELINE.actualHallSignature);return{b,...result};}
const tagged=f=>{const rows=[];f.traverse(m=>{if(m.userData.jingyangRearWindow)rows.push(m);});return rows;};
const columns=f=>f.children.filter(m=>m.geometry?.type==='CylinderGeometry'&&m.material?.name==='wood_column').map(m=>m.position.toArray());
const geometryHash=f=>{const rows=[];f.traverse(m=>{if(m.isMesh)rows.push([m.matrix.toArray(),m.material?.name,[...m.geometry.attributes.position.array],m.geometry.index?[...m.geometry.index.array]:null]);});return hash(rows);};
test('five bays replace seven without moving the source building envelope or inventing a room',()=>{
 const before=fixture(false),after=fixture();assert.equal(columns(before.f).length,16);assert.equal(columns(after.f).length,12);
 assert.deepEqual([...new Set(columns(after.f).map(p=>+p[0].toFixed(4)))],[-12,-7.2,-2.4,2.4,7.2,12]);
 assert.deepEqual(after.f.position.toArray(),before.f.position.toArray());
 assert.deepEqual(after.b.kit.walkables,before.b.kit.walkables);
 assert.deepEqual(after.b.kit.rooms,before.b.kit.rooms);
 assert.deepEqual(after.b.kit.mapItems,before.b.kit.mapItems);
 const furniture=f=>f.children.filter(m=>m.isMesh&&['kit_furn_wood','kit_gold','kit_lacquer'].includes(m.material?.name));
 assert.equal(furniture(before.f).length,8);assert.equal(hash(furniture(after.f).map(geometryHash)),hash(furniture(before.f).map(geometryHash)),'retained generic furniture is unchanged, not authenticated');
 const leaves=f=>f.children.filter(m=>m.material?.name==='lattice_doors'&&Math.abs(m.rotation.y)>1);
 assert.deepEqual(leaves(after.f).map(m=>m.position.toArray().map(n=>+n.toFixed(6))),[[-1.984,2.59016,-3.976],[1.984,2.59016,-3.976]]);
 assert.equal(after.b.kit.colliders.length,27);assert.equal(before.b.kit.colliders.length,33);
 const roofs=f=>f.children.filter(m=>m.name.startsWith('roof_'));
 assert.equal(hash(roofs(after.f).map(geometryHash)),hash(roofs(before.f).map(geometryHash)));
 assert.equal(after.f.userData.structure.bays,5);assert.equal(after.f.userData.structure.objectId,'FC-8B02DC003C');
 assert.match(after.f.userData.structure.status,/PARTIAL/);assert.match(after.f.userData.structure.interiorStatus,/UNVERIFIED/);
 before.b.kit.dispose(before.f);after.b.kit.dispose(after.f);
});
test('four closed high-sill south windows contain actual positive-area geometry, not generic lattice artwork',()=>{
 const {b,f}=fixture(),nodes=tagged(f),windows=nodes.filter(n=>n.userData.jingyangRearWindow.role==='window');assert.equal(windows.length,4);
 assert.deepEqual(windows.map(n=>n.userData.jingyangRearWindow.bayIndex),[0,1,3,4]);
 for(const g of windows){const meta=g.userData.jingyangRearWindow;assert.equal(meta.surveyed,false);assert.match(meta.patternStatus,/PARTIAL.*FIT/);assert.ok(meta.sillHeight>.8);let triangles=0;
  g.traverse(m=>{if(!m.isMesh)return;assert.notEqual(m.material.name,'lattice_doors');const p=m.geometry.attributes.position,ix=m.geometry.index;for(const a of Object.values(m.geometry.attributes))assert.ok([...a.array].every(Number.isFinite));
   for(let i=0;i<(ix?.count??p.count);i+=3){const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(i+j):i+j));assert.ok(v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).lengthSq()>1e-14,'nondegenerate triangle');triangles++;}
   m.geometry.computeBoundingBox();const box=m.geometry.boundingBox.clone().applyMatrix4(m.matrix);assert.ok(box.min.x>=meta.bounds.min[0]-1e-6&&box.max.x<=meta.bounds.max[0]+1e-6,'within jambs');assert.ok(box.min.y>=meta.bounds.min[1]-1e-6&&box.max.y<=meta.bounds.max[1]+1e-6);assert.ok(box.min.z>=meta.bounds.min[2]-1e-6&&box.max.z<=meta.bounds.max[2]+1e-6,'within actual closed-window proxy');
  });assert.ok(triangles>100);assert.ok(triangles<5000);
 }
 assert.equal(nodes.filter(n=>n.isMesh&&n.userData.jingyangRearWindow.role==='partial-straight-step-grille').length,4);
 const rear=f.children.find(m=>m.material?.name==='wall_red'&&m.position.z===4.8);assert.ok(rear,'unknown rear stays plain');b.kit.dispose(f);
});
test('wrong identity, wrong dimensions and unknown options fail before allocation',()=>{
 for(const change of[{x:0},{z:453.6},{w:25},{d:10},{ph:.5},{pad:.8},{colH:6},{roof:'gable'},{bays:7},{name:'御书房'},{rot:Math.PI},{backDoor:true},{open:true},{enter:false},{roomBays:3},{structure:'other'}]){
  const b=new ZoneBase(library(),zone),owned=b.kit.owned.length;assert.throws(()=>api.buildJingyangRearFacade(b.kit,{...item,...change},zone.id),/Jingyang rear/);assert.equal(b.kit.root.children.length,0);assert.equal(b.kit.owned.length,owned);
 }
 const b=new ZoneBase(library(),zone);assert.throws(()=>api.buildJingyangRearFacade(b.kit,item,'west-six'),/Jingyang rear/);
 api.buildJingyangRearFacade(b.kit,item,zone.id);const count=b.kit.root.children.length;assert.throws(()=>api.buildJingyangRearFacade(b.kit,item,zone.id),/Jingyang rear/);assert.equal(b.kit.root.children.length,count);b.kit.dispose(b.kit.root);
});
const route=[[0,-8],[0,-6.2],[0,-2.5],[6,-2.5],[-6,-2.5],[0,-2.5],[0,-8],[0,-2.5],[0,-8]];
for(const fps of[10,60])test(`real local FirstPerson traversal enters, moves across front interior and exits twice at ${fps}Hz`,t=>{
 const {b,f}=fixture(),cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);const trace=traceTerraceGround(cm,{flights:[]});
 try{const result=replayTerrace(t,{cm,THREE},route.map(([x,z])=>[item.x+x,item.z+z]),{fps,recordFrames:true});assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));assert.equal(result.startFeet,0);assert.ok(result.maxFeet>=item.ph-.01);assert.ok(!trace.samples.some(s=>s.source==='rescue'||s.source==='unverified'));
 for(const x of[-9.6,-4.8,4.8,9.6])assert.equal(cm.checkCollision(new THREE.Vector3(item.x+x,item.ph+1.7,item.z-4.8),.45),true,'window stays closed');
 assert.equal(cm.checkCollision(new THREE.Vector3(item.x,item.ph+1.7,item.z-4.8),.45),false,'central entrance stays clear');
 }finally{trace.restore();b.kit.dispose(f);}
});

test('actual production merge retains the source record, grille triangles and material lifecycle',async()=>{
 const {assertJingyangRearFacadeInWorld}=await import('./lib/r62-jingyang-rear-world-check.mjs');
 const {b}=fixture(),counts=b.kit.owned.map(m=>{const c={name:m.name,count:0};m.addEventListener('dispose',()=>c.count++);return c;}),cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);
 const scene=b.kit.finish(),summary=assertJingyangRearFacadeInWorld({scene,cm});assert.equal(summary.windowTriangleContacts.length,8);b.kit.dispose(scene);for(const c of counts)assert.equal(c.count,1,c.name);
});

test('frozen before fixture bypasses an already-integrated buildHall hook without changing the sixteen-column expectation',()=>{
 const original=ZoneBase.prototype.buildHall;ZoneBase.prototype.buildHall=function(i){return api.buildJingyangRearFacade(this.kit,i,this.zoneJson.id);};
 try{const old=fixture(false);assert.equal(columns(old.f).length,16);old.b.kit.dispose(old.f);}finally{ZoneBase.prototype.buildHall=original;}
});
