import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='yucui-main-shell',OBJECT='FC-177C99C806',done=new WeakSet();
export const YUCUI_FIT=Object.freeze({x:-237.9,z:484.6,rotationY:Math.PI/2,width:12,depth:5.4,floorY:.5,eaveY:5.1,roofRise:1.7,front:'EAST_MODEL_NEGATIVE_X'});
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const identity=o=>o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1))&&o.matrix.equals(new T.Matrix4())&&o.matrixWorld.equals(new T.Matrix4());
function validate(kit,zone){const root=kit?.root;let exists=false;root?.traverse(o=>{if(o.userData.structure?.sourceObjectId===OBJECT||o.userData.yucuiMainShell)exists=true});
 if(!root||root.name!=='ningshou'||root.parent||!identity(root)||!mutable(root.children)||['colliders','walkables','owned'].some(k=>!mutable(kit[k]))||done.has(kit)||exists||JSON.stringify(zone.bounds)!=='{"x0":-366.5,"x1":-222.45,"z0":111.5,"z1":526.5}')throw Error('Exact mutable untransformed Yucui host required, once only');
 for(const[name,x,z,w,d,ph]of[['符望阁',-259.1,484.6,23.1,22.5,1],['倦勤斋',-252.6,513.6,31.5,8.8,.5]])if(zone.items?.filter(i=>i.kind==='hall'&&i.name===name&&i.x===x&&i.z===z&&i.w===w&&i.d===d&&i.ph===ph).length!==1)throw Error('Retained Fuwang/Juanqin anchor changed');
 const reserve=new T.Box3(new T.Vector3(-243.1,.001,477.9),new T.Vector3(-234.3,7,491.3));if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve))||kit.walkables.some(w=>w.box?.intersectsBox(reserve)))throw Error('Yucui fitted reserve occupied');
 root.updateWorldMatrix(true,true);let occupied=false;root.traverse(o=>{if(o.isMesh&&new T.Box3().setFromObject(o,true).intersectsBox(reserve))occupied=true});if(occupied)throw Error('Yucui visible reserve occupied');
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
/** Original J identity, three-bay exterior and accessible front porch only.
 * Official form and side relation; all sizes/spacing/ornament are fits. */
