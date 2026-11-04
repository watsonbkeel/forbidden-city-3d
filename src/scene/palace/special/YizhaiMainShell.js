import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='yizhai-main-shell',OBJECT='FC-29F4099DA5',done=new WeakSet();
export const YIZHAI_FIT=Object.freeze({x:-267.3,z:368.5,rotationY:0,coreWidth:8,coreDepth:3.6,floorY:.3,eaveY:4.5,roofRise:1.4,frontDoorX:-2.6,rearDoorX:2.6,front:'SOUTH_MODEL_NEGATIVE_Z'});
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const identity=o=>o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1))&&o.matrix.equals(new T.Matrix4())&&o.matrixWorld.equals(new T.Matrix4());
function validate(kit,zone){const root=kit?.root;let exists=false;root?.traverse(o=>{if(o.userData.structure?.sourceObjectId===OBJECT||o.userData.yizhaiMainShell)exists=true});
 if(!root||root.name!=='ningshou'||root.parent||!identity(root)||!mutable(root.children)||['colliders','walkables','owned'].some(k=>!mutable(kit[k]))||done.has(kit)||exists||JSON.stringify(zone.bounds)!=='{"x0":-366.5,"x1":-222.45,"z0":111.5,"z1":526.5}')throw Error('Exact mutable untransformed Yizhai host required, once only');
 if(zone.items?.filter(i=>i.kind==='hall'&&i.name==='养性殿'&&i.x===-293.8&&i.z===386.3&&i.w===37.9&&i.d===23.3&&i.ph===.9).length!==1)throw Error('Retained Yangxing anchor changed');
 const reserve=new T.Box3(new T.Vector3(-272.5,.001,363),new T.Vector3(-262,7.3,374.5));if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve))||kit.walkables.some(w=>{const b=w.box??(w.type==='ramp'?new T.Box3(new T.Vector3(w.minX,Math.min(w.y0,w.y1),w.minZ),new T.Vector3(w.maxX,Math.max(w.y0,w.y1),w.maxZ)):null);return b?.intersectsBox(reserve)}))throw Error('Yizhai fitted reserve occupied');
 root.updateWorldMatrix(true,true);let occupied=false;root.traverse(o=>{if(o.isMesh&&new T.Box3().setFromObject(o,true).intersectsBox(reserve))occupied=true});if(occupied)throw Error('Yizhai visible reserve occupied');
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
export function buildYizhaiMainShell(kit,zone){
 if(zone?.id!=='ningshou')return false;validate(kit,zone);
 const P=YIZHAI_FIT,f=new T.Group();f.name='抑斋';f.position.set(P.x,0,P.z);f.rotation.y=P.rotationY;f.userData.yizhaiMainShell=true;
 const geometries=[],materials=[],colliders=[],walkables=[];
 const own=()=>{const g=new T.BufferGeometry();geometries.push(g);return g};
 const mat=(name,color,borrow)=>{const m=new T.MeshStandardMaterial();materials.push(m);if(borrow)m.copy(kit.lib.material(borrow));m.name='r165_yizhai_'+name;m.color.setHex(color);m.roughness=.86;m.side=T.FrontSide;return m};
 const mesh=(role,g,m,x=0,y=0,z=0,kind=null,walk=false)=>{const o=new T.Mesh(g,m);o.name=ID+'/'+role;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.userData={yizhaiMainShell:true,role,contactKind:kind,topWalk:walk,fitNotSurvey:true};f.add(o);return o};
 const box=(role,m,w,h,d,x,y,z,kind=null,walk=false)=>{const g=own(),p=boxPayload(w,h,d);g.setIndex(new T.BufferAttribute(p.index,1));g.setAttribute('position',new T.BufferAttribute(p.position,3));g.setAttribute('normal',new T.BufferAttribute(p.normal,3));g.setAttribute('uv',new T.BufferAttribute(p.uv,2));return mesh(role,g,m,x,y,z,kind,walk)};
 const surface=(role,m,nx,nz,point)=>{const g=own(),v=[],uv=[],ix=[],count=(nx+1)*(nz+1);for(const low of[false,true])for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const a=point(i/nx,j/nz);v.push(a[0],a[1]-(low?.12:0),a[2]);uv.push(a[0],a[2]);}const n=(i,j)=>i*(nz+1)+j,q=(a,b,c,d)=>ix.push(a,b,c,a,c,d);
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=n(i,j),b=n(i,j+1),c=n(i+1,j+1),d=n(i+1,j);q(a,b,c,d);q(a+count,d+count,c+count,b+count)}
  for(let i=0;i<nx;i++){const a=n(i,0),b=n(i+1,0),c=n(i,nz),d=n(i+1,nz);q(a,b,b+count,a+count);q(d,c,c+count,d+count)}for(let j=0;j<nz;j++){const a=n(0,j),b=n(0,j+1),c=n(nx,j),d=n(nx,j+1);q(b,a,a+count,b+count);q(c,d,d+count,c+count)}
  g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(role,g,m,0,0,0,'triangle')};

 try{
  const red=mat('red_timber',0x773b31),window=mat('dark_window',0x34423a),trim=mat('muted_paint',0x66806c),yellow=mat('roof_tile_yellow',0xb9a06d,'roof_tile'),green=mat('roof_tile_green',0x56715f,'roof_tile'),stone=kit.lib.material('stone_slab');
  box('stone-platform',stone,9.6,P.floorY,7.2,0,P.floorY/2,0,'box',true);
  for(const side of[-1,1])for(let i=0;i<2;i++){const h=.15*(i+1),x=side<0?P.frontDoorX:P.rearDoorX;box('stone-step-'+side+'-'+i,stone,2.6,h,.6,x,h/2,side*(4.8-(i+.5)*.6),'box',true)}
  box('closed-core-ceiling',red,8,.12,3.6,0,4.36,0,'triangle');
  // No invented interior or covert connection: real photos/text do not certify admission.
  for(const side of[-1,1]){
   box('side-stone-wall-'+side,stone,.2,1.2,3.6,side*3.9,.9,0,'triangle');
   box('side-upper-wall-'+side,trim,.2,2.8,3.6,side*3.9,2.9,0,'triangle');
  }
  for(const side of[-1,1]){
   const front=side<0,doorX=front?P.frontDoorX:P.rearDoorX,windowX=front?1.4:-1.4,z=side*1.71,face=side*1.84;
   box((front?'front':'rear')+'-window-sill',stone,5.2,1.2,.18,windowX,.9,z,'triangle');
   box((front?'front':'rear')+'-window',window,5.05,2.8,.16,windowX,2.9,z,'triangle');
   for(const dx of[-2.5,-1.65,-.82,0,.82,1.65,2.5])box('window-upright-'+side+'-'+dx,red,.06,2.8,.06,windowX+dx,2.9,face);
   for(const y of[1.5,2.1,3.65,4.3])box('window-cross-'+side+'-'+y,red,5.08,.06,.06,windowX,y,face);
   for(let j=0;j<4;j++){const x=doorX-1.05+j*.7;box('closed-'+(front?'front':'rear')+'-door-'+j,red,.69,4,.18,x,2.3,z,'triangle');box('door-field-'+side+'-'+j,window,.55,2.5,.03,x,3,face);for(const dx of[-.25,0,.25])box('door-grid-'+side+'-'+j+'-'+dx,trim,.025,2.5,.025,x+dx,3,face+side*.03);for(const y of[1.75,2.4,3.6,4.25])box('door-cross-'+side+'-'+j+'-'+y,trim,.55,.025,.025,x,y,face+side*.03)}
   box('upper-band-'+side,trim,8,.3,.22,0,4.35,z,'triangle');
   // Front doorway is the narrow east bay. Rear off-axis position is only a fit.
   for(const x of[-4.4,front?-1.2:1.2,4.4])box('gallery-post-'+side+'-'+x,red,.22,4.05,.22,x,2.325,side*3.35,'triangle');
   box('gallery-beam-'+side,trim,9.02,.24,.28,0,4.38,side*3.35,'triangle');
  }
  // Closed, rounded hard-gable roof, no false ridge or hip copied from another object.
  const hz=3.9,hx=4.85,Y=z=>P.eaveY+P.roofRise*Math.pow(Math.max(0,Math.cos(Math.abs(z)/hz*Math.PI/2)),1.3);
  surface('yellow-rounded-roof',yellow,12,24,(u,v)=>{const z=(2*v-1)*hz;return[(2*u-1)*hx,Y(z),z]});
  for(const side of[-1,1]){
   surface('green-eave-edge-'+side,green,12,1,(u,v)=>{const z=side*(hz-.2+.2*(side>0?v:1-v));return[(2*u-1)*hx,Y(z)+.025,z]});
   surface('green-gable-edge-'+side,green,1,24,(u,v)=>{const z=(2*v-1)*hz;return[side*(hx-.2+.2*(side>0?u:1-u)),Y(z)+.025,z]});
  }
  for(const side of[-1,1]){const g=own(),p=[],ix=[],uv=[],N=24,x=side*4.75;for(const xx of[x-.07,x+.07]){for(let j=0;j<=N;j++){const z=-hz+2*hz*j/N;p.push(xx,Y(z)-.12,z);uv.push(z,1)}p.push(xx,P.eaveY-.15,hz,xx,P.eaveY-.15,-hz);uv.push(hz,0,-hz,0)}const count=N+3,shape=[];for(let j=0;j<count;j++)shape.push(new T.Vector2(p[j*3+2],p[j*3+1]));for(const[a,b,c]of T.ShapeUtils.triangulateShape(shape,[]))ix.push(a,c,b,a+count,b+count,c+count);for(let j=0;j<count;j++){const k=(j+1)%count;ix.push(j,k,j+count,k,k+count,j+count)}g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();mesh('hard-gable-'+side,g,trim,0,0,0,'triangle')}
  f.updateWorldMatrix(true,true);f.traverse(o=>{if(!o.isMesh||!o.userData.contactKind)return;const b=new T.Box3().setFromObject(o,true);if(o.userData.contactKind==='triangle'){const g=own();try{g.copy(o.geometry);g.applyMatrix4(o.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+o.name);b.copy(shape.box);b.triangleSupport=shape}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}}b.yizhaiMainShell=true;b.yizhaiMesh=o.name;colliders.push(b);if(o.userData.topWalk){const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false,yizhaiMainShell:true,yizhaiMesh:o.name})}});
  if(!new T.Box3(new T.Vector3(-272.5,-.00001,363),new T.Vector3(-262,7.3,374.5)).containsBox(new T.Box3().setFromObject(f,true)))throw Error('Yizhai escaped fitted reserve');
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const meta={id:ID,sourceObjectId:OBJECT,name:'抑斋',scope:'ASYMMETRIC_TWO_BAY_SHELL_FRONT_REAR_GALLERIES_ONLY',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,source:'https://www.dpm.org.cn/explore/building/236459.html',photo:'https://img.dpm.org.cn/Uploads/Picture/dc/1557%5B1024%5D.jpg',photoSHA256:'067c66e8bf594ecb6d68abb350a80a7f9e4b394bacc36ee6d7b12e2abd606931',baysDescription:'OFFICIAL_TWO_BAYS_YOUTH_ONE_AND_HALF_UNEQUAL_NOT_MEASURED',galleries:['SOUTH','NORTH'],roof:'YELLOW_GREEN_EDGE_ROLLED_HARD_GABLE',fit:{...P,stepCountPerEnd:2,stepRise:.15,platformHeightNotSurveyed:true,closedDoorPose:'OFFICIAL_PHOTO_CLOSED_NOT_CURRENT_ACCESS',interior:'CLOSED_UNRECONSTRUCTED',rearDoorPosition:'OFF_AXIS_TEXT_SUPPORTED_EXACT_POSITION_FITTED',ornament:'SIMPLIFIED_NOT_ORIGINAL_PATTERN'},notBuilt:['Buddhist interior, shrine, furniture and concealed historic connection','Full adjoining court, Juting, Xiefang and vegetation','Plaque text, original lattice and exact Suzhou-style painting'],newMapItems:0,newRooms:0,newTeleportTargets:0};
 f.userData.structure=meta;kit.root.add(f);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);return{frame:f,meta,colliders,walkables,materials};
}
