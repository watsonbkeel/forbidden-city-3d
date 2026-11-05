import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';

const ID='dailou-five-bay-waiting-house',SOURCE_ID='FC-418DFCE4F5',done=new WeakSet();
export const DAILOU_WAITING_FIT=Object.freeze({reserve:Object.freeze([-105.98,0,144,-83,6.8,154]),zOrigin:148.7});
const WALL='{"kind":"wall","from":[-106.47,-416],"to":[-106.47,203.85],"h":7,"gaps":[{"at":-300.3,"gate":"协和门"},{"at":-53.1,"gate":"左翼门"},{"at":174.1,"gate":"景运门"},{"at":-109.3,"w":43.212,"source":"pavilion-rear-shell-interface","pavilionProfile":"tiren"}]}';
const fail=message=>{throw Error('D14 '+message)};
const plainEmpty=o=>o&&Object.getPrototypeOf(o)===Object.prototype&&Reflect.ownKeys(o).length===0;
const mutable=a=>Array.isArray(a)&&Object.getPrototypeOf(a)===Array.prototype&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const exactArray=(a,b)=>a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));
// Pure expected buffers reproduce the public BoxGeometry(1 segment) topology
// and applyBoxUV, without allocating temporary GPU resources during selection.
function boxProfile(actual,width,height,depth,lib,name){
 const tile=lib.tileSize(name);if(!Number.isFinite(tile)||tile<=0)fail('invalid actual library tile size');
 const position=[],normal=[],uv=[],groups=[];
 for(const [i,[u,v,w,ud,vd,W,H,D]]of[
  ['z','y','x',-1,-1,depth,height,width],['z','y','x',1,-1,depth,height,-width],
  ['x','z','y',1,1,width,depth,height],['x','z','y',1,-1,width,depth,-height],
  ['x','y','z',1,-1,width,height,depth],['x','y','z',-1,-1,width,height,-depth]
 ].entries()){
  const vertices=[];for(let y=0;y<2;y++)for(let x=0;x<2;x++){const p={};p[u]=(x*W-W/2)*ud;p[v]=(y*H-H/2)*vd;p[w]=D/2;vertices.push(p)}
  for(const ix of[0,2,1,2,3,1]){const p=vertices[ix],n={x:0,y:0,z:0};n[w]=D>0?1:-1;const X=Math.fround(p.x),Y=Math.fround(p.y),Z=Math.fround(p.z);position.push(X,Y,Z);normal.push(n.x,n.y,n.z);const ax=Math.abs(n.x),ay=Math.abs(n.y),az=Math.abs(n.z);uv.push(...(ay>=ax&&ay>=az?[X/tile,Z/tile]:ax>=az?[Z*Math.sign(n.x||1)/tile,Y/tile]:[X*Math.sign(n.z||1)/tile,Y/tile]));}
  groups.push({start:i*6,count:6,materialIndex:i});
 }
 if(!actual?.isBufferGeometry||actual.index!==null||actual.drawRange.start!==0||actual.drawRange.count!==Infinity||actual.morphTargetsRelative!==false||!plainEmpty(actual.morphAttributes)||Object.getPrototypeOf(actual.attributes)!==Object.prototype||!exactArray(Reflect.ownKeys(actual.attributes).sort(),['normal','position','uv'])||!Array.isArray(actual.groups)||actual.groups.length!==6)fail('changed actual wall geometry profile');
 for(let i=0;i<6;i++){const a=actual.groups[i],e=groups[i];if(!a||Object.getPrototypeOf(a)!==Object.prototype||!exactArray(Reflect.ownKeys(a).sort(),['count','materialIndex','start'])||a.start!==e.start||a.count!==e.count||a.materialIndex!==e.materialIndex)fail('changed actual wall groups')}
 for(const[k,values]of Object.entries({position,normal,uv})){
  const e=new Float32Array(values),a=actual.attributes[k],size=k==='uv'?2:3;
  if(!a||a.isInterleavedBufferAttribute||a.itemSize!==size||a.count!==36||a.normalized!==false||a.array.constructor!==Float32Array||a.array.byteLength!==e.byteLength)fail('changed actual wall attribute '+k);
  const A=new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength),B=new Uint8Array(e.buffer);if(!A.every((v,i)=>v===B[i]))fail('changed actual wall '+k+' bytes');
 }
}
function hostFor(kit,zone){
 const root=kit?.root;if(!root||root.name!=='axis-courts'||root.parent||!root.position.equals(new T.Vector3())||!root.quaternion.equals(new T.Quaternion())||!root.scale.equals(new T.Vector3(1,1,1))||!root.matrix.equals(new T.Matrix4())||!root.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(root)||!Object.isExtensible(kit)||!mutable(root.children)||['colliders','walkables','owned','rooms','mapItems','regions','plaques'].some(k=>!mutable(kit[k]))||JSON.stringify(zone.items?.[6])!==WALL||zone.items.filter(q=>JSON.stringify(q)===WALL).length!==1||done.has(kit))fail('exact mutable public372 wall source required, once only');
 const duplicate=[];root.traverse(o=>{if(o.userData.structure?.sourceObjectId===SOURCE_ID||o.userData.structure?.id===ID)duplicate.push(o)});if(duplicate.length)fail('existing D14 ownership');
 const candidates=root.children.filter(o=>o.position.x===-106.47&&o.position.y===0&&o.position.z===58);if(candidates.length!==1)fail('unique exact wall6 segment required');
 const frame=candidates[0];if(!frame.rotation.equals(new T.Euler(0,Math.PI/2,0))||!frame.scale.equals(new T.Vector3(1,1,1))||frame.children.length!==3)fail('changed wall6 frame/slots');
 root.updateWorldMatrix(true,true);const [brick,red,cap]=frame.children;
 const rows=[];
 for(const[m,name,height,depth,y]of[[brick,'wall_brick',1,1.12,.5],[red,'wall_red',6,1,4]]){
  if(!m?.isMesh||m.isInstancedMesh||m.parent!==frame||!m.position.equals(new T.Vector3(0,y,0))||!m.quaternion.equals(new T.Quaternion())||!m.scale.equals(new T.Vector3(1,1,1))||m.material!==kit.lib.material(name))fail('changed exact wall material/transform');
  boxProfile(m.geometry,209,height,depth,kit.lib,name);const p=m.geometry.attributes.position,triangles=[];
  for(let i=0;i<p.count;i+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,i+j).applyMatrix4(m.matrixWorld)),tri=new T.Triangle(...v);if(tri.getNormal(new T.Vector3()).x>.999999)triangles.push(tri)}
  if(triangles.length!==2)fail('exact inward wall triangles required');const plane=new T.Plane().setFromCoplanarPoints(triangles[0].a,triangles[0].b,triangles[0].c);if(Math.abs(plane.normal.y)>1e-12)fail('nonvertical wall plane');rows.push({mesh:m,plane});
 }
 if(cap.name!=='wall_cap'||!cap.position.equals(new T.Vector3(0,7,0))||!cap.quaternion.equals(new T.Quaternion())||!cap.scale.equals(new T.Vector3(1,1,1)))fail('changed wall cap context');
 const collider=new T.Box3(new T.Vector3(-104.5,0,-.5),new T.Vector3(104.5,3,.5)).applyMatrix4(frame.matrixWorld),contacts=kit.colliders.filter(c=>c.equals(collider));if(contacts.length!==1)fail('unique exact original wall contact required');
 return{frame,brick,red,cap,brickPlane:rows[0].plane,redPlane:rows[1].plane,collider:contacts[0]};
}
const planeX=(p,y,z)=>-(p.normal.y*y+p.normal.z*z+p.constant)/p.normal.x;
const inwardFloat=(value,maximum)=>{let n=Math.fround(value);if(n>maximum){const f=new Float32Array([n]),u=new Uint32Array(f.buffer);u[0]+=n>0?-1:1;n=f[0]}return n};
function release(resources){const errors=[];for(const r of resources)try{r.dispose()}catch(e){errors.push(e)}return errors}

