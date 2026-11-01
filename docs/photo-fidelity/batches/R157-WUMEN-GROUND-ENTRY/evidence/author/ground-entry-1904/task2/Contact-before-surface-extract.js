import * as THREE from 'three';
import {CollisionManager} from '../utils/Collision.js';
import {WUMEN_JOINT_ASCENT_FIT} from './WumenJointAscentFit.js';

// Default-off local candidate authority. There is deliberately no runtime
// installer, movement delegation or floor fallback in this first stage.
const bindings=new WeakMap(),expectedCache=new Map();
const identity=new THREE.Matrix4();
const fields=['axis','minX','maxX','minZ','maxZ','a0','a1','y0','y1'];
const fail=message=>{throw new TypeError(`Wumen joint: ${message}`);};
function materialRecord(m,ignoreColor=false){const j=m.toJSON();for(const k of ['uuid','name','userData'])delete j[k];if(ignoreColor)delete j.color;return JSON.stringify(j);}
const defaultMaterial=new THREE.MeshStandardMaterial(),allowedMaterial=materialRecord(defaultMaterial,true);defaultMaterial.dispose();
function permittedMaterial(m){
 if(Object.getPrototypeOf(m)!==THREE.MeshStandardMaterial.prototype||m.toJSON!==THREE.Material.prototype.toJSON||m.onBeforeRender!==THREE.Material.prototype.onBeforeRender||m.customProgramCacheKey!==THREE.Material.prototype.customProgramCacheKey||Object.values(m).some(v=>v?.isTexture)||![m.color.r,m.color.g,m.color.b].every(v=>Number.isFinite(v)&&v>=0&&v<=1))return false;
 return materialRecord(m,true)===allowedMaterial;
}
function expected(p){
 if(expectedCache.has(p.id))return expectedCache.get(p.id);
 const indexed=new THREE.BoxGeometry(p.maxX-p.minX,1,p.maxZ-p.minZ),g=indexed.toNonIndexed();indexed.dispose();
 const a=g.attributes.position,out=[];
 for(let i=0;i<a.count;i+=3){const vs=[0,1,2].map(k=>{const x=a.getX(i+k)>0?p.maxX:p.minX,z=a.getZ(i+k)>0?p.maxZ:p.minZ;return new THREE.Vector3(x,a.getY(i+k)>0?height(p,x,z):p.baseY,z);});if(new THREE.Triangle(...vs).getArea()===0)continue;for(const v of vs)out.push(...v.toArray());}g.dispose();
 const position=new Float32Array(out),normalGeometry=new THREE.BufferGeometry();normalGeometry.setAttribute('position',new THREE.BufferAttribute(position,3));normalGeometry.computeVertexNormals();const normal=normalGeometry.attributes.normal.array.slice();normalGeometry.computeBoundingBox();normalGeometry.computeBoundingSphere();const boundingBox=normalGeometry.boundingBox.clone(),boundingSphere=normalGeometry.boundingSphere.clone();normalGeometry.dispose();
 const lo=p.axis==='x'?p.minX:p.minZ,hi=p.axis==='x'?p.maxX:p.maxZ,n=Math.max(Math.ceil((hi-lo)/p.bodySlice),Math.ceil(Math.abs(p.y1-p.y0)/.1)),body=[];
 for(let i=0;i<n;i++){const a=lo+(hi-lo)*i/n,b=lo+(hi-lo)*(i+1)/n,top=Math.min(heightAt(p,a),heightAt(p,b));if(top<=p.baseY)continue;body.push([[p.axis==='x'?a:p.minX,p.baseY,p.axis==='z'?a:p.minZ],[p.axis==='x'?b:p.maxX,top,p.axis==='z'?b:p.maxZ]]);}
 const e={position,normal,body,boundingBox,boundingSphere};expectedCache.set(p.id,e);return e;
}
function heightAt(p,a){return p.y0+(p.y1-p.y0)*(a-p.a0)/(p.a1-p.a0);}
function height(p,x,z){return heightAt(p,p.axis==='x'?x:z);}
function equalArray(a,b){return a?.length===b.length&&b.every((v,i)=>Object.is(a[i],v));}
function boxEqual(b,v){return b?.isBox3&&equalArray(b.min.toArray(),v[0])&&equalArray(b.max.toArray(),v[1]);}
function validManager(cm){return cm instanceof CollisionManager&&Object.getPrototypeOf(cm)===CollisionManager.prototype&&['checkCollision','getGroundHeight','getValidPosition','queryBox'].every(k=>cm[k]===CollisionManager.prototype[k])&&Array.isArray(cm.colliders)&&Array.isArray(cm.walkables);}
function plainRecord(value,keys){return value&&Object.getPrototypeOf(value)===Object.prototype&&Reflect.ownKeys(value).every(k=>typeof k==='string'&&keys.includes(k)&&Object.hasOwn(Object.getOwnPropertyDescriptor(value,k),'value'));}
// Three selects renderer paths from flags, not JavaScript prototypes. Keep
// this authority restricted to ordinary meshes, geometries and attributes.
function ordinaryExecution(value,allowedFlags,channels=[]){
 if(!value)return false;
 for(let q=value;q&&q!==Object.prototype;q=Object.getPrototypeOf(q))for(const k of Reflect.ownKeys(q)){
  if(typeof k==='string'&&/^is[A-Z]/.test(k)&&value[k]&&!allowedFlags.includes(k))return false;
 }
 return channels.every(k=>!(k in value));
}
// Invocation-local index only: every validation rereads all current rows. The
// closing identity pass prevents callbacks during surface validation from
// changing the membership used to authorize a body. No cross-call cache.
// This opt-in authority requires every indexed mesh key to be an own data
// descriptor. Raw Collision may accept other records, but this bounded solver
// never executes a foreign owner getter during either index pass.
function ownerKey(row){
 const d=Object.getOwnPropertyDescriptor(row,'mesh');
 if(!d||!Object.hasOwn(d,'value'))fail('physical owner key must be an own data field');
 return d.value;
}
function bodyIndex(cm){
 const array=cm.colliders,rows=array.slice(),meshes=[],byMesh=new Map();
 for(const row of rows){const mesh=ownerKey(row);meshes.push(mesh);const found=byMesh.get(mesh);if(found)found.push(row);else byMesh.set(mesh,[row]);}
 return{array,rows,meshes,byMesh};
}
function assertBodyIndexCurrent(cm,index){
 if(cm.colliders!==index.array||cm.colliders.length!==index.rows.length)fail('body index membership changed during validation');
 for(let i=0;i<index.rows.length;i++)if(cm.colliders[i]!==index.rows[i]||ownerKey(cm.colliders[i])!==index.meshes[i])fail('body index membership changed during validation');
}
function validateOwner(cm,owner,p,prior,index){
 const m=owner?.mesh,e=expected(p);
 if(!ordinaryExecution(m,['isObject3D','isMesh'],['count','instanceMatrix','instanceColor','skeleton','bindMatrix','bindMatrixInverse','batchId','_drawRanges','_multiDrawCounts'])||!m?.isMesh||Object.getPrototypeOf(m)!==THREE.Mesh.prototype||m.type!=='Mesh'||m.name!==p.id||m.children.length||m.matrixAutoUpdate!==true||m.matrixWorldAutoUpdate!==true)fail(`real leaf Mesh identity ${p.id}`);
 m.updateWorldMatrix(true,false);
 for(let q=m;q;q=q.parent)if(q.visible!==true||q.layers.mask!==1||!q.matrix.equals(identity)||!q.matrixWorld.equals(identity)||q.matrixAutoUpdate!==true||q.matrixWorldAutoUpdate!==true||(q.parent&&!q.parent.children.includes(q)))fail(`local identity and effective visibility ${p.id}`);
 const mat=m.material;
 if(!ordinaryExecution(mat,['isMaterial','isMeshStandardMaterial'])||!mat?.isMeshStandardMaterial||mat.visible!==true||mat.transparent!==false||mat.opacity!==1||mat.side!==THREE.FrontSide||mat.displacementMap!==null||mat.alphaMap!==null||mat.colorWrite!==true||mat.alphaTest!==0||mat.alphaHash!==false||mat.clippingPlanes!==null||mat.onBeforeCompile!==THREE.Material.prototype.onBeforeCompile||!permittedMaterial(mat))fail(`visible ordinary surface ${p.id}`);
 const g=m.geometry;
 if(!ordinaryExecution(g,['isBufferGeometry'],['instanceCount','_maxInstanceCount'])||!ordinaryExecution(g?.attributes?.position,['isBufferAttribute'],['meshPerAttribute','data','buffer'])||!ordinaryExecution(g?.attributes?.normal,['isBufferAttribute'],['meshPerAttribute','data','buffer'])||!g?.isBufferGeometry||(!g.morphAttributes||Object.getPrototypeOf(g.morphAttributes)!==Object.prototype||Reflect.ownKeys(g.morphAttributes).length)||m.morphTargetInfluences!==undefined||m.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender||!(g.attributes.position?.array instanceof Float32Array)||!(g.attributes.normal?.array instanceof Float32Array)||g.index!==null||g.drawRange.start!==0||g.drawRange.count!==Infinity||!equalArray(g.attributes.position?.array,e.position)||!equalArray(g.attributes.normal?.array,e.normal)||g.attributes.position.itemSize!==3||g.attributes.normal.itemSize!==3||g.attributes.position.count!==e.position.length/3||g.attributes.normal.count!==e.normal.length/3||g.attributes.position.gpuType!==THREE.FloatType||g.attributes.normal.gpuType!==THREE.FloatType||g.attributes.position.normalized!==false||g.attributes.normal.normalized!==false||!g.boundingBox?.equals(e.boundingBox)||!g.boundingSphere?.equals(e.boundingSphere))fail(`actual authored closed solid ${p.id}`);
 const w=owner.walkable;
 if(w?.type!=='ramp'||w.rescue!==false||fields.some(k=>w[k]!==p[k])||!plainRecord(w,['type','rescue',...fields]))fail(`authored ramp ${p.id}`);
 const rows=cm.walkables.filter(r=>r.type==='ramp'&&fields.every(k=>r[k]===p[k]));
 if(rows.length!==1||!plainRecord(rows[0],['type','tag',...fields]))fail(`unique live ramp ${p.id}`);
 if(!Array.isArray(owner.colliders)||owner.colliders.length!==e.body.length||new Set(owner.colliders).size!==e.body.length)fail(`ordinary body count ${p.id}`);
 const bodyRows=[];
 for(let i=0;i<e.body.length;i++){
  const b=owner.colliders[i];if(!boxEqual(b,e.body[i]))fail(`authored body ${p.id}/${i}`);
  const found=index.byMesh.get(b)??[];
  if(found.length!==1||found[0].mesh!==b||!boxEqual(found[0].box,e.body[i])||!plainRecord(found[0],['mesh','box','tag']))fail(`live ordinary body ${p.id}/${i}`);
  bodyRows.push(found[0]);
 }
 const ancestors=[];for(let q=m.parent;q;q=q.parent)ancestors.push(q);
 if(prior&&(prior.mesh!==m||prior.parent!==m.parent||prior.ancestors.some((q,i)=>q!==ancestors[i])||prior.ancestors.length!==ancestors.length||prior.walkableTag!==rows[0].tag||prior.bodyTags.some((v,i)=>v!==bodyRows[i].tag)||prior.geometry!==g||prior.material!==mat||prior.materialState!==materialRecord(mat)||prior.walkable!==rows[0]||prior.bodyRows.some((r,i)=>r!==bodyRows[i])))fail(`registered identity changed ${p.id}`);
 return{mesh:m,parent:m.parent,ancestors,geometry:g,material:mat,materialState:materialRecord(mat),walkable:rows[0],walkableTag:rows[0].tag,bodyRows,bodyTags:bodyRows.map(r=>r.tag)};
}
export function registerWumenJointAscentOwners(cm,owners){
 if(!validManager(cm)||bindings.has(cm)||!Array.isArray(owners)||!owners.length||owners.length>14||!Array.from(owners).every(Boolean))fail('explicit unbound CollisionManager and nonempty dense owner set required');
 const records=[],ids=new Set(),index=bodyIndex(cm);
 for(const owner of owners){const p=WUMEN_JOINT_ASCENT_FIT.pieces.find(p=>p.id===owner.mesh?.name);if(!p||ids.has(p.id))fail('unknown or duplicate owner');ids.add(p.id);records.push({owner,p,identity:validateOwner(cm,owner,p,undefined,index)});}
 assertBodyIndexCurrent(cm,index);
 const record={records,public:null};
 record.public=Object.freeze({kind:'WUMEN_JOINT_LOCAL_CONTACT_CANDIDATE',renderScope:'LOCAL_CONTACT_RIG_NOT_LIVE_WORLD_SCENE',ownerCount:records.length,ownerIDs:Object.freeze([...ids]),routeAcceptance:false,dispose(){if(bindings.get(cm)===record)bindings.delete(cm);}});
 bindings.set(cm,record);return record.public;
}
export function validateWumenJointAscentBinding(cm){
 const r=bindings.get(cm);if(!r)return null;
 if(!validManager(cm))fail('registered manager semantics changed');
 const index=bodyIndex(cm);
 for(const e of r.records)validateOwner(cm,e.owner,e.p,e.identity,index);
 assertBodyIndexCurrent(cm,index);
 return r.public;
}
// Read-only opt-in check for the shared solver's unregistered O(1) path.
// It grants no support authority; active calls still run full validation.
export function hasWumenJointAscentBinding(cm){return bindings.has(cm);}
// Opaque registration generation, not proof of current geometry/physics validity.
// New registration always creates a different object even for identical owners.
export function wumenJointAscentBindingIdentity(cm){return bindings.get(cm)?.public??null;}
