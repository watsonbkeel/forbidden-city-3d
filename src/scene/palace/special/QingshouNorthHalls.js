import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='qingshou-north-main-halls',done=new WeakSet();
export const QINGSHOU_NORTH_FIT=Object.freeze({x:-334.8,thirdZ:455.5,fourthZ:470.8,width:17,depth:9.8,floorY:.5,eaveY:6,roofRise:2.4,clearDoor:2.8});
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const identity=o=>o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1))&&o.matrix.equals(new T.Matrix4())&&o.matrixWorld.equals(new T.Matrix4());
function validate(kit,zone){
 const root=kit?.root;
 if(!root||root.name!=='ningshou'||root.parent||!identity(root)||!mutable(root.children)||['colliders','walkables','owned'].some(k=>!mutable(kit[k]))||done.has(kit)||root.children.some(f=>f.userData.qingshouNorthHalls)||JSON.stringify(zone.bounds)!=='{"x0":-366.5,"x1":-222.45,"z0":111.5,"z1":526.5}')throw Error('Exact mutable untransformed Qingshou north host required, once only');
 for(const [name,x,z,w,d,ph]of[['庆寿堂',-334.8,439.6,17,9.8,.5],['景福宫',-338.5,492.2,19.7,19.7,.8]])if(zone.items?.filter(i=>i.kind==='hall'&&i.name===name&&i.x===x&&i.z===z&&i.w===w&&i.d===d&&i.ph===ph).length!==1)throw Error('Retained Qingshou/Jingfu layout anchor changed');
 const reserve=new T.Box3(new T.Vector3(-344.4,.001,449),new T.Vector3(-325.2,9,477.3));
 if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve))||kit.walkables.some(w=>w.box?.intersectsBox(reserve)))throw Error('Qingshou north hall fitted reserve occupied');
 root.updateWorldMatrix(true,true);let occupied=false;root.traverse(o=>{if(o.isMesh&&new T.Box3().setFromObject(o,true).intersectsBox(reserve))occupied=true});if(occupied)throw Error('Qingshou north hall visible reserve occupied');
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
/** Two missing court main-hall shells only. Official form and sequence;
 * dimensions, open door pose and placement are fits, not a survey or access claim. */
