import {restorePreFurnitureSource} from './taihe-furniture-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import delta from '../fixtures/taihe-ceiling-source-delta.json' with {type:'json'};
const sha=b=>createHash('sha256').update(b).digest('hex');
// A finite material-only substitution. Geometry/UV/source around it stay exact.
export function restorePreCeilingSource(path, bytes) {
  bytes=restorePreFurnitureSource(path,bytes);
  const row=delta.files[path]; if(!row)return bytes;
  let source=bytes.toString();
  if(!row.deltas.some(d=>source.includes(d.after)))return bytes;
  assert.equal(sha(source),row.candidateSHA256,'exact scoped ceiling source');
  for(const d of row.deltas){assert.equal(source.split(d.after).length,2);source=source.replace(d.after,d.before);}
  assert.equal(sha(source),row.baselineSHA256,'all non-ceiling source retained');
  return Buffer.from(source);
}
