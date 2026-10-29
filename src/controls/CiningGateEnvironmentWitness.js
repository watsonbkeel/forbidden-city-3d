import {CINING_GATE_REGION} from './CiningGateSupport.js';
/** Dedicated CiningGate source witness. Same source-triangle verification as the
 * retained Chengqian adapter; no modification of that adapter or global ground.
 * No new geometry or synthetic plane. Weak refs do not retain the whole scene. */
const bindings=new WeakMap();
// Actual Environment triangles cover dispatch plus one maximum Collision substep
// (radius <= .5 -> max(radius*.5,.05) <= .25), so kinematic source and
// target feet both have witnessed ground while crossing the domain boundary.
const patch={minX:207.05,maxX:237.35,minZ:148.45,maxZ:162.05};
export function bindCiningGateEnvironmentWitness(cm,scene){
 const rows=[];scene.traverse(m=>{if(m.userData?.environmentGroundSource===true)rows.push(m)});
 if(rows.length>1)throw Error('Ambiguous Environment ground source');
 if(rows.length===1)bindings.set(cm,{scene:new WeakRef(scene),mesh:new WeakRef(rows[0]),cache:null});else bindings.delete(cm);
}
export function unbindCiningGateEnvironmentWitness(cm){bindings.delete(cm);}
const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
export function ciningGateEnvironmentWitness(cm,region,x,z,radius){
 if(![x,z,radius].every(Number.isFinite)||radius<=0||Object.keys(CINING_GATE_REGION).some(k=>region?.[k]!==CINING_GATE_REGION[k])||x<patch.minX||x>patch.maxX||z<patch.minZ||z>patch.maxZ||(region.kind!=='cining-gate'||region.id!=='cining-gate')||radius>.5||x+radius+.25<region.minX||x-radius-.25>region.maxX||z+radius+.25<region.minZ||z-radius-.25>region.maxZ)return null;
 const state=bindings.get(cm),scene=state?.scene.deref(),mesh=state?.mesh.deref();
 if(!scene||scene.matrixAutoUpdate!==true||scene.matrixWorldAutoUpdate!==true||scene.parent!==null||scene.visible===false||scene.position.x!==0||scene.position.y!==0||scene.position.z!==0||scene.rotation.x!==0||scene.rotation.y!==0||scene.rotation.z!==0||scene.scale.x!==1||scene.scale.y!==1||scene.scale.z!==1||!mesh||mesh.matrixAutoUpdate!==true||mesh.matrixWorldAutoUpdate!==true||mesh.parent!==scene||mesh.visible===false||mesh.userData.environmentGroundSource!==true||mesh.position.x!==0||mesh.position.y!==0||mesh.position.z!==0||mesh.rotation.x!==-Math.PI/2||mesh.rotation.y!==0||mesh.rotation.z!==0||mesh.scale.x!==1||mesh.scale.y!==1||mesh.scale.z!==1)return null;
 const g=mesh.geometry,p=g?.attributes?.position,index=g?.index;if(!p||p.itemSize!==3||g.drawRange.start!==0||g.drawRange.count!==Infinity||!mesh.material||Array.isArray(mesh.material)||mesh.material.visible===false||mesh.material.opacity===0)return null;
 // BufferAttribute.needsUpdate/version is the same mutation contract used by
 // the renderer. Replacement geometry/arrays/index also invalidate this cache.
 let cache=state.cache;
 if(!cache||cache.geometry!==g.uuid||cache.positionVersion!==p.version||cache.indexVersion!==(index?.version??-1)||cache.positionArray.deref()!==p.array||cache.indexArray?.deref()!==(index?.array)){
  const triangles=[];for(let i=0;i<(index?.count??p.count);i+=3){const ids=[0,1,2].map(k=>index?index.getX(i+k):i+k);if(ids.some(j=>!Number.isInteger(j)||j<0||j>=p.count||![p.getX(j),p.getY(j),p.getZ(j)].every(Number.isFinite)||p.getZ(j)!==0))return null;const q=ids.map(j=>[p.getX(j),-p.getY(j)]);if(cross(q[0],q[1],q[2])===0)continue;if(Math.max(...q.map(v=>v[0]))<patch.minX||Math.min(...q.map(v=>v[0]))>patch.maxX||Math.max(...q.map(v=>v[1]))<patch.minZ||Math.min(...q.map(v=>v[1]))>patch.maxZ)continue;triangles.push(q);}
  cache={geometry:g.uuid,positionVersion:p.version,indexVersion:index?.version??-1,positionArray:new WeakRef(p.array),indexArray:index?new WeakRef(index.array):undefined,triangles};state.cache=cache;
 }
 const point=[x,z];for(const q of cache.triangles){const signs=[cross(q[0],q[1],point),cross(q[1],q[2],point),cross(q[2],q[0],point)];if(signs.every(v=>v>=0)||signs.every(v=>v<=0))return{height:0,owner:null,source:'existing-environment-ground-cining-gate',regionId:region.id};}return null;
}
