import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {WUMEN_ASCENT_SOURCE_DELTA as delta, restorePreWumenAscentSource as restore} from './lib/wumen-ascent-source-delta.mjs';
import {restorePreTaiheCoreSource} from './lib/taihe-v16-source-delta.mjs';
import {restorePreWumenLandingWallTopSource} from './lib/wumen-landing-wall-top-source-delta.mjs';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => restorePreWumenLandingWallTopSource(path, fs.readFileSync(new URL('../' + path, import.meta.url)));
const immutable = {
  'src/scene/PalaceBuilder.js': '98c0811976836e0499ef09b57d1e773dd3653b45418162eecdf4f6bcba878215',
  'src/scene/Enclosure.js': '93624bcf20912577a83af5e4b66213088935a87e67d5f125ea37cdd257bcb0b4',
};
test('source migration has exactly the declared two files and immutable pre-ascent hashes', () => {
  assert.deepEqual(Object.keys(delta.files), Object.keys(immutable));
  assert.equal(delta.files['src/scene/PalaceBuilder.js'].deltas.length, 2);
  assert.equal(delta.files['src/scene/Enclosure.js'].deltas.length, 5);
});
for (const [path, row] of Object.entries(delta.files)) {
  const bytes = read(path);
  test(`${path}: exact finite hunks restore every historical byte`, () => {
    assert.equal(row.baselineSHA256, immutable[path]); assert.equal(sha(bytes), row.candidateSHA256);
    const old = restore(path, bytes); assert.equal(sha(old), immutable[path]); assert.equal(restore(path, old), old);
    assert.throws(() => restore(path, Buffer.concat([old, Buffer.from('\n')])));
  });
  for (const [index, hunk] of row.deltas.entries()) for (const kind of ['missing', 'duplicated', 'modified', 'reverted']) {
    test(`${path}: rejects ${kind} ascent hunk ${index}`, () => {
      const replacement = kind === 'missing' ? '' : kind === 'duplicated' ? hunk.after + hunk.after : kind === 'reverted' ? hunk.before : hunk.after + '// unreviewed\n';
      const changed = bytes.toString().replace(hunk.after, replacement); assert.notEqual(changed, bytes.toString());
      assert.throws(() => restore(path, Buffer.from(changed)));
    });
  }
  test(`${path}: unrelated source byte drift is never normalized`, () => assert.throws(() => restore(path, Buffer.concat([bytes, Buffer.from('\n')]))));
}
test('only the already-recorded exact older Taihe/Wumen stages pass through the newer adapter', () => {
  const path = 'src/scene/PalaceBuilder.js';
  const old = restorePreTaiheCoreSource(path, read(path)); assert.equal(restore(path, old), old);
  assert.throws(() => restore(path, Buffer.concat([old, Buffer.from('\n')])));
  const other = Buffer.from('unrelated fixture'); assert.equal(restore('other.js', other), other);
});
