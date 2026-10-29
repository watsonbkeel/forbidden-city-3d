// Read-only baseline: both test text and SideGate loaded from the actual parent.
import {registerHooks} from 'node:module';import {execFileSync} from 'node:child_process';
const paths=['src/scene/palace/special/SideGate.js','tests/current-state/side-gate-render-geometry.test.mjs'];
const sources=new Map(paths.map(path=>[new URL('../../../'+path,import.meta.url).href,path]));
registerHooks({load(u,context,next){if(sources.has(u))return{format:'module',shortCircuit:true,source:execFileSync('git',['show','3951b93:'+sources.get(u)],{encoding:'utf8'})};return next(u,context)}});
