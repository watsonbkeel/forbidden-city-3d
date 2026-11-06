import {normalizeTishunRetentionSource,isTishunRetentionSourceVersion} from '../r165-tishun-reference-retention/source-boundary.mjs';
import {normalizeDailouSource,isDailouSourceVersion} from '../r165-dailou-waiting-house/source-boundary.mjs';
import fs from'node:fs';import assert from'node:assert/strict';import{createHash}from'node:crypto';
export const record=JSON.parse(fs.readFileSync(new URL('./source-boundary.json',import.meta.url)));
const sha=b=>createHash('sha256').update(b).digest('hex');
export function isTishunSourceVersion(path,bytes){if(isTishunRetentionSourceVersion(path,bytes))bytes=normalizeTishunRetentionSource(path,bytes);if(isDailouSourceVersion(path,bytes)){bytes=normalizeDailouSource(path,bytes);if(bytes===null)return false}const r=record.files.find(r=>r.path===path);return !!r&&(sha(bytes)===r.after||r.before!==null&&sha(bytes)===r.before)}
export function normalizeTishunSource(path,bytes){if(isTishunRetentionSourceVersion(path,bytes))bytes=normalizeTishunRetentionSource(path,bytes);if(isDailouSourceVersion(path,bytes)){bytes=normalizeDailouSource(path,bytes);if(bytes===null)return null}const r=record.files.find(r=>r.path===path);if(!r)return bytes;const h=sha(bytes);if(r.before!==null&&h===r.before)return bytes;assert.equal(h,r.after,'exact declared F49 runtime bytes only');if(r.before===null)return null;const old=fs.readFileSync(new URL('./frozen/ZoneBase.8386.js',import.meta.url));assert.equal(sha(old),r.before,'immutable public8386 fixture');return old}
export const readCompatibleSource=path=>normalizeTishunSource(path,fs.readFileSync(path));
