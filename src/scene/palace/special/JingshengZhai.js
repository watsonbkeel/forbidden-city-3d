import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='jingsheng-nine-bay',done=new WeakSet();
const GATE={kind:'gate',name:'建福门',x:183.7,z:409.4};
const HALL={kind:'hall',name:'延春阁',x:216,z:485.5,w:23.5,d:24.3,pad:.8,ph:.75,colH:10.24,roof:'pavilion',layers:2};
const COURT={kind:'courtWalls',x0:178.6,x1:245,z0:409.4,z1:520,gates:[{side:'s',at:183.7,gate:'建福门'}]};
export const JINGSHENG_FIT=Object.freeze({x:216,z:512.5,bays:9,eastBays:5,westBays:4,width:37.6,depth:8,platformY:.6,stepRise:.1,stepRun:.4,stepCount:6,bounds:Object.freeze([205,0,505.6,243.95,6.91,517.6])});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validateHost(kit,zone){
 const root=kit?.root,find=(kind,name)=>zone.items?.filter(i=>i.kind===kind&&i.name===name)??[];
 let existing=false;root?.traverse(m=>{if(m.userData.structure?.sourceObjectId==='FC-922969BB62')existing=true;});
 if(find('gate','建福门').length!==1||!same(find('gate','建福门')[0],GATE)||find('hall','延春阁').length!==1||!same(find('hall','延春阁')[0],HALL)||zone.items?.filter(i=>same(i,COURT)).length!==1||!root||root.name!=='outer-west'||root.parent||root.position.lengthSq()||!root.quaternion.equals(new T.Quaternion())||!root.scale.equals(new T.Vector3(1,1,1))||!root.matrix.equals(new T.Matrix4())||!root.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(root)||!mutable(root.children)||!Object.isExtensible(kit)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!mutable(kit[k]))||done.has(kit)||existing)throw Error('Exact untransformed mutable Jingsheng host required, once only');
}
function roofGeometry(){
 const vertices=[],uv=[];
 const tri=(a,b,c)=>{vertices.push(...a,...b,...c);for(const v of[a,b,c])uv.push(v[0]/2,v[2]/2);};
 const quad=(a,b,c,d)=>{tri(a,b,c);tri(a,c,d);};
 const y=z=>4.75+2.15*Math.pow(1-Math.abs(z)/5,1.65);
 for(let i=0;i<24;i++){
  const z=-5+10*i/24,Z=-5+10*(i+1)/24,a=[-11,y(z),z],b=[-11,y(Z),Z],c=[27.95,y(Z),Z],d=[27.95,y(z),z],low=v=>[v[0],v[1]-.16,v[2]];
  quad(a,b,c,d);quad(low(d),low(c),low(b),low(a));quad(a,low(a),low(b),b);quad(d,c,low(c),low(d));
 }
 for(const z of[-5,5])quad([-11,y(z),z],[27.95,y(z),z],[27.95,y(z)-.16,z],[-11,y(z)-.16,z]);
 const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3)).setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
