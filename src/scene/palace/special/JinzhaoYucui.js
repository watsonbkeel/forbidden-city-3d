import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='jinzhao-yucui',done=new WeakSet();
const GATE={kind:'gate',name:'重华门',x:120.2,z:460};
const HALL={kind:'hall',name:'重华宫',x:118.9,z:498.3,w:21.5,d:8.6,pad:1,ph:.75,colH:5.49,roof:'xieshan',enter:true,throne:true};
const COURT={kind:'courtWalls',x0:92.62,x1:145.18,z0:460,z1:505.6,gates:[{side:'s',at:120.2,gate:'重华门'}],source:'estimated'};
export const JINZHAO_REAR_FIT=Object.freeze({x:82,z:515.6,width:14,depth:4.8,bayGrid:Object.freeze([5,1]),platformY:.3,bounds:Object.freeze([73,0,510.49,91,10,520])});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validateHost(kit,zone){const r=kit?.root,find=(kind,name)=>zone.items?.filter(i=>i.kind===kind&&i.name===name)??[];let existing=false;r?.traverse(m=>{if(m.userData.structure?.sourceObjectId==='FC-DCA93F15C3')existing=true;});if(find('gate','重华门').length!==1||!same(find('gate','重华门')[0],GATE)||find('hall','重华宫').length!==1||!same(find('hall','重华宫')[0],HALL)||zone.items?.filter(i=>same(i,COURT)).length!==1||!r||r.name!=='west-six'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(r)||!mutable(r.children)||!Object.isExtensible(kit)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!mutable(kit[k]))||done.has(kit)||existing)throw Error('Exact untransformed mutable Jinzhao rear host required, once only');}
/** Neutral engineering cover only: sealed plain low prism, no assertion of
 * historical tile color, roof classification, ridge ornaments or carvings. */
