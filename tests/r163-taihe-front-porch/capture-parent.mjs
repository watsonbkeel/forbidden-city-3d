// Reproduce the immutable component baseline from the exact pre-fix builder.
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {retainedHall} from './retention.mjs';
const base='ec50ea010340dc3b04f18ec052f36a05c3862702';
const url=new URL('../../src/scene/PalaceBuilder.js',import.meta.url);
const source=execFileSync('git',['show',`${base}:src/scene/PalaceBuilder.js`],{encoding:'utf8'}).replace(/from '([^']+)'/g,(_,s)=>`from '${s==='three'?import.meta.resolve('three'):new URL(s,url).href}'`);
const {PalaceBuilder}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const result={base,scope:'Exact retained hall meshes/materials/columns/solids at common component fixture floor9.9375; excludes only Taihe front door/header/threshold and front eave/header beams, plus its two moved front side-screen solids.',halls:Object.fromEntries(['太和殿','保和殿'].map(n=>[n,retainedHall(PalaceBuilder,n)]))};
writeFileSync(new URL('./retained-ec50ea01.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
