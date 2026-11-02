import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import '../lib/inner-palace-fixture.mjs';import {realTextureLibrary}from'../lib/r48-real-texture-library.mjs';
import {ZoneBase}from'../../src/scene/zones/ZoneBase.js';import{CollisionManager}from'../../src/utils/Collision.js';import{replayKunning}from'../lib/kunning-walk.mjs';
test('normal outer-east assembly keeps three gate portals on actual supports at 10/60 Hz walk/run and closed end window',t=>{
 const lib=realTextureLibrary(),zone=new ZoneBase(lib,JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-east.json',import.meta.url)))),data=zone.build(),cm=new CollisionManager();cm.rivers=[];cm.addColliders(data.colliders);cm.addWalkables(data.walkables);data.group.updateMatrixWorld(true);
 const rows=[];
 for(const fps of[10,60])for(const sprint of[false,true])for(const offset of[-6.62,0,6.62]){const x=-186.3+(offset===0?2.1:offset),forward=[[x,-265],[x,-225]],points=[...forward,...forward.slice(0,-1).reverse()],result=replayKunning(t,{THREE,cm},points,{startFeet:0,fps,sprint,recordFrames:true});rows.push({fps,sprint,offset,points,...result});}
 const peak=Math.max(...rows.flatMap(r=>r.frames.map(f=>Math.abs(f.feet-f.ground))));const out={peak,kind:'ACTUAL_ZONEBASE_AND_NATIVE_CONTROLS_NOT_WHOLE_WORLD',rows};if(process.env.EVIDENCE_OUT)fs.writeFileSync(process.env.EVIDENCE_OUT,JSON.stringify(out));assert.equal(rows.filter(r=>r.arrived).length,12);
 assert.equal(cm.checkCollision(new THREE.Vector3(-186.3-13.24,4,-245.2),.5),true);zone.dispose();lib.dispose();assert.ok(peak<=.3,`visible gate descent gap ${peak}`);
});
