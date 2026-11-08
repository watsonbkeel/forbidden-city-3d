import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {host} from './fixture.mjs';
import {buildDafotangHistoricLayout} from '../../src/scene/palace/special/DafotangHistoricLayout.js';

const fitId='dafotang-historic-spatial-fit-v1';
const supportRoles=new Set(['support-foot','support-waist','support-top']);
const oldSupport=m=>m.name.startsWith('dafotang-shakyamuni-historical-fit/')&&supportRoles.has(m.name.split('/').at(-1));
const geometry=g=>({attributes:Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,normalized:a.normalized,array:Array.from(a.array)}])),index:g.index?Array.from(g.index.array):null,groups:g.groups});
function meshes(f){f.updateWorldMatrix(true,true);const rows=[];f.traverse(m=>{if(m.isMesh){assert.equal(m.isInstancedMesh===true,false,'single host input has no unaccounted instances');rows.push(m)}});return rows;}
function triangles(m){const a=m.geometry.attributes.position,i=m.geometry.index,out=[];for(let n=0;n<(i?.count??a.count);n+=3)out.push([0,1,2].map(k=>new T.Vector3().fromBufferAttribute(a,i?i.getX(n+k):n+k).applyMatrix4(m.matrixWorld)));return out;}
const triangleKey=t=>t.map(v=>v.toArray().map(Math.fround).join(',')).sort().join('|');

test('actual host retains every old figure/host mesh and physical owner except three explicit fitted dais courses',()=>{
 const h=host({baselineOnly:true});let merged;
 try{
  const old=meshes(h.built.f),states=old.map(m=>({m,g:m.geometry,bytes:geometry(m.geometry),mat:m.material,world:m.matrixWorld.toArray(),visible:m.visible})),physics=[...h.kit.colliders],walk=[...h.kit.walkables],rooms=[...h.kit.rooms],maps=[...h.kit.mapItems],regions=[...h.kit.regions];
  const out=buildDafotangHistoricLayout(h.context);assert.equal(out.changedPedestals.length,3);assert.equal(out.contacts.length,85);
  for(const q of states){assert.equal(q.m.material,q.mat);assert.equal(q.m.visible,q.visible);assert.deepEqual(q.m.matrixWorld.toArray(),q.world);if(!oldSupport(q.m)){assert.equal(q.m.geometry,q.g);assert.deepEqual(geometry(q.m.geometry),q.bytes);}else{assert.notEqual(q.m.geometry,q.g);assert.deepEqual(Array.from(q.m.geometry.attributes.uv.array),q.bytes.attributes.uv.array);assert.deepEqual(Array.from(q.m.geometry.attributes.normal.array),q.bytes.attributes.normal.array);}}
  const changes=new Map(out.changedPedestals.map(q=>[q.oldCollider,q.newCollider]));for(let i=0;i<physics.length;i++)assert.equal(h.kit.colliders[i],changes.get(physics[i])??physics[i]);assert.deepEqual(h.kit.colliders.slice(physics.length),out.contacts);assert.deepEqual(h.kit.walkables,walk);assert.deepEqual(h.kit.rooms,rooms);assert.deepEqual(h.kit.mapItems,maps);assert.deepEqual(h.kit.regions,regions);
  h.kit.root.updateMatrixWorld(true);const added=meshes(out.frame),figure=old.filter(m=>!oldSupport(m)&&m.name.startsWith('dafotang-shakyamuni-historical-fit/')),figureBox=new T.Box3();for(const m of figure)figureBox.union(new T.Box3().setFromObject(m));assert.ok(Math.abs(figureBox.max.y-figureBox.min.y-2.25)<1e-6);
  for(const m of added){const c=out.contacts.find(c=>c.dafotangLayoutMesh===m.uuid);assert.ok(c);assert.equal(c.dafotangLayoutRole,m.userData.dafotangLayoutRole);const a=triangles(m),b=c.triangleSupport.template.triangles.map(q=>[q.triangle.a,q.triangle.b,q.triangle.c].map(v=>v.clone().add(c.triangleSupport.offset)));assert.deepEqual(a,b);const box=new T.Box3().setFromObject(m);assert.ok(c.equals(box));for(const retained of old){const other=new T.Box3().setFromObject(retained);if(box.intersectsBox(other)){const size=box.clone().intersect(other).getSize(new T.Vector3());assert.ok(Math.min(...size.toArray())<=1e-5,JSON.stringify({added:m.name,old:retained.name,size:size.toArray()}));}}}
  // All added triangle positions must survive the real production merge in
  // their corresponding material bucket and actual world transform.
  const expected=new Map();for(const m of added){const list=expected.get(m.material)??[];list.push(...triangles(m).map(triangleKey));expected.set(m.material,list)}
  merged=h.kit.finish();merged.updateMatrixWorld(true);assert.equal(out.meta.id,fitId); // This test manually augments an already registered baseline host.
  for(const[material,keys]of expected){const counts=new Map();merged.traverse(m=>{if(m.isMesh&&m.material===material)for(const key of triangles(m).map(triangleKey))counts.set(key,(counts.get(key)??0)+1)});for(const key of keys){assert.ok(counts.get(key)>0,'merged visible triangle missing');counts.set(key,counts.get(key)-1)}}
  assert.deepEqual(h.kit.colliders.slice(physics.length),out.contacts);
 }finally{h.dispose(merged)}
});

