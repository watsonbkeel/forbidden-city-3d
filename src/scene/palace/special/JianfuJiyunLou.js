import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='jianfu-jiyun-lou',done=new WeakSet();
const GATE={kind:'gate',name:'建福门',x:183.7,z:409.4};
const HALL={kind:'hall',name:'延春阁',x:216,z:485.5,w:23.5,d:24.3,pad:.8,ph:.75,colH:10.24,roof:'pavilion',layers:2};
const COURT={kind:'courtWalls',x0:178.6,x1:245,z0:409.4,z1:520,gates:[{side:'s',at:183.7,gate:'建福门'}]};
export const JIANFU_JIYUN_FIT=Object.freeze({x:197,z:512,bays:3,exteriorStoreys:2,width:10,depth:7.2,platformY:.6,upperFloorY:4.6,stepCount:6,stepRise:.1,stepRun:.4,bounds:Object.freeze([190.5,0,505,203.5,12.5,519])});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validateHost(kit,zone){
 const r=kit?.root,find=(kind,name)=>zone.items?.filter(i=>i.kind===kind&&i.name===name)??[];let existing=false;
 r?.traverse(o=>{if(o.userData.structure?.sourceObjectId==='FC-0565E86C7A')existing=true;});
 if(find('gate','建福门').length!==1||!same(find('gate','建福门')[0],GATE)||find('hall','延春阁').length!==1||!same(find('hall','延春阁')[0],HALL)||zone.items?.filter(i=>same(i,COURT)).length!==1||!r||r.name!=='outer-west'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(r)||!mutable(r.children)||!Object.isExtensible(kit)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!mutable(kit[k]))||done.has(kit)||existing)throw Error('Exact untransformed mutable Jianfu Jiyun host required, once only');
}

/** Own captioned completed exterior only. No Cining same-name identity reuse,
 * no claim of measured dimensions or invented indoor/upstairs access. */
