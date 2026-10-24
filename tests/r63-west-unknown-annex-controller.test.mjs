import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {CollisionManager} from '../src/utils/Collision.js';
import {fixture,indices,hash} from './lib/r63-west-unknown-annex-fixture.mjs';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
import {applyWestUnknownAnnexInventory} from '../src/scene/palace/special/WestUnknownAnnexInventory.js';
import {westUnknownAnnexEntryPoints} from './lib/r63-west-unknown-annex-world-check.mjs';
const results=[];
for(const i of indices)for(const fps of [10,60])for(const sprint of[false,true])for(const backward of[false,true])test(`R63 west annex ${i}: actual old/new entrance ${fps}Hz ${sprint?'sprint':'walk'} ${backward?'S':'W'}`,t=>{
 const a=fixture(i),points=westUnknownAnnexEntryPoints(a.kit.rooms[0]),runs=[];
 for(const changed of[false,true]){if(changed)applyWestUnknownAnnexInventory(a.kit,a.ctx,a.built);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(a.kit.colliders);cm.addWalkables(a.kit.walkables);const trace=traceTerraceGround(cm,{flights:[]});try{const r=replayTerrace(t,{cm,THREE},points,{fps,sprint,backward,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify(r));assert.equal(r.startFeet,0);assert.ok(Math.abs(r.maxFeet-a.original.ph)<.001,JSON.stringify({maxFeet:r.maxFeet,ph:a.original.ph}));assert.equal(trace.samples.some(s=>s.source==='rescue'||s.source==='unverified'),false);runs.push(r)}finally{trace.restore()}}
 assert.deepEqual(runs[1],runs[0],'same real input route, collision response and ground heights');results.push({index:i,fps,sprint,backward,points,frames:runs[1].frames.length,traceHash:hash(runs[1].frames),maxFeet:runs[1].maxFeet});a.dispose();
});
test.after(()=>{fs.mkdirSync('reports/r63-west-unknown-annex',{recursive:true});fs.writeFileSync('reports/r63-west-unknown-annex/controller.json',JSON.stringify({scope:'All 13 original actual entrance routes old/new at 10/60Hz W/S walk/sprint; zero-height starts, no rescue. Local constructors only, not full-world characters/browser acceptance.',results},null,2)+'\n')});
