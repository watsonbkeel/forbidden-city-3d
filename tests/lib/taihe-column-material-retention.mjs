import {restorePreColumnResponseSource} from './taihe-column-response-retention.mjs';
import {restorePreWumenAscentSource} from './wumen-ascent-source-delta.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import delta from '../fixtures/taihe-column-material-delta.json' with {type:'json'};
export const columnMaterialDelta=delta;
const sha=v=>createHash('sha256').update(v).digest('hex');
// Only four exact source insertions/replacements can be undone. Old fixtures and
// old hashes stay unchanged; unrelated bytes are never normalized away.
export function restorePreColumnMaterialSource(path,bytes) {
  bytes=restorePreWumenAscentSource(path,bytes);
  bytes=restorePreColumnResponseSource(path,bytes);
  const record=delta.files[path];if(!record)return bytes;
  if(sha(bytes)===record.baselineSHA256)return bytes;
  let source=bytes.toString();
  for(const d of record.deltas){assert.equal(source.split(d.after).length,2,'one exact column material hunk');source=source.replace(d.after,d.before);}
  assert.equal(sha(source),record.baselineSHA256,'column material retains all unrelated source bytes');
  return Buffer.from(source);
}
export function withoutColumnUV(v) {const {TEXCOORD_0,...retained}=v;return retained;}
