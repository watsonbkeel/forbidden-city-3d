import {historicalR27Dependency} from './historical-r27-jiaotai-fixture.mjs';
import {restorePreR28Source} from './r28-jiaotai-central-retention.mjs';
// Bind the new R22 modules before restoring older historical builders.
import './historical-r21-baohe-fixture.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import {restorePreR21Source,assertR21AddedSource} from './r21-baohe-retention.mjs';
import {assertR20AddedSource} from './r20-baohe-retention.mjs';
import source from '../fixtures/r20-baohe-source-delta.json' with {type:'json'};

// Explicit frozen R20 historical fixture, never current R22 acceptance. Reverse
// only exact registered R22 then R21 bytes in memory; independently bind the retained
// roof/frame and added R21 module. No historical source is written into src.
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=path=>restorePreR28Source(path,fs.readFileSync(new URL('../../'+path,import.meta.url)));
assertR21AddedSource('src/scene/palace/BaoheThroneScreen.js',read('src/scene/palace/BaoheThroneScreen.js'));
assertR20AddedSource('src/scene/palace/BaoheInteriorFrame.js',read('src/scene/palace/BaoheInteriorFrame.js'));
function historicalModule(path,overrides={}){
  const url=new URL('../../'+path,import.meta.url);
  const bytes=restorePreR21Source(path,read(path));
  assert.equal(sha(bytes),source.files[path].candidateSHA256,`exact frozen R20 builder: ${path}`);
  const text=bytes.toString().replace(/from '([^']+)'/g,(_,specifier)=>
    `from '${overrides[specifier]??(historicalR27Dependency(specifier,url))}'`);
  return 'data:text/javascript;base64,'+Buffer.from(text).toString('base64');
}
export const historicalR20RoofModule=historicalModule('src/scene/RoofBuilder.js');
export const {PalaceBuilder:HistoricalR20PalaceBuilder}=await import(historicalModule(
  'src/scene/PalaceBuilder.js',{'./RoofBuilder.js':historicalR20RoofModule}));
