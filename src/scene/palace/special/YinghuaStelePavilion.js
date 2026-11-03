import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const done=new WeakSet();
const ID='yinghua-stele-pavilion';
const GATE={kind:'gate',name:'英华门',x:277.2,z:454.9,gateProfile:'yinghua',gateKind:'single-arched'};
const HALL={kind:'hall',name:'英华殿',x:276.6,z:489.9,w:32.7,d:18.2,pad:1,ph:.9,colH:7.36,roof:'wudian',enter:true,structure:'ritual-hall',ritualProfile:'yinghua-five-bay-wudian-v1',bays:5};
const same=(a,b)=>a&&Object.keys(a).length===Object.keys(b).length&&Object.entries(b).every(([k,v])=>a[k]===v);
const identity=m=>m?.equals(new T.Matrix4());
const mutableArray=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validHost(kit,zone){
 const r=kit?.root;
 let existing=false;r?.traverse(o=>{if(o.userData.structure?.sourceObjectId==='FC-D385802B72')existing=true;});
 if(!same(zone.items?.[41],GATE)||!same(zone.items?.[43],HALL)||!r||r.name!=='outer-west'||r.parent||done.has(kit)||existing||!Object.isExtensible(kit)||!Object.isExtensible(r)||!mutableArray(r.children)||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!identity(r.matrix)||!identity(r.matrixWorld)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!mutableArray(kit[k])))throw Error('Exact mutable untransformed outer-west host and original Yinghua tuples required, once only');
}
// Coarse source-positive single visible eave. Ring heights/profile are FIT,
// not a measured roof classification, tile inventory or unseen decoration.
function roofGeometry(){
 const rings=[[3.85,4.55],[3.35,4.4],[2.5,4.72],[1.35,5.35],[.12,6.35]],v=[],uv=[];
 const tri=(a,b,c)=>{v.push(...a,...b,...c);uv.push(0,0,1,0,1,1);};
 const corners=(r,y)=>[[-r,y,-r],[r,y,-r],[r,y,r],[-r,y,r]];
 for(let k=0;k<rings.length-1;k++){const a=corners(...rings[k]),b=corners(...rings[k+1]);for(let i=0;i<4;i++){const j=(i+1)%4;tri(a[i],b[i],b[j]);tri(a[i],b[j],a[j]);}}
 // Visible soffit has thickness and is owned by its actual surface too.
 const a=corners(3.85,4.55),b=corners(3.85,4.43),c=[0,4.43,0];
 for(let i=0;i<4;i++){const j=(i+1)%4;tri(a[i],a[j],b[j]);tri(a[i],b[j],b[i]);tri(b[j],b[i],c);}
 const top=corners(.12,6.35);tri(top[0],top[2],top[1]);tri(top[0],top[3],top[2]);
 const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3)).setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
