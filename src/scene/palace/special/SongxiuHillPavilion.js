import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='songxiu-hill-pavilion',OBJECT='FC-4B9C091388',done=new WeakSet();
export const SONGXIU_FIT=Object.freeze({x:-253.6,z:439.7,rotationY:0,floorY:2.4,platformSide:4.2,postSpan:3.6,eaveY:6.7,roofRise:1.35,roofHalf:2.65,stairCenterX:-257.1,stairWidth:1.4,steps:16,stepRise:.15,front:'EAST_MODEL_NEGATIVE_X'});
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const identity=o=>o.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.position.lengthSq()===0&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1))&&o.matrix.equals(new T.Matrix4())&&o.matrixWorld.equals(new T.Matrix4());
function validate(kit,zone){const root=kit?.root;let exists=false;root?.traverse(o=>{if(o.userData.structure?.sourceObjectId===OBJECT||o.userData.songxiuHillPavilion)exists=true});
 if(!root||root.name!=='ningshou'||root.parent||!identity(root)||!mutable(root.children)||['colliders','walkables','owned'].some(k=>!mutable(kit[k]))||done.has(kit)||exists||JSON.stringify(zone.bounds)!=='{"x0":-366.5,"x1":-222.45,"z0":111.5,"z1":526.5}')throw Error('Exact mutable untransformed Songxiu host required, once only');
 if(zone.items?.filter(i=>i.kind==='hall'&&i.name==='萃赏楼'&&i.x===-260.7&&i.z===456.3&&i.w===20.5&&i.d===10.9&&i.ph===.5).length!==1)throw Error('Retained Cuishang anchor changed');
 const reserve=new T.Box3(new T.Vector3(-258,.001,433.5),new T.Vector3(-250.5,9,445.5));if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve))||kit.walkables.some(w=>{const b=w.box??(w.type==='ramp'?new T.Box3(new T.Vector3(w.minX,Math.min(w.y0,w.y1),w.minZ),new T.Vector3(w.maxX,Math.max(w.y0,w.y1),w.maxZ)):null);return b?.intersectsBox(reserve)}))throw Error('Songxiu fitted reserve occupied');
 root.updateWorldMatrix(true,true);let occupied=false;root.traverse(o=>{if(o.isMesh&&new T.Box3().setFromObject(o,true).intersectsBox(reserve))occupied=true});if(occupied)throw Error('Songxiu visible reserve occupied');
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
export function buildSongxiuHillPavilion(kit,zone){
 if(zone?.id!=='ningshou')return false;validate(kit,zone);
 const P=SONGXIU_FIT,f=new T.Group();f.name='耸秀亭';f.position.set(P.x,0,P.z);f.userData.songxiuHillPavilion=true;
 const geometries=[],materials=[],colliders=[],walkables=[];
 const own=()=>{const g=new T.BufferGeometry();geometries.push(g);return g};
 const mat=(name,color,borrow)=>{const m=new T.MeshStandardMaterial();materials.push(m);if(borrow)m.copy(kit.lib.material(borrow));m.name='r165_songxiu_'+name;m.color.setHex(color);m.roughness=.91;m.side=T.FrontSide;return m};
 const mesh=(role,g,m,x=0,y=0,z=0,kind='triangle',walk=false)=>{const o=new T.Mesh(g,m);o.name=ID+'/'+role;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;o.userData={songxiuHillPavilion:true,role,contactKind:kind,topWalk:walk,fitNotSurvey:true};f.add(o);return o};
 const box=(role,m,w,h,d,x,y,z,kind='triangle',walk=false)=>{const g=own(),p=boxPayload(w,h,d);g.setIndex(new T.BufferAttribute(p.index,1));g.setAttribute('position',new T.BufferAttribute(p.position,3));g.setAttribute('normal',new T.BufferAttribute(p.normal,3));g.setAttribute('uv',new T.BufferAttribute(p.uv,2));return mesh(role,g,m,x,y,z,kind,walk)};
 const surface=(role,m,nx,nz,point)=>{const g=own(),v=[],uv=[],ix=[],count=(nx+1)*(nz+1);for(const low of[false,true])for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const a=point(i/nx,j/nz);v.push(a[0],a[1]-(low?.12:0),a[2]);uv.push(a[0],a[2]);}const n=(i,j)=>i*(nz+1)+j,q=(a,b,c,d)=>ix.push(a,b,c,a,c,d);
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=n(i,j),b=n(i,j+1),c=n(i+1,j+1),d=n(i+1,j);q(a,b,c,d);q(a+count,d+count,c+count,b+count)}
  for(let i=0;i<nx;i++){const a=n(i,0),b=n(i+1,0),c=n(i,nz),d=n(i+1,nz);q(a,b,b+count,a+count);q(d,c,c+count,d+count)}for(let j=0;j<nz;j++){const a=n(0,j),b=n(0,j+1),c=n(nx,j),d=n(nx,j+1);q(b,a,a+count,b+count);q(c,d,d+count,c+count)}
  g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(role,g,m,0,0,0,'triangle')};
 const rock=(role,m,layers,cx=0,cz=0,phase=0,squareTop=false)=>{const g=own(),v=[],uv=[],ix=[],N=32;
  for(const [level,[y,rx,rz]]of layers.entries())for(let n=0;n<N;n++){const a=2*Math.PI*n/N,top=squareTop&&level===layers.length-1,r=top?1:1+.05*Math.sin(5*a+phase+level*.7)+.025*Math.cos(9*a-phase-level*.4),q=top?Math.max(Math.abs(Math.cos(a)),Math.abs(Math.sin(a))):1;v.push(cx+rx*r*Math.cos(a)/q,y,cz+rz*r*Math.sin(a)/q);uv.push(n/N,level/(layers.length-1));}
  const quad=(a,b,c,d)=>ix.push(a,b,c,a,c,d);for(let k=0;k<layers.length-1;k++)for(let n=0;n<N;n++){const next=(n+1)%N,a=k*N+n,b=k*N+next;quad(a,a+N,b+N,b)}
  const bottom=v.length/3;v.push(cx,layers[0][0],cz);uv.push(.5,.5);const top=v.length/3;v.push(cx,layers.at(-1)[0],cz);uv.push(.5,.5);for(let n=0;n<N;n++){const next=(n+1)%N;ix.push(bottom,n,next,top,(layers.length-1)*N+next,(layers.length-1)*N+n)}
  g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return mesh(role,g,m);
 };
 try{
  const timber=mat('weathered_timber',0x6e6654),trim=mat('muted_paint',0x4e7168),rocks=mat('taihu_rock',0x85867c),yellow=mat('roof_tile_yellow',0xbda361,'roof_tile'),green=mat('roof_tile_green',0x466950,'roof_tile'),stone=kit.lib.material('stone_slab');rocks.flatShading=true;
  rock('hill-main',rocks,[[0,2.35,3.05],[.35,2.35,3.05],[1.1,2.2,2.8],[1.75,2.1,2.4],[2.22,2.16,2.16]],0,0,0,true);
  for(const[i,[x,z,rx,rz,h]]of [[2.25,-1.8,.55,.65,.85],[2.25,1.7,.55,.7,1.05],[.3,3,.7,.45,.75]].entries())rock('hill-outcrop-'+i,rocks,[[0,rx,rz],[h*.25,rx,rz],[h*.8,rx*.75,rz*.75],[h,rx*.35,rz*.35]],x,z,i+.2);
  box('hilltop-platform',stone,4.2,.18,4.2,0,2.31,0,'box',true);
  box('east-approach-landing',stone,2.7,.18,1.7,-2.85,2.31,0,'box',true);
  for(let i=0;i<16;i++){const h=.15*(i+1),z=-5.92+(i+.5)*.32;box('east-stone-step-'+i,stone,1.4,h,.32,-3.5,h/2,z,'box',true);}
  for(const x of[-1.8,1.8])for(const z of[-1.8,1.8]){box('post-base-'+x+'-'+z,stone,.34,.23,.34,x,2.515,z);box('post-'+x+'-'+z,timber,.22,4.0,.22,x,4.63,z);}
  for(const z of[-1.8,1.8]){box('beam-ns-'+z,trim,3.86,.24,.26,0,6.63,z);box('hanging-frieze-ns-'+z,trim,3.52,.13,.12,0,6.48,z);}
  for(const x of[-1.8,1.8]){box('beam-ew-'+x,trim,.26,.24,3.86,x,6.63,0);box('hanging-frieze-ew-'+x,trim,.12,.13,3.52,x,6.48,0);}
  // Three bench-railed sides retain an open eastern entrance from the fitted stone flight.
  for(const side of['south','north','west']){const axis=side==='west',q=side==='south'?-1.8:1.8;box('bench-seat-'+side,timber,axis?.36:3.4,.12,axis?3.4:.36,axis?q:0,2.85,axis?0:q);box('bench-back-'+side,timber,axis?.12:3.4,.12,axis?3.4:.12,axis?q+.12:0,3.45,axis?0:q+(q<0?-.12:.12));for(const t of[-1.55,0,1.55])box('bench-support-'+side+'-'+t,timber,axis?.12:.10,1.0,axis?.10:.12,axis?q:t,2.9,axis?t:q);}
  for(const i of[0,4,8,12,15]){const h=.15*(i+1),z=-5.92+(i+.5)*.32;box('stair-outer-post-'+i,stone,.10,.68,.10,-4.3,h+.34,z);}
  const rail=box('stair-outer-handrail',timber,.10,.10,Math.hypot(4.9,2.296875),-4.3,1.9,-3.36);rail.rotation.x=-Math.atan2(2.4,5.12);
  const R=P.roofHalf,Y=r=>P.eaveY+P.roofRise*Math.pow(Math.max(0,1-r),1.25);
  surface('yellow-four-corner-roof',yellow,24,24,(u,v)=>{const x=(2*u-1)*R,z=(2*v-1)*R;return[x,Y(Math.max(Math.abs(x),Math.abs(z))/R),z]});
  for(let face=0;face<4;face++)surface('green-roof-field-'+face,green,12,12,(u,v)=>{const r=.93-.86*v,x=(2*u-1)*.93*r*R,z=-r*R,a=face*Math.PI/2;return[x*Math.cos(a)+z*Math.sin(a),Y(r)+.025,-x*Math.sin(a)+z*Math.cos(a)]});
  box('finial-yellow-base',yellow,.38,.2,.38,0,Y(0)+.05,0);box('finial-green-head',green,.25,.3,.25,0,Y(0)+.3,0);
  f.updateWorldMatrix(true,true);f.traverse(o=>{if(!o.isMesh||!o.userData.contactKind)return;const b=new T.Box3().setFromObject(o,true);if(o.userData.contactKind==='triangle'){const g=own();try{g.copy(o.geometry);g.applyMatrix4(o.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+o.name);b.copy(shape.box);b.triangleSupport=shape}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}}b.songxiuHillPavilion=true;b.songxiuMesh=o.name;colliders.push(b);if(o.userData.topWalk){const top=b.clone();top.min.y=top.max.y;walkables.push({type:'box',box:top,rescue:false,songxiuHillPavilion:true,songxiuMesh:o.name})}});
  if(!new T.Box3(new T.Vector3(-258,-.00001,433.5),new T.Vector3(-250.5,9,445.5)).containsBox(new T.Box3().setFromObject(f,true)))throw Error('Songxiu escaped fitted reserve');
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const meta={id:ID,sourceObjectId:OBJECT,name:'耸秀亭',scope:'FITTED_ROCK_HILL_SQUARE_PAVILION_AND_EAST_SIDE_ACCESS',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,source:'https://www.dpm.org.cn/explore/building/236457.html',photo:'https://img.dpm.org.cn/Uploads/Picture/dc/1532[1024].jpg',photoSHA256:'0481a5b3357b182daec6851d4318f05cc44c322962088a70e72a6e8b7894a6a8',roof:'FOUR_CORNER_POINTED_GREEN_WITH_YELLOW_EDGES',fit:{...P,locationAndDimensions:'GAME_FIT_NOT_SURVEY',hill:'CLOSED_FACETED_APPROXIMATION_NOT_FULL_HISTORIC_ROCK_HILL',stairs:'EAST_SIDE_SAFETY_FIT_NOT_SURVEYED_ORIGINAL_ROUTE',carvingAndPaint:'SIMPLIFIED_NOT_PHOTO_RECONSTRUCTION'},notBuilt:['Original cave and valley system and full rock hill/vegetation','Imperial plaque lettering, intricate hanging frieze, ridge animals and original decoration','Unseen historic approaches and current visitor access policy'],newMapItems:0,newRooms:0,newTeleportTargets:0};
 f.userData.structure=meta;kit.root.add(f);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);return{frame:f,meta,colliders,walkables,materials};
}
