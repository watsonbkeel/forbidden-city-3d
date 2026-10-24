import test from 'node:test';import assert from 'node:assert/strict';
import {createCharacterGeometry} from '../src/scene/characters/CharacterKit.js';
import {characterBody} from '../src/scene/characters/CharacterBody.js';
import {characterEnvironmentMotion} from '../src/scene/characters/CharacterBehavior.js';
for(const templateId of ['consort-daily','maid-daily'])for(const lod of [0,1,2])test(`${templateId} sleeping LOD${lod} remains clothed, horizontal and on mattress`,()=>{
 const g=createCharacterGeometry(templateId,'sleeping',lod);g.computeBoundingBox();const b=g.boundingBox;
 assert.ok(b.min.y>=-.001);assert.ok(b.max.y<.9);assert.ok(b.max.z-b.min.z>1.6);assert.equal(g.userData.pose,'sleeping');
 const actor={id:'sleep',templateId,behavior:{basePose:'sleeping'}};const body=characterBody(actor,{position:[0,0,0]});assert.equal(body.pose,'sleeping');assert.ok(Math.max(...body.parts.map(p=>p.maxY))<.9);
 assert.equal(characterEnvironmentMotion(actor,12,0).amplitude,0);g.dispose();
});
