import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { buildWorld } from '../lib/world.mjs';
import { replayTerrace } from '../lib/terrace-walk.mjs';

// Vite's static JSON imports are valid in the browser build; give Node their type.
const hooks = registerHooks({ load(url, context, next) {
  return next(url, url.endsWith('.json') ? { ...context,
    importAttributes: { ...context.importAttributes, type: 'json' } } : context);
} });
let Teleport;
try { ({ Teleport } = await import('../../src/ui/Teleport.js')); }
finally { hooks.deregister(); }

test('丽景轩: real map landing enters and returns; old R63 start remains occupied', async t => {
  const W = await buildWorld({ realMaterials: true, realFinish: true });
  try {
    const name = '储秀宫后殿';
    const hall = W.zones.find(z => z.json.id === 'west-six').json.items.find(i => i.name === name);
    const resolver = Object.assign(Object.create(Teleport.prototype), {
      targets: new Map([[name, hall]]), zoneManager: { getMapItems: () => W.mapItems }, collisionManager: W.cm
    });
    const landing = resolver.resolveLanding(name);
    assert.ok(landing, 'ordinary resolver must supply a safe ground target');
    assert.equal(landing.y, 0);
    const historical = [110.5, 440];
    const oldFeet = W.cm.getGroundHeight(...historical, 0, 0.6);
    assert.equal(W.cm.checkCollision(new W.THREE.Vector3(historical[0], oldFeet + 1.7, historical[1]), .5), true);
    const outside = [landing.x, landing.z], porch = [94.5, 442.5], inside = [94.5, 448.7];
    for (const fps of [10, 60]) {
      const route = replayTerrace(t, W, [outside, porch, inside, porch, outside], { fps, recordFrames: true });
      assert.equal(route.arrived, true, 'round trip must arrive');
      assert.equal(route.startFeet, 0); assert.ok(Math.abs(route.end[2]) < 1e-6);
      assert.ok(route.frames.some(f => Math.hypot(f.x - inside[0], f.z - inside[1]) < .65), 'actual interior reached');
      assert.ok(Math.hypot(route.end[0] - outside[0], route.end[1] - outside[1]) < .65, 'returned to map landing');
      t.diagnostic(JSON.stringify({ fps, landing: outside, inside, end: route.end }));
    }
  } finally { W.dispose(); }
});
