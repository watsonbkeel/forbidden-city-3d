import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {restorePreR25Source,assertR25AddedSource,assertR25RetainedSource} from './r25-nameboard-retention.mjs';
import source from '../fixtures/r25-nameboard-source-delta.json' with {type:'json'};

// Portable frozen R24 historical fixture only. Bind all current added/retained
// modules and restore the complete builder in memory. No Git, sibling checkout,
// network, current-builder fallback, runtime writes or geometry exclusions.
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=path=>fs.readFileSync(new URL('../../'+path,import.meta.url));
for(const path of Object.keys(source.addedFiles))assertR25AddedSource(path,read(path));
for(const path of Object.keys(source.retainedFiles))assertR25RetainedSource(path,read(path));
const path='src/scene/PalaceBuilder.js',url=new URL('../../'+path,import.meta.url);
const bytes=restorePreR25Source(path,read(path));
assert.equal(sha(bytes),source.files[path].baselineSHA256,'exact frozen R24 PalaceBuilder');
const text=bytes.toString().replace(/from '([^']+)'/g,(_,specifier)=>
  `from '${specifier==='three'?import.meta.resolve('three'):new URL(specifier,url).href}'`);
export const {PalaceBuilder:HistoricalR24PalaceBuilder}=await import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'));
