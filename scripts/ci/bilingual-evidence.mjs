import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {readJSON,readRegular,readIdentity,assertAncestors,isMain,writeJSON} from './bilingual-ui/common.mjs';
export function validateMapReport(q,zone,expected){
 assert.equal(q.zoneId,zone);assert.deepEqual(q.expectedIds,expected.map(x=>x.id));assert.equal(new Set(q.expectedIds).size,expected.length);assert.equal(q.matched,expected.length);assert.equal(q.rows.length,expected.length);assert.ok(Number.isInteger(q.mapItems)&&q.mapItems>=q.matched);assert.ok(Number.isInteger(q.maxRSSKiB)&&q.maxRSSKiB>0);
 for(const [i,row]of q.rows.entries()){assert.equal(row.id,expected[i].id);assert.deepEqual(row.expected,expected[i].binding);assert.equal(row.verification,'actual-ZoneBase-output');assert.ok(row.actual&&typeof row.actual==='object');for(const [key,value]of Object.entries(expected[i].binding))assert.deepEqual(row.actual[key],value);}
 return {zoneId:zone,matched:q.matched,mapItems:q.mapItems,maxRSSKiB:q.maxRSSKiB};
}
export function validateNativeTrace(q){
 assert.ok(q.descriptor&&typeof q.descriptor.name==='string');assert.ok(Array.isArray(q.replay?.frames)&&q.replay.frames.length>0);assert.equal(q.frameCount,q.replay.frames.length);assert.deepEqual(q.frameIndices,q.replay.frames.map((_,i)=>i));
 assert.equal(q.frameSHA256,createHash('sha256').update(JSON.stringify(q.replay.frames)).digest('hex'));
 const proof=q.observation?.proof,rows=q.observation?.rows;assert.equal(proof.readOnlyObservation,true);assert.equal(proof.extraNativeQueries,0);assert.equal(proof.methodDescriptorsRestored,true);assert.equal(proof.controllers,1);assert.ok(Array.isArray(rows)&&rows.length>0);assert.equal(proof.updates,rows.length);for(const [i,r]of rows.entries()){assert.equal(r.index,i);assert.ok(r.pre&&r.post);}
 return {frames:q.frameCount,updates:proof.updates};
}
export function verifyAdditionalEvidence(root,plan){
 assert.ok(root&&path.isAbsolute(root));assertAncestors(root);const identity=readIdentity();const maps=[];
 for(const zone of plan.zones){const dir=path.join(root,'bilingual-map',zone);assertAncestors(dir);assert.deepEqual(fs.readdirSync(dir),[zone+'.json']);maps.push(validateMapReport(readJSON(path.join(dir,zone+'.json')),zone,plan.expected[zone]));}
 assert.equal(maps.reduce((n,q)=>n+q.matched,0),28);const native=[];
 for(const suite of ['bounded-430','actual-axis']){const base=path.join(root,'dailou-native',suite);assertAncestors(base);const dirs=fs.readdirSync(base);assert.equal(dirs.length,1);assert.match(dirs[0],/^d14-native-/);const dir=path.join(base,dirs[0]);assertAncestors(dir);const names=fs.readdirSync(dir).sort();assert.deepEqual(names,Array.from({length:18},(_,i)=>'NATIVE-TRACE-'+String(i).padStart(3,'0')+'.json'));let frames=0,updates=0;for(const name of names){const q=validateNativeTrace(readJSON(path.join(dir,name)));frames+=q.frames;updates+=q.updates;}assert.equal(frames,1904);assert.equal(updates,2764);native.push({suite,files:18,frames,updates});}
 return {schema:1,identity,passed:true,maps,native,scope:'Actual CPU map projections and retained native controller evidence; no World/GPU/mobile hardware claim'};
}
if(isMain(import.meta.url)){
 const root=process.env.EVIDENCE_DIR;let receipt;try{assert.ok(root&&path.isAbsolute(root));receipt=verifyAdditionalEvidence(root,readJSON(path.resolve('docs/current-state/r165-cumulative-373-bilingual/MAP-TEST-PLAN.json')));}catch(error){receipt={schema:1,passed:false,error:error.stack};process.exitCode=1;}
 if(!root||!path.isAbsolute(root))throw Error('Explicit evidence root required');writeJSON(path.join(root,'bilingual-additions-verified.json'),receipt);console.log(JSON.stringify(receipt));
}
