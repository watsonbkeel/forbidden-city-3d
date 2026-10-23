import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {compoundFixture} from '../lib/r63-west-rear-compound-fixture.mjs';
import {replayTerrace} from '../lib/terrace-walk.mjs';
import {replayWestRearSouthDoorInWorld} from '../lib/r63-west-rear-windows-world-check.mjs';
for(const candidate of[false,true]){
 const label=candidate?'R63 candidate':'R62 baseline';
 test(`${label}: old isolated Lijing start remains blocked by actual Chuxiu north wall`,t=>{const W=compoundFixture(candidate);try{const r=replayTerrace(t,W,[[94.5,439.7],[94.5,448.7]],{fps:60,recordFrames:true});assert.equal(r.arrived,false);assert.ok(r.end[1]>440&&r.end[1]<440.4);assert.equal(r.maxFeet,.6);const colliders=W.built.colliders.map(b=>b.box??b).filter(b=>b.min&&b.min.x<94.5&&b.max.x>94.5&&b.min.z>440&&b.min.z<442).map(b=>({min:b.min.toArray(),max:b.max.toArray()}));assert.ok(colliders.length);t.diagnostic(JSON.stringify({label,oldWitness:r.end,maxFeet:r.maxFeet,colliders}));}finally{W.dispose();}});
 for(const index of[24,47])for(const fps of[10,60])for(const backward of[false,true])for(const sprint of[false,true])test(`${label}: compound ${index} ${fps}Hz ${backward?'S':'W'} ${sprint?'sprint':'walk'}`,t=>{const W=compoundFixture(candidate);try{const r=replayWestRearSouthDoorInWorld(t,W,{index,fps,backward,sprint,compoundApproach:true});assert.equal(r.arrived,true);assert.equal(r.compoundApproach,true);assert.equal(r.startFeet,0);assert.ok(Math.abs(r.end[2])<1e-6);assert.ok(r.headClearance.samples>10);t.diagnostic(JSON.stringify({label,index,fps,backward,sprint,frames:r.frames.length,end:r.end,maxFeet:r.maxFeet,headClearance:r.headClearance}));}finally{W.dispose();}});
}
