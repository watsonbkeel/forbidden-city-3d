// Fresh actual R49E world. The three adapters share this one current world:
// their equivalence is not a before/after architecture comparison.
import assert from 'node:assert/strict';
import {verifyR51Lod2Source} from './p3c-r51-lod2-source-proof.mjs';
verifyR51Lod2Source();
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {gunzipSync,gzipSync} from 'node:zlib';
import {compareIncrementalWorld} from './p3c-r51-compare-incremental-world.mjs';
import {CHARACTER_REGISTRY as registry} from '../data/characters/index.js';
const dir=new URL('../reports/r51-unified/',import.meta.url);fs.mkdirSync(dir,{recursive:true});
const sha=b=>createHash('sha256').update(b).digest('hex');
const oldBytes=fs.readFileSync(new URL('../reports/r50-followup/world-incremental-review.json.gz',import.meta.url));
const old=JSON.parse(gunzipSync(oldBytes));
const mdBytes=fs.readFileSync(new URL('../reports/r50/world-bindings.md',import.meta.url));
const rows=new Map(mdBytes.toString().split('\n').filter(s=>s.startsWith('| `')).map(s=>{const c=s.split('|').map(x=>x.trim()),id=c[1]?.replaceAll('`',''),m=c[5]?.match(/\(([^)]+)\)/);return[id,m?m[1].split(',').map(Number):null];}).filter(([,p])=>p?.length===3));
assert.equal(JSON.parse(fs.readFileSync(new URL('../data/characters/world-source-freeze.json',import.meta.url))).baselineCommit,'db20828f1a6411603a3d9388eebe3ba2a5d11e61','This R49E capture is frozen. A later architecture must use a new output identity or its explicit bounded inheritance proof.');
const freeze=JSON.parse(fs.readFileSync(new URL('../data/characters/world-source-freeze.json',import.meta.url)));for(const f of freeze.files)assert.equal(sha(fs.readFileSync(new URL('../'+f.path,import.meta.url))),f.sha256,'R51 active frozen world source '+f.path);
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
const report={...fresh,kind:'Fresh CPU actual-world R51 Kit 07 exact LOD2 foot-base successor + delivered R49E joint binding evidence. NOT GPU, texture/visual approval, or a full historical-suite green claim.',candidateCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),architectureBaselineCommit:'db20828f1a6411603a3d9388eebe3ba2a5d11e61',activeFreezeSha256:sha(fs.readFileSync(new URL('../data/characters/world-source-freeze.json',import.meta.url))),requiredActors:38,threeAdapterComparisonScope:'Frozen, synchronous and incremental adapters are all run on the same newly built R49E world. This establishes algorithm equivalence, not R49 versus R49E architecture equivalence.',priorCacheComparison:{source:'reports/r50-followup/world-incremental-review.json.gz',sha256:sha(oldBytes),readableSource:'reports/r50/world-bindings.md',readableSourceSha256:sha(mdBytes),all38PositionsUnchanged:true,all38SemanticBindingsUnchanged:true,all148RouteSamplesUnchanged:true,opaqueMeshIdPolicy:'Same-world algorithm audit remaps exact mesh owners; cross-world cache comparison omits scene enumeration IDs only. Fresh independent full THREE raycasts validate actual current owners.'},actorBindings:cacheRows};
const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');fs.writeFileSync(new URL('world-bindings-after-lod2-38-148.json.gz',dir),gzipSync(bytes));
const summary={ok:report.ok,candidateCommit:report.candidateCommit,architectureBaselineCommit:report.architectureBaselineCommit,requiredActors:38,ready:report.ready,routeSamples:report.routeSamples,paths:report.paths,independentFullRayOwnerAudits:report.independentFullRayOwnerAudits,bindingSupportProbeCounts:report.bindingSupportProbeCounts,unchanged:report.unchanged,priorCacheComparison:report.priorCacheComparison,activeFreezeSha256:report.activeFreezeSha256,rawReportSha256:sha(bytes),compressedReportSha256:sha(fs.readFileSync(new URL('world-bindings-after-lod2-38-148.json.gz',dir))),sourceInput:report.sourceInput,elapsedMs:report.elapsedMs};fs.writeFileSync(new URL('world-bindings-after-lod2-summary.json',dir),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));
