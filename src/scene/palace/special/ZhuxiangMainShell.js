import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='zhuxiang-main-shell',OBJECT='FC-2465BC98A2',done=new WeakSet();
export const ZHUXIANG_FIT=Object.freeze({x:-239.8,z:501,rotationY:Math.PI/2,mainWidth:6.6,mainDepth:4.2,earWidth:1.5,floorY:.3,upperFloorY:2.65,eaveY:5.65,roofRise:1.7,front:'EAST_MODEL_NEGATIVE_X'});
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const identity=o=>o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1))&&o.matrix.equals(new T.Matrix4())&&o.matrixWorld.equals(new T.Matrix4());
function validate(kit,zone){const root=kit?.root;let exists=false;root?.traverse(o=>{if(o.userData.structure?.sourceObjectId===OBJECT||o.userData.zhuxiangMainShell)exists=true});
 if(!root||root.name!=='ningshou'||root.parent||!identity(root)||!mutable(root.children)||['colliders','walkables','owned'].some(k=>!mutable(kit[k]))||done.has(kit)||exists||JSON.stringify(zone.bounds)!=='{"x0":-366.5,"x1":-222.45,"z0":111.5,"z1":526.5}')throw Error('Exact mutable untransformed Zhuxiang host required, once only');
 for(const[name,x,z,w,d,ph]of[['符望阁',-259.1,484.6,23.1,22.5,1],['倦勤斋',-252.6,513.6,31.5,8.8,.5]])if(zone.items?.filter(i=>i.kind==='hall'&&i.name===name&&i.x===x&&i.z===z&&i.w===w&&i.d===d&&i.ph===ph).length!==1)throw Error('Retained Fuwang/Juanqin anchor changed');
 const reserve=new T.Box3(new T.Vector3(-244.2,.001,495),new T.Vector3(-235.2,9.7,507));if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve))||kit.walkables.some(w=>{const b=w.box??(w.type==='ramp'?new T.Box3(new T.Vector3(w.minX,Math.min(w.y0,w.y1),w.minZ),new T.Vector3(w.maxX,Math.max(w.y0,w.y1),w.maxZ)):null);return b?.intersectsBox(reserve)}))throw Error('Zhuxiang fitted reserve occupied');
 root.updateWorldMatrix(true,true);let occupied=false;root.traverse(o=>{if(o.isMesh&&new T.Box3().setFromObject(o,true).intersectsBox(reserve))occupied=true});if(occupied)throw Error('Zhuxiang visible reserve occupied');
}
function boxPayload(width,height,depth){
 const position=[],normal=[],uv=[],index=[],groups=[];
 const planes=[['z','y','x',-1,-1,depth,height,width],['z','y','x',1,-1,depth,height,-width],['x','z','y',1,1,width,depth,height],['x','z','y',1,-1,width,depth,-height],['x','y','z',1,-1,width,height,depth],['x','y','z',-1,-1,width,height,-depth]];
 for(const [face,[u,v,w,udir,vdir,pw,ph,pd]] of planes.entries()){
  for(let iy=0;iy<2;iy++)for(let ix=0;ix<2;ix++){const p={x:0,y:0,z:0},n={x:0,y:0,z:0};p[u]=(ix*pw-pw/2)*udir;p[v]=(iy*ph-ph/2)*vdir;p[w]=pd/2;n[w]=pd>0?1:-1;position.push(p.x,p.y,p.z);normal.push(n.x,n.y,n.z);uv.push(ix,1-iy);}
  const a=face*4;index.push(a,a+2,a+1,a+2,a+3,a+1);groups.push({start:face*6,count:6,materialIndex:face});
 }
 return{position:new Float32Array(position),normal:new Float32Array(normal),uv:new Float32Array(uv),index:new Uint16Array(index),groups};
}
export function buildZhuxiangMainShell(kit,zone){
 if(zone?.id!=='ningshou')return false;validate(kit,zone);
 const P=ZHUXIANG_FIT,f=new T.Group();f.name='竹香馆';f.position.set(P.x,0,P.z);f.rotation.y=P.rotationY;f.userData.zhuxiangMainShell=true;
 const geometries=[],materials=[],colliders=[],walkables=[];
 const own=()=>{const g=new T.BufferGeometry();geometries.push(g);return g};
 const mat=(name,color,borrow)=>{const m=new T.MeshStandardMaterial();materials.push(m);if(borrow)m.copy(kit.lib.material(borrow));m.name='r165_zhuxiang_'+name;m.color.setHex(color);m.roughness=.86;m.side=T.FrontSide;return m};
 const mesh=(role,g,m,x=0,y=0,z=0,kind=null,walk=false)=>{const o=new T.Mesh(g,m);o.name=ID+'/'+role;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.userData={zhuxiangMainShell:true,role,contactKind:kind,topWalk:walk,fitNotSurvey:true};f.add(o);return o};
 const box=(role,m,w,h,d,x,y,z,kind=null,walk=false)=>{const g=own(),p=boxPayload(w,h,d);g.setIndex(new T.BufferAttribute(p.index,1));g.setAttribute('position',new T.BufferAttribute(p.position,3));g.setAttribute('normal',new T.BufferAttribute(p.normal,3));g.setAttribute('uv',new T.BufferAttribute(p.uv,2));return mesh(role,g,m,x,y,z,kind,walk)};
 const surface=(role,m,nx,nz,point)=>{const g=own(),v=[],uv=[],ix=[],count=(nx+1)*(nz+1);for(const low of[false,true])for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const a=point(i/nx,j/nz);v.push(a[0],a[1]-(low?.12:0),a[2]);uv.push(a[0],a[2]);}const n=(i,j)=>i*(nz+1)+j,q=(a,b,c,d)=>ix.push(a,b,c,a,c,d);
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=n(i,j),b=n(i,j+1),c=n(i+1,j+1),d=n(i+1,j);q(a,b,c,d);q(a+count,d+count,c+count,b+count)}
  for(let i=0;i<nx;i++){const a=n(i,0),b=n(i+1,0),c=n(i,nz),d=n(i+1,nz);q(a,b,b+count,a+count);q(d,c,c+count,d+count)}for(let j=0;j<nz;j++){const a=n(0,j),b=n(0,j+1),c=n(nx,j),d=n(nx,j+1);q(b,a,a+count,b+count);q(c,d,d+count,c+count)}
  g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(role,g,m,0,0,0,'triangle')};

 try{
  const red=mat('red_timber',0x7c3d31),window=mat('dark_window',0x354b42),plaster=mat('pale_plaster',0xb4ab97),yellow=mat('roof_tile_yellow',0xb8a06d,'roof_tile'),green=mat('roof_tile_green',0x557057,'roof_tile'),stone=kit.lib.material('stone_slab');
  // The lower level is a closed exterior fit; the concealing rock hill is not invented.
  box('stone-platform',stone,9.8,P.floorY,4.6,0,P.floorY/2,0,'box',true);
  box('main-closed-core',plaster,6.6,5.35,4.2,0,.3+5.35/2,0,'triangle');
  for(const side of[-1,1])box('ear-core-'+side,plaster,1.5,4.55,3.6,side*4.05,.3+4.55/2,.15,'triangle');
  for(const side of[-1,1]){
   const z=side*2.14;
   box('main-waist-band-'+side,red,6.66,.18,.08,0,2.65,z);
   box('main-eave-beam-'+side,red,6.75,.22,.12,0,5.52,z);
   for(const x of[-3.2,-1.1,1.1,3.2])box('main-post-'+side+'-'+x,red,.16,5.35,.14,x,2.975,z);
   for(const [i,x]of[-2.2,0,2.2].entries()){
    box((side<0?'upper-main-window-':'rear-upper-window-')+i,window,1.72,2.12,.05,x,4.1,z+side*.06);
    box('lower-window-'+side+'-'+i,window,1.28,1.25,.05,x,1.5,z+side*.06);
    for(const dx of[-.88,.88])box('upper-window-frame-'+side+'-'+i+'-'+dx,red,.09,2.28,.08,x+dx,4.1,z+side*.11);
    for(const y of[3,5.2])box('upper-window-cross-'+side+'-'+i+'-'+y,red,1.86,.09,.08,x,y,z+side*.11);
    for(const dx of[-.32,.32])box('upper-window-grid-'+side+'-'+i+'-'+dx,red,.035,2.1,.03,x+dx,4.1,z+side*.11);
    for(const y of[1,2])box('lower-window-cross-'+side+'-'+i+'-'+y,red,1.4,.07,.06,x,y,z+side*.1);
   }
   for(const e of[-1,1]){
    const x=e*4.05,ez=side*1.84+.15;
    for(const y of[1.4,3.65]){box('ear-window-'+side+'-'+e+'-'+y,window,1.1,1.1,.05,x,y,ez);for(const dx of[-.58,.58])box('ear-post-'+side+'-'+e+'-'+y+'-'+dx,red,.07,1.2,.07,x+dx,y,ez+side*.04);for(const dy of[-.6,.6])box('ear-cross-'+side+'-'+e+'-'+y+'-'+dy,red,1.24,.07,.07,x,y+dy,ez+side*.04)}
    box('ear-waist-'+side+'-'+e,red,1.5,.14,.08,x,2.65,ez);
   }
  }
  // Source-supported rolled hip main roof; exact curves and ear roofing are fitted.
  const hx=3.72,hz=2.8,gx=2.8,cap=.65,C=z=>P.roofRise*Math.pow(Math.max(0,Math.cos(Math.abs(z)/hz*Math.PI/2)),1.3),Y=(x,z)=>P.eaveY+(Math.abs(x)<=gx?C(z):Math.min(C(z),cap)*(hx-Math.abs(x))/(hx-gx));
  surface('main-green-roof',green,24,24,(u,v)=>{const x=(2*u-1)*gx,z=(2*v-1)*hz;return[x,P.eaveY+C(z),z]});
  for(const side of[-1,1]){
   surface('main-lower-hip-roof-'+side,green,8,24,(u,v)=>{const x=side*(gx+(hx-gx)*(side>0?u:1-u)),z=(2*v-1)*hz;return[x,P.eaveY+Math.min(C(z),cap)*(hx-Math.abs(x))/(hx-gx),z]});
   // A closed upper gable infill separates the barrel upper roof from its lower hip skirt.
   // Exact gable break and hidden end treatment are fitted rather than measured.
   const stop=hz*2/Math.PI*Math.acos(Math.pow(cap/P.roofRise,1/1.3)),contour=[];
   for(let j=0;j<=24;j++){const z=-stop+2*stop*j/24;contour.push(new T.Vector2(z,P.eaveY+C(z)-.12))}
   const tri=T.ShapeUtils.triangulateShape(contour,[]),g=own(),v=[],ix=[],n=contour.length;
   for(const dx of[-.055,.055])for(const p of contour)v.push(side*gx+dx,p.y,p.x);
   // Shape x/y are local z/y: positive contour normal points toward negative local x.
   for(const [a,b,c]of tri){ix.push(a,b,c,a+n,c+n,b+n)}
   for(let j=0;j<n;j++){const k=(j+1)%n;ix.push(j,k,k+n,j,k+n,j+n)}
   g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();mesh('main-upper-gable-'+side,g,red,0,0,0,'triangle');
   surface('main-yellow-eave-roof-'+side,yellow,24,1,(u,v)=>{const x=(2*u-1)*hx,z=side*(hz-.18+.18*(side>0?v:1-v));return[x,Y(x,z)+.025,z]});
   surface('main-yellow-gable-roof-'+side,yellow,1,24,(u,v)=>{const x=side*(gx-.15+.15*(side>0?u:1-u)),z=(2*v-1)*hz;return[x,P.eaveY+C(z)+.025,z]});
   surface('main-yellow-end-roof-'+side,yellow,1,24,(u,v)=>{const x=side*(hx-.18+.18*(side>0?u:1-u)),z=(2*v-1)*hz;return[x,Y(x,z)+.025,z]});
  }
  for(const side of[-1,1]){
   const cx=side*4.05,ehx=1.03,ehz=2.1,E=z=>4.85+.9*Math.pow(Math.max(0,Math.cos(Math.abs(z-.15)/ehz*Math.PI/2)),1.3);
   surface('ear-green-roof-'+side,green,4,16,(u,v)=>{const z=.15+(2*v-1)*ehz;return[cx+(2*u-1)*ehx,E(z),z]});
   for(const end of[-1,1]){
    surface('ear-yellow-eave-roof-'+side+'-'+end,yellow,4,1,(u,v)=>{const z=.15+end*(ehz-.15+.15*(end>0?v:1-v));return[cx+(2*u-1)*ehx,E(z)+.025,z]});
    surface('ear-yellow-end-roof-'+side+'-'+end,yellow,1,16,(u,v)=>{const z=.15+(2*v-1)*ehz;return[cx+end*(ehx-.15+.15*(end>0?u:1-u)),E(z)+.025,z]});
   }
  }
  f.updateWorldMatrix(true,true);f.traverse(o=>{if(!o.isMesh||!o.userData.contactKind)return;const b=new T.Box3().setFromObject(o,true);if(o.userData.contactKind==='triangle'){const g=own();try{g.copy(o.geometry);g.applyMatrix4(o.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+o.name);b.copy(shape.box);b.triangleSupport=shape}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}}b.zhuxiangMainShell=true;b.zhuxiangMesh=o.name;colliders.push(b);if(o.userData.topWalk){const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false,zhuxiangMainShell:true,zhuxiangMesh:o.name})}});
  if(!new T.Box3(new T.Vector3(-244.2,-.00001,495),new T.Vector3(-235.2,9.7,507)).containsBox(new T.Box3().setFromObject(f,true)))throw Error('Zhuxiang escaped fitted reserve');
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const meta={id:ID,sourceObjectId:OBJECT,name:'竹香馆',scope:'EAST_FACING_TWO_STOREY_MAIN_AND_EAR_EXTERIOR_ONLY',storeys:2,bays:{main:3,ears:[1,1]},wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,source:'https://www.dpm.org.cn/explore/building/236485.html',photo:'https://www.dpm.org.cn/Uploads/Picture/dc/1571.jpg',photoSHA256:'d6c2ed64d58d4bef34d1febed06f0f1fd69dc80a84a777fa59d2364d450147ba',roof:'GREEN_FIELD_YELLOW_TRIM_ROLLED_HIP_MAIN',fit:{...P,interior:'CLOSED_UNRECONSTRUCTED',dimensions:'MODEL_FIT_NOT_SURVEY',hiddenWalls:'SIMPLIFIED_NOT_PHOTO_RECONSTRUCTION',earRoof:'FITTED_SECONDARY_ROLLED_FORM_NOT_MEASURED',mainGable:'EXPLICIT_UPPER_GABLE_AND_LOWER_HIP_BREAK_FITTED_NOT_SURVEY',ornament:'SIMPLIFIED_NOT_ORIGINAL_PATTERN'},notBuilt:['Concealing rock hill and lower-level cave-like approaches','Diagonal galleries to Juanqin/Yucui and upper access','Bow wall, octagonal portal, glazed lattice and lettering','Interior, furnishings, exact hidden elevations and contemporary visitor admission'],newMapItems:0,newRooms:0,newTeleportTargets:0};
 f.userData.structure=meta;kit.root.add(f);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);return{frame:f,meta,colliders,walkables,materials};
}
