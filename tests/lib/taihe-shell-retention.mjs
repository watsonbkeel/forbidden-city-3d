import {restorePreCeilingSource} from './taihe-ceiling-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import delta from '../fixtures/taihe-shell-source-delta.json' with {type:'json'};
const sha=b=>createHash('sha256').update(b).digest('hex');
// Reverse only the enumerated shell removal/identity hunks before older guards.
// A current-source test separately requires the exact complete candidate bytes.
export function restorePreShellSource(path,bytes) {
 bytes=restorePreCeilingSource(path,bytes);
 const row=delta.files[path];if(!row)return bytes;
 let source=bytes.toString();if(!row.deltas.some(d=>source.includes(d.after)))return bytes;
 for(const d of row.deltas){assert.equal(source.split(d.after).length,2,'one exact shell hunk');source=source.replace(d.after,d.before);}
 assert.equal(sha(source),row.baselineSHA256,'all unrelated pre-shell source retained');return Buffer.from(source);
}
