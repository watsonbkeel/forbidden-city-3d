import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='yunguang-main-shell',OBJECT='FC-9B2BEC50D8',done=new WeakSet();
export const YUNGUANG_FIT=Object.freeze({x:0,z:0,rotationY:0,floorY:.3,upperFloorY:3.5,eaveY:7,roofRise:1.45,plan:'L_NORTH_TO_SOUTH_THEN_EAST_MODEL_NEGATIVE_X'});
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const identity=o=>o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1))&&o.matrix.equals(new T.Matrix4())&&o.matrixWorld.equals(new T.Matrix4());
function validate(kit,zone){const root=kit?.root;let exists=false;root?.traverse(o=>{if(o.userData.structure?.sourceObjectId===OBJECT||o.userData.yunguangMainShell)exists=true});
 if(!root||root.name!=='ningshou'||root.parent||!identity(root)||!mutable(root.children)||['colliders','walkables','owned'].some(k=>!mutable(kit[k]))||done.has(kit)||exists||JSON.stringify(zone.bounds)!=='{"x0":-366.5,"x1":-222.45,"z0":111.5,"z1":526.5}')throw Error('Exact mutable untransformed Yunguang host required, once only');
 for(const[name,x,z,w,d,ph]of[['符望阁',-259.1,484.6,23.1,22.5,1],['倦勤斋',-252.6,513.6,31.5,8.8,.5]])if(zone.items?.filter(i=>i.kind==='hall'&&i.name===name&&i.x===x&&i.z===z&&i.w===w&&i.d===d&&i.ph===ph).length!==1)throw Error('Retained Fuwang/Juanqin anchor changed');
 const reserve=new T.Box3(new T.Vector3(-249,.001,448),new T.Vector3(-235.2,10,471));if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve))||kit.walkables.some(w=>{const b=w.box??(w.type==='ramp'?new T.Box3(new T.Vector3(w.minX,Math.min(w.y0,w.y1),w.minZ),new T.Vector3(w.maxX,Math.max(w.y0,w.y1),w.maxZ)):null);return b?.intersectsBox(reserve)}))throw Error('Yunguang fitted reserve occupied');
 root.updateWorldMatrix(true,true);let occupied=false;root.traverse(o=>{if(o.isMesh&&new T.Box3().setFromObject(o,true).intersectsBox(reserve))occupied=true});if(occupied)throw Error('Yunguang visible reserve occupied');
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
export function buildYunguangMainShell(kit,zone){
 if(zone?.id!=='ningshou')return false;validate(kit,zone);
 const P=YUNGUANG_FIT,f=new T.Group();f.name='云光楼';f.position.set(P.x,0,P.z);f.rotation.y=P.rotationY;f.userData.yunguangMainShell=true;
 const geometries=[],materials=[],colliders=[],walkables=[];
 const own=()=>{const g=new T.BufferGeometry();geometries.push(g);return g};
 const mat=(name,color,borrow)=>{const m=new T.MeshStandardMaterial();materials.push(m);if(borrow)m.copy(kit.lib.material(borrow));m.name='r165_yunguang_'+name;m.color.setHex(color);m.roughness=.86;m.side=T.FrontSide;return m};
 const mesh=(role,g,m,x=0,y=0,z=0,kind=null,walk=false)=>{const o=new T.Mesh(g,m);o.name=ID+'/'+role;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.userData={yunguangMainShell:true,role,contactKind:kind,topWalk:walk,fitNotSurvey:true};f.add(o);return o};
 const box=(role,m,w,h,d,x,y,z,kind=null,walk=false)=>{const g=own(),p=boxPayload(w,h,d);g.setIndex(new T.BufferAttribute(p.index,1));g.setAttribute('position',new T.BufferAttribute(p.position,3));g.setAttribute('normal',new T.BufferAttribute(p.normal,3));g.setAttribute('uv',new T.BufferAttribute(p.uv,2));return mesh(role,g,m,x,y,z,kind,walk)};
 const surface=(role,m,nx,nz,point)=>{const g=own(),v=[],uv=[],ix=[],count=(nx+1)*(nz+1);for(const low of[false,true])for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const a=point(i/nx,j/nz);v.push(a[0],a[1]-(low?.12:0),a[2]);uv.push(a[0],a[2]);}const n=(i,j)=>i*(nz+1)+j,q=(a,b,c,d)=>ix.push(a,b,c,a,c,d);
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=n(i,j),b=n(i,j+1),c=n(i+1,j+1),d=n(i+1,j);q(a,b,c,d);q(a+count,d+count,c+count,b+count)}
  for(let i=0;i<nx;i++){const a=n(i,0),b=n(i+1,0),c=n(i,nz),d=n(i+1,nz);q(a,b,b+count,a+count);q(d,c,c+count,d+count)}for(let j=0;j<nz;j++){const a=n(0,j),b=n(0,j+1),c=n(nx,j),d=n(nx,j+1);q(b,a,a+count,b+count);q(c,d,d+count,c+count)}
  g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(role,g,m,0,0,0,'triangle')};

 try{
  const red=mat('red_timber',0x7c3d31),window=mat('dark_window',0x354b42),dark=window,plaster=mat('pale_plaster',0xb4ab97),yellow=mat('roof_tile_yellow',0xb8a06d,'roof_tile'),green=mat('roof_tile_green',0x557057,'roof_tile'),stone=kit.lib.material('stone_slab');
  // L mass: north/south wing by the west palace wall, its southern end turns east (-X).
  // Two ground galleries are genuinely walkable; upper galleries have no invented stairs.
  box('north-south-platform',stone,5.6,.3,18,-239.6,.15,459.2,'box',true);
  box('east-wing-platform',stone,7.2,.3,5.2,-244,.15,452.7,'box',true);
  for(let i=0;i<2;i++){const h=.15*(i+1);box('north-step-'+i,stone,2.6,h,.4,-241.05,h/2,469-(i+.5)*.4,'box',true);box('east-step-'+i,stone,.4,h,2.2,-248.4+(i+.5)*.4,h/2,454.15,'box',true)}
  // Closed interior solids are a visibility boundary, not a claim about visitor admission.
  box('north-south-closed-core',plaster,3.2,6.7,17.4,-238.8,3.65,459.2,'triangle');
  box('east-wing-closed-core',plaster,6.8,6.7,3,-244,3.65,452,'triangle');
  box('north-south-upper-gallery',red,2,.16,17.8,-241.4,3.42,459.2,'triangle');
  box('east-upper-gallery',red,7.2,.16,1.8,-244,3.42,454.4,'triangle');
  box('north-south-gallery-ceiling',dark,2,.12,17.8,-241.4,6.94,459.2,'triangle');
  box('east-gallery-ceiling',dark,7.2,.12,1.8,-244,6.94,454.4,'triangle');
  // Exterior window/door fields are deliberately plain. Exact bay count is not sourced.
  for(const z of[452.8,456.1,459.4,462.7,466])for(const y of[1.8,5.15]){
   box('long-front-window-'+z+'-'+y,window,.05,2.15,2.25,-240.43,y,z);
   for(const dz of[-1.17,0,1.17])box('long-window-post-'+z+'-'+y+'-'+dz,red,.11,2.3,.08,-240.49,y,z+dz);
   for(const dy of[-1.15,1.15])box('long-window-cross-'+z+'-'+y+'-'+dy,red,.11,.08,2.4,-240.49,y+dy,z);
  }
  for(const x of[-246.3,-243.9,-241.5])for(const y of[1.8,5.15]){
   box('east-front-window-'+x+'-'+y,window,1.7,2.15,.05,x,y,453.53);
   for(const dx of[-.9,0,.9])box('east-window-post-'+x+'-'+y+'-'+dx,red,.08,2.3,.1,x+dx,y,453.59);
   for(const dy of[-1.15,1.15])box('east-window-cross-'+x+'-'+y+'-'+dy,red,1.88,.08,.1,x,y+dy,453.59);
  }
  for(const z of[451,456,459,462,465,467.9])box('long-gallery-post-'+z,red,.2,6.7,.2,-242.23,3.65,z,'triangle');
  for(const x of[-247.35,-244.8])box('east-gallery-post-'+x,red,.2,6.7,.2,x,3.65,455.13,'triangle');
  box('long-upper-rail',red,.14,.78,13.5,-242.23,3.99,461.1,'triangle');
  box('east-upper-rail',red,5,.78,.14,-244.8,3.99,455.13,'triangle');
  for(const z of[454.8,456.8,458.8,460.8,462.8,464.8,466.8])box('long-rail-opening-fit-'+z,window,.02,.46,1.65,-242.31,4.02,z);
  for(const x of[-246.3,-244.3])box('east-rail-opening-fit-'+x,window,1.65,.46,.02,x,4.02,455.21);
  box('long-upper-beam',green,.25,.24,18,-242.23,6.86,459.2);
  box('east-upper-beam',green,7.2,.24,.25,-244,6.86,455.13);
  // North wing: explicit upper gable and lower hip skirt, pitched roof rather than a rolled form.
  const hx=9.4,hz=3.1,gx=7.6,cap=.52,C=z=>P.roofRise*(1-Math.abs(z)/hz),Y=(x,z)=>P.eaveY+(Math.abs(x)<=gx?C(z):Math.min(C(z),cap)*(hx-Math.abs(x))/(hx-gx));
  const northPoint=(a,b,y)=>[-239.5-b,y,459.6+a];
  surface('north-green-roof',green,8,12,(u,v)=>{const a=(2*u-1)*gx,b=(2*v-1)*hz;return northPoint(a,b,7+C(b))});
  for(const side of[-1,1]){
   surface('north-lower-hip-roof-'+side,green,6,12,(u,v)=>{const a=side*(gx+(hx-gx)*(side>0?u:1-u)),b=(2*v-1)*hz;return northPoint(a,b,7+Math.min(C(b),cap)*(hx-Math.abs(a))/(hx-gx))});
   const stop=hz*(1-cap/P.roofRise),g=own(),contour=[new T.Vector2(-stop,7+cap-.12),new T.Vector2(0,8.45-.12),new T.Vector2(stop,7+cap-.12)],v=[],ix=[];
   for(const da of[-.06,.06])for(const p of contour)v.push(...northPoint(side*gx+da,p.x,p.y));
   ix.push(0,2,1,3,4,5);for(let j=0;j<3;j++){const k=(j+1)%3;ix.push(j,k,k+3,j,k+3,j+3)}g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();mesh('north-upper-gable-'+side,g,red,0,0,0,'triangle');
   surface('north-yellow-eave-roof-'+side,yellow,16,1,(u,v)=>{const a=(2*u-1)*hx,b=side*(hz-.16+.16*(side>0?v:1-v));return northPoint(a,b,Y(a,b)+.025)});
  }
  // East branch: two pitched planes with explicit straight hard-gable ends.
  const ex=4.7,ez=2.8,E=z=>7+1.45*(1-Math.abs(z)/ez);
  surface('east-green-hard-gable-roof',green,8,12,(u,v)=>{const x=(2*u-1)*ex,z=(2*v-1)*ez;return[-243+x,E(z),451.8+z]});
  for(const side of[-1,1]){
   surface('east-yellow-eave-roof-'+side,yellow,8,1,(u,v)=>{const z=side*(ez-.16+.16*(side>0?v:1-v));return[-243+(2*u-1)*ex,E(z)+.025,451.8+z]});
   const g=own(),v=[],ix=[];for(const dx of[-.06,.06])for(const[z,y]of[[-ez,6.88],[0,8.33],[ez,6.88]])v.push(-243+side*ex+dx,y,451.8+z);ix.push(0,2,1,3,4,5);for(let j=0;j<3;j++){const k=(j+1)%3;ix.push(j,k,k+3,j,k+3,j+3)}g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();mesh('east-hard-gable-'+side,g,red,0,0,0,'triangle');
  }
  f.updateWorldMatrix(true,true);f.traverse(o=>{if(!o.isMesh||!o.userData.contactKind)return;const b=new T.Box3().setFromObject(o,true);if(o.userData.contactKind==='triangle'){const g=own();try{g.copy(o.geometry);g.applyMatrix4(o.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+o.name);b.copy(shape.box);b.triangleSupport=shape}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}}b.yunguangMainShell=true;b.yunguangMesh=o.name;colliders.push(b);if(o.userData.topWalk){const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false,yunguangMainShell:true,yunguangMesh:o.name})}});
  if(!new T.Box3(new T.Vector3(-249,-.00001,448),new T.Vector3(-235.2,10,471)).containsBox(new T.Box3().setFromObject(f,true)))throw Error('Yunguang escaped fitted reserve');
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const meta={id:ID,sourceObjectId:OBJECT,name:'云光楼',scope:'L_PLAN_TWO_STOREY_EXTERIOR_AND_GROUND_GALLERIES_ONLY',storeys:2,wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,source:'https://www.dpm.org.cn/explore/building/236462.html',photo:'https://www.dpm.org.cn/Uploads/Picture/dc/1566.jpg',photoSHA256:'52e4611152d9dd6095ae1cf130f3a365d960a495531822d240b4c88352444ea0',roof:{north:'EXPLICIT_UPPER_HIP_GABLE',east:'HARD_GABLE',junction:'SIMPLIFIED_FITTED_OVERLAP_NOT_SURVEY'},fit:{...P,interior:'CLOSED_UNRECONSTRUCTED',dimensions:'MODEL_FIT_NOT_SURVEY',hiddenWalls:'SIMPLIFIED_NOT_PHOTO_RECONSTRUCTION',windowBayCounts:'FITTED_NOT_DOCUMENTED',galleryRails:'SIMPLIFIED_WITH_OPEN_ENDS_FOR_HIGH_START_EXIT',colors:'PHOTO_GUIDED_APPROXIMATION'},notBuilt:['Northern upper stone bridge and rock hill','Two-level connection to Cuishang and independent access to upper galleries','Buddhist interior, furniture, plaque text and exact decoration','Full hidden elevations and contemporary visitor admission'],newMapItems:0,newRooms:0,newTeleportTargets:0};
 f.userData.structure=meta;kit.root.add(f);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);return{frame:f,meta,colliders,walkables,materials};
}
