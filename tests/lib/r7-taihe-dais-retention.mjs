import {restorePreIncenseSource} from './r8-incense-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import delta from '../fixtures/r7-taihe-dais-source-delta.json' with {type:'json'};
const sha=b=>createHash('sha256').update(b).digest('hex');
// A finite migration view for earlier invariants. The current dais has separate
// geometry, navigation, identity and negative tests; historical hashes stay put.
export function restorePreTaiheDaisSource(path,bytes) {
 bytes=restorePreIncenseSource(path,bytes);
 const row=delta.files[path];if(!row)return bytes;
 if(row.allowedEarlierSHA256.includes(sha(bytes)))return bytes;
 assert.equal(sha(bytes),row.candidateSHA256,'exact reviewed three-front-flight migration');
 let source=bytes.toString();
 for(const h of row.deltas){assert.equal(source.split(h.after).length,2,'one exact dais hunk');source=source.replace(h.after,h.before);}
 assert.equal(sha(source),row.baselineSHA256,'every unrelated pre-dais source byte remains exact');
 return Buffer.from(source);
}