export function buildJingshengZhai(kit,zoneJson){
 if(zoneJson?.id!=='outer-west')return false;
 validateHost(kit,zoneJson);
 const staged=new CourtKit(kit.lib,'outer-west');let f,meta;
 try{
  const materials=new Map();
  const mat=(name,color)=>{const key=name+':'+(color??'');if(!materials.has(key)){const m=kit.lib.material(name).clone();m.name='r163_jingsheng_'+key.replace(':','_');if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}materials.set(key,m);staged.owned.push(m);}return materials.get(key);};
  f=staged.frame(216,512.5,0);f.name=ID;
  const mesh=(role,g,m,x,y,z)=>{const q=staged.mesh(f,g,m,x,y,z);q.name=ID+'/'+role;return q;};
  const box=(role,name,w,h,d,x,y,z,color)=>{const m=mat(name,color),g=applyBoxUV(new T.BoxGeometry(w,h,d),kit.lib.tileSize(name));return mesh(role,g,m,x,y,z);};
  const stone=(role,w,h,d,x,y,z)=>{const m=box(role,'stone_slab',w,h,d,x,y,z);m.jingshengStoneTop=role;m.userData.jingshengStoneTop=role;return m;};
  const bay=37.6/9,x0=-2.5*bay,x1=x0+37.6,xc=(x0+x1)/2;
  stone('platform',38.1,.6,8.7,xc,.3,-.05);
  for(let i=1;i<=6;i++)stone('step',4.2,i*.1,.4,0,i*.05,-6.8+(i-1)*.4+.2);
  // The nine-bay envelope is certain; hidden faces and west-four joinery are
  // closed conservative fit, not borrowed east-five detail or an interior.
  box('closed-back-fit','wall_red',37.6,4.2,.24,xc,2.7,3.88);
  for(const x of[x0+.12,x1-.12])box('closed-side-fit','wall_red',.24,4.2,8,x,2.7,0);
  for(let k=0;k<9;k++){
   const x=x0+(k+.5)*bay;
   if(k===2){
    for(const sign of[-1,1])box('centre-door-jamb','wood_column',.26,4.2,.24,sign*(bay/2-.13),2.7,-2.1);
    box('centre-door-head','wood_column',bay-.52,.76,.24,0,4.42,-2.1);
    for(const dx of[-1.35,-.45,.45,1.35]){
     box('closed-east-five-centre-leaf','wood_column',.9,3.45,.18,dx,2.325,-2.1);
     box('door-upper-glazing-fit','wood_column',.72,1.6,.04,dx,2.85,-2.211,0x1c302f);
     for(const d of[-.18,0,.18])box('door-coarse-lattice','wood_column',.035,1.6,.05,dx+d,2.85,-2.244,0x8f3120);
    }
   }else{
    box(k<5?'east-five-window-backing':'west-four-unverified-closed-fit','wall_red',bay-.03,4.2,.24,x,2.7,-2.1);
    if(k<5){
     box('east-five-sill','stone_slab',bay-.3,.58,.34,x,.89,-2.16);
     box('east-five-window-dark-fit','wood_column',bay-.65,2.65,.06,x,2.6,-2.251,0x1c302f);
     for(let j=0;j<=4;j++)box('east-five-window-upright-fit','wood_column',.07,2.65,.08,x-(bay-.65)/2+j*(bay-.65)/4,2.6,-2.3,0x8f3120);
     for(const y of[1.28,2.5,3.92])box('east-five-window-horizontal-fit','wood_column',bay-.65,.07,.08,x,y,-2.3,0x8f3120);
    }
   }
  }
  for(let k=0;k<=9;k++){
   const x=x0+k*bay;
   mesh('front-column',new T.CylinderGeometry(.17,.19,4.2,12),mat('wood_column'),x,2.7,-3.8);
   box('column-stone-foot','stone_slab',.48,.18,.48,x,.69,-3.8);
  }
  box('front-header','caihua_beam',37.6,.42,.36,xc,4.59,-3.8);
  box('recessed-front-header','caihua_beam',37.6,.38,.3,xc,4.59,-2.1);
  // Front low rail is broken at the east-five central stair. Its motif/count
  // and substrate are unverified; only coarse source-supported placement.
  for(const [a,b]of[[x0+.2,-2.2],[2.2,x1-.2]]){
   box('front-low-rail','wood_column',b-a,.12,.12,(a+b)/2,1.02,-4.12,0x315951);
   box('front-low-rail-lower','wood_column',b-a,.09,.1,(a+b)/2,.74,-4.12,0x315951);
  }
  const between=(role,a,b,r,m)=>{const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A),q=mesh(role,new T.CylinderGeometry(r,r,d.length(),10),m,...A.clone().add(B).multiplyScalar(.5).toArray());q.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return q;};
  for(const x of[-2.23,2.23]){
   for(const [z,y]of[[-6.8,.52],[-4.4,1.12]])box('stair-white-post','stone_slab',.18,.64,.18,x,y,z,0xdbd8ce);
   between('stair-white-handrail',[x,.82,-6.8],[x,1.42,-4.4],.065,mat('stone_slab',0xdbd8ce));
  }
  for(const x of[x0,x1]){
   const shape=new T.Shape();shape.moveTo(-4,4.8);shape.lineTo(4,4.8);
   for(let i=24;i>=0;i--){const z=-4+8*i/24;shape.lineTo(z,4.75+2.15*Math.pow(1-Math.abs(z)/5,1.65)-.16);}shape.closePath();
   const g=new T.ExtrudeGeometry(shape,{depth:.24,bevelEnabled:false,steps:1}),m=mesh('closed-gable-infill-fit',g,mat('wall_red'),x-.12,0,0);m.rotation.y=Math.PI/2;
  }
  const greyRoof=mat('roof_tile',0x9ca7a2);
  mesh('grey-two-slope-roof',roofGeometry(),greyRoof,0,0,0);
  for(const z of[-5,5])box('yellow-eave-edge-fit','roof_tile',38.95,.12,.16,8.475,4.74,z,0xcda54a);
  box('grey-ridge-fit','roof_tile',38.95,.16,.18,8.475,6.82,0,0x8d9792);
  f.updateWorldMatrix(true,true);let owner=0;
  f.traverse(m=>{
   if(!m.isMesh)return;
   if(m.userData.jingshengStoneTop){const b=new T.Box3().setFromObject(m);b.jingshengStoneTop=m.userData.jingshengStoneTop;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let i=0;i<(ix?.count??p.count);i+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld)).map(v=>new T.Vector3(...v.toArray().map(Math.fround)));if(new T.Triangle(...v).getArea()>=1e-12)vertices.push(...v.flatMap(v=>v.toArray()));}
   if(!vertices.length)throw Error('Jingsheng empty owned mesh');
   const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+owner+++'/'+m.name.slice(ID.length+1)),b=shape.box.clone();b.triangleSupport=shape;staged.colliders.push(b);}finally{g.dispose();}
  });
  const bounds=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(204.99,-1e-6,505.59),new T.Vector3(243.951,7,517.61));if(!safe.containsBox(bounds))throw Error('Jingsheng escaped fitted cleared envelope '+JSON.stringify(bounds));
  meta={id:ID,sourceObjectId:'FC-922969BB62',name:'敬胜斋',bays:9,parts:[5,4],eastFiveAxisX:216,dimensionStatus:'ENGINEERING_FIT_NOT_SURVEYED',wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,source:'https://www.dpm.org.cn/lemmas/242221.html',ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d407b2a9fe.jpg',ownPhotoSHA256:'dce6274b3fdc2c4f202d13ffaf57c723f8799ecd0a0bc490e75e73bd318254af',plan:'https://img.dpm.org.cn/Uploads/Picture/dc/2648%5B1024%5D.jpg',sourceSupported:['nine bays, eastern five facing Yanchun and western four extending into northwest garden','own completed photo: red front columns, grey tiled roof with yellow eave-edge, closed four central leaves and sill-window regions, low stone base, central stair and paired white rail'],fit:['all coordinates, dimensions, roof profile, heights, bay spacing and six .1m steps; not survey','west roof edge inset .25m to clear retained west wall cap','coarse lattice/color and closed unseen side/back/west-four; no complete joinery reconstruction'],excluded:['interior/theatre/furniture/upstairs/current access claim','modern lamps, unreadable text and fine carving/paint','unverified linking corridors, landscape changes or global physics'],unknown:['current full interior and west-four exterior','measured plan date, exact materials/details','GPU/mobile/full streaming acceptance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(f);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
