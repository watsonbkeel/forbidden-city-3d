import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {fixture} from './lib/r158-arrow-south-lattice-fixture.mjs';
import {applyArrowSouthDoorLattice} from '../src/scene/palace/special/ArrowSouthDoorLattice.js';
import {meshes,sha} from './lib/r59-arrow-knees-qa.mjs';
const url=new URL('../src/scene/palace/special/ArrowSouthNameboard.js',import.meta.url),api=fs.existsSync(url)?await import(url):{};
function apply(f,item=f.item){assert.equal(typeof api.removeArrowUnsupportedCentralNameboard,'function','bounded Arrow nameboard removal exists');return api.removeArrowUnsupportedCentralNameboard(f.kit,f.frame,item);}
const meshRows=list=>sha(JSON.stringify(list.map(m=>({name:m.name,position:m.position.toArray(),rotation:m.rotation.toArray(),scale:m.scale.toArray(),visible:m.visible,cast:m.castShadow,receive:m.receiveShadow,material:m.material?{name:m.material.name,color:m.material.color?.getHex(),map:m.material.map?.name}:null,attrs:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[a.itemSize,...a.array]])),index:m.geometry.index?[...m.geometry.index.array]:null,data:m.userData}))));
const physical=k=>sha(JSON.stringify(Object.fromEntries(['colliders','walkables','rooms','regions','mapItems'].map(k1=>[k1,k[k1]]))));
function state(f){return{meshes:meshRows(meshes(f.frame)),physics:physical(f.kit),children:[...f.frame.children],plaques:[...f.kit.plaques],owned:[...f.kit.owned],userData:structuredClone(f.frame.userData)};}
function unchanged(f,b){assert.equal(meshRows(meshes(f.frame)),b.meshes);assert.equal(physical(f.kit),b.physics);assert.deepEqual(f.frame.children,b.children);assert.deepEqual(f.kit.plaques,b.plaques);assert.deepEqual(f.kit.owned,b.owned);assert.deepEqual(f.frame.userData,b.userData);}

test('only the unsupported central label and its gold frame/atlas registration are removed; all other geometry, names and physics remain exact',()=>{
 const f=fixture();try{applyArrowSouthDoorLattice(f.kit,f.frame,f.item);const record=f.kit.plaques.find(p=>p.text==='箭亭'),targets=new Set([record.mesh,record.frame]),before=meshRows(meshes(f.frame).filter(m=>!targets.has(m))),p=physical(f.kit),count=meshes(f.frame).length;
 const r=apply(f);assert.equal(r.removedMeshes,2);assert.equal(r.removedTriangles,14);assert.equal(r.removedAtlasRecords,1);assert.equal(r.visualAcceptance,'VERIFY_PENDING');assert.equal(r.wholeObjectAccepted,false);assert.equal(r.captureDate,null);assert.equal(meshRows(meshes(f.frame)),before);assert.equal(physical(f.kit),p);assert.equal(meshes(f.frame).length,count-2);assert.equal(f.kit.plaques.length,0);assert.equal(record.mesh.parent,null);assert.equal(record.frame.parent,null);assert.ok(f.kit.mapItems.some(p=>p.name==='箭亭'));assert.equal(meshes(f.frame).filter(m=>m.userData.role==='arrow-south-central-knee').length,2);
 }finally{f.dispose();}
});

test('same-name plaque on another frame and every unrelated record/material survive unchanged in original order',()=>{
 const f=fixture();try{const other=f.kit.frame(100,200);f.kit.plaque(other,'箭亭',0,3,0,1,1);f.kit.plaque(other,'不相关',1,3,0,1,1);const otherRows=meshRows(meshes(other)),rest=f.kit.plaques.slice(1);apply(f);assert.deepEqual(f.kit.plaques,rest);assert.equal(meshRows(meshes(other)),otherRows);}finally{f.dispose();}
});

