import {normalizeYanxiSource} from '../r165-yanxi-rear-ear/source-boundary.mjs';
import fs from'node:fs';import assert from'node:assert/strict';import{createHash}from'node:crypto';
export const record=JSON.parse(fs.readFileSync(new URL('./source-boundary.json',import.meta.url)));
const sha=b=>createHash('sha256').update(b).digest('hex');
export function isCompanionSourceVersion(path,bytes){const row=record.files.find(r=>r.path===path);if(!row)return false;const h=sha(bytes);return h===row.after||row.before!==null&&h===row.before}
export function normalizeCompanionSource(path,bytes){const row=record.files.find(r=>r.path===path);if(!row)return bytes;const h=sha(bytes);if(row.before!==null&&h===row.before)return bytes;assert.equal(h,row.after,'exact declared F51/F52 runtime bytes only');if(row.before===null)return null;const old=fs.readFileSync(new URL('./frozen/ZoneBase.c598.js',import.meta.url));assert.equal(sha(old),row.before,'immutable c598 source fixture');return old}
export const readCompatibleSource=(path)=>normalizeCompanionSource(path,normalizeYanxiSource(path,fs.readFileSync(path)));
