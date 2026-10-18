import {restorePreTaiheFrontSource} from './r7-taihe-front-retention.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
export const WUMEN_LANDING_WALL_TOP_SOURCE_DELTA = JSON.parse(fs.readFileSync(new URL('../fixtures/wumen-landing-wall-top-source-deltas.json', import.meta.url)));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

// A separately audited R4 migration. The earlier ascent migration and all its
// historical source hashes remain immutable; only these three hunks peel off.
export function restorePreWumenLandingWallTopSource(path, bytes) {
  bytes=restorePreTaiheFrontSource(path,bytes);
  const row = WUMEN_LANDING_WALL_TOP_SOURCE_DELTA;
  if (path !== row.path) return bytes;
  if ([row.baselineSHA256, ...row.priorSHA256].includes(sha(bytes))) return bytes;
  assert.equal(sha(bytes), row.candidateSHA256, 'exact current Wumen covered wall-top integration source');
  let source = bytes.toString();
  for (const hunk of row.deltas) {
    assert.equal(source.split(hunk.after).length, 2, 'one exact covered wall-top integration hunk');
    source = source.replace(hunk.after, hunk.before);
  }
  assert.equal(sha(source), row.baselineSHA256, 'every unrelated pre-fix source byte remains exact');
  return Buffer.from(source);
}
