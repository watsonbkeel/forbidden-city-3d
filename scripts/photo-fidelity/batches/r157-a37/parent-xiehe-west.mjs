import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
const path='src/scene/palace/special/SideGate.js';
const url=new URL('../../../../'+path,import.meta.url).href;
const source=execFileSync('git',['show','6ffd4ebc:'+path],{encoding:'utf8'});
registerHooks({load(u,c,next){return u===url?{format:'module',source,shortCircuit:true}:next(u,c);}});
