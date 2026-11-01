import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from 'three';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {library} from './inner-palace-fixture.mjs';
import {buildEnclosedPavilion} from '../../src/scene/palace/special/EnclosedPavilions.js';
export {THREE};
export const item=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-east.json',import.meta.url))).items.find(i=>i.name==='箭亭');
export function fixture(lib=library()){const kit=new CourtKit(lib),{f:frame}=buildEnclosedPavilion(kit,item);kit.root.updateMatrixWorld(true);return {kit,frame,item,dispose:()=>kit.dispose(kit.root)};}
export const sha=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
export function rows(root,exclude=new Set()){const out=[];root.traverse(m=>{if(!m.isMesh||exclude.has(m))return;out.push({name:m.name,data:m.userData,transform:[m.position.toArray(),m.rotation.toArray(),m.scale.toArray()],visible:m.visible,cast:m.castShadow,receive:m.receiveShadow,material:[m.material?.uuid,m.material?.name,m.material?.color?.getHex()],a:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[a.itemSize,a.normalized,...a.array]])),index:m.geometry.index?[...m.geometry.index.array]:null});});return sha(out);}
export const physical=k=>sha(Object.fromEntries(['colliders','walkables','rooms','regions','mapItems'].map(n=>[n,k[n]])));
export const target=m=>m.isMesh&&((m.userData.role==='arrow-facade-head'&&Math.abs(m.position.z+6.8)<1e-6&&[-5.5,0,5.5].some(x=>Math.abs(m.position.x-x)<1e-6))||(m.name==='arrow-frame-beam'&&Math.abs(m.position.z+8.8)<1e-6));
export function triangles(m,predicate=()=>true){const g=m.geometry,a=g.attributes,idx=g.index,out=[];for(let i=0;i<(idx?.count??a.position.count);i+=3){const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k);if(predicate(ids,a))out.push(ids.map(j=>Object.fromEntries(Object.entries(a).map(([k,v])=>[k,Array.from(v.array.subarray(j*v.itemSize,(j+1)*v.itemSize))]))));}return out;}