export function buildYinghuaStelePavilion(kit,zoneJson){
 if(zoneJson?.id!=='outer-west')return false;
 validHost(kit,zoneJson);
 const staged=new CourtKit(kit.lib,'outer-west');let frame,meta;
 try{
  const privateMaterials=new Map();
  const material=name=>{if(!privateMaterials.has(name)){const m=kit.lib.material(name).clone();m.name='r163_yinghua_stele_'+name;staged.owned.push(m);privateMaterials.set(name,m);}return privateMaterials.get(name);};
  frame=staged.frame(277.2,469,0);frame.name=ID;
  const mesh=(role,g,mat,x,y,z)=>{let privateMat;try{privateMat=material(mat);}catch(e){g.dispose();throw e;}const m=staged.mesh(frame,g,privateMat,x,y,z);m.name=ID+'/'+role;return m;};
  const box=(role,mat,w,h,d,x,y,z)=>{material(mat);const tile=kit.lib.tileSize(mat),g=applyBoxUV(new T.BoxGeometry(w,h,d),tile);return mesh(role,g,mat,x,y,z);};
  box('platform','stone_slab',6.4,.12,6.4,0,.06,0);
  box('stele-base','stone_slab',2.2,.48,.9,0,.36,0);
  const stele=box('stele','stone_slab',1.8,2.7,.35,0,1.95,0);
  const dark=material('stone_slab').clone();dark.name='r163_yinghua_stele_dark';dark.color.set(0x303131);staged.owned.push(dark);stele.material=dark;
  for(const a of [2.1,2.85])for(const x of [-a,a])for(const z of [-a,a])mesh('column',new T.CylinderGeometry(.14,.16,4.16,12),'wood_column',x,2.2,z);
  for(const z of [-2.85,2.85])box('beam','wood_column',6,.24,.22,0,4.25,z);
  for(const x of [-2.85,2.85])box('beam','wood_column',.22,.24,6,x,4.25,0);
  // Exact 2.6m clear N/S openings; no member across either portal.
  for(const z of [-3,3])for(const x of [-2.19,2.19])for(const y of [.3,.72])box('rail','wood_column',1.78,.1,.1,x,y,z);
  for(const x of [-3,3])for(const y of [.3,.72])box('rail','wood_column',.1,.1,6,x,y,0);
  for(const z of [-3,3])for(const x of [-3,-1.35,1.35,3])box('rail-post','wood_column',.1,.65,.1,x,.445,z);
  mesh('roof',roofGeometry(),'roof_tile',0,0,0);
  mesh('finial',new T.CylinderGeometry(.12,.22,.55,12),'roof_tile',0,6.625,0);
  mesh('finial-tip',new T.SphereGeometry(.17,12,8),'roof_tile',0,6.94,0);
  frame.updateWorldMatrix(true,true);
  frame.traverse(m=>{
   if(!m.isMesh)return;
   if(m.name===ID+'/platform'){const b=new T.Box3().setFromObject(m);b.yinghuaMesh=m.uuid;b.yinghuaRole='platform';staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld)).map(v=>new T.Vector3(...v.toArray().map(Math.fround)));if(new T.Triangle(...v).getArea()>=1e-12)vertices.push(...v.flatMap(v=>v.toArray()));}
   if(!vertices.length)throw Error('Empty Yinghua mesh');
   const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));
   try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],m.name+'/'+m.uuid),owner=shape.box.clone();owner.triangleSupport=shape;owner.yinghuaMesh=m.uuid;owner.yinghuaRole=m.name.slice(ID.length+1);staged.colliders.push(owner);}finally{g.dispose();}
  });
  const bounds=new T.Box3().setFromObject(frame);
  if(!new T.Box3(new T.Vector3(273.2,-1e-7,465),new T.Vector3(281.2,8,473)).containsBox(bounds))throw Error('Yinghua pavilion exceeds cleared envelope');
  meta={id:ID,sourceObjectId:'FC-D385802B72',name:'英华殿碑亭',wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,columns:8,totalColumnsStatus:'ENGINEERING_FIT_UNVERIFIED',source:'https://www.dpm.org.cn/explore/building/236568.html',ownPhotos:['8418.jpg','8419.jpg'],sourceUrls:['https://img.dpm.org.cn/Uploads/Picture/dc/8418.jpg','https://img.dpm.org.cn/Uploads/Picture/dc/8419.jpg','https://www.cactch.org.cn/webfile/upload/2021/02-04/22-02-570611-194311783.pdf'],sourceSupported:['square open pavilion, central single transverse stele/base','four inner posts plus perimeter members; red wood low rails with north/south openings','yellow single-visible-eave convergent roof and finial'],fit:['all dimensions, center (277.2,469), orientation, colors, roof profile and eight total columns are engineering fit, not survey','6.4m square slab top .12; base 2.2x.9x.48, stele 1.8x.35x2.7','inner posts ±2.1 and outer posts ±2.85; N/S rail openings 2.6m; roof 7.7m square'],unknown:['measured dimensions/location','exact total columns','roof classification/back/ceiling/details','inscriptions/carvings and present conservation details'],excluded:['fabricated text/carvings','second stele','hall roof specifications','new maps/rooms','air barriers or ramps','whole-object acceptance']};
  frame.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(frame);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);
 return {frame,meta};
}
