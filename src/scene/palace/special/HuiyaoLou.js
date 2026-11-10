import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='huiyao-seven-bay-lou',done=new WeakSet();
export const HUIYAO_FIT=Object.freeze({x:190.5,z:523.6,width:18,depth:4.4,platform:.3,upperFloor:4.6,roofBase:8.2,northWallZ:529});
const BOUNDS={x0:178.05,x1:382,z0:-355.24,z1:529.9};
const COURT={kind:'courtWalls',x0:178.6,x1:245,z0:409.4,z1:520,gates:[{side:'s',at:183.7,gate:'建福门'}]};
const HALL={kind:'hall',name:'延春阁',x:216,z:485.5,w:23.5,d:24.3,pad:.8,ph:.75,colH:10.24,roof:'pavilion',layers:2};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function geometry(g){return{index:g.index?Array.from(g.index.array):null,groups:g.groups,attributes:Object.fromEntries(Object.keys(g.attributes).sort().map(n=>[n,{size:g.attributes[n].itemSize,normalized:g.attributes[n].normalized,array:Array.from(g.attributes[n].array)}]))};}
function tree(o){return{position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),visible:o.visible,geometry:o.geometry?geometry(o.geometry):null,material:o.material?{name:o.material.name,color:o.material.color?.getHex(),map:o.material.map?.uuid??null,side:o.material.side,transparent:o.material.transparent,opacity:o.material.opacity}:null,children:o.children.map(tree)};}
function validate(kit,zone){
 const root=kit?.root;let duplicate=false;root?.traverse(o=>{if(o.userData.structure?.sourceObjectId==='FC-9CB03D7316')duplicate=true;});
 if(!root||root.name!=='outer-west'||root.parent||root.position.lengthSq()||!root.quaternion.equals(new T.Quaternion())||!root.scale.equals(new T.Vector3(1,1,1))||!root.matrix.equals(new T.Matrix4())||!root.matrixWorld.equals(new T.Matrix4())||!mutable(root.children)||!Object.isExtensible(kit)||['colliders','walkables','rooms','mapItems','regions','owned'].some(k=>!mutable(kit[k]))||!same(zone.bounds,BOUNDS)||!same(zone.items?.[38],COURT)||!same(zone.items?.[39],HALL)||done.has(kit)||duplicate)throw Error('Exact mutable H17 host and north-only bounds required once');
 const matches=root.children.filter(o=>same(o.position.toArray(),[(178.6+245)/2,0,520])&&Math.abs(o.rotation.y)<1e-12);
 if(matches.length!==1)throw Error('Exact original north garden wall required');
 const old=matches[0],ref=new CourtKit(kit.lib,'outer-west');ref.ridge=kit.ridge;ref.gold=kit.gold;
 try{
  ref.wall(178.6,520,245,520);if(!same(tree(old),tree(ref.root.children[0])))throw Error('Original north wall geometry/material/transform changed');
  const b=ref.colliders[0],cs=kit.colliders.filter(c=>c.isBox3&&!c.triangleSupport&&same(c.min.toArray(),b.min.toArray())&&same(c.max.toArray(),b.max.toArray()));if(cs.length!==1)throw Error('Original north wall collider changed');
  const geometries=new Set();old.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});let shared=false;
  root.traverse(o=>{if(o.geometry&&geometries.has(o.geometry)){let p=o;while(p&&p!==old)p=p.parent;if(p!==old)shared=true;}});
  if(shared)throw Error('Original north wall geometry shared outside owner');return{old,collider:cs[0],geometries};
 }finally{ref.dispose(ref.root);}
}
function registerTriangles(kit,m){
 const p=m.geometry.attributes.position,ix=m.geometry.index,origin=new T.Vector3().setFromMatrixPosition(m.matrixWorld),matrix=m.matrixWorld.clone();matrix.setPosition(0,0,0);const vertices=[];
 for(let k=0;k<(ix?.count??p.count);k+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(matrix));if(new T.Triangle(...v).getArea()>1e-12)vertices.push(...v.flatMap(q=>q.toArray()));}
 if(!vertices.length)throw Error('Empty Huiyao visible owner');
 const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));
 try{const shape=triangleInstance(createTriangleTemplate(g),origin.toArray(),m.name+'/'+m.uuid),c=shape.box.clone();c.triangleSupport=shape;c.huiyaoMesh=m.uuid;c.huiyaoRole=m.name;kit.colliders.push(c);}finally{g.dispose();}
}
/** Named plan and official text support the separate seven-bay, two-storey
 * form. The northward stagger, all dimensions and closed visiting pose are
 * reversible fits. No invented upper access or unverified historic colour. */
