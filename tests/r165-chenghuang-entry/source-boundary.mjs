import{normalizeTishunSource,isTishunSourceVersion}from'../r165-tishun-south-beam/source-boundary.mjs';
import fs from'node:fs';import assert from'node:assert/strict';import{createHash}from'node:crypto';
export const record=JSON.parse(fs.readFileSync(new URL('./source-boundary.json',import.meta.url)));
const sha=b=>createHash('sha256').update(b).digest('hex');
export function isChenghuangSourceVersion(path,bytes){if(isTishunSourceVersion(path,bytes)){bytes=normalizeTishunSource(path,bytes);if(bytes===null)return false}const row=record.files.find(r=>r.path===path);if(!row)return false;const h=sha(bytes);return h===row.after||row.before!==null&&h===row.before}
export function normalizeChenghuangSource(path,bytes){if(isTishunSourceVersion(path,bytes)){bytes=normalizeTishunSource(path,bytes);if(bytes===null)return null;}const row=record.files.find(r=>r.path===path);if(!row)return bytes;const h=sha(bytes);if(row.before!==null&&h===row.before)return bytes;assert.equal(h,row.after,'exact declared L11 runtime bytes only');if(row.before===null)return null;const old=fs.readFileSync(new URL('./frozen/ZoneBase.9a.js',import.meta.url));assert.equal(sha(old),row.before,'immutable public9a source fixture');return old}
export const readCompatibleSource=(path)=>normalizeChenghuangSource(path,fs.readFileSync(path));
