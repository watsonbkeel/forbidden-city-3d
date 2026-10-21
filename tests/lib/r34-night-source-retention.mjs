import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const sha = b => createHash('sha256').update(b).digest('hex');
const raw = fs.readFileSync(new URL('../fixtures/r34-night-source-delta.json', import.meta.url));
assert.equal(sha(raw), '54b39242a29d298b0d9dc6260f66f0017e45f1c50ca6841b5b90e97affa715e9', 'immutable R34 night source registry');
export const r34NightSource = JSON.parse(raw);
export function restorePreR34NightSource(path, bytes) {
 const d = r34NightSource.files[path];
 if (!d || sha(bytes) === d.baselineSHA256) return bytes;
 assert.equal(sha(bytes), d.candidateSHA256, 'exact R34 night source: ' + path);
 let s = bytes.toString();
 for (const h of [...d.deltas].reverse()) {
  assert.equal(s.split(h.after).length, 2, 'unique R34 night hunk');
  s = s.replace(h.after, h.before);
 }
 assert.equal(sha(s), d.baselineSHA256, 'exact R33 source restored');
 return Buffer.from(s);
}
export function restoreR34NightIfPresent(path, bytes) {
 const d = r34NightSource.files[path];
 return d && sha(bytes) === d.candidateSHA256 ? restorePreR34NightSource(path, bytes) : bytes;
}
