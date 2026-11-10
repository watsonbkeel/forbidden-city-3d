import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';

const source=fileURLToPath(new URL('../../',import.meta.url));
const files=['src/scene/zones/ZoneBase.js','src/scene/palace/kit.js','src/scene/Environment.js','src/utils/Collision.js','src/controls/FirstPerson.js','src/utils/MergeUtils.js','src/utils/GeometryUV.js','src/config/constants.js','src/scene/Layout.js','tests/lib/r91-controller-clock.mjs','tests/lib/physical-waypoints.mjs','tests/lib/inner-palace-fixture.mjs','tests/lib/r48-real-texture-library.mjs','data/zones/outer-west.json','package.json','package-lock.json'];
const allowed=['src/scene/zones/ZoneBase.js','src/scene/palace/kit.js','src/scene/Environment.js','src/utils/Collision.js','src/controls/FirstPerson.js'];
let temporary,root;
before(()=>{
 const parent=process.env.XIANAN_PORTABILITY_TEMP_ROOT??os.tmpdir();fs.mkdirSync(parent,{recursive:true});temporary=fs.mkdtempSync(path.join(parent,'single-checkout-'));root=path.join(temporary,'repo');fs.mkdirSync(root);
 const plan=JSON.parse(fs.readFileSync(new URL('./portability-inputs.json',import.meta.url)));assert.ok(plan.inputBytes<=6*1024*1024,'bounded read-only input closure');let bytes=0;
 for(const [rel,entry] of Object.entries(plan.files)){assert.ok(!rel.includes('..')&&!path.isAbsolute(rel)&&!rel.startsWith('node_modules/'));const data=fs.readFileSync(path.join(source,rel));assert.equal(data.length,entry.bytes,rel+' staging bytes');assert.equal(crypto.createHash('sha256').update(data).digest('hex'),entry.sha256,rel+' staging hash');const target=path.join(root,rel);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);bytes+=data.length;}
 assert.equal(bytes,plan.inputBytes);fs.writeFileSync(path.join(temporary,'mutation-budget.json'),JSON.stringify({bytes:0}));
 fs.symlinkSync(fs.realpathSync(path.join(source,'node_modules')),path.join(root,'node_modules'),'dir');
 assert.equal(fs.existsSync(path.join(root,'.git')),false);
 assert.equal(fs.existsSync(path.join(temporary,'r186-ci-diagnostics-rev2-20261109')),false);
});
after(()=>{if(temporary)fs.rmSync(temporary,{recursive:true,force:true})});
function probe(body,evidence){
 const env={...process.env,GIT_CEILING_DIRECTORIES:temporary};delete env.XIANAN_EVIDENCE_DIR;if(evidence)env.XIANAN_EVIDENCE_DIR=evidence;
 const fixture=pathToFileURL(path.join(root,'tests/xianan-contact/fixture.mjs')).href;
 const code=`import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';const root=${JSON.stringify(root)},fixture=${JSON.stringify(fixture)},budget=${JSON.stringify(path.join(temporary,'mutation-budget.json'))};function accountWrite(bytes){const v=JSON.parse(fs.readFileSync(budget));v.bytes+=bytes;if(v.bytes>1024*1024)throw Error('Temporary mutation budget exceeded');fs.writeFileSync(budget,JSON.stringify(v))}try{const value=await(async()=>{${body}})();process.stdout.write(JSON.stringify({ok:true,value}));}catch(e){process.stdout.write(JSON.stringify({ok:false,error:{name:e.name,code:e.code??null,message:e.message}}));}`;
 const child=spawnSync(process.execPath,['--max-old-space-size=256','--max-semi-space-size=16','--input-type=module','-e',code],{cwd:root,env,encoding:'utf8',maxBuffer:128*1024,timeout:10000});
 assert.equal(child.error?.message??null,null,'bounded portability probe must complete');assert.equal(child.status,0,'probe subprocess exit');return JSON.parse(child.stdout);
}
const good=(r,label)=>assert.equal(r.ok,true,label+': '+JSON.stringify(r.error??null));

