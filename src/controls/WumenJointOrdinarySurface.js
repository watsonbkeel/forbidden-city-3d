import * as THREE from 'three';
const identity=new THREE.Matrix4();
const fail=message=>{throw new TypeError(`Wumen joint: ${message}`);};
function materialRecord(m,ignoreColor=false){const j=m.toJSON();for(const k of ['uuid','name','userData'])delete j[k];if(ignoreColor)delete j.color;return JSON.stringify(j);}
const defaultMaterial=new THREE.MeshStandardMaterial(),allowedMaterial=materialRecord(defaultMaterial,true);defaultMaterial.dispose();
function permittedMaterial(m){
 if(Object.getPrototypeOf(m)!==THREE.MeshStandardMaterial.prototype||m.toJSON!==THREE.Material.prototype.toJSON||m.onBeforeRender!==THREE.Material.prototype.onBeforeRender||m.customProgramCacheKey!==THREE.Material.prototype.customProgramCacheKey||Object.values(m).some(v=>v?.isTexture)||![m.color.r,m.color.g,m.color.b].every(v=>Number.isFinite(v)&&v>=0&&v<=1))return false;
 return materialRecord(m,true)===allowedMaterial;
}
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

export function assertWumenJointOrdinarySurface(m,name){
 if(!ordinaryExecution(m,['isObject3D','isMesh'],['count','instanceMatrix','instanceColor','skeleton','bindMatrix','bindMatrixInverse','batchId','_drawRanges','_multiDrawCounts'])||!m?.isMesh||Object.getPrototypeOf(m)!==THREE.Mesh.prototype||m.type!=='Mesh'||m.name!==name||m.children.length||m.matrixAutoUpdate!==true||m.matrixWorldAutoUpdate!==true)fail(`real leaf Mesh identity ${name}`);
 m.updateWorldMatrix(true,false);
 for(let q=m;q;q=q.parent)if(q.visible!==true||q.layers.mask!==1||!q.matrix.equals(identity)||!q.matrixWorld.equals(identity)||q.matrixAutoUpdate!==true||q.matrixWorldAutoUpdate!==true||(q.parent&&!q.parent.children.includes(q)))fail(`local identity and effective visibility ${name}`);
 const mat=m.material;
 if(!ordinaryExecution(mat,['isMaterial','isMeshStandardMaterial'])||!mat?.isMeshStandardMaterial||mat.visible!==true||mat.transparent!==false||mat.opacity!==1||mat.side!==THREE.FrontSide||mat.displacementMap!==null||mat.alphaMap!==null||mat.colorWrite!==true||mat.alphaTest!==0||mat.alphaHash!==false||mat.clippingPlanes!==null||mat.onBeforeCompile!==THREE.Material.prototype.onBeforeCompile||!permittedMaterial(mat))fail(`visible ordinary surface ${name}`);
 const ancestors=[];for(let q=m.parent;q;q=q.parent)ancestors.push(q);
 return{material:mat,ancestors};
}
export {materialRecord,ordinaryExecution,plainRecord};
