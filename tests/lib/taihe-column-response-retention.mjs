import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import delta from '../fixtures/taihe-column-response-delta.json' with {type:'json'};
const sha=v=>createHash('sha256').update(v).digest('hex');
// Finite named response hunks only; retain every earlier fixture and source hash.
export function restorePreColumnResponseSource(path,bytes) {
  const record=delta.files[path];if(!record||sha(bytes)===record.baselineSHA256)return bytes;
  let source=bytes.toString();
  for(const d of record.deltas){assert.equal(source.split(d.after).length,2,'one exact column response hunk');source=source.replace(d.after,d.before);}
  assert.equal(sha(source),record.baselineSHA256,'column response retains all unrelated source bytes');
  return Buffer.from(source);
}
