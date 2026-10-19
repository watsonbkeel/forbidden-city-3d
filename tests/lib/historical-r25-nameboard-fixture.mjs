import {historicalR27Dependency} from './historical-r27-jiaotai-fixture.mjs';
import {restorePreR28Source} from './r28-jiaotai-central-retention.mjs';
// Bind the latest added/retained modules before restoring earlier history.
import './historical-r26-windows-fixture.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {restorePreR26Source,assertR26AddedSource,assertR26RetainedSource} from './r26-qianqing-retention.mjs';
import source from '../fixtures/r26-qianqing-source-delta.json' with {type:'json'};

// Portable frozen R25 historical fixture only. Bind all current added/retained
// modules and restore the complete builder in memory. No Git, sibling checkout,
// network, current-builder fallback, runtime writes or geometry exclusions.
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=path=>restorePreR28Source(path,fs.readFileSync(new URL('../../'+path,import.meta.url)));
for(const path of Object.keys(source.addedFiles))assertR26AddedSource(path,read(path));
for(const path of Object.keys(source.retainedFiles))assertR26RetainedSource(path,read(path));
const path='src/scene/PalaceBuilder.js',url=new URL('../../'+path,import.meta.url);
const bytes=restorePreR26Source(path,read(path));
assert.equal(sha(bytes),source.files[path].baselineSHA256,'exact frozen R25 PalaceBuilder');
const text=bytes.toString().replace(/from '([^']+)'/g,(_,specifier)=>
  `from '${historicalR27Dependency(specifier,url)}'`);
export const {PalaceBuilder:HistoricalR25PalaceBuilder}=await import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'));
