import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const original='ec50ea010340dc3b04f18ec052f36a05c3862702';
const reviewed='18ce5bec5a72953d0e8b562906e788c619f11fc0';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const oldBytes=fs.readFileSync(new URL('../fixtures/r163-central-stones-baseline.json',import.meta.url));
assert.equal(sha(oldBytes),'149757e48cebd01cedf33879445982935f2af854384bb87184964a45fd7d497a','original immutable baseline must not be rewritten');
const changedProductionFiles=execFileSync('git',['diff','--name-only',original,reviewed,'--','src','data'],{encoding:'utf8'}).trim().split('\n');
assert.deepEqual(changedProductionFiles,[
  'data/architecture/b-practical-stair-contacts.json','src/scene/PalaceBuilder.js',
  'src/scene/palace/TaiheFrontApproaches.js','src/scene/palace/special/TaiheFrontPorch.js',
]);
function capture(commit){return JSON.parse(execFileSync(process.execPath,[
  '--import','./tests/lib/r163-central-stone-reviewed-loader.mjs','./tests/lib/r163-central-stone-capture-world.mjs',
],{env:{...process.env,R163_REVIEWED_SOURCE_COMMIT:commit},encoding:'utf8',maxBuffer:1024*1024}));}
const originalSnapshot=capture(original);
assert.deepEqual(originalSnapshot,JSON.parse(oldBytes).snapshot,'historical replay must reproduce the original fixed baseline exactly');
const reviewedSnapshot=capture(reviewed);
const liveSnapshot=JSON.parse(execFileSync(process.execPath,['./tests/lib/r163-central-stone-capture-world.mjs'],{encoding:'utf8',maxBuffer:1024*1024}));
assert.deepEqual(liveSnapshot,reviewedSnapshot,'all cumulative differences outside the six central stone footprints must be exactly the reviewed Taihe version');
const sourceSHA256=Object.fromEntries(changedProductionFiles.filter(p=>p.startsWith('src/'))
  .map(p=>[p,sha(execFileSync('git',['show',`${reviewed}:${p}`]))]));
const result={basisCommit:reviewed,originalBasisCommit:original,
  originalFixtureSHA256:sha(oldBytes),changedProductionFiles,sourceSHA256,
  scope:'Full exact snapshot after only reviewed Taihe 18ce5bec changes; excludes the same six central stone footprints, with no additional regional or material exclusions.',
  originalSnapshot,snapshot:reviewedSnapshot};
fs.writeFileSync(new URL('../fixtures/r163-central-stones-reviewed-taihe.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({originalReproduced:true,cumulativeMatchesReviewedTaihe:true,...result},null,2));
