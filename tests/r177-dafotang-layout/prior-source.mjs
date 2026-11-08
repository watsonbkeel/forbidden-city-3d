// Exact source-only projection to the public R175 predecessor. Behavioral
// imports always use the current product; no projected modules enter gameplay.
import assert from'node:assert/strict';import fs from'node:fs';import{execFileSync}from'node:child_process';
import{physicalInputs as readPhysical,verifyInputs as verifyCurrent,sha}from'../r169-current-source/boundary.mjs';
import delta from'./delta.json'with{type:'json'};
export{sha};export const actualPhysicalInputs=readPhysical;
const baseline=JSON.parse(execFileSync('git',['show',delta.publicBase+':tests/r169-current-source/delta.json'],{encoding:'utf8',maxBuffer:2**22}));
export function verifyInputs(input){assert.equal(input.size,delta.baselineRuntimeCount);assert.deepEqual([...input.keys()].sort(),baseline.files.map(r=>r.path).sort());for(const r of baseline.files){const x=input.get(r.path);assert.equal(x.mode,r.mode);assert.equal(sha(x.bytes),r.after,r.path)}return{physical:1005,prior:996,modified:17,added:9};}
export function projectR177(input){verifyCurrent(input);const out=new Map(input);for(const r of delta.rows){const x=input.get(r.path);assert.equal(x.mode,r.mode);assert.equal(sha(x.bytes),r.after);if(r.before===null){out.delete(r.path);continue;}let s=x.bytes.toString();for(const e of r.edits){assert.equal(s.split(e.after).length,2);s=s.replace(e.after,e.before)}assert.equal(sha(s),r.before);assert.deepEqual(Buffer.from(s),execFileSync('git',['show',delta.publicBase+':'+r.path],{maxBuffer:2**20}));out.set(r.path,{mode:x.mode,bytes:Buffer.from(s)})}verifyInputs(out);return out;}
export const physicalInputs=root=>projectR177(readPhysical(root));
export function restorePriorTest(path,bytes=fs.readFileSync(path)){const r=delta.testEdits.find(r=>r.path===path);if(!r)return bytes;assert.equal(sha(bytes),r.after);let s=bytes.toString();for(const e of r.edits){assert.equal(s.split(e.after).length,2);s=s.replace(e.after,e.before)}assert.equal(sha(s),r.before);return Buffer.from(s);}
