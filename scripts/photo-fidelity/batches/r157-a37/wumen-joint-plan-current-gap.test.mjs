import test from 'node:test';import assert from 'node:assert/strict';
import {captureGate} from '../../../../tests/lib/gate-tower-fixture.mjs';
// Deliberate source acceptance red probe for the next whole-layout candidate.
// It is not a golden update and is not evidence that the current object passed.
test('Current Wumen four-pavilion depth and north-south spacing satisfy the jointly registered own upper plan',()=>{
 const c=captureGate();try{const roots=c.group.children.filter(o=>o.userData.structure?.id?.includes('-PAVILION'));
  assert.equal(roots.length,4);for(const root of roots){const shafts=root.children.filter(o=>o.geometry?.type==='CylinderGeometry');assert.ok(shafts.length>=4);const zs=shafts.map(o=>o.position.z),depth=Math.max(...zs)-Math.min(...zs);assert.ok(depth/25>.74&&depth/25<.80,root.userData.structure.id+' depth ratio '+depth/25+'; source≈.763');}
  for(const side of['EAST','WEST']){const n=roots.find(o=>o.userData.structure.id.includes(side+'-NORTH')),s=roots.find(o=>o.userData.structure.id.includes(side+'-SOUTH'));const ratio=Math.abs(n.position.z-s.position.z)/25;assert.ok(ratio>3.30&&ratio<3.46,side+' spacing ratio '+ratio+'; source≈3.38');}
 }finally{c.builder.dispose();}
});