export function buildQingshouNorthHalls(kit,zone){
 if(zone?.id!=='ningshou')return false;validate(kit,zone);
 const frame=new T.Group();frame.name='庆寿堂北部正殿';frame.userData.qingshouNorthHalls=true;
 const geometries=[],materials=[],colliders=[],walkables=[],halls=[],P=QINGSHOU_NORTH_FIT;
 const own=()=>{const g=new T.BufferGeometry();geometries.push(g);return g};
 const mat=(name,color,borrow)=>{const m=new T.MeshStandardMaterial();materials.push(m);if(borrow)m.copy(kit.lib.material(borrow));m.name='r164_qingshou_north_'+name;m.color.setHex(color);m.roughness=.88;m.side=T.FrontSide;return m};
 const mesh=(f,role,g,m,x=0,y=0,z=0,kind=null,walk=false)=>{const o=new T.Mesh(g,m);o.name=f.name+'/'+role;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.userData={qingshouNorthHalls:true,role,contactKind:kind,topWalk:walk,fitNotSurvey:true};f.add(o);return o};
 const box=(f,role,m,w,h,d,x,y,z,kind=null,walk=false)=>{const g=own(),p=boxPayload(w,h,d);g.setIndex(new T.BufferAttribute(p.index,1));g.setAttribute('position',new T.BufferAttribute(p.position,3));g.setAttribute('normal',new T.BufferAttribute(p.normal,3));g.setAttribute('uv',new T.BufferAttribute(p.uv,2));return mesh(f,role,g,m,x,y,z,kind,walk)};
 // A closed extrusion of a sampled rounded no-ridge section. The main roof
 // is a thin closed shell; the side gables close the volume below its ends.
 const curved=(f,role,m,x0,x1,{shell=true,dy=0,solid=false}={})=>{const g=own(),section=[],n=24,half=5.3;
  for(let j=0;j<=n;j++){const z=-half+2*half*j/n,y=P.eaveY+P.roofRise*Math.pow(Math.max(0,Math.cos(z/half*Math.PI/2)),.72)+dy;section.push(new T.Vector2(z,y))}
  if(shell){for(let j=n;j>=0;j--)section.push(new T.Vector2(section[j].x,section[j].y-.12))}else{section.push(new T.Vector2(half,P.eaveY-.06),new T.Vector2(-half,P.eaveY-.06))}
  const faces=T.ShapeUtils.triangulateShape(section,[]),v=[],ix=[],uv=[];for(const x of[x0,x1])for(const p of section){v.push(x,p.y,p.x);uv.push(p.x/1.1,p.y/1.1)}const count=section.length;
  for(const[a,b,c]of faces){ix.push(a,c,b,a+count,b+count,c+count)}
  for(let i=0;i<count;i++){const j=(i+1)%count;ix.push(i,j,i+count,j,j+count,i+count)}
  g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(f,role,g,m,0,0,0,solid?'triangle':null)};
 try{
  const brick=mat('grey_brick',0x85867e),wood=mat('red_timber',0x782d24),paper=mat('window_field',0xb4b6a3),green=mat('roof_tile_green',0x3d7254,'roof_tile'),yellow=mat('roof_tile_yellow',0xc39a44,'roof_tile'),stone=kit.lib.material('stone_slab');
  for(const [ordinal,name,z,tile,trim]of[[3,'福履堂',P.thirdZ,green,yellow],[4,'天庆堂',P.fourthZ,yellow,green]]){
   const f=new T.Group();f.name=name;f.position.set(P.x,0,z);f.userData.qingshouNorthHalls=true;frame.add(f);
   box(f,'stone-platform',stone,18,.5,10.8,0,.25,0,'box',true);
   const wallZ=3.65;
   for(const side of[-1,1]){
    box(f,'side-wall-'+side,brick,.22,5.5,9.8,side*8.39,3.25,0,'triangle');
    curved(f,'curved-gable-'+side,brick,side<0?-8.5:8.28,side<0?-8.28:8.5,{shell:false,solid:true});
    // Six gallery posts establish five bays; the central 2.8m doorway is clear.
    for(let j=0;j<=5;j++){const x=-8.35+j*16.7/5;box(f,`gallery-post-${side}-${j}`,wood,.18,5.5,.18,x,3.25,side*4.8,'box')}
    box(f,'gallery-beam-'+side,green,17,.24,.24,0,5.85,side*4.8,'box');
    for(let j=0;j<5;j++){
     const x=(j-2)*3.34;if(j===2)continue;
     box(f,`sill-${side}-${j}`,brick,3.34,1,.22,x,1,side*wallZ,'box');
     box(f,`window-${side}-${j}`,paper,3.2,2.8,.12,x,2.9,side*wallZ,'box');
     for(const dx of[-1.62,0,1.62])box(f,`window-frame-${side}-${j}-${dx}`,wood,.08,2.8,.08,x+dx,2.9,side*(wallZ+.1));
     for(const y of[1.5,2.45,3.4,4.3])box(f,`window-cross-${side}-${j}-${y}`,wood,3.3,.07,.08,x,y,side*(wallZ+.1));
    }
    for(const x of[-1.48,1.48])box(f,`door-jamb-${side}-${x}`,wood,.16,3.8,.24,x,2.4,side*wallZ,'box');
    box(f,'upper-facade-'+side,brick,17,1.7,.22,0,5.15,side*wallZ,'box');
    box(f,'door-lintel-'+side,wood,3.12,.18,.25,0,4.39,side*wallZ,'box');
    for(let i=0;i<4;i++){const h=.125*(i+1),zz=side*(6.4-(i+.5)*.25);box(f,`stone-step-${side}-${i}`,stone,2.8,h,.25,0,h/2,zz,'box',true)}
   }
   curved(f,'rolled-hard-gable-roof',tile,-8.8,8.8,{solid:true});
   for(const side of[-1,1]){curved(f,'contrasting-curved-verge-'+side,trim,side<0?-8.81:8.6,side<0?-8.6:8.81,{dy:.035});box(f,'contrasting-eave-'+side,trim,17.62,.15,.16,0,6.02,side*5.27)}
   halls.push({name,ordinal,x:P.x,z,bays:5,depthBays:1,frontRearGallery:true,clearDoor:2.8,floorY:.5,roof:'FITTED_ROLLED_HARD_GABLE',tile:ordinal===3?'GREEN_WITH_YELLOW_EDGE':'YELLOW_WITH_GREEN_EDGE'});
  }
  frame.updateWorldMatrix(true,true);frame.traverse(o=>{if(!o.isMesh||!o.userData.contactKind)return;const b=new T.Box3().setFromObject(o,true);if(o.userData.contactKind==='triangle'){const g=own();try{g.copy(o.geometry);g.applyMatrix4(o.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+o.name);b.copy(shape.box);b.triangleSupport=shape}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}}b.qingshouNorthHalls=true;b.qingshouNorthMesh=o.name;colliders.push(b);if(o.userData.topWalk){const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false,qingshouNorthHalls:true,qingshouNorthMesh:o.name})}});
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const meta={id:ID,name:'庆寿堂北部正殿',scope:'THIRD_AND_FOURTH_COURT_MAIN_HALL_SHELLS_ONLY',ledgerIdentityAssignment:'GROUP_SUPPLEMENT_NO_NEW_397_ID',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,sources:['https://www.dpm.org.cn/explore/building/236539.html','https://arch.seu.edu.cn/2017/0905/c9122a214005/page.htm'],halls,fit:{...P,doorPose:'OPEN_GAME_THROUGH_ROUTE_NOT_VERIFIED_MUSEUM_ACCESS',interior:'UNFURNISHED_GAME_SHELL_NOT_ASSERTED_EMPTY_INVENTORY',ornament:'SIMPLIFIED_FIELDS_NOT_ORIGINAL_PAINTING'},notBuilt:['Side halls, connecting galleries, courtyard boundaries, well and northern glazed gate','Main hanging-flower entrance and complete four-court layout','Interior inventory, historic door leaves, plaques and detailed decoration'],newMapItems:0,newRooms:0,newTeleportTargets:0};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);return{frame,meta,colliders,walkables,materials};
}
