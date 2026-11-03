import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='yuhua-east-lou',done=new WeakSet();
const GATE={kind:'gate',name:'建福门',x:183.7,z:409.4};
const HALL={kind:'hall',name:'延春阁',x:216,z:485.5,w:23.5,d:24.3,pad:.8,ph:.75,colH:10.24,roof:'pavilion',layers:2};
const COURT={kind:'courtWalls',x0:178.6,x1:245,z0:409.4,z1:520,gates:[{side:'s',at:183.7,gate:'建福门'}]};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validateHost(k,z){const r=k?.root;let exists=false;r?.traverse(m=>{if(m.userData.structure?.sourceObjectId==='FC-F95F60645E')exists=true;});if(!r||r.name!=='outer-west'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(k)||!mutable(r.children)||['colliders','walkables','owned','rooms','mapItems','regions'].some(q=>!mutable(k[q]))||z.items?.filter(i=>same(i,GATE)).length!==1||z.items?.filter(i=>same(i,HALL)).length!==1||z.items?.filter(i=>same(i,COURT)).length!==1||exists||done.has(k))throw Error('Exact mutable untransformed Yuhua east host required, once only');}
/** Named east photograph only: the separate west photograph is not mirrored.
 * Hidden roof/profile, dimensions and repeat counts remain explicit fit. */
