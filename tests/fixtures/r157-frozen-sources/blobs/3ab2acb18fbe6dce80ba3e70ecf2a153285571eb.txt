import * as THREE from 'three';
import { TAIHE_COLUMN_ATLAS as A } from './TaiheColumnSurface.js';

// Visual-trial parameters, not measured gold-leaf reflectance or physical relief.
export const TAIHE_COLUMN_RESPONSE = Object.freeze({linearTarget:Object.freeze([.65,.43,.10])});
const owned = new WeakMap();
const fail = reason => { throw new Error(`Taihe column response: ${reason}`); };

// Runtime-only gains may exceed 1; they are never exported as glTF COLOR_0.
// Geometry owns the buffer and releases it through its normal dispose lifecycle.
export function applyTaiheColumnResponse(mesh, root=mesh?.parent) {
  if(!mesh?.isMesh || mesh.material?.name!=='taihe_gold')return;
  const g=mesh.geometry,m=mesh.material,p=g.attributes.position,uv=g.attributes.uv;
  if(!root?.traverse)fail('missing material ownership root');
  const references=[];root.traverse(o=>{if(o.isMesh&&(Array.isArray(o.material)?o.material:[o.material]).includes(m))references.push(o);});
  if(references.length!==1||references[0]!==mesh)fail('shared material outside the single gold batch');
  const base=m.color.toArray(),target=TAIHE_COLUMN_RESPONSE.linearTarget;
  if(base.some(v=>!Number.isFinite(v)||v<=0||v>1))fail('invalid linear material factor');
  const prior=owned.get(g);
  if(!prior&&(g.attributes.color||m.vertexColors))fail('unowned vertex colors');
  if(!p||!uv||uv.itemSize!==2||uv.count!==p.count)fail('missing or mismatched UVs');
  const decorated = id => {
    const u=uv.getX(id),v=uv.getY(id);
    if(u===0&&v===0)return false;
    if(!Number.isFinite(u)||!Number.isFinite(v)||u<A.u0-1e-6||u>A.u1+1e-6||v<A.v0-1e-6||v>A.v1+1e-6)fail('invalid atlas region');
    return true;
  };
  for(let i=0;i<p.count;i++)decorated(i);
  const index=g.index,count=index?.count??p.count;
  if(!count||count%3)fail('invalid triangle count');
  for(let i=0;i<count;i+=3){
    const ids=[0,1,2].map(k=>index?index.getX(i+k):i+k);
    if(ids.some(id=>!Number.isInteger(id)||id<0||id>=p.count))fail('invalid vertex index');
    if(ids.some(id=>decorated(id)!==decorated(ids[0])))fail('mixed neutral and decorated triangle');
  }
  const gain=target.map((v,k)=>Math.fround(v/base[k]));
  if(gain.some((v,k)=>!Number.isFinite(v)||v*base[k]>1))fail('unbounded effective base');
  if(prior){
    const a=g.attributes.color;
    if(prior.material!==m||prior.attribute!==a||!m.vertexColors||base.some((v,k)=>v!==prior.base[k])||a.itemSize!==3||a.count!==p.count||a.normalized||!(a.array instanceof Float32Array))fail('owned response changed');
    for(let i=0;i<p.count;i++)for(let k=0;k<3;k++)if(a.array[i*3+k] !== (decorated(i)?gain[k]:1))fail('owned gain values changed');
    return a;
  }
  const array=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++)array.set(decorated(i)?gain:[1,1,1],i*3);
  const attribute=new THREE.BufferAttribute(array,3,false);
  g.setAttribute('color',attribute);m.vertexColors=true;m.needsUpdate=true;
  owned.set(g,{attribute,material:m,base});
  return attribute;
}