test('injected publication failure restores original host references, courses, metadata and releases only staged resources',()=>{
 const h=host({baselineOnly:true});try{const f=h.built.f,children=[...f.children],oldMeshes=meshes(f),oldGeometry=oldMeshes.map(m=>m.geometry),colliders=[...h.kit.colliders],owned=[...h.kit.owned],dimensions=h.built.g.historicalPrincipal.supportDimensions;let oldReleased=0;for(const m of oldMeshes)m.geometry.addEventListener('dispose',()=>oldReleased++);const add=f.add,geometryDispose=T.BufferGeometry.prototype.dispose,materialDispose=T.Material.prototype.dispose,releasedGeometry=new Map(),releasedMaterial=new Map();T.BufferGeometry.prototype.dispose=function(){releasedGeometry.set(this,(releasedGeometry.get(this)??0)+1);return geometryDispose.call(this)};T.Material.prototype.dispose=function(){releasedMaterial.set(this,(releasedMaterial.get(this)??0)+1);return materialDispose.call(this)};f.add=function(child){add.call(this,child);throw Error('INJECTED_PUBLISH_FAILURE')};try{assert.throws(()=>buildDafotangHistoricLayout(h.context),/INJECTED_PUBLISH_FAILURE/);}finally{f.add=add;T.BufferGeometry.prototype.dispose=geometryDispose;T.Material.prototype.dispose=materialDispose;}assert.equal(releasedGeometry.size,88);assert.equal(releasedMaterial.size,2);assert.ok([...releasedGeometry.values(),...releasedMaterial.values()].every(n=>n===1));assert.ok(oldGeometry.every(g=>!releasedGeometry.has(g)));assert.ok(oldMeshes.every(m=>!releasedMaterial.has(m.material)));assert.deepEqual(f.children,children);assert.deepEqual(oldMeshes.map(m=>m.geometry),oldGeometry);assert.deepEqual(h.kit.colliders,colliders);assert.deepEqual(h.kit.owned,owned);assert.equal(h.built.g.historicalPrincipal.supportDimensions,dimensions);assert.equal(h.built.g.historicLayout,undefined);assert.equal(oldReleased,0);}finally{h.dispose()}
});

test('host/source drift and duplicate installation are rejected without a partial new frame',()=>{
 for(const change of[c=>c.g.w+=.1,c=>c.g.inventory.status='KNOWN',c=>c.f.position.x+=1,c=>c.g.historicalPrincipal.supportDimensions=[3,.8,1.8]]){const h=host({baselineOnly:true});try{change(h.context);const before=[...h.kit.colliders],children=[...h.built.f.children];assert.throws(()=>buildDafotangHistoricLayout(h.context));assert.deepEqual(h.kit.colliders,before);assert.deepEqual(h.built.f.children,children)}finally{h.dispose()}}
 const h=host();try{const before=[...h.kit.colliders];assert.throws(()=>buildDafotangHistoricLayout(h.context));assert.deepEqual(h.kit.colliders,before)}finally{h.dispose()}
});

test('production construction publishes the spatial metadata to the final merged architecture',()=>{const h=host();let merged;try{merged=h.kit.finish();const record=merged.userData.architecture.find(r=>r.id===h.p.id);assert.equal(record.historicLayout.id,fitId);assert.equal(record.historicLayout.complete,false);assert.equal(record.inventory.status,'UNKNOWN');assert.equal(record.photoPresentation.status,'BLOCKED');}finally{h.dispose(merged)}});

test('read-only pedestal metadata or geometry owner is rejected before allocating or mutating anything',()=>{
 for(const mode of['dimensions','dimensionStatus','record','geometry']){const h=host({baselineOnly:true});try{if(mode==='dimensions')Object.defineProperty(h.built.g.historicalPrincipal,'supportDimensions',{writable:false});if(mode==='dimensionStatus')Object.defineProperty(h.built.g.historicalPrincipal,'dimensionStatus',{value:'LOCKED',writable:false});if(mode==='record')Object.preventExtensions(h.built.g);if(mode==='geometry'){const m=meshes(h.built.f).find(oldSupport);Object.defineProperty(m,'geometry',{writable:false})}const children=[...h.built.f.children],colliders=[...h.kit.colliders],owned=[...h.kit.owned];assert.throws(()=>buildDafotangHistoricLayout(h.context),/Writable Dafotang publication fields required/);assert.deepEqual(h.built.f.children,children);assert.deepEqual(h.kit.colliders,colliders);assert.deepEqual(h.kit.owned,owned);assert.equal(h.built.g.historicLayout,undefined);}finally{h.dispose()}}
});
