import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
const url = new URL('../src/scene/palace/special/TaihemenProfile.js', import.meta.url);
const api = existsSync(url) ? await import(url) : {};

test('Taihemen profile separates seven open eave bays from the retained inner passage pattern', () => {
  assert.equal(typeof api.taihemenSouthProfile, 'function', 'missing Taihemen-specific enclosure profile');
  const p = api.taihemenSouthProfile({width:48.06, depth:20.54});
  assert.equal(p.entityId, 'FC-B3B12CF397');
  assert.equal(p.frontageBays, 9);
  assert.deepEqual(p.southOpenBayIndices, [1,2,3,4,5,6,7]);
  assert.deepEqual(p.southClosedBayIndices, [0,8]);
  assert.deepEqual(p.retainedInnerOpenBayIndices, [3,4,5]);
  assert.equal(p.southEaveZ, -10.27);
  assert.ok(Math.abs(p.innerEnclosureZ - (-20.54/2 + 20.54/3)) < 1e-12);
  assert.equal(p.depthStatus, 'BLOCKED_SOURCE');
  assert.equal(p.documentedDepthBays, 4);
  assert.equal(p.retainedModelDepthBays, 3);
  assert.equal(p.columnOccupancyStatus, 'RETAINED_40_NOT_VERIFIED');
  assert.equal(p.innerEnclosureStatus, 'PHOTO_TOPOLOGY_FIT_TO_RETAINED_INNER_ROW');
  assert.equal(p.northStatus, 'RETAINED_UNVERIFIED');
  assert.equal(p.accepted, false);
  assert.equal(p.sources.every(s => s.photographyDate === null), true);
});

test('Taihemen-only profile rejects wrong or non-finite envelopes and does not create a fifth column axis', () => {
  assert.equal(typeof api.taihemenSouthProfile, 'function');
  for (const patch of [{width:NaN},{depth:Infinity},{width:30},{depth:0}])
    assert.throws(() => api.taihemenSouthProfile({width:48.06,depth:20.54,...patch}), /Taihemen/);
  const p = api.taihemenSouthProfile({width:48.06,depth:20.54});
  assert.equal('z' in p, false, 'documented four bays must not masquerade as a verified axis grid');
  p.southOpenBayIndices.push(99);
  assert.deepEqual(api.taihemenSouthProfile({width:48.06,depth:20.54}).southOpenBayIndices,[1,2,3,4,5,6,7]);
});
