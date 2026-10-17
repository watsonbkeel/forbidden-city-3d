import {restorePreShellSource} from './taihe-shell-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import delta from '../fixtures/taihe-caisson-source-delta.json' with {type:'json'};
const sha=b=>createHash('sha256').update(b).digest('hex');
// Reverse only these enumerated append/identity statements before older guards.
// Older intermediate snapshots legitimately contain none of the caisson hunks.
// A separate current-source test requires the exact full candidate digest.
export function restorePreCaissonSource(path,bytes) {
 bytes=restorePreShellSource(path,bytes);
 const record=delta.files[path];if(!record)return bytes;
 let source=bytes.toString();
 if(!record.deltas.some(d=>source.includes(d.after)))return bytes;
 for(const d of record.deltas){assert.equal(source.split(d.after).length,2,'one exact caisson hunk');source=source.replace(d.after,d.before);}
 assert.equal(sha(source),record.baselineSHA256,'all unrelated pre-caisson source bytes retained');
 return Buffer.from(source);
}
