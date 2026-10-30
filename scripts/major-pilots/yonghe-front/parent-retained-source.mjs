// Read-only actual safe-parent module replay; no working-tree source replacement.
import{registerHooks}from'node:module';import{execFileSync}from'node:child_process';
const path='src/scene/palace/special/EastResidentialFacades.js',url=new URL('../../../'+path,import.meta.url).href,source=execFileSync('git',['show','ddb9bc8781366823e0bf12b7d5d8d5dced26b1b0:'+path],{encoding:'utf8'});registerHooks({load(u,context,next){return u===url?{format:'module',source,shortCircuit:true}:next(u,context)}});
