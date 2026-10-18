import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import delta from '../fixtures/r8-incense-source-delta.json' with {type:'json'};
const sha=b=>createHash('sha256').update(b).digest('hex');
// Exact, bounded current-to-R7 view. No historical expectations are rewritten.
export function restorePreIncenseSource(path,bytes){
 if(path!==delta.path||sha(bytes)===delta.baselineSHA256)return bytes;
 assert.equal(sha(bytes),delta.candidateSHA256,'exact R8 incense registry');let text=bytes.toString();
 for(const h of delta.deltas){assert.equal(text.split(h.after).length,2);text=text.replace(h.after,h.before);}
 assert.equal(sha(text),delta.baselineSHA256);return Buffer.from(text);
}
