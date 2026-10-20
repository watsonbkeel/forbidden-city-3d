import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {r34Source, restorePreR34Source} from './r34-source-retention.mjs';
import {r34NightSource} from './r34-night-source-retention.mjs';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
/** The original lighting-only checkpoint remains frozen. Bind the complete
 * final integrated source, restore frozen R33, reapply only the original finite
 * night hunks and verify that independently registered checkpoint identity.
 * Runtime lighting and disposal tests always import unmodified production. */
export function restoreR34NightCheckpointIfPresent(path, bytes) {
  const integrated = Object.hasOwn(r34Source.files, path) ? r34Source.files[path] : undefined;
  const night = Object.hasOwn(r34NightSource.files, path) ? r34NightSource.files[path] : undefined;
  if (!integrated || !night || sha(bytes) !== integrated.candidateSHA256 || sha(bytes) === night.candidateSHA256) return bytes;
  const baseline = restorePreR34Source(path, bytes);
  assert.equal(sha(baseline), night.baselineSHA256, 'independent common R33 night baseline');
  let source = baseline.toString();
  for (const hunk of night.deltas) {
    assert.equal(source.split(hunk.before).length, 2, 'unique original night hunk');
    source = source.replace(hunk.before, hunk.after);
  }
  assert.equal(sha(source), night.candidateSHA256, 'exact immutable lighting-only checkpoint');
  return Buffer.from(source);
}