export function buildYucuiMainShell(kit,zone){
 if(zone?.id!=='ningshou')return false;validate(kit,zone);
 const P=YUCUI_FIT,f=new T.Group();f.name='玉粹轩';f.position.set(P.x,0,P.z);f.rotation.y=P.rotationY;f.userData.yucuiMainShell=true;
 const geometries=[],materials=[],colliders=[],walkables=[];
 const own=()=>{const g=new T.BufferGeometry();geometries.push(g);return g};
 const mat=(name,color,borrow)=>{const m=new T.MeshStandardMaterial();materials.push(m);if(borrow)m.copy(kit.lib.material(borrow));m.name='r165_yucui_'+name;m.color.setHex(color);m.roughness=.86;m.side=T.FrontSide;return m};
 const mesh=(role,g,m,x=0,y=0,z=0,kind=null,walk=false)=>{const o=new T.Mesh(g,m);o.name=ID+'/'+role;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.userData={yucuiMainShell:true,role,contactKind:kind,topWalk:walk,fitNotSurvey:true};f.add(o);return o};
 const box=(role,m,w,h,d,x,y,z,kind=null,walk=false)=>{const g=own(),p=boxPayload(w,h,d);g.setIndex(new T.BufferAttribute(p.index,1));g.setAttribute('position',new T.BufferAttribute(p.position,3));g.setAttribute('normal',new T.BufferAttribute(p.normal,3));g.setAttribute('uv',new T.BufferAttribute(p.uv,2));return mesh(role,g,m,x,y,z,kind,walk)};
 const surface=(role,m,nx,nz,point)=>{const g=own(),v=[],uv=[],ix=[],count=(nx+1)*(nz+1);for(const low of[false,true])for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const a=point(i/nx,j/nz);v.push(a[0],a[1]-(low?.12:0),a[2]);uv.push(a[0],a[2]);}const n=(i,j)=>i*(nz+1)+j,q=(a,b,c,d)=>ix.push(a,b,c,a,c,d);
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=n(i,j),b=n(i,j+1),c=n(i+1,j+1),d=n(i+1,j);q(a,b,c,d);q(a+count,d+count,c+count,b+count)}
  for(let i=0;i<nx;i++){const a=n(i,0),b=n(i+1,0),c=n(i,nz),d=n(i+1,nz);q(a,b,b+count,a+count);q(d,c,c+count,d+count)}for(let j=0;j<nz;j++){const a=n(0,j),b=n(0,j+1),c=n(nx,j),d=n(nx,j+1);q(b,a,a+count,b+count);q(c,d,d+count,c+count)}
  g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(role,g,m,0,0,0,'triangle')};
 try{
  const red=mat('red_timber',0x773b31),dark=mat('dark_window',0x28352e),gold=mat('muted_trim',0x9a8860),yellow=mat('roof_tile_yellow',0xc3a259,'roof_tile'),green=mat('roof_tile_green',0x537664,'roof_tile'),stone=kit.lib.material('stone_slab');
  box('stone-platform',stone,12.6,.5,5.9,0,.25,-.25,'box',true);
  for(let i=0;i<4;i++){const h=.125*(i+1);box('front-stone-step-'+i,stone,2.8,h,.3,0,h/2,-4.4+(i+.5)*.3,'box',true)}
  // Closed core, including hidden back. No invented room admission or inventory.
  for(const side of[-1,1])box('closed-side-'+side,red,.22,4.3,3.7,side*5.89,2.65,.85,'triangle');
  box('closed-back',red,12,4.3,.22,0,2.65,2.59,'triangle');
  box('closed-core-ceiling',dark,12,.12,3.7,0,4.86,.85,'triangle');
  for(const x of[-4,4]){
   box('front-window-sill-'+x,red,4,1,.22,x,1,-1,'triangle');
   box('front-window-field-'+x,dark,3.8,2.6,.14,x,2.8,-1.05,'triangle');
   for(const dx of[-1.85,-.92,0,.92,1.85])box('window-red-grid-'+x+'-'+dx,red,.07,2.6,.07,x+dx,2.8,-1.16);
   for(const y of[1.5,2.15,3.45,4.1])box('window-cross-'+x+'-'+y,red,3.9,.07,.07,x,y,-1.16);
   for(const dx of[-1.7,1.7])box('window-muted-border-'+x+'-'+dx,gold,.025,2.4,.025,x+dx,2.8,-1.21);
  }
  for(let j=0;j<4;j++){const x=-1.5+j;box('closed-central-door-'+j,red,.99,3.6,.18,x,2.3,-1,'triangle');box('door-upper-field-'+j,dark,.83,2.1,.03,x,2.95,-1.11);for(const dx of[-.4,0,.4])box('door-grid-'+j+'-'+dx,gold,.027,2.1,.025,x+dx,2.95,-1.14);for(const y of[1.9,2.6,3.3,4])box('door-cross-'+j+'-'+y,gold,.83,.027,.025,x,y,-1.14)}
  box('front-upper-band',green,12,.7,.22,0,4.45,-1,'triangle');
  for(const x of[-5.8,-1.94,1.94,5.8])box('three-bay-gallery-post-'+x,red,.22,4.3,.22,x,2.65,-2.9,'triangle');
  box('front-painted-beam-fit',green,12,.28,.3,0,4.72,-2.9,'triangle');
  for(const x of[-5.8,-1.94,1.94,5.8])box('simple-front-bracket-'+x,gold,.42,.18,.46,x,4.95,-2.9);
  const hz=3.4,cut=.6,hx=t=>t<=cut?4.8:4.8+(t-cut)/(1-cut)*1.6,Y=t=>P.eaveY+P.roofRise*Math.pow(Math.max(0,Math.cos(t*Math.PI/2)),1.3);
  surface('yellow-rounded-crown-roof',yellow,12,20,(u,v)=>{const z=(2*v-1)*hz,t=Math.abs(z)/hz;return[(2*u-1)*hx(t),Y(t),z]});
  for(const sign of[-1,1])surface('yellow-hip-end-'+sign,yellow,8,10,(u,v)=>{const t=cut+(1-cut)*v;return[sign*hx(t),Y(t),-sign*(2*u-1)*t*hz]});
  // Narrow glaze edge strips follow the same end/slope surface, not a ridge beam.
  for(const sign of[-1,1]){
   surface('green-eave-edge-'+sign,green,12,1,(u,v)=>{const z=sign*(hz-.14+.14*(sign>0?v:1-v)),t=Math.abs(z)/hz;return[(2*u-1)*hx(t),Y(t)+.025,z]});
   surface('green-hip-bottom-'+sign,green,1,10,(u,v)=>{const t=.965+.035*v;return[sign*hx(t),Y(t)+.025,-sign*(2*u-1)*t*hz]});
  }
  // Real high gable closure at the upper roll ends; exact hidden joinery is a fit.
  for(const sign of[-1,1]){const g=own(),p=[],ix=[],uv=[],N=16;for(const x of[sign*4.8-.07,sign*4.8+.07]){for(let j=0;j<=N;j++){const z=-hz*cut+2*hz*cut*j/N;p.push(x,Y(Math.abs(z)/hz)-.12,z);uv.push(z,1)}p.push(x,P.eaveY-.12,hz*cut,x,P.eaveY-.12,-hz*cut);uv.push(hz*cut,0,-hz*cut,0)}const count=N+3,shape=[];for(let j=0;j<count;j++)shape.push(new T.Vector2(p[j*3+2],p[j*3+1]));for(const[a,b,c]of T.ShapeUtils.triangulateShape(shape,[]))ix.push(a,c,b,a+count,b+count,c+count);for(let j=0;j<count;j++){const k=(j+1)%count;ix.push(j,k,j+count,k,k+count,j+count)}g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();mesh('upper-roll-gable-'+sign,g,red,0,0,0,'triangle')}
  f.updateWorldMatrix(true,true);f.traverse(o=>{if(!o.isMesh||!o.userData.contactKind)return;const b=new T.Box3().setFromObject(o,true);if(o.userData.contactKind==='triangle'){const g=own();try{g.copy(o.geometry);g.applyMatrix4(o.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+o.name);b.copy(shape.box);b.triangleSupport=shape}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}}b.yucuiMainShell=true;b.yucuiMesh=o.name;colliders.push(b);if(o.userData.topWalk){const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false,yucuiMainShell:true,yucuiMesh:o.name})}});
  if(!new T.Box3(new T.Vector3(-243.1,-.00001,477.9),new T.Vector3(-234.3,7,491.3)).containsBox(new T.Box3().setFromObject(f,true)))throw Error('Yucui escaped fitted reserve');
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const meta={id:ID,sourceObjectId:OBJECT,name:'玉粹轩',scope:'THREE_BAY_EXTERIOR_AND_FRONT_PORCH_ONLY',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,source:'https://www.dpm.org.cn/explore/building/236460.html',photo:'https://img.dpm.org.cn/Uploads/Picture/dc/1560%5B1024%5D.jpg',photoSHA256:'aa4dc4d464802d5480e5190a6e0ca05a5ff2828bd60578cf729132c07d243a1f',bays:3,frontGallery:true,roof:'FITTED_YELLOW_GREEN_ROLLED_HIPPED_GABLE',fit:{...P,closedDoorPose:'OFFICIAL_PHOTO_CLOSED_NOT_CURRENT_ACCESS',interior:'CLOSED_UNRECONSTRUCTED_NOT_EMPTY_INVENTORY',ornament:'SIMPLIFIED_NOT_ORIGINAL_PATTERN'},notBuilt:['Three interior rooms and north internal passage to Zhuxiang','Northern connecting gallery, southern rock hill, courtyard stone-faced short wall','Exact original painting, plaque text, sculptures and full hidden elevations'],newMapItems:0,newRooms:0,newTeleportTargets:0};
 f.userData.structure=meta;kit.root.add(f);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);return{frame:f,meta,colliders,walkables,materials};
}
