import {registerHooks} from 'node:module';import {execFileSync} from 'node:child_process';
const source=execFileSync('git',['show','e7ff5d21a5eb0af561dea3a338571ee9c878b446:src/scene/palace/special/RemainingNingshouHalls.js'],{encoding:'utf8'});
registerHooks({load(url,ctx,next){const r=next(url,ctx);return url.endsWith('/src/scene/palace/special/RemainingNingshouHalls.js')?{...r,source}:r;}});
