import {historicalR29Dependency} from './historical-r29-qianqing-fixture.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {r28Source,restorePreR28Source,assertR28AddedSource,assertR28RetainedSource} from './r28-jiaotai-central-retention.mjs';

// Portable frozen R27 snapshot. All three source integrations and three new
// modules are bound before restoring dependencies in memory. No runtime writes,
// Git, sibling checkout, network or live-builder fallback.
const root=new URL('../../',import.meta.url),read=path=>fs.readFileSync(new URL(path,root));
for(const path of Object.keys(r28Source.addedFiles))assertR28AddedSource(path,read(path));
for(const path of Object.keys(r28Source.retainedFiles))assertR28RetainedSource(path,read(path));
const modules=new Map();
function historicalModule(path){
  if(modules.has(path))return modules.get(path);
  assert.ok(Object.hasOwn(r28Source.files,path),'registered R28 integration');
  const bytes=restorePreR28Source(path,read(path)),url=new URL(path,root);
  const text=bytes.toString().replace(/from '([^']+)'/g,(_,specifier)=>`from '${historicalR27Dependency(specifier,url)}'`);
  const result='data:text/javascript;base64,'+Buffer.from(text).toString('base64');
  modules.set(path,result);return result;
}
export function historicalR27Dependency(specifier,url){
  if(specifier==='three')return import.meta.resolve('three');
  const target=new URL(specifier,url);
  for(const path of ['src/scene/RoofBuilder.js','src/scene/palace/special/SquareHalls.js'])if(target.href===new URL(path,root).href)return historicalModule(path);
  return historicalR29Dependency(specifier,url);
}
export const {PalaceBuilder:HistoricalR27PalaceBuilder}=await import(historicalModule('src/scene/PalaceBuilder.js'));
