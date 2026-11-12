import os from 'node:os';import path from 'node:path';
const evidenceDir=process.env.EVIDENCE_DIR?path.resolve(process.env.EVIDENCE_DIR):fs.mkdtempSync(path.join(os.tmpdir(),'r282-chunxi-'));fs.mkdirSync(evidenceDir,{recursive:true});
import './cpu-canvas-shape.mjs';
import {library} from './cpu-real-library.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {buildChunxiSouthFront as build} from '../../src/scene/palace/special/ChunxiSouthFrontBuilder.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
test('normal K17 five real neighbors, three original routes, rollback and once ownership',()=>{
 const z=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url))),lib=library(),b=new ZoneBase(lib,z);
 try{for(const i of[48,50,51,52,53]){const x=z.items[i];if(x.kind==='hall')b.buildHall(x);else if(x.kind==='gate')b.buildGate(x);else b.buildCourtWalls(x);}
 const k=b.kit,before={children:k.root.children.length,owners:k.colliders.length,owned:k.owned.length},old=[...k.colliders],walk=[...k.walkables];
 assert.equal(build(k,{id:'garden'}),false);const drift=structuredClone(z);drift.items[52].x++;assert.throws(()=>build(k,drift),/host/);
 const push=k.owned.push;k.owned.push=()=>{throw Error('injected owned');};try{assert.throws(()=>build(k,z),/injected/);}finally{k.owned.push=push;}assert.equal(k.root.children.length,before.children);assert.equal(k.colliders.length,before.owners);assert.equal(k.owned.length,before.owned);
 const a=build(k,z);assert.ok(a?.meta?.productionIntegrated);assert.equal(a.meta.sourceObjectId,'FC-A3C1FC5AE6');assert.equal(a.dispose,undefined);assert.throws(()=>build(k,z),/once/);assert.deepEqual(k.walkables,walk);
 const cm=new CollisionManager(),after=new CollisionManager();cm.addColliders(old);after.addColliders(k.colliders);cm.addWalkables(walk);after.addWalkables(k.walkables);
 const paths=[['old-central-approach',277],['east-outside-bypass',260],['west-outside-bypass',292]],routes=[];
 for(const[name,x]of paths){let blocked=0;for(let i=0;i<=420;i++){const v=new T.Vector3(x,1.7,320+i/10),was=cm.checkCollision(v,.5);assert.equal(after.checkCollision(v,.5),was,name+' '+i);assert.equal(after.getGroundHeight(v.x,v.z,0),cm.getGroundHeight(v.x,v.z,0),name+' ground');blocked+=was;}routes.push({name,samples:421,baselineBlocked:blocked,unchanged:true});}
 const rows=[];a.group.traverse(o=>{if(o.geometry){const r={n:0};rows.push(r);o.geometry.addEventListener('dispose',()=>r.n++);}});for(const m of a.materials){const r={n:0};rows.push(r);m.addEventListener('dispose',()=>r.n++);}b.dispose();assert.ok(rows.every(r=>r.n===1));b.dispose();assert.ok(rows.every(r=>r.n===1));
 fs.writeFileSync(path.join(evidenceDir,'NORMAL-ROUTES.json'),JSON.stringify({scope:'FIVE_REAL_NEIGHBORS_NOT_FULL_OUTERWEST',routes,ownersAdded:a.contacts.length,retainedResources:rows.length,exactOnce:true},null,2));
 }finally{b.dispose();lib.dispose();}
});