export function buildHuiyaoLou(kit,zone){
 if(zone?.id!=='outer-west')return false;
 const prior=validate(kit,zone),s=new CourtKit(kit.lib,'outer-west'),p=HUIYAO_FIT,allocated=new Set();let frame,meta;
 try{
  const mats=new Map(),material=n=>{if(!mats.has(n)){const m=kit.lib.material(n).clone();m.name='r176_huiyao_'+n;if(n==='roof_tile'){m.color.setHex(0x777872);m.map=null;m.normalMap=null;}mats.set(n,m);s.owned.push(m);}return mats.get(n);};
  frame=s.frame(p.x,p.z);frame.name=ID;
  const box=(role,n,w,h,d,x,y,z,stone=false)=>{let g=new T.BoxGeometry(w,h,d);allocated.add(g);const mat=material(n),next=applyBoxUV(g,kit.lib.tileSize(n));if(next!==g){allocated.delete(g);g=next;allocated.add(g);}const m=s.mesh(frame,g,mat,x,y,z);m.name=ID+'/'+role;if(stone)m.userData.huiyaoStone=true;return m;};
  box('real-veranda-platform-fit','stone_slab',20,.3,6.4,0,.15,0,true);
  box('real-lower-step-fit','stone_slab',3,.1,.45,0,.05,-3.875,true);
  box('real-upper-step-fit','stone_slab',3,.2,.45,0,.1,-3.425,true);
  box('real-upper-floor-fit','wood_column',20,.18,6.4,0,4.51,0);
  for(const [level,floor,height]of[['lower',.3,4.12],['upper',4.6,3.6]]){
   box(level+'-closed-back-fit','wall_red',18,height,.24,0,floor+height/2,2.08);
   for(const x of[-8.88,8.88])box(level+'-closed-side-fit','wall_red',.24,height,4.16,x,floor+height/2,0);
   for(let i=0;i<7;i++){
    const x=-9+(i+.5)*18/7;
    box('closed-front-bay-fit','wood_column',18/7-.08,height-.15,.18,x,floor+(height-.15)/2,-2.08);
    for(const y of[floor+height*.3,floor+height*.65])box(level+'-plain-cross-rail-fit','wood_column',18/7-.08,.045,.055,x,y,-2.2);
   }
   for(const z of[-2.9,2.9])for(let i=0;i<=7;i++)box(level+'-veranda-post-fit','wood_column',.2,height,.2,-9.4+i*18.8/7,floor+height/2,z);
   for(const x of[-9.4,9.4])box(level+'-side-veranda-post-fit','wood_column',.2,height,.2,x,floor+height/2,0);
   for(const z of[-2.9,2.9])box(level+'-veranda-beam-fit','caihua_beam',19.1,.22,.24,0,floor+height-.11,z);
  }
  // Only the upper gallery has a schematic closed rail. No staircase or
  // accessible upper destination is inferred from conflicting stair evidence.
  for(const z of[-2.95,2.95]){
   box('upper-gallery-top-rail-fit','wood_column',19.1,.1,.12,0,5.48,z);
   for(let i=0;i<=28;i++)box('upper-gallery-plain-baluster-fit','wood_column',.05,.8,.07,-9.4+i*18.8/28,5,z);
  }
  for(const x of[-9.45,9.45])box('upper-side-top-rail-fit','wood_column',.12,.1,5.9,x,5.48,0);
  for(const n of['roof_tile','rafters','dougong_band','caihua_beam','wood_column','wall_red'])material(n);
  const tiles=new Map(['roof_tile','rafters','wood_column','wall_red'].map(n=>[n,kit.lib.tileSize(n)])),aspects=new Map(['dougong_band','caihua_beam'].map(n=>[n,kit.lib.aspect(n)])),lib=s.lib;
  s.lib={material:n=>mats.get(n),tileSize:n=>tiles.get(n),aspect:n=>aspects.get(n)};
  try{const roof=s.roof(frame,{type:'xieshan',width:20,depth:6.4,baseY:p.roofBase,height:1.65,overhang:.45,brackets:false});roof.name=ID+'/neutral-xieshan-roof-fit';}finally{s.lib=lib;}
  const wallStart=s.root.children.length,colliderStart=s.colliders.length;
  s.wall(178.6,p.northWallZ,245,p.northWallZ);s.wall(178.6,520,178.6,p.northWallZ);s.wall(245,520,245,p.northWallZ);s.colliders.length=colliderStart;
  for(const[i,f]of s.root.children.slice(wallStart).entries()){f.name=ID+'/court-wall-fit-'+i;f.userData.huiyaoCourtFit=true;let j=0;f.traverse(m=>{if(m.isMesh)m.name=f.name+'/'+j++;});}
  s.root.updateWorldMatrix(true,true);
  frame.traverse(m=>{if(!m.isMesh)return;if(m.userData.huiyaoStone){const b=new T.Box3().setFromObject(m);b.huiyaoMesh=m.uuid;b.huiyaoRole=m.name;s.colliders.push(b);const top=b.clone();top.min.y=top.max.y;s.walkables.push({type:'box',box:top,rescue:false,huiyaoStone:m.uuid});}else registerTriangles(s,m);});
  for(const f of s.root.children.slice(wallStart))f.traverse(m=>{if(m.isMesh)registerTriangles(s,m);});
  if(!new T.Box3(new T.Vector3(179.4,-1e-6,519.4),new T.Vector3(201.6,11.6,528.3)).containsBox(new T.Box3().setFromObject(frame)))throw Error('Huiyao escaped north fitted reserve');
  for(const f of s.root.children.slice(wallStart))if(new T.Box3().setFromObject(f).max.z>zone.bounds.z1)throw Error('New north wall escaped exact outer-west extent');
  meta={id:ID,sourceObjectId:'FC-9CB03D7316',name:'慧曜楼',bays:7,depthBays:1,exteriorStoreys:2,surroundingVeranda:true,roof:'XIESHAN',roofHistoricalColor:'UNKNOWN',stairLocation:'UNKNOWN_CONFLICTING_SOURCES',upperAccess:'NO_STAIR_NO_UPPER_DESTINATION',surveyed:false,wholeObjectAccepted:false,restorationOfPreviouslyCountedItem:true,newRooms:0,newMapItems:0,source:'https://www.dpm.org.cn/explore/building/236524.html',planSource:'https://img.dpm.org.cn/Uploads/Picture/dc/2648%5B1024%5D.jpg',formSource:'https://www.dpm.org.cn/Uploads/File/pdf/43/d5/88/43d5888da6fcdc4c18a5847aae0d4c65.pdf',formPage:165,sourceSupported:['separate seven-bay one-bay-deep two-storey tower north of Jingyi and east of Jiyun','surrounding veranda and xieshan roof','written west bridge and east ear-room relations only, not complete geometry'],fit:['all dimensions and hidden faces, equal bays and plain divisions','northern compressed stagger at190.5/523.6; old named neighbors stay in place','only north wall520 to529 with side closures and zone z1 extension529.9','neutral unverified roof finish; closed exterior, real .3m lower platform and .1/.2m steps'],unknown:['historic tile colour and exact current facade details','conflicting staircase location and upper route','complete bridge/ear-room connections, religious interior and present visitor admission','full surrounding-veranda circulation, natural streaming resource acceptance and GPU'],excluded:['borrowed Jiyun facade or tile colour','invented stairs, religious imagery, new map target or teleport','global x0 extension or moving old named structures']};frame.userData.structure=meta;
 }catch(e){const attached=new Set();s.root.traverse(o=>{if(o.geometry)attached.add(o.geometry);});s.dispose(s.root);for(const g of allocated)if(!attached.has(g))g.dispose();throw e;}
 const stagedChildren=[...s.root.children],oldChildren=[...kit.root.children],oldStreams=Object.fromEntries(['colliders','walkables','owned'].map(k=>[k,[...kit[k]]]));
 try{kit.root.remove(prior.old);kit.colliders.splice(kit.colliders.indexOf(prior.collider),1);kit.root.add(...[...s.root.children]);for(const k of['colliders','walkables','owned'])kit[k].push(...s[k]);}
 catch(e){
  // Unrelated source frames must stay mounted: their removed events revoke ownership.
  for(const child of stagedChildren)if(child.parent===kit.root)kit.root.remove(child);
  if(prior.old.parent!==kit.root)kit.root.add(prior.old);
  const wallIndex=kit.root.children.indexOf(prior.old);
  kit.root.children.splice(wallIndex,1);
  kit.root.children.splice(oldChildren.indexOf(prior.old),0,prior.old);
  for(const[k,a]of Object.entries(oldStreams))kit[k].splice(0,kit[k].length,...a);
  s.root.add(...stagedChildren);s.dispose(s.root);throw e;
 }
 for(const g of prior.geometries)g.dispose();done.add(kit);return{frame,meta,replacedWall:prior.old,replacedCollider:prior.collider};
}
