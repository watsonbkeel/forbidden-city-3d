// QA only: rehydrate the one exact 458cea parent module; never mutate source.
import{registerHooks}from'node:module';import{execFileSync}from'node:child_process';
const target=new URL('../../src/scene/palace/special/WenhuaGateApproaches.js',import.meta.url).href,base=execFileSync('git',['show','458cea434b60fa5e9b3a31fa84c2d90ba1ab4c36:src/scene/palace/special/WenhuaGateApproaches.js'],{cwd:new URL('../..',import.meta.url),encoding:'utf8'});
registerHooks({load(url,context,next){return url===target?{format:'module',source:base,shortCircuit:true}:next(url,context)}});
