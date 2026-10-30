// Actual safe-parent production replay across nested test processes. No working-tree replacement.
import{registerHooks}from'node:module';import{execFileSync}from'node:child_process';
const base='f320ad5cd39aa57320e9d7774a2e32190a495a10',sources=new Map(['src/scene/palace/special/RemainingResidentialHalls.js','src/scene/zones/ZoneBase.js'].map(path=>[new URL('../../../'+path,import.meta.url).href,execFileSync('git',['show',base+':'+path],{encoding:'utf8'})]));registerHooks({load(u,context,next){return sources.has(u)?{format:'module',source:sources.get(u),shortCircuit:true}:next(u,context)}});
