import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import delta from '../fixtures/taihe-enamel-cranes-source-delta.json' with {type:'json'};
import crownDelta from '../fixtures/taihe-screen-crowns-source-delta.json' with {type:'json'};
import furnitureDelta from '../fixtures/taihe-furniture-source-delta.json' with {type:'json'};
import shellDelta from '../fixtures/taihe-shell-source-delta.json' with {type:'json'};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
// Historical guards restore only this exact identity insertion. Current crane
// geometry, registry and runtime rejection are tested independently.
export function restorePreEnamelCranesSource(path,bytes) {
 const row=delta.files[path];if(!row)return bytes;
 const prior=[row.baselineSHA256,crownDelta.files[path]?.baselineSHA256,furnitureDelta.files[path]?.baselineSHA256,shellDelta.files[path]?.baselineSHA256].filter(Boolean);
 if(prior.includes(sha(bytes)))return bytes;
 assert.equal(sha(bytes),row.candidateSHA256,'exact current crane source before historical restoration');
 let source=bytes.toString();
 for(const h of row.deltas){assert.equal(source.split(h.after).length,2,'one exact crane identity hunk');source=source.replace(h.after,h.before);}
 assert.equal(sha(source),row.baselineSHA256,'all unrelated pre-crane source bytes retained');
 return Buffer.from(source);
}
