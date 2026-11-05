import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='chenghuang-glazed-entry',done=new WeakSet();
export const CHENGHUANG_ENTRY_FIT=Object.freeze({x:327,z:463,rotation:Math.PI/2,reserves:Object.freeze([Object.freeze([324,0,457,330,6.5,469]),Object.freeze([322,0,461,324,1,465])])});
const HOSTS=[{kind:'gate',name:'英华门',x:277.2,z:454.9,gateProfile:'yinghua',gateKind:'single-arched'},{kind:'courtWalls',x0:252,x1:302,z0:454.9,z1:513.03,gates:[{side:'s',at:277.2,gate:'英华门'}],source:'estimated'},{kind:'courtWalls',x0:256.02,x1:297.78,z0:362,z1:450,gates:[{side:'s',at:277,gate:'寿安门'}],source:'estimated'}];
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validate(kit,zone){const r=kit?.root,gates=r?.children.filter(o=>o.name==='英华门')??[],g=gates[0],owners=[];r?.traverse(o=>{if(o.userData.structure?.sourceObjectId==='FC-B3FB517883')owners.push(o)});if(!r||r.name!=='outer-west'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(r)||!Object.isExtensible(kit)||!mutable(r.children)||['colliders','walkables','owned','rooms','mapItems','regions','plaques'].some(k=>!mutable(kit[k]))||JSON.stringify(zone.bounds)!=='{"x0":178.05,"x1":382,"z0":-355.24,"z1":526.5}'||HOSTS.some(h=>zone.items?.filter(q=>JSON.stringify(q)===JSON.stringify(h)).length!==1)||gates.length!==1||g.userData.structure?.entityId!=='FC-0EACBA1911'||!g.position.equals(new T.Vector3(277.2,0,454.9))||!g.quaternion.equals(new T.Quaternion())||!g.scale.equals(new T.Vector3(1,1,1))||owners.length||done.has(kit))throw Error('Exact mutable public9a NW entry host required, once only')}

/** One photographed closed glazed wall portal. The separate three-bay grey
 * hard-gable shanmen is not this object. Direction, dimensions, hidden faces,
 * roof profile/classification and simplified trim remain reversible fits. */
