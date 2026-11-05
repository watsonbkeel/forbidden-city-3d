// Reviewed conservative query used only by tests; never attached to runtime scene.
import*as T from'three';
/** Synthetic-reviewed proposal only. Geometry views share every original typed
 * attribute/index read-only; private bounds caches prevent Mesh.raycast from
 * writing the original geometry. Nothing is attached to root or a CM. */
export function createPrivateQuery(initialMeshes){
 const views=new Map(),proxies=new Map(),originals=new WeakMap(),owned=new Set(),counts=new Map();let fallback,disposed=false;
 const own=x=>{owned.add(x);counts.set(x,0);x.addEventListener('dispose',()=>counts.set(x,counts.get(x)+1));return x};
 const neutral=()=>fallback??=own(new T.MeshBasicMaterial({color:0x888888,side:T.DoubleSide}));
 function view(g,m){if(views.has(g))return views.get(g);if(!g?.isBufferGeometry||!g.attributes.position||Object.values(g.morphAttributes).some(a=>a.length))throw TypeError('unsupported query geometry '+m.uuid);const v=own(new T.BufferGeometry());for(const[k,a]of Object.entries(g.attributes))v.setAttribute(k,a);v.setIndex(g.index);v.groups=g.groups.map(q=>({...q}));v.drawRange={...g.drawRange};v.boundingBox=g.boundingBox?.clone()??null;v.boundingSphere=g.boundingSphere?.clone()??null;views.set(g,v);return v}
 function queryMaterial(m){const a=m.material;if(a==null)return neutral();if(!Array.isArray(a))return a;if(!a.length||!m.geometry.groups.length)return neutral();const length=Math.max(a.length,...m.geometry.groups.map(q=>q.materialIndex+1));return Array.from({length},(_,i)=>a[i]??neutral())}
 function proxy(m){if(disposed)throw Error('private query disposed');if(!m?.isMesh||m.isSkinnedMesh||m.isInstancedMesh)throw TypeError('unsupported query mesh '+m?.uuid);let p=proxies.get(m);const geometry=view(m.geometry,m),material=queryMaterial(m);if(!p){p=new T.Mesh(geometry,material);p.matrixAutoUpdate=false;proxies.set(m,p);originals.set(p,m)}else{p.geometry=geometry;p.material=material}p.matrix.copy(m.matrixWorld);p.matrixWorld.copy(m.matrixWorld);p.layers.mask=m.layers.mask;return p}
 function conservative(m){return m.material==null||Array.isArray(m.material)&&(!m.material.length||Array.from(m.material).some(q=>q==null)||m.geometry.groups.some(q=>m.material[q.materialIndex]==null))}
 function firstHit(origin,point,meshes=initialMeshes){const objects=meshes.map(proxy),ray=new T.Raycaster(origin,point.clone().sub(origin).normalize(),.001,100),h=ray.intersectObjects(objects,false)[0];return h?{...h,object:originals.get(h.object),usedConservativeMaterial:conservative(originals.get(h.object))}:undefined}
 function faceMaterial(m,offset){if(disposed)throw Error('private query disposed');if(!Array.isArray(m.material))return m.material??neutral();const group=m.geometry.groups.find(q=>offset>=q.start&&offset<q.start+q.count);return group?m.material[group.materialIndex]??neutral():neutral()}
 function dispose(){if(disposed)return;disposed=true;const errors=[];for(const x of owned)try{x.dispose()}catch(e){errors.push(e)}if(errors.length)throw new AggregateError(errors,'private query cleanup failures')}
 return{firstHit,faceMaterial,dispose,debug:()=>({proxyParents:[...proxies.values()].map(p=>p.parent),privateDisposeCounts:[...counts.values()],privateGeometryViews:views.size,originalsNeverAttached:true})};
}
