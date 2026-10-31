// Bounded isolated module-loader mutations. No production files are rewritten.
// Establishes the old 29-test blind spots and requires the new vertex-level
// geometry contracts to reject both wrong but count-preserving variants.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const moduleURL=new URL('../../../../src/scene/palace/special/WenhuaCentralDoors.js',import.meta.url),testURL=new URL('../../../../tests/photo-fidelity/batches/r158-wenhua/central-doors.test.mjs',import.meta.url),source=fs.readFileSync(moduleURL,'utf8'),out=path.resolve(process.argv[2]??'../r158-wenhua-court-evidence');fs.mkdirSync(out,{recursive:true});
const hash=s=>createHash('sha256').update(s).digest('hex');
const oldSkip='geometric contract:|invalid getter-only|invalid inherited getter-only|invalid setter-only|invalid inherited finalizer';
const cases=[['all-six-leaves-right','const side=leaf<3?-1:1','const side=1','three actual leaf bodies must be left'],['all-lattice-bars-one-mm','new T.BoxGeometry(hi-lo,.018,.025)','new T.BoxGeometry(.001,.018,.025)','actual bar principal axis']];
const rows=[];
for(const[id,from,to,expected]of cases){
 assert.equal(source.split(from).length,2,'one explicit mutation site');const mutated=source.replace(from,to),resolved=mutated.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,s)=>'from '+q+(s.startsWith('.')?new URL(s,moduleURL).href:import.meta.resolve(s))+q),uri='data:text/javascript;base64,'+Buffer.from(resolved).toString('base64'),runs=[];
 for(const legacyOnly of[true,false]){const args=['--test',...(legacyOnly?['--test-skip-pattern',oldSkip]:[]),testURL.pathname],r=spawnSync(process.execPath,args,{env:{...process.env,WENHUA_CENTRAL_DOOR_MODULE:uri},encoding:'utf8',maxBuffer:8*1024*1024}),label=id+(legacyOnly?'-legacy29-green':'-new-contract-red'),log=r.stdout+r.stderr;fs.writeFileSync(path.join(out,label+'.tap'),log);if(legacyOnly){assert.equal(r.status,0,'old 29 were expected to miss the mutation');assert.match(log,/(?:pass 29|# pass 29)/)}else{assert.equal(r.status,1,'new geometry contract must reject mutation');assert.ok(log.includes(expected),'must fail the actual geometry assertion, not an import error')}runs.push({legacyOnly,exit:r.status,log:label+'.tap',sha256:hash(log)});}
 rows.push({id,exactMutation:{from,to},mutatedSourceSHA256:hash(mutated),runs});
}
assert.equal(fs.readFileSync(moduleURL,'utf8'),source,'on-disk production source remains untouched');const proof={scope:'ISOLATED_REAL_IMPLEMENTATION_MODULE_LOADER_NEGATIVE_CONTROLS_NOT_SYNTHETIC_REPLACEMENT_GEOMETRY',sourceSHA256:hash(source),sourceUnmodifiedByControls:true,rows};fs.writeFileSync(path.join(out,'p2-negative-controls.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof,null,2));
