import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWorld, walkStraight } from '../lib/world.mjs';

import { PALACE_LAYOUT } from '../../src/scene/Layout.js';
import { captureZhongheApproaches } from '../lib/zhonghe-approach-route.mjs';
const world = await buildWorld();
const zhongheApproaches = captureZhongheApproaches();
function traverse(points) {
  let feet = world.cm.getGroundHeight(...points[0], Infinity);
  for (let i = 1; i < points.length; i++) {
    const result = walkStraight(world, points[i - 1], points[i], { feet0: feet });
    assert.ok(result.reached >= result.total - 0.05, `${JSON.stringify(points[i - 1])} → ${JSON.stringify(points[i])}: ${JSON.stringify(result)}`);
    feet = result.feet;
  }
}

test('Zhonghe central door route goes inside the new enclosure before turning around the throne', () => {
  traverse([...zhongheApproaches.south.points, [0, 58], [5, 58], [5, 72.2], [0, 72.2], ...zhongheApproaches.north.points.toReversed()]);
  const oldCut = walkStraight(world, [0, 55], [5, 56], { feet0: world.cm.getGroundHeight(0, 55, Infinity) });
  assert.ok(oldCut.reached < oldCut.total - 1, 'old diagonal through a newly solid window must stay blocked');
});

test('Zhonghe four-sided veranda is a complete physically walkable loop', () => {
  traverse([[11, 54], [11, 76], [-11, 76], [-11, 54], [11, 54]]);
});

test('Zhonghe east and west plinth stairs fit inside the retained common terrace rail', () => {
  // 15.5 is inside the retained rail's player-clear boundary, not on the rail.
  // Approach from the terrace, rather than spawning halfway up the stair.
  traverse([[15.5, 60], [15.5, 65], [10.8, 65]]);
  traverse([[-15.5, 60], [-15.5, 65], [-10.8, 65]]);
});

test('Qianqing Gate and raised passage reach Qianqing Palace without jumping', () => {
  // R12: the center is carved imperial stone; use the actual eastern flight
  // and the rear door before crossing the shared landing.
  traverse([[0,195],[-7.46,195],[-7.46,227.3],[0,227.3],[0,310.8]]);
});

test('Jiaotai keeps an interior route around its throne through the centre doors', () => {
  // R27 west-bay clock occupies the inherited x=6.5 side line. Use the
  // existing central-door route between the throne and artifact, never remove
  // the visible clock collision to restore the obsolete path.
  const z = PALACE_LAYOUT.find(h => h.name === '交泰殿').position.z;
  traverse([[0,z-11],[0,z-3],[3.5,z-3],[3.5,z+7.2],[0,z+7.2],[0,z+11]]);
  const oldCut = walkStraight(world, [6.5, 349.4], [6.5, 361.3], { feet0: world.cm.getGroundHeight(6.5, 349.4, Infinity) });
  assert.ok(oldCut.reached < oldCut.total - 1, 'visible west-bay clock remains solid');
});

// The offset approach must join a stair opening, not traverse the new cheek wall.
test('offset Taihe approach joins the side Zhonghe flight and keeps the imperial-stone cheek solid', () => {
  traverse([[2.5, 21], [2.5, zhongheApproaches.south.points[0][1]], ...zhongheApproaches.south.points]);
  const rail = walkStraight(world, [2.5, 48], [2.5, 50.4], { feet0: 8 });
  assert.ok(rail.reached < rail.total - 0.5, 'new stair cheek wall must remain solid');
});