export function buildJianfuJiyunLou(kit,zoneJson){
 if(zoneJson?.id!=='outer-west')return false;
 validateHost(kit,zoneJson);
 const staged=new CourtKit(kit.lib,'outer-west');let f,meta;
 try{
  const materials=new Map();
  const material=(name,color)=>{const key=name+':'+(color??'');if(!materials.has(key)){const m=kit.lib.material(name).clone();m.name='r163_jianfu_jiyun_'+key.replace(':','_');if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}staged.owned.push(m);materials.set(key,m);}return materials.get(key);};
  f=staged.frame(197,512,0);f.name=ID;
  const mesh=(role,g,m,x,y,z)=>{const q=staged.mesh(f,g,m,x,y,z);q.name=ID+'/'+role;return q;};
  const box=(role,name,w,h,d,x,y,z,color)=>{const m=material(name,color),tile=kit.lib.tileSize(name);const g=applyBoxUV(new T.BoxGeometry(w,h,d),tile);return mesh(role,g,m,x,y,z);};
  const stone=(role,w,h,d,x,y,z)=>{const m=box(role,'stone_slab',w,h,d,x,y,z);m.userData.jianfuJiyunStoneTop=role;return m;};
  stone('platform',10.6,.6,7.6,0,.3,0);
  for(let i=1;i<=6;i++)stone('step',3.2,i*.1,.4,0,i*.05,-6.2+(i-1)*.4+.2);
  box('upper-real-floor','wood_column',10.3,.18,7.3,0,4.51,0);
  for(const [floor,height,prefix] of [[.6,3.8,'ground'],[4.6,3.6,'upper']]){
   box(prefix+'-closed-back-fit','wall_red',10,height,.24,0,floor+height/2,3.48);
   for(const x of[-4.88,4.88])box(prefix+'-closed-side-fit','wall_red',.24,height,7.2,x,floor+height/2,0);
   for(let k=0;k<3;k++){
    const x=-5+(k+.5)*10/3;
    if(k===1){
     for(const dx of[-1.05,-.35,.35,1.05]){
      box('closed-'+prefix+'-central-leaf','wood_column',.7,height-.2,.18,dx,floor+(height-.2)/2,-2.05);
      box(prefix+'-door-dark-lattice-fit','wood_column',.55,height*.48,.04,dx,floor+height*.64,-2.161,0x19342f);
      for(const xx of[-.14,0,.14])box(prefix+'-door-coarse-grid','wood_column',.026,height*.48,.05,dx+xx,floor+height*.64,-2.191,0x813b2e);
     }
     for(const x of[-1.53,1.53])box(prefix+'-door-jamb','wood_column',.26,height,.26,x,floor+height/2,-2.05);
     box(prefix+'-door-header','wood_column',3.32,.2,.25,0,floor+height-.1,-2.05);
    }else{
     box(prefix+'-window-wall-fit','wall_red',3.31,height,.24,x,floor+height/2,-2.05);
     box(prefix+'-sill-window-dark-fit','wood_column',2.7,height-.9,.06,x,floor+.5+(height-.9)/2,-2.201,0x1b342f);
     for(let j=0;j<=4;j++)box(prefix+'-window-upright','wood_column',.065,height-.9,.08,x-1.35+j*.675,floor+.5+(height-.9)/2,-2.24,0x8c3024);
     for(const y of[floor+.5,floor+height*.54,floor+height-.4])box(prefix+'-window-crossbar','wood_column',2.7,.075,.08,x,y,-2.24,0x8c3024);
    }
   }
   for(let k=0;k<=3;k++){
    const x=-5+k*10/3;
    mesh(prefix+'-front-column',new T.CylinderGeometry(.16,.18,height,12),material('wood_column'),x,floor+height/2,-3.3);
    if(prefix==='ground')box('column-stone-foot','stone_slab',.45,.18,.45,x,.69,-3.3);
   }
   box(prefix+'-front-bearing','caihua_beam',10.3,.4,.36,0,floor+height-.1,-3.3);
   box(prefix+'-recess-bearing','caihua_beam',10.3,.34,.28,0,floor+height-.07,-2.05);
  }
  // Fifteen spindles are a retained-width FIT, not a counted historic inventory.
  const pale=material('stone_slab',0xe1dccb);
  for(let i=0;i<15;i++){
   const points=[[.035,0],[.05,.06],[.035,.17],[.065,.32],[.035,.47],[.05,.57],[.035,.62]].map(([r,y])=>new T.Vector2(r,y));
   mesh('upper-turn-baluster',new T.LatheGeometry(points,8),pale,-4.55+i*9.1/14,4.7,-3.54);
  }
  for(const y of[4.7,5.36])box('upper-front-rail','stone_slab',9.5,.1,.12,0,y,-3.54,0xe1dccb);
  for(const x of[-5,5])for(const y of[4.82,5.36])box('upper-side-rail-fit','wood_column',.1,.1,1.5,x,y,-2.7);
  box('upper-balcony-fascia-fit','caihua_beam',10.6,.3,.12,0,4.46,-3.68);
  for(const [a,b]of[[-4.8,-1.75],[1.75,4.8]])for(const y of[.78,1.05])box('ground-low-rail','wood_column',b-a,.09,.1,(a+b)/2,y,-3.65,0x315b4e);
  const between=(role,A,B,r,m)=>{const a=new T.Vector3(...A),b=new T.Vector3(...B),v=b.clone().sub(a),q=mesh(role,new T.CylinderGeometry(r,r,v.length(),10),m,...a.clone().add(b).multiplyScalar(.5).toArray());q.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return q;};
  for(const x of[-1.8,1.8]){
   for(const [z,y]of[[-6.2,.52],[-3.8,1.12]])box('stair-white-post','stone_slab',.18,.64,.18,x,y,z,0xe1dccb);
   between('stair-white-handrail',[x,.82,-6.2],[x,1.42,-3.8],.065,pale);
  }
  // Resolve fallible shared-library inputs before RoofBuilder allocates its
  // local ridge/gold materials. The local cached adapter never owns/disposes
  // these shared handles and avoids orphan allocations on a failed lookup.
  const roofMats=new Map(['roof_tile','rafters','dougong_band','caihua_beam','wood_column','wall_red'].map(name=>[name,kit.lib.material(name)]));
  const roofTiles=new Map(['roof_tile','rafters','wood_column','wall_red'].map(name=>[name,kit.lib.tileSize(name)]));
  const roofAspects=new Map(['dougong_band','caihua_beam'].map(name=>[name,kit.lib.aspect(name)]));
  const originalLib=staged.lib;let roof;
  staged.lib={material:name=>roofMats.get(name),tileSize:name=>roofTiles.get(name),aspect:name=>roofAspects.get(name)};
  try{roof=staged.roof(f,{type:'xieshan',width:10.6,depth:7.8,overhang:.73,baseY:8.2,height:2.05,brackets:true});}finally{staged.lib=originalLib;}roof.name=ID+'/source-roof-fit';
  const roofMaterials=new Map();
  roof.traverse(m=>{if(!m.isMesh)return;const old=m.material;if(!roofMaterials.has(old)){const q=old.clone();q.name='r163_jianfu_jiyun_roof_'+old.name;if(old===staged.ridge){q.color.setHex(0x337c62);q.map=null;q.normalMap=null;}staged.owned.push(q);roofMaterials.set(old,q);}m.material=roofMaterials.get(old);m.name=ID+'/roof-'+old.name;});
  f.updateWorldMatrix(true,true);let owner=0;
  f.traverse(m=>{
   if(!m.isMesh)return;
   if(m.userData.jianfuJiyunStoneTop){const b=new T.Box3().setFromObject(m);b.jianfuJiyunStoneTop=m.userData.jianfuJiyunStoneTop;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let i=0;i<(ix?.count??p.count);i+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld)).map(v=>new T.Vector3(...v.toArray().map(Math.fround)));if(new T.Triangle(...v).getArea()>=1e-12)vertices.push(...v.flatMap(v=>v.toArray()));}
   if(!vertices.length)throw Error('Jianfu Jiyun empty owned mesh');
   const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+owner+++'/'+m.name.slice(ID.length+1)),b=shape.box.clone();b.triangleSupport=shape;staged.colliders.push(b);}finally{g.dispose();}
  });
  const bounds=new T.Box3().setFromObject(f);if(!new T.Box3(new T.Vector3(190.5,-1e-7,505),new T.Vector3(203.5,12.5,519)).containsBox(bounds))throw Error('Jianfu Jiyun escaped fitted clear envelope '+JSON.stringify(bounds));
  meta={id:ID,sourceObjectId:'FC-0565E86C7A',name:'吉云楼（建福宫花园）',bays:3,exteriorStoreys:2,dimensionStatus:'ENGINEERING_FIT_NOT_SURVEYED',wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,upperAccess:'NO_STAIR_NO_UPPER_DESTINATION',source:'https://www.dpm.org.cn/explore/building/236524.html',ownPhotos:['https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d410fed04c.jpg','https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d412337533.jpg'],ownPhotoSHA256:['f3df9c0e763d6809a9118913217dd8c7faa9f532e2092888a4c0c0ff8b9a65be','b99fc823b34d86a94b75c6746c49d552b8eca54b8469d2d9a35db83ec5732bf8'],photographyDate:null,plan:'https://img.dpm.org.cn/Uploads/Picture/dc/2648%5B1024%5D.jpg',sourceSupported:['captioned own completed front views show three bays and two exterior storeys, red columns, yellow roof with green edge, upper front balcony/pale rail','closed ground central door, sill windows, low stone platform, central stair and paired white handrails','official total plan places this Jiyun east of Jingsheng and northwest of Jingyi; not Cining garden same-name tower'],fit:['all metric location, width/depth/heights, six .1m steps, roof profile, member counts and colors','coarse lattice and fifteen upper turned balusters; hidden side/back closure and side rails are conservative model fit'],excluded:['Cining same-name entity reuse','interior furniture, room or upstairs destination','unverified indoor stair, court/linking corridors and modern objects','fine carving, unreadable writing, exact paint motifs/current visitor admission'],unknown:['surveyed measurements, hidden elevations, full roof details','present room inventory and full stair route','GPU/mobile/visual/full streaming acceptance']};f.userData.structure=meta;
 }catch(error){staged.dispose(staged.root);throw error;}
 kit.root.add(f);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
