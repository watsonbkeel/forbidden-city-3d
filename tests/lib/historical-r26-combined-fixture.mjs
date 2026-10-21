import {historicalR27Dependency} from './historical-r27-jiaotai-fixture.mjs';
import {restorePreR28Source} from './r28-jiaotai-central-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {restorePreR27Source,assertR27AddedSource,assertR27RetainedSource} from './r27-jiaotai-retention.mjs';
import source from '../fixtures/r27-jiaotai-source-delta.json' with {type:'json'};

// Portable historical combined R26 snapshot. Bind every current dependency,
// then restore only two exact source hunks in memory. No Git, sibling checkout,
// network, live-builder fallback, runtime writes or geometry exclusions.
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=path=>restorePreR28Source(path,fs.readFileSync(new URL('../../'+path,import.meta.url)));
for(const path of Object.keys(source.addedFiles))assertR27AddedSource(path,read(path));
for(const path of Object.keys(source.retainedFiles))assertR27RetainedSource(path,read(path));
const path='src/scene/PalaceBuilder.js',url=new URL('../../'+path,import.meta.url);
const bytes=restorePreR27Source(path,read(path));
assert.equal(sha(bytes),source.files[path].baselineSHA256,'exact frozen combined R26 PalaceBuilder');
const text=bytes.toString().replace(/from '([^']+)'/g,(_,specifier)=>
  `from '${historicalR27Dependency(specifier,url)}'`);
export const {PalaceBuilder:HistoricalR26CombinedPalaceBuilder}=await import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'));
