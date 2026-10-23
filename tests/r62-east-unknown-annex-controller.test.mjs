import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {CollisionManager} from '../src/utils/Collision.js';
import {fixture,indices,hash} from './lib/r62-east-unknown-annex-fixture.mjs';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
import {applyEastUnknownAnnexInventory} from '../src/scene/palace/special/EastUnknownAnnexInventory.js';
const results=[];
for(const i of indices)for(const fps of [10,60])for(const sprint of[false,true])for(const backward of[false,true])test(`R62 annex ${i}: actual old/new entrance ${fps}Hz ${sprint?'sprint':'walk'} ${backward?'S':'W'}`,t=>{
 const a=fixture(i),room=a.kit.rooms[0],door=room.doors[0],center={x:(room.min.x+room.max.x)/2,z:(room.min.z+room.max.z)/2},dx=center.x-door.x,dz=center.z-door.z,len=Math.hypot(dx,dz),nx=dx/len,nz=dz/len;
 const points=[[door.x-nx*3,door.z-nz*3],[door.x+nx*2.2,door.z+nz*2.2],[door.x-nx*3,door.z-nz*3]],runs=[];
 for(const changed of[false,true]){if(changed)applyEastUnknownAnnexInventory(a.kit,a.ctx,a.built);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(a.kit.colliders);cm.addWalkables(a.kit.walkables);const trace=traceTerraceGround(cm,{flights:[]});try{const r=replayTerrace(t,{cm,THREE},points,{fps,sprint,backward,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify(r));assert.equal(r.startFeet,0);assert.ok(Math.abs(r.maxFeet-a.original.ph)<.001,JSON.stringify({maxFeet:r.maxFeet,ph:a.original.ph}));assert.equal(trace.samples.some(s=>s.source==='rescue'||s.source==='unverified'),false);runs.push(r)}finally{trace.restore()}}
 assert.deepEqual(runs[1],runs[0],'same real input route, collision response and ground heights');results.push({index:i,fps,sprint,backward,points,frames:runs[1].frames.length,traceHash:hash(runs[1].frames),maxFeet:runs[1].maxFeet});a.dispose();
});
test.after(()=>{fs.mkdirSync('reports/r62-east-unknown-annex',{recursive:true});fs.writeFileSync('reports/r62-east-unknown-annex/controller.json',JSON.stringify({scope:'All 24 original actual entrance routes old/new at 10/60Hz W/S walk/sprint; zero-height starts, no rescue. Local constructors only, not full-world characters/browser acceptance.',results},null,2)+'\n')});
