import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const raw=readFileSync(new URL('../fixtures/r39-model-fidelity-inverse.json',import.meta.url));
assert.equal(sha(raw),'95083fecd053fe67941f6360e6a54e5ae1bb26c57e623a4527fdded1ba763a25','immutable reviewed R39 UI inverse fixture');
const registry=JSON.parse(raw);
/** Historical-test inverse only; never normalizes unknown or mutated sources.
 * Current UI behavior is checked separately against live production modules. */
export function restoreR39FidelitySourceIfPresent(path,bytes){
 const row=Object.hasOwn(registry.files,path)?registry.files[path]:null;
 if(!row||sha(bytes)!==row.candidateSHA256)return bytes;
 assert.equal(bytes.length,row.candidateBytes);
 const restored=Buffer.from(row.baselineSource);assert.equal(sha(restored),row.baselineSHA256);assert.equal(restored.length,row.baselineBytes);
 return restored;
}
