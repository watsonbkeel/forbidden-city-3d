import * as THREE from 'three';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { ZoneBase } from '../../src/scene/zones/ZoneBase.js';
import { library, serial } from './inner-palace-fixture.mjs';
import { CollisionManager } from '../../src/utils/Collision.js';
export const sha = value => createHash('sha256').update(typeof value === 'string'||Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
export const data = JSON.parse(readFileSync(new URL('../../data/zones/west-six.json', import.meta.url)));
export const item = data.items.find(x => x.name === '长春宫' && x.kind === 'hall');
export const meshList = root => { const a=[]; root.traverse(o=>{if(o.isMesh)a.push(o);});return a; };
export function fixture() {
  const b = new ZoneBase(library(), data), { f } = b.buildHall(item);
  b.kit.root.updateMatrixWorld(true);
  const cm = new CollisionManager(); cm.rivers=[]; cm.addColliders(b.kit.colliders); cm.addWalkables(b.kit.walkables);
  return { b,f,cm,added:f.getObjectByName('changchun-east-kang-layers'),dispose:()=>b.kit.dispose(b.kit.root) };
}
// Exact old component identities: only the four east cover posts and four
// east cover heads, never a color or a broad spatial region. The kang stays.
export function oldEastCover(f) {
  const rows=meshList(f).filter(o=>['changchun-kang-cover-post','changchun-kang-cover-head'].includes(o.userData.role)&&o.position.x<0);
  if(rows.length!==0&&rows.length!==8)throw Error('Expected exactly eight old east cover components');
  return rows;
}
export function meshRecord(o) {
  return {name:o.name,role:o.userData.role??null,matrix:o.matrixWorld.toArray(),userData:o.userData,
    geometry:sha({attributes:Object.fromEntries(Object.entries(o.geometry.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,normalized:a.normalized,array:[...a.array]}])),index:o.geometry.index?[...o.geometry.index.array]:null}),
    material:o.material?{name:o.material.name,color:o.material.color.getHex(),roughness:o.material.roughness,metalness:o.material.metalness,side:o.material.side,opacity:o.material.opacity,transparent:o.material.transparent}:null};
}
export function captureRetained({b,f,added}) {
  const excluded=new Set(added?meshList(added):oldEastCover(f));
  const oldBoxes=[...excluded].filter(o=>o.userData.role==='changchun-kang-cover-post').map(o=>new THREE.Box3().setFromObject(o));
  const range=added?.userData.colliderRange;
  const retainedColliders=b.kit.colliders.filter((c,i)=>range?i<range.start||i>=range.end:!oldBoxes.some(v=>v.min.distanceTo(c.min)<1e-5&&v.max.distanceTo(c.max)<1e-5));
  return JSON.parse(JSON.stringify({meshes:meshList(f).filter(o=>!excluded.has(o)).map(meshRecord),navigation:{colliders:retainedColliders.map(serial),walkables:b.kit.walkables,rooms:b.kit.rooms,regions:b.kit.regions,map:b.kit.mapItems},structure:f.userData.structure}));
}
export function retainedAreas(f) {
  const rows=meshList(f);
  return Object.fromEntries([
    ['westKang',o=>['changchun-north-kang','changchun-kang-cover-post','changchun-kang-cover-head'].includes(o.userData.role)&&o.position.x>0],
    ['centralFiveScreen',o=>['changchun-five-screen-panel','changchun-screen-unpainted-inset'].includes(o.userData.role)],
    ['partitions',o=>o.userData.role?.startsWith('west-domestic-')||o.userData.role==='changchun-curtain-valance'],
    ['eastKang',o=>o.userData.role==='changchun-north-kang'&&o.position.x<0],
  ].map(([key,predicate])=>{const selected=rows.filter(predicate).map(meshRecord);return[key,{meshes:selected.length,sha256:sha(selected)}];}));
}
export function localBounds(o,f) {
  f.updateMatrixWorld(true);const inverse=f.matrixWorld.clone().invert(),result=new THREE.Box3(),p=new THREE.Vector3();
  o.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++)result.expandByPoint(p.fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).applyMatrix4(inverse));});return result;
}
