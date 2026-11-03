import * as T from 'three';
import {CourtKit} from '../kit.js';
import {buildWallCap} from '../../RoofBuilder.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='zhaofu-gate',done=new WeakSet();
const GATE={kind:'gate',name:'建福门',x:183.7,z:409.4};
const HALL={kind:'hall',name:'延春阁',x:216,z:485.5,w:23.5,d:24.3,pad:.8,ph:.75,colH:10.24,roof:'pavilion',layers:2};
const COURT={kind:'courtWalls',x0:178.6,x1:245,z0:409.4,z1:520,gates:[{side:'s',at:183.7,gate:'建福门'}]};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validateHost(k,z){const r=k?.root;let exists=false;r?.traverse(m=>{if(m.userData.structure?.sourceObjectId==='FC-2953884F94')exists=true;});if(!r||r.name!=='outer-west'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(k)||!mutable(r.children)||['colliders','walkables','owned','rooms','mapItems','regions'].some(q=>!mutable(k[q]))||z.items?.filter(i=>same(i,GATE)).length!==1||z.items?.filter(i=>same(i,HALL)).length!==1||z.items?.filter(i=>same(i,COURT)).length!==1||exists||done.has(k))throw Error('Exact mutable untransformed Yuhua east host required, once only');}
/** Official own8202 foreground gate, not the separate tall incense burner
 * behind it. One real aperture; partial leaf angles/dimensions are game fit. */
