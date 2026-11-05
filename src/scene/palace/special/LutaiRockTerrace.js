import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='lutai-rock-terrace',OBJECT='FC-F5886C9CA9',done=new WeakSet();
export const LUTAI_FIT=Object.freeze({x:-267.8,z:380.2,rotationY:0,floorY:1.8,terraceWidth:2.7,terraceDepth:2.6,stairCenterX:-270.2,stairWidth:1.5,stepsPerEnd:12,stepRise:.15,front:'EAST_MODEL_NEGATIVE_X'});
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const identity=o=>o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1))&&o.matrix.equals(new T.Matrix4())&&o.matrixWorld.equals(new T.Matrix4());
function validate(kit,zone){const root=kit?.root;let exists=false;root?.traverse(o=>{if(o.userData.structure?.sourceObjectId===OBJECT||o.userData.lutaiRockTerrace)exists=true});
 if(!root||root.name!=='ningshou'||root.parent||!identity(root)||!mutable(root.children)||['colliders','walkables','owned'].some(k=>!mutable(kit[k]))||done.has(kit)||exists||JSON.stringify(zone.bounds)!=='{"x0":-366.5,"x1":-222.45,"z0":111.5,"z1":526.5}')throw Error('Exact mutable untransformed Lutai host required, once only');
 if(zone.items?.filter(i=>i.kind==='hall'&&i.name==='古华轩'&&i.x===-253.9&&i.z===387.4&&i.w===14.3&&i.d===8.7&&i.ph===.5).length!==1)throw Error('Retained Guhua anchor changed');
 const reserve=new T.Box3(new T.Vector3(-271.5,.001,376.2),new T.Vector3(-264,5.5,384.2));if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve))||kit.walkables.some(w=>{const b=w.box??(w.type==='ramp'?new T.Box3(new T.Vector3(w.minX,Math.min(w.y0,w.y1),w.minZ),new T.Vector3(w.maxX,Math.max(w.y0,w.y1),w.maxZ)):null);return b?.intersectsBox(reserve)}))throw Error('Lutai fitted reserve occupied');
 root.updateWorldMatrix(true,true);let occupied=false;root.traverse(o=>{if(o.isMesh&&new T.Box3().setFromObject(o,true).intersectsBox(reserve))occupied=true});if(occupied)throw Error('Lutai visible reserve occupied');
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
export function buildLutaiRockTerrace(kit,zone){
 if(zone?.id!=='ningshou')return false;validate(kit,zone);
 const P=LUTAI_FIT,f=new T.Group();f.name='露台';f.position.set(P.x,0,P.z);f.userData.lutaiRockTerrace=true;
 const geometries=[],materials=[],colliders=[],walkables=[];
 const own=()=>{const g=new T.BufferGeometry();geometries.push(g);return g};
 const mat=(name,color)=>{const m=new T.MeshStandardMaterial();materials.push(m);m.name='r165_lutai_'+name;m.color.setHex(color);m.roughness=.94;m.side=T.FrontSide;return m};
 const mesh=(role,g,m,x=0,y=0,z=0,kind='triangle',walk=false)=>{const o=new T.Mesh(g,m);o.name=ID+'/'+role;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.userData={lutaiRockTerrace:true,role,contactKind:kind,topWalk:walk,fitNotSurvey:true};f.add(o);return o};
 const box=(role,m,w,h,d,x,y,z,kind='triangle',walk=false)=>{const g=own(),p=boxPayload(w,h,d);g.setIndex(new T.BufferAttribute(p.index,1));g.setAttribute('position',new T.BufferAttribute(p.position,3));g.setAttribute('normal',new T.BufferAttribute(p.normal,3));g.setAttribute('uv',new T.BufferAttribute(p.uv,2));return mesh(role,g,m,x,y,z,kind,walk)};
 // Closed, outward-oriented irregular stone masses. Pits and exposed planes are a fit,
 // not invented tunnel apertures or a scan of the historic Taihu stones.
 const rock=(role,m,layers,cx=0,cz=0,phase=0)=>{const g=own(),v=[],uv=[],ix=[],N=32;
  for(const [level,[y,rx,rz,shift=0]]of layers.entries())for(let j=0;j<N;j++){const a=2*Math.PI*j/N,r=1+.055*Math.sin(5*a+phase+level*.7)+.035*Math.cos(9*a-phase-level*.4);v.push(cx+shift+rx*r*Math.cos(a),y,cz+rz*r*Math.sin(a));uv.push(j/N,level/(layers.length-1));}
  const q=(a,b,c,d)=>ix.push(a,b,c,a,c,d);for(let k=0;k<layers.length-1;k++)for(let j=0;j<N;j++){const n=(j+1)%N,a=k*N+j,b=k*N+n;q(a,a+N,b+N,b)}
  const bottom=v.length/3;v.push(cx+layers[0][3],layers[0][0],cz);uv.push(.5,.5);const top=v.length/3,last=layers.at(-1);v.push(cx+last[3],last[0],cz);uv.push(.5,.5);for(let j=0;j<N;j++){const n=(j+1)%N;ix.push(bottom,j,n,top,(layers.length-1)*N+n,(layers.length-1)*N+j)}
  g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(role,g,m);
 };
 try{
  const stone=mat('terrace_stone',0xb9b4a4),white=mat('white_stone',0xcdcabe),rocks=mat('taihu_rock',0x84867e),wood=mat('wood_rail',0x5a493b);rocks.flatShading=true;
  rock('rock-main',rocks,[[0,2.02,1.88,.65],[.22,2.02,1.84,.65],[.65,1.86,1.67,.48],[1.05,1.62,1.43,.25],[1.48,1.38,1.23,.07],[1.74,1.32,1.21,0]]);
  for(const [i,[x,z,rx,rz,h]]of [[1.75,-1.2,.55,.52,.75],[2.1,.3,.58,.55,.55],[1.5,1.65,.52,.4,.55],[.15,1.78,.52,.35,.68]].entries())rock('rock-outcrop-'+i,rocks,[[0,rx,rz,0],[h*.35,rx,rz,0],[h*.82,rx*.7,rz*.7,.04],[h,rx*.45,rz*.45,0]],x,z,i+.3);
  box('terrace-floor',stone,P.terraceWidth,.16,P.terraceDepth,0,P.floorY-.08,0,'box',true);
  box('east-entry-landing',stone,1.85,.18,1.4,-2.225,P.floorY-.09,0,'box',true);
  for(const side of['south','north'])for(let i=0;i<12;i++){
   const h=.15*(i+1),z=(side==='south'?-4+(i+.5)*.275:4-(i+.5)*.275);
   box('stone-step-'+side+'-'+i,stone,1.5,h,.275,-2.4,h/2,z,'box',true);
  }
  // Two boards each N/S, three W, two E around the widened game entry.
  for(const z of[-1.3,1.3]){
   box('rail-base-ns-'+z,white,2.8,.14,.16,0,1.87,z);
   for(const x of[-1.35,0,1.35])box('rail-post-ns-'+x+'-'+z,white,.16,.84,.16,x,2.22,z);
   for(const x of[-.675,.675]){box('rail-panel-ns-'+x+'-'+z,white,1.19,.42,.10,x,2.15,z);box('rail-cap-ns-'+x+'-'+z,white,1.19,.10,.18,x,2.41,z);}
  }
  box('rail-base-west',white,.16,.14,2.6,1.35,1.87,0);
  for(const z of[-.433333333,.433333333])box('rail-post-west-'+z,white,.16,.84,.16,1.35,2.22,z);
  for(const z of[-.866666667,0,.866666667]){box('rail-panel-west-'+z,white,.10,.42,.706666667,1.35,2.15,z);box('rail-cap-west-'+z,white,.18,.10,.706666667,1.35,2.41,z);}
  for(const sign of[-1,1]){box('rail-base-east-'+sign,white,.16,.14,.6,-1.35,1.87,sign);box('rail-post-entry-'+sign,white,.16,.84,.16,-1.35,2.22,sign*.7);box('rail-panel-east-'+sign,white,.10,.42,.44,-1.35,2.15,sign);box('rail-cap-east-'+sign,white,.18,.10,.44,-1.35,2.41,sign);}
  for(const side of['south','north']){
   const sign=side==='south'?-1:1;
   for(const i of[0,3,6,9,11]){const h=.15*(i+1),z=sign*(4-(i+.5)*.275);box('stair-outer-post-'+side+'-'+i,white,.12,.7,.12,-3.28,h+.35,z);}
   const o=box('stair-outer-handrail-'+side,wood,.12,.12,Math.hypot(3.3,1.8)*3.1/3.3,-3.28,1.68,sign*2.35);o.rotation.x=sign*Math.atan2(1.8,3.3);
  }
  f.updateWorldMatrix(true,true);f.traverse(o=>{if(!o.isMesh||!o.userData.contactKind)return;const b=new T.Box3().setFromObject(o,true);if(o.userData.contactKind==='triangle'){const g=own();try{g.copy(o.geometry);g.applyMatrix4(o.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+o.name);b.copy(shape.box);b.triangleSupport=shape}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}}b.lutaiRockTerrace=true;b.lutaiMesh=o.name;colliders.push(b);if(o.userData.topWalk){const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false,lutaiRockTerrace:true,lutaiMesh:o.name})}});
  if(!new T.Box3(new T.Vector3(-271.5,-.00001,376.19999),new T.Vector3(-264,5.5,384.20001)).containsBox(new T.Box3().setFromObject(f,true)))throw Error('Lutai escaped fitted reserve');
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const meta={id:ID,sourceObjectId:OBJECT,name:'露台',scope:'ROCK_TERRACE_EAST_ENTRY_NORTH_SOUTH_GAME_STAIRS',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,source:'https://www.dpm.org.cn/explore/building/236469.html',photo:'https://img.dpm.org.cn/Uploads/Picture/dc/1518[1024].jpg',photoSHA256:'c69c22eb72a08b640193d1cc3e827c5834b8c247d532fa25b42384c31c0be5ef',fit:{...P,area:7.02,locationAndDimensions:'GAME_FIT_NOT_SURVEY',stoneMass:'CLOSED_FACETED_APPROXIMATION_NOT_PHOTOGRAMMETRY',panelHeight:.42,panelWidths:'FITTED_NOT_ORIGINAL_0_84_METRE',entryWidth:'WIDENED_GAME_FIT',rockCaves:'NOT_BUILT_NOT_CLAIM_ABSENT'},notBuilt:['Lower cave chambers, historic narrow cave doorways and Buddhist interior','Original stone carving and complete hill/vegetation','Unseen rock tunnels and detailed adjoining historic paths'],newMapItems:0,newRooms:0,newTeleportTargets:0};
 f.userData.structure=meta;kit.root.add(f);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);return{frame:f,meta,colliders,walkables,materials};
}
