import * as THREE from 'three';
import { existsSync } from 'node:fs';
import { captureGate, meshFingerprint } from './gate-tower-fixture.mjs';
import {applyBoxUV} from '../../src/utils/GeometryUV.js';

export const NORTH_HEAD_SLOTS = Object.freeze([8, 9, 12, 13, 16, 17]);
export const NORTH_OPENINGS = Object.freeze([{x:-17.5,w:5,h:6.5},{x:0,w:9,h:8},{x:17.5,w:5,h:6.5}]);
const moduleURL = new URL('../../src/scene/palace/special/WumenNorthPortal.js', import.meta.url);
const portalModule = existsSync(moduleURL) ? await import(moduleURL) : null;

/** Pure same-W candidate: no live builder, physics, or source object mutation.
 * Only six cap/soffit slots change. Other objects are exact-value clones;
 * their immutable geometry/material references remain shared, never mutated.
 * Until the helper exists, this intentionally returns the historical geometry
 * so the geometry assertions report the real missing arch, not import errors.
 */
export function withWumenNorthPortals(before = captureGate()) {
  if (!portalModule) return before;
  const group = before.group.clone(true);
  // Object3D.clone canonicalizes some Euler angles. Preserve original values
  // without recalculating otherwise identical quaternion/matrix signed zeros.
  const retain = (source,copy) => {
    const onChange=copy.rotation._onChangeCallback;
    copy.rotation._onChange(()=>{});copy.rotation.copy(source.rotation);copy.rotation._onChange(onChange);
    copy.matrix.copy(source.matrix);copy.matrixWorld.copy(source.matrixWorld);
    source.children.forEach((child,i)=>retain(child,copy.children[i]));
  };
  retain(before.group,group);
  const scratch = new THREE.Group(), dm = before.data.dimensions;
  for (const o of NORTH_OPENINGS) portalModule.buildWumenNorthPortal({library:before.lib}, scratch, {
    x:o.x,width:o.w,tunnelHeight:o.h,platformHeight:dm.platformHeight,southZ:dm.platformSouth,northZ:dm.platformNorth,
  });
  NORTH_HEAD_SLOTS.forEach((slot,i)=>{group.children[slot]=scratch.children[i];scratch.children[i].parent=group;});
  group.updateMatrixWorld(true);
  const stages=wumenNorthOverheadStages(before);
  return {...before,group,builder:copyBuilder(before.builder,stages.candidate)};
}
export function northHeadTriangles(c) {
  const triangles=[];
  for(const slot of NORTH_HEAD_SLOTS){const m=c.group.children[slot],g=m.geometry,p=g.attributes.position,idx=g.index;
    for(let i=0;i<(idx?.count??p.count);i+=3)triangles.push(new THREE.Triangle(...[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld))));
  }return triangles;
}

/** Recognize exactly the old or new six scoped meshes, then provide an explicit
 * historical view. This makes focused tests usable after the owner installs the
 * actual hook; it must never normalize an unrecognized production head change.
 */
export function restorePreWumenNorthPortals(actual) {
  const dm=actual.data.dimensions,D=dm.platformNorth-dm.platformSouth,zc=(dm.platformSouth+dm.platformNorth)/2;
  const old=[];
  for(const o of NORTH_OPENINGS)for(const [mat,h,d,y] of [['wall_red',dm.platformHeight-o.h,D,(dm.platformHeight+o.h)/2],['wall_brick',.3,D-.2,o.h-.15]]){
    const m=new THREE.Mesh(applyBoxUV(new THREE.BoxGeometry(o.w,h,d),actual.lib.tileSize(mat)),actual.lib.material(mat));
    m.position.set(o.x,y,zc);m.castShadow=m.receiveShadow=true;m.updateMatrixWorld(true);old.push(m);
  }
  const candidate=withWumenNorthPortals(actual);
  const exact=(a,b)=>meshFingerprint(a)===meshFingerprint(b)&&a.name===b.name&&a.visible===b.visible&&a.castShadow===b.castShadow&&a.receiveShadow===b.receiveShadow&&a.material===b.material&&JSON.stringify(a.userData)===JSON.stringify(b.userData);
  const historical=NORTH_HEAD_SLOTS.every((slot,i)=>exact(actual.group.children[slot],old[i]));
  const installed=NORTH_HEAD_SLOTS.every(slot=>exact(actual.group.children[slot],candidate.group.children[slot]));
  if(!historical&&!installed)throw new Error('Unrecognized Wumen north head delta; historical QA cannot hide it');
  const stages=wumenNorthOverheadStages(actual);
  if(historical&&stages.installed)throw new Error('Unrecognized north overheads without matching installed head geometry');
  if(historical)return actual;
  const group=candidate.group;
  NORTH_HEAD_SLOTS.forEach((slot,i)=>{group.children[slot]=old[i];old[i].parent=group;});
  group.updateMatrixWorld(true);return {...actual,group,builder:copyBuilder(actual.builder,stages.legacy)};
}

const boxKey=b=>JSON.stringify([b.min?.toArray(),b.max?.toArray()]);
const shapeKey=b=>JSON.stringify([boxKey(b),b.overhead]);
const copyBuilder=(builder,colliders)=>Object.assign(Object.create(Object.getPrototypeOf(builder)),builder,{colliders});
/** Explicit finite N2 physics history. Unknown, missing-metadata, partial or
 * altered overhead deltas fail rather than entering the legacy baseline.
 */
export function wumenNorthOverheadStages(c){
 const dm=c.data.dimensions,scratch={colliders:[],ox:c.data.position.x,oz:c.data.position.z};
 portalModule.registerWumenNorthPortalOverheads(scratch,{openings:NORTH_OPENINGS.map(o=>({x:o.x,w:o.w})),southZ:dm.platformSouth,northZ:dm.platformNorth,platformHeight:dm.platformHeight});
 const expected=scratch.colliders,all=c.builder.colliders;
 const tagged=all.filter(b=>b.overhead!==undefined||expected.some(e=>boxKey(b)===boxKey(e)));
 if(tagged.length&&(tagged.length!==3||tagged.some((b,i)=>!b.isBox3||shapeKey(b)!==shapeKey(expected[i]))))throw new Error('Unrecognized Wumen north overhead delta; historical QA cannot hide it');
 return {legacy:all.filter(b=>!tagged.includes(b)),candidate:tagged.length?[...all]:[...all,...expected],installed:tagged.length===3,expected};
}
