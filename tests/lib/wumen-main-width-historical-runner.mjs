// Retain old assertions against the exact width predecessor. Fail closed if any
// other production source changes: do NOT silently create a mixed old/new parent.
import fs from 'node:fs';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=new URL('../../',import.meta.url),pin=JSON.parse(fs.readFileSync(new URL('../fixtures/r157-wumen-main-width/historical-contracts.json',import.meta.url))),old=JSON.parse(fs.readFileSync(new URL('../fixtures/r157-wumen-main-width/before-411214.json',import.meta.url))),sha=b=>createHash('sha256').update(b).digest('hex');
export function runWidthPredecessor(url){
 const name=fileURLToPath(url).split('/').at(-1),contract=pin.contracts[name];assert.ok(contract,'allowlisted original contract');assert.equal(url.href,new URL('../photo-fidelity/batches/'+name,import.meta.url).href);assert.equal(sha(fs.readFileSync(url)),contract.sha256,'old assertions unchanged');
 const bytes=fs.readFileSync(new URL(pin.fullSourceManifest,root));assert.equal(sha(bytes),pin.fullSourceManifestSha256);const sources=JSON.parse(bytes);assert.equal(Object.keys(sources).length,590);
 assert.deepEqual(Object.keys(old.sourceHashes).sort(),['src/scene/palace/special/GateTowerMeasurements.js','src/scene/palace/special/GateTowerProfiles.js','src/scene/palace/special/WumenMainGrid.js']);
 for(const [p,h] of Object.entries(old.sourceHashes))assert.equal(h,sources[p],'override source identity must equal the independent full source freeze');
 const actual=[];function walk(dir){for(const entry of fs.readdirSync(new URL(dir+'/',root),{withFileTypes:true})){const p=dir+'/'+entry.name;if(entry.isDirectory())walk(p);else {assert.ok(entry.isFile(),'no unreviewed source symlink');actual.push(p);}}}walk('src');walk('data');assert.deepEqual(actual.sort(),Object.keys(sources).sort(),'exact source path set, no hidden added production files');
 for(const [p,h] of Object.entries(sources))if(!(p in old.sourceHashes))assert.equal(sha(fs.readFileSync(new URL(p,root))),h,'non-overridden production closure drift '+p);
 const env={...process.env};delete env.NODE_TEST_CONTEXT;
 const child=spawnSync(process.execPath,['--import',fileURLToPath(new URL('./wumen-main-width-baseline-loader.mjs',import.meta.url)),'--test','--test-reporter=tap',fileURLToPath(url)],{cwd:fileURLToPath(root),env,encoding:'utf8',timeout:60000,maxBuffer:4*1024*1024});
 assert.equal(child.error,undefined);assert.equal(child.signal,null);assert.equal(child.status,0,child.stdout+'\n'+child.stderr);assert.match(child.stdout,/^ok 1 - /m);assert.match(child.stdout,new RegExp('^# tests '+contract.tests+'$','m'));assert.match(child.stdout,new RegExp('^# pass '+contract.tests+'$','m'));assert.match(child.stdout,/^# fail 0$/m);assert.match(child.stdout,/^# skipped 0$/m);assert.match(child.stdout,/^# cancelled 0$/m);
 return {originalTests:contract.tests,baseline:pin.baseline};
}
