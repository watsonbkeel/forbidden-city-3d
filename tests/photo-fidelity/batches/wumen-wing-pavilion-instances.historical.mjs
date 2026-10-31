import {readR157FrozenParent} from '../../lib/r157-frozen-source-reader.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {captureGate} from '../../lib/gate-tower-fixture.mjs';

const southBodies = group => group.children.filter(c => c.userData.topY === 7.5 && Math.abs(c.position.z + 56.4) < 1e-7).sort((a,b)=>a.position.x-b.position.x);
const southColumns = body => body.children.filter(c => c.geometry?.type === 'CylinderGeometry' && Math.abs(c.position.z + 5.5) < 1e-7).sort((a,b)=>a.position.x-b.position.x);

test('Both independently documented southern pavilion outer rows have six columns, not the generic four', () => {
  const c=captureGate(), bodies=southBodies(c.group);
  assert.equal(bodies.length,2);
  for(const body of bodies) assert.equal(southColumns(body).length,6,`instance at x=${body.position.x}`);
});

import * as T from 'three';
import {execFileSync} from 'node:child_process';
import {meshFingerprint} from '../../lib/gate-tower-fixture.mjs';
import {PALACE_LAYOUT} from '../../../src/scene/Layout.js';
import {PalaceBuilder} from '../../../src/scene/PalaceBuilder.js';
import {realTextureLibrary} from '../../lib/r48-real-texture-library.mjs';
import {refineWumenWingPavilionInstances,registeredWumenSouthXs} from '../../../src/scene/palace/special/WumenWingPavilionInstances.js';
import {refineWumenOuterSideColumns} from '../../../src/scene/palace/special/WumenOuterSideColumns.js';
import {refineWumenNorthwestNorthColumns,WUMEN_NORTHWEST_PAVILION_ID} from '../../../src/scene/palace/special/WumenNorthwestColumns.js';
const url=new URL('../../../src/scene/PalaceBuilder.js',import.meta.url);
let code=readR157FrozenParent('d70a4a02','src/scene/PalaceBuilder.js');
code=code.replace(/from\s*(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,url).href}${q}`);
const {PalaceBuilder:Baseline}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const baseline=lib=>{const b=new Baseline(new T.Scene(),lib);let group;b.finish=g=>{group=g;g.updateMatrixWorld(true);return g;};b.buildGate(PALACE_LAYOUT.find(v=>v.name==='午门'));return{builder:b,group};};
const physical=b=>({colliders:b.colliders,walkables:b.walkables,terraceProfiles:b.terraceProfiles,wumenTopY:b.wumenTopY});
const columnFree=(body,columns)=>{const g=new T.Group();for(const o of body.children)if(!columns.includes(o))g.add(o.clone());g.position.copy(body.position);return meshFingerprint(g);};

test('Only two southern middle rows change; every other vertex/material/pose and runtime collider/support remains exact',()=>{
  const c=captureGate(),old=baseline(c.lib),targets=southBodies(c.group),before=southBodies(old.group);
  // Compose the separately pinned northwest delta; its own test compares every
  // other vertex to reviewed 0ab13818. No extra exclusions in this south-row test.
  refineWumenNorthwestNorthColumns(old.group.children.find(o=>o.userData.topY===7.5&&Math.abs(o.position.x-47.7)<1e-7&&Math.abs(o.position.z+6)<1e-7),{instanceId:WUMEN_NORTHWEST_PAVILION_ID});
  // Compose the separately pinned four outward-row delta; its suite compares
  // every original object to d874222f. No new exclusions are introduced.
  refineWumenOuterSideColumns(old.builder,old.group);
  old.group.updateMatrixWorld(true);
  assert.deepEqual(physical(c.builder),physical(old.builder));
  assert.equal(c.group.children.length,old.group.children.length);
  for(let i=0;i<c.group.children.length;i++)if(!targets.includes(c.group.children[i]))assert.equal(meshFingerprint(c.group.children[i]),meshFingerprint(old.group.children[i]),`root child ${i}`);
  targets.forEach((body,i)=>{
    const prior=before[i],a=southColumns(body),z=southColumns(prior),side=i===0?'east':'west';
    assert.deepEqual(a.map(m=>m.position.x),registeredWumenSouthXs(side));
    assert.equal(columnFree(body,a),columnFree(prior,z));
    assert.equal(meshFingerprint(a[0]),meshFingerprint(z[0]));assert.equal(meshFingerprint(a.at(-1)),meshFingerprint(z.at(-1)));
    for(const m of a){assert.equal(m.geometry,a[0].geometry);assert.equal(m.material,a[0].material);}
    const proxyRow=body.userData.colliders.filter(b=>Math.abs((b.min.z+b.max.z)/2+5.5)<1e-7);
    assert.equal(proxyRow.length,6);
    a.forEach((m,j)=>{const box=m.geometry.boundingBox.clone().translate(m.position);box.min.y=Math.max(0,box.min.y);box.max.y=Math.min(3,box.max.y);assert.deepEqual(proxyRow[j],box);});
    assert.deepEqual(body.userData.colliders.filter(b=>!proxyRow.includes(b)),prior.userData.colliders.filter(b=>Math.abs((b.min.z+b.max.z)/2+5.5)>1e-7));
  });
});

test('Wrong anchor and repeated applications do not mutate or allocate; invalid second row rejects the whole operation atomically',()=>{
  const c=captureGate(),old=baseline(c.lib),before=meshFingerprint(old.group);
  assert.equal(refineWumenWingPavilionInstances({...old.builder,oz:-1},old.group),false);
  assert.equal(meshFingerprint(old.group),before);
  southBodies(old.group)[1].children.find(m=>m.geometry?.type==='CylinderGeometry'&&m.position.z===-5.5).position.x+=.1;
  const changed=meshFingerprint(old.group),first=southBodies(old.group)[0],firstChildren=[...first.children];
  assert.throws(()=>refineWumenWingPavilionInstances(old.builder,old.group),/west southern pavilion row mismatch/);
  assert.equal(meshFingerprint(old.group),changed);assert.deepEqual(first.children,firstChildren);
  const n=c.builder.ownedMaterials.length,g=meshFingerprint(c.group);
  assert.equal(refineWumenWingPavilionInstances(c.builder,c.group),false);assert.equal(c.builder.ownedMaterials.length,n);assert.equal(meshFingerprint(c.group),g);
});

test('Production merge retains unique two-wing/four-pavilion/two-candidate records, without invented instruments or duplicate roofs',()=>{
  captureGate();const lib=realTextureLibrary(),scene=new T.Scene(),b=new PalaceBuilder(scene,lib);
  try{b.buildGate(PALACE_LAYOUT.find(v=>v.name==='午门'));const records=scene.children[0].userData.architecture.filter(r=>r.id.startsWith('INSTANCE-A-WUMEN-')||['FC-B0439D9BED','FC-FB99F593DB'].includes(r.id));
    assert.equal(records.length,8);assert.equal(new Set(records.map(r=>r.id)).size,8);assert.ok(records.every(r=>r.wholeObjectAccepted===false));
    assert.equal(records.filter(r=>r.kind==='existing-wumen-corner-pavilion-instance').length,4);
    assert.equal(records.filter(r=>r.instruments==='UNKNOWN_NO_INSTRUMENT_GEOMETRY_ADDED').length,2);
  }finally{b.dispose();lib.dispose();}
});

test('Shared column buffers survive row replacement and all production geometry is disposed exactly once',()=>{
  const c=captureGate(),old=baseline(c.lib),columns=southColumns(southBodies(old.group)[0]),geo=columns[0].geometry;
  let premature=0;geo.addEventListener('dispose',()=>premature++);
  refineWumenWingPavilionInstances(old.builder,old.group);assert.equal(premature,0);
  for(const m of southColumns(southBodies(old.group)[0]))assert.equal(m.geometry,geo);
  const lib=realTextureLibrary(),scene=new T.Scene(),b=new PalaceBuilder(scene,lib);b.buildGate(PALACE_LAYOUT.find(v=>v.name==='午门'));
  const counts=new Map();scene.traverse(m=>{if(m.isMesh&&!counts.has(m.geometry)){counts.set(m.geometry,0);m.geometry.addEventListener('dispose',()=>counts.set(m.geometry,counts.get(m.geometry)+1));}});
  b.dispose();assert.ok([...counts.values()].every(n=>n===1));lib.dispose();
});

test('Each southern column foot rests on actual retained visible deck triangles, with finite source geometry',()=>{
  const c=captureGate();c.group.updateMatrixWorld(true);
  for(const body of southBodies(c.group))for(const column of southColumns(body)){
    const g=column.geometry,p=column.getWorldPosition(new T.Vector3());g.computeBoundingBox();const bottom=p.y+g.boundingBox.min.y;
    assert.ok(Math.abs(bottom-12.3)<2e-7);
    for(const [dx,dz]of [[0,0],[.2,0],[-.2,0],[0,.2],[0,-.2]]){
      const hits=new T.Raycaster(new T.Vector3(p.x+dx,bottom+.02,p.z+dz),new T.Vector3(0,-1,0),0,.04).intersectObjects(c.group.children.filter(g=>g!==body),true);
      assert.ok(hits.some(h=>h.object.material.name==='stone_slab'&&Math.abs(h.point.y-bottom)<2e-6));
    }
    for(const a of Object.values(g.attributes))assert.ok(Array.from(a.array).every(Number.isFinite));
  }
});
