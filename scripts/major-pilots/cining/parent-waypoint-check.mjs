import {registerHooks} from 'node:module';import {execFileSync} from 'node:child_process';import fs from 'node:fs';
const parent=execFileSync('git',['show','f0c52da3:src/scene/palace/special/RemainingOuterHalls.js'],{encoding:'utf8'});
// Reproduce the original sample-only arrival oracle, before the target-plane
// crossing check. Production controller/physics remain byte-for-byte parent.
registerHooks({load(url,context,next){if(url.endsWith('/src/scene/palace/special/RemainingOuterHalls.js'))return{format:'module',source:parent,shortCircuit:true};if(url.endsWith('/tests/major-pilots/cining/motion.test.mjs')){const source=fs.readFileSync(new URL(url),'utf8').replaceAll('if(best<.45||crossed)break;','if(best<.45)break;').replaceAll('assert.ok(best<.45||crossed,','assert.ok(best<.45,');return{format:'module',source,shortCircuit:true};}return next(url,context)}});
