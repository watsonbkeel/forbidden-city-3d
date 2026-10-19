import {historicalR27Dependency} from './historical-r27-jiaotai-fixture.mjs';
import {restorePreR28Source} from './r28-jiaotai-central-retention.mjs';
// Bind exact R24 added and retained modules before restoring older builders.
import './historical-r23-baohe-fixture.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {restorePreR23Source,assertR23AddedSource,assertR23RetainedSource} from './r23-baohe-retention.mjs';
import source from '../fixtures/r23-baohe-source-delta.json' with {type:'json'};

// Frozen R22 historical fixture only. Both modified modules are independently
// restored from exact complete R23 bytes; the builder imports the restored door
// module, never the live R23 front-door implementation. No writes into src.
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=path=>restorePreR28Source(path,fs.readFileSync(new URL('../../'+path,import.meta.url)));
for(const path of Object.keys(source.addedFiles))assertR23AddedSource(path,read(path));
for(const path of Object.keys(source.retainedFiles))assertR23RetainedSource(path,read(path));
function historicalModule(path,overrides={}){
  const url=new URL('../../'+path,import.meta.url);
  const bytes=restorePreR23Source(path,read(path));
  assert.equal(sha(bytes),source.files[path].baselineSHA256,`exact frozen R22 module: ${path}`);
  const text=bytes.toString().replace(/from '([^']+)'/g,(_,specifier)=>
    `from '${overrides[specifier]??(historicalR27Dependency(specifier,url))}'`);
  return 'data:text/javascript;base64,'+Buffer.from(text).toString('base64');
}
export const historicalR22FrontDoorsModule=historicalModule('src/scene/palace/BaoheFrontDoors.js');
export const {PalaceBuilder:HistoricalR22PalaceBuilder}=await import(historicalModule(
  'src/scene/PalaceBuilder.js',{'./palace/BaoheFrontDoors.js':historicalR22FrontDoorsModule}));
