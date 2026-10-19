import {historicalR27Dependency} from './historical-r27-jiaotai-fixture.mjs';
import {restorePreR28Source} from './r28-jiaotai-central-retention.mjs';
// Bind exact R25 added/retained modules before restoring older builders.
import './historical-r24-baohe-fixture.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {restorePreR24Source,assertR24AddedSource,assertR24RetainedSource} from './r24-baohe-retention.mjs';
import source from '../fixtures/r24-baohe-source-delta.json' with {type:'json'};

// Portable frozen R23 historical fixture only. Restore the complete builder
// from exact R24 bytes, bind unchanged dependencies, then resolve imports in
// memory. No Git, sibling checkout, network, runtime writes or geometry filters.
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=path=>restorePreR28Source(path,fs.readFileSync(new URL('../../'+path,import.meta.url)));
for(const path of Object.keys(source.addedFiles))assertR24AddedSource(path,read(path));
for(const path of Object.keys(source.retainedFiles))assertR24RetainedSource(path,read(path));
const path='src/scene/PalaceBuilder.js',url=new URL('../../'+path,import.meta.url);
const bytes=restorePreR24Source(path,read(path));
assert.equal(sha(bytes),source.files[path].baselineSHA256,'exact frozen R23 PalaceBuilder');
const text=bytes.toString().replace(/from '([^']+)'/g,(_,specifier)=>
  `from '${historicalR27Dependency(specifier,url)}'`);
export const {PalaceBuilder:HistoricalR23PalaceBuilder}=await import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'));