export function buildYuhuaEastLou(kit,zone){
 if(zone?.id!=='outer-west')return false;validateHost(kit,zone);
 const s=new CourtKit(kit.lib,'outer-west'),cache=new Map();s.ridge.name='r163_yuhua_east_private_ridge';s.gold.name='r163_yuhua_east_private_gold';let f,meta;
 const material=(name,color)=>{const key=name+':'+(color??'');if(!cache.has(key)){const m=kit.lib.material(name).clone();m.name='r163_yuhua_east_'+key.replace(':','_');if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}cache.set(key,m);s.owned.push(m);}return cache.get(key);};
 try{
  for(const n of['stone_slab','wall_red','wood_column','caihua_beam','roof_tile','rafters','dougong_band'])material(n);
  f=s.frame(190.3,322.5,-Math.PI/2);f.name=ID;
  const mesh=(role,g,m,x=0,y=0,z=0)=>{const q=s.mesh(f,g,m,x,y,z);q.name=ID+'/'+role;return q;};
  const box=(role,name,w,h,d,x,y,z,color,stone=false)=>{const tile=kit.lib.tileSize(name),mat=material(name,color),q=mesh(role,applyBoxUV(new T.BoxGeometry(w,h,d),tile),mat,x,y,z);if(stone)q.userData.yuhuaEastStoneTop=role;return q;};
  const red=0x8b3e32,wood=0x743b2c,gold=0xb49148,green=0x386755,pane=0x343e37;
  box('real-low-stone-platform-fit','stone_slab',15.4,.45,6.9,0,.225,-.65,undefined,true);
  for(let i=1;i<=2;i++)box('real-central-stone-step-fit','stone_slab',3.6,.15*i,.65,0,.075*i,-5.4+.65*(i-.5),undefined,true);
  // The ground facade and upper window wall are closed, with no invented room.
  for(const[tier,y0,y1,front]of[['lower',.45,3.65,-2.7],['upper',3.95,7.45,-2.3]]){
   box(tier+'-closed-front-fit','wall_red',14.4,y1-y0,.24,0,(y0+y1)/2,front,red);
   box(tier+'-closed-rear-fit','wall_red',14.4,y1-y0,.28,0,(y0+y1)/2,2.56,red);
   box(tier+'-closed-ceiling-fit','wood_column',14.4,.12,5.4,0,y1-.06,0,wood);
  }
  for(const x of[-7.02,7.02])box('real-red-end-wall-fit','wall_red',.36,7.2,6.2,x,4.05,-.4,red);
  box('real-midlevel-floor-fit','wood_column',14.4,.3,6.2,0,3.8,-.4,wood);
  for(const z of[-3.05,2.45])box('real-floor-bearing-beam-fit','wood_column',14.4,.28,.36,0,3.51,z,wood);
  for(const x of[-6.85,-2.3,2.3,6.85]){
   mesh('lower-front-column-fit',new T.CylinderGeometry(.14,.17,2.98,12),material('wood_column',red),x,1.94,-3.05);
   box('lower-rear-floor-bearing-post-fit','wood_column',.28,2.98,.28,x,1.94,2.45,red);
   mesh('upper-front-gallery-column-fit',new T.CylinderGeometry(.115,.14,3.5,12),material('wood_column',red),x,5.7,-3.05);
  }
  for(const[y,z]of[[3.51,-3.05],[7.33,-3.05]])box('painted-front-header-fit','caihua_beam',14.3,.26,.32,0,y,z);
  box('painted-flat-midlevel-fascia-fit','caihua_beam',14.4,.35,.18,0,3.8,-3.42);
  for(let i=0;i<4;i++){const x=-1.7+(i+.5)*.85;box('lower-closed-door-leaf-fit','wood_column',.82,2.9,.12,x,1.9,-2.87,wood);box('lower-door-upper-dark-field-fit','wood_column',.68,1.75,.035,x,2.35,-2.95,pane);box('lower-door-lower-panel-fit','wood_column',.68,.78,.035,x,.97,-2.95,red);for(const dx of[-.36,0,.36])box('lower-door-coarse-grid-fit','wood_column',.035,2.85,.04,x+dx,1.9,-2.99,gold);for(const y of[.49,1.4,2.35,3.32])box('lower-door-coarse-cross-fit','wood_column',.8,.04,.04,x,y,-2.99,gold);}
  for(const x of[-4.65,4.65]){box('lower-gray-window-sill-fit','stone_slab',4.1,.65,.3,x,.775,-2.81);for(let j=0;j<4;j++){const X=x+(j-1.5)*.97;box('lower-sill-window-field-fit','wood_column',.9,2.25,.08,X,2.275,-2.89,pane);for(const dx of[-.47,0,.47])box('lower-window-coarse-grid-fit','wood_column',.035,2.25,.035,X+dx,2.275,-2.95,gold);for(const y of[1.15,2.25,3.4])box('lower-window-coarse-cross-fit','wood_column',.94,.04,.035,X,y,-2.95,gold);}}
  for(const x of[-4.65,0,4.65]){box('upper-closed-window-field-fit','wood_column',3.85,2.85,.1,x,5.65,-2.47,pane);for(let j=0;j<=4;j++)box('upper-window-coarse-gold-grid-fit','wood_column',.045,2.85,.04,x-1.925+j*.9625,5.65,-2.54,gold);for(const y of[4.23,5.65,7.07])box('upper-window-coarse-gold-cross-fit','wood_column',3.9,.045,.04,x,y,-2.54,gold);}
  box('upper-gallery-low-green-panel-fit','wood_column',13.7,.32,.12,0,4.12,-3.35,green);
  for(const y of[3.98,4.94])box('upper-gallery-red-rail-fit','wood_column',13.8,.1,.14,0,y,-3.35,red);
  for(let i=0;i<=18;i++)box('upper-gallery-pale-grid-fit','wood_column',.055,.8,.12,-6.85+i*13.7/18,4.5,-3.35,0xb5b39a);
  box('upper-gallery-middle-green-rail-fit','wood_column',13.8,.07,.13,0,4.55,-3.35,green);
  // This is one roof above the upper floor; the painted midlevel is NOT tile.
  const tiles=new Map(['roof_tile','rafters','wood_column','wall_red'].map(n=>[n,kit.lib.tileSize(n)])),aspects=new Map(['dougong_band','caihua_beam'].map(n=>[n,kit.lib.aspect(n)])),old=s.lib;let roof;
  s.lib={material:n=>cache.get(n+':'),tileSize:n=>tiles.get(n),aspect:n=>aspects.get(n)};
  try{roof=s.roof(f,{type:'gable',hardGableEnd:true,width:14.4,depth:5.4,baseY:7.65,height:1.6,overhang:.65,brackets:false,detail:'low'});}finally{s.lib=old;}
  roof.name=ID+'/conservative-yellow-double-pitch-roof-fit';for(const m of roof.userData.ownedMaterials??[])m.name='r163_yuhua_east_private_roof_'+m.type;f.updateWorldMatrix(true,true);const surfaces=[],thin=[];
  roof.traverse(m=>{if(!m.isMesh)return;if(m.material===material('roof_tile'))surfaces.push(m);if(m.material===material('wall_red'))thin.push(m);});if(surfaces.length!==1||thin.length!==1)throw Error('Exact new gable factory expected');
  const topY=z=>{const o=f.localToWorld(new T.Vector3(0,20,z)),h=new T.Raycaster(o,new T.Vector3(0,-1,0)).intersectObject(surfaces[0],false)[0];if(!h)throw Error('Missing new east roof profile');return h.point.y;};
  for(const m of thin){m.removeFromParent();m.geometry.dispose();}
  const points=Array.from({length:33},(_,i)=>{const z=-2.7+5.4*i/32;return[-z,Math.max(7.65,topY(z)-.15)];}).sort((a,b)=>a[0]-b[0]);
  for(const sign of[-1,1]){const g=mesh('real-thick-profiled-upper-end-fit',new T.ExtrudeGeometry(new T.Shape(points.map(p=>new T.Vector2(...p))),{depth:.36,bevelEnabled:false}),material('wall_red',red),sign>0?6.84:-7.2,0,0);g.rotation.y=Math.PI/2;}
  for(const x of[-6.85,-2.3,2.3,6.85]){const h=topY(-3.05)-.15-7.45;box('real-upper-roof-bearing-fit','wood_column',.3,h,.3,x,7.45+h/2,-3.05,wood);}
  // Filter only the new factory's collapsed end triangles, never retained roofs.
  f.traverse(m=>{if(!m.isMesh)return;if(!m.name.startsWith(ID+'/'))m.name=ID+'/roof-shell-fit/'+m.name;if(!m.material.name.startsWith('r163_yuhua_east_'))throw Error('Shared material escaped isolation');const g=m.geometry,p=g.attributes.position,ix=g.index,rows=[];for(let i=0;i<(ix?.count??p.count);i+=3){const js=[0,1,2].map(j=>ix?.getX(i+j)??i+j);if(new T.Triangle(...js.map(j=>new T.Vector3().fromBufferAttribute(p,j))).getArea()>1e-12)rows.push(...js);}if(rows.length===(ix?.count??p.count))return;const q=new T.BufferGeometry();for(const[key,a]of Object.entries(g.attributes)){const v=[];for(const j of rows)for(let c=0;c<a.itemSize;c++)v.push(a.array[j*a.itemSize+c]);q.setAttribute(key,new T.BufferAttribute(new a.array.constructor(v),a.itemSize,a.normalized));}m.geometry=q;g.dispose();});
  f.updateWorldMatrix(true,true);let owner=0;
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.yuhuaEastStoneTop){const b=new T.Box3().setFromObject(m);b.yuhuaEastStoneTop=m.userData.yuhuaEastStoneTop;b.yuhuaEastMesh=m.uuid;s.colliders.push(b);const top=b.clone();top.min.y=top.max.y;s.walkables.push({type:'box',box:top,rescue:false});return;}const v=[],a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3){const q=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld)).map(p=>new T.Vector3(...p.toArray().map(Math.fround)));if(new T.Triangle(...q).getArea()>1e-12)v.push(...q.flatMap(p=>p.toArray()));}if(!v.length)throw Error('Empty east real owner');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const q=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+owner+++'/'+m.name.slice(ID.length+1)),b=q.box.clone();b.triangleSupport=q;b.yuhuaEastMesh=m.uuid;s.colliders.push(b);}finally{g.dispose();}});
  if(!new T.Box3(new T.Vector3(185.2,-1e-6,312),new T.Vector3(196,13,333)).containsBox(new T.Box3().setFromObject(f)))throw Error('East building escaped clear reserve');
  meta={id:ID,sourceObjectId:'FC-F95F60645E',originalOrdinal:34,name:'雨花阁东配楼具名照片外观拟合',front:'WEST_MODEL_POSITIVE_X',bays:3,exteriorLevels:2,interiorComplete:false,wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,newUpperRoutes:0,dimensionStatus:'ENGINEERING_FIT_NOT_SURVEYED',admission:'CLOSED_INTERIOR_OUTSIDE_LOW_LEDGE_ONLY',source:'https://www.dpm.org.cn/Uploads/File/2021/08/24/u6124c44d8868f.pdf#page=23',pdfSHA256:'478fba0f0b61ae285de829266047491b908bbda6cb107fa6165a88d60b84b9b4',printedPage:36,sourcePhoto:'RIGHT_HAND_EAST_BUILDING_NOT_LEFT_WEST_BUILDING',sourceSupported:['own east named photo: two-storey three-bay facade/red walls and posts, lower central partition door and flanking sill windows','upper front gallery railing/flat painted midlevel and low stone base/central steps; tree blocks upper-left roof','article identifies east as Third Changkya portrait hall; lower interior photo belongs east but is not implemented'],fit:['all metric coordinates/dimensions/heights/hidden rear/end/floor bearing closure;14.4m facade/5.4mclosed depth/.45mplatform/two .15mstairs','roof type, full color/tile scheme and hidden silhouette are conservative yellow double-pitch/hard-gable engineering fit, NOT official verified roof identity','door/window/rail division and leaf counts, lattice/paint/color/stone step geometry are coarse own-photo fits, not surveyed inventory'],excluded:['mirroring west facade or transferring west interior, second midlevel tile roof, unknown upper stairs/indoor ritual objects/lettered plaques','moving old walls/Yuhua/Fanzong or global physics, room/maps/upper admission, remote/main/Pages'],unknown:['precise roof type/tile palette and hidden sides behind tree, measured dimensions and original counts','inside/current real admission/whole object acceptance/GPU/PBR/mobile/fullstream/history']};f.userData.structure=meta;
 }catch(e){s.dispose(s.root);throw e;}
 kit.root.add(f);kit.colliders.push(...s.colliders);kit.walkables.push(...s.walkables);kit.owned.push(...s.owned);done.add(kit);return{frame:f,meta};
}
