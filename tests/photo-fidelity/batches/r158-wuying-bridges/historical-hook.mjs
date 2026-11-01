// Whole original 929e3467 src/data closure, not selected old/new module mixing.
process.env.R157_FROZEN_SOURCE_COMMIT='929e346745b7295ad1aae0caa581e8cdf22723ff';
await import('../../../lib/r157-committed-source-loader.mjs');
import {registerHooks} from 'node:module';import fs from 'node:fs';import {createHash} from 'node:crypto';
const root=new URL('../../../../',import.meta.url),waterURL=new URL('src/scene/palace/special/SouthWaterSystem.js',root);
const bytes=fs.readFileSync(new URL('../../../fixtures/r158-wuying-bridges/r156-parent-water.txt',import.meta.url));
const digest=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
if(digest!=='8662c8766e7ce402d055db6be0323a9fdef41bed')throw Error('Original e14c619 parent water bytes changed');
const source=bytes.toString().replace(/(from\s+['"])(\.[^'"]+)(['"])/g,(_,a,s,b)=>a+new URL(s,waterURL).href+b).replace("from 'three'","from '"+import.meta.resolve('three')+"'");
// Exact same water source selected by the original test's git-show helper.
// This QA-only acquisition hook lets replay work without that old Git object.
registerHooks({load(url,context,next){if(url===new URL('scripts/photo-fidelity/batches/r157-a37/parent-water.mjs',root).href)return {format:'module',source:`export const parentWater=await import(${JSON.stringify('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))});`,shortCircuit:true};return next(url,context);}});
