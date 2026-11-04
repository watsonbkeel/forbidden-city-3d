import * as T from 'three';
import {YANGXIN_PARTITION_SOURCE as SOURCE} from './YangxinPartitionSource.js';
import {yangxinPartitionSignature} from './YangxinPartitionSignature.js';
const PHOTO='https://img.dpm.org.cn/Uploads/image/2026/04/30/yxd-BZJjHldgP313.jpg';
const HEIGHT=6.78,DOOR_HEIGHT=3.4;
const appendable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable===true;
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return d?d.writable===true:!(k in o)&&Object.isExtensible(o)};
function field(ctx,w,h) {
 // Photo-supported red boards and upper painted band; no invented text or carving.
 ctx.fillStyle='#9d291c';ctx.fillRect(0,0,w,h);
 const y=h*(1-4.6/HEIGHT);ctx.fillStyle='#29433e';ctx.fillRect(0,0,w,y);
 ctx.strokeStyle='#a69255';ctx.lineWidth=3;ctx.strokeRect(2,4,w-4,y-8);
 for(let i=0;i<8;i++)ctx.strokeRect(8+i*w/8,16,w/8-16,y-32);
 // A deliberately plain fitted crown, not a claim about the exact pilu profile.
 const cx=w*5.9/11.6,span=w*1.5/11.6,base=h*(1-DOOR_HEIGHT/HEIGHT);
 ctx.strokeStyle='#6d2018';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(cx-span-3,h);ctx.lineTo(cx-span-3,base-10);ctx.lineTo(cx-span*.65,base-10);ctx.lineTo(cx-span*.65,base-24);ctx.lineTo(cx+span*.65,base-24);ctx.lineTo(cx+span*.65,base-10);ctx.lineTo(cx+span+3,base-10);ctx.lineTo(cx+span+3,h);ctx.stroke();
}
/** Replaces only proved legacy partition faces. Leaves original GLB bytes and
 * all non-target triangles/materials untouched; install before physics or fade. */
