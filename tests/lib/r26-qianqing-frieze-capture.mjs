import * as THREE from 'three';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {library,hash} from './inner-palace-fixture.mjs';

/** Compare all resident oriented triangles, retaining multiplicity. Sorting
 * compares material-batched traversal across a two-triangle reassignment;
 * the separate complete scene fixtures still bind every original mesh/order. */
export function captureFriezeTriangles(Builder){
  const scene=new THREE.Scene(),builder=new Builder(scene,library());
  try{
    builder.buildAll(PALACE_LAYOUT);scene.updateMatrixWorld(true);
    const rows=[],materials=new Set();
    for(const group of scene.children)group.traverse(mesh=>{
      if(!mesh.isMesh)return;
      materials.add(mesh.material);
      const a=mesh.geometry.attributes,index=mesh.geometry.index,count=index?.count??a.position.count;
      for(let i=0;i<count;i+=3){
        const ids=[0,1,2].map(k=>index?index.getX(i+k):i+k);
        const attributes=Object.fromEntries(Object.entries(a).map(([key,v])=>[key,ids.flatMap(j=>Array.from(v.array.subarray(j*v.itemSize,(j+1)*v.itemSize)))]));
        const frame={group:group.name,matrixWorld:mesh.matrixWorld.toArray()};
        rows.push({surface:hash({...frame,position:attributes.position,normal:attributes.normal}),
          identity:hash({...frame,attributes,material:mesh.material.name})});
      }
    });
    return{rows,uniqueMaterials:materials.size};
  }finally{builder.dispose();}
}

/** Raw attributes and material-object reuse for the unmerged hall, with every
 * mesh retained in original traversal order. */
export function captureFriezeHall(Builder){
  const builder=new Builder(new THREE.Scene(),library()),group=new THREE.Group();
  try{
    builder.buildHall(group,PALACE_LAYOUT.find(x=>x.name==='乾清宫'),2.16,{heightReferenceY:7});
    group.updateMatrixWorld(true);
    const meshes=[],materials=[];
    group.traverse(mesh=>{
      if(!mesh.isMesh)return;
      if(!materials.includes(mesh.material))materials.push(mesh.material);
      meshes.push({name:mesh.name,material:mesh.material.name,materialIndex:materials.indexOf(mesh.material),
        matrix:mesh.matrix.toArray(),matrixWorld:mesh.matrixWorld.toArray(),
        attributes:Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([key,a])=>[key,{itemSize:a.itemSize,normalized:a.normalized,type:a.array.constructor.name,array:[...a.array]}])),
        index:mesh.geometry.index?[...mesh.geometry.index.array]:null,userData:structuredClone(mesh.userData)});
    });
    return{meshes,uniqueMaterials:materials.length};
  }finally{builder.dispose();}
}
