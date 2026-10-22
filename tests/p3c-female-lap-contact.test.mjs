import test from 'node:test';import assert from 'node:assert/strict';import {measureFemaleLapContact} from './helpers/p3c-female-contact.mjs';
for(const templateId of ['consort-daily','maid-daily'])for(const seatVariant of ['standard','kang-low','raised-footstool','throne-front-perch'])test(`${templateId}/${seatVariant}: actual lower palm rests near lap and both hand meshes stay outside cloth`,()=>{
 const measured=measureFemaleLapContact(templateId,seatVariant),lower=measured.hands.find(h=>h.handPart===3);
 assert.ok(lower.palm.min>=0&&lower.palm.min<.006,`lower palm clearance ${lower.palm.min} m`);
 assert.ok(measured.upperAllSkinToLowerHand.sampleCount>500);assert.ok(measured.upperAllSkinToLowerHand.min>=0&&measured.upperAllSkinToLowerHand.min<.003,`upper hand gap ${measured.upperAllSkinToLowerHand.min} m`);
 for(const hand of measured.hands){assert.ok(hand.allSkinTriangleSamples.count>2000);assert.ok(hand.allSkinTriangleSamples.min>=0,`signed penetration ${hand.allSkinTriangleSamples.min} m`);}
});

import {createCharacterGeometry as frozen04} from '../reports/r50-followup/female-reference/candidate06-04/CharacterKit-source.js';
test('preserved 04 geometry demonstrates the prior suspended-hand defect without rewriting it',()=>{
 const before=measureFemaleLapContact('consort-daily','kang-low',frozen04),after=measureFemaleLapContact('consort-daily','kang-low');
 assert.ok(before.hands.find(h=>h.handPart===3).palm.min>.10);assert.ok(after.hands.find(h=>h.handPart===3).palm.min<.006);
});