export function installYangxinMainPartitions(root) {
 if(!root?.isObject3D||root.parent||root.name!=='Scene'||!root.visible||!root.matrixAutoUpdate||root.position.lengthSq()||!root.quaternion.equals(new T.Quaternion())||!root.scale.equals(new T.Vector3(1,1,1))||root.userData.yangxinMainPartitions||!appendable(root.children)||!writable(root.userData,'yangxinMainPartitions'))throw Error('Yangxin partition source host required once only');
 const names=new Map(),refs=new Map();root.traverse(m=>{if(m.isMesh){if(names.has(m.name)||/^(COL_)?R164_YX_PART_/.test(m.name))throw Error('Yangxin partition duplicate source');names.set(m.name,m);refs.set(m.geometry,(refs.get(m.geometry)??0)+1)}});
 const rows=SOURCE.map(s=>{const m=names.get(s.name),g=m?.geometry,a=m?.material;if(!m||m.parent!==root||m.children.length||!m.visible||!m.matrixAutoUpdate||!m.matrixWorldAutoUpdate||!writable(m,'geometry')||(s.name.startsWith('COL_')&&!['x','y','z'].every(k=>writable(m.position,k)))||refs.get(g)!==1||!g.isBufferGeometry||Object.keys(g.morphAttributes).length||g.groups.length||g.drawRange.start!==0||g.drawRange.count!==Infinity||!a?.isMeshStandardMaterial||a.map||a.normalMap||a.bumpMap||a.displacementMap||a.alphaMap||a.alphaTest||a.wireframe||!a.visible||!a.colorWrite||a.clippingPlanes)throw Error('Yangxin partition source changed '+s.name);m.updateMatrix();if(JSON.stringify(yangxinPartitionSignature(m))!==JSON.stringify(s.signature))throw Error('Yangxin partition signature changed '+s.name);return{...s,m}});
 const staged=[],old=[],newMeshes=[],geometries=[];let material,map;
 const cleanup=()=>{for(const g of geometries)g.dispose();material?.dispose();map?.dispose()};
 try {
  const c=typeof document==='undefined'?null:document.createElement('canvas');if(c){c.width=512;c.height=512}const ctx=c?.getContext('2d');if(!ctx)return{applied:false,reason:'NO_2D_CANVAS_OR_CONTEXT_ORIGINAL_RETAINED'};
  field(ctx,c.width,c.height);map=new T.CanvasTexture(c);map.name='r164-yangxin-main-red-boards-fit';map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
  material=new T.MeshStandardMaterial();material.copy(names.get('merged_red_lacquer').material);material.color.set(0xffffff);material.map=map;material.name=map.name;material.userData={source:PHOTO,fit:'RED_BOARD_AND_UPPER_BAND_FIT_NOT_MEASURED_OR_EXACT_CROWN'};
  for(const r of rows.filter(r=>r.name.startsWith('merged_'))){const g=new T.BufferGeometry();geometries.push(g);g.copy(r.m.geometry);const remove=new Set(r.faces),index=Array.from(g.index.array).filter((_,i)=>!remove.has(Math.floor(i/3)));g.setIndex(new T.BufferAttribute(new r.m.geometry.index.array.constructor(index),1));staged.push({m:r.m,g});}
  function solid(sx,side,minZ,maxZ,low,high,proxy) {
   const depth=maxZ-minZ,height=high-low,z=(minZ+maxZ)/2,y=(low+high)/2;
   const g=new T.BoxGeometry(.24,height,depth);geometries.push(g);
   const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
   for(let i=0;i<p.count;i++){if(Math.abs(n.getX(i))===1)uv.setXY(i,(p.getZ(i)+z+5.9)/11.6,(p.getY(i)+y)/HEIGHT);else uv.setXY(i,.02,.02)}
   const name=`R164_YX_PART_${sx}_${side}`,mesh=new T.Mesh(g,material);mesh.name=name;mesh.position.set(sx*6,y,z);mesh.userData={part:'yangxin-main-partition',fit:'PHOTO_FIT_NOT_SURVEYED',source:PHOTO};newMeshes.push(mesh);
   if(proxy){staged.push({m:proxy,g,position:mesh.position.clone()})}else{const col=new T.Mesh(g,rows.find(r=>r.name.startsWith('COL_')).m.material);col.name='COL_'+name;col.position.copy(mesh.position);col.userData={visibleOwner:name,overhead:'YANGXIN_PARTITION_HEAD'};newMeshes.push(col)}
  }
  for(const sx of[-1,1]){solid(sx,'s',-5.9,-1.5,0,HEIGHT,names.get(`COL_part_${sx}_s`));solid(sx,'n',1.5,5.7,0,HEIGHT,names.get(`COL_part_${sx}_n`));solid(sx,'head',-1.5,1.5,DOOR_HEIGHT,HEIGHT,null)}
  const meta={applied:true,source:PHOTO,scope:'PROVED_84_LEGACY_PART_COMPONENTS_ONLY',removedVisibleTriangles:1008,newVisibleTriangles:72,retainedGLBBytes:true,doorWidth:3,doorHeight:DOOR_HEIGHT,top:HEIGHT,fit:'RED_BOARDS_AND_UPPER_BAND_WITH_SIMPLIFIED_CROWN_NOT_SURVEY',openDoorDisplay:true,doorLeavesReconstructed:false,wholeInteriorAccepted:false,unverified:['Exact door crown, carving, panel divisions, paint and reverse','Museum access and historical open-door posture','GPU rendering, mobile and full World']};
  // Only after all guards/allocations. Arbitrary throwing object/dispose listeners
  // during this synchronous commit are outside the loader's source contract.
  for(const r of staged){old.push(r.m.geometry);r.m.geometry=r.g;if(r.position)r.m.position.copy(r.position)}
  root.add(...newMeshes);root.userData.yangxinMainPartitions=meta;for(const g of old)g.dispose();return meta;
 } catch(error){cleanup();throw error}
}
