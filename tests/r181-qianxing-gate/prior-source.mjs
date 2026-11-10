import{projectGatePlatforms,restorePriorTest as restoreR182Test}from'../r182-gate-platforms/prior-source.mjs';
// Exact source-only E45 projection. Gameplay always imports current modules.
import assert from'node:assert/strict';import fs from'node:fs';import{execFileSync}from'node:child_process';
import{physicalInputs as readPhysical,verifyInputs as verifyCurrent,sha}from'../r169-current-source/boundary.mjs';import delta from'./delta.json'with{type:'json'};
export{sha};export const actualPhysicalInputs=readPhysical;
const baseline=JSON.parse(execFileSync('git',['show',delta.publicBase+':tests/r169-current-source/delta.json'],{encoding:'utf8',maxBuffer:2**22}));
export function verifyInputs(input){assert.equal(input.size,1010);assert.deepEqual([...input.keys()].sort(),baseline.files.map(r=>r.path).sort());for(const r of baseline.files){const x=input.get(r.path);assert.equal(x.mode,r.mode);assert.equal(sha(x.bytes),r.after,r.path)}return{physical:1010,prior:996,modified:19,added:14}}
export function restoreRow(r,bytes){assert.equal(sha(bytes),r.after,r.path);if(r.before===null)return null;let s=bytes.toString();for(const e of r.edits){assert.equal(s.split(e.after).length,2,'unique inverse '+r.path);s=s.replace(e.after,e.before)}assert.equal(sha(s),r.before,r.path);return Buffer.from(s)}
export function projectE45(input){verifyCurrent(input);input=projectGatePlatforms(input);const out=new Map(input);for(const r of delta.rows){const x=input.get(r.path);assert.equal(x.mode,r.mode);const b=restoreRow(r,x.bytes);if(b===null)out.delete(r.path);else{assert.deepEqual(b,execFileSync('git',['show',delta.publicBase+':'+r.path],{maxBuffer:2**21}));out.set(r.path,{mode:x.mode,bytes:b})}}verifyInputs(out);return out}
export const physicalInputs=root=>projectE45(readPhysical(root));
export function restorePriorTest(path,bytes=fs.readFileSync(path)){bytes=restoreR182Test(path,bytes);const r=delta.testEdits.find(r=>r.path===path);return r?restoreRow(r,bytes):bytes}
