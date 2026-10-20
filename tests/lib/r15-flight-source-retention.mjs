import {restoreR34SourceIfPresent} from './r34-source-retention.mjs';
import {restoreR31SourceIfPresent} from './r31-flight-operations-retention.mjs';
import {restorePreR29Source,r29Source} from './r29-qianqing-retention.mjs';
import {restoreR16SourceIfPresent}from './r16-baohe-retention.mjs';
import assert from 'node:assert/strict';import {createHash}from'node:crypto';import delta from '../fixtures/r15-flight-daycycle-source-deltas.json'with{type:'json'};
export const R15_SOURCE_DELTA=delta;
const sha=b=>createHash('sha256').update(b).digest('hex');
/** Exact named feature delta only; never masks an unrelated/current mutation.
 * The old baselines and their hash contracts are not rewritten. */
export function restorePreR15Source(path,bytes){bytes=restoreR34SourceIfPresent(path,bytes);bytes=restoreR31SourceIfPresent(path,bytes);if(path==='src/scene/interior/InteriorLoader.js'&&sha(bytes)===r29Source.files[path].candidateSHA256)bytes=restorePreR29Source(path,bytes);bytes=restoreR16SourceIfPresent(path,bytes);const r=delta.files[path];if(!r)return bytes;if(sha(bytes)===r.baselineSHA256)return bytes;assert.equal(sha(bytes),r.candidateSHA256,`Unreviewed R15 source bytes: ${path}`);let s=bytes.toString();for(const d of [...r.deltas].reverse()){assert.equal(s.split(d.after).length,2,`One exact R15 hunk: ${path}`);s=s.replace(d.after,d.before);}assert.equal(sha(s),r.baselineSHA256,`R15 restores exact R13: ${path}`);return Buffer.from(s);}
