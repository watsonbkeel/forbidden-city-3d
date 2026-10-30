import {registerHooks} from 'node:module';import {execFileSync} from 'node:child_process';
const paths=['src/scene/PalaceBuilder.js','src/scene/palace/special/AxisFirewallProfiles.js','src/scene/palace/special/AxisFirewalls.js','src/scene/palace/special/TaiheEastWallDoor.js'];
const sources=new Map(paths.map(p=>[new URL('../../../../'+p,import.meta.url).href,execFileSync('git',['show','138952cd:'+p],{encoding:'utf8'})]));
registerHooks({load(u,c,next){return sources.has(u)?{format:'module',source:sources.get(u),shortCircuit:true}:next(u,c);}});
