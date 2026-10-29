// Read-only actual safe-parent module replay; no working-tree source replacement.
import{registerHooks}from'node:module';import{execFileSync}from'node:child_process';
const path='src/scene/palace/special/RemainingResidentialHalls.js',url=new URL('../../../'+path,import.meta.url).href,source=execFileSync('git',['show','cb455649da623746ed59dc14032e66a0ba794ffb:'+path],{encoding:'utf8'});registerHooks({load(u,context,next){return u===url?{format:'module',source,shortCircuit:true}:next(u,context)}});