/** Text-guided east waiting-house only. All metric dimensions, current fields,
 * roof details and palette are fits. The west-court photo is not this facade. */
export function buildDailouWaitingHouse(kit,zone){
 if(zone?.id!=='axis-courts')return false;
 const host=hostFor(kit,zone),frame=new T.Group(),geometries=new Set(),materials=new Set(),cache=new Map(),colliders=[],walkables=[];frame.name=ID;frame.position.z=DAILOU_WAITING_FIT.zOrigin;
 let published=false;
 try{
  const material=(name,color)=>{const key=name+':'+color;if(!cache.has(key)){const m=new T.MeshStandardMaterial();materials.add(m);m.copy(kit.lib.material(name));m.name='r165_dailou_'+key;m.color.setHex(color);cache.set(key,m)}return cache.get(key)};
  const prism=(role,left,right,yz,name,color,{roof=false,stone=false,contact=null}={})=>{
   const tile=kit.lib.tileSize(name);if(!Number.isFinite(tile)||tile<=0)fail('invalid actual library tile size');
   const origin=typeof left==='number'?left:planeX(left,0,DAILOU_WAITING_FIT.zOrigin),rightLocal=inwardFloat(right-origin,right-origin),points=[];
   for(const side of[0,1])for(const[z,y]of yz){const localZ=Math.fround(z-DAILOU_WAITING_FIT.zOrigin),worldZ=localZ+DAILOU_WAITING_FIT.zOrigin,localY=inwardFloat(y,6.8),x=side?rightLocal:typeof left==='number'?0:Math.fround(planeX(left,localY,worldZ)-origin);points.push(new T.Vector3(x,localY,localZ));}
   const n=yz.length,faces=T.ShapeUtils.triangulateShape(yz.map(([z,y])=>new T.Vector2(z,y)),[]),indices=[];
   for(const ids of faces){indices.push([...ids],ids.map(i=>n+i))}for(let i=0;i<n;i++){const j=(i+1)%n;indices.push([i,j,n+j],[i,n+j,n+i])}
   const center=points.reduce((a,p)=>a.add(p),new T.Vector3()).divideScalar(points.length),v=[];
   for(const ix of indices){const [a,b,c]=ix.map(i=>points[i]);if(b.clone().sub(a).cross(c.clone().sub(a)).dot(a.clone().add(b).add(c).multiplyScalar(1/3).sub(center))<0)[ix[1],ix[2]]=[ix[2],ix[1]];for(const i of ix)v.push(...points[i].toArray())}
   const g=new T.BufferGeometry();geometries.add(g);g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.computeVertexNormals();applyBoxUV(g,tile);
   const m=new T.Mesh(g,material(name,color));m.position.x=origin;m.name=ID+'/'+role;m.userData={dailouRole:role,dailouRoof:roof,dailouStone:stone,dailouContact:contact};m.castShadow=m.receiveShadow=true;frame.add(m);return m;
  };
  const stone=0xaaa69b,red=0x974833,wood=0x863d2a,dark=0x344039,yellow=0xc7a34f;
  const box=(role,left,right,y0,y1,z0,z1,name,color,flags={})=>prism(role,left,right,[[z0,y0],[z1,y0],[z1,y1],[z0,y1]],name,color,flags);
  box('stone-platform',host.brickPlane,-83.6,0,.25,144.8,152.2,'stone_slab',stone,{stone:true,contact:'brick'});
  box('closed-body-lower',host.brickPlane,-83.6,.25,1,145,150,'wall_red',red,{contact:'brick'});
  box('closed-body-upper',host.redPlane,-83.6,1,4.2,145,150,'wall_red',red,{contact:'red'});
  // Shared z samples retain actual tread/platform seams after Float32 conversion.
  box('low-tread',-96,-93.2,0,.125,153.1,153.9999997,'stone_slab',stone,{stone:true});
  box('low-tread',-96,-93.2,0,.25,152.2,153.1,'stone_slab',stone,{stone:true});
  const posts=[-105.35,-101.05,-96.75,-92.45,-88.15,-83.85];for(const x of posts)box('front-post',x-.14,x+.14,.25,4.2,151.66,151.94,'wood_column',wood);
  box('front-beam',host.redPlane,-83.6,4,4.2,151.66,151.94,'wood_column',wood,{contact:'red'});
  for(let i=0;i<5;i++){const x=(posts[i]+posts[i+1])/2;box('closed-window-field-fit',x-1.7,x+1.7,1.2,3.7,149.99,150.03,'wood_column',dark)}
  const roofSection=[[144.4,4.2],[153,4.2],[153,4.4],[148.7,6.68],[144.4,4.4]];
  prism('closed-yellow-roof-fit',host.redPlane,-83,roofSection,'roof_tile',yellow,{roof:true,contact:'red'});
  // Coarse closed tile courses, no invented beasts or dougong. Each course uses
  // the actual shared linear roof samples and stays within the tested reserve.
  const H=z=>4.4+(1-Math.abs(z-148.7)/4.3)*2.28;
  for(const s of[-1,1])for(let i=1;i<=9;i++){const z=148.7+s*i*.43,a=z-.045,b=z+.045;prism('yellow-tile-course-fit',host.redPlane,-83.025,[[a,H(a)-.015],[b,H(b)-.015],[b,H(b)+.035],[a,H(a)+.035]],'roof_tile',yellow,{roof:true,contact:'red'})}
  box('plain-yellow-ridge-fit',host.redPlane,-83.025,6.665,6.76,148.62,148.78,'roof_tile',yellow,{roof:true,contact:'red'});
  prism('red-free-end-bargeboard-fit',-83.065,-83.005,[[144.45,4.2],[144.45,4.37],[148.7,6.64],[152.95,4.37],[152.95,4.2]],'wood_column',wood,{roof:true});
  frame.updateWorldMatrix(true,true);const reserve=new T.Box3(new T.Vector3(-105.98,0,144),new T.Vector3(-83,6.8,154)),oldMeshes=[];kit.root.traverse(m=>{if(m.isMesh)oldMeshes.push(m)});
  for(const m of frame.children){const b=new T.Box3().setFromObject(m);if(!reserve.containsBox(b))fail('final actual mesh escaped reserve: '+m.name);if(m.userData.dailouStone&&b.min.y!==0)fail('floating actual stone footing');
   const p=m.geometry.attributes.position,plane=b.min.y>=1?host.redPlane:host.brickPlane,eps=Number.EPSILON*32*154;
   for(let i=0;i<p.count;i++){const point=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);if(plane.distanceToPoint(point)<-eps)fail('actual mesh enters retained wall band');}
   for(const old of oldMeshes)if(old!==host.brick&&old!==host.red&&b.intersectsBox(new T.Box3().setFromObject(old)))fail('actual mesh intersects nonhost old object');
   if(!m.userData.dailouRoof){const c=b.clone();c.dailouMesh=m.uuid;for(const old of kit.colliders){if(!c.intersectsBox(old))continue;const overlap=new T.Box3().copy(c).intersect(old).getSize(new T.Vector3());if(old!==host.collider||Math.min(overlap.x,overlap.y,overlap.z)>eps)fail('actual contact intersects unrelated old collider')}colliders.push(c);if(m.userData.dailouStone){const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false})}}
  }
  const meta={id:ID,name:'奏事待漏值所·五间房有限外观',sourceObjectId:SOURCE_ID,originalOrdinal:'D14',bays:5,facing:'NORTH_+Z',scope:'ONE_CLOSED_EAST_WAITING_HOUSE_AND_LOW_FRONT_PORCH_ONLY',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,interiorComplete:false,compoundComplete:false,source:'https://www.dpm.org.cn/building/talk/223497.html',sourcePages:['1983issue4 printed22 east/west common text; bottom photograph/plan are WEST only'],additionalSources:['https://www.dpm.org.cn/explore/building/236497.html','https://www.dpm.org.cn/lemmas/243903.html','https://img.dpm.org.cn/Uploads/File/2020/03/06/u5e61ec373d950.pdf'],sourceSupported:['Waiting-house south of Jingyun Gate, distinct from D13 northern-duty court and the memorial-receiving office','East court text: five bays, north-facing, one depth, front porch and low stone base','Common text: yellow tiles, no dougong, one end against wall, free hanging-gable end with red bargeboard and shutter windows'],fitted:['All absolute game coordinates/dimensions, six equal-spaced porch posts, closed facade fields and hidden volumes','Coarse yellow roof courses/ridge, red/brown palette and simplified current joinery; no own D14 facade photo acceptance','Real.125/.25 stone treads and platform fitted to unchanged old wall brick/red face planes'],excluded:['West-court photograph/plan as D14 own image, mirrored entire court or added well','Interior/furniture/inscriptions, unknown current admission or full-courtyard restoration','Old wall cuts/moves, changed routes/physics, roof pedestrian supports, rooms/map items/teleports']};frame.userData.structure=meta;
  const before={children:kit.root.children.length,colliders:kit.colliders.length,walkables:kit.walkables.length,owned:kit.owned.length};
  try{kit.root.add(frame);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);published=true;return{frame,meta,host};}catch(e){if(frame.parent===kit.root){const i=kit.root.children.indexOf(frame);if(i>=0)kit.root.children.splice(i,1);frame.parent=null}for(const k of['colliders','walkables','owned'])kit[k].length=before[k];throw e}
 }catch(e){if(!published){frame.removeFromParent();const errors=release([...geometries,...materials]);if(errors.length)throw new AggregateError([e,...errors],'D14 constructor rollback incomplete')}throw e}
}
