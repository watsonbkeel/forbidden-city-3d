import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWorld } from './lib/world.mjs';

test('node collision world can build image-backed scene objects without a browser DOM', async () => {
  const world = await buildWorld();
  assert.ok(world.cm.colliders.length > 0, 'full world has collision geometry');
  assert.ok(world.zones.some(z => z.json.id === 'ningshou'), 'image-backed Ningshou zone is included');
});
