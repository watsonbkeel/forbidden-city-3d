/** Read-only, world-free export for the readiness CPU reference.
 * Current male geometry must be byte-identical to the frozen CharacterKit.
 * The existing real Taihe triangle cache and original adapter binding are reused.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import * as THREE from 'three';
import {createCharacterGeometry} from '../src/scene/characters/CharacterKit.js';
import {CHARACTER_REGISTRY} from '../data/characters/index.js';

const root=process.cwd();
const frozen=path.resolve(root,'../r50-character-system');
const out=path.join(root,'reports/r50-followup/readiness-visual-v1');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const sourceHash=p=>sha(fs.readFileSync(p));
const cacheRel='reports/r50/c1-samples/world-seat-models.json';
const cachePath=fs.existsSync(path.join(root,cacheRel))?path.join(root,cacheRel):path.join(frozen,cacheRel);
const cacheBytes=fs.readFileSync(cachePath),cache=JSON.parse(cacheBytes);
const historicCheck=JSON.parse(fs.readFileSync(path.join(frozen,'reports/r50/c1-samples/world-seat-same-source-check.json')));
assert.equal(sha(cacheBytes),historicCheck.hashes['world-seat-models.json'],'actual furniture cache must match frozen provenance');
const checkedSources={};
for(const [relative,expected] of Object.entries(cache.hashes)) {
  const actual=sourceHash(path.join(root,relative));
  if(!relative.endsWith('/CharacterKit.js'))assert.equal(actual,expected,`cached scene source changed: ${relative}`);
  else assert.equal(sourceHash(path.join(frozen,relative)),expected,'frozen Kit must match original cache source');
  checkedSources[relative]={cached:expected,current:actual,exactlyUnchanged:actual===expected};
}
const model=cache.models.find(m=>m.id==='taihe-emperor-01');
assert.ok(model,'actual Taihe emperor cache required');
const actor=CHARACTER_REGISTRY.actors.find(a=>a.id===model.id);
assert.deepEqual(actor,model.metadata.actor,'the original actor and placement must be retained');
assert.equal(model.metadata.binding.status,'ready');
const {createCharacterGeometry:createFrozenGeometry}=await import(pathToFileURL(path.join(frozen,'src/scene/characters/CharacterKit.js')));
const args=[actor.templateId,'seated',0,{seatVariant:actor.behavior.seatVariant}];
const current=createCharacterGeometry(...args),original=createFrozenGeometry(...args);
const bytes=a=>Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength);
const maleComparisons=[];
assert.deepEqual(Object.keys(current.attributes),Object.keys(original.attributes));
for(const key of [...Object.keys(current.attributes),'index']) {
  const a=key==='index'?current.index:current.attributes[key],b=key==='index'?original.index:original.attributes[key];
  assert.equal(a.array.constructor.name,b.array.constructor.name,key);
  assert.equal(a.itemSize,b.itemSize,key);assert.equal(a.count,b.count,key);assert.ok(bytes(a).equals(bytes(b)),`male ${key} differs from frozen`);
  maleComparisons.push({attribute:key,count:a.count,itemSize:a.itemSize,type:a.array.constructor.name,sha256:sha(bytes(a)),byteIdentical:true});
}
for(const key of ['bodyHeightMeters','seatVariant','seatPelvis','seatContact','groundContacts'])assert.deepEqual(current.userData[key],model.metadata.kit[key],`original binding invariant: ${key}`);
// Expand in the exact order used by p3c-render-world-seats-export.mjs.
const mesh={positions:[],normals:[],colors:[],indices:[]};
for(const vi of current.index.array) {
  const p=new THREE.Vector3().fromBufferAttribute(current.attributes.position,vi).applyMatrix4(new THREE.Matrix4());
  const n=new THREE.Vector3().fromBufferAttribute(current.attributes.normal,vi).applyMatrix3(new THREE.Matrix3()).normalize();
  const c=new THREE.Color(0xffffff).multiply(new THREE.Color().fromBufferAttribute(current.attributes.color,vi));
  mesh.indices.push(mesh.positions.length/3);mesh.positions.push(...p);mesh.normals.push(...n);mesh.colors.push(c.r,c.g,c.b);
}
assert.equal(JSON.stringify(mesh),JSON.stringify(model.mesh),'current expanded male triangles must exactly match cached original male triangles');
const rendererPath='src/scene/characters/CharacterRenderer.js',managerPath='src/scene/characters/CharacterManager.js';
const renderer=fs.readFileSync(rendererPath,'utf8'),manager=fs.readFileSync(managerPath,'utf8');
const thresholdExpression='(mod(cp.x,2.0)*8.0 + mod(cp.y,2.0)*4.0 + floor(cp.x/2.0)*2.0 + floor(cp.y/2.0) + 0.5)/16.0';
assert.ok(renderer.includes('vec2 cp = mod(floor(gl_FragCoord.xy), 4.0);'));
assert.ok(renderer.includes(thresholdExpression));assert.ok(renderer.includes('if(vCharacterVisibility <= ct) discard;'));
assert.ok(renderer.includes('mesh.castShadow=false;'));
assert.ok(manager.includes('state.readiness=Math.min(1,state.readiness+elapsed/.35);'));
assert.ok(manager.includes('const visibility=state.visibility*state.readiness;'));
const readinessProgress=[];let readiness=0;
for(let frame=0;frame<=21;frame++){if(frame>0)readiness=Math.min(1,readiness+(1/60)/.35);if(frame%7===0)readinessProgress.push({frame,seconds:frame/60,readiness,scheduledVisibility:1,characterVisibility:readiness});}
const result={evidence:'CPU software reference only, not browser/GPU screenshot, not a full loading recording. The timeline begins at binding ready, not scene load.',createdAt:new Date().toISOString(),source:{cachePath:path.relative(root,cachePath),cacheSha256:sha(cacheBytes),checkedSources,currentRendererSha256:sourceHash(rendererPath),currentManagerSha256:sourceHash(managerPath),currentKitSha256:sourceHash('src/scene/characters/CharacterKit.js'),frozenKitSha256:sourceHash(path.join(frozen,'src/scene/characters/CharacterKit.js')),maleComparisons,currentExpandedTrianglesEqualFrozenCache:true,fixturesSha256:sha(JSON.stringify(model.fixtures)),fixtureMeshCount:model.fixtures.length,fixtureTriangles:model.fixtures.reduce((n,m)=>n+m.indices.length/3,0),bindingReusedUnmodified:model.metadata.binding},screenDoor:{grid:[4,4],fragmentOrigin:'bottom-left',thresholdExpression,discard:'characterVisibility <= threshold',alphaBlending:false,shadowGenerated:false,readinessFadeSeconds:.35},readinessProgress,limitations:['No palace world reconstruction or new adapter binding was performed.','The scene contains only the cached local actual Taihe triangle crop, not the entire palace.','Material base colors only; CPU review lighting and no projected character shadow.','Single actor readiness is not whole-scene NPC loading progress; global timed progress belongs to the separate benchmark JSON.','Scheduled visibility is fixed at one; idle animation is held still to isolate readiness coverage.','Female appearance remains unapproved; production rollout remains false.'],model:{...model,mesh}};
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'readiness-source.json'),JSON.stringify(result));
const {model:ignored,...provenance}=result;
fs.writeFileSync(path.join(out,'readiness-provenance.json'),JSON.stringify(provenance,null,2));
current.dispose();original.dispose();
console.log(JSON.stringify({out:path.relative(root,out),sourceSha256:sourceHash(path.join(out,'readiness-source.json')),fixtureTriangles:result.source.fixtureTriangles,maleTriangles:mesh.indices.length/3,maleByteIdentical:true,originalBindingRetained:true},null,2));
