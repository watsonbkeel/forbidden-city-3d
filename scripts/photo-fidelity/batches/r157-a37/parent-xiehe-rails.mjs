import {registerHooks} from 'node:module';import {execFileSync} from 'node:child_process';
const paths=['src/scene/palace/special/SideGate.js','src/controls/FirstPerson.js'];
const sources=new Map(paths.map(path=>[new URL('../../../../'+path,import.meta.url).href,execFileSync('git',['show','4d614c22:'+path],{encoding:'utf8'})]));registerHooks({load(u,c,next){return sources.has(u)?{format:'module',source:sources.get(u),shortCircuit:true}:next(u,c);}});
