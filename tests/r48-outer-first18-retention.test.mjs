import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {retentionSignature} from './r48-outer-retention-helper.mjs';
const root='../docs/current-state/r48-remaining/';
const scope=JSON.parse(readFileSync(new URL(root+'outer-scope.json',import.meta.url))),baseline=JSON.parse(readFileSync(new URL(root+'outer-first18-retained-signatures.json',import.meta.url))),delta=JSON.parse(readFileSync(new URL(root+'outer-safety-retention-delta.json',import.meta.url)));
for(const record of baseline.records)test(`R48 first18 exact retention except explicitly audited safety delta: ${record.name}`,()=>{const change=delta.records.find(r=>r.id===record.id);assert.ok(change);const expected={...record.signature};for(const[key,value]of Object.entries(change.changes)){assert.equal(value.before,record.signature[key],'immutable accepted baseline remains the before value');expected[key]=value.after;}for(const followup of delta.followupDeltas??[]){const followupChange=followup.records.find(r=>r.id===record.id);for(const[key,value]of Object.entries(followupChange?.changes??{})){assert.equal(value.before,expected[key],'follow-up before equals the preceding audited after, not a reset baseline');expected[key]=value.after;}}assert.deepEqual(retentionSignature(scope.find(r=>r.id===record.id)),expected);});
