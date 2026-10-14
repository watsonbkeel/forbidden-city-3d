const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
function samples(center, bounds) {
  const helper = path.join(__dirname, 'lib/gate-probes.cjs');
  assert.ok(fs.existsSync(helper), 'gate passage samples exclude the world boundary');
  return require(helper).gateProbeSamples(center, 18, bounds);
}
test('Shenwu probes keep both gate faces but exclude the world boundary collision', () => {
  const points = samples(542, { minZ: -510, maxZ: 560 });
  assert.equal(points[0], 524);
  assert.equal(points.at(-1), 559.5);
  assert.ok(points.includes(542));
  assert.ok(!points.includes(560));
  assert.equal(points.length, 72);
});
test('interior gates retain every original half-metre passage sample', () => {
  const points = samples(215.3, { minZ: -510, maxZ: 560 });
  assert.equal(points.length, 73);
  assert.ok(Math.abs(points[0] - 197.3) < 1e-9);
  assert.ok(Math.abs(points.at(-1) - 233.3) < 1e-9);
});
