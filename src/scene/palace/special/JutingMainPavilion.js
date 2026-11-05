import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='juting-main-pavilion',OBJECT='FC-FA6119DC49',done=new WeakSet();
export const JUTING_FIT=Object.freeze({x:-254,z:368.5,rotationY:0,floorY:.3,postSpan:4.8,eaveY:4.4,roofRise:1.65,roofHalf:3.2,front:'EAST_MODEL_NEGATIVE_X'});
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const identity=o=>o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1))&&o.matrix.equals(new T.Matrix4())&&o.matrixWorld.equals(new T.Matrix4());
function validate(kit,zone){const root=kit?.root;let exists=false;root?.traverse(o=>{if(o.userData.structure?.sourceObjectId===OBJECT||o.userData.jutingMainPavilion)exists=true});
 if(!root||root.name!=='ningshou'||root.parent||!identity(root)||!mutable(root.children)||['colliders','walkables','owned'].some(k=>!mutable(kit[k]))||done.has(kit)||exists||JSON.stringify(zone.bounds)!=='{"x0":-366.5,"x1":-222.45,"z0":111.5,"z1":526.5}')throw Error('Exact mutable untransformed Juting host required, once only');
 if(zone.items?.filter(i=>i.kind==='hall'&&i.name==='养性殿'&&i.x===-293.8&&i.z===386.3&&i.w===37.9&&i.d===23.3&&i.ph===.9).length!==1)throw Error('Retained Yangxing anchor changed');
 const reserve=new T.Box3(new T.Vector3(-258,.001,364),new T.Vector3(-250,7.4,373));if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve))||kit.walkables.some(w=>{const b=w.box??(w.type==='ramp'?new T.Box3(new T.Vector3(w.minX,Math.min(w.y0,w.y1),w.minZ),new T.Vector3(w.maxX,Math.max(w.y0,w.y1),w.maxZ)):null);return b?.intersectsBox(reserve)}))throw Error('Juting fitted reserve occupied');
 root.updateWorldMatrix(true,true);let occupied=false;root.traverse(o=>{if(o.isMesh&&new T.Box3().setFromObject(o,true).intersectsBox(reserve))occupied=true});if(occupied)throw Error('Juting visible reserve occupied');
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
export function buildJutingMainPavilion(kit,zone){
 if(zone?.id!=='ningshou')return false;validate(kit,zone);
 const P=JUTING_FIT,f=new T.Group();f.name='矩亭';f.position.set(P.x,0,P.z);f.rotation.y=P.rotationY;f.userData.jutingMainPavilion=true;
 const geometries=[],materials=[],colliders=[],walkables=[];
 const own=()=>{const g=new T.BufferGeometry();geometries.push(g);return g};
 const mat=(name,color,borrow)=>{const m=new T.MeshStandardMaterial();materials.push(m);if(borrow)m.copy(kit.lib.material(borrow));m.name='r165_juting_'+name;m.color.setHex(color);m.roughness=.86;m.side=T.FrontSide;return m};
 const mesh=(role,g,m,x=0,y=0,z=0,kind=null,walk=false)=>{const o=new T.Mesh(g,m);o.name=ID+'/'+role;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.userData={jutingMainPavilion:true,role,contactKind:kind,topWalk:walk,fitNotSurvey:true};f.add(o);return o};
 const box=(role,m,w,h,d,x,y,z,kind=null,walk=false)=>{const g=own(),p=boxPayload(w,h,d);g.setIndex(new T.BufferAttribute(p.index,1));g.setAttribute('position',new T.BufferAttribute(p.position,3));g.setAttribute('normal',new T.BufferAttribute(p.normal,3));g.setAttribute('uv',new T.BufferAttribute(p.uv,2));return mesh(role,g,m,x,y,z,kind,walk)};
 const surface=(role,m,nx,nz,point)=>{const g=own(),v=[],uv=[],ix=[],count=(nx+1)*(nz+1);for(const low of[false,true])for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const a=point(i/nx,j/nz);v.push(a[0],a[1]-(low?.12:0),a[2]);uv.push(a[0],a[2]);}const n=(i,j)=>i*(nz+1)+j,q=(a,b,c,d)=>ix.push(a,b,c,a,c,d);
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=n(i,j),b=n(i,j+1),c=n(i+1,j+1),d=n(i+1,j);q(a,b,c,d);q(a+count,d+count,c+count,b+count)}
  for(let i=0;i<nx;i++){const a=n(i,0),b=n(i+1,0),c=n(i,nz),d=n(i+1,nz);q(a,b,b+count,a+count);q(d,c,c+count,d+count)}for(let j=0;j<nz;j++){const a=n(0,j),b=n(0,j+1),c=n(nx,j),d=n(nx,j+1);q(b,a,a+count,b+count);q(c,d,d+count,c+count)}
  g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(role,g,m,0,0,0,'triangle')};

 try{
  const red=mat('red_timber',0x773b31),window=mat('dark_window',0x34423a),trim=mat('muted_paint',0x66806c),yellow=mat('roof_tile_yellow',0xb9a06d,'roof_tile'),green=mat('roof_tile_green',0x56715f,'roof_tile'),stone=kit.lib.material('stone_slab');
  box('stone-platform',stone,5.4,P.floorY,5.4,0,P.floorY/2,0,'box',true);
  // Three source-supported open directions. Exact steps and dimensions are game fits.
  for(const side of['south','north','east'])for(let i=0;i<2;i++){
   const h=.15*(i+1),dist=3.9-(i+.5)*.6;
   box('stone-step-'+side+'-'+i,stone,side==='east'?.6:3,h,side==='east'?3:.6,side==='east'?-dist:0,h/2,side==='south'?-dist:side==='north'?dist:0,'box',true);
  }
  for(const x of[-2.4,2.4])for(const z of[-2.4,2.4]){
   box('post-base-'+x+'-'+z,stone,.38,.3,.38,x,.45,z,'triangle');
   box('post-'+x+'-'+z,red,.24,3.7,.24,x,2.45,z,'triangle');
  }
  for(const z of[-2.4,2.4])box('north-south-beam-'+z,trim,5.04,.3,.28,0,4.15,z,'triangle');
  for(const x of[-2.4,2.4])box('east-west-beam-'+x,trim,.28,.3,5.04,x,4.15,0,'triangle');
  box('plain-ceiling',trim,4.8,.12,4.8,0,4.06,0,'triangle');
  // West sill-window is closed, unlike the three open approaches. No invented plaque text.
  box('west-sill',stone,.2,1,4.56,2.4,.8,0,'triangle');
  box('west-window',window,.16,2.6,4.56,2.4,2.6,0,'triangle');
  for(const z of[-2.22,-1.48,-.74,0,.74,1.48,2.22])box('west-window-upright-'+z,red,.06,2.6,.06,2.29,2.6,z);
  for(const y of[1.3,2,3.3,3.9])box('west-window-cross-'+y,red,.06,.06,4.5,2.29,y,0);
  // Four equal roof slopes converge to one apex; green edges/ridges stay visible between yellow fields.
  const R=P.roofHalf,Y=r=>P.eaveY+P.roofRise*Math.pow(Math.max(0,1-r),1.25);
  surface('green-four-corner-roof',green,24,24,(u,v)=>{const x=(2*u-1)*R,z=(2*v-1)*R;return[x,Y(Math.max(Math.abs(x),Math.abs(z))/R),z]});
  for(let face=0;face<4;face++)surface('yellow-roof-field-'+face,yellow,12,12,(u,v)=>{
   const r=.93-.86*v,x=(2*u-1)*.93*r*R,z=-r*R,a=face*Math.PI/2;
   return[x*Math.cos(a)+z*Math.sin(a),Y(r)+.025,-x*Math.sin(a)+z*Math.cos(a)];
  });
  box('simple-green-finial',green,.22,.4,.22,0,Y(0)+.15,0,'triangle');
  f.updateWorldMatrix(true,true);f.traverse(o=>{if(!o.isMesh||!o.userData.contactKind)return;const b=new T.Box3().setFromObject(o,true);if(o.userData.contactKind==='triangle'){const g=own();try{g.copy(o.geometry);g.applyMatrix4(o.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+o.name);b.copy(shape.box);b.triangleSupport=shape}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}}b.jutingMainPavilion=true;b.jutingMesh=o.name;colliders.push(b);if(o.userData.topWalk){const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false,jutingMainPavilion:true,jutingMesh:o.name})}});
  if(!new T.Box3(new T.Vector3(-258,-.00001,364),new T.Vector3(-250,7.4,373)).containsBox(new T.Box3().setFromObject(f,true)))throw Error('Juting escaped fitted reserve');
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const meta={id:ID,sourceObjectId:OBJECT,name:'矩亭',scope:'SQUARE_PAVILION_THREE_OPEN_DIRECTIONS_WEST_SILL_WINDOW',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,source:'https://www.dpm.org.cn/explore/building/236510.html',photo:'https://www.dpm.org.cn/Uploads/Picture/dc/1513.jpg',photoSHA256:'236c922ccf1af469b8688261ef6a6e553eee1de2d9d72c43ced3d8109b4dd3d6',roof:'FOUR_CORNER_POINTED_YELLOW_GREEN_EDGE',openDirections:['SOUTH','NORTH','EAST'],westWindowClosed:true,fit:{...P,platformSide:5.4,stepCountPerDirection:2,stepRise:.15,locationAndDimensions:'GAME_FIT_NOT_SURVEY',postCountAndFrame:'SIMPLIFIED_NOT_PHOTO_RECONSTRUCTION',ceiling:'PLAIN_NOT_UNIQUE_WOVEN_PATTERN'},notBuilt:['Connecting corridors and terrace beyond pavilion','Original woven ceiling and Suzhou-style paintings','Imperial plaque lettering, detailed lattice and finial carving'],newMapItems:0,newRooms:0,newTeleportTargets:0};
 f.userData.structure=meta;kit.root.add(f);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);return{frame:f,meta,colliders,walkables,materials};
}
