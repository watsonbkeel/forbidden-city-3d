import{projectBaoyunSurfaces,restorePriorTest as restoreR185Test}from'../r185-baoyun-surfaces/prior-source.mjs';
// Source-only composition: exact four gate repairs -> exact E45 view -> public16e9.
// Behavioral builders always remain current. No unpublished Git object is read.
import assert from'node:assert/strict';import fs from'node:fs';import{execFileSync}from'node:child_process';import{physicalInputs,verifyInputs as verifyCurrent,sha}from'../r169-current-source/boundary.mjs';import delta from'./delta.json'with{type:'json'};import e45 from'../r181-qianxing-gate/delta.json'with{type:'json'};
export{physicalInputs,sha};
const prior=JSON.parse(execFileSync('git',['show',delta.publicBase+':tests/r169-current-source/delta.json'],{maxBuffer:2**22}));
assert.equal(sha(fs.readFileSync(new URL('../r181-qianxing-gate/delta.json',import.meta.url))),delta.e45DeltaSha256);
const e45Files=new Map(prior.files.map(r=>[r.path,{path:r.path,mode:r.mode,after:r.after}]));
for(const r of e45.rows){assert.equal(e45Files.get(r.path)?.after??null,r.before,r.path);e45Files.set(r.path,{path:r.path,mode:r.mode,after:r.after})}
assert.equal(e45Files.size,1012);assert.equal(sha(JSON.stringify([...e45Files.values()].sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0))),delta.e45RuntimeFilesSha256);
function restore(row,bytes){assert.equal(sha(bytes),row.after,row.path);let s=bytes.toString();for(const edit of row.edits){assert.equal(s.split(edit.after).length,2,'exact unique inverse '+row.path);s=s.replace(edit.after,edit.before)}assert.equal(sha(s),row.before,row.path);return Buffer.from(s)}
export function projectGatePlatforms(input){verifyCurrent(input);input=projectBaoyunSurfaces(input);const out=new Map(input);assert.equal(delta.rows.length,4);for(const row of delta.rows){const current=out.get(row.path);assert.equal(current.mode,row.mode);out.set(row.path,{mode:row.mode,bytes:restore(row,current.bytes)})}assert.deepEqual([...out.keys()].sort(),[...e45Files.keys()].sort());for(const row of e45Files.values()){const current=out.get(row.path);assert.equal(current.mode,row.mode);assert.equal(sha(current.bytes),row.after,row.path)}return out}
export function restorePriorTest(path,bytes=fs.readFileSync(path)){bytes=restoreR185Test(path,bytes);const row=delta.testEdits.find(r=>r.path===path);return row?restore(row,bytes):bytes}
