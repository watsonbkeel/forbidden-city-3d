import{isOld,isNew}from'./fixture.mjs';
import crypto from 'node:crypto';
const canonical=(k,v)=>typeof v==='string'?v.replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g,'RUNTIME_UUID'):v;
export const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v,canonical)).digest('hex');
export function rawSnapshot(root,{normalize=false}={}){
 const h=crypto.createHash('sha256');let meshes=0,triangles=0;root.updateWorldMatrix(true,true);
 root.traverse(m=>{if(!m.isMesh||isOld(m)||isNew(m))return;meshes++;triangles+=(m.geometry.index?.count??m.geometry.attributes.position.count)/3;
  const mats=(Array.isArray(m.material)?m.material:[m.material]).map(q=>{if(!q)return{material:null};const r={name:q.name,type:q.type,color:q.color?.getHex(),roughness:q.roughness,metalness:q.metalness,side:q.side,transparent:q.transparent,opacity:q.opacity,depthWrite:q.depthWrite,vertexColors:q.vertexColors,map:q.map?.name??null,normalMap:q.normalMap?.name??null};if(normalize&&q.name==='r164_yueshi_pale_sidewall_fit'){r.name='r48_ningshou_brick_fit';r.color=0x72746d;}return r;});
  h.update(JSON.stringify({name:m.name,matrix:m.matrixWorld.toArray(),material:mats,groups:m.geometry.groups,castShadow:m.castShadow,receiveShadow:m.receiveShadow}));
  for(const k of Object.keys(m.geometry.attributes).sort()){const a=m.geometry.attributes[k];h.update(k+':'+a.itemSize+':'+a.normalized+':'+a.array.constructor.name+':');h.update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));}if(m.geometry.index){const a=m.geometry.index.array;h.update('index:'+a.constructor.name);h.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));}
 });return{meshes,triangles,geometry:h.digest('hex')};
}
export const oldBoxes=()=>{const w=11.3,n=Math.ceil(w/.65),a=[];for(const h of[.24,.88])a.push({min:[-319.8-w/2,3.7+h-.065/2,513.3-4.35-.04],max:[-319.8+w/2,3.7+h+.065/2,513.3-4.35+.04]});for(let i=0;i<=n;i++){const x=-w/2+w*i/n;a.push({min:[-319.8+x-.035,3.7,513.3-4.35-.04],max:[-319.8+x+.035,3.7+.9,513.3-4.35+.04]});}return a};
export const isOldCol=c=>!c.triangleSupport&&oldBoxes().some(e=>['min','max'].every(k=>c[k].toArray().every((v,i)=>Math.abs(v-e[k][i])<1e-10)));
export function dataSnapshot(d){const a=structuredClone(d.group.userData.architecture??[]);for(const q of a)if(q.id==='place-ningshou-2318b5f73b'){delete q.frontBalustrade;delete q.actualComponentCount;}const cols=d.colliders.filter(c=>!isOldCol(c)&&!c.r164ForiFront);return{colliderCount:cols.length,colliders:hash(cols),walkableCount:d.walkables.length,walkables:hash(d.walkables),rooms:hash(d.rooms),maps:hash(d.mapItems),regions:hash(d.regions),architecture:hash(a)};}
