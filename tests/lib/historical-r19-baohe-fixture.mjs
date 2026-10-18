import fs from 'node:fs';
import {assertR21AddedSource} from './r21-baohe-retention.mjs';
import {restorePreR20Source,assertR20AddedSource} from './r20-baohe-retention.mjs';

// Explicit frozen R19 historical fixture. Exact R21 then R20 builder deltas
// are restored in memory; the live world helper still imports current product.
assertR21AddedSource('src/scene/palace/BaoheThroneScreen.js',fs.readFileSync(new URL('../../src/scene/palace/BaoheThroneScreen.js',import.meta.url)));
const added='src/scene/palace/BaoheInteriorFrame.js';
assertR20AddedSource(added,fs.readFileSync(new URL('../../'+added,import.meta.url)));
function historicalModule(path,overrides={}){
  const url=new URL('../../'+path,import.meta.url);
  const bytes=restorePreR20Source(path,fs.readFileSync(url));
  const source=bytes.toString().replace(/from '([^']+)'/g,(_,specifier)=>
    `from '${overrides[specifier]??(specifier==='three'?import.meta.resolve('three'):new URL(specifier,url).href)}'`);
  return 'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
}
export const historicalR19RoofModule=historicalModule('src/scene/RoofBuilder.js');
export const {PalaceBuilder:HistoricalR19PalaceBuilder}=await import(historicalModule(
  'src/scene/PalaceBuilder.js',{'./RoofBuilder.js':historicalR19RoofModule}));