test('portability: isolated single checkout builds one authentic gate without sibling baseline or Git',()=>{
 const r=probe("const m=await import(fixture),f=m.makeFixture();try{return {meshes:f.identity.sourceGateMeshes,boxes:f.finishedBoxes.length,width:f.width}}finally{f.dispose()}");
 good(r,'standalone fixture');assert.deepEqual(r.value,{meshes:58,boxes:5,width:24.1});
});
test('portability: diagnostic default remains within repository temporary directory',()=>{
 const r=probe("const m=await import(fixture);m.save('portability-default.json',{only:'temporary'});return fileURLToPath(m.out)");good(r,'default diagnostic write');
 const expected=path.join(root,'.tmp/xianan-contact');assert.equal(path.resolve(r.value),expected);assert.equal(fs.existsSync(path.join(expected,'portability-default.json')),true);
});
test('portability: explicit evidence override controls shared diagnostic writer',()=>{
 const evidence=path.join(temporary,'explicit-evidence'),r=probe("const m=await import(fixture);m.save('portability-explicit.json',{only:'explicit'});return fileURLToPath(m.out)",evidence);good(r,'explicit diagnostic write');
 assert.equal(path.resolve(r.value),evidence);assert.equal(fs.existsSync(path.join(evidence,'portability-explicit.json')),true);assert.equal(fs.existsSync(path.join(root,'.tmp/xianan-contact/portability-explicit.json')),false);
});
test('portability: every protected byte mutation rejects while allowed inputs retain pinned baseline hashes',()=>{
 const r=probe(`const m=await import(fixture),original=m.verifyInputs(),files=${JSON.stringify(files)},allowed=${JSON.stringify(allowed)},rejected=[];for(const rel of files.filter(x=>!allowed.includes(x))){const target=path.join(root,rel),bytes=fs.readFileSync(target);try{accountWrite(bytes.length+1);fs.appendFileSync(target,'\\n');let error;try{m.verifyInputs()}catch(e){error=e}if(!error||!error.message.includes(rel))throw Error('Protected input not precisely rejected: '+rel);rejected.push(rel)}finally{fs.writeFileSync(target,bytes)}}for(const rel of allowed){const target=path.join(root,rel),bytes=fs.readFileSync(target);try{accountWrite(bytes.length+1);fs.appendFileSync(target,'\\n');const changed=m.verifyInputs()[rel];if(changed.baseline!==original[rel].baseline||changed.candidate===original[rel].candidate)throw Error('Allowed input lost baseline/candidate distinction: '+rel)}finally{fs.writeFileSync(target,bytes)}}return {rejected,allowed,files:Object.keys(original)};`);
 good(r,'standalone integrity guards');assert.deepEqual(r.value.rejected,files.filter(x=>!allowed.includes(x)));assert.deepEqual(r.value.allowed,allowed);assert.deepEqual(r.value.files,files);
});
test('portability: fixed baseline manifest is independently pinned and tampering is rejected',()=>{
 const target=path.join(root,'tests/xianan-contact/baseline-inputs.json');assert.equal(fs.existsSync(target),true,'fixed baseline manifest must ship with checkout');
 const bytes=fs.readFileSync(target),manifest=JSON.parse(bytes);assert.equal(manifest.commit,'5d30c8366c8430f27cb9664b2b64f30e64e87cca');assert.equal(manifest.tree,'0f75720e7b5e36235105e691fda8e51930c7fa8f');assert.deepEqual(Object.keys(manifest.files),files);
 try{manifest.files['src/utils/MergeUtils.js']='0'.repeat(64);const budget=path.join(temporary,'mutation-budget.json'),v=JSON.parse(fs.readFileSync(budget));v.bytes+=bytes.length+Buffer.byteLength(JSON.stringify(manifest));assert.ok(v.bytes<=1024*1024);fs.writeFileSync(budget,JSON.stringify(v));fs.writeFileSync(target,JSON.stringify(manifest));const r=probe('const m=await import(fixture);return m.verifyInputs()');assert.equal(r.ok,false,'edited manifest must not redefine baseline');assert.equal(r.error.code,'XIANAN_BASELINE_PIN_MISMATCH')}finally{fs.writeFileSync(target,bytes)}
});
test('portability: missing exact Git history explicitly prevents frozen-flow comparison',()=>{
 const loader=pathToFileURL(path.join(root,'tests/xianan-contact/frozen-flow-loader.mjs')).href,r=probe(`const m=await import(${JSON.stringify(loader)});await m.loadFrozenZoneBase();return 'unexpected fallback'`);
 assert.equal(r.ok,false,'no-history checkout cannot impersonate frozen comparison');assert.equal(r.error.code,'XIANAN_FROZEN_BASELINE_UNAVAILABLE');assert.ok(r.error.message.includes('5d30c8366c8430f27cb9664b2b64f30e64e87cca'));
});
