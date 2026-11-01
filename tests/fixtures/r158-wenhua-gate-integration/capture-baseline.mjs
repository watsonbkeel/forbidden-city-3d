// Observer-only baseline: original build/registration methods execute unchanged.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {registerHooks} from 'node:module';
import {gzipSync} from 'node:zlib';
const repo=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);
assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),'493a13c7bd5765c1866ee23e25d2d653ebd11054');
assert.equal(fs.existsSync(out),false,'never overwrite prior evidence');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const files=execFileSync('git',['ls-files','src','data'],{cwd:repo,encoding:'utf8'}).trim().split('\n');
const inventory=()=>Object.fromEntries(files.map(f=>[f,sha(fs.readFileSync(path.join(repo,f)))]));
const before=inventory();assert.equal(files.length,582);
const gateURL=pathToFileURL(path.join(repo,'src/scene/palace/special/SouthCourtGates.js')).href;
const collisionURL=pathToFileURL(path.join(repo,'src/utils/Collision.js')).href;
const observed={ramps:new WeakSet(),raw:[],registrations:[],builds:0};
globalThis.__wenhuaBaselineObserver=observed;
const hook=registerHooks({load(url,ctx,next){const result=next(url,ctx);if(url!==gateURL)return result;
 let source=String(result.source);const token='export function buildSouthCourtGate(kit,item)';assert.equal(source.split(token).length,2);
 source=source.replace(token,'function originalBuildSouthCourtGate(kit,item)')+`\nexport function buildSouthCourtGate(kit,item){const start=kit.walkables.length;const result=originalBuildSouthCourtGate(kit,item);if(result.g.id==='south-gate:wenhua'){const o=globalThis.__wenhuaBaselineObserver;o.builds++;for(const w of kit.walkables.slice(start))if(w.type==='ramp'){o.ramps.add(w);o.raw.push(w);}}return result;}\n`;
 return{...result,source};}});
let W,original;
try{
 const {CollisionManager}=await import(collisionURL);original=CollisionManager.prototype.addWalkable;
 CollisionManager.prototype.addWalkable=function(w,tag){const start=this.walkables.length;const result=original.call(this,w,tag);if(observed.ramps.has(w))observed.registrations.push({manager:this,start,end:this.walkables.length,tag});return result;};
 try{const {buildR52World}=await import(pathToFileURL(path.join(repo,'tests/lib/r52-world.mjs')));W=await buildR52World();}finally{CollisionManager.prototype.addWalkable=original;hook.deregister();}
 const {taiheWorldPhysics}=await import(pathToFileURL(path.join(repo,'tests/lib/r157-taihe-world-retention.mjs')));
 const physical=taiheWorldPhysics(W),registrations=observed.registrations.filter(r=>r.manager===W.cm),indices=registrations.map(r=>r.start);
 assert.equal(observed.builds,1);assert.equal(observed.raw.length,6);assert.equal(indices.length,6);assert.equal(new Set(indices).size,6);assert.ok(registrations.every(r=>r.end===r.start+1));
 assert.equal(physical.rows.length,30873);assert.equal(physical.walkables.length,1371);assert.deepEqual(inventory(),before,'production source unchanged throughout observer capture');
 const removed=new Set(indices),result={scope:'ACTUAL_493_WORLD_OBSERVER_ONLY_BUILD_AND_SUPPORT_REGISTRATION',head:'493a13c7bd5765c1866ee23e25d2d653ebd11054',source:before,colliderHashes:physical.rows.map(r=>sha(JSON.stringify(r))).sort(),walkables:physical.walkables,removedSupportIndices:indices,removedSupports:physical.walkables.filter((_,i)=>removed.has(i)),retainedSupports:physical.walkables.filter((_,i)=>!removed.has(i)),rivers:physical.rivers,observerScriptSHA:sha(fs.readFileSync(new URL(import.meta.url)))};
 const bytes=Buffer.from(JSON.stringify(result));fs.writeFileSync(out,gzipSync(bytes),{flag:'wx'});console.log(JSON.stringify({out,bytes:bytes.length,sha256:sha(bytes),gzipSHA256:sha(fs.readFileSync(out)),colliders:physical.rows.length,supports:physical.walkables.length,removedSupportIndices:indices,retainedSupports:result.retainedSupports.length}));
}finally{hook.deregister();W?.dispose();delete globalThis.__wenhuaBaselineObserver;}
