import {registerHooks} from 'node:module';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../..',import.meta.url)),paths=['src/scene/palace/TaihemenObservedApproach.js','src/scene/palace/TaihemenObservedSolids.js','src/scene/palace/TaihemenStairContact.js'];
const sources=new Map(paths.map(p=>[new URL(p,new URL('../..',import.meta.url)).href,execFileSync('git',['show','c376ef094e0377ecee183a31252d3eadb95c54a2:'+p],{cwd:root,encoding:'utf8'})]));
registerHooks({load(url,context,next){return sources.has(url)?{format:'module',source:sources.get(url),shortCircuit:true}:next(url,context)}});
