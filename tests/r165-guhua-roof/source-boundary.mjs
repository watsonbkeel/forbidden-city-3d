import fs from'node:fs';import assert from'node:assert/strict';import{createHash}from'node:crypto';
export const record=JSON.parse(fs.readFileSync(new URL('./source-boundary.json',import.meta.url))),sha=b=>createHash('sha256').update(b).digest('hex');
/** Only the two complete byte-hashed declared existing files normalize.
 * Other paths are returned unchanged, never ignored by category or directory. */
export function normalizeGuhuaSource(path,bytes){const row=record.modified[path];if(!row)return bytes;assert.equal(sha(bytes),row.after,'exact reviewed Guhua source/data, no arbitrary exclusion: '+path);const old=fs.readFileSync(new URL('./frozen/'+row.frozen,import.meta.url));assert.equal(sha(old),row.before,'immutable public ad0 source: '+path);return old}
