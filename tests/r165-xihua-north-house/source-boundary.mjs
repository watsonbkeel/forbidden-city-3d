import fs from'node:fs';import assert from'node:assert/strict';import{createHash}from'node:crypto';
export const record=JSON.parse(fs.readFileSync(new URL('./source-boundary.json',import.meta.url)));
const sha=b=>createHash('sha256').update(b).digest('hex');
export function isWatchSourceVersion(path,bytes){const row=record.files.find(r=>r.path===path);if(!row)return false;const h=sha(bytes);return h===row.after||row.before!==null&&h===row.before}
export function normalizeWatchSource(path,bytes){const row=record.files.find(r=>r.path===path);if(!row)return bytes;const h=sha(bytes);if(row.before!==null&&h===row.before)return bytes;assert.equal(h,row.after,'exact declared L3 source bytes only');if(row.before===null)return null;const old=fs.readFileSync(new URL('./frozen/ZoneBase.4ed.js',import.meta.url));assert.equal(sha(old),row.before,'immutable4ed source fixture');return old}
