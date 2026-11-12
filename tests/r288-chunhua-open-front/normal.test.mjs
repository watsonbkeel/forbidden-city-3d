import './fixture/cpu-canvas-shape.mjs';import {library} from './fixture/cpu-real-library.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {buildYuhuaGe} from '../../src/scene/palace/special/YuhuaGe.js';
import {buildYuhuaEastLou} from '../../src/scene/palace/special/YuhuaEastLou.js';
import {buildYuhuaWestLou} from '../../src/scene/palace/special/YuhuaWestLou.js';
import {buildFanzongLou} from '../../src/scene/palace/special/FanzongLou.js';
import {buildZhaofuGate} from '../../src/scene/palace/special/ZhaofuGate.js';
import {buildChunhuaOpenFront as build} from '../../src/scene/palace/special/ChunhuaOpenFrontBuilder.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import * as T from 'three';
test('H37 actual neighbor host, original routes, transaction/once and merged disposal',()=>{
 const z=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url))),lib=library(),b=new ZoneBase(lib,z);try{
 for(const i of[22,23,26,27,28]){const x=z.items[i];if(x.kind==='hall')b.buildHall(x);else if(x.kind==='gate')b.gateWidths.set(x.name,b.buildGate(x));else b.buildCourtWalls(x);}
 for(const f of[buildYuhuaGe,buildFanzongLou,buildYuhuaEastLou,buildYuhuaWestLou,buildZhaofuGate])f(b.kit,z);
 const k=b.kit,old=[...k.colliders],walk=[...k.walkables],counts=[k.root.children.length,k.colliders.length,k.owned.length];
 assert.equal(build(b,{id:'garden'}),false);const drift=structuredClone(z);drift.items[23].z1++;assert.throws(()=>build(b,drift),/host/);
 b.group=new T.Group();assert.throws(()=>build(b,z),/finished/);b.group=null;
 k.colliders.push({});assert.throws(()=>build(b,z),/owner/);k.colliders.pop();
 const push=k.owned.push;k.owned.push=()=>{throw Error('injected owned');};try{assert.throws(()=>build(b,z),/injected/);}finally{k.owned.push=push;}
 assert.deepEqual([k.root.children.length,k.colliders.length,k.owned.length],counts);
 const add=k.root.add,failedResources=[];let reentered=false;k.root.add=function(g){const owned=new Set();g.traverse(o=>{if(o.geometry)owned.add(o.geometry);if(o.material)owned.add(o.material);});for(const o of owned){const row={n:0};failedResources.push(row);o.addEventListener('dispose',()=>row.n++);}g.addEventListener('added',()=>{assert.throws(()=>build(b,z),/once/);reentered=true;throw Error('injected added');});return add.call(this,g);};try{assert.throws(()=>build(b,z),/injected added/);}finally{k.root.add=add;}
 assert.ok(reentered);assert.equal(failedResources.length,11);assert.ok(failedResources.every(r=>r.n===1));assert.deepEqual([k.root.children.length,k.colliders.length,k.owned.length],counts);
 const a=build(b,z);assert.equal(a.meta.sourceObjectId,'FC-98F5C6BC6B');assert.equal(a.meta.productionIntegrated,true);assert.equal(a.dispose,undefined);assert.throws(()=>build(b,z),/once/);assert.deepEqual(k.walkables,walk);
 const before=new CollisionManager(),after=new CollisionManager();before.addColliders(old);before.addWalkables(walk);after.addColliders(k.colliders);after.addWalkables(walk);const routes=[];
 for(const [name,x]of[['center',216],['smaller-world-x',208],['larger-world-x',224]]){let blocked=0;for(let i=0;i<=260;i++){const p=new T.Vector3(x,1.7,292+i*.1),prev=before.checkCollision(p,.5);assert.equal(after.checkCollision(p,.5),prev,name+' '+i);assert.equal(after.getGroundHeight(x,p.z,0),before.getGroundHeight(x,p.z,0));blocked+=prev;}routes.push({name,x,samples:261,baselineBlocked:blocked,unchanged:true});}
 const geo=[];a.group.traverse(o=>{if(o.geometry){const r={n:0};geo.push(r);o.geometry.addEventListener('dispose',()=>r.n++);}});const mats=a.materials.map(m=>{const r={n:0};m.addEventListener('dispose',()=>r.n++);return r;});
 b.group=k.finish();assert.ok(geo.every(r=>r.n===1));const merged=[];b.group.traverse(o=>{if(o.geometry){const r={n:0};merged.push(r);o.geometry.addEventListener('dispose',()=>r.n++);}});b.dispose();b.dispose();assert.ok(merged.every(r=>r.n===1));assert.ok(mats.every(r=>r.n===1));assert.ok(geo.every(r=>r.n===1));assert.throws(()=>build(b,z),/finished/);
 const evidenceDir=process.env.EVIDENCE_DIR??fs.mkdtempSync(path.join(os.tmpdir(),'r288-h37-'));assert.ok(path.isAbsolute(evidenceDir));fs.mkdirSync(evidenceDir,{recursive:true});fs.writeFileSync(path.join(evidenceDir,'NORMAL-RESULT.json'),JSON.stringify({scope:'FIVE_ORIGINAL_RECORDS_FIVE_REAL_HOOKS_NOT_FULLZONE',routes,oldOwners:old.length,addedOwners:a.contacts.length,sourceGeometry:geo.length,ownMaterials:mats.length,mergedResources:merged.length,failedAddedResources:failedResources.length,exactOnce:true},null,2));
 }finally{b.dispose();lib.dispose();}
});
