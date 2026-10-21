// Audited delta, not a regenerated first18 baseline. Every approved field is
// locked to fixed before/after values, then proven by reversible source edits.
// In-memory variants only: this test never writes a source or baseline file.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {CourtKit} from '../src/scene/palace/kit.js';
import {buildWenyuanPavilion} from '../src/scene/palace/special/WenyuanPavilion.js';
import {buildYudeBath} from '../src/scene/palace/special/YudeBath.js';
import {library} from './lib/inner-palace-fixture.mjs';
import * as liveApi from '../src/scene/palace/special/RemainingOuterHalls.js';
import {retentionSignature as liveRetentionSignature} from './r48-outer-retention-helper.mjs';
import {revertFinalFourExtension} from './r48-outer-first21-helper.mjs';
import {revertFinalPairExtension} from './r48-outer-final-pair-retention-helper.mjs';

const baselineURL=new URL('../docs/current-state/r48-remaining/outer-first18-retained-signatures.json',import.meta.url);
const baselineBytes=readFileSync(baselineURL),baseline=JSON.parse(baselineBytes);
const delta=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/outer-safety-retention-delta.json',import.meta.url)));
const scope=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/outer-scope.json',import.meta.url)));
const moduleURL=new URL('../src/scene/palace/special/RemainingOuterHalls.js',import.meta.url);
const productionSource=readFileSync(moduleURL,'utf8');
const extension=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/outer-final-four-source-delta.json',import.meta.url)));
// Preserve all original historical assertions against a3baa after explicitly
// removing the four new identity implementations. Live old-identity behavior
// remains checked below and independently by the first21 frozen checkpoint.
const finalPair=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/outer-final-pair-source-delta.json',import.meta.url)));
const source=revertFinalFourExtension(revertFinalPairExtension(productionSource,finalPair),extension);
const sha=value=>createHash('sha256').update(value).digest('hex');
const encode=value=>sha(JSON.stringify(value));
const FIELDS=['geometry','meshes','triangles','colliders','walkables','rooms','regions','mapItems','navigation'];
const GEOMETRY=['geometry','meshes','triangles','colliders'];
const COLUMN_KEYS=['wenyuan','nanxun','hanqing','yanshou','baoxiang','jiyun','ciyin','cining','dafotang','yanchun','shouan'];
const ALLOWED_FIELDS={wenyuan:GEOMETRY,baoxiang:[...GEOMETRY,'walkables'],ciyin:GEOMETRY,
  ...Object.fromEntries(['nanxun','hanqing','yanshou','jiyun','cining','dafotang','yanchun','shouan'].map(key=>[key,['colliders']]))};
const CHANGE_IDS=['column-bottom-radius','temple-visible-undercroft-guards','baoxiang-finer-treads','baoxiang-bottom-run','baoxiang-niche-grid-proxies','baoxiang-bottom-approach','wenyuan-visible-undercroft-guards','wenyuan-screen-rail-proxies','wenyuan-inherited-component-proxies'];
const byId=new Map(delta.records.map(record=>[record.id,record]));
const rows=baseline.records.map(record=>scope.find(row=>row.id===record.id));

