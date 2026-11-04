import{normalizeRoofJointSource}from'../r165-roof-joint-bounds/source-boundary.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';const record=JSON.parse(fs.readFileSync(new URL('./source-boundary.json',import.meta.url))),sha=b=>createHash('sha256').update(b).digest('hex');
export function normalizeMetricsSource(path,bytes){bytes=normalizeRoofJointSource(path,bytes);const row=record.modified[path];if(!row)return bytes;assert.equal(sha(bytes),row.after,'exact complete reviewed metrics source: '+path);const old=fs.readFileSync(new URL('./frozen/'+row.frozen,import.meta.url));assert.equal(sha(old),row.before,'immutable b5 source '+path);return old}
export {record};
