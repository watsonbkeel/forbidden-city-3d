import fs from'node:fs';import assert from'node:assert/strict';import{createHash}from'node:crypto';
export const record=JSON.parse(fs.readFileSync(new URL('./source-boundary.json',import.meta.url)));
const sha=b=>createHash('sha256').update(b).digest('hex');
export function isXuanshouSourceVersion(path,bytes){const row=record.files.find(r=>r.path===path);if(!row)return false;const value=sha(bytes);return value===row.after||row.before!==null&&value===row.before;}
export function normalizeXuanshouSource(path,bytes){
 const row=record.files.find(r=>r.path===path);if(!row)return bytes;
 const current=sha(bytes);if(row.before&&current===row.before)return bytes;
 assert.equal(current,row.after,'exact declared K19 source bytes only');
 if(row.before===null)return null;
 const old=fs.readFileSync(new URL('./frozen/ZoneBase.ad0.js',import.meta.url));
 assert.equal(sha(old),row.before,'immutable public-ad0 source fixture');return old;
}
