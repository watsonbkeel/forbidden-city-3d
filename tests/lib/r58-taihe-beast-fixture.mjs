import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {signature,triangles} from './r58-hall-beast-fixture.mjs';
import {library} from './inner-palace-fixture.mjs';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';

export const baselineCommit='c9a82aaa8316954e80a03aa934cd8e745065322e';
export function moduleURL(source,path,replacements={}) {
  const url=new URL('../../'+path,import.meta.url);
  source=source.replace(/from (['"])(\.\.?\/[^'"]+)\1/g,(_,q,p)=>`from '${replacements[p]??new URL(p,url).href}'`);
  source=source.replaceAll("from 'three'",`from '${import.meta.resolve('three')}'`);
  return 'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
}
export async function baselineHooklessBuilder() {
  // The single new Taihe option is removed from test-source only, to compare
  // the actual builder before/after its bounded hookup. No scene is filtered.
  const p='src/scene/PalaceBuilder.js',s=readFileSync(new URL('../../'+p,import.meta.url),'utf8');
  const line="      ...(data.name === '太和殿' ? { walkingBeastProfile: 'taihe' } : {}),\n";
  if(s.split(line).length!==2)throw Error('Taihe-only hookup source changed');
  return import(moduleURL(s.replace(line,''),p));
}
export function hallCapture(Builder,name) {
  const builder=new Builder(new THREE.Scene(),library()),group=new THREE.Group();
  const floor=({'太和殿':10.2,'保和殿':9,'中和殿':8.6,'交泰殿':2.16,'乾清宫':2.16})[name];
  const reference=name==='保和殿'?10:name==='乾清宫'?7:floor;
  builder.buildHall(group,structuredClone(PALACE_LAYOUT.find(h=>h.name===name)),floor,{heightReferenceY:reference});
  group.updateMatrixWorld(true);const roofs=[];
  group.traverse(o=>{if(o.userData.ownedMaterials&&o.userData.eaveY!==undefined)roofs.push(o);});
  if(roofs.length!==1)throw Error(`${name}: expected one roof`);
  const roof=roofs[0],roofParent=roof.parent,roofSignature=signature(roof),submittedTriangles=triangles(roof);
  roof.removeFromParent();const remainder=signature(group);roofParent.add(roof);
  return {builder,group,roof,summary:{remainder,roof:roofSignature,roofTriangles:submittedTriangles,physics:JSON.parse(JSON.stringify({colliders:builder.colliders,walkables:builder.walkables})),records:group.userData.hallWalkingBeasts??[]}};
}
export function triangleRecords(mesh) {
  const p=mesh.geometry.attributes.position,idx=mesh.geometry.index,out=[];
  mesh.updateMatrixWorld(true);
  for(let i=0;i<(idx?.count??p.count);i+=3)out.push(new THREE.Triangle(...[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,idx?.getX(i+k)??i+k).applyMatrix4(mesh.matrixWorld))));
  return out;
}
