import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {sourceFingerprint} from '../../build-identity.mjs';
import {readIdentity,readInputs,readRegular,sha256,isMain} from '../bilingual-ui/common.mjs';
export const BASE='e1287435158ee5aa98e0a1a370cae97021a5c385',PUBLIC='fcbec82d237434477750dc61e7d21dc015d18bdc',TREE='5915305bd6fd67230731cef35739cb04e436313c',BRANCH='refs/heads/dev/r165-bilingual-scroll-diagnostic-20261106';
export const DOCS='docs/current-state/r165-scroll-diagnostic/',MANIFEST=DOCS+'INPUTS.json';
export function assertAddedOnly(changes,paths){assert.equal(new Set(paths).size,paths.length);assert.deepEqual(changes.sort(),paths.map(p=>'A\t'+p).sort());for(const p of paths)assert.ok(p.startsWith('scripts/ci/scroll-diagnostic/')||p.startsWith(DOCS)||p==='.github/workflows/r165-scroll-diagnostic.yml');}
export function verifySource({root=process.cwd(),env=process.env}={}){
 const identity=readIdentity(env);assert.equal(identity.ref,BRANCH);assert.equal(env.GITHUB_EVENT_NAME,'push');assert.equal(process.version,'v24.22.1');assert.equal(root,path.resolve(env.GITHUB_WORKSPACE));
 const git=(...args)=>execFileSync('git',args,{cwd:root,env:{...env,GIT_OPTIONAL_LOCKS:'0'},encoding:'utf8',maxBuffer:8*1024*1024}).trim();
 assert.equal(git('rev-parse','HEAD'),identity.eventSha);assert.equal(git('status','--porcelain','--untracked-files=all'),'');assert.equal(git('rev-list','--parents','-n','1','HEAD'),identity.eventSha+' '+BASE);assert.equal(git('rev-parse',BASE+'^{tree}'),'5361deb617fa973bda3f723d5aad5f74b00decd9');
 assert.equal(git('cat-file','-t',PUBLIC),'commit');assert.equal(git('rev-parse',PUBLIC+'^{tree}'),TREE);assert.equal(git('rev-list','--parents','-n','1',PUBLIC),PUBLIC+' '+BASE);
 const historical=JSON.parse(readRegular(path.join(root,'docs/current-state/r165-cumulative-373-bilingual/SOURCE-TESTS-FREEZE.json'))).requiredGitBaselines;assert.equal(historical.length,33);for(const ref of historical){assert.equal(git('cat-file','-t',ref),'commit');git('merge-base','--is-ancestor',ref,BASE);}
 const added=JSON.parse(readRegular(path.join(root,DOCS+'PATHS.json')));assertAddedOnly(git('diff','--no-renames','--name-status',PUBLIC,'HEAD').split('\n'),added);
 for(const p of added)assert.equal(git('ls-tree',PUBLIC,'--',p),'');
 const inputs=readInputs(root,path.join(root,MANIFEST));const oldInputs=JSON.parse(readRegular(path.join(root,'docs/current-state/r165-cumulative-373-bilingual/INPUTS.json')));const expectedPaths=[...new Set([...oldInputs.files.map(r=>r.path),...git('diff','--name-only',BASE,PUBLIC).split('\n'),...added.filter(p=>p!==MANIFEST)])].sort();assert.deepEqual(inputs.files.map(r=>r.path).sort(),expectedPaths);
 // The manifest is bound to the clean event Git object and separately hashed in
 // both source snapshots. Every other diagnostic file is in its hash inventory.
 assert.equal(git('hash-object',MANIFEST),git('rev-parse','HEAD:'+MANIFEST));
 assert.equal(sourceFingerprint(root),'f233ab1afa2cbab7bb627f40f3373461e5cc1a1422dd328bf8dba97c69ca09e1');
 const runtime=JSON.parse(readRegular(path.join(root,'docs/current-state/r165-cumulative-373-bilingual/RUNTIME-INPUTS.json')));assert.equal(runtime.inputs.length,993);assert.equal(runtime.bytes,48913291);for(const r of runtime.inputs){const x=inputs.files.find(f=>f.path===r.path);assert.deepEqual(x,r);}
 const key=JSON.parse(readRegular(path.join(root,DOCS+'KEY-INPUTS.json')));assert.equal(key.length,7);for(const r of key)assert.deepEqual(inputs.files.find(f=>f.path===r.path),r);
 assert.equal(fs.existsSync(path.join(root,'dist')),false);
 return {schema:1,identity,diagnosticOnly:true,releaseAcceptance:false,publicProduct:PUBLIC,publicTree:TREE,productFilesChanged:0,runtimeFiles:993,inputs:inputs.files.length,inputsSHA256:inputs.sha256,addedPaths:added};
}
if(isMain(import.meta.url)){const result=verifySource();console.log(JSON.stringify(result));const dir=process.env.EVIDENCE_DIR;assert.ok(dir&&path.isAbsolute(dir));fs.writeFileSync(path.join(dir,'source-validation.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});}
