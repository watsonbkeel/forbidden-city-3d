// Source admission and historical-view boundaries only, not full-host runtime.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const PATH='src/scene/palace/special/RemainingOuterHalls.js';
const host=fs.readFileSync(new URL('../../'+PATH,import.meta.url),'utf8');
const IMP="import {buildDafotangUpperCentralBand} from './DafotangUpperCentralBand.js';\n",CALL="  if(p.key==='dafotang')buildDafotangUpperCentralBand(c);\n",ANCHOR="  if(p.key==='dafotang')buildDafotangMainPlaque(c);\n";
const hash=s=>createHash('sha256').update(s).digest('hex');
const OLD='900a43f0a1caa2d7b76d8101df49795cbf38423acf0e8b5addd01ce5d467defc';
async function helper(){const url=new URL('./prior-host.mjs',import.meta.url);assert.ok(fs.existsSync(url),'R266_HISTORICAL_VIEW_NOT_IMPLEMENTED');return import(url);}
test('only the reviewed two host lines are added after main plaque and before roof',()=>{
 assert.equal(host.split(IMP).length,2,'R266_HOST_CALL_NOT_IMPLEMENTED');assert.equal(host.split(CALL).length,2);assert.ok(host.includes(ANCHOR+CALL+'  kit.roof(c.f,'));assert.equal(hash(host.replace(IMP,'').replace(CALL,'')),OLD);assert.equal((host.match(/buildDafotangUpperCentralBand\(c\)/g)||[]).length,1);
});
test('strict inverse yields exact historical host and never accepts old source as current',async()=>{
 const {priorUpperCentralBandHostSource:prior}=await helper();const old=prior(host,PATH);assert.equal(hash(old),OLD);assert.notEqual(old,host);assert.throws(()=>prior(old));assert.throws(()=>prior(host,'src/other.js'));assert.throws(()=>prior(undefined));
});
for(const[name,change]of[['unrelated byte',s=>s+'\n'],['missing import',s=>s.replace(IMP,'')],['duplicate import',s=>IMP+s],['missing call',s=>s.replace(CALL,'')],['duplicate call',s=>s.replace(CALL,CALL+CALL)],['wrong branch',s=>s.replace(CALL,CALL.replace("'dafotang'","'other'"))]])test('source admission rejects '+name,async()=>{const {priorUpperCentralBandHostSource:prior}=await helper();assert.throws(()=>prior(change(host)));});
test('legacy source consumers identify historical view and preserve original SHA contracts',async()=>{
 await helper();for(const file of['dafotang-main-plaque.test.mjs','dafotang-east-cabinets.test.mjs','dafotang-west-cabinet-height.test.mjs']){const text=fs.readFileSync(new URL('../current-state/'+file,import.meta.url),'utf8');assert.ok(text.includes('HISTORICAL_HOST_VIEW'),file);assert.ok(text.includes('priorUpperCentralBandHostSource'),file);}
 const plaque=fs.readFileSync(new URL('../current-state/dafotang-main-plaque.test.mjs',import.meta.url),'utf8');assert.ok(plaque.includes('f18e33a0f1b6b37c081a8d856444c4766db385f2fcb7109c6190589945025662'));
 const east=fs.readFileSync(new URL('../current-state/dafotang-east-cabinets.test.mjs',import.meta.url),'utf8');assert.ok(east.includes('204e253f9c48d88147112c8d1c4e43982ea9277be02395f5aa87b4124909579c'));
});
process.on('exit',()=>console.log('R266_INTEGRATION_RESOURCE '+JSON.stringify({scope:'SOURCE_ADMISSION_AND_HISTORICAL_VIEW_ONLY',usage:process.resourceUsage(),memory:process.memoryUsage(),limits:{oldMiB:128,semiMiB:8,seconds:30}})));
