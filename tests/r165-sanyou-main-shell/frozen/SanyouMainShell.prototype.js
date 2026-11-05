import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='sanyou-main-shell',OBJECT='FC-FEB4BD3F2F',done=new WeakSet();
export const SANYOU_FIT=Object.freeze({x:-268.2,z:438,rotationY:0,coreWidth:8.4,coreDepth:4,floorY:.5,eaveY:4.9,roofRise:1.7,front:'SOUTH_MODEL_NEGATIVE_Z'});
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const identity=o=>o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1))&&o.matrix.equals(new T.Matrix4())&&o.matrixWorld.equals(new T.Matrix4());
function validate(kit,zone){const root=kit?.root;let exists=false;root?.traverse(o=>{if(o.userData.structure?.sourceObjectId===OBJECT||o.userData.sanyouMainShell)exists=true});
 if(!root||root.name!=='ningshou'||root.parent||!identity(root)||!mutable(root.children)||['colliders','walkables','owned'].some(k=>!mutable(kit[k]))||done.has(kit)||exists||JSON.stringify(zone.bounds)!=='{"x0":-366.5,"x1":-222.45,"z0":111.5,"z1":526.5}')throw Error('Exact mutable untransformed Sanyou host required, once only');
 for(const[name,x,z,w,d,ph]of[['乐寿堂',-293.4,435.3,36.15,23.2,.9],['萃赏楼',-260.7,456.3,20.5,10.9,.5],['遂初堂',-253.1,422.1,17.1,10.1,.5]])if(zone.items?.filter(i=>i.kind==='hall'&&i.name===name&&i.x===x&&i.z===z&&i.w===w&&i.d===d&&i.ph===ph).length!==1)throw Error('Retained Leshou/Cuishang/Suichu anchor changed');
 const reserve=new T.Box3(new T.Vector3(-273.1,.001,432.5),new T.Vector3(-261.8,7,443.5));if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve))||kit.walkables.some(w=>w.box?.intersectsBox(reserve)))throw Error('Sanyou fitted reserve occupied');
 root.updateWorldMatrix(true,true);let occupied=false;root.traverse(o=>{if(o.isMesh&&new T.Box3().setFromObject(o,true).intersectsBox(reserve))occupied=true});if(occupied)throw Error('Sanyou visible reserve occupied');
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
export function buildSanyouMainShell(kit,zone){
 if(zone?.id!=='ningshou')return false;validate(kit,zone);
 const P=SANYOU_FIT,f=new T.Group();f.name='三友轩';f.position.set(P.x,0,P.z);f.rotation.y=P.rotationY;f.userData.sanyouMainShell=true;
 const geometries=[],materials=[],colliders=[],walkables=[];
 const own=()=>{const g=new T.BufferGeometry();geometries.push(g);return g};
 const mat=(name,color,borrow)=>{const m=new T.MeshStandardMaterial();materials.push(m);if(borrow)m.copy(kit.lib.material(borrow));m.name='r165_sanyou_'+name;m.color.setHex(color);m.roughness=.86;m.side=T.FrontSide;return m};
 const mesh=(role,g,m,x=0,y=0,z=0,kind=null,walk=false)=>{const o=new T.Mesh(g,m);o.name=ID+'/'+role;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.userData={sanyouMainShell:true,role,contactKind:kind,topWalk:walk,fitNotSurvey:true};f.add(o);return o};
 const box=(role,m,w,h,d,x,y,z,kind=null,walk=false)=>{const g=own(),p=boxPayload(w,h,d);g.setIndex(new T.BufferAttribute(p.index,1));g.setAttribute('position',new T.BufferAttribute(p.position,3));g.setAttribute('normal',new T.BufferAttribute(p.normal,3));g.setAttribute('uv',new T.BufferAttribute(p.uv,2));return mesh(role,g,m,x,y,z,kind,walk)};
 const surface=(role,m,nx,nz,point)=>{const g=own(),v=[],uv=[],ix=[],count=(nx+1)*(nz+1);for(const low of[false,true])for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const a=point(i/nx,j/nz);v.push(a[0],a[1]-(low?.12:0),a[2]);uv.push(a[0],a[2]);}const n=(i,j)=>i*(nz+1)+j,q=(a,b,c,d)=>ix.push(a,b,c,a,c,d);
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=n(i,j),b=n(i,j+1),c=n(i+1,j+1),d=n(i+1,j);q(a,b,c,d);q(a+count,d+count,c+count,b+count)}
  for(let i=0;i<nx;i++){const a=n(i,0),b=n(i+1,0),c=n(i,nz),d=n(i+1,nz);q(a,b,b+count,a+count);q(d,c,c+count,d+count)}for(let j=0;j<nz;j++){const a=n(0,j),b=n(0,j+1),c=n(nx,j),d=n(nx,j+1);q(b,a,a+count,b+count);q(c,d,d+count,c+count)}
  g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(role,g,m,0,0,0,'triangle')};
 try{
  const wood=mat('wood',0x59473b),window=mat('window',0x444a43),trim=mat('muted_paint',0x6a785d),yellow=mat('roof_tile_yellow',0xb6a365,'roof_tile'),stone=kit.lib.material('stone_slab');
  // Three galleries: front/south, rear/north and west. No invented east gallery.
  box('stone-platform',stone,10.5,.5,8.4,.75,.25,0,'box',true);
  for(const side of[-1,1])for(let i=0;i<4;i++){const h=.125*(i+1);box('stone-step-'+side+'-'+i,stone,2.6,h,.3,0,h/2,side*(5.4-(i+.5)*.3),'box',true)}
  // Closed unknown interior; photos support closed front, not present admission.
  box('closed-core-ceiling',wood,8.4,.12,4,0,4.76,0,'triangle');
  for(const side of[-1,1]){
   box('side-stone-sill-'+side,stone,.22,1,4,side*4.09,1,0,'triangle');
   box('side-window-'+side,window,.18,2.8,3.8,side*4.09,2.9,0,'triangle');
   box('side-upper-band-'+side,trim,.22,.4,4,side*4.09,4.5,0,'triangle');
   for(const z of[-1.8,-.9,0,.9,1.8])box('side-window-upright-'+side+'-'+z,wood,.23,2.8,.07,side*4.1,2.9,z);
   for(const y of[1.5,2.15,3.65,4.3])box('side-window-cross-'+side+'-'+y,wood,.23,.07,3.85,side*4.1,y,0);
  }
  for(const x of[-2.8,2.8]){
   box('front-stone-sill-'+x,stone,2.8,1,.22,x,1,-1.89,'triangle');
   box('front-window-'+x,window,2.6,2.8,.16,x,2.9,-1.92,'triangle');
   for(const dx of[-1.25,-.6,0,.6,1.25])box('front-window-grid-'+x+'-'+dx,wood,.06,2.8,.07,x+dx,2.9,-2.03);
   for(const y of[1.5,2.15,3.65,4.3])box('front-window-cross-'+x+'-'+y,wood,2.65,.06,.07,x,y,-2.03);
  }
  for(let j=0;j<4;j++){const x=-1.05+j*.7;box('closed-central-door-'+j,wood,.69,3.8,.18,x,2.4,-1.92,'triangle');box('door-upper-field-'+j,window,.55,2.5,.03,x,3,-2.03);for(const dx of[-.25,0,.25])box('door-grid-'+j+'-'+dx,trim,.025,2.5,.025,x+dx,3,-2.06);for(const y of[1.75,2.4,3.6,4.25])box('door-cross-'+j+'-'+y,trim,.55,.025,.025,x,y,-2.06)}
  box('front-upper-band',trim,8.4,.4,.22,0,4.5,-1.89,'triangle');
  box('rear-stone-sill',stone,8.4,1,.22,0,1,1.89,'triangle');
  box('rear-window-field',window,8.2,2.8,.16,0,2.9,1.92,'triangle');
  box('rear-upper-band',trim,8.4,.4,.22,0,4.5,1.89,'triangle');
  for(const x of[-4,-2.8,-1.4,0,1.4,2.8,4])box('rear-window-grid-'+x,wood,.07,2.8,.07,x,2.9,2.03);
  for(const y of[1.5,2.15,3.65,4.3])box('rear-window-cross-'+y,wood,8.2,.06,.07,0,y,2.03);
  for(const side of[-1,1]){
   for(const x of[-4,-1.4,1.4,4,5.7])box('gallery-post-'+side+'-'+x,wood,.22,4.15,.22,x,2.575,side*3.85,'triangle');
   box('gallery-beam-'+side,trim,10.3,.25,.28,.75,4.775,side*3.85,'triangle');
  }
  for(const z of[-1.3,1.3])box('west-gallery-post-'+z,wood,.22,4.15,.22,5.7,2.575,z,'triangle');
  box('west-gallery-beam',trim,.28,.25,7.9,5.7,4.775,0,'triangle');
  // The east(-X) end is straight hard-gable; only west(+X) has a lower hip.
  const hz=4.5,cut=.55,east=-4.6,west=t=>t<=cut?4.2:4.2+(t-cut)/(1-cut)*2,Y=t=>P.eaveY+P.roofRise*Math.pow(Math.max(0,Math.cos(t*Math.PI/2)),1.3);
  surface('yellow-rounded-roof',yellow,16,24,(u,v)=>{const z=(2*v-1)*hz,t=Math.abs(z)/hz;return[east+(west(t)-east)*u,Y(t),z]});
  surface('west-yellow-hip',yellow,10,12,(u,v)=>{const t=cut+(1-cut)*v;return[west(t),Y(t),-(2*u-1)*t*hz]});
  for(const side of[-1,1])surface('yellow-eave-roof-'+side,yellow,16,1,(u,v)=>{const z=side*(hz-.12+.12*(side>0?v:1-v)),t=Math.abs(z)/hz;return[east+(west(t)-east)*u,Y(t)+.02,z]});
  surface('yellow-west-hip-edge',yellow,1,12,(u,v)=>{const t=.97+.03*v;return[west(t),Y(t)+.02,-(2*u-1)*t*hz]});
  function gable(role,x,extent){const g=own(),p=[],ix=[],uv=[],N=20;for(const xx of[x-.07,x+.07]){for(let j=0;j<=N;j++){const z=-hz*extent+2*hz*extent*j/N;p.push(xx,Y(Math.abs(z)/hz)-.12,z);uv.push(z,1)}p.push(xx,P.eaveY-.15,hz*extent,xx,P.eaveY-.15,-hz*extent);uv.push(hz*extent,0,-hz*extent,0)}const count=N+3,shape=[];for(let j=0;j<count;j++)shape.push(new T.Vector2(p[j*3+2],p[j*3+1]));for(const[a,b,c]of T.ShapeUtils.triangulateShape(shape,[]))ix.push(a,c,b,a+count,b+count,c+count);for(let j=0;j<count;j++){const k=(j+1)%count;ix.push(j,k,j+count,k,k+count,j+count)}g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(role,g,wood,0,0,0,'triangle')}
  gable('east-hard-gable',east,1);gable('west-upper-gable',4.2,cut);
  f.updateWorldMatrix(true,true);f.traverse(o=>{if(!o.isMesh||!o.userData.contactKind)return;const b=new T.Box3().setFromObject(o,true);if(o.userData.contactKind==='triangle'){const g=own();try{g.copy(o.geometry);g.applyMatrix4(o.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+o.name);b.copy(shape.box);b.triangleSupport=shape}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}}b.sanyouMainShell=true;b.sanyouMesh=o.name;colliders.push(b);if(o.userData.topWalk){const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false,sanyouMainShell:true,sanyouMesh:o.name})}});
  if(!new T.Box3(new T.Vector3(-273.1,-.00001,432.5),new T.Vector3(-261.8,7,443.5)).containsBox(new T.Box3().setFromObject(f,true)))throw Error('Sanyou escaped fitted reserve');
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const meta={id:ID,sourceObjectId:OBJECT,name:'三友轩',scope:'THREE_BAY_ASYMMETRIC_SHELL_THREE_GALLERIES_ONLY',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,source:'https://www.dpm.org.cn/explore/building/236474.html',photo:'https://img.dpm.org.cn/Uploads/Picture/dc/1528%5B1024%5D.jpg',photoSHA256:'301919026b46be96fc13a139e53f83bb0a513238a144dd1894d25a92e273979b',bays:3,galleries:['SOUTH','NORTH','WEST'],roof:'YELLOW_ROLLED_EAST_HARD_GABLE_WEST_HIP',fit:{...P,closedDoorPose:'OFFICIAL_PHOTO_CLOSED_NOT_CURRENT_ACCESS',interior:'CLOSED_UNRECONSTRUCTED_NOT_EMPTY_INVENTORY',ornament:'SIMPLIFIED_NOT_ORIGINAL_PATTERN'},notBuilt:['Interior circular carved screen, historical furniture and exact window carvings','Rockery, planting, complete adjoining court or hidden construction','Plaque text and fine original painting'],newMapItems:0,newRooms:0,newTeleportTargets:0};
 f.userData.structure=meta;kit.root.add(f);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);return{frame:f,meta,colliders,walkables,materials};
}
