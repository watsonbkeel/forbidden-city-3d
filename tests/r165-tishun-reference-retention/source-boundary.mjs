import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
export const record=JSON.parse(fs.readFileSync(new URL('./source-boundary.json',import.meta.url)));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export function isTishunRetentionSourceVersion(path,bytes){return path===record.path&&[record.before,record.after].includes(sha(bytes))}
export function normalizeTishunRetentionSource(path,bytes){
  if(path!==record.path)return bytes;
  const h=sha(bytes);
  if(h===record.before)return bytes;
  assert.equal(h,record.after,'exact declared F49 reference-retention runtime bytes only');
  const old=fs.readFileSync(new URL('./frozen/TishunSouthBeam.2544.js',import.meta.url));
  assert.equal(sha(old),record.before,'immutable public2544 F49 helper');
  return old;
}
