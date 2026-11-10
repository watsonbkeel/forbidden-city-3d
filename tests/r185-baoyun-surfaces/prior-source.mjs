// Exact source-only removal of the two Baoyun gallery skin repairs.
// No private Git predecessor is read and no projected module enters gameplay.
import assert from'node:assert/strict';import fs from'node:fs';import{manifest,physicalInputs,verifyInputs as verifyCurrent,sha}from'../r169-current-source/boundary.mjs';import delta from'./delta.json'with{type:'json'};
export{physicalInputs,sha};
const previous=manifest.files.map(r=>{const d=delta.rows.find(d=>d.path===r.path);return{path:r.path,mode:r.mode,after:d?d.before:r.after}}).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);assert.equal(sha(JSON.stringify(previous)),delta.priorRuntimeFilesSha256);
function restore(r,bytes){assert.equal(sha(bytes),r.after,r.path);let s=bytes.toString();for(const e of r.edits){assert.equal(s.split(e.after).length,2,'unique inverse '+r.path);s=s.replace(e.after,e.before)}assert.equal(sha(s),r.before,r.path);return Buffer.from(s)}
export function projectBaoyunSurfaces(input){verifyCurrent(input);assert.equal(delta.rows.length,1);const out=new Map(input);for(const r of delta.rows){const x=out.get(r.path);assert.equal(x.mode,r.mode);out.set(r.path,{mode:r.mode,bytes:restore(r,x.bytes)})}assert.deepEqual([...out.keys()].sort(),previous.map(r=>r.path));for(const r of previous){assert.equal(out.get(r.path).mode,r.mode,r.path);assert.equal(sha(out.get(r.path).bytes),r.after,r.path)}return out}
export function restorePriorTest(path,bytes=fs.readFileSync(path)){const r=delta.testEdits.find(r=>r.path===path);return r?restore(r,bytes):bytes}
