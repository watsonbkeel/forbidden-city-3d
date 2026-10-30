import {registerHooks} from 'node:module';import {execFileSync} from 'node:child_process';
const path='src/scene/palace/special/RemainingOuterHalls.js',url=new URL('../../../'+path,import.meta.url).href,source=execFileSync('git',['show','608efeae08ced76167f205e545bd07805b8bcec1:'+path],{encoding:'utf8'});
registerHooks({load(u,c,next){return u===url?{format:'module',source,shortCircuit:true}:next(u,c);}});
