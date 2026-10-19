import * as THREE from 'three';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {library,hash} from './inner-palace-fixture.mjs';

// Bind every material value except generated object identities/render counters.
// Source fixtures separately bind the complete canvas drawing implementation.
function stable(value){
  if(typeof value==='number'&&!Number.isFinite(value))return {number:String(value)};
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

/** Unmerged hall capture in complete traversal order. No spatial exclusions,
 * geometry filtering, sorted surfaces or historical normalization. */
export function captureQianqingControl(Builder,name='乾清宫'){
  const scene=new THREE.Scene(),builder=new Builder(scene,library()),group=new THREE.Group();
  const levels={'太和殿':[9.9375,9.9375],'保和殿':[9,10],'中和殿':[9.9375,9.9375],'乾清宫':[2.16,7],'坤宁宫':[2.16,2.16]};
  const [y,heightReferenceY]=levels[name];
  try{
    builder.buildHall(group,PALACE_LAYOUT.find(x=>x.name===name),y,{heightReferenceY});
    group.updateMatrixWorld(true);
    const rows=[],orientedSurfaces=[];
    group.traverse(mesh=>{
      if(!mesh.isMesh)return;
      // Additional exact oriented triangle streams compare index expansion only.
      // Full raw indexed/nonindexed attributes remain separately SHA-bound below.
      const index=mesh.geometry.index,count=index?.count??mesh.geometry.attributes.position.count;
      orientedSurfaces.push(Object.fromEntries(['position','normal'].map(key=>{
        const attr=mesh.geometry.attributes[key],values=[];
        for(let i=0;i<count;i++){const j=index?index.getX(i):i;for(let k=0;k<attr.itemSize;k++)values.push(attr.array[j*attr.itemSize+k]);}
        return[key,hash(values)];
      })));
      const bounds=new THREE.Box3().setFromBufferAttribute(mesh.geometry.attributes.position);
      orientedSurfaces.at(-1).bounds={min:bounds.min.toArray(),max:bounds.max.toArray()};
      const attributes=Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([key,a])=>[key,{itemSize:a.itemSize,normalized:a.normalized,type:a.array.constructor.name,count:a.count,SHA256:hash([...a.array])}]));
      rows.push({name:mesh.name,matrix:mesh.matrix.toArray(),matrixWorld:mesh.matrixWorld.toArray(),
        geometry:{type:mesh.geometry.type,parameters:stable(mesh.geometry.parameters??null),attributes,index:mesh.geometry.index?hash([...mesh.geometry.index.array]):null,groups:structuredClone(mesh.geometry.groups),drawRange:stable(mesh.geometry.drawRange)},
        triangles:(mesh.geometry.index?.count??mesh.geometry.attributes.position.count)/3,
        material:stable(mesh.material),castShadow:mesh.castShadow,receiveShadow:mesh.receiveShadow,
        visible:mesh.visible,renderOrder:mesh.renderOrder,frustumCulled:mesh.frustumCulled,userData:structuredClone(mesh.userData)});
    });
    return{rows,orientedSurfaces,navigation:JSON.parse(JSON.stringify({colliders:builder.colliders,walkables:builder.walkables}))};
  }finally{builder.dispose();}
}
