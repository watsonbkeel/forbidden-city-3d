import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {restorePreR26FriezeSource,assertR26FriezeAddedSource,assertR26FriezeRetainedSource} from './r26-qianqing-frieze-retention.mjs';
import source from '../fixtures/r26-qianqing-frieze-source-delta.json' with {type:'json'};

// Portable historical windows-only R26 snapshot. No Git objects, sibling
// checkout, network, live-builder fallback, runtime writes or exclusions.
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=path=>fs.readFileSync(new URL('../../'+path,import.meta.url));
for(const path of Object.keys(source.addedFiles))assertR26FriezeAddedSource(path,read(path));
for(const path of Object.keys(source.retainedFiles))assertR26FriezeRetainedSource(path,read(path));
const path='src/scene/PalaceBuilder.js',url=new URL('../../'+path,import.meta.url);
const bytes=restorePreR26FriezeSource(path,read(path));
assert.equal(sha(bytes),source.files[path].baselineSHA256,'exact frozen windows-only R26 PalaceBuilder');
const text=bytes.toString().replace(/from '([^']+)'/g,(_,specifier)=>
  `from '${specifier==='three'?import.meta.resolve('three'):new URL(specifier,url).href}'`);
export const {PalaceBuilder:HistoricalR26WindowsPalaceBuilder}=await import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'));