test('invalid identity, moved/scaled frame, altered or missing target and already-built atlas reject without mutations or disposal',()=>{
 assert.equal(typeof api.removeArrowUnsupportedCentralNameboard,'function');for(const change of[{name:'临溪亭'},{w:30},{x:0},{z:0},{ph:1},{rot:Math.PI},{enclosureProfile:'other'}]){const f=fixture();try{const b=state(f);assert.throws(()=>apply(f,{...f.item,...change}),/Arrow central nameboard/);unchanged(f,b);}finally{f.dispose();}}
 for(const mode of['moved-frame','scaled-frame','missing-face','moved-border','wrong-text','atlas-built']){const f=fixture();try{const p=f.kit.plaques[0];if(mode==='moved-frame')f.frame.position.x++;if(mode==='scaled-frame')f.frame.scale.x=1.1;if(mode==='missing-face')p.mesh.removeFromParent();if(mode==='moved-border')p.frame.position.y+=.1;if(mode==='wrong-text')p.text='武备馆';if(mode==='atlas-built')f.kit.buildPlaqueAtlas();const b=state(f);let disposed=0;p.mesh.geometry.addEventListener('dispose',()=>disposed++);p.frame.geometry.addEventListener('dispose',()=>disposed++);assert.throws(()=>apply(f),/Arrow central nameboard/);unchanged(f,b);assert.equal(disposed,0);}finally{f.dispose();}}
 const f=fixture();try{apply(f);const b=state(f);assert.throws(()=>apply(f),/already/);unchanged(f,b);}finally{f.dispose();}
});

test('a failure after a real partial detach restores parents, child/atlas order and marker before rethrowing, without disposing either geometry',()=>{
 const f=fixture();try{const b=state(f),record=f.kit.plaques[0],remove=f.frame.remove;let disposed=0,first=true;record.mesh.geometry.addEventListener('dispose',()=>disposed++);record.frame.geometry.addEventListener('dispose',()=>disposed++);
 f.frame.remove=function(...objects){const r=remove.call(this,...objects);if(first){first=false;throw Error('injected after actual detach');}return r;};assert.throws(()=>apply(f),/injected after actual detach/);f.frame.remove=remove;unchanged(f,b);assert.equal(disposed,0);assert.equal(record.mesh.parent,f.frame);assert.equal(record.frame.parent,f.frame);apply(f);assert.equal(disposed,2);
 }finally{f.dispose();}
});

test('success disposes exactly the two private removed geometries, never the kit gold material or later atlas resources',()=>{
 const f=fixture(),p=f.kit.plaques[0];let face=0,border=0,gold=0;p.mesh.geometry.addEventListener('dispose',()=>face++);p.frame.geometry.addEventListener('dispose',()=>border++);f.kit.gold.addEventListener('dispose',()=>gold++);apply(f);assert.deepEqual([face,border,gold],[1,1,0]);const owned=f.kit.owned.length,merged=f.kit.finish();assert.equal(f.kit.owned.length,owned,'removed local Arrow label generates no orphan atlas material');assert.equal(f.kit.ownedTextures?.length??0,0);f.kit.dispose(merged);assert.deepEqual([face,border,gold],[1,1,1]);
});

test('mutation failure after atlas queue splice also restores original parents, exact order and undisposed resources',()=>{
 const f=fixture();try{const b=state(f),splice=f.kit.plaques.splice;let first=true,disposed=0;for(const p of f.kit.plaques){p.mesh.geometry.addEventListener('dispose',()=>disposed++);p.frame.geometry.addEventListener('dispose',()=>disposed++);}f.kit.plaques.splice=function(...args){const r=splice.apply(this,args);if(first){first=false;throw Error('injected after atlas splice');}return r;};assert.throws(()=>apply(f),/injected after atlas splice/);delete f.kit.plaques.splice;unchanged(f,b);assert.equal(disposed,0);}finally{f.dispose();}
});

