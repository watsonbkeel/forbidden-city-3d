import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import {restorePreR19Source,assertR19AddedSource} from './r19-baohe-retention.mjs';
import {historicalR19RoofModule} from './historical-r19-baohe-fixture.mjs';

// Explicit historical fixture: never used by the application or current R21
// acceptance. Reverse exact R21, R20, then R19 bytes to the frozen R18 builder;
// preserve module import targets, without writing a historical file into src.
const path='src/scene/PalaceBuilder.js',url=new URL('../../'+path,import.meta.url);
const added='src/scene/palace/BaoheDepthGrid.js';
assertR19AddedSource(added,fs.readFileSync(new URL('../../'+added,import.meta.url)));
const bytes=restorePreR19Source(path,fs.readFileSync(url));
const module=bytes.toString().replace(/from '([^']+)'/g,(_,specifier)=>
  `from '${specifier==='./RoofBuilder.js'?historicalR19RoofModule:specifier==='three'?import.meta.resolve('three'):new URL(specifier,url).href}'`);
export const {PalaceBuilder:HistoricalR18PalaceBuilder}=await import('data:text/javascript;base64,'+Buffer.from(module).toString('base64'));

// Retain the actual historical full-world walk checks without changing the live
// world helper or its existing source guards. Exact in-memory replacements
// relocate the module root/imports and select the historical PalaceBuilder.
const WORLD_SHA256 = 'b2d8962b16a94bd67eb2fc8d8478fabc9666478183d646b74753e8a82b6c060f';
let historicalWorld;
export async function buildHistoricalR18World(options={}){
  if(!historicalWorld){
    const worldURL=new URL('./world.mjs',import.meta.url);
    let source=fs.readFileSync(worldURL,'utf8');
    assert.equal(createHash('sha256').update(source).digest('hex'),WORLD_SHA256,'exact unchanged world helper for historical R18 fixture');
    const replacements=[
      ["const src = p => import(path.join(ROOT, 'src', p));",`const src = p => import(new URL(p,'${new URL('../../src/',worldURL).href}').href);`],
      ["import('three')",`import('${import.meta.resolve('three')}')`],
      ["const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');",`const ROOT = ${JSON.stringify(fileURLToPath(new URL('../../',worldURL)))};`],
      ["const { PalaceBuilder } = await src('scene/PalaceBuilder.js');",`const {HistoricalR18PalaceBuilder: PalaceBuilder} = await import('${import.meta.url}');`],
    ];
    for(const [before,after]of replacements){assert.equal(source.split(before).length,2);source=source.replace(before,after);}
    source=source.replace(/from '([^']+)'/g,(_,specifier)=>`from '${specifier.startsWith('.')?new URL(specifier,worldURL).href:specifier}'`);
    historicalWorld=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
  }
  return historicalWorld.buildWorld(options);
}
