import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import manifest from './source-delta.json' with {type: 'json'};
import {createRuntimeReader} from '../bilingual/source-boundary-io.mjs';
import {createXiangxuBoundary} from './source-boundary-core.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const reader = createRuntimeReader(root);
const boundary = createXiangxuBoundary(manifest, {
  ...reader,
  baseManifestBytes: fs.readFileSync(new URL('../bilingual/source-delta.json', import.meta.url)),
});
export const {stripXiangxuDelta, verifyCurrent: verifyXiangxuRuntimeBoundary, historicalPaths: historicalXiangxuPaths} = boundary;
/** Only historical source assertions call this explicit read boundary. */
export function readXiangxuHistoricalSource(input, ...args) {
  const raw = fs.readFileSync(input, ...args);
  const absolute = path.resolve(input instanceof URL ? fileURLToPath(input) : input);
  const relative = path.relative(root, absolute).split(path.sep).join('/');
  const normalized = stripXiangxuDelta(relative, raw);
  if (normalized !== raw) {
    assert.notEqual(normalized, null, 'New E46 source has no historical file');
    const current = reader.readCurrent(relative);
    assert.deepEqual(current.bytes, Buffer.isBuffer(raw) ? raw : Buffer.from(raw), 'Stable regular candidate read');
  }
  return normalized;
}
/** Private comparison IO only. The physical candidate is checked in full
 * before its exact E46 extension is projected to the unchanged 993-file view. */
export function xiangxuHistoricalComparisonIO(io) {
  return {
    ...io,
    listCurrent: () => historicalXiangxuPaths(io.listCurrent()),
    readCurrent: p => {
      const actual = io.readCurrent(p), bytes = stripXiangxuDelta(p, actual.bytes);
      assert.notEqual(bytes, null, 'No E46-only path in original bilingual comparison');
      return {...actual, bytes};
    },
  };
}