function replaceExactlyOnce(text,from,to,label){
  assert.equal(text.split(from).length-1,1,label+' must identify exactly one source edit');
  return text.replace(from,to);
}
function sourceDataURL(text,base,overrides={}){
  const rewritten=text.replace(/from\s*(['"])([^'"]+)\1/g,(_all,quote,name)=>{
    const url=overrides[name]??(name==='three'?import.meta.resolve('three'):name.startsWith('.')?new URL(name,base).href:name);
    return 'from '+quote+url+quote;
  });
  return 'data:text/javascript;base64,'+Buffer.from(rewritten).toString('base64');
}
async function loadVariant(text){
  const apiURL=sourceDataURL(text,moduleURL),api=await import(apiURL);
  const helperURL=new URL('./r48-outer-retention-helper.mjs',import.meta.url);
  const helper=await import(sourceDataURL(readFileSync(helperURL,'utf8'),helperURL,{
    '../src/scene/palace/special/RemainingOuterHalls.js':apiURL,
  }));
  return {api,retentionSignature:helper.retentionSignature};
}
// Keep the original nine-change acceptance stage intact. The follow-up is
// appended, then reversed separately before replaying the historical proofs.
const followups=delta.followupDeltas??[];
assert.equal(followups.length,1,'one explicitly reviewed follow-up');
let priorSource=source;
for(const stage of [...followups].reverse())for(const change of [...stage.sourceChanges].reverse())for(const edit of [...change.edits].reverse())
  priorSource=replaceExactlyOnce(priorSource,edit.after,edit.before,change.id);
assert.equal(sha(priorSource),delta.reviewedModuleSha256,'undo follow-up restores the complete 793100dc module, including original sill geometry code');
const prior=await loadVariant(priorSource),currentApi=prior.api,retentionSignature=prior.retentionSignature;
let restoredSource=priorSource;
for(const change of delta.sourceChanges)restoredSource=replaceExactlyOnce(restoredSource,change.after,change.before,change.id);
const restored=await loadVariant(restoredSource);

function withBuilt(api,row,inspect){
  const kit=new CourtKit(library(),row.zone),profile=api.resolveRemainingProfile(row.zone,row.baselineItem);
  try{
    const built=profile.mode==='replace'?api.buildRemainingHall(kit,row.baselineItem,profile):
      api.augmentRemainingHall(kit,row.baselineItem,profile.key==='wenyuan'?buildWenyuanPavilion(kit,row.baselineItem):
        profile.key==='yude'?buildYudeBath(kit,row.baselineItem):kit.hall(row.baselineItem),profile);
    kit.buildPlaqueAtlas();kit.root.updateMatrixWorld(true);
    return inspect({kit,built,profile});
  }finally{kit.dispose(kit.root);}
}
function meshes(root){const out=[];root.traverse(mesh=>{if(mesh.isMesh)out.push(mesh);});return out;}
function meshFingerprint(mesh){
  const geometry=mesh.geometry;
  return encode({name:mesh.name,matrix:mesh.matrixWorld.elements,
    materials:(Array.isArray(mesh.material)?mesh.material:[mesh.material]).map(m=>({name:m.name,color:m.color?.getHex(),side:m.side,transparent:m.transparent,opacity:m.opacity})),
    index:geometry.index?Array.from(geometry.index.array):null,
    attributes:Object.fromEntries(Object.entries(geometry.attributes).map(([name,a])=>[name,Array.from(a.array)])),
  });
}
const isGuard=mesh=>mesh.name.includes('-access-safety-stair-under-');
const isContextColumn=mesh=>mesh.geometry.type==='CylinderGeometry'&&mesh.userData.remainingOuterId&&
  mesh.geometry.parameters.radiusBottom===mesh.geometry.parameters.radiusTop*1.05;
function evidence(api,row){return withBuilt(api,row,({kit,built})=>{
  const contextColumnRoles={},individualInheritedProxyCounts={};
  let safetyMeshes=0;
  for(const mesh of meshes(built.f)){
    if(isContextColumn(mesh))contextColumnRoles[mesh.name]=(contextColumnRoles[mesh.name]??0)+1;
    if(isGuard(mesh))safetyMeshes++;
    if(mesh.userData.actualComponentProxy){const key=mesh.material.name+' / '+mesh.geometry.type;individualInheritedProxyCounts[key]=(individualInheritedProxyCounts[key]??0)+1;}
  }
  return {contextColumnRoles,individualInheritedProxyCounts,safetyMeshes,colliders:kit.colliders.length,
    walkables:kit.walkables.length,stairTreads:meshes(built.f).filter(m=>m.name.endsWith('-stair-tread')).length,navigation:encode(built.g?.navigation??null)};
});}
const boxEqual=(a,b,tolerance=1e-7)=>['min','max'].every(end=>['x','y','z'].every(axis=>Math.abs(a[end][axis]-b[end][axis])<=tolerance));
function hasCollider(kit,box,label){assert.ok(kit.colliders.some(c=>boxEqual(c,box)),label);}
function localBox(f,min,max){return new THREE.Box3(new THREE.Vector3(...min),new THREE.Vector3(...max)).applyMatrix4(f.matrixWorld);}

// RED counterpart: the historical exact-only test fails for these 11 identities.
// This suite admits only the field matrix below; no broad ignore or regeneration.
test('R48 safety delta preserves immutable fcb22fe6 baseline bytes and exact identity set',()=>{
  assert.equal(sha(baselineBytes),'6b20b5dcec05ee4151a3234dfa2b30ecdf724f7ba602683b30c23848f235ac47');
  assert.equal(baseline.sourceModuleSha256,'fcb22fe64d01bbcadb39912842c4830af0f21574d0add38094a0efa11ff4a60d');
  assert.equal(delta.baseline.sha256,sha(baselineBytes));
  assert.equal(delta.baseline.sourceModuleSha256,baseline.sourceModuleSha256);
  assert.equal(baseline.records.length,18);assert.equal(new Set(byId.keys()).size,18);
  assert.deepEqual(delta.records.map(r=>r.id),baseline.records.map(r=>r.id));
  assert.deepEqual(delta.signatureFields,FIELDS);
  assert.deepEqual(delta.sourceChanges.map(c=>c.id),CHANGE_IDS);
  assert.equal(delta.records.filter(r=>!Object.keys(r.changes).length).length,7);
  assert.equal(delta.records.filter(r=>Object.keys(r.changes).length===1).length,8);
});
test('R48 safety delta is anchored to exact reviewed source edits, not a current blind snapshot',()=>{
  for(const change of delta.sourceChanges){
    assert.equal(sha(change.before),change.beforeSourceSha256,change.id+' frozen old edit');
    assert.equal(sha(change.after),change.afterSourceSha256,change.id+' reviewed new edit');
    assert.equal(source.split(change.after).length-1,1,change.id+' still present once');
    assert.ok(change.reason.length>30,change.id+' needs a substantive cause');
  }
  for(const helper of delta.sourceHelpers){assert.equal(sha(helper.source),helper.sourceSha256);assert.ok(source.includes(helper.source),helper.name+' changed after safety review');}
});
for(const [index,record] of baseline.records.entries())test(`R48 explicit safety delta retains every non-approved field: ${record.name}`,()=>{
  const row=rows[index],review=byId.get(record.id),now=retentionSignature(row);
  assert.equal(review.name,record.name);
  assert.equal(currentApi.resolveRemainingProfile(row.zone,row.baselineItem).key,review.key);
  assert.deepEqual(Object.keys(review.changes),ALLOWED_FIELDS[review.key]??[],record.name+' field whitelist');
  assert.deepEqual(Object.keys(now),FIELDS);
  for(const field of FIELDS){
    const change=review.changes[field];
    if(!change){assert.equal(now[field],record.signature[field],record.name+' retained '+field);continue;}
    assert.equal(change.before,record.signature[field],record.name+' frozen before '+field);
    assert.notEqual(change.before,change.after,record.name+' no redundant wildcard '+field);
    assert.equal(encode(change.before),change.beforeValueSha256);
    assert.equal(encode(change.after),change.afterValueSha256);
    assert.ok(change.reasons.length,record.name+' '+field+' must have a source cause');
    const causes=delta.sourceChanges.filter(c=>c.effects.some(e=>e.id===record.id&&e.fields.includes(field))).map(c=>c.id);
    assert.deepEqual(change.reasons,causes,record.name+' source causes '+field);
    assert.equal(now[field],change.after,record.name+' fixed after '+field);
  }
  assert.deepEqual(restored.retentionSignature(row),record.signature,record.name+' undo only reviewed safety edits restores every baseline field');
  const before=evidence(restored.api,row),after=evidence(currentApi,row),count=review.componentEvidence;
  assert.deepEqual(after.contextColumnRoles,count.contextColumnRoles);
  assert.deepEqual(after.individualInheritedProxyCounts,count.individualInheritedProxyCounts);
  assert.equal(before.safetyMeshes,count.safetyMeshesBefore);assert.equal(after.safetyMeshes,count.safetyMeshesAfter);
  assert.equal(before.colliders,count.colliderCountBefore);assert.equal(after.colliders,count.colliderCountAfter);
  assert.equal(before.walkables,count.walkableCountBefore);assert.equal(after.walkables,count.walkableCountAfter);
  assert.equal(before.stairTreads,count.stairTreadCountBefore);assert.equal(after.stairTreads,count.stairTreadCountAfter);
  assert.equal(before.navigation,review.actualNavigation.before);assert.equal(after.navigation,review.actualNavigation.after);
  assert.equal(before.navigation!==after.navigation,review.key==='baoxiang','actual built navigation changes only at Baoxiang');
});
for(const change of delta.sourceChanges)test(`R48 single-edit causal attribution: ${change.id}`,async()=>{
  const one=await loadVariant(replaceExactlyOnce(restoredSource,change.before,change.after,change.id));
  const effects=[];
  for(const [index,record] of baseline.records.entries()){
    const row=rows[index],sig=one.retentionSignature(row),fields=FIELDS.filter(f=>sig[f]!==record.signature[f]);
    const actualNavigationChanged=evidence(one.api,row).navigation!==byId.get(record.id).actualNavigation.before;
    if(fields.length||actualNavigationChanged)effects.push({id:row.id,name:row.name,fields,actualNavigationChanged});
  }
  assert.deepEqual(effects,change.effects,change.id+' must affect only these identities and fields');
});

test('R48 radius correction reaches exactly 11 context-column identities and covers the rendered 1.05r bases',()=>{
  const seen=[];
  for(const row of rows)withBuilt(currentApi,row,({kit,built,profile})=>{
    const columns=meshes(built.f).filter(isContextColumn);if(columns.length)seen.push(profile.key);
    for(const column of columns){
      const p=column.geometry.parameters,r=p.radiusBottom,{x,y,z}=column.position;
      hasCollider(kit,localBox(built.f,[x-r,y-p.height/2,z-r],[x+r,y+p.height/2,z+r]),profile.key+' '+column.name+' bottom-radius proxy');
    }
  });
  assert.deepEqual(seen,COLUMN_KEYS);
});
for(const key of ['wenyuan','ciyin','baoxiang'])test(`R48 ${key} retains every mesh outside the explicitly changed stair/floor region`,()=>{
  const row=rows.find(r=>currentApi.resolveRemainingProfile(r.zone,r.baselineItem).key===key);
  const excluded=mesh=>isGuard(mesh)||(key==='baoxiang'&&['baoxiang-stair-tread','baoxiang-stair-riser','baoxiang-stair-guard-post','baoxiang-stair-guard','baoxiang-upper-floor'].includes(mesh.name));
  const fingerprints=api=>withBuilt(api,row,({built})=>meshes(built.f).filter(m=>!excluded(m)).map(meshFingerprint));
  assert.deepEqual(fingerprints(currentApi),fingerprints(restored.api),'All old doors, beams, columns, enclosure/furniture/roof meshes outside the precise safety-edit roles remain byte-for-byte');
  withBuilt(currentApi,row,({kit,built})=>{
    const guards=meshes(built.f).filter(isGuard);
    assert.equal(guards.length,{wenyuan:44,ciyin:18,baoxiang:28}[key]);
    for(const guard of guards){
      assert.equal(guard.userData.source,null);assert.equal(guard.userData.status,'MODEL_ACCESS_SAFETY_FIT_NOT_HISTORIC_OBJECT');
      assert.equal(guard.geometry.type,'BoxGeometry');
      const p=guard.geometry.parameters;assert.ok(Math.min(p.width,p.height,p.depth)<=.06,'guard is a thin individual component, not a whole-flight fill');
      const {x,y,z}=guard.position;hasCollider(kit,localBox(built.f,[x-p.width/2,y-p.height/2,z-p.depth/2],[x+p.width/2,y+p.height/2,z+p.depth/2]),guard.name+' has only a visible member envelope');
    }
  });
});
test('R48 Wenyuan retained old doors/beams/columns/upstairs enclosure have individual visible proxies',()=>{
  const row=rows.find(r=>r.name==='文渊阁');
  withBuilt(currentApi,row,({kit,built})=>{
    const oldComponents=meshes(built.f).filter(m=>m.userData.actualComponentProxy);
    assert.equal(oldComponents.length,51);
    for(const mesh of oldComponents){
      const proxy=mesh.userData.actualComponentProxy;
      assert.equal(proxy.status,'VISIBLE_COMPONENT_BOUNDING_BOX_NOT_INVISIBLE_ROOM_FILL');
      assert.equal(proxy.lowerHeadMargin,mesh.material.name==='caihua_beam'?.05:0);
      mesh.geometry.computeBoundingBox();const relative=new THREE.Matrix4().copy(built.f.matrixWorld).invert().multiply(mesh.matrixWorld);
      const actual=mesh.geometry.boundingBox.clone().applyMatrix4(relative);
      assert.deepEqual(proxy.bounds,{min:actual.min.toArray(),max:actual.max.toArray()},'proxy derives from this mesh, not a room or group');
      actual.min.y-=proxy.lowerHeadMargin;hasCollider(kit,actual.applyMatrix4(built.f.matrixWorld),mesh.material.name+' individual proxy');
    }
    const rails=meshes(built.f).filter(m=>m.name==='wenyuan-ground-photo-screen-rail');assert.equal(rails.length,5);
    for(const rail of rails){const p=rail.geometry.parameters,{x,y,z}=rail.position;hasCollider(kit,localBox(built.f,[x-p.width/2,y-p.height/2,z-p.depth/2],[x+p.width/2,y+p.height/2,z+p.depth/2]),'existing photo rail proxy');}
  });
});
test('R48 Baoxiang retains end doors/lightwells while the accepted 5 cm/47-tread fit replaces rejected 65 cm plan',()=>{
  const row=rows.find(r=>r.name==='宝相楼');
  const historic=withBuilt(restored.api,row,({built})=>({stairs:built.g.stairs,endDoors:built.g.endDoors,lightwells:built.g.lightwells}));
  withBuilt(currentApi,row,({kit,built})=>{
    assert.deepEqual(built.g.endDoors,historic.endDoors);assert.deepEqual(built.g.lightwells,historic.lightwells);
    for(const [index,s] of built.g.stairs.entries()){
      assert.ok(Math.abs(s.z0-(historic.stairs[index].z0-.05))<1e-12);
      for(const field of ['x','width','z1','index'])assert.equal(s[field],historic.stairs[index][field]);
      assert.equal(s.accessFit,'BOTTOM_RUN_EXTENDED_0_05M_AND_FINER_TREADS_FOR_PRODUCTION_BODY_CLEARANCE');
      assert.equal(meshes(built.f).filter(m=>m.name==='baoxiang-stair-tread'&&m.userData.stair===s.index).length,47);
      assert.equal(meshes(built.f).filter(m=>m.name==='baoxiang-stair-riser'&&m.userData.stair===s.index).length,46);
    }
    const niche=meshes(built.f).filter(m=>m.name==='baoxiang-upper-niche-grid');assert.equal(niche.length,44);
    for(const bar of niche){const p=bar.geometry.parameters,{x,y,z}=bar.position;hasCollider(kit,localBox(built.f,[x-p.width/2,y-p.height/2,z-p.depth/2],[x+p.width/2,y+p.height/2,z+p.depth/2]),'retained niche-grid bar');}
  });
});
// Mutation proof uses an unapproved material change outside all safety roles.
// A newly generated broad after-snapshot would miss this; exact inverse replay
// and the fixed-field checker must reject it, without editing production files.
test('R48 rejection proof: an unapproved old-wall recolor fails immutable restoration',async()=>{
  const needle='wall:0x9f5240',mutant=await loadVariant(replaceExactlyOnce(restoredSource,needle,'wall:0x9f5241','mutation fixture'));
  const row=rows.find(r=>r.name==='慈荫楼'),expected=baseline.records.find(r=>r.id===row.id).signature;
  const actual=mutant.retentionSignature(row);
  assert.throws(()=>assert.deepEqual(actual,expected),assert.AssertionError);
  assert.notEqual(actual.geometry,expected.geometry);
  for(const field of FIELDS.filter(f=>f!=='geometry'))assert.equal(actual[field],expected[field]);
});

// Tenth source group: the 793100dc record above is not overwritten. Its only
// successor adds a cap-backed entry tread/support and one exact sill-front fit.
const entryStage=followups[0],entryReview=entryStage.records[0];
function priorExpected(record){
  const out={...record.signature};for(const [field,change] of Object.entries(byId.get(record.id).changes))out[field]=change.after;
  return out;
}
function finalExpected(record){
  const out=priorExpected(record);
  for(const stage of followups){
    const review=stage.records.find(r=>r.id===record.id);if(!review)continue;
    for(const [field,change] of Object.entries(review.changes)){
      assert.equal(change.before,out[field],stage.id+' must start at the previous accepted value, not the frozen baseline');
      assert.equal(encode(change.before),change.beforeValueSha256);assert.equal(encode(change.after),change.afterValueSha256);
      out[field]=change.after;
    }
  }
  return out;
}
test('R48 entry follow-up appends to, rather than replaces, the exact nine-change ledger and source stage',()=>{
  assert.equal(entryStage.id,'wenyuan-entry-clearance-followup');
  assert.equal(entryStage.fromModuleSha256,'793100dc22cf801751ffd8a8e93be43d58ccfa17c79d49fe4701f225898a6290');
  assert.equal(entryStage.toModuleSha256,'a3baa8766f7e2df13f98fb53802a5d3332082983d652b540c1599d44fe792f91');
  assert.equal(sha(source),entryStage.toModuleSha256);assert.equal(sha(priorSource),entryStage.fromModuleSha256);
  for(const [property,binding] of [['sourceChanges','sourceChangesSha256'],['records','recordsSha256'],['sourceHelpers','sourceHelpersSha256'],['baseline','baselineSha256'],['verification','verificationSha256']])
    assert.equal(encode(delta[property]),entryStage.priorLedgerBindings[binding],'previous '+property+' must not be refreshed');
  assert.equal(entryStage.records.length,1);assert.equal(entryReview.id,'place-outer-east-fd3d76e74d');
  assert.deepEqual(Object.keys(entryReview.changes),['geometry','meshes','triangles','walkables']);
  assert.equal(entryStage.sourceChanges.length,1);assert.equal(entryStage.sourceChanges[0].id,'wenyuan-visible-entry-clearance');
  assert.equal(entryStage.sourceChanges[0].edits.length,2,'whole visible-entry/sill-fit block plus returned metadata');
  for(const edit of entryStage.sourceChanges[0].edits){assert.equal(sha(edit.before),edit.beforeSourceSha256);assert.equal(sha(edit.after),edit.afterSourceSha256);}
  for(const change of Object.values(entryReview.changes))assert.deepEqual(change.reasons,['wenyuan-visible-entry-clearance']);
});
for(const [index,record] of baseline.records.entries())test(`R48 final chained retention after entry clearance: ${record.name}`,()=>{
  const expected=finalExpected(record),actual=liveRetentionSignature(rows[index]);
  assert.deepEqual(actual,expected);
  const before=retentionSignature(rows[index]);
  assert.deepEqual(FIELDS.filter(field=>before[field]!==actual[field]),record.id===entryReview.id?['geometry','meshes','triangles','walkables']:[]);
  assert.equal(evidence(liveApi,rows[index]).navigation,evidence(currentApi,rows[index]).navigation,'all 18 actual built routes survive the entry patch');
});
test('R48 tenth source group alone produces exactly the four appended Wenyuan fields',async()=>{
  let reapplied=priorSource;
  for(const edit of entryStage.sourceChanges[0].edits)reapplied=replaceExactlyOnce(reapplied,edit.before,edit.after,'entry reapply');
  assert.equal(reapplied,source,'forward exact edit also restores the approved module byte-for-byte');
  const candidate=await loadVariant(reapplied),effects=[];
  for(const [index,record] of baseline.records.entries()){
    const before=retentionSignature(rows[index]),after=candidate.retentionSignature(rows[index]);
    const fields=FIELDS.filter(field=>before[field]!==after[field]);
    const actualNavigationChanged=evidence(currentApi,rows[index]).navigation!==evidence(candidate.api,rows[index]).navigation;
    if(fields.length||actualNavigationChanged)effects.push({id:record.id,name:record.name,fields,actualNavigationChanged});
  }
  assert.deepEqual(effects,entryStage.sourceChanges[0].effects);
});
function entryCapture(api){
  const row=rows.find(r=>r.id===entryReview.id);
  return withBuilt(api,row,({kit,built})=>{
    const all=meshes(built.f),targets=all.filter(m=>m.material.name==='wenyuan_sourced_green_wood_columns'&&Math.abs(m.position.x+3.375)<1e-8&&Math.abs(m.position.y-.61)<1e-8);
    assert.equal(targets.length,1,'exact inherited sill, not arbitrary nearby green mesh');
    const sill=targets[0],tread=all.find(m=>m.name==='wenyuan-access-safety-entry-tread');
    const info=mesh=>{
      mesh.geometry.computeBoundingBox();const local=mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrix),world=new THREE.Box3().setFromObject(mesh);
      return {fingerprint:meshFingerprint(mesh),position:mesh.position.toArray(),localBounds:{min:local.min.toArray(),max:local.max.toArray()},worldBounds:{min:world.min.toArray(),max:world.max.toArray()},geometryPositionsSha256:encode([...mesh.geometry.attributes.position.array])};
    };
    return {sill:info(sill),tread:tread?info(tread):null,otherMeshes:all.filter(m=>m!==sill&&m!==tread).map(meshFingerprint),
      sillAttributes:Object.fromEntries(Object.entries(sill.geometry.attributes).map(([name,a])=>[name,[...a.array]])),sillIndex:sill.geometry.index?[...sill.geometry.index.array]:null,
      walkables:structuredClone(kit.walkables),colliders:structuredClone(kit.colliders),actualNavigationSha256:encode(built.g.navigation),metadata:structuredClone(built.g.accessSafetyEntryStep??null)};
  });
}
test('R48 entry follow-up changes one old sill only; all other old mesh and collider bytes remain exact',()=>{
  const before=entryCapture(currentApi),after=entryCapture(liveApi),review=entryReview.componentEvidence;
  assert.deepEqual(before.sill,review.inheritedFrontSill.before);assert.deepEqual(after.sill,review.inheritedFrontSill.after);
  assert.deepEqual(after.tread,review.newVisibleEntryTread);
  assert.deepEqual(after.otherMeshes,before.otherMeshes);assert.equal(encode(after.otherMeshes),review.allOtherMeshFingerprintsSha256);
  assert.deepEqual(after.colliders,before.colliders,'no unrelated collision exception or altered original collider');
  assert.equal(before.actualNavigationSha256,after.actualNavigationSha256);assert.deepEqual(review.actualNavigation,{before:before.actualNavigationSha256,after:after.actualNavigationSha256});
  assert.deepEqual(after.metadata,review.entryMetadata);
});
test('R48 accepted sill fit keeps width/height/rear, changes only depth .30 to .22 and centre Z plus .04',()=>{
  const before=entryCapture(currentApi),after=entryCapture(liveApi);
  assert.equal(after.sill.position[0],before.sill.position[0]);assert.equal(after.sill.position[1],before.sill.position[1]);
  assert.ok(Math.abs(after.sill.position[2]-before.sill.position[2]-.04)<1e-12);
  assert.deepEqual(after.sillIndex,before.sillIndex);
  assert.deepEqual(after.sillAttributes.uv,before.sillAttributes.uv);
  assert.deepEqual(after.sillAttributes.normal,before.sillAttributes.normal);
  const oldPositions=before.sillAttributes.position,newPositions=after.sillAttributes.position;assert.equal(newPositions.length,oldPositions.length);
  for(let index=0;index<oldPositions.length;index++)assert.equal(newPositions[index],index%3===2?Math.fround(oldPositions[index]*(.22/.30)):oldPositions[index]);
  const b=before.sill.worldBounds,a=after.sill.worldBounds;
  for(const axis of [0,1]){assert.equal(a.min[axis],b.min[axis]);assert.equal(a.max[axis],b.max[axis]);}
  assert.ok(Math.abs(a.min[2]-b.min[2]-.08)<1e-7);assert.ok(Math.abs(a.max[2]-b.max[2])<1e-7);
  assert.ok(Math.abs(a.max[1]-.72)<1e-7,'original 0.72 m sill top retained, not lowered to evade body detection');
});
test('R48 entry follow-up adds one exact no-rescue support and every old walkable stays in order',()=>{
  const before=entryCapture(currentApi),after=entryCapture(liveApi),review=entryReview.componentEvidence;
  assert.equal(before.walkables.length,29);assert.equal(after.walkables.length,30);
  assert.deepEqual(review.walkableCount,{before:29,after:30});
  const retained=[...after.walkables],added=retained.splice(review.newSupport.index,1)[0];
  assert.deepEqual(added,review.newSupport.value);assert.deepEqual(retained,before.walkables);
  assert.equal(added.rescue,false);assert.equal(added.type,'box');
  assert.deepEqual(added.box.min,{x:-192.91,y:.51,z:-142.4});assert.deepEqual(added.box.max,{x:-186.84,y:.51,z:-142.25});
});
test('R48 new 9 cm stone tread meets the retained cap; all added support has visible same-height top',()=>{
  const row=rows.find(r=>r.id===entryReview.id);
  withBuilt(liveApi,row,({built})=>{
    const all=meshes(built.f),tread=all.find(m=>m.name==='wenyuan-access-safety-entry-tread'),b=new THREE.Box3().setFromObject(tread);
    assert.equal(tread.userData.source,null);assert.equal(tread.userData.status,'MODEL_ACCESS_SAFETY_FIT_NOT_HISTORIC_OBJECT');
    for(const [actual,expected] of [[b.min.x,-192.91],[b.max.x,-186.84],[b.min.z,-142.4],[b.max.z,-142.31],[b.min.y,0],[b.max.y,.51]])assert.ok(Math.abs(actual-expected)<1e-6);
    const cap=all.find(m=>m!==tread&&m.material.name==='stone_slab'&&Math.abs(new THREE.Box3().setFromObject(m).max.y-.51)<1e-6&&new THREE.Box3().setFromObject(m).min.z<-142.30);
    assert.ok(cap,'retained projecting cap supplies the last .06 m, not invisible air');
    const capBox=new THREE.Box3().setFromObject(cap);assert.ok(Math.abs(capBox.min.z-b.max.z)<1e-6);
    const ray=new THREE.Raycaster(),support=entryReview.componentEvidence.newSupport.value.box;let samples=0;
    for(let x=support.min.x+.01;x<support.max.x;x+=.2)for(let z=support.min.z+.003;z<support.max.z;z+=.015){
      ray.set(new THREE.Vector3(x,.7,z),new THREE.Vector3(0,-1,0));ray.far=.3;
      const hit=ray.intersectObjects([tread,cap],false)[0];assert.ok(hit,'new support must be real tread or unchanged cap');assert.ok(Math.abs(hit.point.y-.51)<1e-6);assert.ok(hit.face.normal.clone().transformDirection(hit.object.matrixWorld).y>.99);samples++;
    }
    assert.ok(samples>250);
    const sill=all.find(m=>m.userData.r48EntrySafetyFit);assert.ok(sill);
    const separation=new THREE.Box3().setFromObject(sill).min.z-b.min.z;
    assert.ok(Math.abs(separation-.58)<1e-6);assert.ok(Math.abs(separation-.5-.08)<1e-6,'retain an actual .08 m margin beyond production .5 m body radius');
  });
});
test('R48 entry follow-up rejection proof: widening the fitted sill cannot hide behind the appended snapshot',async()=>{
  const from='entrySill.geometry.scale(1,1,.22/.30)',to='entrySill.geometry.scale(1,1,.23/.30)';
  const mutant=await loadVariant(replaceExactlyOnce(source,from,to,'unapproved sill widening'));
  const record=baseline.records.find(r=>r.id===entryReview.id),row=rows.find(r=>r.id===entryReview.id);
  const actual=mutant.retentionSignature(row),expected=finalExpected(record);
  assert.throws(()=>assert.deepEqual(actual,expected),assert.AssertionError);assert.notEqual(actual.geometry,expected.geometry);
  for(const field of FIELDS.filter(f=>f!=='geometry'))assert.equal(actual[field],expected[field]);
});
