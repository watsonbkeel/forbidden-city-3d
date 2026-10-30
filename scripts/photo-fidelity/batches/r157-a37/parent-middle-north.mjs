// Exact pre-refinement facade for isolated parent/candidate comparisons.
import{registerHooks}from'node:module';import{execFileSync}from'node:child_process';
const file='src/scene/palace/special/MiddleAxisFacades.js',url=new URL('../../../../'+file,import.meta.url).href,source=execFileSync('git',['show','f88dc035:'+file],{encoding:'utf8'});registerHooks({load(u,c,next){return u===url?{format:'module',source,shortCircuit:true}:next(u,c)}});
