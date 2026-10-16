import * as THREE from 'three';
import crypto from 'node:crypto';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
export function captureGate(name='午门') {
 const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});
 globalThis.document??={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
 const mats=new Map(),lib={material:(n,params={})=>{const key=n+JSON.stringify(params);if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({name:n,...params}));return mats.get(key);},tileSize:()=>1,aspect:()=>1};
 const data=PALACE_LAYOUT.find(v=>v.name===name),builder=new PalaceBuilder(new THREE.Scene(),lib);let group;
 builder.finish=g=>{group=g;g.updateMatrixWorld(true);return g;};builder.buildGate(data);
 const tower=group.children.find(c=>c.userData.structure?.id===`axis/${name==='午门'?'wumen':'shenwu'}-upper-tower`);
 return {THREE,group,tower,builder,data,lib};
}
function hashArray(a){return crypto.createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');}
export function meshFingerprint(root,exclude=null) {
 const rows=[];function visit(o,path){if(o===exclude)return;if(o.isMesh)rows.push({path,material:o.material.name,matrix:o.matrixWorld.toArray(),attributes:Object.fromEntries(Object.entries(o.geometry.attributes).map(([n,a])=>[n,{size:a.itemSize,count:a.count,hash:hashArray(a.array)}])),index:o.geometry.index?hashArray(o.geometry.index.array):null});o.children.forEach((c,i)=>visit(c,`${path}/${i}`));}root.updateMatrixWorld(true);visit(root,'');return crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex');
}
export function outerColumnSignature(tower,depth=25){return tower.children.filter(m=>m.geometry?.type==='CylinderGeometry'&&Math.abs(Math.abs(m.position.z)-depth/2)<1e-8).map(m=>({position:m.position.toArray(),parameters:m.geometry.parameters,hash:hashArray(m.geometry.attributes.position.array)}));}
