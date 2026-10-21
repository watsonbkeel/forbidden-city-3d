import test from 'node:test';
import {restorePreR32Routes} from './lib/r32-route-retention.mjs';
import {r32Source,restoreR32SourceIfPresent} from './lib/r32-source-retention.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {buildWorld,loadZoneJsons} from './lib/world.mjs';
import {buildAutoRoutes} from './lib/auto-routes.mjs';
import {restorePreR22RouteSource,assertR22RouteAddedSource,assertR22RouteIdentity,restorePreR22BaoheTraversalRoute,restorePreR22FixedRoutes} from './lib/r22-baohe-route-retention.mjs';
import {restorePreR23Source} from './lib/r23-baohe-retention.mjs';
import {restorePreR19Source,restorePreR19FixedRoutes,restorePreR19BaoheTraversalRoute,assertR19RouteIdentity} from './lib/r19-baohe-retention.mjs';
import {restorePreR18Source} from './lib/r18-baohe-retention.mjs';
import {restorePreR17FixedRoutes} from './lib/r17-baohe-retention.mjs';
import delta from './fixtures/r22-baohe-routes-delta.json' with {type:'json'};
import runtime from './fixtures/r22-baohe-source-delta.json' with {type:'json'};
import priorSource from './fixtures/r19-baohe-source-delta.json' with {type:'json'};
import priorRoutes from './fixtures/r19-baohe-routes-delta.json' with {type:'json'};

const root=new URL('../',import.meta.url),sha=x=>createHash('sha256').update(x).digest('hex');
// Historical R22 source assertions consume only the exact frozen R32 delta.
const hash=x=>sha(JSON.stringify(x)),read=path=>restoreR32SourceIfPresent(path,fs.readFileSync(new URL(path,root)));
const liveFixed=execFileSync(process.execPath,['tests/stepwalk.cjs','60','0','all'],{cwd:root,env:{...process.env,DUMP:'1'},encoding:'utf8'}).trim().split('\n').map(line=>{const i=line.indexOf(' ');return{name:line.slice(0,i),pts:JSON.parse(line.slice(i+1))};});
const fixed=restorePreR32Routes(liveFixed,'fixed');
const zones=loadZoneJsons(),world=await buildWorld({zones});
const liveAuto=buildAutoRoutes(world,zones.map(z=>z.json),{knownIssues:{}});
const auto=restorePreR32Routes(liveAuto,'auto');

test('R22 tests-only route provenance is separate from frozen runtime and preserves all earlier fixtures',()=>{
  assert.equal(delta.base,'5e6624c03d520ee91d355b09aa3060bc7a9489fe');
  assert.equal(delta.runtimeCandidate,runtime.candidate);
  assert.equal(delta.candidate,'d21cb69bb4ebfc2d94e395109eb2b6e251fa0602');
  assert.equal(delta.historicalBase,runtime.base);assert.match(delta.scope,/Historical assertions only/);
  assert.deepEqual(Object.keys(delta.testFiles),['tests/stepwalk.cjs']);
  assert.deepEqual(Object.keys(delta.addedFiles),['tests/lib/baohe-front-route.mjs']);
  assert.equal(delta.testFiles['tests/stepwalk.cjs'].baselineSHA256,priorSource.testFiles['tests/stepwalk.cjs'].candidateSHA256);
  assert.equal(delta.testFiles['tests/stepwalk.cjs'].candidateSHA256,'a76d083d5394ae5d87768d3bf174739da7c5657664b62c7e1287fa71c2f2c6b7');
  assert.equal(delta.addedFiles['tests/lib/baohe-front-route.mjs'].candidateSHA256,'8fad243a2ba667e33392978d219659eacb6af88070cf65ac9d5f7e6e2fa4556e');
  assert.equal(delta.fixed.beforeSHA256,priorRoutes.fixed.afterSHA256);assert.deepEqual(delta.fixed.before,priorRoutes.fixed.after);
  assert.deepEqual(delta.auto,priorRoutes.auto);
  assert.equal(Object.keys(delta.preservedFixtures).length,5);
  for(const[path,digest]of Object.entries(delta.preservedFixtures))assert.equal(sha(read(path)),digest,path);
  for(const[path,d]of Object.entries({...runtime.files,...runtime.addedFiles}))assert.equal(sha(restorePreR23Source(path,read(path))),d.candidateSHA256,`historical R22 runtime stays frozen: ${path}`);
  for(const[path,digest]of Object.entries(delta.retainedFiles))assert.equal(sha(read(path)),digest,`unchanged driver/world/controller: ${path}`);
});

