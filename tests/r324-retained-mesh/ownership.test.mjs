// Real Three CPU ownership checks, not GPU-memory or full-scene acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {mergeByMaterial} from '../../src/utils/MergeUtils.js';

function observe(resource) { let count=0; resource.addEventListener('dispose',()=>count++); return ()=>count; }
function cleanup(...roots) {
 const geometries=new Set(), materials=new Set();
 for(const root of roots) root?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m)materials.add(m);});
 for(const g of geometries)g.dispose();for(const m of materials)m.dispose();
}
function bytes(g) {return JSON.stringify({attributes:Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,[a.itemSize,a.normalized,Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength).toString('hex')]])),index:g.index?Array.from(g.index.array):null,groups:g.groups});}

for(const kind of ['noMerge','instanced','points','line'])test(`source shared with retained ${kind} is not disposed during merge`,()=>{
 const root=new T.Group(),geometry=new T.BoxGeometry(1,2,3),material=new T.MeshStandardMaterial(),mergedSource=new T.Mesh(geometry,material);root.add(mergedSource);
 let kept;if(kind==='instanced')kept=new T.InstancedMesh(geometry,material,1);else if(kind==='points')kept=new T.Points(geometry,new T.PointsMaterial());else if(kind==='line')kept=new T.Line(geometry,new T.LineBasicMaterial());else{kept=new T.Mesh(geometry,material);kept.userData.noMerge=true;}
 kept.position.x=4;root.add(kept);const count=observe(geometry),original=bytes(geometry);let result;
 try{result=mergeByMaterial(root);assert.ok(result.children.includes(kept));assert.equal(kept.geometry,geometry);assert.equal(count(),0,'a returned object still owns this geometry');assert.equal(bytes(geometry),original);const merged=result.children.find(x=>x!==kept);assert.ok(merged?.isMesh);assert.notEqual(merged.geometry,geometry);assert.equal(merged.geometry.attributes.position.count,36);const shared=geometry.attributes.position.array;assert.notEqual(merged.geometry.attributes.position.array.buffer,shared.buffer);}
 finally{cleanup(root,result);}
});

test('exclusively merged shared source is disposed once, while material remains caller-owned',()=>{
 const root=new T.Group(),geometry=new T.BoxGeometry(),material=new T.MeshStandardMaterial();root.add(new T.Mesh(geometry,material),new T.Mesh(geometry,material));const gc=observe(geometry),mc=observe(material);let result;
 try{result=mergeByMaterial(root);assert.equal(gc(),1);assert.equal(mc(),0);assert.equal(result.children.length,1);assert.equal(result.children[0].geometry.attributes.position.count,72);}
 finally{cleanup(root,result);}
});

test('returned retained subtree references are protected without changing existing flattening behavior',()=>{
 const root=new T.Group(),geometry=new T.BoxGeometry(),material=new T.MeshStandardMaterial();root.add(new T.Mesh(geometry,material));
 const kept=new T.Group();kept.userData.noMerge=true;const array=new T.Mesh(geometry,[material]);kept.add(array);root.add(kept);const count=observe(geometry);let result;
 try{result=mergeByMaterial(root);assert.ok(result.children.includes(kept));assert.equal(array.parent,kept,'existing retained subtree stays unchanged');assert.equal(count(),0);}
 finally{cleanup(root,result);}
});
