// Independent process/root. No kit or leaf import before RemainingOuterHalls.
import test from 'node:test';
import assert from 'node:assert/strict';
assert.equal(typeof document,'undefined');
const {REMAINING_OUTER_PROFILES:profiles}=await import('../../src/scene/palace/special/RemainingOuterHalls.js');
const kit=await import('../../src/scene/palace/kit.js');
const {FACE}=await import('../../src/scene/palace/FaceDirections.js');
test('cold RemainingOuterHalls resolves profiles and the same public FACE binding',()=>{
 assert.equal(profiles.length,27);assert.equal(Object.isFrozen(profiles),true);
 const nav=profiles.filter(p=>p.navigation);
 assert.deepEqual(nav.map(p=>p.key),['baoxiang','jiyun','ciyin','cining','dafotang','shouan']);
 assert.deepEqual(nav.map(p=>p.navigation.rotation),[-Math.PI/2,Math.PI/2,0,0,0,0]);
 assert.equal(typeof kit.CourtKit,'function');assert.equal(kit.FACE,FACE);
 assert.deepEqual(FACE,{south:0,north:Math.PI,east:Math.PI/2,west:-Math.PI/2});
});
