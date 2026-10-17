import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import taihe from '../fixtures/taihe-v16-source-deltas.json' with {type: 'json'};
import vertical from '../fixtures/wumen-vertical-source-deltas.json' with {type: 'json'};
import {restorePreWumenLandingWallTopSource} from './wumen-landing-wall-top-source-delta.mjs';
export const WUMEN_ASCENT_SOURCE_DELTA = JSON.parse(fs.readFileSync(new URL('../fixtures/wumen-ascent-source-deltas.json', import.meta.url)));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
// Exact finite source migration, placed before all older source restorations.
// Old fixture digests remain unchanged. Only their explicitly recorded stages
// may bypass this newer migration; arbitrary hunk-free source never may.
export function restorePreWumenAscentSource(path, bytes) {
  bytes = restorePreWumenLandingWallTopSource(path, bytes);
  const row = WUMEN_ASCENT_SOURCE_DELTA.files[path]; if (!row) return bytes;
  const prior = [row.baselineSHA256, taihe[path]?.historicalSHA256, vertical.sources[path]?.historicalSha256].filter(Boolean);
  if (prior.includes(sha(bytes))) return bytes;
  assert.equal(sha(bytes), row.candidateSHA256, 'exact current Wumen ascent integration source');
  let source = bytes.toString();
  for (const h of row.deltas) {
    assert.equal(source.split(h.after).length, 2, 'one exact Wumen ascent integration hunk');
    source = source.replace(h.after, h.before);
  }
  assert.equal(sha(source), row.baselineSHA256, 'every unscoped Wumen integration byte remains exact');
  return Buffer.from(source);
}
