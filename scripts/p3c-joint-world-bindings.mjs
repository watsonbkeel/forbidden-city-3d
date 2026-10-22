// Fresh actual R49B world. The three adapters share this one current world:
// their equivalence is not a before/after architecture comparison.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {gunzipSync,gzipSync} from 'node:zlib';
import {compareIncrementalWorld} from './p3c-compare-incremental-world.mjs';
import {CHARACTER_REGISTRY as registry} from '../data/characters/index.js';
const dir=new URL('../reports/r50-joint/',import.meta.url);fs.mkdirSync(dir,{recursive:true});
const sha=b=>createHash('sha256').update(b).digest('hex');
const oldBytes=fs.readFileSync(new URL('../reports/r50-followup/world-incremental-review.json.gz',import.meta.url));
const old=JSON.parse(gunzipSync(oldBytes));
const mdBytes=fs.readFileSync(new URL('../reports/r50/world-bindings.md',import.meta.url));
const rows=new Map(mdBytes.toString().split('\n').filter(s=>s.startsWith('| `')).map(s=>{const c=s.split('|').map(x=>x.trim()),id=c[1]?.replaceAll('`',''),m=c[5]?.match(/\(([^)]+)\)/);return[id,m?m[1].split(',').map(Number):null];}).filter(([,p])=>p?.length===3));
assert.equal(JSON.parse(fs.readFileSync(new URL('../data/characters/world-source-freeze.json',import.meta.url))).baselineCommit,'95db2af664ff9cb6ea405d0ba389ef428dfd7d6c','This R49B capture is frozen. A later architecture must use a new output identity or its explicit bounded inheritance proof.');
const fresh=await compareIncrementalWorld();
assert.equal(fresh.ok,true,JSON.stringify(fresh.differences));assert.equal(fresh.actors,38);assert.equal(registry.actors.filter(a=>a.required).length,38);for(const n of Object.values(fresh.ready))assert.equal(n,38);assert.equal(fresh.routeSamples,148);assert.equal(fresh.paths.length,2);
const canonical=v=>JSON.parse(JSON.stringify(v,(k,x)=>['meshId','validationGeneration'].includes(k)?undefined:x));
const cacheRows=registry.actors.map((actor,i)=>{
 const binding=fresh.bindings[i],previous=old.bindings[i],md=rows.get(actor.id);assert.ok(md,actor.id+' original cache row');
 const delta=binding.position.map((x,j)=>Math.abs(x-previous.position[j]));assert.ok(delta.every(x=>x<1e-10),'original full-precision cached position '+actor.id);
 const roundedDelta=binding.position.map((x,j)=>Math.abs(x-md[j]));assert.ok(roundedDelta.every(x=>x<1e-6),'original human-readable cached position '+actor.id);
 assert.deepEqual(canonical(binding),canonical(previous),'binding semantic values and route samples vs prior R50 cache '+actor.id);
 return{actorId:actor.id,required:actor.required,positionUnchanged:true,maxDeltaMeters:Math.max(...delta),roundedCacheMaxDeltaMeters:Math.max(...roundedDelta),binding};
});
const report={...fresh,kind:'Fresh CPU actual-world R50 Kit 07 + delivered R49B joint binding evidence. NOT GPU, texture/visual approval, or a full historical-suite green claim.',candidateCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),architectureBaselineCommit:'95db2af664ff9cb6ea405d0ba389ef428dfd7d6c',activeFreezeSha256:sha(fs.readFileSync(new URL('../data/characters/world-source-freeze.json',import.meta.url))),requiredActors:38,threeAdapterComparisonScope:'Frozen, synchronous and incremental adapters are all run on the same newly built R49B world. This establishes algorithm equivalence, not R49 versus R49B architecture equivalence.',priorCacheComparison:{source:'reports/r50-followup/world-incremental-review.json.gz',sha256:sha(oldBytes),readableSource:'reports/r50/world-bindings.md',readableSourceSha256:sha(mdBytes),all38PositionsUnchanged:true,all38SemanticBindingsUnchanged:true,all148RouteSamplesUnchanged:true,opaqueMeshIdPolicy:'Same-world algorithm audit remaps exact mesh owners; cross-world cache comparison omits scene enumeration IDs only. Fresh independent full THREE raycasts validate actual current owners.'},actorBindings:cacheRows};
const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');fs.writeFileSync(new URL('world-bindings-38-148.json.gz',dir),gzipSync(bytes));
const summary={ok:report.ok,candidateCommit:report.candidateCommit,architectureBaselineCommit:report.architectureBaselineCommit,requiredActors:38,ready:report.ready,routeSamples:report.routeSamples,paths:report.paths,independentFullRayOwnerAudits:report.independentFullRayOwnerAudits,bindingSupportProbeCounts:report.bindingSupportProbeCounts,unchanged:report.unchanged,priorCacheComparison:report.priorCacheComparison,activeFreezeSha256:report.activeFreezeSha256,rawReportSha256:sha(bytes),compressedReportSha256:sha(fs.readFileSync(new URL('world-bindings-38-148.json.gz',dir))),sourceInput:report.sourceInput,elapsedMs:report.elapsedMs};fs.writeFileSync(new URL('world-bindings-summary.json',dir),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));
