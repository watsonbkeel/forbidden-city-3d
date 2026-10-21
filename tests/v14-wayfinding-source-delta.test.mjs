import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { readHistoricalSource } from './lib/historical-sources.mjs';
import {restoreR32SourceIfPresent} from './lib/r32-source-retention.mjs';
import { V14_WAYFINDING_COLLISION_DELTAS, restoreV13WayfindingCollisionBytes } from './lib/v14-wayfinding-source-delta.mjs';

// The six V14 hunks are compared in their exact historical source view.
const live = readFileSync(new URL('../src/utils/Collision.js', import.meta.url));
const current = restoreR32SourceIfPresent('src/utils/Collision.js', live);
const historical = readHistoricalSource('a59fa7ec18b6ce991128a2e7700ba09be3128078', 'src/utils/Collision.js');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

// An over-broad replacement or a refreshed fixture must not weaken the old
// collision/route invariant. Only the six approved byte-exact hunks may differ.
test('wayfinding collision migration restores the exact retained V7/V13 bytes through only six hunks', () => {
  assert.equal(V14_WAYFINDING_COLLISION_DELTAS.length, 6);
  const restored = restoreV13WayfindingCollisionBytes(current);
  assert.deepEqual(restoreV13WayfindingCollisionBytes(live), restored);
  assert.deepEqual(restored, historical);
  assert.equal(sha(restored), '7ee461c92600c58086e62b3d6df06eb5efe9e659bc405d3d26e08cd75c7bfedd');
  let reapplied = restored.toString('utf8');
  for (const { before, after } of V14_WAYFINDING_COLLISION_DELTAS) {
    assert.equal(reapplied.split(before).length - 1, 1);
    reapplied = reapplied.replace(before, after);
  }
  assert.equal(reapplied, current.toString('utf8'));
});

for (const { name, before, after } of V14_WAYFINDING_COLLISION_DELTAS) {
  for (const [mutation, replacement] of [
    ['omitted', before],
    ['missing', ''],
    ['duplicate', after + after],
    ['modified', after.replace('\n', ' \n')],
  ]) test(`wayfinding migration rejects ${mutation} ${name} hunk`, () => {
    assert.equal(current.toString().split(after).length - 1, 1);
    const changed = Buffer.from(current.toString().replace(after, replacement));
    assert.notDeepEqual(changed, current, 'mutation must change the candidate bytes');
    assert.throws(() => restoreV13WayfindingCollisionBytes(changed), /exactly once/);
  });
}

for (const [name, before, after] of [
  ['body clearance', 'const bottom = feetY + STEP_CLEARANCE;', 'const bottom = feetY - STEP_CLEARANCE;'],
  ['body top', 'const top = position.y - 0.05;', 'const top = position.y - 0.06;'],
  ['boundary operator', 'position.z + radius <= maxZ;', 'position.z + radius < maxZ;'],
  ['movement subdivision', 'Math.max(radius * 0.5, 0.05)', 'Math.max(radius * 0.4, 0.05)'],
  ['named region order', 'if (hit) return hit.name;', 'if (hit) return hit.id;'],
]) test(`wayfinding migration rejects unrelated ${name} bytes`, () => {
  assert.ok(current.toString().includes(before));
  const changed = Buffer.from(current.toString().replace(before, after));
  assert.notDeepEqual(changed, current);
  assert.throws(() => restoreV13WayfindingCollisionBytes(changed), /exact V7\/V13/);
});

test('wayfinding migration rejects unrelated trailing whitespace bytes', () => {
  assert.throws(() => restoreV13WayfindingCollisionBytes(Buffer.concat([current, Buffer.from('\n')])), /exact V7\/V13/);
});
