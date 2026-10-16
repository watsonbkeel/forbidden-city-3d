import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// Undo only the two approved ground-leaf proxy registrations before older
// source/physics assertions. Historical fixtures and hashes are not refreshed.
const addition = `        // Match upper-door proxies: transformed leaf bounds, limited to body height.
        leaf.updateMatrixWorld(true);
        const b = new THREE.Box3().setFromObject(leaf);
        this.col(b.min.x, Math.max(0, b.min.y), b.min.z, b.max.x, Math.min(3, b.max.y), b.max.z);
`;
export const V14_GROUND_DOOR_DELTAS = Object.freeze([
  '        leaf.position.set(o.x + s * (o.w / 2 - 0.15), 0, zS + 2 + o.w * 0.24);\n',
  '        leaf.position.set(o.x + s * (o.w / 2 - 0.15), 0, -D / 2 + 2 + o.w * 0.24);\n',
].map(position => {
  const before = position + '        leaf.rotation.y = Math.PI / 2;\n        g.add(leaf);\n';
  return Object.freeze({ before, after: before + addition });
}));

export function restoreV13GroundDoorSource(current) {
  let source = current.toString('utf8');
  for (const { before, after } of V14_GROUND_DOOR_DELTAS) {
    assert.equal(source.split(after).length - 1, 1,
      'Each exact V14 ground-leaf registration must occur once');
    source = source.replace(after, before);
  }
  const restored = Buffer.from(source, 'utf8');
  assert.equal(createHash('sha256').update(restored).digest('hex'),
    'dfddcea43a70e4d28383c8c420e2f29f274cf4afbb588e9dcc163b80638bd18e',
    'All retained PalaceBuilder bytes must equal V13 D e2b10a0d');
  return restored;
}
