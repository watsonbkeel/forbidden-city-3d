import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='yucui-source-fit',done=new WeakSet();
export const YUCUI_FIT=Object.freeze({x:-45.2,z:514.4,width:2.8,depth:2.8,columns:4,bounds:Object.freeze([-47.5,0,512.1,-42.9,4.8,516.7])});
export function buildYucuiPavilion(kit,zoneId){
 if(zoneId!=='garden')return false;
 if(kit?.root?.name!=='garden'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable garden host, once only, required');
 const staged=new CourtKit(kit.lib,'garden');let f,meta;
 try{
  f=staged.frame(-45.2,514.4,0);f.name=ID;
  const box=(role,mat,w,h,d,x,y,z)=>{const m=typeof mat==='string'?staged.box(f,mat,w,h,d,x,y,z):staged.mesh(f,new T.BoxGeometry(w,h,d),mat,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.yucuiStoneTop=true;return m;};
  stone('platform','stone_slab',3.4,.16,3.4,0,.08,0);
  stone('front-step','stone_slab',1.4,.08,.4,0,.04,-1.9);
  for(const x of[-1.2,1.2])for(const z of[-1.2,1.2]){const m=staged.mesh(f,new T.CylinderGeometry(.13,.15,2.45,10),kit.lib.material('wood_column'),x,1.385,z);m.name=ID+'/column';}
  // Own front photograph is open: three low bench sides, no historical window shell.
  box('bench-seat','wood_column',2.4,.12,.28,0,.6,1.17);
  for(const x of[-1.17,1.17])box('bench-seat','wood_column',.28,.12,2.4,x,.6,0);
  for(const x of[-1,0,1])box('bench-leg','wood_column',.1,.38,.18,x,.35,1.17);
  for(const x of[-1.17,1.17])for(const z of[-1,0,1])box('bench-leg','wood_column',.18,.38,.1,x,.35,z);
  for(const z of[-1.2,1.2])box('header','caihua_beam',2.65,.24,.22,0,2.59,z);
  for(const x of[-1.2,1.2])box('header','caihua_beam',.22,.24,2.4,x,2.59,0);
  const roof=staged.roof(f,{type:'pavilion',sides:4,width:2.8,depth:2.8,baseY:2.7,height:1.2,overhang:.25,layers:1,brackets:false});roof.name=ID+'/square-pyramidal';
  const mats=[0xc99827,0x294f69,0x3e704f].map((color,i)=>new T.MeshStandardMaterial({name:'yucui_coarse_three_color_'+i,color,roughness:.82}));staged.owned.push(...mats);
  // Existing roof coordinates/UVs, grouped by a coarse position-derived color
  // pattern. Three draw groups, not a separate object for each historical tile.
  roof.traverse(m=>{if(!m.isMesh||!/^roof_tile/.test(m.material?.name??''))return;const g=m.geometry,p=g.attributes.position,ix=g.index,buckets=[[],[],[]];
   for(let i=0;i<(ix?.count??p.count);i+=3){const ids=[0,1,2].map(k=>ix?.getX(i+k)??i+k),cx=ids.reduce((a,k)=>a+p.getX(k),0)/3,cz=ids.reduce((a,k)=>a+p.getZ(k),0)/3;const c=((Math.floor((cx+3)/.55)+Math.floor((cz+3)/.55))%3+3)%3;buckets[c].push(...ids);}
   const ng=new T.BufferGeometry();for(const[name,attr]of Object.entries(g.attributes)){const a=[];for(const bucket of buckets)for(const i of bucket)for(let k=0;k<attr.itemSize;k++)a.push(attr.array[i*attr.itemSize+k]);ng.setAttribute(name,new T.Float32BufferAttribute(a,attr.itemSize));}
   let start=0;for(let c=0;c<3;c++){if(buckets[c].length)ng.addGroup(start,buckets[c].length,c);start+=buckets[c].length;}m.geometry=ng;m.material=mats;m.userData.yucuiTriColor=true;m.userData.noMerge=true;g.dispose();});
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate real bench/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.yucuiStoneTop){const b=new T.Box3().setFromObject(m);b.yucuiStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(-47.5,-1e-6,512.1),new T.Vector3(-42.9,4.8,516.7));if(!safe.containsBox(b))throw Error('Yucui actual geometry escaped approved full envelope '+JSON.stringify({min:b.min.toArray(),max:b.max.toArray()}));
  meta={id:ID,sourceObjectId:'FC-D471A19B37',name:'玉翠亭',source:'https://www.dpm.org.cn/explore/building/236444.html',ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e981571b6035.jpg',ownPhotoIdentity:'OFFICIAL_CAPTION_YUCUI',columns:4,benchSides:3,southOpening:true,wholeObjectAccepted:false,currentAdmissionVerified:false,roofPatternVerified:false,newRooms:0,newMapItems:0,
   sourceSupported:['own officially captioned Yucui front photograph: four red columns, open central front, low stone base/step, three bench/rail sides and square pyramidal roof','official text: northeast Imperial Garden, yellow/blue/green chessboard glazed tiles; historical added doors/windows are not asserted as current enclosure'],
   fit:['regional northeast placement -45.2,514.4 to preserve current rockery, old east lane and Chizao; not historical exact coordinates or survey','all dimensions:2.8 roof/.25 overhang,2.7 eave/1.2 rise,.16 platform/.08 step, columns and three simplified bench sides','coarse three-color roof triangle partition, not exact chessboard tiles; no copied photograph texture'],
   excluded:['photo foreground tree, neighboring walls/buildings, modern equipment and loose access ramps','front partial lattice panels, fine roof beasts/brackets, plaque lettering, ceiling painting and hidden precise joinery','historical enclosing door/window shell, new rooms/maps, landscape cuts, virtual ramps or new contact permissions'],unknown:['exact surveyed location/dimensions and current museum access','full back/sides, fine tile pattern and ceiling decoration','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
