import {restoreR31CombinedSourceIfPresent} from './r31-combined-source-retention.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const sha=x=>createHash('sha256').update(x).digest('hex');
const raw=fs.readFileSync(new URL('../fixtures/r31-flight-operations-source-delta.json',import.meta.url));
assert.equal(sha(raw),'4ebb708a4561d244e3b847077f2cf2c5cf2081d33d437853c9c412a5ced1abb8','immutable R31 exact source registry');
export const r31Source=JSON.parse(raw);
/** Historical byte guards only. Current FlightTour is tested directly. */
export function restorePreR31Source(path,bytes){
 const d=r31Source.files[path];if(!d||sha(bytes)===d.baselineSHA256)return bytes;
 assert.equal(sha(bytes),d.candidateSHA256,'exact R31 interaction source: '+path);
 let out=bytes.toString();for(const h of [...d.deltas].reverse()){
  assert.equal(out.split(h.after).length,2,'one exact R31 hunk: '+path);out=out.replace(h.after,h.before);
 }
 assert.equal(sha(out),d.baselineSHA256,'frozen R30 bytes restored: '+path);return Buffer.from(out);
}

export function restoreR31SourceIfPresent(path,bytes){bytes=restoreR31CombinedSourceIfPresent(path,bytes);const d=r31Source.files[path];return d&&sha(bytes)===d.candidateSHA256?restorePreR31Source(path,bytes):bytes;}
