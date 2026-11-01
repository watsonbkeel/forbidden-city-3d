import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
const path='src/scene/palace/special/SideGate.js';
const url=new URL('../../../../'+path,import.meta.url).href;
const source=execFileSync('git',['show','e14c61911844e7aa6ce7c0251e64fd0ad61e67f4:'+path],{encoding:'utf8'});
registerHooks({load(u,c,next){return u===url?{format:'module',source,shortCircuit:true}:next(u,c);}});
