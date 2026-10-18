import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {restorePreR22Source,assertR22AddedSource,assertR22RetainedSource} from './r22-baohe-retention.mjs';
import source from '../fixtures/r22-baohe-source-delta.json' with {type:'json'};

// Explicit frozen R21 historical fixture, never current R22 acceptance. Reverse
// the exact three R22 builder hunks in memory and independently bind both new
// modules plus retained roof/frame/column/screen dependencies. No src writes.
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=path=>fs.readFileSync(new URL('../../'+path,import.meta.url));
for(const path of Object.keys(source.addedFiles))assertR22AddedSource(path,read(path));
for(const path of Object.keys(source.retainedFiles))assertR22RetainedSource(path,read(path));
const path='src/scene/PalaceBuilder.js',url=new URL('../../'+path,import.meta.url);
const bytes=restorePreR22Source(path,read(path));
assert.equal(sha(bytes),source.files[path].baselineSHA256,'exact frozen R21 PalaceBuilder');
const text=bytes.toString().replace(/from '([^']+)'/g,(_,specifier)=>
  `from '${specifier==='three'?import.meta.resolve('three'):new URL(specifier,url).href}'`);
export const {PalaceBuilder:HistoricalR21PalaceBuilder}=await import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'));
