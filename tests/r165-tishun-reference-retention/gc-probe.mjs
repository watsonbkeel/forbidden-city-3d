import assert from 'node:assert/strict';
import * as T from 'three';
import {fixture,zone} from '../r165-tishun-south-beam/fixture.mjs';
import {buildTishunSouthBeam as build} from '../../src/scene/palace/special/TishunSouthBeam.js';
import {zoneRetainedResourceCost} from '../../src/scene/zones/InactiveZoneCache.js';

assert.equal(typeof global.gc,'function','run this isolated probe with --expose-gc');
const priorDocument=globalThis.document;

// Keep listener and traversal closures out of setup's lexical environment:
// retained shared materials must not retain the probe's scene or buffer sets.
function countDisposals(resource,counts,key){resource.addEventListener('dispose',()=>counts[key]++)}
function branchCost(frame){
  const buffers=new Set(),geometries=new Set();let meshes=0;
  frame.traverse(m=>{if(m.isMesh){meshes++;geometries.add(m.geometry);for(const a of [...Object.values(m.geometry.attributes),m.geometry.index].filter(Boolean))buffers.add(a.array.buffer)}});
  return {frameBytes:[...buffers].reduce((n,b)=>n+b.byteLength,0),meshes,geometries:geometries.size};
}

function setup({name,apply=true,release=true,hold=false,throwAfterCommit=false}) {
  const f=fixture({companions:false}),counts={old:0,applied:0,material:0};
  countDisposals(f.target.geometry,counts,'old');
  countDisposals(f.target.material,counts,'material');
  let record;
  if(throwAfterCommit){
    const old=f.target.geometry,fail=()=>{throw Error('postcommit listener failure')};
    old.addEventListener('dispose',fail);
    assert.throws(()=>build(f.kit,zone),/postcommit listener failure/);
    old.removeEventListener('dispose',fail);
    record=build(f.kit,zone);
  }else if(apply)record=build(f.kit,zone);
  if(apply)countDisposals(f.target.geometry,counts,'applied');
  const weak={frame:new WeakRef(f.frame),mesh:new WeakRef(f.target),geometry:new WeakRef(f.target.geometry)};
  if(record)weak.record=new WeakRef(record);
  const metrics=branchCost(f.frame);
  if(release){
    f.builder.group=f.kit.finish();
    f.builder.releaseConstructionReferences();
    assert.equal(f.frame.parent,null);
    assert.equal(f.kit.root.children.length,0);
  }
  const cost=release?zoneRetainedResourceCost({builder:f.builder,data:{group:f.builder.group}},f.lib):null;
  // Do not return f, its dispose closure, scene nodes, geometries or record,
  // except the explicit positive control. The builder deliberately keeps kit live.
  return {name,builder:f.builder,lib:f.lib,heldRecord:hold?record:null,weak,counts,...metrics,cost};
}
const collect=async()=>{for(let i=0;i<8;i++){await new Promise(resolve=>setImmediate(resolve));global.gc()}};
const observe=s=>({name:s.name,alive:Object.fromEntries(Object.entries(s.weak).map(([k,w])=>[k,!!w.deref()])),counts:{...s.counts},frameBytes:s.frameBytes,meshes:s.meshes,geometries:s.geometries,cost:s.cost});
function refuseRebuiltOriginal(state){
  // A separate genuine fixture supplies original bytes without re-registering
  // duplicate room bounds in the already-finished builder's physical records.
  const donor=fixture({companions:false}),frame=donor.frame,mesh=donor.target,geometry=mesh.geometry,material=mesh.material;
  state.builder.kit.root.add(frame);mesh.material=state.lib.material('caihua_beam');
  state.builder.kit.root.updateWorldMatrix(true,true);
  assert.equal(geometry.attributes.position.count,36);assert.deepEqual(mesh.userData,{});
  const set=T.BufferGeometry.prototype.setAttribute,dispose=T.BufferGeometry.prototype.dispose;
  let staged=0,disposed=0;
  try{
    T.BufferGeometry.prototype.setAttribute=function(...args){staged++;return set.apply(this,args)};
    T.BufferGeometry.prototype.dispose=function(...args){disposed++;return dispose.apply(this,args)};
    assert.throws(()=>build(state.builder.kit,zone),/idempotent applied target drift/,'collected record must not erase the kit commit marker');
    assert.equal(staged,0);assert.equal(disposed,0);assert.equal(mesh.geometry,geometry);
  }finally{
    T.BufferGeometry.prototype.setAttribute=set;T.BufferGeometry.prototype.dispose=dispose;
    mesh.material=material;donor.kit.root.add(frame);donor.dispose();
  }
  return {staged,disposed};
}
const states=[];
try{
  states.push(setup({name:'unmodified-released',apply:false}));
  states.push(setup({name:'applied-released'}));
  states.push(setup({name:'applied-rooted',release:false}));
  states.push(setup({name:'externally-held-record',hold:true}));
  states.push(setup({name:'postcommit-error-released',throwAfterCommit:true}));
  await collect();
  const first=states.map(observe),rooted=states[2];
  assert.equal(build(rooted.builder.kit,zone),rooted.weak.record.deref(),'rooted original must preserve the exact frozen record across GC');
  assert.ok(Object.isFrozen(rooted.weak.record.deref()));
  states[3].heldRecord=null;
  await collect();
  const afterDrop=observe(states[3]);
  const rebuiltOriginal=refuseRebuiltOriginal(states[1]);
  console.log(JSON.stringify({first,afterDrop,rebuiltOriginal}));
}finally{
  for(const s of states){s.builder.dispose();s.lib.dispose()}
  globalThis.document=priorDocument;
}
