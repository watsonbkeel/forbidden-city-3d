import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='xuhui-gallery',OBJECT='FC-90734D8F6D',done=new WeakSet();
export const XUHUI_FIT=Object.freeze({coreX:-237.1,coreZ:391,coreWidth:3.8,coreLength:12,floorY:2,eaveY:5.9,roofRise:1.4,eastPorchMinX:-241.1,eastPorchMaxX:-239,southPorchMinZ:383,southPorchMaxZ:385,stairX:-239.7,stairWidth:2.2,lowMinZ:377.98,lowMaxZ:379.8,lowY:.5,steps:10,stepRise:.15,stepRun:.32,mainRoofMinX:-241.6,mainRoofMaxX:-234.7,mainRoofMinZ:382.5,mainRoofMaxZ:397.7,overlapZ:.12,dimensionStatus:'GAME_FIT_NOT_SURVEY'});
const mutable=a=>Array.isArray(a)&&Object.getPrototypeOf(a)===Array.prototype&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable&&Array.from({length:a.length},(_,i)=>Object.getOwnPropertyDescriptor(a,i)?.writable===true).every(Boolean);
const identity=o=>o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1))&&o.matrix.equals(new T.Matrix4())&&o.matrixWorld.equals(new T.Matrix4());
const reserve=new T.Box3(new T.Vector3(-241.6,.001,377.98),new T.Vector3(-234.4,9,398));
const near=(a,b)=>Math.abs(a-b)<1e-8;
const finiteBox=b=>b?.isBox3&&['x','y','z'].every(k=>Number.isFinite(b.min[k])&&Number.isFinite(b.max[k])&&b.min[k]<=b.max[k]);
const sameBox=(a,min,max)=>a instanceof T.Box3&&a.min.toArray().every((v,i)=>near(v,min[i]))&&a.max.toArray().every((v,i)=>near(v,max[i]));
function validate(kit,zone){const root=kit?.root;let exists=false;root?.traverse(o=>{if(o.userData.structure?.sourceObjectId===OBJECT||o.userData.xuhuiGallery)exists=true});
 if(!root||root.name!=='ningshou'||root.parent||!identity(root)||!mutable(root.children)||['colliders','walkables','owned'].some(k=>!mutable(kit[k]))||done.has(kit)||exists||JSON.stringify(zone.bounds)!=='{"x0":-366.5,"x1":-222.45,"z0":111.5,"z1":526.5}')throw Error('Exact mutable untransformed Xuhui host required, once only');
 if(typeof kit.lib?.material!=='function'||kit.owned.some(m=>!m?.isMaterial))throw Error('Malformed Xuhui resources');
 if(zone.items?.filter(i=>i.kind==='hall'&&i.name==='禊赏亭'&&i.x===-240.7&&i.z===371.4&&i.w===6.7&&i.d===12.4&&i.ph===.5&&i.colH===4.5).length!==1)throw Error('Retained Xishang source anchor changed');
 root.updateWorldMatrix(true,true);const platformNames=new Set();
 root.traverse(o=>{if(!o.isMesh||!new T.Box3().setFromObject(o,true).intersectsBox(reserve))return;
  const base=o.name==='xishang-platform-base',pave=o.name==='xishang-platform-paving',h=base?.5:.07,y=base?.25:.465,p=boxPayload(13.4,h,7.7),expected=new T.Matrix4().compose(new T.Vector3(-240.7,y,371.4),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),Math.PI/2),new T.Vector3(1,1,1)),attrs=o.geometry.attributes;
  if(!(base||pave)||o.parent?.name!=='禊赏亭·官方形制局部拟合'||o.userData.identity!=='place-ningshou-fadd286b97'||o.userData.role!==(base?'platform-base':'platform-paving')||!o.matrixWorld.elements.every((v,i)=>near(v,expected.elements[i]))||!['position','normal','uv'].every(k=>attrs[k]?.array.length===p[k].length&&attrs[k].array.every((v,i)=>v===p[k][i]))||o.geometry.index?.array.length!==p.index.length||!o.geometry.index.array.every((v,i)=>v===p.index[i]))throw Error('Xuhui visible reserve occupied or retained joint changed');if(platformNames.has(o.name))throw Error('Duplicate retained Xishang junction role');platformNames.add(o.name);
 });
 if(platformNames.size!==2||!platformNames.has('xishang-platform-base')||!platformNames.has('xishang-platform-paving'))throw Error('Exact one retained Xishang base and one paving required');
 if(kit.colliders.some(c=>!finiteBox(c?.box??c)||(c.box??c).intersectsBox(reserve)))throw Error('Xuhui contact reserve occupied or malformed');
 let joints=0;for(const w of kit.walkables){let b;if(w?.type==='box'&&finiteBox(w.box))b=w.box;else if(w?.type==='ramp'&&['minX','maxX','minZ','maxZ','y0','y1'].every(k=>Number.isFinite(w[k]))&&w.minX<w.maxX&&w.minZ<w.maxZ)b=new T.Box3(new T.Vector3(w.minX,Math.min(w.y0,w.y1),w.minZ),new T.Vector3(w.maxX,Math.max(w.y0,w.y1),w.maxZ));else throw Error('Malformed Xuhui host walkable');if(!b.intersectsBox(reserve))continue;if(w.type==='box'&&sameBox(b,[-244.55,.5,364.7],[-236.85,.5,378.1])&&w.rescue===false&&Object.keys(w).sort().join(',')==='box,rescue,type')joints++;else throw Error('Xuhui walkable reserve occupied');}if(joints!==1)throw Error('Exact retained Xishang top walkable required');
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
export function buildXuhuiGallery(kit,zone){
 if(zone?.id!=='ningshou')return false;validate(kit,zone);
 const P=XUHUI_FIT,f=new T.Group();f.name='旭辉庭·文字平面引导有限壳体与南廊';f.userData.xuhuiGallery=true;
 const geometries=[],materials=[],colliders=[],walkables=[];
 const own=()=>{const g=new T.BufferGeometry();geometries.push(g);return g};
 const mat=(name,color,borrow)=>{const m=new T.MeshStandardMaterial();materials.push(m);if(borrow)m.copy(kit.lib.material(borrow));m.name='r165_xuhui_'+name;m.color.setHex(color);m.roughness=.91;m.side=T.FrontSide;return m};
 const mesh=(role,g,m,x=0,y=0,z=0,kind='box',walk=false)=>{const o=new T.Mesh(g,m);o.name=ID+'/'+role;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.userData={xuhuiGallery:true,role,contactKind:kind,topWalk:walk,fitNotSurvey:true};f.add(o);return o};
 const box=(role,m,w,h,d,x,y,z,kind='box',walk=false)=>{const g=own(),p=boxPayload(w,h,d);g.setIndex(new T.BufferAttribute(p.index,1));g.setAttribute('position',new T.BufferAttribute(p.position,3));g.setAttribute('normal',new T.BufferAttribute(p.normal,3));g.setAttribute('uv',new T.BufferAttribute(p.uv,2));return mesh(role,g,m,x,y,z,kind,walk)};
 const surface=(role,m,nx,nz,point)=>{const g=own(),v=[],uv=[],ix=[],count=(nx+1)*(nz+1);for(const low of[false,true])for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const a=point(i/nx,j/nz);v.push(a[0],a[1]-(low?.12:0),a[2]);uv.push(a[0],a[2]);}const n=(i,j)=>i*(nz+1)+j,q=(a,b,c,d)=>ix.push(a,b,c,a,c,d);
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=n(i,j),b=n(i,j+1),c=n(i+1,j+1),d=n(i+1,j);q(a,b,c,d);q(a+count,d+count,c+count,b+count)}
  for(let i=0;i<nx;i++){const a=n(i,0),b=n(i+1,0),c=n(i,nz),d=n(i+1,nz);q(a,b,b+count,a+count);q(d,c,c+count,d+count)}for(let j=0;j<nz;j++){const a=n(0,j),b=n(0,j+1),c=n(nx,j),d=n(nx,j+1);q(b,a,a+count,b+count);q(c,d,d+count,c+count)}
  g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(role,g,m,0,0,0,'triangle')};
 const rock=(role,m,layers,cx=0,cz=0,phase=0,squareTop=false)=>{const g=own(),v=[],uv=[],ix=[],N=12;
  for(const [level,[y,rx,rz]]of layers.entries())for(let n=0;n<N;n++){const a=2*Math.PI*n/N,top=squareTop&&level===layers.length-1,r=top?1:1+.17*Math.sin(3*a+phase+level*.7)+.08*Math.cos(5*a-phase-level*.4),q=top?Math.max(Math.abs(Math.cos(a)),Math.abs(Math.sin(a))):1;v.push(cx+rx*r*Math.cos(a)/q+.07*rx*Math.sin(level*1.7+phase),y+(level===layers.length-1?.07*y*Math.sin(2*a+phase):0),cz+rz*r*Math.sin(a)/q+.08*rz*Math.cos(level*1.4+phase));uv.push(n/N,level/(layers.length-1));}
  const quad=(a,b,c,d)=>ix.push(a,b,c,a,c,d);for(let k=0;k<layers.length-1;k++)for(let n=0;n<N;n++){const next=(n+1)%N,a=k*N+n,b=k*N+next;quad(a,a+N,b+N,b)}
  const bottom=v.length/3;v.push(cx,layers[0][0],cz);uv.push(.5,.5);const top=v.length/3;v.push(cx,layers.at(-1)[0],cz);uv.push(.5,.5);for(let n=0;n<N;n++){const next=(n+1)%N;ix.push(bottom,n,next,top,(layers.length-1)*N+next,(layers.length-1)*N+n)}
  g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(role,g,m,0,0,0,'triangle');
 };
 try{
  const timber=mat('green_posts',0x356450),red=mat('red_rail_frames',0x944b3d),paint=mat('painted_frieze',0x728479),wall=mat('ochre_red_walls',0x874d36),dark=mat('closed_windows',0x263c34),rocks=mat('grey_white_rock',0xaaa99b),yellow=mat('roof_tile_yellow',0xc09a44,'roof_tile'),green=mat('roof_tile_green',0x3e7053,'roof_tile'),stone=kit.lib.material('stone_slab');rocks.flatShading=true;
  // All dimensions and the simple closed interior are reversible GAME_FIT_NOT_SURVEY.
  box('closed-core',wall,3.8,3.9,12,-237.1,3.95,391);
  box('core-stone-support',rocks,3.8,2,12,-237.1,1,391);
  box('east-porch',stone,2.1,2,14,-240.05,1,390,'box',true);
  box('south-porch',stone,3.8,2,2,-237.1,1,384,'box',true);
  box('low-junction-landing',stone,2.2,.5,1.82,-239.7,.25,378.89,'box',true);
  for(let i=0;i<P.steps;i++){const h=.5+(i+1)*.15;box('climbing-step-'+i,stone,2.2,h,.32,-239.7,h/2,379.8+(i+.5)*.32,'box',true)}
  for(const z of[387,391,395]){const central=z===391;box(central?'central-closed-door':'side-window-sill-'+z,central?red:stone,.07,central?3.4:1.1,3.65,-239.04,central?3.7:2.55,z);if(!central)box('side-closed-window-'+z,dark,.08,2.25,3.65,-239.08,4.225,z);for(const zz of[-1.6,-.8,0,.8,1.6]){box('facade-grid-upright-'+z+'-'+zz,timber,.06,2.2,.035,-239.14,4.2,z+zz);for(const yy of[3.2,3.7,4.7,5.25])box('facade-step-grid-'+z+'-'+zz+'-'+yy,timber,.06,.04,.55,-239.16,yy,z+zz)}}
  // Photographed local cues: green posts/handrail, red geometric frames, exposed rafters, grey-white stone.
  const rail=(prefix,x0,z0,x1,z1,y0,y1)=>{const length=Math.hypot(x1-x0,z1-z0),rise=y1-y0,cx=(x0+x1)/2,cz=(z0+z1)/2,cy=(y0+y1)/2;
   for(const [role,dy,h,m]of[['handrail',.97,.1,timber],['lower-rail',.25,.08,red],['frame',.72,.07,red]]){const o=box(prefix+'-'+role,m,.1,h,Math.hypot(length,rise),cx,cy+dy,cz);o.rotation.y=Math.atan2(x1-x0,z1-z0);o.rotation.x=-Math.atan2(rise,length);if(rise!==0)o.userData.contactKind='triangle'}
   const n=Math.ceil(length/.65);for(let i=0;i<=n;i++){const t=i/n;box(prefix+'-infill-'+i,red,.075,.72,.075,x0+(x1-x0)*t,y0+rise*t+.56,z0+(z1-z0)*t)}
  };
  for(const x of[-240.9,-238.5]){rail('stair-low-rail-'+x,x,379.5,x,380.35,.65,.65);rail('stair-rail-'+x,x,380.35,x,383,.8,2);for(const [z,y]of[[379.5,.5],[381.4,1.25],[383,2]])box('stair-post-'+x+'-'+z,timber,.18,3.2,.18,x,y+1.6,z)}
  for(const x of[-240.9,-238.5])box('low-post-'+x,timber,.18,3.2,.18,x,2.1,378.35);
  for(const z of[385.2,389,393,396.8])box('east-gallery-post-'+z,timber,.18,3.75,.18,-240.92,3.875,z);
  rail('east-gallery-outer',-240.98,385.15,-240.98,396.9,2,2);rail('east-gallery-north',-240.98,396.9,-239.05,396.9,2,2);
  rail('south-gallery-outer',-238.45,383.12,-235.25,383.12,2,2);rail('south-gallery-west',-235.28,383.1,-235.28,384.9,2,2);
  const stairY=z=>3.9+Math.max(0,Math.min(1,(z-379.8)/3.2))*1.5;
  // The retained Xishang high-contact domain is ordinary-box-only. Its low
  // roof is therefore genuinely flat; rising geometry begins beyond z380.35.
  box('low-gallery-flat-roof',yellow,3.1,.16,2.2,-239.7,4.12,379.25);
  for(const x of[-240.9,-238.5]){box('low-roof-purlin-'+x,timber,.18,.28,2.2,x,3.91,379.25);for(const z of[378.35,379.5])box('low-post-cap-'+x+'-'+z,timber,.20,.12,.20,x,3.75,z)}
  for(const x of[-241.16,-238.24])box('low-gallery-green-edge-'+x,green,.18,.18,2.2,x,4.13,379.25);
  surface('south-climbing-roof',yellow,8,12,(u,v)=>{const x=-241.25+3.1*u,z=380.35+2.85*v;return[x,stairY(z)+.25*Math.sin(Math.PI*u),z]});
  for(const side of[0,1])surface('south-climbing-green-edge-'+side,green,1,12,(u,v)=>{const x=-241.25+3.1*(side? .94+.06*u:.06*u),z=380.35+2.85*v;return[x,stairY(z)+.25*Math.sin(Math.PI*(x+241.25)/3.1)+.025,z]});
  for(let i=0;i<=15;i++){const z=378.2+i*.32;box('climbing-exposed-rafter-'+i,timber,2.95,.10,.10,-239.7,stairY(z)-.16,z)}
  for(const x of[-240.95,-238.45]){const o=box('climbing-painted-frieze-'+x,paint,.12,.18,Math.hypot(2.65,1.24),x,4.53,381.675);o.rotation.x=-Math.atan2(1.24,2.65);o.userData.contactKind='triangle'}
  for(const z of[385.2,389,393,396.8]){
   box('east-gallery-transverse-beam-'+z,paint,2.12,.2,.2,-240.05,5.65,z);
   // Short visible ordinary-box capitals connect the existing post/beam to
   // the real rolled roof (or north hip skirt), without changing its silhouette.
   const top=z===396.8?6.02:6.14;
   box('east-roof-bearing-'+z,timber,.18,top-5.73,.18,-240.92,(top+5.73)/2,z);
  }
  const hx=3.45,hz=7.6,crownZ=6.1,cx=-238.15,cz=390.1,Y=(x,z)=>5.9+1.4*Math.pow(Math.max(0,Math.cos(Math.abs(x)/hx*Math.PI/2)),1.3);
  surface('main-yellow-rolled-hip-gable-roof',yellow,24,36,(u,v)=>{const x=(2*u-1)*hx,z=(2*v-1)*crownZ;return[cx+x,Y(x,z),cz+z]});
  for(const side of[-1,1]){surface('main-green-eave-'+side,green,1,36,(u,v)=>{const x=side*(hx-.2+.2*(side>0?u:1-u)),z=(2*v-1)*hz;return[cx+x,Y(x,z)+.025,cz+z]});surface('main-green-hip-edge-'+side,green,24,1,(u,v)=>{const x=(2*u-1)*hx,z=side*(hz-.2+.2*(side>0?v:1-v));return[cx+x,5.9+Math.min(Y(x,0)-5.9,1.4*.52)*(hz-Math.abs(z))/(hz-crownZ)+.025,cz+z]})}
  // The official rolled hip-gable has a curved upper end board over a
  // lower hipped skirt, not an all-hip tent. Both are finite closed shells.
  for(const sign of[-1,1]){
   surface('main-lower-hip-skirt-'+sign,yellow,24,4,(u,v)=>{const x=(2*u-1)*hx,t=sign>0?v:1-v,z=sign*(crownZ+(hz-crownZ)*t),inner=Math.min(Y(x,0),5.9+1.4*.52);return[cx+x,inner+(5.9-inner)*t,cz+z]});
   const g=own(),p=[],ix=[],uv=[],N=24,z=cz+sign*crownZ;for(const zz of[z-.06,z+.06]){for(let j=0;j<=N;j++){const x=-hx+2*hx*j/N;p.push(cx+x,Y(x,0)-.12,zz);uv.push(j/N,1)}p.push(cx+hx,5.70,zz,cx-hx,5.70,zz);uv.push(1,0,0,0)}const count=N+3,shape=[];for(let j=0;j<count;j++)shape.push(new T.Vector2(p[j*3],p[j*3+1]));for(const[a,b,c]of T.ShapeUtils.triangulateShape(shape,[]))ix.push(a,b,c,a+count,c+count,b+count);for(let j=0;j<count;j++){const k=(j+1)%count;ix.push(j,k,j+count,k,k+count,j+count)}for(let i=0;i<ix.length;i+=3)[ix[i+1],ix[i+2]]=[ix[i+2],ix[i+1]];g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();mesh('main-curved-gable-'+sign,g,timber,0,0,0,'triangle');
  }
  // Finite closed faceted outcrops stop below the supported gallery, never make a cave or rescue floor.
  for(const[i,[x,z,rx,rz,h]]of[[-237.95,381.45,.35,.55,1.3],[-237.4,382.1,.5,.45,.9],[-237.85,382.7,.38,.42,1.6]].entries())rock('support-outcrop-'+i,rocks,[[0,rx,rz],[h*.28,rx*1.08,rz*.94],[h*.73,rx*.88,rz*1.05],[h,rx*.72,rz*.70]],x,z,i);
  f.updateWorldMatrix(true,true);f.traverse(o=>{if(!o.isMesh||!o.userData.contactKind)return;const b=new T.Box3().setFromObject(o,true);if(o.userData.contactKind==='triangle'){const g=own();try{g.copy(o.geometry);g.applyMatrix4(o.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+o.name);b.copy(shape.box);b.triangleSupport=shape}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}}b.xuhuiGallery=true;b.xuhuiMesh=o.name;colliders.push(b);if(o.userData.topWalk){const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false,xuhuiGallery:true,xuhuiMesh:o.name})}});
  if(!new T.Box3(new T.Vector3(-241.6001,-.0001,377.9799),new T.Vector3(-234.4,9,398)).containsBox(new T.Box3().setFromObject(f,true)))throw Error('Xuhui escaped fitted reserve '+JSON.stringify(new T.Box3().setFromObject(f,true)));
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const meta={id:ID,sourceObjectId:OBJECT,name:'旭辉庭',scope:'TEXT_AND_PLAN_GUIDED_THREE_BAY_SHELL_EAST_SOUTH_GALLERIES_AND_SHORT_SOUTH_CLIMBING_LINK',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,photoCoverage:'SOUTH_GALLERY_LOCAL_ONLY',unseenElevations:'SIMPLIFIED_FIT_NOT_PHOTO_RECONSTRUCTION',source:'https://www.dpm.org.cn/explore/building/236455.html',photo:'https://img.dpm.org.cn/Uploads/Picture/dc/1548%5B1024%5D.jpg',photoSHA256:'71578ebc0740aeed43175d9f1b51a679b0c715832b0ab38bb58a8882e40a5b9e',bays:3,depthBays:1,front:'EAST_MODEL_NEGATIVE_X',roof:'YELLOW_GREEN_EDGE_ROLLED_HIP_GABLE',galleries:['EAST','SOUTH'],fit:{...P,interior:'CLOSED_UNRECONSTRUCTED',roofAndFacade:'TEXT_AND_PLAN_SUPPORTED_NOT_SEEN_IN_FULL_PHOTO',photoDetails:'LOCAL_GREEN_POSTS_RED_GEOMETRIC_RAILS_EXPOSED_RAFTERS_PAINTED_FRIEZE_GREY_WHITE_ROCK',junction:'EXACT_XISHANG_NORTH_PLATFORM_WITH_0_12M_FITTED_OVERLAP'},notBuilt:['Furniture, shrine, throne, bedroom, cave and invented inscription','Full photo reconstruction, surveyed dimensions and original lattice/paint details','Current visitor access'],newMapItems:0,newRooms:0,newTeleportTargets:0};
 f.userData.structure=meta;const sizes=[kit.root.children.length,kit.colliders.length,kit.walkables.length,kit.owned.length];
 try{kit.root.add(f);Array.prototype.push.apply(kit.colliders,colliders);Array.prototype.push.apply(kit.walkables,walkables);Array.prototype.push.apply(kit.owned,materials)}catch(e){f.parent=null;kit.root.children.splice(sizes[0]);kit.colliders.splice(sizes[1]);kit.walkables.splice(sizes[2]);kit.owned.splice(sizes[3]);for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 done.add(kit);return{frame:f,meta,colliders,walkables,materials};
}
