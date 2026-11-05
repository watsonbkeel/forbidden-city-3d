import fs from'node:fs';import assert from'node:assert/strict';import{createHash}from'node:crypto';
export const record=JSON.parse(fs.readFileSync(new URL('./source-boundary.json',import.meta.url)));
const sha=b=>createHash('sha256').update(b).digest('hex');
export function isYanxiSourceVersion(path,bytes){const row=record.files.find(r=>r.path===path);if(!row)return false;const h=sha(bytes);return h===row.after||row.before!==null&&h===row.before}
export function normalizeYanxiSource(path,bytes){const row=record.files.find(r=>r.path===path);if(!row)return bytes;const h=sha(bytes);if(row.before!==null&&h===row.before)return bytes;assert.equal(h,row.after,'exact declared F50 runtime bytes only');if(row.before===null)return null;const old=fs.readFileSync(new URL('./frozen/ZoneBase.a60.js',import.meta.url));assert.equal(sha(old),row.before,'immutable a60 source fixture');return old}
export const readCompatibleSource=(path)=>normalizeYanxiSource(path,fs.readFileSync(path));