for(const[path,d]of Object.entries(delta.testFiles)){
  test('exact route source reverses two unique hunks before the original R19/R18 source chain: '+path,()=>{
    const bytes=read(path),original=Buffer.from(bytes);assert.equal(sha(bytes),d.candidateSHA256);assert.equal(d.deltas.length,2);
    for(const h of d.deltas){assert.ok(h.before.length&&h.after.length);assert.equal(bytes.toString().split(h.after).length,2);}
    const restored=restorePreR22RouteSource(path,bytes);assert.equal(sha(restored),d.baselineSHA256);assert.equal(restorePreR22RouteSource(path,restored),restored);
    for(const h of d.deltas)assert.equal(restored.toString().split(h.before).length,2);
    assert.equal(sha(restorePreR19Source(path,bytes)),priorSource.testFiles[path].baselineSHA256);
    assert.equal(sha(restorePreR18Source(path,bytes)),priorSource.testFiles[path].baselineSHA256);
    assert.deepEqual(bytes,original);
  });
  test('route source rejects empty, appended, duplicated, partial-reverse and unrelated changes',()=>{
    const text=read(path).toString(),bad=['',text+'\n',text+text,'// unrelated\n'+text];
    for(const h of d.deltas)for(const replacement of['',h.before,h.after+h.after])bad.push(text.replace(h.after,replacement));
    for(const value of bad){assert.notEqual(value,text);for(const restore of[restorePreR22RouteSource,restorePreR19Source,restorePreR18Source])assert.throws(()=>restore(path,Buffer.from(value)));}
    const before=restorePreR22RouteSource(path,read(path)).toString();
    for(const value of[before+'\n',before+before,'// unrelated\n'+before])assert.throws(()=>restorePreR22RouteSource(path,Buffer.from(value)));
  });
}

for(const[path,d]of Object.entries(delta.addedFiles))test('test-only helper is whole-source bound and rejects changed margins, duplicates and unknown paths',()=>{
  const bytes=read(path),text=bytes.toString();assert.equal(sha(bytes),d.candidateSHA256);assert.equal(assertR22RouteAddedSource(path,bytes),bytes);
  const needle='arrivalTolerance=.8';assert.equal(text.split(needle).length,2);
  for(const value of['',text+'\n',text+text,text.replace(needle,'arrivalTolerance=.7')])assert.throws(()=>assertR22RouteAddedSource(path,Buffer.from(value)));
  assert.throws(()=>assertR22RouteAddedSource('tests/lib/unknown-route.mjs',bytes));
});

test('R22 source entry binds the whole R32 stepwalk driver before reversing historical hunks',()=>{
  const path='tests/stepwalk.cjs',bytes=fs.readFileSync(new URL(path,root));
  assert.equal(sha(bytes),r32Source.files[path].candidateSHA256);
  assert.equal(sha(restorePreR22RouteSource(path,bytes)),delta.testFiles[path].baselineSHA256);
  const bad=[Buffer.alloc(0),Buffer.concat([bytes,Buffer.from('\n// unrelated driver')])];
  for(const h of r32Source.files[path].deltas)for(const replacement of['',h.after+h.after,h.after+'// altered R32 hunk\n'])bad.push(Buffer.from(bytes.toString().replace(h.after,replacement)));
  for(const value of bad)assert.throws(()=>restorePreR22RouteSource(path,value));
});

test('all33 historical R22 fixed routes bind exact descriptors; only two front coordinates change with every route and endpoint retained',()=>{
  const d=delta.fixed;assert.equal(assertR22RouteIdentity('fixed',fixed),fixed);
  assert.equal(fixed.length,33);assert.equal(d.index,2);assert.deepEqual(d.changedPointIndices,[22,23]);assert.deepEqual(fixed[d.index],d.after);
  assert.equal(d.after.pts.length,d.before.pts.length);assert.deepEqual(d.after.pts[0],d.before.pts[0]);assert.deepEqual(d.after.pts.at(-1),d.before.pts.at(-1));
  assert.deepEqual(d.before.pts.slice(22,24),[[0,116.2],[6.1,116.2]]);assert.deepEqual(d.after.pts.slice(22,24),[[0,118.1],[6.1,118.1]]);
  for(let i=0;i<d.after.pts.length;i++)if(!d.changedPointIndices.includes(i))assert.deepEqual(d.after.pts[i],d.before.pts[i]);
  const historical=restorePreR22FixedRoutes(fixed);assert.equal(hash(historical),d.beforeSHA256);assert.equal(restorePreR22FixedRoutes(historical),historical);
  for(let i=0;i<fixed.length;i++)if(i!==d.index)assert.deepEqual(historical[i],fixed[i]);
  assert.equal(assertR19RouteIdentity('fixed',historical),historical);assert.equal(hash(fixed),d.afterSHA256);
  assert.deepEqual(restorePreR22BaoheTraversalRoute(fixed[d.index]),d.before);
  assert.deepEqual(restorePreR19BaoheTraversalRoute(fixed[d.index]),priorRoutes.fixed.before);
  assert.equal(hash(restorePreR19FixedRoutes(fixed)),priorRoutes.fixed.beforeSHA256);
  assert.deepEqual(restorePreR17FixedRoutes(fixed),restorePreR17FixedRoutes(historical));
  assert.throws(()=>assertR22RouteIdentity('fixed',historical),'historical descriptors never pass current acceptance');
});

