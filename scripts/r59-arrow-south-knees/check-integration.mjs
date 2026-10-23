// Exercise the EXACT proposed owner hook in memory; never edits shared source.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {library} from '../../tests/lib/inner-palace-fixture.mjs';
import {auditArrowSouthKnees,sha} from '../../tests/lib/r59-arrow-knees-qa.mjs';
import {arrowLegacyProduction} from '../../tests/lib/r59-arrow-baseline.mjs';
const file='src/scene/palace/special/EnclosedPavilions.js',location=new URL('../../'+file,import.meta.url);
let source=fs.readFileSync(file,'utf8');
const beforeSha=sha(source),marker='  kit._lastFurnish={cover:[],spawns:[{x:0,z:0}]};';
if(!source.includes("from './ArrowSouthKnees.js'")){
 assert.equal(source.split(marker).length,2,'only one integration anchor');
 source="import {buildArrowSouthKnees} from './ArrowSouthKnees.js';\n"+source.replace(marker,"  if(key==='arrow')buildArrowSouthKnees(kit,f,item);\n"+marker);
}
source=source.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,location).href}${q}`);
const api=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const data=JSON.parse(fs.readFileSync('data/zones/outer-east.json')),item=data.items.find(i=>i.name==='箭亭'),kit=new CourtKit(library()),{f:frame}=api.buildEnclosedPavilion(kit,item);
const result=auditArrowSouthKnees({kit,frame,baseline:JSON.parse(fs.readFileSync('tests/fixtures/r59-arrow-knees-baseline.json')).snapshot});
assert.equal(result.retainedExact,true);assert.equal(result.kneeCount,2);assert.ok(result.health.every(h=>h.closed&&h.finite&&h.signedVolume>0&&h.minArea>1e-7));
assert.equal(sha(fs.readFileSync(file)),beforeSha,'shared source was not changed');
const oldTree=arrowLegacyProduction().files;
const changed=[];for(const row of oldTree){const actual=sha(fs.readFileSync(row.path));if(actual!==row.sha256)changed.push({path:row.path,before:row.sha256,after:actual});}
// The owner's eventual EnclosedPavilions import/hook is expected after integration;
// in this worker's branch there must be ZERO changed legacy production files.
assert.ok(changed.every(row=>row.path===file),'no unrelated legacy production file may change');
const report={...result,kind:'EXACT PROPOSED HOOK EVALUATED IN MEMORY; SHARED FILE UNTOUCHED',sharedSourceSha256:beforeSha,legacyProduction:{paths:oldTree.length,baselineTreeDigest:sha(JSON.stringify(oldTree)),changed},productionAddition:{path:'src/scene/palace/special/ArrowSouthKnees.js',sha256:sha(fs.readFileSync('src/scene/palace/special/ArrowSouthKnees.js'))}};
fs.writeFileSync(process.env.R59_INTEGRATION_REPORT??'reports/r59-arrow-south-knees/integration.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));kit.dispose(kit.root);