export function buildZhaofuGate(kit,zone){
 if(zone?.id!=='outer-west')return false;validateHost(kit,zone);
 const s=new CourtKit(kit.lib,'outer-west'),cache=new Map();s.ridge.name='r163_zhaofu_gate_private_ridge';s.gold.name='r163_zhaofu_gate_private_gold';let f,meta;
 const material=(name,color)=>{const key=name+':'+(color??'');if(!cache.has(key)){const m=kit.lib.material(name).clone();m.name='r163_zhaofu_gate_'+key.replace(':','_');if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}cache.set(key,m);s.owned.push(m);}return cache.get(key);};
 try{
  for(const n of['stone_slab','wall_red','wood_column','caihua_beam','roof_tile','rafters','dougong_band'])material(n);
  f=s.frame(216,352.8,0);f.name=ID;
  const mesh=(role,g,m,x=0,y=0,z=0)=>{const q=s.mesh(f,g,m,x,y,z);q.name=ID+'/'+role;return q;};
  const box=(role,name,w,h,d,x,y,z,color,stone=false)=>{const tile=kit.lib.tileSize(name),mat=material(name,color),q=mesh(role,applyBoxUV(new T.BoxGeometry(w,h,d),tile),mat,x,y,z);if(stone)q.userData.zhaofuGateStoneTop=role;return q;};
  const red=0x8f4134,wood=0x6a3b2e,gold=0xb99a47;
  box('real-low-central-stone-threshold-fit','stone_slab',3,.12,2.8,0,.06,0,undefined,true);
  for(const sign of[-1,1]){
   box('real-pier-stone-foot-fit','stone_slab',1.6,.12,2.4,sign*2.3,.06,0);
   box('red-solid-gate-pier-fit','wall_red',1.6,3.2,2.4,sign*2.3,1.72,0,red);
   box('real-cheek-stone-foot-fit','stone_slab',2,.12,.48,sign*4.1,.06,.1);
   box('red-short-cheek-wall-fit','wall_red',2,2.43,.36,sign*4.1,1.335,.1,red);
   box('golden-vertical-aperture-frame-fit','wood_column',.12,2.98,.16,sign*1.5,1.61,-.85,gold);
  }
  box('real-timber-lintel-fit','wood_column',6.2,.33,2.4,0,3.485,0,wood);
  box('golden-aperture-head-frame-fit','wood_column',3.12,.13,.16,0,3.10,-.85,gold);
  box('right-partial-golden-door-fit','wood_column',.8,2.85,.1,1.1,1.55,-.05,gold);
  for(const dx of[-.36,-.12,.12,.36])box('right-coarse-door-board-fit','wood_column',.025,2.75,.025,1.1+dx,1.55,-.115,0x9b7b36);
  for(const y of[.2,1.1,2.9])box('right-coarse-door-cross-fit','wood_column',.77,.04,.035,1.1,y,-.12,0x8b6c2f);
  box('left-turned-golden-door-fit','wood_column',.1,2.85,1.1,-1.43,1.55,-.55,gold);
  for(const z of[-1.05,-.7,-.35,-.05])box('left-turned-coarse-door-board-fit','wood_column',.025,2.75,.025,-1.365,1.55,z,0x9b7b36);
  const tiles=new Map(['roof_tile','rafters','wood_column','wall_red'].map(n=>[n,kit.lib.tileSize(n)])),aspects=new Map(['dougong_band','caihua_beam'].map(n=>[n,kit.lib.aspect(n)])),old=s.lib;
  s.lib={material:n=>cache.get(n+':'),tileSize:n=>tiles.get(n),aspect:n=>aspects.get(n)};
  try{
   s.roof(f,{type:'xieshan',width:6.2,depth:2.4,baseY:3.65,height:1.25,overhang:.65,brackets:false,detail:'low'}).name=ID+'/single-yellow-small-hipped-gable-roof-fit';
   for(const sign of[-1,1]){const cap=s.adopt(buildWallCap(s.lib,{length:2,thickness:.36}));cap.name=ID+'/short-yellow-cheek-cap-fit';cap.position.set(sign*4.1,2.55,.1);f.add(cap);}
  }finally{s.lib=old;}
  // Only collapsed factory faces of these new copies are filtered; no old roof
  // is touched. Every retained visible positive-area face gets a real owner.
  f.traverse(m=>{if(!m.isMesh)return;if(!m.name.startsWith(ID+'/'))m.name=ID+'/roof-or-cap-shell-fit/'+m.name;if(!m.material.name.startsWith('r163_zhaofu_gate_'))throw Error('Shared gate material escaped isolation');const g=m.geometry,p=g.attributes.position,ix=g.index,rows=[];for(let i=0;i<(ix?.count??p.count);i+=3){const js=[0,1,2].map(j=>ix?.getX(i+j)??i+j);if(new T.Triangle(...js.map(j=>new T.Vector3().fromBufferAttribute(p,j))).getArea()>1e-12)rows.push(...js);}if(rows.length===(ix?.count??p.count))return;const q=new T.BufferGeometry();for(const[key,a]of Object.entries(g.attributes)){const v=[];for(const j of rows)for(let c=0;c<a.itemSize;c++)v.push(a.array[j*a.itemSize+c]);q.setAttribute(key,new T.BufferAttribute(new a.array.constructor(v),a.itemSize,a.normalized));}m.geometry=q;g.dispose();});
  f.updateWorldMatrix(true,true);let owner=0;
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.zhaofuGateStoneTop){const b=new T.Box3().setFromObject(m);b.zhaofuGateStoneTop=m.userData.zhaofuGateStoneTop;b.zhaofuGateMesh=m.uuid;s.colliders.push(b);const top=b.clone();top.min.y=top.max.y;s.walkables.push({type:'box',box:top,rescue:false});return;}const v=[],a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3){const q=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld)).map(p=>new T.Vector3(...p.toArray().map(Math.fround)));if(new T.Triangle(...q).getArea()>1e-12)v.push(...q.flatMap(p=>p.toArray()));}if(!v.length)throw Error('Empty gate real owner');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const q=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+owner+++'/'+m.name.slice(ID.length+1)),b=q.box.clone();b.triangleSupport=q;b.zhaofuGateMesh=m.uuid;s.colliders.push(b);}finally{g.dispose();}});
  if(!new T.Box3(new T.Vector3(210.8,-1e-6,350),new T.Vector3(221.2,9,355.4)).containsBox(new T.Box3().setFromObject(f)))throw Error('Gate escaped actual cleared reserve');
  meta={id:ID,sourceObjectId:'FC-2953884F94',originalOrdinal:36,name:'昭福门自身官图小门及真实通道拟合',front:'SOUTH_MODEL_ZERO',apertures:1,exteriorLevels:1,incenseBurnerOnGate:false,oldYuhuaRearOpened:false,wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,dimensionStatus:'ENGINEERING_FIT_NOT_SURVEYED',source:'https://www.dpm.org.cn/Uploads/File/2021/08/24/u6124c44d8868f.pdf#page=8',ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/dc/8202.jpg',ownPhotoSHA256:'445658fee7358ed460d8e9a7bc9877e740cfba18c9981807850bc6d114b79251',filePages:[7,8],printedPages:[20,21],roofEvidence:'OWN_PHOTO_HIPPED_GABLE_INTERPRETATION_NOT_INDEPENDENT_OFFICIAL_TEXT',leafState:'PARTLY_OPEN_GAMEPLAY_FIT_NOT_CURRENT_ADMISSION',sourceSupported:['official plan/text: Yuhua rear baoxia faces Zhaofu, path with two independent tall incense burners; through gate opposite Baohua','own8202 foreground: one rectangular opening/red side piers and capped side walls/golden door and frame/single yellow roof with ridge and turning slopes','black tower-like shape behind roof is separate courtyard incense burner, not gate finial or second storey'],fit:['all coordinates/dimensions/hidden rear/member profiles,6.2m gate body/3m opening and short2mcheeks only, not new full enclosing courtyard wall','single yellow hipped-gable roof is photo interpretation; .12m actual stone threshold/partial leaf count-angle-clearance are engineering/game fit','coarse colors/planks/frame/lintel/cap, no measured original ornament or inscription inventory'],excluded:['incense burner/banner reconstruction/roof finial/upper room/current real public entry','opening old Yuhua rear door or claiming indoor seamless route, moving oldwalls/Yuhua/Baohua/Fanzong/east-west buildings','extra gates/maps/teleports/global physics, remote/main/Pages'],unknown:['surveyed dimensions/complete rear/ornament/precise roof architecture and actual door-leaf opening','current admission/interior/whole object acceptance/GPU/PBR/mobile/fullstream/history']};f.userData.structure=meta;
 }catch(e){s.dispose(s.root);throw e;}
 kit.root.add(f);kit.colliders.push(...s.colliders);kit.walkables.push(...s.walkables);kit.owned.push(...s.owned);done.add(kit);return{frame:f,meta};
}
