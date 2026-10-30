import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {sourceFingerprint} from '../../build-identity.mjs';
const dir='../baoyun-20261030-evidence/',read=p=>fs.readFileSync(dir+p,'utf8'),json=p=>JSON.parse(read(p));
const names=s=>s.split('\n').filter(l=>/^(?:not )?ok \d+ - /.test(l)).map(l=>l.replace(/\d+ - /,''));
const parent=names(read('current-state-parent.tap')),candidate=names(read('current-state-final-candidate.tap'));
for(const name of ['current-state-parent','current-state-final-candidate']){assert.equal(read(name+'.exit').trim(),'1');assert.match(read(name+'.tap'),/# tests 1331\n# suites 0\n# pass 1113\n# fail 218\n# cancelled 0/);}
assert.equal(parent.length,1331);assert.deepEqual(candidate,parent);
const a=json('world-final-parent.json').rows,b=json('world-final-candidate.json').rows;assert.equal(a.length,80);assert.equal(b.length,80);assert.equal(a.filter(r=>!r.legalStart).length,0);assert.equal(b.filter(r=>!r.legalStart).length,8);assert.ok(b.filter(r=>!r.legalStart).every(r=>r.label==='porch-cross'&&r.excludedInvalidStart));
assert.ok([...a,...b].filter(r=>r.legalStart).every(r=>r.collisionFrames===0));
const nonTarget=new Set(['front-court','west-bypass','east-bypass','central-step-entry','front-fall']);let identical=0;for(let i=0;i<a.length;i++){if(nonTarget.has(a[i].label)){assert.equal(b[i].trace,a[i].trace);identical++;}if(b[i].label.startsWith('roof-')){assert.equal(b[i].feet,0);assert.equal(b[i].airborne,false);}}
assert.equal(identical,40);for(const label of ['clear-porch-cross','roof-south','roof-west','roof-east'])assert.equal(a.filter(r=>r.label===label&&r.arrived).length,b.filter(r=>r.label===label&&r.arrived).length);
assert.equal(read('compile-memory.exit').trim(),'0');const build=json('compile-memory.json'),fingerprint=sourceFingerprint(process.cwd());assert.equal(build.rows.length,3);assert.ok(build.rows.every(r=>r.identity.sourceFingerprint===fingerprint));
for(const label of ['baseline','candidate'])assert.equal(json(label+'/FINAL-SOURCE-VERIFICATION.json').fingerprint,fingerprint);
const result={fingerprint,currentState:{tests:1331,pass:1113,fail:218,newFailures:0,identicalOrderedStatuses:true,statusSHA256:createHash('sha256').update(JSON.stringify(parent)).digest('hex')},world:{casesEach:80,parentIllegalStarts:0,candidateExcludedIllegalStarts:8,legalCollisionFrames:0,nonTargetIdenticalTraces:identical,arrivalToleranceUnchanged:.15,allCandidateRoofExitCasesFinallyGrounded:true},build:{bases:build.rows.map(r=>r.base),scope:'in-memory exact identity compile only; no deployable bundle or GPU claim'}};
fs.writeFileSync(dir+'FINAL-VERIFICATION.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
