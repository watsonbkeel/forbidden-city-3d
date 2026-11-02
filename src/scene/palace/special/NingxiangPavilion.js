import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='ningxiang-source-fit',done=new WeakSet();
export const NINGXIANG_FIT=Object.freeze({x:42.2,z:514.4,width:3.6,depth:3.6,columns:4,bounds:Object.freeze([39.4,0,511.6,45,5.2,517.2])});
export function buildNingxiangPavilion(kit,zoneId){
 if(zoneId!=='garden')return false;
 if(kit?.root?.name!=='garden'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable west-six host, once only, required');
 const staged=new CourtKit(kit.lib,'garden');let f,meta;
 try{
  f=staged.frame(42.2,514.4,0);f.name=ID;
  const box=(role,mat,w,h,d,x,y,z)=>{const m=typeof mat==='string'?staged.box(f,mat,w,h,d,x,y,z):staged.mesh(f,new T.BoxGeometry(w,h,d),mat,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.ningxiangStoneTop=true;return m;};
  stone('platform','wall_brick',4.2,.2,4.2,0,.1,0);
  stone('front-step','stone_slab',1.6,.1,.4,0,.05,-2.3);
  for(const x of[-1.6,1.6])for(const z of[-1.6,1.6]){const m=staged.mesh(f,new T.CylinderGeometry(.14,.16,2.8,10),kit.lib.material('wood_column'),x,1.6,z);m.name=ID+'/column';}
  // Three actual bench sides; south remains an open gameplay entrance.
  box('bench-seat','wood_column',3.2,.14,.35,0,.66,1.55);
  for(const x of[-1.55,1.55])box('bench-seat','wood_column',.35,.14,3.2,x,.66,0);
  for(const x of[-1.35,0,1.35])box('bench-leg','wood_column',.12,.4,.2,x,.4,1.55);
  for(const x of[-1.55,1.55])for(const z of[-1.35,0,1.35])box('bench-leg','wood_column',.2,.4,.12,x,.4,z);
  for(const z of[-1.6,1.6])box('header','caihua_beam',3.45,.26,.25,0,2.91,z);
  for(const x of[-1.6,1.6])box('header','caihua_beam',.25,.26,3.2,x,2.91,0);
  const roof=staged.roof(f,{type:'pavilion',sides:4,width:3.6,depth:3.6,baseY:3,height:1.5,overhang:.4,layers:1,brackets:false});roof.name=ID+'/square-pyramidal';
  const mats=[0xc99827,0x294f69,0x3e704f].map((color,i)=>new T.MeshStandardMaterial({name:'ningxiang_coarse_three_color_'+i,color,roughness:.82}));staged.owned.push(...mats);
  // Existing roof coordinates/UVs, grouped by a coarse position-derived color
  // pattern. Three draw groups, not a separate object for each historical tile.
  roof.traverse(m=>{if(!m.isMesh||!/^roof_tile/.test(m.material?.name??''))return;const g=m.geometry,p=g.attributes.position,ix=g.index,buckets=[[],[],[]];
   for(let i=0;i<(ix?.count??p.count);i+=3){const ids=[0,1,2].map(k=>ix?.getX(i+k)??i+k),cx=ids.reduce((a,k)=>a+p.getX(k),0)/3,cz=ids.reduce((a,k)=>a+p.getZ(k),0)/3;const c=((Math.floor((cx+3)/.55)+Math.floor((cz+3)/.55))%3+3)%3;buckets[c].push(...ids);}
   const ng=new T.BufferGeometry();for(const[name,attr]of Object.entries(g.attributes)){const a=[];for(const bucket of buckets)for(const i of bucket)for(let k=0;k<attr.itemSize;k++)a.push(attr.array[i*attr.itemSize+k]);ng.setAttribute(name,new T.Float32BufferAttribute(a,attr.itemSize));}
   let start=0;for(let c=0;c<3;c++){if(buckets[c].length)ng.addGroup(start,buckets[c].length,c);start+=buckets[c].length;}m.geometry=ng;m.material=mats;m.userData.ningxiangTriColor=true;m.userData.noMerge=true;g.dispose();});
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.ningxiangStoneTop){const b=new T.Box3().setFromObject(m);b.ningxiangStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(39.4,-1e-6,511.6),new T.Vector3(45,5.2,517.2));if(!safe.containsBox(b))throw Error('Ningxiang actual geometry escaped approved full envelope '+JSON.stringify({min:b.min.toArray(),max:b.max.toArray()}));
  meta={id:ID,sourceObjectId:'FC-7BE8375458',name:'凝香亭',source:'https://www.dpm.org.cn/explore/building/236444.html',ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/dc/1632%5B1024%5D.jpg',ownPhotoIdentity:'OFFICIAL_CAPTION_NINGXIANG',columns:4,benchSides:3,southOpening:true,wholeObjectAccepted:false,currentAdmissionVerified:false,roofPatternVerified:false,newRooms:0,newMapItems:0,
   sourceSupported:['official text: Ningxiang in northwest Imperial Garden; square pyramidal four-column pavilion with sitting-bench rails and yellow/blue/green chessboard-pattern glazed tiles','own official photograph caption explicitly Ningxiang: independent small square roof, red columns, bench pieces and low stone base'],
   fit:['regional northwest placement between present Yanhui and Weiyu to preserve existing walls/paths; not exact historical coordinates or survey','all dimensions including3.6 roof body, roof height, .2 platform/.1 step, column/bench proportions and coarse three-color partition, not exact tile pattern','south opening and three bench-side layout for game access; hidden faces simplified'],
   excluded:['foreground white rails, neighboring building, trees, modern pots and loose ramp from photo','interior enclosure, fine roof animals/ceiling painting, landscape changes, new walls or virtual ramps'],unknown:['exact current site coordinates and complete hidden facade','precise tile pattern/material/bench distribution and current admission','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