export function buildChenghuangGlazedEntry(kit,zone){
 if(zone?.id!=='outer-west')return false;validate(kit,zone);
 const p=CHENGHUANG_ENTRY_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);frame.rotation.y=p.rotation;
 const geometries=new Set(),materials=new Set(),cache=new Map(),colliders=[],walkables=[];let published=false;
 const material=(name,color)=>{const key=name+':'+color;if(!cache.has(key)){const m=new T.MeshStandardMaterial();materials.add(m);m.copy(kit.lib.material(name));m.name='r165_chenghuang_'+key;m.color.setHex(color);m.map=null;m.normalMap=null;cache.set(key,m)}return cache.get(key)};
 const tri=(v,a,b,c,n)=>{const q=new T.Vector3().subVectors(new T.Vector3(...b),new T.Vector3(...a)).cross(new T.Vector3().subVectors(new T.Vector3(...c),new T.Vector3(...a)));v.push(...a,...(q.dot(new T.Vector3(...n))>=0?[...b,...c]:[...c,...b]))};
 const quad=(v,a,b,c,d,n)=>{tri(v,a,b,c,n);tri(v,a,c,d,n)};
 try{
  const mesh=(role,v,name,color,stone=false)=>{const g=new T.BufferGeometry();geometries.add(g);g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.computeVertexNormals();applyBoxUV(g,2);const m=new T.Mesh(g,material(name,color));m.name=ID+'/'+role;m.userData={chenghuangRole:role,chenghuangStone:stone};m.castShadow=m.receiveShadow=true;frame.add(m);return m};
  const box=(role,w,h,d,x,y,z,name,color,stone=false)=>{const a=x-w/2,b=x+w/2,c=y-h/2,e=y+h/2,q=z-d/2,r=z+d/2,v=[];quad(v,[a,c,q],[a,e,q],[b,e,q],[b,c,q],[0,0,-1]);quad(v,[a,c,r],[b,c,r],[b,e,r],[a,e,r],[0,0,1]);quad(v,[a,c,q],[a,c,r],[a,e,r],[a,e,q],[-1,0,0]);quad(v,[b,c,q],[b,e,q],[b,e,r],[b,c,r],[1,0,0]);quad(v,[a,c,q],[b,c,q],[b,c,r],[a,c,r],[0,-1,0]);quad(v,[a,e,q],[a,e,r],[b,e,r],[b,e,q],[0,1,0]);return mesh(role,v,name,color,stone)};
  const prism=(role,left,right,section,name,color)=>{const v=[],faces=T.ShapeUtils.triangulateShape(section.map(([z,y])=>new T.Vector2(z,y)),[]),point=(x,i)=>[x,section[i][1],section[i][0]];for(const ids of faces){tri(v,...ids.map(i=>point(left,i)),[-1,0,0]);tri(v,...ids.map(i=>point(right,i)),[1,0,0])}for(let i=0;i<section.length;i++){const j=(i+1)%section.length,dz=section[j][0]-section[i][0],dy=section[j][1]-section[i][1];quad(v,point(left,i),point(right,i),point(right,j),point(left,j),[0,dz,-dy])}return mesh(role,v,name,color)};
  const stone=0xaaa69b,red=0xa34737,wood=0x71382c,green=0x326253,yellow=0xcfa23d,grey=0x5b5a51;
  // Actual low solid treads, not a hidden ramp or rescue floor. The first
  // tread legitimately crosses x324 only inside the central stair reserve.
  for(let i=0;i<3;i++)box('low-tread',2.6,(i+1)*.1,.7,0,(i+1)*.05,-3.05+i*.7,'stone_slab',stone,true);
  box('stone-threshold-platform',4.2,.3,2.3,0,.15,-.15,'stone_slab',stone,true);
  for(const s of[-1,1]){
   box('short-wall-stone-foot',3,.25,.46,s*3.5,.125,0,'stone_slab',stone);
   box('short-self-owned-wall',3,2.45,.4,s*3.5,1.475,0,'wall_red',red);
   prism('short-grey-wall-cap',s<0?-5.05:1.95,s<0?-1.95:5.05,[[-.38,2.62],[-.38,2.72],[0,2.96],[.38,2.72],[.38,2.62]],'wall_brick',grey);
   box('pier-stone-foot',.78,.55,1.15,s*1.75,.275,0,'stone_slab',stone);
   box('red-masonry-pier',.65,3,1.05,s*1.75,2.05,0,'wall_red',red);
   box('closed-wood-leaf',1.4,3.06,.18,s*.7,1.83,.03,'wood_column',wood);
   box('wood-jamb',.10,3.04,.25,s*1.44,1.82,-.025,'wood_column',wood);
  }
  box('closed-center-stile',.045,3.06,.035,0,1.83,-.0675,'wood_column',wood);
  box('wood-lintel',2.98,.23,.28,0,3.465,-.025,'wood_column',wood);
  box('green-cornice',4.35,.34,1.2,0,3.72,0,'roof_tile',green);
  box('green-roof-bearing',4.5,.22,1.35,0,3.97,0,'roof_tile',green);
  // Filled closed roof volume with a real flat underside bears directly on
  // the green beam. No claim is made for an unphotographed hollow roof frame.
  const NX=12,NZ=20,x0=-2.4,x1=2.4,z0=-1.25,z1=1.25;
  const top=(x,z)=>4.15+Math.max(0,1-Math.abs(z)/1.25)*Math.min(1,(2.4-Math.abs(x))/.8)+.10*Math.pow(Math.abs(x)/2.4,5)*Math.pow(Math.abs(z)/1.25,5);
  const sample=(x,z)=>{const u=Math.min(NX-1,Math.max(0,Math.floor((x-x0)/(x1-x0)*NX))),v=Math.min(NZ-1,Math.max(0,Math.floor((z-z0)/(z1-z0)*NZ))),a=x0+(x1-x0)*u/NX,b=x0+(x1-x0)*(u+1)/NX,c=z0+(z1-z0)*v/NZ,d=z0+(z1-z0)*(v+1)/NZ,tx=(x-a)/(b-a),tz=(z-c)/(d-c),A=top(a,c),B=top(b,c),C=top(b,d),D=top(a,d);return tz<=tx?A+(B-A)*tx+(C-B)*tz:A+(C-D)*tx+(D-A)*tz};
  const solid=(role,left,right,front,back,nx,nz,height,bottom,name,color)=>{const v=[],P=(i,j,low=false)=>{const x=left+(right-left)*i/nx,z=front+(back-front)*j/nz;return[x,low?bottom(x,z):height(x,z),z]};for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){quad(v,P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1),[0,1,0]);quad(v,P(i,j,true),P(i,j+1,true),P(i+1,j+1,true),P(i+1,j,true),[0,-1,0])}for(let i=0;i<nx;i++){quad(v,P(i,0,true),P(i+1,0,true),P(i+1,0),P(i,0),[0,0,-1]);quad(v,P(i,nz,true),P(i,nz),P(i+1,nz),P(i+1,nz,true),[0,0,1])}for(let j=0;j<nz;j++){quad(v,P(0,j,true),P(0,j),P(0,j+1),P(0,j+1,true),[-1,0,0]);quad(v,P(nx,j,true),P(nx,j+1,true),P(nx,j+1),P(nx,j),[1,0,0])}return mesh(role,v,name,color)};
  solid('closed-yellow-roof',x0,x1,z0,z1,NX,NZ,top,()=>4.03,'roof_tile',yellow);
  for(let i=0;i<12;i++){const cx=-2.2+i*.4,m=solid('fitted-yellow-tile-course',cx-.065,cx+.065,-1.245,1.245,2,20,(x,z)=>sample(x,z)+.015+.035*(1-Math.abs(x-cx)/.065),(x,z)=>sample(x,z)+.005,'roof_tile',yellow);m.userData.tileX=cx;}
  box('visible-straight-ridge',3.25,.13,.16,0,5.195,0,'roof_tile',yellow);
  for(const s of[-1,1])prism('simplified-ridge-end-outline',s<0?-1.76:1.58,s<0?-1.58:1.76,[[-.12,5.14],[-.12,5.45],[0,5.58],[.12,5.45],[.12,5.14]],'roof_tile',yellow);
  frame.updateWorldMatrix(true,true);
  const reserves=p.reserves.map(q=>new T.Box3(new T.Vector3(...q.slice(0,3)),new T.Vector3(...q.slice(3))));
  const covered=b=>{const xs=[b.min.x,b.max.x],ys=[b.min.y,b.max.y],zs=[b.min.z,b.max.z];for(const r of reserves)for(const [a,key]of[[xs,'x'],[ys,'y'],[zs,'z']])for(const n of[r.min[key],r.max[key]])if(n>b.min[key]&&n<b.max[key])a.push(n);for(const a of[xs,ys,zs])a.sort((x,y)=>x-y);for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++)for(let k=0;k<zs.length-1;k++){const lo=new T.Vector3(xs[i],ys[j],zs[k]),hi=new T.Vector3(xs[i+1],ys[j+1],zs[k+1]);if(!reserves.some(r=>lo.x>=r.min.x-2e-5&&lo.y>=r.min.y-2e-5&&lo.z>=r.min.z-2e-5&&hi.x<=r.max.x+2e-5&&hi.y<=r.max.y+2e-5&&hi.z<=r.max.z+2e-5))return false}return true};
  const oldBounds=[];kit.root.updateWorldMatrix(true,true);kit.root.traverse(m=>{if(m.isMesh)oldBounds.push(new T.Box3().setFromObject(m))});
  frame.traverse(m=>{if(!m.isMesh)return;const b=new T.Box3().setFromObject(m);if(!covered(b))throw Error('L11 solid escaped exact two-box union');if(oldBounds.some(q=>q.intersectsBox(b)))throw Error('L11 intersects old actual mesh');if(kit.colliders.some(q=>q.intersectsBox(b)))throw Error('L11 intersects old contact');
   if(m.userData.chenghuangStone){const c=b.clone();c.chenghuangMesh=m.uuid;colliders.push(c);const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false});return;}
   // Exact fixed quarter-turn in small local coordinates, then explicit
   // translation. Rounding absolute world x327/z463 would move the proxy
   // off the render triangles by a world Float32 quantum.
   const a=m.geometry.attributes.position,ix=m.geometry.index,v=[];for(let i=0;i<(ix?.count??a.count);i+=3){const vs=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?.getX(i+j)??i+j));if(new T.Triangle(...vs).getArea()>1e-12)v.push(...vs.flatMap(q=>[q.z,q.y,-q.x]))}
   const g=new T.BufferGeometry();geometries.add(g);g.setAttribute('position',new T.Float32BufferAttribute(v,3));const shape=triangleInstance(createTriangleTemplate(g),[p.x,0,p.z],m.name+'/'+m.uuid);g.dispose();geometries.delete(g);const c=shape.box.clone();c.triangleSupport=shape;c.chenghuangMesh=m.uuid;colliders.push(c);
  });
  const meta={id:ID,sourceObjectId:'FC-B3FB517883',name:'城隍庙入口琉璃门·有限拟合',scope:'ONE_CLOSED_GLAZED_WALL_ENTRY_AND_SHORT_SELF_OWNED_CHEEKS_ONLY',portalCount:1,leafCount:2,pose:'CLOSED_SOURCE_PHOTO_DATE_UNKNOWN',orientationStatus:'EAST_-X_GAME_FIT_NOT_PRIMARY_CONFIRMED',roofClassification:'UNRESOLVED_PHOTO_GUIDED_PROFILE_FIT',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,interiorComplete:false,compoundComplete:false,source:'https://www.dpm.org.cn/explore/building/236481.html',ownPhotos:['https://img.dpm.org.cn/Uploads/Picture/dc/7895.jpg','https://img.dpm.org.cn/Uploads/Picture/dc/7903.jpg'],sourceSupported:['One glazed entrance in the eastern courtyard wall in front of a separate three-bay grey hard-gable shanmen','Visible red piers, two closed wood leaves, low pale stone feet/steps, yellow glazed roof and green cornice','Temple broadly in northwest palace corner beside west city wall'],fitted:['All game coordinates/dimensions/direction, back face, roof profile and hidden volume','Simplified straight ridge/end silhouettes, twelve coarse tile courses, no carving or animal inventory','Short cheek-wall extents and three .1m playable stone treads'],excluded:['Separate three-bay shanmen, yellow-roofed temple gate, halls and full three-court compound','Bridge/river changes, god images, plaques/text, inferred current visitor access','Borrowed Yinghua/Shouan/city walls or renamed anonymous old geometry']};frame.userData.structure=meta;
  const state={children:kit.root.children.length,c:kit.colliders.length,w:kit.walkables.length,o:kit.owned.length};
  try{kit.root.add(frame);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);published=true;done.add(kit);return{frame,meta};}catch(e){if(frame.parent===kit.root){kit.root.children.splice(kit.root.children.indexOf(frame),1);frame.parent=null;}kit.colliders.length=state.c;kit.walkables.length=state.w;kit.owned.length=state.o;throw e}
 }catch(e){if(!published){for(const g of geometries)g.dispose();for(const m of materials)m.dispose()}throw e}
}
