import * as THREE from 'three';
import {createRequire} from 'node:module';
const {createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas');
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CourtKit} from '../../src/scene/palace/kit.js';
export const hash=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
export const axis=JSON.parse(readFileSync(new URL('../../data/zones/axis-courts.json',import.meta.url)));
export const binding={zoneId:'axis-courts',itemIndex:2,item:axis.items[2]};
export function canvasDOM(){globalThis.document={createElement:()=>createCanvas(1,1),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};}
export async function library(quality='hd'){
 canvasDOM();const {loadLocalTextureLibrary}=await import('./r58-zuoyi-real-texture-loader.mjs');
 return (await loadLocalTextureLibrary({quality,scope:'all'})).library;
}
export function gate(lib,item=binding.item){
 const kit=new CourtKit(lib);kit.gate({...item,rot:item.rot==='east'?Math.PI/2:item.rot==='west'?-Math.PI/2:0});
 const frame=kit.root.children.at(-1),leaves=frame.children.filter(m=>m.isMesh&&m.material===lib.material('door_studded'));
 return{kit,frame,leaves};
}
export function goldRuns(image,axisName='y',at=65/762,range=[.04,.98]){
 const {width,height}=image,data=image.getContext('2d').getImageData(0,0,width,height).data,n=axisName==='y'?height:width;
 const runs=[];let start=null;
 for(let p=Math.round(range[0]*n);p<Math.round(range[1]*n);p++){
  const x=axisName==='y'?Math.round(at*width):p,y=axisName==='y'?p:Math.round(at*height),i=(y*width+x)*4;
  const [r,g,b]=data.subarray(i,i+3),gold=g>55&&g>1.5*b&&r>1.1*g;
  if(gold&&start===null)start=p;
  if(!gold&&start!==null){runs.push([start,p-1]);start=null;}
 }
 const joined=[];for(const [a,b] of runs){if(joined.length&&a-joined.at(-1)[1]<n*.014)joined.at(-1)[1]=b;else joined.push([a,b]);}
 return joined.filter(([a,b])=>b-a>n*.014);
}
export function triangles(root,{world=true,material=true}={}){
 root.updateMatrixWorld(true);const out=[];
 root.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes,idx=m.geometry.index;
  for(let i=0;i<(idx?.count??a.position.count);i+=3){const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k),row={
   p:ids.map(j=>{const v=new THREE.Vector3().fromBufferAttribute(a.position,j);if(world)v.applyMatrix4(m.matrixWorld);return v.toArray();}),
   n:ids.map(j=>{const v=new THREE.Vector3().fromBufferAttribute(a.normal,j);if(world)v.applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(m.matrixWorld));return v.toArray();}),
   uv:ids.map(j=>[a.uv.getX(j),a.uv.getY(j)])};if(material)row.material=m.material?.name??null;out.push(row);
  }
 });return out;
}
export function textureHash(texture){const image=texture.image;return createHash('sha256').update(image.getContext('2d').getImageData(0,0,image.width,image.height).data).digest('hex');}
