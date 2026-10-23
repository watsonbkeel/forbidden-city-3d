// Gate-only CPU fixture. Shared PalaceBuilder is never written by this worker.
// The exact owner hookup is applied in memory, not approximated by a fake hall.
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {library} from './inner-palace-fixture.mjs';
export const hash=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const url=new URL('../../src/scene/PalaceBuilder.js',import.meta.url);
export const builderSource=readFileSync(url,'utf8');
const hookupURL=new URL('../../docs/current-state/r58-taihemen-open-veranda/HOOKUP.json',import.meta.url);
export const hookup=existsSync(hookupURL)?JSON.parse(readFileSync(hookupURL)):[];
export function applyTaihemenHookup(source) {
  for(const {before,after} of hookup) {
    if(source.includes(after))continue; // owner may already have integrated it
    if(source.split(before).length!==2)throw Error('Taihemen hookup context changed or duplicated');
    source=source.replace(before,after);
  }
  return source;
}
export function restoreTaihemenHookup(source) {
  for(const {before,after} of [...hookup].reverse()) {
    if(!source.includes(after)) {
      if(source.split(before).length!==2)throw Error('Taihemen baseline context changed or duplicated');
      continue;
    }
    if(source.split(after).length!==2)throw Error('Taihemen integrated context duplicated');
    source=source.replace(after,before);
  }
  return source;
}
export const baselineSource=restoreTaihemenHookup(builderSource);
export const candidateSource=applyTaihemenHookup(baselineSource);
const absolute=source=>source.replace(/from '([^']+)'/g,(_,specifier)=>
  `from '${specifier==='three'?import.meta.resolve('three'):new URL(specifier,url).href}'`);
const {PalaceBuilder}=await import('data:text/javascript;base64,'+Buffer.from(absolute(baselineSource)).toString('base64'));
const {PalaceBuilder:CandidateBuilder}=await import('data:text/javascript;base64,'+Buffer.from(absolute(candidateSource)).toString('base64'));
export function meshRows(group) {
  group.updateMatrixWorld(true);const rows=[];
  group.traverse(m=>{if(!m.isMesh)return;rows.push({name:m.name,matrix:m.matrixWorld.toArray(),
    material:{name:m.material.name,color:m.material.color?.getHex(),side:m.material.side},
    attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[a.itemSize,...a.array]])),
    index:m.geometry.index?[...m.geometry.index.array]:null});});return rows;
}
export function taihemenFragment({candidate=true}={}) {
  const Base=candidate?CandidateBuilder:PalaceBuilder;
  class Tracked extends Base {
    column(...args){super.column(...args);this.columns??=[];this.columns.push(args.slice(3));}
    buildHall(g,...args){super.buildHall(g,...args);this.roofRows=meshRows(g.children.at(-1));
      this.plaqueRows=meshRows(g.children.find(m=>m.userData.noMerge&&m.isMesh));}
  }
  const scene=new THREE.Scene(),builder=new Tracked(scene,library());
  const data=structuredClone(PALACE_LAYOUT.find(g=>g.name==='太和门'));
  builder.buildGate(data);scene.updateMatrixWorld(true);
  const cm=new CollisionManager();cm.addColliders(builder.getColliders());cm.addWalkables(builder.getWalkables());
  const root=scene.getObjectByName('太和门');
  return {THREE,scene,builder,cm,root,data,p:root.userData.taihemenSouth};
}
export function regionTriangles(root,predicate) {
  root.updateMatrixWorld(true);const rows=[];
  root.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position,idx=m.geometry.index;
    for(let i=0;i<(idx?.count??a.count);i+=3){const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(a,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld).toArray());
      if(v.every(predicate))rows.push(JSON.stringify({material:m.material.name,v}));}
  });return rows.sort();
}