function provisionalCover(w,d,eave,rise){const v=[],uv=[],tri=(a,b,c)=>{v.push(...a,...b,...c);for(const p of[a,b,c])uv.push(p[0]/2,p[2]/2);},quad=(a,b,c,e)=>{tri(a,b,c);tri(a,c,e);},profile=[[-d/2,eave],[0,eave+rise],[d/2,eave]],L=profile.map(([z,y])=>[-w/2,y,z]),R=profile.map(([z,y])=>[w/2,y,z]);tri(L[0],L[2],L[1]);tri(R[0],R[1],R[2]);for(let i=0;i<3;i++){const j=(i+1)%3;quad(L[i],L[j],R[j],R[i]);}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3)).setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}
export function buildJinzhaoYucui(kit,zone){
 if(zone?.id!=='west-six')return false;validateHost(kit,zone);
 const s=new CourtKit(kit.lib,'west-six'),cache=new Map();let f,meta;
 const material=(name,color)=>{const key=name+':'+(color??'');if(!cache.has(key)){const m=kit.lib.material(name).clone();m.name='r163_jinzhao_rear_'+key.replace(':','_');if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}cache.set(key,m);s.owned.push(m);}return cache.get(key);};
 try{
  f=s.frame(82,515.6);f.name=ID;
  const mesh=(role,g,m,x=0,y=0,z=0)=>{const q=s.mesh(f,g,m,x,y,z);q.name=ID+'/'+role;return q;};
  const box=(role,name,w,h,d,x,y,z,color,stone=false)=>{const q=mesh(role,applyBoxUV(new T.BoxGeometry(w,h,d),kit.lib.tileSize(name)),material(name,color),x,y,z);if(stone)q.userData.jinzhaoStoneTop=role;return q;};
  box('real-low-stone-platform-fit','stone_slab',14.8,.3,6.4,0,.15,-.4,undefined,true);
  box('real-south-stone-step-fit','stone_slab',2.8,.1,.8,0,.05,-4.7,undefined,true);
  box('real-south-stone-step-fit','stone_slab',2.8,.2,.9,0,.1,-3.85,undefined,true);
  const green=0x3d6555,red=0x965044,wood=0x685047,glass=0x536568;
  box('closed-unseen-rear-fit','wall_red',14,4.8,.26,0,2.7,2.27,red);
  for(const x of[-6.87,6.87])box('closed-unseen-side-fit','wall_red',.26,4.8,4.54,x,2.7,0,red);
  box('plain-closed-ceiling-fit','wood_column',14,.16,4.8,0,5.02,0,green);
  box('plain-front-header-fit','wood_column',14,1.15,.26,0,4.525,-2.27,green);
  for(const x of[-7,-4.2,-1.4,1.4,4.2,7])box('engaged-front-bay-post-fit','wood_column',.18,3.65,.3,x,2.125,-2.42,green);
  // Central relation is documented, not made into a pretend through corridor.
  // Keep this visible fitted leaf closed and retain the old front rear wall.
  box('closed-center-joint-fit','wood_column',2.6,3.65,.18,0,2.125,-2.35,wood);
  for(const x of[-1.27,0,1.27])box('plain-center-leaf-frame-fit','wood_column',.075,3.65,.08,x,2.125,-2.49,green);
  for(const y of[.36,1.43,3.9])box('plain-center-leaf-cross-fit','wood_column',2.6,.07,.08,0,y,-2.49,green);
  for(const c of[-5.6,-2.8,2.8,5.6]){
   box('window-brick-sill-fit','wall_brick',2.62,.85,.26,c,.725,-2.27);
   box('side-sill-window-group-fit','wood_column',2.6,2.8,.16,c,2.55,-2.35,wood);
   for(let j=0;j<3;j++){const x=c+(j-1)*.84;box('closed-window-pane-fit','wood_column',.75,2.65,.035,x,2.55,-2.455,glass);for(const dx of[-.38,0,.38])box('coarse-window-mullion-fit','wood_column',.035,2.7,.045,x+dx,2.55,-2.49,green);for(const y of[1.2,2.1,3,3.9])box('coarse-window-mullion-fit','wood_column',.78,.04,.045,x,y,-2.49,green);}
   for(const y of[1.16,3.95])box('plain-window-group-frame-fit','wood_column',2.65,.075,.08,c,y,-2.5,green);
  }
  mesh('provisional-neutral-cover-not-historic-roof',provisionalCover(15.4,5.8,5,1),material('roof_tile',0x696d6b));
  f.updateWorldMatrix(true,true);let n=0;
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.jinzhaoStoneTop){const b=new T.Box3().setFromObject(m);b.jinzhaoStoneTop=m.userData.jinzhaoStoneTop;b.jinzhaoMesh=m.uuid;s.colliders.push(b);const top=b.clone();top.min.y=top.max.y;s.walkables.push({type:'box',box:top,rescue:false});return;}
   const v=[],a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3){const q=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld)).map(p=>new T.Vector3(...p.toArray().map(Math.fround)));if(new T.Triangle(...q).getArea()>1e-12)v.push(...q.flatMap(p=>p.toArray()));}if(!v.length)throw Error('Empty Jinzhao host owner');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+n+++'/'+m.name.slice(ID.length+1)),b=shape.box.clone();b.triangleSupport=shape;b.jinzhaoMesh=m.uuid;s.colliders.push(b);}finally{g.dispose();}
  });
  if(!new T.Box3(new T.Vector3(73,-1e-6,510.49),new T.Vector3(91,10,520)).containsBox(new T.Box3().setFromObject(f)))throw Error('Jinzhao rear escaped independently clear reserve');
  meta={id:ID,sourceObjectId:'FC-DCA93F15C3',name:'金昭玉粹后殿暂拟宿主',bayGrid:[5,1],front:'SOUTH_MODEL_ZERO',dimensionStatus:'ENGINEERING_FIT_NOT_SURVEYED',roofEvidence:'UNVERIFIED_PROVISIONAL_NEUTRAL_COVER',wholeObjectAccepted:false,currentAdmissionVerified:false,fengyacunInteriorComplete:false,gaoyunqingInteriorComplete:false,connectorBuilt:false,frontRearThroughRoute:false,newRooms:0,newMapItems:0,admission:'CLOSED_HOST_EXTERIOR_LANDING_ONLY',zoneOwnership:'west-six original bounds retained at z512.1; geometry extends north and uses existing near-distance preload; no outside-boundary teleport guarantee',source:'https://www.dpm.org.cn/explore/building/236449.html',primaryPaper:'https://img.dpm.org.cn/Uploads/File/2020/02/26/u5e5617192671d.pdf',paperPage:'PDF8_PRINT282_FIG12',primaryPaperSHA256:'906e356bb238c8cd583e257dc057401bcbd4e40fe04968b611fcfdc3d51b095f',extraTopology:'https://www.dpm.org.cn/Uploads/File/pdf/35/e2/4b/35e24bcd5e340e030b2831a275275570.pdf',sourceSupported:['official architectural paragraph: rear hall five bays across and one bay deep; center joins front via passage; other front bays sill windows','official paper figure12 and present-interior-space diagram support north rear host and south center connector relation, not a measured exterior elevation','Fengyacun and Gaoyunqing are interior spaces, distinct from the exterior courtyard stage'],fit:['all dimensions/coordinates, closed central leaf pose, color and coarse framed-window divisions','14x4.8m shallow body, low actual .3m platform/two stone treads and south viewing landing','plain neutral grey shallow cover is provisional engineering closure only, NOT researched historical roof color/type, nor copied front xieshan/stage convergent roof','hidden side/rear/ceiling and unverified exterior construction'],excluded:['Fengyacun indoor theatre, Gaoyunqing room, furniture/paintings, historical phase restoration and interior completion','built connector, open passage or removal of retained front rear wall; historical I-shaped ensemble not complete','plaque lettering/names on external wall, ceremonial gold door, stage cover or guessed roof ornament','zone JSON/global streaming/physics changes, new map teleport, old walls/paths, upload/main/Pages'],unknown:['complete real exterior/roof image and exact roof form/color/profile, measured dimensions/location','current public access, actual connector and exterior leaf pose','outside-boundary direct teleport guarantee, GPU/browser/mobile/full streaming and whole-item acceptance']};f.userData.structure=meta;
 }catch(e){s.dispose(s.root);throw e;}
 kit.root.add(f);kit.colliders.push(...s.colliders);kit.walkables.push(...s.walkables);kit.owned.push(...s.owned);done.add(kit);return{frame:f,meta};
}
