// Read-only actual safe-parent module replay; no working-tree source replacement.
import{registerHooks}from'node:module';import{execFileSync}from'node:child_process';
const path='src/scene/palace/special/EastResidentialFacades.js',url=new URL('../../../'+path,import.meta.url).href,source=execFileSync('git',['show','9f2d0c08c399a33e115a11acdb84782b5409e86f:'+path],{encoding:'utf8'});registerHooks({load(u,context,next){return u===url?{format:'module',source,shortCircuit:true}:next(u,context)}});