test('pure current-world consumer rejects the actual old centre plaque and verifies its absence after removal without rebuilding W',async()=>{
 const url=new URL('./lib/r158-arrow-nameboard-world-check.mjs',import.meta.url),world=fs.existsSync(url)?await import(url):{};assert.equal(typeof world.assertArrowCentralNameboardRemovedInWorld,'function','pure nameboard consumer exists');
 const {CollisionManager}=await import('../src/utils/Collision.js');for(const removed of[false,true]){const f=fixture();let merged;try{applyArrowSouthDoorLattice(f.kit,f.frame,f.item);if(removed)apply(f);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);merged=f.kit.finish();const scene=new THREE.Scene();scene.add(merged);if(removed){const r=world.assertArrowCentralNameboardRemovedInWorld({scene,cm});assert.equal(r.rayChecks,9);assert.equal(r.browserAcceptance,false);assert.equal(r.wholeObjectAccepted,false);}else assert.throws(()=>world.assertArrowCentralNameboardRemovedInWorld({scene,cm}),/centre nameboard/);}finally{f.kit.dispose(merged??f.kit.root);}}
});

for(const mode of['face','border','both'])test(`nameboard retired ${mode} disposal errors release both resources and explicitly preserve the committed removal without touching other plaques`,()=>{
 const f=fixture(),record=f.kit.plaques[0],counts={face:0,border:0,gold:0};record.mesh.geometry.addEventListener('dispose',()=>counts.face++);record.frame.geometry.addEventListener('dispose',()=>counts.border++);f.kit.gold.addEventListener('dispose',()=>counts.gold++);
 if(mode==='face'||mode==='both')record.mesh.geometry.addEventListener('dispose',()=>{throw Error('injected retired face');});if(mode==='border'||mode==='both')record.frame.geometry.addEventListener('dispose',()=>{throw Error('injected retired border');});
 const other=f.kit.frame(100,200);f.kit.plaque(other,'另一牌',0,3,0,1,1);const otherRecord=f.kit.plaques[1],otherRows=meshRows(meshes(other)),p=physical(f.kit),owned=[...f.kit.owned];let merged;
 try{
  let error;try{apply(f);}catch(e){error=e;}assert.ok(error instanceof AggregateError);assert.equal(error.code,'ARROW_NAMEBOARD_COMMITTED_CLEANUP_ERROR');assert.equal(error.committed,true);assert.equal(error.cleanupPhase,'RETIRED_GEOMETRY_AFTER_COMMIT');assert.match(error.message,/committed/);assert.equal(error.errors.length,mode==='both'?2:1);assert.equal(error.result.removedMeshes,2);assert.equal(error.result.removedAtlasRecords,1);assert.equal(error.result.visualAcceptance,'VERIFY_PENDING');assert.equal(error.result.wholeObjectAccepted,false);
  assert.deepEqual(counts,{face:1,border:1,gold:0});assert.equal(record.mesh.parent,null);assert.equal(record.frame.parent,null);assert.equal(f.frame.userData.arrowCentralNameboardRemoval.removedMeshes,2);assert.deepEqual(f.kit.plaques,[otherRecord]);assert.equal(meshRows(meshes(other)),otherRows);assert.equal(physical(f.kit),p);assert.deepEqual(f.kit.owned,owned);
  const committed=state(f);assert.throws(()=>apply(f),/already/);unchanged(f,committed);assert.deepEqual(counts,{face:1,border:1,gold:0});assert.deepEqual(f.kit.plaques,[otherRecord]);merged=f.kit.finish();assert.equal(otherRecord.mesh.material.name,'kit_plaques');assert.equal(f.kit.ownedTextures.length,1,'surviving other plaque still receives its actual atlas');f.kit.dispose(merged);merged=null;assert.deepEqual(counts,{face:1,border:1,gold:1},'later kit teardown never re-disposes retired face/border and disposes the shared gold owner once');
 }finally{if(merged)f.kit.dispose(merged);else if(counts.gold===0)f.dispose();}
});