test('all59 historical R22 automatic routes retain exact descriptors after whole R32 restoration',()=>{
  assert.equal(assertR22RouteIdentity('auto',auto),auto);assert.equal(auto.length,59);
  assert.equal(delta.auto.beforeSHA256,delta.auto.afterSHA256);assert.equal(hash(auto),priorRoutes.auto.afterSHA256);
  assert.throws(()=>assertR22RouteIdentity('unknown',auto));
});

test('historical fixed-route entry restores only exact complete R32 descriptors and rejects unknown R32 drift',()=>{
  assert.deepEqual(restorePreR22FixedRoutes(liveFixed),restorePreR22FixedRoutes(fixed));
  assert.throws(()=>assertR22RouteIdentity('fixed',liveFixed),'actual R32 is never accepted as historical R22');
  assert.throws(()=>assertR22RouteIdentity('auto',liveAuto),'actual R32 is never accepted as historical R22');
  const missing=structuredClone(liveFixed);missing.pop();
  const duplicate=structuredClone(liveFixed);duplicate.push(structuredClone(duplicate[0]));
  const reordered=structuredClone(liveFixed);[reordered[0],reordered[1]]=[reordered[1],reordered[0]];
  const point=structuredClone(liveFixed);point[0].pts[0][0]+=.001;
  const metadata=structuredClone(liveFixed);metadata[0].unknown=true;
  for(const bad of[missing,duplicate,reordered,point,metadata])
    for(const restore of[restorePreR22FixedRoutes,restorePreR19FixedRoutes,restorePreR17FixedRoutes])assert.throws(()=>restore(bad));
});

for(const[kind,rows]of Object.entries({fixed,auto}))test('historical R22 '+kind+' binding rejects missing, duplicate, reordered, metadata and unrelated-point drift',()=>{
  const missing=structuredClone(rows);missing.pop();
  const duplicate=structuredClone(rows);duplicate.push(structuredClone(duplicate[0]));
  const reordered=structuredClone(rows);[reordered[0],reordered[1]]=[reordered[1],reordered[0]];
  const point=structuredClone(rows);point[0].pts[0][0]+=.001;
  const metadata=structuredClone(rows);metadata[0].name+=' changed';
  for(const bad of[missing,duplicate,reordered,point,metadata]){
    assert.throws(()=>assertR22RouteIdentity(kind,bad));
    if(kind==='fixed')for(const restore of[restorePreR22FixedRoutes,restorePreR19FixedRoutes,restorePreR17FixedRoutes])assert.throws(()=>restore(bad));
  }
});

test('front-crossing reversal rejects partial, duplicated and unknown points including historical-input drift',()=>{
  const d=delta.fixed;
  for(const original of[fixed,restorePreR22FixedRoutes(fixed)])for(const index of[0,22,23,27]){
    const mutations=[];
    const drift=structuredClone(original);drift[d.index].pts[index][1]+=.001;mutations.push(drift);
    const missing=structuredClone(original);missing[d.index].pts.splice(index,1);mutations.push(missing);
    const duplicate=structuredClone(original);duplicate[d.index].pts.splice(index,0,structuredClone(duplicate[d.index].pts[index]));mutations.push(duplicate);
    for(const bad of mutations){
      for(const restore of[restorePreR22FixedRoutes,restorePreR19FixedRoutes])assert.throws(()=>restore(bad));
      for(const restore of[restorePreR22BaoheTraversalRoute,restorePreR19BaoheTraversalRoute])assert.throws(()=>restore(bad[d.index]));
    }
  }
  for(const index of d.changedPointIndices){const partial=structuredClone(fixed);partial[d.index].pts[index]=structuredClone(d.before.pts[index]);assert.throws(()=>restorePreR22FixedRoutes(partial));assert.throws(()=>restorePreR22BaoheTraversalRoute(partial[d.index]));}
  const extra={...d.after,driver:'unapproved'};assert.throws(()=>restorePreR22BaoheTraversalRoute(extra));
});
