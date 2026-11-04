const isTarget=m=>m.userData.daoheTestTarget===true;
import crypto from 'node:crypto';
const canonical=(k,v)=>typeof v==='string'?v.replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g,'RUNTIME_UUID'):v;
export const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v,canonical)).digest('hex');
export function rawSnapshot(root,{normalize=false}={}){
 const h=crypto.createHash('sha256');let meshes=0,triangles=0;root.updateWorldMatrix(true,true);
 root.traverse(m=>{if(!m.isMesh||isTarget(m))return;meshes++;triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;
  const mats=(Array.isArray(m.material)?m.material:[m.material]).map(q=>{if(!q)return{material:null};const r={name:q.name,type:q.type,color:q.color?.getHex(),roughness:q.roughness,metalness:q.metalness,side:q.side,transparent:q.transparent,opacity:q.opacity,depthWrite:q.depthWrite,vertexColors:q.vertexColors,map:q.map?.name??null,normalMap:q.normalMap?.name??null};if(normalize&&q.name==='r164_yueshi_pale_sidewall_fit'){r.name='r48_ningshou_brick_fit';r.color=0x72746d;}return r;});
  h.update(JSON.stringify({name:m.name,matrix:m.matrixWorld.toArray(),material:mats,groups:m.geometry.groups,castShadow:m.castShadow,receiveShadow:m.receiveShadow}));
  for(const k of Object.keys(m.geometry.attributes).sort()){const a=m.geometry.attributes[k];h.update(k+':'+a.itemSize+':'+a.normalized+':'+a.array.constructor.name+':');h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}if(m.geometry.index){const a=m.geometry.index.array;h.update('index:'+a.constructor.name);h.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));}
 });return{meshes,triangles,geometry:h.digest('hex')};
}
