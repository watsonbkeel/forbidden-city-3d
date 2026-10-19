import assert from 'node:assert/strict';
import fs from 'node:fs';
import {r30Source,restorePreR30Source,assertR30AddedSource,assertR30RetainedSource} from './r30-qianqing-passage-retention.mjs';

// Historical R29 assertions only. Restore both complete registered sources in
// memory after binding every current product dependency. Current passages are
// verified independently by r30-qianqing-passages.test.mjs, never this builder.
const root=new URL('../../',import.meta.url),read=path=>fs.readFileSync(new URL(path,root));
for(const path of Object.keys(r30Source.addedFiles))assertR30AddedSource(path,read(path));
for(const path of Object.keys(r30Source.retainedFiles))assertR30RetainedSource(path,read(path));
for(const path of Object.keys(r30Source.files))restorePreR30Source(path,read(path));
const modules=new Map();
function historicalModule(path){
  if(modules.has(path))return modules.get(path);
  assert.ok(Object.hasOwn(r30Source.files,path),'registered R30 integration');
  const bytes=restorePreR30Source(path,read(path)),url=new URL(path,root);
  const text=bytes.toString().replace(/from '([^']+)'/g,(_,specifier)=>`from '${historicalR29Dependency(specifier,url)}'`);
  const result='data:text/javascript;base64,'+Buffer.from(text).toString('base64');
  modules.set(path,result);return result;
}
export function historicalR29Dependency(specifier,url){
  if(specifier==='three')return import.meta.resolve('three');
  const target=new URL(specifier,url);
  for(const path of Object.keys(r30Source.files))if(target.href===new URL(path,root).href)return historicalModule(path);
  return target.href;
}
export const {PalaceBuilder:HistoricalR29PalaceBuilder}=await import(historicalModule('src/scene/PalaceBuilder.js'));
export const HistoricalR29FrontEnclosure=await import(historicalModule('src/scene/palace/QianqingFrontEnclosure.js'));
