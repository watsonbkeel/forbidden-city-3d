import assert from 'node:assert/strict';
import {restorePreEnamelCranesSource} from './taihe-enamel-cranes-retention.mjs';
import {createHash} from 'node:crypto';
import delta from '../fixtures/taihe-screen-crowns-source-delta.json' with {type:'json'};
import furnitureDelta from '../fixtures/taihe-furniture-source-delta.json' with {type:'json'};
import shellDelta from '../fixtures/taihe-shell-source-delta.json' with {type:'json'};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
// Restore only the exact declared crown identity insertion for historical guards.
// Current crown geometry and source identity are tested independently.
export function restorePreScreenCrownsSource(path,bytes) {
 bytes=restorePreEnamelCranesSource(path,bytes);
 const row=delta.files[path];if(!row)return bytes;
 // Nested historical guards can receive an already-restored exact older stage.
 // Permit only the finite recorded hashes, never arbitrary source without a hunk.
 const historical=[row.baselineSHA256,furnitureDelta.files[path]?.baselineSHA256,shellDelta.files[path]?.baselineSHA256].filter(Boolean);
 if(historical.includes(sha(bytes)))return bytes;
 assert.equal(sha(bytes),row.candidateSHA256,'exact current crown source before historical restoration');
 let source=bytes.toString();
 for(const h of row.deltas){assert.equal(source.split(h.after).length,2,'one exact screen crown identity hunk');source=source.replace(h.after,h.before);}
 assert.equal(sha(source),row.baselineSHA256,'all unrelated pre-crown source bytes retained');
 return Buffer.from(source);
}
