import * as THREE from 'three';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {library,sceneRows,hash} from './inner-palace-fixture.mjs';

// Stable complete material values, without generated UUIDs or render counters.
// Canvas dimensions are bound here; unchanged plaqueMesh source binds the art.
function stable(value){
  if(typeof value==='function')return {functionSource:value.toString()};
  if(value===null||typeof value!=='object')return value;
  if(Array.isArray(value)||ArrayBuffer.isView(value))return Array.from(value,stable);
  if(value.isTexture){
    const out={};
    for(const[key,v]of Object.entries(value))if(!['id','uuid','version','source','_listeners'].includes(key))out[key]=stable(v);
    out.image=value.image?{width:value.image.width,height:value.image.height}:null;
    return out;
  }
  const out={};
  for(const[key,v]of Object.entries(value))if(!['id','uuid','version','_listeners'].includes(key))out[key]=stable(v);
  return out;
}

/** CPU-only full merged scene capture. Keep every mesh in traversal order;
 * there are no spatial exclusions or identity-tolerant geometry filters. */
export function captureNameboardScene(Builder){
  const scene=new THREE.Scene(),builder=new Builder(scene,library());
  try{
    builder.buildAll(PALACE_LAYOUT);
    const rows=sceneRows(scene),meshes=[],materials=[];let geometryBytes=0;
    scene.updateMatrixWorld(true);
    for(const group of scene.children){
      const groupMaterials=[];let index=0;
      group.traverse(mesh=>{
        if(!mesh.isMesh)return;
        const attributes=Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([key,a])=>{
          geometryBytes+=a.array.byteLength;
          return[key,{itemSize:a.itemSize,normalized:a.normalized,type:a.array.constructor.name,array:[...a.array]}];
        }));
        geometryBytes+=mesh.geometry.index?.array.byteLength??0;
        const material=stable(mesh.material);
        groupMaterials.push(material);
        meshes.push({group:group.name,index:index++,name:mesh.name,matrix:mesh.matrix.toArray(),
          geometrySHA256:hash({attributes,index:mesh.geometry.index?[...mesh.geometry.index.array]:null,groups:mesh.geometry.groups,drawRange:mesh.geometry.drawRange}),
          materialSHA256:hash(material),castShadow:mesh.castShadow,receiveShadow:mesh.receiveShadow,
          visible:mesh.visible,renderOrder:mesh.renderOrder,frustumCulled:mesh.frustumCulled,userData:structuredClone(mesh.userData)});
      });
      materials.push([group.name,groupMaterials]);
    }
    return{rows,meshes,materials,geometryBytes,navigation:JSON.parse(JSON.stringify({colliders:builder.colliders,walkables:builder.walkables}))};
  }finally{builder.dispose();}
}
