import {restorePreR7Beams} from './r7-taihe-beam-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import delta from '../fixtures/taihe-furnishing-surface-source-delta.json' with {type:'json'};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
// Only the exact current artwork call/import and identity insertion are removed.
// Historical fixture contents/hashes stay intact; no geometry is substituted.
export function restorePreFurnishingSurfaceSource(path,bytes) {
 bytes=restorePreR7Beams(path,bytes);
 const row=delta.files[path];if(!row)return bytes;
 if(row.allowedEarlierSHA256.includes(sha(bytes)))return bytes;
 assert.equal(sha(bytes),row.candidateSHA256,'exact current furnishing surface source');
 let source=bytes.toString();
 for(const h of row.deltas){assert.equal(source.split(h.after).length,2,'one exact furnishing surface hunk');source=source.replace(h.after,h.before);}
 assert.equal(sha(source),row.baselineSHA256,'all unrelated furnishing source bytes retained');
 return Buffer.from(source);
}
