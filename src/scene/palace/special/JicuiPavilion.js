import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='jicui-pavilion',done=new WeakSet();
const GATE={kind:'gate',name:'建福门',x:183.7,z:409.4};
const HALL={kind:'hall',name:'延春阁',x:216,z:485.5,w:23.5,d:24.3,pad:.8,ph:.75,colH:10.24,roof:'pavilion',layers:2};
const COURT={kind:'courtWalls',x0:178.6,x1:245,z0:409.4,z1:520,gates:[{side:'s',at:183.7,gate:'建福门'}]};
export const JICUI_FIT=Object.freeze({x:216,z:454,platformBottom:2.3,platformY:2.44,columns:4,roofWidth:7.4,bounds:Object.freeze([209,0,448,223,11,460])});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validateHost(kit,zone){
 const r=kit?.root,find=(kind,name)=>zone.items?.filter(i=>i.kind===kind&&i.name===name)??[];let existing=false;r?.traverse(m=>{if(m.userData.structure?.sourceObjectId==='FC-6C3C39B8A7')existing=true;});
 if(find('gate','建福门').length!==1||!same(find('gate','建福门')[0],GATE)||find('hall','延春阁').length!==1||!same(find('hall','延春阁')[0],HALL)||zone.items?.filter(i=>same(i,COURT)).length!==1||!r||r.name!=='outer-west'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(r)||!mutable(r.children)||!Object.isExtensible(kit)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!mutable(kit[k]))||done.has(kit)||existing)throw Error('Exact untransformed mutable Jicui host required, once only');
}
function surface(build){const v=[],uv=[],tri=(a,b,c)=>{v.push(...a,...b,...c);for(const p of[a,b,c])uv.push(p[0]/2,p[2]/2);},quad=(a,b,c,d)=>{tri(a,b,c);tri(a,c,d);};build(tri,quad);const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3)).setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}
function hillGeometry(){return surface((tri,quad)=>{
 const rings=[[],[],[]];for(let i=0;i<16;i++){const a=i*Math.PI/8,c=Math.cos(a),s=Math.sin(a),r=1-.07*(1+Math.sin(i*2.3)),square=2.6/Math.max(Math.abs(c),Math.abs(s));rings[0].push([c*6.2*r,0,s*5.25*r]);rings[1].push([c*4.4*(1+.04*Math.cos(i*1.7)),1.16+.19*Math.sin(i*2.2),s*3.85*(1+.04*Math.cos(i*1.7))]);rings[2].push([c*square,2.3,s*square]);}
 for(let k=0;k<2;k++)for(let i=0;i<16;i++){const j=(i+1)%16;quad(rings[k][i],rings[k+1][i],rings[k+1][j],rings[k][j]);}
 for(let i=0;i<16;i++){const j=(i+1)%16;tri([0,2.3,0],rings[2][j],rings[2][i]);tri([0,0,0],rings[0][i],rings[0][j]);}
});}
function roofGeometry(){return surface((tri,quad)=>{
 const rings=[[3.7,5.96],[3.1,6.13],[2.1,6.65],[1.05,7.3],[.1,8]],corners=(r,y)=>[[-r,y,-r],[r,y,-r],[r,y,r],[-r,y,r]];
 for(let k=0;k<rings.length-1;k++){const a=corners(...rings[k]),b=corners(...rings[k+1]);for(let i=0;i<4;i++){const j=(i+1)%4;quad(a[i],b[i],b[j],a[j]);}}
 const a=corners(3.7,5.96),b=corners(3.7,5.82);for(let i=0;i<4;i++){const j=(i+1)%4;quad(a[i],a[j],b[j],b[i]);tri(b[i],b[j],[0,5.82,0]);}const top=corners(.1,8);tri(top[0],top[2],top[1]);tri(top[0],top[3],top[2]);
});}
export function buildJicuiPavilion(kit,zoneJson){
 if(zoneJson?.id!=='outer-west')return false;validateHost(kit,zoneJson);
 const staged=new CourtKit(kit.lib,'outer-west');let f,meta;
 try{
  const cache=new Map();
  const material=(name,color)=>{const key=name+':'+(color??'');if(!cache.has(key)){const m=kit.lib.material(name).clone();m.name='r163_jicui_'+key.replace(':','_');if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}cache.set(key,m);staged.owned.push(m);}return cache.get(key);};
  f=staged.frame(216,454,0);f.name=ID;
  const mesh=(role,g,m,x=0,y=0,z=0)=>{const q=staged.mesh(f,g,m,x,y,z);q.name=ID+'/'+role;return q;};
  // Resolve fallible library inputs before allocating unattached geometry.
  const box=(role,name,w,h,d,x,y,z,color)=>{const m=material(name,color),tile=kit.lib.tileSize(name),g=applyBoxUV(new T.BoxGeometry(w,h,d),tile);return mesh(role,g,m,x,y,z);};
  const rock=material('stone_slab',0xb7b1a6);mesh('visible-solid-rock-mass',hillGeometry(),rock);
  // Coarse fitted protruding stones, not a measured historic rock inventory.
  for(let i=0;i<12;i++){const a=i*Math.PI/6,q=mesh('fitted-rock-piece',new T.IcosahedronGeometry(1,0),rock,Math.cos(a)*5.18,.62+.13*Math.sin(i*2.1),Math.sin(a)*4.3);q.scale.set(.7+.16*Math.sin(i+1),.62+.12*Math.cos(i),.65+.1*Math.cos(i*1.8));q.rotation.set(.18*Math.sin(i),i*.61,.1*Math.cos(i));q.updateWorldMatrix(true,false);const low=new T.Box3().setFromObject(q).min.y;if(low<0)q.position.y-=low;}
  const slab=box('raised-stone-platform','stone_slab',4.8,.14,4.8,0,2.37,0);slab.userData.jicuiStoneTop=true;
  const red=material('wood_column');
  for(const x of[-2.05,2.05])for(const z of[-2.05,2.05])mesh('corner-column',new T.CylinderGeometry(.13,.16,3.4,12),red,x,4.14,z);
  for(const z of[-2.05,2.05])box('visible-frame-beam','caihua_beam',4.45,.3,.3,0,5.69,z);
  for(const x of[-2.05,2.05])box('visible-frame-beam','caihua_beam',.3,.3,4.45,x,5.69,0);
  for(const x of[-2.05,2.05])for(const y of[2.73,3.15])box('fitted-low-side-framing','wood_column',.1,.11,4.1,x,y,0);
  for(const y of[2.73,3.15])box('fitted-low-back-framing','wood_column',4.1,.11,.1,0,y,2.05);
  const tile=material('roof_tile',0x657e73);mesh('convergent-roof',roofGeometry(),tile);
  for(const z of[-3.7,3.7])box('yellow-eave-edge-fit','roof_tile',7.4,.13,.14,0,5.96,z,0xd2ae4f);
  for(const x of[-3.7,3.7])box('yellow-eave-edge-fit','roof_tile',.14,.13,7.4,x,5.96,0,0xd2ae4f);
  const green=material('roof_tile',0x36705a),between=(a,b)=>{const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A),q=mesh('green-hip-ridge-fit',new T.CylinderGeometry(.07,.07,d.length(),8),green,...A.clone().add(B).multiplyScalar(.5).toArray());q.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());};
  for(const x of[-1,1])for(const z of[-1,1]){const line=[[3.7*x,5.99,3.7*z],[3.1*x,6.16,3.1*z],[2.1*x,6.68,2.1*z],[1.05*x,7.33,1.05*z],[.1*x,8.03,.1*z]];for(let i=0;i<line.length-1;i++)between(line[i],line[i+1]);}
  mesh('coarse-finial',new T.CylinderGeometry(.14,.25,.6,10),green,0,8.3,0);mesh('coarse-finial-cap',new T.SphereGeometry(.17,10,6),green,0,8.66,0);
  f.updateWorldMatrix(true,true);let index=0;
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.jicuiStoneTop){const b=new T.Box3().setFromObject(m);b.jicuiStoneTop=true;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],a=m.geometry.attributes.position,ix=m.geometry.index;for(let k=0;k<(ix?.count??a.count);k+=3){const vs=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld)).map(v=>new T.Vector3(...v.toArray().map(Math.fround)));if(new T.Triangle(...vs).getArea()>1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)throw Error('Empty Jicui owned mesh');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+index+++'/'+m.name.slice(ID.length+1)),b=shape.box.clone();b.triangleSupport=shape;staged.colliders.push(b);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f);if(!new T.Box3(new T.Vector3(209,-1e-6,448),new T.Vector3(223,11,460)).containsBox(b))throw Error('Jicui escaped source-fit clear envelope '+JSON.stringify(b));
  meta={id:ID,sourceObjectId:'FC-6C3C39B8A7',name:'积翠亭',dimensionStatus:'ENGINEERING_FIT_NOT_SURVEYED',wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,columnCountStatus:'MINIMAL_FOUR_CORNER_FIT_TOTAL_INVENTORY_UNVERIFIED',hillAccess:'NO_VERIFIED_STAIR_OR_ROUTE_NO_UPHILL_DESTINATION',source:'https://www.dpm.org.cn/explore/building/236524.html',ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d414db8dbf.jpg',ownPhotoSHA256:'a96e4333eab1010fb6574dc898692de6a8a0f85a2f30dff2089e6a96fc930cc9',photographyDate:null,plan:'https://img.dpm.org.cn/Uploads/Picture/dc/2648%5B1024%5D.jpg',roofText:'https://www.dpm.org.cn/Uploads/File/pdf/fe/28/18/fe28187491b532c2a23498bb59035858.pdf',sourceSupported:['own captioned photograph: open red column/beam frame on real irregular rockery, convergent roof/finial and low framing silhouette','official2005院刊p166 historical layout description: square convergent roof and finial, pavilion on hill','official total plan: pavilion south of Yanchun on its garden axis'],fit:['all metric location/dimensions/heights, four minimal corner posts, low framing and closed roof underside','continuous coarse faceted hill plus twelve protruding stones; not original stone inventory or a complete rockery/cave reconstruction','roof ring curve and colors/edge/finial/ridges, plain frame members; no fine paint or ornament count'],excluded:['guessed stair or uphill navigation/destination','borrowed tree/modern lamps/foreground display stone/furniture and inscribed text','historic caves, whole linking galleries or landscaping expansion','global controls, invisible proxy slopes or admission claim'],unknown:['surveyed coordinates and hill geometry/path','full column grid, roof back/ceiling/ornament','GPU/mobile/all-streaming acceptance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(f);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
