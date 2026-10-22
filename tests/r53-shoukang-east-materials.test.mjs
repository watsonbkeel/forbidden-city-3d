import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import * as THREE from 'three';
import { fixture, capture } from './lib/r53-shoukang-capture.mjs';
const baseline=JSON.parse(gunzipSync(readFileSync(new URL('./fixtures/r53-shoukang-white-geometry.json.gz',import.meta.url))));
const list = root => { const a=[];root.traverse(o=>{if(o.isMesh)a.push(o);});return a; };

test('R53 material pass remains partial and separates source-supported fields without invented surface detail',async()=>{
  const value=fixture();
  try {
    const m=value.added.userData,rows=list(value.added),materials=new Set(rows.map(o=>o.material));
    assert.equal(m.stage,'PARTIAL_SOURCE_BOUNDED_BASE_MATERIALS_NOT_FINISHED_RESTORATION');
    assert.equal(m.materialStatus,'REVERSIBLE_DISPLAY_PALETTE_NOT_COLORIMETRIC_OR_MATERIAL_SURVEY');
    assert.equal(m.whiteModelCheckpoint,'8f3f86736fa59dc260eb54cf776882ec15a40a5b');
    assert.equal(materials.size,4); assert.equal(rows.length,13);
    const role=r=>rows.find(o=>o.userData.role===r).material;
    assert.equal(role('shoukang-east-niche-upright').name,'r53_shoukang_east_timber');
    assert.equal(role('shoukang-east-crown-type-outline').name,'r53_shoukang_east_gold_field');
    assert.equal(role('shoukang-east-recess-back').name,'r53_shoukang_east_recess');
    assert.equal(role('shoukang-east-visible-front-base').name,'r53_shoukang_east_base_field');
    const l=mat=>mat.color.toArray().reduce((n,v)=>n+v,0);
    assert.ok(l(role('shoukang-east-crown-type-outline'))>l(role('shoukang-east-niche-upright')));
    assert.ok(l(role('shoukang-east-niche-upright'))>l(role('shoukang-east-recess-back')));
    for(const mat of materials){assert.equal(mat.map,null);assert.equal(mat.normalMap,null);assert.equal(mat.bumpMap,null);assert.equal(mat.alphaMap,null);assert.equal(mat.transparent,false);assert.ok(mat.roughness>=.7);}
    const { SHOUKANG_EAST_MATERIAL_FIT:p }=await import('../src/scene/palace/special/ShoukangEastWarmRoom.js');
    assert.ok(Object.isFrozen(p)); assert.ok(Object.values(p).every(Object.isFrozen));
    assert.equal(m.source.photographyDate,null);assert.equal(m.source.restorationCampaign,null);assert.equal(m.currentInventoryVerified,false);
  } finally {value.dispose();}
});

test('R53 material successor preserves every white-checkpoint geometry, transform and navigation value exactly',()=>{
  const value=fixture();try{const current=capture(value);for(const m of current.meshes)delete m.material;assert.deepEqual(current,baseline.capture);}finally{value.dispose();}
});

test('R53 final material merge preserves four bounded fields and complete provenance, and disposes merged geometry',()=>{
  const value=fixture(), expected=value.added.userData.structure; let merged;
  const signature=root=>{root.updateMatrixWorld(true);const out={};for(const o of list(root)){if(!o.material?.name.startsWith('r53_shoukang_east_'))continue;const k=o.material.name,r=out[k]??={triangles:0,bounds:new THREE.Box3(),color:o.material.color.getHex()};r.triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;const a=o.geometry.attributes.position,v=new THREE.Vector3();for(let i=0;i<a.count;i++)r.bounds.expandByPoint(v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld));}return out;};
  try {const before=signature(value.b.kit.root),root=merged=value.b.kit.finish(),after=signature(root);assert.deepEqual(Object.keys(after).sort(),Object.keys(before).sort());assert.equal(Object.keys(after).length,4);
    for(const k of Object.keys(before)){assert.equal(after[k].triangles,before[k].triangles);assert.equal(after[k].color,before[k].color);for(const side of ['min','max'])for(const axis of ['x','y','z'])assert.ok(Math.abs(after[k].bounds[side][axis]-before[k].bounds[side][axis])<1e-4);}
    const records=root.userData.architecture.filter(r=>r.id==='outer-west/shoukang-east-north-framework');assert.equal(records.length,1);assert.equal(records[0].stage,'PARTIAL_SOURCE_BOUNDED_BASE_MATERIALS_NOT_FINISHED_RESTORATION');assert.equal(records[0].source.photographyDate,null);assert.deepEqual(records[0],expected);assert.notEqual(records[0],expected);assert.notEqual(records[0].source,expected.source);
  }finally{if(merged){const owned=new Set(),disposed=new Set();for(const o of list(merged))if(o.material?.name.startsWith('r53_shoukang_east_')){owned.add(o.geometry);o.geometry.addEventListener('dispose',()=>disposed.add(o.geometry));}value.b.kit.dispose(merged);assert.deepEqual(disposed,owned);}else value.dispose();}
});
