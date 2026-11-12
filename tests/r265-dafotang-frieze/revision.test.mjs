import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {T,fixture,candidate,beam,triangles} from './fixture.mjs';
import {loadPinnedLayout} from './source-view.mjs';
const reviewed=await loadPinnedLayout('reviewed6998');
const report={scope:'REVISION2_CONFORMANCE_AND_CONSTRUCTION_FAILURES',faults:[]};
const profileMetadata={endTreatment:'PLAIN_MODEL_RETURNS_NOT_SOURCE_CARVING',columnInset:.08,narrowBays:'UNCHANGED_PLAIN',dimensionStatus:'MODEL_FIT_NOT_SURVEY'};
test('indexed quads preserve every reviewed triangle, winding, UV and hard normal',async()=>{
 const a=fixture(),b=fixture();try{const old=beam(reviewed.buildDafotangHistoricLayout(a.context)).geometry,now=beam((await candidate()).buildDafotangHistoricLayout(b.context)).geometry;
  assert.ok(now.index,'approved indexed BufferGeometry required');assert.equal(now.index.count,4860);assert.equal(now.attributes.position.count,3240);assert.equal(now.attributes.normal.count,3240);assert.equal(now.attributes.uv.count,3240);assert.ok([...now.index.array].every(i=>Number.isInteger(i)&&i>=0&&i<3240));
  let normalSignedZeroDifferences=0;for(let i=0;i<now.index.count;i++){const ix=now.index.getX(i);for(const name of['position','normal','uv']){const actual=now.attributes[name],prior=old.attributes[name];for(let j=0;j<actual.itemSize;j++){const av=actual.array[ix*actual.itemSize+j],pv=prior.array[i*prior.itemSize+j];if(name==='normal'){assert.ok(av===pv,`${name} expanded component ${i}:${j}: ${av} != ${pv}`);if(!Object.is(av,pv))normalSignedZeroDifferences++;}else assert.equal(av,pv,`${name} expanded triangle component ${i}:${j}`);}}}
  assert.equal(triangles(now).length,1620);report.indexed={vertices:3240,indices:4860,triangles:1620,expandedPositionAndUVValuesMatchReviewed:true,expandedNormalValuesMatchReviewed:true,normalSignedZeroDifferences};
 }finally{a.dispose();b.dispose();}
});
test('only the exact beam-local metadata object is added; all prior metadata remains unchanged',async()=>{
 const a=fixture(),b=fixture();try{const old=reviewed.buildDafotangHistoricLayout(a.context),now=(await candidate()).buildDafotangHistoricLayout(b.context);assert.deepEqual(now.meta.lowerFrontEntablatureProfile,profileMetadata);assert.equal(b.context.g.historicLayout,now.meta);assert.equal(now.frame.userData.dafotangHistoricLayout,now.meta);
  const rest=structuredClone(now.meta);delete rest.lowerFrontEntablatureProfile;assert.deepEqual(rest,old.meta);assert.equal(Object.keys(now.meta).length,Object.keys(old.meta).length+1);report.metadata={onlyAddedKey:'lowerFrontEntablatureProfile',value:profileMetadata};
 }finally{a.dispose();b.dispose();}
});
// Real geometry allocation/finalization faults, not mock geometry. The selector
// accepts either reviewed nonindexed or corrected indexed beam vertex counts.
for(const stage of['position-attribute','uv-attribute','index','normal-computation','bounds-computation'])test('local construction failure disposes newly allocated beam once: '+stage,async()=>{
 const f=fixture(),{kit,g}=f.context,originalChildren=[...f.context.f.children],originalColliders=[...kit.colliders],originalOwned=[...kit.owned],originalSupport=originalChildren[0].children.map(m=>m.geometry),meta=structuredClone(g),proto=T.BufferGeometry.prototype;
 const saved={setAttribute:proto.setAttribute,setIndex:proto.setIndex,computeVertexNormals:proto.computeVertexNormals,computeBoundingBox:proto.computeBoundingBox,dispose:proto.dispose},disposed=new Map(),materialDisposed=new Map(),materialDispose=T.Material.prototype.dispose;let captured=null,error=null,triggered=false;
 const isBeam=geo=>[3240,4860].includes(geo.attributes.position?.count),fail=geo=>{captured=geo;triggered=true;throw Error('injected beam '+stage);};
 T.Material.prototype.dispose=function(...a){materialDisposed.set(this,(materialDisposed.get(this)??0)+1);return materialDispose.apply(this,a);};
 proto.dispose=function(...a){disposed.set(this,(disposed.get(this)??0)+1);return saved.dispose.apply(this,a);};
 proto.setAttribute=function(name,attribute){const out=saved.setAttribute.call(this,name,attribute);if((stage==='position-attribute'&&name==='position'||stage==='uv-attribute'&&name==='uv')&&isBeam(this))fail(this);return out;};
 proto.setIndex=function(index){const out=saved.setIndex.call(this,index);if(stage==='index'&&isBeam(this))fail(this);return out;};
 proto.computeVertexNormals=function(...a){if(stage==='normal-computation'&&isBeam(this))fail(this);return saved.computeVertexNormals.apply(this,a);};
 proto.computeBoundingBox=function(...a){if(stage==='bounds-computation'&&isBeam(this))fail(this);return saved.computeBoundingBox.apply(this,a);};
 try{try{(await candidate()).buildDafotangHistoricLayout(f.context);}catch(e){error=e;}
  assert.ok(triggered,'fault selector must actually execute');assert.match(error?.message??'',/injected beam/);assert.ok(captured);assert.equal(disposed.get(captured)??0,1,'locally allocated unregistered beam must be disposed once');assert.equal(disposed.size,7,'six registered columns plus one helper-local beam');assert.ok([...disposed.values()].every(n=>n===1));assert.equal(materialDisposed.size,2);assert.ok([...materialDisposed.values()].every(n=>n===1));for(const m of originalOwned)assert.ok(!materialDisposed.has(m));
  assert.deepEqual(f.context.f.children,originalChildren);assert.deepEqual(kit.colliders,originalColliders);assert.deepEqual(kit.owned,originalOwned);assert.deepEqual(originalChildren[0].children.map(m=>m.geometry),originalSupport);assert.deepEqual(g,meta);for(const x of originalSupport)assert.ok(!disposed.has(x));report.faults.push({stage,triggered:true,beamDisposeCount:1,columnDisposeCount:6,originalGeometryDisposeCount:0,newMaterialsDisposeOnce:2,originalMaterialsDisposed:0,hostUnchanged:true});
 }finally{Object.assign(proto,saved);T.Material.prototype.dispose=materialDispose;if(captured&&!disposed.has(captured))captured.dispose();f.dispose();}
});
process.on('exit',()=>{console.log('RESOURCE_USAGE',JSON.stringify({usage:process.resourceUsage(),memory:process.memoryUsage()}));if(process.env.R265_REVISION_REPORT)fs.writeFileSync(process.env.R265_REVISION_REPORT,JSON.stringify(report,null,2));});
