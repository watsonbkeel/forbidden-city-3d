import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as THREE from 'three';
import {fixture,meshList,meshRecord} from './lib/r54-changchun-capture.mjs';
const white=JSON.parse(gunzipSync(readFileSync(new URL('./fixtures/r54-changchun-white-geometry.json.gz',import.meta.url))));

test('R54 basic material fields remain partial and do not pretend to be measured historical finishes',()=>{
  const v=fixture();try{
    assert.equal(v.added.userData.stage,'PARTIAL_SOURCE_BOUNDED_BASE_MATERIALS_NOT_FINISHED_RESTORATION');
    assert.equal(v.added.userData.whiteModelCheckpoint,'ce4829ac9c47bd10f7bd4c0e135cfc5a796c3f10');
    assert.equal(v.added.userData.materialStatus,'REVERSIBLE_DISPLAY_PALETTE_NOT_COLORIMETRIC_OR_MATERIAL_SURVEY');
    const materials=new Map(meshList(v.added).map(m=>[m.material.name,m.material]));assert.equal(materials.size,4);
    const color=key=>materials.get(`r54_changchun_east_${key}`).color;
    assert.ok(color('timber').r<color('cloth').r&&color('timber').g<color('cloth').g);
    assert.ok(color('trim').b>color('trim').r);
    for(const m of materials.values()){assert.equal(m.map,null);assert.equal(m.normalMap,null);assert.equal(m.bumpMap,null);assert.equal(m.alphaMap,null);assert.equal(m.transparent,false);assert.equal(m.metalness,0);assert.ok(m.roughness>=.8);}
  }finally{v.dispose();}
});

test('R54 material pass changes no white-checkpoint mesh geometry, transforms, per-mesh metadata or navigation',()=>{
  const v=fixture();try{const rows=meshList(v.added).map(meshRecord);for(const r of rows)delete r.material;assert.deepEqual(rows,white);}finally{v.dispose();}
});

test('R54 production merge preserves material geometry and metadata with owned-resource cleanup',()=>{
  const v=fixture(),snap=root=>{root.updateMatrixWorld(true);const out={};for(const m of meshList(root)){if(!m.material?.name.startsWith('r54_changchun_east_'))continue;const row=out[m.material.name]??={triangles:0,bounds:new THREE.Box3(),color:m.material.color.getHex()};row.triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;row.bounds.union(new THREE.Box3().setFromObject(m));}return out;};
  const before=snap(v.f),merged=v.b.kit.finish(),after=snap(merged);
  try{assert.deepEqual(Object.keys(before).sort(),Object.keys(after).sort());for(const key of Object.keys(before)){assert.equal(before[key].triangles,after[key].triangles);assert.equal(before[key].color,after[key].color);for(const side of ['min','max'])for(const axis of ['x','y','z'])assert.ok(Math.abs(before[key].bounds[side][axis]-after[key].bounds[side][axis])<1e-4);}
    const records=merged.userData.architecture.filter(r=>r.id==='west-six/changchun-east-kang-layers');assert.equal(records.length,1);assert.equal(records[0].stage,'PARTIAL_SOURCE_BOUNDED_BASE_MATERIALS_NOT_FINISHED_RESTORATION');assert.equal(records[0].source.rearScreenTotalPanelCount,null);
  }finally{v.b.kit.dispose(merged);}
});
