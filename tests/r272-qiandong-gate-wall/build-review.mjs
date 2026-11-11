// CI-only companion build. Never writes the retained production dist or its inputs.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {verifyBuildSource,sourceFingerprint} from '../../scripts/build-identity.mjs';
const sha=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
export function inventory(root){
 const rows=[];let total=0;
 function visit(relative=''){const p=path.join(root,relative),s=fs.lstatSync(p);assert.ok(!s.isSymbolicLink(),'no artifact symlink');if(s.isDirectory())for(const n of fs.readdirSync(p).sort())visit(relative?relative+'/'+n:n);else{assert.ok(s.isFile()&&s.size<=128*1024**2);total+=s.size;assert.ok(total<=256*1024**2&&rows.length<2000,'artifact inventory bounds');rows.push({path:relative,bytes:s.size,sha256:sha(p)});}}
 visit();return rows;
}
export function verifyPublic(root,distRows){const byPath=new Map(distRows.map(r=>[r.path,r]));for(const r of inventory(path.join(root,'public'))){const out=byPath.get(r.path);assert.deepEqual(out,r,'missing or changed public source asset '+r.path);}return true;}
function main(){
 assert.equal(process.env.GITHUB_ACTIONS,'true');assert.equal(process.env.CI,'true');
 const root=process.cwd(),e=process.env.EVIDENCE_DIR,temp=process.env.RUNNER_TEMP;assert.ok(path.isAbsolute(e)&&path.isAbsolute(temp)&&!e.startsWith(root+'/')&&!temp.startsWith(root+'/'));
 const identity=JSON.parse(fs.readFileSync(path.join(e,'checkout-identity.json'),'utf8'));assert.equal(identity.head,process.env.GITHUB_SHA);
 const terminal=JSON.parse(fs.readFileSync(path.join(e,'build-terminal.json'),'utf8'));assert.equal(terminal.status,'PASS');assert.equal(terminal.cleanup_complete,true);assert.equal(terminal.child_exit_code,0);assert.equal(terminal.identity.head,identity.head);
 const production=verifyBuildSource({root,expectedBase:'/forbidden-city-3d/'});assert.equal(production.sourceCommit,identity.head);assert.equal(production.sourceDirty,false);
 const ordinaryRows=inventory(path.join(root,'dist'));verifyPublic(root,ordinaryRows);
 assert.ok(!ordinaryRows.some(r=>r.path==='review-court.html'),'private entry in ordinary dist');
 for(const row of ordinaryRows.filter(r=>r.path.endsWith('.js')||r.path.endsWith('.html'))){const text=fs.readFileSync(path.join(root,'dist',row.path),'utf8');assert.ok(!text.includes('__R272_COURT_REVIEW__')&&!text.includes('ACTUAL_EAST_SIX_FINITE_SCRIPTED_CONTROLLER'),'private review hook entered ordinary artifact');}
 fs.writeFileSync(path.join(e,'production-build.json'),JSON.stringify({status:'PASS',identity,build:production,manifest:ordinaryRows,releaseAccepted:false},null,2)+'\n');
 const staging=path.join(temp,'r272-court-build'),snapshot=path.join(staging,'snapshot'),out=path.join(staging,'review-dist');fs.mkdirSync(staging);fs.mkdirSync(snapshot);
 const inputs=['index.html','main.js','style.css','src','data','public','package.json','package-lock.json','vite.config.js','release.json','scripts/build-identity.mjs','tests/r272-qiandong-gate-wall'];
 const copied=[];
 function copy(relative){const source=path.join(root,relative),target=path.join(snapshot,relative),s=fs.lstatSync(source);assert.ok(!s.isSymbolicLink());if(s.isDirectory()){fs.mkdirSync(target,{recursive:true});for(const n of fs.readdirSync(source).sort())copy(relative+'/'+n);fs.chmodSync(target,0o555);}else{assert.ok(s.isFile());fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target,fs.constants.COPYFILE_EXCL);assert.equal(sha(source),sha(target));copied.push({path:relative,sha256:sha(target),bytes:s.size});fs.chmodSync(target,0o444);}}
 for(const relative of inputs)copy(relative);
 assert.equal(sourceFingerprint(snapshot),production.sourceFingerprint);
 fs.copyFileSync(path.join(snapshot,'tests/r272-qiandong-gate-wall/review-court.html'),path.join(snapshot,'review-court.html'),fs.constants.COPYFILE_EXCL);fs.chmodSync(path.join(snapshot,'review-court.html'),0o444);
 fs.symlinkSync(path.join(root,'node_modules'),path.join(snapshot,'node_modules'),'dir');
 const frozen={...identity,sourceFingerprint:production.sourceFingerprint,privateEntryHashes:copied.filter(r=>r.path.startsWith('tests/r272-qiandong-gate-wall/'))};
 const config=path.join(staging,'review.config.mjs');
 fs.writeFileSync(config,`import original from ${JSON.stringify(path.join(snapshot,'vite.config.js'))};\nexport default {...original, root:${JSON.stringify(snapshot)}, define:{...original.define,__R272_REVIEW_IDENTITY__:${JSON.stringify(JSON.stringify(frozen))}},build:{...original.build,outDir:${JSON.stringify(out)},rollupOptions:{...original.build.rollupOptions,input:${JSON.stringify(path.join(snapshot,'review-court.html'))}}}};\n`,{flag:'wx'});
 for(const parent of ['scripts','tests'])fs.chmodSync(path.join(snapshot,parent),0o555);fs.chmodSync(snapshot,0o555);fs.chmodSync(config,0o444);
 const result={status:'FAILED',identity:frozen,productionBuild:production,snapshotInputs:copied,configSha256:sha(config),inputSha256:sha(path.join(snapshot,'review-court.html')),out,reviewBuildIdentityNote:'Archive-like read-only snapshot has no Git metadata. Companion build-info sourceCommit=null and sourceDirty=true are expected, not ordinary production identity.',releaseAccepted:false};
 try{
  execFileSync('npm',['run','build','--','--config',config],{cwd:snapshot,stdio:'inherit',env:{...process.env,VITE_BASE:'/forbidden-city-3d/'}});
  assert.equal(sourceFingerprint(snapshot),production.sourceFingerprint);for(const row of copied)assert.equal(sha(path.join(snapshot,row.path)),row.sha256);
  result.manifest=inventory(out);verifyPublic(root,result.manifest);assert.ok(result.manifest.some(r=>r.path==='review-court.html'));assert.ok(!result.manifest.some(r=>r.path==='index.html'),'review artifact must not be production entry');
  result.buildInfo=JSON.parse(fs.readFileSync(path.join(out,'build-info.json'),'utf8'));assert.equal(result.buildInfo.sourceFingerprint,production.sourceFingerprint);assert.equal(result.buildInfo.sourceCommit,null);assert.equal(result.buildInfo.sourceDirty,true);
  assert.equal(result.buildInfo.base,'/forbidden-city-3d/');assert.deepEqual(inventory(path.join(root,'dist')),ordinaryRows,'ordinary dist changed');
  assert.equal(execFileSync('git',['status','--porcelain=v1','--untracked-files=all'],{encoding:'utf8'}).trim(),'');result.status='PASS';
 }catch(error){result.error=String(error.stack);throw error;}finally{fs.writeFileSync(path.join(e,'review-build.json'),JSON.stringify(result,null,2)+'\n');}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
