import test from 'node:test';import assert from 'node:assert/strict';
import {createCharacterGeometry as build} from '../src/scene/characters/CharacterKit.js';
import {createCharacterGeometry as frozen06} from '../reports/r50-followup/female-reference/candidate06-06/CharacterKit-source.js';
import {measureDeformedFemaleLapContact as measure} from './helpers/p3c-female-contact.mjs';
for(const id of ['consort-daily','maid-daily'])for(const seatVariant of ['standard','kang-low','raised-footstool','throne-front-perch'])test(`${id}/${seatVariant}: default idle keeps deformed hand surfaces outside actual deformed lap`,()=>{
 for(const time of [0,1,2,3,4,6,8]){
  const r=measure(id,seatVariant,{pose:'seated',time,phase:0,amplitude:.7,walkSpeed:0});
  for(const hand of r.hands)assert.ok(hand.allSkinTriangleSamples.min>=0,`${time}s part${hand.handPart}: ${hand.allSkinTriangleSamples.min} m`);
  assert.ok(r.hands[1].palm.min<.006,`${time}s suspended palm`);
  assert.ok(r.upperAllSkinToLowerHand.min>=0&&r.upperAllSkinToLowerHand.min<.003,`${time}s stacked-hand gap ${r.upperAllSkinToLowerHand.min} m`);
 }
});
test('frozen06 shows seated animation penetration while retaining its unmodified evidence',()=>{
 const r=measure('consort-daily','kang-low',{pose:'seated',time:2,phase:0,amplitude:.7,walkSpeed:0},frozen06);
 assert.ok(r.hands[1].allSkinTriangleSamples.min<-.025);
});
test('the contact repair changes female seated weights only, not static surfaces or other poses',()=>{
 for(const id of ['consort-daily','maid-daily'])for(const pose of ['standing','seated','kneeling'])for(const lod of [0,1,2])for(const seatVariant of pose==='seated'?['standard','kang-low','raised-footstool','throne-front-perch']:['standard']){
  const g=build(id,pose,lod,{seatVariant}),old=frozen06(id,pose,lod,{seatVariant});
  for(const [name,a]of [...Object.entries(g.attributes),['index',g.index]])if(pose!=='seated'||!['characterWeight','characterTorsoWeight'].includes(name))assert.deepEqual(a.array,(name==='index'?old.index:old.attributes[name]).array,`${id}/${pose}/${lod}/${name}`);
  assert.deepEqual(g.userData,old.userData);g.dispose();old.dispose();
 }
});

import {deformCharacterVertex as deform} from '../src/scene/characters/CharacterAnimation.js';
test('contact weighting retains head, torso and upper-sleeve idle motion; walking is byte-exact to06',()=>{
 const g=build('consort-daily','seated',0,{seatVariant:'kang-low'}),a=g.attributes,max={head:0,torso:0,sleeve:0};
 for(let i=0;i<a.position.count;i++){
  const p=[a.position.getX(i),a.position.getY(i),a.position.getZ(i)],part=a.characterPart.getX(i),q=deform(p,[a.normal.getX(i),a.normal.getY(i),a.normal.getZ(i)],{part,pivot:[a.characterPivot.getX(i),a.characterPivot.getY(i),a.characterPivot.getZ(i)],weight:a.characterWeight.getX(i),torsoWeight:a.characterTorsoWeight.getX(i)},{pose:'seated',time:2,phase:0,amplitude:.7,walkSpeed:0});
  const k=part===1?'head':part===0?'torso':part===2||part===3?'sleeve':null;if(k)max[k]=Math.max(max[k],Math.hypot(...p.map((v,j)=>v-q.position[j])));
 }
 for(const [part,delta]of Object.entries(max))assert.ok(delta>.001,`${part} must remain animated (${delta} m)`);g.dispose();
 for(const id of ['consort-daily','maid-daily'])for(const lod of[0,1,2]){
  const now=build(id,'standing',lod,{femalePose:'walking'}),old=frozen06(id,'standing',lod,{femalePose:'walking'});
  for(const[name,v]of Object.entries(now.attributes))assert.deepEqual(v.array,old.attributes[name].array);assert.deepEqual(now.index.array,old.index.array);now.dispose();old.dispose();
 }
});

import {createFemaleIdleAudit} from './helpers/p3c-female-idle-sweep.mjs';
test('cached sweep queries agree with independent Three raycasts on actual deformed meshes',()=>{
 for(const id of ['consort-daily','maid-daily'])for(const seat of ['standard','kang-low','raised-footstool','throne-front-perch']){
  const cached=createFemaleIdleAudit(id,seat);
  assert.ok(cached.kernelMaxError<1e-7);
  for(const time of [0,2,254.1288324878368]){
   const state={pose:'seated',time,phase:0,amplitude:.7,walkSpeed:0},fast=cached.measure(state),independent=measure(id,seat,state);
   const expected={handMin:Math.min(...independent.hands.map(h=>h.allSkinTriangleSamples.min)),palmMin:independent.hands[1].palm.min,stackMin:independent.upperAllSkinToLowerHand.min};
   for(const[k,v]of Object.entries(expected))assert.ok(Math.abs(fast[k]-v)<1e-8,`${id}/${seat}/${time}/${k}: ${fast[k]} vs ${v}`);
  }
  cached.dispose();
 }
});
