import {assertUnscopedWumen,unscopedWumen,baseline as wumenBaseline} from './wumen-vertical-profile-controls.mjs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {meshFingerprint} from './gate-tower-fixture.mjs';
import {restoreGatePlaques} from './gate-plaque-retention.mjs';
export const railPaths={
 '午门':[146,147,148,149].map(i=>`/27/${i}`),
 '神武门':[88,89,90,91,92,93,94,95].map(i=>`/149/${i}`),
};
export const verticalIndices=[...Array(12).keys(),...Array.from({length:12},(_,i)=>24+i)];
const oldGroups=Array.from({length:6},(_,i)=>({start:i*6,count:6,materialIndex:i}));
const sideGroups=[0,1,4,5].map((materialIndex,i)=>({start:i*6,count:6,materialIndex}));
export function atPath(group,path){return path.slice(1).split('/').reduce((o,i)=>o.children[+i],group);}
export function renderStateHash(group){
 const rows=[];group.traverse(m=>{if(!m.isMesh)return;
  const textures=Object.entries(m.material).filter(([,v])=>v?.isTexture),meta={textures:Object.fromEntries(textures.map(([,t])=>[t.uuid,{}])),images:{}};
  const {uuid,...material}=m.material.toJSON(meta);
  for(const [key,t]of textures)material[key]={name:t.name,wrap:[t.wrapS,t.wrapT],repeat:t.repeat.toArray(),offset:t.offset.toArray(),colorSpace:t.colorSpace,minFilter:t.minFilter,magFilter:t.magFilter,anisotropy:t.anisotropy};
  rows.push({material,flags:[m.castShadow,m.receiveShadow,m.visible,m.frustumCulled,m.renderOrder],groups:m.geometry.groups,drawRange:m.geometry.drawRange,
   attributes:Object.entries(m.geometry.attributes).map(([name,a])=>[name,a.array.constructor.name,a.normalized,a.usage])});
 });return crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex');
}
// The only allowed restoration: exact side-only index/groups and Wumen side V.
// All other arrays, UV U values, material identity and transforms remain guarded.
export function restoreGateRails(c,name){
 const copy=c.group.clone(true);
 for(const path of railPaths[name]){
  const original=atPath(c.group,path),m=atPath(copy,path),g=m.geometry;
  assert.ok(m.isMesh,`${name} missing ${path}`);
  assert.equal(m.material,c.lib.material('balustrade',{alphaTest:.5,side:c.THREE.DoubleSide}));
  if(name==='神武门')assert.equal(m.userData.gatePart,'local-hall-balustrade');
  assert.equal(g.attributes.position.count,36);
  assert.equal(g.index?.array.constructor,Uint16Array);
  assert.equal(g.index.itemSize,1);assert.equal(g.index.count,24);assert.equal(g.index.normalized,false);
  assert.deepEqual(Array.from(g.index?.array??[]),verticalIndices,`${path} only horizontal triangles may be removed`);
  assert.deepEqual(g.groups,sideGroups);
  assert.deepEqual(g.drawRange,{start:0,count:Infinity});
  for(const i of verticalIndices)assert.equal(g.attributes.normal.getY(i),0);
  m.geometry=g.clone();m.geometry.setIndex(null);m.geometry.clearGroups();
  for(const group of oldGroups)m.geometry.addGroup(group.start,group.count,group.materialIndex);
  if(name==='午门'){
   const p=g.attributes.position,uv=g.attributes.uv,ys=verticalIndices.map(i=>p.getY(i)),lo=Math.min(...ys),h=Math.max(...ys)-lo;
   for(const i of verticalIndices){
    assert.equal(uv.getY(i),Math.fround((p.getY(i)-lo)/h),`${path} exact full-height side V`);
    m.geometry.attributes.uv.setY(i,p.getY(i)/c.lib.tileSize('balustrade'));
   }
  }
  assert.equal(original.geometry,g,'restoration must never replace shared source geometry');
 }
 return copy;
}
export function assertRetainedGate(c,name,baseline){
 if(name==='午门'){
  // The reviewed main-tower scope supersedes its historical vertical golden.
  // Every unscoped object, including all rail geometry/state, remains exact.
  restoreGateRails(c,name);assertUnscopedWumen(c);
  assert.equal(renderStateHash(unscopedWumen(c)),wumenBaseline.unscopedRenderState);return;
 }
 const restored=restoreGateRails(restoreGatePlaques(c,name),name);
 assert.equal(meshFingerprint(restored),baseline.fingerprint);
 assert.equal(renderStateHash(restored),baseline.renderState);
}
