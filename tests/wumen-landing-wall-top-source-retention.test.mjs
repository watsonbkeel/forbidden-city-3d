import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { WUMEN_LANDING_WALL_TOP_SOURCE_DELTA as delta, restorePreWumenLandingWallTopSource as restore } from './lib/wumen-landing-wall-top-source-delta.mjs';
import { WUMEN_ASCENT_SOURCE_DELTA as previous, restorePreWumenAscentSource } from './lib/wumen-ascent-source-delta.mjs';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => fs.readFileSync(new URL('../' + path, import.meta.url));
const current = read(delta.path);

test('R4 has one separately audited integration file, three exact hunks, and the unchanged R3 baseline', () => {
  assert.equal(delta.baseCommit, '0b37c0b7b651219d7dec50f457b7915e5a49f52e');
  assert.equal(delta.path, 'src/scene/Enclosure.js'); assert.equal(delta.deltas.length, 3);
  assert.equal(delta.baselineSHA256, previous.files[delta.path].candidateSHA256);
  assert.equal(sha(current), delta.candidateSHA256); assert.equal(sha(read(delta.helper.path)), delta.helper.sha256);
  const old = restore(delta.path, current);
  assert.equal(sha(old), delta.baselineSHA256); assert.equal(restore(delta.path, old), old);
  assert.equal(sha(restorePreWumenAscentSource(delta.path, current)), previous.files[delta.path].baselineSHA256);
});
for (const [index, hunk] of delta.deltas.entries()) for (const kind of ['missing', 'duplicated', 'modified', 'reverted']) {
  test(`R4 rejects ${kind} wall-top hunk ${index}`, () => {
    const replacement = kind === 'missing' ? '' : kind === 'duplicated' ? hunk.after + hunk.after : kind === 'reverted' ? hunk.before : hunk.after + '// drift\n';
    const changed = current.toString().replace(hunk.after, replacement);
    assert.notEqual(changed, current.toString()); assert.throws(() => restore(delta.path, Buffer.from(changed)));
  });
}
test('R4 never normalizes unrelated drift or unrecognized earlier source', () => {
  assert.throws(() => restore(delta.path, Buffer.concat([current, Buffer.from('\n')])));
  const old = restore(delta.path, current);
  assert.throws(() => restore(delta.path, Buffer.concat([old, Buffer.from('\n')])));
  const unrelated = Buffer.from('unrelated'); assert.equal(restore('other.js', unrelated), unrelated);
});
