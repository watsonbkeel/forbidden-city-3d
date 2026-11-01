import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';import{isDeepStrictEqual}from'node:util';
import {library}from'../../../lib/inner-palace-fixture.mjs';import{PALACE_LAYOUT}from'../../../../src/scene/Layout.js';import{buildSouthWaterSystem}from'../../../../src/scene/palace/special/SouthWaterSystem.js';import{parentWater}from'./parent.mjs';import {realTextureLibrary}from'../../../lib/r48-real-texture-library.mjs';
const river=PALACE_LAYOUT.find(p=>p.southWaterProfile),own=c=>c.triangleSupport?.id.startsWith('wuying-bridge-rails:'),dispose=h=>h.group.traverse(m=>m.geometry?.dispose());
const key=vs=>vs.map(v=>v.toArray().join(',')).sort().join('|');
const triangleCounts=group=>{const out=new Map();group.updateMatrixWorld(true);group.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,p=g.attributes.position;for(const a of Object.values(g.attributes))assert.ok(a.array.every(Number.isFinite));for(let i=0;i<(g.index?.count??p.count);i+=3){const k=key([0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,g.index?g.index.getX(i+j):i+j).applyMatrix4(m.matrixWorld)));out.set(k,(out.get(k)??0)+1);}});return out;};
test('3e9d5c92 parent water/bridge decks/shore/culverts and all non-Wuying physical owners remain exact',()=>{
 const lib=library(),a=parentWater.buildSouthWaterSystem(lib,river,lib.material('water')),b=buildSouthWaterSystem(lib,river,lib.material('water'));try{
  assert.ok(isDeepStrictEqual(a.profile,b.profile),'water profile changed');assert.ok(isDeepStrictEqual(a.walkables,b.walkables),'deck or other supports changed');
  assert.ok(isDeepStrictEqual(a.colliders.filter(c=>!own(c)),b.colliders.filter(c=>!own(c))),'non-Wuying physical owner changed');
  assert.equal(b.walkables.filter(w=>w.structureId?.startsWith('wuying-')).length,96);
  assert.equal(b.colliders.filter(own).length,126);assert.equal(a.colliders.length,b.colliders.length);
  const before=triangleCounts(a.group),after=triangleCounts(b.group);
  // The sole positional change is the declared whole-assembly +0.10m seat.
  // Transform only exact old Wuying triangles, not broad world-coordinate bins.
  for(const c of a.colliders.filter(own))for(const{triangle:t}of c.triangleSupport.template.triangles){
   const original=key([t.a,t.b,t.c]),shifted=key([t.a,t.b,t.c].map(v=>new T.Vector3(v.x,Math.fround(v.y+.10),v.z)));
   assert.ok(before.get(original)>0,'old rail source missing');before.set(original,before.get(original)-1);before.set(shifted,(before.get(shifted)??0)+1);
  }
  for(const[k,n]of before){assert.ok((after.get(k)??0)>=n,'world triangle changed beyond exact rail seating translation');after.set(k,(after.get(k)??0)-n);}
  assert.equal([...after.values()].reduce((s,n)=>s+n,0),3480,'only 126 source plinth solids were added');
 }finally{dispose(a);dispose(b);}
});
test('Final real-material batch contains every exact new source triangle; costs remain bounded',()=>{
 const lib=realTextureLibrary(),h=buildSouthWaterSystem(lib,river,lib.material('water'));try{
  const actual=triangleCounts(h.group);let physical=0;for(const c of h.colliders.filter(own))for(const{triangle:t}of c.triangleSupport.template.triangles){assert.ok(t.getArea()>1e-12);assert.ok(actual.has(key([t.a,t.b,t.c])),'source support triangle lost in material batch');physical++;}
  assert.equal(physical,26832);assert.equal([...actual.values()].reduce((s,n)=>s+n,0),119088);
 }finally{dispose(h);lib.dispose();}
});
import fs from 'node:fs';import {createR157FrozenSourceReader}from '../../../lib/r157-frozen-source-reader.mjs';
test('Legacy Wuying rail-recovery body remains byte-exact beside the explicit separately tested crown capability',()=>{
 const file='src/scene/palace/special/WuyingThreeBridgeRails.js',old=createR157FrozenSourceReader(process.cwd(),'929e346745b7295ad1aae0caa581e8cdf22723ff').read(file),now=fs.readFileSync(new URL('../../../../'+file,import.meta.url),'utf8'),marker='export function canRecoverInwardFromWuyingRail';
 const legacy='function canRecoverInwardFromWuyingRailLegacy';assert.equal(now.slice(now.indexOf(legacy)).replace(legacy,marker),old.slice(old.indexOf(marker)));
});
